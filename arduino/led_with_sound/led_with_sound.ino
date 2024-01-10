#include <FastLED.h>

FASTLED_USING_NAMESPACE

#define DATA_PIN 13
#define LED_TYPE WS2811
#define COLOR_ORDER GRB
#define NUM_LEDS 300
CRGB leds[NUM_LEDS];

#define BRIGHTNESS 96
#define FRAMES_PER_SECOND 120

#define SENSOR_PIN A1
#define MIC_PIN A2

int brightness = 255;
int micBase = 0;
int shakeBase = 0;
int maxShake = 0;
int maxMic = 0;
int glitterAgg = 0;

void setup() {
  Serial.begin(9600);
  delay(3000);

  FastLED.addLeds<LED_TYPE, DATA_PIN, COLOR_ORDER>(leds, NUM_LEDS).setCorrection(TypicalLEDStrip);

  FastLED.setBrightness(0);
  addGlitter(255);

  pinMode(SENSOR_PIN, INPUT);
  pinMode(MIC_PIN, INPUT);

  micBase = analogRead(MIC_PIN);
  delay(1000);
  int newRead = analogRead(MIC_PIN);
  micBase = newRead - (micBase - newRead) / 2;
  Serial.println(micBase);

  shakeBase = analogRead(SENSOR_PIN);
  delay(3000);
  newRead = analogRead(SENSOR_PIN);
  shakeBase = newRead - (shakeBase - newRead) / 2;
  Serial.println(shakeBase);

  FastLED.setBrightness(brightness);
  delay(3000);
  brightness = 0;
  FastLED.setBrightness(brightness);
}

void loop() {
  int sensorShake = analogRead(SENSOR_PIN);
  Serial.println(sensorShake);
  int micPin = analogRead(MIC_PIN);

  if (sensorShake > shakeBase + 1) {
    if (sensorShake > maxShake) {
      brightness = 255;
      maxShake = sensorShake;
    }

    for (int i = 10; i > 0; i--) {
      addGlitter(200);
    }
    maxMic = max(micPin, maxMic);
  } else {
    maxShake = 0;
    micPin = 0;
    brightness = max(int(brightness / 1.5), 0);
  }

  if (brightness == 0) {
    maxMic = 0;
    FastLED.clear();
  }

  FastLED.setBrightness(brightness);

  FastLED.show();
  FastLED.delay(1000 / FRAMES_PER_SECOND);
}

void addGlitter(fract8 chanceOfGlitter) {
  if (random8() < chanceOfGlitter) {
    leds[random16(NUM_LEDS)] += CRGB::White;
  }
}
