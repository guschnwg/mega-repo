#ifndef BOARD_HAS_PSRAM
#error "Please enable PSRAM !!!"
#endif

#define BUTTON_1 (21)

#define BATT_PIN (14)

#define SD_MISO (16)
#define SD_MOSI (15)
#define SD_SCLK (11)
#define SD_CS (42)

#define TOUCH_SCL (17)
#define TOUCH_SDA (18)
#define TOUCH_INT (47)

#define GPIO_MISO (45)
#define GPIO_MOSI (10)
#define GPIO_SCLK (48)
#define GPIO_CS (39)

#include <Arduino.h>
#include <esp_task_wdt.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "epd_driver.h"
#include "firasans.h"
#include <Wire.h>
#include <touch.h>
#include "pcf8563.h"
#include "time.h"

#include <WiFi.h>
#include <ESPmDNS.h>
#include <WiFiClient.h>

#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

const char *ssid = "Cazinha2G";
const char *password = "Will2020Mu";

#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

WiFiServer server(80);

TouchClass touch;

uint8_t *framebuffer = NULL;

int cursor_x = 20;
int cursor_y = 60;

int initial_server_cursor_y = 210;
int server_cursor_y = initial_server_cursor_y;

int vref = 1100;

PCF8563_Class rtc;


void print_message(const char* message) {
  if (server_cursor_y > EPD_HEIGHT) {
    server_cursor_y = initial_server_cursor_y;
    Rect_t serverReceivedArea = { .x = 10, .y = initial_server_cursor_y - 33, .width = EPD_WIDTH - 20, .height = EPD_HEIGHT - initial_server_cursor_y + 33 - 10 };
    epd_clear_area(serverReceivedArea);
  }
  cursor_x = 20; write_string((GFXfont *)&FiraSans, message, &cursor_x, &server_cursor_y, NULL);
}

// Callback for BLE
class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      // Do something when a client connects.
    }

    void onDisconnect(BLEServer* pServer) {
      // Do something when a client disconnects.
    }
};

class MyCharacteristicCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      String message = "BLE: ";
      String value = pCharacteristic->getValue().c_str();
      message += value;
      print_message(message.c_str());
    }
};

struct Button {
  int32_t start_x;
  int32_t start_y;
  int32_t end_x;
  int32_t end_y;

  char* to;
} typedef Button;

Button buttons[10] = {};
uint8_t buttons_count = 0;


void empty_buttons() {
  buttons_count = 0;
  memset(buttons, 0, sizeof(buttons));
}

void button(const char* label, const char* to, int32_t x, int32_t y, int32_t w, int32_t h) {
  epd_draw_rect(x, y, w, h, 0, framebuffer);
  cursor_x = x + 10;
  cursor_y = (y + y + h) / 2 + FiraSans.ascender / 2;
  write_string(&FiraSans, label, &cursor_x, &cursor_y, framebuffer);
  buttons[buttons_count] = Button{ .start_x = x, .start_y = y, .end_x = x + w, .end_y = y + h, .to = (char *)to };
  buttons_count++;
}

void clear__content() {
  epd_clear_area_cycles(epd_full_screen(), 1, 50);
  memset(framebuffer, 0xFF, EPD_WIDTH * EPD_HEIGHT / 2);
}

void display__content() {
  epd_draw_grayscale_image(epd_full_screen(), framebuffer);
}

void display__menu() {
  empty_buttons();

  clear__content();

  button("Menu", "menu", 10, 10, 300, 60);
  button("Bluetooth", "bluetooth", 10, 80, 300, 60);
  button("Wi-Fi", "wifi", 10, 150, 300, 60);
  button("Touch", "touch", 10, 220, 300, 60);

  uint16_t v = analogRead(BATT_PIN);
  float battery_voltage = ((float)v / 4095.0) * 2.0 * 3.3 * (vref / 1000.0);
  String voltage = "➸ Voltage: " + String(battery_voltage) + "V";
  voltage = voltage + String(" (") + rtc.formatDateTime(PCF_TIMEFORMAT_YYYY_MM_DD_H_M_S) + String(")");
  Serial.println(voltage);
  cursor_x = 20; cursor_y = 480; write_string(&FiraSans, voltage.c_str(), &cursor_x, &cursor_y, framebuffer);

  display__content();
}

void setup() {
  Serial.begin(115200);

  epd_init();
  epd_poweron();

  pinMode(TOUCH_INT, INPUT_PULLUP);
  Wire.begin(TOUCH_SDA, TOUCH_SCL);
  touch.begin();

  framebuffer = (uint8_t *)ps_calloc(sizeof(uint8_t), EPD_WIDTH * EPD_HEIGHT / 2);
  memset(framebuffer, 0xFF, EPD_WIDTH * EPD_HEIGHT / 2);

  epd_clear();
  write_string(&FiraSans, "Screen loaded.", &cursor_x, &cursor_y, NULL);

  cursor_x = 20; cursor_y = 110; write_string(&FiraSans, "WIFI: ", &cursor_x, &cursor_y, NULL);
  Rect_t wifiLoadArea = { .x = cursor_x - 5, .y = 70, .width = EPD_WIDTH - 120, .height =  50 };

  WiFi.begin(ssid, password);
  int tries = 10;
  while (WiFi.status() != WL_CONNECTED && tries > 0) {
    cursor_y = 110; write_string(&FiraSans, ".", &cursor_x, &cursor_y, NULL);
    delay(500);
    tries -= 1;
    Serial.println(tries);
  }
  server.begin();

  epd_clear_area_cycles(wifiLoadArea, 1, 50);
  if (WiFi.status() != WL_CONNECTED) {
    cursor_x = 120; cursor_y = 110; write_string(&FiraSans, "Gave up :(", &cursor_x, &cursor_y, NULL);
  } else {
    cursor_x = 120; cursor_y = 110; write_string(&FiraSans, WiFi.localIP().toString().c_str(), &cursor_x, &cursor_y, NULL);
  }

  rtc.begin();

  BLEDevice::init("Giovanna e-Paper");
  BLEServer *pServer = BLEDevice::createServer();
  BLEService *pService = pServer->createService(SERVICE_UUID);
  BLECharacteristic *pCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE
  );

  pCharacteristic->setValue("Hello World says Neil");
  pCharacteristic->setCallbacks(new MyCharacteristicCallbacks());
  pService->start();
  // BLEAdvertising *pAdvertising = pServer->getAdvertising();  // this still is working for backward compatibility
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06); // functions that help with iPhone connections issue
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();

  display__menu();
}


void read_and_print_server() {
  // Check if a client has connected
  WiFiClient client = server.available();
  if (!client) {
    return;
  }

  // Wait for data from client to become available
  while (client.connected() && !client.available()) {
    delay(1);
  }

  // Read the first line of HTTP request
  String req = client.readStringUntil('\r');

  // First line of HTTP request looks like "GET /path HTTP/1.1"
  // Retrieve the "/path" part by finding the spaces
  int addr_start = req.indexOf(' ');
  int addr_end = req.indexOf(' ', addr_start + 1);
  if (addr_start == -1 || addr_end == -1) {
    return;
  }
  req = req.substring(addr_start + 1, addr_end);

  String message = "Server: " + req;
  print_message(message.c_str());

  client.print(":)");

  client.stop();
}

//

unsigned long last_refresh_millis = -1;
void display__wifi__refresh_time(uint8_t *framebuffer) {
  // Refresh every 2 seconds
  if (millis() - last_refresh_millis < 2000) {
    return;
  }

  if (framebuffer == NULL) {
    Rect_t area = { .x = 0, .y = 110 - FiraSans.ascender, .width = EPD_WIDTH, .height = FiraSans.ascender };
    epd_clear_area_cycles(area, 1, 50);
  }

  RTC_Date date = rtc.getDateTime();
  String date_string = String(date.year) + String("/") + String(date.month) + String("/") + String(date.day);
  String time_string = String(date.hour) + String(":") + String(date.minute) + String(":") + String(date.second);
  String to_print = "Date: " + date_string + " " + time_string;
  cursor_x = 10; cursor_y = 110; write_string(&FiraSans, to_print.c_str(), &cursor_x, &cursor_y, framebuffer);

  last_refresh_millis = millis();
}


void display__wifi() {
  empty_buttons();

  clear__content();

  cursor_x = 10; cursor_y = 60; write_string(&FiraSans, "WI-FI", &cursor_x, &cursor_y, framebuffer);

  display__wifi__refresh_time(framebuffer);

  button("Set time", "set_time", 10, 200, 300, 60);
  button("Reset time", "reset_time", 10, 270, 300, 60);
  button("Refresh", "refresh", 10, 340, 300, 60);
  button("Back", "menu", 10, 410, 300, 60);

  display__content();
}

//


void display__bluetooth() {
  empty_buttons();

  clear__content();

  cursor_x = 10; cursor_y = 60; write_string(&FiraSans, "Bluetooth", &cursor_x, &cursor_y, framebuffer);

  button("Back", "menu", 10, 120, 300, 60);

  display__content();
}


void display__touch() {
  empty_buttons();
  clear__content();

  cursor_x = 10; cursor_y = 60; write_string(&FiraSans, "Touch", &cursor_x, &cursor_y, framebuffer);

  button("Back", "menu", 10, 120, 300, 60);

  display__content();
}


const char* current_screen = "menu";
void display(char* to) {
  if (strcmp(to, "refresh") == 0) {
    to = (char *)current_screen;
  }

  if (strcmp(to, "menu") == 0) {
    current_screen = "menu";
    display__menu();
  } else if (strcmp(to, "bluetooth") == 0) {
    current_screen = "bluetooth";
    display__bluetooth();
  } else if (strcmp(to, "wifi") == 0) {
    current_screen = "wifi";
    display__wifi();
  } else if (strcmp(to, "touch") == 0) {
    current_screen = "touch";
    display__touch();
  } else if (strcmp(to, "set_time") == 0) {
    current_screen = "wifi";
    configTime(0, 0, "pool.ntp.org");
    rtc.syncToRtc();
    display__wifi();
  } else if (strcmp(to, "reset_time") == 0) {
    current_screen = "wifi";
    rtc.setDateTime(2020, 1, 1, 0, 0, 0);
    rtc.syncToSystem();
    display__wifi();
  }
}


void navigate(uint16_t x, uint16_t y) {
  if (x == 0 || y == 0) {
    return;
  }

  for (int i = 0; i < 10; i++) {
    Button button = buttons[i];
    if (button.start_x <= x && x <= button.end_x && button.start_y <= y && y <= button.end_y) {
      display(button.to);
      return;
    }
  }
}


void loop() {
  uint16_t x, y;
  // Read touch and find which button was pressed
  if (digitalRead(TOUCH_INT) && touch.scanPoint()) {
    touch.getPoint(x, y, 0);
    y = EPD_HEIGHT - y;
  } else {
    x = 0;
    y = 0;
  }

  if (strcmp(current_screen, "touch") == 0) {
    // loop__touch(x, y);
  } else if (strcmp(current_screen, "bluetooth") == 0) {
    read_and_print_server();
  } else if (strcmp(current_screen, "wifi") == 0) {
    read_and_print_server();
    display__wifi__refresh_time(NULL);
  }

  navigate(x, y);

  delay(10);
}