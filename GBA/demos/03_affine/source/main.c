// make GAME=demos/04_affine run

#include <tonc.h>

OBJ_ATTR obj_buffer[128];
OBJ_AFFINE *obj_aff_buffer = (OBJ_AFFINE *)obj_buffer;

void define_palette() {
  pal_obj_mem[0] = CLR_RED;
  pal_obj_mem[1] = CLR_GREEN;
  pal_obj_mem[2] = CLR_BLUE;
  pal_obj_mem[3] = CLR_WHITE;
  pal_obj_mem[4] = CLR_CYAN;
  pal_obj_mem[5] = CLR_YELLOW;
  pal_obj_mem[6] = CLR_MAG;
  pal_obj_mem[7] = CLR_PURPLE;
  pal_obj_mem[8] = CLR_DEAD;
  pal_obj_mem[9] = CLR_LIME;
  pal_obj_mem[10] = CLR_NAVY;
  pal_obj_mem[11] = CLR_WHITE;
  pal_obj_mem[12] = CLR_MAROON;
  pal_obj_mem[13] = CLR_OLIVE;
  pal_obj_mem[14] = CLR_ORANGE;
  pal_obj_mem[15] = CLR_FUCHSIA;
}

void define_tiles() {
  oam_init(obj_buffer, 128);

  TILE tile = {{
      0x01234567,
      0xBCDEF018,
      0xAF012329,
      0x9EBCD43A,
      0x8DAFE54B,
      0x7C98765C,
      0x6BA9876D,
      0x543210FE,
  }};
  tile_mem_obj[0][0] = tile;
}

void define_objects() {
  OBJ_ATTR *sprite = &obj_buffer[0];
  obj_set_attr(sprite, ATTR0_SQUARE | ATTR0_AFF, ATTR1_SIZE_8 | ATTR1_AFF_ID(0),
               ATTR2_BUILD(0, 0, 0));
  obj_set_pos(sprite, 10, 10);
  obj_aff_identity(&obj_aff_buffer[0]);
}

int main() {
  REG_KEYCNT = KCNT_IRQ | KCNT_OR;
  REG_DISPCNT = DCNT_MODE0 | DCNT_OBJ | DCNT_OBJ_1D;

  define_palette();
  define_tiles();
  define_objects();

  int counter = 0;
  int step = 0;
  while (1) {
    key_poll();
    vid_vsync();

    if (step == 0) {
      counter++;
      obj_aff_rotate(&obj_aff_buffer[0], 512 * counter);
      if (counter == 128) {
        step = 1;
        counter = 0;
      }
    } else if (step == 1) {
      counter += 32 * bit_tribool(key_hit(-1), KI_RIGHT, KI_LEFT);
      obj_aff_scale(&obj_aff_buffer[0], 256 - counter, 256 - counter);
      if (counter == 256) {
        step = 2;
        counter = 0;
      }
    } else if (step == 2) {
      obj_buffer[0].attr0 |= ATTR0_AFF_DBL_BIT;
      counter += 16 * bit_tribool(key_hit(-1), KI_RIGHT, KI_LEFT);
      obj_aff_scale(&obj_aff_buffer[0], 256 - counter, 256 - counter);
      if (counter == 256) {
        step = 3;
        counter = 0;
      }
    } else if (step == 3) {
      return 0;
    }

    oam_copy(oam_mem, obj_buffer, 1);
    obj_aff_copy(obj_aff_mem, obj_aff_buffer, 1);
  }
  return 0;
}
