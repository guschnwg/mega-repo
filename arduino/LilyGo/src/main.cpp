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
// make init-vim

#ifndef BOARD_HAS_PSRAM
#error "Please enable PSRAM, Arduino IDE -> tools -> PSRAM -> OPI !!!"
#endif

#include <Arduino.h>
#include <ESPmDNS.h>
#include <WebServer.h>
#include <WiFi.h>
#include <Wire.h>
#include <esp_adc_cal.h>
#include <touch.h>

#include "epd_driver.h"
#include "firasans.h"
#include <Button2.h>

#define MIN_VOLTAGE 280
#define MAX_VOLTAGE 420
#define VOLTAGE_VARIATION 10

Button2 btn(BUTTON_1);
TouchClass touch;
const char *ssid = "CAZINHA2G";
const char *password = "Will2020Mu*";
uint8_t *framebuffer = NULL;
Rect_t area = epd_full_screen();
WebServer server(80);
GFXfont *font = (GFXfont *)&FiraSans;

///

void draw() {
  epd_clear();
  epd_draw_grayscale_image(epd_full_screen(), framebuffer);
}

///

int battery_voltage = -100;
int vref = 1100; // Don't know why it's 1100
void setup_battery_voltage() {
  esp_adc_cal_characteristics_t adc_chars;
  esp_adc_cal_value_t val_type = esp_adc_cal_characterize(
      ADC_UNIT_2, ADC_ATTEN_DB_12, ADC_WIDTH_BIT_12, 1100, &adc_chars);

  if (val_type == ESP_ADC_CAL_VAL_EFUSE_VREF) {
    Serial.printf("eFuse Vref: %umV\r\n", adc_chars.vref);
    vref = adc_chars.vref;
  }

  delay(10);
}

void write_battery_voltage() {
  int cursor_x = 300;
  int cursor_y = 50;

  String percentage = "Battery: " + String(battery_voltage) + "V";
  writeln(font, (char *)percentage.c_str(), &cursor_x, &cursor_y, framebuffer);
}

int read_battery_voltage() {
  uint16_t v = analogRead(BATT_PIN);
  int current_voltage =
      (((float)v / 4095.0) * 2.0 * 3.3 * (vref / 1000.0)) * 100;

  if (current_voltage >= MAX_VOLTAGE)
    current_voltage = MAX_VOLTAGE;

  return current_voltage;
}

bool update_battery_voltage(bool force) {
  int current_voltage = read_battery_voltage();

  if (force || abs(current_voltage - battery_voltage) > VOLTAGE_VARIATION) {
    battery_voltage = current_voltage;
    write_battery_voltage();
    return true;
  }

  return false;
}

///

void full_clear_screen() {
  int32_t i = 0;

  for (i = 0; i < 20; i++) {
    epd_push_pixels(area, 50, 0);
    delay(500);
  }
  epd_clear();
  for (i = 0; i < 40; i++) {
    epd_push_pixels(area, 50, 1);
    delay(500);
  }
  epd_clear();
}

///

void handle_upload() {
  static size_t position = 0;

  HTTPUpload &upload = server.upload();
  if (upload.status == UPLOAD_FILE_START) {
    position = 0;
  } else if (upload.status == UPLOAD_FILE_WRITE) {
    // Out upload will come as an file with hex values
    char str[2];
    for (size_t i = 0; i < upload.currentSize; i += 2) {
      memcpy(str, &upload.buf[i], 2);
      str[2] = '\0';
      int y = position / EPD_WIDTH;
      int x = position % EPD_WIDTH;
      int color = (int)strtol(str, NULL, 16);
      epd_draw_pixel(x, y, color, framebuffer);
      position++;
    }
  } else if (upload.status == UPLOAD_FILE_END) {
    epd_clear();
    epd_draw_grayscale_image(epd_full_screen(), framebuffer);
    Serial.print("Upload: END, Size: ");
    Serial.println(position);
  }
}

void handle_battery() {
  int current_voltage = read_battery_voltage();
  server.send(200, "text/plain",
              String(current_voltage) + "|" + String(battery_voltage));
}

void ok() { server.send(200, "text/plain", "OK"); }

void setup_wifi() {
  WiFi.begin(ssid, password);
  int tries = 10;
  while (WiFi.status() != WL_CONNECTED && tries > 0) {
    delay(500);
    tries -= 1;
  }
  if (MDNS.begin("lilygo")) {
    MDNS.addService("http", "tcp", 80);
  }
  server.on("/", HTTP_POST, ok, handle_upload);
  server.on("/draw", HTTP_GET, ok, draw);
  server.on("/battery", HTTP_GET, handle_battery);
  server.begin();
}

///

void button_pressed(Button2 &b) {
  epd_clear();
  update_battery_voltage(true);
  draw();
}

void handle_touch() {
  uint16_t x, y;
  touch.getPoint(x, y, 0);
  y = EPD_HEIGHT - y;
  epd_draw_rect(x, y, 10, 10, 0, framebuffer);
  draw();
}

///

void setup() {
  Serial.begin(115200);

  setup_battery_voltage();
  update_battery_voltage(false);
  if (battery_voltage < (MIN_VOLTAGE + 0.2)) {
    Serial.println("Turn it off, lowest battery");
    epd_poweroff_all();
  }

  framebuffer =
      (uint8_t *)ps_calloc(sizeof(uint8_t), EPD_WIDTH * EPD_HEIGHT / 2);
  memset(framebuffer, 0xFF, EPD_WIDTH * EPD_HEIGHT / 2);

  epd_init();
  epd_poweron();
  delay(10);
  epd_clear();

  pinMode(TOUCH_INT, INPUT_PULLUP);
  Wire.begin(BOARD_SDA, BOARD_SCL);
  touch.begin();

  btn.setPressedHandler(button_pressed);

  draw();
}

void loop() {
  if (digitalRead(TOUCH_INT) && touch.scanPoint()) {
    handle_touch();
  }

  if (update_battery_voltage(false)) {
    draw();
  }

  server.handleClient();

  delay(10);
}
