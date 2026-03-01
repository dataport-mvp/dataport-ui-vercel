// pages/consent.js
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const styles = {
  page:    { background: "#f1f5f9", minHeight: "100vh", padding: "2rem", fontFamily: "Inter, system-ui, sans-serif" },
  card:    { maxWidth: "780px", margin: "auto", background: "#fff", borderRadius: "14px", boxShadow: "0 12px 30px rgba(0,0,0,0.08)", overflow: "hidden" },
  header:  { padding: "1.5rem 2rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" },
  title:   { fontSize: "1.4rem", fontWeight: 700, color: "#1e293b", margin: 0 },
  backBtn: { background: "none", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "0.4rem 1rem", cursor: "pointer", color: "#475569" },
  tabs:    { display: "flex", borderBottom: "1px solid #e2e8f0" },
  tab:     (active) => ({
    padding: "0.85rem 1.5rem", cursor: "pointer", fontWeight: active ? 700 : 400,
    color: active ? "#2563eb" : "#64748b", borderBottom: active ? "2px solid #2563eb" : "2px solid transparent",
    background: "none", border: "none", fontSize: "0.95rem",
  }),
  body:    { padding: "1.5rem 2rem" },
  empty:   { textAlign: "center", padding: "3rem", color: "#94a3b8" },
  item:    { border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.25rem 1.5rem", marginBottom: "1rem" },
  itemTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  company: { fontSize: "1.05rem", fontWeight: 700, color: "#1e293b", margin: "0 0 0.25rem 0" },
  meta:    { fontSize: "0.82rem", color: "#64748b", margin: "0.1rem 0" },
  badge:   (s) => ({
    padding: "0.25rem 0.75rem", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 600, whiteSpace: "nowrap",
    background: s === "APPROVED" ? "#dcfce7" : s === "DECLINED" ? "#fee2e2" : "#fef9c3",
    color:      s === "APPROVED" ? "#16a34a" : s === "DECLINED" ? "#dc2626" : "#ca8a04",
  }),
  actions:    { display: "flex", gap: "0.75rem", marginTop: "1rem" },
  approveBtn: { background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", padding: "0.5rem 1.25rem", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" },
  declineBtn: { background: "#fff", color: "#dc2626", border: "1px solid #dc2626", borderRadius: "8px", padding: "0.5rem 1.25rem", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" },
  error:      { background: "#fee2e2", color: "#dc2626", padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem" },
  spinner:    { textAlign: "center", padding: "3rem", color: "#94a3b8" },
};

export default function ConsentPage() {
  const router  = useRouter();
  const { token } = useAuth();
  const [tab, setTab]         = useState("PENDING");
  const [consents, setConsents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [acting, setActing]     = useState(null);

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

  const respond = async (consentId, status) => {
    setActing(consentId);
    setError("");
    try {
      const res = await fetch(`${API}/consent/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ consent_id: consentId, status }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.detail || `Error ${res.status}`);
      }
      setConsents(prev => prev.map(c => c.consent_id === consentId ? { ...c, status } : c));
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setActing(null);
    }
  };

  const filtered = consents.filter(c => c.status === tab);
  const pendingCount = consents.filter(c => c.status === "PENDING").length;

  const fmt = (ts) => ts
    ? new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.header}>
          <h1 style={styles.title}>🔒 Consent Center</h1>
          <button style={styles.backBtn} onClick={() => router.back()}>← Back</button>
        </div>

        <div style={styles.tabs}>
          {["PENDING", "APPROVED", "DECLINED"].map(t => (
            <button key={t} style={styles.tab(tab === t)} onClick={() => setTab(t)}>
              {t.charAt(0) + t.slice(1).toLowerCase()}
              {t === "PENDING" && pendingCount > 0 && (
                <span style={{ marginLeft: "0.4rem", background: "#ef4444", color: "#fff", borderRadius: "10px", padding: "0 0.45rem", fontSize: "0.72rem" }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={styles.body}>
          {error && <div style={styles.error}>⚠️ {error}</div>}

          {loading ? (
            <div style={styles.spinner}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={styles.empty}>
              <div style={{ fontSize: "2.5rem" }}>
                {tab === "PENDING" ? "📭" : tab === "APPROVED" ? "✅" : "❌"}
              </div>
              <p>No {tab.toLowerCase()} requests</p>
            </div>
          ) : (
            filtered.map(c => (
              <div key={c.consent_id} style={styles.item}>
                <div style={styles.itemTop}>
                  <div>
                    <p style={styles.company}>{c.requestor_name || c.requestor_email}</p>
                    <p style={styles.meta}>{c.requestor_email}</p>
                    <p style={styles.meta}>Requested: {fmt(c.requested_at)}</p>
                    {c.responded_at && <p style={styles.meta}>Responded: {fmt(c.responded_at)}</p>}
                  </div>
                  <span style={styles.badge(c.status)}>{c.status}</span>
                </div>

                <p style={{ ...styles.meta, marginTop: "0.6rem" }}>
                  <strong>Requesting access to:</strong> Personal details, Education, Employment history, UAN & PF records
                </p>

                {c.status === "PENDING" && (
                  <div style={styles.actions}>
                    <button
                      style={{ ...styles.approveBtn, opacity: acting === c.consent_id ? 0.7 : 1 }}
                      disabled={!!acting}
                      onClick={() => respond(c.consent_id, "APPROVED")}
                    >
                      {acting === c.consent_id ? "Processing…" : "✓ Approve"}
                    </button>
                    <button
                      style={{ ...styles.declineBtn, opacity: acting === c.consent_id ? 0.7 : 1 }}
                      disabled={!!acting}
                      onClick={() => respond(c.consent_id, "DECLINED")}
                    >
                      {acting === c.consent_id ? "Processing…" : "✗ Decline"}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
