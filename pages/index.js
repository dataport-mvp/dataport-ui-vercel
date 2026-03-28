import Link from "next/link";

const SHIELD = ({ size = 36, gold = "#c9a84c", pulse = true }) => {
  const id = `dg${size}`;
  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", flexShrink: 0 }}>
      <defs>
        <style>{`
          @keyframes ${id}pulse{0%{r:5;opacity:.5}100%{r:14;opacity:0}}
          @keyframes ${id}dot{0%,100%{r:3.8}50%{r:2.8}}
          @keyframes ${id}p{0%{opacity:0;transform:translateY(0)}15%{opacity:1}85%{opacity:1}100%{opacity:0;transform:translateY(22px)}}
          .${id}pr{animation:${id}pulse 2s ease-out infinite;fill:none;stroke:${gold};stroke-width:1.2}
          .${id}dt{animation:${id}dot 2s ease-in-out infinite;fill:${gold}}
          .${id}p1{animation:${id}p 2.4s ease-in-out infinite}
          .${id}p2{animation:${id}p 2.4s ease-in-out infinite .8s}
          .${id}p3{animation:${id}p 2.4s ease-in-out infinite 1.6s}
        `}</style>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="36" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2a2a2e"/>
          <stop offset="100%" stopColor="#1a1a1e"/>
        </linearGradient>
      </defs>
      <path d="M18 1L34 8V24Q34 38 18 40Q2 38 2 24V8Z" fill={`url(#${id}g)`} stroke={gold} strokeWidth="0.8" strokeOpacity="0.4"/>
      <rect x="9" y="22" width="5" height="14" rx="2" fill={gold} opacity="0.9"/>
      <rect x="22" y="22" width="5" height="14" rx="2" fill={gold} opacity="0.9"/>
      <path d="M11.5 22Q18 13 24.5 22" fill="none" stroke={gold} strokeWidth="4" strokeLinecap="round" opacity="0.9"/>
      <circle cx="18" cy="14" r="2" fill={gold} opacity="0" className={`${id}p1`}/>
      <circle cx="18" cy="14" r="2" fill={gold} opacity="0" className={`${id}p2`}/>
      <circle cx="18" cy="14" r="2" fill={gold} opacity="0" className={`${id}p3`}/>
      {pulse && <>
        <circle cx="29" cy="8" className={`${id}dt`}/>
        <circle cx="29" cy="8" className={`${id}pr`}/>
      </>}
    </svg>
  );
};

const Logo = ({ size = 36 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    <SHIELD size={size} />
    <div>
      <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: size * 0.42, color: "#f5f0e8", letterSpacing: "-0.3px", lineHeight: 1 }}>
        Datagate
      </div>
      <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: size * 0.19, color: "#c9a84c", letterSpacing: "1.8px", textTransform: "uppercase", marginTop: "2px" }}>
        Verified Employment
      </div>
    </div>
  </div>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

export default function Home() {
  return (
    <>
      <style>{`
        .dg-page { min-height: 100vh; background: #0e0e10; }

        /* ── Nav ── */
        .dg-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 3rem;
          background: rgba(14,14,16,0.92);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(201,168,76,0.1);
        }
        .dg-nav-links { display: flex; align-items: center; gap: 0.5rem; }
        .dg-nav-emp {
          padding: 0.5rem 1.1rem; border-radius: 8px;
          border: 1.5px solid #2a2a30; color: #a09888;
          font-size: 0.8rem; font-weight: 600; transition: all 0.15s;
          text-decoration: none;
        }
        .dg-nav-emp:hover { border-color: #c9a84c; color: #c9a84c; }
        .dg-nav-er {
          padding: 0.5rem 1.25rem; border-radius: 8px;
          background: #c9a84c; color: #0e0e10;
          font-size: 0.8rem; font-weight: 700; transition: all 0.15s;
          text-decoration: none;
        }
        .dg-nav-er:hover { background: #e8c96a; }

        /* ── Hero ── */
        .dg-hero {
          padding: 11rem 3rem 7rem;
          max-width: 900px; margin: 0 auto; text-align: center;
          position: relative;
        }
        .dg-hero::before {
          content: '';
          position: absolute; top: 8rem; left: 50%; transform: translateX(-50%);
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .dg-pill {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.35rem 1rem; border-radius: 100px;
          border: 1px solid rgba(201,168,76,0.25);
          background: rgba(201,168,76,0.06);
          font-size: 0.68rem; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase; color: #c9a84c;
          margin-bottom: 2.5rem;
        }
        .dg-pill-dot {
          width: 5px; height: 5px; border-radius: 50%; background: #c9a84c;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .dg-h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(3rem, 5.5vw, 5.2rem);
          font-weight: 600; line-height: 1.1;
          color: #f5f0e8; letter-spacing: -1.5px;
          margin-bottom: 1.75rem;
        }
        .dg-h1 em { font-style: italic; color: #c9a84c; }
        .dg-hero-p {
          font-size: 1.05rem; color: #a09888; line-height: 1.8;
          max-width: 560px; margin: 0 auto 3.5rem;
        }
        .dg-btns { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
        .dg-btn-p {
          padding: 0.9rem 2.25rem; background: #c9a84c; color: #0e0e10;
          border: none; border-radius: 10px; font-size: 0.9rem; font-weight: 700;
          cursor: pointer; text-decoration: none; transition: all 0.15s;
          display: inline-flex; align-items: center; gap: 0.4rem;
        }
        .dg-btn-p:hover { background: #e8c96a; transform: translateY(-1px); }
        .dg-btn-o {
          padding: 0.9rem 2.25rem; background: transparent; color: #f5f0e8;
          border: 1.5px solid #2a2a30; border-radius: 10px;
          font-size: 0.9rem; font-weight: 600;
          cursor: pointer; text-decoration: none; transition: all 0.15s;
        }
        .dg-btn-o:hover { border-color: #c9a84c; color: #c9a84c; }

        /* ── Portal cards ── */
        .dg-portals {
          padding: 0 3rem 6rem;
          max-width: 900px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;
        }
        .dg-pcard {
          background: #141416; border: 1px solid #222228;
          border-radius: 16px; padding: 2rem 2.25rem;
          text-decoration: none; display: block;
          transition: all 0.2s; position: relative; overflow: hidden;
        }
        .dg-pcard::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #c9a84c, transparent);
          opacity: 0; transition: opacity 0.2s;
        }
        .dg-pcard:hover { border-color: rgba(201,168,76,0.3); transform: translateY(-2px); box-shadow: 0 16px 48px rgba(0,0,0,0.4); }
        .dg-pcard:hover::before { opacity: 1; }
        .dg-pcard-badge {
          font-size: 0.62rem; font-weight: 700; letter-spacing: 1.2px;
          text-transform: uppercase; color: #c9a84c;
          display: flex; align-items: center; gap: 0.4rem;
          margin-bottom: 1.25rem;
        }
        .dg-pcard-badge-line { width: 14px; height: 1.5px; background: #c9a84c; flex-shrink: 0; }
        .dg-pcard-title { font-size: 1.05rem; font-weight: 700; color: #f5f0e8; margin-bottom: 0.6rem; }
        .dg-pcard-desc { font-size: 0.82rem; color: #5a5550; line-height: 1.75; margin-bottom: 1.5rem; }
        .dg-pcard-cta {
          display: inline-flex; align-items: center; gap: 0.4rem;
          font-size: 0.8rem; font-weight: 700; color: #c9a84c;
          transition: gap 0.15s;
        }
        .dg-pcard:hover .dg-pcard-cta { gap: 0.6rem; }

        /* ── Trust bar ── */
        .dg-trust {
          border-top: 1px solid #1a1a1e;
          border-bottom: 1px solid #1a1a1e;
          background: #0c0c0e;
          padding: 1.1rem 2rem;
          display: flex; justify-content: center;
          align-items: center; gap: 3rem; flex-wrap: wrap;
        }
        .dg-ti { display: flex; align-items: center; gap: 0.45rem; font-size: 0.74rem; font-weight: 600; color: #3a3530; }
        .dg-tck {
          width: 16px; height: 16px; border-radius: 50%;
          background: rgba(201,168,76,0.08);
          border: 1px solid rgba(201,168,76,0.2);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; color: #c9a84c;
        }

        /* ── Section wrapper ── */
        .dg-sec { padding: 7rem 3rem; max-width: 1120px; margin: 0 auto; }
        .dg-sec-lbl {
          font-size: 0.66rem; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; color: #c9a84c;
          display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1rem;
        }
        .dg-sec-lbl::before { content: ''; width: 20px; height: 1.5px; background: #c9a84c; }
        .dg-sec-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.8rem, 3vw, 2.6rem);
          font-weight: 600; color: #f5f0e8;
          letter-spacing: -0.5px; margin-bottom: 3.5rem;
          line-height: 1.2;
        }

        /* ── Steps ── */
        .dg-steps {
          display: grid; grid-template-columns: repeat(3,1fr);
          gap: 1px; background: #1a1a1e;
          border: 1px solid #1a1a1e; border-radius: 16px; overflow: hidden;
        }
        .dg-step { background: #141416; padding: 2.25rem 2rem; transition: background 0.15s; }
        .dg-step:hover { background: #161618; }
        .dg-step-n {
          font-family: 'Playfair Display', serif;
          font-size: 3rem; font-weight: 600; color: #2a2a30;
          line-height: 1; margin-bottom: 1.25rem;
        }
        .dg-step-t { font-size: 0.92rem; font-weight: 700; color: #f5f0e8; margin-bottom: 0.5rem; }
        .dg-step-d { font-size: 0.8rem; color: #504a44; line-height: 1.75; }

        /* ── Features dark section ── */
        .dg-feat-s { background: #0c0c0e; padding: 7rem 3rem; }
        .dg-feat-i { max-width: 1120px; margin: 0 auto; }
        .dg-feat-g {
          display: grid; grid-template-columns: repeat(3,1fr);
          gap: 1px; background: #1a1a1e;
          border: 1px solid #1a1a1e; border-radius: 16px; overflow: hidden;
        }
        .dg-fc { background: #0e0e10; padding: 2.25rem 2rem; transition: background 0.15s; }
        .dg-fc:hover { background: #111113; }
        .dg-fi {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(201,168,76,0.08);
          border: 1px solid rgba(201,168,76,0.15);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1rem; color: #c9a84c;
        }
        .dg-ft { font-size: 0.88rem; font-weight: 700; color: #f5f0e8; margin-bottom: 0.4rem; }
        .dg-fd { font-size: 0.79rem; color: #3a3530; line-height: 1.75; }

        /* ── For who ── */
        .dg-for-g { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .dg-for-c {
          border: 1px solid #222228; border-radius: 16px;
          padding: 2.5rem; background: #141416;
          transition: all 0.2s; position: relative; overflow: hidden;
        }
        .dg-for-c::after {
          content: '';
          position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #c9a84c, transparent);
          opacity: 0; transition: opacity 0.2s;
        }
        .dg-for-c:hover { border-color: rgba(201,168,76,0.25); }
        .dg-for-c:hover::after { opacity: 1; }
        .dg-for-tag {
          font-size: 0.62rem; font-weight: 700; letter-spacing: 1.2px;
          text-transform: uppercase; color: #c9a84c;
          display: flex; align-items: center; gap: 0.4rem; margin-bottom: 1rem;
        }
        .dg-for-tag span { width: 4px; height: 4px; border-radius: 50%; background: #c9a84c; }
        .dg-for-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem; font-weight: 600; color: #f5f0e8;
          margin-bottom: 0.85rem; letter-spacing: -0.3px; line-height: 1.3;
        }
        .dg-for-desc { font-size: 0.84rem; color: #504a44; line-height: 1.8; margin-bottom: 1.75rem; }
        .dg-for-pts { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 2rem; }
        .dg-for-pt { display: flex; align-items: flex-start; gap: 0.55rem; font-size: 0.82rem; color: #a09888; line-height: 1.5; }
        .dg-for-ptck {
          width: 16px; height: 16px; border-radius: 5px;
          background: rgba(201,168,76,0.1);
          border: 1px solid rgba(201,168,76,0.25);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 1px; color: #c9a84c;
        }
        .dg-for-btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.72rem 1.5rem; background: #c9a84c; color: #0e0e10;
          border-radius: 9px; font-size: 0.82rem; font-weight: 700;
          text-decoration: none; transition: all 0.15s;
        }
        .dg-for-btn:hover { background: #e8c96a; gap: 0.7rem; }

        /* ── Footer ── */
        .dg-footer {
          border-top: 1px solid #1a1a1e;
          padding: 2.5rem 3rem;
          display: flex; align-items: center;
          justify-content: space-between; flex-wrap: wrap; gap: 1rem;
          background: #0c0c0e;
        }
        .dg-footer-l { display: flex; align-items: center; gap: 2rem; flex-wrap: wrap; }
        .dg-footer-copy { font-size: 0.73rem; color: #3a3530; }
        .dg-footer-links { display: flex; gap: 2rem; flex-wrap: wrap; }
        .dg-footer-link {
          font-size: 0.73rem; color: #504a44; text-decoration: none;
          font-weight: 500; transition: color 0.15s;
        }
        .dg-footer-link:hover { color: #c9a84c; }

        @media(max-width:900px){
          .dg-nav{padding:.85rem 1.25rem}
          .dg-hero{padding:9rem 1.5rem 4rem}
          .dg-portals{grid-template-columns:1fr;padding:0 1.5rem 4rem}
          .dg-sec{padding:4rem 1.5rem}
          .dg-feat-s{padding:4rem 1.5rem}
          .dg-steps{grid-template-columns:1fr}
          .dg-feat-g{grid-template-columns:1fr}
          .dg-for-g{grid-template-columns:1fr}
          .dg-footer{flex-direction:column;align-items:flex-start;padding:2rem 1.5rem}
          .dg-trust{gap:1.5rem;padding:1rem 1.25rem}
        }
        @media(max-width:640px){
          .dg-ti:nth-child(n+3){display:none}
        }
      `}</style>

      <div className="dg-page">
        {/* Nav */}
        <nav className="dg-nav">
          <Link href="/"><Logo size={34} /></Link>
          <div className="dg-nav-links">
            <Link href="/employee/login" className="dg-nav-emp">Employee</Link>
            <Link href="/employer/login" className="dg-nav-er">Employer Login</Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="dg-hero">
          <div className="dg-pill">
            <span className="dg-pill-dot"/>
            Consent-Based Employment Verification
          </div>
          <h1 className="dg-h1">
            Your employment record,<br/>
            verified once.<br/>
            <em>Trusted everywhere.</em>
          </h1>
          <p className="dg-hero-p">
            Employees build a verified profile once and share it with any employer — with full consent and control. Employers get structured, reliable data instantly, without chasing documents.
          </p>
          <div className="dg-btns">
            <Link href="/employee/login" className="dg-btn-p">
              Get started free <ArrowIcon />
            </Link>
            <Link href="/employer/login" className="dg-btn-o">
              Employer Portal
            </Link>
          </div>
        </section>

        {/* Portal cards */}
        <div className="dg-portals">
          <Link href="/employee/login" className="dg-pcard">
            <div className="dg-pcard-badge">
              <span className="dg-pcard-badge-line"/>
              For Employees
            </div>
            <div className="dg-pcard-title">One profile. Every employer.</div>
            <div className="dg-pcard-desc">Fill your details once — personal, education, employment, documents. Share with any employer in one click, with your explicit consent.</div>
            <span className="dg-pcard-cta">Create your profile <ArrowIcon /></span>
          </Link>
          <Link href="/employer/login" className="dg-pcard">
            <div className="dg-pcard-badge">
              <span className="dg-pcard-badge-line"/>
              For Employers
            </div>
            <div className="dg-pcard-title">Verified data. Zero paperwork.</div>
            <div className="dg-pcard-desc">Request access to a candidate's verified profile. Receive structured BGV and onboarding data the moment they approve.</div>
            <span className="dg-pcard-cta">Access employer portal <ArrowIcon /></span>
          </Link>
        </div>

        {/* Trust bar */}
        <div className="dg-trust">
          {["DPDP Act 2023 Compliant","Employee consent on every share","End-to-end encrypted","Data localised in India"].map(t => (
            <div className="dg-ti" key={t}>
              <div className="dg-tck"><CheckIcon /></div>
              {t}
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="dg-sec">
          <div className="dg-sec-lbl">How it works</div>
          <div className="dg-sec-title">Three steps to a verified profile</div>
          <div className="dg-steps">
            {[
              ["01","Build your profile","Fill personal details, education, employment history, and upload documents — once, on Datagate."],
              ["02","Employer requests access","When a company wants your background data, you get a consent request. You review and decide."],
              ["03","Approve and done","One tap and your verified data reaches the employer instantly. No forms, no delays, no duplicated effort."],
            ].map(([n,t,d]) => (
              <div className="dg-step" key={n}>
                <div className="dg-step-n">{n}</div>
                <div className="dg-step-t">{t}</div>
                <div className="dg-step-d">{d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="dg-feat-s">
          <div className="dg-feat-i">
            <div className="dg-sec-lbl">Platform capabilities</div>
            <div className="dg-sec-title">Everything background verification needs</div>
            <div className="dg-feat-g">
              {[
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, t:"Consent on every share", d:"No employer sees your data without your explicit approval. Every share is logged and timestamped." },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, t:"Complete BGV coverage", d:"Aadhaar, PAN, education records, employment history, UAN and PF — all structured and ready." },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>, t:"Instant for returning users", d:"Once your profile is built, every future employer gets your data instantly on approval." },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, t:"Secure document storage", d:"All documents encrypted at rest and in transit. Access is controlled and time-limited." },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, t:"EPFO connected", d:"UAN and PF records captured directly, giving employers independently-sourced employment history." },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>, t:"Mobile first", d:"Employees complete their full verification from any device. No app download required." },
              ].map(f => (
                <div className="dg-fc" key={f.t}>
                  <div className="dg-fi">{f.icon}</div>
                  <div className="dg-ft">{f.t}</div>
                  <div className="dg-fd">{f.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* For who */}
        <div className="dg-sec">
          <div className="dg-sec-lbl">Who it's for</div>
          <div className="dg-sec-title" style={{marginBottom:"2.5rem"}}>Built for both sides of hiring</div>
          <div className="dg-for-g">
            <div className="dg-for-c">
              <div className="dg-for-tag"><span/>For Individuals</div>
              <div className="dg-for-title">Tired of filling the same forms for every job?</div>
              <div className="dg-for-desc">Build your verified employment profile once and share it with any company — you're always in control of who sees what.</div>
              <div className="dg-for-pts">
                {["Fill personal, education, and employment details once","Approve or decline every employer request","See exactly who accessed your data and when"].map(p => (
                  <div className="dg-for-pt" key={p}>
                    <div className="dg-for-ptck"><CheckIcon /></div>
                    {p}
                  </div>
                ))}
              </div>
              <Link href="/employee/login" className="dg-for-btn">
                Create your profile <ArrowIcon />
              </Link>
            </div>
            <div className="dg-for-c">
              <div className="dg-for-tag"><span/>For Organisations</div>
              <div className="dg-for-title">Want verified candidate data without the wait?</div>
              <div className="dg-for-desc">Stop chasing candidates for documents. Request access to a pre-built verified profile and receive structured data the moment they approve.</div>
              <div className="dg-for-pts">
                {["Send a consent request in one click","Receive structured BGV and onboarding data instantly","Full consent audit trail for every data access"].map(p => (
                  <div className="dg-for-pt" key={p}>
                    <div className="dg-for-ptck"><CheckIcon /></div>
                    {p}
                  </div>
                ))}
              </div>
              <Link href="/employer/login" className="dg-for-btn">
                Access employer portal <ArrowIcon />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="dg-footer">
          <div className="dg-footer-l">
            <Logo size={30} />
            <span className="dg-footer-copy">© 2026 Datagate Technologies. All rights reserved.</span>
          </div>
          <div className="dg-footer-links">
            <a href="/privacy" className="dg-footer-link">Privacy Policy</a>
            <a href="/employer/terms" className="dg-footer-link">Employer Terms</a>
            <a href="mailto:support@datagate.co.in" className="dg-footer-link">Contact</a>
          </div>
        </footer>
      </div>
    </>
  );
}