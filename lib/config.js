// ============================================================================
//  CONFIGURATION  –  edit this file to tweak the table without touching logic
// ============================================================================

// IDs of the two source groups (taken from the original share links)
export const DOMINOS_GROUP_ID = 31411; // 365scores "Dominos" bolao group
export const SPORT5_GROUP_ID = "6a2ef6cadbb05195300ba352"; // 5 חבר'ה group

// ---------------------------------------------------------------------------
// Name mapping  ::  Sport5 name  ->  Dominos name
// The MAIN table is Sport5. Dominos is only used to borrow the Winner /
// Top-Scorer pick for players who did NOT set them on Sport5.
// If a Sport5 player has no Dominos match, leave them out of this map.
// ---------------------------------------------------------------------------
export const NAME_MAP = {
  "oriamir": "Ori Amir",
  "rafi nechemia": "rafi nechemia",
  "tomer amir": "tomer amir",
  "ראובן מזרחי": "ראובן מזרחי",
  "Omer Moshe": "Omer Moshe",
  "אלון יאיר": "יאיר אלון",
  "לירן יהודה": "לירן יהודה",
  "Nir nechemia": "Nir nechemia",
  "Matan Ashkenazi": "Matan Ashkenazi",
  "חשבון אינטרנטי": "הקוף", // best-guess mapping – verify
};

// ---------------------------------------------------------------------------
// Manual point adjustments – added on top of the Sport5 points.
// key = Sport5 name, value = { points, reason }
// ---------------------------------------------------------------------------
export const MANUAL_ADJUSTMENTS = {
  "Nir nechemia": { points: 5.5, reason: "שכח את הניחוש של צרפת (France bet)" },
};

// ---------------------------------------------------------------------------
// End-of-tournament bonus. Fill these in once the results are official.
// correctWinner / correctTopScorer are the actual answers (Hebrew names, as
// they appear in the sources). Leave null while the tournament is ongoing.
// ---------------------------------------------------------------------------
export const BONUS = {
  correctWinner: null,       // e.g. "צרפת"
  correctTopScorer: null,    // e.g. "קיליאן אמבפה"
  winnerPoints: 10,          // points awarded for a correct Winner pick
  topScorerPoints: 10,       // points awarded for a correct Top-Scorer pick
};

// Players that are placeholder / inactive accounts and should be hidden.
export const HIDE_PLAYERS = []; // e.g. ["חשבון אינטרנטי"]
