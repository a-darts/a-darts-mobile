import { GamesX01 } from "../enums/GamesX01";
import { GameTypes } from "../enums/GameTypes";
import { IMatchX01Config } from "./MatchX01Config";
import { IPlayerX01, PlayerX01 } from "./PlayerX01";

export interface IMatchX01 {
    config: IMatchX01Config;
    players: IPlayerX01[];
}

export class MatchX01 implements IMatchX01 {
    // --------------------------------------------------------------------------
    // Attributes
    config: IMatchX01Config;
    players: IPlayerX01[];
    // --------------------------------------------------------------------------

    // --------------------------------------------------------------------------
    // Constructor
    constructor(
        config: IMatchX01Config,
        players: IPlayerX01[],
    ) {
        this.config = config;
        this.players = [...players];
    }
    // --------------------------------------------------------------------------

    // --------------------------------------------------------------------------
    // Factory method
    public static create(config: IMatchX01Config): MatchX01 {
        const players = config.playerNames.map((name) =>
            new PlayerX01(name, config.game, config.numSets, config.numLegs)
        );
        return new MatchX01(config, players);
    }
    // --------------------------------------------------------------------------
}
