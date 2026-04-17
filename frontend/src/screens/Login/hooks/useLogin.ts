import { useEffect, useState } from 'react';
import { useAuth } from '../../../utils/AuthContext';

export const useLogin = (navigation: any) => {
    const { login, logout, user } = useAuth();
    const [alias, setAlias] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            // Si ya hay usuario en el contexto, redirigimos
            navigation.reset({
                index: 0,
                routes: [{ name: 'HomeScreen' }],
            });
        } else {
            setIsLoading(false);
        }
    }, [user]);

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
            await login(alias.trim());
            // No navegamos aquí, el useEffect se encargará cuando el user cambie
        } catch (error) {
            console.error("Error en el login:", error);
            setError("Error al iniciar sesión");
        }
    };

    const handleEntrarComoInvitado = async () => {
        await logout();
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
