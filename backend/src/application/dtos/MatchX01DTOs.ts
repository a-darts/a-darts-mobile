import { GameTypes } from "../../domain/enums/GameTypes";

export interface CreateMatchX01RequestDTO {
    id?: string;
    game: number;
    typeOfGame: GameTypes;
    numSets: number;
    numLegs: number;
    playerNames: string[];
}
