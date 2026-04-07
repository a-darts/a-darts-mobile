import { PlayerX01 } from "../models/PlayerX01";

export interface IPlayerX01Repository {
    create(config: PlayerX01): Promise<void>;
    update(config: PlayerX01): Promise<void>;
    delete(id: string): Promise<void>;
    findPlayerX01ById(id: string): Promise<PlayerX01 | null>;
}
