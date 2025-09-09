# /BIN/TEX_61.BIN ✅
# # Segment start: 5208 - 0        - from 58140F80
# # Segment start: 9792 - 0        - from 40260F80
# # Segment start: 15400 - 0       - from 283C0F80
# # Segment start: 19972 - 0       - from 044E0F80
# # Segment start: 10336 - 0       - from 60280F80
# # Segment start: 20516 - 0       - from 24500F80
# # Segment start: 23808 - 0       - from 005D0F80
# # Segment start: 24352 - 0       - from 205F0F80
# # Segment start: 9248 - 0        - from 20240F80
# # Segment start: 19428 - 0       - from E44B0F80
# # Segment start: 29904 - 0       - from D0740F80
# /BIN/TITLE.BIN ✅
# # Segment start: 7908 - 0        - from E41E0F80
# # Segment start: 8068 - 0        - from 841F0F80
# /BIN/DAT2D.BIN ✅
# # Segment start: 65508 - 0       - from E4FF0F80
# # Segment start: 76836 - 65536   - from 242C1080
# /BIN/DATSEL.BIN ✅
# # Segment start: 220584 - 0      - from A85D1280
# # Segment start: 221464 - 0      - from 18611280
# # Segment start: 222432 - 0      - from E0641280
# # Segment start: 223464 - 0      - from E8681280
# # /BIN/DATSEL2.BIN ✅

import sys
import binascii
import shutil
import os

available = [0, 8, 16, 24, 32, 41, 49, 57, 65, 74, 82, 90, 98, 106, 115, 123, 131, 139, 148, 156, 164, 172, 180, 189, 197, 205, 213, 222, 230, 238, 246, 255]

class InvalidFlagException(Exception):
    pass

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
    og_location = int.from_bytes(data, 'little')

    plus_data = f.read(1)
    actual_plus_data = bytes([plus_data[0] & 0xF0])
    plus_location = int.from_bytes(actual_plus_data, 'little') << 12

    location = og_location + plus_location

    if plus_location != 0:
        # We need to know if there is actually a bigger jump
        even_more_data = bytes([0x00, 0x00, plus_data[0] & 0x0F])
        even_more_location = int.from_bytes(even_more_data, 'little')
        location = location + even_more_location
        if even_more_location != 0:
            plus_location = 0 # This is for the jump in L68

    flag = f.read(1)
    if flag == b'\x00':
        return [], location, 0
    if flag != b'\x80':
        raise InvalidFlagException(f"Invalid flag: {flag}")

    # print(f"From header: {bytes([data[0], data[1], plus_data[0], flag[0]])}")
    print(f"Segment start: {location} - {plus_location}")

    sectors = []
    header_offset = 0
    while True:
        f.seek(location + header_offset)

        header = f.read(16)
        # print(f"    Header: {header}")
        if header[0] == 0xFF:
            header_offset += 16
            break

        start_location = int.from_bytes(header[12:14], 'little')
        print(f"Adding {start_location} {plus_location} {start_location + plus_location}")
        sectors.append((header, start_location + plus_location))

        header_offset += 16

    response = []
    sectors.sort(key=lambda x: x[1])
    for index, (header, sector) in enumerate(sectors):
        f.seek(sector - plus_location)
        final_location = location + plus_location if len(sectors) == index + 1 else sectors[index + 1][1]
        length = final_location - sector

        # It was:
        # f.seek(sector)
        # final_location = location if len(sectors) == index + 1 else sectors[index + 1][1]
        # length = final_location - sector
        # But without this:
        # if length < 0:
        #     # Workaround
        #     f.seek(sector - plus_location)
        #     final_location = location + plus_location if len(sectors) == index + 1 else sectors[index + 1][1]
        #     length = final_location - sector

        data = f.read(length)

        response.append((sector - plus_location, final_location - plus_location, header, data))

    return response, location, header_offset

def read_segments(f):
    segments = []

    offset = 0
    while True:
        try:
            new_segments, location, header_offset = read(f, offset)
        except InvalidFlagException as e:
            break

        segments.extend(new_segments)

        offset += 4

    f.seek(0)
    if (location + header_offset) != len(f.read()):  # pyright: ignore
        print("Warning: Segment data does not match file size")

    return segments

def read_bin(bin_path):
    f = open(bin_path, 'rb')

    segments = read_segments(f)

    images = []
    palettes = []
    print("TYPE     START    END     LENGTH  WIDTH  HEIGHT  VRAM_X   VRAM_Y  HEADER")
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
            f"{seg[1]-seg[0]:-10}",
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
