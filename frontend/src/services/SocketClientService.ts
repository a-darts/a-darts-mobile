import { io, Socket } from 'socket.io-client';

type MatchStatusListener = (data: { matchId: string }) => void;

class SocketClientService {
    // Cambiamos a public para poder escuchar directamente desde el useEffect de los componentes si es necesario
    public socket: Socket | null = null;
    private boardShortId: string | null = null;
    private matchId: string | null = null;

    private matchSuspendedListeners: MatchStatusListener[] = [];
    private matchResumedListeners: MatchStatusListener[] = [];

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

        this.socket.on('match_suspended', (data: { matchId: string }) => {
            console.log('[Socket] match_suspended recibido:', data);
            this.matchSuspendedListeners.forEach(fn => fn(data));
        });

        this.socket.on('match_resumed', (data: { matchId: string }) => {
            console.log('[Socket] match_resumed recibido:', data);
            this.matchResumedListeners.forEach(fn => fn(data));
        });
    }

    public disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.boardShortId = null;
        this.matchId = null;
        this.matchSuspendedListeners = [];
        this.matchResumedListeners = [];
    }

    public isConnected(): boolean {
        return this.socket?.connected || false;
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

    public emitScoreEdit(historyThrows: any[]) {
        if (this.socket) {
            this.socket.emit('score_edit', {
                boardShortId: this.boardShortId,
                matchId: this.matchId,
                historyThrows: historyThrows,
            });
        }
    }

    public onMatchSuspended(listener: MatchStatusListener): () => void {
        this.matchSuspendedListeners.push(listener);
        return () => {
            this.matchSuspendedListeners = this.matchSuspendedListeners.filter(fn => fn !== listener);
        };
    }

    public onMatchResumed(listener: MatchStatusListener): () => void {
        this.matchResumedListeners.push(listener);
        return () => {
            this.matchResumedListeners = this.matchResumedListeners.filter(fn => fn !== listener);
        };
    }
}

export default new SocketClientService();