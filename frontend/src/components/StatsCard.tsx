import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';
import { Card } from './Card';

export const StatsCard = ({ title, content, style }) => {
  return (
    <Card style={[styles.statsCard, style]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.content}>{content}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  statsCard: {
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.statsCardBorder,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.statsCardTextSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  content: {
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.statsCardText,
    fontWeight: 'bold',
  },
});
