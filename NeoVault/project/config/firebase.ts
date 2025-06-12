import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  browserLocalPersistence,
} from "firebase/auth";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { Platform } from "react-native";

let getReactNativePersistence;
let AsyncStorage;
if (Platform.OS !== "web") {
  getReactNativePersistence =
    require("firebase/auth").getReactNativePersistence;
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
}

const validateFirebaseConfig = () => {
  const requiredEnvVars = [
    "EXPO_PUBLIC_FIREBASE_API_KEY",
    "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
    "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "EXPO_PUBLIC_FIREBASE_APP_ID",
    "EXPO_PUBLIC_FIREBASE_DATABASE_URL",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Firebase configuration variables: ${missingVars.join(
        ", "
      )}`
    );
  }
};
const getFirebaseConfig = () => {
  try {
    validateFirebaseConfig();

    return {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
      databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
    };
  } catch (error) {
    console.error("Firebase configuration error:", error);
    throw error;
  }
};

let app;
let auth;
let database;

try {
  app = initializeApp(getFirebaseConfig());

  auth =
    Platform.OS === "web"
      ? getAuth(app)
      : initializeAuth(app, {
          persistence: getReactNativePersistence(AsyncStorage),
        });

  database = getDatabase(app);
} catch (error) {
  console.error("Error initializing Firebase:", error);
  throw error;
}

export { app, auth, database };