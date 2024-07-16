import asyncio
import cv2
from mjpeg_streamer import MjpegServer, Stream
from onvif import ONVIFCamera
import threading
from aiohttp import web
import base64

import os

STREAM_URL = os.getenv("STREAM_URL", "")
START_LIVE = bool(os.getenv("START_LIVE", ""))

HOST = os.getenv("HOST", "")
PORT = int(os.getenv("PORT", "80") or "80")
STREAM_USER = os.getenv("STREAM_USER", "")
STREAM_PASSWORD = os.getenv("STREAM_PASSWORD", "")
ONVIF_USER = os.getenv("ONVIF_USER", "")
ONVIF_PASSWORD = os.getenv("ONVIF_PASSWORD", "")
WSDL = os.getenv("WSDL", "/usr/local/lib/python3.11/site-packages/wsdl/")
RTSP_PATH = os.getenv("RTSP_PATH", "/cam/realmonitor?channel=1&subtype=0")

print(f"""
STREAM_URL: {STREAM_URL}
START_LIVE: {START_LIVE}
HOST: {HOST}
PORT: {PORT}
STREAM_USER: {STREAM_USER}
STREAM_PASSWORD: {STREAM_PASSWORD}
ONVIF_USER: {ONVIF_USER}
ONVIF_PASSWORD: {ONVIF_PASSWORD}
WSDL: {WSDL}
RTSP_PATH: {RTSP_PATH}
""")

server = MjpegServer("0.0.0.0", 8080)

if STREAM_URL:
    cap = cv2.VideoCapture(STREAM_URL)
else:
    cap = cv2.VideoCapture(f'rtsp://{STREAM_USER}:{STREAM_PASSWORD}@{HOST}:{PORT}{RTSP_PATH}')

stream = Stream("my_camera", size=(1366, 768), quality=50, fps=60)
server.add_stream(stream)

is_live = START_LIVE

class TurnHandler:
    async def __call__(self, request: web.Request) -> web.StreamResponse:
        x = request.rel_url.query.get("x", 0)
        y = request.rel_url.query.get("y", 0)
        timeout = request.rel_url.query.get("timeout", 0)
        wait = request.rel_url.query.get("wait", 0)

        mycam = ONVIFCamera(HOST, PORT, ONVIF_USER, ONVIF_PASSWORD, WSDL, adjust_time=True)
        ptz_service = mycam.create_ptz_service()
        media_service = mycam.create_media_service()
        media_profile = media_service.GetProfiles()[0]
        ptz_service.ContinuousMove({
            'ProfileToken': media_profile.token,
            'Velocity': {'PanTilt': {'x': float(x), 'y': float(y)}},
            'Timeout': int(timeout)
        })
        await asyncio.sleep(int(wait))
        ptz_service.Stop({'ProfileToken': media_profile.token})

        headers = {"Content-Type": "application/json"}
        response = web.StreamResponse(status=200, reason="OK", headers=headers)
        await response.prepare(request)
        await response.write(b"{}")

        return response

class OnHandler:
    async def __call__(self, request: web.Request) -> web.StreamResponse:
        global is_live
        is_live = True

        headers = {"Content-Type": "application/json"}
        response = web.StreamResponse(status=200, reason="OK", headers=headers)
        await response.prepare(request)
        await response.write(b"{}")

        return response

class OffHandler:
    async def __call__(self, request: web.Request) -> web.StreamResponse:
        global is_live
        is_live = False

        headers = {"Content-Type": "application/json"}
        response = web.StreamResponse(status=200, reason="OK", headers=headers)
        await response.prepare(request)
        await response.write(b"{}")

        return response

class ResetHandler:
    async def __call__(self, request: web.Request) -> web.StreamResponse:
        global is_live, cap
        is_live = False

        await asyncio.sleep(5)

        cap = cv2.VideoCapture(f'rtsp://{STREAM_USER}:{STREAM_PASSWORD}@{HOST}:{PORT}{RTSP_PATH}')

        await asyncio.sleep(5)

        headers = {"Content-Type": "application/json"}
        response = web.StreamResponse(status=200, reason="OK", headers=headers)
        await response.prepare(request)
        await response.write(b"{}")

        is_live = True

        return response

def chunks(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

class WebSocketHandler:
    async def __call__(self, request: web.Request) -> web.WebSocketResponse:
        ws = web.WebSocketResponse()
        await ws.prepare(request)

        while True:
            try:
                msg = await ws.receive()

                if msg.type == web.WSMsgType.TEXT:
                    width, height, buffer_size = msg.data.strip().split("|")
                    resized_image = cv2.resize(stream._frame, (int(width), int(height)))
                    _, buffer = cv2.imencode('.jpg', resized_image, [cv2.IMWRITE_JPEG_QUALITY, 80])
                    message = base64.b64encode(buffer).decode()

                    for chunk in chunks(message, int(buffer_size)):
                        await ws.send_str(chunk)
                    await ws.send_str("DONE")

                    if msg.data == "close":
                        await ws.close()
                elif msg.type == web.WSMsgType.ERROR:
                    print("ws connection closed with exception %s" % ws.exception())
                elif msg.type == web.WSMsgType.CLOSE:
                    break
            except Exception as e:
                print(f"Error {e.__class__} {e}")
                break

        return ws

class WebSocketUIHandler:
    async def __call__(self, request: web.Request) -> web.StreamResponse:
        headers = {"Content-Type": "text/html"}
        response = web.StreamResponse(status=200, reason="OK", headers=headers)
        await response.prepare(request)
        with open("index.html", "r") as f:
            await response.write(f.read().encode())
        return response

server._app.router.add_route("GET", "/turn", TurnHandler())
server._app.router.add_route("GET", "/on", OnHandler())
server._app.router.add_route("GET", "/off", OffHandler())
server._app.router.add_route("GET", "/reset", ResetHandler())
server._app.router.add_route("GET", "/ws", WebSocketHandler())
server._app.router.add_route("GET", "/ws-ui", WebSocketUIHandler())
server.start()

def update_stream():
    while True:
        if not is_live:
            continue

        ret, frame = cap.read()
        if not ret:
            continue

        stream.set_frame(frame)

threading.Thread(target=update_stream).start()
