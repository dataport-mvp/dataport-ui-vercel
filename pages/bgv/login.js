// pages/bgv/login.js
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const Eye = ({ open }) => open ? (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
) : (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
);

export default function BgvLogin() {
  const router = useRouter();
  const { loginWithCredentials } = useAuth();
  const [mode,        setMode]        = useState("login");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPwd,     setShowPwd]     = useState(false);
  const [name,        setName]        = useState("");
  const [company,     setCompany]     = useState("");
  const [phone,       setPhone]       = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [pending,     setPending]     = useState(false);
  const [registered,  setRegistered]  = useState(false);

  const handlePhone = v => setPhone(v.replace(/\D/g,"").slice(0,10));

  const handle = async () => {
    setError(""); setPending(false); setLoading(true);
    try {
      if (mode === "register") {
        if (!name.trim())        { setError("Full name is required"); setLoading(false); return; }
        if (!company.trim())     { setError("Company name is required"); setLoading(false); return; }
        if (phone.length !== 10) { setError("Phone must be 10 digits"); setLoading(false); return; }
        if (!termsAgreed)        { setError("Please accept the BGV Vendor Terms before registering"); setLoading(false); return; }
      }
      const body = mode === "register"
        ? { email: email.trim().toLowerCase(), password, name: name.trim(), company_name: company.trim(), phone, role: "bgv" }
        : { email: email.trim().toLowerCase(), password };
      const res  = await fetch(`${API}${mode==="register"?"/auth/register":"/auth/login"}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403 && data.detail?.includes("pending")) { setPending(true); }
        else { setError(data.detail || "Something went wrong — please try again"); }
        setLoading(false); return;
      }
      if (data.role !== "bgv") { setError("This portal is for BGV vendors only."); setLoading(false); return; }
      if (mode === "register") { setRegistered(true); setLoading(false); return; }
      if (loginWithCredentials) { await loginWithCredentials(data); }
      else {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("name", data.name || "");
        localStorage.setItem("email", email.trim().toLowerCase());
      }
      router.push("/bgv/dashboard");
    } catch { setError("Network error. Please try again."); setLoading(false); }
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

        /* LEFT — warm neutral */
        .lft{background:#f0ece6;border-right:1px solid #ddd8d0;display:flex;flex-direction:column;padding:2.5rem 3rem;position:relative;overflow:hidden}
        .lft::before{content:'';position:absolute;top:-80px;right:-80px;width:320px;height:320px;border-radius:50%;background:rgba(13,110,110,.06);pointer-events:none}
        .lft::after{content:'';position:absolute;bottom:-60px;left:-40px;width:240px;height:240px;border-radius:50%;background:rgba(13,110,110,.04);pointer-events:none}
        .lft-logo{display:inline-flex;align-items:center;gap:9px;text-decoration:none;position:relative;z-index:1}
        .lft-logo-icon{width:34px;height:34px;border-radius:8px;background:#111;display:flex;align-items:center;justify-content:center}
        .lft-logo-name{font-family:'DM Sans',sans-serif;font-weight:700;font-size:14px;color:#111;letter-spacing:-.3px;line-height:1}
        .lft-logo-sub{font-family:'DM Sans',sans-serif;font-weight:600;font-size:6.5px;color:#0d6e6e;letter-spacing:2px;text-transform:uppercase;margin-top:3px}
        .lft-body{flex:1;display:flex;flex-direction:column;justify-content:center;padding:2.5rem 0;position:relative;z-index:1}
        .badge{display:inline-flex;align-items:center;gap:.45rem;font-size:.64rem;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#0d6e6e;margin-bottom:1.4rem}
        .badge::before{content:'';width:16px;height:1.5px;background:#0d6e6e}
        .lft-h{font-family:'Cormorant Garamond',serif;font-size:clamp(1.9rem,2.8vw,2.7rem);font-weight:500;line-height:1.12;color:#111;letter-spacing:-.3px;margin-bottom:.9rem}
        .lft-h em{font-style:italic;color:#0d6e6e}
        .lft-p{font-size:.875rem;color:#6b6258;line-height:1.8;margin-bottom:2rem;max-width:340px}
        .steps{display:flex;flex-direction:column;gap:1rem;margin-bottom:2rem}
        .step{display:flex;align-items:flex-start;gap:.85rem}
        .snum{width:26px;height:26px;border-radius:7px;flex-shrink:0;background:#fff;border:1.5px solid #c8c2b8;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;color:#0d6e6e}
        .stxt-t{font-size:.83rem;font-weight:700;color:#111;margin-bottom:1px}
        .stxt-d{font-size:.76rem;color:#7a6e64;line-height:1.5}
        .chip{display:flex;align-items:center;gap:.5rem;background:#fff;border:1.5px solid #c8c2b8;border-radius:10px;padding:.7rem .9rem;margin-bottom:1.5rem}
        .chip-dot{width:7px;height:7px;border-radius:50%;background:#0d6e6e;flex-shrink:0;animation:blink 2s ease-in-out infinite}
        .chip span{font-size:.75rem;font-weight:600;color:#0d6e6e}
        .notice{background:#fff;border:1.5px solid #f59e0b;border-radius:10px;padding:.85rem 1rem;display:flex;align-items:flex-start;gap:.65rem}
        .notice-ic{font-size:.9rem;flex-shrink:0;margin-top:1px}
        .notice-txt{font-size:.76rem;color:#7a6e64;line-height:1.6}
        .notice-txt strong{color:#111}
        .lft-ft{padding-top:1.5rem;border-top:1px solid #d8d2c8;display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1}
        .lft-ft-copy{font-size:.68rem;color:#a09890}
        .lft-ft-links{display:flex;gap:1rem}
        .lft-ft-link{font-size:.68rem;color:#a09890;text-decoration:none;transition:color .15s}
        .lft-ft-link:hover{color:#0d6e6e}

        /* RIGHT — white, high contrast, NO back link */
        .rgt{background:#fff;display:flex;align-items:center;justify-content:center;padding:3rem 2.5rem;border-left:1px solid #e8e2da}
        .form-wrap{width:100%;max-width:400px;animation:fadeUp .5s ease both}
        .form-ey{font-size:.64rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#5a5248;margin-bottom:6px}
        .fhd{font-family:'Cormorant Garamond',serif;font-size:1.85rem;font-weight:500;color:#111;letter-spacing:-.3px;margin-bottom:4px;line-height:1.15}
        .fsb{font-size:.83rem;color:#6b6258;margin-bottom:1.75rem;line-height:1.6}
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
        .hint{font-size:.67rem;color:#7a6e64;margin-top:2px}
        .alert-err{font-size:.78rem;color:#b91c1c;padding:.6rem .9rem;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin-bottom:.75rem}
        .alert-warn{font-size:.78rem;color:#92400e;padding:.75rem .9rem;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;margin-bottom:.75rem;line-height:1.6}
        .alert-success{font-size:.78rem;color:#065f46;padding:.75rem .9rem;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;margin-bottom:.75rem;line-height:1.6}
        .terms-row{display:flex;align-items:flex-start;gap:.6rem;margin-bottom:.9rem;padding:.75rem .9rem;background:#f5f2ee;border:1.5px solid #c8c2b8;border-radius:9px;cursor:pointer}
        .terms-row:hover{border-color:#0d6e6e;background:#f0f9f4}
        .terms-cb{width:16px;height:16px;border-radius:4px;border:1.5px solid #a09890;background:#fff;flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center;transition:all .15s}
        .terms-cb.checked{background:#0d6e6e;border-color:#0d6e6e}
        .terms-cb.checked::after{content:'✓';font-size:9px;color:#fff;font-weight:700}
        .terms-txt{font-size:.75rem;color:#3d3530;line-height:1.6}
        .terms-txt a{color:#0d6e6e;font-weight:600;text-decoration:none}
        .terms-txt a:hover{text-decoration:underline}
        .submit{padding:.88rem;background:#0d6e6e;color:#fff;border:none;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:.9rem;font-weight:700;cursor:pointer;transition:all .15s;width:100%;margin-bottom:.75rem;box-shadow:0 4px 16px rgba(13,110,110,.25)}
        .submit:hover:not(:disabled){background:#0a5656;transform:translateY(-1px)}
        .submit:disabled{opacity:.45;cursor:not-allowed;transform:none}
        .dvr{display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem}
        .dvl{flex:1;height:1px;background:#e0dbd4}
        .dvt{font-size:.68rem;color:#a09890}
        .toggle{text-align:center;font-size:.83rem;color:#6b6258;margin-bottom:1rem}
        .toggle-btn{color:#0d6e6e;cursor:pointer;font-weight:700;background:none;border:none;font-family:inherit;font-size:inherit;padding:0}
        .toggle-btn:hover{text-decoration:underline}
        .trust-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;border-top:1px solid #e0dbd4;padding-top:1rem;margin-bottom:.75rem}
        .trust-item{display:flex;align-items:center;gap:5px;font-size:10.5px;color:#6b6258}
        .trust-ck{width:14px;height:14px;border-radius:3px;background:#e8f5ee;border:1px solid rgba(13,110,110,.25);display:flex;align-items:center;justify-content:center;font-size:8px;color:#0d6e6e;flex-shrink:0}
        .footer-row{display:flex;justify-content:center;gap:16px;flex-wrap:wrap}
        .footer-lk{font-size:.67rem;color:#a09890;text-decoration:none;transition:color .15s}
        .footer-lk:hover{color:#0d6e6e}

        @media(max-width:900px){.pg{grid-template-columns:1fr}.lft{display:none}.rgt{padding:3rem 1.5rem;min-height:100vh;border-left:none}}
      `}</style>

      <div className="pg">
        <div className="lft">
          <Link href="/" className="lft-logo">
            <div className="lft-logo-icon">
              <svg width="16" height="18" viewBox="0 0 28 32" fill="none"><rect x="7" y="17" width="4" height="10" rx="1.5" fill="white"/><rect x="17" y="17" width="4" height="10" rx="1.5" fill="white"/><path d="M9 17Q14 10 19 17" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>
            </div>
            <div><div className="lft-logo-name">Datagate</div><div className="lft-logo-sub">Verified Employment</div></div>
          </Link>
          <div className="lft-body">
            <div className="badge">BGV Vendor Portal</div>
            <h2 className="lft-h">Run checks.<br/><em>Submit reports.</em></h2>
            <p className="lft-p">Access assigned background verification cases, update check statuses, upload evidence, and submit final reports — all in one place.</p>
            <div className="steps">
              {[["1","Receive case assignment","Employer assigns a BGV case to you with the candidate's consented profile."],
                ["2","Run your checks","Identity, education, address, employment, criminal — update each check with evidence."],
                ["3","Submit final report","Upload your BGV report and submit the overall verdict to the employer."]].map(([n,t,d])=>(
                <div className="step" key={n}><div className="snum">{n}</div><div><div className="stxt-t">{t}</div><div className="stxt-d">{d}</div></div></div>
              ))}
            </div>
            <div className="chip"><div className="chip-dot"/><span>All data accessed only after employee consent</span></div>
            <div className="notice">
              <span className="notice-ic">⚠️</span>
              <div className="notice-txt"><strong>Admin approval required.</strong> New registrations are reviewed before platform access is granted. You will receive an email once approved.</div>
            </div>
          </div>
          <div className="lft-ft">
            <span className="lft-ft-copy">© 2026 Datagate</span>
            <div className="lft-ft-links">
              <Link href="/bgv/terms" className="lft-ft-link">BGV Vendor Terms</Link>
              <Link href="/privacy" className="lft-ft-link">Privacy</Link>
            </div>
          </div>
        </div>

        <div className="rgt">
          <div className="form-wrap">
            {/* Back to Datagate removed per request */}
            <div className="form-ey">BGV Vendor Portal</div>
            <div className="fhd">{mode==="register"?"Register your agency":"Welcome back"}</div>
            <div className="fsb">{mode==="register"?"Create your BGV vendor account. Admin approval required before first login.":"Sign in to access your assigned cases."}</div>

            <div className="tabs">
              {[["login","Sign in"],["register","Register agency"]].map(([m,l])=>(
                <button key={m} className={`tab${mode===m?" on":""}`} onClick={()=>{setMode(m);setError("");setPending(false);setRegistered(false);setTermsAgreed(false)}}>{l}</button>
              ))}
            </div>

            {registered && <div className="alert-success">✅ <strong>Registration submitted.</strong> Your account is pending admin approval. You will receive an email once approved. Contact support@datagate.co.in if urgent.</div>}
            {pending && <div className="alert-warn">⏳ <strong>Account pending approval.</strong> Contact <strong>support@datagate.co.in</strong> if urgent.</div>}
            {error && <div className="alert-err">⚠️ {error}</div>}

            {!registered && (
              <>
                {mode === "register" && <>
                  <div className="fld"><label className="flb">Full Name <span>*</span></label><input className="fin" placeholder="Your full name" value={name} onChange={e=>setName(e.target.value)}/></div>
                  <div className="fld"><label className="flb">Agency / Company Name <span>*</span></label><input className="fin" placeholder="e.g. Veritas BGV Solutions Pvt. Ltd." value={company} onChange={e=>setCompany(e.target.value)}/></div>
                  <div className="fld"><label className="flb">Mobile Number <span>*</span></label><input className="fin" placeholder="10-digit mobile number" value={phone} onChange={e=>handlePhone(e.target.value)} inputMode="numeric" maxLength={10}/><span className="hint">{phone.length}/10 digits</span></div>
                </>}
                <div className="fld"><label className="flb">Work Email <span>*</span></label><input className="fin" type="email" placeholder="ops@youragency.com" value={email} onChange={e=>{setEmail(e.target.value);setError("")}} autoComplete="email"/></div>
                <div className="fld"><label className="flb">Password <span>*</span></label>
                  <div className="pw-wrap">
                    <input className="fin" type={showPwd?"text":"password"} placeholder="Min. 8 characters" value={password} onChange={e=>{setPassword(e.target.value);setError("")}} onKeyDown={e=>e.key==="Enter"&&handle()} autoComplete={mode==="login"?"current-password":"new-password"}/>
                    <button className="ey" type="button" onClick={()=>setShowPwd(v=>!v)} tabIndex={-1}><Eye open={showPwd}/></button>
                  </div>
                </div>
                {mode === "register" && (
                  <div className="terms-row" onClick={()=>setTermsAgreed(v=>!v)}>
                    <div className={`terms-cb${termsAgreed?" checked":""}`}/>
                    <span className="terms-txt">
                      I have read and agree to Datagate's{" "}
                      <a href="/bgv/terms" onClick={e=>e.stopPropagation()} target="_blank" rel="noopener noreferrer">BGV Vendor Terms & Conditions</a>
                      {" "}and{" "}
                      <a href="/privacy" onClick={e=>e.stopPropagation()} target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
                      I will handle candidate data strictly within the scope of each assigned case.
                    </span>
                  </div>
                )}
                <button className="submit" onClick={handle} disabled={loading || (mode==="register" && !termsAgreed)}>
                  {loading?"Please wait…":mode==="register"?"Submit registration →":"Sign in →"}
                </button>
                <div className="dvr"><div className="dvl"/><span className="dvt">or</span><div className="dvl"/></div>
                <div className="toggle">
                  {mode==="login"?"New BGV vendor? ":"Already registered? "}
                  <button className="toggle-btn" onClick={()=>{setMode(mode==="login"?"register":"login");setError("");setPending(false);setTermsAgreed(false)}}>
                    {mode==="login"?"Register your agency":"Sign in"}
                  </button>
                </div>
                <div className="trust-grid">
                  {["DPDP Act 2023 compliant","Consent-gated data","Tamper-evident audit trail","Admin-approved vendors only"].map(t=>(
                    <div className="trust-item" key={t}><div className="trust-ck">✓</div>{t}</div>
                  ))}
                </div>
              </>
            )}

            <div className="footer-row">
              <Link href="/bgv/terms" className="footer-lk">BGV Vendor Terms</Link>
              <Link href="/privacy" className="footer-lk">Privacy Policy</Link>
              <a href="mailto:support@datagate.co.in" className="footer-lk">Support</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
