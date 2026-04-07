import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import { ButtonGroup } from '../components/ButtonGroup';
import { Stepper } from '../components/Stepper';
import { Dropdown } from '../components/Dropdown';
import { theme } from '../theme/theme';
import { MatchX01Config } from '../../../domain/models/MatchX01Config';
import { IMatchX01Config } from '../../../domain/models/MatchX01Config';
import { GamesX01 } from '../../../domain/enums/GamesX01';
import { GameTypes } from '../../../domain/enums/GameTypes';
import MatchX01ConfigServiceFactory from '../../factories/MatchX01ConfigServiceFactory';

const GAME_OPTIONS: { label: string; value: GamesX01 }[] = [
  { label: '501', value: 501 },
  { label: '301', value: 301 },
  { label: '170', value: 170 },
];

const TYPE_OPTIONS = [
  { label: 'A ganar', value: GameTypes.FirstTo },
  { label: 'Al mejor de', value: GameTypes.BestOf },
];

export const ConfigX01Screen = ({ navigation }) => {
  const matchService = MatchX01ConfigServiceFactory.getInstance();

  const [config, setConfig] = useState<MatchX01Config>(
    new MatchX01Config(501, GameTypes.FirstTo, 1, 1, 1, [''])
  );

  const updateConfig = (changes: Partial<IMatchX01Config>) => {
    setConfig(config.copyWith(changes));
  };

  const handlePlay = async () => {
    try {
      await matchService.saveMatchConfig(config);
      navigation.navigate('GameX01Screen');
    } catch (error) {
      console.error('Configuración inválida:', error.message);
      // MIRAR: mostrar un Alert.alert("Error", error.message)
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>JUEGO</Text>
          <ButtonGroup
            options={GAME_OPTIONS}
            selectedValue={config.game}
            onSelect={(val: GamesX01) => updateConfig({ game: val })}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SETS Y LEGS</Text>
          <Dropdown
            options={TYPE_OPTIONS}
            selectedValue={config.typeOfGame}
            onSelect={(val: GameTypes) => updateConfig({ typeOfGame: val })}
          />

          <View style={styles.steppersRow}>
            <Stepper
              label="Legs"
              value={config.numLegs}
              onChange={(val: number) => updateConfig({ numLegs: val })}
              min={1}
              max={99}
            />
            <Stepper
              label="Sets"
              value={config.numSets}
              onChange={(val: number) => updateConfig({ numSets: val })}
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
            value={config.playerNames[0]}
            onChangeText={(val: string) => updateConfig({ playerNames: [val] })}
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
