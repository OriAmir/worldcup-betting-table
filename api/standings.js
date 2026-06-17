import { fetchSport5 } from "../lib/sources.js";
import { mergeStandings } from "../lib/merge.js";

// Vercel serverless function: fetches Sport5 (live) server-side (no CORS),
// merges it with the fixed 365 snapshot, returns combined standings.
export default async function handler(req, res) {
  try {
    const sport5 = await fetchSport5();
    const result = mergeStandings(sport5);

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=120");
    res.status(200).json({ ...result, fetchedAt: Date.now() });
  } catch (err) {
    res.status(500).json({ error: String(err && err.message) || "error" });
  }
}
