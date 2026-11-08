import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { activateSubscription, loadAdminSubscriptions, rejectSubscription, revokeSubscription } from "../services/subscriptions";

const money = (value) => `₹${Number(value).toFixed(Number(value) % 1 ? 2 : 0)}`;

export default function AdminSubscriptions() {
  const { password } = useOutletContext();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const refresh = useCallback(async () => {
    setBusy(true); setError("");
    try { const result = await loadAdminSubscriptions(password); setRecords(result.subscriptions || []); }
    catch (e) { setError(e.message || "Could not load subscription records."); if (e.message?.includes("Invalid admin password")) { sessionStorage.removeItem("interviewiqAdminPassword"); navigate("/admin/login", { replace: true }); } }
    finally { setBusy(false); }
  }, [navigate, password]);
  useEffect(() => { refresh(); }, [refresh]);
  const runAction = async (record, action) => {
    setBusy(true); setError("");
    try {
      if (action === "approve") await activateSubscription(record.id, password);
      if (action === "reject") await rejectSubscription(record.id, password);
      if (action === "revoke") await revokeSubscription(record.id, password);
      await refresh();
    } catch (e) { setError(e.message || "Could not update this subscription."); setBusy(false); }
  };
  const pendingCount = records.filter((r) => r.status === "pending").length;
  const activeCount = records.filter((r) => r.status === "active").length;
  const rejectedCount = records.filter((r) => r.status === "rejected" || r.status === "revoked").length;
  const visibleRecords = useMemo(() => records.filter((r) => (statusFilter === "all" || r.status === statusFilter) && (!search.trim() || [r.name, r.email, r.plan_name, r.category, r.payment_reference, r.transaction_id].some((v) => String(v || "").toLowerCase().includes(search.trim().toLowerCase())))), [records, search, statusFilter]);
  return <main className="subscription-page admin-page">
    <header className="admin-header"><div><p className="subscription-eyebrow">INTERVIEWIQ ADMIN CONSOLE</p><h1>Subscription Management</h1><p className="subscription-lead">Review plan requests and manually approve access, reject requests, or revoke active plans.</p></div><div className="admin-header-actions"><button className="subscription-secondary" type="button" onClick={refresh} disabled={busy}>Refresh Records</button></div></header>
    <p className="subscription-demo-notice">Monthly requests are simulations. For annual UPI requests, verify the UTR in your payment app or bank statement before activating access.</p>
    <section className="admin-summary" aria-label="Subscription overview"><article><span>All Submissions</span><strong>{records.length}</strong></article><article><span>Waiting for Approval</span><strong>{pendingCount}</strong></article><article><span>Active Plans</span><strong>{activeCount}</strong></article><article><span>Rejected or Revoked</span><strong>{rejectedCount}</strong></article></section>
    {error && <p className="subscription-error" role="alert">{error}</p>}
    <section className="admin-controls" aria-label="Filter subscription records"><label><span>Find a User or Reference</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, email, plan or reference" /></label><label><span>Subscription Status</span><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">All Statuses</option><option value="pending">Waiting for Approval</option><option value="active">Active</option><option value="rejected">Rejected</option><option value="revoked">Revoked</option></select></label></section>
    <div className="admin-toolbar"><p>{visibleRecords.length} record{visibleRecords.length === 1 ? "" : "s"} shown</p></div>
    {!visibleRecords.length ? <section className="admin-empty">{records.length ? "No records match these filters." : "No subscription requests have been submitted yet."}</section> : <div className="admin-record-list">{visibleRecords.map((record) => { const upi = record.payment_method === "upi_manual"; return <article className="admin-record" key={record.id}><div className="admin-record-heading"><div><p className="subscription-eyebrow">{upi ? "UPI PAYMENT AWAITING VERIFICATION" : "SIMULATED PAYMENT SUBMITTED"}</p><h2>{record.name}</h2><p className="admin-record-email">{record.email}</p></div><span className={`subscription-status status-${record.status}`}>{record.status === "pending" ? "Waiting for Approval" : record.status}</span></div><dl className="admin-record-grid"><div><dt>Subscription Plan</dt><dd>{record.plan_name}</dd></div><div><dt>Preparation Category</dt><dd>{record.category}</dd></div><div><dt>{upi ? "Amount" : "Demo Amount"}</dt><dd>{money(record.demo_amount)}{!upi && ` · ${record.discount_percent}% discount from ${money(record.list_price)}`}</dd></div><div><dt>Payment Method</dt><dd>{upi ? "UPI · Manual Review" : record.payment_method === "demo_upi" ? "UPI Simulation" : "Debit Card Simulation"}</dd></div>{record.transaction_id && <div><dt>UPI Transaction ID / UTR</dt><dd>{record.transaction_id}</dd></div>}<div><dt>Request Reference</dt><dd>{record.payment_reference}</dd></div><div><dt>Request Date</dt><dd>{record.created_at}</dd></div></dl>{record.status === "pending" && <div className="admin-record-actions"><button className="subscription-primary" type="button" disabled={busy} onClick={() => runAction(record, "approve")}>{upi ? "Verify Payment & Activate" : "Approve and Activate"}</button><button className="subscription-secondary" type="button" disabled={busy} onClick={() => runAction(record, "reject")}>Reject Request</button></div>}{record.status === "active" && <div className="admin-record-actions"><button className="subscription-secondary" type="button" disabled={busy} onClick={() => runAction(record, "revoke")}>Revoke Plan Access</button></div>}</article>; })}</div>}
    <p className="admin-footnote">Admin access is managed privately by the project owner. This page has no public admin sign-up.</p>
  </main>;
}
