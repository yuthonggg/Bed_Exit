import requests
import logging
from datetime import datetime
import config

def send_alert(classification: str, confidence: float, image_path: str) -> bool:
    """
    Builds the alert payload and POSTs it to the backend API.
    
    Returns:
        bool: True if alert was sent successfully, False otherwise.
    """
    try:
        payload = {
            "bed_id": config.BED_ID,
            "classification": classification,
            "confidence": confidence,
            "image_path": image_path,
            "timestamp": datetime.now().isoformat()
        }
        
        response = requests.post(config.BACKEND_API_URL, json=payload, timeout=5)
        
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
