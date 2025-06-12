import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { Calendar } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Transaction, Device } from "@/types";
import { useAuth } from "@/context/auth";
import { useTheme } from "@/context/theme";
import { editTransactionAmount } from "@/services/firebase";
import { database } from "@/config/firebase";
import { ref, onValue, off } from "firebase/database";
import TransactionItem from "@/components/TransactionItem";
import EmptyState from "@/components/EmptyState";
import EditTransactionModal from "@/components/EditTransactionModal";

export default function TransactionsScreen() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | "all">("all");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "today" | "week" | "month"
  >("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedTransaction, setSelectedTransaction] = useState<{
    deviceId: string;
    id: string;
    transaction: Transaction;
  } | null>(null);
  const [isEditTransactionVisible, setIsEditTransactionVisible] =
    useState(false);

  const txRefs = useRef<any[]>([]);
  const txsByDevice = useRef<Record<string, Transaction[]>>({});
  useEffect(() => {
    if (devices.length === 0) {
      setTransactions([]);
      setSelectedDevice("all");
    } else if (
      selectedDevice !== "all" &&
      !devices.find((d) => d.id === selectedDevice)
    ) {
      setSelectedDevice("all");
    }
  }, [devices]);

  useEffect(() => {
    if (!user) return;
    const userId = user.uid;
    const devicesRef = ref(database, "devices");

    const updateCombinedTxs = () => {
      const all = Object.values(txsByDevice.current).flat();
      setTransactions(all);
    };

    const handleDevices = (snapshot: any) => {
      const data = snapshot.val() || {};
      const userDevices = Object.entries(data)
        .filter(
          ([, device]: any) =>
            device.connectedUsers && device.connectedUsers[userId]
        )
        .map(([id, device]: any) => ({ id, name: device.name } as Device));

      setDevices(userDevices);

      txRefs.current.forEach((r) => off(r));
      txRefs.current = [];
      txsByDevice.current = {};
      setTransactions([]);

      userDevices.forEach((device) => {
        const txRef = ref(database, `transactions/${device.id}`);
        txRefs.current.push(txRef);
        onValue(txRef, (txSnap) => {
          const txData = txSnap.val() || {};
          txsByDevice.current[device.id] = Object.entries(txData).map(
            ([txId, tx]: any) => ({
              id: txId,
              deviceId: device.id,
              deviceName: device.name,
              ...(tx as Transaction),
            })
          );
          updateCombinedTxs();
        });
      });
    };

    onValue(devicesRef, handleDevices);

    return () => {
      off(devicesRef, handleDevices);
      txRefs.current.forEach((r) => off(r));
    };
  }, [user]);

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (selectedDevice !== "all") {
      filtered = filtered.filter((tx) => tx.deviceId === selectedDevice);
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (selectedFilter) {
      case "today":
        filtered = filtered.filter((tx) => new Date(tx.timestamp) >= today);
        break;
      case "week":
        filtered = filtered.filter((tx) => new Date(tx.timestamp) >= weekAgo);
        break;
      case "month":
        filtered = filtered.filter((tx) => new Date(tx.timestamp) >= monthAgo);
        break;
    }

    filtered.sort((a, b) =>
      sortOrder === "asc"
        ? a.timestamp - b.timestamp
        : b.timestamp - a.timestamp
    );

    return filtered;
  }, [transactions, selectedDevice, selectedFilter, sortOrder]);

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={[styles.titleSmall, isDark && styles.darkText]}>Your</Text>
        <Text style={[styles.title, isDark && styles.darkText]}>
          Transactions
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.deviceFilterContainer}
      >
        <TouchableOpacity
          style={[
            styles.deviceFilterChip,
            selectedDevice === "all" && styles.deviceFilterChipActive,
            isDark && styles.darkDeviceFilterChip,
            selectedDevice === "all" &&
              isDark &&
              styles.darkDeviceFilterChipActive,
          ]}
          onPress={() => setSelectedDevice("all")}
        >
          <Text
            style={[
              styles.deviceFilterChipText,
              selectedDevice === "all" && styles.deviceFilterChipTextActive,
              isDark && styles.darkDeviceFilterChipText,
              selectedDevice === "all" &&
                isDark &&
                styles.darkDeviceFilterChipTextActive,
            ]}
          >
            All Devices
          </Text>
        </TouchableOpacity>

        {devices.map((device) => (
          <TouchableOpacity
            key={device.id}
            style={[
              styles.deviceFilterChip,
              selectedDevice === device.id && styles.deviceFilterChipActive,
              isDark && styles.darkDeviceFilterChip,
              selectedDevice === device.id &&
                isDark &&
                styles.darkDeviceFilterChipActive,
            ]}
            onPress={() => setSelectedDevice(device.id)}
          >
            <Text
              style={[
                styles.deviceFilterChipText,
                selectedDevice === device.id &&
                  styles.deviceFilterChipTextActive,
                isDark && styles.darkDeviceFilterChipText,
                selectedDevice === device.id &&
                  isDark &&
                  styles.darkDeviceFilterChipTextActive,
              ]}
            >
              {device.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.darkBackground]}>
      <FlatList
        style={[styles.container, isDark && styles.darkBackground]}
        contentContainerStyle={[
          styles.contentContainer,
          isDark && styles.darkBackground,
        ]}
        data={filteredTransactions}
        keyExtractor={(item) => `${item.deviceId}-${item.id}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.itemContainer, isDark && styles.darkItemContainer]}
            onPress={() => {
              setSelectedTransaction({
                deviceId: item.deviceId,
                id: item.id,
                transaction: item,
              });
              setIsEditTransactionVisible(true);
            }}
          >
            <TransactionItem
              transaction={item}
              deviceName={item.deviceName}
              isDark={isDark}
            />
          </TouchableOpacity>
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            title="No Transactions Yet"
            message="Start saving money to see your transactions here."
            icon={
              <Calendar
                size={48}
                color={isDark ? Colors.neutral[300] : Colors.neutral[400]}
              />
            }
          />
        }
      />

      {selectedTransaction && (
        <EditTransactionModal
          visible={isEditTransactionVisible}
          transaction={selectedTransaction.transaction}
          onClose={() => {
            setIsEditTransactionVisible(false);
            setSelectedTransaction(null);
          }}
          onSave={async ({ amountCents }) => {
            const { deviceId, id: txId } = selectedTransaction;
            try {
              await editTransactionAmount({
                deviceId,
                transactionId: txId,
                userId: user!.uid,
                newAmountCents: amountCents,
              });
              setIsEditTransactionVisible(false);
              setSelectedTransaction(null);
            } catch (e) {
              console.error("Failed to save edit:", e);
              Alert.alert("Error", "Could not save changes. Please try again.");
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, backgroundColor: Colors.neutral[50] },
  contentContainer: { padding: 16 },
  darkBackground: { backgroundColor: Colors.neutral[900] },

  deviceFilterContainer: { marginVertical: 16 },
  deviceFilterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    marginRight: 8,
  },
  deviceFilterChipActive: { backgroundColor: Colors.primary[600] },
  darkDeviceFilterChip: { backgroundColor: Colors.neutral[800] },
  darkDeviceFilterChipActive: { backgroundColor: Colors.primary[600] },
  deviceFilterChipText: { ...Typography.caption, color: Colors.neutral[600] },
  deviceFilterChipTextActive: { color: Colors.white },
  darkDeviceFilterChipText: { color: Colors.neutral[400] },
  darkDeviceFilterChipTextActive: { color: Colors.white },

  header: { justifyContent: "space-between", marginBottom: 24, paddingTop: 16 },
  titleSmall: { ...Typography.body1, color: Colors.neutral[600] },
  title: { ...Typography.h3, color: Colors.neutral[800] },
  darkText: { color: Colors.white },

  itemContainer: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.white,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkItemContainer: {
    backgroundColor: Colors.neutral[800],
  },
});
