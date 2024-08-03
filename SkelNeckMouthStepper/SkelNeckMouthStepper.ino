/* Sweep
 by BARRAGAN <http://barraganstudio.com>
 This example code is in the public domain.

 modified 8 Nov 2013
 by Scott Fitzgerald
 https://www.arduino.cc/en/Tutorial/LibraryExamples/Sweep
*/

#include <Servo.h>
#include <AccelStepper.h>

Servo neckServo;  // create servo object to control a servo
//Servo mouthServo;  // create servo object to control a servo
// twelve servo objects can be created on most boards
AccelStepper stepper(1,4,7); // Defaults to AccelStepper::FULL4WIRE (4 pins) on 2, 3, 4, 5


char *strings[2];
char *ptr = NULL;
String inputString = "";         // a String to hold incoming data
bool stringComplete = false;  // whether the string is complete

int db = 2;
int pos = 20;    // variable to store the servo position

const int mouthPin = 3;
const int mouthPosMin = 0;
const int mouthPosMax = 75;
int mouthPos = mouthPosMin;

int mouthStartAngle = mouthPosMin;
int mouthStopAngle  = mouthPosMin+1;
int currMouthPos = mouthPosMin;

const int neckPin = 5;//5
const int neckPosMin = 21;//20
const int neckPosMax = 131;//130
int neckPos = neckPosMin;

int neckStartAngle = neckPosMin;
int neckStopAngle  = neckPosMin+1;
int currNeckPos = neckPosMin;

void setup() {
  stepper.setMaxSpeed(1400);
  stepper.setAcceleration(12000);
  Serial.begin(19200);
  inputString.reserve(200);
  neckServo.attach(neckPin);  // attaches the servo on pin 5 to the servo object
  //mouthServo.attach(mouthPin);  // attaches the servo on pin 3 to the servo object
  Serial.println("Ready");
}

void loop() {
  if (stringComplete) {
    //Serial.print("Input:");
    //Serial.println(inputString);
    // clear the string:
    inputString = "";
    stringComplete = false;
  }

  if(neckStopAngle != currNeckPos){
    if(currNeckPos > neckStopAngle + db){
      currNeckPos -= db;
    }else if(currNeckPos < neckStopAngle - db){
      currNeckPos += db;
    }
    if(currNeckPos < neckPosMin){ currNeckPos = neckPosMin; }
    if(currNeckPos > neckPosMax){ currNeckPos = neckPosMax; }
//    Serial.println(currNeckPos);
    neckServo.write(currNeckPos);
  }
  if(mouthStopAngle != currMouthPos){
    if(currMouthPos > mouthStopAngle + db){
      currMouthPos -= db;
    }else if(currMouthPos < mouthStopAngle - db){
      currMouthPos += db;
    }
    if(currMouthPos < mouthPosMin){ currMouthPos = mouthPosMin; }
    if(currMouthPos > mouthPosMax){ currMouthPos = mouthPosMax; }
//    Serial.println(currMouthPos);
    //mouthServo.write(currMouthPos);
  }
//  Serial.print("Neck Pos:");
//  Serial.print(currNeckPos);
//  Serial.print("\t\tMouth Pos:");
//  Serial.println(currMouthPos);
  //delay(2);
  stepper.run();
}

/*
  SerialEvent occurs whenever a new data comes in the hardware serial RX. This
  routine is run between each time loop() runs, so using delay inside loop can
  delay response. Multiple bytes of data may be available.
*/
void serialEvent() {
  while (Serial.available()) {
    // get the new byte:
    char inChar = (char)Serial.read();
    // if the incoming character is a newline, set a flag so the main loop can
    // do something about it:
    if (inChar == '\n') {
      stringComplete = true;
      int ind1 = inputString.indexOf(',');  //finds location of first ,
      neckPos = inputString.substring(0, ind1).toInt();   //captures first data String
      mouthPos = inputString.substring(ind1+1).toInt();   //captures second data String
      int m = map(mouthPos, 1, 4, 60, -60);
      stepper.moveTo(m);
      Serial.print("Neck Pos:");
      Serial.print(neckPos);
      Serial.print("\t\tMouth Pos:");
      Serial.println(m);
      int neckPos = inputString.toInt();
      if(neckPos >= neckPosMin && neckPos <= neckPosMax){
        neckStartAngle = currNeckPos;
        neckStopAngle = neckPos;
      }
      if(mouthPos >= mouthPosMin && mouthPos <= mouthPosMax){
        mouthStartAngle = currMouthPos;
        mouthStopAngle = mouthPos;
      }
    }
    // add it to the inputString:
    inputString += inChar;
  }
}
