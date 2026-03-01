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

  // ✅ FIX 1: Missing state (this caused build failure)
  const [showSignoutConfirm, setShowSignoutConfirm] = useState(false);

  // ─────────────────────────────────────────

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

  // ─── Consent Polling ─────────────────────

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
          setPolling(false);
          clearInterval(interval);
          await fetchEmployeeData(data.employee_id);
        }

        if (data.status === "DECLINED") {
          setPolling(false);
          clearInterval(interval);
        }
      } catch (_) {}
    }, 4000);

    return () => clearInterval(interval);
  }, [consentId, polling, token]);

  // ─── Search / Request Consent ────────────

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

  // ─── Fetch Employee Data ─────────────────

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

  // ─── Reopen Consent ──────────────────────

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

  // ─────────────────────────────────────────

  return (
    <div style={styles.page}>

      {/* Signout Modal */}
      {showSignoutConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🚪</div>
            <h3 style={{ margin: "0 0 0.5rem", color: "#0f172a" }}>
              Sign Out?
            </h3>
            <p style={{ color: "#475569", marginBottom: "1.5rem" }}>
              You will be returned to the employer login page.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button
                onClick={() => setShowSignoutConfirm(false)}
                style={styles.cancelBtn}
              >
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

        {/* Header */}
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>Employer Dashboard</h1>
            {user && (
              <p style={styles.subtitle}>
                Logged in as <strong>{user.email}</strong>
              </p>
            )}
          </div>
          <button
            style={styles.logoutBtn}
            onClick={() => setShowSignoutConfirm(true)}
          >
            Sign Out
          </button>
        </div>

        {/* Rest of your UI unchanged */}

      </div>
    </div>
  );
}
