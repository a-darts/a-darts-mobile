import SocketClientService from '../../src/services/SocketClientService';
import { io } from 'socket.io-client';

// Mock de socket.io-client
jest.mock('socket.io-client', () => {
    const mSocket = {
        on: jest.fn(),
        emit: jest.fn(),
        disconnect: jest.fn(),
        connected: true,
        id: 'mock-socket-123'
    };
    return { io: jest.fn(() => mSocket) };
});

describe('SocketClientService - Unit Tests', () => {
    let mockSocketInstance: any;

    beforeEach(() => {
        jest.clearAllMocks();
        SocketClientService.disconnect();
        mockSocketInstance = io('http://dummy');
    });

    it('debe inicializar la conexión y registrar listeners de eventos nativos', () => {
        SocketClientService.connect('SABC-D123');

        expect(io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
            transports: ['websocket'],
            forceNew: true
        }));
        expect(mockSocketInstance.on).toHaveBeenCalledWith('connect', expect.any(Function));
        expect(mockSocketInstance.on).toHaveBeenCalledWith('match_suspended', expect.any(Function));
    });

    it('debe propagar eventos recibidos a los suscriptores registrados internamente', () => {
        SocketClientService.connect('SABC-D123');

        // Extraemos el callback guardado para 'match_suspended'
        const eventMap: Record<string, Function> = {};
        mockSocketInstance.on.mock.calls.forEach(([event, cb]: [string, Function]) => {
            eventMap[event] = cb;
        });

        const testListener = jest.fn();
        SocketClientService.onMatchSuspended(testListener);

        // Simulamos la llegada del evento por red
        eventMap['match_suspended']({ matchId: 'MATCH-X' });

        expect(testListener).toHaveBeenCalledWith({ matchId: 'MATCH-X' });
    });

    it('no debe emitir eventos si el socket se encuentra desconectado', () => {
        mockSocketInstance.connected = false;
        SocketClientService.connect('SABC-D123');

        SocketClientService.emitScoreUndo();

        expect(mockSocketInstance.emit).not.toHaveBeenCalledWith('score_undo', expect.any(Object));
    });

    it('debe estructurar correctamente la carga útil de un score_update', () => {
        mockSocketInstance.connected = true;
        SocketClientService.connect('SABC-D123');
        SocketClientService.setMatchId('MATCH-001');

        const throwData = { score: 60 };
        SocketClientService.emitScoreUpdate(throwData);

        expect(mockSocketInstance.emit).toHaveBeenCalledWith('score_update', {
            boardShortId: 'SABC-D123',
            matchId: 'MATCH-001',
            throwData: throwData
        });
    });
});
