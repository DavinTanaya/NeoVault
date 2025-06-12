import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, Modal } from "react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Device } from "@/types";
import Button from "./Button";

interface EditDeviceModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { name: string }) => Promise<void>;
  device: Device;
}

export default function EditDeviceModal({
  visible,
  onClose,
  onSave,
  device,
}: EditDeviceModalProps) {
  const [name, setName] = useState(device.name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Device name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave({ name });
      onClose();
    } catch (error) {
      setError("Failed to update device. Please try again.");
    } finally {
      setLoading(false);
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
          <Text style={styles.title}>Edit Device</Text>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Device Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter device name"
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outline"
              style={styles.button}
            />
            <Button
              title="Save"
              onPress={handleSave}
              loading={loading}
              style={styles.button}
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
  },
  errorText: {
    ...Typography.body2,
    color: Colors.error[600],
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    ...Typography.body2,
    color: Colors.neutral[600],
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
    padding: 12,
    ...Typography.body1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  button: {
    minWidth: 100,
  },
});
