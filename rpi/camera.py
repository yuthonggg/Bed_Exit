import os
import time
import logging
from datetime import datetime

try:
    from picamera2 import Picamera2
    HAS_PICAMERA = True
except ImportError:
    HAS_PICAMERA = False

try:
    import cv2
    HAS_CV2 = True
except ImportError:
    HAS_CV2 = False

import config

# Module-level initialisation
picam2 = None
if HAS_PICAMERA:
    try:
        picam2 = Picamera2()
        # Create a preview configuration to set the camera size
        picam2.configure(picam2.create_preview_configuration(main={"size": (640, 480)}))
        picam2.start()
        time.sleep(1)  # Warm-up period
        logging.info("Camera initialized successfully.")
    except Exception as e:
        logging.warning(f"Failed to initialize picamera2: {e}")
        HAS_PICAMERA = False
elif HAS_CV2:
    logging.info("picamera2 not found, but OpenCV is available for USB camera.")
else:
    logging.warning("No camera libraries found. Running in simulation mode.")

def capture() -> list[str]:
    """
    Captures exactly CAMERA_CAPTURE_COUNT frames with a 0.3 second gap between each.
    Saves them as JPEG to CAMERA_SAVE_DIR.
    Returns a list of file paths. Returns empty list on failure.
    """
    saved_files = []
    try:
        if not os.path.exists(config.CAMERA_SAVE_DIR):
            os.makedirs(config.CAMERA_SAVE_DIR)
            
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        for i in range(config.CAMERA_CAPTURE_COUNT):
            file_path = os.path.join(config.CAMERA_SAVE_DIR, f"capture_{timestamp}_{i}.jpg")
            
            if HAS_PICAMERA and picam2 is not None:
                picam2.capture_file(file_path)
            elif HAS_CV2:
                # Use OpenCV to capture from external USB camera (index 1)
                cap = cv2.VideoCapture(1)
                
                # If index 1 fails, sometimes Windows puts it at index 2
                if not cap.isOpened():
                    cap = cv2.VideoCapture(2)

                if cap.isOpened():
                    # Give the camera 2 seconds to adjust auto-exposure
                    time.sleep(2)
                    # Discard first 5 frames to clear the buffer
                    for _ in range(5):
                        cap.read()
                    
                    ret, frame = cap.read()
                    if ret:
                        cv2.imwrite(file_path, frame)
                    cap.release()
                else:
                    logging.warning("Could not open USB camera via OpenCV")
            else:
                # Simulation mode: create a dummy placeholder 1x1 JPEG image
                with open(file_path, "wb") as f:
                    f.write(b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xdb\x00\x43\x00\xff\xd9")
            
            saved_files.append(file_path)
            if i < config.CAMERA_CAPTURE_COUNT - 1:
                time.sleep(0.3)
                
    except Exception as e:
        logging.error(f"Error during camera capture: {e}")
        return []
        
    return saved_files
