// make GAME=demos/07_background_3 run

#include <stdio.h>
#include <string.h>
#include <tonc.h>

#include "map.h"
#include "tonc_core.h"
#include "tonc_input.h"
#include "tonc_math.h"
#include "tonc_memdef.h"
#include "tonc_memmap.h"
#include "tonc_video.h"

int main() {
  REG_DISPCNT = DCNT_MODE2 | DCNT_BG2 | DCNT_OBJ;
  REG_BG2CNT = BG_CBB(0) | BG_SBB(1) | BG_AFF_32x32;
  REG_KEYCNT = KCNT_IRQ | KCNT_OR;

  // Load the map
  memcpy(&tile_mem[0][0], mapTiles, mapTilesLen);
  memcpy(pal_bg_mem, mapPal, mapPalLen);
  memcpy(se_mem[1], mapMap, mapMapLen);

  // Affine setup
  BG_AFFINE bgaff = bg_aff_default;
  AFF_SRC_EX asx = {
      32 << 8, 64 << 8,   // Map coords.
      120,     80,        // Screen coords.
      0x0100,  0x0100,  0 // Scales and angle.
  };

  // Define anchor
  OBJ_ATTR *obj_cross = &oam_mem[0];
  tile_mem[4][1] = (TILE){{
      0x00011100,
      0x00100010,
      0x01022201,
      0x01021201,
      0x01022201,
      0x00100010,
      0x00011100,
      0x00000000,
  }};
  pal_obj_mem[0x01] = pal_obj_mem[0x12] = CLR_WHITE;
  pal_obj_mem[0x02] = pal_obj_mem[0x11] = CLR_BLACK;
  obj_cross->attr2 = 0x0001;

  int x = 0, y = 0, map_x = 0, map_y = 0;
  int counter = 0;
  while (1) {
    vid_vsync();
    key_poll();
    counter++;

    if (key_held(KEY_A)) {
      asx.scr_y -= key_tri_vert();
      asx.scr_x -= key_tri_horz();
    } else {
      asx.tex_y -= 256 * key_tri_vert();
      asx.tex_x -= 256 * key_tri_horz();
    }
    asx.alpha += 256 * key_tri_shoulder();

    bg_rotscale_ex(&bgaff, &asx);

    REG_BG_AFFINE[2] = bgaff;

    obj_set_pos(obj_cross, asx.scr_x - 3, (asx.scr_y - 3));
  }

  return 0;
}
