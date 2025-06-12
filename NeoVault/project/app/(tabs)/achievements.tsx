import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, FlatList, SafeAreaView } from "react-native";
import { ref, onValue } from "firebase/database";
import { database } from "@/config/firebase";
import { useAuth } from "@/context/auth";
import { useTheme } from "@/context/theme";
import { Award } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Achievement, AchievementDefinition, Stats } from "@/types";
import AchievementCard from "@/components/AchievementCard";
import EmptyState from "@/components/EmptyState";

export default function AchievementsScreen() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [achievements, setAchievements] = useState<{
    [key: string]: Achievement;
  }>({});
  const [definitions, setDefinitions] = useState<{
    [key: string]: AchievementDefinition;
  }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    setLoading(true);

    const definitionsRef = ref(database, "achievementDefinitions");
    const definitionsUnsubscribe = onValue(definitionsRef, (snapshot) => {
      const data = snapshot.val();
      setDefinitions(data || {});
    });

    const statsRef = ref(database, `stats/${user?.uid}`);
    const statsUnsubscribe = onValue(statsRef, (snapshot) => {
      const data = snapshot.val() as Stats;
      setAchievements(data?.earnedAchievements || {});
      setLoading(false);
    });

    return () => {
      definitionsUnsubscribe();
      statsUnsubscribe();
    };
  };

  const getAchievementsList = () => {
    if (!definitions) return [];

    return Object.entries(definitions).map(([id, definition]) => {
      const earned = achievements[id];
      return {
        id,
        definition,
        achievement: earned || { id, name: definition.name, unlockedAt: 0 },
        unlocked: Boolean(earned),
      };
    });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={[styles.titleSmall, isDark && styles.darkText]}>Your</Text>
        <Text style={[styles.title, isDark && styles.darkText]}>
          Achievements
        </Text>
      </View>

      <View
        style={[styles.statsContainer, isDark && styles.darkStatsContainer]}
      >
        <Text style={[styles.statsText, isDark && styles.darkStatsText]}>
          {Object.keys(achievements).length} / {Object.keys(definitions).length}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.darkBackground]}>
      <FlatList
        style={[styles.container, isDark && styles.darkBackground]}
        contentContainerStyle={styles.contentContainer}
        data={getAchievementsList()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AchievementCard
            achievement={item.achievement}
            definition={item.definition}
            unlocked={item.unlocked}
            isDark={isDark}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            title="No Achievements Yet"
            message="Start saving to unlock achievements and track your progress."
            icon={
              <Award
                size={48}
                color={isDark ? Colors.neutral[300] : Colors.neutral[400]}
              />
            }
            isDark={isDark}
          />
        }
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
  },
  contentContainer: {
    padding: 16,
    flexGrow: 1,
  },
  darkBackground: {
    backgroundColor: Colors.neutral[900],
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
  darkText: {
    color: Colors.white,
  },
  statsContainer: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  darkStatsContainer: {
    backgroundColor: Colors.primary[900],
  },
  statsText: {
    ...Typography.caption,
    color: Colors.primary[700],
    fontFamily: "Poppins-Medium",
  },
  darkStatsText: {
    color: Colors.primary[300],
  },
});
