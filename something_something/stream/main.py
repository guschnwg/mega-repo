import asyncio
import cv2
from mjpeg_streamer import MjpegServer, Stream
from onvif import ONVIFCamera
import threading
from aiohttp import web

import os

HOST = os.getenv("HOST", "")
PORT = int(os.getenv("PORT", "80") or "80")
STREAM_USER = os.getenv("STREAM_USER", "")
STREAM_PASSWORD = os.getenv("STREAM_PASSWORD", "")
ONVIF_USER = os.getenv("ONVIF_USER", "")
ONVIF_PASSWORD = os.getenv("ONVIF_PASSWORD", "")
WSDL = os.getenv("WSDL", "/usr/local/lib/python3.11/site-packages/wsdl/")
RTSP_PATH = os.getenv("RTSP_PATH", "/cam/realmonitor?channel=1&subtype=0")

mycam = ONVIFCamera(HOST, PORT, ONVIF_USER, ONVIF_PASSWORD, WSDL)
ptz_service = mycam.create_ptz_service()
media_service = mycam.create_media_service()
media_profile = media_service.GetProfiles()[0]

server = MjpegServer("0.0.0.0", 8080)

cap = cv2.VideoCapture(f'rtsp://{STREAM_USER}:{STREAM_PASSWORD}@{HOST}:{PORT}{RTSP_PATH}')
stream = Stream("my_camera", size=(1366, 768), quality=50, fps=60)
server.add_stream(stream)

is_live = False

class TurnHandler:
    async def __call__(self, request: web.Request) -> web.StreamResponse:
        x = request.rel_url.query.get("x", 0)
        y = request.rel_url.query.get("y", 0)
        timeout = request.rel_url.query.get("timeout", 0)
        wait = request.rel_url.query.get("wait", 0)

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

server._app.router.add_route("GET", "/turn", TurnHandler())
server._app.router.add_route("GET", "/on", OnHandler())
server._app.router.add_route("GET", "/off", OffHandler())
server._app.router.add_route("GET", "/reset", ResetHandler())
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
