import logging
from datetime import datetime

import requests

import config


def send_sensor_reading(
    x: float,
    y: float,
    risk: float | None = None,
    z_score: float | None = None,
    status: str = "",
) -> bool:
    payload = {
        "bed_id": config.BED_ID,
        "x": x,
        "y": y,
        "risk": risk,
        "z_score": z_score,
        "status": status,
        "timestamp": datetime.now().isoformat(),
    }

    try:
        response = requests.post(config.SENSOR_API_URL, json=payload, timeout=2)
        if response.status_code in (200, 201):
            return True

        logging.warning(f"Sensor reading upload failed with status {response.status_code}: {response.text}")
    except requests.exceptions.RequestException as e:
        logging.warning(f"Could not upload sensor reading: {e}")

    return False
