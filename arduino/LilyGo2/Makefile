clean:
	pio run --target clean

setup:
	rm -rf .pio
	which platformio || brew install platformio
	pio project init
	pio pkg install
	pio run -t idedata
	sh zed.sh

list:
	platformio device list

build:
	platformio run

upload:
	platformio run --target upload --upload-port /dev/cu.usbmodem1101

monitor:
	platformio device monitor

clangd:
	clangd --check=src/main.cpp

battery:
	curl http://lilygo.local/battery
