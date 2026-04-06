import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import { ButtonGroup } from '../components/ButtonGroup';
import { Stepper } from '../components/Stepper';
import { Dropdown } from '../components/Dropdown';
import { theme } from '../theme/theme';
import { MatchX01Config } from '../domain/models/MatchX01Config';
import { IMatchX01Config, GameTypes, GamesX01 } from '../domain/Ports';
import { MatchService } from '../domain/services/MatchService';

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
  const [game, setGame] = useState<GamesX01>(501);
  const [type, setType] = useState<GameTypes>(GameTypes.FirstTo);
  const [numLegs, setNumLegs] = useState(1);
  const [numSets, setNumSets] = useState(1);
  const [playername, setPlayername] = useState('');

  const handlePlay = async () => {
    try {
      // 1. Instanciamos el objeto de dominio
      const config = new MatchX01Config(
        game,
        type,
        numSets,
        numLegs,
        1, // MIRAR / CAMBIAR
        [playername.trim() || 'Jugador 1']
      );

      await MatchService.saveConfig(config);
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
            selectedValue={game}
            onSelect={(val: GamesX01) => setGame(val)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SETS Y LEGS</Text>
          <Dropdown
            options={TYPE_OPTIONS}
            selectedValue={type}
            onSelect={(val: GameTypes) => setType(val)}
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
