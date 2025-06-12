import React, { createContext, useContext, useState, useEffect } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface NotificationsContextType {
  isEnabled: boolean;
  toggleNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const enabled = await AsyncStorage.getItem("notificationsEnabled");
      setIsEnabled(enabled === "true");
    } catch (error) {
      console.error("Error loading notification settings:", error);
    }
  };

  const toggleNotifications = async () => {
    try {
      if (!isEnabled) {
        if (Platform.OS !== "web") {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== "granted") {
            return;
          }
        }
      }

      await AsyncStorage.setItem(
        "notificationsEnabled",
        (!isEnabled).toString()
      );
      setIsEnabled(!isEnabled);
    } catch (error) {
      console.error("Error toggling notifications:", error);
    }
  };

  return (
    <NotificationsContext.Provider value={{ isEnabled, toggleNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
}
