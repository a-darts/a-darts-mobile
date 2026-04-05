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

        {/* Añadimos styles.fastColumnStart para crear el hueco */}
        <TouchableOpacity style={[styles.fastBtn, styles.fastColumnStart]} onPress={() => onFastScore(26)}><Text style={styles.fastNum}>26</Text></TouchableOpacity>
        <TouchableOpacity style={styles.fastBtn} onPress={() => onFastScore(45)}><Text style={styles.fastNum}>45</Text></TouchableOpacity>
      </View>

      <View style={styles.keypadRow}>
        <TouchableOpacity style={styles.keyBtn} onPress={() => onKeyPress('4')}><Text style={styles.keyNum}>4</Text></TouchableOpacity>
        <TouchableOpacity style={styles.keyBtn} onPress={() => onKeyPress('5')}><Text style={styles.keyNum}>5</Text></TouchableOpacity>
        <TouchableOpacity style={styles.keyBtn} onPress={() => onKeyPress('6')}><Text style={styles.keyNum}>6</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.fastBtn, styles.fastColumnStart]} onPress={() => onFastScore(60)}><Text style={styles.fastNum}>60</Text></TouchableOpacity>
        <TouchableOpacity style={styles.fastBtn} onPress={() => onFastScore(85)}><Text style={styles.fastNum}>85</Text></TouchableOpacity>
      </View>

      <View style={styles.keypadRow}>
        <TouchableOpacity style={styles.keyBtn} onPress={() => onKeyPress('7')}><Text style={styles.keyNum}>7</Text></TouchableOpacity>
        <TouchableOpacity style={styles.keyBtn} onPress={() => onKeyPress('8')}><Text style={styles.keyNum}>8</Text></TouchableOpacity>
        <TouchableOpacity style={styles.keyBtn} onPress={() => onKeyPress('9')}><Text style={styles.keyNum}>9</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.fastBtn, styles.fastColumnStart]} onPress={() => onFastScore(100)}><Text style={styles.fastNum}>100</Text></TouchableOpacity>
        <TouchableOpacity style={styles.fastBtn} onPress={() => onFastScore(140)}><Text style={styles.fastNum}>140</Text></TouchableOpacity>
      </View>

      <View style={styles.keypadRow}>
        <TouchableOpacity style={styles.keyBtn} onPress={onBackspace}>
          <Feather name="delete" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.keyBtn} onPress={() => onKeyPress('0')}><Text style={styles.keyNum}>0</Text></TouchableOpacity>
        <TouchableOpacity style={styles.keyBtn} onPress={onEnter}>
          <Feather name="corner-down-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.fastBtn, styles.fastColumnStart, { flex: 2 }]} activeOpacity={0.7}>
          <Text style={styles.fastNum}>DARDO</Text>
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
    marginBottom: theme.spacing.sm,
  },
  keyBtn: {
    flex: 1,
    backgroundColor: '#222222',
    height: 65,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fastBtn: {
    flex: 1,
    backgroundColor: '#222222',
    height: 65,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fastColumnStart: {
    marginLeft: theme.spacing.md,
  },
  keyNum: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.lg,
  },
  fastNum: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.md,
  }
});
