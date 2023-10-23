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

#include <WiFi.h>
#include <ESPmDNS.h>
#include <WiFiClient.h>

#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

const char *ssid = "Cazinha";
const char *password = "W1ll2020!!";

#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

WiFiServer server(80);

TouchClass touch;
uint8_t *framebuffer = NULL;

int cursor_x = 20;
int cursor_y = 60;

int initial_server_cursor_y = 210;
int server_cursor_y = initial_server_cursor_y;


void draw_grid() {
  for (int i = 0; i < EPD_WIDTH; i += 10) {
    for (int j = 0; j < EPD_HEIGHT; j += 10) {
      int cursor_w = i;
      int cursor_h = j;
      write_string((GFXfont *)&FiraSans, ".", &cursor_w, &cursor_h, NULL);
    }
  }
}

void print_scale() {
  uint8_t width = 12;
  uint8_t columns = EPD_WIDTH / width;
  uint8_t height = 12;
  uint8_t lines = EPD_HEIGHT / height;

  uint8_t scale_step = 255 / (columns + lines);

  uint8_t* framebuffer = (uint8_t *)ps_calloc(sizeof(uint8_t), EPD_WIDTH * EPD_HEIGHT / 2);
  while (!framebuffer) {}
  memset(framebuffer, 0xFF, EPD_WIDTH * EPD_HEIGHT / 2);

  for (uint8_t i = 0; i < lines; i++) {
    for (uint8_t j = 0; j < columns; j++) {
      epd_fill_rect(width * j, height * i, width, height + 1, (i + j) * scale_step, framebuffer);
    }
  }
  epd_draw_grayscale_image(epd_full_screen(), framebuffer);
}

Rect_t coordinatesArea = { .x = 230, .y = 120, .width = 200, .height = 50 };
void print_location(int x, int y, bool only_coordinates) {
  if (only_coordinates) {
    epd_clear_area_cycles(coordinatesArea, 1, 50);
  }

  char str[200];
  if (only_coordinates) {
    sprintf(str, " %dx%d", x, y);
    cursor_x = coordinatesArea.x; cursor_y = 160; write_string((GFXfont *)&FiraSans, str, &cursor_x, &cursor_y, NULL);
  } else {
    sprintf(str, "Last touch: %dx%d", x, y);
    cursor_x = 20; cursor_y = 160; write_string((GFXfont *)&FiraSans, str, &cursor_x, &cursor_y, NULL);
  }
  coordinatesArea.width = cursor_x - coordinatesArea.x + 10;

  cursor_x = x; cursor_y = y; write_string((GFXfont *)&FiraSans, ".", &cursor_x, &cursor_y, NULL);
}

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

void setup() {
  Serial.begin(115200);

  epd_init();
  epd_poweron();

  pinMode(TOUCH_INT, INPUT_PULLUP);
  Wire.begin(TOUCH_SDA, TOUCH_SCL);
  if (!touch.begin()) {
    while (1) {}
  }

  framebuffer = (uint8_t *)ps_calloc(sizeof(uint8_t), EPD_WIDTH * EPD_HEIGHT / 2);
  if (!framebuffer) {
    while (1) {}
  }
  memset(framebuffer, 0xFF, EPD_WIDTH * EPD_HEIGHT / 2);

  epd_clear();
  write_string((GFXfont *)&FiraSans, "Screen loaded.", &cursor_x, &cursor_y, NULL);

  cursor_x = 20; cursor_y = 110; write_string((GFXfont *)&FiraSans, "WIFI: ", &cursor_x, &cursor_y, NULL);
  Rect_t wifiLoadArea = { .x = cursor_x - 5, .y = 70, .width = EPD_WIDTH - 120, .height =  50 };

  WiFi.begin(ssid, password);
  int tries = 10;
  while (WiFi.status() != WL_CONNECTED && tries > 0) {
    cursor_y = 110; write_string((GFXfont *)&FiraSans, ".", &cursor_x, &cursor_y, NULL);
    delay(500);
    tries -= 1;
    Serial.println(tries);
  }
  server.begin();

  epd_clear_area_cycles(wifiLoadArea, 1, 50);
  if (WiFi.status() != WL_CONNECTED) {
    cursor_x = 120; cursor_y = 110; write_string((GFXfont *)&FiraSans, "Gave up :(", &cursor_x, &cursor_y, NULL);
  } else {
    cursor_x = 120; cursor_y = 110; write_string((GFXfont *)&FiraSans, WiFi.localIP().toString().c_str(), &cursor_x, &cursor_y, NULL);
  }

  print_location(0, 0, false);

  // draw_grid();

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

  print_scale();
}


void read_and_print_touch() {
  if (!digitalRead(TOUCH_INT) || !touch.scanPoint()) {
    return;
  }

  uint16_t x, y;
  touch.getPoint(x, y, 0);
  y = EPD_HEIGHT - y;

  print_location(x, y, true);
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


void loop() {
  read_and_print_touch();
  read_and_print_server();

  delay(10);
}
