import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BOARD_SHORT_ID_KEY = 'boardShortId';

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
            // Persistir el boardShortId después de conexión exitosa
            this.saveBoardShortId(this.boardShortId);
        });

        this.socket.on('disconnect', () => {
            console.log('[Socket] Desconectado del servidor.');
        });

        this.socket.on('connect_error', (error) => {
            console.error('[Socket] Error de conexión:', error);
        });
    }

    public async saveBoardShortId(boardShortId: string | null): Promise<void> {
        try {
            if (boardShortId) {
                await AsyncStorage.setItem(BOARD_SHORT_ID_KEY, boardShortId);
                console.log(`[Socket] boardShortId guardado: ${boardShortId}`);
            } else {
                await AsyncStorage.removeItem(BOARD_SHORT_ID_KEY);
                console.log('[Socket] boardShortId eliminado');
            }
        } catch (error) {
            console.error('[Socket] Error al guardar boardShortId:', error);
        }
    }

    public async getBoardShortId(): Promise<string | null> {
        try {
            const id = await AsyncStorage.getItem(BOARD_SHORT_ID_KEY);
            console.log(`[Socket] boardShortId recuperado: ${id}`);
            return id;
        } catch (error) {
            console.error('[Socket] Error al recuperar boardShortId:', error);
            return null;
        }
    }

    public disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.boardShortId = null;
        this.matchId = null;
    }

    public clearBoardShortId(): void {
        this.saveBoardShortId(null);
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