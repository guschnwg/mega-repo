export const AVAILABLE_CONTINENTS = ["África", "América do Sul", "Ásia", "Oceania", "América do Norte", "Europa"];

export function getConfig(params) {
  const timeLimit = params.time_limit || params.timeLimit || 60;
  const guessLimit = params.guess_limit || params.guessLimit || 5;
  const tipsLimit = params.tips_limit || params.tipsLimit || 5;
  const skipTutorial = params.skip_tutorial || params.skipTutorial || "false";
  const continents = params.continents || AVAILABLE_CONTINENTS;

  const config = {
    timeLimit: parseInt(timeLimit),
    guessLimit: parseInt(guessLimit),
    tipsLimit: parseInt(tipsLimit),
    skipTutorial: skipTutorial === 'true',
    continents: Array.isArray(continents) ? continents : [continents],
  };

  console.log("With config", config);

  return config;
}
