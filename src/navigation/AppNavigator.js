import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ConfigX01Screen } from '../screens/ConfigX01Screen';
import { GameScreen } from '../screens/GameScreen';
import { theme } from '../theme/theme';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: theme.colors.headerBackground,
          },
          headerTintColor: theme.colors.headerText,
          headerTitleStyle: {
            fontFamily: theme.typography.fontFamily.semiBold,
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={LoginScreen}
          options={{ title: 'scoreo' }}
        />
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ title: 'scoreo' }}
        />
        <Stack.Screen
          name="ConfigX01"
          component={ConfigX01Screen}
          options={{ title: 'Nueva partida - x01' }}
        />
        <Stack.Screen
          name="GameScreen"
          component={GameScreen}
          options={{ title: 'Partida - x01' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
