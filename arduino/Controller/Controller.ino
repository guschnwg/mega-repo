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

Adafruit_PCD8544 display = Adafruit_PCD8544(/* CLK */19, /* DIN */ 21, /* DC */ 18, /* CE */ 22, /* RST */ 23);

BluetoothSerial SerialBT;

int normalizeMyPotentiometer(int value, int zeroValue) {
  if (value > zeroValue) {
    return map(value, zeroValue, 4096, 0, 255);
  }

  return map(value, 0, zeroValue, -255, 0);
}

bool positive(int value) {
  return value >= 5;
}
bool negative(int value) {
  return value <= -5;
}
bool nearZero(int value) {
  return value > -5 && value < 5;
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

  if(SerialBT.connect("ESP32")) {
    digitalWrite(2, HIGH);
    display.clearDisplay();
    display.setCursor(0, 0);
    display.print("Connected!");
    display.display();
  } else {
    while(!SerialBT.connected(10000)) {
      display.clearDisplay();
      display.setCursor(0, 0);
      display.print("Failed to connect! Retrying...");
      display.display();
    }
  }

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

  int xValue = analogRead(pinPotX);
  int yValue = analogRead(pinPotY);
  bool clicked = digitalRead(pinButton);

  // Mapped values to the little fella

  // We want to map from 0<->4095 to -255 to 255
  int xNormalizedValue = normalizeMyPotentiometer(xValue, xZeroValue);
  int yNormalizedValue = normalizeMyPotentiometer(yValue, yZeroValue);

  String right = "0";
  String left = "0";

  // X+ and Y+ RIGHT FRONT
  if (positive(xNormalizedValue) && positive(yNormalizedValue)) {
    left = "255";
    right = "200";
  }
  // X+ and Y0 FRONT
  else if (positive(xNormalizedValue) && nearZero(yNormalizedValue)) {
    left = "255";
    right = "255";
  }
  // X+ and Y- LEFT FRONT
  else if (positive(xNormalizedValue) && negative(yNormalizedValue)) {
    left = "200";
    right = "255";
  }

  // X- and Y+ RIGHT BACK
  else if (negative(xNormalizedValue) && positive(yNormalizedValue)) {
    left = "-255";
    right = "-200";
  }
  // X- and Y0 BACK
  else if (negative(xNormalizedValue) && nearZero(yNormalizedValue)) {
    left = "-255";
    right = "-255";
  }
  // X- and Y- LEFT BACK
  else if (negative(xNormalizedValue) && negative(yNormalizedValue)) {
    left = "-200";
    right = "-255";
  }

  // X0 and Y+ RIGHT
  else if (nearZero(xNormalizedValue) && positive(yNormalizedValue)) {
    left = "255";
    right = "-255";
  }
  // X0 and Y0 STOP
  else if (nearZero(xNormalizedValue) && nearZero(yNormalizedValue)) {
    // Nothing actually
  }
  // X0 and Y- LEFT
  else if (nearZero(xNormalizedValue) && negative(yNormalizedValue)) {
    left = "-255";
    right = "255";
  }

  String toSend = String(left + ":" + right + ":" + 200);

  // Display

  display.clearDisplay();

  display.setCursor(0, 0);
  display.print("X: ");
  display.print(xValue);
  display.setCursor(0, 10);
  display.print("Y: ");
  display.print(yValue);
  display.setCursor(0, 20);
  display.print("Button: ");
  display.print(clicked);
  display.setCursor(0, 30);
  display.print(toSend);

  display.display();

  // Send bluetooth

  SerialBT.println(toSend);
  delay(200);
}