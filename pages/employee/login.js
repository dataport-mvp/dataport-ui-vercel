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
  const [mode,     setMode]     = useState("login");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [name,     setName]     = useState("");
  const [phone,    setPhone]    = useState("");
  const [error,    setError]    = useState("");
  const [info,     setInfo]     = useState("");
  const [loading,  setLoading]  = useState(false);
  const { login }  = useAuth();
  const router     = useRouter();

  const handlePhone = v => setPhone(v.replace(/\D/g,"").slice(0,10));

  const handle = async () => {
    setError(""); setInfo(""); setLoading(true);
    try {
      if (mode === "forgot") {
        const res = await fetch(`${API}/auth/forgot-password`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});
        const d = await res.json();
        if (!res.ok) { setError(parseError(d)); return; }
        setInfo("Reset link sent — check your email."); return;
      }
      if (mode === "signup" && phone.length !== 10) { setError("Phone must be 10 digits"); return; }
      const body = mode === "signup" ? {email,password,name,phone,role:"employee"} : {email,password};
      const res  = await fetch(`${API}${mode==="signup"?"/auth/register":"/auth/login"}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const d    = await res.json();
      if (!res.ok) { setError(parseError(d)); return; }
      login(d.access_token, d.refresh_token, {role:d.role,name:d.name||name||email,email:d.email||email,phone});
      router.push("/employee/personal");
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

        /* ── LEFT — sage green, evolved from current ── */
        .lft{
          background:#ecf0e8;
          border-right:1px solid #d4dfd0;
          display:flex;flex-direction:column;
          padding:2.5rem 3rem;
          position:relative;overflow:hidden;
        }
        .lft::before{content:'';position:absolute;top:-80px;right:-80px;width:320px;height:320px;border-radius:50%;background:rgba(45,106,79,.07);pointer-events:none}
        .lft::after{content:'';position:absolute;bottom:-60px;left:-40px;width:240px;height:240px;border-radius:50%;background:rgba(45,106,79,.04);pointer-events:none}

        /* Logo — exact same as current live site */
        .lft-logo{display:inline-flex;align-items:center;gap:9px;text-decoration:none;position:relative;z-index:1}
        .lft-logo-icon{width:34px;height:34px;border-radius:8px;background:#1c3a28;display:flex;align-items:center;justify-content:center}
        .lft-logo-name{font-family:'DM Sans',sans-serif;font-weight:700;font-size:14px;color:#1c3a28;letter-spacing:-.3px;line-height:1}
        .lft-logo-sub{font-family:'DM Sans',sans-serif;font-weight:600;font-size:6.5px;color:#2d6a4f;letter-spacing:2px;text-transform:uppercase;margin-top:3px}

        .lft-body{flex:1;display:flex;flex-direction:column;justify-content:center;padding:2.5rem 0;position:relative;z-index:1}
        .badge{display:inline-flex;align-items:center;gap:.45rem;font-size:.64rem;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#2d6a4f;margin-bottom:1.4rem}
        .badge::before{content:'';width:16px;height:1.5px;background:#2d6a4f}
        .lft-h{font-family:'Cormorant Garamond',serif;font-size:clamp(1.9rem,2.8vw,2.7rem);font-weight:500;line-height:1.12;color:#1c3a28;letter-spacing:-.3px;margin-bottom:.9rem}
        .lft-h em{font-style:italic;color:#2d6a4f}
        .lft-p{font-size:.875rem;color:#4a7c59;line-height:1.8;margin-bottom:2rem;max-width:340px}

        /* Steps — same as current */
        .steps{display:flex;flex-direction:column;gap:1rem;margin-bottom:2rem}
        .step{display:flex;align-items:flex-start;gap:.85rem}
        .snum{width:26px;height:26px;border-radius:7px;flex-shrink:0;background:#fff;border:1.5px solid #c5d9c5;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;color:#2d6a4f}
        .stxt-t{font-size:.83rem;font-weight:700;color:#1c3a28;margin-bottom:1px}
        .stxt-d{font-size:.76rem;color:#6b9e7a;line-height:1.5}

        /* Consent chip — same as current */
        .chip{display:flex;align-items:center;gap:.5rem;background:#fff;border:1.5px solid #c5d9c5;border-radius:10px;padding:.7rem .9rem;margin-bottom:1.5rem}
        .chip-dot{width:7px;height:7px;border-radius:50%;background:#2d6a4f;flex-shrink:0;animation:blink 2s ease-in-out infinite}
        .chip span{font-size:.75rem;font-weight:600;color:#2d6a4f}

        /* Stats row — NEW, premium addition */
        .stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
        .stat-box{background:#fff;border:1px solid #c5d9c5;border-radius:8px;padding:11px 13px}
        .stat-box-num{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:500;color:#2d6a4f;line-height:1;letter-spacing:-.5px;margin-bottom:3px}
        .stat-box-lbl{font-size:10px;color:#6b9e7a;font-weight:500;line-height:1.3}

        .lft-ft{padding-top:1.5rem;border-top:1px solid #c5d9c5;display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1}
        .lft-ft-copy{font-size:.68rem;color:#8fb89a}
        .lft-ft-links{display:flex;gap:1rem}
        .lft-ft-link{font-size:.68rem;color:#8fb89a;text-decoration:none;transition:color .15s}
        .lft-ft-link:hover{color:#2d6a4f}

        /* ── RIGHT — same clean white as current ── */
        .rgt{background:#f5f2ee;display:flex;align-items:center;justify-content:center;padding:3rem 2.5rem}
        .form-wrap{width:100%;max-width:400px;animation:fadeUp .5s ease both}

        .form-back{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:#b8b3c2;margin-bottom:2rem;cursor:pointer;text-decoration:none;transition:color .15s}
        .form-back:hover{color:#2d6a4f}

        .form-ey{font-size:.64rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#2d6a4f;margin-bottom:6px}
        .fhd{font-family:'Cormorant Garamond',serif;font-size:1.85rem;font-weight:500;color:#18151f;letter-spacing:-.3px;margin-bottom:4px;line-height:1.15}
        .fsb{font-size:.83rem;color:#b8b3c2;margin-bottom:1.75rem}

        /* Mode tabs */
        .tabs{display:flex;background:#ede9e4;border:1.5px solid #c8c2b8;border-radius:9px;padding:3px;gap:3px;margin-bottom:1.4rem}
        .tab{flex:1;padding:7px;border:none;border-radius:7px;font-family:inherit;font-size:.8rem;font-weight:600;cursor:pointer;transition:all .15s;background:transparent;color:#b8b3c2}
        .tab.on{background:#fff;color:#111;border:1.5px solid #c8c2b8;box-shadow:0 1px 4px rgba(0,0,0,.08)}

        .fld{display:flex;flex-direction:column;gap:.35rem;margin-bottom:.9rem}
        .flb{font-size:.67rem;font-weight:700;color:#7a7386;letter-spacing:.4px;text-transform:uppercase}
        .flb span{color:#2d6a4f}
        .fin{padding:.78rem 1rem;background:#fff;border:1.5px solid #c8c2b8;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:.875rem;color:#18151f;outline:none;width:100%;transition:all .15s}
        .fin::placeholder{color:#d8d4e3}
        .fin:focus{border-color:#2d6a4f;background:#fff;box-shadow:0 0 0 3px rgba(45,106,79,.07)}
        .pw-wrap{position:relative}
        .pw-wrap .fin{padding-right:2.75rem}
        .ey{position:absolute;right:.85rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#d8d4e3;padding:0;transition:color .15s}
        .ey:hover{color:#7a7386}
        .hint{font-size:.67rem;color:#d8d4e3;margin-top:2px}

        .err{font-size:.78rem;color:#b91c1c;padding:.6rem .9rem;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin-bottom:.75rem}
        .inf{font-size:.78rem;color:#2d6a4f;padding:.6rem .9rem;background:#f0f9f4;border:1px solid #c5d9c5;border-radius:8px;margin-bottom:.75rem}

        .submit{padding:.88rem;background:#0d6e6e;box-shadow:0 4px 16px rgba(13,110,110,.3);color:#fff;border:none;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:.9rem;font-weight:700;cursor:pointer;transition:all .15s;width:100%;margin-bottom:.75rem;box-shadow:0 4px 16px rgba(45,106,79,.22)}
        .submit:hover:not(:disabled){background:#235c40;transform:translateY(-1px)}
        .submit:disabled{opacity:.45;cursor:not-allowed;transform:none}

        .form-link-row{text-align:center;margin-bottom:.75rem}
        .form-link{font-size:.78rem;color:#b8b3c2;background:none;border:none;cursor:pointer;font-family:inherit;transition:color .15s;padding:0}
        .form-link:hover{color:#2d6a4f}

        .dvr{display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem}
        .dvl{flex:1;height:1px;background:#f2f0f5}
        .dvt{font-size:.68rem;color:#d8d4e3}

        .toggle{text-align:center;font-size:.83rem;color:#b8b3c2;margin-bottom:1rem}
        .toggle-btn{color:#2d6a4f;cursor:pointer;font-weight:700;background:none;border:none;font-family:inherit;font-size:inherit;padding:0}
        .toggle-btn:hover{text-decoration:underline}

        /* Trust grid — NEW premium addition */
        .trust-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;border-top:1px solid #f2f0f5;padding-top:1rem;margin-bottom:.75rem}
        .trust-item{display:flex;align-items:center;gap:5px;font-size:10.5px;color:#b8b3c2}
        .trust-ck{width:14px;height:14px;border-radius:3px;background:#f0f9f4;border:1px solid #c5d9c5;display:flex;align-items:center;justify-content:center;font-size:8px;color:#2d6a4f;flex-shrink:0}

        .footer-row{display:flex;justify-content:center;gap:16px}
        .footer-lk{font-size:.67rem;color:#d8d4e3;text-decoration:none;transition:color .15s}
        .footer-lk:hover{color:#2d6a4f}

        @media(max-width:900px){
          .pg{grid-template-columns:1fr}
          .lft{display:none}
          .rgt{padding:3rem 1.5rem;min-height:100vh}
        }
      `}</style>

      <div className="pg">
        {/* LEFT */}
        <div className="lft">
          <Link href="/" className="lft-logo">
            <div className="lft-logo-icon">
              <svg width="16" height="18" viewBox="0 0 28 32" fill="none"><rect x="7" y="17" width="4" height="10" rx="1.5" fill="white"/><rect x="17" y="17" width="4" height="10" rx="1.5" fill="white"/><path d="M9 17Q14 10 19 17" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>
            </div>
            <div><div className="lft-logo-name">Datagate</div><div className="lft-logo-sub">Verified Employment</div></div>
          </Link>

          <div className="lft-body">
            <div className="badge">Employee Portal</div>
            <h2 className="lft-h">Your career data,<br/><em>your control.</em></h2>
            <p className="lft-p">Build a verified employment profile once. Share it securely with any employer — with your consent, every single time.</p>

            <div className="steps">
              {[["1","Create your profile","Personal, education, employment — filled once, forever."],
                ["2","Upload documents","Aadhaar, PAN, certificates — encrypted and stored."],
                ["3","Approve and share","Every request needs your approval. You decide."]].map(([n,t,d])=>(
                <div className="step" key={n}><div className="snum">{n}</div><div><div className="stxt-t">{t}</div><div className="stxt-d">{d}</div></div></div>
              ))}
            </div>

            <div className="chip"><div className="chip-dot"/><span>Data moves only after your explicit consent</span></div>

            <div className="stats-row">
              {[["2,400+","Verified profiles"],["1-click","Consent requests"],["100%","Employee controlled"]].map(([n,l])=>(
                <div className="stat-box" key={l}><div className="stat-box-num">{n}</div><div className="stat-box-lbl">{l}</div></div>
              ))}
            </div>
          </div>

          <div className="lft-ft">
            <span className="lft-ft-copy">© 2026 Datagate Technologies</span>
            <div className="lft-ft-links">
              <a href="/privacy" className="lft-ft-link">Privacy Policy</a>
              <a href="mailto:support@datagate.co.in" className="lft-ft-link">Support</a>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="rgt">
          <div className="form">
            <Link href="/" className="form-back">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to Datagate
            </Link>

            <div className="form-ey">Employee Portal</div>
            <div className="fhd">{mode==="forgot"?"Reset password":mode==="signup"?"Create account":"Welcome back"}</div>
            <div className="fsb">{mode==="forgot"?"Enter your email and we'll send a reset link":mode==="signup"?"Start your verified employment journey":"Sign in to your account"}</div>

            {mode !== "forgot" && (
              <div className="tabs">
                {[["login","Sign in"],["signup","Create account"]].map(([m,l])=>(
                  <button key={m} className={`tab${mode===m?" on":""}`} onClick={()=>{setMode(m);setError("");setInfo("")}}>{l}</button>
                ))}
              </div>
            )}

            {mode==="signup" && <>
              <div className="fld"><label className="flb">Full Name <span>*</span></label><input className="fin" placeholder="Your full name" value={name} onChange={e=>setName(e.target.value)}/></div>
              <div className="fld"><label className="flb">Mobile Number <span>*</span></label><input className="fin" placeholder="10-digit mobile number" value={phone} onChange={e=>handlePhone(e.target.value)} inputMode="numeric" maxLength={10}/><span className="hint">{phone.length}/10 digits</span></div>
            </>}

            <div className="fld"><label className="flb">Email Address <span>*</span></label><input className="fin" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/></div>

            {mode!=="forgot" && (
              <div className="fld"><label className="flb">Password <span>*</span></label>
                <div className="pw-wrap">
                  <input className="fin" type={showPwd?"text":"password"} placeholder="Min. 8 characters" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()}/>
                  <button className="ey" type="button" onClick={()=>setShowPwd(v=>!v)} tabIndex={-1}><Eye open={showPwd}/></button>
                </div>
              </div>
            )}

            {error && <div className="err">{error}</div>}
            {info  && <div className="inf">{info}</div>}

            <button className="submit" onClick={handle} disabled={loading}>
              {loading?"Please wait…":mode==="signup"?"Create account →":mode==="forgot"?"Send reset link":"Sign in →"}
            </button>

            {mode==="login" && <div className="form-link-row"><button className="form-link" onClick={()=>{setMode("forgot");setError("")}}>Forgot password?</button></div>}
            {mode==="forgot" && <div className="form-link-row"><button className="form-link" onClick={()=>{setMode("login");setError("");setInfo("")}}>← Back to sign in</button></div>}

            {mode!=="forgot" && <>
              <div className="dvr"><div className="dvl"/><span className="dvt">or</span><div className="dvl"/></div>
              <div className="toggle">{mode==="login"?"Don't have an account? ":"Already have an account? "}<button className="toggle-btn" onClick={()=>{setMode(mode==="login"?"signup":"login");setError("")}}>{mode==="login"?"Sign up free":"Sign in"}</button></div>
            </>}

            <div className="trust-grid">
              {["DPDP Act 2023 compliant","End-to-end encrypted","No data sold ever","Delete anytime"].map(t=>(
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