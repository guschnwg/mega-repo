// Connect the board via the USB cable
// Press and hold the BOOT(IO0) button
// While still pressing the BOOT(IO0) button, press RST
// Release the RST
// Release the BOOT(IO0) button
// Upload sketch

// VSCodium
// https://marketplace.visualstudio.com/_apis/public/gallery/publishers/platformio/vsextensions/platformio-ide/3.3.4/vspackage
// https://marketplace.visualstudio.com/_apis/public/gallery/publishers/ms-vscode/vsextensions/cpptools/1.24.3/vspackage
//
// Zed
// make setup

#include "button.h"
#include "epaper.h"
#include "esp32-hal.h"
#include "hal/gpio_types.h"
#include "lcd.h"
#include <Arduino.h>
#include <cstdint>

String wholeMessage = "";
String input = "123IA";
String alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
int charIdx = 0;
int position = 4;
unsigned long previousMillis = 0;
const long blinkInterval = 500;
bool blink = true;

int mod(int a, int b) {
  int r = a % b;
  return r < 0 ? r + b : r;
}

void onClick(uint8_t pin) {
  if (pin == 1 || pin == 2) {
    if (pin == 1) {
      charIdx--;
    } else if (pin == 2) {
      charIdx++;
    }
    charIdx = mod(charIdx, 36);
    input[position] = alphabet[charIdx];
  } else if (pin == 0 || pin == 3) {
    if (pin == 0) {
      position--;
    } else if (pin == 3) {
      position++;
    }
    if (position >= input.length()) {
      input.concat("A");
      charIdx = 0;
    }
    position = mod(position, input.length());
    charIdx = alphabet.indexOf(input[position]);
  } else if (pin == 4) {
    wholeMessage.concat(input);
    wholeMessage.concat(" ");
    input = "A";
    charIdx = 0;
    position = 0;
    epd_write_message(wholeMessage);
  }
}

void setup() {
  Serial.begin(115200);

  sleep(5);

  Serial.println("EPAPER INIT");
  init_epaper();
  Serial.println("LCD INIT");
  if (!lcd_init()) {
    while (true) {
      Serial.println("SSD1306 allocation failed");
    }
  }

  init_button(GPIO_NUM_10, onClick);
  Serial.println("DONE Setup");
}

void loop() {
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= blinkInterval) {
    previousMillis = currentMillis;
    blink = !blink;
  }

  check_buttons();

  lcd_clear();
  lcd_write(input, position, blink);
  lcd_write_hint(input);
  lcd_display();

  delayMicroseconds(5);
}
