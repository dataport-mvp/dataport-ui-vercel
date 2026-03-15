import Link from "next/link";

export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        body { background: #f7f6f3; color: #1a1a1a; font-family: 'DM Sans', sans-serif; }

        /* ── Nav ── */
        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.1rem 3rem;
          background: rgba(247,246,243,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #e8e4dc;
        }
        .nav-logo {
          font-family: 'DM Sans', sans-serif;
          font-size: 1.15rem; font-weight: 700;
          color: #1a1a1a; letter-spacing: -0.3px;
          display: flex; align-items: center; gap: 0.5rem;
        }
        .nav-logo-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #1a1a1a; flex-shrink: 0;
        }
        .nav-links { display: flex; align-items: center; gap: 0.75rem; }
        .nav-btn {
          padding: 0.5rem 1.25rem; border-radius: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.84rem; font-weight: 600;
          cursor: pointer; text-decoration: none;
          transition: all 0.18s;
        }
        .nav-ghost {
          background: transparent; border: 1.5px solid #d4d0c8; color: #4a4a4a;
        }
        .nav-ghost:hover { border-color: #1a1a1a; color: #1a1a1a; }
        .nav-solid {
          background: #1a1a1a; border: 1.5px solid #1a1a1a; color: #f7f6f3;
        }
        .nav-solid:hover { background: #333; }

        /* ── Hero ── */
        .hero {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          padding: 9rem 2rem 5rem;
          position: relative;
        }
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 0.6rem;
          font-size: 0.72rem; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase; color: #666;
          margin-bottom: 2rem;
          padding: 0.35rem 1rem;
          border: 1px solid #d4d0c8; border-radius: 100px;
          background: #fff;
        }
        .eyebrow-pip {
          width: 6px; height: 6px; border-radius: 50%;
          background: #16a34a;
        }
        .hero-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(3rem, 6vw, 5.5rem);
          font-weight: 400; line-height: 1.1;
          color: #1a1a1a;
          margin-bottom: 1.75rem;
          max-width: 780px;
          letter-spacing: -1px;
        }
        .hero-title em {
          font-style: italic;
          color: #555;
        }
        .hero-sub {
          font-size: 1.05rem; color: #666;
          max-width: 520px; line-height: 1.75;
          margin-bottom: 3.5rem;
          font-weight: 400;
        }

        /* ── Portal cards ── */
        .portal-row {
          display: flex; gap: 1.25rem;
          flex-wrap: wrap; justify-content: center;
          margin-bottom: 1.5rem;
        }
        .portal-card {
          background: #fff;
          border: 1.5px solid #e8e4dc;
          border-radius: 16px;
          padding: 2.25rem 2rem;
          width: 268px;
          text-align: left;
          text-decoration: none;
          transition: all 0.22s;
          position: relative;
        }
        .portal-card:hover {
          border-color: #1a1a1a;
          transform: translateY(-3px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.1);
        }
        .portal-icon {
          width: 44px; height: 44px; border-radius: 10px;
          background: #f0ede6; display: flex; align-items: center;
          justify-content: center; font-size: 1.25rem;
          margin-bottom: 1.1rem;
        }
        .portal-tag {
          font-size: 0.65rem; font-weight: 700; letter-spacing: 1px;
          text-transform: uppercase; color: #999;
          margin-bottom: 0.4rem;
        }
        .portal-title {
          font-family: 'DM Sans', sans-serif;
          font-size: 1.1rem; font-weight: 700;
          color: #1a1a1a; margin-bottom: 0.55rem;
        }
        .portal-desc {
          font-size: 0.82rem; color: #777;
          line-height: 1.65; margin-bottom: 1.5rem;
        }
        .portal-cta {
          display: inline-flex; align-items: center; gap: 0.4rem;
          font-size: 0.82rem; font-weight: 700;
          color: #1a1a1a;
        }
        .portal-cta svg { transition: transform 0.18s; }
        .portal-card:hover .portal-cta svg { transform: translateX(3px); }

        /* ── Trust bar ── */
        .trust-bar {
          display: flex; align-items: center; gap: 1.5rem;
          flex-wrap: wrap; justify-content: center;
          margin-top: 1rem;
        }
        .trust-item {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.75rem; color: #999; font-weight: 500;
        }
        .trust-item svg { color: #16a34a; flex-shrink: 0; }
        .trust-sep { width: 1px; height: 14px; background: #d4d0c8; }

        /* ── Divider ── */
        .section-divider {
          width: 100%; max-width: 900px; margin: 0 auto;
          border: none; border-top: 1px solid #e8e4dc;
        }

        /* ── How it works ── */
        .how {
          padding: 6rem 2rem;
          max-width: 960px; margin: 0 auto;
        }
        .section-label {
          font-size: 0.68rem; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase; color: #999;
          margin-bottom: 0.75rem;
        }
        .section-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(1.75rem, 3vw, 2.5rem);
          font-weight: 400; color: #1a1a1a;
          margin-bottom: 3.5rem; letter-spacing: -0.5px;
        }
        .steps-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }
        .step-item { position: relative; }
        .step-num {
          font-family: 'Instrument Serif', serif;
          font-size: 3rem; font-weight: 400; color: #e8e4dc;
          line-height: 1; margin-bottom: 1rem;
        }
        .step-title {
          font-size: 0.93rem; font-weight: 700; color: #1a1a1a;
          margin-bottom: 0.4rem;
        }
        .step-desc { font-size: 0.82rem; color: #777; line-height: 1.65; }

        /* ── Features ── */
        .features {
          background: #1a1a1a;
          padding: 6rem 2rem;
        }
        .features-inner { max-width: 960px; margin: 0 auto; }
        .features-inner .section-label { color: #666; }
        .features-inner .section-title { color: #f7f6f3; }
        .features-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1px; background: #2a2a2a; border: 1px solid #2a2a2a;
          border-radius: 12px; overflow: hidden;
        }
        .feature-cell {
          background: #1a1a1a; padding: 2rem 1.75rem;
          transition: background 0.18s;
        }
        .feature-cell:hover { background: #222; }
        .feature-icon { font-size: 1.35rem; margin-bottom: 0.85rem; }
        .feature-title {
          font-size: 0.9rem; font-weight: 700; color: #e2e8f0;
          margin-bottom: 0.4rem;
        }
        .feature-desc { font-size: 0.8rem; color: #555; line-height: 1.65; }

        /* ── CTA ── */
        .cta-section {
          padding: 7rem 2rem;
          text-align: center;
          max-width: 680px; margin: 0 auto;
        }
        .cta-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 400; color: #1a1a1a;
          margin-bottom: 1rem; letter-spacing: -0.5px;
        }
        .cta-sub {
          font-size: 0.95rem; color: #777; line-height: 1.7;
          margin-bottom: 2.5rem;
        }
        .cta-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .cta-btn-primary {
          padding: 0.85rem 2.25rem; background: #1a1a1a; color: #f7f6f3;
          border: none; border-radius: 8px; font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; font-weight: 600; cursor: pointer;
          text-decoration: none; transition: all 0.18s;
        }
        .cta-btn-primary:hover { background: #333; }
        .cta-btn-secondary {
          padding: 0.85rem 2.25rem; background: transparent; color: #1a1a1a;
          border: 1.5px solid #d4d0c8; border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; font-weight: 600; cursor: pointer;
          text-decoration: none; transition: all 0.18s;
        }
        .cta-btn-secondary:hover { border-color: #1a1a1a; }

        /* ── Footer ── */
        footer {
          border-top: 1px solid #e8e4dc;
          padding: 2.5rem 3rem;
          display: flex; align-items: center;
          justify-content: space-between; flex-wrap: wrap; gap: 1rem;
          background: #f7f6f3;
        }
        .footer-left {
          display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap;
        }
        .footer-logo {
          font-size: 0.9rem; font-weight: 700; color: #1a1a1a;
        }
        .footer-copy { font-size: 0.78rem; color: #999; }
        .footer-links { display: flex; gap: 1.5rem; flex-wrap: wrap; }
        .footer-link {
          font-size: 0.78rem; color: #666; text-decoration: none;
          font-weight: 500; transition: color 0.15s;
        }
        .footer-link:hover { color: #1a1a1a; text-decoration: underline; }

        @media (max-width: 768px) {
          nav { padding: 1rem 1.25rem; }
          .steps-grid { grid-template-columns: 1fr; gap: 2.5rem; }
          .features-grid { grid-template-columns: 1fr; }
          footer { flex-direction: column; align-items: flex-start; padding: 2rem 1.5rem; }
          .footer-left { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
        }
        @media (max-width: 640px) {
          .portal-card { width: 100%; max-width: 340px; }
        }
      `}</style>

      <div>
        {/* ── Nav ── */}
        <nav>
          <div className="nav-logo">
            <div className="nav-logo-dot" />
            Datagate
          </div>
          <div className="nav-links">
            <Link href="/employee/login" className="nav-btn nav-ghost">Employee Login</Link>
            <Link href="/employer/login" className="nav-btn nav-solid">Employer Login</Link>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="hero">
          <div className="hero-eyebrow">
            <span className="eyebrow-pip" />
            Consent-Based Employment Verification
          </div>

          <h1 className="hero-title">
            The verified employment<br />
            profile that works<br />
            <em>everywhere you do.</em>
          </h1>

          <p className="hero-sub">
            Build your employment profile once. Share it securely with any employer — 
            with your consent. No more filling the same forms for every company.
          </p>

          <div className="portal-row">
            <Link href="/employee/login" className="portal-card">
              <div className="portal-icon">👤</div>
              <div className="portal-tag">For Individuals</div>
              <div className="portal-title">Employee Portal</div>
              <div className="portal-desc">Build your verified profile once. Control who sees your data.</div>
              <span className="portal-cta">
                Get started
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
            </Link>

            <Link href="/employer/login" className="portal-card">
              <div className="portal-icon">🏢</div>
              <div className="portal-tag">For Organisations</div>
              <div className="portal-title">Employer Portal</div>
              <div className="portal-desc">Request verified records with consent. Onboard in minutes, not weeks.</div>
              <span className="portal-cta">
                Access portal
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
            </Link>
          </div>

          <div className="trust-bar">
            <div className="trust-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              DPDP Act 2023 Compliant
            </div>
            <div className="trust-sep" />
            <div className="trust-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Data stored in India (AWS Mumbai)
            </div>
            <div className="trust-sep" />
            <div className="trust-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Employee consent on every share
            </div>
          </div>
        </section>

        <hr className="section-divider" />

        {/* ── How it works ── */}
        <section className="how">
          <div className="section-label">How it works</div>
          <div className="section-title">Three steps to a verified profile</div>
          <div className="steps-grid">
            <div className="step-item">
              <div className="step-num">01</div>
              <div className="step-title">Create your profile</div>
              <div className="step-desc">Fill in your personal, education, and employment details once. Upload your documents securely.</div>
            </div>
            <div className="step-item">
              <div className="step-num">02</div>
              <div className="step-title">Employer requests access</div>
              <div className="step-desc">When a company wants your background data, you receive a consent notification. You decide.</div>
            </div>
            <div className="step-item">
              <div className="step-num">03</div>
              <div className="step-title">One click, done</div>
              <div className="step-desc">Approve once. Your verified profile goes to the employer instantly. No forms, no delays.</div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="features">
          <div className="features-inner">
            <div className="section-label">Platform capabilities</div>
            <div className="section-title">Everything BGV requires, nothing it doesn't</div>
            <div className="features-grid">
              <div className="feature-cell">
                <div className="feature-icon">🔐</div>
                <div className="feature-title">Consent-driven access</div>
                <div className="feature-desc">Employees control who sees their data. Employers only access what's approved.</div>
              </div>
              <div className="feature-cell">
                <div className="feature-icon">📋</div>
                <div className="feature-title">Complete BGV coverage</div>
                <div className="feature-desc">Aadhaar, PAN, education, employment history, UAN — structured and ready.</div>
              </div>
              <div className="feature-cell">
                <div className="feature-icon">⚡</div>
                <div className="feature-title">Instant for returning users</div>
                <div className="feature-desc">Pre-collected profiles mean BGV and onboarding data is ready the moment it's needed.</div>
              </div>
              <div className="feature-cell">
                <div className="feature-icon">🛡️</div>
                <div className="feature-title">Bank-grade security</div>
                <div className="feature-desc">End-to-end encrypted. Documents never exposed without explicit employee approval.</div>
              </div>
              <div className="feature-cell">
                <div className="feature-icon">🏦</div>
                <div className="feature-title">EPFO integration</div>
                <div className="feature-desc">UAN and PF records pulled directly. Employment history confirmed from source.</div>
              </div>
              <div className="feature-cell">
                <div className="feature-icon">📱</div>
                <div className="feature-title">Works on any device</div>
                <div className="feature-desc">Mobile-first. Employees complete verification from phone, tablet, or desktop.</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta-section">
          <div className="cta-title">Ready to simplify your hiring?</div>
          <p className="cta-sub">Join the platform that eliminates paperwork, reduces BGV delays, and puts employees in control of their own data.</p>
          <div className="cta-btns">
            <Link href="/employer/login" className="cta-btn-primary">Get started as Employer</Link>
            <Link href="/employee/login" className="cta-btn-secondary">Employee sign up</Link>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer>
          <div className="footer-left">
            <span className="footer-logo">Datagate</span>
            <span className="footer-copy">© 2026 Datagate Technologies. All rights reserved.</span>
          </div>
          <div className="footer-links">
            <a href="/privacy" className="footer-link" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
            <a href="/employer/terms" className="footer-link" target="_blank" rel="noopener noreferrer">Employer Terms</a>
            <a href="mailto:support@datagate.co.in" className="footer-link">Contact</a>
          </div>
        </footer>
      </div>
    </>
  );
}