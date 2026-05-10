import logging
import time

import serial

import config
import sensor_client
from bed_analysis import RiskAnalyser


logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")


def parse_balance_line(line: str) -> tuple[float, float] | None:
    parts = line.split(",")
    if len(parts) != 2:
        return None

    try:
        return float(parts[0]), float(parts[1])
    except ValueError:
        return None


if __name__ == "__main__":
    analyser = RiskAnalyser(
        history_size=config.RISK_HISTORY_SIZE,
        position_weight=config.RISK_POSITION_WEIGHT,
        movement_weight=config.RISK_MOVEMENT_WEIGHT,
        warning_zscore=config.RISK_WARNING_ZSCORE,
        critical_zscore=config.RISK_CRITICAL_ZSCORE,
    )

    logging.info(f"Opening serial port {config.SERIAL_PORT} at {config.BAUD_RATE} baud")
    logging.info("Press Ctrl+C to stop")

    try:
        with serial.Serial(config.SERIAL_PORT, config.BAUD_RATE, timeout=1) as ser:
            time.sleep(2)
            ser.reset_input_buffer()
            logging.info("Serial buffer cleared. Waiting for fresh Arduino lines...")
            while True:
                raw_data = ser.readline()
                if not raw_data:
                    continue

                line = raw_data.decode(errors="ignore").strip()
                if not line:
                    continue

                print(f"ARDUINO: {line}")

                if line == "1":
                    print("TRIGGER: Arduino sent bed-exit trigger")
                    continue

                if line == "0":
                    print("HEARTBEAT: Arduino alive")
                    continue

                balance = parse_balance_line(line)
                if balance is None:
                    print("UNRECOGNIZED: expected '0', '1', or 'x,y'")
                    continue

                x, y = balance
                risk = analyser.update(x, y)
                z_score = analyser.get_zscore()
                status = analyser.get_status()

                print(
                    f"PARSED: x={x:.2f}, y={y:.2f}, "
                    f"risk={risk:.2f}, z_score={z_score:.2f}, status={status}"
                )
                synced = sensor_client.send_sensor_reading(x, y, risk, z_score, status)
                if synced:
                    print("SYNC OK: sent x,y to backend")
                else:
                    print("SYNC FAILED: backend did not receive x,y")
    except KeyboardInterrupt:
        logging.info("Serial monitor stopped")
    except serial.SerialException as e:
        logging.error(f"Could not read serial port {config.SERIAL_PORT}: {e}")
