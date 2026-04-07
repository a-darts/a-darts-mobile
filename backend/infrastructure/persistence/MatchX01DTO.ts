export interface MatchX01DTO {
    id: string;
    config: {
        game: number;
        typeOfGame: string;
        numSets: number;
        numLegs: number;
        playerNames: string[];
    };
    players: Array<{
        id: string;
        name: string;
        remainingScore: number;
        numSetsWon: number;
        numLegsWon: number;
        throws: Array<{
            score: number;
            remainingScore: number;
            dartCount: number;
        }>;
    }>;
    activePlayerIndex: number;
    status: 'PLAYING' | 'FINISHED';
}
