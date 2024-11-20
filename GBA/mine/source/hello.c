//
//! \file hello_demo.c
//!   Screen-entry text demo
//! \date 20060228 - 20080416
//! \author cearn
//
// === NOTES ===

#include "tonc_tte.h"
#include <stdio.h>

#include <tonc.h>

int main() {
  REG_DISPCNT = DCNT_MODE3 | DCNT_BG2;

  tte_init_bmp_default(3);

  int i = 10;
  int increment = 1;
  char move[11];

  while (1) {
    vid_vsync();

    m3_fill(CLR_BLACK);

    m3_plot(120, i, RGB15(31, 0, 0)); // or CLR_RED
    m3_plot(136, i, RGB15(0, 31, 0)); // or CLR_LIME
    m3_plot(152, i, RGB15(0, 0, 31)); // or CLR_BLUE

    snprintf(move, sizeof(move), "#{P:%d,64}", i % 100);
    tte_write(move);
    tte_write("Hello World!");

    i += increment;
    if (i == 99 || i == 10)
      increment *= -1;
  }

  return 0;
}
