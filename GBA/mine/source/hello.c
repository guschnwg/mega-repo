//
//! \file hello_demo.c
//!   Screen-entry text demo
//! \date 20060228 - 20080416
//! \author cearn
//
// === NOTES ===

#include <stdio.h>
#include <string.h>
#include <tonc.h>

#include "bbb.h"
#include "brin.h"
#include "kakariko.h"
#include "player.h"
#include "tonc_input.h"
#include "tonc_math.h"
#include "tonc_video.h"

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

void something_else_init() {
  // Add another tileset, starting at 96 because it is the last one after the
  // player's
  memcpy32(&tile_mem[4][96], bbbTiles, bbbTilesLen / sizeof(u32));
  // Add another palette, starting at 16 because it is the first one after the
  // player's
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

void map_init() {
  REG_BG0CNT = BG_CBB(0) | BG_SBB(30) | BG_4BPP | BG_REG_64x32;
  memcpy(pal_bg_mem, brinPal, brinPalLen);
  memcpy(&tile_mem[0][0], brinTiles, brinTilesLen);
  memcpy(&se_mem[30][0], brinMap, brinMapLen);

  // How do I use other tilemap in BG1??? Or other palette
  REG_BG1CNT = BG_CBB(1) | BG_SBB(27) | BG_4BPP | BG_REG_64x32;
  memcpy(&tile_mem[1][0], brinTiles, brinTilesLen);
  memcpy(&se_mem[27][0], brinMap, brinMapLen);

  // Change the palette for the BG1 - FUN
  for (int i = 0; i < 2048; i++) { // 64 * 32
    // Keep tile index, set palette to 1 (ChatGPT)
    se_mem[27][i] = (se_mem[27][i] & 0x03FF) | (1 << 12);
  }
}

void level_three() {
  REG_DISPCNT = DCNT_MODE0 | DCNT_BG0 | DCNT_BG1 | DCNT_OBJ | DCNT_OBJ_1D;
  REG_KEYCNT = KCNT_IRQ | KCNT_OR;

  oam_init(obj_buffer, 128);

  player_init(&player, 0, 96, 32, 0);
  map_init();

  while (1) {
    key_poll();
    vid_vsync();

    // Kinda nice to play around
    player_update(&player, 0);
    REG_BG0HOFS = -player.x;
    REG_BG0VOFS = player.y * 2;

    // Some nice effect
    REG_BG1HOFS = player.x * 2;
    REG_BG1VOFS = -player.y * 2 * 2;

    oam_copy(oam_mem, obj_buffer, 128);
  }
}

void init_textbox(int bgnr, int left, int top, int right, int bottom) {
  tte_init_con();

  tte_set_margins(left, top, right, bottom);

  REG_DISPCNT |= DCNT_WIN0;

  REG_WIN0H = left << 8 | right;
  REG_WIN0V = top << 8 | bottom;
  REG_WIN0CNT = WIN_ALL | WIN_BLD;
  REG_WINOUTCNT = WIN_ALL;

  REG_BLDCNT = (BLD_ALL & ~BIT(bgnr)) | BLD_BLACK;
  REG_BLDY = 5;
}

void level_four() {
  REG_KEYCNT = KCNT_IRQ | KCNT_OR;
  REG_DISPCNT =
      DCNT_MODE0 | DCNT_BG0 | DCNT_BG1 | DCNT_OBJ | DCNT_OBJ_1D | DCNT_WIN0;

  oam_init(obj_buffer, 128);

  LZ77UnCompVram(kakarikoTiles, tile_mem[0]);
  GRIT_CPY(pal_bg_mem, kakarikoPal);
  tte_init_chr4c_b4_default(0, BG_CBB(2) | BG_SBB(28));

  init_textbox(0, 8, SCR_H - (8 + 2 * 12), SCR_W - 8, SCR_H - 8);

  REG_BG1CNT = BG_CBB(0) | BG_SBB(29);
  REG_BG1HOFS = 0;
  REG_BG1VOFS = 0;

  // Copy map to BG1
  SCR_ENTRY *dst = se_mem[BFN_GET(REG_BG1CNT, BG_SBB)];
  for (int iy = 0; iy < 32; iy++)
    for (int ix = 0; ix < 32; ix++)
      dst[iy * 32 + ix] = kakarikoMap[iy * 128 + ix];

  int x = 0, y = 0;
  int vx = 0, vy = 0;

  int dstx = 0, dsty = 0;
  while (1) {
    vid_vsync();
    key_poll();

    if (key_hit(KEY_START))
      break;

    vx = bit_tribool(key_held(-1), KI_RIGHT, KI_LEFT);
    vy = bit_tribool(key_held(-1), KI_DOWN, KI_UP);

    x = clamp(x + vx, 0, 1024 - SCREEN_WIDTH);
    y = clamp(y + vy, 0, 1024 - SCREEN_HEIGHT);

    // Tile size is 8, so everytime we walk 8, we update the map
    int mapX = x >> 3;
    int mapY = y >> 3;

    //    mapX = 0       |    mapX = 1        |    mapX = 2
    // 0 1 2 3 4 ... 31  | 32 1 2 3 4 ... 31  | 32 33 2 3 4 ... 31
    //
    //    mapX = 31                mapX = 32
    // 32 33 34 35 36 ... 63  | 64 33 34 35 36 ...

    // This runs fine, but it has a nested for loop
    if (vx != 0 || vy != 0) {
      for (int iy = 0; iy < 32; iy++) {
        for (int ix = 0; ix < 32; ix++) {
          int xIncr = 32 * (ix < (mapX & 31) ? mapX / 32 + 1 : mapX / 32);
          int yIncr = 32 * (iy < (mapY & 31) ? mapY / 32 + 1 : mapY / 32);

          dst[iy * 32 + ix] = kakarikoMap[(iy + yIncr) * 128 + ix + xIncr];
        }
      }
    }

    tte_printf("#{es;P} (%d,%d) - (%d, %d) - (%d, %d)", x, y, mapX, mapY, dstx,
               dsty);

    // This below is working,
    // but not together because when i change the Y it
    // overrides the changes from X
    //
    // mapX = 2 mapY = 2 width = 10 height = 4
    //
    //  26 27 22 23 24 25 -> 02 03 04 05 26 27
    //  36 37 32 33 34 35 -> 16 17 72 73 74 75
    //  06 07 02 03 04 05 -> 26 37 22 23 24 25
    //  16 17 12 13 14 15 -> 36 37 32 33 34 35
    //
    // if (vx != 0 && x != 0 && (x & 7) == 0) {
    //   // We need to add the new tile on the right or on the left
    //   int dstIdx = vx > 0 ? (dstx & 31) : ((dstx - 1) & 31);
    //   int srcIdx = vx > 0 ? dstx + 32 : dstx - 1;

    //   for (int iy = 0; iy < 32; iy++) {
    //     dst[iy * 32 + dstIdx] = kakarikoMap[iy * 128 + srcIdx];
    //   }
    //   dstx += vx;
    // }
    // if (vy != 0 && y != 0 && (y & 7) == 0) {
    //   // We need to add the new tile on the top or on the bottom
    //   int dstIdx = vy > 0 ? (dsty & 31) : ((dsty - 1) & 31);
    //   int srcIdx = vy > 0 ? (dsty + 32) : dsty - 1;

    //   for (int ix = 0; ix < 32; ix++) {
    //     dst[dstIdx * 32 + ix] = kakarikoMap[srcIdx * 128 + ix];
    //   }
    //   dsty += vy;
    // }

    REG_BG1HOFS = x;
    REG_BG1VOFS = y;

    oam_copy(oam_mem, obj_buffer, 128);
  }
}

int main() {
  // level_one();
  // level_two();
  // level_three();
  level_four();

  return 0;
}
