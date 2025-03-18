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
#include <esp_adc_cal.h>

#include "firasans.h"
#include "epd_driver.h"
#include <Button2.h>

#define MIN_VOLTAGE 280
#define MAX_VOLTAGE 420


Button2 btn(BUTTON_1);
TouchClass touch;
const char *ssid = "CAZINHA2G";
const char *password = "Will2020Mu*";
uint8_t *framebuffer = NULL;
Rect_t area = epd_full_screen();
WebServer server(80);
int vref = 1100;
int battery_voltage = -100;
int battery_percentage = -100;

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
    for (size_t i = 0; i < upload.currentSize; i += 2)
    {
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

void ok()
{
  server.send(200, "text/plain", "OK");
}

float read_battery_voltage()
{
  uint16_t v = analogRead(BATT_PIN);
  int voltage = (((float)v / 4095.0) * 2.0 * 3.3 * (vref / 1000.0)) * 100;
  if (voltage >= MAX_VOLTAGE)
  {
    voltage = MAX_VOLTAGE;
  }
  return voltage;
}

int read_battery_percentage() {
  int new_battery_voltage = read_battery_voltage();
  if (abs(new_battery_voltage - battery_voltage) >= 1) {
    battery_voltage = new_battery_voltage;
    return map(battery_voltage, MIN_VOLTAGE, MAX_VOLTAGE, 0, 20);
  }
  return battery_percentage;
}

void setup_battery_voltage()
{
  esp_adc_cal_characteristics_t adc_chars;
  esp_adc_cal_value_t val_type = esp_adc_cal_characterize(
      ADC_UNIT_2,
      ADC_ATTEN_DB_12,
      ADC_WIDTH_BIT_12,
      1100,
      &adc_chars);

  if (val_type == ESP_ADC_CAL_VAL_EFUSE_VREF)
  {
    Serial.printf("eFuse Vref: %umV\r\n", adc_chars.vref);
    vref = adc_chars.vref;
  }

  delay(10);

  battery_percentage = read_battery_percentage();
}

void button_pressed(Button2 &b)
{
  epd_clear();
}

void write_battery_percentage()
{
  int cursor_x = 300;
  int cursor_y = 50;
  String percentage = "Battery: " + String(battery_percentage * 5) + "%";
  writeln((GFXfont *)&FiraSans, (char *)percentage.c_str(), &cursor_x, &cursor_y, framebuffer);
}

void draw()
{
  epd_draw_grayscale_image(epd_full_screen(), framebuffer);
}

void handle_touch()
{
  uint16_t x, y;
  touch.getPoint(x, y, 0);
  y = EPD_HEIGHT - y;
  epd_draw_rect(x, y, 10, 10, 0, framebuffer);
  draw();
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

  setup_battery_voltage();

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
  
  write_battery_percentage();

  btn.setPressedHandler(button_pressed);

  if (battery_percentage < 10) {
    Serial.println("Turn it off, lowest battery");
    epd_poweroff_all();
  }
  
  draw();
}

void loop()
{
  if (digitalRead(TOUCH_INT) && touch.scanPoint())
  {
    handle_touch();
  }

  int new_battery_percentage = read_battery_percentage();
  if (abs(new_battery_percentage - battery_percentage) > 0)
  {
    Serial.printf("OLD %d, NEW %d\n", battery_percentage, new_battery_percentage);
    battery_percentage = new_battery_percentage;
    write_battery_percentage();
    epd_clear();
    draw();
  }

  server.handleClient();

  delay(10);
}