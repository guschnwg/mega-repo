from PIL import Image

def get_image_with_palette(width, height, image_data, palette_data):
    im = Image.new('RGB', (width, height))

    def get_colors(pal_index):
        b = palette_data[4 * pal_index]
        g = palette_data[4 * pal_index + 1]
        r = palette_data[4 * pal_index + 2]
        # a = palette_data[4 * pal_index + 3]

        return (r, g, b)

    im_data = []
    for datum in image_data:
        if len(palette_data) == 16 * 4:
            first = datum >> 4
            second = datum & 0xF

            im_data.append(get_colors(second))
            im_data.append(get_colors(first))
        if len(palette_data) == 256 * 4:
            im_data.append(get_colors(datum))


    im.putdata(im_data)

    return im

if __name__ == '__main__':
    import sys

    if len(sys.argv) < 3:
        print("Usage: python view_tim.py <image_path> <palette_path>")
        sys.exit(1)

    # TBD
    header = bytes.fromhex("424D76200000000000007600000028000000800000008000000001000400000000000020000000000000000000001000000000000000")
    # 16 colors
    pal = open(sys.argv[2], 'rb').read()
    pal = bytes.fromhex("00000000D5944A0083624A008B837B004A4A4A00292920002020F600C5C5DE000000F6004A4AF6007B7BFF00DEDEE600FFFFFF00ACACAC001010100010101000")
    # the pixels
    data = open(sys.argv[1], 'rb').read()

    height = int.from_bytes(header[18:22], 'little')
    width = int.from_bytes(header[22:26], 'little')

    im = get_image_with_palette(width, height, data, pal)
    im.show()
