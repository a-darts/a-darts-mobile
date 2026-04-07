import { useState, useEffect } from 'react';
import { GameTypes } from '../../../../../../backend/domain/enums/GameTypes';
import { GamesX01 } from '../../../../../../backend/domain/enums/GamesX01';

import { AsyncStorageMatchX01Repository } from '../../../../../../backend/infrastructure/repositories/AsyncStorageMatchX01Repository';
import { CreateMatchX01Service } from '../../../../../../backend/application/services/CreateMatchX01Service';
import UserServiceFactory from '../../../../factories/UserServiceFactory';
import { CreateMatchX01Request } from '../../../../../../backend/application/dtos/CreateMatchX01Request';


export const useConfigX01 = (navigation: any) => {
    const userService = UserServiceFactory.getInstance();

    const matchRepository = new AsyncStorageMatchX01Repository();
    const createMatchService = new CreateMatchX01Service(matchRepository);

    const [config, setConfig] = useState({
        game: 501,
        typeOfGame: GameTypes.FirstTo,
        numSets: 1,
        numLegs: 1,
        playerNames: ['']
    });

    useEffect(() => {
        const loadDefaultPlayerName = async () => {
            const user = await userService.getCurrentUser();
            if (user?.name) updateConfig({ playerNames: [user.name] });
        };
        loadDefaultPlayerName();
    }, []);

    const updateConfig = (changes: Partial<typeof config>) => {
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
            // 1. Validar que los nombres no estén vacíos
            const names = config.playerNames.filter(n => n.trim() !== '');
            if (names.length === 0) return;

            // 2. Ejecutar el servicio con el DTO (request)
            const request: CreateMatchX01Request = {
                game: config.game,
                typeOfGame: config.typeOfGame,
                numSets: config.numSets,
                numLegs: config.numLegs,
                playerNames: names,
            };
            const match = await createMatchService.execute(request);

            // 3. Navegar a la partida pasando el ID generado
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
    };
};
