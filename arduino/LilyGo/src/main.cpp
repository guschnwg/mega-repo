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
#include <WebServer.h>
#include <touch.h>

#include "firasans.h"
#include "epd_driver.h"

TouchClass touch;
const char *ssid = "CAZINHA2G";
const char *password = "Will2020Mu*";
uint8_t *framebuffer = NULL;
Rect_t area = epd_full_screen();
WebServer server(80);

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


size_t position = 0;
void handle_upload()
{
  HTTPUpload &upload = server.upload();
  if (upload.status == UPLOAD_FILE_START)
  {
    position = 0;
  }
  else if (upload.status == UPLOAD_FILE_WRITE)
  {
    // Out upload will come as an file with hex values
    char str[2];
    for (size_t i = 0; i < upload.currentSize; i+=2) {
      memcpy(str, &upload.buf[i], 2);
      str[2] = '\0';
      int y = position / EPD_WIDTH;
      int x = position % EPD_WIDTH;
      int color = (int)strtol(str, NULL, 16);
      epd_draw_pixel(x, y, color, framebuffer);
      position++;
    }
  }
  else if (upload.status == UPLOAD_FILE_END)
  {
    epd_clear();
    epd_draw_grayscale_image(epd_full_screen(), framebuffer);
    Serial.print("Upload: END, Size: ");
    Serial.println(position);
  }
}

void ok() {
  server.send(200, "text/plain", "OK");
}

void draw() {
  epd_draw_grayscale_image(epd_full_screen(), framebuffer);
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
  server.on("/", HTTP_POST, ok, handle_upload);
  server.on("/draw", HTTP_GET, ok, draw);
  server.begin();

  epd_clear();
  int cursor_x = 100;
  int cursor_y = 100;
  writeln((GFXfont *)&FiraSans, "HIII", &cursor_x, &cursor_y, framebuffer);
  epd_draw_grayscale_image(epd_full_screen(), framebuffer);
}

void loop()
{
  uint16_t x, y;
  if (digitalRead(TOUCH_INT) && touch.scanPoint())
  {
    touch.getPoint(x, y, 0);
    y = EPD_HEIGHT - y;
    epd_draw_rect(x, y, 10, 10, 0, framebuffer);
    draw();
  }

  server.handleClient();

  delay(10);
}