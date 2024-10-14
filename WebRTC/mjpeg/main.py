import cv2
from mjpeg_streamer import MjpegServer, Stream
import threading

import os

STREAM_URL = os.getenv("STREAM_URL", "")

print(f"""STREAM_URL: {STREAM_URL}""")

server = MjpegServer("0.0.0.0", 8080)

cap = cv2.VideoCapture(STREAM_URL)

stream = Stream("my_camera", size=(1366, 768), quality=50, fps=60)
server.add_stream(stream)
server.start()

def update_stream():
    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        stream.set_frame(frame)

threading.Thread(target=update_stream).start()