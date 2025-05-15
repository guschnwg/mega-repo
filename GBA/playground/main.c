// make GAME=demos/_base run

#include <stdio.h>
#include <stdlib.h>

typedef struct PowerUp {
  int is_active;
  int type;
  int time_left;
  int x;
  int y;
  int vx;
  int vy;
  void *update_fn;
  struct PowerUp *next;
  struct PowerUp *prev;
} PowerUp;

typedef struct PowerUps {
  PowerUp *head;
  int length;
  int max_length;
  int time_span;
  int time_to_next;
} PowerUps;

PowerUps define_power_ups() {
  PowerUps power_ups = {
      .head = NULL,
      .length = 0,
      .max_length = 10,
      .time_span = 8,
      .time_to_next = 8,
  };

  return power_ups;
}

PowerUp *define_power_up() {
  PowerUp *power_up = malloc(sizeof(PowerUp));
  power_up->is_active = 1;
  power_up->type = 1;
  power_up->time_left = rand() % 20 + 1;
  power_up->x = 0;
  power_up->y = 0;
  power_up->vx = 0;
  power_up->vy = 0;
  power_up->update_fn = 0;
  power_up->next = NULL;
  power_up->prev = NULL;
  return power_up;
}

void update_power_ups(PowerUps *power_ups) {
  // Can still add new power ups

  if (power_ups->length < power_ups->max_length) {
    power_ups->time_to_next--;

    if (power_ups->time_to_next <= 0) {
      power_ups->time_to_next = power_ups->time_span;

      if (power_ups->head == NULL) {
        power_ups->head = define_power_up();
      } else {
        PowerUp *crr = power_ups->head;
        while (crr->next != NULL) {
          crr = crr->next;
        }
        crr->next = define_power_up();
        crr->next->prev = crr;
      }

      power_ups->length++;
      power_ups->time_to_next = power_ups->time_span;
    }
  }

  PowerUp *crr = power_ups->head;
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
    }
    crr = crr->next;
  }
}

void print_power_ups(PowerUps *power_ups) {
  PowerUp *crr = power_ups->head;
  while (crr != NULL) {
    printf("%p %d %d %d %d %d %d %d %p\n", crr, crr->is_active, crr->type,
           crr->time_left, crr->x, crr->y, crr->vx, crr->vy, crr->next);

    crr = crr->next;
  }
}

int main() {
  PowerUps power_ups = define_power_ups();

  srand(1);

  int i = 0;
  while (1) {
    update_power_ups(&power_ups);
    printf("%d %d %d\n", i, power_ups.time_to_next, power_ups.length);
    print_power_ups(&power_ups);
    getchar();
    i++;
  }

  return 0;
}
