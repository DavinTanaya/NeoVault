import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ImageSourcePropType,
} from "react-native";
import { Award } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Achievement, AchievementDefinition } from "@/types";

interface AchievementCardProps {
  achievement: Achievement;
  definition: AchievementDefinition;
  unlocked: boolean;
  isDark?: boolean;
}

const achievementIcons: Record<string, React.ReactNode> = {
  first_deposit: <Award size={32} color={Colors.accent[400]} />,
  two_day_streak: <Award size={32} color={Colors.secondary[400]} />,
  seven_day_streak: <Award size={32} color={Colors.primary[600]} />,
  save_10000_cents: <Award size={32} color={Colors.primary[800]} />,
};

export default function AchievementCard({
  achievement,
  definition,
  unlocked,
  isDark,
}: AchievementCardProps) {
  const formattedDate = achievement.unlockedAt
    ? new Date(achievement.unlockedAt).toLocaleDateString()
    : null;

  return (
    <View
      style={[
        styles.container,
        !unlocked && styles.lockedContainer,
        isDark && styles.darkCard,
      ]}
    >
      <View style={styles.iconContainer}>
        {achievementIcons[achievement.id] || (
          <Award size={32} color={Colors.accent[400]} />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, isDark && styles.darkText]}>
          {definition.name}
        </Text>
        <Text style={[styles.description, isDark && styles.darkSubtext]}>
          {definition.description}
        </Text>
        {unlocked && formattedDate && (
          <Text style={styles.date}>Unlocked on {formattedDate}</Text>
        )}
        {!unlocked && <Text style={styles.locked}>Locked</Text>}
      </View>
    </View>
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
    alignItems: "center",
  },
  lockedContainer: {
    opacity: 0.7,
  },
  iconContainer: {
    backgroundColor: Colors.primary[50],
    borderRadius: 50,
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...Typography.h6,
    marginBottom: 4,
    color: Colors.neutral[800],
  },
  description: {
    ...Typography.body2,
    color: Colors.neutral[600],
    marginBottom: 4,
  },
  date: {
    ...Typography.caption,
    color: Colors.success[500],
  },
  darkCard: {
    backgroundColor: Colors.neutral[800],
  },
  darkText: {
    color: Colors.white,
  },
  darkSubtext: {
    color: Colors.neutral[400],
  },
  locked: {
    ...Typography.caption,
    color: Colors.neutral[500],
  },
});
