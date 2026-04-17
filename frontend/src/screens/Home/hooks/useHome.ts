import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_GAMES } from '../constants/Home.constants';
import { useAuth } from '../../../utils/AuthContext';
import MatchX01ServiceFactory from '../../../../../backend/src/infrastructure/factories/MatchX01ServiceFactory';

const matchService = MatchX01ServiceFactory.getMatchX01Service();

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
            const configs = await matchService.getRecentConfigs();

            if (configs && configs.length > 0) {
                const formattedGames = configs.map((cfg, index) => ({
                    id: `recent-${index}`,
                    title: `${cfg.game} - ${cfg.typeOfGame === 'bestOf' ? 'Al mejor de' : (cfg.typeOfGame === 'firstTo' ? 'A ganar' : '')} ${cfg.numLegs} legs`,
                    numPlayers: cfg.playerNames.length,
                    config: cfg
                }));
                setRecentGames(formattedGames);
            } else {
                setRecentGames(DEFAULT_GAMES);
            }
        } catch (e) {
            console.error("Error loading recent games:", e);
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
