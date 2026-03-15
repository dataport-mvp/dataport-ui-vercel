import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function Logo({ accentColor = "#2563eb" }) {
  const css = `
    @keyframes dg-pulse{0%{r:5;opacity:.65}100%{r:14;opacity:0}}
    @keyframes dg-dot{0%,100%{r:3.8}50%{r:2.8}}
    @keyframes dg-p{0%{transform:translateY(0);opacity:0}15%{opacity:1}85%{opacity:1}100%{transform:translateY(22px);opacity:0}}
    .dgpr{animation:dg-pulse 1.8s ease-out infinite;fill:none;stroke:${accentColor};stroke-width:1.4}
    .dgdt{animation:dg-dot 1.8s ease-in-out infinite;fill:${accentColor}}
    .dgp1{animation:dg-p 2.2s ease-in-out infinite}
    .dgp2{animation:dg-p 2.2s ease-in-out infinite .74s}
    .dgp3{animation:dg-p 2.2s ease-in-out infinite 1.47s}
  `;
  return (
    <svg width="168" height="44" viewBox="0 0 168 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs><style>{css}</style></defs>
      <path d="M16 1.5 L30 7.5 L30 25 Q30 38 16 44 Q2 38 2 25 L2 7.5 Z" fill="#fff"/>
      <rect x="8"  y="20" width="5" height="15" rx="1.8" fill="#0a0f1a"/>
      <rect x="19" y="20" width="5" height="15" rx="1.8" fill="#0a0f1a"/>
      <path d="M10.5 20 Q16 12 21.5 20" fill="none" stroke="#0a0f1a" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="16" cy="13" r="2" fill={accentColor} opacity="0" className="dgp1"/>
      <circle cx="16" cy="13" r="2" fill={accentColor} opacity="0" className="dgp2"/>
      <circle cx="16" cy="13" r="2" fill={accentColor} opacity="0" className="dgp3"/>
      <circle cx="25.5" cy="7" className="dgdt"/>
      <circle cx="25.5" cy="7" className="dgpr"/>
      <text x="38" y="25" fontFamily="'DM Sans',sans-serif" fontSize="16" fontWeight="700" fill="#f1f5f9" letterSpacing="-0.2">Datagate</text>
      <text x="39" y="36" fontFamily="'DM Sans',sans-serif" fontSize="7.5" fontWeight="600" fill="rgba(255,255,255,0.38)" letterSpacing="1.3">VERIFIED EMPLOYMENT</text>
    </svg>
  );
}

function HandshakeIllustration({ accent = "#2563eb" }) {
  return (
    <svg width="100%" viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>{`
          @keyframes hs{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
          @keyframes gl{0%,100%{opacity:.12}50%{opacity:.25}}
          .hsg{animation:hs 3.2s ease-in-out infinite}
          .hgl{animation:gl 2.8s ease-in-out infinite}
        `}</style>
      </defs>
      <ellipse cx="150" cy="160" rx="60" ry="7" fill={accent} opacity="0.12" className="hgl"/>
      <g className="hsg">
        <circle cx="52" cy="68" r="15" fill="#1e293b"/>
        <circle cx="47" cy="65" r="2" fill="#475569"/>
        <circle cx="57" cy="65" r="2" fill="#475569"/>
        <path d="M47 74 Q52 78 57 74" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="37" y="82" width="30" height="45" rx="8" fill="#1e293b"/>
        <path d="M67 105 Q95 101 112 110" fill="none" stroke="#1e293b" strokeWidth="9" strokeLinecap="round"/>
        <rect x="16" y="105" width="18" height="13" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1.2"/>
        <path d="M20 105 L20 101 Q20 98 25 98 Q30 98 30 101 L30 105" fill="none" stroke="#334155" strokeWidth="1.2"/>
        <rect x="41" y="126" width="9" height="28" rx="4" fill="#1e293b"/>
        <rect x="54" y="126" width="9" height="28" rx="4" fill="#1e293b"/>
        <rect x="39" y="151" width="13" height="5" rx="2.5" fill="#0f172a"/>
        <rect x="52" y="151" width="13" height="5" rx="2.5" fill="#0f172a"/>

        <circle cx="248" cy="68" r="15" fill="#172554"/>
        <circle cx="243" cy="65" r="2" fill={accent}/>
        <circle cx="253" cy="65" r="2" fill={accent}/>
        <path d="M243 74 Q248 78 253 74" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="233" y="82" width="30" height="45" rx="8" fill="#172554"/>
        <path d="M233 105 Q205 101 188 110" fill="none" stroke="#172554" strokeWidth="9" strokeLinecap="round"/>
        <rect x="266" y="105" width="18" height="13" rx="3" fill="#0c1a3a" stroke="#1e3a5f" strokeWidth="1.2"/>
        <path d="M270 105 L270 101 Q270 98 275 98 Q280 98 280 101 L280 105" fill="none" stroke="#1e3a5f" strokeWidth="1.2"/>
        <rect x="237" y="126" width="9" height="28" rx="4" fill="#172554"/>
        <rect x="250" y="126" width="9" height="28" rx="4" fill="#172554"/>
        <rect x="235" y="151" width="13" height="5" rx="2.5" fill="#0c1a3a"/>
        <rect x="248" y="151" width="13" height="5" rx="2.5" fill="#0c1a3a"/>

        <path d="M112 110 Q124 106 134 110 L142 117 Q146 121 142 125 L134 129 Q122 132 112 127 Q104 122 112 110Z" fill="#334155"/>
        <path d="M188 110 Q176 106 166 110 L158 117 Q154 121 158 125 L166 129 Q178 132 188 127 Q196 122 188 110Z" fill="#1e3a5f"/>
        <path d="M142 117 Q150 112 158 117 L158 127 Q150 131 142 127 Z" fill={accent}/>
        <ellipse cx="150" cy="120" rx="7" ry="3.5" fill="#93c5fd" opacity="0.3"/>

        <circle cx="98"  cy="96" r="3.5" fill="#16a34a" opacity="0.7"/>
        <circle cx="114" cy="88" r="2.5" fill="#16a34a" opacity="0.5"/>
        <circle cx="202" cy="96" r="3.5" fill={accent} opacity="0.6"/>
        <circle cx="186" cy="88" r="2.5" fill={accent} opacity="0.4"/>

        <text x="52"  y="182" textAnchor="middle" fontFamily="'DM Sans',sans-serif" fontSize="9" fontWeight="600" fill="rgba(255,255,255,0.3)" letterSpacing="0.8">EMPLOYEE</text>
        <text x="248" y="182" textAnchor="middle" fontFamily="'DM Sans',sans-serif" fontSize="9" fontWeight="600" fill="rgba(255,255,255,0.3)" letterSpacing="0.8">EMPLOYER</text>
        <text x="150" y="182" textAnchor="middle" fontFamily="'DM Sans',sans-serif" fontSize="9" fontWeight="700" fill={accent} letterSpacing="0.8">VERIFIED CONSENT</text>
      </g>
    </svg>
  );
}

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
    const body = isSignup ? { email, password, name: company, phone: "0000000000", role: "employer" } : { email, password };
    try {
      const res  = await fetch(`${API}${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(parseError(data)); return; }
      const { access_token, refresh_token, role, name: uName, email: uEmail } = data;
      login(access_token, refresh_token, { role, name: uName || company || email, email: uEmail || email });
      router.push("/employer/dashboard");
    } catch { setError("Network error — please try again"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#060d18;font-family:'DM Sans',sans-serif}
        .pg{min-height:100vh;display:grid;grid-template-columns:1fr 1fr}
        .lft{background:#060d18;display:flex;flex-direction:column;justify-content:space-between;padding:2.5rem 3rem;border-right:1px solid rgba(255,255,255,0.05);position:relative;overflow:hidden}
        .lft::before{content:'';position:absolute;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(37,99,235,0.07) 0%,transparent 70%);top:-80px;left:-80px;pointer-events:none}
        .lft-body{position:relative;z-index:1;padding-top:2.5rem}
        .tag{font-size:.67rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#2563eb;margin-bottom:1.1rem;display:flex;align-items:center;gap:.5rem}
        .tag-line{width:18px;height:1.5px;background:#2563eb}
        .ttl{font-size:clamp(1.75rem,2.5vw,2.3rem);font-weight:700;line-height:1.25;color:#f1f5f9;margin-bottom:.9rem;letter-spacing:-.3px}
        .ttl span{color:#2563eb}
        .dsc{font-size:.86rem;color:#475569;line-height:1.75;margin-bottom:2rem;max-width:330px}
        .feats{display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem}
        .ft{display:flex;align-items:center;gap:.75rem;font-size:.82rem;color:#64748b}
        .fck{width:18px;height:18px;border-radius:50%;background:rgba(37,99,235,0.12);border:1px solid rgba(37,99,235,0.25);display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .fck svg{color:#2563eb}
        .lft-ft{display:flex;justify-content:space-between;align-items:center;padding-top:1.5rem;border-top:1px solid rgba(255,255,255,0.04)}
        .fc{font-size:.7rem;color:#1e1040}
        .fl{display:flex;gap:.85rem}
        .fla{font-size:.7rem;color:#1e1040;text-decoration:none;transition:color .15s}
        .fla:hover{color:#2563eb}
        .rgt{background:#080f1c;display:flex;align-items:center;justify-content:center;padding:3rem 2rem}
        .fcd{width:100%;max-width:370px;display:flex;flex-direction:column;gap:1rem}
        .fhd{font-size:1.45rem;font-weight:700;color:#f1f5f9;letter-spacing:-.3px}
        .fsb{font-size:.83rem;color:#475569;margin-top:-.2rem}
        .fld{display:flex;flex-direction:column;gap:.32rem}
        .flb{font-size:.73rem;font-weight:600;color:#475569;letter-spacing:.3px}
        .fin{padding:.72rem .88rem;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;font-family:'DM Sans',sans-serif;font-size:.875rem;color:#e2e8f0;outline:none;width:100%;transition:border-color .15s,background .15s}
        .fin::placeholder{color:#1e3a5f}
        .fin:focus{border-color:rgba(37,99,235,0.45);background:rgba(37,99,235,0.04)}
        .pw{position:relative}
        .pw .fin{padding-right:2.5rem}
        .ey{position:absolute;right:.75rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#334155;padding:0;transition:color .15s}
        .ey:hover{color:#64748b}
        .er{font-size:.78rem;color:#f87171;padding:.62rem .88rem;background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.16);border-radius:8px}
        .sub{padding:.8rem;background:#2563eb;color:#fff;border:none;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:.88rem;font-weight:700;cursor:pointer;transition:background .15s}
        .sub:hover:not(:disabled){background:#1d4ed8}
        .sub:disabled{opacity:.5;cursor:not-allowed}
        .fgt{text-align:center}
        .fgt a{font-size:.78rem;color:#2563eb;text-decoration:none}
        .fgt a:hover{text-decoration:underline}
        .dvr{display:flex;align-items:center;gap:.7rem}
        .dvl{flex:1;height:1px;background:rgba(255,255,255,0.05)}
        .dvt{font-size:.7rem;color:#1e1040}
        .tgl{text-align:center;font-size:.83rem;color:#475569}
        .tgb{color:#2563eb;cursor:pointer;font-weight:700;background:none;border:none;font-family:inherit;font-size:inherit}
        .tgb:hover{text-decoration:underline}
        .cft{display:flex;justify-content:center;gap:1.25rem;padding-top:.2rem}
        .cft a{font-size:.68rem;color:#1e1040;text-decoration:none;transition:color .15s}
        .cft a:hover{color:#2563eb;text-decoration:underline}
        @media(max-width:768px){.pg{grid-template-columns:1fr}.lft{display:none}}
      `}</style>

      <div className="pg">
        <div className="lft">
          <Link href="/"><Logo accentColor="#2563eb"/></Link>
          <div className="lft-body">
            <div className="tag"><span className="tag-line"/>Employer Portal</div>
            <h2 className="ttl">Hire with<br/><span>verified confidence.</span></h2>
            <p className="dsc">Access pre-verified employee records instantly. No more chasing documents — structured BGV data delivered the moment a candidate approves.</p>
            <div className="feats">
              {["Request employee consent in one click","View verified Aadhaar, PAN, education, employment","EPFO-linked employment history","Full consent audit trail — legally compliant"].map(f=>(
                <div className="ft" key={f}>
                  <div className="fck">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  {f}
                </div>
              ))}
            </div>
            <HandshakeIllustration accent="#2563eb"/>
          </div>
          <div className="lft-ft">
            <span className="fc">© 2026 Datagate</span>
            <div className="fl">
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="fla">Privacy Policy</a>
              <a href="/employer/terms" target="_blank" rel="noopener noreferrer" className="fla">Employer Terms</a>
            </div>
          </div>
        </div>

        <div className="rgt">
          <div className="fcd">
            <div>
              <div className="fhd">{isSignup?"Create account":"Welcome back"}</div>
              <div className="fsb">{isSignup?"Start hiring with verified data":"Sign in to your employer account"}</div>
            </div>
            {isSignup&&(
              <div className="fld"><label className="flb">Company Name</label><input className="fin" placeholder="Acme Technologies Pvt Ltd" value={company} onChange={e=>setCompany(e.target.value)}/></div>
            )}
            <div className="fld"><label className="flb">Work Email</label><input className="fin" type="email" placeholder="hr@company.com" value={email} onChange={e=>setEmail(e.target.value)}/></div>
            <div className="fld">
              <label className="flb">Password</label>
              <div className="pw"><input className="fin" type={showPwd?"text":"password"} placeholder="Min. 8 characters" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()}/>
              <button className="ey" type="button" onClick={()=>setShowPwd(v=>!v)} tabIndex={-1}><EyeIcon open={showPwd}/></button></div>
            </div>
            {error&&<div className="er">{error}</div>}
            <button className="sub" onClick={handle} disabled={loading}>{loading?"Please wait…":isSignup?"Create account":"Sign in"}</button>
            {!isSignup&&<div className="fgt"><a href="/forgot-password">Forgot password?</a></div>}
            <div className="dvr"><div className="dvl"/><span className="dvt">or</span><div className="dvl"/></div>
            <div className="tgl">{isSignup?"Already have an account? ":"Don't have an account? "}<button className="tgb" onClick={()=>{setIsSignup(v=>!v);setError("");setShowPwd(false);}}>{isSignup?"Sign in":"Sign up"}</button></div>
            <div className="cft">
              <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
              <a href="/employer/terms" target="_blank" rel="noopener noreferrer">Employer Terms</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}