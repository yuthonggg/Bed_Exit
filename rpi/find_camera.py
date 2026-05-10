import cv2


if __name__ == "__main__":
    backend = cv2.CAP_DSHOW
    for index in range(6):
        cap = cv2.VideoCapture(index, backend)
        opened = cap.isOpened()
        print(f"Camera index {index}: {'OPEN' if opened else 'not available'}")

        if opened:
            ret, frame = cap.read()
            if ret:
                print(f"  frame size: {frame.shape[1]}x{frame.shape[0]}")
            else:
                print("  opened, but could not read a frame")

        cap.release()
