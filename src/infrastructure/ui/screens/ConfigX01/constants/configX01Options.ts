import { GamesX01 } from '../../../../../domain/enums/GamesX01';
import { GameTypes } from '../../../../../domain/enums/GameTypes';

export const GAME_OPTIONS = [
    { label: '501', value: 501 },
    { label: '301', value: 301 },
    { label: '170', value: 170 },
];

export const TYPE_OPTIONS = [
    { label: 'A ganar', value: GameTypes.FirstTo },
    { label: 'Al mejor de', value: GameTypes.BestOf },
];
