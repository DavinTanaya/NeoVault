import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";

interface EditGoalModalProps {
  visible: boolean;
  currentGoalCents: number;
  onClose: () => void;
  onSave: (newGoalCents: number) => Promise<void>;
}

export default function EditGoalModal({
  visible,
  currentGoalCents,
  onClose,
  onSave,
}: EditGoalModalProps) {
  const [input, setInput] = useState<string>("");
  useEffect(() => {
    setInput((currentGoalCents / 100).toString());
  }, [currentGoalCents]);

  const handleSave = async () => {
    const dollars = parseFloat(input);
    if (isNaN(dollars) || dollars < 0) {
      return Alert.alert("Invalid value", "Please enter a positive number.");
    }
    const newCents = Math.round(dollars * 100);
    try {
      await onSave(newCents);
      onClose();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to update goal. Try again.");
    }
  };

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.title}>Edit Savings Goal</Text>
          <Text style={styles.label}>Amount (Rp)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={input}
            onChangeText={setInput}
          />
          <View style={styles.buttons}>
            <TouchableOpacity onPress={onClose} style={styles.button}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.button, styles.saveButton]}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "80%",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
  },
  title: { ...Typography.h5, marginBottom: 12 },
  label: { ...Typography.body2, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 6,
    padding: 8,
    marginBottom: 16,
    ...Typography.body1,
  },
  buttons: { flexDirection: "row", justifyContent: "flex-end" },
  button: { paddingHorizontal: 12, paddingVertical: 8 },
  cancelText: { ...Typography.body1, color: Colors.neutral[600] },
  saveButton: { backgroundColor: Colors.primary[600], borderRadius: 6 },
  saveText: { ...Typography.body1, color: Colors.white },
});
