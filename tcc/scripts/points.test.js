const TOTAL_OF_POINTS = 1_000_000;

function random(min = 200, max = 450) {
  return (Math.round(Math.pow(10, 14) * Math.random() * Math.random()) % (max - min + 1)) + min;
}

function convertValue(fromScale, toScale, value) {
  return toScale.min - ((fromScale.min - value) / fromScale.max) * toScale.max;
}

function lossesCalculator(guesses, timeLimit = 60, guessLimit = 5, tipsLimit = 4) {
  // In 5 guesses, you can lower your score by 225_000 points max
  // In the worst case scenario: 5 * 100 * 450 = 225_000
  // In the worst/best case scenario: 5 * 100 * 300 = 150_000
  // In the best case scenario: 0 * 100 * ANY = 0
  const guessLost = convertValue(
    { min: 0, max: guessLimit },
    { min: 0, max: 5 },
    guesses.filter(guess => !guess.isRight).reduce(agg => agg + 100 * random(300, 450), 0)
  );

  // In 4 tips, you can lower your score by 500_000 points
  // In the worst case scenario: 5 * 8 * 50 * 250 = 500_000
  // In the worst/best case scenario: 5 * 8 * 50 * 175 = 350_000
  // In the best case scenario: ANY * 0 * 100 * ANY = 0
  const tipsLost = convertValue(
    { min: 0, max: tipsLimit },
    { min: 0, max: 4 },
    guesses.reduce((agg, crr) => agg + parseInt(crr.tipsViewed.length) * 50 * random(175, 250), 0)
  );

  // In 5 guesses, you can lower your score by 225_000 points
  // In the worst case scenario: 5 * 60 * 600 = 180_000
  // In the worst/best case scenario: 5 * 60 * 400 = 120_000
  // In the best case scenario: 5 * 0 * ANY = 0
  const timeLost = convertValue(
    { min: 0, max: timeLimit },
    { min: 0, max: 60 },
    guesses.reduce((agg, crr) => agg + parseInt(crr.timeElapsed) * random(400, 600), 0)
  );

  // The minimum amount of points is ?? points, the max is 999_999, but that is very difficult
  return [parseInt(guessLost), parseInt(tipsLost), parseInt(timeLost), random(1, 9)];
}

const bestCaseScenario = [{isRight: true, tipsViewed: [], timeElapsed: 1}]
const realCaseScenario = [
  {isRight: false, tipsViewed: [1, 2], timeElapsed: 5},
  {isRight: false, tipsViewed: [1, 2, 3], timeElapsed: 10},
  {isRight: false, tipsViewed: [1, 2, 3], timeElapsed: 16},
  {isRight: false, tipsViewed: [1, 2, 3, 4, 5], timeElapsed: 25},
  {isRight: true, tipsViewed: [1, 2, 3, 4, 5, 6], timeElapsed: 27},
];
const worstCaseScenario = [
  {isRight: false, tipsViewed: [1, 2, 3, 4, 5, 6, 7, 8], timeElapsed: 29},
  {isRight: false, tipsViewed: [1, 2, 3, 4, 5, 6, 7, 8], timeElapsed: 29},
  {isRight: false, tipsViewed: [1, 2, 3, 4, 5, 6, 7, 8], timeElapsed: 29},
  {isRight: false, tipsViewed: [1, 2, 3, 4, 5, 6, 7, 8], timeElapsed: 29},
  {isRight: false, tipsViewed: [1, 2, 3, 4, 5, 6, 7, 8], timeElapsed: 29},
  {isRight: false, tipsViewed: [1, 2, 3, 4, 5, 6, 7, 8], timeElapsed: 29},
  {isRight: false, tipsViewed: [1, 2, 3, 4, 5, 6, 7, 8], timeElapsed: 29},
  {isRight: false, tipsViewed: [1, 2, 3, 4, 5, 6, 7, 8], timeElapsed: 29},
];

for (let scenario of [bestCaseScenario, realCaseScenario, worstCaseScenario]) {
  const losses = lossesCalculator(scenario, 30, 8, 8).reduce((agg, crr) => agg + crr, 0);
  console.log(TOTAL_OF_POINTS - losses);
}
