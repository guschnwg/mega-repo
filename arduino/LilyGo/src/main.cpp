// Connect the board via the USB cable
// Press and hold the BOOT(IO0) button , While still pressing the BOOT(IO0) button, press RST
// Release the RST
// Release the BOOT(IO0) button
// Upload sketch

#ifndef BOARD_HAS_PSRAM
#error "Please enable PSRAM, Arduino IDE -> tools -> PSRAM -> OPI !!!"
#endif

#include <Arduino.h>
#include <ESPmDNS.h>
#include <Wire.h>
#include <WiFi.h>
#include <touch.h>

#include "firasans.h"
#include "epd_driver.h"

TouchClass touch;
const char *ssid = "CAZINHA2G";
const char *password = "Will2020Mu*";
uint8_t *framebuffer = NULL;
Rect_t area = epd_full_screen();
WiFiServer server(80);

void full_clear_screen()
{
  int32_t i = 0;

  for (i = 0; i < 20; i++)
  {
    epd_push_pixels(area, 50, 0);
    delay(500);
  }
  epd_clear();
  for (i = 0; i < 40; i++)
  {
    epd_push_pixels(area, 50, 1);
    delay(500);
  }
  epd_clear();
}

void setup()
{
  Serial.begin(115200);

  framebuffer = (uint8_t *)ps_calloc(sizeof(uint8_t), EPD_WIDTH * EPD_HEIGHT / 2);
  memset(framebuffer, 0xFF, EPD_WIDTH * EPD_HEIGHT / 2);

  epd_init();
  epd_poweron();
  delay(10);
  epd_clear();

  // full_clear_screen();

  pinMode(TOUCH_INT, INPUT_PULLUP);
  Wire.begin(BOARD_SDA, BOARD_SCL);
  touch.begin();

  WiFi.begin(ssid, password);
  int tries = 10;
  while (WiFi.status() != WL_CONNECTED && tries > 0)
  {
    delay(500);
    tries -= 1;
  }
  if (MDNS.begin("lilygo"))
  {
    MDNS.addService("http", "tcp", 80);
  }
  server.begin();

  epd_clear();
  int cursor_x = 100;
  int cursor_y = 100;
  writeln((GFXfont *)&FiraSans, "HIII", &cursor_x, &cursor_y, framebuffer);
  epd_draw_grayscale_image(epd_full_screen(), framebuffer);
}

bool read_server()
{
  WiFiClient client = server.available();
  if (!client)
    return false;
  while (client.connected() && !client.available()) delay(1);

  int start_y = 0;
  String req = client.readStringUntil('\r');
  int addr_start = req.indexOf(' ');
  int addr_end = req.indexOf(' ', addr_start + 1);
  if (addr_start == -1 || addr_end == -1) {
    start_y = 0;
  } else {
    start_y = req.substring(addr_start + 2, addr_end).toInt();
  }

  String dataString = client.readString();

  int pixelIndex = EPD_WIDTH * start_y;
  char *token = strtok((char *)dataString.c_str(), ",");
  while (token != NULL && pixelIndex < EPD_HEIGHT * EPD_WIDTH) {
    int y = pixelIndex / EPD_WIDTH;
    int x = pixelIndex % EPD_WIDTH;
    int color = (uint8_t)atoi(token);
    epd_draw_pixel(x, y, color, framebuffer);

    token = strtok(NULL, ",");
    pixelIndex++;
  }

  client.print(":)");
  client.stop();

  return true;
}

void loop()
{
  uint16_t x, y;
  if (digitalRead(TOUCH_INT) && touch.scanPoint())
  {
    touch.getPoint(x, y, 0);
    y = EPD_HEIGHT - y;
    epd_draw_rect(x, y, 10, 10, 0, framebuffer);
    epd_draw_grayscale_image(epd_full_screen(), framebuffer);
  }

  if (read_server())
  {
    epd_clear();
    epd_draw_grayscale_image(epd_full_screen(), framebuffer);
  }

  delay(10);
}