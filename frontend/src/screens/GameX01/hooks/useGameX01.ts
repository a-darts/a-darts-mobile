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
    const { matchId } = route.params;

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
                SocketClientService.emitScoreUpdate({ score: scoreNum });
            }

            if (updatedMatch.status === GameStatus.FINISHED) {
                openToast({
                    title: '¡Victoria!',
                    description: 'Partida finalizada',
                    type: 'success',
                    mode: 'auto',
                    onCloseAction: () => navigation.navigate('MatchX01SummaryScreen', { matchId: match.id }),
                });
            }
        } catch (error) {
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
                newScore
            );
            setMatch(updatedMatch);
            setEditingThrow(null);

            if (updatedMatch.status === GameStatus.FINISHED) {
                openToast({
                    title: '¡Victoria!',
                    description: 'Partida finalizada',
                    type: 'success',
                    mode: 'auto',
                    onCloseAction: () => navigation.navigate('MatchX01SummaryScreen', { matchId: match.id }),
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
