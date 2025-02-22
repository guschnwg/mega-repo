// make GAME=demos/16_from_spriter run

#include <tonc.h>

#include "sprite.h"

OBJ_ATTR obj_buffer[128];

int main() {
  REG_DISPCNT = DCNT_MODE0 | DCNT_BG1 | DCNT_OBJ | DCNT_OBJ_1D;
  REG_KEYCNT = KCNT_IRQ | KCNT_OR;

  oam_init(obj_buffer, 128);

  // Load the car
  memcpy32(&tile_mem[4][0], spriteTiles, spriteTilesLen / sizeof(u32));
  memcpy16(pal_obj_mem, spritePal, spritePalLen / sizeof(u16));

  // Define image
  OBJ_ATTR *image = &obj_buffer[0];
  obj_set_attr(image, ATTR0_SQUARE, ATTR1_SIZE_16, ATTR2_BUILD(0, 0, 0));
  obj_set_pos(image, 112, 72);

  int i = 0;
  while (1) {
    vid_vsync();
    key_poll();

    i += bit_tribool(key_hit(-1), KI_RIGHT, KI_LEFT);
    i = i % 16;

    image->attr2 = ATTR2_BUILD(0, i, 0);

    oam_copy(oam_mem, obj_buffer, 1);
  }

  return 0;
}
