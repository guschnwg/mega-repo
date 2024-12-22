// make GAME=demos/tiles run

#include <tonc.h>

OBJ_ATTR obj_buffer[128];

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
  // The number in these brackets is the tile number in the palette
  // memory, each line in this array is a line in the tile

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

  TILE tile_2 = {{
      0x12222222,
      0x13333332,
      0x13333332,
      0x13333332,
      0x13333332,
      0x13333332,
      0x13333332,
      0x11111112,
  }};
  tile_mem_obj[0][1] = tile_2;

  TILE tile_3 = {{
      0xABBBBBBB,
      0xACCCCCCB,
      0xACCCCCCB,
      0xACCCCCCB,
      0xACCCCCCB,
      0xACCCCCCB,
      0xACCCCCCB,
      0xAAAAAAAB,
  }};
  tile_mem_obj[0][2] = tile_3;

  TILE tile_4 = {{
      0x45555555,
      0x46666665,
      0x46666665,
      0x46666665,
      0x46666665,
      0x46666665,
      0x46666665,
      0x44444445,
  }};
  tile_mem_obj[0][32] = tile_4;

  TILE tile_5 = {{
      0x87777777,
      0x89999997,
      0x89999997,
      0x89999997,
      0x89999997,
      0x89999997,
      0x89999997,
      0x88888887,
  }};
  tile_mem_obj[0][33] = tile_5;
}

void define_objects() {
  OBJ_ATTR *sprite = &obj_buffer[0];
  obj_set_attr(sprite, ATTR0_SQUARE, ATTR1_SIZE_8, ATTR2_BUILD(0, 0, 0));
  obj_set_pos(sprite, 1, 1);

  OBJ_ATTR *sprite2 = &obj_buffer[1];
  obj_set_attr(sprite2, ATTR0_SQUARE, ATTR1_SIZE_16, ATTR2_BUILD(0, 0, 0));
  obj_set_pos(sprite2, 20, 20);

  OBJ_ATTR *sprite3 = &obj_buffer[2];
  obj_set_attr(sprite3, ATTR0_WIDE, ATTR1_SIZE_16x8, ATTR2_BUILD(1, 0, 0));
  obj_set_pos(sprite3, 50, 50);
}

int main() {
  REG_DISPCNT = DCNT_MODE0 | DCNT_OBJ;

  define_palette();
  define_tiles();
  define_objects();

  oam_copy(oam_mem, obj_buffer, 3);

  while (1) {
  }

  return 0;
}
