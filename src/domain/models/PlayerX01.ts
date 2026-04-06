import { BustException, InvalidThrowException } from '../Exceptions';
import { IThrowX01, IPlayerX01, GameTypes } from '../Ports';

export class PlayerX01 implements IPlayerX01 {
  // --------------------------------------------------------------------------
  // Attributes
  name: string;
  typeOfGame: GameTypes;
  initialScore: number;
  initialNumSets: number;
  initialNumLegs: number;

  remainingScore: number;
  numSetsWon: number;
  numLegsWon: number;
  throws: IThrowX01[];
  // --------------------------------------------------------------------------

  // --------------------------------------------------------------------------
  // Constructor
  constructor(
    name: string,
    initialScore: number,
    initialNumSets: number,
    initialNumLegs: number
  ) {
    this.name = name || 'Jugador';
    this.initialScore = initialScore;
    this.initialNumSets = initialNumSets;
    this.initialNumLegs = initialNumLegs;
    this.remainingScore = initialScore;
    this.numSetsWon = 0;
    this.numLegsWon = 0;
    this.throws = [];
  }

  /**
   * Register a new throw
   */
  // Pre: 0 <= score <= 180 && remainingScore > 0
  public addThrow(score: number): void {
    // Validar Pre-condiciones
    if (score < 0 || score > 180) {
      throw new InvalidThrowException('Puntuación inválida: debe estar entre 0 y 180');
    }
    if (this.remainingScore <= 0) {
      // MIRAR: ha habido algún error
    }

    // 1st Rule: Bust
    if (this.remainingScore - score == 1) {
      // MIRAR: si tratar como excepción o como evento
      throw new InvalidThrowException('Puntuación inválida: no puede quedar 1')
    }
    if (score > this.remainingScore) {
      // MIRAR: si tratar como excepción o como evento
      throw new BustException('Puntuación máxima excedida');
    }

    const currentDarts = this.throws.length === 0
      ? 3
      : this.throws[this.throws.length - 1].dartCount + 3;

    this.remainingScore -= score;

    this.throws.push({
      score,
      remainingScore: this.remainingScore,
      dartCount: currentDarts
    });

    this.checkGameStatus();
  }

  private checkGameStatus(): void {
    if (this.remainingScore == 0) {
      // End of the Leg
      this.newLeg();
    }
  }

  private newLeg(): void {
    this.numLegsWon += 1;
    this.throws = [];
    this.remainingScore = this.initialScore;

    if (this.numLegsWon == this.initialNumLegs) {
      // End of the Set
      this.newSet();
    }
  }

  private newSet(): void {
    this.numSetsWon += 1;
    this.numLegsWon = 0;
    this.throws = [];
    this.remainingScore = this.initialScore;

    if (this.numSetsWon == this.initialNumSets) {
      // End of the Match
      // MIRAR: qué hacer
    }
  }

  /**
   * Deletes the last throw
   */
  // Pre: throws.length > 0
  public undoLastThrow(): void {
    if (this.throws.length > 0) {
      this.throws.pop();
      this.remainingScore = this.throws.length > 0
        ? this.throws[this.throws.length - 1].remainingScore
        : this.initialScore;
    }
  }
}
