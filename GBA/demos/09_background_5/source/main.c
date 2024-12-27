// make GAME=demos/07_background_3 run

#include <stdio.h>
#include <string.h>
#include <tonc.h>

#include "map.h"
#include "tonc_input.h"
#include "tonc_math.h"

#define MAP_W 832   // Width of the map
#define MAP_H 512   // Height of the map
#define MAP_T_W 104 // Width of the map in tiles
#define MAP_T_H 64  // Height of the map in tiles
#define TILES_H 32  // Height of the screen in tiles
#define TILES_W 32  // Width of the screen in tiles

int main() {
  int se_num = 1;

  REG_DISPCNT = DCNT_MODE0 | DCNT_BG0;
  REG_BG0CNT = BG_CBB(0) | BG_SBB(se_num);

  REG_KEYCNT = KCNT_IRQ | KCNT_OR;

  SCR_ENTRY *dst = se_mem[se_num];
  memcpy(&tile_mem[0][0], mapTiles, mapTilesLen);
  memcpy(pal_bg_mem, mapPal, mapPalLen);
  // memcpy(dst, mapMap, mapMapLen);

  int x = 0, y = 0;
  int dx = 0, dy = 0;
  int map_x = 0, map_y = 0;

  while (1) {
    vid_vsync();
    key_poll();

    dx = key_tri_horz() * 2;
    dy = key_tri_vert() * 2;

    x += dx;
    y += dy;

    x = clamp(x, 0, MAP_W - SCREEN_WIDTH);
    y = clamp(y, 0, MAP_H - SCREEN_HEIGHT);

    // Shift by 3 is the same as dividing by 8
    // Why do I divide by 8? Because each tile is 8x8 pixels
    // Each ACTUAL tile is 16x16 pixels
    map_x = x >> 3;
    map_y = y >> 3;

    for (int iy = 0; iy < TILES_H; iy++) {
      for (int ix = 0; ix < TILES_W; ix++) {
        // In what X screen we are (0 for 0-256, 1 for 256-512, 2 for ...)
        int screen_x = map_x >> 5; // Shift by 5 is the same as dividing by 32
        bool is_threshold_x = ix < (map_x & 31);
        int src_x = TILES_W * (is_threshold_x ? screen_x + 1 : screen_x);

        int screen_y = map_y >> 5; // Shift by 5 is the same as dividing by 32
        bool is_threshold_y = iy < (map_y & 31);
        int src_y = TILES_H * (is_threshold_y ? screen_y + 1 : screen_y);

        int base_y = (iy + src_y) * MAP_T_W;
        int base_x = ix + src_x;

        dst[iy * TILES_H + ix] = mapMap[base_y + base_x];
      }
    }

    REG_BG0HOFS = x;
    REG_BG0VOFS = y;
  }

  return 0;
}
