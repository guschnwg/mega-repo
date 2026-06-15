#include "wifi_manager.h"

#include <WiFi.h>
#include "config.h"

// ── Definitions ───────────────────────────────────────────────────────────────
bool wifi_connected = false;

const char *ssid     = "CAMILESTE LTDA";
const char *password = "emirina123";

// ── Implementation ────────────────────────────────────────────────────────────
void setup_wifi() {
    WiFi.begin(ssid, password);
    int tries = 10;
    while (WiFi.status() != WL_CONNECTED && tries-- > 0) delay(500);
    wifi_connected = (WiFi.status() == WL_CONNECTED);
}
