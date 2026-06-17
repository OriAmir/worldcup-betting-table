import {
  DOMINOS_SNAPSHOT,
  TEAM_RATIOS,
  MANUAL_ADJUSTMENTS,
  BONUS,
  HIDE_PLAYERS,
  SCORER_POINTS_PER_GOAL,
} from "./config.js";

// Build the combined standings.
//
//   total = dominos365 (snapshot, up to France–Senegal)
//         + sport5      (live, France–Senegal onwards)
//         + adjust      (manual, e.g. Nir +5.5)
//         + championBonus (team ratio, only once BONUS.correctWinner is known)
//
// Winner / Top-Scorer pick: use Sport5 if the player set it there, otherwise
// fall back to the 365 snapshot pick and flag it with `*`.
//
// sport5: { name, members: [{ name, points, champion, scorer, ... }] }
export function mergeStandings(sport5) {
  const members = (sport5 && sport5.members) || [];

  const rows = members
    .filter((m) => !HIDE_PLAYERS.includes(m.name))
    .map((m) => {
      const snap = DOMINOS_SNAPSHOT[m.name] || null;
      const dominosPoints = snap ? Number(snap.points) || 0 : 0;
      const sport5Points = Number(m.points) || 0;

      const champ = m.champion || null;
      const scorer = m.scorer || null;
      const hasWinnerOnS5 = !!(champ && champ.name);
      const hasScorerOnS5 = !!(scorer && scorer.name);

      const winnerName = hasWinnerOnS5
        ? champ.name
        : snap
        ? snap.winner
        : null;
      const winnerFromDominos = !hasWinnerOnS5 && !!(snap && snap.winner);

      const topScorerName = hasScorerOnS5
        ? scorer.name
        : snap
        ? snap.topScorer
        : null;
      const topScorerFromDominos = !hasScorerOnS5 && !!(snap && snap.topScorer);

      // Champion bonus = the team's Sport5 ratio (France 30, Brazil 50, ...).
      const championRatio =
        winnerName != null && TEAM_RATIOS[winnerName] != null
          ? TEAM_RATIOS[winnerName]
          : null;

      const adjust = MANUAL_ADJUSTMENTS[m.name] || null;
      const adjustPoints = adjust ? adjust.points : 0;

      const winnerCorrect =
        BONUS.correctWinner != null &&
        winnerName != null &&
        winnerName === BONUS.correctWinner;
      const topScorerCorrect =
        BONUS.correctTopScorer != null &&
        topScorerName != null &&
        topScorerName === BONUS.correctTopScorer;

      // Only the champion produces an end-of-tournament bonus. Scorer goals
      // (2 each) are already inside the live Sport5 points.
      const championBonus = winnerCorrect && championRatio != null ? championRatio : 0;

      const total = dominosPoints + sport5Points + adjustPoints + championBonus;

      return {
        name: m.name,
        dominosPoints,
        sport5Points,
        adjustPoints,
        adjustReason: adjust ? adjust.reason : null,
        winnerName,
        winnerFromDominos,
        championRatio,
        topScorerName,
        topScorerFromDominos,
        scorerGoalPoints: Number(m.pointsFromScrorer) || 0,
        winnerCorrect,
        topScorerCorrect,
        championBonus,
        total,
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
      scorerPointsPerGoal: SCORER_POINTS_PER_GOAL,
    },
  };
}
