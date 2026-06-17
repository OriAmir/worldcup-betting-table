import { fetchDominos, fetchSport5 } from "../lib/sources.js";
import { mergeStandings } from "../lib/merge.js";

// Vercel serverless function: fetches both platforms server-side (no CORS),
// merges, and returns the combined standings. Cached at the edge for 30s.
export default async function handler(req, res) {
  try {
    const [sport5, dominos] = await Promise.all([
      fetchSport5(),
      fetchDominos().catch(() => null), // Dominos is only a fallback source
    ]);

    const result = mergeStandings(sport5, dominos);

    res.setHeader(
      "Cache-Control",
      "s-maxage=30, stale-while-revalidate=120"
    );
    res.status(200).json({ ...result, fetchedAt: Date.now() });
  } catch (err) {
    res.status(500).json({ error: String(err && err.message) || "error" });
  }
}
