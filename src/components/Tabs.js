import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

export const Tabs = ({ options, activeIndex, onChange }) => {
  return (
    <View style={styles.tabsContainer}>
      {options.map((option, index) => {
        const isActive = activeIndex === index;
        return (
          <TouchableOpacity
            key={index}
            style={[styles.tab, isActive ? styles.activeTab : styles.inactiveTab]}
            onPress={() => onChange(index)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, isActive ? styles.activeTabText : styles.inactiveTabText]}>
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.tabInactiveBorder || theme.colors.border || '#333333',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.tabActiveBorder || theme.colors.primary,
  },
  inactiveTab: {
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: theme.typography.sizes.md,
  },
  activeTabText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.tabActiveText || theme.colors.text,
  },
  inactiveTabText: {
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.tabInactiveText || theme.colors.textSecondary,
  },
});
