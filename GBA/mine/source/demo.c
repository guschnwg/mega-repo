
#include <stdio.h>
#include <string.h>
#include <tonc.h>

#include "aaa.h"
#include "bbb.h"
#include "brin.h"
#include "demo.h"
#include "kakariko.h"
#include "player.h"
#include "tonc_memdef.h"
#include "tonc_oam.h"
#include "tonc_types.h"

extern OBJ_ATTR obj_buffer[128];
extern OBJ_AFFINE *obj_aff_buffer;

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

  static int y = 120;
  static int x = 160;

  // 0 and 1 are taken by the player
  OBJ_ATTR *playerHead = &obj_buffer[2];
  OBJ_ATTR *playerBody = &obj_buffer[3];

  // 96 - 100 - 104 --- 188
  // 24 -  25 -  26 ---  47 // /4
  //  0 -   1 -   2 ---  23 // -24

  y += bit_tribool(key_held(-1), KI_LEFT, KI_DOWN);
  x += bit_tribool(key_held(-1), KI_UP, KI_RIGHT);

  int tile_index = counter >> 8;
  if (tile_index == 24) {
    counter = 0;
    tile_index = 0;
  } else {
    counter += 48;
  }

  obj_set_attr(playerHead,
               // ATTR 0: 0b0000000000000000
               //    0-7: Y coordinate
               //    8-9: object mode
               //    A-B: Gfx mode
               //    C:   mosaic effect
               //    D:   color mode
               //    E-F: Sprite shape
               ATTR0_SQUARE + y,
               // ATTR 1: 0b0000000000000000
               //    0-8: X coordinate
               //    9-D: Affine index
               //    C-D: Horizontal/vertical flipping
               //    E-F: Sprite size
               ATTR1_SIZE_16 + x,
               // ATTR 2: 0b0000000000000000
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

    if (key_hit(KEY_START))
      break;
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

    if (key_hit(KEY_START))
      break;
  }
}

void level_four() {
  REG_KEYCNT = KCNT_IRQ | KCNT_OR;
  REG_DISPCNT = DCNT_MODE0 | DCNT_BG0;

  // NOT: memcpy(&tile_mem[0][0], kakarikoTiles, kakarikoTilesLen);
  LZ77UnCompVram(kakarikoTiles, tile_mem[0]);
  memcpy(pal_bg_mem, kakarikoPal, kakarikoPalLen);

  REG_BG0CNT = BG_CBB(0) | BG_SBB(29);
  REG_BG0HOFS = 0;
  REG_BG0VOFS = 0;

  // Copy map to BG0
  SCR_ENTRY *dst = se_mem[BFN_GET(REG_BG0CNT, BG_SBB)];
  for (int iy = 0; iy < 32; iy++)
    for (int ix = 0; ix < 32; ix++)
      dst[iy * 32 + ix] = kakarikoMap[iy * 128 + ix];

  int x = 0, y = 0;
  int vx = 0, vy = 0;

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

    // This runs fine, but it has a nested for loop that i wanted to get rid
    // eventually But i won't spend much time on it, i tried and failed
    if (vx != 0 || vy != 0) {
      for (int iy = 0; iy < 32; iy++) {
        for (int ix = 0; ix < 32; ix++) {
          int xIncr = 32 * (ix < (mapX & 31) ? mapX / 32 + 1 : mapX / 32);
          int yIncr = 32 * (iy < (mapY & 31) ? mapY / 32 + 1 : mapY / 32);

          dst[iy * 32 + ix] = kakarikoMap[(iy + yIncr) * 128 + ix + xIncr];
        }
      }
    }

    REG_BG0HOFS = x;
    REG_BG0VOFS = y;
  }
}

void level_five() {
  REG_KEYCNT = KCNT_IRQ | KCNT_OR;
  REG_DISPCNT =
      DCNT_MODE0 | DCNT_BG0 | DCNT_BG1 | DCNT_OBJ | DCNT_OBJ_1D | DCNT_WIN0;

  // The text box
  tte_init_chr4c_b4_default(0, BG_CBB(2) | BG_SBB(28));
  tte_set_drawg(chr4c_drawg_b4cts_fast);
  tte_init_con();
  tte_set_margins(0, SCR_H - (8 + 2 * 12), SCR_W - 8, SCR_H - 8);
  REG_WIN0H = 0 << 8 | (SCR_W - 8);
  REG_WIN0V = (SCR_H - (8 + 2 * 12)) << 8 | (SCR_H - 8);
  REG_WIN0CNT = WIN_ALL | WIN_BLD;
  REG_WINOUTCNT = WIN_ALL;
  REG_BLDCNT = (BLD_ALL & ~BIT(0)) | BLD_BLACK;
  REG_BLDY = 5;

  // The BG
  REG_BG1CNT = BG_CBB(0) | BG_SBB(29);
  REG_BG1HOFS = 0;
  REG_BG1VOFS = 0;
  // NOT: memcpy(&tile_mem[0][0], kakarikoTiles, kakarikoTilesLen);
  LZ77UnCompVram(kakarikoTiles, tile_mem[0]);
  memcpy(pal_bg_mem, kakarikoPal, kakarikoPalLen);
  SCR_ENTRY *dst = se_mem[BFN_GET(REG_BG1CNT, BG_SBB)];
  for (int iy = 0; iy < 32; iy++)
    for (int ix = 0; ix < 32; ix++)
      dst[iy * 32 + ix] = kakarikoMap[iy * 128 + ix];

  // The Sprite
  oam_init(obj_buffer, 128);
  int tile_x = 120, tile_y = 60;
  memcpy32(&tile_mem[4][0], aaaTiles, aaaTilesLen / sizeof(u32));
  memcpy16(pal_obj_mem, aaaPal, aaaPalLen / sizeof(u16));
  obj_set_attr(&obj_buffer[0], ATTR0_SQUARE, ATTR1_SIZE_16,
               ATTR2_BUILD(8, 0, 0));
  obj_set_pos(&obj_buffer[0], tile_x, tile_y);

  int x = 0, y = 0;
  int vx = 0, vy = 0;
  while (1) {
    vid_vsync();
    key_poll();

    if (key_hit(KEY_START))
      break;

    vx = bit_tribool(key_held(-1), KI_RIGHT, KI_LEFT);
    vy = bit_tribool(key_held(-1), KI_DOWN, KI_UP);

    if (tile_x == 120) {
      x = clamp(x + vx, 0, 1024 - SCREEN_WIDTH);
    }
    if (tile_y == 80) {
      y = clamp(y + vy, 0, 1024 - SCREEN_HEIGHT);
    }

    if (vx != 0 && (x == 0 || x == 1024 - SCREEN_WIDTH - 1)) {
      tile_x = clamp(tile_x += vx, 0, 240 - 16);
    }
    if (vy != 0 && (y == 0 || y == 1024 - SCREEN_HEIGHT - 1)) {
      tile_y = clamp(tile_y += vy, 0, 160 - 16);
    }
    obj_set_pos(&obj_buffer[0], tile_x, tile_y);

    // Tile size is 8, so everytime we walk 8, we update the map
    int mapX = x >> 3;
    int mapY = y >> 3;

    if (vx != 0 || vy != 0) {
      for (int iy = 0; iy < 32; iy++) {
        for (int ix = 0; ix < 32; ix++) {
          int xIncr = 32 * (ix < (mapX & 31) ? mapX / 32 + 1 : mapX / 32);
          int yIncr = 32 * (iy < (mapY & 31) ? mapY / 32 + 1 : mapY / 32);

          dst[iy * 32 + ix] = kakarikoMap[(iy + yIncr) * 128 + ix + xIncr];
        }
      }
    }

    REG_BG1HOFS = x;
    REG_BG1VOFS = y;

    // Unused but just to illustrate
    int actual_tile_position_x = x + tile_x;
    int actual_tile_position_y = y + tile_y;
    tte_printf("#{es;P} (%d, %d) - (%d, %d) - (%d, %d)", x, y, tile_x, tile_y,
               actual_tile_position_x, actual_tile_position_y);

    oam_copy(oam_mem, obj_buffer, 128);
  }
}

typedef struct Bomb {
  int x, y, objId;
} Bomb;

void level_six() {
  REG_KEYCNT = KCNT_IRQ | KCNT_OR;
  REG_DISPCNT = DCNT_MODE0 | DCNT_OBJ | DCNT_OBJ_1D;

  oam_init(obj_buffer, 128);
  memcpy16(pal_obj_mem, aaaPal, aaaPalLen / sizeof(u16));

  OBJ_ATTR *sprite = &obj_buffer[0];
  int x = 120 - 16, y = 80 - 16;
  // Copying just 8, 9, 10, 11
  memcpy32(&tile_mem[4][0], &aaaTiles[8 * 8], 4 * 8);
  obj_set_attr(sprite, ATTR0_SQUARE | ATTR0_AFF,
               ATTR1_SIZE_16 | ATTR1_AFF_ID(0), ATTR2_BUILD(0, 0, 0));
  obj_set_pos(sprite, x, y);
  obj_aff_identity(&obj_aff_buffer[0]);

  memcpy32(&tile_mem[4][4], &aaaTiles[24 * 8], 4 * 8);
  int bombs_count = 0;
  Bomb bombs[16] = {};

  int counter = 0;
  bool shearX[3] = {false, false, false};
  int mult[3] = {2, -2, 4};
  while (1) {
    key_poll();
    vid_vsync();

    x += bit_tribool(key_held(-1), KI_RIGHT, KI_LEFT);
    y += bit_tribool(key_held(-1), KI_DOWN, KI_UP);

    obj_set_pos(sprite, x, y);

    if (counter >> 4 == 1) {
      counter = 0;

      int index = bombs_count & 15;
      bombs[index].x = qran_range(0, 240 - 16);
      bombs[index].y = qran_range(0, 160 - 16);
      bombs[index].objId = index + 1;
      OBJ_ATTR *bomb = &obj_buffer[bombs[index].objId];

      // IDK why 4 tho, or 7... (in theory it should be 0...3...6)
      // is there anything in affine position 4????
      int affine_index = bombs_count % 2 == 0 ? 4 : 7;
      obj_set_attr(bomb, ATTR0_SQUARE | ATTR0_AFF,
                   ATTR1_SIZE_16 | ATTR1_AFF_ID(affine_index),
                   ATTR2_BUILD(4, 0, 0));
      obj_set_pos(bomb, bombs[index].x, bombs[index].y);
      obj_aff_identity(&obj_aff_buffer[affine_index]);

      bombs_count += 1;
    }

    // Make it spin
    for (int i = 0; i < 3; i++) {
      OBJ_AFFINE *oaff_curr = &obj_aff_buffer[i * 3];
      OBJ_AFFINE *oaff_base = &obj_aff_buffer[i * 3 + 1];
      OBJ_AFFINE *oaff_new = &obj_aff_buffer[i * 3 + 2];

      if (counter % 2 == 0) {
        shearX[i] = !shearX[i];

        obj_aff_copy(oaff_base, oaff_curr, 1);
        obj_aff_identity(oaff_new);
      } else {
        if (shearX[i]) {
          obj_aff_shearx(oaff_new, counter * 2 * mult[i]);
        } else {
          obj_aff_sheary(oaff_new, -counter * 2 * mult[i]);
        }
        obj_aff_copy(oaff_curr, oaff_base, 1);
        obj_aff_postmul(oaff_curr, oaff_new);
      }
    }

    oam_copy(oam_mem, obj_buffer, 128);
    obj_aff_copy(obj_aff_mem, obj_aff_buffer, 6);

    if (key_hit(KEY_START))
      break;

    counter++;
  }
}

void level_seven() {
  REG_KEYCNT = KCNT_IRQ | KCNT_OR;
  REG_DISPCNT = DCNT_MODE0 | DCNT_OBJ | DCNT_OBJ_1D;

  oam_init(obj_buffer, 128);
  memcpy16(pal_obj_mem, aaaPal, aaaPalLen / sizeof(u16));

  OBJ_ATTR *sprite = &obj_buffer[0];
  int x = 120 - 16, y = 80 - 16;
  // Copying just 8, 9, 10, 11
  memcpy32(&tile_mem[4][0], &aaaTiles[8 * 8], 4 * 8);
  obj_set_attr(sprite, ATTR0_SQUARE | ATTR0_AFF,
               ATTR1_SIZE_16 | ATTR1_AFF_ID(0), ATTR2_BUILD(0, 0, 0));
  obj_set_pos(sprite, x, y);
  obj_aff_identity(&obj_aff_buffer[0]);

  int counter = 0;
  while (1) {
    key_poll();
    vid_vsync();

    x += bit_tribool(key_held(-1), KI_RIGHT, KI_LEFT);
    y += bit_tribool(key_held(-1), KI_DOWN, KI_UP);

    obj_set_pos(sprite, x, y);
    obj_aff_rotate(&obj_aff_buffer[0], counter * 1000);

    oam_copy(oam_mem, obj_buffer, 128);
    obj_aff_copy(obj_aff_mem, obj_aff_buffer, 1);

    if (key_hit(KEY_START))
      break;

    counter++;
  }
}