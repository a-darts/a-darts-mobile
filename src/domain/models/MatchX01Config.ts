import { IMatchX01Config } from "../ports/Ports";
import { GamesX01 } from "../enums/GamesX01";
import { GameTypes } from "../enums/GameTypes";


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
    // --------------------------------------------------------------------------
}
