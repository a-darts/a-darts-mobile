import { GameTypes } from '../../../../../backend/src/domain/enums/GameTypes';

export const TYPE_OPTIONS = [
    { label: 'A ganar', value: GameTypes.FirstTo },
    { label: 'Al mejor de', value: GameTypes.BestOf },
];
