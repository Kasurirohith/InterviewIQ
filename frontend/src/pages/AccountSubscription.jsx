import { Link } from "react-router-dom";
import { subscriptionPlans } from "../services/subscriptions";
import "./Subscriptions.css";

const money = (value) => `₹${Number(value).toFixed(Number(value) % 1 ? 2 : 0)}`;

export default function AccountSubscription() {
  const email = localStorage.getItem("email") || "";
  const name = localStorage.getItem("username") || email.split("@")[0] || "User";
  const current = (() => {
    try { return JSON.parse(localStorage.getItem("subscription") || "null"); }
    catch { return null; }
  })();
  const plan = current ? Object.values(subscriptionPlans).find((item) => item.name === current.name) : null;

  return (
    <main className="subscription-page account-subscription-page">
      <p className="subscription-eyebrow">YOUR ACCOUNT</p>
      <h1>Subscription details</h1>
      <p className="subscription-lead">Your profile and selected preparation category.</p>
      <section className="account-subscription-card">
        <h2>Account information</h2>
        <dl className="account-subscription-grid">
          <div><dt>Name</dt><dd>{name}</dd></div>
          <div><dt>Email</dt><dd>{email || "Not available"}</dd></div>
          <div><dt>Subscription</dt><dd>{current?.name || "Free plan"}</dd></div>
          <div><dt>Category</dt><dd>{current?.category || "No paid category selected"}</dd></div>
          <div><dt>Status</dt><dd><span className={`subscription-status ${current?.status === "active" ? "is-active" : ""}`}>{current?.status || "free"}</span></dd></div>
          {current && <>
            <div><dt>Payment</dt><dd>{current.payment_status === "demo_paid" ? "Demo payment recorded · no charge" : current.payment_status}</dd></div>
            <div><dt>Method</dt><dd>{current.payment_method === "demo_upi" ? "UPI demo" : "Debit card demo"}</dd></div>
            <div><dt>Demo total</dt><dd>{money(current.amount)}</dd></div>
            <div><dt>Reference</dt><dd>{current.payment_reference}</dd></div>
            <div><dt>Access period</dt><dd>{current.duration}</dd></div>
          </>}
        </dl>
        <div className="account-subscription-actions">
          <Link className="subscription-primary link-button" to="/subscriptions">{current ? "Compare plans" : "View plans"}</Link>
          {plan && <p>Your {plan.name} includes {plan.features[0].toLowerCase()} and more.</p>}
        </div>
      </section>
    </main>
  );
}
