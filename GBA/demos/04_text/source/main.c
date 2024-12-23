// make GAME=demos/04_text run

#include <tonc.h>

int main() {
  REG_DISPCNT = DCNT_MODE0 | DCNT_BG0 | DCNT_OBJ;

  txt_init_std();

  txt_init_se(0, BG_CBB(0) | BG_SBB(31), 0, CLR_WHITE, 0x0E);

  int palette = 0x1000;
  int font = 96;
  txt_init_se(0, BG_CBB(0) | BG_SBB(31), palette | font,
              CLR_YELLOW | (CLR_MAG << 16), 0x8E);

  int other_palette = 0x2000;
  int other_font = 192;
  txt_init_se(0, BG_CBB(0) | BG_SBB(31), other_palette | other_font,
              CLR_YELLOW | (CLR_MAG << 16), 0x1E);
  // Change 0 to 1, because 0 is transparent
  for (int i = 0; i < 8 * 96; i++) {
    ((int *)tile_mem[0])[192 * 8 + i] |= 0x11111111;
  }

  while (1) {
    vid_vsync();

    se_puts(10, 110, "first", 0);
    se_puts(10, 120, "second", palette | font);
    se_puts(10, 130, "third", other_palette | other_font);
  }
  return 0;
}
