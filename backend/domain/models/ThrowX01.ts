/*
 * Value Object: ThrowX01
 */
export class ThrowX01 {
    private readonly _score: number;
    private readonly _remainingScore: number;
    private readonly _dartCount: number;

    // Constructor
    // Pre: 0 <= score <= 180 &&
    //      (remainingScore >= 0 && remainingScore != 1) &&
    //      dartCount % 3 == 0
    constructor(
        score: number,
        remainingScore: number,
        dartCount: number,
    ) {
        if (score < 0 || score > 180) {
            throw new Error('Invalid score');
        }
        if (remainingScore < 0 || remainingScore === 1) {
            throw new Error('Invalid remaining score');
        }
        if (dartCount % 3 !== 0) {
            throw new Error('Invalid dart count');
        }

        this._score = score;
        this._remainingScore = remainingScore;
        this._dartCount = dartCount;
    }

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