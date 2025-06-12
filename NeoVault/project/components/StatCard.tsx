import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  isDark?: boolean;
}

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon,
  color = Colors.primary[600],
  isDark = false,
}: StatCardProps) {
  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <View style={styles.topRow}>
        <Text style={[styles.title, isDark && styles.darkText]}>{title}</Text>
        {icon && (
          <View style={[styles.iconContainer, isDark && styles.darkIconContainer]}>
            {icon}
          </View>
        )}
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, isDark && styles.darkSubtext]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  darkContainer: {
    backgroundColor: Colors.neutral[800],
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    ...Typography.body2,
    color: Colors.neutral[600],
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    ...Typography.h3,
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.neutral[500],
  },
});