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

const Shield = () => (
  <svg width="32" height="36" viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <style>{`
        @keyframes eml-p{0%{r:4.5;opacity:.5}100%{r:13;opacity:0}}
        @keyframes eml-d{0%,100%{r:3.5}50%{r:2.6}}
        @keyframes eml-f{0%{opacity:0;transform:translateY(0)}15%{opacity:1}85%{opacity:1}100%{opacity:0;transform:translateY(22px)}}
        .eml-pr{animation:eml-p 2s ease-out infinite;fill:none;stroke:#c9a84c;stroke-width:1.2}
        .eml-dt{animation:eml-d 2s ease-in-out infinite;fill:#c9a84c}
        .eml-p1{animation:eml-f 2.4s ease-in-out infinite}
        .eml-p2{animation:eml-f 2.4s ease-in-out infinite .8s}
        .eml-p3{animation:eml-f 2.4s ease-in-out infinite 1.6s}
      `}</style>
      <linearGradient id="emlg" x1="0" y1="0" x2="36" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2a2a2e"/>
        <stop offset="100%" stopColor="#1a1a1e"/>
      </linearGradient>
    </defs>
    <path d="M18 1L34 8V24Q34 38 18 40Q2 38 2 24V8Z" fill="url(#emlg)" stroke="#c9a84c" strokeWidth="0.8" strokeOpacity="0.4"/>
    <rect x="9" y="22" width="5" height="14" rx="2" fill="#c9a84c" opacity="0.9"/>
    <rect x="22" y="22" width="5" height="14" rx="2" fill="#c9a84c" opacity="0.9"/>
    <path d="M11.5 22Q18 13 24.5 22" fill="none" stroke="#c9a84c" strokeWidth="4" strokeLinecap="round" opacity="0.9"/>
    <circle cx="18" cy="14" r="2" fill="#c9a84c" opacity="0" className="eml-p1"/>
    <circle cx="18" cy="14" r="2" fill="#c9a84c" opacity="0" className="eml-p2"/>
    <circle cx="18" cy="14" r="2" fill="#c9a84c" opacity="0" className="eml-p3"/>
    <circle cx="29" cy="8" className="eml-dt"/>
    <circle cx="29" cy="8" className="eml-pr"/>
  </svg>
);

const Logo = () => (
  <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "10px" }}>
    <Shield />
    <div>
      <div style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:"15px", color:"#f5f0e8", letterSpacing:"-0.3px", lineHeight:1 }}>Datagate</div>
      <div style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:"7px", color:"#c9a84c", letterSpacing:"1.8px", textTransform:"uppercase", marginTop:"2px" }}>Verified Employment</div>
    </div>
  </Link>
);

const CheckIcon = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function EmployeeLogin() {
  const [isSignup, setIsSignup] = useState(false);
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [name,     setName]     = useState("");
  const [phone,    setPhone]    = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handlePhone = (val) => setPhone(val.replace(/\D/g,"").slice(0,10));

  const handle = async () => {
    setError(""); setLoading(true);
    if (isSignup && phone.length !== 10) { setError("Phone must be 10 digits"); setLoading(false); return; }
    const endpoint = isSignup ? "/auth/register" : "/auth/login";
    const body = isSignup ? { email, password, name, phone, role:"employee" } : { email, password };
    try {
      const res  = await fetch(`${API}${endpoint}`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(parseError(data)); return; }
      const { access_token, refresh_token, role, name:uName, email:uEmail } = data;
      login(access_token, refresh_token, { role, name:uName||name||email, email:uEmail||email, phone });
      router.push("/employee/personal");
    } catch { setError("Network error — please try again"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#0e0e10;font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}

        .emp-pg{min-height:100vh;display:grid;grid-template-columns:1fr 1fr}

        /* ── Left panel ── */
        .emp-lft{
          background:#0c0c0e;border-right:1px solid #1a1a1e;
          display:flex;flex-direction:column;justify-content:space-between;
          padding:2.5rem 3rem;
        }
        .emp-body{flex:1;display:flex;flex-direction:column;justify-content:center;padding:3rem 0}
        .emp-badge{
          display:inline-flex;align-items:center;gap:.5rem;
          font-size:.65rem;font-weight:700;letter-spacing:1.5px;
          text-transform:uppercase;color:#c9a84c;margin-bottom:1.5rem;
        }
        .emp-badge-line{width:18px;height:1.5px;background:#c9a84c}
        .emp-h2{
          font-family:'Playfair Display',serif;
          font-size:clamp(1.8rem,2.8vw,2.6rem);
          font-weight:600;line-height:1.2;
          color:#f5f0e8;letter-spacing:-.4px;margin-bottom:1rem;
        }
        .emp-h2 em{font-style:italic;color:#c9a84c}
        .emp-desc{font-size:.875rem;color:#504a44;line-height:1.8;margin-bottom:2.5rem;max-width:340px}

        /* Steps */
        .emp-steps{display:flex;flex-direction:column;gap:1.1rem;margin-bottom:2.5rem}
        .emp-step{display:flex;align-items:flex-start;gap:.9rem}
        .emp-sn{
          width:28px;height:28px;border-radius:8px;flex-shrink:0;
          background:rgba(201,168,76,0.08);
          border:1px solid rgba(201,168,76,0.2);
          display:flex;align-items:center;justify-content:center;
          font-size:.72rem;font-weight:700;color:#c9a84c;
        }
        .emp-st{font-size:.84rem;font-weight:700;color:#a09888;margin-bottom:2px}
        .emp-sd{font-size:.77rem;color:#3a3530;line-height:1.55}

        /* Flow card */
        .emp-flow{
          background:#141416;border:1px solid #222228;
          border-radius:14px;padding:1.5rem;
        }
        .emp-flow-lbl{font-size:.63rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#3a3530;margin-bottom:.85rem}
        .emp-flow-row{display:flex;align-items:center;gap:.5rem;margin-bottom:.6rem}
        .emp-fn{
          flex:1;background:#0e0e10;border:1px solid #1a1a1e;
          border-radius:8px;padding:.5rem .7rem;
          font-size:.72rem;font-weight:600;color:#504a44;text-align:center;
        }
        .emp-fa{color:#3a3530;font-size:.85rem;flex-shrink:0}
        .emp-consent{
          display:flex;align-items:center;gap:.5rem;
          background:rgba(201,168,76,0.06);
          border:1px solid rgba(201,168,76,0.15);
          border-radius:8px;padding:.55rem .75rem;
        }
        .emp-cdot{width:7px;height:7px;border-radius:50%;background:#c9a84c;flex-shrink:0;animation:pulse-dot 2s ease-in-out infinite}
        @keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.4}}
        .emp-consent span{font-size:.72rem;font-weight:600;color:#c9a84c}

        /* Footer */
        .emp-ft{
          padding-top:1.5rem;border-top:1px solid #1a1a1e;
          display:flex;justify-content:space-between;align-items:center;
        }
        .emp-fc{font-size:.69rem;color:#2a2a30}
        .emp-fl{display:flex;gap:1rem}
        .emp-fla{font-size:.69rem;color:#2a2a30;text-decoration:none;transition:color .15s}
        .emp-fla:hover{color:#c9a84c}

        /* ── Right — form panel ── */
        .emp-rgt{
          background:#0e0e10;
          display:flex;align-items:center;justify-content:center;
          padding:3rem 2.5rem;
        }
        .emp-form{width:100%;max-width:390px;display:flex;flex-direction:column;gap:1.25rem}

        .emp-fhd{
          font-family:'Playfair Display',serif;
          font-size:1.8rem;font-weight:600;color:#f5f0e8;letter-spacing:-.4px;
        }
        .emp-fsb{font-size:.84rem;color:#504a44;margin-top:-.2rem}

        .emp-fld{display:flex;flex-direction:column;gap:.4rem}
        .emp-flb{font-size:.72rem;font-weight:600;color:#504a44;letter-spacing:.3px;text-transform:uppercase}
        .emp-fin{
          padding:.78rem 1rem;
          background:#141416;
          border:1.5px solid #1a1a1e;
          border-radius:10px;
          font-family:'DM Sans',sans-serif;
          font-size:.875rem;color:#f5f0e8;
          outline:none;width:100%;
          transition:border-color .15s,background .15s;
        }
        .emp-fin::placeholder{color:#2a2a30}
        .emp-fin:focus{border-color:rgba(201,168,76,.5);background:#161618;box-shadow:0 0 0 3px rgba(201,168,76,.06)}
        .emp-pw{position:relative}
        .emp-pw .emp-fin{padding-right:2.75rem}
        .emp-ey{
          position:absolute;right:.85rem;top:50%;transform:translateY(-50%);
          background:none;border:none;cursor:pointer;color:#3a3530;padding:0;
          transition:color .15s;
        }
        .emp-ey:hover{color:#c9a84c}
        .emp-pht{font-size:.68rem;color:#2a2a30}

        .emp-err{
          font-size:.79rem;color:#fca5a5;padding:.65rem 1rem;
          background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);
          border-radius:9px;
        }

        .emp-sub{
          padding:.9rem;
          background:#c9a84c;color:#0e0e10;border:none;
          border-radius:10px;font-family:'DM Sans',sans-serif;
          font-size:.9rem;font-weight:700;cursor:pointer;
          transition:all .15s;letter-spacing:.1px;
        }
        .emp-sub:hover:not(:disabled){background:#e8c96a;transform:translateY(-1px)}
        .emp-sub:disabled{opacity:.4;cursor:not-allowed}

        .emp-fgt{text-align:center}
        .emp-fgt a{font-size:.79rem;color:#504a44;text-decoration:none;transition:color .15s}
        .emp-fgt a:hover{color:#c9a84c}

        .emp-dvr{display:flex;align-items:center;gap:.75rem}
        .emp-dvl{flex:1;height:1px;background:#1a1a1e}
        .emp-dvt{font-size:.7rem;color:#2a2a30}

        .emp-tgl{text-align:center;font-size:.84rem;color:#504a44}
        .emp-tgb{color:#c9a84c;cursor:pointer;font-weight:700;background:none;border:none;font-family:inherit;font-size:inherit}
        .emp-tgb:hover{text-decoration:underline}

        .emp-cft{display:flex;justify-content:center;padding-top:.25rem}
        .emp-cft a{font-size:.69rem;color:#2a2a30;text-decoration:none;transition:color .15s}
        .emp-cft a:hover{color:#c9a84c}

        @media(max-width:900px){
          .emp-pg{grid-template-columns:1fr}
          .emp-lft{display:none}
          .emp-rgt{padding:3rem 1.5rem;min-height:100vh}
        }
      `}</style>

      <div className="emp-pg">
        {/* Left */}
        <div className="emp-lft">
          <Logo />
          <div className="emp-body">
            <div className="emp-badge"><span className="emp-badge-line"/>Employee Portal</div>
            <h2 className="emp-h2">Your career data,<br/><em>your control.</em></h2>
            <p className="emp-desc">Build a verified employment profile once. Share it securely with any employer — with your consent, every single time.</p>

            <div className="emp-steps">
              {[
                ["1","Create your profile","Personal, education, employment — filled once, forever."],
                ["2","Upload documents","Aadhaar, PAN, certificates — encrypted and stored securely."],
                ["3","Approve and share","Every employer request needs your approval. You decide."],
              ].map(([n,t,d]) => (
                <div className="emp-step" key={n}>
                  <div className="emp-sn">{n}</div>
                  <div><div className="emp-st">{t}</div><div className="emp-sd">{d}</div></div>
                </div>
              ))}
            </div>

            <div className="emp-flow">
              <div className="emp-flow-lbl">How your data flows</div>
              <div className="emp-flow-row">
                <div className="emp-fn">Your Profile</div>
                <span className="emp-fa">→</span>
                <div className="emp-fn">Employer Request</div>
                <span className="emp-fa">→</span>
                <div className="emp-fn">Your Approval</div>
              </div>
              <div className="emp-consent">
                <div className="emp-cdot"/>
                <span>Data only moves after your explicit consent</span>
              </div>
            </div>
          </div>
          <div className="emp-ft">
            <span className="emp-fc">© 2026 Datagate</span>
            <div className="emp-fl">
              <a href="/privacy" className="emp-fla">Privacy Policy</a>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="emp-rgt">
          <div className="emp-form">
            <div>
              <div className="emp-fhd">{isSignup ? "Create account" : "Welcome back"}</div>
              <div className="emp-fsb">{isSignup ? "Start your verified employment journey" : "Sign in to your employee account"}</div>
            </div>

            {isSignup && (<>
              <div className="emp-fld">
                <label className="emp-flb">Full Name</label>
                <input className="emp-fin" placeholder="Manoj Kumar" value={name} onChange={e => setName(e.target.value)}/>
              </div>
              <div className="emp-fld">
                <label className="emp-flb">Mobile Number</label>
                <input className="emp-fin" placeholder="9876543210" value={phone} onChange={e => handlePhone(e.target.value)} inputMode="numeric" maxLength={10}/>
                <span className="emp-pht">{phone.length}/10 digits</span>
              </div>
            </>)}

            <div className="emp-fld">
              <label className="emp-flb">Email Address</label>
              <input className="emp-fin" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}/>
            </div>

            <div className="emp-fld">
              <label className="emp-flb">Password</label>
              <div className="emp-pw">
                <input className="emp-fin" type={showPwd?"text":"password"} placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==="Enter" && handle()}/>
                <button className="emp-ey" type="button" onClick={() => setShowPwd(v=>!v)} tabIndex={-1}><EyeIcon open={showPwd}/></button>
              </div>
            </div>

            {error && <div className="emp-err">{error}</div>}

            <button className="emp-sub" onClick={handle} disabled={loading}>
              {loading ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
            </button>

            {!isSignup && <div className="emp-fgt"><a href="/forgot-password">Forgot password?</a></div>}

            <div className="emp-dvr"><div className="emp-dvl"/><span className="emp-dvt">or</span><div className="emp-dvl"/></div>

            <div className="emp-tgl">
              {isSignup ? "Already have an account? " : "Don't have an account? "}
              <button className="emp-tgb" onClick={() => { setIsSignup(v=>!v); setError(""); setShowPwd(false); }}>
                {isSignup ? "Sign in" : "Sign up"}
              </button>
            </div>

            <div className="emp-cft">
              <a href="/privacy">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}