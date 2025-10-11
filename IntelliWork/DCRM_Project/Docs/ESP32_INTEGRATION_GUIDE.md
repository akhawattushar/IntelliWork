# 🔧 ESP32 Hardware Integration Guide

**Connecting Real Circuit Breaker Sensors to DCRM Fault Detection System**

---

## 📋 Table of Contents

- [Hardware Requirements](#hardware-requirements)
- [Circuit Diagram](#circuit-diagram)
- [ESP32 Arduino Code](#esp32-arduino-code)
- [API Integration](#api-integration)
- [Setup Instructions](#setup-instructions)
- [Troubleshooting](#troubleshooting)

---

## 🛠️ Hardware Requirements

### **Essential Components**

| Component | Specification | Quantity | Purpose |
|-----------|--------------|----------|---------|
| ESP32 DevKit | ESP32-WROOM-32 | 1 | Microcontroller |
| DCRM Sensor | Resistance measurement sensor | 1 | Read contact resistance |
| ADC Module | ADS1115 (16-bit) or built-in ESP32 ADC | 1 | Analog to digital conversion |
| Power Supply | 5V 2A | 1 | Power ESP32 |
| Jumper Wires | Male-Female | 10-15 | Connections |
| Breadboard | Standard size | 1 | Prototyping |

### **Optional Components**
- OLED Display (128x64) for local status display
- LED indicators for fault status
- Push button for manual trigger
- SD Card module for local data logging

---

## 📐 Circuit Diagram

```
Circuit Breaker DCRM Sensor Connection
=====================================

DCRM Sensor        ESP32 DevKit
-----------        ------------
VCC (3.3V)  -----> 3.3V
GND         -----> GND
SIGNAL OUT  -----> GPIO 34 (ADC1_CH6)


Optional: External ADC (ADS1115)
================================

ADS1115            ESP32
-------            -----
VDD         -----> 3.3V
GND         -----> GND
SCL         -----> GPIO 22 (I2C SCL)
SDA         -----> GPIO 21 (I2C SDA)
A0          -----> DCRM Sensor Output


Status LEDs (Optional)
=====================

Component          ESP32
---------          -----
Green LED   -----> GPIO 2 (Normal)
Red LED     -----> GPIO 4 (Fault)
GND         -----> GND (through 220Ω resistor)
```

---

## 💻 ESP32 Arduino Code

### **Complete Arduino Sketch**

```cpp
/**
 * DCRM Fault Detection - ESP32 Data Acquisition
 * Reads circuit breaker resistance and sends to Flask API
 * Smart India Hackathon 2025
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ===== Configuration =====
const char* ssid = "YOUR_WIFI_SSID";           // Replace with your WiFi SSID
const char* password = "YOUR_WIFI_PASSWORD";   // Replace with your WiFi password
const char* serverURL = "http://YOUR_SERVER_IP:5000/predict";  // Flask API URL

// Pin Definitions
const int SENSOR_PIN = 34;        // ADC pin for DCRM sensor
const int GREEN_LED = 2;          // Normal status LED
const int RED_LED = 4;            // Fault status LED

// Measurement Configuration
const int SAMPLE_SIZE = 1000;     // Number of samples per waveform
const int SAMPLE_DELAY = 1;       // Delay between samples (ms)
const int READING_INTERVAL = 5000; // Time between readings (ms)

// Variables
float waveformData[SAMPLE_SIZE];
unsigned long lastReadingTime = 0;

void setup() {
  Serial.begin(115200);

  // Initialize LED pins
  pinMode(GREEN_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);

  // Initial LED state
  digitalWrite(GREEN_LED, LOW);
  digitalWrite(RED_LED, LOW);

  // Connect to WiFi
  connectToWiFi();

  Serial.println("\n=================================");
  Serial.println("DCRM Fault Detection - ESP32");
  Serial.println("System Ready!");
  Serial.println("=================================\n");
}

void loop() {
  unsigned long currentTime = millis();

  // Check if it's time to take a new reading
  if (currentTime - lastReadingTime >= READING_INTERVAL) {
    lastReadingTime = currentTime;

    // Read waveform data
    readDCRMWaveform();

    // Send to API and get prediction
    sendToAPI();
  }

  delay(100);
}

void connectToWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());

    // Blink green LED to indicate WiFi connection
    for (int i = 0; i < 3; i++) {
      digitalWrite(GREEN_LED, HIGH);
      delay(200);
      digitalWrite(GREEN_LED, LOW);
      delay(200);
    }
  } else {
    Serial.println("\nWiFi Connection Failed!");
    // Blink red LED to indicate failure
    for (int i = 0; i < 5; i++) {
      digitalWrite(RED_LED, HIGH);
      delay(200);
      digitalWrite(RED_LED, LOW);
      delay(200);
    }
  }
}

void readDCRMWaveform() {
  Serial.println("\n--- Reading DCRM Waveform ---");

  for (int i = 0; i < SAMPLE_SIZE; i++) {
    // Read analog value from sensor
    int rawValue = analogRead(SENSOR_PIN);

    // Convert to resistance (mOhm)
    // Adjust this formula based on your sensor characteristics
    // Formula: R = (rawValue / 4095.0) * MAX_RESISTANCE
    float resistance = (rawValue / 4095.0) * 5.0 + 2.0;  // Example: 2-7 mOhm range

    waveformData[i] = resistance;

    delay(SAMPLE_DELAY);

    // Print progress every 200 samples
    if (i % 200 == 0) {
      Serial.print("Progress: ");
      Serial.print((i * 100) / SAMPLE_SIZE);
      Serial.println("%");
    }
  }

  Serial.println("Waveform reading complete!");
}

void sendToAPI() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("ERROR: WiFi not connected!");
    connectToWiFi();
    return;
  }

  Serial.println("\n--- Sending Data to API ---");

  HTTPClient http;
  http.begin(serverURL);
  http.addHeader("Content-Type", "application/json");

  // Create JSON payload
  DynamicJsonDocument doc(20000);  // Adjust size based on SAMPLE_SIZE
  JsonArray waveformArray = doc.createNestedArray("waveform");

  for (int i = 0; i < SAMPLE_SIZE; i++) {
    waveformArray.add(waveformData[i]);
  }

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  // Send POST request
  int httpResponseCode = http.POST(jsonPayload);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("HTTP Response Code: ");
    Serial.println(httpResponseCode);

    // Parse response
    parseAPIResponse(response);
  } else {
    Serial.print("Error sending request: ");
    Serial.println(httpResponseCode);

    // Blink red LED for error
    digitalWrite(RED_LED, HIGH);
    delay(1000);
    digitalWrite(RED_LED, LOW);
  }

  http.end();
}

void parseAPIResponse(String response) {
  DynamicJsonDocument doc(2048);
  DeserializationError error = deserializeJson(doc, response);

  if (error) {
    Serial.print("JSON Parse Error: ");
    Serial.println(error.c_str());
    return;
  }

  bool success = doc["success"];
  if (success) {
    String faultType = doc["predicted_fault"];
    float confidence = doc["confidence"][faultType];

    Serial.println("\n=================================");
    Serial.println("FAULT DETECTION RESULT");
    Serial.println("=================================");
    Serial.print("Fault Type: ");
    Serial.println(faultType);
    Serial.print("Confidence: ");
    Serial.print(confidence);
    Serial.println("%");
    Serial.println("=================================\n");

    // Update LED status
    if (faultType == "normal") {
      digitalWrite(GREEN_LED, HIGH);
      digitalWrite(RED_LED, LOW);
    } else {
      digitalWrite(GREEN_LED, LOW);
      digitalWrite(RED_LED, HIGH);

      // Optional: Trigger alarm/buzzer
      triggerFaultAlarm();
    }
  } else {
    Serial.println("API Error: Analysis failed!");
  }
}

void triggerFaultAlarm() {
  // Optional: Add buzzer or additional alarm logic
  Serial.println("⚠️  FAULT DETECTED - ALARM TRIGGERED!");

  // Flash red LED rapidly
  for (int i = 0; i < 5; i++) {
    digitalWrite(RED_LED, HIGH);
    delay(100);
    digitalWrite(RED_LED, LOW);
    delay(100);
  }
  digitalWrite(RED_LED, HIGH);  // Keep it on
}
```

---

## 🔌 API Integration

### **WiFi Configuration**

Replace these in the code:
```cpp
const char* ssid = "Your_WiFi_Name";
const char* password = "Your_WiFi_Password";
const char* serverURL = "http://192.168.1.100:5000/predict";
```

### **Finding Your Server IP**

**On Windows:**
```bash
ipconfig
```
Look for "IPv4 Address"

**On Linux/Mac:**
```bash
ifconfig
```
or
```bash
ip addr show
```

### **Required Arduino Libraries**

Install these from Arduino Library Manager:
1. **WiFi** (built-in with ESP32)
2. **HTTPClient** (built-in with ESP32)
3. **ArduinoJson** by Benoit Blanchon

---

## 🚀 Setup Instructions

### **Step 1: Install Arduino IDE**
1. Download from [arduino.cc](https://www.arduino.cc/en/software)
2. Install ESP32 board support:
   - Go to File → Preferences
   - Add to "Additional Board Manager URLs":
     ```
     https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
     ```
   - Go to Tools → Board → Board Manager
   - Search "ESP32" and install

### **Step 2: Upload Code to ESP32**
1. Connect ESP32 to computer via USB
2. Open Arduino IDE
3. Select Board: **ESP32 Dev Module**
4. Select Port: (Your ESP32 COM port)
5. Paste the code above
6. Update WiFi credentials and server URL
7. Click **Upload** button

### **Step 3: Connect Hardware**
1. Connect DCRM sensor to GPIO 34
2. Connect LEDs to GPIO 2 and GPIO 4 (with 220Ω resistors)
3. Power ESP32 via USB or external 5V supply

### **Step 4: Test Connection**
1. Open Serial Monitor (115200 baud)
2. ESP32 should connect to WiFi
3. Watch for waveform readings
4. API responses should appear

---

## 🐛 Troubleshooting

### **WiFi Not Connecting**
- ✅ Check SSID and password
- ✅ Ensure 2.4GHz WiFi (ESP32 doesn't support 5GHz)
- ✅ Move ESP32 closer to router
- ✅ Check router firewall settings

### **API Not Responding**
- ✅ Verify Flask server is running on port 5000
- ✅ Check server IP address is correct
- ✅ Ensure ESP32 and server are on same network
- ✅ Disable firewall temporarily for testing
- ✅ Check Flask CORS settings

### **Sensor Readings Incorrect**
- ✅ Verify sensor connection to GPIO 34
- ✅ Check sensor power supply (3.3V)
- ✅ Calibrate resistance conversion formula
- ✅ Test with multimeter for reference

### **JSON Parsing Errors**
- ✅ Increase DynamicJsonDocument size
- ✅ Reduce SAMPLE_SIZE if memory issues
- ✅ Check API response format

---

## 📊 Data Flow Diagram

```
ESP32 → Sensor Reading → Waveform Array → 
  → WiFi → Flask API → AI Model → 
    → Fault Detection → JSON Response → 
      → ESP32 → LED Status + Serial Output
```

---

## 🔮 Advanced Features (Optional)

### **Local Storage**
Add SD card to store readings locally:
```cpp
#include <SD.h>
#include <SPI.h>

// Save waveform to SD card
void saveToSD() {
  File dataFile = SD.open("/waveform.csv", FILE_WRITE);
  for (int i = 0; i < SAMPLE_SIZE; i++) {
    dataFile.println(waveformData[i]);
  }
  dataFile.close();
}
```

### **OLED Display**
Show status on 0.96" OLED:
```cpp
#include <Adafruit_SSD1306.h>
#include <Adafruit_GFX.h>

Adafruit_SSD1306 display(128, 64, &Wire, -1);

void displayStatus(String faultType, float confidence) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0, 0);
  display.println("DCRM Monitor");
  display.println("-------------");
  display.print("Fault: ");
  display.println(faultType);
  display.print("Conf: ");
  display.print(confidence);
  display.println("%");
  display.display();
}
```

---

**Made with ❤️ for Smart India Hackathon 2025**
