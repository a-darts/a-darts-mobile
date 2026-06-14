import { renderHook, act } from '@testing-library/react-native';
import { useCompetitionModeConfig } from '../../../src/screens/CompetitionMode/hooks/useCompetitionModeConfig';
import SocketClientService from '../../../src/services/SocketClientService';

// Mocks estructurales mínimos
const mockNavigate = jest.fn();
const mockNavigation = { navigate: mockNavigate };

jest.mock('../../../src/utils/BoardContext', () => ({
    useBoard: () => ({
        boardShortId: 'SABC-D123',
        setBoardShortId: jest.fn(),
        isConnected: true,
        setIsConnected: jest.fn(),
        assignedMatchId: 'MATCH-888',
        setAssignedMatchId: jest.fn(),
        disconnectBoard: jest.fn(),
    })
}));

// Mockeamos las llamadas HTTP internas
const mockMatchData = {
    id: 'MATCH-888',
    tournamentId: 'TOUR-1',
    participant1: { alias: 'Gus' },
    participant2: { alias: 'Miki' }
};
const mockTourData = { game: '501', gameType: 'BEST_OF', numSets: 1, numLegs: 3 };

global.fetch = jest.fn().mockImplementation((url) => {
    if (url.includes('/api/matches/')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockMatchData) });
    if (url.includes('/api/tournaments/')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTourData) });
    return Promise.reject(new Error('Not Found'));
});

describe('useCompetitionModeConfig - Socket Lifecycle Hooks', () => {
    let socketListeners: Record<string, Function> = {};

    beforeEach(() => {
        jest.clearAllMocks();
        socketListeners = {};

        // Mock dinámico del objeto socket interno del servicio
        SocketClientService.socket = {
            on: jest.fn((event, cb) => { socketListeners[event] = cb; }),
            off: jest.fn((event) => { delete socketListeners[event]; }),
            connected: true
        } as any;
    });

    it('debe reaccionar a "match_restored", instanciar el dominio y navegar al juego', async () => {
        const { result } = renderHook(() => useCompetitionModeConfig(mockNavigation));

        // Provocamos la carga previa de HTTP simulando el flujo inicial
        await act(async () => {
            await result.current.fetchMatchAndTournamentData('MATCH-888');
            result.current.updateMatchDataStates(mockMatchData, mockTourData);
        });

        // Disparamos el evento de socket simulado
        await act(async () => {
            if (socketListeners['match_restored']) {
                await socketListeners['match_restored']({
                    matchId: 'MATCH-888',
                    historyThrows: [{ score: 60, dartsUsed: 3 }]
                });
            }
        });

        expect(mockNavigate).toHaveBeenCalledWith('GameX01Screen', expect.objectContaining({
            matchId: 'MATCH-888',
            isCompetitionMode: true,
            historyThrows: expect.any(Array)
        }));
    });

    it('debe limpiar los canales del socket al desmontar el hook para evitar memory leaks', () => {
        const { unmount } = renderHook(() => useCompetitionModeConfig(mockNavigation));

        unmount();

        expect(SocketClientService.socket?.off).toHaveBeenCalledWith('match_started_confirmed');
        expect(SocketClientService.socket?.off).toHaveBeenCalledWith('match_restored');
        expect(SocketClientService.socket?.off).toHaveBeenCalledWith('match_cancelled');
    });
});
