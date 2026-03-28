import Link from "next/link";

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
);
const Check = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

const ConsentFlow = () => (
  <svg width="100%" viewBox="0 0 480 190" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Employee */}
    <circle cx="72" cy="72" r="30" fill="rgba(201,168,76,0.07)" stroke="rgba(201,168,76,0.18)" strokeWidth="1.5"/>
    <circle cx="72" cy="62" r="11" fill="rgba(201,168,76,0.25)" stroke="#c9a84c" strokeWidth="1.5"/>
    <path d="M50 96Q50 81 72 81Q94 81 94 96" fill="rgba(201,168,76,0.12)" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
    <text x="72" y="118" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="10" fontWeight="600" fill="#c9a84c">Employee</text>
    <text x="72" y="131" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="8.5" fill="#3a3530">Owns the data</text>
    {/* Arrow left */}
    <path d="M106 72 L168 72" stroke="#2a2a30" strokeWidth="1.5" strokeDasharray="4 3"/>
    <path d="M161 68 L169 72 L161 76" fill="none" stroke="#2a2a30" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <text x="137" y="64" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="8" fill="#2a2a30">Request</text>
    {/* Gateway center */}
    <rect x="170" y="44" width="140" height="72" rx="14" fill="#141416" stroke="rgba(201,168,76,0.25)" strokeWidth="1.5"/>
    <path d="M240 54L253 59.5V72Q253 81 240 84Q227 81 227 72V59.5Z" fill="rgba(201,168,76,0.12)" stroke="#c9a84c" strokeWidth="1.2"/>
    <rect x="233" y="70" width="3.5" height="8" rx="1" fill="#c9a84c" opacity="0.8"/>
    <rect x="243.5" y="70" width="3.5" height="8" rx="1" fill="#c9a84c" opacity="0.8"/>
    <path d="M234.5 70Q240 63 245.5 70" fill="none" stroke="#c9a84c" strokeWidth="2.5" strokeLinecap="round"/>
    <text x="240" y="100" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="9" fontWeight="700" fill="#c9a84c" letterSpacing="0.5">DATAGATE</text>
    <text x="240" y="112" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="7.5" fill="#3a3530">Consent Gateway</text>
    {/* Arrow right */}
    <path d="M313 72 L374 72" stroke="rgba(201,168,76,0.45)" strokeWidth="1.5" strokeDasharray="4 3"/>
    <path d="M367 68 L375 72 L367 76" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <text x="343" y="64" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="8" fill="#c9a84c">Approved data</text>
    {/* Employer */}
    <circle cx="408" cy="72" r="30" fill="rgba(201,168,76,0.07)" stroke="rgba(201,168,76,0.18)" strokeWidth="1.5"/>
    <rect x="393" y="58" width="30" height="22" rx="3" fill="rgba(201,168,76,0.18)" stroke="#c9a84c" strokeWidth="1.5"/>
    <rect x="397" y="63" width="7" height="5" rx="1" fill="#c9a84c" opacity="0.55"/>
    <rect x="409" y="63" width="7" height="5" rx="1" fill="#c9a84c" opacity="0.55"/>
    <rect x="397" y="72" width="18" height="2" rx="1" fill="#c9a84c" opacity="0.3"/>
    <text x="408" y="118" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="10" fontWeight="600" fill="#c9a84c">Employer</text>
    <text x="408" y="131" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="8.5" fill="#3a3530">Requests access</text>
    {/* Bottom badge */}
    <rect x="155" y="152" width="170" height="22" rx="11" fill="rgba(34,197,94,0.07)" stroke="rgba(34,197,94,0.18)" strokeWidth="1"/>
    <circle cx="173" cy="163" r="3.5" fill="#22c55e" opacity="0.7"/>
    <text x="240" y="167" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="8.5" fontWeight="600" fill="#22c55e">Data flows only after your explicit approval</text>
  </svg>
);

const Logo = () => (
  <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
    <svg width="30" height="34" viewBox="0 0 36 40" fill="none">
      <defs>
        <style>{`.lp{animation:lpa 2s ease-out infinite;fill:none;stroke:#c9a84c;stroke-width:1.2}.ld{animation:lda 2s ease-in-out infinite;fill:#c9a84c}.lf1{animation:lfa 2.4s ease-in-out infinite}.lf2{animation:lfa 2.4s ease-in-out infinite .8s}.lf3{animation:lfa 2.4s ease-in-out infinite 1.6s}@keyframes lpa{0%{r:4.5;opacity:.5}100%{r:13;opacity:0}}@keyframes lda{0%,100%{r:3.5}50%{r:2.6}}@keyframes lfa{0%{opacity:0;transform:translateY(0)}15%{opacity:1}85%{opacity:1}100%{opacity:0;transform:translateY(22px)}}`}</style>
        <linearGradient id="lg1" x1="0" y1="0" x2="36" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#2a2a2e"/><stop offset="100%" stopColor="#1a1a1e"/></linearGradient>
      </defs>
      <path d="M18 1L34 8V24Q34 38 18 40Q2 38 2 24V8Z" fill="url(#lg1)" stroke="#c9a84c" strokeWidth="0.8" strokeOpacity="0.35"/>
      <rect x="9" y="22" width="5" height="14" rx="2" fill="#c9a84c" opacity="0.9"/>
      <rect x="22" y="22" width="5" height="14" rx="2" fill="#c9a84c" opacity="0.9"/>
      <path d="M11.5 22Q18 13 24.5 22" fill="none" stroke="#c9a84c" strokeWidth="4" strokeLinecap="round" opacity="0.9"/>
      <circle cx="18" cy="14" r="2" fill="#c9a84c" opacity="0" className="lf1"/>
      <circle cx="18" cy="14" r="2" fill="#c9a84c" opacity="0" className="lf2"/>
      <circle cx="18" cy="14" r="2" fill="#c9a84c" opacity="0" className="lf3"/>
      <circle cx="29" cy="8" className="ld"/>
      <circle cx="29" cy="8" className="lp"/>
    </svg>
    <div>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:"14px",color:"#f5f0e8",letterSpacing:"-0.3px",lineHeight:1}}>Datagate</div>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:"6.5px",color:"#c9a84c",letterSpacing:"1.8px",textTransform:"uppercase",marginTop:"2px"}}>Verified Employment</div>
    </div>
  </div>
);

export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{background:#0e0e10;color:#f5f0e8;font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}
        a{text-decoration:none;color:inherit}

        .nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1rem 3rem;background:rgba(14,14,16,0.94);backdrop-filter:blur(16px);border-bottom:1px solid rgba(201,168,76,0.08)}
        .nav-r{display:flex;align-items:center;gap:.5rem}
        .n-emp{padding:.48rem 1.1rem;border-radius:8px;border:1.5px solid #1a1a1e;color:#a09888;font-size:.8rem;font-weight:600;transition:all .15s}
        .n-emp:hover{border-color:rgba(201,168,76,.3);color:#c9a84c}
        .n-er{padding:.48rem 1.2rem;border-radius:8px;background:rgba(201,168,76,0.09);border:1.5px solid rgba(201,168,76,0.22);color:#c9a84c;font-size:.8rem;font-weight:700;transition:all .15s}
        .n-er:hover{background:rgba(201,168,76,0.16)}

        .hero{padding:10rem 3rem 5rem;max-width:860px;margin:0 auto;text-align:center;position:relative}
        .hero::before{content:'';position:absolute;top:6rem;left:50%;transform:translateX(-50%);width:700px;height:500px;background:radial-gradient(ellipse,rgba(201,168,76,0.045) 0%,transparent 68%);pointer-events:none;z-index:0}
        .hero>*{position:relative;z-index:1}
        .pill{display:inline-flex;align-items:center;gap:.5rem;padding:.35rem 1rem;border-radius:100px;border:1px solid rgba(201,168,76,0.18);background:rgba(201,168,76,0.05);font-size:.67rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#c9a84c;margin-bottom:2.25rem}
        .pill-dot{width:5px;height:5px;border-radius:50%;background:#c9a84c;animation:bd 2s ease-in-out infinite}
        @keyframes bd{0%,100%{opacity:1}50%{opacity:.3}}
        .h1{font-family:'Playfair Display',serif;font-size:clamp(2.8rem,5.5vw,4.8rem);font-weight:600;line-height:1.11;color:#f5f0e8;letter-spacing:-1.5px;margin-bottom:1.5rem}
        .h1 em{font-style:italic;color:#c9a84c}
        .hero-p{font-size:1rem;color:#504a44;line-height:1.85;max-width:540px;margin:0 auto 2rem}
        .illus{margin:0 auto 2.5rem;max-width:500px;background:#141416;border:1px solid #1a1a1e;border-radius:20px;padding:1.75rem 1.75rem 1.25rem;overflow:hidden}
        .btns{display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap;margin-bottom:.75rem}
        .btn-e{padding:.85rem 2rem;background:#c9a84c;color:#0e0e10;border:none;border-radius:10px;font-size:.88rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:.4rem;transition:all .15s}
        .btn-e:hover{background:#e8c96a;transform:translateY(-1px)}
        .btn-er{padding:.85rem 2rem;background:transparent;color:#f5f0e8;border:1.5px solid #222228;border-radius:10px;font-size:.88rem;font-weight:600;transition:all .15s}
        .btn-er:hover{border-color:rgba(201,168,76,.3);color:#c9a84c}
        .btn-note{font-size:.72rem;color:#2a2a30;text-align:center}

        .trust{border-top:1px solid #141416;border-bottom:1px solid #141416;background:#0c0c0e;padding:1.1rem 2rem;display:flex;justify-content:center;align-items:center;gap:3rem;flex-wrap:wrap}
        .ti{display:flex;align-items:center;gap:.45rem;font-size:.72rem;font-weight:600;color:#2a2a30}
        .tck{width:15px;height:15px;border-radius:50%;background:rgba(201,168,76,0.07);border:1px solid rgba(201,168,76,0.16);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#c9a84c}

        .sec{padding:7rem 3rem;max-width:1120px;margin:0 auto}
        .lbl{font-size:.64rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#c9a84c;display:flex;align-items:center;gap:.6rem;margin-bottom:1rem}
        .lbl::before{content:'';width:18px;height:1.5px;background:#c9a84c}
        .sec-t{font-family:'Playfair Display',serif;font-size:clamp(1.8rem,3vw,2.5rem);font-weight:600;color:#f5f0e8;letter-spacing:-.4px;margin-bottom:3.5rem;line-height:1.2}

        .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#141416;border:1px solid #141416;border-radius:16px;overflow:hidden}
        .sc{background:#0e0e10;padding:2.25rem 2rem;transition:background .15s}
        .sc:hover{background:#101012}
        .sn{font-family:'Playfair Display',serif;font-size:2.8rem;font-weight:600;color:#1a1a1e;line-height:1;margin-bottom:1.25rem}
        .st{font-size:.9rem;font-weight:700;color:#f5f0e8;margin-bottom:.5rem}
        .sd{font-size:.79rem;color:#2a2a30;line-height:1.75}

        .feats{background:#0c0c0e;padding:7rem 3rem}
        .feats-i{max-width:1120px;margin:0 auto}
        .fg{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#141416;border:1px solid #141416;border-radius:16px;overflow:hidden}
        .fc{background:#0c0c0e;padding:2.25rem 2rem;transition:background .15s}
        .fc:hover{background:#0e0e10}
        .fi{width:34px;height:34px;border-radius:9px;background:rgba(201,168,76,0.07);border:1px solid rgba(201,168,76,0.12);display:flex;align-items:center;justify-content:center;margin-bottom:1rem;color:#c9a84c}
        .ft{font-size:.87rem;font-weight:700;color:#f5f0e8;margin-bottom:.4rem}
        .fd{font-size:.78rem;color:#222228;line-height:1.75}

        .for-s{padding:7rem 3rem;max-width:1120px;margin:0 auto}
        .for-g{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem}
        .for-c{border:1px solid #1a1a1e;border-radius:16px;padding:2.5rem;background:#141416;transition:border-color .2s;position:relative;overflow:hidden}
        .for-c::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#c9a84c,transparent);opacity:0;transition:opacity .2s}
        .for-c:hover{border-color:rgba(201,168,76,.18)}
        .for-c:hover::after{opacity:1}
        .for-tag{font-size:.61rem;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#c9a84c;display:flex;align-items:center;gap:.4rem;margin-bottom:1rem}
        .for-tag span{width:4px;height:4px;border-radius:50%;background:#c9a84c}
        .for-title{font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:600;color:#f5f0e8;margin-bottom:.85rem;line-height:1.3}
        .for-desc{font-size:.83rem;color:#2a2a30;line-height:1.8;margin-bottom:1.75rem}
        .for-pts{display:flex;flex-direction:column;gap:.6rem;margin-bottom:2rem}
        .for-pt{display:flex;align-items:flex-start;gap:.5rem;font-size:.81rem;color:#3a3530;line-height:1.5}
        .for-ptck{width:15px;height:15px;border-radius:5px;background:rgba(201,168,76,0.07);border:1px solid rgba(201,168,76,0.18);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;color:#c9a84c}
        .for-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.7rem 1.4rem;background:#c9a84c;color:#0e0e10;border-radius:9px;font-size:.81rem;font-weight:700;transition:all .15s}
        .for-btn:hover{background:#e8c96a;gap:.7rem}

        footer{border-top:1px solid #141416;padding:2.5rem 3rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;background:#0c0c0e}
        .fl{display:flex;align-items:center;gap:2rem;flex-wrap:wrap}
        .fc-copy{font-size:.71rem;color:#1a1a1e}
        .f-links{display:flex;gap:2rem}
        .f-link{font-size:.71rem;color:#2a2a30;font-weight:500;transition:color .15s}
        .f-link:hover{color:#c9a84c}

        @media(max-width:900px){
          .nav{padding:.85rem 1.25rem}
          .hero{padding:9rem 1.5rem 4rem}
          .sec,.for-s{padding:4rem 1.5rem}
          .feats{padding:4rem 1.5rem}
          .steps,.fg,.for-g{grid-template-columns:1fr}
          footer{flex-direction:column;align-items:flex-start;padding:2rem 1.5rem}
          .trust{gap:1.5rem}
        }
      `}</style>

      <div>
        <nav className="nav">
          <Link href="/"><Logo /></Link>
          <div className="nav-r">
            <Link href="/employee/login" className="n-emp">I'm an Employee</Link>
            <Link href="/employer/login" className="n-er">I'm an Employer</Link>
          </div>
        </nav>

        <section className="hero">
          <div className="pill"><span className="pill-dot"/>Consent-Based Employment Verification</div>
          <h1 className="h1">Your employment record,<br/>verified once.<br/><em>Trusted everywhere.</em></h1>
          <p className="hero-p">We are the gateway between your data and every employer. Nothing moves without your explicit approval — every time, no exceptions.</p>
          <div className="illus"><ConsentFlow /></div>
          <div className="btns">
            <Link href="/employee/login" className="btn-e">Create employee profile <ArrowRight /></Link>
            <Link href="/employer/login" className="btn-er">Employer portal</Link>
          </div>
          <div className="btn-note">Free for employees &nbsp;·&nbsp; Employers pay per verified hire</div>
        </section>

        <div className="trust">
          {["DPDP Act 2023 Compliant","Explicit consent on every share","Data stored in India","Employee-controlled access"].map(t => (
            <div className="ti" key={t}><div className="tck"><Check /></div>{t}</div>
          ))}
        </div>

        <div className="sec">
          <div className="lbl">How it works</div>
          <div className="sec-t">Three steps to a verified profile</div>
          <div className="steps">
            {[["01","Build your profile","Fill personal details, education, employment history, and upload documents — once, on Datagate."],["02","Employer requests access","When a company wants your background data, you receive a consent request. You review and decide."],["03","Approve and done","One tap sends your verified data to the employer instantly. No forms, no delays, no duplicated effort."]].map(([n,t,d]) => (
              <div className="sc" key={n}><div className="sn">{n}</div><div className="st">{t}</div><div className="sd">{d}</div></div>
            ))}
          </div>
        </div>

        <div className="feats">
          <div className="feats-i">
            <div className="lbl">Platform capabilities</div>
            <div className="sec-t">Everything background verification needs</div>
            <div className="fg">
              {[
                {icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,t:"Consent on every share",d:"No employer sees your data without your explicit approval. Every access is logged with timestamp and purpose."},
                {icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,t:"Complete BGV coverage",d:"Aadhaar, PAN, education records, employment history, UAN and PF — all structured and ready for verification."},
                {icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,t:"Instant for returning users",d:"Once your profile is built, every future employer gets your verified data instantly the moment you approve."},
                {icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,t:"Secure document storage",d:"All documents encrypted and stored securely. Only you control who gets access and when."},
                {icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,t:"EPFO linked records",d:"Employment history sourced from EPFO records — independently verifiable, not self-reported."},
                {icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,t:"Works on any device",d:"Employees complete their full profile from any phone or computer. No app download required."},
              ].map(f => (
                <div className="fc" key={f.t}><div className="fi">{f.icon}</div><div className="ft">{f.t}</div><div className="fd">{f.d}</div></div>
              ))}
            </div>
          </div>
        </div>

        <div className="for-s">
          <div className="lbl">Who it's for</div>
          <div className="sec-t" style={{marginBottom:"2.5rem"}}>Built for both sides of hiring</div>
          <div className="for-g">
            <div className="for-c">
              <div className="for-tag"><span/>For Individuals</div>
              <div className="for-title">Tired of filling the same forms for every job?</div>
              <div className="for-desc">Build your verified employment profile once and share it with any company. You're always in control of who sees what.</div>
              <div className="for-pts">
                {["Fill personal, education, and employment details once","Approve or decline every employer request","See exactly who accessed your data and when"].map(p => (
                  <div className="for-pt" key={p}><div className="for-ptck"><Check /></div>{p}</div>
                ))}
              </div>
              <Link href="/employee/login" className="for-btn">Create your profile <ArrowRight /></Link>
            </div>
            <div className="for-c">
              <div className="for-tag"><span/>For Organisations</div>
              <div className="for-title">Want verified candidate data without the wait?</div>
              <div className="for-desc">Stop chasing candidates for documents. Request access to a pre-built verified profile and receive structured data the moment they approve.</div>
              <div className="for-pts">
                {["Send a consent request in one click","Receive structured BGV and onboarding data instantly","Full consent audit trail for every data access"].map(p => (
                  <div className="for-pt" key={p}><div className="for-ptck"><Check /></div>{p}</div>
                ))}
              </div>
              <Link href="/employer/login" className="for-btn">Access employer portal <ArrowRight /></Link>
            </div>
          </div>
        </div>

        <footer>
          <div className="fl"><Logo /><span className="fc-copy">© 2026 Datagate Technologies. All rights reserved.</span></div>
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