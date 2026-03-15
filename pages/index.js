import Link from "next/link";

/* ── Animated Logo ─────────────────────────────────────────────────
   Shield + gate cutout. Green dot pulses continuously.
   Data particles flow down through the gate.
   accentColor: the dot + particle color
   shieldFill: shield body color
   gateFill: gate cutout color
   wordColor: wordmark color
──────────────────────────────────────────────────────────────────── */
function DGLogo({ accentColor = "#16a34a", shieldFill = "#1a1a1a", gateFill = "#fff", wordColor = "#1a1a1a", showSub = false }) {
  const id = accentColor.replace("#", "");
  return (
    <svg width="156" height="40" viewBox="0 0 156 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display:"block", flexShrink:0 }}>
      <defs>
        <style>{`
          @keyframes dg-pulse-${id}{0%{r:4.5;opacity:.6}100%{r:13;opacity:0}}
          @keyframes dg-dot-${id}{0%,100%{r:3.5}50%{r:2.6}}
          @keyframes dg-p-${id}{0%{transform:translateY(0);opacity:0}12%{opacity:1}85%{opacity:1}100%{transform:translateY(20px);opacity:0}}
          .dpr-${id}{animation:dg-pulse-${id} 1.8s ease-out infinite;fill:none;stroke:${accentColor};stroke-width:1.3}
          .ddt-${id}{animation:dg-dot-${id} 1.8s ease-in-out infinite;fill:${accentColor}}
          .dp1-${id}{animation:dg-p-${id} 2.2s ease-in-out infinite}
          .dp2-${id}{animation:dg-p-${id} 2.2s ease-in-out infinite .74s}
          .dp3-${id}{animation:dg-p-${id} 2.2s ease-in-out infinite 1.47s}
        `}</style>
      </defs>
      {/* Shield body */}
      <path d="M15 1.5 L28 7 L28 23 Q28 35 15 40 Q2 35 2 23 L2 7 Z" fill={shieldFill}/>
      {/* Gate — left pillar */}
      <rect x="7.5" y="18.5" width="4.5" height="13.5" rx="1.6" fill={gateFill}/>
      {/* Gate — right pillar */}
      <rect x="17.5" y="18.5" width="4.5" height="13.5" rx="1.6" fill={gateFill}/>
      {/* Gate — arch */}
      <path d="M9.75 18.5 Q15 11 19.75 18.5" fill="none" stroke={gateFill} strokeWidth="3.8" strokeLinecap="round"/>
      {/* Data particles */}
      <circle cx="15" cy="11.5" r="1.8" fill={accentColor} opacity="0" className={`dp1-${id}`}/>
      <circle cx="15" cy="11.5" r="1.8" fill={accentColor} opacity="0" className={`dp2-${id}`}/>
      <circle cx="15" cy="11.5" r="1.8" fill={accentColor} opacity="0" className={`dp3-${id}`}/>
      {/* Live dot */}
      <circle cx="23.5" cy="6.5" className={`ddt-${id}`}/>
      <circle cx="23.5" cy="6.5" className={`dpr-${id}`}/>
      {/* Wordmark */}
      <text x="36" y="23" fontFamily="'DM Sans',sans-serif" fontSize="15" fontWeight="700" fill={wordColor} letterSpacing="-0.2">Datagate</text>
      {showSub && <text x="37" y="33" fontFamily="'DM Sans',sans-serif" fontSize="7" fontWeight="600" fill={wordColor === "#fff" ? "rgba(255,255,255,0.35)" : "#bbb"} letterSpacing="1.1">VERIFIED EMPLOYMENT</text>}
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%}
        body{background:#fafaf9;color:#1a1a1a;font-family:'DM Sans',sans-serif}

        /* ── Nav ── */
        nav{
          position:fixed;top:0;left:0;right:0;z-index:100;
          display:flex;align-items:center;justify-content:space-between;
          padding:.85rem 3rem;
          background:rgba(250,250,249,0.96);
          backdrop-filter:blur(12px);
          border-bottom:1px solid #ebebeb;
        }
        .nav-r{display:flex;align-items:center;gap:.6rem}
        .nb{
          padding:.44rem 1.05rem;border-radius:6px;
          font-size:.8rem;font-weight:600;cursor:pointer;text-decoration:none;transition:all .15s;
        }
        .nb-g{background:transparent;border:1.5px solid #e0ddd7;color:#555}
        .nb-g:hover{border-color:#1a1a1a;color:#1a1a1a}
        .nb-s{background:#1a1a1a;border:1.5px solid #1a1a1a;color:#fafaf9}
        .nb-s:hover{background:#2d2d2d}

        /* ── Hero ── */
        .hero{
          padding:9rem 3rem 5rem;
          max-width:860px;margin:0 auto;
          text-align:center;
        }
        .eyebrow{
          display:inline-flex;align-items:center;gap:.55rem;
          font-size:.68rem;font-weight:700;letter-spacing:1.4px;
          text-transform:uppercase;color:#888;
          margin-bottom:2rem;
          padding:.32rem .9rem;
          background:#fff;border:1px solid #e8e4dc;border-radius:100px;
        }
        .eyebrow-dot{width:5px;height:5px;border-radius:50%;background:#16a34a;flex-shrink:0}
        .hero-h{
          font-family:'Instrument Serif',serif;
          font-size:clamp(3rem,5.5vw,5rem);
          font-weight:400;line-height:1.12;
          color:#1a1a1a;letter-spacing:-1px;
          margin-bottom:1.75rem;
        }
        .hero-h em{font-style:italic;color:#888}
        .hero-p{
          font-size:1rem;color:#777;line-height:1.8;
          max-width:540px;margin:0 auto 3rem;
        }
        .hero-btns{display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap}
        .btn-p{
          padding:.8rem 2rem;background:#1a1a1a;color:#fafaf9;
          border:none;border-radius:7px;font-size:.875rem;font-weight:600;
          cursor:pointer;text-decoration:none;transition:background .15s;
        }
        .btn-p:hover{background:#2d2d2d}
        .btn-o{
          padding:.8rem 2rem;background:transparent;color:#1a1a1a;
          border:1.5px solid #e0ddd7;border-radius:7px;
          font-size:.875rem;font-weight:600;
          cursor:pointer;text-decoration:none;transition:border-color .15s;
        }
        .btn-o:hover{border-color:#1a1a1a}

        /* ── Portal cards ── */
        .portals{
          padding:0 3rem 5rem;
          max-width:860px;margin:0 auto;
          display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;
        }
        .pcard{
          background:#fff;border:1.5px solid #ebebeb;
          border-radius:16px;padding:2rem 2.1rem;
          text-decoration:none;display:block;
          transition:border-color .2s,box-shadow .2s;
        }
        .pcard:hover{border-color:#1a1a1a;box-shadow:0 10px 32px rgba(0,0,0,0.07)}
        .pcard-head{display:flex;align-items:center;gap:.75rem;margin-bottom:1rem}
        .pcard-icon{
          width:38px;height:38px;border-radius:10px;
          background:#f5f4f1;display:flex;align-items:center;
          justify-content:center;font-size:1rem;flex-shrink:0;
        }
        .pcard-lbl{font-size:.63rem;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:.5px}
        .pcard-title{font-size:1rem;font-weight:700;color:#1a1a1a;margin-bottom:.5rem}
        .pcard-desc{font-size:.8rem;color:#888;line-height:1.7;margin-bottom:1.25rem}
        .pcard-cta{
          display:inline-flex;align-items:center;gap:.35rem;
          font-size:.78rem;font-weight:700;color:#1a1a1a;
        }
        .pcard-cta svg{transition:transform .15s}
        .pcard:hover .pcard-cta svg{transform:translateX(3px)}

        /* ── Trust ── */
        .trust{
          border-top:1px solid #ebebeb;border-bottom:1px solid #ebebeb;
          background:#fff;padding:1rem 2rem;
          display:flex;justify-content:center;
          align-items:center;gap:3rem;flex-wrap:wrap;
        }
        .ti{display:flex;align-items:center;gap:.4rem;font-size:.73rem;font-weight:600;color:#999}
        .tck{
          width:15px;height:15px;border-radius:50%;
          background:#f0fdf4;border:1px solid #bbf7d0;
          display:flex;align-items:center;justify-content:center;flex-shrink:0;
        }
        .tck svg{color:#16a34a}

        /* ── How it works ── */
        .section{padding:6rem 3rem;max-width:1100px;margin:0 auto}
        .sec-label{font-size:.66rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#aaa;margin-bottom:.6rem}
        .sec-title{
          font-family:'Instrument Serif',serif;
          font-size:clamp(1.6rem,2.5vw,2.2rem);
          font-weight:400;color:#1a1a1a;
          margin-bottom:3rem;letter-spacing:-.3px;
        }
        .steps{
          display:grid;grid-template-columns:repeat(3,1fr);
          gap:1px;background:#ebebeb;
          border:1px solid #ebebeb;border-radius:14px;overflow:hidden;
        }
        .sc{background:#fff;padding:2rem 1.75rem;transition:background .15s}
        .sc:hover{background:#fafaf9}
        .sn{
          font-family:'Instrument Serif',serif;
          font-size:2.2rem;font-weight:400;color:#e8e5de;
          margin-bottom:1rem;line-height:1;
        }
        .st{font-size:.88rem;font-weight:700;color:#1a1a1a;margin-bottom:.35rem}
        .sd{font-size:.79rem;color:#888;line-height:1.7}

        /* ── Features dark ── */
        .feat-s{background:#111;padding:6rem 3rem}
        .feat-i{max-width:1100px;margin:0 auto}
        .feat-i .sec-label{color:#3a3a3a}
        .feat-i .sec-title{color:#f0ede6}
        .feat-g{
          display:grid;grid-template-columns:repeat(3,1fr);
          gap:1px;background:#1d1d1d;
          border:1px solid #1d1d1d;border-radius:14px;overflow:hidden;
        }
        .fc{background:#111;padding:2rem 1.75rem;transition:background .15s}
        .fc:hover{background:#141414}
        .fi{font-size:1.2rem;margin-bottom:.8rem}
        .ft{font-size:.87rem;font-weight:700;color:#e2e8f0;margin-bottom:.35rem}
        .fd{font-size:.78rem;color:#3f3f3f;line-height:1.7}

        /* ── For who ── */
        .for-s{padding:6rem 3rem;max-width:1100px;margin:0 auto}
        .for-g{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem}
        .for-c{
          border:1.5px solid #ebebeb;border-radius:16px;
          padding:2.5rem;background:#fff;
          transition:border-color .2s,box-shadow .2s;
        }
        .for-c:hover{border-color:#1a1a1a;box-shadow:0 8px 28px rgba(0,0,0,0.06)}
        .for-tag{
          font-size:.63rem;font-weight:700;letter-spacing:1px;
          text-transform:uppercase;color:#aaa;
          display:flex;align-items:center;gap:.4rem;margin-bottom:.85rem;
        }
        .for-dot{width:4px;height:4px;border-radius:50%;background:#ccc}
        .for-title{
          font-family:'Instrument Serif',serif;
          font-size:1.35rem;font-weight:400;color:#1a1a1a;
          margin-bottom:.8rem;letter-spacing:-.2px;line-height:1.3;
        }
        .for-desc{font-size:.83rem;color:#777;line-height:1.75;margin-bottom:1.5rem}
        .for-pts{display:flex;flex-direction:column;gap:.55rem;margin-bottom:2rem}
        .for-pt{display:flex;align-items:flex-start;gap:.5rem;font-size:.8rem;color:#555;line-height:1.5}
        .ptck{
          width:15px;height:15px;border-radius:4px;
          background:#f0fdf4;border:1px solid #bbf7d0;
          display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;
        }
        .ptck svg{color:#16a34a}
        .for-btn{
          display:inline-flex;align-items:center;gap:.4rem;
          padding:.68rem 1.4rem;background:#1a1a1a;color:#fafaf9;
          border-radius:7px;font-size:.8rem;font-weight:600;
          text-decoration:none;transition:background .15s;
        }
        .for-btn:hover{background:#2d2d2d}
        .for-btn svg{transition:transform .15s}
        .for-c:hover .for-btn svg{transform:translateX(3px)}

        /* ── Footer ── */
        footer{
          border-top:1px solid #ebebeb;padding:2rem 3rem;
          display:flex;align-items:center;
          justify-content:space-between;flex-wrap:wrap;gap:1rem;
          background:#fafaf9;
        }
        .f-l{display:flex;align-items:center;gap:1.75rem;flex-wrap:wrap}
        .f-copy{font-size:.73rem;color:#bbb}
        .f-links{display:flex;gap:1.75rem;flex-wrap:wrap}
        .f-link{font-size:.73rem;color:#888;text-decoration:none;font-weight:500;transition:color .15s}
        .f-link:hover{color:#1a1a1a}

        @media(max-width:900px){
          .portals{grid-template-columns:1fr;padding:0 1.5rem 4rem}
          .hero{padding:8rem 1.5rem 3rem}
          .section,.for-s{padding:4rem 1.5rem}
          .feat-s{padding:4rem 1.5rem}
          .steps{grid-template-columns:1fr}
          .feat-g{grid-template-columns:1fr}
          .for-g{grid-template-columns:1fr}
          footer{flex-direction:column;align-items:flex-start;padding:2rem 1.5rem}
          .f-l{flex-direction:column;align-items:flex-start;gap:.3rem}
          nav{padding:.85rem 1.25rem}
        }
        @media(max-width:640px){.trust{gap:1.25rem}}
      `}</style>

      <div>
        {/* ── Nav ── */}
        <nav>
          <Link href="/" style={{ textDecoration:"none" }}>
            <DGLogo accentColor="#16a34a" shieldFill="#1a1a1a" gateFill="#fafaf9" wordColor="#1a1a1a" />
          </Link>
          <div className="nav-r">
            <Link href="/employee/login" className="nb nb-g">Employee</Link>
            <Link href="/employer/login" className="nb nb-s">Employer Login</Link>
          </div>
        </nav>

        {/* ── Hero — full width, centred, breathing room ── */}
        <section className="hero">
          <div className="eyebrow">
            <span className="eyebrow-dot"/>
            Consent-Based Employment Verification
          </div>
          <h1 className="hero-h">
            Your employment record,<br/>
            verified once.<br/>
            <em>Trusted everywhere.</em>
          </h1>
          <p className="hero-p">
            Employees build a verified profile once and share it with any employer — with full consent and control. Employers get structured, reliable data instantly, without chasing documents.
          </p>
          <div className="hero-btns">
            <Link href="/employer/login" className="btn-p">Get started as Employer</Link>
            <Link href="/employee/login" className="btn-o">Employee Sign Up</Link>
          </div>
        </section>

        {/* ── Portal cards — clear separation from hero ── */}
        <div className="portals">
          <Link href="/employee/login" className="pcard">
            <div className="pcard-head">
              <div className="pcard-icon">👤</div>
              <div className="pcard-lbl">For Employees</div>
            </div>
            <div className="pcard-title">One profile. Every employer.</div>
            <div className="pcard-desc">Fill your details once — personal, education, employment, documents. Share with any employer in one click, with your explicit consent.</div>
            <span className="pcard-cta">
              Create your profile
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </Link>
          <Link href="/employer/login" className="pcard">
            <div className="pcard-head">
              <div className="pcard-icon">🏢</div>
              <div className="pcard-lbl">For Employers</div>
            </div>
            <div className="pcard-title">Verified data. Zero paperwork.</div>
            <div className="pcard-desc">Request access to a candidate's verified profile. Receive structured BGV and onboarding data the moment they approve.</div>
            <span className="pcard-cta">
              Access employer portal
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </Link>
        </div>

        {/* ── Trust strip ── */}
        <div className="trust">
          {["DPDP Act 2023 Compliant","Employee consent on every share","End-to-end encrypted storage","Data hosted in India"].map(t => (
            <div className="ti" key={t}>
              <div className="tck"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div>
              {t}
            </div>
          ))}
        </div>

        {/* ── How it works ── */}
        <div className="section">
          <div className="sec-label">How it works</div>
          <div className="sec-title">Three steps to a verified profile</div>
          <div className="steps">
            {[
              { n:"01", t:"Build your profile",      d:"Fill in personal details, education, employment history, and upload your documents — once, on Datagate." },
              { n:"02", t:"Employer requests access", d:"When a company wants your background data, you receive a consent request. You review it and decide." },
              { n:"03", t:"Approve and done",         d:"One click and your verified data reaches the employer instantly. No forms, no delays, no duplicated effort." },
            ].map(s => (
              <div className="sc" key={s.n}>
                <div className="sn">{s.n}</div>
                <div className="st">{s.t}</div>
                <div className="sd">{s.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Features ── */}
        <div className="feat-s">
          <div className="feat-i">
            <div className="sec-label">Platform capabilities</div>
            <div className="sec-title">Everything background verification needs</div>
            <div className="feat-g">
              {[
                { i:"🔐", t:"Consent on every share",      d:"No employer sees your data without your explicit approval. Every share is logged and timestamped." },
                { i:"📋", t:"Complete BGV coverage",        d:"Aadhaar, PAN, education records, employment history, UAN and PF — all structured and ready." },
                { i:"⚡", t:"Instant for returning users",  d:"Once your profile is built, every future employer gets your data instantly on approval." },
                { i:"🛡️", t:"Secure document storage",     d:"All uploaded documents are encrypted at rest and in transit. Access is controlled and time-limited." },
                { i:"🏦", t:"EPFO connected",               d:"UAN and PF records captured directly, giving employers independently-sourced employment history." },
                { i:"📱", t:"Mobile first",                 d:"Employees complete their full verification from any device. No app download required." },
              ].map(f => (
                <div className="fc" key={f.t}>
                  <div className="fi">{f.i}</div>
                  <div className="ft">{f.t}</div>
                  <div className="fd">{f.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── For who ── */}
        <div className="for-s">
          <div className="sec-label">Who it's for</div>
          <div className="sec-title" style={{ marginBottom:"2.5rem" }}>Built for both sides of hiring</div>
          <div className="for-g">
            <div className="for-c">
              <div className="for-tag"><span className="for-dot"/>For Individuals</div>
              <div className="for-title">Tired of filling the same forms for every job?</div>
              <div className="for-desc">Build your verified employment profile once and share it with any company — you're always in control of who sees what.</div>
              <div className="for-pts">
                {["Fill personal, education, and employment details once","Approve or decline every employer request","See exactly who accessed your data and when"].map(p => (
                  <div className="for-pt" key={p}>
                    <div className="ptck"><svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div>
                    {p}
                  </div>
                ))}
              </div>
              <Link href="/employee/login" className="for-btn">
                Create your profile
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
            <div className="for-c">
              <div className="for-tag"><span className="for-dot"/>For Organisations</div>
              <div className="for-title">Want verified candidate data without the wait?</div>
              <div className="for-desc">Stop chasing candidates for documents. Request access to a pre-built verified profile and receive structured data the moment they approve.</div>
              <div className="for-pts">
                {["Send a consent request in one click","Receive structured BGV and onboarding data instantly","Full consent audit trail for every data access"].map(p => (
                  <div className="for-pt" key={p}>
                    <div className="ptck"><svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div>
                    {p}
                  </div>
                ))}
              </div>
              <Link href="/employer/login" className="for-btn">
                Access employer portal
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <footer>
          <div className="f-l">
            <DGLogo accentColor="#16a34a" shieldFill="#1a1a1a" gateFill="#fafaf9" wordColor="#1a1a1a" />
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