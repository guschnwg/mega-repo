run: TUNNEL_TOKEN=?
run:
	docker compose up --build

ngrok: TOKEN?=$(shell op item get NGrok --vault Private --format json | op item get - --fields label="authtoken")
ngrok: DOMAIN?=$(shell op item get NGrok --vault Private --format json | op item get - --fields label="domain")
ngrok:
	ngrok config add-authtoken $(TOKEN)
	ngrok http --domain=$(DOMAIN) 9999

download-yt: ID?=OAww-qrSnPs
download-yt:
	curl -X POST http://localhost:9999/youtube-dl/ -H "Content-Type: application/json" --data-raw '{"url": "https://www.youtube.com/watch?v=$(ID)"}'
	curl http://localhost:9999/youtube-dl/Youtube/$(ID).mp4 --output $(ID).mp4

install-fake-webcam:
	dnf install https://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm
	dnf install v4l2loopback
	modprobe v4l2loopback

fake-webcam:
	ffmpeg -i ./stream/big_buck_bunny_720p_1mb.mp4 -f v4l2 -vcodec rawvideo /dev/video0
