// make GAME=demos/16_from_spriter run

#include <tonc.h>

#include "sprite.h"

OBJ_ATTR obj_buffer[128];

int main() {
  REG_DISPCNT = DCNT_MODE0 | DCNT_OBJ | DCNT_OBJ_1D;
  REG_KEYCNT = KCNT_IRQ | KCNT_OR;

  pal_bg_mem[0] = RGB15(0, 31, 0);

  oam_init(obj_buffer, 128);

  // Load the car
  memcpy32(&tile_mem[4][0], spriteTiles, spriteTilesLen / sizeof(u32));
  memcpy16(pal_obj_mem, spritePal, spritePalLen / sizeof(u16));

  // Define image
  OBJ_ATTR *front = &obj_buffer[0];
  obj_set_attr(front, ATTR0_SQUARE, ATTR1_SIZE_16, 0);
  obj_set_pos(front, 112, 72);

  OBJ_ATTR *rear = &obj_buffer[1];
  obj_set_attr(rear, ATTR0_SQUARE, ATTR1_SIZE_16, 4);
  obj_set_pos(rear, 112, 72 + 16);

  int dx = 0;
  int y = 72;
  while (1) {
    vid_vsync();
    key_poll();

    dx = bit_tribool(key_held(-1), KI_RIGHT, KI_LEFT);
    if (dx != 0) {
      front->attr2 = 8;

      if (dx > 0 && (front->attr1 & ATTR1_HFLIP) != 0) {
        front->attr1 ^= ATTR1_HFLIP;
      } else if (dx < 0 && (front->attr1 & ATTR1_HFLIP) == 0) {
        front->attr1 ^= ATTR1_HFLIP;
      }
    } else {
      front->attr2 = 0;
    }

    y += bit_tribool(key_held(-1), KI_DOWN, KI_UP);
    BFN_SET(front->attr0, y, ATTR0_Y);
    BFN_SET(rear->attr0, y + 16, ATTR0_Y);

    oam_copy(oam_mem, obj_buffer, 2);
  }

  return 0;
}
