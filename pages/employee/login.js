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

export default function EmployeeLogin() {
  const [mode,     setMode]     = useState("login"); // login | signup | forgot
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [name,     setName]     = useState("");
  const [phone,    setPhone]    = useState("");
  const [error,    setError]    = useState("");
  const [info,     setInfo]     = useState("");
  const [loading,  setLoading]  = useState(false);
  const { login } = useAuth();
  const router    = useRouter();

  const handlePhone = v => setPhone(v.replace(/\D/g,"").slice(0,10));

  const handle = async () => {
    setError(""); setInfo(""); setLoading(true);
    try {
      if (mode === "forgot") {
        const res = await fetch(`${API}/auth/forgot-password`, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});
        const d = await res.json();
        if (!res.ok) { setError(parseError(d)); return; }
        setInfo("Reset link sent — check your email.");
        return;
      }
      if (mode === "signup" && phone.length !== 10) { setError("Phone must be 10 digits"); return; }
      const body = mode === "signup" ? {email,password,name,phone,role:"employee"} : {email,password};
      const res  = await fetch(`${API}${mode==="signup"?"/auth/register":"/auth/login"}`, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const d    = await res.json();
      if (!res.ok) { setError(parseError(d)); return; }
      login(d.access_token, d.refresh_token, {role:d.role,name:d.name||name||email,email:d.email||email,phone});
      router.push("/employee/personal");
    } catch { setError("Network error — please try again"); }
    finally { setLoading(false); }
  };

  const titles = { login:["Welcome back","Sign in to your account"], signup:["Create account","Start your verified employment journey"], forgot:["Reset password","Enter your email and we'll send a reset link"] };
  const [title, sub] = titles[mode];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}

        .pg{min-height:100vh;display:grid;grid-template-columns:1fr 1fr}

        /* Left — sage green panel */
        .lft{
          background:#e8f0e8;
          border-right:1px solid #d4e4d4;
          display:flex;flex-direction:column;
          padding:2.5rem 3rem;
          position:relative;overflow:hidden;
        }
        .lft::before{
          content:'';position:absolute;top:-80px;right:-80px;
          width:300px;height:300px;border-radius:50%;
          background:rgba(45,106,79,0.06);pointer-events:none;
        }
        .lft-body{flex:1;display:flex;flex-direction:column;justify-content:center;padding:2rem 0;position:relative;z-index:1}
        .lft-logo{display:inline-flex;align-items:center;gap:9px;text-decoration:none;position:relative;z-index:1}
        .lft-logo-text{font-family:'DM Sans',sans-serif;font-weight:700;font-size:"14px";color:#1c3a28;letter-spacing:"-0.3px";line-height:1}
        .badge{display:inline-flex;align-items:center;gap:.45rem;font-size:.64rem;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#2d6a4f;margin-bottom:1.5rem}
        .badge::before{content:'';width:16px;height:1.5px;background:#2d6a4f}
        .h2{font-family:'Cormorant Garamond',serif;font-size:clamp(1.8rem,2.8vw,2.5rem);font-weight:600;line-height:1.2;color:#1c3a28;letter-spacing:-.3px;margin-bottom:.9rem}
        .h2 em{font-style:italic;color:#2d6a4f}
        .desc{font-size:.875rem;color:#4a7c59;line-height:1.8;margin-bottom:2.5rem;max-width:340px}

        /* Steps */
        .steps{display:flex;flex-direction:column;gap:1rem;margin-bottom:2.5rem}
        .step{display:flex;align-items:flex-start;gap:.85rem}
        .snum{width:26px;height:26px;border-radius:7px;flex-shrink:0;background:#fff;border:1.5px solid #c5d9c5;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;color:#2d6a4f}
        .stxt-t{font-size:.83rem;font-weight:700;color:#1c3a28;margin-bottom:1px}
        .stxt-d{font-size:.76rem;color:#6b9e7a;line-height:1.5}

        /* Consent chip */
        .chip{display:flex;align-items:center;gap:.5rem;background:#fff;border:1.5px solid #c5d9c5;border-radius:10px;padding:.7rem .9rem}
        .chip-dot{width:7px;height:7px;border-radius:50%;background:#2d6a4f;flex-shrink:0;animation:pd 2s ease-in-out infinite}
        @keyframes pd{0%,100%{opacity:1}50%{opacity:.3}}
        .chip span{font-size:.75rem;font-weight:600;color:#2d6a4f}

        /* Footer */
        .lft-ft{padding-top:1.5rem;border-top:1px solid #c5d9c5;display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1}
        .fc{font-size:.68rem;color:#8fb89a}
        .fla{font-size:.68rem;color:#8fb89a;text-decoration:none;transition:color .15s}
        .fla:hover{color:#2d6a4f}

        /* Right — white form */
        .rgt{background:#fff;display:flex;align-items:center;justify-content:center;padding:3rem 2.5rem}
        .form{width:100%;max-width:390px;display:flex;flex-direction:column;gap:1.2rem}

        .fhd{font-family:'Cormorant Garamond',serif;font-size:1.85rem;font-weight:600;color:#18151f;letter-spacing:-.3px;line-height:1.1}
        .fsb{font-size:.83rem;color:#b8b3c2;margin-top:-.1rem}

        .fld{display:flex;flex-direction:column;gap:.38rem}
        .flb{font-size:.7rem;font-weight:700;color:#7a7386;letter-spacing:.3px;text-transform:uppercase}
        .fin{padding:.78rem 1rem;background:#f8f7fa;border:1.5px solid #ede9f5;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:.875rem;color:#18151f;outline:none;width:100%;transition:all .15s}
        .fin::placeholder{color:#d8d4e3}
        .fin:focus{border-color:#2d6a4f;background:#fff;box-shadow:0 0 0 3px rgba(45,106,79,.07)}
        .pw-wrap{position:relative}
        .pw-wrap .fin{padding-right:2.75rem}
        .ey{position:absolute;right:.85rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#d8d4e3;padding:0;transition:color .15s}
        .ey:hover{color:#7a7386}
        .pht{font-size:.67rem;color:#d8d4e3}

        .err{font-size:.78rem;color:#b91c1c;padding:.6rem .9rem;background:#fef2f2;border:1px solid #fecaca;border-radius:8px}
        .inf{font-size:.78rem;color:#2d6a4f;padding:.6rem .9rem;background:#f0f9f4;border:1px solid #c5d9c5;border-radius:8px}

        .sub{padding:.88rem;background:#2d6a4f;color:#fff;border:none;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:.88rem;font-weight:700;cursor:pointer;transition:all .15s}
        .sub:hover:not(:disabled){background:#235c40;transform:translateY(-1px)}
        .sub:disabled{opacity:.45;cursor:not-allowed}

        .row{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem}
        .lnk{font-size:.78rem;color:#7a7386;background:none;border:none;cursor:pointer;font-family:inherit;transition:color .15s;padding:0}
        .lnk:hover{color:#2d6a4f}
        .lnk-bold{font-weight:700;color:#2d6a4f}

        .dvr{display:flex;align-items:center;gap:.75rem}
        .dvl{flex:1;height:1px;background:#f2f0f5}
        .dvt{font-size:.68rem;color:#d8d4e3}

        .tgl{text-align:center;font-size:.83rem;color:#b8b3c2}
        .tgb{color:#2d6a4f;cursor:pointer;font-weight:700;background:none;border:none;font-family:inherit;font-size:inherit;padding:0}
        .tgb:hover{text-decoration:underline}

        .cft{display:flex;justify-content:center;padding-top:.2rem}
        .cft a{font-size:.68rem;color:#d8d4e3;text-decoration:none;transition:color .15s}
        .cft a:hover{color:#2d6a4f}

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
                <style>{`.ep2{animation:ep2a 2s ease-out infinite;fill:none;stroke:#2d6a4f;stroke-width:1}.ed2{animation:ed2a 2s ease-in-out infinite;fill:#2d6a4f}.ef21{animation:ef2a 2.4s ease-in-out infinite}.ef22{animation:ef2a 2.4s ease-in-out infinite .8s}.ef23{animation:ef2a 2.4s ease-in-out infinite 1.6s}@keyframes ep2a{0%{r:4.5;opacity:.4}100%{r:13;opacity:0}}@keyframes ed2a{0%,100%{r:3.5}50%{r:2.6}}@keyframes ef2a{0%{opacity:0;transform:translateY(0)}15%{opacity:.9}85%{opacity:.9}100%{opacity:0;transform:translateY(20px)}}`}</style>
              </defs>
              <path d="M18 1.5L33 8V23Q33 36.5 18 39Q3 36.5 3 23V8Z" fill="rgba(45,106,79,0.12)" stroke="#2d6a4f" strokeWidth="1" strokeOpacity="0.5"/>
              <rect x="9.5" y="22" width="4.5" height="13" rx="1.8" fill="#2d6a4f"/>
              <rect x="22" y="22" width="4.5" height="13" rx="1.8" fill="#2d6a4f"/>
              <path d="M11.5 22Q18 13.5 24.5 22" fill="none" stroke="#2d6a4f" strokeWidth="3.8" strokeLinecap="round"/>
              <circle cx="18" cy="14" r="1.8" fill="#2d6a4f" opacity="0" className="ef21"/>
              <circle cx="18" cy="14" r="1.8" fill="#2d6a4f" opacity="0" className="ef22"/>
              <circle cx="18" cy="14" r="1.8" fill="#2d6a4f" opacity="0" className="ef23"/>
              <circle cx="28.5" cy="7.5" className="ed2"/>
              <circle cx="28.5" cy="7.5" className="ep2"/>
            </svg>
            <div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:"14px",color:"#1c3a28",letterSpacing:"-0.3px",lineHeight:1}}>Datagate</div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:"6.5px",color:"#2d6a4f",letterSpacing:"2px",textTransform:"uppercase",marginTop:"3px"}}>Verified Employment</div>
            </div>
          </Link>

          <div className="lft-body">
            <div className="badge">Employee Portal</div>
            <h2 className="h2">Your career data,<br/><em>your control.</em></h2>
            <p className="desc">Build a verified employment profile once. Share it securely with any employer — with your consent, every single time.</p>

            <div className="steps">
              {[["1","Create your profile","Personal, education, employment — filled once, forever."],["2","Upload documents","Aadhaar, PAN, certificates — secured and stored."],["3","Approve and share","Every request needs your approval. You decide."]].map(([n,t,d]) => (
                <div className="step" key={n}>
                  <div className="snum">{n}</div>
                  <div><div className="stxt-t">{t}</div><div className="stxt-d">{d}</div></div>
                </div>
              ))}
            </div>

            <div className="chip">
              <div className="chip-dot"/>
              <span>Data moves only after your explicit consent</span>
            </div>
          </div>

          <div className="lft-ft">
            <span className="fc">© 2026 Datagate</span>
            <a href="/privacy" className="fla">Privacy Policy</a>
          </div>
        </div>

        {/* Right */}
        <div className="rgt">
          <div className="form">
            <div>
              <div className="fhd">{title}</div>
              <div className="fsb">{sub}</div>
            </div>

            {mode === "signup" && (
              <>
                <div className="fld"><label className="flb">Full Name</label><input className="fin" placeholder="Manoj Kumar" value={name} onChange={e=>setName(e.target.value)}/></div>
                <div className="fld">
                  <label className="flb">Mobile Number</label>
                  <input className="fin" placeholder="9876543210" value={phone} onChange={e=>handlePhone(e.target.value)} inputMode="numeric" maxLength={10}/>
                  <span className="pht">{phone.length}/10 digits</span>
                </div>
              </>
            )}

            <div className="fld"><label className="flb">Email Address</label><input className="fin" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/></div>

            {mode !== "forgot" && (
              <div className="fld">
                <label className="flb">Password</label>
                <div className="pw-wrap">
                  <input className="fin" type={showPwd?"text":"password"} placeholder="Min. 8 characters" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()}/>
                  <button className="ey" type="button" onClick={()=>setShowPwd(v=>!v)} tabIndex={-1}><Eye open={showPwd}/></button>
                </div>
              </div>
            )}

            {error && <div className="err">{error}</div>}
            {info  && <div className="inf">{info}</div>}

            <button className="sub" onClick={handle} disabled={loading}>
              {loading ? "Please wait…" : mode==="signup" ? "Create account" : mode==="forgot" ? "Send reset link" : "Sign in"}
            </button>

            {mode === "login" && (
              <div className="row">
                <button className="lnk" onClick={()=>{setMode("forgot");setError("")}}>Forgot password?</button>
              </div>
            )}

            {mode === "forgot" && (
              <button className="lnk" style={{textAlign:"center"}} onClick={()=>{setMode("login");setError("");setInfo("")}}>← Back to sign in</button>
            )}

            {mode !== "forgot" && (
              <>
                <div className="dvr"><div className="dvl"/><span className="dvt">or</span><div className="dvl"/></div>
                <div className="tgl">
                  {mode==="login" ? "Don't have an account? " : "Already have an account? "}
                  <button className="tgb" onClick={()=>{setMode(mode==="login"?"signup":"login");setError("")}}>
                    {mode==="login" ? "Sign up" : "Sign in"}
                  </button>
                </div>
              </>
            )}

            <div className="cft"><a href="/privacy">Privacy Policy</a></div>
          </div>
        </div>
      </div>
    </>
  );
}