#include "screens.h"

#include <WiFi.h>
#include "battery.h"
#include "ble.h"
#include "wifi_manager.h"

// ── Definitions ───────────────────────────────────────────────────────────────
uint8_t      *framebuffer    = nullptr;
GFXfont      *font           = (GFXfont *)&FiraSans;
bool          first_draw     = true;
Screen        current_screen = MAIN;
PCF8563_Class rtc;

// ── Drawing helpers ───────────────────────────────────────────────────────────
void fb_clear() { memset(framebuffer, 0xFF, EPD_WIDTH * EPD_HEIGHT / 2); }

void fb_flush(bool hard_clear) {
    if (hard_clear)
        epd_clear();
    else
        epd_clear_area_cycles(epd_full_screen(), 1, 50);
    epd_draw_grayscale_image(epd_full_screen(), framebuffer);
}

void draw_text(const char *s, int x, int y) {
    writeln(font, s, &x, &y, framebuffer);
}

void draw_text_str(String s, int x, int y) {
    draw_text(s.c_str(), x, y);
}

void draw_button(int x, int y, int w, int h, const char *label) {
    epd_draw_rect(x, y, w, h, 0, framebuffer);
    int lx = x + (w - strlen(label) * 15) / 2;
    int ly = y + (h + 24) / 2;
    draw_text(label, lx, ly);
}

// ── Screens ───────────────────────────────────────────────────────────────────
void draw_header() {
    epd_draw_line(0, 60, EPD_WIDTH, 60, 0, framebuffer);
    draw_text(wifi_connected ? "[WiFi: ON]" : "[WiFi: OFF]", 10, 45);
    draw_text(bt_connected   ? "[BT: ON]"  : "[BT: OFF]",  200, 45);

    RTC_Date dt = rtc.getDateTime();
    char timebuf[16];
    snprintf(timebuf, sizeof(timebuf), "%02d:%02d", dt.hour, dt.minute);
    draw_text(timebuf, 420, 45);

    char batbuf[16];
    snprintf(batbuf, sizeof(batbuf), "Bat: %d%%", battery_pct());
    draw_text(batbuf, 750, 45);
}

void draw_main_screen() {
    fb_clear();
    draw_header();
    draw_button(80,  100, 350, 120, "WiFi");
    draw_button(530, 100, 350, 120, "Bluetooth");
    fb_flush(first_draw);
    first_draw = false;
}

void draw_wifi_detail() {
    fb_clear();
    draw_header();
    draw_text("-- WiFi --", 400, 120);
    draw_text_str("Status: " + String(wifi_connected ? "Connected" : "Disconnected"), 80, 180);
    draw_text_str("SSID:   " + String(wifi_connected ? WiFi.SSID() : "N/A"),          80, 230);
    draw_text_str("IP:     " + String(wifi_connected ? WiFi.localIP().toString() : "N/A"), 80, 280);
    draw_text_str("RSSI:   " + String(wifi_connected ? String(WiFi.RSSI()) + " dBm" : "N/A"), 80, 330);
    draw_button(380, 450, 200, 60, "Back");
    fb_flush(first_draw);
    first_draw = false;
}

void draw_bt_detail() {
    fb_clear();
    draw_header();
    draw_text("-- Bluetooth --", 360, 120);
    draw_text_str("Status: " + String(bt_connected ? "Connected" : "Advertising"), 80, 170);
    draw_text("Message:", 80, 230);
    // ponytail: wrap at ~55 chars per line for this font size at 960px wide
    const int line_h = 40;
    const int max_w  = 55;
    int y = 270;
    int len = strlen(bt_message);
    for (int i = 0; i < len && y < 430; i += max_w) {
        char line[max_w + 1];
        strncpy(line, bt_message + i, max_w);
        line[max_w] = '\0';
        draw_text(line, 80, y);
        y += line_h;
    }
    draw_button(380, 450, 200, 60, "Back");
    fb_flush(first_draw);
    first_draw = false;
}

void navigate(Screen s) {
    current_screen = s;
    switch (s) {
        case MAIN:        draw_main_screen();  break;
        case WIFI_DETAIL: draw_wifi_detail();  break;
        case BT_DETAIL:   draw_bt_detail();    break;
    }
}
