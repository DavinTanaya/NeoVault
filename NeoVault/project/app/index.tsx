import { useEffect } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/context/auth";

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6A5ACD" />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/auth/login" />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});
