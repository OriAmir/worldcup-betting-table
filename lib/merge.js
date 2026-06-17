import {
  NAME_MAP,
  MANUAL_ADJUSTMENTS,
  BONUS,
  HIDE_PLAYERS,
} from "./config.js";

// Merge the Sport5 (main) standings with the Dominos winner / top-scorer
// fallback picks. Pure function – easy to unit-test.
//
// sport5:  { name, members: [{ name, points, champion, scorer, pointsFromGuesses, ... }] }
// dominos: { table: { members: [{ name, score, winnerTeamName, topScorerName }] } }
//
// Returns { rows, meta } where rows are already sorted & ranked.
export function mergeStandings(sport5, dominos) {
  const dominosByName = {};
  const dMembers = (dominos && dominos.table && dominos.table.members) || [];
  for (const m of dMembers) dominosByName[m.name] = m;

  const s5Members = (sport5 && sport5.members) || [];

  const rows = s5Members
    .filter((m) => !HIDE_PLAYERS.includes(m.name))
    .map((m) => {
      const champ = m.champion || null;
      const scorer = m.scorer || null;

      const hasWinnerOnS5 = !!(champ && champ.name);
      const hasScorerOnS5 = !!(scorer && scorer.name);

      const dominosName = NAME_MAP[m.name];
      const dom = dominosName ? dominosByName[dominosName] : null;

      // Borrow from Dominos only when missing on Sport5.
      const winnerName = hasWinnerOnS5
        ? champ.name
        : dom
        ? dom.winnerTeamName
        : null;
      const winnerFromDominos = !hasWinnerOnS5 && !!(dom && dom.winnerTeamName);

      const topScorerName = hasScorerOnS5
        ? scorer.name
        : dom
        ? dom.topScorerName
        : null;
      const topScorerFromDominos =
        !hasScorerOnS5 && !!(dom && dom.topScorerName);

      const adjust = MANUAL_ADJUSTMENTS[m.name] || null;
      const adjustPoints = adjust ? adjust.points : 0;

      const basePoints = Number(m.points) || 0;

      // End-of-tournament bonus (only applied once BONUS answers are filled in).
      const winnerCorrect =
        BONUS.correctWinner != null &&
        winnerName != null &&
        winnerName === BONUS.correctWinner;
      const topScorerCorrect =
        BONUS.correctTopScorer != null &&
        topScorerName != null &&
        topScorerName === BONUS.correctTopScorer;

      const bonusPoints =
        (winnerCorrect ? BONUS.winnerPoints : 0) +
        (topScorerCorrect ? BONUS.topScorerPoints : 0);

      const total = basePoints + adjustPoints + bonusPoints;

      return {
        name: m.name,
        basePoints,
        guessPoints: Number(m.pointsFromGuesses) || 0,
        adjustPoints,
        adjustReason: adjust ? adjust.reason : null,
        winnerName,
        winnerFromDominos,
        topScorerName,
        topScorerFromDominos,
        winnerCorrect,
        topScorerCorrect,
        bonusPoints,
        total,
        // a player "needs adding at the end" if any pick is borrowed from Dominos
        needsManualAdd: winnerFromDominos || topScorerFromDominos,
      };
    });

  rows.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  rows.forEach((r, i) => (r.rank = i + 1));

  return {
    rows,
    meta: {
      groupName: (sport5 && sport5.name) || "חברים",
      bonusActive: BONUS.correctWinner != null || BONUS.correctTopScorer != null,
      correctWinner: BONUS.correctWinner,
      correctTopScorer: BONUS.correctTopScorer,
      winnerPoints: BONUS.winnerPoints,
      topScorerPoints: BONUS.topScorerPoints,
    },
  };
}
