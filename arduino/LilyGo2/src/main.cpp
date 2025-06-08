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

#include "epaper.h"
#include "hal/gpio_types.h"
#include "lcd.h"
#include <Arduino.h>

void setup() {
  Serial.begin(115200);

  sleep(5);

  Serial.println("EPAPER INIT");
  init_epaper();
  Serial.println("LCD INIT");
  if (!init_lcd()) {
    while (true) {
      Serial.println("SSD1306 allocation failed");
    }
  }

  pinMode(GPIO_NUM_10, INPUT);
  Serial.println("DONE Setup");
}

void loop() {
  Serial.println("LCD DRAW");
  int value = analogRead(GPIO_NUM_10);
  Serial.println(value);
  draw_lcd(value);
  sleep(1);
}
