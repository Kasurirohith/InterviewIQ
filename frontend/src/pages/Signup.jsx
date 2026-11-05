
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.detail || data.message || "Account creation failed."
        );
      }

      localStorage.setItem("username", data.name || username);
      localStorage.setItem("email", data.email || email);
      localStorage.setItem("userRole", "user");
      sessionStorage.removeItem("interviewiqAdminPassword");
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.message || "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-heading">
          <h1>Create Your Account</h1>
          <p>
            Build your skills and prepare for your next interview.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSignup}>
          <label htmlFor="signup-username">Full name</label>
          <input
            id="signup-username"
            type="text"
            placeholder="Enter your full name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="name"
            required
          />

          <label htmlFor="signup-email">Email address</label>
          <input
            id="signup-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
