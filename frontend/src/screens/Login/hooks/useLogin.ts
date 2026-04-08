import { useState } from 'react';
import UserServiceFactory from '../../../../../backend/src/infrastructure/factories/UserServiceFactory';

const userService = UserServiceFactory.getInstance();

export const useLogin = (navigation: any) => {
    const [name, setName] = useState('');

    const handleEntrar = async () => {
        if (!name.trim()) return; // Validación básica

        try {
            await userService.login(name.trim());

            // Reiniciamos el stack para que el usuario no pueda volver atrás al login
            navigation.reset({
                index: 0,
                routes: [
                    {
                        name: 'HomeScreen',
                        params: { name: name.trim() }
                    }
                ],
            });
        } catch (error) {
            console.error("Error en el login:", error);
            // MIRAR: disparar un Toast si lo tienes implementado
        }
    };

    const handleEntrarComoInvitado = async () => {
        navigation.navigate('HomeScreen');
    };

    return {
        name,
        setName,
        handleEntrar,
        handleEntrarComoInvitado
    };
};
