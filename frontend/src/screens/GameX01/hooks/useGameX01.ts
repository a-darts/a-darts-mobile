import { useState, useEffect, useRef } from 'react';
import { ScrollView } from 'react-native';
import { MatchX01 } from '../../../../../backend/src/domain/models/MatchX01';
import { TYPE_OPTIONS } from '../constants/GameX01.constants';
import MatchX01ServiceFactory from '../../../../../backend/src/infrastructure/factories/MatchX01ServiceFactory';
import { BustException } from '../../../../../backend/src/domain/exceptions/Exceptions';

// Obtenemos los servicios y el repo desde la Factoría (fuera del hook)
const matchRepo = MatchX01ServiceFactory.getRepository();
const addScoreService = MatchX01ServiceFactory.getAddScoreService();
const undoScoreService = MatchX01ServiceFactory.getUndoScoreService();
const swapStartingPlayerService = MatchX01ServiceFactory.getSwapStartingPlayerService();

type ToastState = {
    visible: boolean;
    title: string;
    description?: string;
    type: 'error' | 'success';
    mode: 'auto' | 'manual';
    onCloseAction?: () => void;
};

export const useGameX01 = (navigation: any, route: any) => {
    const { matchId } = route.params;

    const [match, setMatch] = useState<MatchX01 | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [toast, setToast] = useState<ToastState>({
        visible: false,
        title: '',
        description: '',
        type: 'error',
        mode: 'auto',
    });
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        const loadGame = async () => {
            const result = await matchRepo.getById(matchId);
            if (!result) {
                openToast({
                    title: 'Error',
                    description: 'No se pudo cargar la partida',
                    type: 'error',
                    mode: 'auto',
                });
                setTimeout(() => navigation.goBack(), 2000);
                return;
            }
            setMatch(result);
        };
        loadGame();
    }, [matchId]);

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

    const submitScore = async (scoreNum: number) => {
        if (!match) return;

        try {
            const updatedMatch = await addScoreService.execute(match.id, scoreNum);

            // Actualizamos el estado con la nueva instancia (esto dispara el re-render)
            setMatch(updatedMatch);
            setInputValue('');

            if (updatedMatch.status === 'FINISHED') {
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
            const updatedMatch = await undoScoreService.execute(match.id);
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

        if (isLegFinished(score)) {
            openToast({
                title: '¿Con cuántos dardos has cerrado?',
                description: '',
                type: 'success',
                mode: 'manual',
            });
        } else {
            await submitScore(score);
        }
    };

    const handleEnterRemaining = async () => {
        if (inputValue === '') return;
        const remaining = parseInt(inputValue, 10);
        if (isNaN(remaining)) return;

        const score = match.activePlayer.remainingScore - remaining;
        if (isLegFinished(score)) {
            openToast({
                title: '¿Con cuántos dardos has cerrado?',
                description: '',
                type: 'success',
                mode: 'manual',
            });
        } else {
            await submitScore(score);
        }
    };

    const handleGameShot = async () => {
        openToast({
            title: '¿Con cuántos dardos has cerrado?',
            description: '',
            type: 'success',
            mode: 'manual',
        });
    };

    const handleGameShotNumDarts = async (scoreNum: number, numDarts: number) => {
        await submitScore(scoreNum);
        closeToast();
    };

    const handleSwapStartingPlayer = async () => {
        if (!match) return;
        try {
            const updatedMatch = await swapStartingPlayerService.execute(match.id);
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
        handleGameShotNumDarts,
        handleSwapStartingPlayer,
    };
};
