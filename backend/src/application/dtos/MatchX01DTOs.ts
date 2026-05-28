import { GameTypes } from "../../domain/enums/GameTypes";

export interface CreateMatchX01RequestDTO {
    game: number;
    typeOfGame: GameTypes;
    numSets: number;
    numLegs: number;
    playerNames: string[];
}
