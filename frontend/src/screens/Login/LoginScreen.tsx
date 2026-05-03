import React from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { useLogin } from './hooks/useLogin';
import { styles } from './styles/Login.styles';


export const LoginScreen = ({ navigation }) => {
  const {
    alias, setAlias, error, isLoading,
    handleEntrar, handleEntrarComoInvitado,
  } = useLogin(navigation);

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bienvenido a</Text>
        <Image
          source={require('../../../assets/logo_white.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.form}>
        <TextInput
          description="Alias"
          placeholder="Introduce tu alias"
          iconName="user"
          value={alias}
          onChangeText={setAlias}
          autoCapitalize="words"
        />

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="ENTRAR"
            variant='primary'
            size='large'
            onPress={handleEntrar}
          />
          <View style={styles.separatorContainer}>
            <View style={styles.line} />
            <Text style={styles.separatorText}>o</Text>
            <View style={styles.line} />
          </View>
          <Button
            title="ENTRAR COMO INVITADO"
            variant='secondary'
            size='large'
            onPress={handleEntrarComoInvitado}
          />
        </View>
      </View>
    </View>
  );
};
