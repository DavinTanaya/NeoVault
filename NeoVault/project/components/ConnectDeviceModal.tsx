import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { DeviceConnection } from "@/types";
import { connectDevice } from "@/services/firebase";
import { useAuth } from "@/context/auth";
import Button from "./Button";

interface ConnectDeviceModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ConnectDeviceModal({
  visible,
  onClose,
}: ConnectDeviceModalProps) {
  const { user } = useAuth();
  const [connectionString, setConnectionString] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    if (!connectionString.trim()) {
      setError("Please enter a connection string");
      return;
    }

    if (!user) {
      setError("You must be logged in to connect a device");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await connectDevice(user.uid, connectionString);
      onClose();
    } catch (error: any) {
      setError(error.message || "Failed to connect device. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Connect New Device</Text>

          <Text style={styles.instructions}>
            Enter the connection string displayed on your PiggyBank device:
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={connectionString}
              onChangeText={(text) => {
                setConnectionString(text);
                setError(null);
              }}
              placeholder="Enter connection string"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Text style={styles.instructions}>
            1. Power on your NeoVault device{"\n"}
            2. Press and hold the connect button until the LED blinks{"\n"}
            3. Enter the connection string shown on the device's display
          </Text>

          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outline"
              style={styles.button}
              disabled={isLoading}
            />
            <Button
              title="Connect"
              onPress={handleConnect}
              style={styles.button}
              loading={isLoading}
              disabled={isLoading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 16,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  title: {
    ...Typography.h5,
    color: Colors.neutral[800],
    marginBottom: 24,
    textAlign: "center",
  },
  instructions: {
    ...Typography.body2,
    color: Colors.neutral[600],
    marginBottom: 24,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 12,
    padding: 16,
    ...Typography.body1,
  },
  errorText: {
    ...Typography.body2,
    color: Colors.error[600],
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  button: {
    minWidth: 140,
  },
});
