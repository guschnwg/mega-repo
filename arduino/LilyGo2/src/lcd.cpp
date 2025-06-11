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
  display.setTextSize(3);
  int len = message.length();
  if (len > 7 && position > 6) {
    // len  8 position 7 -> 1   A|BCDEFG(H)
    // len  9 position 8 -> 2  AB|CDEFGH(I)
    // len  9 position 7 -> 1   A|BCDEFG(H)I
    // len 10 position 7 -> 1   A|BCDEFG(H)IJ
    // len 10 position 8 -> 2  AB|CDEFGH(I)J
    // len 11 position 9 -> 3 ABC|DEFGHI(J)
    int xPad = position - 6;
    display.setCursor(-18 * xPad, 0);
  } else {
    display.setCursor(0, 0);
  }
  display.print(message);

  //

  int x = 18 * (position >= 7 ? 6 : position);
  int y = display.getCursorY() + 22;

  if (inverse) {
    display.fillRect(x, y, 15, 1, SSD1306_BLACK);
  } else {
    display.fillRect(x, y, 15, 1, SSD1306_WHITE);
  }
}

void lcd_write_hint(String message) {
  display.setTextColor(SSD1306_WHITE);
  display.setTextWrap(false);
  display.setTextSize(1);
  display.setCursor(0, 24);
  display.println(message);
}

void lcd_display() { display.display(); }