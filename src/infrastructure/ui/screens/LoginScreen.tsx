import React, { useState } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import { Tabs } from '../components/Tabs';
import { theme } from '../theme/theme';
import UserServiceFactory from '../../factories/UserServiceFactory';

export const LoginScreen = ({ navigation }) => {
  const userService = UserServiceFactory.getInstance();

  const [name, setName] = useState('');

  const handleEntrar = async () => {
    try {
      const user = await userService.login(name);
    } catch (error) {
      console.error("Error en el login:", error);
      // MIRAR: qué hacer?? mostrar un toast y volver a intentar??
      return;
    }

    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'HomeScreen',
          params: { name: name.trim() }
        }
      ],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bienvenido a</Text>
        <Image
          source={require('../../../../assets/scoreo-white.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.form}>
        <TextInput
          description="Nombre"
          placeholder="Introduce tu nombre"
          iconName="user"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <View style={styles.buttonContainer}>
          <Button
            title={"ENTRAR"}
            onPress={handleEntrar}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginVertical: 16,
  },
  title: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xxxl,
    color: theme.colors.text,
  },
  logoImage: {
    width: 180,
    height: 50,
    marginTop: 10,
  },

  form: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 10,
  },
});
