import { BustException, InvalidThrowException } from '../exceptions/Exceptions';
import { IThrowX01, ThrowX01 } from './ThrowX01';
import { GameTypes } from '../enums/GameTypes';
import { ILegX01History } from './LegX01History';

export interface IPlayerX01 {
  id: string;
  name: string;
  typeOfGame: GameTypes;
  initialScore: number;
  initialNumSets: number;
  initialNumLegs: number;
  remainingScore: number;
  numSetsWon: number;
  numLegsWon: number;
  throws: IThrowX01[];
  history: ILegX01History[];

  addThrow(score: number): boolean;
  undoLastThrow(): void;
  resetForNewLeg(): boolean;
  resetForNewSet(): void;
  clone(): IPlayerX01;
}

export class PlayerX01 implements IPlayerX01 {
  // --------------------------------------------------------------------------
  // Attributes
  id: string;
  name: string;
  typeOfGame: GameTypes;
  initialScore: number;
  initialNumSets: number;
  initialNumLegs: number;

  remainingScore: number;
  numSetsWon: number;
  numLegsWon: number;
  throws: IThrowX01[];
  history: ILegX01History[];
  // --------------------------------------------------------------------------

  // --------------------------------------------------------------------------
  // Constructor
  constructor(
    name: string,
    initialScore: number,
    initialNumSets: number,
    initialNumLegs: number,
    id?: string,
  ) {
    this.id = id || crypto.randomUUID();
    this.name = name || 'Jugador';
    this.initialScore = initialScore;
    this.initialNumSets = initialNumSets;
    this.initialNumLegs = initialNumLegs;
    this.remainingScore = initialScore;
    this.numSetsWon = 0;
    this.numLegsWon = 0;
    this.throws = [];
    this.history = [];

    this.addFirstThrow();
  }

  private addFirstThrow(): void {
    const firstThrow = new ThrowX01(0, this.initialScore, 0);
    this.throws.push(firstThrow);
  }

  /**
   * Register a new throw
   */
  // Pre: 0 <= score <= 180 && remainingScore > 0
  public addThrow(score: number): boolean {
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

    const newThrow: IThrowX01 = {
      score,
      remainingScore: this.remainingScore,
      dartCount: currentDarts,
    }
    this.throws.push(newThrow);

    if (this.remainingScore == 0) {
      // End of the Leg
      this.numLegsWon++;
      return true;
    }
    return false;
  }

  /**
   * Deletes the last throw
   */
  // Pre: throws.length > 1
  public undoLastThrow(): void {
    if (this.throws.length > 1) {
      this.throws.pop();
      this.remainingScore = this.throws[this.throws.length - 1].remainingScore;
    }
  }

  public resetForNewLeg(): boolean {
    this.saveLegToHistory();
    this.remainingScore = this.initialScore;
    this.throws = [];
    this.addFirstThrow();

    if (this.numLegsWon == this.initialNumLegs) {
      this.numSetsWon++;
      return true;
    }
    return false;
  }

  public resetForNewSet(): void {
    this.numLegsWon = 0;

    if (this.numSetsWon == this.initialNumSets) {
      // Fin de la partida
      // MIRAR QUE HACER
    }
  }

  // private newLeg(): void {
  //   this.numLegsWon++;
  //   this.throws = [];
  //   this.remainingScore = this.initialScore;
  //   if (this.numLegsWon == this.initialNumLegs) {
  //     // End of the Set
  //     this.newSet();
  //   }
  // }

  // private newSet(): void {
  //   this.numSetsWon++;
  //   this.numLegsWon = 0;
  //   this.throws = [];
  //   this.remainingScore = this.initialScore;
  //   if (this.numSetsWon == this.initialNumSets) {
  //     // End of the Match
  //     // MIRAR: qué hacer
  //   }
  // }

  private saveLegToHistory(): void {
    const legFinished: ILegX01History = {
      legNumber: this.numLegsWon + 1,
      setNumber: this.numSetsWon + 1,
      throws: [...this.throws]
    };

    this.history.push(legFinished);
  }








  public clone(): PlayerX01 {
    return new PlayerX01(
      this.name,
      this.initialScore,
      this.initialNumSets,
      this.initialNumLegs,
      this.id,
    );
  }
}
