import cv2
from mjpeg_streamer import MjpegServer, Stream

server = MjpegServer("0.0.0.0", 8080)

cap = cv2.VideoCapture(0)
stream = Stream("my_camera", size=(1366, 768), quality=50, fps=60)
server.add_stream(stream)

server.start()

while True:
    ret, frame = cap.read()
    if not ret:
        continue

    stream.set_frame(frame)

server.stop()
cap.release()
