import logging
import threading

# Setup logging first before importing other modules
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)

import config
import serial_listener
import camera
import inference
import speaker
import alert

def on_trigger():
    """
    Pipeline executed when Arduino sends a '1' trigger.
    Runs the pipeline in a separate thread so it doesn't block the serial loop.
    """
    def _pipeline():
        try:
            # 1. Log "Trigger received from Arduino"
            logging.info("Trigger received from Arduino")
            
            # 2. Call camera.capture()
            image_paths = camera.capture()
            
            # 3. If no images captured -> log warning and return early
            if not image_paths:
                logging.warning("No images captured. Aborting pipeline.")
                return
                
            # 4. Run inference on the first captured image
            first_image = image_paths[0]
            result = inference.run_inference(first_image)
            
            classification = result.get("classification", "inconclusive")
            confidence = result.get("confidence", 0.0)
            
            # 5. Log classification and confidence
            logging.info(f"Inference result: classification={classification}, confidence={confidence}")
            
            # 6. Check unsafe conditions
            if classification == "unsafe_exit" and confidence >= config.CONFIDENCE_THRESHOLD:
                # Call speaker.trigger() (non-blocking)
                speaker.trigger()
                # Call alert.send_alert()
                alert.send_alert(classification, confidence, first_image)
                logging.info("UNSAFE EXIT DETECTED — alert sent")
            else:
                # 7. Safe or inconclusive
                logging.info("Exit classified as safe or inconclusive — no alert")
                
        except Exception as e:
            logging.error(f"Error in pipeline execution: {e}")

    # Offload heavy work so the loop stays responsive
    threading.Thread(target=_pipeline, daemon=True).start()

if __name__ == "__main__":
    logging.info("Starting Bed Exit System - RPi Pipeline")
    serial_listener.start_listening(on_trigger)
