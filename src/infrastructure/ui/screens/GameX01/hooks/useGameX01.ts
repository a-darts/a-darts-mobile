import { useState, useEffect, useRef } from 'react';
import { ScrollView } from 'react-native';
import { MatchX01 } from '../../../../../domain/models/MatchX01';
import MatchX01ConfigServiceFactory from '../../../../factories/MatchX01ConfigServiceFactory';

export const useGameX01 = (navigation: any) => {
    const matchService = MatchX01ConfigServiceFactory.getInstance();

    const [match, setMatch] = useState<MatchX01 | null>(null);
    const [tick, setTick] = useState(0);
    const [inputValue, setInputValue] = useState('');
    const [toast, setToast] = useState({ visible: false, title: '', description: '', type: 'error' });
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        const loadGame = async () => {
            const matchConfig = await matchService.getMatchConfig();
            if (!matchConfig) {
                navigation.goBack();
                return;
            }
            setMatch(new MatchX01(matchConfig));
        };
        loadGame();
    }, []);

    const handleKeyPress = (char: string) => {
        if (inputValue.length < 3) setInputValue(prev => prev + char);
    };

    const handleBackspace = () => setInputValue(prev => prev.slice(0, -1));

    const submitScore = (scoreNum: number) => {
        if (!match) return;
        try {
            match.addThrow(scoreNum);
            setTick(t => t + 1);
            setInputValue('');
        } catch (error: any) {
            setToast({ visible: true, title: 'Error', description: error.message, type: 'error' });
            setInputValue('');
        }
    };

    const handleUndo = () => {
        if (match) {
            match.undoLastThrow();
            setTick(t => t + 1);
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
        handleEnter: () => inputValue !== '' && submitScore(parseInt(inputValue, 10)),
    };
};
