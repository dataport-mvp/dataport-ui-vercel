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

const Logo = ({ dark = false }) => (
  <Link href="/" style={{textDecoration:"none",display:"inline-flex",alignItems:"center",gap:"9px"}}>
    <svg width="28" height="32" viewBox="0 0 36 40" fill="none">
      <defs>
        <style>{`.ep{animation:epa 2s ease-out infinite;fill:none;stroke:#b8891a;stroke-width:1.2}.ed{animation:eda 2s ease-in-out infinite;fill:#b8891a}.ef1{animation:efa 2.4s ease-in-out infinite}.ef2{animation:efa 2.4s ease-in-out infinite .8s}.ef3{animation:efa 2.4s ease-in-out infinite 1.6s}@keyframes epa{0%{r:4.5;opacity:.5}100%{r:13;opacity:0}}@keyframes eda{0%,100%{r:3.5}50%{r:2.6}}@keyframes efa{0%{opacity:0;transform:translateY(0)}15%{opacity:1}85%{opacity:1}100%{opacity:0;transform:translateY(22px)}}`}</style>
        <linearGradient id="elg" x1="0" y1="0" x2="36" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#1a1a1e"/><stop offset="100%" stopColor="#111113"/></linearGradient>
      </defs>
      <path d="M18 1L34 8V24Q34 38 18 40Q2 38 2 24V8Z" fill="url(#elg)" stroke="#b8891a" strokeWidth="0.8" strokeOpacity="0.5"/>
      <rect x="9" y="22" width="5" height="14" rx="2" fill="#b8891a" opacity="0.85"/>
      <rect x="22" y="22" width="5" height="14" rx="2" fill="#b8891a" opacity="0.85"/>
      <path d="M11.5 22Q18 13 24.5 22" fill="none" stroke="#b8891a" strokeWidth="4" strokeLinecap="round" opacity="0.85"/>
      <circle cx="18" cy="14" r="2" fill="#b8891a" opacity="0" className="ef1"/>
      <circle cx="18" cy="14" r="2" fill="#b8891a" opacity="0" className="ef2"/>
      <circle cx="18" cy="14" r="2" fill="#b8891a" opacity="0" className="ef3"/>
      <circle cx="29" cy="8" className="ed"/>
      <circle cx="29" cy="8" className="ep"/>
    </svg>
    <div>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:"14px",color:dark?"#1a1a1e":"#f5f0e8",letterSpacing:"-0.3px",lineHeight:1}}>Datagate</div>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:"6.5px",color:"#b8891a",letterSpacing:"1.8px",textTransform:"uppercase",marginTop:"2px"}}>Verified Employment</div>
    </div>
  </Link>
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
  const router    = useRouter();

  const handlePhone = v => setPhone(v.replace(/\D/g,"").slice(0,10));

  const handle = async () => {
    setError(""); setLoading(true);
    if (isSignup && phone.length !== 10) { setError("Phone must be 10 digits"); setLoading(false); return; }
    const body = isSignup ? {email,password,name,phone,role:"employee"} : {email,password};
    try {
      const res  = await fetch(`${API}${isSignup?"/auth/register":"/auth/login"}`, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const data = await res.json();
      if (!res.ok) { setError(parseError(data)); return; }
      login(data.access_token, data.refresh_token, {role:data.role,name:data.name||name||email,email:data.email||email,phone});
      router.push("/employee/personal");
    } catch { setError("Network error — please try again"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#faf8f4;font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}

        /* ── Two column layout ── */
        .pg{min-height:100vh;display:grid;grid-template-columns:1fr 1fr}

        /* ── Left — warm cream panel ── */
        .lft{
          background:#faf8f4;border-right:1px solid #ede8df;
          display:flex;flex-direction:column;
          padding:2.5rem 3rem;
        }
        .lft-body{flex:1;display:flex;flex-direction:column;justify-content:center;padding:2rem 0}
        .badge{display:inline-flex;align-items:center;gap:.5rem;font-size:.64rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#b8891a;margin-bottom:1.5rem}
        .badge-line{width:16px;height:1.5px;background:#b8891a}
        .h2{font-family:'Playfair Display',serif;font-size:clamp(1.8rem,2.8vw,2.6rem);font-weight:600;line-height:1.2;color:#1a1612;letter-spacing:-.4px;margin-bottom:1rem}
        .h2 em{font-style:italic;color:#b8891a}
        .desc{font-size:.875rem;color:#8c8075;line-height:1.8;margin-bottom:2.5rem;max-width:340px}

        /* Steps */
        .steps{display:flex;flex-direction:column;gap:1.1rem;margin-bottom:2.5rem}
        .step{display:flex;align-items:flex-start;gap:.9rem}
        .sn{width:26px;height:26px;border-radius:7px;flex-shrink:0;background:#fff;border:1.5px solid #ede8df;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;color:#1a1612}
        .st{font-size:.83rem;font-weight:700;color:#2a2520;margin-bottom:2px}
        .sd{font-size:.77rem;color:#9a8f85;line-height:1.55}

        /* Consent flow card */
        .flow{background:#fff;border:1.5px solid #ede8df;border-radius:14px;padding:1.4rem}
        .flow-lbl{font-size:.62rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#ccc4b8;margin-bottom:.85rem}
        .flow-row{display:flex;align-items:center;gap:.5rem;margin-bottom:.6rem}
        .fn{flex:1;background:#faf8f4;border:1px solid #ede8df;border-radius:8px;padding:.5rem .7rem;font-size:.71rem;font-weight:600;color:#8c8075;text-align:center}
        .fa{color:#d4cec6;font-size:.85rem;flex-shrink:0}
        .consent-bar{display:flex;align-items:center;gap:.5rem;background:#fdf9ec;border:1px solid #e8d99a;border-radius:8px;padding:.5rem .75rem}
        .c-dot{width:7px;height:7px;border-radius:50%;background:#b8891a;flex-shrink:0;animation:cpulse 2s ease-in-out infinite}
        @keyframes cpulse{0%,100%{opacity:1}50%{opacity:.35}}
        .consent-bar span{font-size:.71rem;font-weight:600;color:#b8891a}

        /* Footer */
        .lft-ft{padding-top:1.5rem;border-top:1px solid #ede8df;display:flex;justify-content:space-between;align-items:center;margin-top:auto}
        .fc{font-size:.68rem;color:#ccc4b8}
        .fl{display:flex;gap:1rem}
        .fla{font-size:.68rem;color:#ccc4b8;text-decoration:none;transition:color .15s}
        .fla:hover{color:#b8891a}

        /* ── Right — white form ── */
        .rgt{background:#fff;display:flex;align-items:center;justify-content:center;padding:3rem 2.5rem}
        .form{width:100%;max-width:390px;display:flex;flex-direction:column;gap:1.2rem}

        .fhd{font-family:'Playfair Display',serif;font-size:1.75rem;font-weight:600;color:#1a1612;letter-spacing:-.4px}
        .fsb{font-size:.83rem;color:#8c8075;margin-top:-.15rem}

        .fld{display:flex;flex-direction:column;gap:.38rem}
        .flb{font-size:.71rem;font-weight:600;color:#8c8075;letter-spacing:.3px;text-transform:uppercase}
        .fin{
          padding:.78rem 1rem;background:#faf8f4;border:1.5px solid #e8e2d8;
          border-radius:10px;font-family:'DM Sans',sans-serif;font-size:.875rem;color:#1a1612;
          outline:none;width:100%;transition:border-color .15s,background .15s;
        }
        .fin::placeholder{color:#ccc4b8}
        .fin:focus{border-color:#b8891a;background:#fff;box-shadow:0 0 0 3px rgba(184,137,26,.07)}
        .pw{position:relative}
        .pw .fin{padding-right:2.75rem}
        .ey{position:absolute;right:.85rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#ccc4b8;padding:0;transition:color .15s}
        .ey:hover{color:#b8891a}
        .pht{font-size:.67rem;color:#ccc4b8}

        .err{font-size:.78rem;color:#b91c1c;padding:.6rem .9rem;background:#fef2f2;border:1px solid #fecaca;border-radius:9px}

        .sub{padding:.88rem;background:#1a1612;color:#faf8f4;border:none;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:.88rem;font-weight:700;cursor:pointer;transition:all .15s}
        .sub:hover:not(:disabled){background:#2d2820;transform:translateY(-1px)}
        .sub:disabled{opacity:.4;cursor:not-allowed}

        .fgt{text-align:center}
        .fgt a{font-size:.78rem;color:#8c8075;text-decoration:none;transition:color .15s}
        .fgt a:hover{color:#b8891a}

        .dvr{display:flex;align-items:center;gap:.75rem}
        .dvl{flex:1;height:1px;background:#f0ebe2}
        .dvt{font-size:.68rem;color:#ccc4b8}

        .tgl{text-align:center;font-size:.83rem;color:#8c8075}
        .tgb{color:#b8891a;cursor:pointer;font-weight:700;background:none;border:none;font-family:inherit;font-size:inherit}
        .tgb:hover{text-decoration:underline}

        .cft{display:flex;justify-content:center;padding-top:.2rem}
        .cft a{font-size:.68rem;color:#ccc4b8;text-decoration:none;transition:color .15s}
        .cft a:hover{color:#b8891a}

        @media(max-width:900px){
          .pg{grid-template-columns:1fr}
          .lft{display:none}
          .rgt{padding:3rem 1.5rem;min-height:100vh;background:#faf8f4}
        }
      `}</style>

      <div className="pg">
        {/* Left */}
        <div className="lft">
          <Logo dark />
          <div className="lft-body">
            <div className="badge"><span className="badge-line"/>Employee Portal</div>
            <h2 className="h2">Your career data,<br/><em>your control.</em></h2>
            <p className="desc">Build a verified employment profile once. Share it securely with any employer — with your consent, every single time.</p>
            <div className="steps">
              {[["1","Create your profile","Personal, education, employment — filled once, forever."],["2","Upload documents","Aadhaar, PAN, certificates — encrypted and stored securely."],["3","Approve and share","Every employer request needs your approval. You decide."]].map(([n,t,d]) => (
                <div className="step" key={n}><div className="sn">{n}</div><div><div className="st">{t}</div><div className="sd">{d}</div></div></div>
              ))}
            </div>
            <div className="flow">
              <div className="flow-lbl">How your data flows</div>
              <div className="flow-row">
                <div className="fn">Your Profile</div>
                <span className="fa">→</span>
                <div className="fn">Employer Request</div>
                <span className="fa">→</span>
                <div className="fn">Your Approval</div>
              </div>
              <div className="consent-bar">
                <div className="c-dot"/>
                <span>Data only moves after your explicit consent</span>
              </div>
            </div>
          </div>
          <div className="lft-ft">
            <span className="fc">© 2026 Datagate</span>
            <div className="fl"><a href="/privacy" className="fla">Privacy Policy</a></div>
          </div>
        </div>

        {/* Right */}
        <div className="rgt">
          <div className="form">
            <div>
              <div className="fhd">{isSignup ? "Create account" : "Welcome back"}</div>
              <div className="fsb">{isSignup ? "Start your verified employment journey" : "Sign in to your employee account"}</div>
            </div>
            {isSignup && (<>
              <div className="fld"><label className="flb">Full Name</label><input className="fin" placeholder="Manoj Kumar" value={name} onChange={e=>setName(e.target.value)}/></div>
              <div className="fld">
                <label className="flb">Mobile Number</label>
                <input className="fin" placeholder="9876543210" value={phone} onChange={e=>handlePhone(e.target.value)} inputMode="numeric" maxLength={10}/>
                <span className="pht">{phone.length}/10 digits</span>
              </div>
            </>)}
            <div className="fld"><label className="flb">Email Address</label><input className="fin" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/></div>
            <div className="fld">
              <label className="flb">Password</label>
              <div className="pw">
                <input className="fin" type={showPwd?"text":"password"} placeholder="Min. 8 characters" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()}/>
                <button className="ey" type="button" onClick={()=>setShowPwd(v=>!v)} tabIndex={-1}><Eye open={showPwd}/></button>
              </div>
            </div>
            {error && <div className="err">{error}</div>}
            <button className="sub" onClick={handle} disabled={loading}>{loading?"Please wait…":isSignup?"Create account":"Sign in"}</button>
            {!isSignup && <div className="fgt"><a href="/forgot-password">Forgot password?</a></div>}
            <div className="dvr"><div className="dvl"/><span className="dvt">or</span><div className="dvl"/></div>
            <div className="tgl">
              {isSignup?"Already have an account? ":"Don't have an account? "}
              <button className="tgb" onClick={()=>{setIsSignup(v=>!v);setError("");setShowPwd(false);}}>
                {isSignup?"Sign in":"Sign up"}
              </button>
            </div>
            <div className="cft"><a href="/privacy">Privacy Policy</a></div>
          </div>
        </div>
      </div>
    </>
  );
}