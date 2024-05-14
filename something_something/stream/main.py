import cv2
from mjpeg_streamer import MjpegServer, Stream

cap = cv2.VideoCapture(0)

stream = Stream("my_camera", size=(640, 480), quality=50, fps=30)

server = MjpegServer("localhost", 8080)
server.add_stream(stream)
server.start()

while True:
    ret, frame = cap.read()
    if not ret:
        break

    stream.set_frame(frame)

server.stop()
cap.release()
