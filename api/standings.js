import { fetchSport5, fetchTopScorers, fetchSport5Games } from "../lib/sources.js";
import { mergeStandings } from "../lib/merge.js";

// Vercel serverless function: fetches Sport5 (live) + 365 top-scorers +
// per-game breakdown server-side (no CORS), merges with the fixed 365 snapshot.
export default async function handler(req, res) {
  try {
    const [sport5, topScorers, games] = await Promise.all([
      fetchSport5(),
      fetchTopScorers().catch(() => ({})), // optional live scorer source
      fetchSport5Games().catch(() => []), // optional per-game breakdown
    ]);
    const result = mergeStandings(sport5, topScorers, games);

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=120");
    res.status(200).json({ ...result, fetchedAt: Date.now() });
  } catch (err) {
    res.status(500).json({ error: String(err && err.message) || "error" });
  }
}
