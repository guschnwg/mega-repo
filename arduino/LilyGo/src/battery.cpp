#include "battery.h"

#include <esp_adc_cal.h>

// ── Definitions ───────────────────────────────────────────────────────────────
int vref            = 1100;
int battery_voltage = -100;

// ── Implementation ────────────────────────────────────────────────────────────
void setup_battery() {
    esp_adc_cal_characteristics_t adc_chars;
    auto val = esp_adc_cal_characterize(
        ADC_UNIT_2, ADC_ATTEN_DB_11, ADC_WIDTH_BIT_12, 1100, &adc_chars);
    if (val == ESP_ADC_CAL_VAL_EFUSE_VREF) vref = adc_chars.vref;
    delay(10);
}

int read_battery() {
    uint16_t v = analogRead(BATT_PIN);
    int volt = (((float)v / 4095.0) * 2.0 * 3.3 * (vref / 1000.0)) * 100;
    return min(volt, MAX_VOLTAGE);
}

bool refresh_battery(bool force) {
    int v = read_battery();
    if (force || abs(v - battery_voltage) > VOLTAGE_VARIATION) {
        battery_voltage = v;
        return true;
    }
    return false;
}

int battery_pct() {
    int clamped = constrain(battery_voltage, MIN_VOLTAGE, MAX_VOLTAGE);
    return map(clamped, MIN_VOLTAGE, MAX_VOLTAGE, 0, 100);
}
