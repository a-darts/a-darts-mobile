import React from 'react';
import { render, waitFor, screen } from '@testing-library/react-native';
import { GameX01Screen } from '../../../src/screens/GameX01/GameX01Screen';
import { GameStatus } from '../../../../backend/src/domain/enums/GameStatus';
import MatchX01ServiceFactory from '../../../../backend/src/infrastructure/factories/MatchX01ServiceFactory';

// --- MOCKS ---
jest.mock('../../../src/services/SocketClientService', () => {
    return {
        onMatchSuspended: jest.fn(() => jest.fn()),
        onMatchResumed: jest.fn(() => jest.fn()),
        onMatchCancelled: jest.fn(() => jest.fn()),
        onMatchUnassigned: jest.fn(() => jest.fn()),
        isConnected: jest.fn(() => true),
        setMatchId: jest.fn(),
    };
});

jest.mock('../../../src/utils/SettingsContext', () => ({
    useSettings: () => ({
        showAverage: true,
        askDartsOnCheckout: true,
    }),
}));

jest.mock('react-native-safe-area-context', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
        SafeAreaProvider: ({ children }: any) => <View>{children}</View>,
        SafeAreaView: ({ children }: any) => <View>{children}</View>,
        useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    };
});

const mockNavigation = {
    addListener: jest.fn((event, cb) => {
        return jest.fn();
    }),
    setParams: jest.fn(),
    navigate: jest.fn(),
};

const mockRoute = {
    params: {
        matchId: 'TEST-MATCH-ID',
    },
};

const mockMatch = {
    id: 'TEST-MATCH-ID',
    status: GameStatus.PLAYING,
    activePlayerIndex: 0,
    config: {
        game: 501,
        typeOfGame: 'BEST_OF',
        numSets: 1,
        numLegs: 3,
        playerNames: ['Jugador 1'],
    },
    players: [
        {
            id: 'PLAYER-1',
            name: 'Jugador 1',
            remainingScore: 501,
            numSetsWon: 0,
            numLegsWon: 0,
            stats: { average: 0, oneEighties: 0, hundredFortyPlus: 0, hundredPlus: 0 },
            throws: [],
        },
    ],
    history: [],
    get activePlayer() {
        return this.players[this.activePlayerIndex];
    },
};

describe('GameX01Screen GUI Tests', () => {
    let mockRepo: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRepo = MatchX01ServiceFactory.getRepository();
        jest.spyOn(mockRepo, 'getById').mockResolvedValue(mockMatch as any);
    });

    it('should have correct buttons enabled/disabled on initial load (1 player, 501)', async () => {
        const { getByText, findByText, getByTestId } = render(
            <GameX01Screen navigation={mockNavigation} route={mockRoute} />
        );

        // Wait for the match to load by checking for the player's name
        const playerText = await findByText(/Jugador 1/i);
        expect(playerText).toBeTruthy();

        // 1. "DESHACER" should be disabled because history is empty
        const deshacerButton = getByText('DESHACER');
        expect(deshacerButton).toBeDisabled();

        // 2. "RESTO" should be disabled because input is empty
        const restoButton = getByText('RESTO');
        expect(restoButton).toBeDisabled();

        // 3. Fast Buttons should be enabled
        const button26 = getByText('26');
        expect(button26).not.toBeDisabled();

        const button60 = getByText('60');
        expect(button60).not.toBeDisabled();

        // 4. DARDO button should be disabled at 501
        const buttonDARDO = getByText('DARDO');
        expect(buttonDARDO).toBeDisabled();

        // 5. Delete and Enter keys should be disabled when input is empty
        const deleteButton = getByTestId('btn-delete');
        expect(deleteButton).toBeDisabled();

        const enterButton = getByTestId('btn-enter');
        expect(enterButton).toBeDisabled();
    });
});
