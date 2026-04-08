import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_GAMES } from '../constants/Home.constants';

export const useHome = (route: any) => {
    const { name } = route.params || {};
    const isGuest = !name;
    const username = isGuest ? 'INVITADO' : name;

    const [recentGames, setRecentGames] = useState([]);

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
