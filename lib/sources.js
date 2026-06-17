import { SPORT5_GROUP_ID } from "./config.js";

const SPORT5_BASE = "https://hevre.sport5.co.il/server/data.php?type=";
const SPORT5_URL = SPORT5_BASE + "getGroup";
const ENDED_GAMES_URL = SPORT5_BASE + "getEndedGames";
const GAME_POINTS_URL = SPORT5_BASE + "getCurrentGameGroupPoints";
const TOP_SCORERS_URL =
  "https://wcg-il.365scores.com/Tournament/getTopScorers?lang=2";

// Live source = Sport5 (5 חבר'ה). Dominos is a frozen snapshot in config.js,
// so there is nothing to fetch for it.
export async function fetchSport5() {
  const res = await fetch(SPORT5_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ membersGroup: SPORT5_GROUP_ID }),
  });
  if (!res.ok) throw new Error(`Sport5 fetch failed: ${res.status}`);
  return res.json();
}

// Live top-scorer goal counts from 365scores → { playerName: goals }.
// Used to award live goal points to players whose scorer pick was borrowed
// from 365 (and therefore isn't tracked by 5 חבר'ה).
export async function fetchTopScorers() {
  const res = await fetch(TOP_SCORERS_URL, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`TopScorers fetch failed: ${res.status}`);
  const json = await res.json();
  const map = {};
  for (const p of (json && json.players) || []) {
    if (p && p.name != null) map[p.name] = Number(p.score) || 0;
  }
  return map;
}

const hasResult = (g) =>
  g && g.result1 != null && g.result1 !== "" && g.result2 != null;

// Per-game 5 חבר'ה breakdown, from France–Senegal onwards.
// Returns an array of games (chronological), each with per-member scores:
//   [{ gid, label, result, perMember: { name: gameScore } }]
export async function fetchSport5Games() {
  const res = await fetch(ENDED_GAMES_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(`getEndedGames failed: ${res.status}`);
  const all = await res.json();
  if (!Array.isArray(all)) return [];

  // France–Senegal is the cutoff: include it and everything after it.
  const fs = all.find(
    (g) =>
      g.team1 && g.team1.name === "צרפת" && g.team2 && g.team2.name === "סנגל"
  );
  const cutoff = fs ? fs.beggining || 0 : 0;

  const games = all
    .filter((g) => (g.beggining || 0) >= cutoff && hasResult(g))
    .sort((a, b) => (a.beggining || 0) - (b.beggining || 0));

  const results = await Promise.all(
    games.map(async (g) => {
      const r = await fetch(GAME_POINTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gid: g.gid, groupid: SPORT5_GROUP_ID }),
      });
      const json = r.ok ? await r.json() : { members: [] };
      const perMember = {};
      for (const m of (json && json.members) || []) {
        const cg = m.currentGame || {};
        perMember[m.name] = {
          score: Number(cg.gameScore) || 0,
          guess:
            cg.team1guess != null && cg.team2guess != null
              ? `${cg.team1guess}-${cg.team2guess}`
              : null,
        };
      }
      return {
        gid: g.gid,
        label: `${g.team1.name} - ${g.team2.name}`,
        result: `${g.result1}-${g.result2}`,
        perMember,
      };
    })
  );

  return results;
}

