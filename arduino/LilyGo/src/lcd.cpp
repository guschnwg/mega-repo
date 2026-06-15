#include <Adafruit_SSD1306.h>
#include <Wire.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 32
#define OLED_RESET -1 // Not used

#define SDA_PIN 18
#define SCL_PIN 17

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

bool lcd_init() {
  Wire.begin(SDA_PIN, SCL_PIN);
  return display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
}

void lcd_clear() { display.clearDisplay(); }

void lcd_write(String message, int position, bool inverse) {
  display.setTextColor(SSD1306_WHITE);
  display.setTextWrap(false);
  display.setTextSize(1); // 6px per char at size 1
  int len = message.length();
  if (len > 21 && position > 20) {
    int xPad = position - 20;
    display.setCursor(-6 * xPad, 0);
  } else {
    display.setCursor(0, 0);
  }
  display.print(message);
}

void lcd_write_hint(String message) {
  display.setTextColor(SSD1306_WHITE);
  display.setTextWrap(false);
  display.setTextSize(1);
  display.setCursor(0, 24);
  display.println(message);
}

void lcd_display() { display.display(); }