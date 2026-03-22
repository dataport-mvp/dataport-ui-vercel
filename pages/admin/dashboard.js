// pages/admin/dashboard.js
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const G = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0a0f; font-family: 'IBM Plex Sans', sans-serif; color: #e2e8f0; }

  .shell { display: flex; min-height: 100vh; }

  /* ── Sidebar ── */
  .side { width: 220px; min-width: 220px; background: #0f0e1a; border-right: 1px solid #1e1b2e;
    display: flex; flex-direction: column; padding: 1.5rem 0; position: sticky; top: 0; height: 100vh; }
  .side-logo { padding: 0 1.25rem 1.5rem; border-bottom: 1px solid #1e1b2e; margin-bottom: 1rem; }
  .side-logo-title { font-family: 'IBM Plex Mono', monospace; font-size: 0.85rem; font-weight: 600;
    color: #a78bfa; letter-spacing: 0.5px; }
  .side-logo-sub { font-size: 0.6rem; color: #4b5563; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 2px; }
  .side-nav { flex: 1; padding: 0 0.75rem; display: flex; flex-direction: column; gap: 2px; }
  .nav-btn { display: flex; align-items: center; gap: 0.6rem; padding: 0.55rem 0.75rem; border-radius: 7px;
    border: none; background: transparent; color: #6b7280; font-family: inherit; font-size: 0.78rem;
    font-weight: 500; cursor: pointer; transition: all 0.12s; text-align: left; width: 100%; }
  .nav-btn:hover { background: #1a1730; color: #c4b5fd; }
  .nav-btn.active { background: #1a1730; color: #a78bfa; }
  .nav-btn .icon { font-size: 0.9rem; width: 18px; text-align: center; }
  .nav-badge { margin-left: auto; background: #7c3aed; color: #fff; font-size: 0.55rem;
    font-weight: 700; padding: 1px 6px; border-radius: 999px; }
  .side-bottom { padding: 1rem 1.25rem 0; border-top: 1px solid #1e1b2e; margin-top: auto; }
  .admin-tag { font-size: 0.6rem; color: #4b5563; text-transform: uppercase; letter-spacing: 1px; }
  .admin-email { font-size: 0.7rem; color: #7c3aed; margin-top: 2px; font-family: 'IBM Plex Mono', monospace; }
  .signout-btn { margin-top: 0.75rem; width: 100%; padding: 0.45rem; background: transparent;
    border: 1px solid #1e1b2e; border-radius: 6px; color: #4b5563; font-size: 0.7rem;
    cursor: pointer; transition: all 0.12s; font-family: inherit; }
  .signout-btn:hover { border-color: #ef4444; color: #ef4444; }

  /* ── Main ── */
  .main { flex: 1; padding: 2rem; overflow-y: auto; }
  .page-head { margin-bottom: 1.75rem; }
  .page-title { font-size: 1.1rem; font-weight: 700; color: #f1f5f9; }
  .page-sub { font-size: 0.72rem; color: #4b5563; margin-top: 3px;
    font-family: 'IBM Plex Mono', monospace; }

  /* ── Stats strip ── */
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem; margin-bottom: 1.75rem; }
  .stat-card { background: #0f0e1a; border: 1px solid #1e1b2e; border-radius: 10px;
    padding: 1rem 1.1rem; }
  .stat-label { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 1px;
    color: #4b5563; font-weight: 600; margin-bottom: 0.35rem; }
  .stat-value { font-family: 'IBM Plex Mono', monospace; font-size: 1.6rem; font-weight: 600;
    color: #f1f5f9; line-height: 1; }
  .stat-sub { font-size: 0.62rem; color: #6b7280; margin-top: 0.3rem; }
  .stat-card.warn .stat-value { color: #f59e0b; }
  .stat-card.danger .stat-value { color: #ef4444; }
  .stat-card.good .stat-value { color: #10b981; }
  .stat-card.purple .stat-value { color: #a78bfa; }

  /* ── Two-col layout ── */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
  .panel { background: #0f0e1a; border: 1px solid #1e1b2e; border-radius: 10px; overflow: hidden; }
  .panel-head { padding: 0.75rem 1rem; border-bottom: 1px solid #1e1b2e; display: flex;
    align-items: center; justify-content: space-between; }
  .panel-title { font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;
    letter-spacing: 0.8px; }
  .panel-body { padding: 0.5rem; max-height: 320px; overflow-y: auto; }

  /* ── Activity feed ── */
  .activity-item { display: flex; gap: 0.6rem; align-items: flex-start; padding: 0.5rem 0.5rem;
    border-bottom: 1px solid #13121f; }
  .activity-item:last-child { border-bottom: none; }
  .activity-dot { width: 6px; height: 6px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
  .dot-consent { background: #6366f1; }
  .dot-ticket  { background: #f59e0b; }
  .dot-admin   { background: #ef4444; }
  .activity-text { font-size: 0.7rem; color: #94a3b8; line-height: 1.5; }
  .activity-time { font-size: 0.58rem; color: #374151; font-family: 'IBM Plex Mono', monospace; margin-top: 1px; }

  /* ── User search / list ── */
  .search-bar { width: 100%; padding: 0.6rem 0.875rem; background: #13121f; border: 1px solid #1e1b2e;
    border-radius: 7px; font-family: inherit; font-size: 0.8rem; color: #e2e8f0; outline: none;
    transition: border-color 0.15s; }
  .search-bar:focus { border-color: #7c3aed; }
  .search-bar::placeholder { color: #374151; }
  .filter-row { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
  .filter-btn { padding: 0.3rem 0.7rem; border-radius: 5px; border: 1px solid #1e1b2e;
    background: transparent; color: #6b7280; font-family: inherit; font-size: 0.68rem;
    cursor: pointer; transition: all 0.12s; }
  .filter-btn.on { background: #1a1730; border-color: #7c3aed; color: #a78bfa; }
  .user-row { display: flex; align-items: center; gap: 0.6rem; padding: 0.55rem 0.5rem;
    border-radius: 7px; cursor: pointer; transition: background 0.1s; }
  .user-row:hover { background: #13121f; }
  .user-row.selected { background: #1a1730; border: 1px solid #2d1f6e; }
  .user-avatar { width: 28px; height: 28px; border-radius: 7px; display: flex; align-items: center;
    justify-content: center; font-size: 0.7rem; font-weight: 700; flex-shrink: 0; }
  .av-employer { background: #1e1b4b; color: #818cf8; }
  .av-employee { background: #064e3b; color: #6ee7b7; }
  .av-admin    { background: #450a0a; color: #fca5a5; }
  .user-email  { font-size: 0.72rem; color: #94a3b8; font-family: 'IBM Plex Mono', monospace;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
  .user-name   { font-size: 0.68rem; color: #4b5563; }
  .user-status-badge { margin-left: auto; font-size: 0.55rem; font-weight: 700; padding: 1px 7px;
    border-radius: 999px; flex-shrink: 0; text-transform: uppercase; }
  .status-active    { background: #064e3b; color: #6ee7b7; }
  .status-suspended { background: #451a03; color: #fcd34d; }
  .status-blocked   { background: #450a0a; color: #fca5a5; }

  /* ── User detail panel ── */
  .detail-panel { background: #0f0e1a; border: 1px solid #1e1b2e; border-radius: 10px;
    padding: 1.25rem; }
  .detail-section { margin-bottom: 1.25rem; padding-bottom: 1.25rem; border-bottom: 1px solid #13121f; }
  .detail-section:last-child { margin-bottom: 0; border-bottom: none; }
  .detail-label { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 1px;
    color: #4b5563; font-weight: 600; margin-bottom: 0.5rem; }
  .detail-value { font-size: 0.8rem; color: #94a3b8; line-height: 1.6; }
  .mono { font-family: 'IBM Plex Mono', monospace; }
  .action-row { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.75rem; }
  .action-btn { padding: 0.4rem 0.9rem; border-radius: 6px; border: 1px solid; font-family: inherit;
    font-size: 0.7rem; font-weight: 600; cursor: pointer; transition: all 0.12s; }
  .btn-suspend  { border-color: #92400e; color: #fcd34d; background: rgba(245,158,11,0.08); }
  .btn-suspend:hover  { background: rgba(245,158,11,0.15); }
  .btn-block    { border-color: #7f1d1d; color: #fca5a5; background: rgba(239,68,68,0.08); }
  .btn-block:hover    { background: rgba(239,68,68,0.15); }
  .btn-unblock  { border-color: #064e3b; color: #6ee7b7; background: rgba(16,185,129,0.08); }
  .btn-unblock:hover  { background: rgba(16,185,129,0.15); }
  .btn-delete   { border-color: #450a0a; color: #f87171; background: rgba(239,68,68,0.05); }
  .btn-delete:hover   { background: rgba(239,68,68,0.12); }
  .btn-note     { border-color: #1e1b2e; color: #6b7280; background: transparent; }
  .btn-note:hover     { border-color: #7c3aed; color: #a78bfa; }

  /* ── Tickets ── */
  .ticket-row { padding: 0.65rem 0.5rem; border-bottom: 1px solid #13121f; cursor: pointer;
    border-radius: 6px; transition: background 0.1s; }
  .ticket-row:hover { background: #13121f; }
  .ticket-row.selected { background: #1a1730; }
  .ticket-subject { font-size: 0.75rem; color: #c4b5fd; font-weight: 600; }
  .ticket-meta { font-size: 0.62rem; color: #4b5563; margin-top: 2px;
    font-family: 'IBM Plex Mono', monospace; }
  .ticket-cat { display: inline-block; font-size: 0.55rem; font-weight: 700; padding: 1px 6px;
    border-radius: 4px; text-transform: uppercase; margin-right: 4px; }
  .cat-account  { background: #1e1b4b; color: #818cf8; }
  .cat-consent  { background: #064e3b; color: #6ee7b7; }
  .cat-document { background: #1c1917; color: #a8a29e; }
  .cat-bgv      { background: #2d1657; color: #c084fc; }
  .cat-billing  { background: #1c2a1c; color: #86efac; }
  .cat-other    { background: #1a1a1a; color: #9ca3af; }
  .tick-status  { font-size: 0.55rem; font-weight: 700; padding: 1px 7px; border-radius: 999px; }
  .ts-open      { background: #1c2a1c; color: #86efac; }
  .ts-in_progress { background: #1a1730; color: #a78bfa; }
  .ts-resolved  { background: #0c1117; color: #374151; }
  .reply-box { background: #13121f; border: 1px solid #1e1b2e; border-radius: 7px;
    padding: 0.6rem 0.75rem; font-family: inherit; font-size: 0.78rem; color: #e2e8f0;
    outline: none; resize: none; min-height: 80px; width: 100%; margin-top: 0.75rem;
    transition: border-color 0.15s; }
  .reply-box:focus { border-color: #7c3aed; }
  .reply-send-btn { padding: 0.45rem 1.1rem; background: #7c3aed; color: #fff; border: none;
    border-radius: 6px; font-family: inherit; font-size: 0.75rem; font-weight: 600;
    cursor: pointer; margin-top: 0.5rem; transition: background 0.12s; }
  .reply-send-btn:hover:not(:disabled) { background: #6d28d9; }
  .reply-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .tick-reply { background: #13121f; border-radius: 6px; padding: 0.6rem 0.75rem;
    margin-bottom: 0.5rem; }
  .tick-reply-by { font-size: 0.6rem; color: #7c3aed; font-weight: 700; margin-bottom: 3px; }
  .tick-reply-body { font-size: 0.78rem; color: #94a3b8; line-height: 1.55; }
  .tick-user-msg { background: #0a1628; border: 1px solid #1e2d47; border-radius: 6px;
    padding: 0.6rem 0.75rem; margin-bottom: 0.5rem; }
  .tick-user-by { font-size: 0.6rem; color: #38bdf8; font-weight: 700; margin-bottom: 3px; }

  /* ── Note modal ── */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 100;
    display: flex; align-items: center; justify-content: center; }
  .modal-box { background: #0f0e1a; border: 1px solid #2d1f6e; border-radius: 12px;
    padding: 1.5rem; width: 420px; max-width: 95vw; }
  .modal-title { font-size: 0.85rem; font-weight: 700; color: #f1f5f9; margin-bottom: 1rem; }
  .modal-input { width: 100%; padding: 0.6rem 0.75rem; background: #13121f; border: 1px solid #1e1b2e;
    border-radius: 7px; font-family: inherit; font-size: 0.82rem; color: #e2e8f0; outline: none;
    resize: none; min-height: 80px; }
  .modal-input:focus { border-color: #7c3aed; }
  .modal-row { display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 0.75rem; }
  .modal-cancel { padding: 0.4rem 0.9rem; background: transparent; border: 1px solid #1e1b2e;
    border-radius: 6px; color: #6b7280; font-family: inherit; font-size: 0.75rem; cursor: pointer; }
  .modal-save { padding: 0.4rem 0.9rem; background: #7c3aed; border: none; border-radius: 6px;
    color: #fff; font-family: inherit; font-size: 0.75rem; cursor: pointer; }

  /* ── Misc ── */
  .empty-state { padding: 2rem; text-align: center; color: #374151; font-size: 0.75rem; }
  .loading-txt { color: #374151; font-size: 0.72rem; padding: 1rem; font-family: 'IBM Plex Mono', monospace; }
  .err-box { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2);
    border-radius: 7px; padding: 0.5rem 0.75rem; font-size: 0.72rem; color: #fca5a5; margin-bottom: 0.75rem; }
  .ok-box  { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2);
    border-radius: 7px; padding: 0.5rem 0.75rem; font-size: 0.72rem; color: #6ee7b7; margin-bottom: 0.75rem; }
  .consent-chip { display: inline-block; font-size: 0.6rem; font-weight: 700; padding: 1px 7px;
    border-radius: 999px; margin-right: 4px; }
  .chip-APPROVED  { background: #064e3b; color: #6ee7b7; }
  .chip-PENDING   { background: #1e1b4b; color: #818cf8; }
  .chip-REVOKED   { background: #450a0a; color: #fca5a5; }
  .chip-DECLINED  { background: #1c1917; color: #a8a29e; }

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
  const router = useRouter();
  const { user, ready, logout } = useAuth();

  const [tab, setTab]               = useState("overview");
  const [stats, setStats]           = useState(null);
  const [activity, setActivity]     = useState([]);
  const [users, setUsers]           = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState(""); // "" | "employee" | "employer"
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

  useEffect(() => {
    if (ready && (!user || user.role !== "admin")) {
      router.replace("/");
    }
  }, [ready, user, router]);

  const apiFetch = useCallback(async (url, opts = {}) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    return fetch(url, {
      ...opts,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(opts.headers || {}) },
    });
  }, []);

  // Load stats + activity
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

  useEffect(() => {
    if (!ready || !user || user.role !== "admin") return;
    if (tab === "overview") loadOverview();
    if (tab === "users")    loadUsers();
    if (tab === "tickets")  loadTickets();
  }, [tab, ready, user, loadOverview, loadUsers, loadTickets]);

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

  const doAddNote = async () => {
    if (!noteText.trim()) return;
    try {
      const r = await apiFetch(`${API}/admin/note`, {
        method: "POST",
        body: JSON.stringify({ email: selUser, note: noteText }),
      });
      if (r.ok) {
        setMsg({ type: "ok", text: "Note added" });
        setNoteModal(false); setNoteText("");
        loadUserDetail(selUser);
      }
    } catch (_) {}
  };

  const doTicketReply = async () => {
    if (!replyBody.trim() || !selTicket) return;
    try {
      const r = await apiFetch(`${API}/admin/tickets/reply`, {
        method: "POST",
        body: JSON.stringify({ ticket_id: selTicket.ticket_id, body: replyBody, status: replyStatus }),
      });
      if (r.ok) {
        setReplyBody(""); setReplyStatus("");
        setMsg({ type: "ok", text: "Reply sent" });
        loadTickets();
        // Refresh selected ticket
        const fresh = tickets.find(t => t.ticket_id === selTicket.ticket_id);
        if (fresh) {
          const replies = [...(fresh.replies || []), { by: "admin", body: replyBody, at: Date.now() }];
          setSelTicket({ ...fresh, replies, status: replyStatus || fresh.status });
        }
      }
    } catch (_) {}
  };

  if (!ready || !user) return null;
  if (user.role !== "admin") return null;

  const accountStatus = userDetail?.user?.account_status || "active";

  return (
    <>
      <style>{G}</style>
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
            <div className="admin-email">{user.email}</div>
            <button className="signout-btn" onClick={() => { logout(); router.replace("/"); }}>
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
                    <button onClick={loadOverview} style={{fontSize:"0.65rem",color:"#4b5563",background:"none",border:"none",cursor:"pointer"}}>↻ refresh</button>
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
                      { label: "Declined",  val: stats.consents.declined,  col: "#6b7280" },
                    ].map(row => {
                      const total = stats.consents.total || 1;
                      const pct = Math.round((row.val / total) * 100);
                      return (
                        <div key={row.label} style={{marginBottom:"0.75rem"}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                            <span style={{fontSize:"0.68rem",color:"#6b7280"}}>{row.label}</span>
                            <span style={{fontSize:"0.68rem",color:row.col,fontFamily:"'IBM Plex Mono',monospace"}}>{row.val} ({pct}%)</span>
                          </div>
                          <div style={{height:"4px",background:"#13121f",borderRadius:"2px"}}>
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
                {/* User list */}
                <div>
                  <input className="search-bar" placeholder="Search email or name…"
                    value={userSearch} onChange={e => setUserSearch(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && loadUsers()}
                    style={{marginBottom:"0.5rem"}} />
                  <div className="filter-row">
                    {["", "employee", "employer"].map(f => (
                      <button key={f} className={`filter-btn${userFilter === f ? " on" : ""}`}
                        onClick={() => setUserFilter(f)}>
                        {f || "All"}
                      </button>
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

                {/* User detail */}
                <div>
                  {!selUser && (
                    <div className="detail-panel" style={{textAlign:"center",padding:"3rem",color:"#374151"}}>
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
                            <div style={{fontSize:"0.9rem",fontWeight:700,color:"#f1f5f9",marginBottom:"4px"}}>
                              {userDetail.user.name || userDetail.user.company_name}
                            </div>
                            <div className="mono" style={{fontSize:"0.72rem",color:"#7c3aed"}}>{userDetail.user.email}</div>
                            <div style={{fontSize:"0.65rem",color:"#4b5563",marginTop:"4px"}}>
                              Role: {userDetail.user.role} · Joined: {toIST(userDetail.user.created_at)}
                            </div>
                            {userDetail.user.company_name && (
                              <div style={{fontSize:"0.65rem",color:"#4b5563",marginTop:"2px"}}>Company: {userDetail.user.company_name}</div>
                            )}
                          </div>
                          <span className={`user-status-badge status-${accountStatus}`} style={{fontSize:"0.65rem",padding:"3px 10px"}}>
                            {accountStatus}
                          </span>
                        </div>

                        {/* Actions */}
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

                      {/* Admin notes */}
                      {(userDetail.user.admin_notes || []).length > 0 && (
                        <div className="detail-section">
                          <div className="detail-label">Admin Notes</div>
                          {userDetail.user.admin_notes.map((n, i) => (
                            <div key={i} style={{background:"#13121f",borderRadius:"6px",padding:"0.5rem 0.75rem",marginBottom:"0.4rem"}}>
                              <div style={{fontSize:"0.6rem",color:"#7c3aed",marginBottom:"2px"}}>{n.by} · {toIST(n.at)}</div>
                              <div style={{fontSize:"0.75rem",color:"#94a3b8"}}>{n.text}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Consents */}
                      {userDetail.consents?.length > 0 && (
                        <div className="detail-section">
                          <div className="detail-label">Consents ({userDetail.consents.length})</div>
                          {userDetail.consents.slice(0, 5).map((c, i) => (
                            <div key={i} style={{fontSize:"0.7rem",color:"#6b7280",marginBottom:"4px",display:"flex",gap:"0.5rem",alignItems:"center"}}>
                              <span className={`consent-chip chip-${c.status}`}>{c.status}</span>
                              <span className="mono" style={{fontSize:"0.65rem"}}>{c.requestor_email}</span>
                              <span style={{marginLeft:"auto",fontSize:"0.6rem"}}>{toIST(c.created_at)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tickets */}
                      {userDetail.tickets?.length > 0 && (
                        <div className="detail-section">
                          <div className="detail-label">Support Tickets ({userDetail.tickets.length})</div>
                          {userDetail.tickets.slice(0, 3).map((t, i) => (
                            <div key={i} style={{fontSize:"0.7rem",color:"#6b7280",marginBottom:"4px",cursor:"pointer"}}
                              onClick={() => { setTab("tickets"); setSelTicket(t); }}>
                              <span className={`ticket-cat cat-${t.category}`}>{t.category}</span>
                              {t.subject}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Profile completeness if employee */}
                      {userDetail.profile && (
                        <div className="detail-section">
                          <div className="detail-label">Profile</div>
                          <div style={{fontSize:"0.7rem",color:"#6b7280"}}>
                            ID: <span className="mono" style={{color:"#7c3aed"}}>{userDetail.profile.employee_id}</span>
                            <br/>Status: <span style={{color: userDetail.profile.status === "submitted" ? "#10b981" : "#f59e0b"}}>{userDetail.profile.status || "draft"}</span>
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
                {/* Ticket list */}
                <div>
                  <div className="filter-row">
                    {["", "open", "in_progress", "resolved"].map(f => (
                      <button key={f} className={`filter-btn${ticketFilter === f ? " on" : ""}`}
                        onClick={() => setTicketFilter(f)}>
                        {f || "All"}
                      </button>
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

                {/* Ticket detail */}
                <div>
                  {!selTicket && (
                    <div className="panel" style={{textAlign:"center",padding:"3rem",color:"#374151"}}>
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
                          <span style={{fontSize:"0.62rem",color:"#4b5563",marginLeft:"auto",fontFamily:"'IBM Plex Mono',monospace"}}>{toIST(selTicket.created_at)}</span>
                        </div>
                        <div style={{fontSize:"0.88rem",fontWeight:700,color:"#f1f5f9",marginBottom:"0.5rem"}}>{selTicket.subject}</div>
                        <div style={{fontSize:"0.65rem",color:"#4b5563",marginBottom:"0.75rem"}}>
                          From: <span className="mono" style={{color:"#7c3aed"}}>{selTicket.user_email}</span> ({selTicket.user_role})
                        </div>

                        {/* Original message */}
                        <div className="tick-user-msg">
                          <div className="tick-user-by">{selTicket.user_name || selTicket.user_email}</div>
                          <div style={{fontSize:"0.82rem",color:"#94a3b8",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{selTicket.body}</div>
                        </div>

                        {/* Replies */}
                        {(selTicket.replies || []).map((r, i) => (
                          <div key={i} className={r.by === "admin" ? "tick-reply" : "tick-user-msg"}>
                            <div className={r.by === "admin" ? "tick-reply-by" : "tick-user-by"}>
                              {r.by === "admin" ? "Datagate Support" : selTicket.user_name}
                            </div>
                            <div className="tick-reply-body">{r.body}</div>
                          </div>
                        ))}
                      </div>

                      {/* Reply composer */}
                      <div>
                        <div className="detail-label">Reply</div>
                        <textarea className="reply-box" placeholder="Type your reply to the user…"
                          value={replyBody} onChange={e => setReplyBody(e.target.value)} />
                        <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginTop:"0.5rem",flexWrap:"wrap"}}>
                          <span style={{fontSize:"0.65rem",color:"#4b5563"}}>Update status:</span>
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
