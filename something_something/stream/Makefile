run-example:
	docker build . -t streaming && \
	docker run -it \
		-p 1234:8080 \
		-e STREAM_URL=http://camera.buffalotrace.com/mjpg/video.mjpg \
		-e START_LIVE=1 \
		streaming

run-local:
	docker build . -t streaming && \
	docker run -it \
		-p 1234:8080 \
		-e HOST= \
		-e PORT=80 \
		-e STREAM_USER=admin \
		-e STREAM_PASSWORD= \
		-e START_LIVE=1 \
		streaming