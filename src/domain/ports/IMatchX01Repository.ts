import { MatchX01Config } from "../models/MatchX01Config";

export interface IMatchX01Repository {
    save(config: MatchX01Config): Promise<void>;
    get(): Promise<MatchX01Config | null>;
    clear(): Promise<void>;
}
