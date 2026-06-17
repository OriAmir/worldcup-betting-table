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
const goalsHe = (g) => `${g} ${g === 1 ? "שער" : "שערים"}`;

// Shared scorer-points badge, identical in the main and bonus tables.
// Source is conveyed by color (see legend); text stays compact for mobile.
function ScorerBadge({ row }) {
  if (row.topScorerFromDominos) {
    return (
      <span className="scorer-badge src-365" title="נמשך מ-365, מתווסף אוטומטית">
        {" "}
        +{num(row.liveScorerPoints)} · {goalsHe(row.liveScorerGoals)}
      </span>
    );
  }
  if (row.scorerGoalPoints > 0) {
    const g = Math.round(row.scorerGoalPoints / 2);
    return (
      <span className="scorer-badge src-5h" title="5 חבר'ה, מתווסף אוטומטית (כלול)">
        {" "}
        +{num(row.scorerGoalPoints)} · {goalsHe(g)}
      </span>
    );
  }
  return null;
}

export default function App() {
  const { data, error, loading, reload } = useStandings();

  return (
    <div className="page">
      <header className="hero">
        <h1>🏆 טבלת הניחושים – מונדיאל 2026</h1>
        <p className="sub">
          <b>סה"כ = 365 (עד צרפת–סנגל) + 5 חבר'ה (מצרפת–סנגל והלאה) + התאמות.</b>{" "}
          עמודת <b>365</b> היא צילום קבוע עד משחק צרפת–סנגל; עמודת{" "}
          <b>5 חבר'ה</b> מתעדכנת אוטומטית בזמן אמת. ניחושי אלופה/מלך שערים של מי
          שלא בחר ב־5 חבר'ה נלקחים מ־365 (פירוט בטבלת הבונוס למטה).
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
  const [openName, setOpenName] = useState(null);
  const colSpan = 8;
  return (
    <section className="card">
      <h2>טבלה כללית — {meta.groupName}</h2>
      <p className="legend hint">לחצו על שחקן לפירוט מלא של הניקוד 👆</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th className="total">סה"כ</th>
              <th>שחקן</th>
              <th className="src365">365<br /><small>עד צרפת–סנגל</small></th>
              <th className="src5">5 חבר'ה<br /><small>מצרפת–סנגל</small></th>
              <th>התאמה</th>
              <th>אלופה</th>
              <th>מלך שערים</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <React.Fragment key={r.name}>
                <tr
                  className={"clickable" + (openName === r.name ? " open" : "")}
                  onClick={() =>
                    setOpenName(openName === r.name ? null : r.name)
                  }
                >
                  <td className="rank">{medal(r.rank)}</td>
                  <td className="total">{num(r.total)}</td>
                  <td className="name">
                    <span className="caret">{openName === r.name ? "▾" : "▸"}</span>{" "}
                    {r.name}
                  </td>
                  <td className="src365">{num(r.dominosPoints)}</td>
                  <td className="src5" title={`חי ${num(r.sport5Total)} − לפני צרפת–סנגל ${num(r.preFrance)}`}>
                    {num(r.sport5Points)}
                  </td>
                  <td className={r.adjustPoints ? "adj" : ""}>
                    {r.adjustPoints ? `+${num(r.adjustPoints)}` : "—"}
                    {r.adjustReason && (
                      <span className="tip" title={r.adjustReason}>ⓘ</span>
                    )}
                  </td>
                  <td className={r.winnerFromDominos ? "src-365" : "src-5h"}>
                    {r.winnerName || "—"}
                    {r.championRatio != null && (
                      <span className="ratio"> ({r.championRatio})</span>
                    )}
                    {r.winnerCorrect && " ✅"}
                  </td>
                  <td>
                    {r.topScorerName || "—"}
                    <ScorerBadge row={r} />
                    {r.topScorerCorrect && " ✅"}
                  </td>
                </tr>
                {openName === r.name && (
                  <tr className="detail-row">
                    <td colSpan={colSpan}>
                      <Breakdown row={r} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <p className="legend">
        המספר בסוגריים ליד האלופה = ניקוד הבונוס (יחס הקבוצה ב־5 חבר'ה) שיתווסף
        אוטומטית לסה"כ כשתיוודע האלופה.
        <br />
        <span className="src-5h">● 5 חבר'ה</span> = הניחוש נבחר ב־5 חבר'ה ·{" "}
        <span className="src-365">● 365</span> = הושלם מ־365 (מי שלא בחר ב־5
        חבר'ה).
      </p>
    </section>
  );
}

function Breakdown({ row: r }) {
  return (
    <div className="breakdown">
      <div className="bd-title">פירוט הניקוד של {r.name}</div>

      <div className="bd-section">
        <div className="bd-line src-365">
          <span>365 (דומינוס) — עד צרפת–סנגל</span>
          <b>{num(r.dominosPoints)}</b>
        </div>
        <div className="bd-note">בסיס קבוע מהטבלה של דומינוס (ללא פירוט משחקים).</div>
      </div>

      <div className="bd-section">
        <div className="bd-line src-5h">
          <span>5 חבר'ה — מצרפת–סנגל והלאה</span>
          <b>{num(r.sport5Points)}</b>
        </div>
        {r.gameBreakdown && r.gameBreakdown.length > 0 ? (
          <table className="bd-games">
            <tbody>
              {r.gameBreakdown.map((g, i) => (
                <tr key={i}>
                  <td>{g.label}</td>
                  <td className="bd-result">{g.result}</td>
                  <td className="bd-guess">{g.guess ? `ניחוש ${g.guess}` : "ללא ניחוש"}</td>
                  <td className={"bd-pts " + (g.score > 0 ? "pos" : "zero")}>
                    {g.score > 0 ? `+${num(g.score)}` : "0"}
                  </td>
                </tr>
              ))}
              <tr className="bd-sub">
                <td colSpan={3}>סה"כ ניחושי משחקים</td>
                <td className="bd-pts">+{num(r.gamesPointsSum)}</td>
              </tr>
              {r.scorerGoalPoints > 0 && (
                <tr className="bd-sub">
                  <td colSpan={3}>
                    מלך שערים ({r.topScorerName}) — {goalsHe(Math.round(r.scorerGoalPoints / 2))}
                  </td>
                  <td className="bd-pts">+{num(r.scorerGoalPoints)}</td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div className="bd-note">אין עדיין נקודות 5 חבר'ה מצרפת–סנגל.</div>
        )}
      </div>

      {r.topScorerFromDominos && r.liveScorerPoints > 0 && (
        <div className="bd-section">
          <div className="bd-line src-365">
            <span>מלך שערים מ-365 ({r.topScorerName}) — {goalsHe(r.liveScorerGoals)}</span>
            <b>+{num(r.liveScorerPoints)}</b>
          </div>
          <div className="bd-note">נמשך חי מ-365 כי לא נבחר ב-5 חבר'ה.</div>
        </div>
      )}

      {r.adjustPoints > 0 && (
        <div className="bd-section">
          <div className="bd-line adj">
            <span>התאמה ידנית{r.adjustReason ? ` — ${r.adjustReason}` : ""}</span>
            <b>+{num(r.adjustPoints)}</b>
          </div>
        </div>
      )}

      {r.championBonus > 0 && (
        <div className="bd-section">
          <div className="bd-line src-5h">
            <span>בונוס אלופה ({r.winnerName})</span>
            <b>+{num(r.championBonus)}</b>
          </div>
        </div>
      )}

      <div className="bd-line bd-total">
        <span>סה"כ</span>
        <b>{num(r.total)}</b>
      </div>
    </div>
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
          לכל גול): למי שבחר ב־5 חבר'ה נספרות חי בעמודת 5 חבר'ה; למי שלא בחר ב־5
          חבר'ה — נמשכות חי מ־365 ומופיעות בעמודת "שערים חי (365)".
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
              <th>נק' שערים</th>
              <th>מקור שערים</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className={r.needsManualAdd ? "needs-add" : ""}>
                <td className="name">{r.name}</td>
                <td className={r.winnerFromDominos ? "src-365" : "src-5h"}>
                  {r.winnerName || "—"}
                  {r.winnerCorrect && " ✅"}
                </td>
                <td className="ratio">
                  {r.championRatio != null ? `+${r.championRatio}` : "—"}
                </td>
                <td className={r.topScorerFromDominos ? "src-365" : "src-5h"}>
                  {r.topScorerName || "—"}
                  {r.topScorerCorrect && " ✅"}
                </td>
                <td className="ratio">
                  {r.topScorerFromDominos
                    ? `${goalsHe(r.liveScorerGoals)} = +${num(
                        r.liveScorerPoints
                      )}`
                    : `${goalsHe(Math.round(r.scorerGoalPoints / 2))} = +${num(
                        r.scorerGoalPoints
                      )}`}
                </td>
                <td>
                  {r.topScorerFromDominos
                    ? "365 (מתווסף אוטומטית)"
                    : "5 חבר'ה (מתווסף אוטומטית, כלול)"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
