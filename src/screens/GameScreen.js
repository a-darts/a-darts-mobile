import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '../components/Button';
import { theme } from '../theme/theme';

export const GameScreen = ({ navigation }) => {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const storedConfig = await AsyncStorage.getItem('@current_match_config');
        if (storedConfig) {
          setConfig(JSON.parse(storedConfig));
        }
      } catch (error) {
        console.error('Error loading match config:', error);
      }
    };
    loadConfig();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game Area</Text>
      
      {config && (
        <View style={styles.debugBox}>
          <Text style={styles.debugText}>Juego: {config.game}</Text>
          <Text style={styles.debugText}>Sets: {config.numSets} | Legs: {config.numLegs}</Text>
          <Text style={styles.debugText}>Tipo: {config.type}</Text>
          <Text style={styles.debugText}>Jugador: {config.playername}</Text>
        </View>
      )}

      <Button
        title="Terminar Partida"
        variant="secondary"
        onPress={() => navigation.navigate('HomeScreen')}
        style={{ marginTop: 24 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  title: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xxl,
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  debugBox: {
    backgroundColor: theme.colors.cardBackground,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  debugText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    marginVertical: 4,
  }
});
