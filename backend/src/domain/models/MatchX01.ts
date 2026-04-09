import { GameTypes } from "../enums/GameTypes";
import { MatchX01Config } from "./MatchX01Config";
import { PlayerX01 } from "./PlayerX01";

/*
 * Entity: MatchX01
 */
export class MatchX01 {
    public readonly id: string;
    private _config: MatchX01Config;
    private _players: PlayerX01[];

    private _activePlayerIndex: number = 0;
    private _startingPlayerIndexForLeg: number = 0;
    private _startingPlayerIndexForSet: number = 0;

    private _status: 'PLAYING' | 'FINISHED' = 'PLAYING';

    private constructor(
        id: string,
        config: MatchX01Config,
        players: PlayerX01[],
        activePlayerIndex: number,
        startingLegIndex: number,
        startingSetIndex: number,
        status: 'PLAYING' | 'FINISHED',
    ) {
        this.id = id;
        this._config = config;
        this._players = [...players];
        this._activePlayerIndex = activePlayerIndex;
        this._startingPlayerIndexForLeg = startingLegIndex;
        this._startingPlayerIndexForSet = startingSetIndex;
        this._status = status;
    }

    // Factory Method: Único punto de entrada para crear partidas nuevas
    public static create(
        id: string,
        config: MatchX01Config,
    ): MatchX01 {
        const players = config.playerNames.map(name =>
            PlayerX01.create(
                Math.random().toString(36).substring(2, 9),
                name,
                config.game,
            )
        );
        return new MatchX01(id, config, players, 0, 0, 0, 'PLAYING');
    }

    // Rehidratación: Para el Mapper del Repositorio
    public static restore(
        id: string,
        config: MatchX01Config,
        players: PlayerX01[],
        activePlayerIndex: number,
        startingLegIndex: number,
        startingSetIndex: number,
        status: 'PLAYING' | 'FINISHED',
    ): MatchX01 {
        return new MatchX01(
            id,
            config,
            players,
            activePlayerIndex,
            startingLegIndex,
            startingSetIndex,
            status,
        );
    }

    private calculateTarget(total: number): number {
        if (this._config.typeOfGame === GameTypes.BestOf) {
            return Math.floor(total / 2) + 1; // BestOf
        }
        return total; // FirstTo
    }

    // Lógica de Negocio
    public addThrow(score: number): void {
        if (this._status === 'FINISHED') return;
        if (score < 0 || score > 180) return;

        const currentPlayer = this._players[this._activePlayerIndex];
        currentPlayer.addThrow(score);

        if (currentPlayer.remainingScore === 0) {
            this.handleLegWon(currentPlayer);
        } else {
            this.nextTurn();
        }
    }

    private nextTurn(): void {
        this._activePlayerIndex = (this._activePlayerIndex + 1) % this._players.length;
    }

    private handleLegWon(winner: PlayerX01): void {
        winner.winLeg();

        const legsToWinSet = this.calculateTarget(this._config.numLegs);

        // Ha ganado el set
        if (winner.numLegsWon === legsToWinSet) {
            this.handleSetWon(winner);
        } else {
            // Solo ha ganado un Leg, reseteamos a todos para el siguiente Leg
            this.resetPlayersForNextLeg();
            this.rotateStartingPlayerForLeg();
        }
    }

    private handleSetWon(winner: PlayerX01): void {
        winner.winSet();

        const setsToWinMatch = this.calculateTarget(this._config.numSets);

        // Ha ganado la partida
        if (winner.numSetsWon === setsToWinMatch) {
            this.resetPlayersForNextSet();
            this._status = 'FINISHED';
        } else {
            this.resetPlayersForNextSet();
            this.rotateStartingPlayerForSet();
        }
    }

    private rotateStartingPlayerForLeg(): void {
        this._startingPlayerIndexForLeg = (this._startingPlayerIndexForLeg + 1) % this._players.length;
        this._activePlayerIndex = this._startingPlayerIndexForLeg;
    }

    private rotateStartingPlayerForSet(): void {
        this._startingPlayerIndexForSet = (this._startingPlayerIndexForSet + 1) % this._players.length;
        this._startingPlayerIndexForLeg = this._startingPlayerIndexForSet;
        this._activePlayerIndex = this._startingPlayerIndexForSet;
    }

    private resetPlayersForNextLeg(): void {
        this._players.forEach(p => p.resetForNewLeg(this._config.game));
    }

    private resetPlayersForNextSet(): void {
        this._players.forEach(p => p.resetForNewSet(this._config.game));
    }

    public undoLastThrow(): void {
        // Caso A: Partida finalizada
        if (this._status === 'FINISHED') {
            this._status = 'PLAYING';
            this.handleUndoVictory();
            return;
        }

        // Caso B: Partida en curso
        const currentPlayer = this._players[this._activePlayerIndex];
        if (currentPlayer.throws.length <= 1) {
            this.handleUndoVictory();
        } else {
            // Caso C: Undo normal de un dardo dentro del mismo leg
            currentPlayer.removeLastThrow();
            // MIRAR: Aquí podrías necesitar retroceder el activePlayerIndex 
            // si usas turnos individuales por dardo.
        }
    }

    private handleUndoVictory(): void {
        // 1. Encontrar quién fue el último en tirar (el que ganó)
        // En dardos, el que gana es el que tiró justo antes del reset
        // console.log('activePlayerIndex:', this._activePlayerIndex);
        // const winnerIndex = (this._activePlayerIndex - 1 + this._players.length) % this._players.length;
        const winner = this._players[this._activePlayerIndex];
        console.log('winner:', winner);
        console.log('config:', this.config);
        winner.undoWinSet(this.config.numLegs);
        winner.removeLastThrowFromLastLeg();


        // // 2. Si el ganador acaba de ganar un SET
        // if (winner.numLegsWon === 0 && winner.numSetsWon > 0) {
        //     winner.undoWinSet(this._config.numLegs - 1); // Simplificación lógica
        // }

        // // 3. Restaurar el Leg anterior del ganador
        // winner.removeLastThrowFromLastLeg();

        // // 4. Restaurar el estado de los demás jugadores (su puntuación antes del reset)
        // // Para un Undo perfecto, necesitarías guardar también los dardos de los "perdedores"
        // // o simplemente no resetear sus dardos hasta que empiece el nuevo leg.

        // // 5. Devolver el turno al ganador
        // this._activePlayerIndex = winnerIndex;
    }

    // Getters
    public get activePlayer() {
        return this._players[this._activePlayerIndex];
    }
    public get players() {
        return [...this._players];
    }
    public get status() {
        return this._status;
    }
    public get config() {
        return this._config.clone();
    }
    public get activePlayerIndex() {
        return this._activePlayerIndex;
    }
    public get startingPlayerIndexForLeg() {
        return this._startingPlayerIndexForLeg;
    }
    public get startingPlayerIndexForSet() {
        return this._startingPlayerIndexForSet;
    }
}
