export interface MatchX01DTO {
    id: string;
    config: {
        game: number;
        typeOfGame: string;
        numSets: number;
        numLegs: number;
        playerNames: string[];
    };
    players: PlayerDTO[];
    activePlayerIndex: number;
    startingPlayerIndexForLeg: number;
    startingPlayerIndexForSet: number;
    status: 'PLAYING' | 'FINISHED';
    history: MatchX01SnapshotDTO[];
}

export interface ThrowDTO {
    score: number;
    remainingScore: number;
    dartCount: number;
}

export interface PlayerDTO {
    id: string;
    name: string;
    remainingScore: number;
    numSetsWon: number;
    numLegsWon: number;
    throws: ThrowDTO[];
}

export interface MatchX01SnapshotDTO {
    players: PlayerDTO[];
    activePlayerIndex: number;
    startingPlayerIndexForLeg: number;
    startingPlayerIndexForSet: number;
    status: 'PLAYING' | 'FINISHED';
}
