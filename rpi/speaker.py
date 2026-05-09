import threading
import time
import logging

try:
    from gpiozero import DigitalOutputDevice
    HAS_GPIO = True
except ImportError:
    HAS_GPIO = False

import config

speaker_device = None
if HAS_GPIO:
    try:
        speaker_device = DigitalOutputDevice(config.SPEAKER_GPIO_PIN)
    except Exception as e:
        logging.warning(f"Failed to initialize speaker GPIO: {e}")
        HAS_GPIO = False

def _trigger_task():
    try:
        if HAS_GPIO and speaker_device:
            speaker_device.on()
            time.sleep(config.SPEAKER_DURATION_SECONDS)
            speaker_device.off()
        else:
            logging.info("Speaker triggered (simulated)")
            time.sleep(config.SPEAKER_DURATION_SECONDS)
    except Exception as e:
        logging.warning(f"Error during speaker trigger: {e}")

def trigger() -> None:
    """
    Non-blocking trigger for the speaker.
    Sets the GPIO pin HIGH for SPEAKER_DURATION_SECONDS, then LOW.
    """
    t = threading.Thread(target=_trigger_task, daemon=True)
    t.start()
