import { useEffect, useState } from 'react';
import UserServiceFactory from '../../../../../backend/src/infrastructure/factories/UserServiceFactory';

const userService = UserServiceFactory.getInstance();

export const useLogin = (navigation: any) => {
    const [alias, setAlias] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkExistingUser();
    }, []);

    const checkExistingUser = async () => {
        try {
            const user = await userService.getCurrentUser();
            if (user && user.name) {
                // Si existe, redirigimos automáticamente
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'HomeScreen' }],
                });
            } else {
                setIsLoading(false);
            }
        } catch (e) {
            console.error("Error comprobando usuario persistido:", e);
            setIsLoading(false);
        }
    };

    const handleAliasChange = (text: string) => {
        setAlias(text);
        if (error) setError(null);
    };

    const handleEntrar = async () => {
        if (!alias.trim()) {
            setError("* El alias no puede estar vacío. Si no deseas identificarte, pulsa ENTRAR COMO INVITADO");
            return;
        }

        try {
            await userService.login(alias.trim());

            // Reiniciamos el stack para que el usuario no pueda volver atrás al login
            navigation.reset({
                index: 0,
                routes: [{ name: 'HomeScreen' }],
            });
        } catch (error) {
            console.error("Error en el login:", error);
            setError("Error al iniciar sesión");
        }
    };

    const handleEntrarComoInvitado = async () => {
        await userService.logout();
        navigation.navigate('HomeScreen');
    };

    return {
        alias,
        setAlias: handleAliasChange,
        error,
        isLoading,
        handleEntrar,
        handleEntrarComoInvitado,
    };
};
