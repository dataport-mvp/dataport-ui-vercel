import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const EyeIcon = ({ open }) => open ? (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const Logo = () => (
  <Link href="/" style={{ textDecoration:"none", display:"inline-flex", alignItems:"center", gap:"10px" }}>
    <svg width="32" height="36" viewBox="0 0 36 40" fill="none">
      <defs>
        <style>{`@keyframes erl2p{0%{r:4.5;opacity:.5}100%{r:13;opacity:0}}@keyframes erl2d{0%,100%{r:3.5}50%{r:2.6}}@keyframes erl2f{0%{opacity:0;transform:translateY(0)}15%{opacity:1}85%{opacity:1}100%{opacity:0;transform:translateY(22px)}}.erl2pr{animation:erl2p 2s ease-out infinite;fill:none;stroke:#c9a84c;stroke-width:1.2}.erl2dt{animation:erl2d 2s ease-in-out infinite;fill:#c9a84c}.erl2p1{animation:erl2f 2.4s ease-in-out infinite}.erl2p2{animation:erl2f 2.4s ease-in-out infinite .8s}.erl2p3{animation:erl2f 2.4s ease-in-out infinite 1.6s}`}</style>
        <linearGradient id="erl2g" x1="0" y1="0" x2="36" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#2a2a2e"/><stop offset="100%" stopColor="#1a1a1e"/></linearGradient>
      </defs>
      <path d="M18 1L34 8V24Q34 38 18 40Q2 38 2 24V8Z" fill="url(#erl2g)" stroke="#c9a84c" strokeWidth="0.8" strokeOpacity="0.4"/>
      <rect x="9" y="22" width="5" height="14" rx="2" fill="#c9a84c" opacity="0.9"/>
      <rect x="22" y="22" width="5" height="14" rx="2" fill="#c9a84c" opacity="0.9"/>
      <path d="M11.5 22Q18 13 24.5 22" fill="none" stroke="#c9a84c" strokeWidth="4" strokeLinecap="round" opacity="0.9"/>
      <circle cx="18" cy="14" r="2" fill="#c9a84c" opacity="0" className="erl2p1"/>
      <circle cx="18" cy="14" r="2" fill="#c9a84c" opacity="0" className="erl2p2"/>
      <circle cx="18" cy="14" r="2" fill="#c9a84c" opacity="0" className="erl2p3"/>
      <circle cx="29" cy="8" className="erl2dt"/>
      <circle cx="29" cy="8" className="erl2pr"/>
    </svg>
    <div>
      <div style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:"15px", color:"#f5f0e8", letterSpacing:"-0.3px", lineHeight:1 }}>Datagate</div>
      <div style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:"7px", color:"#c9a84c", letterSpacing:"1.8px", textTransform:"uppercase", marginTop:"2px" }}>Verified Employment</div>
    </div>
  </Link>
);

const Check = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

export default function EmployerLogin() {
  const [isSignup, setIsSignup] = useState(false);
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [company,  setCompany]  = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handle = async () => {
    setError(""); setLoading(true);
    const endpoint = isSignup ? "/auth/register" : "/auth/login";
    const body = isSignup ? { email, password, name:company, phone:"0000000000", role:"employer" } : { email, password };
    try {
      const res  = await fetch(`${API}${endpoint}`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(parseError(data)); return; }
      const { access_token, refresh_token, role, name:uName, email:uEmail } = data;
      login(access_token, refresh_token, { role, name:uName||company||email, email:uEmail||email });
      router.push("/employer/dashboard");
    } catch { setError("Network error — please try again"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#0e0e10;font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}
        .er-pg{min-height:100vh;display:grid;grid-template-columns:1fr 1fr}
        .er-lft{background:#0c0c0e;border-right:1px solid #1a1a1e;display:flex;flex-direction:column;justify-content:space-between;padding:2.5rem 3rem}
        .er-body{flex:1;display:flex;flex-direction:column;justify-content:center;padding:3rem 0}
        .er-badge{display:inline-flex;align-items:center;gap:.5rem;font-size:.65rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#c9a84c;margin-bottom:1.5rem}
        .er-badge-line{width:18px;height:1.5px;background:#c9a84c}
        .er-h2{font-family:'Playfair Display',serif;font-size:clamp(1.8rem,2.8vw,2.6rem);font-weight:600;line-height:1.2;color:#f5f0e8;letter-spacing:-.4px;margin-bottom:1rem}
        .er-h2 em{font-style:italic;color:#c9a84c}
        .er-desc{font-size:.875rem;color:#504a44;line-height:1.8;margin-bottom:2.5rem;max-width:340px}
        .er-feats{display:flex;flex-direction:column;gap:.8rem;margin-bottom:2.5rem}
        .er-ft{display:flex;align-items:center;gap:.75rem;font-size:.83rem;color:#504a44}
        .er-fck{width:18px;height:18px;border-radius:50%;flex-shrink:0;background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);display:flex;align-items:center;justify-content:center;color:#c9a84c}
        .er-stats{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:#1a1a1e;border:1px solid #1a1a1e;border-radius:14px;overflow:hidden}
        .er-stat{background:#141416;padding:1.1rem 1.25rem}
        .er-stat-v{font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:600;color:#c9a84c;letter-spacing:-.3px;line-height:1}
        .er-stat-l{font-size:.72rem;color:#3a3530;margin-top:4px;line-height:1.4}
        .er-ft-bar{padding-top:1.5rem;border-top:1px solid #1a1a1e;display:flex;justify-content:space-between;align-items:center}
        .er-fc{font-size:.69rem;color:#2a2a30}
        .er-fl{display:flex;gap:1rem}
        .er-fla{font-size:.69rem;color:#2a2a30;text-decoration:none;transition:color .15s}
        .er-fla:hover{color:#c9a84c}
        .er-rgt{background:#0e0e10;display:flex;align-items:center;justify-content:center;padding:3rem 2.5rem}
        .er-form{width:100%;max-width:390px;display:flex;flex-direction:column;gap:1.25rem}
        .er-fhd{font-family:'Playfair Display',serif;font-size:1.8rem;font-weight:600;color:#f5f0e8;letter-spacing:-.4px}
        .er-fsb{font-size:.84rem;color:#504a44;margin-top:-.2rem}
        .er-fld{display:flex;flex-direction:column;gap:.4rem}
        .er-flb{font-size:.72rem;font-weight:600;color:#504a44;letter-spacing:.3px;text-transform:uppercase}
        .er-fin{padding:.78rem 1rem;background:#141416;border:1.5px solid #1a1a1e;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:.875rem;color:#f5f0e8;outline:none;width:100%;transition:border-color .15s,background .15s}
        .er-fin::placeholder{color:#2a2a30}
        .er-fin:focus{border-color:rgba(201,168,76,.5);background:#161618;box-shadow:0 0 0 3px rgba(201,168,76,.06)}
        .er-pw{position:relative}
        .er-pw .er-fin{padding-right:2.75rem}
        .er-ey{position:absolute;right:.85rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#3a3530;padding:0;transition:color .15s}
        .er-ey:hover{color:#c9a84c}
        .er-err{font-size:.79rem;color:#fca5a5;padding:.65rem 1rem;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:9px}
        .er-sub{padding:.9rem;background:#c9a84c;color:#0e0e10;border:none;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:.9rem;font-weight:700;cursor:pointer;transition:all .15s}
        .er-sub:hover:not(:disabled){background:#e8c96a;transform:translateY(-1px)}
        .er-sub:disabled{opacity:.4;cursor:not-allowed}
        .er-fgt{text-align:center}
        .er-fgt a{font-size:.79rem;color:#504a44;text-decoration:none;transition:color .15s}
        .er-fgt a:hover{color:#c9a84c}
        .er-dvr{display:flex;align-items:center;gap:.75rem}
        .er-dvl{flex:1;height:1px;background:#1a1a1e}
        .er-dvt{font-size:.7rem;color:#2a2a30}
        .er-tgl{text-align:center;font-size:.84rem;color:#504a44}
        .er-tgb{color:#c9a84c;cursor:pointer;font-weight:700;background:none;border:none;font-family:inherit;font-size:inherit}
        .er-tgb:hover{text-decoration:underline}
        .er-cft{display:flex;justify-content:center;gap:1.5rem;padding-top:.25rem}
        .er-cft a{font-size:.69rem;color:#2a2a30;text-decoration:none;transition:color .15s}
        .er-cft a:hover{color:#c9a84c}
        .er-terms-note{font-size:.72rem;color:#3a3530;line-height:1.6;padding:.75rem 1rem;background:#141416;border:1px solid #1a1a1e;border-radius:9px;text-align:center}
        .er-terms-note a{color:#c9a84c;text-decoration:none}
        .er-terms-note a:hover{text-decoration:underline}
        @media(max-width:900px){.er-pg{grid-template-columns:1fr}.er-lft{display:none}.er-rgt{padding:3rem 1.5rem;min-height:100vh}}
      `}</style>

      <div className="er-pg">
        <div className="er-lft">
          <Logo />
          <div className="er-body">
            <div className="er-badge"><span className="er-badge-line"/>Employer Portal</div>
            <h2 className="er-h2">Hire with<br/><em>verified confidence.</em></h2>
            <p className="er-desc">Access pre-verified employee records instantly. Structured BGV data delivered the moment a candidate approves — no chasing, no paperwork.</p>
            <div className="er-feats">
              {["Request employee consent in one click","Verified Aadhaar, PAN, education, employment","EPFO-linked employment history included","Full consent audit trail — DPDP compliant"].map(f => (
                <div className="er-ft" key={f}><div className="er-fck"><Check /></div>{f}</div>
              ))}
            </div>
            <div className="er-stats">
              {[["1-click","Consent request"],["Instant","Data on approval"],["Zero","Document chasing"],["100%","Employee-consented"]].map(([v,l]) => (
                <div className="er-stat" key={l}><div className="er-stat-v">{v}</div><div className="er-stat-l">{l}</div></div>
              ))}
            </div>
          </div>
          <div className="er-ft-bar">
            <span className="er-fc">© 2026 Datagate</span>
            <div className="er-fl">
              <a href="/privacy" className="er-fla">Privacy</a>
              <a href="/employer/terms" className="er-fla">Terms</a>
            </div>
          </div>
        </div>

        <div className="er-rgt">
          <div className="er-form">
            <div>
              <div className="er-fhd">{isSignup ? "Create account" : "Welcome back"}</div>
              <div className="er-fsb">{isSignup ? "Start hiring with verified data" : "Sign in to your employer account"}</div>
            </div>
            {isSignup && (
              <div className="er-fld">
                <label className="er-flb">Company Name</label>
                <input className="er-fin" placeholder="Acme Technologies Pvt Ltd" value={company} onChange={e => setCompany(e.target.value)}/>
              </div>
            )}
            <div className="er-fld">
              <label className="er-flb">Work Email</label>
              <input className="er-fin" type="email" placeholder="hr@company.com" value={email} onChange={e => setEmail(e.target.value)}/>
            </div>
            <div className="er-fld">
              <label className="er-flb">Password</label>
              <div className="er-pw">
                <input className="er-fin" type={showPwd?"text":"password"} placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==="Enter" && handle()}/>
                <button className="er-ey" type="button" onClick={() => setShowPwd(v=>!v)} tabIndex={-1}><EyeIcon open={showPwd}/></button>
              </div>
            </div>
            {error && <div className="er-err">{error}</div>}
            <button className="er-sub" onClick={handle} disabled={loading}>
              {loading ? "Please wait…" : isSignup ? "Create employer account" : "Sign in"}
            </button>
            {!isSignup && <div className="er-fgt"><a href="/forgot-password">Forgot password?</a></div>}
            {isSignup && (
              <div className="er-terms-note">
                By creating an account you agree to our{" "}
                <a href="/employer/terms" target="_blank">Employer Terms</a> and{" "}
                <a href="/privacy" target="_blank">Privacy Policy</a>.
                Employee data must only be used for legitimate hiring purposes.
              </div>
            )}
            <div className="er-dvr"><div className="er-dvl"/><span className="er-dvt">or</span><div className="er-dvl"/></div>
            <div className="er-tgl">
              {isSignup ? "Already have an account? " : "Don't have an account? "}
              <button className="er-tgb" onClick={() => { setIsSignup(v=>!v); setError(""); setShowPwd(false); }}>
                {isSignup ? "Sign in" : "Sign up"}
              </button>
            </div>
            <div className="er-cft">
              <a href="/privacy">Privacy Policy</a>
              <a href="/employer/terms">Employer Terms</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}