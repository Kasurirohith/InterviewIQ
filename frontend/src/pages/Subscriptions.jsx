import { Link, useNavigate } from "react-router-dom";
import { subscriptionPlans } from "../services/subscriptions";
import "./Subscriptions.css";

const money = (value) => `₹${Number(value).toFixed(Number(value) % 1 ? 2 : 0)}`;

export default function Subscriptions() {
  const navigate = useNavigate();
  const loggedIn = Boolean(localStorage.getItem("email"));

  return (
    <main className="subscription-page">
      <section className="subscription-hero">
        <p className="subscription-eyebrow">INTERVIEWIQ PLANS</p>
        <h1>Choose Your Preparation Plan</h1>
        <p>Clear features, one simple demo payment, and a plan that matches your goals.</p>
        <div className="subscription-demo-notice" role="note">
          College project demo: card and UPI options are simulated. No real payment is taken.
        </div>
      </section>

      <section className="subscription-grid" aria-label="Available subscription plans">
        {Object.entries(subscriptionPlans).map(([code, plan], index) => (
          <article className={`subscription-card ${index === 1 ? "subscription-card-featured" : ""}`} key={code}>
            <div className="subscription-card-top">
              <span className="subscription-category">{plan.category}</span>
              <span className="subscription-discount">{plan.discountPercent}% off</span>
            </div>
            <h2>{plan.name}</h2>
            <p className="subscription-summary">
              {code === "starter"
                ? "Build interview confidence with focused interview and resume preparation."
                : "Prepare across interviews, resumes, and coding practice in one plan."}
            </p>
            <div className="subscription-price">
              <del>{money(plan.listPrice)}</del>
              <strong>{money(plan.amount)}</strong>
              <span>/ {plan.duration}</span>
            </div>
            <p className="subscription-price-note">Demo price after {plan.discountPercent}% discount</p>
            <h3>What Is Included</h3>
            <ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
            <button
              type="button"
              className="subscription-primary"
              onClick={() => navigate(loggedIn ? `/subscription/checkout/${code}` : "/login")}
            >
              {loggedIn ? "Choose this plan" : "Log in to choose"}
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
