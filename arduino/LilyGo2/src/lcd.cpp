#include <Adafruit_SSD1306.h>
#include <Wire.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 32
#define OLED_RESET -1 // Not used

#define SDA_PIN 18
#define SCL_PIN 17

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

bool init_lcd() {
  Wire.begin(SDA_PIN, SCL_PIN);

  return display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
}

void draw_lcd(int value) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("OLED on 18/17");
  display.println(value);
  display.display();
}