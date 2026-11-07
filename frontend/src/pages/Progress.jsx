import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Progress.css";

const API_URL = import.meta.env.VITE_API_URL || "https://interviewiq-api-3ww1.onrender.com";

const focusAdvice = {
  Clarity: "Organize each answer into a clear opening, key points, and a short conclusion.",
  Relevance: "Answer the exact question first, then support it with a specific example.",
  Communication: "Practise concise answers aloud and explain technical terms simply.",
  Technical: "Review the concepts behind your answers, then try a fresh company question.",
  Behavioral: "Use the STAR structure: situation, task, action, and result.",
};

export default function Progress() {
  const email = localStorage.getItem("email") || "";
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(Boolean(email));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email) return undefined;
    let active = true;
    fetch(`${API_URL}/dashboard/${encodeURIComponent(email)}`)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.detail || "Progress could not be loaded.");
        return data;
      })
      .then((data) => { if (active) setDashboard(data); })
      .catch((err) => { if (active) setError(err.message || "Progress could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [email]);

  const recent = dashboard?.recent_results || [];
  const trend = useMemo(() => [...recent].reverse(), [recent]);
  const points = useMemo(() => trend.map((item, index) => {
    const x = trend.length < 2 ? 250 : 28 + (index / (trend.length - 1)) * 444;
    const y = 156 - (Math.max(0, Math.min(100, Number(item.interview_score) || 0)) / 100) * 132;
    return `${x},${y}`;
  }).join(" "), [trend]);
  const latest = recent[0];
  const focus = dashboard?.focus_area || "Build interview consistency";
  const advice = focusAdvice[focus] || (focus.toLowerCase().includes("clarity") ? focusAdvice.Clarity : focus.toLowerCase().includes("relevance") ? focusAdvice.Relevance : `Practise more ${focus.toLowerCase()} questions and review the feedback after each answer.`);

  if (!email) return <main className="progress-page"><section className="progress-empty"><span className="progress-eyebrow">YOUR PREPARATION</span><h1>Track Your Progress</h1><p>Sign in to save interview scores and get practice suggestions based on your results.</p><Link className="progress-button" to="/login">Sign in</Link></section></main>;

  return <main className="progress-page">
    <header className="progress-header"><div><span className="progress-eyebrow">YOUR PREPARATION</span><h1>Progress Dashboard</h1><p>See how your interview practice is improving and what to work on next.</p></div><Link className="progress-back-link" to="/">Back to home</Link></header>
    {loading && <p className="progress-state">Loading your interview history…</p>}
    {error && <p className="progress-error" role="alert">{error}</p>}
    {!loading && !error && dashboard && <>
      <section className="progress-stat-grid" aria-label="Interview summary">
        <article><span>Mock Interviews</span><strong>{dashboard.total_interviews || 0}</strong></article>
        <article><span>Average Score</span><strong>{dashboard.average_score || 0}<small>/100</small></strong></article>
        <article><span>Best Score</span><strong>{dashboard.best_score || 0}<small>/100</small></strong></article>
        <article><span>Latest Resume Match</span><strong>{latest?.ats_score ?? (Number(localStorage.getItem("atsScore")) || 0)}<small>/100</small></strong></article>
      </section>

      <div className="progress-content-grid">
        <section className="progress-panel progress-trend-panel">
          <div className="progress-panel-heading"><div><span className="progress-eyebrow">SCORE HISTORY</span><h2>Interview Score Trend</h2></div><span>{recent.length} recent</span></div>
          {trend.length ? <>
            <svg className="progress-chart" viewBox="0 0 500 180" role="img" aria-label={`Interview scores over the last ${trend.length} sessions`}>
              {[24, 57, 90, 123, 156].map((y) => <g key={y}><line x1="28" x2="472" y1={y} y2={y} /><text x="0" y={y + 4}>{Math.round((156 - y) / 132 * 100)}</text></g>)}
              {trend.length > 1 && <polyline points={points} />}
              {points.split(" ").map((point, index) => { const [cx, cy] = point.split(","); return <circle key={index} cx={cx} cy={cy} r="5" />; })}
            </svg>
            <div className="progress-chart-labels"><span>{trend[0]?.created_at || "First session"}</span><span>{trend[trend.length - 1]?.created_at || "Latest session"}</span></div>
          </> : <p className="progress-muted">Complete a mock interview to start your score trend.</p>}
        </section>
        <section className="progress-panel progress-focus-panel">
          <span className="progress-eyebrow">PERSONALIZED PRACTICE PLAN</span><h2>Focus Next: {focus}</h2>
          <p>{advice}</p>
          {latest?.company && <p className="progress-last-session">Last practiced: <strong>{latest.company}{latest.track ? ` · ${latest.track}` : ""}</strong></p>}
          <Link className="progress-button" to={latest?.company ? `/company/${encodeURIComponent(latest.company)}` : "/product-companies"}>Continue practice <span aria-hidden="true">→</span></Link>
        </section>
      </div>

      {dashboard.focus_scores?.length > 0 && <section className="progress-panel progress-dimensions"><span className="progress-eyebrow">FEEDBACK BREAKDOWN</span><h2>Answer Skills</h2><div className="progress-dimension-grid">{dashboard.focus_scores.map((item) => <div key={item.name}><div><span>{item.name}</span><strong>{item.score}% · {item.score >= 75 ? "Strong" : "Practice"}</strong></div><div className="progress-bar"><i style={{ width: `${item.score}%` }} /></div></div>)}</div></section>}

      <section className="progress-panel progress-history"><div className="progress-panel-heading"><div><span className="progress-eyebrow">RECENT SESSIONS</span><h2>Interview History</h2></div></div>
        {recent.length ? <div className="progress-history-list">{recent.map((item, index) => <article key={`${item.created_at}-${index}`}><div><strong>{item.company || "General Interview"}</strong><span>{item.track || "Practice session"} · {item.created_at}</span></div><b>{item.interview_score}<small>/100</small></b></article>)}</div> : <p className="progress-muted">Your completed mock interviews will appear here.</p>}
      </section>
    </>}
  </main>;
}

