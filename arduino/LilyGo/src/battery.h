#ifndef BATTERY_H
#define BATTERY_H

#include <Arduino.h>
#include "epd_driver.h" // BATT_PIN, board pin defs
#include "config.h"

// ── Globals ───────────────────────────────────────────────────────────────────
extern int vref;
extern int battery_voltage;

// ── Functions ─────────────────────────────────────────────────────────────────
void setup_battery();
int  read_battery();
bool refresh_battery(bool force);
int  battery_pct();

#endif // BATTERY_H
