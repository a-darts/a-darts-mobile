import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { Keypad } from '../components/Keypad';
import { theme } from '../theme/theme';

export const GameX01Screen = ({ navigation }) => {
  const [config, setConfig] = useState(null);

  // Game state
  const [scoreLeft, setScoreLeft] = useState(501);
  const [initialScore, setInitialScore] = useState(501);
  const [wonSets, setWonSets] = useState(0);
  const [wonLegs, setWonLegs] = useState(0);

  // Throws log
  const [throws, setThrows] = useState([]);

  // Input
  const [inputValue, setInputValue] = useState('');

  // Toast / Alert state
  const [toastVisible, setToastVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const scrollViewRef = useRef();

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const storedConfig = await AsyncStorage.getItem('@current_match_config');
        if (storedConfig) {
          const parsed = JSON.parse(storedConfig);
          setConfig(parsed);
          const initial = parseInt(parsed.game, 10) || 501;
          setInitialScore(initial);
          setScoreLeft(initial);
        }
      } catch (error) {
        console.error('Error loading config:', error);
      }
    };
    loadConfig();
  }, []);

  const showToast = () => {
    setToastVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setToastVisible(false);
      });
    }, 1000);
  };

  const handleKeyPress = (char) => {
    if (inputValue.length < 3) {
      setInputValue((prev) => prev + char);
    }
  };

  const handleBackspace = () => {
    setInputValue((prev) => prev.slice(0, -1));
  };

  const submitScore = (scoreNum) => {
    if (scoreNum > scoreLeft) {
      showToast();
      setInputValue('');
      return;
    }

    const newScoreLeft = scoreLeft - scoreNum;
    const newDartCount = throws.length === 0 ? 3 : throws[throws.length - 1].dartCount + 3;

    const newThrow = {
      score: scoreNum,
      remaining: newScoreLeft,
      dartCount: newDartCount,
    };

    setThrows((prev) => [...prev, newThrow]);
    setScoreLeft(newScoreLeft);
    setInputValue('');

    // Auto scroll delay to ensure layout
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleEnter = () => {
    if (inputValue !== '') {
      submitScore(parseInt(inputValue, 10));
    }
  };

  const handleFastScore = (score) => {
    submitScore(score);
  };

  const handleUndo = () => {
    if (throws.length > 0) {
      const updatedThrows = [...throws];
      updatedThrows.pop();
      setThrows(updatedThrows);

      if (updatedThrows.length > 0) {
        setScoreLeft(updatedThrows[updatedThrows.length - 1].remaining);
      } else {
        setScoreLeft(initialScore);
      }
    }
  };

  if (!config) return <View style={styles.container} />; // Loading state placeholder

  const displayThrows = throws.slice(-15);
  // Re-prepend the start score only if we haven't scrolled past it
  const isStartVisible = throws.length <= 15;

  return (
    <View style={styles.container}>

      {/* Toast Alert */}
      {toastVisible && (
        <Animated.View style={[styles.toastContainer, { opacity: fadeAnim }]}>
          <Text style={styles.toastText}>¡Exceso!</Text>
          <Text style={styles.toastSubText}>Puntuación mayor al resto</Text>
        </Animated.View>
      )}

      {/* Top Header Card */}
      <View style={styles.headerRow}>
        <View style={styles.playerCard}>
          <Text style={styles.playerName}>{config.playername}</Text>
          <Text style={styles.scoreLeftText}>{scoreLeft}</Text>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsText}><Text style={styles.statsHighlight}>{wonSets}</Text> / {config.numSets}</Text>
          <Text style={styles.statsLabel}>S E T S</Text>

          <Text style={[styles.statsText, { marginTop: 16 }]}><Text style={styles.statsHighlight}>{wonLegs}</Text> / {config.numLegs}</Text>
          <Text style={styles.statsLabel}>L E G S</Text>
        </View>
      </View>

      {/* Table Area */}
      <View style={styles.tableContainer}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {isStartVisible && (
            <View style={styles.tableRow}>
              <Text style={styles.tableScore}> </Text>
              <Text style={styles.tableRemaining}>{initialScore}</Text>
              <Text style={styles.tableDartCount}>0</Text>
            </View>
          )}

          {displayThrows.map((t, index) => (
            <View style={styles.tableRow} key={`throw-${index}`}>
              <Text style={styles.tableScore}>{t.score}</Text>
              <Text style={styles.tableRemaining}>{t.remaining}</Text>
              <Text style={styles.tableDartCount}>{t.dartCount}</Text>
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
  },
  toastContainer: {
    position: 'absolute',
    top: '20%',
    bottom: '20%',
    left: '10%',
    right: '10%',
    backgroundColor: theme.colors.toastBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.toastBorder,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  toastText: {
    color: theme.colors.toastText,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.lg,
  },
  toastSubText: {
    color: theme.colors.toastText,
    fontFamily: theme.typography.fontFamily.bold,
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
    paddingTop: theme.spacing.xs,
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
    paddingBottom: theme.spacing.lg + 16, // SafeArea padding basically
  },
  controlBarRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  inputBox: {
    flex: 2,
    backgroundColor: '#333333',
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  inputText: {
    color: theme.colors.text,
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
