import { GameTypes } from '../../../../../backend/src/domain/enums/GameTypes';

export const TYPE_OPTIONS = [
    { label: 'A ganar', value: GameTypes.FIRST_TO },
    { label: 'Al mejor de', value: GameTypes.BEST_OF },
];
