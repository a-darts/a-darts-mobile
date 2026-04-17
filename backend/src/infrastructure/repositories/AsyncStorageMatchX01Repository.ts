// infrastructure/repositories/AsyncStorageMatchRepository.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IMatchX01Repository } from '../../domain/repositories/IMatchX01Repository';
import { MatchX01 } from '../../domain/models/MatchX01';
import { MatchX01Mapper } from '../mappers/MatchX01Mapper';
import { MatchX01DTO } from '../persistence/MatchX01DTO';
import { MatchX01Config } from '../../domain/models/MatchX01Config';

export class AsyncStorageMatchX01Repository implements IMatchX01Repository {
    private readonly PREFIX = '@match_';

    async save(match: MatchX01): Promise<void> {
        try {
            const dto = MatchX01Mapper.toPersistence(match);
            await AsyncStorage.setItem(this.PREFIX + match.id, JSON.stringify(dto));
        } catch (error) {
            console.error('Error saving match', error);
            throw new Error('Could not save match state');
        }
    }

    async getById(id: string): Promise<MatchX01 | null> {
        try {
            const data = await AsyncStorage.getItem(this.PREFIX + id);
            if (!data) return null;

            const dto: MatchX01DTO = JSON.parse(data);
            return MatchX01Mapper.toDomain(dto);
        } catch (error) {
            console.error('Error loading match', error);
            return null;
        }
    }

    async delete(id: string): Promise<void> {
        await AsyncStorage.removeItem(this.PREFIX + id);
    }

    // -------------------------------------------------------------------------
    // Recent games
    // -------------------------------------------------------------------------

    private readonly RECENT_KEY = '@recent_games';

    async saveRecentConfig(config: MatchX01Config): Promise<void> {
        try {
            const currentData = await AsyncStorage.getItem(this.RECENT_KEY);
            let recent: MatchX01Config[] = [];

            if (currentData) {
                const dtos = JSON.parse(currentData);
                recent = dtos.map((d: any) => MatchX01Mapper.configToDomain(d));
            }

            // 1. Eliminar duplicados si ya existe la misma config
            const newRecent = [
                config,
                ...recent.filter(r => !this.isEqualConfig(r, config))
            ];

            // 2. Limitar a 3 configuraciones
            const toSave = newRecent.slice(0, 3);

            // 3. Persistir
            const dtosToSave = toSave.map(c => MatchX01Mapper.configToDTO(c));
            console.log("DTOS TO SAVE:", dtosToSave);
            await AsyncStorage.setItem(this.RECENT_KEY, JSON.stringify(dtosToSave));
        } catch (error) {
            console.error('Error saving recent config', error);
        }
    }

    async getRecentConfigs(): Promise<MatchX01Config[]> {
        try {
            const data = await AsyncStorage.getItem(this.RECENT_KEY);
            if (!data) return [];

            const dtos = JSON.parse(data);
            return dtos.map((d: any) => MatchX01Mapper.configToDomain(d));
        } catch (error) {
            console.error('Error getting recent configs', error);
            return [];
        }
    }

    private isEqualConfig(c1: MatchX01Config, c2: MatchX01Config): boolean {
        return (
            c1.game === c2.game &&
            c1.typeOfGame === c2.typeOfGame &&
            c1.numSets === c2.numSets &&
            c1.numLegs === c2.numLegs &&
            JSON.stringify(c1.playerNames) === JSON.stringify(c2.playerNames)
        );
    }
}
