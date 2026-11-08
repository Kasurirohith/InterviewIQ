import { Link, useNavigate } from "react-router-dom";
import { subscriptionPlans } from "../services/subscriptions";
import "./Subscriptions.css";

const money = (value) => `₹${Number(value).toFixed(Number(value) % 1 ? 2 : 0)}`;

export default function Subscriptions() {
  const navigate = useNavigate();
  const loggedIn = Boolean(localStorage.getItem("email"));
  const upiEnabled = import.meta.env.VITE_UPI_PAYMENTS_ENABLED === "true";
  const testPlanEnabled = import.meta.env.VITE_UPI_TEST_PLAN_ENABLED === "true";

  return (
    <main className="subscription-page">
      <section className="subscription-hero">
        <p className="subscription-eyebrow">INTERVIEWIQ PLANS</p>
        <h1>Choose Your Preparation Plan</h1>
        <p>Choose a monthly demo plan or a one-year plan with manual UPI payment.</p>
        <div className="subscription-demo-notice" role="note">
          Annual plans use UPI transfer to hittu05@ybl and require manual verification. Monthly plans remain a demo.
        </div>
      </section>

      <section className="subscription-grid" aria-label="Available subscription plans">
        {Object.entries(subscriptionPlans).map(([code, plan], index) => (
          <article className={`subscription-card ${index === 1 ? "subscription-card-featured" : ""}`} key={code}>
            <div className="subscription-card-top">
              <span className="subscription-category">{plan.category}</span>
              <span className="subscription-discount">{plan.duration}</span>
            </div>
            <h2>{plan.name}</h2>
            <p className="subscription-summary">
              {plan.testOnly
                ? "Use a small one-time payment to test the premium plan and manual approval flow."
                : code === "starter"
                ? "Build interview confidence with focused interview and resume preparation."
                : "Prepare across interviews, resumes, and coding practice in one plan."}
            </p>
            <div className="subscription-price">
              {plan.paymentType !== "upi_manual" && <del>{money(plan.listPrice)}</del>}
              <strong>{money(plan.amount)}</strong>
              <span>/ {plan.duration}</span>
            </div>
            <p className="subscription-price-note">{plan.testOnly ? "TEST PLAN · ₹1 ONE-TIME PAYMENT FOR 30 DAYS" : plan.paymentType === "upi_manual" ? (upiEnabled ? "One-time UPI payment · manual verification" : "Checkout will open after persistent payment storage is configured") : `Demo price after ${plan.discountPercent}% discount`}</p>
            <h3>What Is Included</h3>
            <ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
            <button
              type="button"
              className="subscription-primary"
              disabled={(plan.paymentType === "upi_manual" && !upiEnabled) || (plan.testOnly && !testPlanEnabled)}
              onClick={() => navigate(loggedIn ? `/subscription/checkout/${code}` : "/login")}
            >
              {(plan.paymentType === "upi_manual" && !upiEnabled) || (plan.testOnly && !testPlanEnabled) ? "Payment Setup Needed" : loggedIn ? (plan.paymentType === "upi_manual" ? (plan.testOnly ? "Test Premium For ₹1" : "Continue with UPI") : "Choose this plan") : "Log in to choose"}
            </button>
          </article>
        ))}
      </section>

      <section className="subscription-help">
        <h2>Already Have a Plan?</h2>
        <p>Open your account to see the selected plan, category, payment reference, and activation status.</p>
        <Link to="/account/subscription">View my subscription</Link>
      </section>
    </main>
  );
}
