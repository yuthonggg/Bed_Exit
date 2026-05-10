import logging

import camera


logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")


if __name__ == "__main__":
    image_paths = camera.capture()
    if image_paths:
        print("Camera capture OK:")
        for image_path in image_paths:
            print(image_path)
    else:
        print("Camera capture failed. Check USB_CAMERA_INDICES in .env or config.py.")
