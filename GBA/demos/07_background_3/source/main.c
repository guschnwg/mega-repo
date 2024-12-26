// make GAME=demos/07_background_3 run

#include <string.h>
#include <tonc.h>

#include "map.h"
#include "tonc_input.h"
#include "tonc_math.h"

int main() {
  int se_num = 1;

  REG_DISPCNT = DCNT_MODE0 | DCNT_BG0;
  REG_BG0CNT = BG_CBB(0) | BG_SBB(se_num) | BG_4BPP | BG_REG_32x32;

  REG_KEYCNT = KCNT_IRQ | KCNT_OR;

  memcpy(pal_bg_mem, mapPal, mapPalLen);          // Palette
  memcpy(&tile_mem[0][0], mapTiles, mapTilesLen); // Tilemap
  memcpy(&se_mem[se_num][0], mapMap, mapMapLen);  // Map, uses the tilemap

  SCR_ENTRY *dst = se_mem[se_num];

  int x = 0, y = 0;
  int dx = 0, dy = 0;
  int map_x = 0, map_y = 0;

  while (1) {
    vid_vsync();
    key_poll();

    dx = key_tri_horz();
    dy = key_tri_vert();

    x += dx;
    y += dy;

    x = clamp(x, 0, 512 - SCREEN_WIDTH);
    y = clamp(y, 0, 1024 + SCREEN_HEIGHT);

    map_x = x >> 3;
    map_y = y >> 3;

    REG_BG0HOFS = x;
    REG_BG0VOFS = y;
  }

  return 0;
}
