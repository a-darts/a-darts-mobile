import React from 'react';
import { View, Text, Image } from 'react-native';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { useLogin } from './hooks/useLogin';
import { styles } from './styles/Login.styles';

export const LoginScreen = ({ navigation }) => {
  const { name, setName, handleEntrar, handleEntrarComoInvitado } = useLogin(navigation);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bienvenido a</Text>
        <Image
          source={require('../../../../../assets/scoreo-white.png')}
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
            title="ENTRAR"
            variant='primary'
            onPress={handleEntrar}
          />
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
