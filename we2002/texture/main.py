# python main.py /Users/giovanna/Projects/mega-repo/we2002/games/World\ Soccer\ Winning\ Eleven\ 2002\ \(Japan\)\ \(patched\)/BIN/TITLE.bin
# ✅
# python main.py /Users/giovanna/Projects/mega-repo/we2002/games/World\ Soccer\ Winning\ Eleven\ 2002\ \(Japan\)\ \(patched\)/BIN/TEX_XX.bin
# ✅

import sys
import ctypes

from read_bin import read_bin
from view_tim import get_image_with_palette

from PIL import Image

def image_grid(imgs, rows, cols):
    assert len(imgs) == rows*cols

    w, h = imgs[0].size
    grid = Image.new('RGB', size=(cols*w, rows*h))
    grid_w, grid_h = grid.size

    for i, img in enumerate(imgs):
        grid.paste(img, box=(i%cols*w, i//cols*h))

    return grid

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python main.py <file_path>")
        sys.exit(1)

    lib = ctypes.CDLL("./decompress_bin_to_tim.so")

    lib.FUN_8001cc9c.argtypes = [ctypes.POINTER(ctypes.c_ubyte), ctypes.POINTER(ctypes.c_ubyte)]
    lib.FUN_8001cc9c.restype = ctypes.POINTER(ctypes.c_ubyte)

    images, palettes = read_bin(sys.argv[1])

    if not palettes:
        print("No palettes!")
        sys.exit(1)

    generated_images = []
    for image in images:
        input_size = len(image[3])
        width, height = image[4]
        print(f"W {width} H {height}")
        output_size = width * height * 2 # Double the size FOR SAFETY REASONS

        print(f"Running for {input_size} to {output_size}")
        input_data = (ctypes.c_ubyte * input_size)(*image[3])
        output_data = (ctypes.c_ubyte * output_size)(*([0x00] * output_size))
        print("Input and output OK")

        result_ptr = lib.FUN_8001cc9c(input_data, output_data)
        print("Ran the C code")
        result_bytes = bytes(output_data[:width * height]) # Read just the size we want!
        print("Got the response bytes")

        for palette in palettes:
            # The times here depends on how many pixels fit in a byte
            # CLUTs of 16 fit 2 pixels in a byte
            if len(palette[4]) == 16 * 4:
                multiplier = 2
            # CLUTs of 256 fit 1 pixel in a byte
            elif len(palette[4]) == 256 * 4:
                multiplier = 1
            else:
                multiplier = 1

            im = get_image_with_palette(width * multiplier, height, result_bytes, palette[4])
            generated_images.append(im)

    new_image = image_grid(generated_images, len(images), len(palettes))
    new_image.show()
