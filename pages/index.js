import Link from "next/link";

const Logo = ({ color = "#18151f" }) => (
  <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
    <svg width="28" height="32" viewBox="0 0 36 40" fill="none">
      <defs>
        <style>{`
          @keyframes lgp{0%{r:4.5;opacity:.4}100%{r:13;opacity:0}}
          @keyframes lgd{0%,100%{r:3.5}50%{r:2.6}}
          @keyframes lgf{0%{opacity:0;transform:translateY(0)}15%{opacity:.9}85%{opacity:.9}100%{opacity:0;transform:translateY(20px)}}
          .lgpr{animation:lgp 2.2s ease-out infinite;fill:none;stroke:#0d6e6e;stroke-width:1}
          .lgdt{animation:lgd 2.2s ease-in-out infinite;fill:#0d6e6e}
          .lgf1{animation:lgf 2.6s ease-in-out infinite}
          .lgf2{animation:lgf 2.6s ease-in-out infinite .87s}
          .lgf3{animation:lgf 2.6s ease-in-out infinite 1.74s}
        `}</style>
      </defs>
      <path d="M18 1.5L33 8V23Q33 36.5 18 39Q3 36.5 3 23V8Z" fill={color === "#ffffff" ? "rgba(255,255,255,0.12)" : "#18151f"} stroke={color === "#ffffff" ? "rgba(255,255,255,0.3)" : "#2d2838"} strokeWidth="0.8"/>
      <rect x="9.5" y="22" width="4.5" height="13" rx="1.8" fill="#0d6e6e"/>
      <rect x="22" y="22" width="4.5" height="13" rx="1.8" fill="#0d6e6e"/>
      <path d="M11.5 22Q18 13.5 24.5 22" fill="none" stroke="#0d6e6e" strokeWidth="3.8" strokeLinecap="round"/>
      <circle cx="18" cy="14" r="1.8" fill="#0d6e6e" opacity="0" className="lgf1"/>
      <circle cx="18" cy="14" r="1.8" fill="#0d6e6e" opacity="0" className="lgf2"/>
      <circle cx="18" cy="14" r="1.8" fill="#0d6e6e" opacity="0" className="lgf3"/>
      <circle cx="28.5" cy="7.5" className="lgdt"/>
      <circle cx="28.5" cy="7.5" className="lgpr"/>
    </svg>
    <div>
      <div style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:"15px", color, letterSpacing:"-0.4px", lineHeight:1 }}>Datagate</div>
      <div style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:"6.5px", color:"#0d6e6e", letterSpacing:"2px", textTransform:"uppercase", marginTop:"3px" }}>Verified Employment</div>
    </div>
  </div>
);

const Check = ({ color = "#0d6e6e" }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const Arrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body { background:#fff; color:#18151f; font-family:'DM Sans',sans-serif; -webkit-font-smoothing:antialiased; }
        a { text-decoration:none; color:inherit; }

        /* Nav */
        .nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:.9rem 3.5rem; background:rgba(255,255,255,0.95); backdrop-filter:blur(12px); border-bottom:1px solid #ede9f5; }
        .nav-r { display:flex; align-items:center; gap:.5rem; }
        .n-emp { padding:.46rem 1.1rem; border-radius:7px; border:1.5px solid #e2dded; color:#7a7386; font-size:.8rem; font-weight:600; transition:all .15s; }
        .n-emp:hover { border-color:#0d6e6e; color:#0d6e6e; }
        .n-er { padding:.46rem 1.2rem; border-radius:7px; background:#18151f; color:#fff; font-size:.8rem; font-weight:600; transition:all .15s; }
        .n-er:hover { background:#2d2838; }

        /* Hero */
        .hero { padding:9rem 3.5rem 5rem; max-width:1000px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:5rem; align-items:center; }
        .hero-l {}
        .tag { display:inline-flex; align-items:center; gap:.45rem; padding:.3rem .9rem; border-radius:100px; background:#f0f9f9; border:1px solid rgba(13,110,110,0.18); font-size:.67rem; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:#0d6e6e; margin-bottom:2rem; }
        .tag-dot { width:5px; height:5px; border-radius:50%; background:#0d6e6e; animation:blink 2s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
        .h1 { font-family:'Cormorant Garamond',serif; font-size:clamp(2.8rem,4vw,4rem); font-weight:500; line-height:1.1; color:#18151f; letter-spacing:-1px; margin-bottom:1.5rem; }
        .h1 em { font-style:italic; color:#0d6e6e; }
        .hero-p { font-size:.95rem; color:#7a7386; line-height:1.85; margin-bottom:2.5rem; max-width:400px; }
        .btns { display:flex; gap:.75rem; align-items:center; flex-wrap:wrap; }
        .btn-p { padding:.8rem 1.75rem; background:#0d6e6e; color:#fff; border:none; border-radius:8px; font-size:.875rem; font-weight:600; display:inline-flex; align-items:center; gap:.4rem; transition:all .15s; }
        .btn-p:hover { background:#0f8a8a; transform:translateY(-1px); }
        .btn-s { padding:.8rem 1.75rem; background:#fff; color:#18151f; border:1.5px solid #e2dded; border-radius:8px; font-size:.875rem; font-weight:600; transition:all .15s; }
        .btn-s:hover { border-color:#18151f; }

        /* Hero right — visual */
        .hero-r { position:relative; }
        .consent-card { background:#fff; border:1.5px solid #ede9f5; border-radius:16px; padding:1.75rem; box-shadow:0 4px 40px rgba(24,21,31,0.06); }
        .cc-title { font-size:.7rem; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#b8b3c2; margin-bottom:1.25rem; }
        .cc-flow { display:flex; align-items:center; gap:.5rem; margin-bottom:1.25rem; }
        .cc-node { flex:1; background:#f8f7fa; border:1.5px solid #ede9f5; border-radius:10px; padding:.75rem; text-align:center; }
        .cc-node-icon { font-size:1.1rem; margin-bottom:.25rem; }
        .cc-node-label { font-size:.7rem; font-weight:700; color:#18151f; }
        .cc-node-sub { font-size:.62rem; color:#b8b3c2; margin-top:1px; }
        .cc-arrow { color:#e2dded; font-size:1rem; flex-shrink:0; }
        .cc-gate { background:#f0f9f9; border:1.5px solid rgba(13,110,110,0.2); border-radius:10px; padding:.75rem; text-align:center; flex:1.2; }
        .cc-gate-icon { font-size:1.1rem; margin-bottom:.2rem; }
        .cc-gate-label { font-size:.7rem; font-weight:700; color:#0d6e6e; }
        .cc-gate-sub { font-size:.62rem; color:rgba(13,110,110,.5); margin-top:1px; }
        .cc-status { display:flex; align-items:center; gap:.6rem; background:#f0f9f9; border:1px solid rgba(13,110,110,.15); border-radius:8px; padding:.6rem .85rem; }
        .cc-dot { width:7px; height:7px; border-radius:50%; background:#0d6e6e; flex-shrink:0; animation:blink 2s ease-in-out infinite; }
        .cc-status span { font-size:.75rem; font-weight:600; color:#0d6e6e; }
        .cc-pts { display:flex; flex-direction:column; gap:.6rem; margin-top:1.25rem; }
        .cc-pt { display:flex; align-items:center; gap:.55rem; font-size:.78rem; color:#7a7386; }
        .cc-ptck { width:16px; height:16px; border-radius:5px; background:#f0f9f9; border:1px solid rgba(13,110,110,.2); display:flex; align-items:center; justify-content:center; flex-shrink:0; }

        /* Trust bar */
        .trust { border-top:1px solid #f2f0f5; border-bottom:1px solid #f2f0f5; background:#f8f7fa; padding:1rem 3.5rem; display:flex; justify-content:center; align-items:center; gap:3rem; flex-wrap:wrap; }
        .ti { display:flex; align-items:center; gap:.4rem; font-size:.73rem; font-weight:600; color:#b8b3c2; }
        .tck { width:15px; height:15px; border-radius:50%; background:#f0f9f9; border:1px solid rgba(13,110,110,.2); display:flex; align-items:center; justify-content:center; flex-shrink:0; }

        /* Sections */
        .sec { padding:6rem 3.5rem; max-width:1100px; margin:0 auto; }
        .lbl { font-size:.65rem; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#0d6e6e; display:flex; align-items:center; gap:.6rem; margin-bottom:.85rem; }
        .lbl::before { content:''; width:18px; height:1.5px; background:#0d6e6e; }
        .sec-t { font-family:'Cormorant Garamond',serif; font-size:clamp(1.8rem,3vw,2.6rem); font-weight:500; color:#18151f; letter-spacing:-.4px; margin-bottom:3rem; line-height:1.2; }

        /* Steps */
        .steps { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
        .step { padding:2rem; border:1.5px solid #ede9f5; border-radius:14px; background:#fff; transition:all .2s; }
        .step:hover { border-color:#0d6e6e; box-shadow:0 8px 32px rgba(13,110,110,.07); }
        .step-n { font-family:'Cormorant Garamond',serif; font-size:2.5rem; font-weight:500; color:#ede9f5; line-height:1; margin-bottom:1rem; }
        .step-t { font-size:.88rem; font-weight:700; color:#18151f; margin-bottom:.4rem; }
        .step-d { font-size:.79rem; color:#b8b3c2; line-height:1.75; }

        /* Features */
        .feat-s { background:#f8f7fa; padding:6rem 3.5rem; }
        .feat-i { max-width:1100px; margin:0 auto; }
        .feat-g { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:#ede9f5; border:1px solid #ede9f5; border-radius:16px; overflow:hidden; }
        .fc { background:#fff; padding:2rem 1.75rem; transition:background .15s; }
        .fc:hover { background:#f8f7fa; }
        .fi { width:34px; height:34px; border-radius:9px; background:#f0f9f9; border:1px solid rgba(13,110,110,.15); display:flex; align-items:center; justify-content:center; margin-bottom:1rem; color:#0d6e6e; }
        .ft { font-size:.87rem; font-weight:700; color:#18151f; margin-bottom:.4rem; }
        .fd { font-size:.78rem; color:#b8b3c2; line-height:1.75; }

        /* For who */
        .for-g { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; }
        .for-c { border:1.5px solid #ede9f5; border-radius:16px; padding:2.5rem; background:#fff; transition:all .2s; position:relative; overflow:hidden; }
        .for-c::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:#0d6e6e; transform:scaleX(0); transition:transform .2s; transform-origin:left; }
        .for-c:hover::before { transform:scaleX(1); }
        .for-c:hover { box-shadow:0 12px 40px rgba(24,21,31,.07); }
        .for-tag { font-size:.62rem; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:#0d6e6e; margin-bottom:1rem; }
        .for-title { font-family:'Cormorant Garamond',serif; font-size:1.4rem; font-weight:500; color:#18151f; margin-bottom:.85rem; line-height:1.3; }
        .for-desc { font-size:.83rem; color:#b8b3c2; line-height:1.8; margin-bottom:1.75rem; }
        .for-pts { display:flex; flex-direction:column; gap:.55rem; margin-bottom:2rem; }
        .for-pt { display:flex; align-items:flex-start; gap:.5rem; font-size:.81rem; color:#7a7386; line-height:1.5; }
        .for-ptck { width:16px; height:16px; border-radius:5px; background:#f0f9f9; border:1px solid rgba(13,110,110,.18); display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; }
        .for-btn { display:inline-flex; align-items:center; gap:.45rem; padding:.7rem 1.4rem; background:#18151f; color:#fff; border-radius:8px; font-size:.81rem; font-weight:600; transition:all .15s; }
        .for-btn:hover { background:#0d6e6e; gap:.65rem; }

        /* Footer */
        footer { border-top:1px solid #f2f0f5; padding:2.5rem 3.5rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; background:#f8f7fa; }
        .f-l { display:flex; align-items:center; gap:2rem; flex-wrap:wrap; }
        .f-copy { font-size:.72rem; color:#d8d4e3; }
        .f-links { display:flex; gap:2rem; }
        .f-link { font-size:.72rem; color:#b8b3c2; font-weight:500; transition:color .15s; }
        .f-link:hover { color:#0d6e6e; }

        @media(max-width:960px) {
          .nav { padding:.85rem 1.5rem; }
          .hero { grid-template-columns:1fr; gap:2.5rem; padding:8rem 1.5rem 4rem; }
          .hero-p { max-width:100%; }
          .sec,.for-s { padding:4rem 1.5rem; }
          .feat-s { padding:4rem 1.5rem; }
          .steps,.feat-g,.for-g { grid-template-columns:1fr; }
          footer { flex-direction:column; align-items:flex-start; padding:2rem 1.5rem; }
          .trust { gap:1.5rem; padding:1rem 1.5rem; }
        }
      `}</style>

      <div>
        {/* Nav */}
        <nav className="nav">
          <Logo />
          <div className="nav-r">
            <Link href="/employee/login" className="n-emp">Employee</Link>
            <Link href="/employer/login" className="n-er">Employer Login</Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="hero">
          <div className="hero-l">
            <div className="tag"><span className="tag-dot"/>Consent-based employment verification</div>
            <h1 className="h1">One profile.<br/>Every employer.<br/><em>Your consent.</em></h1>
            <p className="hero-p">Employees build a verified profile once. Employers get structured, reliable data the moment you approve — no forms, no chasing, no repeat paperwork.</p>
            <div className="btns">
              <Link href="/employee/login" className="btn-p">Create employee profile <Arrow /></Link>
              <Link href="/employer/login" className="btn-s">Employer portal</Link>
            </div>
          </div>

          <div className="hero-r">
            <div className="consent-card">
              <div className="cc-title">How data moves</div>
              <div className="cc-flow">
                <div className="cc-node">
                  <div className="cc-node-icon">👤</div>
                  <div className="cc-node-label">Employee</div>
                  <div className="cc-node-sub">Owns the data</div>
                </div>
                <span className="cc-arrow">→</span>
                <div className="cc-gate">
                  <div className="cc-gate-icon">🔐</div>
                  <div className="cc-gate-label">Datagate</div>
                  <div className="cc-gate-sub">Consent gateway</div>
                </div>
                <span className="cc-arrow">→</span>
                <div className="cc-node">
                  <div className="cc-node-icon">🏢</div>
                  <div className="cc-node-label">Employer</div>
                  <div className="cc-node-sub">Receives data</div>
                </div>
              </div>
              <div className="cc-status">
                <div className="cc-dot"/>
                <span>Data moves only after your explicit approval</span>
              </div>
              <div className="cc-pts">
                {["You approve each request individually","Revoke access at any time, instantly","Full log of every data share"].map(p => (
                  <div className="cc-pt" key={p}>
                    <div className="cc-ptck"><Check /></div>
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Trust */}
        <div className="trust">
          {["DPDP Act 2023 Compliant","Explicit consent on every share","Employee-controlled access","No data sold or shared without approval"].map(t => (
            <div className="ti" key={t}><div className="tck"><Check /></div>{t}</div>
          ))}
        </div>

        {/* How it works */}
        <div className="sec">
          <div className="lbl">How it works</div>
          <div className="sec-t">Three steps to a verified profile</div>
          <div className="steps">
            {[
              ["01","Build your profile","Fill personal details, education, employment history, and upload documents — once, on Datagate."],
              ["02","Employer requests access","When a company wants your background data, you receive a consent request. You review it and decide."],
              ["03","Approve and done","One tap and your verified data reaches the employer instantly. No forms, no delays, no duplicated effort."],
            ].map(([n,t,d]) => (
              <div className="step" key={n}>
                <div className="step-n">{n}</div>
                <div className="step-t">{t}</div>
                <div className="step-d">{d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="feat-s">
          <div className="feat-i">
            <div className="lbl">Platform capabilities</div>
            <div className="sec-t">Everything background verification needs</div>
            <div className="feat-g">
              {[
                {icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,t:"Consent on every share",d:"No employer sees your data without your explicit approval. Every access is logged with timestamp and purpose."},
                {icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,t:"Complete BGV coverage",d:"Aadhaar, PAN, education records, employment history, UAN and PF — all structured and ready."},
                {icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,t:"Instant for returning users",d:"Once your profile is built, every future employer gets your verified data the moment you approve."},
                {icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,t:"Secure document storage",d:"All documents encrypted and stored securely. Only you control who gets access and when."},
                {icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,t:"EPFO linked records",d:"Employment history independently sourced from EPFO — not self-reported."},
                {icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,t:"Works on any device",d:"Complete your full profile from any phone or computer. No app download required."},
              ].map(f => (
                <div className="fc" key={f.t}><div className="fi">{f.icon}</div><div className="ft">{f.t}</div><div className="fd">{f.d}</div></div>
              ))}
            </div>
          </div>
        </div>

        {/* For who */}
        <div className="sec">
          <div className="lbl">Who it's for</div>
          <div className="sec-t" style={{marginBottom:"2.5rem"}}>Built for both sides of hiring</div>
          <div className="for-g">
            <div className="for-c">
              <div className="for-tag">For Individuals</div>
              <div className="for-title">Tired of filling the same forms for every employer?</div>
              <div className="for-desc">Build your verified employment profile once and share it with any company. You stay in control of who sees what, always.</div>
              <div className="for-pts">
                {["Fill details once — personal, education, employment","Approve or decline every employer request","See exactly who accessed your data and when"].map(p => (
                  <div className="for-pt" key={p}><div className="for-ptck"><Check /></div>{p}</div>
                ))}
              </div>
              <Link href="/employee/login" className="for-btn">Create your profile <Arrow /></Link>
            </div>
            <div className="for-c">
              <div className="for-tag">For Organisations</div>
              <div className="for-title">Verified candidate data without the paperwork chase?</div>
              <div className="for-desc">Stop chasing candidates for documents. Request access to a pre-built verified profile and receive structured data the moment they approve.</div>
              <div className="for-pts">
                {["Send a consent request in one click","Receive structured BGV and onboarding data instantly","Full consent audit trail for every data access"].map(p => (
                  <div className="for-pt" key={p}><div className="for-ptck"><Check /></div>{p}</div>
                ))}
              </div>
              <Link href="/employer/login" className="for-btn">Access employer portal <Arrow /></Link>
            </div>
          </div>
        </div>

        <footer>
          <div className="f-l">
            <Logo />
            <span className="f-copy">© 2026 Datagate Technologies. All rights reserved.</span>
          </div>
          <div className="f-links">
            <a href="/privacy" className="f-link">Privacy Policy</a>
            <a href="/employer/terms" className="f-link">Employer Terms</a>
            <a href="mailto:support@datagate.co.in" className="f-link">Contact</a>
          </div>
        </footer>
      </div>
    </>
  );
}