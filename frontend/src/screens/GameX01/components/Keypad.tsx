import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../../theme/theme';
import { useKeypad } from '../hooks/useKeypad';
import { styles } from '../styles/Keypad.styles';
import { isTablet } from '../../../utils/device';

export const Keypad = ({
  onKeyPress,
  onBackspace,
  onEnter,
  onFastScore,
  onGameShot,
  onCheckout,
  remainingScore,
  isInputEmpty,
}: {
  onKeyPress: (num: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  onFastScore: (score: number) => void;
  onGameShot: () => void;
  onCheckout: (score: number, darts: number) => void;
  remainingScore: number;
  isInputEmpty?: boolean;
}) => {

  const {
    getButtonStatus,
    getGameShotStatus,
    canCheckoutWithDarts,
  } = useKeypad();


  const NumberKey = ({ num }: { num: string }) => {
    const n = parseInt(num, 10);
    const canCheckout = (n >= 1 && n <= 3) && canCheckoutWithDarts(remainingScore, n);

    return (
      <TouchableOpacity
        style={styles.keyBtn}
        onPress={() => onKeyPress(num)}
        onLongPress={() => {
          if (canCheckout && onCheckout) {
            onCheckout(remainingScore, n);
          }
        }}
        delayLongPress={500}
      >
        <Text style={[
          styles.keyNum,
          canCheckout && { color: theme.colors.keyTextCheckout }
        ]}>
          {num}
        </Text>
      </TouchableOpacity>
    );
  };


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
        <NumberKey num="1" />
        <NumberKey num="2" />
        <NumberKey num="3" />
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
        <NumberKey num="4" />
        <NumberKey num="5" />
        <NumberKey num="6" />
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
        <NumberKey num="7" />
        <NumberKey num="8" />
        <NumberKey num="9" />
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
        <TouchableOpacity
          style={[styles.keyBtn, isInputEmpty && { opacity: 0.3 }]}
          onPress={onBackspace}
          disabled={isInputEmpty}
          testID="btn-delete"
        >
          <Feather name="delete" size={20} color={theme.colors.keyIcon} />
        </TouchableOpacity>
        <NumberKey num="0" />
        <TouchableOpacity
          style={[styles.keyBtn, isInputEmpty && { opacity: 0.3 }]}
          onPress={onEnter}
          disabled={isInputEmpty}
          testID="btn-enter"
        >
          <Feather name="corner-down-left" size={20} color={theme.colors.keyIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
