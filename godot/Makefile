submodules:
	git submodule update --init --recursive

# Clear the cache so we get rid of some weird errors
clean-cache-dir-macos:
	rm -rf $(HOME)/Library/Caches/Godot

# Pull the editor
pull-macos: submodules
pull-macos:
	rm -rf Godot.app
	wget https://github.com/guschnwg/mega-repo/releases/download/godot-3.6.beta/macos-editor.zip
	unzip macos-editor.zip
	rm macos-editor.zip
	cp -r godot-vita/misc/dist/osx_tools.app ./Godot.app
	mkdir -p Godot.app/Contents/MacOS
	mv godot.osx.opt.tools.64 Godot.app/Contents/MacOS/Godot
	chmod +x Godot.app/Contents/MacOS/Godot

# Install the template to build to the vita
# Remove that __MACOSX
install-template-macos: FOLDER?=$(HOME)/Library/Application\ Support/Godot/templates/3.6.beta
install-template-macos:
	rm -f vita_template_3.6.beta.tpz
	wget https://github.com/guschnwg/mega-repo/releases/download/godot-3.6.beta/vita_template_3.6.beta.tpz
	unzip vita_template_3.6.beta.tpz
	zip -d vita_release.zip "__MACOSX*"
	mkdir -p $(FOLDER)
	mv version.txt $(FOLDER)
	mv vita_release.zip $(FOLDER)
	rm -f vita_template_3.6.beta.tpz


# Download the binaries
prepare:
	rm -f server-editor.zip
	wget https://github.com/guschnwg/mega-repo/releases/download/godot-3.6.beta/server-editor.zip
	rm -f vita_template_3.6.beta.tpz
	wget https://github.com/guschnwg/mega-repo/releases/download/godot-3.6.beta/vita_template_3.6.beta.tpz

# Build the docker image
# amd64 is not ideal since I use an ARM mac, but should work - sad that it takes longer
build:
	docker build --platform linux/amd64 . -t godot-vita

# Here we need both Title and TitleID to be this, otherwise the export will not install
# Make sure the images in export_presets.cfg exist in our local path
validate: FOLDER?=MyFirstGame
validate:
	@cat ${FOLDER}/export_presets.cfg | grep param_sfo/title= | cut -d = -f 2- | sed 's/"//g' | awk '{print length}' | xargs test 9 -eq || echo "Title must be 9 chars long and be all alphanumeric uppercase"
	@cat ${FOLDER}/export_presets.cfg | grep param_sfo/title_id= | cut -d = -f 2- | sed 's/"//g' | awk '{print length}' | xargs test 9 -eq || echo "Title must be 9 chars long and be all alphanumeric uppercase"
	@cat ${FOLDER}/export_presets.cfg | grep assets/bubble_icon_128x128= | cut -d = -f 2- | sed 's/"//g' | xargs test -f || echo "The bubble_icon_128x128 must be a valid file"
	@cat ${FOLDER}/export_presets.cfg | grep assets/app_splash_960x544= | cut -d = -f 2- | sed 's/"//g' | xargs test -f || echo "The app_splash_960x544 must be a valid file"
	@cat ${FOLDER}/export_presets.cfg | grep assets/livearea_bg_840x500= | cut -d = -f 2- | sed 's/"//g' | xargs test -f || echo "The livearea_bg_840x500 must be a valid file"
	@cat ${FOLDER}/export_presets.cfg | grep assets/livearea_startup_button_280x158= | cut -d = -f 2- | sed 's/"//g' | xargs test -f || echo "The livearea_startup_button_280x158 must be a valid file"

# Build the appropriate game from a given folder
# The volume from local will be the same in the Docker image because
# we want to keep the appropriate paths for images in export_presets.cfg
# Running in 64bit mode is not ideal for my ARM mac, but does the job
run: FOLDER?=MyFirstGame
run:
	docker run \
		--platform linux/amd64 \
		-v $(shell pwd)/${FOLDER}:$(shell pwd)/${FOLDER} \
		godot-vita \
			/godot_server \
			--path $(shell pwd)/${FOLDER} \
			--export "PlayStation Vita"

# Just move the file to be visible
output: FOLDER?=MyFirstGame
output:
	mv $(FOLDER)/$(shell cat $(FOLDER)/export_presets.cfg | grep export_path | cut -d = -f 2- | sed 's/"//g') $(FOLDER).vpk

teardown:
	rm server-editor.zip
	rm vita_template_3.6.beta.tpz

# PSVita requires the image to be 8bit indexed
convert-images: FOLDER?=MyFirstGame
convert-images:
	pngquant $(FOLDER)/**.png --ext .png --force

full-vita: prepare build validate run output teardown

vita: validate run output

send-to-vita: FOLDER?=MyFirstGame
send-to-vita:
	echo "put $(FOLDER).vpk /uma0:/$(FOLDER).vpk"
	ftp --no-login 192.168.0.52 1337

# To debug the image we built
debug: FOLDER?=MyFirstGame
debug:
	docker run -v $(shell pwd)/${FOLDER}:$(shell pwd)/${FOLDER} -it godot-vita bash
