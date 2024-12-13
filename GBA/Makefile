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
run: GAME?=mine
run:
	make GAME=$(GAME) game
	open ./$(GAME)/game.gba

copy-libs: CONTAINER=$(shell docker create --rm gba-dev)
copy-libs:
	mkdir ${PWD}/libraries || rm -rf ${PWD}/libraries && mkdir ${PWD}/libraries
	docker cp ${CONTAINER}:/opt/devkitpro/libtonc ${PWD}/libraries/libtonc
	docker cp ${CONTAINER}:/opt/devkitpro/libgba ${PWD}/libraries/libgba
	docker rm ${CONTAINER}
	echo "Fixing this file encoding"
	vim --clean -E -s -c 'argdo set fileencoding=utf-8 nobomb | update' -c q -- ./libraries/libtonc/include/tonc_tte.h
	vim --clean -E -s -c 'argdo set fileencoding=utf-8 nobomb | update' -c q -- ./libraries/libtonc/include/tonc_math.h
	# To fix in macos
	# clang: Argument to 'section' attribute is not valid for this target:
	#   mach-o section specifier requires a segment and section separated by a comma
	sh fix-macos-warning-in-tonc_types.sh
