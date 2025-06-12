import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Smartphone, Trash2 } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Device } from "@/types";

interface DeviceCardProps {
  id: string;
  device: Device;
  onPress?: () => void;
  onUnlink?: () => void;
  isDark?: boolean;
}

export default function DeviceCard({
  id,
  device,
  onPress,
  onUnlink,
  isDark,
}: DeviceCardProps) {
  const { name, connectedAt, status, lastSync } = device;

  const formattedDate = new Date(connectedAt).toLocaleDateString();
  const lastSyncDate = lastSync ? new Date(lastSync).toLocaleString() : "Never";

  return (
    <TouchableOpacity
      style={[styles.container, isDark && styles.darkCard]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, isDark && styles.darkIconContainer]}>
        <Smartphone size={24} color={Colors.primary[600]} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.name, isDark && styles.darkText]}>{name}</Text>
        <Text style={[styles.deviceId, isDark && styles.darkSubtext]}>
          ID: {id}
        </Text>
        <Text style={[styles.date, isDark && styles.darkSubtext]}>
          Connected on {formattedDate}
        </Text>
        <Text style={[styles.sync, isDark && styles.darkSubtext]}>
          Last sync: {lastSyncDate}
        </Text>
      </View>
      <View style={styles.rightContainer}>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusIndicator,
              status === "active" ? styles.statusActive : styles.statusInactive,
            ]}
          />
          <Text
            style={[
              styles.statusText,
              status === "active"
                ? styles.statusActiveText
                : styles.statusInactiveText,
            ]}
          >
            {status === "active" ? "Active" : "Inactive"}
          </Text>
        </View>
        {onUnlink && (
          <TouchableOpacity
            style={[styles.unlinkButton, isDark && styles.darkUnlinkButton]}
            onPress={onUnlink}
          >
            <Trash2
              size={16}
              color={isDark ? Colors.error[400] : Colors.error[600]}
            />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  darkCard: {
    backgroundColor: Colors.neutral[800],
  },
  iconContainer: {
    backgroundColor: Colors.primary[50],
    borderRadius: 12,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  darkIconContainer: {
    backgroundColor: Colors.primary[900],
  },
  content: {
    flex: 1,
  },
  rightContainer: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  name: {
    ...Typography.h6,
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  darkText: {
    color: Colors.white,
  },
  deviceId: {
    ...Typography.caption,
    color: Colors.neutral[500],
    marginBottom: 2,
  },
  darkSubtext: {
    color: Colors.neutral[400],
  },
  date: {
    ...Typography.caption,
    color: Colors.neutral[500],
    marginBottom: 2,
  },
  sync: {
    ...Typography.caption,
    color: Colors.neutral[500],
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusActive: {
    backgroundColor: Colors.success[500],
  },
  statusInactive: {
    backgroundColor: Colors.error[500],
  },
  statusText: {
    ...Typography.caption,
  },
  statusActiveText: {
    color: Colors.success[500],
  },
  statusInactiveText: {
    color: Colors.error[500],
  },
  unlinkButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.error[50],
  },
  darkUnlinkButton: {
    backgroundColor: Colors.error[900],
  },
});
