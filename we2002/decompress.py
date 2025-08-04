# python decompress.py World\ Soccer\ Winning\ Eleven\ 2002\ \(Japan\)/World\ Soccer\ Winning\ Eleven\ 2002\ \(Japan\)/BIN/TEX_61.BIN
# ✅
# python decompress.py World\ Soccer\ Winning\ Eleven\ 2002\ \(Japan\)/World\ Soccer\ Winning\ Eleven\ 2002\ \(Japan\)/BIN/TITLE.BIN
# ✅

import sys
import binascii

def read(offset):
    f.seek(offset)
    data = f.read(2)
    location = int.from_bytes(data, 'little')

    sectors = []
    header_offset = 0
    while True:
        f.seek(location + header_offset)

        header = f.read(16)
        if header[0] == 0xFF:
            break

        start_location = int.from_bytes(header[12:14], 'little')
        sectors.append((header, start_location))

        header_offset += 16

    response = []
    for index, (header, sector) in enumerate(sectors):
        f.seek(sector)
        final_location = location if len(sectors) == index + 1 else sectors[index + 1][1]
        length = final_location - sector
        data = f.read(length)

        response.append((sector, final_location, header, data))

    return response

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python decompress.py <file_path>")
        sys.exit(1)

    f = open(sys.argv[1], 'rb')

    segments = []

    offset = 0
    while True:
        try:
            segments.extend(read(offset))
        except:
            pass

        offset += 4
        if offset in [seg[0] for seg in segments]:
            break

    print("TYPE     START    END   WIDTH  HEIGHT  VRAM_X   VRAM_Y  HEADER")
    for seg in segments:
        vram_x = int.from_bytes(seg[2][2:4], 'little')
        vram_y = int.from_bytes(seg[2][4:6], 'little')

        width = int.from_bytes(seg[2][6:8], 'little') * 2 # Don't know why the *2 tho
        height = int.from_bytes(seg[2][8:10], 'little')

        is_palette = seg[2][0] == 0x09

        print(
            "PALETTE" if is_palette else "IMAGE  ",
            f"{seg[0]:-6}",
            f"{seg[1]:-6}",
            f"{width:-6}",
            f"{height:-7}",
            f"{vram_x:-8}",
            f"{vram_y:-8}",
            binascii.hexlify(seg[2])
        )

        if is_palette:
            palette = binascii.hexlify(seg[3])
            for i in range(len(palette) // 4):
                color = palette[i*4:i*4+4]
                fixed_color = color[2:4] + color[0:2]
                bin_color = bin(int(fixed_color, 16)).lstrip('0b').zfill(16)
                r = bin_color[11:16]
                g = bin_color[6:11]
                b = bin_color[1:6]
                print(f"R({int(r, 2) * 8})G({int(g, 2) * 8})B({int(b, 2) * 8})", end=" | ")
            print()