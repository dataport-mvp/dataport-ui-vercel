import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const Eye = ({ open }) => open ? (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
) : (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
);

const Check = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

export default function EmployerLogin() {
  const [mode,     setMode]     = useState("login");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [company,  setCompany]  = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const { login } = useAuth();
  const router    = useRouter();

  const handle = async () => {
    setError(""); setLoading(true);
    try {
      const body = mode==="signup" ? {email,password,name:company,phone:"0000000000",role:"employer"} : {email,password};
      const res  = await fetch(`${API}${mode==="signup"?"/auth/register":"/auth/login"}`, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const d    = await res.json();
      if (!res.ok) { setError(parseError(d)); return; }
      login(d.access_token, d.refresh_token, {role:d.role,name:d.name||company||email,email:d.email||email});
      router.push("/employer/dashboard");
    } catch { setError("Network error — please try again"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}

        .pg{min-height:100vh;display:grid;grid-template-columns:1fr 1fr}

        /* Left — deep ink enterprise panel */
        .lft{
          background:#18151f;
          display:flex;flex-direction:column;
          padding:2.5rem 3rem;
          position:relative;overflow:hidden;
        }
        .lft::before{
          content:'';position:absolute;bottom:-100px;left:-60px;
          width:350px;height:350px;border-radius:50%;
          background:rgba(13,110,110,0.06);pointer-events:none;
        }
        .lft::after{
          content:'';position:absolute;top:-60px;right:-60px;
          width:250px;height:250px;border-radius:50%;
          background:rgba(13,110,110,0.04);pointer-events:none;
        }
        .lft-body{flex:1;display:flex;flex-direction:column;justify-content:center;padding:2rem 0;position:relative;z-index:1}
        .lft-logo{display:inline-flex;align-items:center;gap:9px;text-decoration:none;position:relative;z-index:1}
        .badge{display:inline-flex;align-items:center;gap:.45rem;font-size:.64rem;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#0d6e6e;margin-bottom:1.5rem}
        .badge::before{content:'';width:16px;height:1.5px;background:#0d6e6e}
        .h2{font-family:'Cormorant Garamond',serif;font-size:clamp(1.8rem,2.8vw,2.5rem);font-weight:600;line-height:1.2;color:#f5f0f8;letter-spacing:-.3px;margin-bottom:.9rem}
        .h2 em{font-style:italic;color:#0f8a8a}
        .desc{font-size:.875rem;color:#5a5468;line-height:1.8;margin-bottom:2.5rem;max-width:340px}

        /* Features */
        .feats{display:flex;flex-direction:column;gap:.8rem;margin-bottom:2.5rem}
        .ft-row{display:flex;align-items:center;gap:.7rem;font-size:.83rem;color:#4a4458}
        .ftck{width:18px;height:18px;border-radius:50%;flex-shrink:0;background:rgba(13,110,110,0.1);border:1px solid rgba(13,110,110,0.2);display:flex;align-items:center;justify-content:center;color:#0d6e6e}

        /* Stats */
        .stats{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.04);border-radius:12px;overflow:hidden}
        .stat{background:#18151f;padding:1.1rem 1.25rem}
        .stat-v{font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:600;color:#0d6e6e;line-height:1}
        .stat-l{font-size:.71rem;color:#3d3847;margin-top:4px;line-height:1.4}

        /* Footer */
        .lft-ft{padding-top:1.5rem;border-top:1px solid rgba(255,255,255,0.04);display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1}
        .fc{font-size:.68rem;color:#2a2535}
        .fl{display:flex;gap:1rem}
        .fla{font-size:.68rem;color:#2a2535;text-decoration:none;transition:color .15s}
        .fla:hover{color:#0d6e6e}

        /* Right */
        .rgt{background:#fff;display:flex;align-items:center;justify-content:center;padding:3rem 2.5rem}
        .form{width:100%;max-width:390px;display:flex;flex-direction:column;gap:1.2rem}

        .fhd{font-family:'Cormorant Garamond',serif;font-size:1.85rem;font-weight:600;color:#18151f;letter-spacing:-.3px;line-height:1.1}
        .fsb{font-size:.83rem;color:#b8b3c2;margin-top:-.1rem}

        .fld{display:flex;flex-direction:column;gap:.38rem}
        .flb{font-size:.7rem;font-weight:700;color:#7a7386;letter-spacing:.3px;text-transform:uppercase}
        .fin{padding:.78rem 1rem;background:#f8f7fa;border:1.5px solid #ede9f5;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:.875rem;color:#18151f;outline:none;width:100%;transition:all .15s}
        .fin::placeholder{color:#d8d4e3}
        .fin:focus{border-color:#0d6e6e;background:#fff;box-shadow:0 0 0 3px rgba(13,110,110,.06)}
        .pw-wrap{position:relative}
        .pw-wrap .fin{padding-right:2.75rem}
        .ey{position:absolute;right:.85rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#d8d4e3;padding:0;transition:color .15s}
        .ey:hover{color:#7a7386}

        .err{font-size:.78rem;color:#b91c1c;padding:.6rem .9rem;background:#fef2f2;border:1px solid #fecaca;border-radius:8px}

        /* Terms note on signup */
        .terms-note{font-size:.72rem;color:#b8b3c2;line-height:1.65;text-align:center;padding:.7rem .9rem;background:#f8f7fa;border-radius:8px}
        .terms-note a{color:#0d6e6e;text-decoration:none}
        .terms-note a:hover{text-decoration:underline}

        .sub{padding:.88rem;background:#18151f;color:#fff;border:none;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:.88rem;font-weight:700;cursor:pointer;transition:all .15s}
        .sub:hover:not(:disabled){background:#0d6e6e;transform:translateY(-1px)}
        .sub:disabled{opacity:.45;cursor:not-allowed}

        .fgt{text-align:center}
        .fgt a{font-size:.78rem;color:#b8b3c2;text-decoration:none;transition:color .15s}
        .fgt a:hover{color:#0d6e6e}

        .dvr{display:flex;align-items:center;gap:.75rem}
        .dvl{flex:1;height:1px;background:#f2f0f5}
        .dvt{font-size:.68rem;color:#d8d4e3}

        .tgl{text-align:center;font-size:.83rem;color:#b8b3c2}
        .tgb{color:#0d6e6e;cursor:pointer;font-weight:700;background:none;border:none;font-family:inherit;font-size:inherit;padding:0}
        .tgb:hover{text-decoration:underline}

        .cft{display:flex;justify-content:center;gap:1.5rem;padding-top:.2rem}
        .cft a{font-size:.68rem;color:#d8d4e3;text-decoration:none;transition:color .15s}
        .cft a:hover{color:#0d6e6e}

        @media(max-width:900px){
          .pg{grid-template-columns:1fr}
          .lft{display:none}
          .rgt{padding:3rem 1.5rem;min-height:100vh}
        }
      `}</style>

      <div className="pg">
        {/* Left */}
        <div className="lft">
          <Link href="/" className="lft-logo">
            <svg width="26" height="30" viewBox="0 0 36 40" fill="none">
              <defs>
                <style>{`.ep3{animation:ep3a 2s ease-out infinite;fill:none;stroke:#0d6e6e;stroke-width:1}.ed3{animation:ed3a 2s ease-in-out infinite;fill:#0d6e6e}.ef31{animation:ef3a 2.4s ease-in-out infinite}.ef32{animation:ef3a 2.4s ease-in-out infinite .8s}.ef33{animation:ef3a 2.4s ease-in-out infinite 1.6s}@keyframes ep3a{0%{r:4.5;opacity:.4}100%{r:13;opacity:0}}@keyframes ed3a{0%,100%{r:3.5}50%{r:2.6}}@keyframes ef3a{0%{opacity:0;transform:translateY(0)}15%{opacity:.9}85%{opacity:.9}100%{opacity:0;transform:translateY(20px)}}`}</style>
              </defs>
              <path d="M18 1.5L33 8V23Q33 36.5 18 39Q3 36.5 3 23V8Z" fill="rgba(13,110,110,0.1)" stroke="rgba(13,110,110,0.3)" strokeWidth="1"/>
              <rect x="9.5" y="22" width="4.5" height="13" rx="1.8" fill="#0d6e6e"/>
              <rect x="22" y="22" width="4.5" height="13" rx="1.8" fill="#0d6e6e"/>
              <path d="M11.5 22Q18 13.5 24.5 22" fill="none" stroke="#0d6e6e" strokeWidth="3.8" strokeLinecap="round"/>
              <circle cx="18" cy="14" r="1.8" fill="#0d6e6e" opacity="0" className="ef31"/>
              <circle cx="18" cy="14" r="1.8" fill="#0d6e6e" opacity="0" className="ef32"/>
              <circle cx="18" cy="14" r="1.8" fill="#0d6e6e" opacity="0" className="ef33"/>
              <circle cx="28.5" cy="7.5" className="ed3"/>
              <circle cx="28.5" cy="7.5" className="ep3"/>
            </svg>
            <div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:"14px",color:"#f5f0f8",letterSpacing:"-0.3px",lineHeight:1}}>Datagate</div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:"6.5px",color:"#0d6e6e",letterSpacing:"2px",textTransform:"uppercase",marginTop:"3px"}}>Verified Employment</div>
            </div>
          </Link>

          <div className="lft-body">
            <div className="badge">Employer Portal</div>
            <h2 className="h2">Hire with<br/><em>verified confidence.</em></h2>
            <p className="desc">Access pre-verified employee records the moment a candidate approves. Structured, reliable data — no chasing, no paperwork.</p>

            <div className="feats">
              {["Request employee consent in one click","Verified identity, education, and employment records","EPFO-linked employment history","Full consent audit trail for every access"].map(f => (
                <div className="ft-row" key={f}><div className="ftck"><Check /></div>{f}</div>
              ))}
            </div>

            <div className="stats">
              {[["1-click","Consent request"],["Instant","Data on approval"],["Zero","Document chasing"],["100%","Employee-consented"]].map(([v,l]) => (
                <div className="stat" key={l}><div className="stat-v">{v}</div><div className="stat-l">{l}</div></div>
              ))}
            </div>
          </div>

          <div className="lft-ft">
            <span className="fc">© 2026 Datagate</span>
            <div className="fl">
              <a href="/privacy" className="fla">Privacy</a>
              <a href="/employer/terms" className="fla">Terms</a>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="rgt">
          <div className="form">
            <div>
              <div className="fhd">{mode==="signup" ? "Create account" : "Welcome back"}</div>
              <div className="fsb">{mode==="signup" ? "Start hiring with verified data" : "Sign in to your employer account"}</div>
            </div>

            {mode==="signup" && (
              <div className="fld"><label className="flb">Company Name</label><input className="fin" placeholder="Acme Technologies Pvt Ltd" value={company} onChange={e=>setCompany(e.target.value)}/></div>
            )}

            <div className="fld"><label className="flb">Work Email</label><input className="fin" type="email" placeholder="hr@company.com" value={email} onChange={e=>setEmail(e.target.value)}/></div>

            <div className="fld">
              <label className="flb">Password</label>
              <div className="pw-wrap">
                <input className="fin" type={showPwd?"text":"password"} placeholder="Min. 8 characters" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()}/>
                <button className="ey" type="button" onClick={()=>setShowPwd(v=>!v)} tabIndex={-1}><Eye open={showPwd}/></button>
              </div>
            </div>

            {error && <div className="err">{error}</div>}

            <button className="sub" onClick={handle} disabled={loading}>
              {loading ? "Please wait…" : mode==="signup" ? "Create employer account" : "Sign in"}
            </button>

            {mode==="login" && <div className="fgt"><a href="/forgot-password">Forgot password?</a></div>}

            {mode==="signup" && (
              <div className="terms-note">
                By creating an account you agree to our <a href="/employer/terms" target="_blank">Employer Terms</a> and <a href="/privacy" target="_blank">Privacy Policy</a>. Employee data may only be used for legitimate hiring purposes.
              </div>
            )}

            <div className="dvr"><div className="dvl"/><span className="dvt">or</span><div className="dvl"/></div>

            <div className="tgl">
              {mode==="login" ? "Don't have an account? " : "Already have an account? "}
              <button className="tgb" onClick={()=>{setMode(mode==="login"?"signup":"login");setError("")}}>
                {mode==="login" ? "Sign up" : "Sign in"}
              </button>
            </div>

            <div className="cft">
              <a href="/privacy">Privacy Policy</a>
              <a href="/employer/terms">Employer Terms</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}