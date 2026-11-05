/* Pro Frage vier Optionen. Schlüssel 1..7 = Ermittlertyp, r = Rex. */
export const Q = [
  [ {6:2,1:1}, {2:2},     {3:2},      {4:2,r:1} ],
  [ {1:2},     {6:2},     {3:2,2:1},  {4:1,r:2} ],
  [ {2:2,6:1}, {4:2},     {7:2,1:1},  {5:1,r:1} ],
  [ {5:2},     {3:2,2:1}, {6:2,1:1},  {4:2} ],
  [ {1:2},     {2:2,3:1}, {7:2},      {r:2,4:1} ],
  [ {2:2},     {4:2,1:1}, {5:2,7:1},  {6:2} ],
  [ {7:2,1:1}, {3:2,7:1}, {5:2},      {r:2,7:1} ],
  [ {1:2,2:1}, {3:2},     {5:2},      {7:2} ],
  [ {1:2},     {6:2},     {4:2,r:1},  {7:2} ],
];

export const REX_THRESHOLD = 6;
export const TIE_ORDER = [1,2,3,4,5,6,7];

/* Die Typen kommen in unterschiedlich vielen Antworten vor. Mittelwert und
   Streuung werden deshalb direkt aus Q berechnet und Rohwerte normalisiert. */
export const TYPE_SCORE_STATS = Object.fromEntries(TIE_ORDER.map(type => {
  let mean = 0;
  let variance = 0;

  Q.forEach(row => {
    const values = row.map(option => option[type] || 0);
    const questionMean = values.reduce((sum, value) => sum + value, 0) / values.length;
    mean += questionMean;
    variance += values.reduce((sum, value) => sum + (value - questionMean) ** 2, 0) / values.length;
  });

  return [type, { mean, sd: Math.sqrt(variance) }];
}));

export function normalizedTypeScore(score, type) {
  const stat = TYPE_SCORE_STATS[type];
  return (score[type] - stat.mean) / stat.sd;
}

export function scoreAnswers(answers) {
  const score = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,r:0};
  const primary = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,r:0};

  answers.forEach((optionIndex, questionIndex) => {
    if (optionIndex == null) return;
    const optionScore = Q[questionIndex][optionIndex];
    let strongestType = null;
    let strongestValue = -1;

    for (const type in optionScore) {
      score[type] += optionScore[type];
      if (optionScore[type] > strongestValue) {
        strongestValue = optionScore[type];
        strongestType = type;
      }
    }
    if (strongestType != null) primary[strongestType] += 1;
  });

  return { score, primary };
}

export function computeResult(answers) {
  const { score, primary } = scoreAnswers(answers);
  if (score.r >= REX_THRESHOLD) return "rex";

  let best = TIE_ORDER[0];
  TIE_ORDER.forEach(type => {
    const value = normalizedTypeScore(score, type);
    const bestValue = normalizedTypeScore(score, best);
    if (value > bestValue || (value === bestValue && primary[type] > primary[best])) best = type;
  });
  return best;
}

export function rankedKeys(answers) {
  const { score, primary } = scoreAnswers(answers);
  const rankedTypes = [...TIE_ORDER].sort((a, b) =>
    normalizedTypeScore(score, b) - normalizedTypeScore(score, a) ||
    primary[b] - primary[a] ||
    TIE_ORDER.indexOf(a) - TIE_ORDER.indexOf(b)
  );

  return score.r >= REX_THRESHOLD ? ["rex", ...rankedTypes] : [...rankedTypes, "rex"];
}
