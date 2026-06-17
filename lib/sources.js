import { SPORT5_GROUP_ID } from "./config.js";

const SPORT5_URL = "https://hevre.sport5.co.il/server/data.php?type=getGroup";
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
