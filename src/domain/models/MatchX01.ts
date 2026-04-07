import { GamesX01 } from "../enums/GamesX01";
import { GameTypes } from "../enums/GameTypes";
import { IMatchX01Config } from "./MatchX01Config";
import { IPlayerX01, PlayerX01 } from "./PlayerX01";

export interface IMatchX01 {
    config: IMatchX01Config;
    players: IPlayerX01[];
    activePlayerIndex: number;

    create(config: IMatchX01Config): MatchX01;
    addThrow(score: number): void;
    undoLastThrow(): void;
    getCurrentPlayer(): IPlayerX01;
}

export class MatchX01 implements IMatchX01 {
    // --------------------------------------------------------------------------
    // Attributes
    config: IMatchX01Config;
    players: IPlayerX01[];
    activePlayerIndex: number;
    // --------------------------------------------------------------------------

    // --------------------------------------------------------------------------
    // Constructor
    constructor(
        config: IMatchX01Config,
        players: IPlayerX01[],
        activePlayerIndex?: number,
    ) {
        this.config = config;
        this.players = [...players];
        this.activePlayerIndex = activePlayerIndex ? activePlayerIndex : 0;
    }
    // --------------------------------------------------------------------------

    // --------------------------------------------------------------------------
    // Factory method
    public create(config: IMatchX01Config): MatchX01 {
        const players = config.playerNames.map((name) =>
            new PlayerX01(name, config.game, config.numSets, config.numLegs)
        );
        return new MatchX01(config, players);
    }
    // --------------------------------------------------------------------------

    // --------------------------------------------------------------------------
    // Domain methods
    public addThrow(score: number): void {
        const activePlayer = this.players[this.activePlayerIndex];
        const isLegFinished = activePlayer.addThrow(score);

        if (isLegFinished) {
            this.handleEndLeg();
        } else {
            this.activePlayerIndex = (this.activePlayerIndex + 1) % this.players.length;
        }
    }

    private handleEndLeg(): void {
        let isSetFinished = false;
        this.players.forEach(p => {
            const playerFinishedSet = p.resetForNewLeg();
            if (playerFinishedSet) {
                isSetFinished = true;
            }
        });

        if (isSetFinished) {
            this.players.forEach(p => p.resetForNewSet());
        }

        this.activePlayerIndex = 0;
    }

    public undoLastThrow(): void {
        const inactivePlayerIndex = (this.activePlayerIndex - 1 + this.players.length) % this.players.length;
        const inactivePlayer = this.players[inactivePlayerIndex];
        inactivePlayer.undoLastThrow();
        this.activePlayerIndex = inactivePlayerIndex;
    }

    public getCurrentPlayer(): IPlayerX01 {
        return this.players[this.activePlayerIndex];
    }
    // --------------------------------------------------------------------------
}
