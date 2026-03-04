// pages/consent.js
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

export default function ConsentPage() {
  const { user, apiFetch, logout, ready } = useAuth();
  const router = useRouter();
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null); // consent_id being actioned
  const [profileStatus, setProfileStatus] = useState("draft");

  // Auth guard
  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/employee/login"); return; }
    if (user.role !== "employee") { router.replace("/employer/dashboard"); return; }
  }, [ready, user, router]);


  useEffect(() => {
    const loadProfileStatus = async () => {
      if (!ready || !user) return;
      try {
        const res = await apiFetch(`${API}/employee/draft`);
        if (res.ok) {
          const data = await res.json();
          if (data?.status) setProfileStatus(String(data.status).toLowerCase());
        }
      } catch (_) {}
    };
    loadProfileStatus();
  }, [ready, user, apiFetch]);
  const normalizeStatus = (status) => {
    const s = String(status || "pending").toLowerCase();
    if (["approved", "approve", "accepted", "granted", "allow"].includes(s)) return "approved";
    if (["declined", "decline", "rejected", "denied", "reject"].includes(s)) return "declined";
    return "pending";
  };

  const normalizeConsent = (c) => ({
    ...c,
    consent_id: c?.consent_id || c?.id || c?.consentId || c?._id,
    status: normalizeStatus(c?.status),
    employer_name: c?.employer_name || c?.employerName || c?.company_name || c?.companyName || "",
    employer_email: c?.employer_email || c?.employerEmail || c?.email || "",
    request_message: c?.message || c?.comment || c?.request_message || c?.note || "",
  });

  const loadConsents = useCallback(async () => {
    try {
      const res = await apiFetch(`${API}/consent/my`);
      if (res.ok) {
        const data = await res.json();
        setConsents(Array.isArray(data) ? data.map(normalizeConsent) : []);
      }
    } catch (_) {}
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => {
    if (ready && user) loadConsents();
  }, [ready, user, loadConsents]);

  useEffect(() => {
    if (!ready || !user) return;
    const id = setInterval(loadConsents, 15000);
    return () => clearInterval(id);
  }, [ready, user, loadConsents]);

  const respond = async (consentId, decision) => {
    if (profileStatus !== "submitted") return;
    setActing(consentId);
    try {
      const res = await apiFetch(`${API}/consent/respond`, {
        method: "POST",
        body: JSON.stringify({ consent_id: consentId, status: decision === "approve" ? "APPROVED" : "DECLINED", responded_at: Date.now() }),
      });
      if (res.ok) await loadConsents();
    } catch (_) {}
    setActing(null);
  };

  if (!ready || !user) return null;

  const pending = consents.filter(c => c.status === "pending");
  const getConsentId = (c) => c.consent_id || c.id || c.consentId || c._id;
  const resolved = consents.filter(c => c.status !== "pending");

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>Datagate</div>
          <div style={styles.headerRight}>
            <span style={styles.userName}>{user.name}</span>
            <button style={styles.logoutBtn} onClick={logout}>Sign out</button>
          </div>
        </div>

        <h1 style={styles.title}>Consent Requests</h1>
        <p style={styles.sub}>Employers requesting access to your profile</p>

        {profileStatus !== "submitted" && (
          <div style={styles.blocker}>Complete and submit all 4 profile pages before approving consent requests. Current status: <strong>{profileStatus}</strong>.</div>
        )}

        {loading ? (
          <div style={styles.emptyState}>Loading…</div>
        ) : consents.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📋</div>
            <p style={styles.emptyText}>No consent requests yet</p>
            <p style={styles.emptySub}>When an employer requests access to your profile, it will appear here.</p>
          </div>
        ) : (
          <>
            {pending.length > 0 && (
              <section style={styles.section}>
                <div style={styles.sectionLabel}>Pending ({pending.length})</div>
                {pending.map(c => (
                  <ConsentCard
                    key={getConsentId(c)}
                    consent={c}
                    acting={acting === getConsentId(c)}
                    disabled={profileStatus !== "submitted"}
                    onApprove={() => respond(getConsentId(c), "approve")}
                    onDecline={() => respond(getConsentId(c), "decline")}
                  />
                ))}
              </section>
            )}

            {resolved.length > 0 && (
              <section style={styles.section}>
                <div style={styles.sectionLabel}>History</div>
                {resolved.map(c => (
                  <ConsentCard key={getConsentId(c)} consent={c} acting={false} resolved />
                ))}
              </section>
            )}
          </>
        )}

        <div style={styles.editLink}>
          <a href="/employee/personal" style={styles.link}>← Edit my profile</a>
        </div>
      </div>
    </div>
  );
}

function ConsentCard({ consent, acting, onApprove, onDecline, resolved, disabled }) {
  const statusColor = {
    pending: "#f59e0b",
    approved: "#16a34a",
    declined: "#ef4444",
  }[consent.status] || "#94a3b8";

  return (
    <div style={styles.card}>
      <div style={styles.cardTop}>
        <div>
          <div style={styles.companyName}>{consent.employer_name || consent.employer_email}</div>
          <div style={styles.cardMeta}>Requested {formatDate(consent.created_at)}</div>
        </div>
        <span style={{ ...styles.badge, background: statusColor }}>
          {consent.status.charAt(0).toUpperCase() + consent.status.slice(1)}
        </span>
      </div>

      {(consent.message || consent.comment || consent.request_message) && (
        <p style={styles.message}>"{consent.request_message || consent.message || consent.comment || consent.request_message}"</p>
      )}

      {(consent.approved_at || consent.responded_at || consent.updated_at) && (
        <p style={styles.timeMeta}>Responded: {formatDateTime(consent.approved_at || consent.responded_at || consent.updated_at)}</p>
      )}

      {!resolved && (
        <div style={styles.cardActions}>
          <button
            style={styles.approveBtn}
            onClick={onApprove}
            disabled={acting || disabled}
          >
            {acting ? "…" : "Approve"}
          </button>
          <button
            style={styles.declineBtn}
            onClick={onDecline}
            disabled={acting || disabled}
          >
            {acting ? "…" : "Decline"}
          </button>
        </div>
      )}
    </div>
  );
}

function formatDate(ts) {
  if (!ts) return "";
  try { return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return ""; }
}

function formatDateTime(ts) {
  if (!ts) return "";
  try { return new Date(ts).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
  catch { return ""; }
}

const styles = {
  page: { minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: 680, margin: "0 auto", padding: "1.5rem 1rem" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" },
  logo: { fontSize: 20, fontWeight: 800, color: "#2563eb" },
  headerRight: { display: "flex", alignItems: "center", gap: "1rem" },
  userName: { fontSize: 14, color: "#374151", fontWeight: 500 },
  logoutBtn: { background: "none", border: "1.5px solid #e2e8f0", color: "#64748b", padding: "0.4rem 0.9rem", borderRadius: 6, fontSize: 13, cursor: "pointer" },
  title: { fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" },
  sub: { fontSize: 14, color: "#64748b", margin: "0 0 1.5rem" },
  section: { display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" },
  sectionLabel: { fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
  card: { background: "#fff", borderRadius: 12, padding: "1.25rem", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "0.75rem" },
  cardTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
  companyName: { fontSize: 16, fontWeight: 700, color: "#0f172a" },
  cardMeta: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  badge: { padding: "0.25rem 0.75rem", borderRadius: 999, fontSize: 12, fontWeight: 600, color: "#fff" },
  message: { fontSize: 14, color: "#475569", fontStyle: "italic", margin: 0, background: "#f8fafc", borderRadius: 8, padding: "0.75rem" },
  timeMeta: { fontSize: 12, color: "#94a3b8", margin: "-2px 0 0" },
  cardActions: { display: "flex", gap: "0.75rem" },
  approveBtn: { flex: 1, padding: "0.65rem", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  declineBtn: { flex: 1, padding: "0.65rem", background: "#fff", color: "#ef4444", border: "1.5px solid #ef4444", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", padding: "4rem 2rem", textAlign: "center", gap: "0.5rem" },
  blocker: { marginBottom: "0.9rem", padding: "0.7rem", borderRadius: 8, border: "1px solid #fed7aa", background: "#fff7ed", color: "#9a3412", fontSize: 13 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 16, fontWeight: 600, color: "#374151", margin: 0 },
  emptySub: { fontSize: 14, color: "#94a3b8", margin: 0 },
  editLink: { marginTop: "1rem" },
  link: { color: "#2563eb", fontSize: 14, textDecoration: "none" },
};
