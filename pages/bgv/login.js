// pages/bgv/login.js
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const G = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{background:#0f172a;font-family:'DM Sans',sans-serif;}
  .pg{min-height:100vh;background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%);display:flex;align-items:center;justify-content:center;padding:2rem;}
  .card{background:#fff;border-radius:20px;padding:2.5rem;width:100%;max-width:420px;box-shadow:0 24px 80px rgba(0,0,0,0.5);}
  .logo{font-size:1.5rem;font-weight:800;color:#4f46e5;letter-spacing:-0.5px;margin-bottom:0.25rem;}
  .badge{display:inline-block;background:#eef2ff;color:#4f46e5;font-size:0.65rem;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;padding:0.2rem 0.6rem;border-radius:999px;margin-bottom:1.75rem;}
  h1{font-size:1.4rem;font-weight:800;color:#0f172a;margin-bottom:0.3rem;}
  .sub{font-size:0.84rem;color:#64748b;margin-bottom:2rem;line-height:1.5;}
  .fl{font-size:0.7rem;font-weight:700;color:#64748b;letter-spacing:0.55px;text-transform:uppercase;display:block;margin-bottom:0.3rem;}
  .fi{margin-bottom:1.1rem;}
  .in{width:100%;padding:0.75rem 1rem;border:1.5px solid #e2e8f0;border-radius:10px;font-family:inherit;font-size:0.875rem;color:#0f172a;outline:none;transition:all 0.18s;background:#f8fafc;}
  .in:focus{border-color:#4f46e5;background:#fff;box-shadow:0 0 0 3px rgba(79,70,229,0.12);}
  .in.err{border-color:#ef4444!important;}
  .err-msg{font-size:0.72rem;color:#ef4444;font-weight:600;margin-top:0.25rem;display:block;}
  .btn{width:100%;padding:0.85rem;background:#4f46e5;color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:0.9rem;font-weight:700;cursor:pointer;transition:all 0.2s;margin-top:0.5rem;}
  .btn:hover{background:#4338ca;transform:translateY(-1px);}
  .btn:disabled{opacity:0.6;cursor:not-allowed;transform:none;}
  .alert{padding:0.85rem 1rem;border-radius:10px;font-size:0.82rem;font-weight:500;margin-bottom:1.25rem;line-height:1.55;}
  .alert.err{background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;}
  .alert.warn{background:#fffbeb;border:1px solid #fde68a;color:#92400e;}
  .footer-note{font-size:0.72rem;color:#94a3b8;text-align:center;margin-top:1.5rem;line-height:1.6;}
`;

export default function BgvLogin() {
  const router = useRouter();
  const { loginWithCredentials } = useAuth();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [pending,  setPending]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) { setError("Email and password are required"); return; }
    setLoading(true); setError(""); setPending(false);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403 && data.detail?.includes("pending")) {
          setPending(true);
        } else {
          setError(data.detail || "Invalid email or password");
        }
        setLoading(false);
        return;
      }
      if (data.role !== "bgv") {
        setError("This portal is for BGV vendors only. Use the correct login portal.");
        setLoading(false);
        return;
      }
      // Store tokens via AuthContext
      if (loginWithCredentials) {
        await loginWithCredentials(data);
      } else {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("name", data.name || "");
        localStorage.setItem("email", email.trim().toLowerCase());
      }
      router.push("/bgv/dashboard");
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <style>{G}</style>
      <div className="pg">
        <div className="card">
          <div className="logo">Datagate</div>
          <div className="badge">BGV Vendor Portal</div>
          <h1>Sign in to your account</h1>
          <p className="sub">Access your assigned cases, run checks, and submit reports.</p>

          {pending && (
            <div className="alert warn">
              ⏳ Your BGV vendor account is pending admin approval. You will receive an email once approved. Contact <strong>support@datagate.co.in</strong> if urgent.
            </div>
          )}
          {error && !pending && <div className="alert err">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="fi">
              <span className="fl">Email</span>
              <input className={`in${error?" err":""}`} type="email" value={email} onChange={e=>{setEmail(e.target.value);setError("");}} placeholder="ops@yourbgvcompany.com" autoComplete="email"/>
            </div>
            <div className="fi">
              <span className="fl">Password</span>
              <input className={`in${error?" err":""}`} type="password" value={password} onChange={e=>{setPassword(e.target.value);setError("");}} placeholder="••••••••" autoComplete="current-password"/>
            </div>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in →"}
            </button>
          </form>

          <div className="footer-note">
            Not registered yet? Your company admin will send you a registration link.<br/>
            For support: <strong>support@datagate.co.in</strong>
          </div>
        </div>
      </div>
    </>
  );
}
