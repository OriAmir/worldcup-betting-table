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

function medal(rank) {
  return rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank;
}

export default function App() {
  const { data, error, loading, reload } = useStandings();

  return (
    <div className="page">
      <header className="hero">
        <h1>🏆 טבלת הניחושים – מונדיאל 2026</h1>
        <p className="sub">
          הטבלה הראשית מסונכרנת אוטומטית מ־<b>5 חבר'ה</b>. ניצחון/מלך שערים
          מסומנים ב־<span className="star">*</span> הושלמו מ־<b>דומינוס 365</b>{" "}
          ויתווספו בסוף הטורניר.
        </p>
        {data && (
          <div className="updated">
            עודכן: {new Date(data.fetchedAt).toLocaleTimeString("he-IL")}{" "}
            <button onClick={reload}>רענן עכשיו</button>
          </div>
        )}
      </header>

      {loading && !data && <div className="state">טוען נתונים…</div>}
      {error && (
        <div className="state error">שגיאה בטעינה: {error}</div>
      )}

      {data && <MainTable rows={data.rows} meta={data.meta} />}
      {data && <BonusTable rows={data.rows} meta={data.meta} />}

      <footer className="foot">
        מסונכרן בזמן אמת · מקור ראשי: 5 חבר'ה · השלמות: דומינוס 365
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
              <th>ניחושים</th>
              <th>התאמה</th>
              {meta.bonusActive && <th>בונוס</th>}
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
                <td>{r.guessPoints}</td>
                <td className={r.adjustPoints ? "adj" : ""}>
                  {r.adjustPoints ? `+${r.adjustPoints}` : "—"}
                  {r.adjustReason && (
                    <span className="tip" title={r.adjustReason}>
                      ⓘ
                    </span>
                  )}
                </td>
                {meta.bonusActive && (
                  <td>{r.bonusPoints ? `+${r.bonusPoints}` : "—"}</td>
                )}
                <td className="total">{r.total}</td>
                <td>
                  {r.winnerName || "—"}
                  {r.winnerFromDominos && (
                    <span className="star" title="הושלם מדומינוס – יתווסף בסוף">
                      *
                    </span>
                  )}
                  {r.winnerCorrect && " ✅"}
                </td>
                <td>
                  {r.topScorerName || "—"}
                  {r.topScorerFromDominos && (
                    <span className="star" title="הושלם מדומינוס – יתווסף בסוף">
                      *
                    </span>
                  )}
                  {r.topScorerCorrect && " ✅"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="legend">
        <span className="star">*</span> = הניחוש נלקח מדומינוס 365 (חסר ב־5
        חבר'ה) ויתווסף לחישוב בסוף הטורניר. שורות מסומנות צריכות השלמה ידנית.
      </p>
    </section>
  );
}

function BonusTable({ rows, meta }) {
  return (
    <section className="card">
      <h2>ניחושי אלופה ומלך שערים (בונוס סוף טורניר)</h2>
      {meta.bonusActive ? (
        <p className="legend">
          תוצאות רשמיות: אלופה = <b>{meta.correctWinner || "—"}</b> ·
          מלך שערים = <b>{meta.correctTopScorer || "—"}</b>
        </p>
      ) : (
        <p className="legend">
          הבונוס יחושב בסוף הטורניר ({meta.winnerPoints} נק' לאלופה,{" "}
          {meta.topScorerPoints} נק' למלך שערים).
        </p>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>שחקן</th>
              <th>אלופה</th>
              <th>מלך שערים</th>
              <th>מקור</th>
              <th>בונוס צפוי</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const src =
                r.winnerFromDominos || r.topScorerFromDominos
                  ? "דומינוס *"
                  : "5 חבר'ה";
              return (
                <tr key={r.name} className={r.needsManualAdd ? "needs-add" : ""}>
                  <td className="name">{r.name}</td>
                  <td>
                    {r.winnerName || "—"}
                    {r.winnerCorrect && " ✅"}
                  </td>
                  <td>
                    {r.topScorerName || "—"}
                    {r.topScorerCorrect && " ✅"}
                  </td>
                  <td>{src}</td>
                  <td>{r.bonusPoints ? `+${r.bonusPoints}` : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
