import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme/theme';

export const Button = ({ title, onPress, variant = 'primary', style, iconName }) => {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        style
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.contentContainer}>
        <Text style={[
          styles.text,
          isPrimary ? styles.primaryText : styles.secondaryText,
          iconName && { marginRight: theme.spacing.sm }
        ]}>
          {title.toUpperCase()}
        </Text>
        {iconName && (
          <Feather 
            name={iconName} 
            size={20} 
            color={isPrimary ? theme.colors.buttonPrimaryIcon : theme.colors.buttonSecondaryIcon} 
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 14,
    width: '100%',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: theme.colors.buttonPrimaryBackground,
    // Glow effect
    shadowColor: theme.colors.buttonPrimaryShadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 10,
  },
  secondaryButton: {
    backgroundColor: theme.colors.buttonSecondaryBackground,
    borderWidth: 1,
    borderColor: theme.colors.buttonSecondaryBorder,
  },
  text: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.md,
    letterSpacing: 0.5,
  },
  primaryText: {
    color: theme.colors.buttonPrimaryText,
  },
  secondaryText: {
    color: theme.colors.buttonSecondaryText,
  }
});
