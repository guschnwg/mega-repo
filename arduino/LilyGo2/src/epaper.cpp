#include "firasans.h"
#include <Arduino.h>
#include <epd_driver.h>

uint8_t *framebuffer = NULL;
GFXfont *font = (GFXfont *)&FiraSans;
int cursor_x = 0;
int cursor_y = 30;

void init_epaper() {
  epd_init();
  epd_poweron();

  int frame_size = EPD_WIDTH * EPD_HEIGHT / 2;
  framebuffer = (uint8_t *)ps_calloc(sizeof(uint8_t), frame_size);
  memset(framebuffer, 0xFF, frame_size);
}

void epd_write_message(String message) {
  Serial.println(message);
  writeln(font, (char *)message.c_str(), &cursor_x, &cursor_y, framebuffer);
  epd_clear();
  epd_draw_grayscale_image(epd_full_screen(), framebuffer);
}
