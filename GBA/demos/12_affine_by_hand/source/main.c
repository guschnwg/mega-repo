// make GAME=demos/12_affine_by_hand run

#include "tonc_input.h"
#include "tonc_math.h"
#include "tonc_memdef.h"
#include "tonc_types.h"
#include "tonc_video.h"
#include <tonc.h>

int INLINE apply_x(int x, int y, int a00, int a01) { return x * a00 + y * a01; }
int INLINE apply_y(int x, int y, int a10, int a11) { return x * a10 + y * a11; }
int keep_angle_in_range(int angle) {
  if (angle < 0)
    angle += 360;
  if (angle >= 360)
    angle -= 360;
  return angle;
}
COLOR INLINE color(int x, int y, int base) {
  return RGB8((x - base) << 3, (y - base) << 3, 0);
}

void square(int a00, int a01, int a10, int a11, int base) {
  for (int y = 0 + base; y < 32 + base; y++) {
    for (int x = 0 + base; x < 32 + base; x++) {
      int new_x = apply_x(x, y, a00, a01) >> 2;
      int new_y = apply_y(x, y, a10, a11) >> 2;

      vid_mem[(new_y + 50) * 240 + (new_x + 50)] = color(x, y, base);
    }
  }
}

void shear() {
  int a00 = 1 << 2, a01 = 0 << 2;
  int a10 = 0 << 2, a11 = 1 << 2;

  bool a01or10 = false;

  while (1) {
    vid_vsync();
    key_poll();

    m3_fill(CLR_BLACK);

    if (key_hit(KEY_START)) {
      a01or10 = !a01or10;
    }
    if (key_hit(KEY_SELECT)) {
      return;
    }

    if (a01or10) {
      a01 += bit_tribool(key_hit(-1), KI_DOWN, KI_UP);
    } else {
      a10 += bit_tribool(key_hit(-1), KI_DOWN, KI_UP);
    }

    square(a00, a01, a10, a11, -16);

    for (int y = 120; y < 130; y++) {
      for (int x = 50; x < 60; x++) {
        vid_mem[y * 240 + x] = a01or10 ? CLR_GREEN : CLR_RED;
      }
    }

    for (int y = 120; y < 130; y++) {
      for (int x = 70; x < 80; x++) {
        vid_mem[y * 240 + x] = !a01or10 ? CLR_GREEN : CLR_RED;
      }
    }
  }
}

void reflection() {
  int a00 = 1 << 2, a01 = 0 << 2;
  int a10 = 0 << 2, a11 = 1 << 2;

  bool a00or11 = false;

  while (1) {
    vid_vsync();
    key_poll();

    m3_fill(CLR_BLACK);

    if (key_hit(KEY_START)) {
      a00or11 = !a00or11;
    }
    if (key_hit(KEY_SELECT)) {
      return;
    }

    if (a00or11) {
      a00 += bit_tribool(key_hit(-1), KI_DOWN, KI_UP);
    } else {
      a11 += bit_tribool(key_hit(-1), KI_DOWN, KI_UP);
    }

    square(a00, a01, a10, a11, -16);

    for (int y = 120; y < 130; y++) {
      for (int x = 50; x < 60; x++) {
        vid_mem[y * 240 + x] = a00or11 ? CLR_GREEN : CLR_RED;
      }
    }

    for (int y = 120; y < 130; y++) {
      for (int x = 70; x < 80; x++) {
        vid_mem[y * 240 + x] = !a00or11 ? CLR_GREEN : CLR_RED;
      }
    }
  }
}

void rotate() {
  int a00 = lu_cos(0), a01 = lu_sin(0);
  int a10 = -a01, a11 = a00;

  int angle = 0;

  while (!key_hit(KEY_SELECT)) {
    vid_vsync();
    key_poll();

    int deltaAngle = bit_tribool(key_held(-1), KI_RIGHT, KI_LEFT);
    if (deltaAngle != 0) {
      angle = keep_angle_in_range(angle + deltaAngle);
      int lib_angle = angle * 182;

      a00 = lu_cos(lib_angle);
      a01 = lu_sin(lib_angle);
      a10 = -a01;
      a11 = a00;

      m3_fill(CLR_BLACK);
    }

    int size = 64;
    int base = -size / 2;
    for (int y = 0 + base; y < size + base; y++) {
      for (int x = 0 + base; x < size + base; x++) {
        int new_x = apply_x(x, y, a00, a01) >> 12;
        int new_y = apply_y(x, y, a10, a11) >> 12;

        m3_plot(new_x + 50, new_y + 50, color(x, y, base));
      }
    }
  }
}

int main() {
  REG_DISPCNT = DCNT_MODE3 | DCNT_BG2;
  REG_KEYCNT = KCNT_IRQ | KCNT_OR;

  // shear();
  // reflection();
  rotate();

  return 0;
}
