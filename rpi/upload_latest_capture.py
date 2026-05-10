import glob
import os
import sys

import alert
import config


def latest_capture() -> str | None:
    pattern = os.path.join(config.CAMERA_SAVE_DIR, "*.jpg")
    captures = glob.glob(pattern)
    if not captures:
        return None
    return max(captures, key=os.path.getmtime)


if __name__ == "__main__":
    classification = sys.argv[1] if len(sys.argv) > 1 else "unsafe_exit"
    confidence = float(sys.argv[2]) if len(sys.argv) > 2 else 0.99
    image_path = latest_capture()

    if not image_path:
        print(f"No captures found in {config.CAMERA_SAVE_DIR}")
        print("Run this first: python test_camera.py")
        sys.exit(1)

    ok = alert.send_alert(
        classification=classification,
        confidence=confidence,
        image_path=image_path,
        sensor_data={"trigger_type": "manual_frontend_test"},
    )

    if ok:
        print(f"Uploaded {image_path}")
        print(f"Classification: {classification}, confidence: {confidence}")
    else:
        print("Upload failed. Make sure the backend is running on http://localhost:5000")
        sys.exit(1)
