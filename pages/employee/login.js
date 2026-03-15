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

function Logo() {
  return (
    <svg width="148" height="38" viewBox="0 0 148 38" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display:"block" }}>
      <defs>
        <style>{`
          @keyframes emp-pulse{0%{r:4;opacity:.6}100%{r:12;opacity:0}}
          @keyframes emp-dot{0%,100%{r:3.2}50%{r:2.4}}
          @keyframes emp-p{0%{transform:translateY(0);opacity:0}12%{opacity:1}85%{opacity:1}100%{transform:translateY(19px);opacity:0}}
          .epr{animation:emp-pulse 1.8s ease-out infinite;fill:none;stroke:#16a34a;stroke-width:1.2}
          .edt{animation:emp-dot 1.8s ease-in-out infinite;fill:#16a34a}
          .ep1{animation:emp-p 2.2s ease-in-out infinite}
          .ep2{animation:emp-p 2.2s ease-in-out infinite .74s}
          .ep3{animation:emp-p 2.2s ease-in-out infinite 1.47s}
        `}</style>
      </defs>
      <path d="M14 1.5 L26 6.5 L26 21 Q26 32 14 38 Q2 32 2 21 L2 6.5 Z" fill="#1a1a1a"/>
      <rect x="7" y="16.5" width="4" height="13" rx="1.5" fill="#fff"/>
      <rect x="16" y="16.5" width="4" height="13" rx="1.5" fill="#fff"/>
      <path d="M9 16.5 Q14 9.5 20 16.5" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="14" cy="10.5" r="1.6" fill="#16a34a" opacity="0" className="ep1"/>
      <circle cx="14" cy="10.5" r="1.6" fill="#16a34a" opacity="0" className="ep2"/>
      <circle cx="14" cy="10.5" r="1.6" fill="#16a34a" opacity="0" className="ep3"/>
      <circle cx="22" cy="6" className="edt"/>
      <circle cx="22" cy="6" className="epr"/>
      <text x="33" y="22" fontFamily="'DM Sans',sans-serif" fontSize="14" fontWeight="700" fill="#1a1a1a" letterSpacing="-0.2">Datagate</text>
      <text x="34" y="31" fontFamily="'DM Sans',sans-serif" fontSize="6.5" fontWeight="600" fill="#bbb" letterSpacing="1">VERIFIED EMPLOYMENT</text>
    </svg>
  );
}

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

  const handlePhone = (val) => setPhone(val.replace(/\D/g, "").slice(0, 10));

  const handle = async () => {
    setError(""); setLoading(true);
    if (isSignup && phone.length !== 10) { setError("Phone must be 10 digits"); setLoading(false); return; }
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
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#f7f6f2;font-family:'DM Sans',sans-serif}

        .pg{min-height:100vh;display:grid;grid-template-columns:1fr 1fr}

        /* ── Left — warm off-white panel ── */
        .lft{
          background:#f7f6f2;
          display:flex;flex-direction:column;justify-content:space-between;
          padding:2.5rem 3.5rem;
          border-right:1px solid #e8e4dc;
        }
        .lft-body{padding-top:3rem}
        .tag{
          font-size:.66rem;font-weight:700;letter-spacing:1.4px;
          text-transform:uppercase;color:#16a34a;
          display:flex;align-items:center;gap:.5rem;margin-bottom:1.25rem;
        }
        .tag-line{width:18px;height:1.5px;background:#16a34a;flex-shrink:0}
        .ttl{
          font-family:'Instrument Serif',serif;
          font-size:clamp(2rem,3vw,2.8rem);
          font-weight:400;line-height:1.2;
          color:#1a1a1a;letter-spacing:-.4px;margin-bottom:.9rem;
        }
        .ttl em{font-style:italic;color:#16a34a}
        .dsc{font-size:.875rem;color:#777;line-height:1.75;margin-bottom:2.5rem;max-width:340px}

        /* Steps */
        .stps{display:flex;flex-direction:column;gap:1rem;margin-bottom:3rem}
        .stp{display:flex;align-items:flex-start;gap:.85rem}
        .stn{
          width:26px;height:26px;border-radius:7px;
          background:#fff;border:1.5px solid #e8e4dc;
          display:flex;align-items:center;justify-content:center;
          font-size:.72rem;font-weight:700;color:#1a1a1a;flex-shrink:0;
        }
        .stb-t{font-size:.83rem;font-weight:700;color:#1a1a1a;margin-bottom:2px}
        .stb-d{font-size:.77rem;color:#999;line-height:1.5}

        /* Illustration */
        .illus{
          background:#fff;border:1.5px solid #e8e4dc;border-radius:16px;
          padding:1.75rem;
          display:flex;flex-direction:column;gap:.75rem;
        }
        .illus-label{font-size:.65rem;font-weight:700;color:#ccc;text-transform:uppercase;letter-spacing:1px}
        .illus-flow{display:flex;align-items:center;gap:.5rem}
        .illus-node{
          flex:1;background:#f7f6f2;border:1px solid #e8e4dc;
          border-radius:8px;padding:.6rem .75rem;
          font-size:.72rem;font-weight:600;color:#555;text-align:center;
        }
        .illus-arrow{color:#ccc;font-size:.85rem;flex-shrink:0}
        .illus-consent{
          display:flex;align-items:center;gap:.5rem;
          background:#f0fdf4;border:1px solid #bbf7d0;
          border-radius:8px;padding:.5rem .75rem;
        }
        .consent-dot{width:7px;height:7px;border-radius:50%;background:#16a34a;flex-shrink:0}
        .illus-consent span{font-size:.72rem;font-weight:600;color:#15803d}

        /* Footer */
        .lft-ft{
          display:flex;justify-content:space-between;align-items:center;
          padding-top:1.5rem;border-top:1px solid #e8e4dc;
        }
        .fc{font-size:.7rem;color:#ccc}
        .fl{display:flex;gap:.85rem}
        .fla{font-size:.7rem;color:#ccc;text-decoration:none;transition:color .15s}
        .fla:hover{color:#16a34a}

        /* ── Right — white form panel ── */
        .rgt{
          background:#fff;
          display:flex;align-items:center;justify-content:center;
          padding:3rem 2.5rem;
          border-left:1px solid #f0ede6;
        }
        .fcd{width:100%;max-width:380px;display:flex;flex-direction:column;gap:1.1rem}

        .fhd{
          font-family:'Instrument Serif',serif;
          font-size:1.75rem;font-weight:400;color:#1a1a1a;letter-spacing:-.3px;
        }
        .fsb{font-size:.84rem;color:#999;margin-top:-.15rem}

        .fld{display:flex;flex-direction:column;gap:.35rem}
        .flb{font-size:.74rem;font-weight:600;color:#888;letter-spacing:.2px}
        .fin{
          padding:.75rem .9rem;
          background:#fafaf8;
          border:1.5px solid #e8e4dc;
          border-radius:9px;font-family:'DM Sans',sans-serif;
          font-size:.875rem;color:#1a1a1a;outline:none;width:100%;
          transition:border-color .15s,background .15s;
        }
        .fin::placeholder{color:#ccc}
        .fin:focus{border-color:#16a34a;background:#fff;box-shadow:0 0 0 3px rgba(22,163,74,0.08)}
        .pw{position:relative}
        .pw .fin{padding-right:2.5rem}
        .ey{position:absolute;right:.8rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#ccc;padding:0;transition:color .15s}
        .ey:hover{color:#888}
        .pht{font-size:.69rem;color:#ccc}

        .er{font-size:.79rem;color:#dc2626;padding:.65rem .9rem;background:#fef2f2;border:1px solid #fecaca;border-radius:8px}

        /* Green CTA for employee */
        .sub{
          padding:.85rem;background:#16a34a;color:#fff;border:none;
          border-radius:9px;font-family:'DM Sans',sans-serif;
          font-size:.9rem;font-weight:700;cursor:pointer;
          transition:background .15s;letter-spacing:.1px;
        }
        .sub:hover:not(:disabled){background:#15803d}
        .sub:disabled{opacity:.5;cursor:not-allowed}

        .fgt{text-align:center}
        .fgt a{font-size:.79rem;color:#16a34a;text-decoration:none}
        .fgt a:hover{text-decoration:underline}

        .dvr{display:flex;align-items:center;gap:.7rem}
        .dvl{flex:1;height:1px;background:#f0ede6}
        .dvt{font-size:.7rem;color:#ccc}

        .tgl{text-align:center;font-size:.84rem;color:#888}
        .tgb{color:#16a34a;cursor:pointer;font-weight:700;background:none;border:none;font-family:inherit;font-size:inherit}
        .tgb:hover{text-decoration:underline}

        .cft{display:flex;justify-content:center;padding-top:.15rem}
        .cft a{font-size:.69rem;color:#ccc;text-decoration:none;transition:color .15s}
        .cft a:hover{color:#16a34a;text-decoration:underline}

        @media(max-width:768px){
          .pg{grid-template-columns:1fr}
          .lft{display:none}
          .rgt{padding:2.5rem 1.5rem}
        }
      `}</style>

      <div className="pg">
        {/* Left */}
        <div className="lft">
          <Link href="/" style={{ textDecoration:"none" }}><Logo/></Link>

          <div className="lft-body">
            <div className="tag"><span className="tag-line"/>Employee Portal</div>
            <h2 className="ttl">Your career data,<br/><em>your control.</em></h2>
            <p className="dsc">Build a verified employment profile once. Share it securely with any employer — with your consent, every single time.</p>

            <div className="stps">
              {[
                ["1","Create your profile",   "Personal, education, employment and documents — filled once, forever."],
                ["2","Upload documents",       "Aadhaar, PAN, certificates — encrypted and stored securely."],
                ["3","Approve and share",      "Every employer request needs your approval. You decide who sees what."],
              ].map(([n,t,d]) => (
                <div className="stp" key={n}>
                  <div className="stn">{n}</div>
                  <div><div className="stb-t">{t}</div><div className="stb-d">{d}</div></div>
                </div>
              ))}
            </div>

            {/* Data flow illustration */}
            <div className="illus">
              <div className="illus-label">How data flows</div>
              <div className="illus-flow">
                <div className="illus-node">Your Profile</div>
                <span className="illus-arrow">→</span>
                <div className="illus-node">Employer Request</div>
                <span className="illus-arrow">→</span>
                <div className="illus-node">Your Approval</div>
              </div>
              <div className="illus-consent">
                <div className="consent-dot"/>
                <span>Data only moves after your explicit consent</span>
              </div>
            </div>
          </div>

          <div className="lft-ft">
            <span className="fc">© 2026 Datagate</span>
            <div className="fl">
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="fla">Privacy Policy</a>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="rgt">
          <div className="fcd">
            <div>
              <div className="fhd">{isSignup ? "Create account" : "Welcome back"}</div>
              <div className="fsb">{isSignup ? "Start your verified employment journey" : "Sign in to your employee account"}</div>
            </div>

            {isSignup && (<>
              <div className="fld">
                <label className="flb">Full Name</label>
                <input className="fin" placeholder="Manoj Kumar" value={name} onChange={e => setName(e.target.value)}/>
              </div>
              <div className="fld">
                <label className="flb">Mobile Number</label>
                <input className="fin" placeholder="9876543210" value={phone} onChange={e => handlePhone(e.target.value)} inputMode="numeric" maxLength={10}/>
                <span className="pht">{phone.length}/10 digits</span>
              </div>
            </>)}

            <div className="fld">
              <label className="flb">Email Address</label>
              <input className="fin" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}/>
            </div>

            <div className="fld">
              <label className="flb">Password</label>
              <div className="pw">
                <input className="fin" type={showPwd ? "text" : "password"} placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()}/>
                <button className="ey" type="button" onClick={() => setShowPwd(v => !v)} tabIndex={-1}><EyeIcon open={showPwd}/></button>
              </div>
            </div>

            {error && <div className="er">{error}</div>}

            <button className="sub" onClick={handle} disabled={loading}>
              {loading ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
            </button>

            {!isSignup && <div className="fgt"><a href="/forgot-password">Forgot password?</a></div>}

            <div className="dvr"><div className="dvl"/><span className="dvt">or</span><div className="dvl"/></div>

            <div className="tgl">
              {isSignup ? "Already have an account? " : "Don't have an account? "}
              <button className="tgb" onClick={() => { setIsSignup(v => !v); setError(""); setShowPwd(false); }}>
                {isSignup ? "Sign in" : "Sign up"}
              </button>
            </div>

            <div className="cft">
              <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}