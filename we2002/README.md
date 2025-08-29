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


Understanding how each player name is set in the ROM, and how the attributes are packed, we can override those values and set to whatever we want.


## View Textures

`cd texture`
`python main.py <path>/BIN/TITLE.BIN`

We used a PS1 emulator that supports debugging and showing the VRAM.
With that, we were able to see `when` the image was loaded in the memory.
Dumping the VRAM before and after the image load, we were able to get the data for the image.
We had no luck searching for pieces of the image in the ROM. And doing some research we were able to learn that the textures could be compressed, unfortunatelly I was not able to find information about it.

Looking into some turorials on YouTube, I was able to learn that we can use Ghidra for it.
https://www.youtube.com/watch?v=3c7yBlkQ_fE&t=1866s&pp=0gcJCbIJAYcqIYzv
https://www.youtube.com/watch?v=qCEZC3cPc1s&t=2081s

Looking the the magic function called LoadImage, I was able to track down when and where the images are added to the VRAM before usage. And doing some experimentations, I was able to learn that the function that does that was located in the `0x8001cc9c` position of the program, named `FUN_8001cc9c` by Ghidra.
With that, I copied the decompiled function and fixed the undefined types that Ghidra was not able to infer and did some testing by using actual files.

First, we had to extract some actual texture file from the game files, and after some reading on the Path Table, we chose TITLE.bin that could be interesting.

Inspecting that file data using HexEditor, I was able to learn how it is parsed and with that I had the help of `WE Image Manager` that is a tool used to view and edit textures. From it, I was able to see the images and palettes inside of the file, and with that knowledge, I did some try and errors and was able to understand how that data is packed in the headers of the file.

Now, with that, I extracted each image from the files to a given folder and used the `FUN_8001cc9c` to decompress it, but first I needed to understand how much bytes to use in the decompressed file. And for that I tried `HEIGHT*WIDTH*2` and it worked just fine, so in theory one byte contains two pixels, at least for this `TITLE.BIN`, probably because of the size of the palette.
https://problemkaputt.de/psxspx-cdrom-file-compression-tim-rle4-rle8.htm
http://justsolve.archiveteam.org/wiki/TIM_(PlayStation_graphics)
https://qhimm-modding.fandom.com/wiki/PSX/TIM_file

We then split the images in the file using `python read_bin.py <path>/BIN/TITLE.BIN`.
Moving forward, we can compile `gcc decompress_bin_to_tim.c -o decompress_bin_to_tim.out` and run `./decompress_bin_to_tim.out images/image_1.bin 2164 images/image_1_decompressed.bin 8192` to get the decompressed version of that image.
We then compared the decompressed file with the one that we had in the actual VRAM and it worked.

Wrapping up everything, we then figured out a way to do all of that in a single Python script that is `main.py`. Using `ctypes`, we were able to import the C code that was compiled to a `.so` file with `cc -fPIC -shared -o decompress_bin_to_tim.so decompress_bin_to_tim.c`. In that script, we create a grid with all images and all palettes. This outputs a file called `output.png` that can be inspected and validated.

*I am still figuring out what to do with that other than changing palettes to change some colors...*

For the palettes, I got the `{0}{bbbbb}{gg  ggg}{rrrrr}` format, and not all 255 values are available, just multiples of 8-ish. Probably just limitations too, nothing to worry about.
