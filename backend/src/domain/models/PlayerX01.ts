import { ThrowX01 } from './ThrowX01';

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
  // private history: LegX01History[];

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

    // this.history = [];
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

  // Lógica de negocio
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

  public removeLastThrow(): void {
    if (this._throws.length <= 1) return;

    this._throws.pop();
    const lastRemaining = this._throws[this._throws.length - 1].remainingScore;
    this._remainingScore = lastRemaining;
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

  // Getters
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
