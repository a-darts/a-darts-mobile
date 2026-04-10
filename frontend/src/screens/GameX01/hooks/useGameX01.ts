import { useState, useEffect, useRef } from 'react';
import { ScrollView } from 'react-native';
import { MatchX01 } from '../../../../../backend/src/domain/models/MatchX01';

import MatchX01ServiceFactory from '../../../../../backend/src/infrastructure/factories/MatchX01ServiceFactory';

// Obtenemos los servicios y el repo desde la Factoría (fuera del hook)
const matchRepo = MatchX01ServiceFactory.getRepository();
const addScoreService = MatchX01ServiceFactory.getAddScoreService();
const undoScoreService = MatchX01ServiceFactory.getUndoScoreService();
const swapStartingPlayerService = MatchX01ServiceFactory.getSwapStartingPlayerService();

export const useGameX01 = (navigation: any, route: any) => {
    const { matchId } = route.params;

    const [match, setMatch] = useState<MatchX01 | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [toast, setToast] = useState({ visible: false, title: '', description: '', type: 'error' });
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        const loadGame = async () => {
            const result = await matchRepo.getById(matchId);
            if (!result) {
                setToast({ visible: true, title: 'Error', description: 'No se pudo cargar la partida', type: 'error' });
                setTimeout(() => navigation.goBack(), 2000);
                return;
            }
            setMatch(result);
        };
        loadGame();
    }, [matchId]);

    const handleKeyPress = (char: string) => {
        if (inputValue.length > 3) return;
        setInputValue(prev => prev + char);
    };

    const handleBackspace = () => setInputValue(prev => prev.slice(0, -1));

    const submitScore = async (scoreNum: number) => {
        if (!match) return;
        // MIRAR: si usuario introduce un numero, pulsa Enter y la operación
        // tarda 200ms, el número se queda ahí congelado -> Optimistic UI
        // const previousValue = inputValue;
        // setInputValue('');

        try {
            // Llamamos al servicio de aplicación
            const updatedMatch = await addScoreService.execute(match.id, scoreNum);

            // Actualizamos el estado con la nueva instancia (esto dispara el re-render)
            setMatch(updatedMatch);
            setInputValue('');

            if (updatedMatch.status === 'FINISHED') {
                setToast({ visible: true, title: '¡Victoria!', description: 'Partida finalizada', type: 'success' });
            }
        } catch (error: any) {
            setToast({ visible: true, title: 'Puntuación inválida', description: error.message, type: 'error' });
            setInputValue('');
        }
    };

    const handleUndo = async () => {
        if (!match) return;
        try {
            const updatedMatch = await undoScoreService.execute(match.id);
            setMatch(updatedMatch);
        } catch (error: any) {
            setToast({ visible: true, title: 'Error', description: error.message, type: 'error' });
        }
    };

    const handleEnter = async () => {
        if (inputValue === '') return;
        const score = parseInt(inputValue, 10);
        if (isNaN(score)) return;

        await submitScore(score);
    };

    const handleEnterRemaining = async () => {
        if (inputValue === '') return;
        const remaining = parseInt(inputValue, 10);
        if (isNaN(remaining)) return;

        const score = match.activePlayer.remainingScore - remaining;
        await submitScore(score);
    };

    const handleSwapStartingPlayer = async () => {
        if (!match) return;
        try {
            const updatedMatch = await swapStartingPlayerService.execute(match.id);
            setMatch(updatedMatch);
        } catch (error: any) {
            setToast({ visible: true, title: 'Error', description: error.message, type: 'error' });
        }
    };

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
        handleSwapStartingPlayer,
    };
};
