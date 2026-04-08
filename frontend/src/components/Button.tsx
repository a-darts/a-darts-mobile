import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
  style?: any;
  iconName?: any;
  disabled?: boolean;
}

const variantButtonStyles = {
  primary: 'primaryButton' as const,
  secondary: 'secondaryButton' as const,
  tertiary: 'tertiaryButton' as const,
};

const variantTextStyles = {
  primary: 'primaryText' as const,
  secondary: 'secondaryText' as const,
  tertiary: 'tertiaryText' as const,
};

const variantIconColors = {
  primary: theme.colors.buttonPrimaryIcon,
  secondary: theme.colors.buttonSecondaryIcon,
  tertiary: theme.colors.buttonTertiaryIcon,
};

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  style,
  iconName,
  disabled = false
}: ButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variantButtonStyles[variant]],
        style,
        disabled && { opacity: 0.2 }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <View style={styles.contentContainer}>
        <Text style={[
          styles.text,
          styles[variantTextStyles[variant]],
          iconName && { marginRight: theme.spacing.sm }
        ]}>
          {title.toUpperCase()}
        </Text>
        {iconName && (
          <Feather
            name={iconName}
            size={20}
            color={variantIconColors[variant]}
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
  tertiaryButton: {
    backgroundColor: theme.colors.buttonTertiaryBackground,
    borderWidth: 1,
    borderColor: theme.colors.buttonTertiaryBorder,
  },
  text: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.sm,
    letterSpacing: 0.5,
  },
  primaryText: {
    color: theme.colors.buttonPrimaryText,
  },
  secondaryText: {
    color: theme.colors.buttonSecondaryText,
  },
  tertiaryText: {
    color: theme.colors.buttonTertiaryText,
  }
});
