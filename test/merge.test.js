import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeStandings } from "../lib/merge.js";

const sport5 = {
  name: "חברים",
  members: [
    {
      name: "oriamir",
      points: 39.5,
      pointsFromGuesses: 35.5,
      champion: { name: "צרפת" },
      scorer: { name: "קיליאן אמבפה" },
    },
    {
      name: "Nir nechemia",
      points: 4.5,
      pointsFromGuesses: 4.5,
      champion: null,
      scorer: null,
    },
    {
      name: "Matan Ashkenazi",
      points: 0,
      pointsFromGuesses: 0,
      champion: null,
      scorer: null,
    },
  ],
};

const dominos = {
  table: {
    members: [
      { name: "Nir nechemia", score: 16, winnerTeamName: "אנגליה", topScorerName: "קיליאן אמבפה" },
      { name: "Matan Ashkenazi", score: 16, winnerTeamName: "אנגליה", topScorerName: "הארי קיין" },
      { name: "Ori Amir", score: 16, winnerTeamName: "צרפת", topScorerName: "קיליאן אמבפה" },
    ],
  },
};

test("Nir gets +5.5 manual adjustment", () => {
  const { rows } = mergeStandings(sport5, dominos);
  const nir = rows.find((r) => r.name === "Nir nechemia");
  assert.equal(nir.adjustPoints, 5.5);
  assert.equal(nir.total, 4.5 + 5.5);
});

test("missing picks are borrowed from Dominos and flagged with star", () => {
  const { rows } = mergeStandings(sport5, dominos);
  const nir = rows.find((r) => r.name === "Nir nechemia");
  assert.equal(nir.winnerName, "אנגליה");
  assert.equal(nir.winnerFromDominos, true);
  assert.equal(nir.topScorerName, "קיליאן אמבפה");
  assert.equal(nir.topScorerFromDominos, true);
  assert.equal(nir.needsManualAdd, true);
});

test("players with Sport5 picks are NOT borrowed", () => {
  const { rows } = mergeStandings(sport5, dominos);
  const ori = rows.find((r) => r.name === "oriamir");
  assert.equal(ori.winnerName, "צרפת");
  assert.equal(ori.winnerFromDominos, false);
  assert.equal(ori.needsManualAdd, false);
});

test("rows are sorted by total descending with ranks", () => {
  const { rows } = mergeStandings(sport5, dominos);
  assert.equal(rows[0].name, "oriamir");
  assert.equal(rows[0].rank, 1);
  for (let i = 1; i < rows.length; i++) {
    assert.ok(rows[i - 1].total >= rows[i].total);
  }
});
