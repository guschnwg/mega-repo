all: prepare build validate run

prepare:
	wget https://github.com/guschnwg/mega-repo/releases/download/godot-3.6.beta/server-editor.zip
	wget https://github.com/guschnwg/mega-repo/releases/download/godot-3.6.beta/vita_template_3.6.beta.tpz

build:
	docker build . -t godot-vita

# Here we need both Title and TitleID to be this, otherwise the export will not install
# because in parms
validate: FOLDER?=MyFirstGame
validate:
	@cat ${FOLDER}/export_presets.cfg | grep param_sfo/title= | cut -d = -f 2- | sed 's/"//g' | awk '{print length}' | xargs test 9 -eq || echo "Title must be 9 chars long and be all alphanumeric uppercase"
	@cat ${FOLDER}/export_presets.cfg | grep param_sfo/title_id= | cut -d = -f 2- | sed 's/"//g' | awk '{print length}' | xargs test 9 -eq || echo "Title must be 9 chars long and be all alphanumeric uppercase"
	@cat ${FOLDER}/export_presets.cfg | grep assets/bubble_icon_128x128= | cut -d = -f 2- | sed 's/"//g' | xargs test -f || echo "The bubble_icon_128x128 must be a valid file"
	@cat ${FOLDER}/export_presets.cfg | grep assets/app_splash_960x544= | cut -d = -f 2- | sed 's/"//g' | xargs test -f || echo "The app_splash_960x544 must be a valid file"
	@cat ${FOLDER}/export_presets.cfg | grep assets/livearea_bg_840x500= | cut -d = -f 2- | sed 's/"//g' | xargs test -f || echo "The livearea_bg_840x500 must be a valid file"
	@cat ${FOLDER}/export_presets.cfg | grep assets/livearea_startup_button_280x158= | cut -d = -f 2- | sed 's/"//g' | xargs test -f || echo "The livearea_startup_button_280x158 must be a valid file"

run: FOLDER?=MyFirstGame
run:
	docker run \
		-v $(shell pwd)/${FOLDER}:$(shell pwd)/${FOLDER} \
		godot-vita \
		 /godot_server \
			--path $(shell pwd)/${FOLDER} \
			--export "PlayStation Vita" \
			game.vpk

debug: FOLDER?=MyFirstGame
debug:
	docker run -v $(shell pwd)/${FOLDER}:$(shell pwd)/${FOLDER} -it godot-vita bash
