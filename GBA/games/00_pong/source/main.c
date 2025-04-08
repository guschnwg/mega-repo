// make GAME=demos/_base run

#include "tonc_input.h"
#include "tonc_math.h"
#include "tonc_memdef.h"
#include "tonc_oam.h"
#include "tonc_types.h"
#include "tonc_video.h"
#include <tonc.h>

OBJ_ATTR obj_buffer[128];

#define PLAYER_SPRITES 24

#define STATE_MENU 0
#define STATE_GAME 1
#define STATE_GAME_OVER 2

typedef struct Player {
  OBJ_ATTR *sprites[PLAYER_SPRITES];
  int pos_x;
  int pos_y;
  int speed_x;
  int speed_y;
  int size_vertical;
  int size_horizontal;
} Player;

typedef struct Ball {
  OBJ_ATTR *sprite;
  int pos_x;
  int pos_y;
  int speed_x;
  int speed_y;
} Ball;

typedef struct Collision {
  int min;
  int max;
} Collision;

int game_state = STATE_MENU;

void game_over() { game_state = STATE_GAME_OVER; }

void define_palette() {
  pal_obj_mem[0] = CLR_BLACK;
  pal_obj_mem[1] = CLR_WHITE;
  pal_obj_mem[2] = CLR_RED;
}

void define_tiles() {
  oam_init(obj_buffer, 128);
  // Each item in this array is a line in the tile,
  // each column in the line is a pixel as the index in the palette

  // Define the tile in the first position of the first object memory
  tile_mem_obj[0][0] = (TILE){{
      0x11111111,
      0x11111111,
      0x11111111,
      0x11111111,
      0x11111111,
      0x11111111,
      0x11111111,
      0x11111111,
  }};
  tile_mem_obj[0][1] = (TILE){{
      0x00022000,
      0x00222200,
      0x02211220,
      0x22111122,
      0x22111122,
      0x02211220,
      0x00222200,
      0x00022000,
  }};
}

void define_sprites(Player *player) {
  for (int i = 0; i < PLAYER_SPRITES; i++) {
    player->sprites[i] = obj_set_attr(&obj_buffer[i], ATTR0_SQUARE,
                                      ATTR1_SIZE_8, ATTR2_BUILD(0, 0, 0));
  }
}

Player define_player() {
  Player player = {
      .pos_x = (SCR_W / 2) << 2,
      .pos_y = (SCR_H / 2) << 2,
      .speed_x = 3,
      .speed_y = 3,
      .size_horizontal = 1,
      .size_vertical = 1,
  };
  define_sprites(&player);

  return player;
}

void update_player(Player *player) {
  player->pos_y += bit_tribool(key_held(-1), KI_DOWN, KI_UP) * player->speed_y;
  player->pos_x +=
      bit_tribool(key_held(-1), KI_RIGHT, KI_LEFT) * player->speed_x;

  int actual_pos_x = player->pos_x >> 2;
  int actual_pos_y = player->pos_y >> 2;

  player->size_horizontal += bit_tribool(key_hit(-1), KI_A, KI_B);
  player->size_horizontal = clamp(player->size_horizontal, 1, 3 + 1);
  player->size_vertical += bit_tribool(key_hit(-1), KI_R, KI_L);
  player->size_vertical = clamp(player->size_vertical, 1, 3 + 1);

  // VERTICAL
  obj_set_pos(player->sprites[0], 0, actual_pos_y - 24);
  obj_set_pos(player->sprites[1], 0, actual_pos_y - 16);
  obj_set_pos(player->sprites[2], 0, actual_pos_y - 8);
  obj_set_pos(player->sprites[3], 0, actual_pos_y);
  obj_set_pos(player->sprites[4], 0, actual_pos_y + 8);
  obj_set_pos(player->sprites[5], 0, actual_pos_y + 16);

  obj_set_pos(player->sprites[6], SCR_W - 8, actual_pos_y - 24);
  obj_set_pos(player->sprites[7], SCR_W - 8, actual_pos_y - 16);
  obj_set_pos(player->sprites[8], SCR_W - 8, actual_pos_y - 8);
  obj_set_pos(player->sprites[9], SCR_W - 8, actual_pos_y);
  obj_set_pos(player->sprites[10], SCR_W - 8, actual_pos_y + 8);
  obj_set_pos(player->sprites[11], SCR_W - 8, actual_pos_y + 16);

  if (player->size_vertical <= 2) {
    obj_hide(player->sprites[0]);
    obj_hide(player->sprites[5]);
    obj_hide(player->sprites[6]);
    obj_hide(player->sprites[11]);
  } else {
    obj_unhide(player->sprites[0], 3);
    obj_unhide(player->sprites[5], 3);
    obj_unhide(player->sprites[6], 3);
    obj_unhide(player->sprites[11], 3);
  }
  if (player->size_vertical <= 1) {
    obj_hide(player->sprites[1]);
    obj_hide(player->sprites[4]);
    obj_hide(player->sprites[7]);
    obj_hide(player->sprites[10]);
  } else {
    obj_unhide(player->sprites[1], 3);
    obj_unhide(player->sprites[4], 3);
    obj_unhide(player->sprites[7], 3);
    obj_unhide(player->sprites[10], 3);
  }

  // HORIZONTAL
  obj_set_pos(player->sprites[12], actual_pos_x - 24, 0);
  obj_set_pos(player->sprites[13], actual_pos_x - 16, 0);
  obj_set_pos(player->sprites[14], actual_pos_x - 8, 0);
  obj_set_pos(player->sprites[15], actual_pos_x, 0);
  obj_set_pos(player->sprites[16], actual_pos_x + 8, 0);
  obj_set_pos(player->sprites[17], actual_pos_x + 16, 0);

  obj_set_pos(player->sprites[18], actual_pos_x - 24, SCR_H - 8);
  obj_set_pos(player->sprites[19], actual_pos_x - 16, SCR_H - 8);
  obj_set_pos(player->sprites[20], actual_pos_x - 8, SCR_H - 8);
  obj_set_pos(player->sprites[21], actual_pos_x, SCR_H - 8);
  obj_set_pos(player->sprites[22], actual_pos_x + 8, SCR_H - 8);
  obj_set_pos(player->sprites[23], actual_pos_x + 16, SCR_H - 8);

  if (player->size_horizontal <= 2) {
    obj_hide(player->sprites[12]);
    obj_hide(player->sprites[17]);
    obj_hide(player->sprites[18]);
    obj_hide(player->sprites[23]);
  } else {
    obj_unhide(player->sprites[12], 3);
    obj_unhide(player->sprites[17], 3);
    obj_unhide(player->sprites[18], 3);
    obj_unhide(player->sprites[23], 3);
  }
  if (player->size_horizontal <= 1) {
    obj_hide(player->sprites[13]);
    obj_hide(player->sprites[16]);
    obj_hide(player->sprites[19]);
    obj_hide(player->sprites[22]);
  } else {
    obj_unhide(player->sprites[13], 3);
    obj_unhide(player->sprites[16], 3);
    obj_unhide(player->sprites[19], 3);
    obj_unhide(player->sprites[22], 3);
  }
}

Collision player_collision_x(Player *player) {
  int collision_x = 8 * player->size_horizontal;
  int actual_pos_x = player->pos_x >> 2;
  return (Collision){
      .min = actual_pos_x - collision_x,
      .max = actual_pos_x + collision_x,
  };
}

Collision player_collision_y(Player *player) {
  int collision_y = 8 * player->size_vertical;
  int actual_pos_y = player->pos_y >> 2;
  return (Collision){
      .min = actual_pos_y - collision_y,
      .max = actual_pos_y + collision_y,
  };
}

Ball define_ball(int index) {
  Ball ball = {
      .sprite = &obj_buffer[index],
      .pos_x = (SCR_W / 2) << 2,
      .pos_y = (SCR_H / 2) << 2,
      .speed_x = 3,
      .speed_y = 1,
  };
  obj_set_attr(ball.sprite, ATTR0_SQUARE, ATTR1_SIZE_8, ATTR2_BUILD(1, 0, 0));

  return ball;
}

void update_ball(Ball *ball, Player player) {
  ball->pos_x += ball->speed_x;
  ball->pos_y += ball->speed_y;

  int actual_pos_x = ball->pos_x >> 2;
  int actual_pos_y = ball->pos_y >> 2;

  if (actual_pos_x <= 0 || actual_pos_x >= SCR_W) {
    game_over();
  } else if (actual_pos_x - 4 == 8 || actual_pos_x + 4 == SCR_W - 8) {
    Collision collision_y = player_collision_y(&player);
    if (actual_pos_y > collision_y.min - 4 &&
        actual_pos_y < collision_y.max + 4) {
      ball->speed_x = -ball->speed_x;
    }
  }

  if (actual_pos_y <= 0 || actual_pos_y >= SCR_H) {
    game_over();
  } else if (actual_pos_y - 4 == 8 || actual_pos_y + 4 == SCR_H - 8) {
    Collision collision_x = player_collision_x(&player);
    if (actual_pos_x > collision_x.min - 4 &&
        actual_pos_x < collision_x.max + 4) {
      ball->speed_y = -ball->speed_y;
    }
  }

  obj_set_pos(ball->sprite, (ball->pos_x >> 2) - 4, (ball->pos_y >> 2) - 4);
}

int main() {
  REG_DISPCNT = DCNT_MODE0 | DCNT_BG0 | DCNT_OBJ;
  REG_KEYCNT = KCNT_IRQ | KCNT_OR;

  define_palette();
  define_tiles();

  Player player = define_player();
  Ball ball = define_ball(24);

  while (1) {
    vid_vsync();
    key_poll();

    if (game_state == STATE_MENU) {
      if (key_hit(KEY_START)) {
        game_state = STATE_GAME;
      }
    } else if (game_state == STATE_GAME) {
      update_player(&player);
      update_ball(&ball, player);
    } else if (game_state == STATE_GAME_OVER) {
      break;
    }

    oam_copy(oam_mem, obj_buffer, 25);
  }

  return 0;
}
