import React, { useState } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import { theme } from '../theme/theme';

export const HomeScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

      <View style={styles.tabsContainer}>
        <View style={styles.activeTab}>
          <Text style={styles.activeTabText}>Iniciar sesión</Text>
        </View>
        <View style={styles.inactiveTab}>
          <Text style={styles.inactiveTabText}>Registrarse</Text>
        </View>
      </View>

      <View style={styles.form}>
        <TextInput
          label="Correo"
          placeholder="Introduce el correo"
          iconName="mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          label="Contraseña"
          placeholder="Introduce la contraseña"
          iconName="lock"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <View style={styles.buttonContainer}>
          <Button
            title="Iniciar sesión"
            onPress={() => navigation.navigate('Details', { name: email })}
          />

          <View style={styles.separatorContainer}>
            <View style={styles.line} />
            <Text style={styles.separatorText}>o</Text>
            <View style={styles.line} />
          </View>

          <Button
            title="Entrar como invitado"
            variant="secondary"
            onPress={() => { }}
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
    marginVertical: 40,
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
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.tabInactiveBorder,
  },
  activeTab: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.tabActiveBorder,
    alignItems: 'center',
  },
  inactiveTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
  },
  inactiveTabText: {
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary,
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
