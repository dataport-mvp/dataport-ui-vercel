// pages/consent.js  — Employee Consent Center
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

export default function ConsentPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState("pending");
  const [consents,  setConsents]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  // ─── Fetch all consents for the logged-in employee ───────────────
  useEffect(() => {
    if (!token) return;
    fetchConsents();
  }, [token]);

  const fetchConsents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/consent/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      setConsents(await res.json());
    } catch (err) {
      console.error("Error fetching consents:", err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Approve or Decline ──────────────────────────────────────────
  const updateStatus = async (consent_id, newStatus) => {
    try {
      const res = await fetch(`${API}/consent/respond`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          consent_id,
          status:       newStatus.toUpperCase(),   // APPROVED | DECLINED
          responded_at: Date.now(),
        }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const updated = await res.json();

      // Replace local record
      setConsents((prev) =>
        prev.map((c) => c.consent_id === consent_id ? { ...c, ...updated } : c)
      );
    } catch (err) {
      console.error("Error updating consent:", err);
    }
  };

  const filtered = consents.filter(
    (c) => (c.status || "").toLowerCase() === activeTab
  );

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.headerRow}>
          <h1 style={styles.title}>🔒 Consent Center</h1>
          <button onClick={() => router.back()} style={styles.backBtn}>← Back</button>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {["pending", "approved", "declined"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tab,
                background: activeTab === tab ? "#2563eb" : "#e5e7eb",
                color:      activeTab === tab ? "#fff"    : "#111827",
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === "pending" && consents.filter((c) => c.status?.toLowerCase() === "pending").length > 0 && (
                <span style={styles.badge}>
                  {consents.filter((c) => c.status?.toLowerCase() === "pending").length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <p style={{ marginTop: "2rem", color: "#94a3b8" }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <p style={{ marginTop: "2rem", color: "#94a3b8" }}>No {activeTab} requests.</p>
        ) : (
          filtered.map((consent) => (
            <div key={consent.consent_id} style={styles.cardItem}>
              <div style={styles.consentHeader}>
                <div>
                  <h3 style={{ margin: 0 }}>
                    {consent.requestor_name || consent.requestor_email || consent.requestor_id}
                  </h3>
                  <p style={styles.consentEmail}>{consent.requestor_email}</p>
                </div>
                <StatusBadge status={consent.status} />
              </div>

              <p style={styles.meta}>
                <strong>Requested:</strong>{" "}
                {consent.requested_at
                  ? new Date(consent.requested_at).toLocaleString()
                  : "—"}
              </p>
              <p style={styles.meta}>
                <strong>Consent ID:</strong> <code>{consent.consent_id}</code>
              </p>
              {consent.responded_at && (
                <p style={styles.meta}>
                  <strong>Responded:</strong>{" "}
                  {new Date(consent.responded_at).toLocaleString()}
                </p>
              )}

              {consent.status?.toLowerCase() === "pending" && (
                <div style={styles.actions}>
                  <button
                    style={styles.approveBtn}
                    onClick={() => updateStatus(consent.consent_id, "approved")}
                  >
                    ✓ Approve
                  </button>
                  <button
                    style={styles.declineBtn}
                    onClick={() => updateStatus(consent.consent_id, "declined")}
                  >
                    ✗ Decline
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    PENDING:  { bg: "#fef3c7", color: "#92400e", label: "⏳ Pending" },
    APPROVED: { bg: "#d1fae5", color: "#065f46", label: "✅ Approved" },
    DECLINED: { bg: "#fee2e2", color: "#991b1b", label: "❌ Declined" },
  };
  const s = map[(status || "").toUpperCase()] || map.PENDING;
  return (
    <span style={{ background: s.bg, color: s.color, padding: "0.3rem 0.85rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: "600" }}>
      {s.label}
    </span>
  );
}

const styles = {
  page:          { background: "#f1f5f9", minHeight: "100vh", padding: "2rem", fontFamily: "Inter, system-ui, sans-serif" },
  card:          { maxWidth: "980px", margin: "auto", background: "#fff", padding: "2rem", borderRadius: "14px", boxShadow: "0 12px 30px rgba(0,0,0,0.08)" },
  headerRow:     { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" },
  title:         { margin: 0 },
  backBtn:       { background: "#0f172a", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer" },
  tabs:          { display: "flex", gap: "0.75rem", marginBottom: "1.5rem" },
  tab:           { border: "none", padding: "0.5rem 1.4rem", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "0.9rem", position: "relative" },
  badge:         { marginLeft: "6px", background: "#ef4444", color: "#fff", borderRadius: "999px", padding: "0.1rem 0.45rem", fontSize: "0.7rem" },
  cardItem:      { marginTop: "1.5rem", padding: "1.5rem", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0" },
  consentHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" },
  consentEmail:  { margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#64748b" },
  meta:          { margin: "0.3rem 0", fontSize: "0.875rem", color: "#475569" },
  actions:       { marginTop: "1.25rem", display: "flex", gap: "0.75rem" },
  approveBtn:    { background: "#16a34a", color: "#fff", border: "none", padding: "0.55rem 1.5rem", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  declineBtn:    { background: "#dc2626", color: "#fff", border: "none", padding: "0.55rem 1.5rem", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
};
