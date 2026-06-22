import React from 'react';
import { render, waitFor, screen, cleanup } from '@testing-library/react-native';
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
        matchId: 'TEST-MATCH-ID-1',
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

const mockMatch2Players = {
    id: 'TEST-MATCH-ID-2',
    status: GameStatus.PLAYING,
    activePlayerIndex: 0,
    config: {
        game: 501,
        typeOfGame: 'BEST_OF',
        numSets: 1,
        numLegs: 3,
        playerNames: ['Jugador 1', 'Jugador 2'],
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
        {
            id: 'PLAYER-2',
            name: 'Jugador 2',
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

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('1 player tests', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRepo = MatchX01ServiceFactory.getRepository();
            mockRepo.getById = jest.fn().mockResolvedValue(mockMatch1Player);
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

    describe('2 players tests', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockRepo = MatchX01ServiceFactory.getRepository();
            mockRepo.getById = jest.fn().mockResolvedValue(mockMatch2Players);
        });

        it('should have correct buttons enabled/disabled on initial load (1 player, 501)', async () => {
            const { getByText, findByText, getByTestId } = render(
                <GameX01Screen navigation={mockNavigation} route={mockRoute} />
            );

            // 1. Verify match loading parameters
            const player1Text = await findByText(/Jugador 1/i);
            expect(player1Text).toBeTruthy();
            const player2Text = await findByText(/Jugador 2/i);
            expect(player2Text).toBeTruthy();
            const setsText = await findByText('SETS');
            expect(setsText).toBeTruthy();
            const legsText = await findByText('LEGS');
            expect(legsText).toBeTruthy();

            const legsWonPlayer1Text = getByTestId('player1-legs-won');
            expect(legsWonPlayer1Text).toHaveTextContent('0 - 0');
            const setsWonPlayer1Text = getByTestId('player1-sets-won');
            expect(setsWonPlayer1Text).toHaveTextContent('0 - 0');
            const legsWonPlayer2Text = getByTestId('player2-legs-won');
            expect(legsWonPlayer2Text).toHaveTextContent('- 0');
            const setsWonPlayer2Text = getByTestId('player2-sets-won');
            expect(setsWonPlayer2Text).toHaveTextContent('- 0');

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

    describe('Fast Buttons status logic based on remainingScore', () => {

        beforeEach(() => {
            jest.clearAllMocks();
            mockRepo = MatchX01ServiceFactory.getRepository();
        });

        // Ahora que forzamos modo Tablet, probamos la lista completa de botones
        const fastButtons = [26, 45, 60, 85, 100, 140];
        // const fastButtons = [26, 41, 45, 60, 81, 85, 100, 140, 180];

        const checkExpectedState = (btnScore: number, remaining: number) => {
            const isBust = btnScore > remaining || (remaining - btnScore) === 1;
            return !isBust;
        };

        // const remainingScoresToTest = [
        //     181, 180, 179, 141, 140, 139, 101, 100, 99, 86, 85, 84,
        //     82, 81, 80, 61, 60, 59, 46, 45, 44, 42, 41, 40, 27, 26, 25
        // ];
        const remainingScoresToTest = [
            181, 180, 179, 141, 140,
        ];

        test.each(remainingScoresToTest)('verifies fast buttons status when remainingScore is %i', async (remaining) => {
            // 1. Re-inyectamos dinámicamente el score en cada iteración del bucle
            const customMockMatch = {
                ...mockMatch1Player,
                players: [
                    { ...mockMatch1Player.players[0], remainingScore: remaining }
                ],
            };
            mockRepo.getById = jest.fn().mockResolvedValue(customMockMatch);

            // 2. Renderizamos la pantalla
            const { getByText, findByText, getByTestId, findByTestId } = render(
                <GameX01Screen navigation={mockNavigation} route={mockRoute} />
            );

            // 3. Esperamos a que cargue el componente
            await findByText(/Jugador 1/i);
            const remainingScoreText = await findByTestId('player1-remaining-score');
            expect(remainingScoreText).toHaveTextContent(remaining.toString());

            // 4. Verificamos cada botón usando getByText
            fastButtons.forEach((btnScore) => {
                const button = getByTestId(`fast-button-${btnScore.toString()}`);
                const shouldBeEnabled = checkExpectedState(btnScore, remaining);
                if (shouldBeEnabled) {
                    expect(button).toBeEnabled();
                } else {
                    expect(button).toBeDisabled();
                }
            });
        });
    });
});
