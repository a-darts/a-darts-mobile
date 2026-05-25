import { io, Socket } from 'socket.io-client';

class SocketClientService {
    private socket: Socket | null = null;
    private boardId: string | null = null;
    private matchId: string | null = null;

    // TODO: Reemplazar con la URL base correcta según el entorno (ej: variables de entorno)
    // Para desarrollo local con emulador, puede que necesites usar la IP de tu PC en lugar de localhost
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
        if (!this.socket) return;
        this.socket.on('match_assigned', (data: { matchId: string }) => {
            console.log('[Socket] Partido asignado a la diana:', data.matchId);
            callback(data.matchId);
        });
    }

    public offMatchAssigned(): void {
        if (!this.socket) return;
        this.socket.off('match_assigned');
    }
}

export default new SocketClientService();
