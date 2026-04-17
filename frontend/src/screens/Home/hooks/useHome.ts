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

    const handlePlayRecentGame = async (config: any) => {
        try {
            // Convertimos la config (que puede ser Domain o DTO) a Request
            // Usamos las propiedades públicas si es instancia, o las del DTO
            const request = {
                game: config.game || config._game,
                typeOfGame: config.typeOfGame || config._typeOfGame,
                numSets: config.numSets || config._numSets,
                numLegs: config.numLegs || config._numLegs,
                playerNames: config.playerNames || config._playerNames,
            };

            const match = await matchService.createMatchX01(request);

            // Navegamos a la partida
            // Nota: navigation se recibe desde HomeScreen
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
        handlePlayRecentGame
    };
};
