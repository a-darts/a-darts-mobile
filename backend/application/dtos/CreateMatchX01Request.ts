// application/dtos/CreateMatchX01Request.ts
import { GameTypes } from "../../domain/enums/GameTypes";

export interface CreateMatchX01Request {
    game: number;
    typeOfGame: GameTypes;
    numSets: number;
    numLegs: number;
    playerNames: string[];
}
