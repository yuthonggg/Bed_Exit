import logging
import threading

# Setup logging first before importing other modules
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

import alert
import camera
import config
import inference
import serial_listener
import speaker


def on_trigger(sensor_data: dict | None = None):
    """
    Pipeline executed when Arduino sends a '1' trigger or balance risk is critical.
    Runs the pipeline in a separate thread so it does not block the serial loop.
    """

    def _pipeline():
        try:
            if sensor_data:
                logging.info(f"Trigger received from sensor analysis: {sensor_data}")
            else:
                logging.info("Trigger received from Arduino")

            image_paths = camera.capture()
            if not image_paths:
                logging.warning("No images captured. Aborting pipeline.")
                return

            first_image = image_paths[0]
            result = inference.run_inference(first_image)

            classification = result.get("classification", "inconclusive")
            confidence = result.get("confidence", 0.0)
            logging.info(f"Inference result: classification={classification}, confidence={confidence}")

            alert.send_alert(classification, confidence, first_image, sensor_data=sensor_data)
            logging.info("Inference result and evidence image uploaded to backend")

            if classification == "unsafe_exit" and confidence >= config.CONFIDENCE_THRESHOLD:
                speaker.trigger()
                logging.info("UNSAFE EXIT DETECTED - emergency speaker triggered")
            else:
                logging.info("Exit classified as safe, repositioning, or inconclusive - logged without emergency speaker")

        except Exception as e:
            logging.error(f"Error in pipeline execution: {e}")

    threading.Thread(target=_pipeline, daemon=True).start()


if __name__ == "__main__":
    logging.info("Starting Bed Exit System - RPi Pipeline")
    serial_listener.start_listening(on_trigger)
