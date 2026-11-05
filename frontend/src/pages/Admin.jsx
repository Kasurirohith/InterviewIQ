import { useState } from "react";
import { activateSubscription, loadAdminSubscriptions } from "../services/subscriptions";
import "./Subscriptions.css";

const money = (value) => `₹${Number(value).toFixed(Number(value) % 1 ? 2 : 0)}`;

export default function Admin() {
  const [password, setPassword] = useState("");
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const refresh = async (key = password) => {
    setBusy(true);
    setError("");
    try {
      const result = await loadAdminSubscriptions(key);
      setRecords(result.subscriptions || []);
      setPassword(key);
      setLoaded(true);
    } catch (requestError) {
      setError(requestError.message || "Admin access failed.");
      setLoaded(false);
    } finally {
      setBusy(false);
    }
  };

  const activate = async (record) => {
    setBusy(true);
    setError("");
    try {
      await activateSubscription(record.id, password);
      await refresh(password);
    } catch (requestError) {
      setError(requestError.message || "Could not activate this subscription.");
      setBusy(false);
    }
  };

  return (
    <main className="subscription-page admin-page">
      <p className="subscription-eyebrow">INTERVIEWIQ ADMIN</p>
      <h1>Demo subscriptions</h1>
      <p className="subscription-lead">Review simulated card and UPI checkouts. These records do not represent real payments.</p>
      {!loaded && <form className="admin-login" onSubmit={(event) => { event.preventDefault(); refresh(); }}>
        <label htmlFor="admin-password">Admin password</label>
        <input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
        <button className="subscription-primary" type="submit" disabled={busy}>{busy ? "Checking…" : "Open admin page"}</button>
      </form>}
      {error && <p className="subscription-error" role="alert">{error}</p>}
      {loaded && <>
        <div className="admin-toolbar"><p>{records.length} subscription record{records.length === 1 ? "" : "s"}</p><button className="subscription-secondary" type="button" onClick={() => refresh()} disabled={busy}>Refresh</button></div>
        {records.length === 0 ? <section className="admin-empty">No demo subscriptions have been submitted yet.</section> : (
          <div className="admin-record-list">
            {records.map((record) => <article className="admin-record" key={record.id}>
              <div className="admin-record-heading"><div><p className="subscription-eyebrow">{record.payment_status === "demo_paid" ? "SIMULATED PAYMENT" : record.payment_status}</p><h2>{record.name}</h2></div><span className={`subscription-status ${record.status === "active" ? "is-active" : ""}`}>{record.status}</span></div>
              <dl className="admin-record-grid">
                <div><dt>Email</dt><dd>{record.email}</dd></div>
                <div><dt>Plan</dt><dd>{record.plan_name}</dd></div>
                <div><dt>Category</dt><dd>{record.category}</dd></div>
                <div><dt>Demo amount</dt><dd>{money(record.demo_amount)} · {record.discount_percent}% off</dd></div>
                <div><dt>Method</dt><dd>{record.payment_method === "demo_upi" ? "UPI demo" : "Debit card demo"}</dd></div>
                <div><dt>Reference</dt><dd>{record.payment_reference}</dd></div>
                <div><dt>Submitted</dt><dd>{record.created_at}</dd></div>
              </dl>
              {record.status !== "active" && <button className="subscription-primary" type="button" disabled={busy} onClick={() => activate(record)}>Activate subscription</button>}
            </article>)}
          </div>
        )}
      </>}
      <p className="admin-footnote">Admin credentials are checked by the backend and are not embedded in the website.</p>
    </main>
  );
}
