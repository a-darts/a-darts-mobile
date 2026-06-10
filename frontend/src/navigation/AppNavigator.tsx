import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { IntroScreen } from '../screens/Intro/IntroScreen';
import { LoginScreen } from '../screens/Login/LoginScreen';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { ConfigX01Screen } from '../screens/ConfigX01/ConfigX01Screen';
import { GameX01Screen } from '../screens/GameX01/GameX01Screen';
import { MatchX01SummaryScreen } from '../screens/MatchX01Summary/MatchX01SummaryScreen';
import { MyProfileScreen } from '../screens/MyProfile/MyProfileScreen';
import { CompetitionModeConfigScreen } from '../screens/CompetitionMode/CompetitionModeConfigScreen';

import { theme } from '../theme/theme';


export type AppStackParamList = {
  Intro: undefined;
  Login: undefined;
  HomeScreen: undefined;
  ConfigX01: undefined;
  CompetitionModeConfig: undefined;
  GameX01Screen: {
    game?: string;
    typeOfGame?: string;
    numLegs?: number;
  };
  MatchX01SummaryScreen: undefined;
  MyProfileScreen: undefined;
  SettingsScreen: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

import { AvatarDropdown } from '../components/AvatarDropdown';

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        id="AppStack"
        screenOptions={{
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: theme.colors.headerBackground,
          },
          headerTintColor: theme.colors.headerText,
          headerTitleStyle: {
            fontFamily: theme.typography.fontFamily.semiBold,
            fontSize: theme.typography.sizes.md,
          },
          headerRight: () => <AvatarDropdown />,
        }}
      >
        <Stack.Screen
          name="Intro"
          component={IntroScreen}
          options={{ title: 'A-Darts', headerRight: () => null }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Inicio', headerRight: () => null }}
        />
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ title: 'Inicio' }}
        />
        <Stack.Screen
          name="ConfigX01"
          component={ConfigX01Screen}
          options={{ title: 'Nueva partida' }}
        />
        <Stack.Screen
          name="CompetitionModeConfig"
          component={CompetitionModeConfigScreen}
          options={{ title: 'Modo competición' }}
        />
        <Stack.Screen
          name="GameX01Screen"
          component={GameX01Screen}
          options={({ route }) => ({
            title: route.params?.game
              ? `Partida ${route.params.game} (${route.params.typeOfGame} ${route.params.numLegs})`
              : 'Partida - x01',
          })}
        />
        <Stack.Screen
          name="MatchX01SummaryScreen"
          component={MatchX01SummaryScreen}
          options={{ title: 'Resumen de la partida' }}
        />
        <Stack.Screen
          name="MyProfileScreen"
          component={MyProfileScreen}
          options={{ title: 'Mi perfil' }}
        />
        <Stack.Screen
          name="SettingsScreen"
          component={HomeScreen}
          options={{ title: 'Ajustes' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
