import Link from "next/link";
import { useEffect, useRef } from "react";

export default function Home() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const nodes = Array.from({ length: 38 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1.2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 160) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(56,189,248,${0.12 * (1 - d / 160)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(56,189,248,0.55)";
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        body { background: #050d1a; }

        .page {
          min-height: 100vh;
          background: #050d1a;
          font-family: 'DM Sans', sans-serif;
          color: #e2e8f0;
          position: relative;
          overflow: hidden;
        }
        canvas {
          position: fixed; top: 0; left: 0;
          width: 100%; height: 100%;
          pointer-events: none; z-index: 0;
        }
        .glow-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          z-index: 0;
        }
        .orb1 { width: 600px; height: 600px; background: rgba(37,99,235,0.18); top: -200px; left: -200px; }
        .orb2 { width: 500px; height: 500px; background: rgba(14,165,233,0.12); bottom: -150px; right: -100px; }

        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.25rem 3rem;
          background: rgba(5,13,26,0.7);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(56,189,248,0.08);
        }
        .nav-logo {
          font-family: 'Syne', sans-serif;
          font-size: 1.5rem; font-weight: 800;
          background: linear-gradient(135deg, #38bdf8, #2563eb);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          letter-spacing: -0.5px;
        }
        .nav-logo span {
          display: inline-block;
          width: 8px; height: 8px;
          background: #38bdf8;
          border-radius: 50%;
          margin-left: 3px;
          vertical-align: super;
          font-size: 0;
        }
        .nav-links { display: flex; gap: 1rem; }
        .nav-btn {
          padding: 0.55rem 1.4rem;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem; font-weight: 600;
          cursor: pointer; text-decoration: none;
          transition: all 0.2s;
        }
        .nav-btn-ghost {
          background: transparent;
          border: 1.5px solid rgba(56,189,248,0.3);
          color: #94a3b8;
        }
        .nav-btn-ghost:hover { border-color: #38bdf8; color: #e2e8f0; }
        .nav-btn-solid {
          background: #2563eb;
          border: 1.5px solid #2563eb;
          color: #fff;
        }
        .nav-btn-solid:hover { background: #1d4ed8; }

        .hero {
          position: relative; z-index: 10;
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          padding: 8rem 2rem 4rem;
        }
        .badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.4rem 1rem;
          background: rgba(37,99,235,0.15);
          border: 1px solid rgba(56,189,248,0.25);
          border-radius: 100px;
          font-size: 0.8rem; font-weight: 600;
          color: #38bdf8; letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 2rem;
          animation: fadeUp 0.6s ease both;
        }
        .badge-dot {
          width: 7px; height: 7px;
          background: #38bdf8; border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.8rem, 6vw, 5rem);
          font-weight: 800; line-height: 1.1;
          color: #f1f5f9;
          margin-bottom: 1.5rem;
          animation: fadeUp 0.6s 0.1s ease both;
        }
        .hero-title .accent {
          background: linear-gradient(135deg, #38bdf8 0%, #2563eb 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .hero-sub {
          font-size: 1.15rem; color: #64748b;
          max-width: 560px; line-height: 1.7;
          margin-bottom: 3.5rem;
          animation: fadeUp 0.6s 0.2s ease both;
        }
        .hero-cards {
          display: flex; gap: 1.5rem;
          flex-wrap: wrap; justify-content: center;
          animation: fadeUp 0.6s 0.3s ease both;
        }
        .portal-card {
          position: relative;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 2.5rem 2rem;
          width: 280px;
          text-align: left;
          text-decoration: none;
          transition: all 0.3s ease;
          overflow: hidden;
          cursor: pointer;
        }
        .portal-card::before {
          content: '';
          position: absolute; inset: 0;
          border-radius: 20px;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .portal-card.employee::before { background: linear-gradient(135deg, rgba(37,99,235,0.12), rgba(14,165,233,0.06)); }
        .portal-card.employer::before { background: linear-gradient(135deg, rgba(124,58,237,0.12), rgba(37,99,235,0.06)); }
        .portal-card:hover::before { opacity: 1; }
        .portal-card:hover {
          border-color: rgba(56,189,248,0.3);
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(37,99,235,0.2);
        }
        .portal-icon {
          width: 52px; height: 52px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .portal-card.employee .portal-icon { background: rgba(37,99,235,0.2); }
        .portal-card.employer .portal-icon { background: rgba(124,58,237,0.2); }
        .portal-label {
          font-size: 0.72rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 1px;
          color: #38bdf8; margin-bottom: 0.5rem;
        }
        .portal-card.employer .portal-label { color: #a78bfa; }
        .portal-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.35rem; font-weight: 700;
          color: #f1f5f9; margin-bottom: 0.6rem;
        }
        .portal-desc {
          font-size: 0.875rem; color: #64748b;
          line-height: 1.6; margin-bottom: 1.5rem;
        }
        .portal-cta {
          display: inline-flex; align-items: center; gap: 0.5rem;
          font-size: 0.875rem; font-weight: 600;
          color: #38bdf8; text-decoration: none;
        }
        .portal-card.employer .portal-cta { color: #a78bfa; }
        .portal-cta svg { transition: transform 0.2s; }
        .portal-card:hover .portal-cta svg { transform: translateX(4px); }

        .features {
          position: relative; z-index: 10;
          padding: 5rem 2rem;
          max-width: 900px; margin: 0 auto;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
        }
        .feature-item {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 1.75rem;
          transition: border-color 0.2s;
        }
        .feature-item:hover { border-color: rgba(56,189,248,0.2); }
        .feature-icon { font-size: 1.5rem; margin-bottom: 0.85rem; }
        .feature-title {
          font-family: 'Syne', sans-serif;
          font-size: 0.95rem; font-weight: 700;
          color: #e2e8f0; margin-bottom: 0.4rem;
        }
        .feature-desc { font-size: 0.82rem; color: #475569; line-height: 1.6; }

        footer {
          position: relative; z-index: 10;
          text-align: center;
          padding: 2rem;
          border-top: 1px solid rgba(255,255,255,0.05);
          color: #334155; font-size: 0.8rem;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 640px) {
          nav { padding: 1rem 1.25rem; }
          .nav-links { gap: 0.5rem; }
          .features-grid { grid-template-columns: 1fr; }
          .portal-card { width: 100%; max-width: 340px; }
        }
      `}</style>

      <div className="page">
        <canvas ref={canvasRef} />
        <div className="glow-orb orb1" />
        <div className="glow-orb orb2" />

        {/* Nav */}
        <nav>
          <div className="nav-logo">Datagate<span /></div>
          <div className="nav-links">
            <Link href="/employee/login" className="nav-btn nav-btn-ghost">Employee</Link>
            <Link href="/employer/login" className="nav-btn nav-btn-solid">Employer</Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="hero">
          <div className="badge">
            <span className="badge-dot" />
            Trusted Background Verification Platform
          </div>

          <h1 className="hero-title">
            Verified Data.<br />
            <span className="accent">Zero Friction.</span>
          </h1>

          <p className="hero-sub">
            Datagate connects employees and employers through a secure, consent-driven
            platform for background verification, record sharing, and seamless onboarding.
          </p>

          <div className="hero-cards">
            {/* Employee Card */}
            <Link href="/employee/login" className="portal-card employee">
              <div className="portal-icon">👤</div>
              <div className="portal-label">For Individuals</div>
              <div className="portal-title">Employee Portal</div>
              <div className="portal-desc">
                Build your verified employment profile. Share documents securely with approved employers.
              </div>
              <span className="portal-cta">
                Get started
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
            </Link>

            {/* Employer Card */}
            <Link href="/employer/login" className="portal-card employer">
              <div className="portal-icon">🏢</div>
              <div className="portal-label">For Organizations</div>
              <div className="portal-title">Employer Portal</div>
              <div className="portal-desc">
                Request verified employee records with consent. Streamline hiring and onboarding instantly.
              </div>
              <span className="portal-cta">
                Access portal
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="features">
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🔐</div>
              <div className="feature-title">Consent-Driven Access</div>
              <div className="feature-desc">Employees control who sees their data. Employers only access approved records.</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <div className="feature-title">Instant Verification</div>
              <div className="feature-desc">No more chasing physical documents. Verified data delivered in seconds.</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🛡️</div>
              <div className="feature-title">Bank-Grade Security</div>
              <div className="feature-desc">End-to-end encrypted storage. Documents never exposed without explicit approval.</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📋</div>
              <div className="feature-title">Complete BGV Coverage</div>
              <div className="feature-desc">Aadhaar, PAN, education, employment history, UAN — all in one place.</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔗</div>
              <div className="feature-title">EPFO Integration</div>
              <div className="feature-desc">Pull UAN and PF records directly. No manual data entry needed.</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📱</div>
              <div className="feature-title">Works Everywhere</div>
              <div className="feature-desc">Mobile-first design. Employees can complete verification from any device.</div>
            </div>
          </div>
        </section>

        <footer>
          © 2026 Datagate. All Rights Reserved.
        </footer>
      </div>
    </>
  );
}
