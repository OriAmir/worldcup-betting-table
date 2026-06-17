import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeStandings } from "../lib/merge.js";

// Sport5 (live) sample reflecting the real shape.
const sport5 = {
  name: "חברים",
  members: [
    {
      name: "oriamir",
      points: 39.5,
      pointsFromScrorer: 4,
      champion: { name: "צרפת", ratio: 30 },
      scorer: { name: "קיליאן אמבפה" },
    },
    {
      name: "Nir nechemia",
      points: 4.5,
      pointsFromScrorer: 0,
      champion: null, // missing on Sport5 -> borrow from 365 snapshot
      scorer: null,
    },
    {
      name: "Matan Ashkenazi",
      points: 0,
      pointsFromScrorer: 0,
      champion: null,
      scorer: null,
    },
  ],
};

test("total = 365 snapshot + Sport5 + manual adjustment", () => {
  const { rows } = mergeStandings(sport5);
  const ori = rows.find((r) => r.name === "oriamir");
  // 365 snapshot for oriamir = 8, sport5 = 39.5, no adjustment
  assert.equal(ori.dominosPoints, 8);
  assert.equal(ori.sport5Points, 39.5);
  assert.equal(ori.total, 8 + 39.5);

  const nir = rows.find((r) => r.name === "Nir nechemia");
  // 365 snapshot = 10, sport5 = 4.5, manual +5.5
  assert.equal(nir.dominosPoints, 10);
  assert.equal(nir.sport5Points, 4.5);
  assert.equal(nir.adjustPoints, 5.5);
  assert.equal(nir.total, 10 + 4.5 + 5.5);
});

test("missing Sport5 picks are borrowed from 365 and flagged", () => {
  const { rows } = mergeStandings(sport5);
  const nir = rows.find((r) => r.name === "Nir nechemia");
  assert.equal(nir.winnerName, "אנגליה");
  assert.equal(nir.winnerFromDominos, true);
  assert.equal(nir.topScorerName, "קיליאן אמבפה");
  assert.equal(nir.topScorerFromDominos, true);
  assert.equal(nir.needsManualAdd, true);
});

test("Sport5 picks override 365 and carry champion ratio", () => {
  const { rows } = mergeStandings(sport5);
  const ori = rows.find((r) => r.name === "oriamir");
  assert.equal(ori.winnerName, "צרפת");
  assert.equal(ori.winnerFromDominos, false);
  assert.equal(ori.championRatio, 30); // France ratio from TEAM_RATIOS
  assert.equal(ori.needsManualAdd, false);
});

test("rows sorted by total desc with ranks and medals", () => {
  const { rows } = mergeStandings(sport5);
  assert.equal(rows[0].name, "oriamir");
  assert.equal(rows[0].rank, 1);
  for (let i = 1; i < rows.length; i++) {
    assert.ok(rows[i - 1].total >= rows[i].total);
  }
});
