setup:
	which platformio || brew install platformio
	platformio pkg install
	sh zed.sh

list:
	platformio device list

build:
	platformio run

upload:
	platformio run --target upload --upload-port /dev/cu.usbmodem101

monitor:
	platformio device monitor

clangd:
	clangd --check=src/main.cpp

battery:
	curl http://lilygo.local/battery
