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
          @keyframes erp-pulse{0%{r:4;opacity:.6}100%{r:12;opacity:0}}
          @keyframes erp-dot{0%,100%{r:3.2}50%{r:2.4}}
          @keyframes erp-p{0%{transform:translateY(0);opacity:0}12%{opacity:1}85%{opacity:1}100%{transform:translateY(19px);opacity:0}}
          .erpr{animation:erp-pulse 1.8s ease-out infinite;fill:none;stroke:#2563eb;stroke-width:1.2}
          .erdt{animation:erp-dot 1.8s ease-in-out infinite;fill:#2563eb}
          .erp1{animation:erp-p 2.2s ease-in-out infinite}
          .erp2{animation:erp-p 2.2s ease-in-out infinite .74s}
          .erp3{animation:erp-p 2.2s ease-in-out infinite 1.47s}
        `}</style>
      </defs>
      <path d="M14 1.5 L26 6.5 L26 21 Q26 32 14 38 Q2 32 2 21 L2 6.5 Z" fill="#1e293b"/>
      <rect x="7" y="16.5" width="4" height="13" rx="1.5" fill="#fff"/>
      <rect x="16" y="16.5" width="4" height="13" rx="1.5" fill="#fff"/>
      <path d="M9 16.5 Q14 9.5 20 16.5" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="14" cy="10.5" r="1.6" fill="#2563eb" opacity="0" className="erp1"/>
      <circle cx="14" cy="10.5" r="1.6" fill="#2563eb" opacity="0" className="erp2"/>
      <circle cx="14" cy="10.5" r="1.6" fill="#2563eb" opacity="0" className="erp3"/>
      <circle cx="22" cy="6" className="erdt"/>
      <circle cx="22" cy="6" className="erpr"/>
      <text x="33" y="22" fontFamily="'DM Sans',sans-serif" fontSize="14" fontWeight="700" fill="#0f172a" letterSpacing="-0.2">Datagate</text>
      <text x="34" y="31" fontFamily="'DM Sans',sans-serif" fontSize="6.5" fontWeight="600" fill="#94a3b8" letterSpacing="1">VERIFIED EMPLOYMENT</text>
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
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#f0f4f8;font-family:'DM Sans',sans-serif}

        .pg{min-height:100vh;display:grid;grid-template-columns:1fr 1fr}

        /* ── Left — cool slate panel ── */
        .lft{
          background:#0f172a;
          display:flex;flex-direction:column;justify-content:space-between;
          padding:2.5rem 3.5rem;
        }
        .lft-body{padding-top:3rem}
        .tag{
          font-size:.66rem;font-weight:700;letter-spacing:1.4px;
          text-transform:uppercase;color:#60a5fa;
          display:flex;align-items:center;gap:.5rem;margin-bottom:1.25rem;
        }
        .tag-line{width:18px;height:1.5px;background:#2563eb;flex-shrink:0}
        .ttl{
          font-family:'Instrument Serif',serif;
          font-size:clamp(2rem,3vw,2.8rem);
          font-weight:400;line-height:1.2;
          color:#f1f5f9;letter-spacing:-.4px;margin-bottom:.9rem;
        }
        .ttl em{font-style:italic;color:#60a5fa}
        .dsc{font-size:.875rem;color:#475569;line-height:1.75;margin-bottom:2.5rem;max-width:340px}

        /* Feature checklist */
        .feats{display:flex;flex-direction:column;gap:.75rem;margin-bottom:3rem}
        .ft{display:flex;align-items:center;gap:.75rem;font-size:.83rem;color:#64748b}
        .fck{
          width:18px;height:18px;border-radius:50%;
          background:rgba(37,99,235,0.15);border:1px solid rgba(96,165,250,0.25);
          display:flex;align-items:center;justify-content:center;flex-shrink:0;
        }
        .fck svg{color:#60a5fa}

        /* Stats row */
        .stats{
          display:grid;grid-template-columns:1fr 1fr;gap:1px;
          background:rgba(255,255,255,0.06);
          border:1px solid rgba(255,255,255,0.06);
          border-radius:12px;overflow:hidden;
        }
        .stat{background:#0f172a;padding:1.1rem 1.25rem}
        .stat-v{font-size:1.4rem;font-weight:700;color:#f1f5f9;letter-spacing:-.5px}
        .stat-l{font-size:.72rem;color:#475569;margin-top:2px}

        /* Footer */
        .lft-ft{
          display:flex;justify-content:space-between;align-items:center;
          padding-top:1.5rem;border-top:1px solid rgba(255,255,255,0.06);
        }
        .fc{font-size:.7rem;color:#1e3a5f}
        .fl{display:flex;gap:.85rem}
        .fla{font-size:.7rem;color:#1e3a5f;text-decoration:none;transition:color .15s}
        .fla:hover{color:#60a5fa}

        /* ── Right — white form panel ── */
        .rgt{
          background:#fff;
          display:flex;align-items:center;justify-content:center;
          padding:3rem 2.5rem;
        }
        .fcd{width:100%;max-width:380px;display:flex;flex-direction:column;gap:1.1rem}

        .fhd{
          font-family:'Instrument Serif',serif;
          font-size:1.75rem;font-weight:400;color:#0f172a;letter-spacing:-.3px;
        }
        .fsb{font-size:.84rem;color:#94a3b8;margin-top:-.15rem}

        .fld{display:flex;flex-direction:column;gap:.35rem}
        .flb{font-size:.74rem;font-weight:600;color:#64748b;letter-spacing:.2px}
        .fin{
          padding:.75rem .9rem;
          background:#f8fafc;
          border:1.5px solid #e2e8f0;
          border-radius:9px;font-family:'DM Sans',sans-serif;
          font-size:.875rem;color:#0f172a;outline:none;width:100%;
          transition:border-color .15s,background .15s;
        }
        .fin::placeholder{color:#cbd5e1}
        .fin:focus{border-color:#2563eb;background:#fff;box-shadow:0 0 0 3px rgba(37,99,235,0.08)}
        .pw{position:relative}
        .pw .fin{padding-right:2.5rem}
        .ey{position:absolute;right:.8rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#cbd5e1;padding:0;transition:color .15s}
        .ey:hover{color:#94a3b8}

        .er{font-size:.79rem;color:#dc2626;padding:.65rem .9rem;background:#fef2f2;border:1px solid #fecaca;border-radius:8px}

        /* Navy/blue CTA for employer — distinct from employee green */
        .sub{
          padding:.85rem;background:#1e293b;color:#fff;border:none;
          border-radius:9px;font-family:'DM Sans',sans-serif;
          font-size:.9rem;font-weight:700;cursor:pointer;
          transition:background .15s;letter-spacing:.1px;
        }
        .sub:hover:not(:disabled){background:#0f172a}
        .sub:disabled{opacity:.5;cursor:not-allowed}

        .fgt{text-align:center}
        .fgt a{font-size:.79rem;color:#2563eb;text-decoration:none}
        .fgt a:hover{text-decoration:underline}

        .dvr{display:flex;align-items:center;gap:.7rem}
        .dvl{flex:1;height:1px;background:#f1f5f9}
        .dvt{font-size:.7rem;color:#cbd5e1}

        .tgl{text-align:center;font-size:.84rem;color:#94a3b8}
        .tgb{color:#2563eb;cursor:pointer;font-weight:700;background:none;border:none;font-family:inherit;font-size:inherit}
        .tgb:hover{text-decoration:underline}

        .cft{display:flex;justify-content:center;gap:1.25rem;padding-top:.15rem}
        .cft a{font-size:.69rem;color:#cbd5e1;text-decoration:none;transition:color .15s}
        .cft a:hover{color:#2563eb;text-decoration:underline}

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
            <div className="tag"><span className="tag-line"/>Employer Portal</div>
            <h2 className="ttl">Hire with<br/><em>verified confidence.</em></h2>
            <p className="dsc">Access pre-verified employee records instantly. Structured BGV data delivered the moment a candidate approves — no chasing, no paperwork.</p>

            <div className="feats">
              {[
                "Request employee consent in one click",
                "View verified Aadhaar, PAN, education, employment",
                "EPFO-linked employment history included",
                "Full consent audit trail — DPDP compliant",
              ].map(f => (
                <div className="ft" key={f}>
                  <div className="fck">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  {f}
                </div>
              ))}
            </div>

            <div className="stats">
              <div className="stat">
                <div className="stat-v">1-click</div>
                <div className="stat-l">Consent request to candidate</div>
              </div>
              <div className="stat">
                <div className="stat-v">Instant</div>
                <div className="stat-l">Data on approval</div>
              </div>
              <div className="stat">
                <div className="stat-v">Zero</div>
                <div className="stat-l">Document chasing</div>
              </div>
              <div className="stat">
                <div className="stat-v">100%</div>
                <div className="stat-l">Employee-consented</div>
              </div>
            </div>
          </div>

          <div className="lft-ft">
            <span className="fc">© 2026 Datagate</span>
            <div className="fl">
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="fla">Privacy Policy</a>
              <a href="/employer/terms" target="_blank" rel="noopener noreferrer" className="fla">Employer Terms</a>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="rgt">
          <div className="fcd">
            <div>
              <div className="fhd">{isSignup ? "Create account" : "Welcome back"}</div>
              <div className="fsb">{isSignup ? "Start hiring with verified data" : "Sign in to your employer account"}</div>
            </div>

            {isSignup && (
              <div className="fld">
                <label className="flb">Company Name</label>
                <input className="fin" placeholder="Acme Technologies Pvt Ltd" value={company} onChange={e => setCompany(e.target.value)}/>
              </div>
            )}

            <div className="fld">
              <label className="flb">Work Email</label>
              <input className="fin" type="email" placeholder="hr@company.com" value={email} onChange={e => setEmail(e.target.value)}/>
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
              <a href="/employer/terms" target="_blank" rel="noopener noreferrer">Employer Terms</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}