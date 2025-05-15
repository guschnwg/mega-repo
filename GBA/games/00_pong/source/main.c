// make GAME=demos/_base run

#include <stdlib.h>
#include <tonc.h>

OBJ_ATTR obj_buffer[128];

#define PLAYER_SPRITES 24

#define STATE_MENU 0
#define STATE_GAME 1
#define STATE_GAME_OVER 2

typedef struct Player {
  OBJ_ATTR *sprites[PLAYER_SPRITES];
  int x;
  int y;
  int vx;
  int vy;
  int size_vertical;
  int size_horizontal;
} Player;

typedef struct Ball {
  OBJ_ATTR *sprite;
  int x;
  int y;
  int vx;
  int vy;
} Ball;

typedef struct Collision {
  int min;
  int max;
} Collision;

typedef struct PowerUp {
  int is_active;
  int type;
  int time_left;

  int x0;
  int y0;
  int x;
  int y;
  int a;
  int b;
  int c;

  struct PowerUp *next;
  struct PowerUp *prev;

  OBJ_ATTR *sprite;
} PowerUp;

typedef struct PowerUps {
  PowerUp *head;
  int length;
  int max_length;
  int time_to_next;
  int sprite_index;
} PowerUps;

int game_state = STATE_MENU;

void game_over() { game_state = STATE_GAME_OVER; }

void define_palette() {
  pal_obj_mem[0] = CLR_BLACK;
  pal_obj_mem[1] = CLR_WHITE;
  pal_obj_mem[2] = CLR_RED;
  pal_obj_mem[3] = CLR_GREEN;
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
  tile_mem_obj[0][2] = (TILE){{
      0x00033000,
      0x00333300,
      0x03311330,
      0x33111133,
      0x33111133,
      0x03311330,
      0x00333300,
      0x00033000,
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
      .x = (SCR_W / 2) << 2,
      .y = (SCR_H / 2) << 2,
      .vx = 3,
      .vy = 3,
      .size_horizontal = 1,
      .size_vertical = 1,
  };
  define_sprites(&player);

  return player;
}

void update_player(Player *player) {
  player->y += bit_tribool(key_held(-1), KI_DOWN, KI_UP) * player->vy;
  player->x += bit_tribool(key_held(-1), KI_RIGHT, KI_LEFT) * player->vx;

  int actual_x = player->x >> 2;
  int actual_y = player->y >> 2;

  player->size_horizontal += bit_tribool(key_hit(-1), KI_A, KI_B);
  player->size_horizontal = clamp(player->size_horizontal, 1, 3 + 1);
  player->size_vertical += bit_tribool(key_hit(-1), KI_R, KI_L);
  player->size_vertical = clamp(player->size_vertical, 1, 3 + 1);

  // VERTICAL
  obj_set_pos(player->sprites[0], 0, actual_y - 24);
  obj_set_pos(player->sprites[1], 0, actual_y - 16);
  obj_set_pos(player->sprites[2], 0, actual_y - 8);
  obj_set_pos(player->sprites[3], 0, actual_y);
  obj_set_pos(player->sprites[4], 0, actual_y + 8);
  obj_set_pos(player->sprites[5], 0, actual_y + 16);

  obj_set_pos(player->sprites[6], SCR_W - 8, actual_y - 24);
  obj_set_pos(player->sprites[7], SCR_W - 8, actual_y - 16);
  obj_set_pos(player->sprites[8], SCR_W - 8, actual_y - 8);
  obj_set_pos(player->sprites[9], SCR_W - 8, actual_y);
  obj_set_pos(player->sprites[10], SCR_W - 8, actual_y + 8);
  obj_set_pos(player->sprites[11], SCR_W - 8, actual_y + 16);

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
  obj_set_pos(player->sprites[12], actual_x - 24, 0);
  obj_set_pos(player->sprites[13], actual_x - 16, 0);
  obj_set_pos(player->sprites[14], actual_x - 8, 0);
  obj_set_pos(player->sprites[15], actual_x, 0);
  obj_set_pos(player->sprites[16], actual_x + 8, 0);
  obj_set_pos(player->sprites[17], actual_x + 16, 0);

  obj_set_pos(player->sprites[18], actual_x - 24, SCR_H - 8);
  obj_set_pos(player->sprites[19], actual_x - 16, SCR_H - 8);
  obj_set_pos(player->sprites[20], actual_x - 8, SCR_H - 8);
  obj_set_pos(player->sprites[21], actual_x, SCR_H - 8);
  obj_set_pos(player->sprites[22], actual_x + 8, SCR_H - 8);
  obj_set_pos(player->sprites[23], actual_x + 16, SCR_H - 8);

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
  int actual_x = player->x >> 2;
  return (Collision){
      .min = actual_x - collision_x,
      .max = actual_x + collision_x,
  };
}

Collision player_collision_y(Player *player) {
  int collision_y = 8 * player->size_vertical;
  int actual_y = player->y >> 2;
  return (Collision){
      .min = actual_y - collision_y,
      .max = actual_y + collision_y,
  };
}

Ball define_ball(int index) {
  Ball ball = {
      .sprite = &obj_buffer[index],
      .x = (SCR_W / 2) << 2,
      .y = (SCR_H / 2) << 2,
      .vx = 3,
      .vy = 1,
  };
  obj_set_attr(ball.sprite, ATTR0_SQUARE, ATTR1_SIZE_8, ATTR2_BUILD(1, 0, 0));

  return ball;
}

void update_ball(Ball *ball, Player player) {
  ball->x += ball->vx;
  ball->y += ball->vy;

  int actual_x = ball->x >> 2;
  int actual_y = ball->y >> 2;

  if (actual_x <= 0 || actual_x >= SCR_W) {
    game_over();
  } else if (actual_x - 4 == 8 || actual_x + 4 == SCR_W - 8) {
    Collision collision_y = player_collision_y(&player);
    if (actual_y > collision_y.min - 4 && actual_y < collision_y.max + 4) {
      ball->vx = -ball->vx;
    }
  }

  if (actual_y <= 0 || actual_y >= SCR_H) {
    game_over();
  } else if (actual_y - 4 == 8 || actual_y + 4 == SCR_H - 8) {
    Collision collision_x = player_collision_x(&player);
    if (actual_x > collision_x.min - 4 && actual_x < collision_x.max + 4) {
      ball->vy = -ball->vy;
    }
  }

  obj_set_pos(ball->sprite, (ball->x >> 2) - 4, (ball->y >> 2) - 4);
}

PowerUps define_power_ups(int index) {
  PowerUps power_ups = {
      .head = NULL,
      .length = 0,
      .max_length = 10,
      .time_to_next = qran_range(300, 600),
      .sprite_index = index,
  };

  return power_ups;
}

PowerUp *define_power_up(int sprite_index) {
  PowerUp *power_up = malloc(sizeof(PowerUp));
  power_up->is_active = 1;
  power_up->type = qran_range(0, 3);
  power_up->time_left = qran_range(600, 1200);
  power_up->x0 = qran_range(100, 140) << 2;
  power_up->y0 = qran_range(80, 120) << 2;
  power_up->x = 0;
  power_up->y = 0;
  power_up->a = 0;
  power_up->b = 0;
  power_up->c = 0;
  power_up->next = NULL;
  power_up->prev = NULL;
  power_up->sprite = &obj_buffer[sprite_index];
  obj_set_attr(power_up->sprite, ATTR0_SQUARE, ATTR1_SIZE_8,
               ATTR2_BUILD(2, 0, 0));
  return power_up;
}

void update_power_up_position(PowerUp *power_up) {
  power_up->a += 1; // Angle
  power_up->b = 10; // Radius
  power_up->c = 8;  // Speed?

  int lib_angle = (power_up->a * 11983744) >> 16; // (angle * 65536) / 360
  int cos_val = lu_cos(lib_angle) >> power_up->c;
  int sin_val = lu_sin(lib_angle) >> power_up->c;

  power_up->x = (power_up->x0 + (cos_val)*power_up->b);
  power_up->y = (power_up->y0 + (sin_val)*power_up->b);

  obj_set_pos(power_up->sprite, (power_up->x >> 2) - 4, (power_up->y >> 2) - 4);
}

void update_power_ups(PowerUps *power_ups) {
  // Can still add new power ups
  if (power_ups->length < power_ups->max_length) {
    power_ups->time_to_next--;

    if (power_ups->time_to_next <= 0) {
      power_ups->time_to_next = qran_range(300, 600);

      PowerUp *new_power_up =
          define_power_up(power_ups->sprite_index + power_ups->length);

      if (power_ups->head == NULL) {
        power_ups->head = new_power_up;
      } else {
        PowerUp *crr = power_ups->head;
        while (crr->next != NULL) {
          crr = crr->next;
        }
        crr->next = new_power_up;
        crr->next->prev = crr;
      }

      power_ups->length++;
      power_ups->time_to_next = qran_range(300, 600);
    }
  }

  PowerUp *crr = power_ups->head;
  int index = 0;
  while (crr != NULL) {
    crr->time_left--;
    if (crr->time_left <= 0) {
      if (crr->prev != NULL) {
        crr->prev->next = crr->next;
      }
      if (crr->next != NULL) {
        crr->next->prev = crr->prev;
      }
      if (crr == power_ups->head) {
        power_ups->head = crr->next;
      }
      power_ups->length--;
    } else {
      // TODO: Update x and y
      update_power_up_position(crr);
    }
    crr = crr->next;
    index++;
  }
}

int main() {
  REG_DISPCNT = DCNT_MODE0 | DCNT_BG0 | DCNT_OBJ;
  REG_KEYCNT = KCNT_IRQ | KCNT_OR;

  define_palette();
  define_tiles();

  Player player = define_player();
  Ball ball = define_ball(24);
  PowerUps power_ups = define_power_ups(25);

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
      update_power_ups(&power_ups);
    } else if (game_state == STATE_GAME_OVER) {
      break;
    }

    oam_copy(oam_mem, obj_buffer, 35);
  }

  return 0;
}
