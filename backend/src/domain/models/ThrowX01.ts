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
        if (score < 0) {
            throw new InvalidThrowException('La puntuación no puede ser menor que 0');
        }
        if (remainingScore === 1) {
            throw new InvalidThrowException('El resto no puede ser 1');
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