import React from "react";
import { StyleSheet, View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";

interface ProgressCircleProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  bgColor?: string;
  pgColor?: string;
  label?: string;
  centerContent?: React.ReactNode;
}

export default function ProgressCircle({
  progress,
  size = 120,
  strokeWidth = 10,
  bgColor = Colors.primary[100],
  pgColor = Colors.primary[600],
  label,
  centerContent,
}: ProgressCircleProps) {
  const validProgress = Math.min(Math.max(progress, 0), 1);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference * (1 - validProgress);

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <Circle
          stroke={bgColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        <Circle
          stroke={pgColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>

      <View style={[styles.centerContent, { width: size, height: size }]}>
        {centerContent}
      </View>

      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    ...Typography.caption,
    marginTop: 8,
    color: Colors.neutral[600],
  },
});
