import { InvalidThrowException } from "../exceptions/Exceptions";

export interface IThrowX01 {
    score: number;
    remainingScore: number;
    dartCount: number;
}

export class ThrowX01 implements IThrowX01 {
    // --------------------------------------------------------------------------
    // Attributes
    readonly score: number;
    readonly remainingScore: number;
    readonly dartCount: number;
    // --------------------------------------------------------------------------

    // --------------------------------------------------------------------------
    // Constructor
    // Pre: 0 <= score <= 180 &&
    //      (remainingScore >= 0 && remainingScore != 1) &&
    //      dartCount % 3 == 0
    constructor(
        score: number,
        remainingScore: number,
        dartCount: number,
    ) {
        // Validar Pre-condiciones
        if (score < 0 || score > 180) {
            throw new InvalidThrowException('Puntuación inválida: debe estar entre 0 y 180');
        }
        if (remainingScore < 0 || remainingScore == 1) {
            throw new InvalidThrowException('Puntuación inválida: debe quedar 0 o más de 1 punto');
        }
        if (dartCount % 3 != 0) {
            throw new InvalidThrowException('El número de tirada debe ser múltiplo de 3');
        }

        this.score = score;
        this.remainingScore = remainingScore;
        this.dartCount = dartCount;
    }
    // --------------------------------------------------------------------------
}
