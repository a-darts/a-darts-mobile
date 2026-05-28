import { useState, useEffect, useRef } from 'react';
import { ScrollView } from 'react-native';
import { MatchX01 } from '../../../../../backend/src/domain/models/MatchX01';
import { TYPE_OPTIONS } from '../constants/GameX01.constants';
import MatchX01ServiceFactory from '../../../../../backend/src/infrastructure/factories/MatchX01ServiceFactory';
import { BustException } from '../../../../../backend/src/domain/exceptions/Exceptions';
import { GameStatus } from '../../../../../backend/src/domain/enums/GameStatus';
import { useKeypad } from './useKeypad';
import { useSettings } from '../../../utils/SettingsContext';
import SocketClientService from '../../../services/SocketClientService';

// Obtenemos los servicios y el repo desde la Factoría (fuera del hook)
const matchRepo = MatchX01ServiceFactory.getRepository();
const matchX01Service = MatchX01ServiceFactory.getMatchX01Service();

type ToastState = {
    visible: boolean;
    title: string;
    description?: string;
    type: 'error' | 'success';
    mode: 'auto' | 'manual';
    onCloseAction?: () => void;
    showCloseButton?: boolean;
};

export const useGameX01 = (navigation: any, route: any) => {
    const { matchId, isCompetitionMode = false } = route.params;

    const {
        canCheckoutWithDarts,
    } = useKeypad();

    const { askDartsOnCheckout } = useSettings();

    const [match, setMatch] = useState<MatchX01 | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [editingThrow, setEditingThrow] = useState<{ playerId: string, index: number, score: string } | null>(null);
    const [toast, setToast] = useState<ToastState>({
        visible: false,
        title: '',
        description: '',
        type: 'error',
        mode: 'auto',
        showCloseButton: true,
    });
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        const loadMatch = async () => {
            if (!matchId) return;
            const result = await matchRepo.getById(matchId);
            if (result) {
                setMatch(result);
                SocketClientService.setMatchId(matchId);
            }
        };

        const unsubscribe = navigation.addListener('focus', () => {
            loadMatch();
        });

        loadMatch();

        return unsubscribe;
    }, [navigation, matchId]);

    const handleKeyPress = (char: string) => {
        setInputValue(prev => {
            if (prev.length >= 3) return prev;
            return prev + char;
        });
    };

    useEffect(() => {
        if (!match) return;

        navigation.setParams({
            game: match.config?.game,
            typeOfGame: getGameTypeLabel(match.config?.typeOfGame),
            numLegs: match.config?.numLegs,
        });
    }, [match]);

    const getGameTypeLabel = (type?: string) => {
        return TYPE_OPTIONS.find(t => t.value === type)?.label ?? '';
    };

    const handleBackspace = () => setInputValue(prev => prev.slice(0, -1));

    const submitScore = async (scoreNum: number, dartsUsed: number = 3) => {
        if (!match) return;

        try {
            const updatedMatch = await matchX01Service.addThrow(match.id, scoreNum, dartsUsed);

            // Actualizamos el estado con la nueva instancia (esto dispara el re-render)
            setMatch(updatedMatch);
            setInputValue('');

            if (SocketClientService.isConnected()) {
                SocketClientService.emitScoreUpdate({
                    score: scoreNum,
                    participant1: {
                        remainingScore: updatedMatch.players[0].remainingScore,
                        stats: {
                            average: updatedMatch.players[0].stats.average,
                            oneEighties: updatedMatch.players[0].stats.oneEighties,
                            hundredFortyPlus: updatedMatch.players[0].stats.hundredFortyPlus,
                            hundredPlus: updatedMatch.players[0].stats.hundredPlus,
                        },
                        setsWon: updatedMatch.players[0].numSetsWon,
                        legsWon: updatedMatch.players[0].numLegsWon,
                    },
                    participant2: {
                        remainingScore: updatedMatch.players[1].remainingScore,
                        stats: {
                            average: updatedMatch.players[1].stats.average,
                            oneEighties: updatedMatch.players[1].stats.oneEighties,
                            hundredFortyPlus: updatedMatch.players[1].stats.hundredFortyPlus,
                            hundredPlus: updatedMatch.players[1].stats.hundredPlus,
                        },
                        setsWon: updatedMatch.players[1].numSetsWon,
                        legsWon: updatedMatch.players[1].numLegsWon,
                    },
                    activePlayerIndex: updatedMatch.activePlayerIndex,
                    throwerPlayerIndex: updatedMatch.activePlayerIndex === 0 ? 1 : 0,
                    status: updatedMatch.status,
                });
            }

            if (updatedMatch.status === GameStatus.FINISHED) {
                openToast({
                    title: '¡Victoria!',
                    description: 'Partida finalizada',
                    type: 'success',
                    mode: 'auto',
                    onCloseAction: () => navigation.navigate(
                        'MatchX01SummaryScreen', {
                            matchId: match.id,
                            isCompetitionMode: isCompetitionMode,
                        },
                    ),
                });
            }
        } catch (error: any) {
            if (error instanceof BustException) {
                openToast({
                    title: 'EXCESO',
                    description: error.message,
                    type: 'error',
                    mode: 'auto',
                });
            } else {
                openToast({
                    title: 'ERROR',
                    description: error.message,
                    type: 'error',
                    mode: 'auto',
                });
            }

            setInputValue('');
        }
    };

    const handleUndo = async () => {
        if (!match) return;
        try {
            setInputValue('');
            const updatedMatch = await matchX01Service.undoLastThrow(match.id);
            setMatch(updatedMatch);

            if (SocketClientService.isConnected()) {
                SocketClientService.emitScoreUndo();
            }
        } catch (error: any) {
            openToast({
                title: 'Error',
                description: error.message,
                type: 'error',
                mode: 'auto',
            });
        }
    };

    const handleEnter = async () => {
        if (inputValue === '') return;
        const score = parseInt(inputValue, 10);
        if (isNaN(score)) return;

        if (isMatchFinished()) {
            openToast({
                title: 'ERROR',
                description: 'La partida ya ha finalizado',
                type: 'error',
                mode: 'auto',
            });
            return;
        }
        if (isLegFinished(score) && canCheckoutWithDarts(score, 3)) {
            if (askDartsOnCheckout) {
                openToast({
                    title: '¿Con cuántos dardos has cerrado?',
                    description: '',
                    type: 'success',
                    mode: 'manual',
                });
            } else {
                await submitScore(score, 3);
            }
            return;
        }

        await submitScore(score);
    };

    const handleEnterRemaining = async () => {
        if (!match) return;
        
        if (inputValue === '') return;
        const remaining = parseInt(inputValue, 10);
        if (isNaN(remaining)) return;

        const score = match.activePlayer.remainingScore - remaining;

        if (isMatchFinished()) {
            openToast({
                title: 'ERROR',
                description: 'La partida ya ha finalizado',
                type: 'error',
                mode: 'auto',
            });
            return;
        }
        if (isLegFinished(score) && canCheckoutWithDarts(score, 3)) {
            if (askDartsOnCheckout) {
                openToast({
                    title: '¿Con cuántos dardos has cerrado?',
                    description: '',
                    type: 'success',
                    mode: 'manual',
                });
            } else {
                await submitScore(score, 3);
            }
            return;
        }

        await submitScore(score);
    };

    const handleGameShot = async () => {
        if (askDartsOnCheckout) {
            openToast({
                title: '¿Con cuántos dardos has cerrado?',
                type: 'success',
                mode: 'manual',
                showCloseButton: true,
            });
        } else {
            if (match) {
                await submitScore(match.activePlayer.remainingScore, 3);
            }
        }
    };

    const handleCheckout = async (scoreNum: number, numDarts: number) => {
        if (isMatchFinished()) {
            openToast({
                title: 'ERROR',
                description: 'La partida ya ha finalizado',
                type: 'error',
                mode: 'auto',
            });
            return;
        }

        setToast(prev => ({ ...prev, visible: false }));
        await submitScore(scoreNum, numDarts);
    };

    const handleEditThrowPress = (playerId: string, index: number, score: number) => {
        if (index === 0) return; // No se puede editar el estado inicial
        setEditingThrow({ playerId, index, score: score.toString() });
        openToast({
            title: 'Editar tirada',
            description: 'Introduce la nueva puntuación',
            type: 'success',
            mode: 'manual',
        });
    };

    const handleSaveEdit = async () => {
        if (!match || !editingThrow) return;
        const newScore = parseInt(editingThrow.score, 10);
        if (isNaN(newScore)) return;

        try {
            const updatedMatch = await matchX01Service.editThrow(
                match.id,
                editingThrow.playerId,
                editingThrow.index,
                newScore,
            );
            setMatch(updatedMatch);
            setEditingThrow(null);

            if (SocketClientService.isConnected()) {
                const startingScore = match.config?.game ?? 501;
                const formattedHistory = updatedMatch.history
                    .slice(1) // Omitimos el estado inicial
                    .map((snap: any, index: number) => {
                        const throwerIndex = snap.activePlayerIndex === 0 ? 1 : 0;

                        // Recuperamos la snapshot anterior de la lista completa (sumando 1 al índice por el slice)
                        const prevSnap = updatedMatch.history[index];

                        // Calculamos los puntos obtenidos en este tiro deduciendo el remanente anterior
                        const prevRemaining = prevSnap ? prevSnap.players[throwerIndex].remainingScore : startingScore;
                        const currentRemaining = snap.players[throwerIndex].remainingScore;
                        const calculatedScore = prevRemaining - currentRemaining;

                        return {
                            score: calculatedScore, // <-- ¡AQUÍ ESTÁ EL SCORE QUE FALTA!
                            status: snap.status,
                            activePlayerIndex: snap.activePlayerIndex,
                            throwerPlayerIndex: throwerIndex,
                            participant1: {
                                remainingScore: snap.players[0].remainingScore,
                                setsWon: snap.players[0].numSetsWon,
                                legsWon: snap.players[0].numLegsWon,
                            },
                            participant2: {
                                remainingScore: snap.players[1].remainingScore,
                                setsWon: snap.players[1].numSetsWon,
                                legsWon: snap.players[1].numLegsWon,
                            }
                        };
                    });

                // Calculamos el score para la última tirada (el estado actual del partido tras el edit)
                const lastThrowerIndex = updatedMatch.activePlayerIndex === 0 ? 1 : 0;
                const absoluteLastSnap = updatedMatch.history[updatedMatch.history.length - 1];
                const lastPrevRemaining = absoluteLastSnap ? absoluteLastSnap.players[lastThrowerIndex].remainingScore : startingScore;
                const lastCalculatedScore = lastPrevRemaining - updatedMatch.players[lastThrowerIndex].remainingScore;

                formattedHistory.push({
                    score: lastCalculatedScore, // <-- SCORE recalculado para la última edición
                    status: updatedMatch.status,
                    activePlayerIndex: updatedMatch.activePlayerIndex,
                    throwerPlayerIndex: lastThrowerIndex,
                    participant1: {
                        remainingScore: updatedMatch.players[0].remainingScore,
                        setsWon: updatedMatch.players[0].numSetsWon,
                        legsWon: updatedMatch.players[0].numLegsWon,
                    },
                    participant2: {
                        remainingScore: updatedMatch.players[1].remainingScore,
                        setsWon: updatedMatch.players[1].numSetsWon,
                        legsWon: updatedMatch.players[1].numLegsWon,
                    }
                });

                // Emitimos el cambio masivo al backend
                SocketClientService.emitScoreEdit(formattedHistory);
            }

            if (updatedMatch.status === GameStatus.FINISHED) {
                openToast({
                    title: '¡Victoria!',
                    description: 'Partida finalizada',
                    type: 'success',
                    mode: 'auto',
                    onCloseAction: () => navigation.navigate(
                        'MatchX01SummaryScreen', {
                            matchId: match.id,
                            isCompetitionMode: isCompetitionMode,
                        },
                    ),
                });
            } else {
                closeToast();
            }
        } catch (error: any) {
            openToast({
                title: 'Error',
                description: error.message,
                type: 'error',
                mode: 'auto',
            });
        }
    };

    const handleSwapStartingPlayer = async () => {
        if (!match) return;
        try {
            const updatedMatch = await matchX01Service.swapStartingPlayer(match.id);
            setMatch(updatedMatch);
        } catch (error: any) {
            openToast({
                title: 'Error',
                description: error.message,
                type: 'error',
                mode: 'auto',
            });
        }
    };

    const isLegFinished = (scoreNum: number) => {
        if (scoreNum == match?.activePlayer.remainingScore) return true;
        return false;
    }

    const isMatchFinished = () => {
        if (match?.status === GameStatus.FINISHED) return true;
        return false;
    }

    const openToast = (toast: any) => {
        setToast({ ...toast, visible: true });
    }
    const closeToast = () => {
        setToast(prev => ({ ...prev, visible: false }));
    }

    return {
        match,
        inputValue,
        toast,
        setToast,
        scrollViewRef,
        handleKeyPress,
        handleBackspace,
        handleUndo,
        submitScore,
        handleEnter,
        handleEnterRemaining,
        handleGameShot,
        handleCheckout,
        handleSwapStartingPlayer,
        editingThrow,
        setEditingThrow,
        handleEditThrowPress,
        handleSaveEdit,
    };
};
