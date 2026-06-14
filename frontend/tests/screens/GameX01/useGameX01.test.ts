import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useGameX01 } from '../../../src/screens/GameX01/hooks/useGameX01';
import SocketClientService from '../../../src/services/SocketClientService';
import MatchX01ServiceFactory from '../../../../backend/src/infrastructure/factories/MatchX01ServiceFactory';

// Mocks de servicios compartidos
const mockNavigation = { addListener: jest.fn((_, cb) => { cb(); return jest.fn(); }), setParams: jest.fn(), navigate: jest.fn() };
const mockRoute = { params: { matchId: 'MATCH-X01', isCompetitionMode: true } };

const mockMatchInstance = {
    id: 'MATCH-X01',
    status: 'PLAYING',
    activePlayerIndex: 0,
    config: { game: 501, typeOfGame: 'BEST_OF', numLegs: 3, numSets: 1 },
    players: [
        { remainingScore: 441, numSetsWon: 0, numLegsWon: 0, stats: { average: 60, oneEighties: 0, hundredFortyPlus: 0, hundredPlus: 0 } },
        { remainingScore: 501, numSetsWon: 0, numLegsWon: 0, stats: { average: 0, oneEighties: 0, hundredFortyPlus: 0, hundredPlus: 0 } }
    ],
    history: [
        { activePlayerIndex: 0, players: [{ remainingScore: 501 }, { remainingScore: 501 }] },
        { activePlayerIndex: 1, players: [{ remainingScore: 441 }, { remainingScore: 501 }] }
    ],
    get activePlayer() {
        return this.players[this.activePlayerIndex];
    },
};

jest.mock('../../../src/services/SocketClientService', () => {
    const mockService = {
        isConnected: jest.fn(() => true),
        setMatchId: jest.fn(),
        emitScoreUpdate: jest.fn(),
        emitScoreUndo: jest.fn(),
        emitScoreEdit: jest.fn(),
    };
    return {
        __esModule: true,
        default: mockService,
        ...mockService,
    };
});

jest.mock('../../../src/screens/GameX01/hooks/useKeypad', () => ({
    useKeypad: () => ({
        canCheckoutWithDarts: jest.fn(() => true),
    })
}));

jest.mock('../../../src/utils/SettingsContext', () => ({
    useSettings: () => ({
        showAverage: true,
        setShowAverage: jest.fn(),
        askDartsOnCheckout: true,
        setAskDartsOnCheckout: jest.fn()
    })
}));

describe('useGameX01 - Output Socket Emissions', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Mock del repositorio local y caso de uso de dardos
        jest.spyOn(MatchX01ServiceFactory.getRepository(), 'getById').mockResolvedValue(mockMatchInstance as any);
        jest.spyOn(MatchX01ServiceFactory.getMatchX01Service(), 'addThrow').mockResolvedValue({
            ...mockMatchInstance,
            activePlayerIndex: 1,
            players: [
                { remainingScore: 441, numSetsWon: 0, numLegsWon: 0, stats: { average: 60, oneEighties: 0, hundredFortyPlus: 0, hundredPlus: 0 } },
                { remainingScore: 501, numSetsWon: 0, numLegsWon: 0, stats: { average: 0, oneEighties: 0, hundredFortyPlus: 0, hundredPlus: 0 } }
            ]
        } as any);
    });

    it('debe disparar emitScoreUpdate con el estado mutado completo al confirmar un tiro válido', async () => {
        const { result } = renderHook(() => useGameX01(mockNavigation, mockRoute));
        await waitFor(() => expect(result.current.match).not.toBeNull());

        act(() => {
            result.current.handleKeyPress('6');
            result.current.handleKeyPress('0');
        });

        await act(async () => {
            await result.current.handleEnter();
        });

        // Verificamos si notificó al ecosistema vía sockets
        expect(SocketClientService.emitScoreUpdate).toHaveBeenCalledWith(expect.objectContaining({
            score: 60,
            activePlayerIndex: 1,
            participant1: expect.objectContaining({ remainingScore: 441 })
        }));
    });

    it('debe recalcular la historia completa y emitir score_edit de forma masiva', async () => {
        jest.spyOn(MatchX01ServiceFactory.getMatchX01Service(), 'editThrow').mockResolvedValue(mockMatchInstance as any);

        const { result } = renderHook(() => useGameX01(mockNavigation, mockRoute));
        await waitFor(() => expect(result.current.match).not.toBeNull());

        // Forzar apertura del modo edición
        act(() => {
            result.current.handleEditThrowPress('PLAYER-1', 1, 60);
        });

        // Modificar el valor simulado
        act(() => {
            if (result.current.editingThrow) {
                result.current.setEditingThrow({ ...result.current.editingThrow, score: '100' });
            }
        });

        await act(async () => {
            await result.current.handleSaveEdit();
        });

        // Comprobamos la llamada masiva del backend
        expect(SocketClientService.emitScoreEdit).toHaveBeenCalledWith(expect.any(Array));
    });
});
