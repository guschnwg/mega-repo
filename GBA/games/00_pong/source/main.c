// make GAME=demos/_base run

#include <tonc.h>

int main() {
  REG_DISPCNT = DCNT_MODE0 | DCNT_BG0 | DCNT_OBJ;

  while (1) {
    vid_vsync();
  }

  return 0;
}
