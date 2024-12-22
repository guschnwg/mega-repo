// make GAME=demos/movement run

#include <tonc.h>

int main() {
  REG_DISPCNT = DCNT_MODE3 | DCNT_BG2;
  REG_KEYCNT = KCNT_IRQ | KCNT_OR;

  tte_init_bmp_default(3);

  int x = 0, y = 0;
  while (1) {
    vid_vsync();
    key_poll();

    m3_fill(CLR_BLACK);

    x += bit_tribool(key_held(-1), KI_RIGHT, KI_LEFT);
    y += bit_tribool(key_held(-1), KI_DOWN, KI_UP);

    tte_write_ex(x, y, "Hello World!", 0);
  }
  return 0;
}
