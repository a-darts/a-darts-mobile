import { ThrowX01 } from './ThrowX01';

export interface PlayerX01Snapshot {
  id: string;
  name: string;
  remainingScore: number;
  numSetsWon: number;
  numLegsWon: number;
  throws: { score: number; remainingScore: number; dartCount: number }[];
}

/*
 * Entity: PlayerX01
 */
export class PlayerX01 {
  public readonly id: string;
  public readonly name: string;
  private _remainingScore: number;
  private _numSetsWon: number;
  private _numLegsWon: number;
  private _throws: ThrowX01[];

  // --------------------------------------------------------------------------
  // Constructor
  constructor(
    id: string,
    name: string,
    remainingScore: number,
    numSets: number,
    numLegs: number,
    throws: ThrowX01[],
  ) {
    this.id = id;
    this.name = name;
    this._remainingScore = remainingScore;
    this._numSetsWon = numSets;
    this._numLegsWon = numLegs;
    this._throws = [...throws];
  }

  // Factory method
  public static create(
    id: string,
    name: string,
    initialScore: number,
  ): PlayerX01 {
    const initialThrow = new ThrowX01(0, initialScore, 0);
    return new PlayerX01(
      id,
      name,
      initialScore,
      0,
      0,
      [initialThrow],
    );
  }

  // Rehidratación: Para el Mapper del Repositorio
  public static restore(
    id: string,
    name: string,
    remainingScore: number,
    numSetsWon: number,
    numLegsWon: number,
    throws: ThrowX01[],
  ): PlayerX01 {
    return new PlayerX01(
      id,
      name,
      remainingScore,
      numSetsWon,
      numLegsWon,
      [...throws],
    );
  }

  // -------------------------------------------------------------------------
  // Snapshots
  // -------------------------------------------------------------------------

  public snapshot(): PlayerX01Snapshot {
    return {
      id: this.id,
      name: this.name,
      remainingScore: this._remainingScore,
      numSetsWon: this._numSetsWon,
      numLegsWon: this._numLegsWon,
      throws: this._throws.map(t => ({
        score: t.score,
        remainingScore: t.remainingScore,
        dartCount: t.dartCount,
      })),
    };
  }

  public static fromSnapshot(s: PlayerX01Snapshot): PlayerX01 {
    const throws = s.throws.map(
      t => new ThrowX01(t.score, t.remainingScore, t.dartCount)
    );
    return new PlayerX01(s.id, s.name, s.remainingScore, s.numSetsWon, s.numLegsWon, throws);
  }

  // -------------------------------------------------------------------------
  // Lógica de negocio
  // -------------------------------------------------------------------------

  public addThrow(score: number): void {
    const newRemaining = this._remainingScore - score;

    if (newRemaining < 0 || newRemaining === 1) {
      throw new Error('Bust');
    }

    this._remainingScore = newRemaining;
    this._throws.push(
      new ThrowX01(
        score,
        newRemaining,
        (this._throws.length) * 3,
      )
    );
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
}
