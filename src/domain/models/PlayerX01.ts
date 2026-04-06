import { Throw } from './Throw';

export class PlayerX01 {
  public name: string;
  public initialScore: number;
  public initialSets: number;
  public initialLegs: number;

  public scoreLeft: number;
  public wonSets: number;
  public wonLegs: number;
  public throws: Throw[];

  constructor(name: string, initialScore: number, initialSets: number, initialLegs: number) {
    this.name = name || 'Jugador';
    this.initialScore = initialScore;
    this.initialSets = initialSets;
    this.initialLegs = initialLegs;
    this.scoreLeft = initialScore;
    this.wonSets = 0;
    this.wonLegs = 0;
    this.throws = [];
  }

  /**
   * Registers a new throw
   */
  public addThrow(score: number): void {
    if (score > this.scoreLeft) {
      // return a BustException
    }

    const currentDarts = this.throws.length === 0
      ? 3
      : this.throws[this.throws.length - 1].dartCount + 3;

    this.scoreLeft -= score;

    this.throws.push({
      score,
      remaining: this.scoreLeft,
      dartCount: currentDarts
    });
  }

  /**
   * Deletes the last throw
   */
  public undoThrow(): void {
    if (this.throws.length > 0) {
      this.throws.pop();
      this.scoreLeft = this.throws.length > 0
        ? this.throws[this.throws.length - 1].remaining
        : this.initialScore;
    }
  }

  // Clone the instance to force re-render
  public clone(): PlayerX01 {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }
}
