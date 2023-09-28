// AI Thinker ESP32-CAM

#include <ESP32MX1508.h>
#include "BluetoothSerial.h"

#define LEFT_1 12 // Green
#define LEFT_2 13 // Blue
#define RIGHT_1 14 // Purple
#define RIGHT_2 15 // Gray

MX1508 leftMotor (LEFT_2, LEFT_1, 0, 1);
MX1508 rightMotor (RIGHT_1, RIGHT_2, 2, 3);

BluetoothSerial SerialBT;

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
    leftMotor.motorRev(left * -1);
  }

  if (right > 0) {
    rightMotor.motorGo(right);
  } else {
    rightMotor.motorRev(right * -1);
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
