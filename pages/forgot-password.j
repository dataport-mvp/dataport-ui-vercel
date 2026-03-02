// pages/forgot-password.js  (works for both employee and employer — same form)
import { useState } from "react";
import { useRouter } from "next/router";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

export default function ForgotPassword() {
  const router  = useRouter();
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) { setError("Please enter your email."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      // Always show success (API never reveals if email exists)
      setSent(true);
    } catch (_) {
      setSent(true); // still show success to avoid revealing account existence
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div style={st.page}>
        <div style={{ ...st.card, textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📧</div>
          <h2 style={{ color: "#0f172a", marginBottom: "0.5rem" }}>Check Your Email</h2>
          <p style={{ color: "#475569", lineHeight: "1.6", marginBottom: "2rem" }}>
            If <strong>{email}</strong> is registered on Datagate, you will receive a password reset link within a few minutes.
            The link expires in <strong>15 minutes</strong>.
          </p>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Didn't receive it? Check your spam folder.</p>
          <button onClick={() => setSent(false)} style={{ ...st.btn, background: "#f8fafc", color: "#0f172a", border: "1px solid #cbd5e1", marginBottom: "0.75rem" }}>
            Try a Different Email
          </button>
          <button onClick={() => router.back()} style={st.btn}>← Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div style={st.page}>
      <div style={st.card}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "2rem" }}>🔑</div>
          <h1 style={{ margin: "0.5rem 0 0.25rem", color: "#0f172a" }}>Forgot Password?</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0 }}>Enter your email and we'll send you a reset link.</p>
        </div>

        {error && <div style={st.errorBox}>⚠️ {error}</div>}

        <label style={st.label}>Email Address <span style={{ color: "#dc2626" }}>*</span></label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder="you@example.com"
          style={{ ...st.input, marginBottom: "1.5rem" }}
        />

        <button onClick={handleSubmit} disabled={loading} style={{ ...st.btn, opacity: loading ? 0.7 : 1, marginBottom: "1rem" }}>
          {loading ? "Sending…" : "Send Reset Link"}
        </button>

        <button onClick={() => router.back()} style={{ ...st.btn, background: "none", color: "#475569", border: "none", fontSize: "0.9rem" }}>
          ← Back to Login
        </button>
      </div>
    </div>
  );
}

const st = {
  page:    { background: "#f1f5f9", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: "Inter,system-ui,sans-serif" },
  card:    { background: "#fff", borderRadius: "14px", padding: "2.5rem", width: "100%", maxWidth: "420px", boxShadow: "0 12px 30px rgba(0,0,0,0.08)" },
  label:   { fontSize: "0.85rem", color: "#475569", display: "block", marginBottom: "0.3rem" },
  input:   { width: "100%", padding: "0.65rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem", boxSizing: "border-box" },
  errorBox:{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.9rem" },
  btn:     { width: "100%", padding: "0.8rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontSize: "1rem", fontWeight: 600, cursor: "pointer", display: "block" },
};
