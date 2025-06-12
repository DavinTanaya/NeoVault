import React from "react";
import { Tabs } from "expo-router";
import {
  Chrome as Home,
  PiggyBank,
  Trophy,
  Banknote,
  User,
  Users,
} from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { useTheme } from "@/context/theme";

export default function TabLayout() {
  const { isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary[600],
        tabBarInactiveTintColor: Colors.neutral[400],
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: isDark ? Colors.neutral[800] : Colors.neutral[200],
          backgroundColor: isDark ? Colors.neutral[900] : Colors.white,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "Poppins-Regular",
          color: isDark ? Colors.white : Colors.neutral[800],
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color, size }) => (
            <Banknote color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="devices"
        options={{
          title: "Devices",
          tabBarIcon: ({ color, size }) => (
            <PiggyBank color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: "Achievements",
          tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Friends",
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
