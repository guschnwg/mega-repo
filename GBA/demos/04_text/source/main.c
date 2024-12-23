// make GAME=demos/04_text run

#include <tonc.h>

int replace(int value, int from, int to) {
  int result = 0;
  // For each bit in an int
  for (int i = 0; i < 8; i++) {
    // Extract nibble
    int nibble = (value >> (i * 4)) & 0xF;
    if (nibble == from) {
      nibble = to;
    }
    // Place back the nibble
    result |= (nibble << (i * 4));
  }
  return result;
}

int main() {
  REG_DISPCNT = DCNT_MODE0 | DCNT_BG0 | DCNT_OBJ;

  txt_init_std();

  txt_init_se(0, BG_CBB(0) | BG_SBB(31), 0, CLR_WHITE, 0x0E);

  int palette = 0x1000;
  int font = 96;
  txt_init_se(0, BG_CBB(0) | BG_SBB(31), palette | font,
              CLR_YELLOW | (CLR_MAG << 16), 0x8E);

  int other_palette = 0x2000;
  int other_font = 192;
  txt_init_se(0, BG_CBB(0) | BG_SBB(31), other_palette | other_font,
              CLR_YELLOW | (CLR_MAG << 16), 0x1E);
  // Change 0 to 1, because 0 is transparent
  // 8 is the number of int-sizes parts of a tile
  // 95 is the number of tiles
  int *tile_addr = ((int *)tile_mem[0]) + (other_font << 3);
  for (int i = 0; i < 8 * 95; i++) {
    *tile_addr = replace(*tile_addr, 0, 1);
    tile_addr++;
  }

  int another_palette = 0x3000;
  int another_font = 288;
  txt_init_se(0, BG_CBB(0) | BG_SBB(31), another_palette | another_font,
              CLR_YELLOW | (CLR_MAG << 16), 0x8E);
  pal_bg_mem[(another_palette >> 8) + 1] = CLR_GREEN;
  // Change 0 to 1, because 0 is transparent
  // 8 is the number of int-sizes parts of a tile
  // 95 is the number of tiles
  int *another_tile_addr = ((int *)tile_mem[0]) + (another_font << 3);
  for (int i = 0; i < 8 * 95; i++) {
    *another_tile_addr = replace(*another_tile_addr, 0, 1);
    another_tile_addr++;
  }

  int counter = 0;
  bool color = false;
  while (1) {
    vid_vsync();

    se_puts(10, 110, "regular", 0);
    se_puts(10, 120, "with shadow", palette | font);
    se_puts(10, 130, "background", other_palette | other_font);
    se_puts(10, 140, "shadow and background", another_palette | another_font);

    counter++;

    // Change the palette of one
    if (counter > 60) {
      if (color) {
        pal_bg_mem[(another_palette >> 8) + 1] = CLR_GREEN;
      } else {
        pal_bg_mem[(another_palette >> 8) + 1] = CLR_RED;
      }
      color = !color;
      counter = 0;
    }

    // Print something on top of something else
    if (counter % 5 == 0) {
      se_puts(80, 40, "other thing", palette | font);
    } else if (counter % 4 == 0) {
      se_puts(80, 40, "other thing", other_palette | other_font);
    } else if (counter % 3 == 0) {
      se_puts(80, 40, "other thing", another_palette | another_font);
    } else {
      se_puts(80, 40, "other thing", 0);
    }
  }

  return 0;
}
