import React from 'react';
import { TextInput as RNTextInput, StyleSheet, View, Text } from 'react-native';
import { theme } from '../theme/theme';
import { Feather } from '@expo/vector-icons';

export const TextInput = ({ label, error, iconName, ...props }) => {
  return (
    <View style={styles.container}>
      {(label || iconName) && (
        <View style={styles.labelContainer}>
          {iconName && (
            <Feather
              name={iconName}
              size={20}
              color={theme.colors.inputIcon}
              style={styles.labelIcon}
            />
          )}
          {label && <Text style={styles.label}>{label}</Text>}
        </View>
      )}
      <View style={[styles.inputContainer, error && styles.errorInputContainer]}>
        <RNTextInput
          style={styles.input}
          placeholderTextColor={theme.colors.inputPlaceholder}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelIcon: {
    marginRight: 6,
  },
  label: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.inputLabel,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
  },
  errorInputContainer: {
    borderWidth: 1,
    borderColor: theme.colors.inputBorderError,
  },
  input: {
    flex: 1,
    padding: 16,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    height: '100%',
  },
  errorText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.inputTextError,
    marginTop: 6,
  }
});
