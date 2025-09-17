api:
	cd api && docker compose up --build
.PHONY: api

api-watch:
	cd api && docker compose up --build --watch
.PHONY: api-watch

ui:
	npm run start
.PHONY: ui

ngrok: TOKEN?=$(shell op item get NGrok --vault Private --format json | op item get - --fields label="authtoken" --reveal)
ngrok: DOMAIN?=$(shell op item get NGrok --vault Private --format json | op item get - --fields label="domain")
ngrok:
	ngrok config add-authtoken $(TOKEN)
	ngrok http --domain=$(DOMAIN) 8000
