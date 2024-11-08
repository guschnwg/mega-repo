.PHONY: build
build:
	docker build . -t gba-dev

game:
	docker run \
		-v ${PWD}/${GAME}:/game:rw \
		gba-dev \
		sh -c "cd game && make"

.PHONY: example
example: EXAMPLE?=hello
example:
	make GAME="libtonc-examples/basic/${EXAMPLE}" game

.PHONY: run
run:
	make GAME=mine game
