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
import { styles } from './styles/ConfigX01.styles';
import { GAME_OPTIONS, TYPE_OPTIONS } from './constants/ConfigX01.constants';
import { useConfigX01 } from './hooks/useConfigX01';
import { error } from 'console';


type GamesX01 = 170 | 301 | 501;

enum GameTypes {
  BestOf = 'bestOf',
  FirstTo = 'firstTo',
}


export const ConfigX01Screen = ({ navigation }) => {
  const {
    config, handlePlay, updateConfig, hasSecondPlayer,
    handlePlayerNameChange, handleAddPlayer, handleRemovePlayer, error
  } = useConfigX01(navigation);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.containerStyle}>

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
                max={19}
              />
              <Stepper
                label="Sets"
                value={config.numSets}
                onChange={(val: number) => updateConfig({ numSets: val })}
                min={1}
                max={19}
              />
            </View>
            {error && (
              <Text style={styles.errorText}>
                * {error}
              </Text>
            )}
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
              <Button
                title="Añadir otro jugador"
                iconName='add'
                variant='tertiary'
                size='normal'
                onPress={handleAddPlayer}
                style={styles.addPlayerBtn}
              />
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="JUGAR"
          iconName="play-arrow"
          variant='primary'
          size='large'
          onPress={handlePlay}
        />
      </View>
    </View>
  );
};
