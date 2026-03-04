// pages/employee/login.js
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

export default function EmployeeLogin() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handle = async () => {
    setError("");
    setLoading(true);
    const endpoint = isSignup ? "/auth/register" : "/auth/login";
    const body = isSignup
      ? { email, password, name, phone, role: "employee" }
      : { email, password };

    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(parseError(data));
        return;
      }
      const { access_token, refresh_token, role, name: userName, email: userEmail } = data;
      login(access_token, refresh_token, { role, name: userName || name || email, email: userEmail || email, phone });
      router.push("/employee/personal");
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>Datagate</div>
        <h1 style={styles.title}>{isSignup ? "Create account" : "Employee sign in"}</h1>

        {isSignup && (
          <>
            <input style={styles.input} placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
            <input style={styles.input} placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} />
          </>
        )}

        <input style={styles.input} type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />

        <div style={styles.passwordWrap}>
          <input
            style={{ ...styles.input, paddingRight: "2.75rem", margin: 0 }}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handle()}
          />
          <button type="button" style={styles.eyeBtn} onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
            <EyeIcon open={showPassword} />
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button style={styles.btn} onClick={handle} disabled={loading}>
          {loading ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
        </button>

        {!isSignup && <a href="/forgot-password" style={styles.link}>Forgot password?</a>}

        <p style={styles.toggle}>
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <span style={styles.toggleLink} onClick={() => { setIsSignup(!isSignup); setError(""); setShowPassword(false); }}>
            {isSignup ? "Sign in" : "Sign up"}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" },
  card: { background: "#fff", borderRadius: 16, padding: "2.5rem", width: "100%", maxWidth: 400, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: "1rem" },
  logo: { fontSize: 22, fontWeight: 800, color: "#2563eb", letterSpacing: "-0.5px" },
  title: { fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0 },
  input: { padding: "0.75rem 1rem", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 15, outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" },
  passwordWrap: { position: "relative", display: "flex", alignItems: "center" },
  eyeBtn: { position: "absolute", right: "0.75rem", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center", padding: 0 },
  error: { color: "#ef4444", fontSize: 13, margin: 0 },
  btn: { padding: "0.85rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 4 },
  link: { color: "#2563eb", fontSize: 13, textAlign: "center", textDecoration: "none" },
  toggle: { fontSize: 13, color: "#64748b", textAlign: "center", margin: 0 },
  toggleLink: { color: "#2563eb", cursor: "pointer", fontWeight: 600 },
};
