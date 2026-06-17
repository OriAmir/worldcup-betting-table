import { SPORT5_GROUP_ID } from "./config.js";

const SPORT5_URL = "https://hevre.sport5.co.il/server/data.php?type=getGroup";

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
