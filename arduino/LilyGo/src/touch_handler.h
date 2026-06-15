#ifndef TOUCH_HANDLER_H
#define TOUCH_HANDLER_H

#include <Arduino.h>
#include <touch.h>

// ── Globals ───────────────────────────────────────────────────────────────────
extern TouchClass touch;

// ── Functions ─────────────────────────────────────────────────────────────────
void handle_touch();

#endif // TOUCH_HANDLER_H
