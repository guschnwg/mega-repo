#include <epd_driver.h> // Only if using LilyGO's e-paper power functions

void init_epaper() {
    epd_init();
    epd_poweron();
}
