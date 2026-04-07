import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme/theme';

export const Keypad = ({ onKeyPress, onBackspace, onEnter, onFastScore }) => {
  return (
    <View style={styles.container}>
      <View style={styles.keypadRow}>
        <TouchableOpacity style={styles.keyBtn} onPress={() => onKeyPress('1')}><Text style={styles.keyNum}>1</Text></TouchableOpacity>
        <TouchableOpacity style={styles.keyBtn} onPress={() => onKeyPress('2')}><Text style={styles.keyNum}>2</Text></TouchableOpacity>
        <TouchableOpacity style={styles.keyBtn} onPress={() => onKeyPress('3')}><Text style={styles.keyNum}>3</Text></TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity style={[styles.fastBtn]} onPress={() => onFastScore(26)}><Text style={styles.fastNum}>26</Text></TouchableOpacity>
        <TouchableOpacity style={styles.fastBtn} onPress={() => onFastScore(45)}><Text style={styles.fastNum}>45</Text></TouchableOpacity>
      </View>

      <View style={styles.keypadRow}>
        <TouchableOpacity style={styles.keyBtn} onPress={() => onKeyPress('4')}><Text style={styles.keyNum}>4</Text></TouchableOpacity>
        <TouchableOpacity style={styles.keyBtn} onPress={() => onKeyPress('5')}><Text style={styles.keyNum}>5</Text></TouchableOpacity>
        <TouchableOpacity style={styles.keyBtn} onPress={() => onKeyPress('6')}><Text style={styles.keyNum}>6</Text></TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity style={[styles.fastBtn]} onPress={() => onFastScore(60)}><Text style={styles.fastNum}>60</Text></TouchableOpacity>
        <TouchableOpacity style={styles.fastBtn} onPress={() => onFastScore(85)}><Text style={styles.fastNum}>85</Text></TouchableOpacity>
      </View>

      <View style={styles.keypadRow}>
        <TouchableOpacity style={styles.keyBtn} onPress={() => onKeyPress('7')}><Text style={styles.keyNum}>7</Text></TouchableOpacity>
        <TouchableOpacity style={styles.keyBtn} onPress={() => onKeyPress('8')}><Text style={styles.keyNum}>8</Text></TouchableOpacity>
        <TouchableOpacity style={styles.keyBtn} onPress={() => onKeyPress('9')}><Text style={styles.keyNum}>9</Text></TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity style={[styles.fastBtn]} onPress={() => onFastScore(100)}><Text style={styles.fastNum}>100</Text></TouchableOpacity>
        <TouchableOpacity style={styles.fastBtn} onPress={() => onFastScore(140)}><Text style={styles.fastNum}>140</Text></TouchableOpacity>
      </View>

      <View style={styles.keypadRow}>
        <TouchableOpacity style={styles.keyBtn} onPress={onBackspace}>
          <Feather name="delete" size={24} color={theme.colors.keyIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.keyBtn} onPress={() => onKeyPress('0')}><Text style={styles.keyNum}>0</Text></TouchableOpacity>
        <TouchableOpacity style={styles.keyBtn} onPress={onEnter}>
          <Feather name="corner-down-left" size={24} color={theme.colors.keyIcon} />
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity style={[styles.fastBtn, { flex: 2 }]} activeOpacity={0.7}>
          <Text style={styles.gameShot}>DARDO</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  keypadRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  keyBtn: {
    flex: 1,
    backgroundColor: theme.colors.keyBackground,
    height: 65,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.keyBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fastBtn: {
    flex: 1,
    backgroundColor: theme.colors.keyBackground,
    height: 65,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.keyBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    width: theme.spacing.md,
  },
  keyNum: {
    color: theme.colors.keyText,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xl,
  },
  fastNum: {
    color: theme.colors.keyTextSecondary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xl,
  },
  gameShot: {
    color: theme.colors.keyTextSecondary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.lg,
  }
});
