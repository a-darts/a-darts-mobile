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
    private _status: 'PLAYING' | 'FINISHED' = 'PLAYING';

    private constructor(
        id: string,
        config: MatchX01Config,
        players: PlayerX01[],
        activePlayerIndex?: number,
        status?: 'PLAYING' | 'FINISHED',
    ) {
        this.id = id;
        this._config = config;
        this._players = [...players];
        this._activePlayerIndex = activePlayerIndex || 0;
        this._status = status || 'PLAYING';
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
        return new MatchX01(id, config, players);
    }

    // Rehidratación: Para el Mapper del Repositorio
    public static restore(
        id: string,
        config: MatchX01Config,
        players: PlayerX01[],
        activeIndex: number,
        status: 'PLAYING' | 'FINISHED',
    ): MatchX01 {
        return new MatchX01(id, config, players, activeIndex, status);
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

        // ¿Ha ganado el Set? (Ej: Si es al mejor de 3 legs, necesita 2)
        // Usamos la config: config.legsPerSet
        if (winner.numLegsWon === this._config.numLegs) {
            this.handleSetWon(winner);
        } else {
            // Solo ha ganado un Leg, reseteamos a todos para el siguiente Leg
            this.resetPlayersForNextLeg();
            // MIRAR: cambiar esto
            // El que gana el leg suele empezar el siguiente (o rotar, según reglas)
            // Aquí simplemente reiniciamos el turno
            this._activePlayerIndex = 0;
        }
    }

    private handleSetWon(winner: PlayerX01): void {
        winner.winSet();

        // ¿Ha ganado la partida (Match)?
        // Usamos la config: config.setsToWin
        if (winner.numSetsWon === this._config.numSets) {
            this._status = 'FINISHED';
        } else {
            // MIRAR: cambiar esta lógica de salida
            // Resetear para el próximo Set
            this.resetPlayersForNextSet();
            this._activePlayerIndex = 0;
        }
    }

    private resetPlayersForNextLeg(): void {
        this._players.forEach(p => p.resetForNewLeg(this._config.game));
    }

    private resetPlayersForNextSet(): void {
        this._players.forEach(p => p.resetForNewSet(this._config.game));
    }

    public undoLastThrow(): void {
        // Caso A: Si la partida terminó, el índice NO se movió en el addThrow.
        // Simplemente borramos el tiro del jugador actual y reseteamos el estado.
        if (this._status === 'FINISHED') {
            // MIRAR porque esto no es como dice el Caso A
            // this._players[this._activePlayerIndex].removeLastThrow();
            // this._status = 'PLAYING';
            return;
        }

        // Caso B: Partida en curso. 
        // Debemos retroceder el turno antes de borrar.
        const newIndex = (this._activePlayerIndex - 1 + this._players.length) % this._players.length;

        // Verificamos si ese jugador tiene algo que borrar
        if (this._players[newIndex].throws.length > 1) {
            this._players[newIndex].removeLastThrow();
            this._activePlayerIndex = newIndex;
        }
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
}
