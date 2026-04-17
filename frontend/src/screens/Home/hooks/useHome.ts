import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_GAMES } from '../constants/Home.constants';
import { useAuth } from '../../../utils/AuthContext';

export const useHome = (route: any) => {
    const { user } = useAuth();
    const [recentGames, setRecentGames] = useState([]);

    const username = user?.name || 'INVITADO';
    const isGuest = !user;

    useEffect(() => {
        loadGames();
    }, []);

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
