// pages/consent.js
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

export default function ConsentPage() {
  const router = useRouter();
  const { token, user } = useAuth();

  const [tab,      setTab]      = useState("PENDING");
  const [consents, setConsents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [acting,   setActing]   = useState(null); // consent_id currently processing
  const [toast,    setToast]    = useState(null); // { msg, type: "success"|"error" }

  const isEmployee = user?.role === "employee";

  // ── Load all consents ────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/consent/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const data = await res.json();
      setConsents(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  // ── Show toast helper ────────────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Respond to consent (employee only) ──────────────────────────────────────
  const respond = async (consentId, status) => {
    setActing(consentId);
    setError("");
    try {
      const res = await fetch(`${API}/consent/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ consent_id: consentId, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || `Error ${res.status}`);

      // Refresh list then auto-switch to the right tab so user sees the moved item
      await load();
      setTab(status); // APPROVED or DECLINED
      showToast(
        status === "APPROVED"
          ? "✅ Access approved — employer can now view your profile."
          : "❌ Access declined — employer has been notified.",
        "success"
      );
    } catch (e) {
      setError(e.message);
      showToast(e.message, "error");
    } finally {
      setActing(null);
    }
  };

  const filtered     = consents.filter(c => c.status === tab);
  const pendingCount = consents.filter(c => c.status === "PENDING").length;

  const fmt = (ts) => ts
    ? new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <div style={s.page}>

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: "fixed", top: "1.5rem", left: "50%", transform: "translateX(-50%)",
          background: toast.type === "error" ? "#fef2f2" : "#f0fdf4",
          border: `1px solid ${toast.type === "error" ? "#fecaca" : "#bbf7d0"}`,
          color: toast.type === "error" ? "#dc2626" : "#16a34a",
          padding: "0.75rem 1.5rem", borderRadius: "10px", fontWeight: 600,
          fontSize: "0.9rem", zIndex: 1000, boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          maxWidth: "90vw", textAlign: "center",
        }}>
          {toast.msg}
        </div>
      )}

      <div style={s.card}>

        <div style={s.header}>
          <h1 style={s.title}>🔒 Consent Center</h1>
          <button style={s.backBtn} onClick={() => router.back()}>← Back</button>
        </div>

        {/* Role info banner — only for employers browsing this page */}
        {!isEmployee && (
          <div style={{ background: "#fef3c7", borderBottom: "1px solid #fde68a", padding: "0.75rem 2rem", fontSize: "0.85rem", color: "#92400e" }}>
            ⚠️ Only employees can approve or decline consent requests. This view is read-only for employers.
          </div>
        )}

        {/* Tabs */}
        <div style={s.tabs}>
          {["PENDING", "APPROVED", "DECLINED"].map(t => (
            <button key={t} style={s.tab(tab === t)} onClick={() => setTab(t)}>
              {t.charAt(0) + t.slice(1).toLowerCase()}
              {t === "PENDING" && pendingCount > 0 && (
                <span style={{ marginLeft: "0.4rem", background: "#ef4444", color: "#fff", borderRadius: "10px", padding: "0.1rem 0.45rem", fontSize: "0.72rem" }}>
                  {pendingCount}
                </span>
              )}
              {/* Count badges for other tabs */}
              {t !== "PENDING" && consents.filter(c => c.status === t).length > 0 && (
                <span style={{ marginLeft: "0.4rem", background: t === "APPROVED" ? "#16a34a" : "#64748b", color: "#fff", borderRadius: "10px", padding: "0.1rem 0.45rem", fontSize: "0.72rem" }}>
                  {consents.filter(c => c.status === t).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={s.body}>
          {error && <div style={s.error}>⚠️ {error}</div>}

          {loading ? (
            <div style={s.spinner}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={s.empty}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
                {tab === "PENDING" ? "📭" : tab === "APPROVED" ? "✅" : "🚫"}
              </div>
              <p style={{ color: "#94a3b8", margin: 0 }}>
                No {tab.toLowerCase()} requests
              </p>
            </div>
          ) : (
            filtered.map(c => (
              <div key={c.consent_id} style={s.item}>
                <div style={s.itemTop}>
                  <div>
                    <p style={s.company}>{c.requestor_name || c.requestor_email}</p>
                    <p style={s.meta}>{c.requestor_email}</p>
                    <p style={s.meta}>Requested: {fmt(c.requested_at)}</p>
                    {c.responded_at && (
                      <p style={s.meta}>
                        {c.status === "APPROVED" ? "Approved" : "Declined"}: {fmt(c.responded_at)}
                      </p>
                    )}
                  </div>
                  <span style={s.badge(c.status)}>{c.status}</span>
                </div>

                <p style={{ ...s.meta, marginTop: "0.6rem" }}>
                  <strong>Requesting access to:</strong> Personal details, Education, Employment history, UAN & PF records
                </p>

                {/* Action buttons — only for employees on PENDING items */}
                {isEmployee && c.status === "PENDING" && (
                  <div style={s.actions}>
                    <button
                      style={{ ...s.approveBtn, opacity: acting === c.consent_id ? 0.7 : 1 }}
                      disabled={!!acting}
                      onClick={() => respond(c.consent_id, "APPROVED")}
                    >
                      {acting === c.consent_id ? "Processing…" : "✓ Approve"}
                    </button>
                    <button
                      style={{ ...s.declineBtn, opacity: acting === c.consent_id ? 0.7 : 1 }}
                      disabled={!!acting}
                      onClick={() => respond(c.consent_id, "DECLINED")}
                    >
                      {acting === c.consent_id ? "Processing…" : "✗ Decline"}
                    </button>
                  </div>
                )}

                {/* Status info for non-pending items */}
                {c.status === "APPROVED" && isEmployee && (
                  <p style={{ fontSize: "0.82rem", color: "#16a34a", marginTop: "0.75rem", fontWeight: 600 }}>
                    ✅ You approved this request. The employer can view your profile snapshot.
                  </p>
                )}
                {c.status === "DECLINED" && isEmployee && (
                  <p style={{ fontSize: "0.82rem", color: "#94a3b8", marginTop: "0.75rem" }}>
                    🚫 You declined this request. The employer cannot access your data.
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page:       { background: "#f1f5f9", minHeight: "100vh", padding: "2rem", fontFamily: "Inter, system-ui, sans-serif" },
  card:       { maxWidth: "780px", margin: "auto", background: "#fff", borderRadius: "14px", boxShadow: "0 12px 30px rgba(0,0,0,0.08)", overflow: "hidden" },
  header:     { padding: "1.5rem 2rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" },
  title:      { fontSize: "1.4rem", fontWeight: 700, color: "#1e293b", margin: 0 },
  backBtn:    { background: "none", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "0.4rem 1rem", cursor: "pointer", color: "#475569" },
  tabs:       { display: "flex", borderBottom: "1px solid #e2e8f0" },
  tab:        (active) => ({
    padding: "0.85rem 1.5rem", cursor: "pointer", fontWeight: active ? 700 : 400,
    color: active ? "#2563eb" : "#64748b",
    borderBottom: active ? "2px solid #2563eb" : "2px solid transparent",
    background: "none", border: "none", fontSize: "0.95rem",
  }),
  body:       { padding: "1.5rem 2rem" },
  empty:      { textAlign: "center", padding: "3rem", color: "#94a3b8" },
  spinner:    { textAlign: "center", padding: "3rem", color: "#94a3b8" },
  error:      { background: "#fee2e2", color: "#dc2626", padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.9rem" },
  item:       { border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.25rem 1.5rem", marginBottom: "1rem" },
  itemTop:    { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  company:    { fontSize: "1.05rem", fontWeight: 700, color: "#1e293b", margin: "0 0 0.25rem 0" },
  meta:       { fontSize: "0.82rem", color: "#64748b", margin: "0.1rem 0" },
  badge:      (st) => ({
    padding: "0.25rem 0.75rem", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 600, whiteSpace: "nowrap",
    background: st === "APPROVED" ? "#dcfce7" : st === "DECLINED" ? "#fee2e2" : "#fef9c3",
    color:      st === "APPROVED" ? "#16a34a" : st === "DECLINED" ? "#dc2626"  : "#ca8a04",
  }),
  actions:    { display: "flex", gap: "0.75rem", marginTop: "1rem" },
  approveBtn: { background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", padding: "0.5rem 1.25rem", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" },
  declineBtn: { background: "#fff", color: "#dc2626", border: "1px solid #dc2626", borderRadius: "8px", padding: "0.5rem 1.25rem", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" },
};
