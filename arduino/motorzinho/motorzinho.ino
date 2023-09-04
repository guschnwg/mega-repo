// ESP32 Wrover Kit (all versions)
#include <ESP32MX1508.h>

#define LEFT_1 25 // Green
#define LEFT_2 26 // Blue
#define RIGHT_1 33 // Brown
#define RIGHT_2 32 // Gray

MX1508 leftMotor (LEFT_2, LEFT_1, 0, 1);
MX1508 rightMotor (RIGHT_1, RIGHT_2, 2, 3);

void setup() {
  Serial.begin(115200);
}

void loop() {
  if(Serial.available()) {
    int left = Serial.readStringUntil(':').toInt();
    int right = Serial.readStringUntil(':').toInt();
    int time = Serial.readStringUntil('\n').toInt();

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

  leftMotor.motorStop();
  rightMotor.motorStop();
}
