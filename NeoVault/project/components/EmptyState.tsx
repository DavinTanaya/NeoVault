import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { AlertCircle } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import Button from "./Button";

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title,
  message,
  icon,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {icon || <AlertCircle size={48} color={Colors.neutral[400]} />}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    ...Typography.h5,
    color: Colors.neutral[800],
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    ...Typography.body2,
    color: Colors.neutral[600],
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    minWidth: 150,
  },
});
