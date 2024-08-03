/*

  WiFi UDP Send and Receive String

 This sketch wait an UDP packet on localPort using the WiFi module.

 When a packet is received an Acknowledge packet is sent to the client on port remotePort

 created 30 December 2012

 by dlf (Metodo2 srl)

 */

#include <SPI.h>
#include <WiFiNINA.h>
#include <WiFiUdp.h>

int status = WL_IDLE_STATUS;
///////please enter your sensitive data in the Secret tab/arduino_secrets.h
char ssid[] = "ConsultingJoe";        // your network SSID (name)
char pass[] = "SimbaSammarco";    // your network password (use for WPA, or use as key for WEP)
int keyIndex = 0;            // your network key Index number (needed only for WEP)

unsigned int localPort = 2390;      // local port to listen on

char packetBuffer[256]; //buffer to hold incoming packet
char  ReplyBuffer[] = "acknowledged";       // a string to send back
char *strings[6];
int neckPos;
int mouthPos;
int relay1;
int relay2;

WiFiUDP Udp;

void setup() {

  pinMode(2, OUTPUT);
  pinMode(3, OUTPUT);
  digitalWrite(2, HIGH);
  digitalWrite(3, HIGH);
  
  pinMode(LED_BUILTIN, OUTPUT);
  //Initialize serial and wait for port to open:

  Serial.begin(9600);

  //while (!Serial) {

    ; // wait for serial port to connect. Needed for native USB port only

  //}

  // check for the WiFi module:

  if (WiFi.status() == WL_NO_MODULE) {

    Serial.println("Communication with WiFi module failed!");

    // don't continue

    while (true);

  }

  String fv = WiFi.firmwareVersion();

  if (fv < WIFI_FIRMWARE_LATEST_VERSION) {

    Serial.println("Please upgrade the firmware");

  }

  // attempt to connect to Wifi network:

  while (status != WL_CONNECTED) {

    Serial.print("Attempting to connect to SSID: ");

    Serial.println(ssid);

    // Connect to WPA/WPA2 network. Change this line if using open or WEP network:

    status = WiFi.begin(ssid, pass);

    // wait 5 seconds for connection:

    delay(5000);

  }

  Serial.println("Connected to wifi");

  printWifiStatus();

  Serial.println("\nStarting connection to server...");

  // if you get a connection, report back via serial:

  Udp.begin(localPort);
}

void loop() {

  // if there's data available, read a packet

  int packetSize = Udp.parsePacket();

  if (packetSize) {
    Serial.print("Received packet of size ");

    Serial.println(packetSize);

    Serial.print("From ");

    IPAddress remoteIp = Udp.remoteIP();

    Serial.print(remoteIp);

    Serial.print(", port ");

    Serial.println(Udp.remotePort());

    // read the packet into packetBufffer

    int len = Udp.read(packetBuffer, 255);

    if (len > 0) {
      packetBuffer[len] = 0;
      digitalWrite(LED_BUILTIN, HIGH);
    }else{
      digitalWrite(LED_BUILTIN, LOW);
    }

    Serial.println("Contents:");

    Serial.println(packetBuffer);
    
    neckPos = String(getValue(packetBuffer, ',', 0)).toInt();
    mouthPos = String(getValue(packetBuffer, ',', 1)).toInt();
    relay1 = String(getValue(packetBuffer, ',', 2)).toInt();
    relay2 = String(getValue(packetBuffer, ',', 3)).toInt();

    if (relay1 == 1){
      digitalWrite(2, LOW);
      delay(10);
    }else{
      digitalWrite(2, HIGH);
      delay(10);
    }
    if (relay2 == 1){
      digitalWrite(3, LOW);
      delay(10);
    }else{
      digitalWrite(3, HIGH);
      delay(10);
    }
    
    Serial.print("Neck: ");
    Serial.print(neckPos);
    Serial.print(" Mouth: ");
    Serial.print(mouthPos);
    Serial.print(" Relay1: ");
    Serial.print(relay1);
    Serial.print(" Relay2: ");
    Serial.print(relay2);
    // send a reply, to the IP address and port that sent us the packet we received

    Udp.beginPacket(Udp.remoteIP(), Udp.remotePort());

    Udp.write(ReplyBuffer);

    Udp.endPacket();

  }
}

String getValue(String data, char separator, int index)
{
    int found = 0;
    int strIndex[] = { 0, -1 };
    int maxIndex = data.length() - 1;

    for (int i = 0; i <= maxIndex && found <= index; i++) {
        if (data.charAt(i) == separator || i == maxIndex) {
            found++;
            strIndex[0] = strIndex[1] + 1;
            strIndex[1] = (i == maxIndex) ? i+1 : i;
        }
    }
    return found > index ? data.substring(strIndex[0], strIndex[1]) : "";
}

void printWifiStatus() {

  // print the SSID of the network you're attached to:

  Serial.print("SSID: ");

  Serial.println(WiFi.SSID());

  // print your board's IP address:

  IPAddress ip = WiFi.localIP();

  Serial.print("IP Address: ");

  Serial.println(ip);

  // print the received signal strength:

  long rssi = WiFi.RSSI();

  Serial.print("signal strength (RSSI):");

  Serial.print(rssi);

  Serial.println(" dBm");
}
