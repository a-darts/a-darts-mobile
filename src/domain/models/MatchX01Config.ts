import { GamesX01 } from "../enums/GamesX01";
import { GameTypes } from "../enums/GameTypes";

export interface IMatchX01Config {
    game: GamesX01;
    typeOfGame: GameTypes;
    numSets: number;
    numLegs: number;
    numPlayers: number;
    playerNames: string[];
}

export class MatchX01Config implements IMatchX01Config {
    // --------------------------------------------------------------------------
    // Attributes
    game: GamesX01;
    typeOfGame: GameTypes;
    numSets: number;
    numLegs: number;
    numPlayers: number;
    playerNames: string[];
    // --------------------------------------------------------------------------

    // --------------------------------------------------------------------------
    // Constructor
    constructor(
        game: GamesX01,
        typeOfGame: GameTypes,
        numSets: number,
        numLegs: number,
        numPlayers: number,
        playerNames: string[]
    ) {
        this.game = game;
        this.typeOfGame = typeOfGame;
        this.numSets = numSets;
        this.numLegs = numLegs;
        this.numPlayers = numPlayers;
        this.playerNames = [...playerNames];
    }
    // --------------------------------------------------------------------------

    // --------------------------------------------------------------------------
    public clone(): MatchX01Config {
        return new MatchX01Config(
            this.game,
            this.typeOfGame,
            this.numSets,
            this.numLegs,
            this.numPlayers,
            this.playerNames,
        );
    }
    public toDTO(): IMatchX01Config {
        return {
            game: this.game,
            typeOfGame: this.typeOfGame,
            numSets: this.numSets,
            numLegs: this.numLegs,
            numPlayers: this.numPlayers,
            playerNames: this.playerNames
        };
    }
    public copyWith(changes: Partial<IMatchX01Config>): MatchX01Config {
        return new MatchX01Config(
            changes.game ?? this.game,
            changes.typeOfGame ?? this.typeOfGame,
            changes.numSets ?? this.numSets,
            changes.numLegs ?? this.numLegs,
            changes.numPlayers ?? this.numPlayers,
            changes.playerNames ?? [...this.playerNames]
        );
    }
    // --------------------------------------------------------------------------
}
