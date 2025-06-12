import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { ref, onValue } from "firebase/database";
import { database } from "@/config/firebase";
import { useAuth } from "@/context/auth";
import { PiggyBank, TrendingUp, Calendar, Award } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Stats, Transaction, User, Device } from "@/types";
import { useTheme } from "@/context/theme";
import StatCard from "@/components/StatCard";
import ProgressCircle from "@/components/ProgressCircle";
import TransactionItem from "@/components/TransactionItem";
import { getRecentTransactions, updateGoal } from "@/services/firebase";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import EditGoalModal from "@/components/EditGoalModal";

function calculateStreak(transactions: Transaction[]): number {
  const dateSet = new Set(
    transactions.map((tx) => {
      const d = new Date(tx.timestamp);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentDay = today;
  if (!dateSet.has(currentDay.getTime())) {
    currentDay = new Date(currentDay.getTime() - 24 * 60 * 60 * 1000);
  }

  while (dateSet.has(currentDay.getTime())) {
    streak++;
    currentDay = new Date(currentDay.getTime() - 24 * 60 * 60 * 1000);
  }

  return streak;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [userData, setUserData] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalCents: 0,
    streakDays: 0,
    earnedAchievements: {},
  });
  const [dynamicTotal, setDynamicTotal] = useState(0);
  const [computedStreak, setComputedStreak] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const [refreshing, setRefreshing] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<Device[]>([]);
  const [goalCents, setGoalCents] = useState(10000);
  const [isEditGoalVisible, setIsEditGoalVisible] = useState(false);

  const transactionsByDevice = useRef<Record<string, Transaction[]>>({});
  const txRefs = useRef<any[]>([]);
  useEffect(() => {
    if (!user) return;
    const devicesRef = ref(database, "devices");
    const unsubscribeDevices = onValue(devicesRef, (snapshot) => {
      const all = snapshot.val() || {};
      const userDevices: Device[] = Object.entries(all)
        .filter(([_, dev]: any) => dev.connectedUsers?.[user.uid])
        .map(([id, dev]: any) => ({ id, ...dev }));
      setConnectedDevices(userDevices);
    });
    return () => unsubscribeDevices();
  }, [user]);

  useEffect(() => {
    const goalRef = ref(
      database,
      "achievementDefinitions/save_10000_cents/criteria/value"
    );
    const unsubscribeGoal = onValue(goalRef, (snap) => {
      const val = snap.val();
      if (typeof val === "number") setGoalCents(val);
    });
    return () => unsubscribeGoal();
  }, []);

  useEffect(() => {
    if (!user) return;
    txRefs.current.forEach((unsub) => unsub());
    txRefs.current = [];
    transactionsByDevice.current = {};

    if (connectedDevices.length === 0) {
      setDynamicTotal(0);
      setComputedStreak(0);
      return;
    }
    connectedDevices.forEach((device) => {
      const txRef = ref(database, `transactions/${device.id}`);
      const unsubscribe = onValue(txRef, (snap) => {
        const data = snap.val() || {};
        transactionsByDevice.current[device.id] = Object.entries(data).map(
          ([, tx]: any) => tx as Transaction
        );
        const allTx = Object.values(transactionsByDevice.current).flat();
        const total = allTx.reduce((sum, tx) => sum + (tx.amountCents || 0), 0);
        setDynamicTotal(total);
        setComputedStreak(calculateStreak(allTx));
      });
      txRefs.current.push(unsubscribe);
    });

    return () => txRefs.current.forEach((unsub) => unsub());
  }, [connectedDevices, user]);

  useEffect(() => {
    if (!user) return;
    const userRef = ref(database, `users/${user.uid}`);
    const unsubscribeUser = onValue(userRef, (snap) => setUserData(snap.val()));

    const statsRef = ref(database, `stats/${user.uid}`);
    const unsubscribeStats = onValue(statsRef, (snap) => {
      const db = snap.val() || {};
      setStats({
        totalCents: db.totalCents || 0,
        streakDays: db.streakDays || 0,
        earnedAchievements: db.earnedAchievements || {},
      });
    });

    return () => {
      unsubscribeUser();
      unsubscribeStats();
    };
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      getRecentTransactions(user.uid, 3).then(setRecentTransactions);
    }, [user])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    if (user)
      await getRecentTransactions(user.uid, 3).then(setRecentTransactions);
    setRefreshing(false);
  };
  const formatMoney = (cents: number) =>
    `Rp. ${(cents / 100).toLocaleString("ID-id")}`;
  const progress =
    dynamicTotal && goalCents ? Math.min(dynamicTotal / goalCents, 1) : 0;

  const router = useRouter();

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.darkBackground]}>
      <ScrollView
        style={[styles.container, isDark && styles.darkBackground]}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.greeting, isDark && styles.darkText]}>
            Hello,
          </Text>
          <Text style={[styles.userName, isDark && styles.darkText]}>
            {" "}
            {userData?.displayName || "User"}
          </Text>
        </View>

        <View style={[styles.balanceCard, isDark && styles.darkCard]}>
          <Text style={styles.balanceLabel}>Total Savings</Text>
          <Text style={styles.balanceAmount}>{formatMoney(dynamicTotal)}</Text>
          <View style={styles.streakContainer}>
            <Calendar size={16} color={Colors.primary[200]} />
            <Text style={styles.streakText}>
              {computedStreak} day{computedStreak !== 3 ? "s" : ""} streak
            </Text>
          </View>
        </View>

        <View style={styles.goalSection}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
            Savings Goal
          </Text>
          <TouchableOpacity onPress={() => setIsEditGoalVisible(true)}>
            <Text style={styles.editGoalText}>Edit Goal</Text>
          </TouchableOpacity>
          <View style={[styles.goalCard, isDark && styles.darkCard]}>
            <ProgressCircle
              progress={progress}
              size={100}
              pgColor={Colors.accent[400]}
              bgColor={isDark ? Colors.neutral[800] : Colors.primary[100]}
              centerContent={
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={[styles.goalProgressText, isDark && styles.darkText]}
                  >
                    {Math.round(progress * 100)}%
                  </Text>
                </View>
              }
              label={`Towards Rp. ${(goalCents / 100).toLocaleString("ID-id")}`}
            />
            <View style={styles.goalInfo}>
              <Text style={[styles.goalTitle, isDark && styles.darkText]}>
                First Savings Goal
              </Text>
              <Text
                style={[styles.goalDescription, isDark && styles.darkSubtext]}
              >
                Save Rp. {(goalCents / 100).toLocaleString("ID-id")} to unlock
                your first achievement!
              </Text>
              <Text
                style={[
                  styles.goalAmount,
                  isDark && { color: Colors.accent[300] },
                ]}
              >
                {formatMoney(dynamicTotal)} /{" "}
                {(goalCents / 100).toLocaleString("ID-id")}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              title="Total Saved"
              value={formatMoney(dynamicTotal)}
              subtitle="All time"
              icon={<TrendingUp size={16} color={Colors.primary[600]} />}
              color={Colors.primary[600]}
              isDark={isDark}
            />
            <StatCard
              title="Streak"
              value={`${computedStreak} days`}
              subtitle="Current"
              icon={<Calendar size={16} color={Colors.secondary[400]} />}
              color={Colors.secondary[400]}
              isDark={isDark}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              title="Achievements"
              value={Object.keys(stats.earnedAchievements).length}
              subtitle="Unlocked"
              icon={<Award size={16} color={Colors.accent[400]} />}
              color={Colors.accent[400]}
              isDark={isDark}
            />
            <StatCard
              title="Piggy Banks"
              value={connectedDevices.length}
              subtitle="Connected"
              icon={<PiggyBank size={16} color={Colors.primary[800]} />}
              color={Colors.primary[800]}
              isDark={isDark}
            />
          </View>
        </View>

        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
              Recent Transactions
            </Text>
            <TouchableOpacity onPress={() => router.push("/transactions")}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.transactionsList, isDark && styles.darkCard]}>
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx, idx) => (
                <TransactionItem
                  key={tx.id || idx}
                  transaction={tx}
                  isDark={isDark}
                />
              ))
            ) : (
              <View style={styles.emptyTransactions}>
                <Text
                  style={[
                    styles.emptyTransactionsText,
                    isDark && styles.darkSubtext,
                  ]}
                >
                  No transactions yet. Start saving!
                </Text>
              </View>
            )}
          </View>
        </View>
        <EditGoalModal
          visible={isEditGoalVisible}
          currentGoalCents={goalCents}
          onClose={() => setIsEditGoalVisible(false)}
          onSave={async (newGoal) => {
            await updateGoal("save_10000_cents", newGoal);
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },
  container: { flex: 1, backgroundColor: Colors.neutral[50] },
  contentContainer: { padding: 16 },
  darkBackground: { backgroundColor: Colors.neutral[900] },
  darkCard: { backgroundColor: Colors.neutral[800] },
  darkText: { color: Colors.white },
  darkSubtext: { color: Colors.neutral[400] },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 8,
  },
  greeting: { ...Typography.body1, color: Colors.neutral[600] },
  userName: { ...Typography.h4, color: Colors.neutral[800] },
  balanceCard: {
    backgroundColor: Colors.primary[600],
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  balanceLabel: {
    ...Typography.body2,
    color: Colors.primary[200],
    marginBottom: 8,
  },
  balanceAmount: { ...Typography.h1, color: Colors.white, marginBottom: 16 },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary[700],
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  streakText: { ...Typography.caption, color: Colors.white, marginLeft: 6 },
  goalSection: { marginBottom: 24 },
  sectionTitle: {
    ...Typography.h5,
    color: Colors.neutral[800],
    marginBottom: 16,
  },
  goalCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  editGoalText: {
    ...Typography.body2,
    color: Colors.primary[600],
    fontFamily: "Poppins-Medium",
  },
  goalProgressText: { ...Typography.h3, color: Colors.accent[400] },
  goalInfo: { flex: 1, marginLeft: 16 },
  goalTitle: { ...Typography.h6, color: Colors.neutral[800], marginBottom: 4 },
  goalDescription: {
    ...Typography.body2,
    color: Colors.neutral[600],
    marginBottom: 8,
  },
  goalAmount: {
    ...Typography.body1,
    color: Colors.accent[400],
    fontFamily: "Poppins-Medium",
  },
  statsGrid: { marginBottom: 24 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  transactionsSection: { marginBottom: 32 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllText: {
    ...Typography.body2,
    color: Colors.primary[600],
    fontFamily: "Poppins-Medium",
  },
  transactionsList: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyTransactions: { padding: 24, alignItems: "center" },
  emptyTransactionsText: { ...Typography.body2, color: Colors.neutral[500] },
});
