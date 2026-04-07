// domain/repositories/MatchRepository.ts
import { MatchX01 } from '../models/MatchX01';

export interface MatchX01Repository {
    save(match: MatchX01): Promise<void>;
    getById(id: string): Promise<MatchX01 | null>;
    delete(id: string): Promise<void>;
}
