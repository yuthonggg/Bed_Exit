import os
from dotenv import load_dotenv

load_dotenv()

SERIAL_PORT = "/dev/ttyUSB0"
BAUD_RATE = 9600
CAMERA_CAPTURE_COUNT = 3
CAMERA_SAVE_DIR = "/tmp/captures"
XIAOMI_API_KEY = os.getenv("XIAOMI_API_KEY")  # Loaded from .env
XIAOMI_BASE_URL = "https://token-plan-sgp.xiaomimimo.com/v1" # Xiaomi Token Plan API Base URL
SPEAKER_GPIO_PIN = 17
SPEAKER_DURATION_SECONDS = 3
BACKEND_API_URL = "http://localhost:5000/api/alert"
COOLDOWN_SECONDS = 5
CONFIDENCE_THRESHOLD = 0.6
BED_ID = "BED_01"
