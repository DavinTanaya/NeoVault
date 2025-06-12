# 🐖 NeoVault

NeoVault is a versatile savings ecosystem that includes:

- **Mobile & Web** – built with Expo SDK 52 and React Native
- **Firebase backend** for Auth, Realtime Database, and notifications
- **Arduino (.ino) sketches** for connecting physical PiggyBank devices

Track your deposits, unlock achievements, connect devices, and manage friends, whether you’re on mobile, web, or embedded hardware.

---
## 🎥 Demo Videos
### NeoVault IOT Demo(0:15)
[![▶ NeoVault IOT demo](https://img.youtube.com/vi/SjlLz7wAZBY/maxresdefault.jpg)](https://youtube.com/shorts/SjlLz7wAZBY)

### NeoVault APP Demo(1:22)
[![▶ NeoVault APP demo](https://img.youtube.com/vi/XW1LHSBwV0Y/maxresdefault.jpg)](https://youtube.com/shorts/XW1LHSBwV0Y)
---

## 🚀 Features

- **Secure Login & Signup** powered by Firebase Auth  
- **Real-time Transactions** synced via Firebase Realtime Database  
- **Device Pairing** with both virtual and Arduino-based PiggyBank hardware  
- **Achievements & Streaks** to keep you motivated  
- **Friends & Requests** for social saving  
- **Local Push Notifications** for deposits and achievements  

---

## 🏁 Getting Started

1. **Clone the repo**  
   ```bash
   git clone https://github.com/DavinTanaya/NeoVault.git
   cd NeoVault
   cd project

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the app**

   ```bash
   npx expo start -c
   ```

   Scan the QR code with Expo Go (use the Expo 52 client), or open in a simulator.

4. **Upload Arduino sketch**

   * Open any `.ino` file in the Arduino IDE
   * Configure your Wi-Fi and Firebase credentials in the top of the sketch
   * Upload to your compatible hardware (ESP32/ESP8266)

---
