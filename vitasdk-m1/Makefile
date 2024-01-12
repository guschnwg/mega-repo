build:
	docker compose build

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
			echo '--- Cleaning ---' && \
			rm -rf CMakeCache.txt CMakeFiles && \
			echo '--- CMake it ---' && \
			cmake . && \
			echo '--- Make it ---' && \
			make && \
			echo '--- Output it ---' && \
			cp $(OUTPUT_FILE).vpk /out\
		"

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
