import { io, Socket } from 'socket.io-client';

class SocketClientService {
    private socket: Socket | null = null;
    private boardId: string | null = null;
    private matchId: string | null = null;

    private matchAssignedCallback: ((matchId: string) => void) | null = null;
    private matchStartedCallback: ((matchId: string) => void) | null = null;
    private matchRestoredCallback: ((data: { matchId: string, historyThrows: any[] }) => void) | null = null;

    // MIRAR: Reemplazar por la url real del proyecto
    private readonly SERVER_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

    public connect(boardId: string): void {
        if (this.socket) {
            this.disconnect();
        }

        this.boardId = boardId;
        this.socket = io(this.SERVER_URL);

        this.socket.on('connect', () => {
            console.log(`[Socket] Conectado exitosamente. Socket ID: ${this.socket?.id}`);
            // Unirse a la sala de la diana
            this.socket?.emit('join_board', this.boardId);
        });

        this.socket.on('match_assigned', (data: { matchId: string }) => {
            console.log('[Socket] Partido asignado a la diana:', data.matchId);
            if (this.matchAssignedCallback) {
                this.matchAssignedCallback(data.matchId);
            }
        });

        this.socket.on('match_started', (data: { matchId: string }) => {
            console.log('[Socket] Partido INICIADO en la diana:', data.matchId);
            if (this.matchStartedCallback) {
                this.matchStartedCallback(data.matchId);
            }
        });

        this.socket.on('match_restored', (data: { matchId: string, historyThrows: any[] }) => {
            console.log('[Socket] Partido DETECTADO EN CURSO (Restaurando):', data.matchId);
            if (this.matchRestoredCallback) {
                this.matchRestoredCallback(data);
            }
        });

        this.socket.on('disconnect', () => {
            console.log('[Socket] Desconectado del servidor.');
        });

        this.socket.on('connect_error', (error) => {
            console.error('[Socket] Error de conexión:', error);
        });
    }

    public disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.boardId = null;
        this.matchId = null;
        this.matchAssignedCallback = null;
        this.matchStartedCallback = null;
        this.matchRestoredCallback = null;
    }

    public setMatchId(matchId: string): void {
        this.matchId = matchId;
    }

    /**
     * Emite una actualización de puntuación o evento relevante de la partida.
     */
    public emitScoreUpdate(throwData: any): void {
        if (!this.socket || !this.socket.connected) {
            console.warn('[Socket] Intentando emitir sin conexión activa.');
            return;
        }
        if (!this.boardId || !this.matchId) {
            console.warn('[Socket] Faltan boardId o matchId para emitir.');
            return;
        }

        this.socket.emit('score_update', {
            boardId: this.boardId,
            matchId: this.matchId,
            throwData: throwData
        });
    }

    public isConnected(): boolean {
        return this.socket?.connected || false;
    }

    public onMatchAssigned(callback: (matchId: string) => void): void {
        this.matchAssignedCallback = callback;
    }

    public offMatchAssigned(): void {
        this.matchAssignedCallback = null;
    }

    public onMatchStarted(callback: (matchId: string) => void): void {
        this.matchStartedCallback = callback;
    }

    public offMatchStarted(): void {
        this.matchStartedCallback = null;
    }

    public onMatchRestored(callback: (data: { matchId: string, historyThrows: any[] }) => void): void {
        this.matchRestoredCallback = callback;
    }

    public offMatchRestored(): void {
        this.matchRestoredCallback = null;
    }
}

export default new SocketClientService();
