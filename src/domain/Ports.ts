export type GamesX01 = 170 | 301 | 501;

export enum GameTypes {
    BestOf = 'bestOf',
    FirstTo = 'firstTo'
}

export interface IMatchX01Config {
    game: GamesX01;
    typeOfGame: GameTypes;
    numSets: number;
    numLegs: number;
    numPlayers: number;
    playerNames: string[];
}

export interface IPlayerX01 {
    name: string;
    typeOfGame: GameTypes;
    initialScore: number;
    initialNumSets: number;
    initialNumLegs: number;
    remainingScore: number;
    numSetsWon: number;
    numLegsWon: number;
    throws: IThrowX01[];
}

export interface IThrowX01 {
    score: number;
    remainingScore: number;
    dartCount: number;
}
