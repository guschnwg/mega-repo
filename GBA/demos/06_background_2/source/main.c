// make GAME=demos/06_background_2 run

#include <string.h>
#include <tonc.h>

#include "map.h"
#include "tonc_input.h"

int main() {
  // Why 1??? First screen block? Is there a 0 screen block??
  int se_num = 1;

  REG_DISPCNT = DCNT_MODE0 | DCNT_BG0;
  REG_BG0CNT = BG_CBB(0) | BG_SBB(se_num) | BG_4BPP | BG_REG_64x32;

  REG_KEYCNT = KCNT_IRQ | KCNT_OR;

  memcpy(pal_bg_mem, mapPal, mapPalLen);          // Palette
  memcpy(&tile_mem[0][0], mapTiles, mapTilesLen); // Tilemap
  memcpy(&se_mem[se_num][0], mapMap, mapMapLen);  // Map, uses the tilemap

  int x = 0, y = 0;
  int base = 0;
  while (1) {
    vid_vsync();
    key_poll();

    x += key_tri_horz();
    y += key_tri_vert();

    base += bit_tribool(key_hit(-1), KI_R, KI_L) * 32;

    // First tile
    se_mem[se_num][0] = mapMap[base];
    se_mem[se_num][1] = mapMap[base + 1];
    se_mem[se_num][32] = mapMap[base + 32];
    se_mem[se_num][33] = mapMap[base + 33];

    // Update last row, we use more than one screen block, it seems
    for (int i = 0; i < 32; i += 2) {
      se_mem[se_num][32 * 30 + 0 + i] = mapMap[base + 64 + i];
      se_mem[se_num][32 * 30 + 1 + i] = mapMap[base + 65 + i];
      se_mem[se_num][32 * 30 + 32 + i] = mapMap[base + 96 + i];
      se_mem[se_num][32 * 30 + 33 + i] = mapMap[base + 97 + i];

      se_mem[se_num + 1][32 * 30 + 0 + i] = mapMap[base + 64 + i];
      se_mem[se_num + 1][32 * 30 + 1 + i] = mapMap[base + 65 + i];
      se_mem[se_num + 1][32 * 30 + 32 + i] = mapMap[base + 96 + i];
      se_mem[se_num + 1][32 * 30 + 33 + i] = mapMap[base + 97 + i];
    }

    REG_BG0HOFS = x;
    REG_BG0VOFS = y;
  }

  return 0;
}
