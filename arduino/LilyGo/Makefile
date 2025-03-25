setup:
	which platformio || brew install platformio
	platformio pkg install

list:
	platformio device list

build:
	platformio run

upload:
	platformio run --target upload --upload-port /dev/cu.usbmodem101

monitor:
	platformio device monitor

init-vim:
	pio project init --ide vim
	# translate from .ccls to .clangd
	# add the following to .clangd
#  		- -std=gnu++11


#     Compiler: "/Users/gigigi/.platformio/packages/toolchain-xtensa-esp32s3@8.4.0+2021r2-patch5/bin/xtensa-esp32s3-elf-g++"

# Diagnostics:
#   Suppress:
#     - pp_file_not_found
#     - ovl_no_viable_member_function_in_call
#     - attribute_section_invalid_for_target

clangd:
	clangd --check=src/main.cpp

battery:
	curl http://lilygo.local/battery