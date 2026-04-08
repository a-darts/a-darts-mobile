import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { ButtonGroup } from '../../components/ButtonGroup';
import { Stepper } from '../../components/Stepper';
import { Dropdown } from '../../components/Dropdown';
import { theme } from '../../theme/theme';
import { GamesX01 } from '../../../../backend/src/domain/enums/GamesX01';
import { GameTypes } from '../../../../backend/src/domain/enums/GameTypes';
import { styles } from './styles/ConfigX01.styles';
import { GAME_OPTIONS, TYPE_OPTIONS } from './constants/ConfigX01.constants';
import { useConfigX01 } from './hooks/useConfigX01';

export const ConfigX01Screen = ({ navigation }) => {
  const {
    config, handlePlay, updateConfig, hasSecondPlayer,
    handlePlayerNameChange, handleAddPlayer, handleRemovePlayer
  } = useConfigX01(navigation);

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

          {config.playerNames.map((name, index) => (
            <View key={index} style={index === 1 ? styles.player2Row : null}>
              <View style={index === 1 ? styles.player2Input : null}>
                <TextInput
                  description={`Nombre del jugador ${index + 1}`}
                  placeholder="Introduce el nombre"
                  iconName="user"
                  value={name}
                  onChangeText={(val: string) => handlePlayerNameChange(index, val)}
                  autoCapitalize="words"
                />
              </View>
              {index === 1 && (
                <TouchableOpacity style={styles.removePlayerBtn} onPress={handleRemovePlayer}>
                  <Feather name="trash-2" size={20} color={theme.colors.inputTextError} />
                </TouchableOpacity>
              )}
            </View>
          ))}

          {!hasSecondPlayer && (
            <TouchableOpacity style={styles.addPlayerBtn} onPress={handleAddPlayer}>
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
