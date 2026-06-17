import { DOMINOS_GROUP_ID, SPORT5_GROUP_ID } from "./config.js";

const DOMINOS_URL = `https://wcg-il.365scores.com/Groups/GetGroupTable?lang=2&groupID=${DOMINOS_GROUP_ID}`;
const SPORT5_URL =
  "https://hevre.sport5.co.il/server/data.php?type=getGroup";

export async function fetchDominos() {
  const res = await fetch(DOMINOS_URL, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Dominos fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchSport5() {
  const res = await fetch(SPORT5_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ membersGroup: SPORT5_GROUP_ID }),
  });
  if (!res.ok) throw new Error(`Sport5 fetch failed: ${res.status}`);
  return res.json();
}
