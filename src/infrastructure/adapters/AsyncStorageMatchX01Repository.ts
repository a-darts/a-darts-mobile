import AsyncStorage from '@react-native-async-storage/async-storage';
import { IMatchX01Repository } from '../../domain/ports/IMatchX01Repository';
import { MatchX01Config } from '../../domain/models/MatchX01Config';
import { IMatchX01Config } from '../../domain/ports/Ports';

const STORAGE_KEY = '@current_match_config';

export class AsyncStorageMatchX01Repository implements IMatchX01Repository {
    async save(config: MatchX01Config): Promise<void> {
        const dto = config.toDTO();
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dto));
    }

    async get(): Promise<MatchX01Config | null> {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (!data) return null;

        const dto: IMatchX01Config = JSON.parse(data);
        return new MatchX01Config(
            dto.game, dto.typeOfGame, dto.numSets,
            dto.numLegs, dto.numPlayers, dto.playerNames
        );
    }

    async clear(): Promise<void> {
        await AsyncStorage.removeItem(STORAGE_KEY);
    }
}