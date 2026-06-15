// Connect the board via the USB cable
// Press and hold the BOOT(IO0) button
// While still pressing the BOOT(IO0) button, press RST
// Release the RST
// Release the BOOT(IO0) button
// Upload sketch

#ifndef BOARD_HAS_PSRAM
#error "Please enable PSRAM, Arduino IDE -> tools -> PSRAM -> OPI !!!"
#endif

#include <Arduino.h>
#include <Button2.h>
#include <Wire.h>

#include "battery.h"
#include "ble.h"
#include "lcd.h"
#include "screens.h"
#include "touch_handler.h"
#include "wifi_manager.h"

Button2 btn(BUTTON_1);

// ── Arduino entry points ──────────────────────────────────────────────────────
void setup() {
    Serial.begin(115200);
    delay(500); // wait for USB CDC to connect so early logs aren't lost

    framebuffer = (uint8_t *)ps_calloc(sizeof(uint8_t), EPD_WIDTH * EPD_HEIGHT / 2);
    memset(framebuffer, 0xFF, EPD_WIDTH * EPD_HEIGHT / 2);

    epd_init();
    epd_poweron();
    delay(10);

    Wire.begin(BOARD_SDA, BOARD_SCL);
    rtc.begin(Wire);
    lcd_init();

    setup_battery();
    refresh_battery(true);

    if (battery_voltage < MIN_VOLTAGE + 2) {
        epd_poweroff_all();
        return;
    }

    setup_wifi();
    setup_bt();

    pinMode(TOUCH_INT, INPUT_PULLUP);
    touch.begin();

    navigate(MAIN);
}

void loop() {
    if (battery_voltage < MIN_VOLTAGE + 2) {
        epd_poweroff_all();
        return;
    }

    if (digitalRead(TOUCH_INT) && touch.scanPoint())
        handle_touch();

    if (bt_nav_cmd >= 0) {
        Screen dest = (Screen)bt_nav_cmd;
        bt_nav_cmd = -1;
        navigate(dest);
    } else if (bt_msg_dirty && current_screen == BT_DETAIL) {
        bt_msg_dirty = false;
        navigate(BT_DETAIL);
    }

    bool changed = refresh_battery(false);

    static uint32_t last_header = 0;
    if (millis() - last_header > 30000 || changed) {
        last_header = millis();
        navigate(current_screen);
    }

    // LCD: header + progress bar toward next EPD refresh
    {
        RTC_Date dt = rtc.getDateTime();
        char buf[32];
        snprintf(buf, sizeof(buf), "%s %s %02d:%02d %d%%",
            wifi_connected ? "W+" : "W-",
            bt_connected   ? "B+" : "B-",
            dt.hour, dt.minute,
            battery_pct());
        uint32_t elapsed = millis() - last_header;
        int progress = (int)(elapsed * 21 / 30000); // 0–21 chars at textSize 1
        char bar[22] = "                     ";
        for (int i = 0; i < progress && i < 21; i++) bar[i] = '=';
        lcd_clear();
        lcd_write(buf, 0, false);
        lcd_write_hint(bar);
        lcd_display();
    }

    delay(50);
}
