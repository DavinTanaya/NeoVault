import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { useAuth } from "@/context/auth";
import { PiggyBank, Plus } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Device } from "@/types";
import DeviceCard from "@/components/DeviceCard";
import EmptyState from "@/components/EmptyState";
import EditDeviceModal from "@/components/EditDeviceModal";
import ConnectDeviceModal from "@/components/ConnectDeviceModal";
import {
  updateDevice,
  getConnectedDevices,
  unlinkDevice,
} from "@/services/firebase";
import { useTheme } from "@/context/theme";

export default function DevicesScreen() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<{
    id: string;
    device: Device;
  } | null>(null);
  const [isEditDeviceVisible, setIsEditDeviceVisible] = useState(false);
  const [isConnectDeviceVisible, setIsConnectDeviceVisible] = useState(false);

  useEffect(() => {
    if (user) {
      loadDevices();
    }
  }, [user]);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const connectedDevices = await getConnectedDevices(user!.uid);
      setDevices(connectedDevices);
    } catch (error) {
      console.error("Error loading devices:", error);
      Alert.alert("Error", "Failed to load devices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = () => {
    setIsConnectDeviceVisible(true);
  };

  const handleDevicePress = (deviceId: string, device: Device) => {
    setSelectedDevice({ id: deviceId, device });
    setIsEditDeviceVisible(true);
  };

  const handleEditDevice = async (data: { name: string }) => {
    if (selectedDevice) {
      try {
        await updateDevice(selectedDevice.id, data);
        setIsEditDeviceVisible(false);
        setSelectedDevice(null);
        loadDevices();
      } catch (error) {
        console.error("Error updating device:", error);
        Alert.alert("Error", "Failed to update device. Please try again.");
      }
    }
  };

  const handleUnlinkDevice = async (deviceId: string) => {
    Alert.alert(
      "Unlink Device",
      "Are you sure you want to unlink this device? You won't be able to see its transactions anymore.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Unlink",
          style: "destructive",
          onPress: async () => {
            try {
              await unlinkDevice(user!.uid, deviceId);
              loadDevices();
            } catch (error) {
              console.error("Error unlinking device:", error);
              Alert.alert(
                "Error",
                "Failed to unlink device. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={[styles.titleSmall, isDark && styles.darkText]}>Your</Text>
        <Text style={[styles.title, isDark && styles.darkText]}>
          Piggy Banks
        </Text>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={handleAddDevice}>
        <Plus size={24} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.darkBackground]}>
      <View style={[styles.container, isDark && styles.darkBackground]}>
        <FlatList
          data={devices}
          keyExtractor={(device) => device.id}
          renderItem={({ item: device }) => (
            <DeviceCard
              id={device.id}
              device={device}
              onPress={() => handleDevicePress(device.id, device)}
              onUnlink={() => handleUnlinkDevice(device.id)}
              isDark={isDark}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <EmptyState
              title="No Devices Connected"
              message="Connect a PiggyBank device to start tracking your savings automatically."
              icon={
                <PiggyBank
                  size={48}
                  color={isDark ? Colors.neutral[300] : Colors.neutral[400]}
                />
              }
              actionLabel="Connect Device"
              onAction={handleAddDevice}
              isDark={isDark}
            />
          }
          refreshing={loading}
          onRefresh={loadDevices}
        />
      </View>

      {selectedDevice && (
        <EditDeviceModal
          visible={isEditDeviceVisible}
          onClose={() => {
            setIsEditDeviceVisible(false);
            setSelectedDevice(null);
          }}
          onSave={handleEditDevice}
          device={selectedDevice.device}
          isDark={isDark}
        />
      )}

      <ConnectDeviceModal
        visible={isConnectDeviceVisible}
        onClose={() => {
          setIsConnectDeviceVisible(false);
          loadDevices();
        }}
        isDark={isDark}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
    padding: 16,
  },
  darkBackground: {
    backgroundColor: Colors.neutral[900],
  },
  darkText: {
    color: Colors.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 16,
  },
  titleSmall: {
    ...Typography.body1,
    color: Colors.neutral[600],
  },
  title: {
    ...Typography.h3,
    color: Colors.neutral[800],
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[600],
    justifyContent: "center",
    alignItems: "center",
  },
});
