import { MatchX01 } from '../models/MatchX01';
import { MatchX01Config } from '../models/MatchX01Config';

export interface IMatchX01Repository {
    save(match: MatchX01): Promise<void>;
    getById(id: string): Promise<MatchX01 | null>;
    delete(id: string): Promise<void>;
    
    // Recent games
    saveRecentConfig(config: MatchX01Config): Promise<void>;
    getRecentConfigs(): Promise<MatchX01Config[]>;
}
