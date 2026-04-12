import { GameTypes } from '../../../../../backend/src/domain/enums/GameTypes';

export const normalizeOdd = (
    value: number,
    type?: GameTypes
): number => {
    if (type !== GameTypes.BestOf) return value;

    return value % 2 === 0 ? value + 1 : value;
};
