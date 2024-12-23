#include <aaa.h>
#include <stdlib.h>
#include <tonc.h>

#include "player.h"
#include "tonc_input.h"
#include "tonc_memdef.h"

extern OBJ_ATTR obj_buffer[128];
extern OBJ_AFFINE *obj_aff_buffer;

#define HEAD_BODY_OFFSET 8

const OBJ_ATTR cLinkObjs[3] = {{0, ATTR1_SIZE_16, 4, 0},
                               {8, ATTR1_SIZE_16 + 1, 32, 0},
                               {ATTR0_WIDE + 17, ATTR1_SIZE_8 + 1, 2, 0}};

const s8 cLinkStand[4] = {24, 32, 28, 32};

const s8 bodies[3][8] = {{64, 68, 72, 76, 64, -68, -72, -76},
                         {32, 36, 40, 44, 48, 52, 56, 60},
                         {80, 84, 88, 92, -80, -84, -88, -92}};
const s8 heads[3][8] = {{8, 8, -8, -8, 8, 8, -8, -8},
                        {4, 4, 16, 20, 4, 4, 16, 20},
                        {12, 12, -12, -12, 12, 12, -12, -12}};

void player_init(TSprite *player, int objId, int x, int y, int palette) {
  memcpy32(&tile_mem[4][0], aaaTiles, aaaTilesLen / sizeof(u32));
  memcpy16(pal_obj_mem, aaaPal, aaaPalLen / sizeof(u16));

  player->objId = 0;
  player->x = x;
  player->y = y;
  player->vx = 0;
  player->vy = 0;
  player->dir = 0;
  player->frame = 0;

  OBJ_ATTR *playerHead = &obj_buffer[objId];
  OBJ_ATTR *playerBody = &obj_buffer[objId + 1];

  obj_set_attr(playerHead, ATTR0_SQUARE, ATTR1_SIZE_16, ATTR2_PALBANK(0) | 0);
  obj_set_attr(playerBody, ATTR0_SQUARE, ATTR1_SIZE_16, ATTR2_PALBANK(0) | 0);
}

void setAttrs(TSprite *player, int head, int body, int palette) {
  OBJ_ATTR *playerHead = &obj_buffer[player->objId];
  OBJ_ATTR *playerBody = &obj_buffer[player->objId + 1];

  playerHead->attr1 &= ~ATTR1_HFLIP;
  playerBody->attr1 &= ~ATTR1_HFLIP;

  if (body < 0 || player->dir < 0) {
    playerBody->attr1 ^= ATTR1_HFLIP;
  }
  playerBody->attr2 = ATTR2_BUILD(abs(body), palette, 0);

  if (head < 0 || player->dir < 0) {
    playerHead->attr1 ^= ATTR1_HFLIP;
  }
  playerHead->attr2 = ATTR2_BUILD(abs(head), palette, 0);
}

void move(TSprite *player, int palette) {
  OBJ_ATTR *playerHead = &obj_buffer[player->objId];
  OBJ_ATTR *playerBody = &obj_buffer[player->objId + 1];

  if (player->vy == 0) {
    if (player->vx > 0) {
      player->dir = 1;
    } else if (player->vx < 0) {
      player->dir = -1;
    }
  } else if (player->vy > 0) {
    player->dir = 0;
  } else if (player->vy < 0) {
    player->dir = 2;
  }

  int body = bodies[abs(player->dir)][(player->frame >> 8) & 7];
  int head = heads[abs(player->dir)][(player->frame >> 8) & 7];

  setAttrs(player, head, body, palette);

  player->y += player->vy;
  player->x += player->vx;

  obj_set_pos(playerHead, player->x, player->y);
  obj_set_pos(playerBody, player->x, player->y + HEAD_BODY_OFFSET);
}

void stand(TSprite *player, int palette) {
  OBJ_ATTR *playerHead = &obj_buffer[player->objId];
  OBJ_ATTR *playerBody = &obj_buffer[player->objId + 1];

  int head = heads[abs(player->dir)][0];
  int body = cLinkStand[abs(player->dir)];

  setAttrs(player, head, body, palette);

  obj_set_pos(playerHead, player->x, player->y);
  obj_set_pos(playerBody, player->x, player->y + HEAD_BODY_OFFSET);
}

void player_update(TSprite *player, int palette) {
  player->vy = bit_tribool(key_held(-1), KI_DOWN, KI_UP);
  player->vx = bit_tribool(key_held(-1), KI_RIGHT, KI_LEFT);

  if (player->vy != 0 || player->vx != 0) {
    if (key_tri_shoulder() /* key_held(KI_R) */) {
      player->frame += 0x56;
      player->vy *= 2;
      player->vx *= 2;
    } else {
      player->frame += 0x12;
    }

    move(player, palette);
  } else {
    player->frame = 0;

    stand(player, palette);
  }
}
