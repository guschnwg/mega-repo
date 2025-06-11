#include <AceButton.h>
#include <Arduino.h>
#include <ace_button/ButtonConfig.h>

using namespace ace_button;

static const uint8_t NUM_BUTTONS = 5;
static AceButton btnLeft(nullptr, 0);   // Left button (SW1)
static AceButton btnUp(nullptr, 1);     // Up button (SW2)
static AceButton btnDown(nullptr, 2);   // Down button (SW3)
static AceButton btnRight(nullptr, 3);  // Right button (SW4)
static AceButton btnSelect(nullptr, 4); // Select button (SW5)
static AceButton *const BUTTONS[NUM_BUTTONS] = {&btnLeft, &btnUp, &btnDown,
                                                &btnRight, &btnSelect};

static const uint16_t LEVELS[] = {0, 144, 324, 640, 1400, 4095};

LadderButtonConfig *buttonConfig = nullptr;
void (*gOnClick)(uint8_t);

void handleEvent(AceButton *button, uint8_t eventType, uint8_t buttonState) {
  switch (eventType) {
  case AceButton::kEventPressed:
    break;
  case AceButton::kEventReleased:
    break;
  case AceButton::kEventClicked:
    gOnClick(button->getPin());
    break;
  case AceButton::kEventDoubleClicked:
    break;
  case AceButton::kEventLongPressed:
    break;
  case AceButton::kEventRepeatPressed:
    break;
  default:
    break;
  }
}

void init_button(int pin, void (*onClick)(uint8_t)) {
  pinMode(pin, INPUT);

  buttonConfig = new LadderButtonConfig(pin, NUM_BUTTONS + 1, LEVELS,
                                        NUM_BUTTONS, BUTTONS);
  gOnClick = onClick;

  buttonConfig->setEventHandler(handleEvent);
  buttonConfig->setFeature(ButtonConfig::kFeatureClick);
  buttonConfig->setFeature(ButtonConfig::kFeatureDoubleClick);
  buttonConfig->setFeature(ButtonConfig::kFeatureLongPress);
  buttonConfig->setFeature(ButtonConfig::kFeatureRepeatPress);
}

void check_buttons() {
  static unsigned long prev = millis();
  unsigned long now = millis();
  if (now - prev > 5) {
    buttonConfig->checkButtons();
    prev = now;
  }
}