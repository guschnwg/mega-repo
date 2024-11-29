//
//! \file hello_demo.c
//!   Screen-entry text demo
//! \date 20060228 - 20080416
//! \author cearn
//
// === NOTES ===

#include <stdio.h>
#include <stdlib.h>

#include "player.h"
#include <tonc.h>

OBJ_ATTR obj_buffer[128];
OBJ_AFFINE *obj_aff_buffer = (OBJ_AFFINE *)obj_buffer;

TSprite player;

void level_one() {
  REG_DISPCNT = DCNT_MODE3 | DCNT_BG2;
  REG_KEYCNT = KCNT_IRQ | KCNT_OR;

  tte_init_bmp_default(3);

  int x = 10;
  int y = 10;
  int incrementX = 1;
  int incrementY = 1;
  char move[15];

  while (1) {
    key_poll();
    vid_vsync();

    m3_fill(CLR_BLACK);

    m3_plot(x, y, RGB15(31, 0, 0));           // or CLR_RED
    m3_plot(x + 30, y + 30, RGB15(0, 31, 0)); // or CLR_LIME
    m3_plot(x + 60, y + 60, RGB15(0, 0, 31)); // or CLR_BLUE

    snprintf(move, sizeof(move), "#{P:%d,%d}", x % 260, y % 260);
    tte_write(move);
    tte_write("Hello World!");

    x += incrementX;
    if (x >= 240 || x <= 0)
      incrementX *= -1;
    y += incrementY;
    if (y >= 160 || y <= 0)
      incrementY *= -1;

    incrementY += bit_tribool(key_hit(-1), KI_DOWN, KI_UP);
    incrementX += bit_tribool(key_hit(-1), KI_RIGHT, KI_LEFT);

    if (key_hit(KEY_START))
      break;
  }
}

#include <bbb.h>

void something_else_init() {
  // Add another tileset
  memcpy32(&tile_mem[4][96], bbbTiles, bbbTilesLen / sizeof(u32));
  // Add another palette
  memcpy16(&pal_obj_mem[16], bbbPal, bbbPalLen / sizeof(u16));
}

void something_else_update(int palette) {
  static int counter = 0;

  // 0 and 1 are taken by the player
  OBJ_ATTR *playerHead = &obj_buffer[2];
  OBJ_ATTR *playerBody = &obj_buffer[3];

  // 96 - 100 - 104 --- 188
  // 24 -  25 -  26 ---  47 // /4
  //  0 -   1 -   2 ---  23 // -24

  int tile_index = counter >> 8;
  if (tile_index == 24) {
    counter = 0;
    tile_index = 0;
  } else {
    counter += 48;
  }

  obj_set_attr(playerHead,
               // ATTR 0:
               //    0-7: Y coordinate
               //    8-9: object mode
               //    A-B: Gfx mode
               //    C:   mosaic effect
               //    D:   color mode
               //    E-F: Sprite shape
               ATTR0_SQUARE + 12, // 0b0000000000001100,
               // ATTR 1:
               //    0-8: X coordinate
               //    9-D: Affine index
               //    C-D: Horizontal/vertical flipping
               //    E-F: Sprite size
               ATTR1_SIZE_16, // 0b0100000000000000,
               // ATTR 2:
               //    0-9: Base tile index
               //    A-B: Priority
               //    C-F: Palette bank
               (tile_index + 24) * 4 | ATTR2_PALBANK(palette));
  // obj_set_attr(playerBody, ATTR0_SQUARE, ATTR1_SIZE_16, ATTR2_PALBANK(0));
}

void level_two() {
  REG_DISPCNT = DCNT_MODE0 | DCNT_OBJ | DCNT_OBJ_1D;
  REG_KEYCNT = KCNT_IRQ | KCNT_OR;

  int palette = 0;

  oam_init(obj_buffer, 128);

  player_init(&player, 0, 96, 32, palette);
  something_else_init();

  while (1) {
    key_poll();
    vid_vsync();

    palette += bit_tribool(key_hit(-1), KI_A, KI_B);

    player_update(&player, palette);
    something_else_update(palette);

    oam_copy(oam_mem, obj_buffer, 128);
  }
}

int main() {
  // level_one();
  level_two();

  return 0;
}
