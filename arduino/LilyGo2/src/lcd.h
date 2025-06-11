#ifndef LED_H
#define LED_H

#include <Arduino.h>

bool lcd_init();
void lcd_clear();
void lcd_write(String message, int position, bool inverse);
void lcd_write_hint(String message);
void lcd_display();

#endif