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
	open ./mine/game.gba

copy-libs: CONTAINER=$(shell docker create --rm gba-dev)
copy-libs:
	mkdir ${PWD}/libraries || true
	docker cp ${CONTAINER}:/opt/devkitpro/libtonc ${PWD}/libraries/libtonc
	docker cp ${CONTAINER}:/opt/devkitpro/libgba ${PWD}/libraries/libgba
	docker rm ${CONTAINER}