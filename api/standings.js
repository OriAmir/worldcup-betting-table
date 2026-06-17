import { fetchSport5, fetchTopScorers } from "../lib/sources.js";
import { mergeStandings } from "../lib/merge.js";

// Vercel serverless function: fetches Sport5 (live) + 365 top-scorers
// server-side (no CORS), merges with the fixed 365 snapshot, returns standings.
export default async function handler(req, res) {
  try {
    const [sport5, topScorers] = await Promise.all([
      fetchSport5(),
      fetchTopScorers().catch(() => ({})), // optional live scorer source
    ]);
    const result = mergeStandings(sport5, topScorers);

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=120");
    res.status(200).json({ ...result, fetchedAt: Date.now() });
  } catch (err) {
    res.status(500).json({ error: String(err && err.message) || "error" });
  }
}
