import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
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
import UserServiceFactory from '../../factories/UserServiceFactory';

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
  const userService = UserServiceFactory.getInstance();

  const [config, setConfig] = useState<MatchX01Config>(
    new MatchX01Config(501, GameTypes.FirstTo, 1, 1, [''])
  );

  const hasSecondPlayer = config.playerNames.length > 1;

  useEffect(() => {
    const loadDefaultPlayerName = async () => {
      const user = await userService.getCurrentUser();
      if (user && user.name) {
        updateConfig({ playerNames: [user.name] });
      }
    };
    loadDefaultPlayerName();
  }, []);

  const updateConfig = (changes: Partial<IMatchX01Config>) => {
    setConfig(config.copyWith(changes));
  };

  const handlePlayerNameChange = (index: number, value: string) => {
    const newNames = [...config.playerNames];
    newNames[index] = value;
    updateConfig({ playerNames: newNames });
  };

  const handleAddPlayer = () => {
    if (!hasSecondPlayer) {
      const newNames = [...config.playerNames, ''];
      updateConfig({ playerNames: newNames });
    }
  };

  const handleRemovePlayer = () => {
    if (hasSecondPlayer) {
      const newNames = [config.playerNames[0]];
      updateConfig({ playerNames: newNames });
    }
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

          {/* Jugador 1 - siempre visible */}
          <TextInput
            description="Nombre del jugador 1"
            placeholder="Introduce el nombre"
            iconName="user"
            value={config.playerNames[0]}
            onChangeText={(val: string) => handlePlayerNameChange(0, val)}
            autoCapitalize="words"
          />

          {/* Jugador 2 - solo si se ha añadido */}
          {hasSecondPlayer && (
            <View style={styles.player2Row}>
              <View style={styles.player2Input}>
                <TextInput
                  description="Nombre del jugador 2"
                  placeholder="Introduce el nombre"
                  iconName="user"
                  value={config.playerNames[1]}
                  onChangeText={(val: string) => handlePlayerNameChange(1, val)}
                  autoCapitalize="words"
                />
              </View>
              <TouchableOpacity
                style={styles.removePlayerBtn}
                onPress={handleRemovePlayer}
                activeOpacity={0.7}
              >
                <Feather name="trash-2" size={20} color={theme.colors.inputTextError} />
              </TouchableOpacity>
            </View>
          )}

          {/* Botón añadir jugador */}
          {!hasSecondPlayer && (
            <TouchableOpacity
              style={styles.addPlayerBtn}
              onPress={handleAddPlayer}
              activeOpacity={0.7}
            >
              <Feather name="plus" size={18} color={theme.colors.buttonPrimaryBackground} />
              <Text style={styles.addPlayerText}>Añadir otro jugador</Text>
            </TouchableOpacity>
          )}
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
  player2Row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  player2Input: {
    flex: 1,
  },
  removePlayerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 34,
    marginLeft: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.buttonErrorBorder,
    borderRadius: theme.borderRadius.round,
  },
  addPlayerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.buttonPrimaryBackground,
    borderRadius: theme.borderRadius.xl,
  },
  addPlayerText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.buttonPrimaryBackground,
    marginLeft: theme.spacing.sm,
  },
  footer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.md,
  },
});
