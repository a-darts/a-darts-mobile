import { PlayerX01Stats } from './PlayerX01Stats';
import { ThrowX01 } from './ThrowX01';

export interface PlayerX01Snapshot {
  id: string;
  name: string;
  remainingScore: number;
  numSetsWon: number;
  numLegsWon: number;
  throws: {
    score: number;
    remainingScore: number;
    dartCount: number;
  }[];
  stats: {
    hundredPlus: number,
    hundredFortyPlus: number,
    oneEighties: number,
    average: number,
    totalScore: number,
    totalDarts: number,
  };
}

/*
 * Entity: PlayerX01
 */
export class PlayerX01 {
  public readonly id: string;
  private _name: string;
  private _remainingScore: number;
  private _numSetsWon: number;
  private _numLegsWon: number;
  private _throws: ThrowX01[];
  private _stats: PlayerX01Stats;

  // --------------------------------------------------------------------------
  // Constructor
  // --------------------------------------------------------------------------

  private constructor(
    id: string,
    name: string,
    remainingScore: number,
    numSets: number,
    numLegs: number,
    throws: ThrowX01[],
    stats: PlayerX01Stats,
  ) {
    this.id = id;
    this._name = name;
    this._remainingScore = remainingScore;
    this._numSetsWon = numSets;
    this._numLegsWon = numLegs;
    this._throws = [...throws];
    this._stats = stats;
  }


  // --------------------------------------------------------------------------
  // Factory method
  // --------------------------------------------------------------------------

  public static create(
    name: string,
    initialScore: number,
  ): PlayerX01 {
    return new PlayerX01(
      Math.random().toString(36).substring(2, 9),
      name,
      initialScore,
      0,
      0,
      [new ThrowX01(0, initialScore, 0)],
      new PlayerX01Stats(),
    );
  }


  // -------------------------------------------------------------------------
  // Lógica de negocio
  // -------------------------------------------------------------------------

  public addThrow(score: number, dartsUsed: number = 3): void {
    const newRemaining = this._remainingScore - score;
    const newDartCount = (this._throws.length) * 3;
    const newThrow = new ThrowX01(
      score,
      newRemaining,
      newDartCount,
    );

    // Update Stats
    this._stats = this._stats.updateWithNewScore(score, dartsUsed);

    // Update (just if newThrow is valid)
    this._remainingScore = newRemaining;
    this._throws.push(newThrow);
  }

  public editThrow(index: number, newScore: number): void {
    if (index <= 0 || index >= this._throws.length) {
      throw new Error('Índice de tirada inválido');
    }

    // 1. Update the target throw
    const previousRemaining = this._throws[index - 1].remainingScore;
    const newRemaining = previousRemaining - newScore;
    this._throws[index] = new ThrowX01(
      newScore,
      newRemaining,
      this._throws[index].dartCount
    );

    if (newRemaining === 0) {
      this._throws = this._throws.slice(0, index + 1);
    } else {
      // 2. Recalculate subsequent throws
      let truncateAt = -1;
      for (let i = index + 1; i < this._throws.length; i++) {
        const prevRem = this._throws[i - 1].remainingScore;
        const currentRem = prevRem - this._throws[i].score;
        this._throws[i] = new ThrowX01(
          this._throws[i].score,
          currentRem,
          this._throws[i].dartCount
        );
        if (currentRem === 0) {
          truncateAt = i;
          break;
        }
      }

      if (truncateAt !== -1) {
        this._throws = this._throws.slice(0, truncateAt + 1);
      }
    }

    // 3. Update current remaining score
    this._remainingScore = this._throws[this._throws.length - 1].remainingScore;

    // 4. Recalculate stats
    this.recalculateStats();
  }

  private recalculateStats(): void {
    let newStats = new PlayerX01Stats();
    // Omitimos el índice 0 (estado inicial)
    for (let i = 1; i < this._throws.length; i++) {
      const t = this._throws[i];
      // Asumimos 3 dardos por tirada ya que no se guardan individualmente
      newStats = newStats.updateWithNewScore(t.score, 3);
    }
    this._stats = newStats;
  }

  public winLeg(): void {
    this._numLegsWon++;
  }

  public winSet(): void {
    this._numSetsWon++;
    this._numLegsWon = 0;
  }

  public resetForNewLeg(initialScore: number): void {
    this._remainingScore = initialScore;
    const initialThrow = new ThrowX01(0, initialScore, 0);
    this._throws = [initialThrow];
  }

  public resetForNewSet(initialScore: number): void {
    this._numLegsWon = 0;
    this.resetForNewLeg(initialScore);
  }

  public resetLegsForMatchEnd(): void {
    this._numLegsWon = 0;
  }


  // -------------------------------------------------------------------------
  // Getters
  // -------------------------------------------------------------------------

  public get name() {
    return this._name;
  }

  public get remainingScore() {
    return this._remainingScore;
  }

  public get numLegsWon() {
    return this._numLegsWon;
  }

  public get numSetsWon() {
    return this._numSetsWon;
  }

  public get throws() {
    return [...this._throws];
  }

  public get stats() {
    return this._stats;
  }


  // --------------------------------------------------------------------------
  // Restore: For repository mapper
  // --------------------------------------------------------------------------

  public static restore(
    id: string,
    name: string,
    remainingScore: number,
    numSetsWon: number,
    numLegsWon: number,
    throws: ThrowX01[],
    stats: PlayerX01Stats,
  ): PlayerX01 {
    return new PlayerX01(
      id,
      name,
      remainingScore,
      numSetsWon,
      numLegsWon,
      [...throws],
      stats,
    );
  }


  // -------------------------------------------------------------------------
  // Snapshots
  // -------------------------------------------------------------------------

  public snapshot(): PlayerX01Snapshot {
    return {
      id: this.id,
      name: this._name,
      remainingScore: this._remainingScore,
      numSetsWon: this._numSetsWon,
      numLegsWon: this._numLegsWon,
      throws: this._throws.map(t => ({
        score: t.score,
        remainingScore: t.remainingScore,
        dartCount: t.dartCount,
      })),
      stats: {
        hundredPlus: this._stats.hundredPlus,
        hundredFortyPlus: this._stats.hundredFortyPlus,
        oneEighties: this._stats.oneEighties,
        average: this._stats.average,
        totalScore: this._stats.totalScore,
        totalDarts: this._stats.totalDarts,
      },
    };
  }

  public static fromSnapshot(s: PlayerX01Snapshot): PlayerX01 {
    const throws = s.throws.map(
      t => new ThrowX01(t.score, t.remainingScore, t.dartCount)
    );
    const stats = new PlayerX01Stats(
      s.stats.hundredPlus,
      s.stats.hundredFortyPlus,
      s.stats.oneEighties,
      s.stats.average,
      s.stats.totalScore,
      s.stats.totalDarts,
    );

    return new PlayerX01(
      s.id,
      s.name,
      s.remainingScore,
      s.numSetsWon,
      s.numLegsWon,
      throws,
      stats,
    );
  }
}
