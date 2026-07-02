// pages/admin/dashboard.js
import { useState, useEffect, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const G = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

  /* ── Design tokens ── */
  :root {
    --bg:        #f2efe9;
    --bg2:       #ece8e1;
    --surface:   #ffffff;
    --surface2:  #f8f6f2;
    --border:    #dedad3;
    --border2:   #ccc8c0;
    --primary:   #0d6e6e;
    --primary2:  #0a5656;
    --primary-bg:#e8f4f4;
    --text:      #1c2b2b;
    --text2:     #4a6060;
    --text3:     #7a9494;
    --mono:      'IBM Plex Mono', monospace;
    --sans:      'DM Sans', sans-serif;
    --radius:    10px;
    --shadow:    0 1px 4px rgba(13,110,110,0.08), 0 4px 16px rgba(13,110,110,0.06);
    --shadow-sm: 0 1px 3px rgba(13,110,110,0.07);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); font-family: var(--sans); color: var(--text); -webkit-font-smoothing: antialiased; }

  .shell { display: flex; min-height: 100vh; }

  /* ── Sidebar ── */
  .side { width: 224px; min-width: 224px; background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column; padding: 1.5rem 0;
    position: sticky; top: 0; height: 100vh;
    box-shadow: 2px 0 12px rgba(13,110,110,0.05); }

  .side-logo { padding: 0 1.25rem 1.25rem; border-bottom: 1px solid var(--border); margin-bottom: 1rem; }
  .side-logo-title { font-family: var(--mono); font-size: 0.88rem; font-weight: 600;
    color: var(--primary); letter-spacing: 0.3px; }
  .side-logo-sub { font-size: 0.58rem; color: var(--text3); text-transform: uppercase;
    letter-spacing: 1.8px; margin-top: 3px; }

  .side-nav { flex: 1; padding: 0 0.65rem; display: flex; flex-direction: column; gap: 2px; }
  .nav-btn { display: flex; align-items: center; gap: 0.6rem; padding: 0.58rem 0.8rem;
    border-radius: 8px; border: none; background: transparent; color: var(--text2);
    font-family: var(--sans); font-size: 0.8rem; font-weight: 500;
    cursor: pointer; transition: all 0.15s; text-align: left; width: 100%; }
  .nav-btn:hover { background: var(--primary-bg); color: var(--primary); }
  .nav-btn.active { background: var(--primary-bg); color: var(--primary);
    font-weight: 700; box-shadow: inset 3px 0 0 var(--primary); }
  .nav-btn .icon { font-size: 0.95rem; width: 18px; text-align: center; }
  .nav-badge { margin-left: auto; background: #dc2626; color: #fff; font-size: 0.55rem;
    font-weight: 700; padding: 1px 6px; border-radius: 999px; }

  .side-bottom { padding: 1rem 1.25rem 0; border-top: 1px solid var(--border); margin-top: auto; }
  .admin-tag { font-size: 0.58rem; color: var(--text3); text-transform: uppercase; letter-spacing: 1.2px; }
  .admin-email { font-size: 0.7rem; color: var(--primary); margin-top: 3px;
    font-family: var(--mono); font-weight: 500; }

  .chpw-btn { margin-top: 0.6rem; width: 100%; padding: 0.48rem; background: var(--primary-bg);
    border: 1px solid var(--border); border-radius: 7px; color: var(--primary); font-size: 0.72rem;
    cursor: pointer; transition: all 0.15s; font-family: var(--sans); font-weight: 600; }
  .chpw-btn:hover { background: var(--primary); color: #fff; border-color: var(--primary); }

  .signout-btn { margin-top: 0.4rem; width: 100%; padding: 0.48rem; background: transparent;
    border: 1px solid var(--border); border-radius: 7px; color: var(--text3); font-size: 0.72rem;
    cursor: pointer; transition: all 0.15s; font-family: var(--sans); }
  .signout-btn:hover { border-color: #dc2626; color: #dc2626; background: #fef2f2; }

  /* ── Main content ── */
  .main { flex: 1; padding: 2rem 2.25rem; overflow-y: auto; background: var(--bg); }
  .page-head { margin-bottom: 1.75rem; }
  .page-title { font-size: 1.15rem; font-weight: 700; color: var(--text); letter-spacing: -0.2px; }
  .page-sub { font-size: 0.7rem; color: var(--text3); margin-top: 4px; font-family: var(--mono); }

  /* ── Stats grid ── */
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem; margin-bottom: 1.75rem; }
  .stat-card { background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 1rem 1.1rem;
    box-shadow: var(--shadow-sm); transition: box-shadow 0.15s; }
  .stat-card:hover { box-shadow: var(--shadow); }
  .stat-label { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 1.1px;
    color: var(--text3); font-weight: 700; margin-bottom: 0.4rem; }
  .stat-value { font-family: var(--mono); font-size: 1.65rem; font-weight: 600;
    color: var(--text); line-height: 1; }
  .stat-sub { font-size: 0.62rem; color: var(--text3); margin-top: 0.3rem; line-height: 1.5; }
  .stat-card.warn  .stat-value { color: #b45309; }
  .stat-card.warn  { border-left: 3px solid #f59e0b; }
  .stat-card.danger .stat-value { color: #b91c1c; }
  .stat-card.danger { border-left: 3px solid #ef4444; }
  .stat-card.good  .stat-value { color: var(--primary); }
  .stat-card.good  { border-left: 3px solid var(--primary); }
  .stat-card.purple .stat-value { color: var(--primary); }

  /* ── Two-col panels ── */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
  .panel { background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-sm); }
  .panel-head { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    background: var(--surface2); }
  .panel-title { font-size: 0.68rem; font-weight: 700; color: var(--text2);
    text-transform: uppercase; letter-spacing: 1px; }
  .panel-body { padding: 0.5rem; max-height: 320px; overflow-y: auto; }

  /* ── Activity feed ── */
  .activity-item { display: flex; gap: 0.65rem; align-items: flex-start;
    padding: 0.55rem 0.6rem; border-bottom: 1px solid var(--bg2); }
  .activity-item:last-child { border-bottom: none; }
  .activity-dot { width: 7px; height: 7px; border-radius: 50%; margin-top: 4px; flex-shrink: 0; }
  .dot-consent { background: var(--primary); }
  .dot-ticket  { background: #d97706; }
  .dot-admin   { background: #dc2626; }
  .activity-text { font-size: 0.72rem; color: var(--text2); line-height: 1.55; }
  .activity-time { font-size: 0.6rem; color: var(--text3); font-family: var(--mono); margin-top: 2px; }

  /* ── Search + filter ── */
  .search-bar { width: 100%; padding: 0.6rem 0.9rem; background: var(--surface);
    border: 1.5px solid var(--border); border-radius: 8px; font-family: var(--sans);
    font-size: 0.8rem; color: var(--text); outline: none; transition: border-color 0.15s; }
  .search-bar:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(13,110,110,0.08); }
  .search-bar::placeholder { color: var(--text3); }

  .filter-row { display: flex; gap: 0.4rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
  .filter-btn { padding: 0.3rem 0.75rem; border-radius: 6px; border: 1px solid var(--border);
    background: var(--surface); color: var(--text2); font-family: var(--sans);
    font-size: 0.7rem; cursor: pointer; transition: all 0.12s; font-weight: 500; }
  .filter-btn:hover { border-color: var(--primary); color: var(--primary); }
  .filter-btn.on { background: var(--primary); border-color: var(--primary);
    color: #fff; font-weight: 600; }

  /* ── User list ── */
  .user-row { display: flex; align-items: center; gap: 0.65rem; padding: 0.6rem 0.6rem;
    border-radius: 8px; cursor: pointer; transition: background 0.1s; }
  .user-row:hover { background: var(--bg2); }
  .user-row.selected { background: var(--primary-bg); border: 1px solid rgba(13,110,110,0.2); }

  .user-avatar { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center;
    justify-content: center; font-size: 0.72rem; font-weight: 700; flex-shrink: 0; }
  .av-employer { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
  .av-employee { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
  .av-admin    { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

  .user-email { font-size: 0.72rem; color: var(--text); font-family: var(--mono);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
  .user-name  { font-size: 0.68rem; color: var(--text3); margin-top: 1px; }

  .user-status-badge { margin-left: auto; font-size: 0.55rem; font-weight: 700; padding: 2px 8px;
    border-radius: 999px; flex-shrink: 0; text-transform: uppercase; letter-spacing: 0.3px; }
  .status-active    { background: #dcfce7; color: #15803d; }
  .status-suspended { background: #fef9c3; color: #a16207; }
  .status-blocked   { background: #fee2e2; color: #b91c1c; }

  /* ── Detail panel ── */
  .detail-panel { background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 1.25rem; box-shadow: var(--shadow-sm); }
  .detail-section { margin-bottom: 1.25rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--bg2); }
  .detail-section:last-child { margin-bottom: 0; border-bottom: none; }
  .detail-label { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 1.1px;
    color: var(--text3); font-weight: 700; margin-bottom: 0.55rem; }
  .detail-value { font-size: 0.8rem; color: var(--text2); line-height: 1.65; }
  .mono { font-family: var(--mono); }

  .action-row { display: flex; gap: 0.45rem; flex-wrap: wrap; margin-top: 0.8rem; }
  .action-btn { padding: 0.38rem 0.85rem; border-radius: 6px; border: 1.5px solid;
    font-family: var(--sans); font-size: 0.7rem; font-weight: 600;
    cursor: pointer; transition: all 0.12s; }
  .btn-suspend  { border-color: #d97706; color: #92400e; background: #fffbeb; }
  .btn-suspend:hover  { background: #fef3c7; }
  .btn-block    { border-color: #ef4444; color: #b91c1c; background: #fef2f2; }
  .btn-block:hover    { background: #fee2e2; }
  .btn-unblock  { border-color: #16a34a; color: #15803d; background: #f0fdf4; }
  .btn-unblock:hover  { background: #dcfce7; }
  .btn-delete   { border-color: #fca5a5; color: #dc2626; background: #fff5f5; }
  .btn-delete:hover   { background: #fee2e2; border-color: #ef4444; }
  .btn-note     { border-color: var(--border); color: var(--text2); background: var(--surface2); }
  .btn-note:hover     { border-color: var(--primary); color: var(--primary); background: var(--primary-bg); }

  /* ── Ticket rows ── */
  .ticket-row { padding: 0.7rem 0.6rem; border-bottom: 1px solid var(--bg2); cursor: pointer;
    border-radius: 7px; transition: background 0.1s; }
  .ticket-row:hover { background: var(--bg2); }
  .ticket-row.selected { background: var(--primary-bg); border-left: 3px solid var(--primary); }
  .ticket-subject { font-size: 0.76rem; color: var(--text); font-weight: 600; }
  .ticket-meta { font-size: 0.62rem; color: var(--text3); margin-top: 3px; font-family: var(--mono); }

  .ticket-cat { display: inline-block; font-size: 0.55rem; font-weight: 700; padding: 2px 7px;
    border-radius: 4px; text-transform: uppercase; margin-right: 5px; letter-spacing: 0.3px; }
  .cat-account  { background: #eff6ff; color: #2563eb; }
  .cat-consent  { background: #f0fdf4; color: #15803d; }
  .cat-document { background: #f8fafc; color: #475569; }
  .cat-bgv      { background: #fdf4ff; color: #9333ea; }
  .cat-billing  { background: #f0fdfa; color: #0d9488; }
  .cat-other    { background: #f8f9fa; color: #6b7280; }

  .tick-status { font-size: 0.55rem; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
  .ts-open        { background: #dcfce7; color: #15803d; }
  .ts-in_progress { background: #eff6ff; color: #2563eb; }
  .ts-resolved    { background: #f1f5f9; color: #94a3b8; }

  /* ── Reply / message boxes ── */
  .reply-box { background: var(--surface2); border: 1.5px solid var(--border);
    border-radius: 8px; padding: 0.65rem 0.875rem; font-family: var(--sans);
    font-size: 0.8rem; color: var(--text); outline: none; resize: none;
    min-height: 80px; width: 100%; margin-top: 0.75rem; transition: border-color 0.15s; }
  .reply-box:focus { border-color: var(--primary); background: #fff;
    box-shadow: 0 0 0 3px rgba(13,110,110,0.08); }

  .reply-send-btn { padding: 0.48rem 1.1rem; background: var(--primary); color: #fff; border: none;
    border-radius: 7px; font-family: var(--sans); font-size: 0.76rem; font-weight: 700;
    cursor: pointer; margin-top: 0.5rem; transition: background 0.12s; }
  .reply-send-btn:hover:not(:disabled) { background: var(--primary2); }
  .reply-send-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .tick-reply { background: var(--primary-bg); border: 1px solid rgba(13,110,110,0.15);
    border-radius: 8px; padding: 0.65rem 0.875rem; margin-bottom: 0.5rem; }
  .tick-reply-by { font-size: 0.6rem; color: var(--primary); font-weight: 700; margin-bottom: 4px;
    text-transform: uppercase; letter-spacing: 0.5px; }
  .tick-reply-body { font-size: 0.8rem; color: var(--text); line-height: 1.6; }

  .tick-user-msg { background: #f8fafc; border: 1px solid var(--border);
    border-radius: 8px; padding: 0.65rem 0.875rem; margin-bottom: 0.5rem; }
  .tick-user-by { font-size: 0.6rem; color: #2563eb; font-weight: 700; margin-bottom: 4px;
    text-transform: uppercase; letter-spacing: 0.5px; }

  /* ── Modals ── */
  .modal-overlay { position: fixed; inset: 0; background: rgba(15,30,30,0.35);
    backdrop-filter: blur(3px); z-index: 100;
    display: flex; align-items: center; justify-content: center; }
  .modal-box { background: var(--surface); border: 1px solid var(--border2);
    border-radius: 14px; padding: 1.6rem; width: 420px; max-width: 95vw;
    box-shadow: 0 8px 40px rgba(13,110,110,0.15); }
  .modal-title { font-size: 0.9rem; font-weight: 700; color: var(--text); margin-bottom: 1.1rem; }
  .modal-input { width: 100%; padding: 0.65rem 0.875rem; background: var(--surface2);
    border: 1.5px solid var(--border); border-radius: 8px; font-family: var(--sans);
    font-size: 0.82rem; color: var(--text); outline: none; resize: none; min-height: 80px; }
  .modal-input:focus { border-color: var(--primary); background: #fff;
    box-shadow: 0 0 0 3px rgba(13,110,110,0.08); }
  .modal-row { display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 0.875rem; }
  .modal-cancel { padding: 0.42rem 0.9rem; background: var(--surface2); border: 1px solid var(--border);
    border-radius: 7px; color: var(--text2); font-family: var(--sans); font-size: 0.76rem;
    cursor: pointer; transition: all 0.12s; }
  .modal-cancel:hover { border-color: var(--border2); }
  .modal-save { padding: 0.42rem 0.9rem; background: var(--primary); border: none;
    border-radius: 7px; color: #fff; font-family: var(--sans); font-size: 0.76rem;
    font-weight: 600; cursor: pointer; transition: background 0.12s; }
  .modal-save:hover { background: var(--primary2); }

  /* ── Utility ── */
  .empty-state { padding: 2.5rem; text-align: center; color: var(--text3); font-size: 0.76rem; }
  .loading-txt { color: var(--text3); font-size: 0.72rem; padding: 1rem;
    font-family: var(--mono); }

  .err-box { background: #fef2f2; border: 1px solid #fecaca;
    border-radius: 8px; padding: 0.55rem 0.875rem; font-size: 0.74rem;
    color: #b91c1c; margin-bottom: 0.75rem; font-weight: 500; }
  .ok-box  { background: #f0fdf4; border: 1px solid #bbf7d0;
    border-radius: 8px; padding: 0.55rem 0.875rem; font-size: 0.74rem;
    color: #15803d; margin-bottom: 0.75rem; font-weight: 500; }

  .consent-chip { display: inline-block; font-size: 0.58rem; font-weight: 700; padding: 2px 8px;
    border-radius: 999px; margin-right: 4px; }
  .chip-APPROVED { background: #dcfce7; color: #15803d; }
  .chip-PENDING  { background: #eff6ff; color: #2563eb; }
  .chip-REVOKED  { background: #fee2e2; color: #b91c1c; }
  .chip-DECLINED { background: #f1f5f9; color: #64748b; }

  @media (max-width: 768px) {
    .two-col { grid-template-columns: 1fr; }
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .side { display: none; }
  }
`;

function toIST(ms) {
  if (!ms) return "—";
  return new Date(ms).toLocaleString("en-IN", { timeZone: "Asia/Kolkata",
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function AdminDashboard() {
  const [adminUser,  setAdminUser]  = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPw,    setLoginPw]    = useState("");
  const [loginErr,   setLoginErr]   = useState("");
  const [loginBusy,  setLoginBusy]  = useState(false);
  const [authReady,  setAuthReady]  = useState(false);

  // FIX BUG-2: forgot password state
  const [loginMode,   setLoginMode]   = useState("login"); // "login" | "forgot"
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg,   setForgotMsg]   = useState("");
  const [forgotBusy,  setForgotBusy]  = useState(false);

  // FIX BUG-1: change password state
  const [showChPw,   setShowChPw]   = useState(false);
  const [pwCurrent,  setPwCurrent]  = useState("");
  const [pwNew,      setPwNew]      = useState("");
  const [pwConfirm,  setPwConfirm]  = useState("");
  const [pwErr,      setPwErr]      = useState("");
  const [pwOk,       setPwOk]       = useState("");
  const [pwBusy,     setPwBusy]     = useState(false);

  useEffect(() => {
    try {
      const tok = localStorage.getItem("dg_admin_token");
      const usr = localStorage.getItem("dg_admin_user");
      if (tok && usr) {
        const parsed = JSON.parse(usr);
        if (parsed.role === "admin") { setAdminToken(tok); setAdminUser(parsed); }
      }
    } catch(_) {}
    setAuthReady(true);
  }, []);

  const handleLogin = async () => {
    setLoginErr("");
    if (!loginEmail || !loginPw) { setLoginErr("Email and password required"); return; }
    setLoginBusy(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail.trim().toLowerCase(), password: loginPw }),
      });
      const d = await res.json();
      if (!res.ok) { setLoginErr(d.detail || "Login failed"); return; }
      if (d.role !== "admin") { setLoginErr("This portal is for admins only"); return; }
      const userData = { email: loginEmail.trim().toLowerCase(), role: d.role, name: d.name };
      localStorage.setItem("dg_admin_token", d.access_token);
      localStorage.setItem("dg_admin_user", JSON.stringify(userData));
      setAdminToken(d.access_token);
      setAdminUser(userData);
    } catch(_) { setLoginErr("Network error — please try again"); }
    finally { setLoginBusy(false); }
  };

  // FIX BUG-2: forgot password handler
  const handleForgot = async () => {
    setForgotMsg(""); setLoginErr("");
    if (!forgotEmail) { setLoginErr("Enter your admin email"); return; }
    setForgotBusy(true);
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
      });
      // Always show success — never reveal if email exists
      setForgotMsg("If that email exists, a reset link has been sent.");
    } catch(_) { setLoginErr("Network error — please try again"); }
    finally { setForgotBusy(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("dg_admin_token");
    localStorage.removeItem("dg_admin_user");
    setAdminToken(null); setAdminUser(null);
  };

  // FIX BUG-1: change password handler
  const handleChangePassword = async () => {
    setPwErr(""); setPwOk("");
    if (!pwCurrent || !pwNew || !pwConfirm) { setPwErr("All fields required"); return; }
    if (pwNew !== pwConfirm) { setPwErr("New passwords do not match"); return; }
    if (pwNew.length < 8) { setPwErr("Must be at least 8 characters"); return; }
    if (pwNew === pwCurrent) { setPwErr("New password must be different"); return; }
    setPwBusy(true);
    try {
      const r = await apiFetch(`${API}/auth/change-password`, {
        method: "POST",
        body: JSON.stringify({ current_password: pwCurrent, new_password: pwNew }),
      });
      const d = await r.json();
      if (!r.ok) { setPwErr(d.detail || "Failed — check current password"); return; }
      setPwOk("Password changed. Signing you out…");
      setTimeout(() => {
        setShowChPw(false); setPwCurrent(""); setPwNew(""); setPwConfirm("");
        handleLogout();
      }, 2000);
    } catch(_) { setPwErr("Network error"); }
    finally { setPwBusy(false); }
  };

  const [tab, setTab]               = useState("overview");
  const [bgvVendors, setBgvVendors]  = useState([]);
  const [bgvLoading, setBgvLoading]  = useState(false);
  const [bgvMsg,     setBgvMsg]      = useState({ type: "", text: "" });
  const [stats, setStats]           = useState(null);
  const [activity, setActivity]     = useState([]);
  const [users, setUsers]           = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [selUser, setSelUser]       = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [tickets, setTickets]       = useState([]);
  const [ticketFilter, setTicketFilter] = useState("");
  const [selTicket, setSelTicket]   = useState(null);
  const [replyBody, setReplyBody]   = useState("");
  const [replyStatus, setReplyStatus] = useState("");
  const [loading, setLoading]       = useState(false);
  const [msg, setMsg]               = useState({ type: "", text: "" });
  const [noteModal, setNoteModal]   = useState(false);
  const [noteText, setNoteText]     = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // FIX BUG-3: apiFetch with 401 auto-logout
  const apiFetch = useCallback(async (url, opts = {}) => {
    const token = adminToken || (typeof window !== "undefined" ? localStorage.getItem("dg_admin_token") : null);
    const res = await fetch(url, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opts.headers || {}),
      },
    });
    // FIX BUG-3: auto-logout on token expiry
    if (res.status === 401) {
      localStorage.removeItem("dg_admin_token");
      localStorage.removeItem("dg_admin_user");
      setAdminToken(null);
      setAdminUser(null);
    }
    return res;
  }, [adminToken]);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    try {
      const [sr, ar] = await Promise.all([
        apiFetch(`${API}/admin/stats`),
        apiFetch(`${API}/admin/activity?limit=30`),
      ]);
      if (sr.ok) setStats(await sr.json());
      if (ar.ok) setActivity(await ar.json());
    } catch (_) {}
    setLoading(false);
  }, [apiFetch]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (userFilter) params.set("role", userFilter);
      if (userSearch) params.set("search", userSearch);
      const r = await apiFetch(`${API}/admin/users?${params}`);
      if (r.ok) setUsers(await r.json());
    } catch (_) {}
    setLoading(false);
  }, [apiFetch, userFilter, userSearch]);

  const loadUserDetail = useCallback(async (email) => {
    setUserDetail(null);
    try {
      const r = await apiFetch(`${API}/admin/users/${encodeURIComponent(email)}`);
      if (r.ok) setUserDetail(await r.json());
    } catch (_) {}
  }, [apiFetch]);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = ticketFilter ? `?status=${ticketFilter}` : "";
      const r = await apiFetch(`${API}/admin/tickets${params}`);
      if (r.ok) setTickets(await r.json());
    } catch (_) {}
    setLoading(false);
  }, [apiFetch, ticketFilter]);

  const loadBgvVendors = useCallback(async () => {
    setBgvLoading(true);
    try {
      const r = await apiFetch(`${API}/admin/users?role=bgv`);
      if (r.ok) {
        const all = await r.json();
        setBgvVendors(all.filter(u => u.role === "bgv"));
      }
    } catch (_) {}
    setBgvLoading(false);
  }, [apiFetch]);

  const approveBgv = async (email) => {
    setBgvMsg({ type: "", text: "" });
    try {
      const r = await apiFetch(`${API}/admin/bgv/approve`, {
        method: "POST",
        body: JSON.stringify({ email, note: "Approved via admin dashboard" }),
      });
      if (r.ok) {
        setBgvMsg({ type: "ok", text: `✅ ${email} approved` });
        loadBgvVendors();
      } else {
        const d = await r.json();
        setBgvMsg({ type: "err", text: d.detail || "Approval failed" });
      }
    } catch (_) { setBgvMsg({ type: "err", text: "Network error" }); }
  };

  const rejectBgv = async (email) => {
    setBgvMsg({ type: "", text: "" });
    try {
      const r = await apiFetch(`${API}/admin/bgv/reject`, {
        method: "POST",
        body: JSON.stringify({ email, note: "Rejected via admin dashboard" }),
      });
      if (r.ok) {
        setBgvMsg({ type: "ok", text: `❌ ${email} rejected` });
        loadBgvVendors();
      } else {
        const d = await r.json();
        setBgvMsg({ type: "err", text: d.detail || "Rejection failed" });
      }
    } catch (_) { setBgvMsg({ type: "err", text: "Network error" }); }
  };

  useEffect(() => {
    if (!adminUser || !adminToken) return;
    if (tab === "overview") loadOverview();
    if (tab === "users")    loadUsers();
    if (tab === "tickets")  loadTickets();
    if (tab === "bgv")      loadBgvVendors();
  }, [tab, adminUser, adminToken, loadOverview, loadUsers, loadTickets, loadBgvVendors]);

  useEffect(() => {
    if (tab === "users") loadUsers();
  }, [userFilter, tab, loadUsers]);

  const doAccountAction = async (action) => {
    if (action === "delete" && !confirmDelete) { setConfirmDelete(true); return; }
    setConfirmDelete(false);
    setMsg({ type: "", text: "" });
    try {
      let r;
      if (action === "delete") {
        r = await apiFetch(`${API}/admin/users/${encodeURIComponent(selUser)}`, { method: "DELETE" });
      } else {
        r = await apiFetch(`${API}/admin/account-action`, {
          method: "POST",
          body: JSON.stringify({ email: selUser, action }),
        });
      }
      const d = await r.json();
      if (r.ok) {
        setMsg({ type: "ok", text: `${action} applied successfully` });
        if (action === "delete") { setSelUser(null); setUserDetail(null); }
        loadUsers();
        if (selUser) loadUserDetail(selUser);
      } else {
        setMsg({ type: "err", text: d.detail || "Action failed" });
      }
    } catch (_) { setMsg({ type: "err", text: "Network error" }); }
  };

  // FIX BUG-5: error display on note failure
  const doAddNote = async () => {
    if (!noteText.trim()) return;
    try {
      const r = await apiFetch(`${API}/admin/note`, {
        method: "POST",
        body: JSON.stringify({ email: selUser, note: noteText }),
      });
      const d = await r.json();
      if (r.ok) {
        setMsg({ type: "ok", text: "Note added" });
        setNoteModal(false); setNoteText("");
        loadUserDetail(selUser);
      } else {
        setMsg({ type: "err", text: d.detail || "Failed to add note" });
        setNoteModal(false);
      }
    } catch (_) { setMsg({ type: "err", text: "Network error — note not saved" }); setNoteModal(false); }
  };

  // FIX BUG-4 + BUG-5: ticket reply with fresh data + error display
  const doTicketReply = async () => {
    if (!replyBody.trim() || !selTicket) return;
    setMsg({ type: "", text: "" });
    try {
      const r = await apiFetch(`${API}/admin/tickets/reply`, {
        method: "POST",
        body: JSON.stringify({ ticket_id: selTicket.ticket_id, body: replyBody, status: replyStatus }),
      });
      const d = await r.json();
      if (r.ok) {
        setReplyBody(""); setReplyStatus("");
        setMsg({ type: "ok", text: "Reply sent" });
        // FIX BUG-4: reload tickets then pick fresh selTicket from new data
        await loadTickets();
        setTickets(prev => {
          const fresh = prev.find(t => t.ticket_id === selTicket.ticket_id);
          if (fresh) setSelTicket(fresh);
          return prev;
        });
      } else {
        setMsg({ type: "err", text: d.detail || "Failed to send reply" });
      }
    } catch (_) { setMsg({ type: "err", text: "Network error — reply not sent" }); }
  };

  if (!authReady) return null;

  // ── Login / Forgot password screens ──────────────────────────────────────
  if (!adminUser || !adminToken) {
    return (
      <>
        <style>{G}</style>
        <div style={{minHeight:"100vh",background:"#f2efe9",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
          <div style={{background:"#ffffff",border:"1px solid #1e1b2e",borderRadius:"16px",padding:"2rem 2.25rem",width:"100%",maxWidth:"380px"}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"0.85rem",fontWeight:600,color:"#0d6e6e",marginBottom:"4px"}}>DATAGATE</div>
            <div style={{fontSize:"0.6rem",color:"#7a9494",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:"2rem"}}>Admin Console</div>

            {(loginErr || forgotMsg) && (
              <div style={{background: forgotMsg ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                border: `1px solid ${forgotMsg ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                borderRadius:"8px",padding:"0.6rem 0.875rem",fontSize:"0.75rem",
                color: forgotMsg ? "#6ee7b7" : "#fca5a5",marginBottom:"1rem"}}>
                {forgotMsg || loginErr}
              </div>
            )}

            {loginMode === "login" ? (
              <>
                <div style={{marginBottom:"1rem"}}>
                  <label style={{display:"block",fontSize:"0.6rem",fontWeight:700,color:"#7a9494",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:"0.4rem"}}>Email</label>
                  <input type="email" value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    placeholder="admin@youremail.com" autoFocus
                    style={{width:"100%",padding:"0.65rem 0.875rem",background:"#f2efe9",border:"1px solid #1e1b2e",borderRadius:"8px",fontFamily:"inherit",fontSize:"0.875rem",color:"#1c2b2b",outline:"none"}}/>
                </div>
                <div style={{marginBottom:"1rem"}}>
                  <label style={{display:"block",fontSize:"0.6rem",fontWeight:700,color:"#7a9494",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:"0.4rem"}}>Password</label>
                  <input type="password" value={loginPw}
                    onChange={e => setLoginPw(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    placeholder="Your admin password"
                    style={{width:"100%",padding:"0.65rem 0.875rem",background:"#f2efe9",border:"1px solid #1e1b2e",borderRadius:"8px",fontFamily:"inherit",fontSize:"0.875rem",color:"#1c2b2b",outline:"none"}}/>
                </div>
                <button onClick={handleLogin} disabled={loginBusy}
                  style={{width:"100%",padding:"0.75rem",background:"#0d6e6e",color:"#fff",border:"none",borderRadius:"8px",fontFamily:"inherit",fontSize:"0.875rem",fontWeight:700,cursor:loginBusy?"not-allowed":"pointer",opacity:loginBusy?0.6:1,marginBottom:"0.75rem"}}>
                  {loginBusy ? "Signing in…" : "Sign In →"}
                </button>
                {/* FIX BUG-2: forgot password link */}
                <button onClick={() => { setLoginMode("forgot"); setLoginErr(""); setForgotEmail(loginEmail); }}
                  style={{width:"100%",background:"none",border:"none",color:"#7a9494",fontSize:"0.72rem",cursor:"pointer",fontFamily:"inherit",textAlign:"center",padding:"0.25rem"}}>
                  Forgot password?
                </button>
              </>
            ) : (
              <>
                <div style={{fontSize:"0.78rem",color:"#4a6060",marginBottom:"1.25rem",lineHeight:1.6}}>
                  Enter your admin email and we'll send a reset link.
                </div>
                <div style={{marginBottom:"1rem"}}>
                  <label style={{display:"block",fontSize:"0.6rem",fontWeight:700,color:"#7a9494",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:"0.4rem"}}>Admin Email</label>
                  <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleForgot()}
                    placeholder="admin@youremail.com" autoFocus
                    style={{width:"100%",padding:"0.65rem 0.875rem",background:"#f2efe9",border:"1px solid #1e1b2e",borderRadius:"8px",fontFamily:"inherit",fontSize:"0.875rem",color:"#1c2b2b",outline:"none"}}/>
                </div>
                <button onClick={handleForgot} disabled={forgotBusy}
                  style={{width:"100%",padding:"0.75rem",background:"#0d6e6e",color:"#fff",border:"none",borderRadius:"8px",fontFamily:"inherit",fontSize:"0.875rem",fontWeight:700,cursor:forgotBusy?"not-allowed":"pointer",opacity:forgotBusy?0.6:1,marginBottom:"0.75rem"}}>
                  {forgotBusy ? "Sending…" : "Send Reset Link"}
                </button>
                <button onClick={() => { setLoginMode("login"); setLoginErr(""); setForgotMsg(""); }}
                  style={{width:"100%",background:"none",border:"none",color:"#7a9494",fontSize:"0.72rem",cursor:"pointer",fontFamily:"inherit",textAlign:"center",padding:"0.25rem"}}>
                  ← Back to sign in
                </button>
              </>
            )}
          </div>
        </div>
      </>
    );
  }

  const accountStatus = userDetail?.user?.account_status || "active";

  return (
    <>
      <style>{G}</style>

      {/* FIX BUG-1: Change Password Modal */}
      {showChPw && (
        <div className="modal-overlay" onClick={() => setShowChPw(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">🔑 Change Admin Password</div>
            {[["Current password", pwCurrent, setPwCurrent], ["New password", pwNew, setPwNew], ["Confirm new password", pwConfirm, setPwConfirm]].map(([label, val, setter]) => (
              <div key={label} style={{marginBottom:"0.65rem"}}>
                <div style={{fontSize:"0.6rem",fontWeight:700,color:"#7a9494",textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:"0.35rem"}}>{label}</div>
                <input type="password" value={val} onChange={e => setter(e.target.value)}
                  style={{width:"100%",padding:"0.6rem 0.75rem",background:"#f2efe9",border:"1px solid #1e1b2e",borderRadius:"7px",fontFamily:"inherit",fontSize:"0.82rem",color:"#1c2b2b",outline:"none"}}/>
              </div>
            ))}
            {pwErr && <div style={{fontSize:"0.72rem",color:"#fca5a5",marginBottom:"0.5rem",fontWeight:600}}>{pwErr}</div>}
            {pwOk  && <div style={{fontSize:"0.72rem",color:"#6ee7b7",marginBottom:"0.5rem",fontWeight:600}}>{pwOk}</div>}
            <div className="modal-row">
              <button className="modal-cancel" onClick={() => { setShowChPw(false); setPwErr(""); setPwOk(""); setPwCurrent(""); setPwNew(""); setPwConfirm(""); }}>Cancel</button>
              <button className="modal-save" onClick={handleChangePassword} disabled={pwBusy}
                style={{opacity:pwBusy?0.6:1,cursor:pwBusy?"not-allowed":"pointer"}}>
                {pwBusy ? "Saving…" : "Change Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="shell">
        {/* ── Sidebar ── */}
        <aside className="side">
          <div className="side-logo">
            <div className="side-logo-title">DATAGATE</div>
            <div className="side-logo-sub">Admin Console</div>
          </div>
          <nav className="side-nav">
            {[
              { id: "overview", icon: "◈", label: "Overview" },
              { id: "users",    icon: "⊛", label: "Users",
                badge: stats ? (stats.users.suspended + stats.users.blocked) || null : null },
              { id: "tickets",  icon: "⊡", label: "Support",
                badge: stats?.tickets?.open || null },
              { id: "bgv",      icon: "⬡", label: "BGV Vendors",
                badge: bgvVendors.filter(v => !v.bgv_approved).length || null },
            ].map(n => (
              <button key={n.id} className={`nav-btn${tab === n.id ? " active" : ""}`}
                onClick={() => setTab(n.id)}>
                <span className="icon">{n.icon}</span>
                {n.label}
                {n.badge ? <span className="nav-badge">{n.badge}</span> : null}
              </button>
            ))}
          </nav>
          <div className="side-bottom">
            <div className="admin-tag">Signed in as</div>
            <div className="admin-email">{adminUser.email}</div>
            {/* FIX BUG-1: Change password button in sidebar */}
            <button className="chpw-btn" onClick={() => setShowChPw(true)}>
              🔑 Change password
            </button>
            <button className="signout-btn" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="main">

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <>
              <div className="page-head">
                <div className="page-title">Eagle View</div>
                <div className="page-sub">datagate.co.in — live platform status</div>
              </div>
              {loading && !stats && <div className="loading-txt">Loading stats…</div>}
              {stats && (
                <div className="stats-grid">
                  <div className="stat-card purple">
                    <div className="stat-label">Total Users</div>
                    <div className="stat-value">{stats.users.total}</div>
                    <div className="stat-sub">{stats.users.employees} employees · {stats.users.employers} employers</div>
                  </div>
                  <div className={`stat-card ${stats.users.suspended + stats.users.blocked > 0 ? "warn" : ""}`}>
                    <div className="stat-label">Restricted</div>
                    <div className="stat-value">{stats.users.suspended + stats.users.blocked}</div>
                    <div className="stat-sub">{stats.users.suspended} suspended · {stats.users.blocked} blocked</div>
                  </div>
                  <div className="stat-card good">
                    <div className="stat-label">Consents</div>
                    <div className="stat-value">{stats.consents.total}</div>
                    <div className="stat-sub">{stats.consents.approved} approved · {stats.consents.pending} pending</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Profiles</div>
                    <div className="stat-value">{stats.profiles.total}</div>
                    <div className="stat-sub">Employee records</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Messages</div>
                    <div className="stat-value">{stats.messages.total}</div>
                    <div className="stat-sub">Across all threads</div>
                  </div>
                  <div className={`stat-card ${stats.tickets.open > 0 ? "warn" : ""}`}>
                    <div className="stat-label">Open Tickets</div>
                    <div className="stat-value">{stats.tickets.open}</div>
                    <div className="stat-sub">{stats.tickets.total} total tickets</div>
                  </div>
                </div>
              )}
              <div className="two-col">
                <div className="panel">
                  <div className="panel-head">
                    <div className="panel-title">Recent Activity</div>
                    <button onClick={loadOverview} style={{fontSize:"0.65rem",color:"#7a9494",background:"none",border:"none",cursor:"pointer"}}>↻ refresh</button>
                  </div>
                  <div className="panel-body">
                    {activity.length === 0 && <div className="empty-state">No activity yet</div>}
                    {activity.map((a, i) => (
                      <div key={i} className="activity-item">
                        <div className={`activity-dot dot-${a.type}`}/>
                        <div>
                          <div className="activity-text">{a.detail}</div>
                          <div className="activity-time">{toIST(a.ts)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="panel">
                  <div className="panel-head">
                    <div className="panel-title">Consent Breakdown</div>
                  </div>
                  <div className="panel-body" style={{padding:"1rem"}}>
                    {stats && [
                      { label: "Approved",  val: stats.consents.approved,  col: "#10b981" },
                      { label: "Pending",   val: stats.consents.pending,   col: "#6366f1" },
                      { label: "Revoked",   val: stats.consents.revoked,   col: "#ef4444" },
                      { label: "Declined",  val: stats.consents.declined,  col: "#7a9494" },
                    ].map(row => {
                      const total = stats.consents.total || 1;
                      const pct = Math.round((row.val / total) * 100);
                      return (
                        <div key={row.label} style={{marginBottom:"0.75rem"}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                            <span style={{fontSize:"0.68rem",color:"#7a9494"}}>{row.label}</span>
                            <span style={{fontSize:"0.68rem",color:row.col,fontFamily:"'IBM Plex Mono',monospace"}}>{row.val} ({pct}%)</span>
                          </div>
                          <div style={{height:"4px",background:"#f2efe9",borderRadius:"2px"}}>
                            <div style={{width:`${pct}%`,height:"100%",background:row.col,borderRadius:"2px",transition:"width 0.4s"}}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── USERS ── */}
          {tab === "users" && (
            <>
              <div className="page-head">
                <div className="page-title">User Management</div>
                <div className="page-sub">Search, inspect, suspend or block any account</div>
              </div>
              {msg.text && <div className={msg.type === "ok" ? "ok-box" : "err-box"}>{msg.text}</div>}
              <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:"1rem"}}>
                <div>
                  <input className="search-bar" placeholder="Search email or name…"
                    value={userSearch} onChange={e => setUserSearch(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && loadUsers()}
                    style={{marginBottom:"0.5rem"}} />
                  <div className="filter-row">
                    {["", "employee", "employer"].map(f => (
                      <button key={f} className={`filter-btn${userFilter === f ? " on" : ""}`}
                        onClick={() => setUserFilter(f)}>{f || "All"}</button>
                    ))}
                    <button className="filter-btn" onClick={loadUsers} style={{marginLeft:"auto"}}>↻</button>
                  </div>
                  <div style={{maxHeight:"calc(100vh - 260px)",overflowY:"auto"}}>
                    {loading && users.length === 0 && <div className="loading-txt">Loading…</div>}
                    {users.length === 0 && !loading && <div className="empty-state">No users found</div>}
                    {users.map(u => (
                      <div key={u.email}
                        className={`user-row${selUser === u.email ? " selected" : ""}`}
                        onClick={() => { setSelUser(u.email); loadUserDetail(u.email); setMsg({type:"",text:""}); setConfirmDelete(false); }}>
                        <div className={`user-avatar av-${u.role}`}>
                          {u.role === "employer" ? "E" : u.role === "admin" ? "A" : "e"}
                        </div>
                        <div style={{overflow:"hidden"}}>
                          <div className="user-email">{u.email}</div>
                          <div className="user-name">{u.name || u.company_name || "—"}</div>
                        </div>
                        <span className={`user-status-badge status-${u.account_status || "active"}`}>
                          {u.account_status || "active"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  {!selUser && (
                    <div className="detail-panel" style={{textAlign:"center",padding:"3rem",color:"#9ab0b0"}}>
                      <div style={{fontSize:"2rem",opacity:0.3,marginBottom:"0.5rem"}}>⊛</div>
                      <div style={{fontSize:"0.8rem"}}>Select a user to inspect</div>
                    </div>
                  )}
                  {selUser && !userDetail && (
                    <div className="detail-panel"><div className="loading-txt">Loading user detail…</div></div>
                  )}
                  {selUser && userDetail && (
                    <div className="detail-panel">
                      <div className="detail-section">
                        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"1rem"}}>
                          <div>
                            <div style={{fontSize:"0.9rem",fontWeight:700,color:"#1c2b2b",marginBottom:"4px"}}>
                              {userDetail.user.name || userDetail.user.company_name}
                            </div>
                            <div className="mono" style={{fontSize:"0.72rem",color:"#0d6e6e"}}>{userDetail.user.email}</div>
                            <div style={{fontSize:"0.65rem",color:"#7a9494",marginTop:"4px"}}>
                              Role: {userDetail.user.role} · Joined: {toIST(userDetail.user.created_at)}
                            </div>
                            {userDetail.user.company_name && (
                              <div style={{fontSize:"0.65rem",color:"#7a9494",marginTop:"2px"}}>Company: {userDetail.user.company_name}</div>
                            )}
                          </div>
                          <span className={`user-status-badge status-${accountStatus}`} style={{fontSize:"0.65rem",padding:"3px 10px"}}>
                            {accountStatus}
                          </span>
                        </div>
                        <div className="action-row">
                          {accountStatus !== "suspended" && accountStatus !== "blocked" && (
                            <button className="action-btn btn-suspend" onClick={() => doAccountAction("suspend")}>Suspend</button>
                          )}
                          {accountStatus === "suspended" && (
                            <button className="action-btn btn-unblock" onClick={() => doAccountAction("unsuspend")}>Unsuspend</button>
                          )}
                          {accountStatus !== "blocked" && (
                            <button className="action-btn btn-block" onClick={() => doAccountAction("block")}>Block</button>
                          )}
                          {accountStatus === "blocked" && (
                            <button className="action-btn btn-unblock" onClick={() => doAccountAction("unblock")}>Unblock</button>
                          )}
                          <button className="action-btn btn-note" onClick={() => setNoteModal(true)}>+ Note</button>
                          {!confirmDelete
                            ? <button className="action-btn btn-delete" onClick={() => setConfirmDelete(true)}>Delete Account</button>
                            : <button className="action-btn btn-delete" style={{borderColor:"#ef4444",background:"rgba(239,68,68,0.2)"}}
                                onClick={() => doAccountAction("delete")}>⚠ Confirm Delete</button>
                          }
                        </div>
                      </div>
                      {(userDetail.user.admin_notes || []).length > 0 && (
                        <div className="detail-section">
                          <div className="detail-label">Admin Notes</div>
                          {userDetail.user.admin_notes.map((n, i) => (
                            <div key={i} style={{background:"#f2efe9",borderRadius:"6px",padding:"0.5rem 0.75rem",marginBottom:"0.4rem"}}>
                              <div style={{fontSize:"0.6rem",color:"#0d6e6e",marginBottom:"2px"}}>{n.by} · {toIST(n.at)}</div>
                              <div style={{fontSize:"0.75rem",color:"#4a6060"}}>{n.text}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      {userDetail.consents?.length > 0 && (
                        <div className="detail-section">
                          <div className="detail-label">Consents ({userDetail.consents.length})</div>
                          {userDetail.consents.slice(0, 5).map((c, i) => (
                            <div key={i} style={{fontSize:"0.7rem",color:"#7a9494",marginBottom:"4px",display:"flex",gap:"0.5rem",alignItems:"center"}}>
                              <span className={`consent-chip chip-${c.status}`}>{c.status}</span>
                              <span className="mono" style={{fontSize:"0.65rem"}}>{c.requestor_email}</span>
                              <span style={{marginLeft:"auto",fontSize:"0.6rem"}}>{toIST(c.created_at)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {userDetail.tickets?.length > 0 && (
                        <div className="detail-section">
                          <div className="detail-label">Support Tickets ({userDetail.tickets.length})</div>
                          {userDetail.tickets.slice(0, 3).map((t, i) => (
                            <div key={i} style={{fontSize:"0.7rem",color:"#7a9494",marginBottom:"4px",cursor:"pointer"}}
                              onClick={() => { setTab("tickets"); setSelTicket(t); }}>
                              <span className={`ticket-cat cat-${t.category}`}>{t.category}</span>
                              {t.subject}
                            </div>
                          ))}
                        </div>
                      )}
                      {userDetail.profile && (
                        <div className="detail-section">
                          <div className="detail-label">Profile</div>
                          <div style={{fontSize:"0.7rem",color:"#7a9494"}}>
                            ID: <span className="mono" style={{color:"#0d6e6e"}}>{userDetail.profile.employee_id}</span>
                            <br/>Status: <span style={{color: userDetail.profile.status === "submitted" ? "#10b981" : "#f59e0b"}}>{userDetail.profile.status || "draft"}</span>
                            <br/>Name: {userDetail.profile.firstName || ""} {userDetail.profile.lastName || ""}
                            <br/>Updated: {toIST(userDetail.profile.updated_at)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── TICKETS ── */}
          {tab === "tickets" && (
            <>
              <div className="page-head">
                <div className="page-title">Support Tickets</div>
                <div className="page-sub">Reply to employee and employer issues</div>
              </div>
              {msg.text && <div className={msg.type === "ok" ? "ok-box" : "err-box"}>{msg.text}</div>}
              <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:"1rem"}}>
                <div>
                  <div className="filter-row">
                    {["", "open", "in_progress", "resolved"].map(f => (
                      <button key={f} className={`filter-btn${ticketFilter === f ? " on" : ""}`}
                        onClick={() => setTicketFilter(f)}>{f || "All"}</button>
                    ))}
                  </div>
                  <div style={{maxHeight:"calc(100vh - 240px)",overflowY:"auto"}}>
                    {loading && tickets.length === 0 && <div className="loading-txt">Loading…</div>}
                    {tickets.length === 0 && !loading && <div className="empty-state">No tickets</div>}
                    {tickets.map(t => (
                      <div key={t.ticket_id}
                        className={`ticket-row${selTicket?.ticket_id === t.ticket_id ? " selected" : ""}`}
                        onClick={() => { setSelTicket(t); setReplyBody(""); setReplyStatus(""); setMsg({type:"",text:""}); }}>
                        <div style={{display:"flex",alignItems:"center",gap:"0.4rem",marginBottom:"3px"}}>
                          <span className={`ticket-cat cat-${t.category}`}>{t.category}</span>
                          <span className={`tick-status ts-${t.status}`}>{t.status?.replace("_"," ")}</span>
                        </div>
                        <div className="ticket-subject">{t.subject}</div>
                        <div className="ticket-meta">{t.user_email} · {toIST(t.created_at)}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  {!selTicket && (
                    <div className="panel" style={{textAlign:"center",padding:"3rem",color:"#9ab0b0"}}>
                      <div style={{fontSize:"2rem",opacity:0.3,marginBottom:"0.5rem"}}>⊡</div>
                      <div style={{fontSize:"0.8rem"}}>Select a ticket to reply</div>
                    </div>
                  )}
                  {selTicket && (
                    <div className="detail-panel">
                      <div className="detail-section">
                        <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.75rem"}}>
                          <span className={`ticket-cat cat-${selTicket.category}`}>{selTicket.category}</span>
                          <span className={`tick-status ts-${selTicket.status}`}>{selTicket.status?.replace("_"," ")}</span>
                          <span style={{fontSize:"0.62rem",color:"#7a9494",marginLeft:"auto",fontFamily:"'IBM Plex Mono',monospace"}}>{toIST(selTicket.created_at)}</span>
                        </div>
                        <div style={{fontSize:"0.88rem",fontWeight:700,color:"#1c2b2b",marginBottom:"0.5rem"}}>{selTicket.subject}</div>
                        <div style={{fontSize:"0.65rem",color:"#7a9494",marginBottom:"0.75rem"}}>
                          From: <span className="mono" style={{color:"#0d6e6e"}}>{selTicket.user_email}</span> ({selTicket.user_role})
                        </div>
                        <div className="tick-user-msg">
                          <div className="tick-user-by">{selTicket.user_name || selTicket.user_email}</div>
                          <div style={{fontSize:"0.82rem",color:"#4a6060",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{selTicket.body}</div>
                        </div>
                        {(selTicket.replies || []).map((r, i) => (
                          <div key={i} className={r.by === "admin" ? "tick-reply" : "tick-user-msg"}>
                            <div className={r.by === "admin" ? "tick-reply-by" : "tick-user-by"}>
                              {r.by === "admin" ? "Datagate Support" : selTicket.user_name}
                            </div>
                            <div className="tick-reply-body">{r.body}</div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className="detail-label">Reply</div>
                        <textarea className="reply-box" placeholder="Type your reply to the user…"
                          value={replyBody} onChange={e => setReplyBody(e.target.value)} />
                        <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginTop:"0.5rem",flexWrap:"wrap"}}>
                          <span style={{fontSize:"0.65rem",color:"#7a9494"}}>Update status:</span>
                          {["open","in_progress","resolved"].map(s => (
                            <button key={s} className={`filter-btn${replyStatus === s ? " on" : ""}`}
                              onClick={() => setReplyStatus(replyStatus === s ? "" : s)}>
                              {s.replace("_"," ")}
                            </button>
                          ))}
                          <button className="reply-send-btn" style={{marginLeft:"auto"}}
                            onClick={doTicketReply} disabled={!replyBody.trim()}>
                            Send Reply ↗
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── BGV VENDORS ── */}
          {tab === "bgv" && (
            <>
              <div className="page-head">
                <div className="page-title">BGV Vendors</div>
                <div className="page-sub">Approve or reject BGV vendor registrations</div>
              </div>
              {bgvMsg.text && (
                <div className={bgvMsg.type === "ok" ? "ok-box" : "err-box"} style={{marginBottom:"1rem"}}>
                  {bgvMsg.text}
                </div>
              )}
              {bgvLoading && <div className="loading-txt">Loading vendors…</div>}
              {!bgvLoading && bgvVendors.length === 0 && (
                <div className="empty-state">No BGV vendors registered yet.</div>
              )}
              {!bgvLoading && bgvVendors.length > 0 && (
                <>
                  {/* Pending approval */}
                  {bgvVendors.filter(v => !v.bgv_approved).length > 0 && (
                    <div className="panel" style={{marginBottom:"1rem"}}>
                      <div className="panel-head">
                        <span className="panel-title">⏳ Pending Approval ({bgvVendors.filter(v => !v.bgv_approved).length})</span>
                      </div>
                      <div style={{padding:"0.5rem"}}>
                        {bgvVendors.filter(v => !v.bgv_approved).map(v => (
                          <div key={v.email} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.75rem 0.6rem",borderBottom:"1px solid var(--bg2)"}}>
                            <div>
                              <div style={{fontSize:"0.82rem",fontWeight:700,color:"var(--text)"}}>{v.name || v.email}</div>
                              <div style={{fontSize:"0.7rem",color:"var(--text3)",fontFamily:"var(--mono)",marginTop:"2px"}}>{v.email}</div>
                              {v.company_name && <div style={{fontSize:"0.7rem",color:"var(--text2)",marginTop:"2px"}}>🏢 {v.company_name}</div>}
                              {v.phone && <div style={{fontSize:"0.7rem",color:"var(--text3)",marginTop:"2px"}}>📞 {v.phone}</div>}
                              <div style={{fontSize:"0.65rem",color:"var(--text3)",marginTop:"3px",fontFamily:"var(--mono)"}}>
                                Registered: {v.created_at ? new Date(v.created_at).toLocaleString("en-IN",{timeZone:"Asia/Kolkata",day:"2-digit",month:"short",year:"numeric"}) : "—"}
                              </div>
                            </div>
                            <div style={{display:"flex",gap:"0.5rem",flexShrink:0}}>
                              <button
                                onClick={() => approveBgv(v.email)}
                                style={{padding:"0.4rem 1rem",background:"#16a34a",color:"#fff",border:"none",borderRadius:7,fontSize:"0.72rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                                ✓ Approve
                              </button>
                              <button
                                onClick={() => rejectBgv(v.email)}
                                style={{padding:"0.4rem 1rem",background:"#fff5f5",color:"#dc2626",border:"1.5px solid #fecaca",borderRadius:7,fontSize:"0.72rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                                ✗ Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Approved vendors */}
                  {bgvVendors.filter(v => v.bgv_approved).length > 0 && (
                    <div className="panel">
                      <div className="panel-head">
                        <span className="panel-title">✅ Approved Vendors ({bgvVendors.filter(v => v.bgv_approved).length})</span>
                      </div>
                      <div style={{padding:"0.5rem"}}>
                        {bgvVendors.filter(v => v.bgv_approved).map(v => (
                          <div key={v.email} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.75rem 0.6rem",borderBottom:"1px solid var(--bg2)"}}>
                            <div>
                              <div style={{fontSize:"0.82rem",fontWeight:700,color:"var(--text)"}}>{v.name || v.email}</div>
                              <div style={{fontSize:"0.7rem",color:"var(--text3)",fontFamily:"var(--mono)",marginTop:"2px"}}>{v.email}</div>
                              {v.company_name && <div style={{fontSize:"0.7rem",color:"var(--text2)",marginTop:"2px"}}>🏢 {v.company_name}</div>}
                              {v.bgv_approved_at && (
                                <div style={{fontSize:"0.65rem",color:"#16a34a",marginTop:"3px",fontFamily:"var(--mono)"}}>
                                  Approved: {new Date(v.bgv_approved_at).toLocaleString("en-IN",{timeZone:"Asia/Kolkata",day:"2-digit",month:"short",year:"numeric"})}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => rejectBgv(v.email)}
                              style={{padding:"0.35rem 0.85rem",background:"#fff5f5",color:"#dc2626",border:"1.5px solid #fecaca",borderRadius:7,fontSize:"0.7rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>
                              Revoke access
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

        </main>
      </div>

      {/* ── Note modal ── */}
      {noteModal && (
        <div className="modal-overlay" onClick={() => setNoteModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Add admin note to {selUser}</div>
            <textarea className="modal-input" placeholder="Note visible only to admins…"
              value={noteText} onChange={e => setNoteText(e.target.value)} autoFocus />
            <div className="modal-row">
              <button className="modal-cancel" onClick={() => setNoteModal(false)}>Cancel</button>
              <button className="modal-save" onClick={doAddNote}>Save Note</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
