bios:
	curl -L \
	    https://ia902803.us.archive.org/view_archive.php?archive=/0/items/PlayStationBios/PlayStation%20Bios.zip\&file=SCPH-1000.bin \
		-o SCPH-1000.bin

recursive-find:
	find . -type f -exec sh -c '
	  for file do
	    if strings "$file" | grep -q "Ronaldo"; then
	      echo "Found in: $file"
	    fi
	  done
	' sh {} +

open-game:
	/Applications/RetroArch.app/Contents/MacOS/RetroArch \
	    -L /Users/gigigi/Library/Application\ Support/RetroArch/cores/pcsx_rearmed_libretro.dylib \
		/Users/gigigi/Documents/Projects/mega-repo/we2002/BACKUP.bin

setup-venv:
	python3 -m venv we2002
	sh ./we2002/bin/activate
	pip install pycdlib

run:
	sh ./we2002/bin/activate
	python main.py