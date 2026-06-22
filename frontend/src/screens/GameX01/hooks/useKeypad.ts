
const BOGEY_NUMBERS = [169, 168, 166, 165, 163, 162, 159];

export const useKeypad = () => {
    const getButtonStatus = (buttonScore: number, remainingScore: number) => {
        const isDisabled = buttonScore > remainingScore || (remainingScore - buttonScore) === 1;
        return {
            isDisabled,
            style: { opacity: isDisabled ? 0.2 : 1 }
        };
    };

    const getGameShotStatus = (remainingScore: number) => {
        const isDisabled = !canCheckoutWithDarts(remainingScore, 3) || remainingScore == 0;
        return {
            isDisabled,
            style: { opacity: isDisabled ? 0.2 : 1 }
        };
    };

    const isBogeyNumber = (score: number): boolean => {
        return BOGEY_NUMBERS.includes(score) || score > 170;
    };

    const canCheckoutWithDarts = (score: number, darts: number): boolean => {
        if (score < 0 || score == 1 || isBogeyNumber(score)) return false;

        if (darts === 1) {
            // El máximo cierre con 1 dardo es 40 (D20) o 50 (Bullseye)
            return score <= 40 && score % 2 == 0 || score == 50;
        }
        if (darts === 2) {
            // El máximo cierre con 2 dardos es 110 (T20 + Bullseye)
            return score <= 98 || score == 100 || score == 101 || score == 104 || score == 107 || score == 110;
        }
        if (darts === 3) {
            // El máximo cierre con 3 dardos es 170
            return score <= 158 || score == 160 || score == 161 || score == 164 || score == 167 || score == 170;
        }
        return false;
    };

    return {
        getButtonStatus,
        getGameShotStatus,
        isBogeyNumber,
        canCheckoutWithDarts,
    };
}