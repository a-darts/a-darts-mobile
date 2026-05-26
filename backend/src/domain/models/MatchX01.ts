import { GameStatus } from "../enums/GameStatus";
import { GameTypes } from "../enums/GameTypes";
import { BustException, EndedMatchException } from "../exceptions/Exceptions";
import { MatchX01Config } from "./MatchX01Config";
import { PlayerX01 } from "./PlayerX01";

interface MatchX01Snapshot {
    players: ReturnType<PlayerX01['takeSnapshot']>[];
    activePlayerIndex: number;
    startingPlayerIndexForLeg: number;
    startingPlayerIndexForSet: number;
    status: GameStatus;
}

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

    private _status: GameStatus = GameStatus.PLAYING;

    private _history: MatchX01Snapshot[] = [];


    // --------------------------------------------------------------------------
    // Constructor
    // --------------------------------------------------------------------------

    private constructor(
        id: string,
        config: MatchX01Config,
        players: PlayerX01[],
        activePlayerIndex: number,
        startingLegIndex: number,
        startingSetIndex: number,
        status: GameStatus,
        history: MatchX01Snapshot[] = [],
    ) {
        this.id = id;
        this._config = config;
        this._players = [...players];
        this._activePlayerIndex = activePlayerIndex;
        this._startingPlayerIndexForLeg = startingLegIndex;
        this._startingPlayerIndexForSet = startingSetIndex;
        this._status = status;
        this._history = [...history];
    }


    // --------------------------------------------------------------------------
    // Factory Method: Only way to create new matches
    // --------------------------------------------------------------------------

    public static create(
        id: string,
        config: MatchX01Config,
    ): MatchX01 {
        const players = config.playerNames.map(name =>
            PlayerX01.create(
                name,
                config.game,
            )
        );
        return new MatchX01(
            id,
            config,
            players,
            0,
            0,
            0,
            GameStatus.PLAYING,
        );
    }


    // -------------------------------------------------------------------------
    // Domain methods
    // -------------------------------------------------------------------------

    // Pre: status === 'PLAYING'
    // Post: snapshot saved && score added
    public addThrow(score: number, dartsUsed: number = 3): void {
        if (this._status === GameStatus.FINISHED) {
            throw new EndedMatchException('La partida ya ha finalizado');
        }

        this._history.push(this.takeSnapshot());

        const currentPlayer = this._players[this._activePlayerIndex];
        currentPlayer.addThrow(score, dartsUsed);

        if (currentPlayer.remainingScore === 0) {
            // Win 1 leg
            this.handleLegWon(currentPlayer);
        } else {
            this.nextTurn();
        }
    }

    public undoLastThrow(): void {
        const previous = this._history.pop();
        if (!previous) return;
        this.restoreSnapshot(previous);
    }

    public editThrow(playerId: string, throwIndex: number, newScore: number): void {
        const player = this._players.find(p => p.id === playerId);
        if (!player) {
            throw new Error('Jugador no encontrado');
        }

        const oldLength = player.throws.length;

        // 1. Aplicamos el cambio al jugador
        player.editThrow(throwIndex, newScore);

        // 2. Actualizamos el historial para que sea consistente con la edición
        const truncated = player.throws.length < oldLength;

        if (truncated) {
            // Si hubo truncado (cierre), el historial posterior es inválido
            this._history = [this.takeSnapshot()];
        } else {
            // Si no hay truncado, actualizamos todas las snapshots existentes
            this._history = this._history.map(snap => {
                const updatedPlayers = snap.players.map(pSnap => {
                    if (pSnap.id !== playerId) return pSnap;
                    // Solo si la snapshot contiene la tirada editada
                    if (throwIndex >= pSnap.throws.length) return pSnap;

                    try {
                        const p = PlayerX01.fromSnapshot(pSnap);
                        p.editThrow(throwIndex, newScore);
                        return p.takeSnapshot();
                    } catch (e) {
                        // Si falla la edición en la snapshot (p.ej. por bust), 
                        // es mejor dejarla como está o marcarla para borrar
                        return pSnap;
                    }
                });
                return { ...snap, players: updatedPlayers };
            });
        }

        // 3. Re-evaluar estado de la partida
        if (player.remainingScore === 0) {
            this.handleLegWon(player);
        } else if (this._status === GameStatus.FINISHED) {
            this._status = GameStatus.PLAYING;
            this._activePlayerIndex = this._players.indexOf(player);
        }
    }

    public swapStartingPlayer(): void {
        // Solo permitido antes de la primera tirada
        if (this._history.length > 0) return;

        this._startingPlayerIndexForLeg = (this._startingPlayerIndexForLeg + 1) % this._players.length;
        this._startingPlayerIndexForSet = this._startingPlayerIndexForLeg;
        this._activePlayerIndex = this._startingPlayerIndexForLeg;
    }

    // -------------------------------------------------------------------------
    // Sets and Legs Logic
    // -------------------------------------------------------------------------

    private handleLegWon(winner: PlayerX01): void {
        winner.winLeg();

        const legsToWinSet = this.calculateTarget(this._config.numLegs);
        if (winner.numLegsWon >= legsToWinSet) {
            // Win 1 set
            this.handleSetWon(winner);
        } else {
            // Win 1 leg
            this._players.forEach(p => p.resetForNewLeg(this._config.game));
            this.rotateStartingPlayerForLeg();
        }

        // Si la partida ha terminado, nos aseguramos de que el jugador activo sea el ganador
        if (this._status === GameStatus.FINISHED) {
            this._activePlayerIndex = this._players.findIndex(p => p.id === winner.id);
        }
    }

    private handleSetWon(winner: PlayerX01): void {
        winner.winSet();

        const setsToWinMatch = this.calculateTarget(this._config.numSets);
        if (winner.numSetsWon >= setsToWinMatch) {
            // Win the match
            this._players.forEach(p => p.resetLegsForMatchEnd());
            this._status = GameStatus.FINISHED;
            this._activePlayerIndex = this._players.findIndex(p => p.id === winner.id);
        } else {
            // Win 1 set
            this._players.forEach(p => p.resetForNewSet(this._config.game));
            this.rotateStartingPlayerForSet();
        }
    }


    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private nextTurn(): void {
        this._activePlayerIndex =
            (this._activePlayerIndex + 1) % this._players.length;
    }

    private calculateTarget(total: number): number {
        if (this._config.typeOfGame === GameTypes.BEST_OF) {
            return Math.floor(total / 2) + 1; // BEST_OF
        }
        return total; // FIRST_TO
    }

    private rotateStartingPlayerForLeg(): void {
        this._startingPlayerIndexForLeg =
            (this._startingPlayerIndexForLeg + 1) % this._players.length;
        this._activePlayerIndex = this._startingPlayerIndexForLeg;
    }

    private rotateStartingPlayerForSet(): void {
        this._startingPlayerIndexForSet =
            (this._startingPlayerIndexForSet + 1) % this._players.length;
        this._startingPlayerIndexForLeg = this._startingPlayerIndexForSet;
        this._activePlayerIndex = this._startingPlayerIndexForSet;
    }


    // -------------------------------------------------------------------------
    // Getters
    // -------------------------------------------------------------------------

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

    public get history() {
        return [...this._history];
    }


    // --------------------------------------------------------------------------
    // Restore: For repository mapper
    // --------------------------------------------------------------------------

    public static restore(
        id: string,
        config: MatchX01Config,
        players: PlayerX01[],
        activePlayerIndex: number,
        startingLegIndex: number,
        startingSetIndex: number,
        status: GameStatus,
        history: MatchX01Snapshot[] = [],
    ): MatchX01 {
        return new MatchX01(
            id,
            config,
            players,
            activePlayerIndex,
            startingLegIndex,
            startingSetIndex,
            status,
            history,
        );
    }


    // -------------------------------------------------------------------------
    // Snapshots
    // -------------------------------------------------------------------------

    private takeSnapshot(): MatchX01Snapshot {
        return {
            players: this._players.map(p => p.takeSnapshot()),
            activePlayerIndex: this._activePlayerIndex,
            startingPlayerIndexForLeg: this._startingPlayerIndexForLeg,
            startingPlayerIndexForSet: this._startingPlayerIndexForSet,
            status: this._status,
        };
    }

    private restoreSnapshot(snapshot: MatchX01Snapshot): void {
        this._activePlayerIndex = snapshot.activePlayerIndex;
        this._startingPlayerIndexForLeg = snapshot.startingPlayerIndexForLeg;
        this._startingPlayerIndexForSet = snapshot.startingPlayerIndexForSet;
        this._status = snapshot.status;
        this._players = snapshot.players.map(s => PlayerX01.fromSnapshot(s));
    }
}
