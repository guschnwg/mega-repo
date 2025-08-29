# python decompress.py World\ Soccer\ Winning\ Eleven\ 2002\ \(Japan\)/World\ Soccer\ Winning\ Eleven\ 2002\ \(Japan\)/BIN/TEX_61.BIN
# ✅
# python decompress.py World\ Soccer\ Winning\ Eleven\ 2002\ \(Japan\)/World\ Soccer\ Winning\ Eleven\ 2002\ \(Japan\)/BIN/TITLE.BIN
# ✅
# python decompress.py World\ Soccer\ Winning\ Eleven\ 2002\ \(Japan\)/World\ Soccer\ Winning\ Eleven\ 2002\ \(Japan\)/BIN/DAT2D.BIN
# ✅

import sys
import binascii
import shutil
import os

available = [0, 8, 16, 24, 32, 41, 49, 57, 65, 74, 82, 90, 98, 106, 115, 123, 131, 139, 148, 156, 164, 172, 180, 189, 197, 205, 213, 222, 230, 238, 246, 255]

def to_hex(integer):
    return hex(integer).replace('0x', '').zfill(2)

def read(f, offset):
    """
    sector:
    final_location:
    header:
    data:
    """
    f.seek(offset)
    data = f.read(2)
    location = int.from_bytes(data, 'little')

    # E4FF0F80 -> E4FF0 -> 0FFE4
    # 242C1080 -> 242C1 -> 12C24

    # 🤮 this is to make it work for the second case above
    new_data = f.read(1)
    plus_location = (int.from_bytes(new_data, 'little') & 10000) << 12
    location = location + plus_location

    sectors = []
    header_offset = 0
    while True:
        f.seek(location + header_offset)

        header = f.read(16)
        if header[0] == 0xFF:
            header_offset += 16
            break

        start_location = int.from_bytes(header[12:14], 'little')
        sectors.append((header, start_location + plus_location))

        header_offset += 16

    response = []
    for index, (header, sector) in enumerate(sectors):
        f.seek(sector)
        final_location = location if len(sectors) == index + 1 else sectors[index + 1][1]
        length = final_location - sector
        data = f.read(length)

        response.append((sector, final_location, header, data))

    return response, location, header_offset

def read_segments(f):
    segments = []

    offset = 0
    while True:
        try:
            new_segments, location, header_offset = read(f, offset)
            segments.extend(new_segments)
        except:
            pass

        offset += 4
        if offset in [seg[0] for seg in segments]:
            break

    f.seek(0)
    if (location + header_offset) != len(f.read()):  # pyright: ignore
        print("Warning: Segment data does not match file size")

    return segments

def read_bin(bin_path):
    f = open(bin_path, 'rb')

    segments = read_segments(f)

    images = []
    palettes = []
    print("TYPE     START    END   WIDTH  HEIGHT  VRAM_X   VRAM_Y  HEADER")
    for seg in segments:
        vram_x = int.from_bytes(seg[2][2:4], 'little')
        vram_y = int.from_bytes(seg[2][4:6], 'little')

        # Each byte in the width contains 2 pixels
        actual_width = int.from_bytes(seg[2][6:8], 'little')
        width = actual_width * 2
        height = int.from_bytes(seg[2][8:10], 'little')

        is_palette = seg[2][0] == 0x09

        print(
            "PALETTE" if is_palette else "IMAGE  ",
            f"{seg[0]:-6}",
            f"{seg[1]:-6}",
            f"{actual_width:-6}",
            f"{height:-7}",
            f"{vram_x:-8}",
            f"{vram_y:-8}",
            binascii.hexlify(seg[2])
        )

        if is_palette:
            palette = binascii.hexlify(seg[3])
            fixed = bytearray()
            for i in range(len(palette) // 4):
                color = palette[i*4:i*4+4]
                fixed_color = color[2:4] + color[0:2]
                bin_color = bin(int(fixed_color, 16)).lstrip('0b').zfill(16)
                r = available[int(bin_color[11:16], 2)]
                g = available[int(bin_color[6:11], 2)]
                b = available[int(bin_color[1:6], 2)]
                a = available[0]
                fixed.extend(bytearray.fromhex(f"{to_hex(b)}{to_hex(g)}{to_hex(r)}{to_hex(a)}".upper()))

            palettes.append((seg[0], seg[1], seg[2], seg[3], fixed))
        else:
            images.append((seg[0], seg[1], seg[2], seg[3], (width, height)))

    return images, palettes

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python read_bin.py <file_path>")
        sys.exit(1)

    shutil.rmtree('./images', ignore_errors=True)
    os.makedirs('./images')

    images, palettes = read_bin(sys.argv[1])

    for idx, image in enumerate(images):
        to_decompress = open(f'./images/image_{idx}.bin', 'wb')
        to_decompress.write(image[3])
        to_decompress.close()

    for idx, palette in enumerate(palettes):
        to_decompress = open(f'./images/palette_{idx}.bin', 'wb')
        to_decompress.write(palette[4])
        to_decompress.close()
