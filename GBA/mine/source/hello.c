//
//! \file hello_demo.c
//!   Screen-entry text demo
//! \date 20060228 - 20080416
//! \author cearn
//
// === NOTES ===

#include "tonc_input.h"
#include "tonc_memdef.h"
#include <stdio.h>

#include <aaa.h>
#include <tonc.h>

void level_one() {
  REG_DISPCNT = DCNT_MODE3 | DCNT_BG2;
  REG_KEYCNT = KCNT_IRQ | KCNT_OR;

  tte_init_bmp_default(3);

  int x = 10;
  int y = 10;
  int incrementX = 1;
  int incrementY = 1;
  char move[15];

  while (1) {
    key_poll();
    vid_vsync();

    m3_fill(CLR_BLACK);

    m3_plot(x, y, RGB15(31, 0, 0));           // or CLR_RED
    m3_plot(x + 30, y + 30, RGB15(0, 31, 0)); // or CLR_LIME
    m3_plot(x + 60, y + 60, RGB15(0, 0, 31)); // or CLR_BLUE

    snprintf(move, sizeof(move), "#{P:%d,%d}", x % 260, y % 260);
    tte_write(move);
    tte_write("Hello World!");

    x += incrementX;
    if (x >= 240 || x <= 0)
      incrementX *= -1;
    y += incrementY;
    if (y >= 160 || y <= 0)
      incrementY *= -1;

    incrementY += bit_tribool(key_hit(-1), KI_DOWN, KI_UP);
    incrementX += bit_tribool(key_hit(-1), KI_RIGHT, KI_LEFT);

    if (key_hit(KEY_START))
      break;
  }
}

OBJ_ATTR obj_buffer[128];
OBJ_AFFINE *obj_aff_buffer = (OBJ_AFFINE *)obj_buffer;

const OBJ_ATTR cLinkObjs[3]=
{
	{	0, ATTR1_SIZE_16,	 4, 0	},
	{	8, ATTR1_SIZE_16+1, 32, 0	},
	{	ATTR0_WIDE+17, ATTR1_SIZE_8+1, 2, 0	}
};

void level_two() {
  REG_DISPCNT = DCNT_MODE0 | DCNT_OBJ | DCNT_OBJ_1D;
  REG_KEYCNT = KCNT_IRQ | KCNT_OR;

  memcpy32(&tile_mem[4][0], aaaTiles, aaaTilesLen / sizeof(u32));
  memcpy16(pal_obj_mem, aaaPal, aaaPalLen / sizeof(u16));

  oam_init(obj_buffer, 128);

  int x = 96, y = 32;
  u32 head = 8, body = 24, palette = 0;
  u32 headBodyOffset = 8;
  OBJ_ATTR *playerHead = &obj_buffer[0];
  OBJ_ATTR *playerBody = &obj_buffer[1];

  obj_set_attr(playerHead, ATTR0_SQUARE, ATTR1_SIZE_16, ATTR2_PALBANK(palette) | head);
  obj_set_attr(playerBody, ATTR0_SQUARE, ATTR1_SIZE_16, ATTR2_PALBANK(palette) | body);

  obj_set_pos(playerHead, x, y);
  obj_set_pos(playerBody, x, y + headBodyOffset);

  while (1) {
    key_poll();
    vid_vsync();

    playerHead->attr2 = ATTR2_BUILD(head, palette, 0);
    playerBody->attr2 = ATTR2_BUILD(body, palette, 0);

    oam_copy(oam_mem, obj_buffer, 2);

    head += bit_tribool(key_hit(-1), KI_R, KI_L) * 4;
    body += bit_tribool(key_hit(-1), KI_R, KI_L) * 4;
    palette += bit_tribool(key_hit(-1), KI_A, KI_B);
    y += bit_tribool(key_held(-1), KI_DOWN, KI_UP);
    x += bit_tribool(key_held(-1), KI_RIGHT, KI_LEFT);

    obj_set_pos(playerHead, x, y);
    obj_set_pos(playerBody, x, y + headBodyOffset);
  }
}

int main() {
  // level_one();
  level_two();

  return 0;
}
