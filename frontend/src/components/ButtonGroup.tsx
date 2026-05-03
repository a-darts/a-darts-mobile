import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

export const ButtonGroup = ({ options, selectedValue, onSelect }) => {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = selectedValue === option.value;

        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.button, isSelected && styles.selectedButton]}
            onPress={() => onSelect(option.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.text, isSelected && styles.selectedText]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  button: {
    flex: 1,
    minWidth: 128,
    height: 50,
    backgroundColor: theme.colors.buttonSecondaryBackground,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedButton: {
    borderColor: theme.colors.buttonPrimaryBackground,
  },
  text: {
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
  },
  selectedText: {
    color: theme.colors.buttonPrimaryBackground,
  }
});
