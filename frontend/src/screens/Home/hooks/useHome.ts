import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_GAMES } from '../constants/Home.constants';
import UserServiceFactory from '../../../../../backend/src/infrastructure/factories/UserServiceFactory';

const userService = UserServiceFactory.getInstance();

export const useHome = (route: any) => {
    const [username, setUsername] = useState('INVITADO');
    const [isGuest, setIsGuest] = useState(true);
    const [recentGames, setRecentGames] = useState([]);

    useEffect(() => {
        const initializeHome = async () => {
            await loadUserData();
            await loadGames();
        };
        initializeHome();
    }, []);

    const loadUserData = async () => {
        try {
            // Intentamos recuperar del repositorio
            const user = await userService.getCurrentUser();

            if (user && user.name) {
                setUsername(user.name);
                setIsGuest(false);
            } else {
                // Si no hay nada en repo pero venimos de un login reciente (params)
                const nameFromParams = route.params?.name;
                if (nameFromParams) {
                    setUsername(nameFromParams);
                    setIsGuest(false);
                    // Importante: Lo guardamos para la próxima vez
                    await userService.login(nameFromParams);
                }
            }
        } catch (e) {
            console.error("Error cargando datos de usuario en Home:", e);
        }
    };

    const loadGames = async () => {
        try {
            const storedGames = await AsyncStorage.getItem('@recent_games');
            if (storedGames) {
                setRecentGames(JSON.parse(storedGames));
            } else {
                await AsyncStorage.setItem('@recent_games', JSON.stringify(DEFAULT_GAMES));
                setRecentGames(DEFAULT_GAMES);
            }
        } catch (e) {
            console.error(e);
            setRecentGames(DEFAULT_GAMES);
        }
    };

    return {
        username,
        isGuest,
        recentGames,
        loadGames
    };
};
