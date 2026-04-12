import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'normal' | 'large';
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

const sizeButtonStyles = {
  small: 'smallButton' as const,
  normal: 'normalButton' as const,
  large: 'largeButton' as const,
};

const sizeTextStyles = {
  small: 'smallText' as const,
  normal: 'normalText' as const,
  large: 'largeText' as const,
};

const sizeIconSizes = {
  small: 16,
  normal: 20,
  large: 24,
};

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  style,
  iconName,
  disabled = false
}: ButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variantButtonStyles[variant]],
        styles[sizeButtonStyles[size]],
        style,
        disabled && { opacity: 0.2 }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <View style={styles.contentContainer}>
        <Text style={[
          styles[variantTextStyles[variant]],
          styles[sizeTextStyles[size]],
          iconName && { marginRight: theme.spacing.sm }
        ]}>
          {title.toUpperCase()}
        </Text>
        {iconName && (
          <Feather
            name={iconName}
            size={sizeIconSizes[size]}
            color={variantIconColors[variant]}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.xl,
  },

  smallButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  normalButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  largeButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
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

  smallText: {
    fontSize: theme.typography.sizes.xs,
  },
  normalText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.sm,
  },
  largeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.md,
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
