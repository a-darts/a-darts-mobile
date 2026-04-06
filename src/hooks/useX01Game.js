import { useState, useEffect } from 'react';
import * as GameLogic from '../domain/gameLogic';
import * as MatchService from '../services/matchService';

export const useX01Game = () => {
    const [config, setConfig] = useState(null);
    const [scoreLeft, setScoreLeft] = useState(501);
    const [throws, setThrows] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [toast, setToast] = useState({
        visible: false,
        title: '',
        description: '',
        type: 'error',
    });

    useEffect(() => {
        MatchService.getMatchConfig().then(data => {
            if (data) {
                setConfig(data);
                setScoreLeft(parseInt(data.game, 10));
            }
        });
    }, []);

    const triggerToast = (title, description, type = 'error') =>
        setToast({ visible: true, title, description, type });

    const handleKeyPress = (char) => {
        if (inputValue.length < 3) setInputValue(prev => prev + char);
    };

    const submitScore = (scoreNum) => {
        if (GameLogic.isBust(scoreNum, scoreLeft)) {
            triggerToast('¡Exceso!', 'Puntuación mayor al resto', 'error');
            setInputValue('');
            return;
        }

        if (GameLogic.isCheckout(scoreNum, scoreLeft)) {
            triggerToast('¡Leg Finalizado!', 'Buen cierre', 'success');
        }

        const newThrow = GameLogic.calculateNewThrow(scoreNum, scoreLeft, throws.length);
        setThrows(prev => [...prev, newThrow]);
        setScoreLeft(newThrow.remaining);
        setInputValue('');
    };

    const handleUndo = () => {
        if (throws.length === 0) return;
        const newThrows = [...throws];
        newThrows.pop();
        setThrows(newThrows);
        setScoreLeft(newThrows.length > 0 ? newThrows[newThrows.length - 1].remaining : (parseInt(config.game)));
    };

    return {
        config, scoreLeft, throws, inputValue, toast,
        methods: { handleKeyPress, handleUndo, submitScore, setToast, setInputValue }
    };
};
