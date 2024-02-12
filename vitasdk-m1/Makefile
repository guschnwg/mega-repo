.PHONY: build push

build:
	docker compose build --no-cache

push:
	docker tag docker.io/library/vita-builder:latest docker.io/giznrdni/vita-builder:latest
	docker push docker.io/giznrdni/vita-builder:latest

build-game: PROJECT?=hello_world
build-game: PROJECT_PATH?=/samples/$(PROJECT)
build-game: OUTPUT_FILE?=$(PROJECT)
build-game:
	docker compose \
		run \
		--rm \
		-v $(PWD)/games:/games:delegated \
		-v $(PWD)/samples:/samples:delegated \
		vita-builder \
		bash -c "\
			echo '--- cd to $(PROJECT_PATH) ---' && \
			cd $(PROJECT_PATH)/ && \
			echo '--- CMake it ---' && \
			cmake . && \
			echo '--- Make it ---' && \
			make && \
			echo '--- Output it ---' && \
			cp $(OUTPUT_FILE).vpk /out && \
			echo '--- Cleaning ---' && \
			rm -rf CMakeCache.txt CMakeFiles && \
			rm -rf $(PROJECT_PATH)/$(OUTPUT_FILE)* && \
			rm $(PROJECT_PATH)/cmake_install.cmake && \
			rm $(PROJECT_PATH)/Makefile \
		"

install-game: GAME_ID?=ID
install-game: OUTPUT_FILE?=OUTPUT
install-game:
	rm -rf /Users/giznrdni/Library/Application\ Support/Vita3K/Vita3K/ux0/app/$(GAME_ID)
	unzip ./out/$(OUTPUT_FILE).vpk -d /Users/giznrdni/Library/Application\ Support/Vita3K/Vita3K/ux0/app/$(GAME_ID)

run-game: GAME_ID?=ID
run-game:
	open /Applications/Vita3K.app --args -r $(GAME_ID)

build-install-run:
	killall Vita3K | true
	make build-game install-game run-game

# Specifics for mygame

build-my-game:
	PROJECT=mygame PROJECT_PATH=/games/mygame OUTPUT_FILE=mygame make build-game

install-my-game:
	rm -rf /Users/giznrdni/Library/Application\ Support/Vita3K/Vita3K/ux0/app/GIOV00001
	unzip ./out/mygame.vpk -d /Users/giznrdni/Library/Application\ Support/Vita3K/Vita3K/ux0/app/GIOV00001

run-my-game:
	open /Applications/Vita3K.app --args -r GIOV00001

build-install-run-my-game:
	killall Vita3K | true
	make build-my-game install-my-game run-my-game

watch-my-game:
	ls games/mygame/src/* | entr  -c make build-install-run-my-game

kill-vita3k:
	killall Vita3K

send-to-vita:
	curl -T ./out/mygame.vpk ftp://192.168.0.14:1337/ux0:/

pngquant:
	docker pull kolyadin/pngquant
	docker run -it --rm \
		-v $(PWD)/games/mygame/src/images/:/var/workdir/ \
		kolyadin/pngquant \
		find . -maxdepth 1 -type f -name "*.png" -exec pngquant --verbose -f --ext .png {} \;

watch-logs:
	code -r /Applications/Vita3K.app/Contents/Resources/vita3k.log


# make PROJECT=fake-first-person PROJECT_PATH=/games/fake-first-person OUTPUT_FILE=fake-first-person GAME_ID=GIOV00002 build-install-run