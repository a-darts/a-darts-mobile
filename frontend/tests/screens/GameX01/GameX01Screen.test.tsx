import React from 'react';
import { render, waitFor, screen } from '@testing-library/react-native';
import { GameX01Screen } from '../../../src/screens/GameX01/GameX01Screen';
import { GameStatus } from '../../../../backend/src/domain/enums/GameStatus';
import MatchX01ServiceFactory from '../../../../backend/src/infrastructure/factories/MatchX01ServiceFactory';

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

const mockMatch1Player = {
    id: 'TEST-MATCH-ID-1',
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
        jest.spyOn(mockRepo, 'getById').mockResolvedValue(mockMatch1Player as any);
    });

    it('should have correct buttons enabled/disabled on initial load (1 player, 501)', async () => {
        const { getByText, findByText, getByTestId } = render(
            <GameX01Screen navigation={mockNavigation} route={mockRoute} />
        );

        // 1. Verify match loading parameters
        const playerText = await findByText(/Jugador 1/i);
        expect(playerText).toBeTruthy();
        const setsText = await findByText('SETS');
        expect(setsText).toBeTruthy();
        const legsText = await findByText('LEGS');
        expect(legsText).toBeTruthy();

        const legsWonText = getByTestId('player1-legs-won');
        expect(legsWonText).toHaveTextContent('0');
        const setsWonText = getByTestId('player1-sets-won');
        expect(setsWonText).toHaveTextContent('0');

        // 2. Verify match enabled and disabled buttons
        const deshacerButton = getByText('DESHACER');
        expect(deshacerButton).toBeDisabled();

        const restoButton = getByText('RESTO');
        expect(restoButton).toBeDisabled();

        const buttonDARDO = getByText('DARDO');
        expect(buttonDARDO).toBeDisabled();

        // 3. Verify fast buttons
        const button26 = getByText('26');
        expect(button26).toBeEnabled();
        // const button41 = getByText('41');
        // expect(button41).toBeEnabled();
        const button45 = getByText('45');
        expect(button45).toBeEnabled();
        const button60 = getByText('60');
        expect(button60).toBeEnabled();
        // const button81 = getByText('81');
        // expect(button81).toBeEnabled();
        const button85 = getByText('85');
        expect(button85).toBeEnabled();
        const button100 = getByText('100');
        expect(button100).toBeEnabled();
        const button140 = getByText('140');
        expect(button140).toBeEnabled();
        // const button180 = getByText('180');
        // expect(button180).toBeEnabled();

        // 4. Verify Keyboard buttons
        const deleteButton = getByTestId('btn-delete');
        expect(deleteButton).toBeDisabled();

        const enterButton = getByTestId('btn-enter');
        expect(enterButton).toBeDisabled();
    });
});
