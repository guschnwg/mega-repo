#include "touch_handler.h"

#include "epd_driver.h"
#include "screens.h"

// ── Definitions ───────────────────────────────────────────────────────────────
TouchClass touch;

// ── Implementation ────────────────────────────────────────────────────────────
void handle_touch() {
    uint16_t tx, ty;
    touch.getPoint(tx, ty, 0);
    ty = EPD_HEIGHT - ty;

    if (current_screen == MAIN) {
        if (tx >= 80 && tx <= 430 && ty >= 100 && ty <= 220)
            navigate(WIFI_DETAIL);
        else if (tx >= 530 && tx <= 880 && ty >= 100 && ty <= 220)
            navigate(BT_DETAIL);
    } else {
        if (tx >= 380 && tx <= 580 && ty >= 450 && ty <= 510)
            navigate(MAIN);
    }
}
