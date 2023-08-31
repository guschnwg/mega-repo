#define INT_1_1 25
#define INT_2_1 26
#define INT_1_2 33
#define INT_2_2 32

void setup() {
  // put your setup code here, to run once:
  pinMode(INT_1_1, OUTPUT);
  pinMode(INT_2_1, OUTPUT);
  pinMode(INT_1_2, OUTPUT);
  pinMode(INT_2_2, OUTPUT);
}

void loop() {
  digitalWrite(INT_1_1, LOW);
  digitalWrite(INT_2_1, HIGH);
  digitalWrite(INT_1_2, HIGH);
  digitalWrite(INT_2_2, LOW);

  delay(250);
  
  digitalWrite(INT_1_1, HIGH);
  digitalWrite(INT_2_1, LOW);
  digitalWrite(INT_1_2, LOW);
  digitalWrite(INT_2_2, HIGH);

  delay(250);
}
