build:
	docker compose build

run: PROJECT?=hello_world
run: PROJECT_PATH?=/samples/$(PROJECT)
run: OUTPUT_FILE?=$(PROJECT)
run:
	docker compose \
		run \
		--rm \
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

run-my-game:
	PROJECT=my_game PROJECT_PATH=/my_game OUTPUT_FILE=my_game make run
