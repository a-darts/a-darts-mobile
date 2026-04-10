import { GameTypes } from "../enums/GameTypes";
import { MatchX01Config } from "./MatchX01Config";
import { PlayerX01 } from "./PlayerX01";

interface MatchX01Snapshot {
    players: ReturnType<PlayerX01['snapshot']>[];
    activePlayerIndex: number;
    startingPlayerIndexForLeg: number;
    startingPlayerIndexForSet: number;
    status: 'PLAYING' | 'FINISHED';
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

    private _status: 'PLAYING' | 'FINISHED' = 'PLAYING';

    private _history: MatchX01Snapshot[] = [];

    private constructor(
        id: string,
        config: MatchX01Config,
        players: PlayerX01[],
        activePlayerIndex: number,
        startingLegIndex: number,
        startingSetIndex: number,
        status: 'PLAYING' | 'FINISHED',
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
    // Lógica principal
    // -------------------------------------------------------------------------

    public addThrow(score: number): void {
        if (this._status === 'FINISHED') return;
        if (score < 0 || score > 180) return;

        this._history.push(this.takeSnapshot());

        const currentPlayer = this._players[this._activePlayerIndex];
        try {
            currentPlayer.addThrow(score);
        } catch {
            this.nextTurn(); // MIRAR: lógica de Bust
            return;
        }

        if (currentPlayer.remainingScore === 0) {
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

    public swapStartingPlayer(): void {
        // Solo permitido antes de la primera tirada
        if (this._history.length > 0) return;

        this._startingPlayerIndexForLeg = (this._startingPlayerIndexForLeg + 1) % this._players.length;
        this._startingPlayerIndexForSet = this._startingPlayerIndexForLeg;
        this._activePlayerIndex = this._startingPlayerIndexForLeg;
    }

    // -------------------------------------------------------------------------
    // Lógica de legs y sets
    // -------------------------------------------------------------------------

    private handleLegWon(winner: PlayerX01): void {
        winner.winLeg();

        const legsToWinSet = this.calculateTarget(this._config.numLegs);
        if (winner.numLegsWon >= legsToWinSet) {
            // Ha ganado un set
            this.handleSetWon(winner);
        } else {
            // Ha ganado un leg
            this._players.forEach(p => p.resetForNewLeg(this._config.game));
            this.rotateStartingPlayerForLeg();
        }
    }

    private handleSetWon(winner: PlayerX01): void {
        winner.winSet();

        const setsToWinMatch = this.calculateTarget(this._config.numSets);
        if (winner.numSetsWon >= setsToWinMatch) {
            // Ha ganado la partida
            this._players.forEach(p => p.resetLegsForMatchEnd());
            this._status = 'FINISHED';
        } else {
            // Ha ganado un set
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
        if (this._config.typeOfGame === GameTypes.BestOf) {
            return Math.floor(total / 2) + 1; // BestOf
        }
        return total; // FirstTo
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
    // Snapshots
    // -------------------------------------------------------------------------

    private takeSnapshot(): MatchX01Snapshot {
        return {
            players: this._players.map(p => p.snapshot()),
            activePlayerIndex: this._activePlayerIndex,
            startingPlayerIndexForLeg: this._startingPlayerIndexForLeg,
            startingPlayerIndexForSet: this._startingPlayerIndexForSet,
            status: this._status,
        };
    }

    private restoreSnapshot(snap: MatchX01Snapshot): void {
        this._activePlayerIndex = snap.activePlayerIndex;
        this._startingPlayerIndexForLeg = snap.startingPlayerIndexForLeg;
        this._startingPlayerIndexForSet = snap.startingPlayerIndexForSet;
        this._status = snap.status;
        this._players = snap.players.map(s => PlayerX01.fromSnapshot(s));
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
}
