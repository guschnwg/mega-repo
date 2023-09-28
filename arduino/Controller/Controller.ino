// ESP32-WROOM-DA Module
// Upload speed: 115200

#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_PCD8544.h>
#include "BluetoothSerial.h"

const int pinPotX = 15;
const int pinPotY = 4;
const int pinButton = 5;

int xZeroValue = 0;
int yZeroValue = 0;

int lastSent = 0;
int messageWait = 200;

Adafruit_PCD8544 display = Adafruit_PCD8544(/* CLK */19, /* DIN */ 21, /* DC */ 18, /* CE */ 22, /* RST */ 23);

BluetoothSerial SerialBT;

int normalizeMyPotentiometer(int value, int zeroValue) {
  if (value > zeroValue) {
    return map(value, zeroValue, 4096, 0, 255);
  }

  return map(value, 0, zeroValue, -255, 0);
}

void connectBluetooth(int tries) {
  int triesLeft = tries;

  if(SerialBT.connect("ESP32")) {
    digitalWrite(2, HIGH);
    display.clearDisplay();
    display.setCursor(0, 0);
    display.print("Connected!");
    display.display();
  } else {
    while(!SerialBT.connected(2000) && tries > 0) {
      display.clearDisplay();
      display.setCursor(0, 0);
      display.print("Failed to connect! Retrying...");
      display.display();
      tries--;
    }
  }
}

bool nearZero(int value) {
  return value >= -5 && value <= 5;
}
bool positive(int value) {
  return value > 5;
}
bool negative(int value) {
  return value < -5;
}

int calculateR(int y, int x) {
  if (nearZero(x)) {
    return y;
  }
  if (nearZero(y)) {
    return x * -1;
  }

  if (positive(x) && positive(y)) {
    return map(x, 0, 255, 255, -255);
  } else if (positive(x) && negative(y)) {
    return map(x, 0, 255, -255, 255);
  } else if (negative(x) && negative(y)) {
    return -255; // Consider 255 now, and the other motor controls
  } else if (negative(x) && positive(y)) {
    return 255; // Consider 255 now, and the other motor controls
  }
  
  return 0;
}

int calculateL(int y, int x) {
  if (nearZero(x)) {
    return y;
  }
  if (nearZero(y)) {
    return x;
  }

  if (positive(x) && positive(y)) {
    return 255; // Consider 255 now, and the other motor controls
  } else if (positive(x) && negative(y)) {
    return -255; // Consider 255 now, and the other motor controls
  } else if (negative(x) && negative(y)) {
    return map(x * -1, 0, 255, -255, 255);
  } else if (negative(x) && positive(y)) {
    return map(x * -1, 0, 255, 255, -255);
  }

  return 0;
}

void setup() {
  Serial.println("Setting up controls");
  pinMode(pinPotX, INPUT);
  pinMode(pinPotY, INPUT);
  pinMode(pinButton, INPUT_PULLUP);

  Serial.println("Setting up serial to 115200");
  Serial.begin(115200);

  Serial.println("Setting up screen");
  display.begin();
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(BLACK);
  display.setContrast(60);
  display.display();

  SerialBT.begin("ESP32 - Controller", true); 
  Serial.println("Setting up bluetooth");
  display.setCursor(0, 0);
  display.print("Setting up bluetooth");
  display.display();

  connectBluetooth(5);

  // Setting up zero values
  // Ideally they will start at the middle, so we mark it as the middle point
  xZeroValue = analogRead(pinPotX);
  yZeroValue = analogRead(pinPotY);

  display.setCursor(0, 20);
  display.print("Defined Zero Values: " + String(xZeroValue) + ", " + String(yZeroValue));
  display.display();

  delay(1000);

  display.clearDisplay();
  display.setCursor(0, 0);
  display.print("Starting in 5s...");
  display.display();

  delay(1000);

  display.clearDisplay();
  display.setCursor(0, 0);
  display.print("Starting in 4s...");
  display.display();

  delay(1000);

  display.clearDisplay();
  display.setCursor(0, 0);
  display.print("Starting in 3s...");
  display.display();

  delay(1000);

  display.clearDisplay();
  display.setCursor(0, 0);
  display.print("Starting in 2s...");
  display.display();

  delay(1000);

  display.clearDisplay();
  display.setCursor(0, 0);
  display.print("Starting in 1s...");
  display.display();

  delay(1000);
}

void loop() {
  // Reading potentiometer values

  int xValue = analogRead(pinPotX); // 4096 to 0 for some reason
  int yValue = analogRead(pinPotY); // 0 to 4096
  bool clicked = digitalRead(pinButton);

  // Mapped values to the little fella

  // We want to map from 0<->4095 to -255 to 255
  int xNormalizedValue = normalizeMyPotentiometer(xValue, xZeroValue);
  // My X is inverted for some reason, see L126
  xNormalizedValue = map(xNormalizedValue, -255, 255, 255, -255);
  int yNormalizedValue = normalizeMyPotentiometer(yValue, yZeroValue);

  // Normalize again to MIN MAX
  int rCalculated = calculateR(yNormalizedValue, xNormalizedValue);
  if (positive(rCalculated)) {
    rCalculated = map(rCalculated, 0, 255, 150, 200);
  } else if (negative(rCalculated)) {
    rCalculated = map(rCalculated, -255, 0, -200, -150);
  } else {
    rCalculated = 0;
  }
  int lCalculated = calculateL(yNormalizedValue, xNormalizedValue);
  if (positive(lCalculated)) {
    lCalculated = map(lCalculated, 0, 255, 150, 200);
  } else if (negative(lCalculated)) {
    lCalculated = map(lCalculated, -255, 0, -200, -150);
  } else {
    lCalculated = 0;
  }

  // These are very much simplifications, for now it should be enough
  String right = String(rCalculated);
  String left = String(lCalculated);

  String toSend = String(left + ":" + right + ":" + String(messageWait));

  if (millis() - lastSent > messageWait) {
    // Update screen
    display.clearDisplay();

    display.setCursor(0, 0);
    display.print("X: ");
    display.print(xValue);
    display.print(" ("); display.print(xZeroValue); display.print(")"); 
    display.setCursor(0, 10);
    display.print("Y: ");
    display.print(yValue);
    display.print(" ("); display.print(yZeroValue); display.print(")"); 
    display.setCursor(0, 20);
    display.print("Button: ");
    display.print(clicked);
    display.setCursor(0, 30);
    display.print(toSend);
    display.setCursor(0, 40);
    display.print("Sending...");
    SerialBT.println(toSend);

    display.display();

    // Send bluetooth
    lastSent = millis();
  }
}