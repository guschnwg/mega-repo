// make GAME=demos/05_background run

#include <string.h>
#include <tonc.h>

#include "map.h"
#include "tonc_input.h"

int main() {
  // Why 1???
  int se_num = 1;

  REG_DISPCNT = DCNT_MODE0 | DCNT_BG0;
  REG_BG0CNT = BG_CBB(0) | BG_SBB(1) | BG_4BPP | BG_REG_64x32;

  REG_KEYCNT = KCNT_IRQ | KCNT_OR;

  memcpy(pal_bg_mem, mapPal, mapPalLen);          // Palette
  memcpy(&tile_mem[0][0], mapTiles, mapTilesLen); // Tilemap
  memcpy(&se_mem[1][0], mapMap, mapMapLen);       // Map, uses the tilemap

  int x = 0, y = 0;
  int rx = 0, ry = 0;
  while (1) {
    vid_vsync();
    key_poll();

    x += key_tri_horz();
    y += key_tri_vert();

    rx += bit_tribool(key_hit(-1), KI_A, KI_B) * 2;
    ry += bit_tribool(key_hit(-1), KI_R, KI_L) * 2;

    se_mem[se_num][32 * rx + 0 + ry] = mapMap[66];
    se_mem[se_num][32 * rx + 1 + ry] = mapMap[67];
    se_mem[se_num][32 * rx + 32 + ry] = mapMap[98];
    se_mem[se_num][32 * rx + 33 + ry] = mapMap[99];

    REG_BG0HOFS = x;
    REG_BG0VOFS = y;
  }

  return 0;
}
