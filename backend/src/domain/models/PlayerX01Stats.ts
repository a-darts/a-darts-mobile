import { ThrowX01 } from './ThrowX01';

/*
 * Value Object: PlayerX01Stats
 */
export class PlayerX01Stats {
  private readonly _hundredPlus: number;
  private readonly _hundredFortyPlus: number;
  private readonly _oneEighties: number;
  private readonly _average: number;
  private readonly _totalScore: number;
  private readonly _totalDarts: number;


  // --------------------------------------------------------------------------
  // Constructor
  // --------------------------------------------------------------------------

  constructor(
    hundredPlus: number = 0,
    hundredFortyPlus: number = 0,
    oneEighties: number = 0,
    average: number = 0,
    totalScore: number = 0,
    totalDarts: number = 0,
  ) {
    this._hundredPlus = hundredPlus;
    this._hundredFortyPlus = hundredFortyPlus;
    this._oneEighties = oneEighties;
    this._average = average;
    this._totalScore = totalScore;
    this._totalDarts = totalDarts;
  }


  // -------------------------------------------------------------------------
  // Domain methods
  // -------------------------------------------------------------------------

  public updateWithNewScore(score: number): PlayerX01Stats {
    // 1. Calcular Average
    const newTotalScore = this._totalScore + score;
    // MIRAR: en caso de cierre, no siempre van a ser 3 dardos
    const newTotalDarts = this._totalDarts + 3;
    const rawAverage = newTotalScore / newTotalDarts * 3;
    const newAverage = Math.round((rawAverage + Number.EPSILON) * 100) / 100;

    // 2. Calcular número +100s, +140s, 180s
    const newHundredPlus = this._hundredPlus + (score >= 100 ? 1 : 0);
    const newHundredFortyPlus = this._hundredFortyPlus + (score >= 140 ? 1 : 0);
    const newOneEighties = this._oneEighties + (score === 180 ? 1 : 0);

    return new PlayerX01Stats(
      newHundredPlus,
      newHundredFortyPlus,
      newOneEighties,
      newAverage,
      newTotalScore,
      newTotalDarts,
    );
  }


  // -------------------------------------------------------------------------
  // Getters
  // -------------------------------------------------------------------------

  public get hundredPlus() {
    return this._hundredPlus;
  }

  public get hundredFortyPlus() {
    return this._hundredFortyPlus;
  }

  public get oneEighties() {
    return this._oneEighties;
  }

  public get average() {
    return this._average;
  }

  public get totalScore() {
    return this._totalScore;
  }

  public get totalDarts() {
    return this._totalDarts;
  }
}
