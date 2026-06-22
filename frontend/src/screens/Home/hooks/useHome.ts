import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../../utils/AuthContext';
import MatchX01ServiceFactory from '../../../../../backend/src/infrastructure/factories/MatchX01ServiceFactory';
import { MatchX01Config } from '../../../../../backend/src/domain/models/MatchX01Config';

const matchService = MatchX01ServiceFactory.getMatchX01Service();

export interface RecentGameItem {
    id: string;
    title: string;
    numPlayers: number;
    config: MatchX01Config;
}

export const useHome = (route: any) => {
    const { user, logout } = useAuth();
    const [recentGames, setRecentGames] = useState<RecentGameItem[]>([]);

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
                    title: `${cfg.game} - ${cfg.typeOfGame === 'BEST_OF' ? 'Al mejor de' : (cfg.typeOfGame === 'FIRST_TO' ? 'A ganar' : '')} ${cfg.numLegs} legs`,
                    numPlayers: cfg.playerNames.length,
                    config: cfg
                }));
                setRecentGames(formattedGames);
            } else {
                setRecentGames([]);
            }
        } catch (e) {
            console.error("Error loading recent games:", e);
            setRecentGames([]);
        }
    };

    const handlePlayRecentGame = async (config: MatchX01Config) => {
        try {
            // Convertimos la config (que puede ser Domain o DTO) a Request
            // Usamos las propiedades públicas si es instancia, o las del DTO
            const request = {
                game: config.game,
                typeOfGame: config.typeOfGame,
                numSets: config.numSets,
                numLegs: config.numLegs,
                playerNames: config.playerNames,
            };

            const match = await matchService.createMatchX01(request);

            // Navegamos a la partida
            return match.id;
        } catch (error) {
            console.error("Error al reintentar partida:", error);
            return null;
        }
    };

    return {
        username,
        isGuest,
        recentGames,
        loadGames,
        handlePlayRecentGame,
        logout,
    };
};
