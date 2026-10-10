
import { useEffect, useState, type FormEvent } from "react";
import CrmApp from "./CrmApp";

export default function CrmAuthGate() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function checkSession() {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "same-origin",
        cache: "no-store"
      });
      setAuthenticated(response.ok);
    } catch {
      setAuthenticated(false);
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    void checkSession();
  }, []);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        setError("Invalid credentials or authentication unavailable.");
        return;
      }

      setPassword("");
      setAuthenticated(true);
    } catch {
      setError("Cannot reach the authentication service.");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin"
    });

    setAuthenticated(false);
    setUsername("");
    setPassword("");
  }

  if (checking) return <p>Checking administrator session...</p>;

  if (!authenticated) {
    return (
      <main style={{
        maxWidth: 400,
        margin: "80px auto",
        padding: 24,
        fontFamily: "Arial, sans-serif"
      }}>
        <h1>TalentBridge CRM</h1>
        <p>Administrator sign in</p>

        <form onSubmit={handleLogin}>
          <label htmlFor="admin-username">Username</label>
          <input
            id="admin-username"
            autoComplete="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{ display: "block", width: "100%", margin: "8px 0 16px", padding: 10 }}
          />

          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ display: "block", width: "100%", margin: "8px 0 16px", padding: 10 }}
          />

          {error && <p role="alert">{error}</p>}

          <button disabled={busy} type="submit">
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <>
      <div style={{
        display: "flex",
        justifyContent: "flex-end",
        padding: "8px 16px"
      }}>
        <button onClick={handleLogout}>Log out</button>
      </div>
      <CrmApp />
    </>
  );
}
