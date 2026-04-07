import { useState, useEffect } from 'react';
import { MatchX01Config, IMatchX01Config } from '../../../../../domain/models/MatchX01Config';
import MatchX01ConfigServiceFactory from '../../../../factories/MatchX01ConfigServiceFactory';
import UserServiceFactory from '../../../../factories/UserServiceFactory';
import { GameTypes } from '../../../../../domain/enums/GameTypes';

export const useConfigX01 = (navigation: any) => {
    const matchService = MatchX01ConfigServiceFactory.getInstance();
    const userService = UserServiceFactory.getInstance();

    const [config, setConfig] = useState<MatchX01Config>(
        new MatchX01Config(501, GameTypes.FirstTo, 1, 1, [''])
    );

    useEffect(() => {
        const loadDefaultPlayerName = async () => {
            const user = await userService.getCurrentUser();
            if (user?.name) updateConfig({ playerNames: [user.name] });
        };
        loadDefaultPlayerName();
    }, []);

    const updateConfig = (changes: Partial<IMatchX01Config>) => {
        setConfig(config.copyWith(changes));
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
            await matchService.saveMatchConfig(config);
            navigation.navigate('GameX01Screen');
        } catch (error) {
            console.error(error.message);
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
