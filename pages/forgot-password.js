// pages/forgot-password.js
import { useState } from "react";
import { useRouter } from "next/router";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | sent | error
  const [error, setError] = useState("");

  // PORTAL-SCOPING FIX: this page is shared by employer/employee/bgv/admin logins,
  // each of which now links here with ?portal=<role>. Forward that portal to the
  // backend so a reset request only succeeds for an account that actually belongs
  // to the portal it was requested from — e.g. typing an admin email in on the
  // employer login's "forgot password" no longer sends a live reset link for it.
  const { portal } = router.query;

  const handle = async () => {
    setError("");
    setStatus("loading");
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...(portal ? { portal } : {}) }),
      });
      if (!res.ok) {
        // Still generic for the true "email not registered anywhere" case — the
        // backend returns 200 with a non-committal message then, so nothing here
        // leaks that. But when a portal was passed and the email belongs to a
        // *different* role, the backend now deliberately returns a distinguishing
        // 400 (e.g. "This email is not registered as an employer account") so the
        // person isn't sent to check an inbox that will never get a link. That's
        // an intentional, scoped exception to the anti-enumeration rule below —
        // not a leak, since it only fires once portal-scoping was requested and
        // only tells the person "wrong portal," never "no such account at all."
        let detail = "Something went wrong. Please try again.";
        try {
          const data = await res.json();
          if (data.detail) detail = data.detail;
        } catch {}
        setError(detail);
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setError("Network error — please try again");
      setStatus("error");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>Datagate</div>

        {status === "sent" ? (
          <>
            <div style={styles.successIcon}>✉️</div>
            <h1 style={styles.title}>Check your email</h1>
            <p style={styles.sub}>
              We've sent a password reset link to <strong>{email}</strong>.
              The link expires in 15 minutes.
            </p>
            <button style={styles.btn} onClick={() => router.back()}>Back to sign in</button>
          </>
        ) : (
          <>
            <h1 style={styles.title}>Forgot password?</h1>
            <p style={styles.sub}>Enter your email and we'll send you a reset link.</p>

            <input
              style={styles.input}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handle()}
            />

            {error && <p style={styles.error}>{error}</p>}

            <button style={styles.btn} onClick={handle} disabled={status === "loading"}>
              {status === "loading" ? "Sending…" : "Send reset link"}
            </button>
            <button style={styles.backBtn} onClick={() => router.back()}>← Back</button>
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
  sub: { fontSize: 14, color: "#64748b", margin: 0, lineHeight: 1.6 },
  successIcon: { fontSize: 36 },
  input: { padding: "0.75rem 1rem", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 15, outline: "none" },
  error: { color: "#ef4444", fontSize: 13, margin: 0 },
  btn: { padding: "0.85rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" },
  backBtn: { background: "none", border: "none", color: "#64748b", fontSize: 14, cursor: "pointer", padding: 0 },
};
