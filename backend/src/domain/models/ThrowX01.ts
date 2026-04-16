import { BustException, InvalidThrowException } from "../exceptions/Exceptions";

/*
 * Value Object: ThrowX01
 */
export class ThrowX01 {
    private readonly _score: number;
    private readonly _remainingScore: number;
    private readonly _dartCount: number;


    // --------------------------------------------------------------------------
    // Constructor
    // --------------------------------------------------------------------------

    // Pre: 0 <= score <= 180 &&
    //      (remainingScore >= 0 && remainingScore != 1) &&
    //      dartCount % 3 == 0
    constructor(
        score: number,
        remainingScore: number,
        dartCount: number,
    ) {
        if (score > 180) {
            throw new BustException('Puntuación inválida');
        }
        if (remainingScore < 0) {
            throw new BustException('Puntuación inválida');
        }
        if (remainingScore === 1) {
            throw new InvalidThrowException('El resto no puede ser 1');
        }
        if (score < 0) {
            throw new InvalidThrowException('La puntuación no puede ser menor que 0');
        }
        if (score == 179 || score == 178 || score == 176 || score == 175 || score == 173 || score == 172 || score == 169) {
            throw new InvalidThrowException('Puntuación inválida');
        }
        if (dartCount % 3 !== 0) {
            throw new InvalidThrowException('Número de dardos de la tirada inválido');
        }

        this._score = score;
        this._remainingScore = remainingScore;
        this._dartCount = dartCount;
    }


    // --------------------------------------------------------------------------
    // Getters
    // --------------------------------------------------------------------------

    public get score() {
        return this._score;
    }

    public get remainingScore() {
        return this._remainingScore;
    }

    public get dartCount() {
        return this._dartCount;
    }
}