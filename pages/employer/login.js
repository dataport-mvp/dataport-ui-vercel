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
            <input style={s.input} type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
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
