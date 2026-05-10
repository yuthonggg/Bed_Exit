import requests
import logging
import json
import os
from datetime import datetime
import config

def send_alert(
    classification: str,
    confidence: float,
    image_path: str,
    sensor_data: dict | None = None,
) -> bool:
    """
    Builds the alert payload and POSTs it to the backend API.
    
    Returns:
        bool: True if alert was sent successfully, False otherwise.
    """
    try:
        data = {
            "bed_id": config.BED_ID,
            "classification": classification,
            "confidence": confidence,
            "timestamp": datetime.now().isoformat()
        }
        if sensor_data:
            data["sensor_data"] = json.dumps(sensor_data)

        with open(image_path, "rb") as image_file:
            files = {
                "image": (os.path.basename(image_path), image_file, "image/jpeg")
            }
            response = requests.post(config.BACKEND_API_URL, data=data, files=files, timeout=10)
        
        if response.status_code in (200, 201):
            return True
        else:
            logging.error(f"Alert failed with status code {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        logging.error(f"Connection error while sending alert: {e}")
        return False
    except Exception as e:
        logging.error(f"Unexpected error while sending alert: {e}")
        return False
