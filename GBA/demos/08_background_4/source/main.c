// make GAME=demos/07_background_3 run

#include <stdio.h>
#include <string.h>
#include <tonc.h>

#include "map.h"
#include "tonc_input.h"
#include "tonc_math.h"

int main() {
  int se_num = 1;

  REG_DISPCNT = DCNT_MODE0 | DCNT_BG0;
  REG_BG0CNT = BG_CBB(0) | BG_SBB(se_num);

  REG_KEYCNT = KCNT_IRQ | KCNT_OR;

  SCR_ENTRY *dst = se_mem[se_num];
  memcpy(&tile_mem[0][0], mapTiles, mapTilesLen);
  memcpy(pal_bg_mem, mapPal, mapPalLen);
  memcpy(dst, mapMap, mapMapLen);

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
    y = clamp(y, 0, 512 - SCREEN_HEIGHT);

    map_x = x >> 4;
    map_y = y >> 4;

    for (int iy = 0; iy < 32; iy += 2) {
      for (int ix = 0; ix < 32; ix++) {
        int src_x = (ix / 2) < (map_x & 31) ? ix + 32 : ix;
        int src_y = (iy / 2) < (map_y & 31) ? iy + 32 : iy;

        dst[iy * 32 + ix + 00] = mapMap[src_y * 64 + src_x + 00];
        dst[iy * 32 + ix + 32] = mapMap[src_y * 64 + src_x + 64];
      }
    }

    REG_BG0HOFS = x;
    REG_BG0VOFS = y;
  }

  return 0;
}
