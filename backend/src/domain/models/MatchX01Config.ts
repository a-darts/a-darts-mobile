import { GameTypes } from "../enums/GameTypes";

/*
 * Value Object: MatchX01Config
 */
export class MatchX01Config {
    private readonly _game: number;
    private readonly _typeOfGame: GameTypes;
    private readonly _numSets: number;
    private readonly _numLegs: number;
    private readonly _playerNames: string[];


    // --------------------------------------------------------------------------
    // Constructor
    // --------------------------------------------------------------------------

    constructor(
        game: number,
        typeOfGame: GameTypes,
        numSets: number,
        numLegs: number,
        playerNames: string[],
    ) {
        this._game = game;
        this._typeOfGame = typeOfGame;
        this._numSets = numSets;
        this._numLegs = numLegs;
        this._playerNames = [...playerNames];
    }


    // --------------------------------------------------------------------------
    // Clone
    // --------------------------------------------------------------------------

    public clone(): MatchX01Config {
        return new MatchX01Config(
            this._game,
            this._typeOfGame,
            this._numSets,
            this._numLegs,
            [...this._playerNames],
        );
    }


    // -------------------------------------------------------------------------
    // Getters
    // -------------------------------------------------------------------------

    public get game() {
        return this._game;
    }

    public get typeOfGame() {
        return this._typeOfGame;
    }

    public get numSets() {
        return this._numSets;
    }

    public get numLegs() {
        return this._numLegs;
    }

    public get playerNames() {
        return [...this._playerNames];
    }
}
