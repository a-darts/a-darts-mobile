import React, { useState } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import { Tabs } from '../components/Tabs';
import { theme } from '../theme/theme';

export const LoginScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isLogin = activeTab === 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bienvenido a</Text>
        <Image
          source={require('../../assets/scoreo-white.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <Tabs
        options={['Iniciar sesión', 'Registrarse']}
        activeIndex={activeTab}
        onChange={setActiveTab}
      />

      <View style={styles.form}>
        {!isLogin && (
          <TextInput
            description="Nombre"
            placeholder="Introduce tu nombre"
            iconName="user"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        )}

        <TextInput
          description="Correo"
          placeholder="Introduce el correo"
          iconName="mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          description="Contraseña"
          placeholder="Introduce la contraseña"
          iconName="lock"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <View style={styles.buttonContainer}>
          <Button
            title={isLogin ? "Iniciar sesión" : "Registrarse"}
            onPress={() => navigation.navigate('HomeScreen', { name: email })}
          />

          <View style={styles.separatorContainer}>
            <View style={styles.line} />
            <Text style={styles.separatorText}>o</Text>
            <View style={styles.line} />
          </View>

          <Button
            title="Entrar como invitado"
            variant="secondary"
            onPress={() => navigation.navigate('HomeScreen')}
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
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.line,
  },
  separatorText: {
    color: theme.colors.textSecondary,
    paddingHorizontal: 16,
    fontFamily: theme.typography.fontFamily.regular,
  }
});
