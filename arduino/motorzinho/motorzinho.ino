// ESP32 Wrover Kit (all versions)
#include <ESP32MX1508.h>
#include "BluetoothSerial.h"

#define LEFT_1 25 // Green
#define LEFT_2 26 // Blue
#define RIGHT_1 33 // Brown
#define RIGHT_2 32 // Gray

MX1508 leftMotor (LEFT_2, LEFT_1, 0, 1);
MX1508 rightMotor (RIGHT_1, RIGHT_2, 2, 3);

BluetoothSerial SerialBT;

#if !defined(CONFIG_BT_ENABLED) || !defined(CONFIG_BLUEDROID_ENABLED)
  #error Bluetooth is not enabled! Please run `make menuconfig` to and enable it
#endif

void setup() {
  Serial.begin(115200);
  SerialBT.begin("ESP32");
}

void move(Stream &serial) {
  int left = serial.readStringUntil(':').toInt();
  int right = serial.readStringUntil(':').toInt();
  int time = serial.readStringUntil('\n').toInt();

  if (left > 0) {
    leftMotor.motorGo(left);
  } else {
    leftMotor.motorRev(left);
  }

  if (right > 0) {
    rightMotor.motorGo(right);
  } else {
    rightMotor.motorRev(right);
  }

  delay(time);
}

void loop() {
  if (Serial.available()) {
    move(Serial);
  } else if (SerialBT.available()) {
    move(SerialBT);
  }

  leftMotor.motorStop();
  rightMotor.motorStop();
}
