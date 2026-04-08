import { useState } from 'react';
import UserServiceFactory from '../../../../../backend/src/infrastructure/factories/UserServiceFactory';

const userService = UserServiceFactory.getInstance();

export const useLogin = (navigation: any) => {
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleNameChange = (text: string) => {
        setName(text);
        if (error) setError(null);
    };

    const handleEntrar = async () => {
        if (!name.trim()) {
            setError("* El nombre no puede estar vacío. Si no desea identificarse, pulse ENTRAR COMO INVITADO");
            return;
        }

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
            setError("Error al iniciar sesión");
        }
    };

    const handleEntrarComoInvitado = async () => {
        navigation.navigate('HomeScreen');
    };

    return {
        name,
        setName: handleNameChange,
        error,
        handleEntrar,
        handleEntrarComoInvitado,
    };
};
