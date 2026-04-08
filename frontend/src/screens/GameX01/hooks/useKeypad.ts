
const bogeyNumbers = [169, 168, 166, 165, 163, 162, 159];

export const useKeypad = () => {
    const isNotPossibleToCheckOut = (remainingScore: number): boolean => {
        // 1. Imposible cerrar un número mayor que 170 o menor o igual que 1
        if (remainingScore > 170 || remainingScore == 1 || remainingScore < 0) {
            return true;
        }

        // 2. Imposible cerrar con 3 dardos los números Bogey
        if (bogeyNumbers.includes(remainingScore)) {
            return true;
        }

        return false;
    };

    const getButtonStatus = (buttonScore: number, remainingScore: number) => {
        const isDisabled = buttonScore > remainingScore;
        return {
            isDisabled,
            style: { opacity: isDisabled ? 0.2 : 1 }
        };
    };

    const getGameShotStatus = (remainingScore: number) => {
        const isDisabled = isNotPossibleToCheckOut(remainingScore);
        return {
            isDisabled,
            style: { opacity: isDisabled ? 0.2 : 1 }
        };
    };

    return {
        getButtonStatus,
        getGameShotStatus,
        isNotPossibleToCheckOut,
    };
}