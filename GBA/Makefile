.PHONY: build
build:
	docker build . -t gba-dev

.PHONY: game
game:
	rm -rf ${PWD}/${GAME}/build
	rm -f ${PWD}/${GAME}/game.gba
	docker run \
		-v ${PWD}/${GAME}:/game:rw \
		gba-dev \
		sh -c "cd game && make"

.PHONY: example
example: EXAMPLE?=basic/hello
example:
	make GAME="libtonc-examples/${EXAMPLE}" game
	open libtonc-examples/${EXAMPLE}/game.gba

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