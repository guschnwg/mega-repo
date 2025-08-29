# Edit tool for WE 2002

`python3 -m venv we2002_2 3.13.3`
`source we2002/bin/activate`

## List directories

`python dirs.py WE2002.bin`

Parses the directories inside a .bin file for the game. This uses the ISO 9660 standard.
https://wiki.osdev.org/ISO_9660
https://en.wikipedia.org/wiki/ISO_9660
http://www.brankin.com/main/technotes/Notes_ISO9660.htm

I noticed that the game uses a sector size of `2352`, but only `2048` bytes are valid data.
There are `24` bytes in the beginning of the sector that is some header data, and `280` bytes of garbage in the end.
The descriptor starts on the `CD001` string location.

From there we can parse the Path Table and get the directories and files from it.

The files match the files extracted by The Unarchiver, on the MacOS.

## Change Countries Players

`python countries_players.py WE2002.bin`

Using an HexEditor and/or finding a string inside of the whole WE2002.bin file, we queried for the first player of the first country of the game, and found the HEX Location of it. With that we were able to find the file that contains players names.


Using a PS1 emulator, we were able to boot the game, save the Option File of the game, then copied this `.mcr` file that the emulator generated to a given location. After that, we went in-game and edited some player attributes, then saved the Option File. Opening HexEditor, we compared both files and were able to learn how the game stores players attributes in the ROM file.

Using an HexEditor and/or finding a string inside of the whole WE2002.bin file, we queried for the attributes for the player that we edited, and found the HEX Location of it. With that we were able to find the file that contains players attributes.


Next we needed to figure out how each attribute is packed in each player's data. We used the in-game editor to change attributes individually and with HexEditor we were able to track which bits were changing for each attribute.