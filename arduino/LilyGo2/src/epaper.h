#include "ed047tc1.h"
#ifndef BOARD_HAS_PSRAM
#error "Please enable PSRAM, Arduino IDE -> tools -> PSRAM -> OPI !!!"
#endif

#ifndef EPAPER_H
#define EPAPER_H

void init_epaper();

#endif