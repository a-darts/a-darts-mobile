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
    numSetsWon?: number,
    numLegsWon?: number,
    throws?: ThrowX01[],
  ) {
    this.id = id;
    this.name = name || 'Jugador';
    this._remainingScore = remainingScore;
    this._numSetsWon = numSetsWon ? numSetsWon : 0;
    this._numLegsWon = numLegsWon ? numLegsWon : 0;
    this._throws = throws ? [...throws] : [];
    // this.history = [];
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
      throws,
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
        (this._throws.length + 1) * 3,
      )
    );
  }

  public removeLastThrow(): void {
    if (this._throws.length === 0) return;

    const lastThrow = this._throws.pop();
    if (lastThrow) {
      this._remainingScore = lastThrow.remainingScore;
    }
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
