// infrastructure/repositories/AsyncStorageMatchRepository.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MatchX01Repository } from '../../domain/repositories/MatchX01Repository';
import { MatchX01 } from '../../domain/models/MatchX01';
import { MatchX01Mapper } from '../mappers/MatchX01Mapper';
import { MatchX01DTO } from '../persistence/MatchX01DTO';

export class AsyncStorageMatchX01Repository implements MatchX01Repository {
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
}
