// make GAME=demos/11_race_example run

#include <stdio.h>
#include <string.h>
#include <tonc.h>

#include "car.h"
#include "map.h"
#include "tonc_input.h"
#include "tonc_math.h"

OBJ_ATTR obj_buffer[128];
OBJ_AFFINE *obj_aff_buffer = (OBJ_AFFINE *)obj_buffer;

int keep_angle_in_range(int angle) {
  if (angle < 0)
    angle += 360;
  if (angle >= 360)
    angle -= 360;
  return angle;
}

int main() {
  REG_DISPCNT = DCNT_MODE0 | DCNT_BG1 | DCNT_BG2 | DCNT_OBJ | DCNT_OBJ_1D;
  REG_BG2CNT = BG_CBB(0) | BG_SBB(1) | BG_REG_64x64;
  REG_KEYCNT = KCNT_IRQ | KCNT_OR;

  oam_init(obj_buffer, 128);

  // Load the map
  memcpy(&tile_mem[0][0], mapTiles, mapTilesLen);
  memcpy(pal_bg_mem, mapPal, mapPalLen);
  memcpy(se_mem[1], mapMap, mapMapLen);

  // Load the car
  memcpy32(&tile_mem[4][0], carTiles, carTilesLen / sizeof(u32));
  memcpy16(pal_obj_mem, carPal, carPalLen / sizeof(u16));

  // Define car
  int x = 190 << 8, y = 60 << 8, speed = 0, angle = 90;
  OBJ_ATTR *car = &obj_buffer[0];
  obj_set_attr(car, ATTR0_SQUARE | ATTR0_AFF, ATTR1_SIZE_16 | ATTR1_AFF_ID(0),
               ATTR2_BUILD(0, 0, 0));
  obj_set_pos(car, 112, 72);
  obj_aff_identity(&obj_aff_buffer[0]);

  // Some debug init
  tte_init_chr4c_b4_default(1, BG_CBB(2) | BG_SBB(28));
  tte_init_con();

  while (1) {
    vid_vsync();
    key_poll();

    int speedDecrease = key_tri_horz() != 0 ? 5 : 0;

    if (key_tri_vert() == 1) {
      speed += 10 - speedDecrease;
      speed = clamp(speed, -300, 300);
    } else if (key_tri_vert() == -1) {
      speed -= 10 - speedDecrease;
      speed = clamp(speed, -300, 300);
    } else {
      if (speed < 0) {
        speed += 3 + speedDecrease;
        speed = clamp(speed, -300, 1);
      } else if (speed > 0) {
        speed -= 3 + speedDecrease;
        speed = clamp(speed, 0, 300);
      }
    }

    if (speed != 0) {
      int delta = bit_tribool(key_held(-1), KI_LEFT, KI_RIGHT) * 3;
      angle += delta;
      angle = keep_angle_in_range(angle);
    }

    // Calculate affine rotation
    int lib_angle = (angle * 11983744) >> 16; // (angle * 65536) / 360
    obj_aff_rotate(&obj_aff_buffer[0], lib_angle);

    // Calculate movement direction
    int cos_val = lu_cos(lib_angle);
    int sin_val = lu_sin(lib_angle);
    x -= (cos_val * speed >> 3) >> 8;
    y += (sin_val * speed >> 3) >> 8;
    // obj_set_pos(car, x >> 8, y >> 8);

    // Some debug printing
    tte_erase_screen();
    tte_printf("#{P:%d,%d} %d (%d, %d) %d", 10, 10, angle, x >> 8, y >> 8,
               speed);

    oam_copy(oam_mem, obj_buffer, 1);
    obj_aff_copy(obj_aff_mem, obj_aff_buffer, 1);

    REG_BG2HOFS = x >> 8;
    REG_BG2VOFS = y >> 8;
  }

  return 0;
}
