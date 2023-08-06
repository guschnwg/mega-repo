#include <PCD8544.h>

PCD8544 lcd;

void setup() {
  lcd.begin(84, 48);
  lcd.setContrast(60);
  lcd.clear();
}
bool inverse = true;
void loop() {
  lcd.setCursor(0, 0);
  lcd.print("   WELCOME  ");
  lcd.setCursor(0, 1);
  lcd.print("hello hello hello");
  lcd.setCursor(0,2);
  lcd.print("testing testing testing");
  lcd.setCursor(0,2);
  lcd.print("giovanna");
  delay(200);
}