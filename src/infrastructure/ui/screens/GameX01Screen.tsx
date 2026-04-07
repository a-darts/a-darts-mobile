import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Keypad } from '../components/Keypad';
import { Toast } from '../components/Toast';
import { theme } from '../theme/theme';
import MatchX01ConfigServiceFactory from '../../factories/MatchX01ConfigServiceFactory';
import { PlayerX01 } from '../../../domain/models/PlayerX01';
import { MatchX01Config } from '../../../domain/models/MatchX01Config';
import { MatchX01 } from '../../../domain/models/MatchX01';

export const GameX01Screen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const matchService = MatchX01ConfigServiceFactory.getInstance();

  const [match, setMatch] = useState<MatchX01 | null>(null);

  // Para forzar re-render tras mutaciones
  const [tick, setTick] = useState(0);
  const [inputValue, setInputValue] = useState('');

  const [toast, setToast] = useState({
    visible: false, title: '', description: '', type: 'error'
  });

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const loadGame = async () => {
      const matchConfig = await matchService.getMatchConfig();
      if (!matchConfig) {
        console.error('No hay configuración');
        navigation.goBack();
        return;
      }
      setMatch(new MatchX01(matchConfig));
    };
    loadGame();
  }, []);

  const triggerToast = (title: string, description: string, type = 'error') => {
    setToast({ visible: true, title, description, type });
  };

  const handleKeyPress = (char: string) => {
    if (inputValue.length < 3) setInputValue(prev => prev + char);
  };

  const handleBackspace = () => setInputValue(prev => prev.slice(0, -1));

  const submitScore = (scoreNum: number) => {
    if (!match) return;
    try {
      match.addThrow(scoreNum);

      setTick(t => t + 1); // Forzamos re-render
      setInputValue('');
    } catch (error: any) {
      triggerToast('Error', error.message, 'error');
      setInputValue('');
    }
  };

  const handleEnter = () => {
    if (inputValue !== '') submitScore(parseInt(inputValue, 10));
  };

  const handleFastScore = (score: number) => submitScore(score);

  const handleUndo = () => {
    if (match) {
      match.currentPlayer.undoLastThrow();
      setTick(t => t + 1);
    }
  };

  if (!match) return <View style={styles.container} />;

  const { players, activePlayerIndex } = match;
  const p1 = players[0];
  const p2 = players.length > 1 ? players[1] : null;

  // Tabla de lanzamientos (la lógica se mantiene similar pero usando match)
  const maxThrows = Math.max(p1.throws.length, p2 ? p2.throws.length : 0);
  const throwRows = Array.from({ length: maxThrows }, (_, i) => ({
    p1: p1.throws[i] ?? null,
    p2: p2 ? p2.throws[i] ?? null : null,
    dartCount: p1.throws[i]?.dartCount ?? (p2?.throws[i]?.dartCount ?? i * 3),
  }));

  return (
    <View style={styles.container}>

      <Toast
        visible={toast.visible}
        title={toast.title}
        description={toast.description}
        type={toast.type}
        onFinished={() => setToast(t => ({ ...t, visible: false }))}
      />

      {/* ── Header ── */}
      <View style={styles.headerRow}>

        {/* Player 1 card */}
        <View style={[
          styles.playerCard,
          activePlayerIndex === 0 && styles.playerCardActive,
        ]}>
          <Text style={styles.playerName} numberOfLines={1}>{p1.name}</Text>
          <Text style={[styles.scoreLeftText, activePlayerIndex === 0 && styles.scoreActiveText]}>
            {p1.remainingScore}
          </Text>
        </View>

        {/* Central stats card */}
        <View style={styles.statsCard}>
          {/* Sets row */}
          <Text style={styles.statsRowText}>
            <Text style={styles.statsHighlight}>{p1.numSetsWon}</Text>
            <Text style={styles.statsSep}>{p2 ? ' - ' : ''}</Text>
            <Text style={styles.statsHighlight}>{p2 ? p2.numSetsWon : ''}</Text>
          </Text>
          <Text style={styles.statsLabel}>S E T S</Text>

          {/* Legs row */}
          <Text style={[styles.statsRowText, { marginTop: 12 }]}>
            <Text style={styles.statsHighlight}>{p1.numLegsWon}</Text>
            <Text style={styles.statsSep}>{p2 ? ' - ' : ''}</Text>
            <Text style={styles.statsHighlight}>{p2 ? p2.numLegsWon : ''}</Text>
          </Text>
          <Text style={styles.statsLabel}>L E G S</Text>
        </View>

        {/* Player 2 card (only when 2 players) */}
        {p2 && (
          <View style={[
            styles.playerCard,
            activePlayerIndex === 1 && styles.playerCardActive,
          ]}>
            <Text style={styles.playerName} numberOfLines={1}>{p2!.name}</Text>
            <Text style={[styles.scoreLeftText, activePlayerIndex === 1 && styles.scoreActiveText]}>
              {p2!.remainingScore}
            </Text>
          </View>
        )}
      </View>

      {/* ── Throws Table ── */}
      <View style={styles.tableContainer}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {throwRows.map((row, index) => (
            <View style={styles.tableRow} key={index}>

              {/* P1 columns: score | remaining */}
              <Text style={[styles.tableCol, styles.tableScore, styles.textRight]}>
                {row.p1 ? row.p1.score : ''}
              </Text>
              <Text style={[styles.tableCol, styles.tableRemaining, styles.textRight]}>
                {row.p1 ? row.p1.remainingScore : ''}
              </Text>

              {/* Centre dart count */}
              <Text style={styles.tableDartCount}>{row.dartCount}</Text>

              {/* P2 columns: remaining | score */}
              {p2 && (
                <>
                  <Text style={[styles.tableCol, styles.tableRemaining, styles.textLeft]}>
                    {row.p2 ? row.p2.remainingScore : ''}
                  </Text>
                  <Text style={[styles.tableCol, styles.tableScore, styles.textLeft]}>
                    {row.p2 ? row.p2.score : ''}
                  </Text>
                </>
              )}

            </View>
          ))}
        </ScrollView>
      </View>

      {/* ── Controls / Keypad ── */}
      <View style={styles.controlsArea}>
        <View style={styles.controlBarRow}>
          <View style={styles.inputBox}>
            <Text style={styles.inputText}>{inputValue}</Text>
          </View>
          <TouchableOpacity style={styles.topControlBtn} activeOpacity={0.7}>
            <Text style={styles.topControlText}>RESTO</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.topControlBtn} activeOpacity={0.7} onPress={handleUndo}>
            <Text style={styles.topControlText}>DESHACER</Text>
          </TouchableOpacity>
        </View>

        <Keypad
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onEnter={handleEnter}
          onFastScore={handleFastScore}
        />
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },

  // Player cards
  playerCard: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.line,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.cardBackground,
  },
  playerCardActive: {
    borderColor: theme.colors.buttonPrimaryBackground,
    backgroundColor: '#1E2512',
    shadowColor: theme.colors.buttonPrimaryBackground,
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  playerName: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.semiBold,
    marginBottom: 4,
    fontSize: theme.typography.sizes.sm,
  },
  scoreLeftText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 44,
  },
  scoreActiveText: {
    color: theme.colors.buttonPrimaryBackground,
  },

  // Stats card (centre)
  statsCard: {
    flex: 1,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
  },
  statsRowText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.md,
  },
  statsHighlight: {
    color: theme.colors.text,
  },
  statsSep: {
    color: theme.colors.textSecondary,
  },
  statsLabel: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.xs,
    letterSpacing: 2,
    marginTop: 2,
  },

  // Throws table
  tableContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  tableCol: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
  },
  tableScore: {
    color: theme.colors.textSecondary,
  },
  tableRemaining: {
    color: theme.colors.text,
  },
  textRight: {
    textAlign: 'right',
    paddingRight: theme.spacing.sm,
  },
  textLeft: {
    textAlign: 'left',
    paddingLeft: theme.spacing.sm,
  },
  tableDartCount: {
    width: 44,
    backgroundColor: theme.colors.cardBackground,
    color: theme.colors.textSecondary,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.md,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.sm,
  },

  // Controls
  controlsArea: {
    backgroundColor: theme.colors.cardBackground,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
  },
  controlBarRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  inputBox: {
    flex: 2,
    backgroundColor: theme.colors.inputBoxBackground,
    borderRadius: theme.borderRadius.md,
    borderBottomWidth: 1,
    borderColor: theme.colors.buttonPrimaryBackground,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  inputText: {
    color: theme.colors.inputText,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xl,
  },
  topControlBtn: {
    flex: 2,
    borderWidth: 1,
    borderColor: theme.colors.buttonPrimaryBackground,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  topControlText: {
    color: theme.colors.buttonPrimaryBackground,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.sm,
  },
});
