// pages/reset-password.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;

  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState(false);

  const handleReset = async () => {
    setError("");
    if (!password || password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm)             { setError("Passwords do not match."); return; }
    if (!token)                           { setError("Invalid reset link — no token found."); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `Error ${res.status}`);
      setSuccess(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={st.page}>
        <div style={{ ...st.card, textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
          <h2 style={{ color: "#0f172a", marginBottom: "0.5rem" }}>Password Updated</h2>
          <p style={{ color: "#475569", marginBottom: "2rem" }}>Your password has been changed successfully. You can now log in.</p>
          <button onClick={() => router.push("/employee/login")} style={st.btn}>Go to Login →</button>
        </div>
      </div>
    );
  }

  return (
    <div style={st.page}>
      <div style={st.card}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "2rem" }}>🔒</div>
          <h1 style={{ margin: "0.5rem 0 0.25rem", color: "#0f172a" }}>Set New Password</h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0 }}>Choose a strong password for your Datagate account.</p>
        </div>

        {error && <div style={st.errorBox}>⚠️ {error}</div>}

        <label style={st.label}>New Password <span style={{ color: "#dc2626" }}>*</span></label>
        <div style={{ position: "relative", marginBottom: "1rem" }}>
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            style={st.input}
          />
          <button type="button" onClick={() => setShowPass(p => !p)} style={st.eyeBtn}>
            {showPass
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            }
          </button>
        </div>

        <label style={st.label}>Confirm Password <span style={{ color: "#dc2626" }}>*</span></label>
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="Repeat your new password"
          style={{ ...st.input, marginBottom: "1.5rem", borderColor: confirm && confirm !== password ? "#dc2626" : "#cbd5e1" }}
          onKeyDown={e => e.key === "Enter" && handleReset()}
        />
        {confirm && confirm !== password && <p style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "-1rem", marginBottom: "1rem" }}>Passwords do not match</p>}

        <button onClick={handleReset} disabled={loading} style={{ ...st.btn, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Updating…" : "Update Password"}
        </button>
      </div>
    </div>
  );
}

const st = {
  page:    { background: "#f1f5f9", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: "Inter,system-ui,sans-serif" },
  card:    { background: "#fff", borderRadius: "14px", padding: "2.5rem", width: "100%", maxWidth: "420px", boxShadow: "0 12px 30px rgba(0,0,0,0.08)" },
  label:   { fontSize: "0.85rem", color: "#475569", display: "block", marginBottom: "0.3rem" },
  input:   { width: "100%", padding: "0.65rem 2.5rem 0.65rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem", boxSizing: "border-box" },
  errorBox:{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.9rem" },
  btn:     { width: "100%", padding: "0.8rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontSize: "1rem", fontWeight: 600, cursor: "pointer" },
  eyeBtn:  { position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: "0.25rem", display: "flex" },
};
