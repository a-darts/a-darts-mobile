import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../../theme/theme';
import { useKeypad } from '../hooks/useKeypad';

const { width, height } = Dimensions.get('window');
const aspectRatio = height / width;
const isTablet = aspectRatio < 1.6 && width > 600;


export const Keypad = ({
  onKeyPress,
  onBackspace,
  onEnter,
  onFastScore,
  onGameShot,
  remainingScore,
}) => {

  const {
    getButtonStatus,
    getGameShotStatus,
  } = useKeypad();


  const FastButton = ({ score }: { score: number }) => {
    const { isDisabled, style } = getButtonStatus(score, remainingScore);
    return (
      <TouchableOpacity
        style={[styles.fastBtn, style]}
        onPress={() => onFastScore(score)}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        <Text style={styles.fastNum}>{score}</Text>
      </TouchableOpacity>
    );
  };

  const GameShotButton = () => {
    const { isDisabled, style } = getGameShotStatus(remainingScore);
    return (
      <TouchableOpacity
        style={[styles.fastBtn, style]}
        onPress={onGameShot}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        <Text style={styles.gameShotBtnText}>DARDO</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.keypadRow}>
        <View style={styles.fastBtnContainer}>
          <GameShotButton />
        </View>
        <View style={styles.separator} />
        <TouchableOpacity style={styles.keyBtn} onPress={() => onKeyPress('1')}>
          <Text style={styles.keyNum}>1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.keyBtn} onPress={() => onKeyPress('2')}>
          <Text style={styles.keyNum}>2</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.keyBtn} onPress={() => onKeyPress('3')}>
          <Text style={styles.keyNum}>3</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.keypadRow}>
        <View style={styles.fastBtnContainer}>
          {isTablet ? (
            <>
              <FastButton score={26} />
              <FastButton score={60} />
              <FastButton score={100} />
            </>
          ) : (
            <>
              <FastButton score={26} />
              <FastButton score={45} />
            </>
          )}
        </View>
        <View style={styles.separator} />
        <TouchableOpacity style={styles.keyBtn} onPress={() => onKeyPress('4')}>
          <Text style={styles.keyNum}>4</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.keyBtn} onPress={() => onKeyPress('5')}>
          <Text style={styles.keyNum}>5</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.keyBtn} onPress={() => onKeyPress('6')}>
          <Text style={styles.keyNum}>6</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.keypadRow}>
        <View style={styles.fastBtnContainer}>
          {isTablet ? (
            <>
              <FastButton score={41} />
              <FastButton score={81} />
              <FastButton score={140} />
            </>
          ) : (
            <>
              <FastButton score={60} />
              <FastButton score={85} />
            </>
          )}
        </View>
        <View style={styles.separator} />
        <TouchableOpacity style={styles.keyBtn} onPress={() => onKeyPress('7')}>
          <Text style={styles.keyNum}>7</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.keyBtn} onPress={() => onKeyPress('8')}>
          <Text style={styles.keyNum}>8</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.keyBtn} onPress={() => onKeyPress('9')}>
          <Text style={styles.keyNum}>9</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.keypadRow}>
        <View style={styles.fastBtnContainer}>
          {isTablet ? (
            <>
              <FastButton score={45} />
              <FastButton score={85} />
              <FastButton score={180} />
            </>
          ) : (
            <>
              <FastButton score={100} />
              <FastButton score={140} />
            </>
          )}
        </View>
        <View style={styles.separator} />
        <TouchableOpacity style={styles.keyBtn} onPress={onBackspace}>
          <Feather name="delete" size={20} color={theme.colors.keyIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.keyBtn} onPress={() => onKeyPress('0')}>
          <Text style={styles.keyNum}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.keyBtn} onPress={onEnter}>
          <Feather name="corner-down-left" size={20} color={theme.colors.keyIcon} />
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
    marginTop: theme.spacing.sm,
  },
  keyBtn: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.keyBackground,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.keyBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fastBtnContainer: {
    flex: isTablet ? 3 : 2,
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  fastBtn: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.keyBackground,
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
    fontSize: theme.typography.sizes.lg,
  },
  fastNum: {
    color: theme.colors.keyTextSecondary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.lg,
  },
  gameShotBtnText: {
    color: theme.colors.keyTextSecondary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.lg,
  },
});
