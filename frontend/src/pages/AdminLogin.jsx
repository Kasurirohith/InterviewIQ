import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loadAdminSubscriptions } from "../services/subscriptions";
import "./Subscriptions.css";

const ADMIN_SESSION_KEY = "interviewiqAdminPassword";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const signIn = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await loadAdminSubscriptions(password);
      sessionStorage.setItem(ADMIN_SESSION_KEY, password);
      navigate("/admin", { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Admin sign-in failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="subscription-page admin-login-page">
      <p className="subscription-eyebrow">INTERVIEWIQ ADMIN</p>
      <h1>Administrator sign in</h1>
      <p className="subscription-lead">Use the private admin password configured by the project owner to review demo subscriptions.</p>
      <form className="admin-login" onSubmit={signIn}>
        <label htmlFor="admin-password">Admin password</label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
        {error && <p className="subscription-error" role="alert">{error}</p>}
        <button className="subscription-primary" type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in to admin"}
        </button>
      </form>
      <p className="admin-footnote">There is no public admin sign-up. The owner provisions admin access privately in Render.</p>
      <Link className="subscription-back" to="/">← Back to InterviewIQ</Link>
    </main>
  );
}
