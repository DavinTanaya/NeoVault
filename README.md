# 🐖 NeoVault

NeoVault is a versatile savings ecosystem that includes:

- **Mobile & Web** – built with Expo SDK 52 and React Native
- **Firebase backend** for Auth, Realtime Database, and notifications
- **Arduino (.ino) sketches** for connecting physical PiggyBank devices

Track your deposits, unlock achievements, connect devices, and manage friends, whether you’re on mobile, web, or embedded hardware.

---
## 🎥 Demo Videos

<iframe width="560" height="315"
  src="https://www.youtube.com/embed/XW1LHSBwV0Y"
  title="YouTube video player"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen>
</iframe>


<video controls width="640">
  <source src="https://raw.githubusercontent.com/DavinTanaya/NeoVault/main/NeoVault_IOT.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

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
