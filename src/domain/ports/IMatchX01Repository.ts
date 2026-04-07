import { MatchX01 } from "../models/MatchX01";

export interface IMatchX01Repository {
    save(match: MatchX01): Promise<void>;
    get(): Promise<MatchX01 | null>;
    clear(): Promise<void>;
}
