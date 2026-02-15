import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function ConsentPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("pending");
  const [consents, setConsents] = useState([]);

  // Use prod API by default
  const api = process.env.NEXT_PUBLIC_API_URL_PROD;
  // For internal testing, switch to staging:
  // const api = process.env.NEXT_PUBLIC_API_URL_STAGING;

  // Fetch consents from backend
  useEffect(() => {
    async function fetchConsents() {
      try {
        const res = await fetch(`${api}/consent`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        setConsents(data);
      } catch (err) {
        console.error("Error fetching consents:", err);
      }
    }
    fetchConsents();
  }, [api]);

  // Update consent status (approve/decline)
  const updateStatus = async (consent_id, newStatus) => {
    try {
      const payload = {
        consent_id,
        status: newStatus.toUpperCase(), // backend expects APPROVED / DECLINED
        responded_at: Date.now()
      };

      const res = await fetch(`${api}/consent/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const updatedConsent = await res.json();

      // Update local state
      const updated = consents.map((c) =>
        c.consent_id === consent_id ? updatedConsent : c
      );
      setConsents(updated);
    } catch (err) {
      console.error("Error updating consent:", err);
    }
  };

  const filtered = consents.filter((c) => c.status.toLowerCase() === activeTab);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.headerRow}>
          <h1 style={styles.title}>🔒 Consent Center</h1>
          <button onClick={() => router.back()} style={styles.backBtn}>
            ← Back
          </button>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <Tab label="Pending" value="pending" active={activeTab} setActive={setActiveTab} />
          <Tab label="Approved" value="approved" active={activeTab} setActive={setActiveTab} />
          <Tab label="Declined" value="declined" active={activeTab} setActive={setActiveTab} />
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <p style={{ marginTop: "2rem" }}>No records found.</p>
        ) : (
          filtered.map((consent) => (
            <div key={consent.consent_id} style={styles.cardItem}>
              <h3>{consent.requestor_id}</h3>
              <p><strong>Requested On:</strong> {consent.requested_at}</p>
              <p><strong>Consent ID:</strong> {consent.consent_id}</p>

              {consent.status.toLowerCase() === "pending" && (
                <div style={styles.actions}>
                  <button
                    style={styles.approveBtn}
                    onClick={() => updateStatus(consent.consent_id, "approved")}
                  >
                    Approve
                  </button>
                  <button
                    style={styles.declineBtn}
                    onClick={() => updateStatus(consent.consent_id, "declined")}
                  >
                    Decline
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

/* -------- TAB COMPONENT -------- */
const Tab = ({ label, value, active, setActive }) => (
  <button
    onClick={() => setActive(value)}
    style={{
      ...styles.tab,
      background: active === value ? "#2563eb" : "#e5e7eb",
      color: active === value ? "#fff" : "#111827",
    }}
  >
    {label}
  </button>
);

/* -------- STYLES -------- */
const styles = {
  page: {
    background: "#f1f5f9",
    minHeight: "100vh",
    padding: "2rem",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  card: {
    maxWidth: "980px",
    margin: "auto",
    background: "#fff",
    padding: "2rem",
    borderRadius: "14px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
  },
  title: { margin: 0 },
  backBtn: {
    background: "#111827",
    color: "#fff",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
  },
  tabs: { display: "flex", gap: "1rem" },
  tab: {
    border: "none",
    padding: "0.5rem 1.2rem",
    borderRadius: "8px",
    cursor: "pointer",
  },
  cardItem: {
    marginTop: "2rem",
    padding: "1.5rem",
    borderRadius: "10px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  actions: { marginTop: "1rem", display: "flex", gap: "1rem" },
  approveBtn: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
  },
  declineBtn: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
  },
};