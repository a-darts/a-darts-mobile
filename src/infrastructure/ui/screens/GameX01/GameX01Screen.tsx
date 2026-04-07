import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameX01 } from './hooks/useGameX01';
import { GameTable } from './components/GameTable';
import { Keypad } from '../../components/Keypad';
import { Toast } from '../../components/Toast';
import { styles } from './styles/GameX01.styles';

export const GameX01Screen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const {
    match, inputValue, toast, setToast, scrollViewRef,
    handleKeyPress, handleBackspace, handleUndo, submitScore, handleEnter
  } = useGameX01(navigation);

  if (!match) return <View style={styles.container} />;

  const { players, activePlayerIndex } = match;
  const p1 = players[0];
  const p2 = players.length > 1 ? players[1] : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Toast
        visible={toast.visible}
        title={toast.title}
        description={toast.description}
        type={toast.type}
        onFinished={() => setToast(prev => ({ ...prev, visible: false }))}
      />

      {/* Header */}
      <View style={styles.headerRow}>
        <View style={[styles.playerCard, activePlayerIndex === 0 && styles.playerCardActive]}>
          <Text style={styles.playerName}>{p1.name}</Text>
          <Text style={[styles.scoreLeftText, activePlayerIndex === 0 && styles.scoreActiveText]}>{p1.remainingScore}</Text>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsRowText}>{p1.numSetsWon} - {p2?.numSetsWon ?? 0}</Text>
          <Text style={styles.statsLabel}>S E T S</Text>
          <Text style={[styles.statsRowText, { marginTop: 12 }]}>{p1.numLegsWon} - {p2?.numLegsWon ?? 0}</Text>
          <Text style={styles.statsLabel}>L E G S</Text>
        </View>

        {p2 && (
          <View style={[styles.playerCard, activePlayerIndex === 1 && styles.playerCardActive]}>
            <Text style={styles.playerName}>{p2.name}</Text>
            <Text style={[styles.scoreLeftText, activePlayerIndex === 1 && styles.scoreActiveText]}>{p2.remainingScore}</Text>
          </View>
        )}
      </View>

      <GameTable p1={p1} p2={p2} scrollViewRef={scrollViewRef} />

      {/* Controls Area */}
      <View style={[styles.controlsArea, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.controlBarRow}>
          <View style={styles.inputBox}><Text style={styles.inputText}>{inputValue}</Text></View>
          <TouchableOpacity style={styles.topControlBtn} onPress={handleUndo}>
            <Text style={styles.topControlText}>DESHACER</Text>
          </TouchableOpacity>
        </View>

        <Keypad
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onEnter={handleEnter}
          onFastScore={submitScore}
        />
      </View>
    </View>
  );
};
