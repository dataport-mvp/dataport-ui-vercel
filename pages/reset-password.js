// pages/reset-password.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import PasswordInput from "../components/PasswordInput";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const LockIcon = ({ color = "#0d6e6e" }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="11" width="14" height="9" rx="2" stroke={color} strokeWidth="2"/>
    <path d="M8 11V7a4 4 0 018 0v4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="15.5" r="1.4" fill={color}/>
  </svg>
);

const CheckIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M5 13l4 4L19 7" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

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
        <div style={styles.header}>
          <div style={styles.logo}>Datagate</div>
          <div style={styles.tagline}>VERIFIED EMPLOYMENT</div>
        </div>

        <div style={styles.body}>
          {status === "done" ? (
            <>
              <div style={{...styles.iconCircle, background: "#dcfce7"}}><CheckIcon/></div>
              <h1 style={styles.title}>Password updated</h1>
              <p style={styles.sub}>Your password has been reset successfully. You can now sign in with your new password.</p>
              <button style={styles.btn} onClick={() => router.push("/employee/login")}>
                Employee sign in
              </button>
              <button style={{...styles.btn, background:"#1e3a5f"}} onClick={() => router.push("/employer/login")}>
                Employer sign in
              </button>
              <button style={{...styles.btn, background:"#334155"}} onClick={() => router.push("/bgv/login")}>
                BGV Vendor sign in
              </button>
            </>
          ) : (
            <>
              <div style={styles.iconCircle}><LockIcon/></div>
              <h1 style={styles.title}>Set a new password</h1>
              <p style={styles.sub}>Choose a strong password to keep your Datagate account secure.</p>

              <PasswordInput
                inputStyle={styles.input}
                placeholder="New password (min 8 characters)"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <PasswordInput
                inputStyle={styles.input}
                placeholder="Confirm new password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handle()}
              />

              {error && <p style={styles.error}>{error}</p>}

              <button style={styles.btn} onClick={handle} disabled={status === "loading"}>
                {status === "loading" ? "Saving…" : "Reset password"}
              </button>
              <p style={styles.footnote}>🔒 This link expires 15 minutes after it was sent, for your security.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(160deg,#eef1f5 0%,#e6f5f5 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI',Inter,sans-serif", padding: "2rem 1rem" },
  card: { background: "#fff", borderRadius: 18, width: "100%", maxWidth: 420, boxShadow: "0 12px 40px rgba(13,110,110,0.14)", overflow: "hidden" },
  header: { background: "#0d6e6e", padding: "1.5rem 2rem" },
  logo: { fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" },
  tagline: { fontSize: 9.5, color: "rgba(255,255,255,0.65)", letterSpacing: "2.5px", marginTop: 4 },
  body: { padding: "2.25rem 2rem 2rem", display: "flex", flexDirection: "column", gap: "1rem", alignItems: "flex-start" },
  iconCircle: { width: 52, height: 52, borderRadius: "50%", background: "#e6f5f5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.25rem" },
  title: { fontSize: 21, fontWeight: 800, color: "#0f172a", margin: 0 },
  sub: { fontSize: 14, color: "#64748b", margin: 0, lineHeight: 1.6 },
  input: { padding: "0.8rem 1rem", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 15, outline: "none", width: "100%", boxSizing: "border-box" },
  error: { color: "#ef4444", fontSize: 13, margin: 0 },
  btn: { padding: "0.9rem", background: "#0d6e6e", color: "#fff", border: "none", borderRadius: 9, fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%" },
  footnote: { fontSize: 11.5, color: "#94a3b8", margin: 0 },
};
