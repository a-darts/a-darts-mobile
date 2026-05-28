import { useState, useEffect } from 'react';
import { GameTypes } from '../../../../../backend/src/domain/enums/GameTypes';
import { CreateMatchX01Request } from '../../../../../backend/src/application/dtos/CreateMatchX01Request';
import { normalizeOdd } from '../utils/normalizeOdd';

import UserServiceFactory from '../../../../../backend/src/infrastructure/factories/UserServiceFactory';
import MatchX01ServiceFactory from '../../../../../backend/src/infrastructure/factories/MatchX01ServiceFactory';

const userService = UserServiceFactory.getInstance();
const matchX01Service = MatchX01ServiceFactory.getMatchX01Service();

export const useConfigX01 = (navigation: any) => {
    const [config, setConfig] = useState({
        game: 501,
        typeOfGame: GameTypes.FIRST_TO,
        numSets: 1,
        numLegs: 1,
        playerNames: [''],
    });

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadDefaultPlayerName = async () => {
            const user = await userService.getCurrentUser();
            if (user?.name) updateConfig({ playerNames: [user.name] });
        };
        loadDefaultPlayerName();
    }, []);

    const updateConfig = (changes: Partial<typeof config>) => {
        setError(null);
        setConfig(prev => ({ ...prev, ...changes }));
    };

    const handlePlayerNameChange = (index: number, value: string) => {
        const newNames = [...config.playerNames];
        newNames[index] = value;
        updateConfig({ playerNames: newNames });
    };

    const handleAddPlayer = () => {
        if (config.playerNames.length < 2) {
            updateConfig({ playerNames: [...config.playerNames, ''] });
        }
    };

    const handleRemovePlayer = () => {
        if (config.playerNames.length > 1) {
            updateConfig({ playerNames: [config.playerNames[0]] });
        }
    };

    const handlePlay = async () => {
        try {
            setError(null);

            // 1. Validar que si es BEST_OF deben ser numLegs y numSets impares
            const isBestOf = config.typeOfGame === GameTypes.BEST_OF;
            if (isBestOf && (config.numLegs % 2 === 0 || config.numSets % 2 === 0)) {
                setError('El número de legs y sets debe ser impar');
                return;
            }

            // 2. Validar que los nombres no estén vacíos
            const sanitizedNames = config.playerNames.map((name, index) => {
                const trimmedName = name.trim();
                return trimmedName === '' ? `Jugador ${index + 1}` : trimmedName;
            });

            // 3. Ejecutar el servicio con el DTO (request)
            const request: CreateMatchX01Request = {
                game: config.game,
                typeOfGame: config.typeOfGame,
                numSets: config.numSets,
                numLegs: config.numLegs,
                playerNames: sanitizedNames,
            };
            const match = await matchX01Service.createMatchX01(request);

            // 4. Navegar a la partida pasando el ID generado
            navigation.navigate('GameX01Screen', { matchId: match.id });

        } catch (error: any) {
            console.error("Error al crear la partida:", error.message);
        }
    };

    return {
        config,
        updateConfig,
        handlePlayerNameChange,
        handleAddPlayer,
        handleRemovePlayer,
        handlePlay,
        hasSecondPlayer: config.playerNames.length > 1,
        error,
        setError,
    };
};
