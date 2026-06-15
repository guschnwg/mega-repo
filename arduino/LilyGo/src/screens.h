#ifndef SCREENS_H
#define SCREENS_H

#include <Arduino.h>
#include <pcf8563.h>
#include "epd_driver.h"
#include "firasans.h"

// ── Screen enum ───────────────────────────────────────────────────────────────
enum Screen { MAIN, WIFI_DETAIL, BT_DETAIL };

// ── Globals ───────────────────────────────────────────────────────────────────
extern uint8_t    *framebuffer;
extern GFXfont    *font;
extern bool        first_draw;
extern Screen      current_screen;
extern PCF8563_Class rtc;

// ── Functions ─────────────────────────────────────────────────────────────────
void fb_clear();
void fb_flush(bool hard_clear = false);
void draw_text(const char *s, int x, int y);
void draw_text_str(String s, int x, int y);
void draw_button(int x, int y, int w, int h, const char *label);
void draw_header();
void draw_main_screen();
void draw_wifi_detail();
void draw_bt_detail();
void navigate(Screen s);

#endif // SCREENS_H
