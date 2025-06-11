#ifndef BOARD_HAS_PSRAM
#error "Please enable PSRAM, Arduino IDE -> tools -> PSRAM -> OPI !!!"
#endif

#include "Arduino.h"
#include "ed047tc1.h"

#ifndef EPAPER_H
#define EPAPER_H

void init_epaper();
void epd_write_message(String message);

#endif