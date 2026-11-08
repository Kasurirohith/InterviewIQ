import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getUpiQrUrl, subscriptionPlans, submitDemoPayment, submitManualUpiPayment } from "../services/subscriptions";
import "./Subscriptions.css";

const money = (value) => `₹${Number(value).toFixed(Number(value) % 1 ? 2 : 0)}`;

export default function DemoCheckout() {
  const { planCode } = useParams();
  const navigate = useNavigate();
  const plan = subscriptionPlans[planCode];
  const isManualUpi = plan?.paymentType === "upi_manual";
  const manualUpiEnabled = import.meta.env.VITE_UPI_PAYMENTS_ENABLED === "true";
  const [method, setMethod] = useState("demo_card");
  const [transactionId, setTransactionId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!plan) return <main className="subscription-page"><h1>Plan not found</h1><Link to="/subscriptions">See available plans</Link></main>;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = isManualUpi
        ? await submitManualUpiPayment({
            name: localStorage.getItem("username") || "InterviewIQ Student",
            email: localStorage.getItem("email") || "",
            plan_code: planCode,
            transaction_id: transactionId.trim(),
          })
        : await submitDemoPayment({
            name: localStorage.getItem("username") || "InterviewIQ Student",
            email: localStorage.getItem("email") || "",
            plan_code: planCode,
            payment_method: method,
          });
      localStorage.setItem("subscription", JSON.stringify(result.subscription));
      navigate("/account/subscription", { state: { demoSuccess: true } });
    } catch (requestError) {
      setError(requestError.message || "Demo checkout could not be completed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="subscription-page checkout-page">
      <Link className="subscription-back" to="/subscriptions">← Back to plans</Link>
      <section className="checkout-layout">
        <div className="checkout-details">
          <p className="subscription-eyebrow">{isManualUpi ? "ANNUAL UPI CHECKOUT" : "DEMO CHECKOUT"}</p>
          <h1>{isManualUpi ? "Review Your Annual Plan" : "Review Your Plan"}</h1>
          <div className="checkout-plan-card">
            <span className="subscription-category">{plan.category}</span>
            <h2>{plan.name}</h2>
            <p>{plan.duration} of access after admin approval</p>
            <ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
          </div>
          <div className="checkout-price-line"><span>Plan price</span><del>{money(plan.listPrice)}</del></div>
          {!isManualUpi && <div className="checkout-price-line"><span>Demo discount</span><span>{plan.discountPercent}%</span></div>}
          <div className="checkout-price-line checkout-total"><span>{isManualUpi ? "Amount to pay" : "Demo total"}</span><strong>{money(plan.amount)}</strong></div>
        </div>

        <form className="checkout-form" onSubmit={handleSubmit}>
          {isManualUpi && !manualUpiEnabled ? <p className="subscription-pending-notice">UPI checkout is not available until persistent payment storage is configured. You will not be asked to pay here.</p> : isManualUpi ? <>
            <h2>Pay By UPI</h2>
            <p>Scan this QR in Google Pay, PhonePe, Paytm, or another UPI app. Confirm the recipient is <strong>Hittu2</strong> and the amount is {money(plan.amount)}.</p>
            <img className="upi-payment-qr" src={getUpiQrUrl(planCode)} alt={`UPI payment QR for ${money(plan.amount)}`} />
            <p className="upi-id-line">UPI ID: <strong>hittu05@ybl</strong></p>
            <a className="subscription-secondary upi-open-link" href={`upi://pay?pa=hittu05%40ybl&pn=Hittu2&am=${plan.amount}&cu=INR&tn=InterviewIQ%20${encodeURIComponent(plan.name)}`}>Open A UPI App</a>
            <label className="upi-transaction-field">UPI Transaction ID / UTR
              <input type="text" value={transactionId} onChange={(event) => setTransactionId(event.target.value)} required minLength={6} maxLength={80} pattern="[A-Za-z0-9-]{6,80}" placeholder="Enter the reference shown after payment" autoComplete="off" />
            </label>
          </> : <>
          <h2>Simulated Payment</h2>
          <p className="subscription-demo-notice">Do not enter real card or bank details. This is a payment simulation for a college project.</p>
          <fieldset className="payment-methods">
            <legend>Choose a demo payment method</legend>
            <label className={method === "demo_card" ? "payment-method selected" : "payment-method"}>
              <input type="radio" name="paymentMethod" value="demo_card" checked={method === "demo_card"} onChange={() => setMethod("demo_card")} />
              <span><strong>Debit card demo</strong><small>Uses a simulated transaction reference only</small></span>
            </label>
            <label className={method === "demo_upi" ? "payment-method selected" : "payment-method"}>
              <input type="radio" name="paymentMethod" value="demo_upi" checked={method === "demo_upi"} onChange={() => setMethod("demo_upi")} />
              <span><strong>UPI demo</strong><small>No UPI ID or banking information is requested</small></span>
            </label>
          </fieldset>
          </>}
          {error && <p className="subscription-error" role="alert">{error}</p>}
          <button className="subscription-primary" type="submit" disabled={busy || (isManualUpi && !manualUpiEnabled)}>
            {busy ? "Submitting…" : isManualUpi ? "Submit UPI Details For Verification" : `Complete Demo Payment · ${money(plan.amount)}`}
          </button>
          <p className="checkout-disclaimer">{isManualUpi ? "Submitting the UTR creates a pending request. An administrator must verify the transfer before activating the plan." : "Submitting records a simulated payment for admin review. Your plan stays pending until the admin approves it. No money is charged."}</p>
        </form>
      </section>
    </main>
  );
}
