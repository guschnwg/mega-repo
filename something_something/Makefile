run:
	TUNNEL_TOKEN=? \
	docker compose up --build

sudo-run:
	sudo \
	TUNNEL_TOKEN=? \
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
