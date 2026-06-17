import React, { useEffect, useState, useCallback } from "react";

const REFRESH_MS = 30000; // auto-refresh every 30s – no manual touch needed

function useStandings() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/standings", { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
      setError(null);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  return { data, error, loading, reload: load };
}

const num = (n) => (Number.isInteger(n) ? n : n.toFixed(1));
const medal = (r) => (r === 1 ? "🥇" : r === 2 ? "🥈" : r === 3 ? "🥉" : r);

export default function App() {
  const { data, error, loading, reload } = useStandings();

  return (
    <div className="page">
      <header className="hero">
        <h1>🏆 טבלת הניחושים – מונדיאל 2026</h1>
        <p className="sub">
          <b>סה"כ = 365 (עד צרפת–סנגל) + 5 חבר'ה (מצרפת–סנגל והלאה) + התאמות.</b>{" "}
          עמודת <b>365</b> היא צילום קבוע עד משחק צרפת–סנגל; עמודת{" "}
          <b>5 חבר'ה</b> מתעדכנת אוטומטית בזמן אמת. ניחוש אלופה/מלך שערים שחסר
          ב־5 חבר'ה מושלם מ־365 ומסומן ב־<span className="star">*</span>.
        </p>
        {data && (
          <div className="updated">
            עודכן: {new Date(data.fetchedAt).toLocaleTimeString("he-IL")}{" "}
            <button onClick={reload}>רענן עכשיו</button>
          </div>
        )}
      </header>

      {loading && !data && <div className="state">טוען נתונים…</div>}
      {error && <div className="state error">שגיאה בטעינה: {error}</div>}

      {data && <MainTable rows={data.rows} meta={data.meta} />}
      {data && <BonusTable rows={data.rows} meta={data.meta} />}

      <footer className="foot">
        מסונכרן בזמן אמת · מקור חי: 5 חבר'ה · בסיס קבוע: דומינוס 365 (עד צרפת–סנגל)
      </footer>
    </div>
  );
}

function MainTable({ rows, meta }) {
  return (
    <section className="card">
      <h2>טבלה כללית — {meta.groupName}</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>שחקן</th>
              <th className="src365">365<br /><small>עד צרפת–סנגל</small></th>
              <th className="src5">5 חבר'ה<br /><small>מצרפת–סנגל</small></th>
              <th>התאמה</th>
              <th>סה"כ</th>
              <th>אלופה</th>
              <th>מלך שערים</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className={r.needsManualAdd ? "needs-add" : ""}>
                <td className="rank">{medal(r.rank)}</td>
                <td className="name">{r.name}</td>
                <td className="src365">{num(r.dominosPoints)}</td>
                <td className="src5">{num(r.sport5Points)}</td>
                <td className={r.adjustPoints ? "adj" : ""}>
                  {r.adjustPoints ? `+${num(r.adjustPoints)}` : "—"}
                  {r.adjustReason && (
                    <span className="tip" title={r.adjustReason}>ⓘ</span>
                  )}
                </td>
                <td className="total">{num(r.total)}</td>
                <td>
                  {r.winnerName || "—"}
                  {r.championRatio != null && (
                    <span className="ratio"> ({r.championRatio})</span>
                  )}
                  {r.winnerFromDominos && (
                    <span className="star" title="הושלם מ-365 – חסר ב-5 חבר'ה">*</span>
                  )}
                  {r.winnerCorrect && " ✅"}
                </td>
                <td>
                  {r.topScorerName || "—"}
                  {r.topScorerFromDominos && (
                    <span className="star" title="הושלם מ-365 – חסר ב-5 חבר'ה">*</span>
                  )}
                  {r.topScorerCorrect && " ✅"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="legend">
        <span className="star">*</span> = הניחוש נלקח מ־365 (חסר ב־5 חבר'ה) —
        שורות מודגשות צריכות השלמה ידנית בסוף הטורניר. המספר בסוגריים ליד האלופה
        = ניקוד הבונוס (יחס הקבוצה ב־5 חבר'ה) שיתווסף אם תזכה.
      </p>
    </section>
  );
}

function BonusTable({ rows, meta }) {
  return (
    <section className="card">
      <h2>בונוס אלופה ומלך שערים</h2>
      {meta.bonusActive ? (
        <p className="legend">
          תוצאות רשמיות: אלופה = <b>{meta.correctWinner || "—"}</b> · מלך שערים ={" "}
          <b>{meta.correctTopScorer || "—"}</b>
        </p>
      ) : (
        <p className="legend">
          בונוס אלופה = יחס הקבוצה ב־5 חבר'ה (למשל צרפת 30, ברזיל 50, נורווגיה
          120) ויתווסף לסה"כ כשתיוודע האלופה. נקודות מלך השערים ({meta.scorerPointsPerGoal}{" "}
          לכל גול) כבר נספרות חי בעמודת 5 חבר'ה.
        </p>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>שחקן</th>
              <th>אלופה</th>
              <th>בונוס אלופה</th>
              <th>מלך שערים</th>
              <th>נק' שערים (חי)</th>
              <th>מקור ניחוש</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className={r.needsManualAdd ? "needs-add" : ""}>
                <td className="name">{r.name}</td>
                <td>
                  {r.winnerName || "—"}
                  {r.winnerCorrect && " ✅"}
                </td>
                <td className="ratio">
                  {r.championRatio != null ? `+${r.championRatio}` : "—"}
                </td>
                <td>
                  {r.topScorerName || "—"}
                  {r.topScorerCorrect && " ✅"}
                </td>
                <td>{r.scorerGoalPoints ? num(r.scorerGoalPoints) : "—"}</td>
                <td>
                  {r.winnerFromDominos || r.topScorerFromDominos
                    ? "365 *"
                    : "5 חבר'ה"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
