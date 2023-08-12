#include <PCD8544.h>
#include <SoftwareSerial.h>

int kbRead = 1023;
String kbState = "NONE";
String lastKbState = "NONE";
unsigned long lastKbStateChange = -1;
int livingKbState = 1000;

int buttons[5] = { 0, 32, 89, 167, 352 };

// Screen
PCD8544 lcd;

// Bluetooth
SoftwareSerial BTSerial(10, 11);
String phrase = "";
unsigned long lastBluetoothMsgChange = -1;
int livingBluetoothMsg = 2000;

void setup() {
  // Screen
  lcd.begin(84, 48);
  lcd.setContrast(40);
  lcd.clear();

  // Bluetooth
  Serial.begin(9600);
  BTSerial.begin(9600);
}

int val = 0;

void loop() {
  lcd.setCursor(0, 0);
  lcd.print("giovanna");

  // Keayboard
  kbRead = analogRead(A0);
  if (kbRead > 1000) kbState = "NONE";
  else if (kbRead >= 0 && kbRead <= 10) kbState = "LEFT";
  else if (kbRead >= 25 && kbRead <= 35) kbState = "TOP";
  else if (kbRead >= 85 && kbRead <= 95) kbState = "BOTTOM";
  else if (kbRead >= 160 && kbRead <= 170) kbState = "RIGHT";
  else if (kbRead >= 350 && kbRead <= 360) kbState = "ACTION";

  lcd.setCursor(0, 1);
  if (lastKbState != kbState) {
    if (kbState != "NONE") {
      lcd.clearLine();
      lcd.print(kbState);
    }
    lastKbState = kbState;
    lastKbStateChange = millis();
  }
  if (lastKbStateChange != -1 && livingKbState < millis() - lastKbStateChange) {
    Serial.println("clearing kb");
    lcd.clearLine();
    lastKbStateChange = -1;
  }

  // Bluetooth
  phrase = "";
  if (BTSerial.available()) {
    phrase = BTSerial.readString();
  }
  lcd.setCursor(0, 2);
  if (phrase != "") {
    lcd.print(phrase);
    lastBluetoothMsgChange = millis();
  } else {
    if (lastBluetoothMsgChange != -1 && livingBluetoothMsg < millis() - lastBluetoothMsgChange) {
      lcd.clearLine();
      Serial.println("clearing bt");
      lastBluetoothMsgChange = -1;
    }
  }
}