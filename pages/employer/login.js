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
  const [mode,        setMode]        = useState("login");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPwd,     setShowPwd]     = useState(false);
  const [company,     setCompany]     = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [error,       setError]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const { login }  = useAuth();
  const router     = useRouter();

  const handle = async () => {
    setError(""); setLoading(true);
    try {
      if (mode === "signup" && !termsAgreed) {
        setError("Please accept the Employer Terms and Privacy Policy to continue.");
        setLoading(false);
        return;
      }
      const body = mode==="signup"
        ? {email, password, name:company, phone:"0000000000", role:"employer", terms_accepted_at: new Date().toISOString()}
        : {email, password};
      const res  = await fetch(`${API}${mode==="signup"?"/auth/register":"/auth/login"}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,400;1,500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}
        ::selection{background:#0d6e6e;color:#fff}
        a{text-decoration:none;color:inherit}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
        .pg{min-height:100vh;display:grid;grid-template-columns:1fr 1fr}

        /* LEFT — teal */
        .lft{background:#0d6e6e;display:flex;flex-direction:column;padding:2.5rem 3rem;position:relative;overflow:hidden}
        .lft::before{content:'';position:absolute;bottom:-100px;left:-60px;width:350px;height:350px;border-radius:50%;background:rgba(255,255,255,0.06);pointer-events:none}
        .lft::after{content:'';position:absolute;top:-60px;right:-60px;width:250px;height:250px;border-radius:50%;background:rgba(255,255,255,0.04);pointer-events:none}
        .lft-logo{display:inline-flex;align-items:center;gap:9px;text-decoration:none;position:relative;z-index:1}
        .lft-logo-name{font-family:'DM Sans',sans-serif;font-weight:700;font-size:14px;color:#fff;letter-spacing:-.3px;line-height:1}
        .lft-logo-sub{font-family:'DM Sans',sans-serif;font-weight:600;font-size:6.5px;color:rgba(255,255,255,.7);letter-spacing:2px;text-transform:uppercase;margin-top:3px}
        .lft-body{flex:1;display:flex;flex-direction:column;justify-content:center;padding:2rem 0;position:relative;z-index:1}
        .badge{display:inline-flex;align-items:center;gap:.45rem;font-size:.64rem;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,.9);margin-bottom:1.5rem}
        .badge::before{content:'';width:16px;height:1.5px;background:rgba(255,255,255,.9)}
        .h2{font-family:'Cormorant Garamond',serif;font-size:clamp(1.8rem,2.8vw,2.5rem);font-weight:600;line-height:1.2;color:#fff;letter-spacing:-.3px;margin-bottom:.9rem}
        .h2 em{font-style:italic;color:rgba(255,255,255,.85)}
        .desc{font-size:.875rem;color:rgba(255,255,255,.8);line-height:1.8;margin-bottom:2rem;max-width:340px}
        .feats{display:flex;flex-direction:column;gap:.8rem;margin-bottom:2rem}
        .ft-row{display:flex;align-items:center;gap:.7rem;font-size:.83rem;color:rgba(255,255,255,.85)}
        .ftck{width:18px;height:18px;border-radius:50%;flex-shrink:0;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.4);display:flex;align-items:center;justify-content:center;color:#fff}
        .stats{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.2);border-radius:12px;overflow:hidden}
        .stat{background:rgba(0,0,0,.15);padding:1.1rem 1.25rem}
        .stat-v{font-family:'Cormorant Garamond',serif;font-size:1.5rem;font-weight:600;color:#fff;line-height:1;margin-bottom:3px}
        .stat-l{font-size:.71rem;color:rgba(255,255,255,.7);line-height:1.4}
        .lft-ft{padding-top:1.5rem;border-top:1px solid rgba(255,255,255,.25);display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1}
        .fc{font-size:.68rem;color:rgba(255,255,255,.5)}
        .fl{display:flex;gap:1rem}
        .fla{font-size:.68rem;color:rgba(255,255,255,.5);text-decoration:none;transition:color .15s}
        .fla:hover{color:#fff}

        /* RIGHT — white, high contrast */
        .rgt{background:#fff;display:flex;align-items:center;justify-content:center;padding:3rem 2.5rem}
        .form{width:100%;max-width:390px;animation:fadeUp .5s ease both}
        .form-back{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:#6b6258;margin-bottom:2rem;cursor:pointer;text-decoration:none;transition:color .15s}
        .form-back:hover{color:#0d6e6e}
        .form-ey{font-size:.64rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#5a5248;margin-bottom:6px}
        .fhd{font-family:'Cormorant Garamond',serif;font-size:1.85rem;font-weight:600;color:#111;letter-spacing:-.3px;line-height:1.1;margin-bottom:4px}
        .fsb{font-size:.83rem;color:#6b6258;margin-bottom:1.75rem}
        .tabs{display:flex;background:#f0ece6;border:1.5px solid #c8c2b8;border-radius:9px;padding:3px;gap:3px;margin-bottom:1.4rem}
        .tab{flex:1;padding:7px;border:none;border-radius:7px;font-family:inherit;font-size:.8rem;font-weight:600;cursor:pointer;transition:all .15s;background:transparent;color:#7a6e64}
        .tab.on{background:#fff;color:#111;border:1.5px solid #c8c2b8;box-shadow:0 1px 4px rgba(0,0,0,.08)}
        .fld{display:flex;flex-direction:column;gap:.35rem;margin-bottom:.9rem}
        .flb{font-size:.67rem;font-weight:700;color:#3d3530;letter-spacing:.4px;text-transform:uppercase}
        .flb span{color:#0d6e6e}
        .fin{padding:.78rem 1rem;background:#faf8f5;border:1.5px solid #b8b0a8;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:.875rem;color:#111;outline:none;width:100%;transition:all .15s}
        .fin::placeholder{color:#a09890}
        .fin:focus{border-color:#0d6e6e;background:#fff;box-shadow:0 0 0 3px rgba(13,110,110,.08)}
        .pw-wrap{position:relative}
        .pw-wrap .fin{padding-right:2.75rem}
        .ey{position:absolute;right:.85rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#a09890;padding:0;transition:color .15s}
        .ey:hover{color:#3d3530}
        .err{font-size:.78rem;color:#b91c1c;padding:.6rem .9rem;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin-bottom:.75rem}
        .terms-row{display:flex;align-items:flex-start;gap:.6rem;margin-bottom:.9rem;padding:.75rem .9rem;background:#f5f2ee;border:1.5px solid #c8c2b8;border-radius:9px;cursor:pointer}
        .terms-row:hover{border-color:#0d6e6e;background:#f0f9f4}
        .terms-cb{width:16px;height:16px;border-radius:4px;border:1.5px solid #a09890;background:#fff;flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center;transition:all .15s}
        .terms-cb.checked{background:#0d6e6e;border-color:#0d6e6e}
        .terms-cb.checked::after{content:'✓';font-size:9px;color:#fff;font-weight:700}
        .terms-txt{font-size:.75rem;color:#3d3530;line-height:1.6}
        .terms-txt a{color:#0d6e6e;font-weight:600;text-decoration:none}
        .terms-txt a:hover{text-decoration:underline}
        .sub{padding:.88rem;background:#0d6e6e;color:#fff;border:none;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:.88rem;font-weight:700;cursor:pointer;transition:all .15s;width:100%;margin-bottom:.75rem;box-shadow:0 4px 16px rgba(13,110,110,.25)}
        .sub:hover:not(:disabled){background:#0a5656;transform:translateY(-1px)}
        .sub:disabled{opacity:.45;cursor:not-allowed;transform:none}
        .fgt{text-align:center;margin-bottom:.75rem}
        .fgt a{font-size:.78rem;color:#6b6258;text-decoration:none;transition:color .15s}
        .fgt a:hover{color:#0d6e6e}
        .dvr{display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem}
        .dvl{flex:1;height:1px;background:#e0dbd4}
        .dvt{font-size:.68rem;color:#a09890}
        .tgl{text-align:center;font-size:.83rem;color:#6b6258;margin-bottom:1rem}
        .tgb{color:#0d6e6e;cursor:pointer;font-weight:700;background:none;border:none;font-family:inherit;font-size:inherit;padding:0}
        .tgb:hover{text-decoration:underline}
        .trust-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;border-top:1px solid #e0dbd4;padding-top:1rem;margin-bottom:.75rem}
        .trust-item{display:flex;align-items:center;gap:5px;font-size:10.5px;color:#6b6258}
        .trust-ck{width:14px;height:14px;border-radius:3px;background:#e8f5ee;border:1px solid rgba(13,110,110,.25);display:flex;align-items:center;justify-content:center;font-size:8px;color:#0d6e6e;flex-shrink:0}
        .footer-row{display:flex;justify-content:center;gap:16px}
        .footer-lk{font-size:.67rem;color:#a09890;text-decoration:none;transition:color .15s}
        .footer-lk:hover{color:#0d6e6e}

        @media(max-width:900px){.pg{grid-template-columns:1fr}.lft{display:none}.rgt{padding:3rem 1.5rem;min-height:100vh}}
      `}</style>

      <div className="pg">
        <div className="lft">
          <Link href="/" className="lft-logo">
            <svg width="28" height="32" viewBox="0 0 36 40" fill="none">
              <path d="M18 1.5L33 8V23Q33 36.5 18 39Q3 36.5 3 23V8Z" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8"/>
              <rect x="9.5" y="22" width="4.5" height="13" rx="1.8" fill="white"/>
              <rect x="22" y="22" width="4.5" height="13" rx="1.8" fill="white"/>
              <path d="M11.5 22Q18 13.5 24.5 22" fill="none" stroke="white" strokeWidth="3.8" strokeLinecap="round"/>
            </svg>
            <div><div className="lft-logo-name">Datagate</div><div className="lft-logo-sub">Verified Employment</div></div>
          </Link>
          <div className="lft-body">
            <div className="badge">Employer Portal</div>
            <h2 className="h2">Hire with<br/><em>verified confidence.</em></h2>
            <p className="desc">Access pre-verified employee records the moment a candidate approves. Structured, reliable data — no chasing, no paperwork.</p>
            <div className="feats">
              {["Request employee consent in one click","Verified identity, education, and employment records","EPFO-linked employment history — not self-reported","Full consent audit trail for every access"].map(f=>(
                <div className="ft-row" key={f}><div className="ftck"><Check/></div>{f}</div>
              ))}
            </div>
            <div className="stats">
              {[["1-click","Consent request"],["Instant","Data on approval"],["Zero","Document chasing"],["100%","Employee-consented"]].map(([v,l])=>(
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

        <div className="rgt">
          <div className="form">
            <Link href="/" className="form-back">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to Datagate
            </Link>
            <div className="form-ey">Employer Portal</div>
            <div className="fhd">{mode==="signup"?"Create account":"Welcome back"}</div>
            <div className="fsb">{mode==="signup"?"Start hiring with verified data":"Sign in to your employer account"}</div>
            <div className="tabs">
              {[["login","Sign in"],["signup","Create account"]].map(([m,l])=>(
                <button key={m} className={`tab${mode===m?" on":""}`} onClick={()=>{setMode(m);setError("");setTermsAgreed(false)}}>{l}</button>
              ))}
            </div>
            {mode==="signup" && (
              <div className="fld"><label className="flb">Company Name <span>*</span></label><input className="fin" placeholder="Acme Technologies Pvt. Ltd." value={company} onChange={e=>setCompany(e.target.value)}/></div>
            )}
            <div className="fld"><label className="flb">Work Email <span>*</span></label><input className="fin" type="email" placeholder="hr@yourcompany.com" value={email} onChange={e=>setEmail(e.target.value)}/></div>
            <div className="fld"><label className="flb">Password <span>*</span></label>
              <div className="pw-wrap">
                <input className="fin" type={showPwd?"text":"password"} placeholder="Min. 8 characters" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()}/>
                <button className="ey" type="button" onClick={()=>setShowPwd(v=>!v)} tabIndex={-1}><Eye open={showPwd}/></button>
              </div>
            </div>
            {mode==="signup" && (
              <div className="terms-row" onClick={()=>setTermsAgreed(v=>!v)}>
                <div className={`terms-cb${termsAgreed?" checked":""}`}/>
                <span className="terms-txt">
                  I have read and agree to Datagate's{" "}
                  <a href="/employer/terms" onClick={e=>e.stopPropagation()} target="_blank" rel="noopener noreferrer">Employer Terms & Data Sharing Agreement</a>
                  {" "}and{" "}
                  <a href="/privacy" onClick={e=>e.stopPropagation()} target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
                  I will use employee data only for the stated hiring purpose.
                </span>
              </div>
            )}
            {error && <div className="err">{error}</div>}
            <button className="sub" onClick={handle} disabled={loading || (mode==="signup" && !termsAgreed)}>
              {loading?"Please wait…":mode==="signup"?"Create employer account →":"Sign in →"}
            </button>
            {mode==="login" && <div className="fgt"><a href="/forgot-password">Forgot password?</a></div>}
            <div className="dvr"><div className="dvl"/><span className="dvt">or</span><div className="dvl"/></div>
            <div className="tgl">{mode==="login"?"Don't have an account? ":"Already have an account? "}<button className="tgb" onClick={()=>{setMode(mode==="login"?"signup":"login");setError("");setTermsAgreed(false)}}>{mode==="login"?"Sign up free":"Sign in"}</button></div>
            <div className="trust-grid">
              {["DPDP Act 2023 compliant","Consent audit trail","Full BGV coverage","Instant on approval"].map(t=>(
                <div className="trust-item" key={t}><div className="trust-ck">✓</div>{t}</div>
              ))}
            </div>
            <div className="footer-row">
              <a href="/privacy" className="footer-lk">Privacy Policy</a>
              <a href="/employer/terms" className="footer-lk">Employer Terms</a>
              <a href="mailto:support@datagate.co.in" className="footer-lk">Support</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
