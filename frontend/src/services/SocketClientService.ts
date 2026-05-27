import { io, Socket } from 'socket.io-client';

class SocketClientService {
    // Cambiamos a public para poder escuchar directamente desde el useEffect de los componentes si es necesario
    public socket: Socket | null = null;
    private boardShortId: string | null = null;
    private matchId: string | null = null;

    private readonly SERVER_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.44:3000';

    public connect(boardShortId: string): void {
        if (this.socket) {
            this.disconnect();
        }

        this.boardShortId = boardShortId;
        // Forzamos transporte websocket para evitar problemas de polling en redes locales
        this.socket = io(this.SERVER_URL, { transports: ['websocket'] });

        this.socket.on('connect', () => {
            console.log(`[Socket] Conectado exitosamente. Socket ID: ${this.socket?.id}`);
            this.socket?.emit('join_board', this.boardShortId);
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
        this.boardShortId = null;
        this.matchId = null;
    }

    public setMatchId(matchId: string): void {
        this.matchId = matchId;
    }

    public emitScoreUpdate(throwData: any): void {
        if (!this.socket?.connected) return;
        this.socket.emit('score_update', {
            boardShortId: this.boardShortId,
            matchId: this.matchId,
            throwData: throwData
        });
    }

    public emitScoreUndo(): void {
        if (!this.socket?.connected) return;
        this.socket.emit('score_undo', {
            boardShortId: this.boardShortId,
            matchId: this.matchId,
        });
    }

    emitScoreEdit(historyThrows: any[]) {
        if (this.socket) {
            this.socket.emit('score_edit', {
                boardShortId: this.boardShortId,
                matchId: this.matchId,
                historyThrows: historyThrows,
            });
        }
    }

    public isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

export default new SocketClientService();