import serial
import time
import logging
import config
import sensor_client
from bed_analysis import DataLogger, RiskAnalyser


def _build_analyser() -> RiskAnalyser:
    return RiskAnalyser(
        history_size=config.RISK_HISTORY_SIZE,
        position_weight=config.RISK_POSITION_WEIGHT,
        movement_weight=config.RISK_MOVEMENT_WEIGHT,
        warning_zscore=config.RISK_WARNING_ZSCORE,
        critical_zscore=config.RISK_CRITICAL_ZSCORE,
    )


def _parse_balance_line(line: str) -> tuple[float, float] | None:
    parts = line.split(",")
    if len(parts) != 2:
        return None

    try:
        return float(parts[0]), float(parts[1])
    except ValueError:
        return None


def _trigger_with_cooldown(
    on_trigger: callable,
    last_trigger_time: float,
    sensor_data: dict | None = None,
) -> float:
    current_time = time.time()
    if current_time - last_trigger_time < config.COOLDOWN_SECONDS:
        logging.info("Trigger ignored due to cooldown.")
        return last_trigger_time

    try:
        on_trigger(sensor_data)
    except TypeError:
        on_trigger()
    except Exception as e:
        logging.error(f"Error in on_trigger callback: {e}")

    return current_time

def start_listening(on_trigger: callable) -> None:
    """
    Listens for legacy triggers ('1'), heartbeats ('0'), and balance readings
    in the form 'x,y'. Critical balance risk triggers the capture pipeline.
    """
    last_trigger_time = 0.0
    start_time = time.time()
    analyser = _build_analyser()
    logger = DataLogger(config.SENSOR_LOG_FILE) if config.LOG_SENSOR_DATA else None
    
    while True:
        try:
            with serial.Serial(config.SERIAL_PORT, config.BAUD_RATE, timeout=1) as ser:
                logging.info(f"Connected to serial port {config.SERIAL_PORT}")
                
                while True:
                    raw_data = ser.readline()
                    if not raw_data:
                        continue

                    line = raw_data.decode(errors="ignore").strip()
                    if not line:
                        continue

                    if line == "1":
                        last_trigger_time = _trigger_with_cooldown(on_trigger, last_trigger_time)
                        continue

                    if line == "0":
                        logging.info("Arduino alive")
                        continue

                    balance = _parse_balance_line(line)
                    if balance is None:
                        logging.warning(f"Ignoring unrecognized serial data: {line}")
                        continue

                    x, y = balance
                    risk = analyser.update(x, y)
                    z_score = analyser.get_zscore()
                    status = analyser.get_status()
                    elapsed_time = time.time() - start_time

                    if logger:
                        logger.log(elapsed_time, x, y, risk, z_score, status)

                    sensor_client.send_sensor_reading(x, y, risk, z_score, status)

                    logging.info(
                        f"Balance x={x:.2f}, y={y:.2f}, risk={risk:.2f}, "
                        f"z_score={z_score:.2f}, status={status}"
                    )

                    if status == "Critical":
                        sensor_data = {
                            "trigger_type": "balance_risk",
                            "x_balance": x,
                            "y_balance": y,
                            "risk": risk,
                            "z_score": z_score,
                            "risk_status": status,
                        }
                        last_trigger_time = _trigger_with_cooldown(
                            on_trigger,
                            last_trigger_time,
                            sensor_data,
                        )
                            
        except serial.SerialException as e:
            logging.error(f"Serial connection error: {e}. Retrying in 3 seconds...")
            time.sleep(3)
        except KeyboardInterrupt:
            logging.info("KeyboardInterrupt received. Stopping listener.")
            if logger:
                logger.close()
            break
        except Exception as e:
            logging.error(f"Unexpected error in serial listener: {e}")
            time.sleep(3)
