
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: identifier, name: identifier, password }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.detail || data.message || "Login failed. Please check your details."
        );
      }

      localStorage.setItem("email", data.email || identifier);

      const displayName = data.name || data.username;
      if (displayName) {
        localStorage.setItem("username", displayName);
      }

      if (data.role === "admin") {
        sessionStorage.setItem("interviewiqAdminPassword", password);
        localStorage.setItem("userRole", "admin");
        navigate("/admin", { replace: true });
      } else {
        sessionStorage.removeItem("interviewiqAdminPassword");
        localStorage.setItem("userRole", "user");
        navigate("/", { replace: true });
      }
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
          <h1>Welcome Back</h1>
          <p>Sign in to continue your interview preparation.</p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <label htmlFor="login-email">Email, name or phone number</label>
          <input
            id="login-email"
            type="text"
            placeholder="Enter your email, name or phone number"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Create Account</Link>
        </p>
      </section>
    </main>
  );
}
