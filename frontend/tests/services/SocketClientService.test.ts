import SocketClientService from '../../src/services/SocketClientService';
import { io } from 'socket.io-client';

// ---------------------------------------------------------------------------
// Mock de socket.io-client
// ---------------------------------------------------------------------------

jest.mock('socket.io-client', () => {
    const mSocket = {
        on: jest.fn(),
        emit: jest.fn(),
        disconnect: jest.fn(),
        connected: true,
        id: 'mock-socket-123',
    };
    return { io: jest.fn(() => mSocket) };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extrae el mapa de callbacks registrados con socket.on() */
function buildEventMap(mockSocketInstance: any): Record<string, Function> {
    const eventMap: Record<string, Function> = {};
    mockSocketInstance.on.mock.calls.forEach(([event, cb]: [string, Function]) => {
        eventMap[event] = cb;
    });
    return eventMap;
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('SocketClientService', () => {
    let mockSocketInstance: any;

    beforeEach(() => {
        SocketClientService.disconnect();          // resetea estado interno (antes del clear)
        jest.clearAllMocks();                      // limpia todos los contadores (incluye la llamada anterior)
        mockSocketInstance = (io as jest.Mock)();  // referencia al mock
        (io as jest.Mock).mockClear();             // limpia la llamada de referencia
    });

    // -------------------------------------------------------------------------
    // connect()
    // -------------------------------------------------------------------------

    describe('connect()', () => {
        it('debería llamar a io() con la URL del servidor y opciones correctas', () => {
            SocketClientService.connect('BOARD-01');

            expect(io).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({ transports: ['websocket'], forceNew: true })
            );
        });

        it('debería registrar el listener del evento "connect"', () => {
            SocketClientService.connect('BOARD-01');

            expect(mockSocketInstance.on).toHaveBeenCalledWith('connect', expect.any(Function));
        });

        it('debería registrar listeners para los 5 eventos de negocio', () => {
            SocketClientService.connect('BOARD-01');

            const events = ['match_suspended', 'match_resumed', 'match_cancelled', 'match_unassigned', 'match_assigned'];
            events.forEach(event => {
                expect(mockSocketInstance.on).toHaveBeenCalledWith(event, expect.any(Function));
            });
        });

        it('debería registrar listeners para disconnect y connect_error', () => {
            SocketClientService.connect('BOARD-01');

            expect(mockSocketInstance.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
            expect(mockSocketInstance.on).toHaveBeenCalledWith('connect_error', expect.any(Function));
        });

        it('debería desconectar el socket anterior si ya había uno activo', () => {
            SocketClientService.connect('BOARD-01');
            (io as jest.Mock).mockClear();
            SocketClientService.connect('BOARD-02'); // segunda llamada

            expect(mockSocketInstance.disconnect).toHaveBeenCalledTimes(1);
        });

        it('debería emitir "join_board" con el shortId cuando el socket se conecta', () => {
            SocketClientService.connect('MY-BOARD');
            const eventMap = buildEventMap(mockSocketInstance);

            // Disparamos el callback de 'connect'
            eventMap['connect']();

            expect(mockSocketInstance.emit).toHaveBeenCalledWith('join_board', 'MY-BOARD');
        });
    });

    // -------------------------------------------------------------------------
    // disconnect()
    // -------------------------------------------------------------------------

    describe('disconnect()', () => {
        it('debería llamar a socket.disconnect() si hay un socket activo', () => {
            SocketClientService.connect('BOARD-X');
            SocketClientService.disconnect();

            expect(mockSocketInstance.disconnect).toHaveBeenCalledTimes(1);
        });

        it('debería poner socket a null tras desconectarse', () => {
            SocketClientService.connect('BOARD-X');
            SocketClientService.disconnect();

            expect(SocketClientService.socket).toBeNull();
        });

        it('no debería lanzar si se llama sin socket activo', () => {
            expect(() => SocketClientService.disconnect()).not.toThrow();
        });
    });

    // -------------------------------------------------------------------------
    // isConnected()
    // -------------------------------------------------------------------------

    describe('isConnected()', () => {
        it('debería devolver true si el socket está conectado', () => {
            mockSocketInstance.connected = true;
            SocketClientService.connect('BOARD-X');

            expect(SocketClientService.isConnected()).toBe(true);
        });

        it('debería devolver false si el socket está desconectado', () => {
            mockSocketInstance.connected = false;
            SocketClientService.connect('BOARD-X');

            expect(SocketClientService.isConnected()).toBe(false);
        });

        it('debería devolver false si no hay socket activo', () => {
            // Ya desconectado por el beforeEach
            expect(SocketClientService.isConnected()).toBe(false);
        });
    });

    // -------------------------------------------------------------------------
    // setMatchId()
    // -------------------------------------------------------------------------

    describe('setMatchId()', () => {
        it('debería establecer el matchId usado en los emits', () => {
            mockSocketInstance.connected = true;
            SocketClientService.connect('BOARD-01');
            SocketClientService.setMatchId('MATCH-99');

            SocketClientService.emitScoreUndo();

            expect(mockSocketInstance.emit).toHaveBeenCalledWith('score_undo', expect.objectContaining({
                matchId: 'MATCH-99',
            }));
        });
    });

    // -------------------------------------------------------------------------
    // emitScoreUpdate()
    // -------------------------------------------------------------------------

    describe('emitScoreUpdate()', () => {
        it('debería emitir "score_update" con boardShortId, matchId y throwData', () => {
            mockSocketInstance.connected = true;
            SocketClientService.connect('SABC-D123');
            SocketClientService.setMatchId('MATCH-001');

            SocketClientService.emitScoreUpdate({ score: 60 });

            expect(mockSocketInstance.emit).toHaveBeenCalledWith('score_update', {
                boardShortId: 'SABC-D123',
                matchId: 'MATCH-001',
                throwData: { score: 60 },
            });
        });

        it('no debería emitir nada si el socket no está conectado', () => {
            mockSocketInstance.connected = false;
            SocketClientService.connect('BOARD-01');

            SocketClientService.emitScoreUpdate({ score: 60 });

            expect(mockSocketInstance.emit).not.toHaveBeenCalledWith('score_update', expect.anything());
        });

        it('no debería emitir nada si no hay socket activo', () => {
            // sin connect()
            SocketClientService.emitScoreUpdate({ score: 60 });

            expect(mockSocketInstance.emit).not.toHaveBeenCalledWith('score_update', expect.anything());
        });
    });

    // -------------------------------------------------------------------------
    // emitScoreUndo()
    // -------------------------------------------------------------------------

    describe('emitScoreUndo()', () => {
        it('debería emitir "score_undo" cuando el socket está conectado', () => {
            mockSocketInstance.connected = true;
            SocketClientService.connect('BOARD-01');
            SocketClientService.setMatchId('MATCH-A');

            SocketClientService.emitScoreUndo();

            expect(mockSocketInstance.emit).toHaveBeenCalledWith('score_undo', {
                boardShortId: 'BOARD-01',
                matchId: 'MATCH-A',
            });
        });

        it('no debería emitir si el socket no está conectado', () => {
            mockSocketInstance.connected = false;
            SocketClientService.connect('BOARD-01');

            SocketClientService.emitScoreUndo();

            expect(mockSocketInstance.emit).not.toHaveBeenCalledWith('score_undo', expect.anything());
        });
    });

    // -------------------------------------------------------------------------
    // emitScoreEdit()
    // -------------------------------------------------------------------------

    describe('emitScoreEdit()', () => {
        it('debería emitir "score_edit" con el historial de tiradas', () => {
            SocketClientService.connect('BOARD-01');
            SocketClientService.setMatchId('MATCH-B');

            const history = [{ score: 60 }, { score: 45 }];
            SocketClientService.emitScoreEdit(history);

            expect(mockSocketInstance.emit).toHaveBeenCalledWith('score_edit', {
                boardShortId: 'BOARD-01',
                matchId: 'MATCH-B',
                historyThrows: history,
            });
        });

        it('no debería emitir si el socket es null', () => {
            // Sin connect()
            SocketClientService.emitScoreEdit([{ score: 60 }]);

            expect(mockSocketInstance.emit).not.toHaveBeenCalledWith('score_edit', expect.anything());
        });
    });

    // -------------------------------------------------------------------------
    // emitSwapStartingPlayer()
    // -------------------------------------------------------------------------

    describe('emitSwapStartingPlayer()', () => {
        it('debería emitir "swap_starting_player" cuando el socket está conectado', () => {
            mockSocketInstance.connected = true;
            SocketClientService.connect('BOARD-01');
            SocketClientService.setMatchId('MATCH-C');

            SocketClientService.emitSwapStartingPlayer();

            expect(mockSocketInstance.emit).toHaveBeenCalledWith('swap_starting_player', {
                boardShortId: 'BOARD-01',
                matchId: 'MATCH-C',
            });
        });

        it('no debería emitir si el socket no está conectado', () => {
            mockSocketInstance.connected = false;
            SocketClientService.connect('BOARD-01');

            SocketClientService.emitSwapStartingPlayer();

            expect(mockSocketInstance.emit).not.toHaveBeenCalledWith('swap_starting_player', expect.anything());
        });
    });

    // -------------------------------------------------------------------------
    // onMatchSuspended / onMatchResumed / onMatchCancelled / onMatchUnassigned / onMatchAssigned
    // -------------------------------------------------------------------------

    const businessEvents: Array<{
        socketEvent: string;
        registerMethod: keyof typeof SocketClientService;
    }> = [
            { socketEvent: 'match_suspended', registerMethod: 'onMatchSuspended' },
            { socketEvent: 'match_resumed', registerMethod: 'onMatchResumed' },
            { socketEvent: 'match_cancelled', registerMethod: 'onMatchCancelled' },
            { socketEvent: 'match_unassigned', registerMethod: 'onMatchUnassigned' },
            { socketEvent: 'match_assigned', registerMethod: 'onMatchAssigned' },
        ];

    describe.each(businessEvents)('$registerMethod()', ({ socketEvent, registerMethod }) => {
        it(`debería notificar al listener cuando llega el evento "${socketEvent}"`, () => {
            SocketClientService.connect('BOARD-01');
            const eventMap = buildEventMap(mockSocketInstance);

            const listener = jest.fn();
            (SocketClientService[registerMethod] as Function)(listener);

            eventMap[socketEvent]({ matchId: 'TEST-MATCH' });

            expect(listener).toHaveBeenCalledWith({ matchId: 'TEST-MATCH' });
        });

        it(`debería devolver una función de unsuscripción que elimina el listener`, () => {
            SocketClientService.connect('BOARD-01');
            const eventMap = buildEventMap(mockSocketInstance);

            const listener = jest.fn();
            const unsubscribe = (SocketClientService[registerMethod] as Function)(listener);

            // Desregistramos
            unsubscribe();

            // El evento llega pero ya no debería notificar
            eventMap[socketEvent]({ matchId: 'AFTER-UNSUB' });

            expect(listener).not.toHaveBeenCalled();
        });

        it(`debería soportar múltiples listeners para "${socketEvent}"`, () => {
            SocketClientService.connect('BOARD-01');
            const eventMap = buildEventMap(mockSocketInstance);

            const listener1 = jest.fn();
            const listener2 = jest.fn();
            (SocketClientService[registerMethod] as Function)(listener1);
            (SocketClientService[registerMethod] as Function)(listener2);

            eventMap[socketEvent]({ matchId: 'MULTI' });

            expect(listener1).toHaveBeenCalledTimes(1);
            expect(listener2).toHaveBeenCalledTimes(1);
        });
    });

    // -------------------------------------------------------------------------
    // disconnect() limpia listeners
    // -------------------------------------------------------------------------

    describe('disconnect() limpia todos los listeners', () => {
        it('los listeners registrados no deberían llamarse tras desconectar y reconectar', () => {
            SocketClientService.connect('BOARD-01');
            const listener = jest.fn();
            SocketClientService.onMatchSuspended(listener);

            // Desconectamos (limpia listeners internos)
            SocketClientService.disconnect();

            // Reconectamos y disparamos el evento
            SocketClientService.connect('BOARD-01');
            const newEventMap = buildEventMap(mockSocketInstance);
            newEventMap['match_suspended']({ matchId: 'AFTER-DISCONNECT' });

            expect(listener).not.toHaveBeenCalled();
        });
    });

    // -------------------------------------------------------------------------
    // Callbacks de socket nativos (connect, disconnect, connect_error)
    // -------------------------------------------------------------------------

    describe('Callbacks nativos del socket', () => {
        it('el callback "disconnect" debería ejecutarse sin errores', () => {
            SocketClientService.connect('BOARD-01');
            const eventMap = buildEventMap(mockSocketInstance);

            expect(() => eventMap['disconnect']()).not.toThrow();
        });

        it('el callback "connect_error" debería ejecutarse sin errores con un error cualquiera', () => {
            SocketClientService.connect('BOARD-01');
            const eventMap = buildEventMap(mockSocketInstance);

            expect(() => eventMap['connect_error'](new Error('timeout'))).not.toThrow();
        });
    });
});
