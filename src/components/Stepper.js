import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme/theme';

export const Stepper = ({ label, value, onChange, min = 1, max = 99 }) => {
  const isMin = value <= min;
  const isMax = value >= max;

  const handleMinus = () => {
    if (!isMin) onChange(value - 1);
  };

  const handlePlus = () => {
    if (!isMax) onChange(value + 1);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, isMin && styles.disabledButton]} 
        onPress={handleMinus}
        activeOpacity={0.7}
      >
        <Feather name="minus" size={20} color={isMin ? theme.colors.textSecondary : theme.colors.buttonPrimaryBackground} />
      </TouchableOpacity>
      
      <View style={styles.valueContainer}>
        <Text style={styles.valueText}>{value}</Text>
        <Text style={styles.labelText}>{label}</Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.button, isMax && styles.disabledButton]} 
        onPress={handlePlus}
        activeOpacity={0.7}
      >
        <Feather name="plus" size={20} color={isMax ? theme.colors.textSecondary : theme.colors.buttonPrimaryBackground} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.buttonPrimaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  disabledButton: {
    borderColor: theme.colors.textSecondary,
    backgroundColor: theme.colors.buttonSecondaryBackground, // slightly dark
  },
  valueContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
  },
  valueText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text,
  },
  labelText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
  }
});
