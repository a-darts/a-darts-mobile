export interface MatchX01DTO {
    id: string;
    config: MatchX01ConfigDTO;
    players: PlayerDTO[];
    activePlayerIndex: number;
    startingPlayerIndexForLeg: number;
    startingPlayerIndexForSet: number;
    status: string;
    history: MatchX01SnapshotDTO[];
}

export interface MatchX01ConfigDTO {
    game: number;
    typeOfGame: string;
    numSets: number;
    numLegs: number;
    playerNames: string[];
}

export interface MatchX01SnapshotDTO {
    players: PlayerDTO[];
    activePlayerIndex: number;
    startingPlayerIndexForLeg: number;
    startingPlayerIndexForSet: number;
    status: string;
}

export interface PlayerDTO {
    id: string;
    name: string;
    remainingScore: number;
    numSetsWon: number;
    numLegsWon: number;
    throws: ThrowDTO[];
    stats: PlayerX01StatsDTO;
}

export interface PlayerX01StatsDTO {
    hundredPlus: number;
    hundredFortyPlus: number;
    oneEighties: number;
    average: number;
    totalScore: number;
    totalDarts: number;
}


export interface ThrowDTO {
    score: number;
    remainingScore: number;
    dartCount: number;
}
