// ============================================================================
//  CONFIGURATION  –  edit this file to tweak the table without touching logic
// ============================================================================
//
//  SCORING MODEL
//  -------------
//  • 365 (Dominos)  : FIXED snapshot of points UP TO (not incl.) France–Senegal.
//                     Taken from the screenshot — the live Dominos API has moved
//                     on past France–Senegal, so we DON'T use it for points.
//  • 5 חבר'ה (Sport5): LIVE points, France–Senegal onwards. Auto-synced.
//  • Total          = 365 snapshot + Sport5 live + manual adjustment
//                     + champion bonus (team ratio) once a winner is known.
//  • Scorer points  : Sport5 already awards 2 pts per goal, live (no extra bonus).
//
// ============================================================================

export const SPORT5_GROUP_ID = "6a2ef6cadbb05195300ba352";

export const SCORER_POINTS_PER_GOAL = 2; // Sport5 rule (already counted live)

// ---------------------------------------------------------------------------
// 365 (Dominos) snapshot — everything UP TO France–Senegal.
// Keyed by the Sport5 player name. points = from the screenshot (frozen).
// winner / topScorer = each player's Dominos pick (used as fallback only).
// ---------------------------------------------------------------------------
export const DOMINOS_SNAPSHOT = {
  "oriamir":          { points: 8,  winner: "צרפת",    topScorer: "קיליאן אמבפה" },
  "rafi nechemia":    { points: 5,  winner: "ברזיל",   topScorer: "קיליאן אמבפה" },
  "tomer amir":       { points: 11, winner: "ברזיל",   topScorer: "ויניסיוס ג׳וניור" },
  "ראובן מזרחי":      { points: 8,  winner: "ספרד",    topScorer: "הארי קיין" },
  "Omer Moshe":       { points: 5,  winner: "ברזיל",   topScorer: "ויניסיוס ג׳וניור" },
  "אלון יאיר":        { points: 11, winner: "ברזיל",   topScorer: "מייקל אוליסה" },
  "לירן יהודה":       { points: 8,  winner: "פורטוגל", topScorer: "הארי קיין" },
  "Nir nechemia":     { points: 10, winner: "אנגליה",  topScorer: "קיליאן אמבפה" },
  "Matan Ashkenazi":  { points: 13, winner: "אנגליה",  topScorer: "הארי קיין" },
  "חשבון אינטרנטי":   { points: 10, winner: "הולנד",   topScorer: "קאי האברץ" }, // = "הקוף"
};

// ---------------------------------------------------------------------------
// Champion bonus = team "ratio" from Sport5 (awarded if your champion wins).
// Pulled from Sport5's games. England/Portugal are not in this group's team
// list, so fill them in if they become relevant.
// ---------------------------------------------------------------------------
export const TEAM_RATIOS = {
  "ספרד": 30, "צרפת": 30, "ברזיל": 50, "ארגנטינה": 50, "גרמניה": 70,
  "הולנד": 80, "בלגיה": 100, "נורווגיה": 120, "מרוקו": 130, "יפן": 130,
  "אורוגוואי": 130, "מקסיקו": 150, "ארצות הברית": 150, "שוויץ": 150,
  "טורקיה": 160, "אקוודור": 160, "שבדיה": 160, "סנגל": 160, "אוסטריה": 160,
  "דרום קוריאה": 180, "צ'כיה": 180, "סקוטלנד": 180, "קנדה": 200, "פראגוואי": 200,
  "אוסטרליה": 200, "חוף השנהב": 200, "מצרים": 200, "אלג'יריה": 200,
  "בוסניה הרצגובינה": 250, "איראן": 250, "דרום אפריקה": 300, "קטאר": 300,
  "טוניסיה": 300, "ערב הסעודית": 300, "קייפ ורדה": 400, "ניו זילנד": 400,
  "עיראק": 400, "האיטי": 500, "קורסאו": 500, "ירדן": 500,
};

// ---------------------------------------------------------------------------
// Manual adjustments – added on top. key = Sport5 name.
// ---------------------------------------------------------------------------
export const MANUAL_ADJUSTMENTS = {
  "Nir nechemia": { points: 5.5, reason: "שכח את ניחוש צרפת (France bet)" },
};

// ---------------------------------------------------------------------------
// End-of-tournament result. Fill in once official; champion bonus auto-applies.
// ---------------------------------------------------------------------------
export const BONUS = {
  correctWinner: null,    // e.g. "צרפת" – champion bonus = that team's ratio
  correctTopScorer: null, // e.g. "קיליאן אמבפה" – informational (goals already live)
};

// Placeholder / inactive accounts to hide from the table.
export const HIDE_PLAYERS = []; // e.g. ["חשבון אינטרנטי"]
