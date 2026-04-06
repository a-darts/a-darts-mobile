export const calculateNewThrow = (scoreNum, currentScore, throwsCount) => {
  const newScoreLeft = currentScore - scoreNum;
  const newDartCount = (throwsCount === 0) ? 3 : (throwsCount * 3) + 3; // O tu lógica de conteo

  return {
    score: scoreNum,
    remaining: newScoreLeft,
    dartCount: newDartCount,
  };
};

export const isBust = (scoreNum, currentScore) => scoreNum > currentScore;
export const isCheckout = (scoreNum, currentScore) => scoreNum === currentScore;