import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { ArrowDown } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Transaction } from "@/types";

interface TransactionItemProps {
  transaction: Transaction;
  deviceName?: string;
  isDark?: boolean;
}

export default function TransactionItem({
  transaction,
  deviceName,
  isDark,
}: TransactionItemProps) {
  const { amountCents, timestamp, deviceId } = transaction;

  const formattedAmount = `Rp. ${(amountCents / 100).toLocaleString("ID-id")}`;

  const date = new Date(timestamp);
  const formattedDate = date.toLocaleDateString();
  const formattedTime = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <View style={[styles.iconContainer, isDark && styles.darkIconContainer]}>
        <ArrowDown color={Colors.secondary[400]} size={24} />
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.topRow}>
          <Text style={[styles.title, isDark && styles.darkText]}>Deposit</Text>
          <Text style={styles.amount}>{formattedAmount}</Text>
        </View>
        <View style={styles.bottomRow}>
          <Text style={[styles.info, isDark && styles.darkSubtext]}>
            {deviceName || deviceId} • {formattedDate} • {formattedTime}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    backgroundColor: Colors.white,
  },
  darkContainer: {
    backgroundColor: Colors.neutral[800],
    borderBottomColor: Colors.neutral[700],
  },
  darkText: {
    color: Colors.white,
  },
  darkSubtext: {
    color: Colors.neutral[400],
  },
  darkIconContainer: {
    backgroundColor: Colors.neutral[700],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary[50],
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    ...Typography.body1,
    color: Colors.neutral[800],
  },
  amount: {
    ...Typography.h6,
    color: Colors.secondary[500],
  },
  info: {
    ...Typography.caption,
    color: Colors.neutral[500],
  },
});
