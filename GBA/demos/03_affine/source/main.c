// make GAME=demos/_base run

#include <tonc.h>

int main() {
  REG_DISPCNT = DCNT_MODE3 | DCNT_BG2;
  tte_init_bmp_default(3);

  while (1) {
    vid_vsync();
    m3_fill(CLR_BLACK);
    tte_write("#{P:90,80}Hello World!");
  }
  return 0;
}
