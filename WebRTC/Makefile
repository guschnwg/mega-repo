run:
	deno run --allow-net --allow-read server.ts

swift:
	swift client.swift

client:
	cd JSClient && \
	npm install && \
	PASSWORD=123456 \
	WS_HOST=https://webrtc.giovanna.cc \
	STREAM_URL="rtsp://admin:123456@192.168.0.108:80/cam/realmonitor?channel=1&subtype=0" \
	node client

# https://webrtc.giovanna.cc
docker-cloudflare:
	docker compose down; \
	TUNNEL_TOKEN=eyJhIjoiNzRhZGFmOTVjOTNlNTM4M2QxMzljODM4M2E5ZjY3YjYiLCJ0IjoiZWM1MmRhNzMtYjM3Ni00OTEwLTkwNzMtMmVlZmRmZjc4YmEzIiwicyI6Ik5UTmlPVGMyTVRndE1qWXlaUzAwTURKaUxXRTROek10TlRZM05UUXpaR1kyTlRWaCJ9 \
	WS_HOST=https://webrtc.giovanna.cc \
	CLIENT_PASSWORD=123456 \
	STREAM_URL="rtsp://admin:Will2020Mu@192.168.0.108:80/cam/realmonitor?channel=1&subtype=0" \
	docker compose up socket tunnel client

docker-cloudflare-with-local-stream:
	docker compose down; \
	TUNNEL_TOKEN=eyJhIjoiNzRhZGFmOTVjOTNlNTM4M2QxMzljODM4M2E5ZjY3YjYiLCJ0IjoiZWM1MmRhNzMtYjM3Ni00OTEwLTkwNzMtMmVlZmRmZjc4YmEzIiwicyI6Ik5UTmlPVGMyTVRndE1qWXlaUzAwTURKaUxXRTROek10TlRZM05UUXpaR1kyTlRWaCJ9 \
	WS_HOST=https://webrtc.giovanna.cc \
	CLIENT_PASSWORD=123456 \
	STREAM_URL=rtsp://stream:8554/live.stream \
	docker compose up tunnel socket client stream ffmpeg

# http://localhost:5678/
docker-local:
	docker compose down; \
	WS_HOST=http://socket:8080 \
	CLIENT_PASSWORD=123456 \
	STREAM_URL=rtsp://stream:8554/live.stream \
	docker compose up socket client stream ffmpeg mjpeg

.PHONY: run swift client docker-cloudflare docker-local