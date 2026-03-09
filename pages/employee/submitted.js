// pages/employee/submitted.js — Success landing page after final submit
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #cdd2ed; font-family: 'Plus Jakarta Sans', sans-serif; }
  .pg { min-height: 100vh; background: #cdd2ed; display: flex; flex-direction: column; }

  .topbar { background: #1e1a3e; border-bottom: 1px solid #2d2860; padding: 0.85rem 1.75rem;
    display: flex; justify-content: space-between; align-items: center;
    box-shadow: 0 4px 20px rgba(15,12,40,0.4); }
  .logo-text { font-size: 1.3rem; font-weight: 800; color: #a78bfa; letter-spacing: -0.5px; }
  .user-name { font-size: 0.84rem; color: #9d9bc4; font-weight: 500; }

  .body { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem 1.25rem; }

  .card { background: #fff; border-radius: 24px; padding: 3rem 2.5rem; max-width: 520px; width: 100%;
    text-align: center; box-shadow: 0 12px 48px rgba(30,26,62,0.22), 0 4px 16px rgba(30,26,62,0.12);
    border: 1px solid rgba(255,255,255,0.9); }

  .icon-wrap { width: 88px; height: 88px; border-radius: 50%; background: #f0fdf4;
    border: 3px solid #bbf7d0; display: flex; align-items: center; justify-content: center;
    font-size: 2.6rem; margin: 0 auto 1.5rem; animation: pop 0.4s ease; }

  @keyframes pop {
    0%   { transform: scale(0.5); opacity: 0; }
    70%  { transform: scale(1.1); }
    100% { transform: scale(1);   opacity: 1; }
  }

  .title { font-size: 1.55rem; font-weight: 800; color: #1a1730; margin-bottom: 0.6rem; }
  .subtitle { font-size: 0.95rem; color: #6b6894; font-weight: 500; line-height: 1.65; margin-bottom: 2rem; }

  .info-box { background: #f8f7ff; border: 1.5px solid #e4e2f0; border-radius: 14px;
    padding: 1.1rem 1.3rem; margin-bottom: 2rem; text-align: left; }
  .info-row { display: flex; align-items: flex-start; gap: 0.65rem; padding: 0.4rem 0; }
  .info-row:not(:last-child) { border-bottom: 1px solid #ede9f8; }
  .info-icon { font-size: 1rem; flex-shrink: 0; margin-top: 1px; }
  .info-text { font-size: 0.84rem; color: #4a4770; font-weight: 500; line-height: 1.5; }

  .btn-row { display: flex; flex-direction: column; gap: 0.75rem; }
  .btn-primary { padding: 0.82rem 2rem; background: #16a34a; color: #fff; border: none;
    border-radius: 12px; font-family: inherit; font-size: 0.9rem; font-weight: 700;
    cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(22,163,74,0.3); }
  .btn-primary:hover { background: #15803d; transform: translateY(-1px); }
  .btn-secondary { padding: 0.75rem 2rem; background: transparent; color: #6b6894;
    border: 1.5px solid #dddaf0; border-radius: 12px; font-family: inherit;
    font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .btn-secondary:hover { border-color: #a78bfa; color: #7c3aed; }

  @media(max-width:480px){
    .card { padding: 2rem 1.25rem; }
    .title { font-size: 1.3rem; }
  }
`;

export default function SubmittedPage() {
  const router = useRouter();
  const { user, logout, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/employee/login"); return; }
    if (user.role !== "employee") { router.replace("/employee/login"); return; }
  }, [ready, user, router]);

  if (!ready || !user) return null;

  return (
    <>
      <style>{G}</style>
      <div className="pg">
        <div className="topbar">
          <span className="logo-text">Datagate</span>
          <span className="user-name">👤 {user.name || user.email}</span>
        </div>

        <div className="body">
          <div className="card">
            <div className="icon-wrap">✅</div>

            <h1 className="title">Profile Submitted!</h1>
            <p className="subtitle">
              Your background verification profile has been successfully submitted.
              Our team will review your details shortly.
            </p>

            <div className="info-box">
              <div className="info-row">
                <span className="info-icon">🔍</span>
                <span className="info-text">Your profile is now under review. This typically takes 3–5 business days.</span>
              </div>
              <div className="info-row">
                <span className="info-icon">🔔</span>
                <span className="info-text">If an employer requests access to your profile, you'll receive a consent notification.</span>
              </div>
              <div className="info-row">
                <span className="info-icon">📋</span>
                <span className="info-text">You can still view your submitted profile anytime by logging back in.</span>
              </div>
            </div>

            <div className="btn-row">
              <button className="btn-primary" onClick={() => router.push("/employee/review")}>
                View Submitted Profile
              </button>
              <button className="btn-secondary" onClick={() => logout()}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
