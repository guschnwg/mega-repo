#ifndef BLE_H
#define BLE_H

#include <Arduino.h>
#include <BLECharacteristic.h>
#include "screens.h"  // Screen enum used by bt_nav_cmd

// ── BT message buffer ─────────────────────────────────────────────────────────
#define BT_MSG_MAX 256

// ── Globals ───────────────────────────────────────────────────────────────────
extern bool               bt_connected;
extern char               bt_message[BT_MSG_MAX];
extern volatile bool      bt_msg_dirty;
extern volatile int       bt_nav_cmd; // -1 = no pending nav, else cast to Screen
extern BLECharacteristic *ble_tx;

// ── Functions ─────────────────────────────────────────────────────────────────
void setup_bt();

#endif // BLE_H
