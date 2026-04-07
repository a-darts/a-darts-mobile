import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { Keypad } from '../components/Keypad';
import { Toast } from '../components/Toast';
import { theme } from '../theme/theme';
import MatchX01ConfigServiceFactory from '../../factories/MatchX01ConfigServiceFactory';
import { PlayerX01 } from '../../../domain/models/PlayerX01';
import { MatchX01Config } from '../../../domain/models/MatchX01Config';


export const GameX01Screen = ({ navigation }) => {
  const matchService = MatchX01ConfigServiceFactory.getInstance();

  // ESTADO
  const [config, setConfig] = useState<MatchX01Config | null>(null);
  const [player, setPlayer] = useState<PlayerX01 | null>(null);

  // para forzar el re-render
  const [tick, setTick] = useState(0);

  // Input
  const [inputValue, setInputValue] = useState('');

  // Toast / Alert state
  const [toast, setToast] = useState({
    visible: false,
    title: '',
    description: '',
    type: 'error'
  });

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const loadGame = async () => {
      const matchConfig = await matchService.getMatchConfig();

      if (matchConfig) {
        setConfig(matchConfig);
        const newPlayer = new PlayerX01(
          matchConfig.playerNames[0],
          matchConfig.game,
          matchConfig.numSets,
          matchConfig.numLegs,
          matchConfig.typeOfGame,
        );
        setPlayer(newPlayer);
      } else {
        console.error('No hay configuración');
        navigation.back();
      }
    };
    loadGame();
  }, []);

  //
  const triggerToast = (title, description, type = 'error') => {
    setToast({ visible: true, title, description, type });
  };

  const handleKeyPress = (char: string) => {
    if (inputValue.length < 3) {
      setInputValue((prev) => prev + char);
    }
  };

  const handleBackspace = () => {
    setInputValue((prev) => prev.slice(0, -1));
  };
  //

  const submitScore = (scoreNum: number) => {
    if (player) {
      try {
        player.addThrow(scoreNum);
        // Forzamos re-render
        setTick(t => t + 1);
        setInputValue('');
      } catch (error) {
        triggerToast('Error', error.message, 'error');
        setInputValue('');
        return; //BORRAR
      }
    }
  };

  const handleEnter = () => {
    if (inputValue !== '') {
      submitScore(parseInt(inputValue, 10));
    }
  };

  const handleFastScore = (score: number) => {
    submitScore(score);
  };

  const handleUndo = () => {
    if (player) {
      player.undoLastThrow();
      // Forzamos re-render
      setTick(t => t + 1);
    }
  };

  if (!player || !config) return <View style={styles.container} />;

  return (
    <View style={styles.container}>

      {/* Toast Alert */}
      <Toast
        visible={toast.visible}
        title={toast.title}
        description={toast.description}
        type={toast.type}
        onFinished={() => setToast({ ...toast, visible: false })}
      />

      {/* Top Header Card */}
      <View style={styles.headerRow}>
        <View style={styles.playerCard}>
          <Text style={styles.playerName}>
            {player.name}
          </Text>
          <Text style={styles.scoreLeftText}>
            {player.remainingScore}
          </Text>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsText}>
            <Text style={styles.statsHighlight}>
              {player.numSetsWon}</Text> / {player.initialNumSets}</Text>
          <Text style={styles.statsLabel}>S E T S</Text>

          <Text style={[styles.statsText, { marginTop: 16 }]}>
            <Text style={styles.statsHighlight}>
              {player.numLegsWon}</Text> / {player.initialNumLegs}</Text>
          <Text style={styles.statsLabel}>L E G S</Text>
        </View>
      </View>

      {/* Table Area */}
      <View style={styles.tableContainer}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {player.throws.map((t, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableScore}>
                {t.score}
              </Text>
              <Text style={styles.tableRemaining}>
                {t.remainingScore}
              </Text>
              <Text style={styles.tableDartCount}>
                {t.dartCount}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Controls / Keypad Area */}
      <View style={styles.controlsArea}>

        {/* Top Control Bar */}
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

        {/* Keypad Grid */}
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
  },
  headerRow: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  playerCard: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.buttonPrimaryBackground,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.xl,
    backgroundColor: '#1E2512', // Subtle green hue matching design
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
    color: theme.colors.buttonPrimaryBackground,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 56,
  },
  statsCard: {
    flex: 1,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
  },
  statsText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.lg,
  },
  statsHighlight: {
    color: theme.colors.text,
  },
  statsLabel: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.xs,
    letterSpacing: 2,
    marginTop: 4,
  },

  tableContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  tableScore: {
    flex: 1,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.md,
    textAlign: 'center',
  },
  tableRemaining: {
    flex: 1,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.md,
    textAlign: 'center',
  },
  tableDartCount: {
    width: 60,
    backgroundColor: theme.colors.cardBackground,
    color: theme.colors.textSecondary,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.md,
  },

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
  }
});
