import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import { ButtonGroup } from '../components/ButtonGroup';
import { Stepper } from '../components/Stepper';
import { Dropdown } from '../components/Dropdown';
import { theme } from '../theme/theme';

const GAME_OPTIONS = [
  { label: '501', value: '501' },
  { label: '301', value: '301' },
  { label: '170', value: '170' },
];

const TYPE_OPTIONS = [
  { label: 'A ganar', value: 'win' },
  { label: 'Al mejor de', value: 'bestOf' },
];

export const ConfigX01Screen = ({ navigation }) => {
  const [game, setGame] = useState('501');
  const [type, setType] = useState('win');
  const [numLegs, setNumLegs] = useState(1);
  const [numSets, setNumSets] = useState(1);
  const [playername, setPlayername] = useState('');

  const handlePlay = async () => {
    const matchConfig = {
      game,
      type,
      numLegs,
      numSets,
      playername: playername.trim() || 'Jugador 1'
    };

    try {
      await AsyncStorage.setItem('@current_match_config', JSON.stringify(matchConfig));
      navigation.navigate('GameX01Screen');
    } catch (error) {
      console.error('Error saving match config:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>JUEGO</Text>
          <ButtonGroup
            options={GAME_OPTIONS}
            selectedValue={game}
            onSelect={setGame}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SETS Y LEGS</Text>
          <Dropdown
            options={TYPE_OPTIONS}
            selectedValue={type}
            onSelect={setType}
          />

          <View style={styles.steppersRow}>
            <Stepper
              label="Legs"
              value={numLegs}
              onChange={setNumLegs}
              min={1}
              max={99}
            />
            <Stepper
              label="Sets"
              value={numSets}
              onChange={setNumSets}
              min={1}
              max={99}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>JUGADORES</Text>
          <TextInput
            description="Nombre del jugador 1"
            placeholder="Introduce el nombre"
            iconName="user"
            value={playername}
            onChangeText={setPlayername}
            autoCapitalize="words"
          />
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Jugar"
          iconName="play"
          onPress={handlePlay}
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
  scrollContent: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  steppersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xl,
  },
  playerLabel: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  footer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.md,
  }
});
