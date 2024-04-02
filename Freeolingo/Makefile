FLAGS=--allow-net --allow-write
OUTPUT_PATH=./courses
FROM_LANGUAGE=en
LEARNING_LANGUAGE=nl-NL
TOKEN=$(shell op item get Giovanna --vault Private --format json | op item get - --fields label="duo token")

echo:
	echo $(TOKEN)

run-fetch:
	deno run $(FLAGS) ./Scripts/fetch.js $(OUTPUT_PATH) $(FROM_LANGUAGE) $(LEARNING_LANGUAGE) $(TOKEN)

debug-fetch:
	deno run --inspect-brk $(FLAGS) ./Scripts/fetch.js $(OUTPUT_PATH) $(FROM_LANGUAGE) $(LEARNING_LANGUAGE) $(TOKEN)

convert:
	deno run --allow-read --allow-write ./Scripts/convert.js $(INPUT_FILE) $(OUTPUT_FILE)
