import React from 'react';
import { View, Text, Image } from 'react-native';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { useLogin } from './hooks/useLogin';
import { styles } from './styles/Login.styles';

export const LoginScreen = ({ navigation }) => {
  const { name, setName, error, handleEntrar, handleEntrarComoInvitado } = useLogin(navigation);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bienvenido a</Text>
        <Image
          source={require('../../../assets/scoreo-white.png')}
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

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="ENTRAR"
            variant='primary'
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
            onPress={handleEntrarComoInvitado}
          />
        </View>
      </View>
    </View>
  );
};
