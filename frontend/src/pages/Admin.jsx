import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  activateSubscription,
  loadAdminSubscriptions,
  rejectSubscription,
  revokeSubscription,
} from "../services/subscriptions";
import "./Subscriptions.css";

const ADMIN_SESSION_KEY = "interviewiqAdminPassword";
const money = (value) => `₹${Number(value).toFixed(Number(value) % 1 ? 2 : 0)}`;

export default function Admin() {
  const navigate = useNavigate();
  const [password] = useState(() => sessionStorage.getItem(ADMIN_SESSION_KEY) || "");
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const refresh = async () => {
    setBusy(true);
    setError("");
    try {
      const result = await loadAdminSubscriptions(password);
      setRecords(result.subscriptions || []);
    } catch (requestError) {
      setError(requestError.message || "Could not load subscription records.");
      if (requestError.message?.includes("Invalid admin password")) {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        navigate("/login", { replace: true });
      }
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!password) {
      navigate("/login", { replace: true });
      return;
    }
    refresh();
  }, [password]);

  const runAction = async (record, action) => {
    setBusy(true);
    setError("");
    try {
      if (action === "approve") await activateSubscription(record.id, password);
      if (action === "reject") await rejectSubscription(record.id, password);
      if (action === "revoke") await revokeSubscription(record.id, password);
      await refresh();
    } catch (requestError) {
      setError(requestError.message || "Could not update this subscription.");
      setBusy(false);
    }
  };

  const pendingCount = records.filter((record) => record.status === "pending").length;
  const activeCount = records.filter((record) => record.status === "active").length;
  const rejectedCount = records.filter((record) => record.status === "rejected" || record.status === "revoked").length;
  const visibleRecords = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return records.filter((record) => {
      const matchesStatus = statusFilter === "all" || record.status === statusFilter;
      const matchesSearch = !needle || [record.name, record.email, record.plan_name, record.category, record.payment_reference]
        .some((value) => String(value || "").toLowerCase().includes(needle));
      return matchesStatus && matchesSearch;
    });
  }, [records, search, statusFilter]);

  const logout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    navigate("/login", { replace: true });
  };

  if (!password) return null;

  return (
    <main className="subscription-page admin-page">
      <header className="admin-header">
        <div>
          <p className="subscription-eyebrow">INTERVIEWIQ ADMIN CONSOLE</p>
          <h1>Subscription management</h1>
          <p className="subscription-lead">Review demo payment submissions, approve plan access, or reject and revoke requests.</p>
        </div>
        <div className="admin-header-actions">
          <button className="subscription-secondary" type="button" onClick={refresh} disabled={busy}>Refresh records</button>
          <button className="subscription-secondary" type="button" onClick={logout}>Sign out</button>
        </div>
      </header>

      <p className="subscription-demo-notice">Demo only: card and UPI choices are simulated. These records are not real payments, and no banking details are collected.</p>

      <section className="admin-summary" aria-label="Subscription overview">
        <article><span>All submissions</span><strong>{records.length}</strong></article>
        <article><span>Waiting for approval</span><strong>{pendingCount}</strong></article>
        <article><span>Active plans</span><strong>{activeCount}</strong></article>
        <article><span>Rejected or revoked</span><strong>{rejectedCount}</strong></article>
      </section>

      {error && <p className="subscription-error" role="alert">{error}</p>}

      <section className="admin-controls" aria-label="Filter subscription records">
        <label>
          <span>Find a user or reference</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, email, plan or reference" />
        </label>
        <label>
          <span>Subscription status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="pending">Waiting for approval</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
            <option value="revoked">Revoked</option>
          </select>
        </label>
      </section>

      <div className="admin-toolbar"><p>{visibleRecords.length} record{visibleRecords.length === 1 ? "" : "s"} shown</p></div>
      {visibleRecords.length === 0 ? (
        <section className="admin-empty">{records.length ? "No records match these filters." : "No demo subscription requests have been submitted yet."}</section>
      ) : (
        <div className="admin-record-list">
          {visibleRecords.map((record) => (
            <article className="admin-record" key={record.id}>
              <div className="admin-record-heading">
                <div>
                  <p className="subscription-eyebrow">{record.payment_status === "demo_paid" ? "SIMULATED PAYMENT SUBMITTED" : record.payment_status}</p>
                  <h2>{record.name}</h2>
                  <p className="admin-record-email">{record.email}</p>
                </div>
                <span className={`subscription-status status-${record.status}`}>{record.status === "pending" ? "Waiting for approval" : record.status}</span>
              </div>
              <dl className="admin-record-grid">
                <div><dt>Subscription plan</dt><dd>{record.plan_name}</dd></div>
                <div><dt>Preparation category</dt><dd>{record.category}</dd></div>
                <div><dt>Demo amount</dt><dd>{money(record.demo_amount)} · {record.discount_percent}% discount from {money(record.list_price)}</dd></div>
                <div><dt>Demo method</dt><dd>{record.payment_method === "demo_upi" ? "UPI simulation" : "Debit card simulation"}</dd></div>
                <div><dt>Demo reference</dt><dd>{record.payment_reference}</dd></div>
                <div><dt>Request date</dt><dd>{record.created_at}</dd></div>
              </dl>
              {record.status === "pending" && <div className="admin-record-actions">
                <button className="subscription-primary" type="button" disabled={busy} onClick={() => runAction(record, "approve")}>Approve and activate</button>
                <button className="subscription-secondary" type="button" disabled={busy} onClick={() => runAction(record, "reject")}>Reject request</button>
              </div>}
              {record.status === "active" && <div className="admin-record-actions">
                <button className="subscription-secondary" type="button" disabled={busy} onClick={() => runAction(record, "revoke")}>Revoke plan access</button>
              </div>}
            </article>
          ))}
        </div>
      )}
      <p className="admin-footnote">Admin access is managed privately by the project owner. This page has no public admin sign-up.</p>
    </main>
  );
}
