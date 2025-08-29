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
