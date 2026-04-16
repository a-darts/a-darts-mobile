import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameX01 } from './hooks/useGameX01';
import { useKeypad } from './hooks/useKeypad';
import { GameTable } from './components/GameTable';
import { Keypad } from './components/Keypad';
import { Toast } from '../../components/Toast';
import { styles } from './styles/GameX01.styles';
import { Button } from '../../components/Button';

export const GameX01Screen = ({ navigation, route }: any) => {
  const {
    match, inputValue, toast, setToast, scrollViewRef,
    handleKeyPress, handleBackspace, handleUndo, submitScore,
    handleEnter, handleEnterRemaining, handleGameShot,
    handleSwapStartingPlayer,
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

  const canUndoLastThrow = match.history.length !== 0;

  return (
    <SafeAreaView style={[styles.container]} edges={['bottom']}>
      <Toast
        visible={toast.visible}
        title={toast.title}
        description={toast.description}
        type={toast.type}
        mode={toast.mode}
        onFinished={() => {
          setToast(prev => ({ ...prev, visible: false }))
          if (toast.onCloseAction) {
            toast.onCloseAction();
          }
        }}
      >
        {toast.title === '¿Con cuántos dardos has cerrado?' && (
          <View style={styles.toastButtonsContainer}>
            {[1, 2, 3].map((num) => (
              <Button
                key={num}
                title={num.toString()}
                variant='secondary'
                size="normal"
                onPress={() => {
                  submitScore(activePlayer.remainingScore, num);
                  setToast(prev => ({ ...prev, visible: false }));
                }}
              />
            ))}
          </View>
        )}
      </Toast>

      {/* Header */}
      <View style={styles.headerRow}>
        {/* Jugador 1 */}
        <View style={[styles.playerCard, activeIndex === 0 && styles.playerCardActive]}>
          <Text
            style={styles.playerName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {p1.name}
          </Text>
          <Text style={[styles.scoreLeftText, activeIndex === 0 && styles.scoreActiveText]}>
            {p1.remainingScore}
          </Text>
          <Text style={styles.averageText}>
            MEDIA: {p1.stats.average}
          </Text>
        </View>

        {/* Marcador central  */}
        <View style={styles.statsCard}>
          <Text style={styles.statsRowText}>
            {p1.numLegsWon}
            {p2 && (
              <Text> - {p2?.numLegsWon ?? 0}</Text>
            )}
          </Text>
          <Text style={styles.statsLabel}>LEGS</Text>
          <Text style={[styles.statsRowText, { marginTop: 10 }]}>
            {p1.numSetsWon}
            {p2 && (
              <Text> - {p2?.numSetsWon ?? 0}</Text>
            )}
          </Text>
          <Text style={styles.statsLabel}>SETS</Text>
        </View>

        {/* Jugador 2 */}
        {p2 && (
          <View style={[styles.playerCard, activeIndex === 1 && styles.playerCardActive]}>
            <Text
              style={styles.playerName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {p2.name}
            </Text>
            <Text style={[styles.scoreLeftText, activeIndex === 1 && styles.scoreActiveText]}>
              {p2.remainingScore}
            </Text>
            <Text style={styles.averageText}>
              MEDIA: {p2.stats.average}
            </Text>
          </View>
        )}
      </View>

      <GameTable p1={p1} p2={p2} scrollViewRef={scrollViewRef} />

      {canSwapStartingPlayer && (
        <Button
          title='Jugador inicial'
          iconName='swap-horiz'
          variant='tertiary'
          size='normal'
          onPress={handleSwapStartingPlayer}
          style={styles.swapButton}
        />
      )}

      {/* Controls Area */}
      <View style={[styles.controlsArea]}>
        <View style={styles.controlBarRow}>
          <View style={styles.buttonsRow}>
            <Button
              title='RESTO'
              variant='tertiary'
              size='small'
              onPress={handleEnterRemaining}
              disabled={isLeftScoreButtonDisabled}
              style={styles.topControlBtn}
            />
            <Button
              title='DESHACER'
              variant='tertiary'
              size='small'
              onPress={handleUndo}
              disabled={!canUndoLastThrow}
              style={styles.topControlBtn}
            />
          </View>
          <View style={styles.spacer} />
          <View style={styles.inputBox}>
            <Text style={styles.inputText}>
              {inputValue}
            </Text>
          </View>
        </View>

        <Keypad
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onEnter={handleEnter}
          onFastScore={submitScore}
          onGameShot={handleGameShot}
          remainingScore={activePlayer.remainingScore}
        />
      </View>
    </SafeAreaView>
  );
};
