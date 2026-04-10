import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameX01 } from './hooks/useGameX01';
import { useKeypad } from './hooks/useKeypad';
import { GameTable } from './components/GameTable';
import { Keypad } from './components/Keypad';
import { Toast } from '../../components/Toast';
import { styles } from './styles/GameX01.styles';
import { Button } from '../../components/Button';
import { MaterialIcons } from '@expo/vector-icons';

export const GameX01Screen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();

  const {
    match, inputValue, toast, setToast, scrollViewRef,
    handleKeyPress, handleBackspace, handleUndo, submitScore,
    handleEnter, handleEnterRemaining, handleSwapStartingPlayer,
  } = useGameX01(navigation, route);

  const {
    isNotPossibleToCheckOut
  } = useKeypad();

  if (!match) {
    return <View style={styles.container} />;
  }

  const scoreInput = parseInt(inputValue, 10);
  const isLeftScoreButtonDisabled = inputValue === '' || isNotPossibleToCheckOut(scoreInput);

  const { players, activePlayer } = match;
  const activeIndex = (match as any).activePlayerIndex;

  const p1 = players[0];
  const p2 = players.length > 1 ? players[1] : null;

  const canSwapStartingPlayer =
    players.length > 1 && match.history.length === 0;

  return (
    <View style={[styles.container]}>
      <Toast
        visible={toast.visible}
        title={toast.title}
        description={toast.description}
        type={toast.type}
        onFinished={() => setToast(prev => ({ ...prev, visible: false }))}
      />

      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.spacer} />

        {/* Jugador 1 */}
        <View style={[styles.playerCard, activeIndex === 0 && styles.playerCardActive]}>
          <Text style={styles.playerName}>
            {p1.name}
          </Text>
          <Text style={[styles.scoreLeftText, activeIndex === 0 && styles.scoreActiveText]}>
            {p1.remainingScore}
          </Text>
        </View>

        <View style={styles.spacer} />

        {/* Marcador central  */}
        <View style={styles.statsCard}>
          <Text style={styles.statsRowText}>
            {p1.numSetsWon} - {p2?.numSetsWon ?? 0}
          </Text>
          <Text style={styles.statsLabel}>S E T S</Text>
          <Text style={[styles.statsRowText, { marginTop: 12 }]}>
            {p1.numLegsWon} - {p2?.numLegsWon ?? 0}
          </Text>
          <Text style={styles.statsLabel}>L E G S</Text>
        </View>

        {p2 && (
          <View style={styles.spacer} />
        )}

        {/* Jugador 2 */}
        {p2 && (
          <View style={[styles.playerCard, activeIndex === 1 && styles.playerCardActive]}>
            <Text style={styles.playerName}>
              {p2.name}
            </Text>
            <Text style={[styles.scoreLeftText, activeIndex === 1 && styles.scoreActiveText]}>
              {p2.remainingScore}
            </Text>
          </View>
        )}

        <View style={styles.spacer} />
      </View>

      <GameTable p1={p1} p2={p2} scrollViewRef={scrollViewRef} />

      {/* Controls Area */}
      <View style={[styles.controlsArea, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.controlBarRow}>
          <View style={styles.inputBox}>
            <Text style={styles.inputText}>
              {inputValue}
            </Text>
          </View>
          <View style={styles.spacer} />
          {canSwapStartingPlayer && (
            <TouchableOpacity
              onPress={handleSwapStartingPlayer}
              style={styles.swapButton}
            >
              <MaterialIcons
                name="swap-horiz"
                size={28}
                style={styles.swapButtonIcon}
              />
            </TouchableOpacity>
          )}
          <Button
            title='RESTO'
            variant='tertiary'
            onPress={handleEnterRemaining}
            disabled={isLeftScoreButtonDisabled}
            style={styles.topControlBtn}
          />
          <Button
            title='DESHACER'
            variant='tertiary'
            onPress={handleUndo}
            // disabled={!hasAnyMove}
            style={styles.topControlBtn}
          />
        </View>

        <Keypad
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onEnter={handleEnter}
          onFastScore={submitScore}
          remainingScore={activePlayer.remainingScore}
        />
      </View>
    </View>
  );
};
