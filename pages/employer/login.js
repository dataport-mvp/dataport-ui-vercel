// pages/employer/login.js
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

export default function EmployerLogin() {
  const [isSignup, setIsSignup]   = useState(false);
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [fullName, setFullName]   = useState("");
  const [mobile, setMobile]       = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [showPwd, setShowPwd]     = useState(false);

  const router   = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isSignup ? "/auth/register" : "/auth/login";
      const payload  = isSignup
        ? { email, password, role: "employer", name: fullName, phone: mobile }
        : { email, password };

      const res = await fetch(`${API}${endpoint}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `Error ${res.status}`);

      login(data.access_token, {
        email: data.email || email,
        name:  data.name  || fullName,
        phone: data.phone || mobile,
        role:  data.role  || "employer",
      });

      router.push("/employer/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.heading}>{isSignup ? "Employer Sign Up" : "Employer Sign In"}</h1>

        <form onSubmit={handleSubmit}>
          <Field label="Email">
            <input style={s.input} type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} required placeholder="you@company.com" />
          </Field>

          <Field label="Password">
            <div style={{ position: "relative" }}>
              <input style={{ ...s.input, paddingRight: "2.75rem" }}
                type={showPwd ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
              <button type="button" onClick={() => setShowPwd(p => !p)}
                aria-label={showPwd ? "Hide password" : "Show password"}
                style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", color: "#94a3b8" }}>
                {showPwd ? (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </Field>

          {isSignup && (
            <>
              <Field label="Company / Full Name">
                <input style={s.input} type="text" value={fullName}
                  onChange={(e) => setFullName(e.target.value)} required placeholder="Acme Corp" />
              </Field>
              <Field label="Mobile Number">
                <input style={s.input} type="tel" value={mobile} maxLength={10}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  required placeholder="10-digit mobile" />
              </Field>
            </>
          )}

          {error && <p style={s.error}>{error}</p>}

          <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}
          </button>
        </form>

        <p style={s.toggle}>
          {isSignup ? "Already have an account?" : "New employer?"}{" "}
          <span style={s.link} onClick={() => { setIsSignup(!isSignup); setError(""); }}>
            {isSignup ? "Sign In" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}

const Field = ({ label, children }) => (
  <div style={{ marginBottom: "1rem" }}>
    <label style={{ fontSize: "0.85rem", color: "#475569", display: "block", marginBottom: "4px" }}>{label}</label>
    {children}
  </div>
);

const s = {
  page:    { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(to right, #f0f4f8, #d9e4ec)", fontFamily: "Inter, system-ui, sans-serif" },
  card:    { background: "#fff", padding: "2.5rem", borderRadius: "14px", boxShadow: "0 12px 30px rgba(0,0,0,0.08)", width: "100%", maxWidth: "420px" },
  heading: { marginBottom: "1.5rem", textAlign: "center" },
  input:   { width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box" },
  btn:     { width: "100%", padding: "0.85rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontSize: "1rem", cursor: "pointer", marginTop: "0.5rem" },
  error:   { color: "#dc2626", fontSize: "0.85rem", marginBottom: "0.75rem" },
  toggle:  { marginTop: "1.25rem", textAlign: "center", fontSize: "0.9rem" },
  link:    { color: "#2563eb", cursor: "pointer", fontWeight: "600" },
};
