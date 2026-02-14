import { useState } from "react";
import { useRouter } from "next/router";

export default function ConsentPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("pending");

  const [consents, setConsents] = useState([
    {
      id: 1,
      company: "TCS",
      requestedOn: "12 Feb 2026",
      fields: ["Personal Details", "Education History", "Employment"],
      status: "pending"
    },
    {
      id: 2,
      company: "Infosys",
      requestedOn: "5 Feb 2026",
      fields: ["Personal Details"],
      status: "approved"
    }
  ]);

  const updateStatus = (id, newStatus) => {
    const updated = consents.map((c) =>
      c.id === id ? { ...c, status: newStatus } : c
    );
    setConsents(updated);
  };

  const filtered = consents.filter(c => c.status === activeTab);

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
          filtered.map(consent => (
            <div key={consent.id} style={styles.cardItem}>
              <h3>{consent.company}</h3>
              <p><strong>Requested On:</strong> {consent.requestedOn}</p>
              <p><strong>Data Requested:</strong></p>
              <ul>
                {consent.fields.map((f, i) => <li key={i}>{f}</li>)}
              </ul>

              {consent.status === "pending" && (
                <div style={styles.actions}>
                  <button
                    style={styles.approveBtn}
                    onClick={() => updateStatus(consent.id, "approved")}
                  >
                    Approve
                  </button>
                  <button
                    style={styles.declineBtn}
                    onClick={() => updateStatus(consent.id, "declined")}
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
      color: active === value ? "#fff" : "#111827"
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
    fontFamily: "Inter, system-ui, sans-serif"
  },
  card: {
    maxWidth: "980px",
    margin: "auto",
    background: "#fff",
    padding: "2rem",
    borderRadius: "14px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.08)"
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem"
  },
  title: {
    margin: 0
  },
  backBtn: {
    background: "#111827",
    color: "#fff",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer"
  },
  tabs: {
    display: "flex",
    gap: "1rem"
  },
  tab: {
    border: "none",
    padding: "0.5rem 1.2rem",
    borderRadius: "8px",
    cursor: "pointer"
  },
  cardItem: {
    marginTop: "2rem",
    padding: "1.5rem",
    borderRadius: "10px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0"
  },
  actions: {
    marginTop: "1rem",
    display: "flex",
    gap: "1rem"
  },
  approveBtn: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer"
  },
  declineBtn: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer"
  }
};
