export interface MatchConfig {
    game: string;
    typeOfGame: 'firstTo' | 'bestOf';
    numLegs: number;
    numSets: number;
    playerName: string;
}
