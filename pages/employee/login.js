import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

function EyeIcon({ open }) {
  return open ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

export default function EmployeeLogin() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [name, setName]         = useState("");
  const [phone, setPhone]       = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handlePhone = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 10);
    setPhone(digits);
  };

  const handle = async () => {
    setError(""); setLoading(true);
    if (isSignup && phone.length !== 10) {
      setError("Phone number must be 10 digits"); setLoading(false); return;
    }
    const endpoint = isSignup ? "/auth/register" : "/auth/login";
    const body = isSignup ? { email, password, name, phone, role: "employee" } : { email, password };
    try {
      const res  = await fetch(`${API}${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(parseError(data)); return; }
      const { access_token, refresh_token, role, name: uName, email: uEmail } = data;
      login(access_token, refresh_token, { role, name: uName || name || email, email: uEmail || email, phone });
      router.push("/employee/personal");
    } catch { setError("Network error — please try again"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050d1a; }

        .auth-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'DM Sans', sans-serif;
        }

        .auth-left {
          background: linear-gradient(160deg, #0f1f3d 0%, #050d1a 60%);
          display: flex; flex-direction: column;
          justify-content: space-between;
          padding: 3rem;
          position: relative; overflow: hidden;
        }
        .auth-left::before {
          content: '';
          position: absolute; top: -200px; left: -200px;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%);
          pointer-events: none;
        }
        .left-logo {
          font-family: 'Syne', sans-serif;
          font-size: 1.5rem; font-weight: 800;
          background: linear-gradient(135deg, #38bdf8, #2563eb);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          text-decoration: none;
        }
        .left-content { position: relative; z-index: 1; }
        .left-tag {
          font-size: 0.72rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 1.5px;
          color: #38bdf8; margin-bottom: 1rem;
        }
        .left-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 3vw, 2.8rem);
          font-weight: 800; line-height: 1.2;
          color: #f1f5f9; margin-bottom: 1.25rem;
        }
        .left-title .accent {
          background: linear-gradient(135deg, #38bdf8, #2563eb);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .left-desc { font-size: 0.95rem; color: #475569; line-height: 1.7; max-width: 360px; }
        .left-steps { margin-top: 2.5rem; display: flex; flex-direction: column; gap: 1rem; }
        .step { display: flex; align-items: flex-start; gap: 1rem; }
        .step-num {
          width: 30px; height: 30px; border-radius: 50%;
          background: rgba(37,99,235,0.2);
          border: 1px solid rgba(56,189,248,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 700; color: #38bdf8;
          flex-shrink: 0; margin-top: 1px;
        }
        .step-text { font-size: 0.875rem; color: #64748b; line-height: 1.5; }
        .step-text strong { color: #94a3b8; display: block; margin-bottom: 2px; }

        /* ── Footer with links ── */
        .left-footer {
          display: flex; flex-direction: column; gap: 0.4rem;
        }
        .left-footer-copy { font-size: 0.78rem; color: #1e3a5f; }
        .left-footer-links { display: flex; gap: 1rem; }
        .left-footer-links a {
          font-size: 0.72rem; color: #1e3a5f; text-decoration: none;
          transition: color 0.2s;
        }
        .left-footer-links a:hover { color: #38bdf8; }

        .auth-right {
          background: #070f1e;
          display: flex; align-items: center; justify-content: center;
          padding: 3rem 2rem;
        }
        .auth-card {
          width: 100%; max-width: 400px;
          display: flex; flex-direction: column; gap: 1.25rem;
        }
        .auth-heading { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 800; color: #f1f5f9; }
        .auth-sub { font-size: 0.875rem; color: #475569; margin-top: -0.5rem; }

        .input-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .input-label { font-size: 0.8rem; font-weight: 600; color: #64748b; letter-spacing: 0.3px; }
        .input-field {
          padding: 0.8rem 1rem;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; color: #e2e8f0;
          outline: none; width: 100%;
          transition: border-color 0.2s;
        }
        .input-field::placeholder { color: #334155; }
        .input-field:focus { border-color: rgba(56,189,248,0.4); background: rgba(56,189,248,0.04); }
        .pwd-wrap { position: relative; }
        .pwd-wrap .input-field { padding-right: 2.75rem; }
        .eye-btn {
          position: absolute; right: 0.85rem; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #334155; display: flex; align-items: center;
          transition: color 0.2s; padding: 0;
        }
        .eye-btn:hover { color: #64748b; }

        .error-msg { font-size: 0.82rem; color: #f87171; padding: 0.7rem 1rem; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 8px; }

        .submit-btn {
          padding: 0.9rem;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #fff; border: none; border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(37,99,235,0.35);
        }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(37,99,235,0.5); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .forgot-link { text-align: center; }
        .forgot-link a { font-size: 0.82rem; color: #38bdf8; text-decoration: none; }
        .forgot-link a:hover { text-decoration: underline; }

        .divider { display: flex; align-items: center; gap: 1rem; }
        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.06); }
        .divider-text { font-size: 0.75rem; color: #1e3a5f; }

        .toggle-row { text-align: center; font-size: 0.85rem; color: #475569; }
        .toggle-btn { color: #38bdf8; cursor: pointer; font-weight: 600; background: none; border: none; font-family: inherit; font-size: inherit; }
        .toggle-btn:hover { text-decoration: underline; }

        .phone-hint { font-size: 0.72rem; color: #1e3a5f; margin-top: 2px; }

        /* ── Card footer links ── */
        .card-footer-links {
          display: flex; justify-content: center; gap: 1.25rem;
          padding-top: 0.25rem;
        }
        .card-footer-links a {
          font-size: 0.72rem; color: #1e3a5f; text-decoration: none;
          transition: color 0.2s;
        }
        .card-footer-links a:hover { color: #38bdf8; text-decoration: underline; }

        @media (max-width: 768px) {
          .auth-page { grid-template-columns: 1fr; }
          .auth-left { display: none; }
          .auth-right { padding: 2rem 1.5rem; }
        }
      `}</style>

      <div className="auth-page">
        {/* Left */}
        <div className="auth-left">
          <Link href="/" className="left-logo">Datagate</Link>
          <div className="left-content">
            <div className="left-tag">Employee Portal</div>
            <h2 className="left-title">Your career data,<br /><span className="accent">your control.</span></h2>
            <p className="left-desc">Build a verified employment profile once. Share it securely with any employer — with your consent.</p>
            <div className="left-steps">
              <div className="step">
                <div className="step-num">1</div>
                <div className="step-text"><strong>Create your profile</strong>Fill in personal, education and employment details.</div>
              </div>
              <div className="step">
                <div className="step-num">2</div>
                <div className="step-text"><strong>Upload documents</strong>Aadhaar, PAN, certificates — all encrypted.</div>
              </div>
              <div className="step">
                <div className="step-num">3</div>
                <div className="step-text"><strong>Approve & share</strong>Consent-based sharing. You decide who sees what.</div>
              </div>
            </div>
          </div>
          {/* Footer with privacy link */}
          <div className="left-footer">
            <div className="left-footer-copy">© 2026 Datagate</div>
            <div className="left-footer-links">
              <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="auth-right">
          <div className="auth-card">
            <div>
              <div className="auth-heading">{isSignup ? "Create account" : "Welcome back"}</div>
              <div className="auth-sub">{isSignup ? "Start your verified employment journey" : "Sign in to your employee account"}</div>
            </div>

            {isSignup && (
              <>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input className="input-field" placeholder="Manoj Kumar" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="input-group">
                  <label className="input-label">Mobile Number</label>
                  <input className="input-field" placeholder="9876543210" value={phone} onChange={e => handlePhone(e.target.value)} inputMode="numeric" maxLength={10} />
                  <span className="phone-hint">{phone.length}/10 digits</span>
                </div>
              </>
            )}

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input className="input-field" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="pwd-wrap">
                <input className="input-field" type={showPwd ? "text" : "password"} placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} />
                <button className="eye-btn" type="button" onClick={() => setShowPwd(v => !v)} tabIndex={-1}>
                  <EyeIcon open={showPwd} />
                </button>
              </div>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <button className="submit-btn" onClick={handle} disabled={loading}>
              {loading ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
            </button>

            {!isSignup && <div className="forgot-link"><a href="/forgot-password">Forgot password?</a></div>}

            <div className="divider"><div className="divider-line"/><span className="divider-text">or</span><div className="divider-line"/></div>

            <div className="toggle-row">
              {isSignup ? "Already have an account? " : "Don't have an account? "}
              <button className="toggle-btn" onClick={() => { setIsSignup(v => !v); setError(""); setShowPwd(false); }}>
                {isSignup ? "Sign in" : "Sign up"}
              </button>
            </div>

            {/* Privacy link — bottom of card */}
            <div className="card-footer-links">
              <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}