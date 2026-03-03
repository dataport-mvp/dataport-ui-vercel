// pages/reset-password.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [error, setError] = useState("");

  const handle = async () => {
    setError("");
    if (!token) { setError("Invalid or expired reset link"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }

    setStatus("loading");
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Reset failed — link may have expired");
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setError("Network error — please try again");
      setStatus("error");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>Datagate</div>

        {status === "done" ? (
          <>
            <div style={styles.successIcon}>✓</div>
            <h1 style={styles.title}>Password updated</h1>
            <p style={styles.sub}>Your password has been reset. You can now sign in.</p>
            <button style={styles.btn} onClick={() => router.push("/employee/login")}>
              Go to sign in
            </button>
          </>
        ) : (
          <>
            <h1 style={styles.title}>Set new password</h1>
            <p style={styles.sub}>Choose a strong password for your account.</p>

            <input
              style={styles.input}
              type="password"
              placeholder="New password (min 8 characters)"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <input
              style={styles.input}
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handle()}
            />

            {error && <p style={styles.error}>{error}</p>}

            <button style={styles.btn} onClick={handle} disabled={status === "loading"}>
              {status === "loading" ? "Saving…" : "Reset password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" },
  card: { background: "#fff", borderRadius: 16, padding: "2.5rem", width: "100%", maxWidth: 400, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: "1rem" },
  logo: { fontSize: 22, fontWeight: 800, color: "#2563eb" },
  title: { fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0 },
  sub: { fontSize: 14, color: "#64748b", margin: 0 },
  successIcon: { width: 48, height: 48, borderRadius: "50%", background: "#dcfce7", color: "#16a34a", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 },
  input: { padding: "0.75rem 1rem", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 15, outline: "none" },
  error: { color: "#ef4444", fontSize: 13, margin: 0 },
  btn: { padding: "0.85rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" },
};
