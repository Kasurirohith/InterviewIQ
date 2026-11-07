import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { loadAdminOverview } from "../services/subscriptions";

export default function AdminOverview() {
  const { password } = useOutletContext();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAdminOverview(password).then(setSummary).catch((e) => setError(e.message));
  }, [password]);

  return <main className="subscription-page admin-page">
    <header className="admin-header"><div><p className="subscription-eyebrow">INTERVIEWIQ ADMIN CONSOLE</p><h1>Overview</h1><p className="subscription-lead">A quick view of your members and plan activity.</p></div></header>
    {error && <p className="subscription-error" role="alert">{error}</p>}
    <section className="admin-summary admin-summary-three" aria-label="Platform overview">
      <article><span>Total Users</span><strong>{summary?.users ?? "—"}</strong></article>
      <article><span>Total Subscriptions</span><strong>{summary?.subscriptions ?? "—"}</strong></article>
      <article><span>Active Plans</span><strong>{summary?.active_subscriptions ?? "—"}</strong></article>
    </section>
    <section className="admin-overview-note"><h2>Plan Requests</h2><p>{summary?.pending_subscriptions ?? "—"} request(s) are waiting for your review.</p></section>
  </main>;
}
