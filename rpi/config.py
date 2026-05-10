import os

try:
    from dotenv import load_dotenv
except ImportError:
    def load_dotenv(*args, **kwargs):
        return False

BASE_DIR = os.path.dirname(__file__)
PROJECT_DIR = os.path.dirname(BASE_DIR)

load_dotenv(os.path.join(PROJECT_DIR, ".env"))
load_dotenv(os.path.join(BASE_DIR, ".env"), override=True)

def _env_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, default))
    except (TypeError, ValueError):
        return default


def _env_float(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, default))
    except (TypeError, ValueError):
        return default


def _env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in ("1", "true", "yes", "on")


def _env_int_list(name: str, default: list[int]) -> list[int]:
    value = os.getenv(name)
    if not value:
        return default

    try:
        return [int(item.strip()) for item in value.split(",") if item.strip()]
    except ValueError:
        return default


SERIAL_PORT = os.getenv("SERIAL_PORT", "COM3")
BAUD_RATE = _env_int("BAUD_RATE", 9600)
CAMERA_CAPTURE_COUNT = 3
CAMERA_SAVE_DIR = os.getenv("CAMERA_SAVE_DIR", os.path.join(BASE_DIR, "captures"))
USB_CAMERA_INDICES = _env_int_list("USB_CAMERA_INDICES", [0, 1, 2])
XIAOMI_API_KEY = os.getenv("XIAOMI_API_KEY")  # Loaded from .env
XIAOMI_BASE_URL = "https://token-plan-sgp.xiaomimimo.com/v1" # Xiaomi Token Plan API Base URL
SPEAKER_GPIO_PIN = _env_int("SPEAKER_GPIO_PIN", 17)
SPEAKER_DURATION_SECONDS = _env_float("SPEAKER_DURATION_SECONDS", 3)
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:5000/api/alert-with-image")
SENSOR_API_URL = os.getenv("SENSOR_API_URL", "http://localhost:5000/api/sensor-readings")
COOLDOWN_SECONDS = _env_float("COOLDOWN_SECONDS", 5)
CONFIDENCE_THRESHOLD = _env_float("CONFIDENCE_THRESHOLD", 0.6)
BED_ID = os.getenv("BED_ID", "BED_01")

RISK_HISTORY_SIZE = _env_int("RISK_HISTORY_SIZE", 100)
RISK_POSITION_WEIGHT = _env_float("RISK_POSITION_WEIGHT", 0.6)
RISK_MOVEMENT_WEIGHT = _env_float("RISK_MOVEMENT_WEIGHT", 0.4)
RISK_WARNING_ZSCORE = _env_float("RISK_WARNING_ZSCORE", 1.0)
RISK_CRITICAL_ZSCORE = _env_float("RISK_CRITICAL_ZSCORE", 2.0)
LOG_SENSOR_DATA = _env_bool("LOG_SENSOR_DATA", True)
SENSOR_LOG_FILE = os.getenv("SENSOR_LOG_FILE", "bed_data.csv")
