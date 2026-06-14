import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useGameX01 } from '../../../src/screens/GameX01/hooks/useGameX01';
import SocketClientService from '../../../src/services/SocketClientService';
import MatchX01ServiceFactory from '../../../../backend/src/infrastructure/factories/MatchX01ServiceFactory';
import { BustException } from '../../../../backend/src/domain/exceptions/Exceptions';
import { GameStatus } from '../../../../backend/src/domain/enums/GameStatus';

// ---------------------------------------------------------------------------
// Configuración mutable de mocks (usada por los fakes de módulos)
// ---------------------------------------------------------------------------

let mockIsConnected = true;
let mockAskDartsOnCheckout = true;
let mockCanCheckout = true;

jest.mock('../../../src/services/SocketClientService', () => {
    const mockService = {
        isConnected: jest.fn(() => mockIsConnected),
        setMatchId: jest.fn(),
        emitScoreUpdate: jest.fn(),
        emitScoreUndo: jest.fn(),
        emitScoreEdit: jest.fn(),
        emitSwapStartingPlayer: jest.fn(),
    };
    return { __esModule: true, default: mockService, ...mockService };
});

jest.mock('../../../src/screens/GameX01/hooks/useKeypad', () => ({
    useKeypad: () => ({ canCheckoutWithDarts: jest.fn(() => mockCanCheckout) }),
}));

jest.mock('../../../src/utils/SettingsContext', () => ({
    useSettings: () => ({
        showAverage: true,
        setShowAverage: jest.fn(),
        askDartsOnCheckout: mockAskDartsOnCheckout,
        setAskDartsOnCheckout: jest.fn(),
    }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockNavigation = {
    addListener: jest.fn((_, cb) => { cb(); return jest.fn(); }),
    setParams: jest.fn(),
    navigate: jest.fn(),
};
const mockRoute = { params: { matchId: 'MATCH-X01', isCompetitionMode: true } };

const makeMockMatch = (overrides: Partial<any> = {}) => ({
    id: 'MATCH-X01',
    status: GameStatus.PLAYING,
    activePlayerIndex: 0,
    config: { game: 501, typeOfGame: 'BEST_OF', numLegs: 3, numSets: 1 },
    players: [
        { remainingScore: 441, numSetsWon: 0, numLegsWon: 0, stats: { average: 60, oneEighties: 0, hundredFortyPlus: 0, hundredPlus: 0 } },
        { remainingScore: 501, numSetsWon: 0, numLegsWon: 0, stats: { average: 0, oneEighties: 0, hundredFortyPlus: 0, hundredPlus: 0 } },
    ],
    history: [
        { activePlayerIndex: 0, players: [{ remainingScore: 501 }, { remainingScore: 501 }] },
        { activePlayerIndex: 1, players: [{ remainingScore: 441 }, { remainingScore: 501 }] },
    ],
    get activePlayer(): any { return this.players[this.activePlayerIndex]; },
    ...overrides,
});

// ---------------------------------------------------------------------------
// Suites
// ---------------------------------------------------------------------------

describe('useGameX01 - Cobertura de ramas', () => {
    let mockRepo: ReturnType<typeof MatchX01ServiceFactory.getRepository>;
    let mockService: ReturnType<typeof MatchX01ServiceFactory.getMatchX01Service>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockIsConnected = true;
        mockAskDartsOnCheckout = true;
        mockCanCheckout = true;

        mockRepo = MatchX01ServiceFactory.getRepository();
        mockService = MatchX01ServiceFactory.getMatchX01Service();

        jest.spyOn(mockRepo, 'getById').mockResolvedValue(makeMockMatch() as any);
    });

    const renderAndLoad = async () => {
        const hook = renderHook(() => useGameX01(mockNavigation, mockRoute));
        await waitFor(() => expect(hook.result.current.match).not.toBeNull());
        return hook;
    };

    // -----------------------------------------------------------------------
    // submitScore – BustException
    // -----------------------------------------------------------------------

    describe('submitScore() – manejo de errores', () => {
        it('debería mostrar toast EXCESO cuando submitScore lanza BustException', async () => {
            jest.spyOn(mockService, 'addThrow').mockRejectedValueOnce(
                new BustException('Demasiado')
            );

            const { result } = await renderAndLoad();

            act(() => { result.current.handleKeyPress('6'); result.current.handleKeyPress('0'); });
            await act(async () => { await result.current.handleEnter(); });

            expect(result.current.toast.title).toBe('EXCESO');
            expect(result.current.toast.visible).toBe(true);
        });

        it('debería mostrar toast ERROR genérico cuando submitScore lanza otro error', async () => {
            jest.spyOn(mockService, 'addThrow').mockRejectedValueOnce(
                new Error('Error interno')
            );

            const { result } = await renderAndLoad();

            act(() => { result.current.handleKeyPress('6'); result.current.handleKeyPress('0'); });
            await act(async () => { await result.current.handleEnter(); });

            expect(result.current.toast.title).toBe('ERROR');
            expect(result.current.toast.visible).toBe(true);
        });

        it('debería mostrar toast de Victoria cuando la partida termina tras un tiro', async () => {
            const finishedMatch = makeMockMatch({ status: GameStatus.FINISHED });
            jest.spyOn(mockService, 'addThrow').mockResolvedValueOnce(finishedMatch as any);

            const { result } = await renderAndLoad();

            act(() => { result.current.handleKeyPress('6'); result.current.handleKeyPress('0'); });
            await act(async () => { await result.current.handleEnter(); });

            expect(result.current.toast.title).toBe('¡Victoria!');
            expect(result.current.toast.type).toBe('success');
        });
    });

    // -----------------------------------------------------------------------
    // handleEnter – ramas de guarda
    // -----------------------------------------------------------------------

    describe('handleEnter() – guardas', () => {
        it('no debería hacer nada si inputValue está vacío', async () => {
            const { result } = await renderAndLoad();
            const addThrowSpy = jest.spyOn(mockService, 'addThrow');

            await act(async () => { await result.current.handleEnter(); });

            expect(addThrowSpy).not.toHaveBeenCalled();
        });

        it('debería mostrar toast de error si la partida ya está finalizada', async () => {
            jest.spyOn(mockRepo, 'getById').mockResolvedValue(
                makeMockMatch({ status: GameStatus.FINISHED }) as any
            );
            const { result } = renderHook(() => useGameX01(mockNavigation, mockRoute));
            await waitFor(() => expect(result.current.match).not.toBeNull());

            act(() => { result.current.handleKeyPress('6'); result.current.handleKeyPress('0'); });
            await act(async () => { await result.current.handleEnter(); });

            expect(result.current.toast.title).toBe('ERROR');
            expect(result.current.toast.description).toBe('La partida ya ha finalizado');
        });

        it('debería llamar a submitScore con 3 dardos si askDartsOnCheckout=false y cierra el leg', async () => {
            mockAskDartsOnCheckout = false;
            const checkoutMatch = makeMockMatch({
                players: [
                    { remainingScore: 60, numSetsWon: 0, numLegsWon: 0, stats: { average: 0, oneEighties: 0, hundredFortyPlus: 0, hundredPlus: 0 } },
                    { remainingScore: 501, numSetsWon: 0, numLegsWon: 0, stats: { average: 0, oneEighties: 0, hundredFortyPlus: 0, hundredPlus: 0 } },
                ],
            });
            jest.spyOn(mockRepo, 'getById').mockResolvedValue(checkoutMatch as any);
            const addThrowSpy = jest.spyOn(mockService, 'addThrow').mockResolvedValue(checkoutMatch as any);

            const { result } = renderHook(() => useGameX01(mockNavigation, mockRoute));
            await waitFor(() => expect(result.current.match).not.toBeNull());

            act(() => { result.current.handleKeyPress('6'); result.current.handleKeyPress('0'); });
            await act(async () => { await result.current.handleEnter(); });

            expect(addThrowSpy).toHaveBeenCalledWith('MATCH-X01', 60, 3);
        });
    });

    // -----------------------------------------------------------------------
    // handleUndo
    // -----------------------------------------------------------------------

    describe('handleUndo()', () => {
        it('debería deshacer y emitir socket cuando isConnected=true', async () => {
            const updatedMatch = makeMockMatch();
            jest.spyOn(mockService, 'undoLastThrow').mockResolvedValueOnce(updatedMatch as any);

            const { result } = await renderAndLoad();
            await act(async () => { await result.current.handleUndo(); });

            expect(mockService.undoLastThrow).toHaveBeenCalled();
            expect(SocketClientService.emitScoreUndo).toHaveBeenCalled();
        });

        it('debería no emitir socket cuando isConnected=false', async () => {
            mockIsConnected = false;
            jest.spyOn(mockService, 'undoLastThrow').mockResolvedValueOnce(makeMockMatch() as any);

            const { result } = await renderAndLoad();
            await act(async () => { await result.current.handleUndo(); });

            expect(SocketClientService.emitScoreUndo).not.toHaveBeenCalled();
        });

        it('debería mostrar toast de error si undoLastThrow lanza excepción', async () => {
            jest.spyOn(mockService, 'undoLastThrow').mockRejectedValueOnce(
                new Error('No hay tirada para deshacer')
            );

            const { result } = await renderAndLoad();
            await act(async () => { await result.current.handleUndo(); });

            expect(result.current.toast.title).toBe('Error');
            expect(result.current.toast.visible).toBe(true);
        });
    });

    // -----------------------------------------------------------------------
    // handleEnterRemaining
    // -----------------------------------------------------------------------

    describe('handleEnterRemaining()', () => {
        it('no debería hacer nada si match es null', async () => {
            jest.spyOn(mockRepo, 'getById').mockResolvedValue(null);
            const { result } = renderHook(() => useGameX01(mockNavigation, mockRoute));
            await waitFor(() => { }); // espera render

            const addThrowSpy = jest.spyOn(mockService, 'addThrow');
            await act(async () => { await result.current.handleEnterRemaining(); });

            expect(addThrowSpy).not.toHaveBeenCalled();
        });

        it('no debería hacer nada si inputValue está vacío', async () => {
            const { result } = await renderAndLoad();
            const addThrowSpy = jest.spyOn(mockService, 'addThrow');

            await act(async () => { await result.current.handleEnterRemaining(); });
            expect(addThrowSpy).not.toHaveBeenCalled();
        });

        it('debería calcular el score como remainingScore - remaining y llamar submitScore', async () => {
            // active player has remainingScore 441, so score = 441 - 381 = 60
            const addThrowSpy = jest.spyOn(mockService, 'addThrow').mockResolvedValue(makeMockMatch() as any);

            const { result } = await renderAndLoad();

            act(() => { result.current.handleKeyPress('3'); result.current.handleKeyPress('8'); result.current.handleKeyPress('1'); });
            await act(async () => { await result.current.handleEnterRemaining(); });

            expect(addThrowSpy).toHaveBeenCalledWith('MATCH-X01', 60, 3);
        });

        it('debería mostrar toast de error si la partida ya terminó', async () => {
            jest.spyOn(mockRepo, 'getById').mockResolvedValue(
                makeMockMatch({ status: GameStatus.FINISHED }) as any
            );
            const { result } = renderHook(() => useGameX01(mockNavigation, mockRoute));
            await waitFor(() => expect(result.current.match).not.toBeNull());

            act(() => { result.current.handleKeyPress('6'); result.current.handleKeyPress('0'); });
            await act(async () => { await result.current.handleEnterRemaining(); });

            expect(result.current.toast.title).toBe('ERROR');
        });
    });

    // -----------------------------------------------------------------------
    // handleGameShot
    // -----------------------------------------------------------------------

    describe('handleGameShot()', () => {
        it('debería abrir el toast de dardos si askDartsOnCheckout=true', async () => {
            const { result } = await renderAndLoad();
            await act(async () => { await result.current.handleGameShot(); });

            expect(result.current.toast.title).toBe('¿Con cuántos dardos has cerrado?');
            expect(result.current.toast.visible).toBe(true);
        });

        it('debería llamar submitScore con remainingScore del jugador activo si askDartsOnCheckout=false', async () => {
            mockAskDartsOnCheckout = false;
            const addThrowSpy = jest.spyOn(mockService, 'addThrow').mockResolvedValue(makeMockMatch() as any);

            const { result } = await renderAndLoad();
            await act(async () => { await result.current.handleGameShot(); });

            // active player remainingScore = 441
            expect(addThrowSpy).toHaveBeenCalledWith('MATCH-X01', 441, 3);
        });
    });

    // -----------------------------------------------------------------------
    // handleCheckout
    // -----------------------------------------------------------------------

    describe('handleCheckout()', () => {
        it('debería llamar submitScore con score y numDarts cuando la partida sigue activa', async () => {
            const addThrowSpy = jest.spyOn(mockService, 'addThrow').mockResolvedValue(makeMockMatch() as any);

            const { result } = await renderAndLoad();
            await act(async () => { await result.current.handleCheckout(60, 2); });

            expect(addThrowSpy).toHaveBeenCalledWith('MATCH-X01', 60, 2);
        });

        it('debería mostrar toast de error si la partida ya terminó', async () => {
            jest.spyOn(mockRepo, 'getById').mockResolvedValue(
                makeMockMatch({ status: GameStatus.FINISHED }) as any
            );
            const { result } = renderHook(() => useGameX01(mockNavigation, mockRoute));
            await waitFor(() => expect(result.current.match).not.toBeNull());

            await act(async () => { await result.current.handleCheckout(60, 2); });

            expect(result.current.toast.title).toBe('ERROR');
            expect(result.current.toast.description).toBe('La partida ya ha finalizado');
        });
    });

    // -----------------------------------------------------------------------
    // handleSwapStartingPlayer
    // -----------------------------------------------------------------------

    describe('handleSwapStartingPlayer()', () => {
        it('debería llamar swapStartingPlayer y emitir socket si conectado', async () => {
            const updatedMatch = makeMockMatch({ activePlayerIndex: 1 });
            jest.spyOn(mockService, 'swapStartingPlayer').mockResolvedValueOnce(updatedMatch as any);

            const { result } = await renderAndLoad();
            await act(async () => { await result.current.handleSwapStartingPlayer(); });

            expect(mockService.swapStartingPlayer).toHaveBeenCalled();
            expect(SocketClientService.emitSwapStartingPlayer).toHaveBeenCalled();
        });

        it('no debería emitir socket si no está conectado', async () => {
            mockIsConnected = false;
            jest.spyOn(mockService, 'swapStartingPlayer').mockResolvedValueOnce(makeMockMatch() as any);

            const { result } = await renderAndLoad();
            await act(async () => { await result.current.handleSwapStartingPlayer(); });

            expect(SocketClientService.emitSwapStartingPlayer).not.toHaveBeenCalled();
        });

        it('debería mostrar toast de error si swapStartingPlayer falla', async () => {
            jest.spyOn(mockService, 'swapStartingPlayer').mockRejectedValueOnce(
                new Error('No se puede cambiar')
            );

            const { result } = await renderAndLoad();
            await act(async () => { await result.current.handleSwapStartingPlayer(); });

            expect(result.current.toast.title).toBe('Error');
        });
    });

    // -----------------------------------------------------------------------
    // handleSaveEdit – ramas adicionales
    // -----------------------------------------------------------------------

    describe('handleSaveEdit() – ramas adicionales', () => {
        it('debería mostrar toast de Victoria cuando editar termina la partida', async () => {
            const finishedMatch = makeMockMatch({ status: GameStatus.FINISHED });
            jest.spyOn(mockService, 'editThrow').mockResolvedValueOnce(finishedMatch as any);

            const { result } = await renderAndLoad();

            act(() => { result.current.handleEditThrowPress('PLAYER-1', 1, 60); });
            act(() => {
                if (result.current.editingThrow) {
                    result.current.setEditingThrow({ ...result.current.editingThrow, score: '100' });
                }
            });
            await act(async () => { await result.current.handleSaveEdit(); });

            expect(result.current.toast.title).toBe('¡Victoria!');
        });

        it('debería mostrar toast de error si editThrow lanza excepción', async () => {
            jest.spyOn(mockService, 'editThrow').mockRejectedValueOnce(
                new Error('Edición inválida')
            );

            const { result } = await renderAndLoad();

            act(() => { result.current.handleEditThrowPress('PLAYER-1', 1, 60); });
            await act(async () => { await result.current.handleSaveEdit(); });

            expect(result.current.toast.title).toBe('Error');
        });
    });

    // -----------------------------------------------------------------------
    // handleEditThrowPress – índice 0 (no-op)
    // -----------------------------------------------------------------------

    describe('handleEditThrowPress()', () => {
        it('no debería abrir el toast si el índice es 0 (estado inicial)', async () => {
            const { result } = await renderAndLoad();

            act(() => { result.current.handleEditThrowPress('PLAYER-1', 0, 0); });

            // editingThrow debe seguir siendo null
            expect(result.current.editingThrow).toBeNull();
            expect(result.current.toast.visible).toBe(false);
        });
    });

    // -----------------------------------------------------------------------
    // submitScore con socket desconectado (no emite)
    // -----------------------------------------------------------------------

    describe('submitScore() con socket desconectado', () => {
        it('no debería emitir emitScoreUpdate si el socket no está conectado', async () => {
            mockIsConnected = false;
            jest.spyOn(mockService, 'addThrow').mockResolvedValueOnce(makeMockMatch() as any);

            const { result } = await renderAndLoad();

            act(() => { result.current.handleKeyPress('6'); result.current.handleKeyPress('0'); });
            await act(async () => { await result.current.handleEnter(); });

            expect(SocketClientService.emitScoreUpdate).not.toHaveBeenCalled();
        });
    });
});
