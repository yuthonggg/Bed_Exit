import serial
import time
import logging
import config

def start_listening(on_trigger: callable) -> None:
    """
    Listens to the serial port for incoming triggers ('1') and heartbeats ('0').
    Calls on_trigger() when '1' is received, implementing a cooldown guard.
    """
    last_trigger_time = 0.0
    
    while True:
        try:
            with serial.Serial(config.SERIAL_PORT, config.BAUD_RATE, timeout=1) as ser:
                logging.info(f"Connected to serial port {config.SERIAL_PORT}")
                
                while True:
                    if ser.in_waiting > 0:
                        byte_data = ser.read()
                        
                        if byte_data == b'1':
                            current_time = time.time()
                            if current_time - last_trigger_time >= config.COOLDOWN_SECONDS:
                                last_trigger_time = current_time
                                try:
                                    on_trigger()
                                except Exception as e:
                                    logging.error(f"Error in on_trigger callback: {e}")
                            else:
                                logging.info("Trigger ignored due to cooldown.")
                                
                        elif byte_data == b'0':
                            logging.info("Arduino alive")
                            
        except serial.SerialException as e:
            logging.error(f"Serial connection error: {e}. Retrying in 3 seconds...")
            time.sleep(3)
        except KeyboardInterrupt:
            logging.info("KeyboardInterrupt received. Stopping listener.")
            break
        except Exception as e:
            logging.error(f"Unexpected error in serial listener: {e}")
            time.sleep(3)
