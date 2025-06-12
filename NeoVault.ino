#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <EEPROM.h>
#include <WiFiManager.h>
#include <time.h>
#include <sys/time.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C
#define S0 33
#define S1 32
#define S2 2
#define S3 15
#define SENSOR_OUT 4

#define RESET_BUTTON 5

#define FIREBASE_DATABASE_URL \
  "https://piggybank-8605d-default-rtdb.asia-southeast1.firebasedatabase.app"
#define DEVICE_ID "pb-1234"
#define USER_ID   "QO4BGasXb3Og7cHjzVVVRud4pqE3"

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
int   Uang       = 0;
int   lastUang   = -1;
bool  statusUang = false;

uint64_t getEpochMillis() {
  struct timeval tv;
  gettimeofday(&tv, nullptr);
  return (uint64_t)tv.tv_sec * 1000ULL + tv.tv_usec / 1000ULL;
}

uint16_t getColorNormalized(uint8_t s2, uint8_t s3) {
  digitalWrite(S2, s2);
  digitalWrite(S3, s3);
  uint32_t raw = pulseIn(SENSOR_OUT, LOW); 
  const float K = 3800.0f;
  float I = K / float(raw);
  I = constrain(I, 0.0f, 255.0f);
  return uint16_t(I);
}

void readColorAvg(float &outR, float &outG, float &outB, int n = 7) {
  long sumR = 0, sumG = 0, sumB = 0;
  for (int i = 0; i < n; ++i) {
    sumR += getColorNormalized(LOW, LOW); 
    delay(10);
    sumG += getColorNormalized(HIGH, HIGH);
    delay(10);
    sumB += getColorNormalized(LOW, HIGH); 
    delay(10);
  }
  outR = sumR / float(n);
  outG = sumG / float(n);
  outB = sumB / float(n);
}

int predictNominal(float R, float G, float B) {
    if (G <= 91.0f) {
        if (B <= 79.5f) {
            if (G <= 67.5f) {
                if (G <= 64.0f) {
                    if (B <= 71.5f)       return 5000;
                    else                  return 100000;
                } else {
                    return 100000;
                }
            } else {
                return 5000;
            }
        } else {
            if (G <= 61.0f) {
                if (B <= 86.0f)       return 5000;
                else                  return 100000;
            } else {
                return 100000;
            }
        }
    } else {
        if (B <= 199.5f) {
            if (B <= 159.0f)     return 2000;
            else                 return 20000;
        } else {
            if (G <= 182.5f)     return 10000;
            else                 return 50000;
        }
    }
}


int httpPost(const String &url, const String &body) {
  HTTPClient http;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(body);
  String resp = http.getString();
  Serial.printf("HTTP %d → %s\n", code, resp.c_str());
  http.end();
  return code;
}

void setup() {
  pinMode(S0, OUTPUT); pinMode(S1, OUTPUT);
  pinMode(S2, OUTPUT); pinMode(S3, OUTPUT);
  pinMode(SENSOR_OUT, INPUT);
  pinMode(RESET_BUTTON, INPUT_PULLUP);
  digitalWrite(S0, HIGH);
  digitalWrite(S1, HIGH);

  Serial.begin(115200);
  while (!Serial);

  EEPROM.begin(512);
  Uang = EEPROM.readInt(0);
  WiFiManager wm;
  wm.autoConnect("ESP32_Celengan");

  configTime(7*3600, 0, "pool.ntp.org", "time.google.com");
  while (time(nullptr) < 24*3600) delay(500);

  if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    while (true);
  }
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0,10);
  display.println("Ready!");
  display.display();
  delay(1500);
}

void loop() {
  if (digitalRead(RESET_BUTTON) == LOW) {
    delay(200);
    if (digitalRead(RESET_BUTTON) == LOW) {
      Uang = 0;
      EEPROM.writeInt(0, 0);
      EEPROM.commit();
      lastUang = -1;
    }
  }

  if (Uang != lastUang) {
    display.clearDisplay();
    display.setTextSize(2);
    display.setCursor(0,0);
    display.println("Saldo:");
    display.setCursor(0,30);
    display.printf("Rp %d", Uang);
    display.display();
    lastUang = Uang;
  }

  float avgR, avgG, avgB;
  readColorAvg(avgR, avgG, avgB, 7);
  Serial.printf("Avg R=%.1f G=%.1f B=%.1f\n", avgR, avgG, avgB);

  if (avgR < 25.0f && avgG < 25.0f && avgB < 30.0f) {
    statusUang = false;
    return;
  }

  if (!statusUang) {
    int nominal = predictNominal(avgR, avgG, avgB);
    if (nominal > 0) {
      statusUang = true;
      Uang += nominal;
      EEPROM.writeInt(0, Uang);
      EEPROM.commit();

      String url = String(FIREBASE_DATABASE_URL)
                 + "/users/" + USER_ID
                 + "/devices/" + DEVICE_ID
                 + "/transactions.json";
      String body = "{\"nominal\":" + String(nominal)
                  + ",\"timestamp\":" + String(getEpochMillis())
                  + "}";
      httpPost(url, body);
    }
  }
}
