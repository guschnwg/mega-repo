#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

// ── Voltage thresholds ────────────────────────────────────────────────────────
#define MIN_VOLTAGE       280
#define MAX_VOLTAGE       420
#define VOLTAGE_VARIATION 10

// ── Nordic UART Service UUIDs ─────────────────────────────────────────────────
#define NUS_SERVICE_UUID  "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
#define NUS_RX_UUID       "6E400002-B5A3-F393-E0A9-E50E24DCCA9E" // phone writes here
#define NUS_TX_UUID       "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"

// ── WiFi credentials ──────────────────────────────────────────────────────────
extern const char *ssid;
extern const char *password;

#endif // CONFIG_H
