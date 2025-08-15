source ../we2002/bin/activate

python read_bin.py /Users/giovanna/Projects/mega-repo/we2002/games/World\ Soccer\ Winning\ Eleven\ 2002\ \(Japan\)\ \(patched\)/BIN/TITLE.BIN

ls decompress_bin_to_tim.out || gcc decompress_bin_to_tim.c -o decompress_bin_to_tim.out
ls decompress_bin_to_tim.so  || cc -fPIC -shared -o decompress_bin_to_tim.so decompress_bin_to_tim.c

./decompress_bin_to_tim.out \
    images/image_1.bin \
    2164 \
    images/image_1_decompressed.bin \
    8192

python view_tim.py images/image_1_decompressed.bin images/palette_1.bin