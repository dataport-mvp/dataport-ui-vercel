// pages/employer/dashboard.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;
const TABS = ["Personal", "Education", "Employment", "UAN & PF"];

export default function EmployerDashboard() {
  const router = useRouter();
  const { token, user, logout } = useAuth();

  const [emailInput, setEmailInput] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searching, setSearching] = useState(false);

  const [consentId, setConsentId] = useState(null);
  const [consentStatus, setConsentStatus] = useState(null);
  const [polling, setPolling] = useState(false);

  const [employeeData, setEmployeeData] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [activeTab, setActiveTab] = useState("Personal");

  const [myConsents, setMyConsents] = useState([]);
  const [showSignoutConfirm, setShowSignoutConfirm] = useState(false);

  // ────────────────────────────────
  // Load previous consent requests
  // ────────────────────────────────
  useEffect(() => {
    if (!token) return;
    fetchMyConsents();
  }, [token]);

  const fetchMyConsents = async () => {
    try {
      const res = await fetch(`${API}/consent/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setMyConsents(await res.json());
    } catch (_) {}
  };

  // ────────────────────────────────
  // Poll consent status
  // ────────────────────────────────
  useEffect(() => {
    if (!consentId || !polling || !token) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API}/consent/${consentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const data = await res.json();
        setConsentStatus(data.status);

        if (data.status === "APPROVED") {
          clearInterval(interval);
          setPolling(false);
          await fetchEmployeeData(data.employee_id);
        }

        if (data.status === "DECLINED") {
          clearInterval(interval);
          setPolling(false);
        }
      } catch (_) {}
    }, 4000);

    return () => clearInterval(interval);
  }, [consentId, polling, token]);

  // ────────────────────────────────
  // Request consent
  // ────────────────────────────────
  const handleSearch = async () => {
    if (!emailInput.trim()) return;

    setSearchError("");
    setConsentId(null);
    setConsentStatus(null);
    setEmployeeData(null);
    setSearching(true);

    try {
      const res = await fetch(`${API}/consent/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employee_email: emailInput.trim().toLowerCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `Error ${res.status}`);

      setConsentId(data.consent_id);
      setEmployeeId(data.employee_id);
      setConsentStatus("PENDING");
      setPolling(true);
      fetchMyConsents();
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const fetchEmployeeData = async (empId) => {
    try {
      const res = await fetch(`${API}/employee/${empId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch employee data");
      const data = await res.json();
      setEmployeeData(data);
    } catch (err) {
      setSearchError(err.message);
    }
  };

  const reopenConsent = async (consent) => {
    setEmailInput(consent.employee_email || "");
    setConsentId(consent.consent_id);
    setEmployeeId(consent.employee_id);
    setConsentStatus(consent.status);
    setEmployeeData(null);

    if (consent.status === "APPROVED") {
      await fetchEmployeeData(consent.employee_id);
    }

    if (consent.status === "PENDING") {
      setPolling(true);
    }
  };

  // ────────────────────────────────
  // UI
  // ────────────────────────────────
  return (
    <div style={styles.page}>
      {showSignoutConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3>Sign Out?</h3>
            <p>You will be returned to login page.</p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button onClick={() => setShowSignoutConfirm(false)} style={styles.cancelBtn}>
                Cancel
              </button>
              <button
                onClick={() => {
                  logout();
                  router.push("/employer/login");
                }}
                style={styles.confirmBtn}
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>Employer Dashboard</h1>
            {user && (
              <p style={styles.subtitle}>
                Logged in as <strong>{user.email}</strong>
              </p>
            )}
          </div>
          <button style={styles.logoutBtn} onClick={() => setShowSignoutConfirm(true)}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────
// Styles (DO NOT REMOVE)
// ────────────────────────────────

const styles = {
  page: {
    background: "#f1f5f9",
    padding: "2rem",
    minHeight: "100vh",
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
    marginBottom: "2rem",
  },
  title: { margin: 0 },
  subtitle: {
    margin: "0.25rem 0 0",
    color: "#64748b",
    fontSize: "0.9rem",
  },
  logoutBtn: {
    padding: "0.5rem 1.25rem",
    background: "#0f172a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBox: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    textAlign: "center",
  },
  cancelBtn: {
    padding: "0.6rem 1.5rem",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    cursor: "pointer",
  },
  confirmBtn: {
    padding: "0.6rem 1.5rem",
    borderRadius: "8px",
    border: "none",
    background: "#0f172a",
    color: "#fff",
    cursor: "pointer",
  },
};
