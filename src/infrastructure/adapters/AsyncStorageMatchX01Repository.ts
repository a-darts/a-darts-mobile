import AsyncStorage from '@react-native-async-storage/async-storage';
import { IMatchX01Repository } from '../../domain/ports/IMatchX01Repository';
import { MatchX01Config } from '../../domain/models/MatchX01Config';
import { IMatchX01Config } from '../../domain/models/MatchX01Config';
import { IMatchX01, MatchX01 } from '../../domain/models/MatchX01';
import { IPlayerX01 } from '../../domain/models/PlayerX01';

const CONFIG_STORAGE_KEY = '@current_match_config';
const PLAYERS_STORAGE_KEY = '@current_match_players';


export class AsyncStorageMatchX01Repository implements IMatchX01Repository {
    async save(match: MatchX01): Promise<void> {
        await AsyncStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(match.config));
        await AsyncStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(match.players));
    }

    async get(): Promise<MatchX01 | null> {
        const configData = await AsyncStorage.getItem(CONFIG_STORAGE_KEY);
        if (!configData) return null;

        const playersData = await AsyncStorage.getItem(PLAYERS_STORAGE_KEY);
        if (!playersData) return null;

        const configDataParsed: IMatchX01Config = JSON.parse(configData);
        const playersDataParsed: IPlayerX01[] = JSON.parse(playersData);
        return new MatchX01(
            configDataParsed,
            playersDataParsed,
        );
    }

    async clear(): Promise<void> {
        await AsyncStorage.removeItem(CONFIG_STORAGE_KEY);
        await AsyncStorage.removeItem(PLAYERS_STORAGE_KEY);
    }
}