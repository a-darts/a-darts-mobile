import { MatchX01Config } from "../models/MatchX01Config";

export interface IMatchX01ConfigRepository {
    save(config: MatchX01Config): Promise<void>;
    get(): Promise<MatchX01Config | null>;
    clear(): Promise<void>;
}
