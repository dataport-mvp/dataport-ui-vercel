// pages/employer/dashboard.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;
const DATA_TABS = ["Personal", "Education", "Employment", "UAN & PF"];

export default function EmployerDashboard() {
  const router = useRouter();
  const { token, user, logout } = useAuth();

  // ── Consent list state ───────────────────────────────────────────────────────
  const [allConsents,        setAllConsents]        = useState([]);
  const [consentTab,         setConsentTab]         = useState("SENT");     // SENT | APPROVED | DECLINED
  const [searchQuery,        setSearchQuery]        = useState("");
  const [loadingConsents,    setLoadingConsents]    = useState(true);

  // ── New request state ────────────────────────────────────────────────────────
  const [emailInput,         setEmailInput]         = useState("");
  const [searching,          setSearching]          = useState(false);
  const [requestError,       setRequestError]       = useState("");
  const [requestSuccess,     setRequestSuccess]     = useState("");

  // ── Polling for pending consent ──────────────────────────────────────────────
  const [pollingConsentId,   setPollingConsentId]   = useState(null);
  const [polling,            setPolling]            = useState(false);

  // ── Employee profile view ────────────────────────────────────────────────────
  const [viewingConsent,     setViewingConsent]     = useState(null); // the consent object
  const [employeeData,       setEmployeeData]       = useState(null);
  const [employeeId,         setEmployeeId]         = useState(null);
  const [dataTab,            setDataTab]            = useState("Personal");
  const [loadingProfile,     setLoadingProfile]     = useState(false);
  const [profileError,       setProfileError]       = useState("");

  // ── UI ───────────────────────────────────────────────────────────────────────
  const [showSignoutConfirm, setShowSignoutConfirm] = useState(false);
  const [toast,              setToast]              = useState(null);

  // ── Load all consents ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    fetchConsents();
  }, [token]);

  const fetchConsents = async () => {
    try {
      const res = await fetch(`${API}/consent/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { handleSessionExpired(); return; }
      if (res.ok) setAllConsents(await res.json());
    } catch (_) {}
    finally { setLoadingConsents(false); }
  };

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSessionExpired = () => {
    logout();
    router.push("/employer/login?expired=1");
  };

  // ── Poll for pending consent becoming APPROVED/DECLINED ──────────────────────
  useEffect(() => {
    if (!pollingConsentId || !polling || !token) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API}/consent/${pollingConsentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) { clearInterval(interval); handleSessionExpired(); return; }
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "APPROVED") {
          clearInterval(interval);
          setPolling(false);
          setPollingConsentId(null);
          fetchConsents();
          showToast("✅ Employee approved your request! Click 'View Data' to see their profile.", "success");
        }
        if (data.status === "DECLINED") {
          clearInterval(interval);
          setPolling(false);
          setPollingConsentId(null);
          fetchConsents();
          showToast("❌ The employee has declined your data access request.", "declined");
        }
      } catch (_) {}
    }, 4000);
    return () => clearInterval(interval);
  }, [pollingConsentId, polling, token]);

  // ── Send consent request ─────────────────────────────────────────────────────
  const handleRequest = async () => {
    if (!emailInput.trim()) return;
    setRequestError("");
    setRequestSuccess("");
    setSearching(true);
    try {
      const res = await fetch(`${API}/consent/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ employee_email: emailInput.trim().toLowerCase() }),
      });
      if (res.status === 401) { handleSessionExpired(); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `Error ${res.status}`);

      setPollingConsentId(data.consent_id);
      setPolling(true);
      setRequestSuccess(`Request sent to ${emailInput.trim().toLowerCase()}. Waiting for their response…`);
      setEmailInput("");
      setConsentTab("SENT");
      fetchConsents();
    } catch (err) {
      setRequestError(err.message);
    } finally {
      setSearching(false);
    }
  };

  // ── Open employee profile (APPROVED consent) ─────────────────────────────────
  const openProfile = async (consent) => {
    setViewingConsent(consent);
    setEmployeeData(null);
    setProfileError("");
    setDataTab("Personal");
    setLoadingProfile(true);
    try {
      const res = await fetch(`${API}/employee/${consent.employee_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { handleSessionExpired(); return; }
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.detail || `Error ${res.status}`);
      }
      const data = await res.json();
      setEmployeeData(data);
      setEmployeeId(consent.employee_id);
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  const closeProfile = () => {
    setViewingConsent(null);
    setEmployeeData(null);
    setProfileError("");
  };

  // ── Filtered consent lists ────────────────────────────────────────────────────
  const q = searchQuery.trim().toLowerCase();
  const filterConsents = (status) => {
    const statusMatch = status === "SENT"
      ? allConsents.filter(c => c.status === "PENDING")
      : allConsents.filter(c => c.status === status);
    if (!q) return statusMatch;
    return statusMatch.filter(c =>
      (c.employee_email || "").toLowerCase().includes(q)
    );
  };

  const sentList     = filterConsents("SENT");
  const approvedList = filterConsents("APPROVED");
  const declinedList = filterConsents("DECLINED");

  const countOf = (s) => ({
    SENT:     allConsents.filter(c => c.status === "PENDING").length,
    APPROVED: allConsents.filter(c => c.status === "APPROVED").length,
    DECLINED: allConsents.filter(c => c.status === "DECLINED").length,
  })[s];

  const currentList = { SENT: sentList, APPROVED: approvedList, DECLINED: declinedList }[consentTab];

  const fmt = (ts) => ts ? new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  // ── If viewing a profile, render the full profile view ───────────────────────
  if (viewingConsent) {
    return (
      <div style={st.page}>
        <div style={st.card}>
          {/* Profile header */}
          <div style={st.headerRow}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button style={st.backBtn} onClick={closeProfile}>← Back to Dashboard</button>
              <div>
                <h2 style={{ margin: 0 }}>
                  {employeeData
                    ? [employeeData.firstName, employeeData.middleName, employeeData.lastName].filter(Boolean).join(" ")
                    : viewingConsent.employee_email}
                </h2>
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                  {viewingConsent.employee_email}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.3rem" }}>
              <StatusBadge status="APPROVED" />
              {employeeData?._snapshot_at && (
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  📸 Snapshot: {fmt(employeeData._snapshot_at)}
                </span>
              )}
            </div>
          </div>

          {loadingProfile && <p style={{ padding: "2rem", color: "#94a3b8", textAlign: "center" }}>Loading profile…</p>}
          {profileError  && <p style={{ padding: "1.5rem", color: "#dc2626" }}>⚠️ {profileError}</p>}

          {employeeData && (
            <>
              <div style={st.tabNav}>
                {DATA_TABS.map(t => (
                  <button key={t} style={{ ...st.tab, ...(dataTab === t ? st.tabActive : {}) }} onClick={() => setDataTab(t)}>
                    {t}
                  </button>
                ))}
              </div>
              <div style={{ padding: "1.5rem 2rem" }}>
                {dataTab === "Personal"   && <PersonalTab   data={employeeData} />}
                {dataTab === "Education"  && <EducationTab  data={employeeData.education} />}
                {dataTab === "Employment" && <EmploymentTab empId={employeeId} token={token} onExpired={handleSessionExpired} />}
                {dataTab === "UAN & PF"   && <UANTab        data={employeeData} />}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Main dashboard ────────────────────────────────────────────────────────────
  return (
    <div style={st.page}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "1.5rem", left: "50%", transform: "translateX(-50%)",
          background: toast.type === "success" ? "#f0fdf4" : toast.type === "declined" ? "#fef2f2" : "#f8fafc",
          border: `1px solid ${toast.type === "success" ? "#bbf7d0" : toast.type === "declined" ? "#fecaca" : "#e2e8f0"}`,
          color: toast.type === "success" ? "#16a34a" : toast.type === "declined" ? "#dc2626" : "#0f172a",
          padding: "0.85rem 1.75rem", borderRadius: "10px", fontWeight: 600, fontSize: "0.9rem",
          zIndex: 1000, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", maxWidth: "92vw", textAlign: "center",
        }}>{toast.msg}</div>
      )}

      {/* Signout modal */}
      {showSignoutConfirm && (
        <div style={st.modalOverlay}>
          <div style={st.modalBox}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🚪</div>
            <h3 style={{ margin: "0 0 0.5rem", color: "#0f172a" }}>Sign Out?</h3>
            <p style={{ color: "#475569", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
              You will be returned to the employer login page.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button onClick={() => setShowSignoutConfirm(false)} style={st.cancelBtn}>Cancel</button>
              <button onClick={() => { logout(); router.push("/employer/login"); }} style={st.confirmBtn}>Yes, Sign Out</button>
            </div>
          </div>
        </div>
      )}

      <div style={st.card}>

        {/* Header */}
        <div style={st.headerRow}>
          <div>
            <h1 style={{ margin: 0 }}>Employer Dashboard</h1>
            {user && <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.9rem" }}>Logged in as <strong>{user.email}</strong></p>}
          </div>
          <button style={st.logoutBtn} onClick={() => setShowSignoutConfirm(true)}>Sign Out</button>
        </div>

        {/* ── Request new access ──────────────────────────────────────────────── */}
        <div style={st.requestBox}>
          <h3 style={{ margin: "0 0 0.5rem", color: "#0f172a" }}>Request Employee Data</h3>
          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 1rem" }}>
            Enter the employee's email. They'll receive a consent request to approve or decline.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <input
              style={st.emailInput}
              type="email"
              placeholder="employee@example.com"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleRequest()}
            />
            <button
              style={{ ...st.requestBtn, opacity: searching ? 0.7 : 1 }}
              onClick={handleRequest}
              disabled={searching}
            >
              {searching ? "Sending…" : "Send Request"}
            </button>
          </div>
          {requestError   && <p style={{ color: "#dc2626", fontSize: "0.85rem", marginTop: "0.75rem" }}>⚠️ {requestError}</p>}
          {requestSuccess && <p style={{ color: "#16a34a", fontSize: "0.85rem", marginTop: "0.75rem" }}>✅ {requestSuccess}</p>}
        </div>

        {/* ── Consent tabs with search ─────────────────────────────────────────── */}
        <div style={{ padding: "0 2rem 2rem" }}>

          {/* Search bar */}
          <div style={{ marginBottom: "1rem", position: "relative" }}>
            <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "1rem" }}>🔍</span>
            <input
              style={{ width: "100%", padding: "0.6rem 1rem 0.6rem 2.25rem", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.9rem", boxSizing: "border-box", outline: "none" }}
              placeholder="Search by employee email…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1rem" }}
              >✕</button>
            )}
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", borderBottom: "2px solid #f1f5f9", marginBottom: "1.25rem" }}>
            {[
              { key: "SENT",     label: "Sent",     color: "#ca8a04", bg: "#fef9c3" },
              { key: "APPROVED", label: "Accepted", color: "#16a34a", bg: "#dcfce7" },
              { key: "DECLINED", label: "Declined", color: "#dc2626", bg: "#fee2e2" },
            ].map(({ key, label, color, bg }) => {
              const count = countOf(key);
              return (
                <button
                  key={key}
                  onClick={() => setConsentTab(key)}
                  style={{
                    padding: "0.65rem 1.25rem", border: "none", cursor: "pointer", fontWeight: consentTab === key ? 700 : 400,
                    color: consentTab === key ? color : "#64748b",
                    borderBottom: consentTab === key ? `2px solid ${color}` : "2px solid transparent",
                    background: "none", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.4rem",
                  }}
                >
                  {label}
                  {count > 0 && (
                    <span style={{ background: consentTab === key ? color : "#e2e8f0", color: consentTab === key ? "#fff" : "#64748b", borderRadius: "10px", padding: "0.1rem 0.5rem", fontSize: "0.72rem", fontWeight: 700 }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Consent rows */}
          {loadingConsents ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "2rem" }}>Loading…</p>
          ) : currentList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem", color: "#94a3b8" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
                {consentTab === "SENT" ? "📤" : consentTab === "APPROVED" ? "✅" : "🚫"}
              </div>
              <p style={{ margin: 0 }}>
                {searchQuery
                  ? `No ${consentTab.toLowerCase()} requests matching "${searchQuery}"`
                  : `No ${consentTab.toLowerCase()} requests yet`}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[...currentList].sort((a, b) => b.requested_at - a.requested_at).map(c => (
                <div key={c.consent_id} style={st.consentRow}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
                      {c.employee_email}
                    </p>
                    <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: "#94a3b8" }}>
                      Requested: {fmt(c.requested_at)}
                      {c.responded_at && ` · Responded: ${fmt(c.responded_at)}`}
                    </p>
                    {/* Declined — show professional message */}
                    {c.status === "DECLINED" && (
                      <p style={{ margin: "0.4rem 0 0", fontSize: "0.82rem", color: "#dc2626", fontWeight: 500 }}>
                        This employee has declined your data access request.
                      </p>
                    )}
                    {/* Pending — show waiting message + polling indicator */}
                    {c.status === "PENDING" && pollingConsentId === c.consent_id && (
                      <p style={{ margin: "0.4rem 0 0", fontSize: "0.82rem", color: "#ca8a04" }}>
                        🔄 Waiting for employee response…
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexShrink: 0 }}>
                    <StatusBadge status={c.status} />
                    {c.status === "APPROVED" && (
                      <button style={st.viewBtn} onClick={() => openProfile(c)}>
                        View Profile
                      </button>
                    )}
                    {c.status === "PENDING" && pollingConsentId !== c.consent_id && (
                      <button
                        style={{ ...st.viewBtn, background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0" }}
                        onClick={() => { setPollingConsentId(c.consent_id); setPolling(true); }}
                      >
                        Watch
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    PENDING:  { bg: "#fef9c3", color: "#ca8a04", label: "⏳ Pending"  },
    APPROVED: { bg: "#dcfce7", color: "#16a34a", label: "✅ Approved" },
    DECLINED: { bg: "#fee2e2", color: "#dc2626", label: "❌ Declined" },
  };
  const s = map[status] || map.PENDING;
  return (
    <span style={{ background: s.bg, color: s.color, padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 700, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

// ─── PersonalTab ──────────────────────────────────────────────────────────────
function PersonalTab({ data }) {
  const fullName   = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(" ");
  const fatherName = data.fatherName
    || [data.fatherFirst, data.fatherMiddle, data.fatherLast].filter(Boolean).join(" ") || "—";
  const addr = data.currentAddress   || {};
  const perm = data.permanentAddress || {};
  return (
    <div>
      <DataGrid rows={[
        ["Full Name",     fullName          || "—"],
        ["Father Name",   fatherName],
        ["Email",         data.email        || "—"],
        ["Mobile",        data.mobile       || "—"],
        ["Date of Birth", data.dob          || "—"],
        ["Gender",        data.gender       || "—"],
        ["Nationality",   data.nationality  || "—"],
        ["Aadhaar",       data.aadhaar ? `•••• •••• ${String(data.aadhaar).slice(-4)}` : "—"],
        ["PAN",           data.pan          || "—"],
        ["Passport",      data.passport     || "—"],
      ]} />
      <h4 style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}>Current Address</h4>
      <DataGrid rows={[
        ["Door & Street",  addr.door     || "—"],
        ["Village/Mandal", addr.village  || "—"],
        ["District/State", addr.district || "—"],
        ["Pincode",        addr.pin      || "—"],
        ["From",           addr.from     || "—"],
        ["To",             addr.to       || "—"],
      ]} />
      <h4 style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}>Permanent Address</h4>
      <DataGrid rows={[
        ["Door & Street",  perm.door     || "—"],
        ["Village/Mandal", perm.village  || "—"],
        ["District/State", perm.district || "—"],
        ["Pincode",        perm.pin      || "—"],
      ]} />
    </div>
  );
}

// ─── EducationTab ─────────────────────────────────────────────────────────────
const EDU_LABELS = {
  school: "School", college: "College", university: "University", course: "Course",
  board: "Board", hallTicket: "Hall Ticket No.", from: "From", to: "To",
  address: "Address", mode: "Mode", yearOfPassing: "Year of Passing",
  resultType: "Result Type", resultValue: "Result / %", medium: "Medium", backlogs: "Backlogs",
};

function EducationTab({ data }) {
  if (!data) return <Empty msg="No education data available." />;
  const sections = [
    { title: "Class X",       d: data.classX        },
    { title: "Intermediate",  d: data.intermediate  },
    { title: "Undergraduate", d: data.undergraduate },
    { title: "Postgraduate",  d: data.postgraduate  },
  ];
  const hasAny = sections.some(s => s.d && Object.values(s.d).some(v => v));
  if (!hasAny) return <Empty msg="No education data available." />;
  return (
    <div>
      {sections.map(({ title, d }) => {
        if (!d) return null;
        const rows = Object.entries(d).filter(([, v]) => v).map(([k, v]) => [EDU_LABELS[k] || k, String(v)]);
        if (!rows.length) return null;
        return (
          <div key={title} style={{ marginBottom: "1.75rem" }}>
            <h4 style={{ color: "#2563eb", marginBottom: "0.5rem" }}>{title}</h4>
            <DataGrid rows={rows} />
          </div>
        );
      })}
    </div>
  );
}

// ─── EmploymentTab ────────────────────────────────────────────────────────────
function EmploymentTab({ empId, token, onExpired }) {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empId || !token) return;
    fetch(`${API}/employee/employment-history/${empId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (r.status === 401) { onExpired && onExpired(); return null; }
        return r.ok ? r.json() : null;
      })
      .then(d => { setHistory(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [empId, token]);

  if (loading) return <p style={{ color: "#94a3b8" }}>Loading employment history…</p>;
  if (!history || !history.employments?.length) return <Empty msg="No employment history available." />;

  return (
    <div>
      {history.snapshot_at && (
        <p style={{ fontSize: "0.78rem", color: "#94a3b8", marginBottom: "1rem" }}>
          📸 Snapshot taken: {new Date(history.snapshot_at).toLocaleString()}
        </p>
      )}
      {history.employments.map((emp, i) => (
        <div key={i} style={{ marginBottom: "2rem", padding: "1.25rem", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <h4 style={{ color: "#2563eb", marginBottom: "0.75rem" }}>
            {`Previous ${i + 1}: ${emp.companyName || "Unknown"}`}
          </h4>
          <DataGrid rows={[
            ["Employee ID",        emp.employeeId         || "—"],
            ["Work Email",         emp.workEmail          || "—"],
            ["Designation",        emp.designation        || "—"],
            ["Department",         emp.department         || "—"],
            ["Employment Type",    emp.employmentType     || "—"],
            ["Reason for Leaving", emp.reasonForRelieving || "—"],
            ["Office Address",     emp.officeAddress      || "—"],
            ["Duties",             emp.duties             || "—"],
          ]} />
          {emp.reference?.name && (
            <>
              <h5 style={{ marginTop: "1rem", marginBottom: "0.4rem" }}>Reference</h5>
              <DataGrid rows={[
                ["Name",   emp.reference.name   || "—"],
                ["Role",   emp.reference.role   || "—"],
                ["Email",  emp.reference.email  || "—"],
                ["Mobile", emp.reference.mobile || "—"],
              ]} />
            </>
          )}
          <div style={{ marginTop: "0.75rem" }}>
            <DataGrid rows={[["Employment Gap", emp.gap?.hasGap === "Yes" ? `Yes — ${emp.gap.reason || ""}` : "No"]]} />
          </div>
        </div>
      ))}
      {history.acknowledgements && Object.values(history.acknowledgements).some(v => v?.val) && (
        <div style={{ padding: "1rem", background: "#f0fdf4", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
          <h4 style={{ marginBottom: "0.75rem", color: "#065f46" }}>Employment Declarations</h4>
          <DataGrid rows={[
            ["Running Other Business", history.acknowledgements.business?.val  || "—"],
            ["Ever Dismissed",         history.acknowledgements.dismissed?.val || "—"],
            ["Criminal Record",        history.acknowledgements.criminal?.val  || "—"],
            ["Civil Dispute",          history.acknowledgements.civil?.val     || "—"],
          ]} />
        </div>
      )}
    </div>
  );
}

// ─── UANTab ───────────────────────────────────────────────────────────────────
const ACK_LABELS = {
  truthful:      "All information provided is true and accurate",
  consent_aware: "Understands data shared only after explicit consent",
  docs_genuine:  "All documents and certificates are genuine",
  no_suppress:   "Has not withheld any material information",
  liability:     "Accepts legal liability for false information",
};

function UANTab({ data }) {
  return (
    <div>
      <DataGrid rows={[
        ["UAN Number",      data.uanNumber    || "—"],
        ["Name as per UAN", data.nameAsPerUan || "—"],
        ["Linked Mobile",   data.mobileLinked || "—"],
        ["UAN Active",      data.isActive     || "—"],
      ]} />
      {data.pfRecords?.length > 0 && (
        <>
          <h4 style={{ marginTop: "1.5rem", marginBottom: "0.75rem" }}>PF Records</h4>
          {data.pfRecords.map((pf, i) => (
            <div key={i} style={{ marginBottom: "1rem", padding: "1rem", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <DataGrid rows={[
                ["Company",                pf.companyName   || "—"],
                ["PF Member ID",           pf.pfMemberId    || "—"],
                ["Date of Joining (EPFO)", pf.dojEpfo       || "—"],
                ["Date of Exit (EPFO)",    pf.doeEpfo       || "—"],
                ["PF Transferred",         pf.pfTransferred || "—"],
              ]} />
            </div>
          ))}
        </>
      )}
      {data.acknowledgements_profile && Object.values(data.acknowledgements_profile).some(v => v === "Yes") && (
        <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#f0fdf4", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
          <h4 style={{ marginBottom: "0.75rem", color: "#065f46" }}>Profile Declarations</h4>
          {Object.entries(data.acknowledgements_profile).map(([key, val]) => (
            <div key={key} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ color: val === "Yes" ? "#16a34a" : "#94a3b8", fontWeight: 700, minWidth: "16px" }}>
                {val === "Yes" ? "✓" : "○"}
              </span>
              <span style={{ fontSize: "0.85rem", color: "#334155" }}>{ACK_LABELS[key] || key}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────
function DataGrid({ rows }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 1.5rem" }}>
      {rows.map(([label, value]) => (
        <div key={label} style={{ padding: "0.5rem 0", borderBottom: "1px solid #f1f5f9" }}>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
          <p style={{ margin: "0.15rem 0 0", fontSize: "0.95rem", color: "#0f172a", wordBreak: "break-all" }}>{value}</p>
        </div>
      ))}
    </div>
  );
}
function Empty({ msg }) {
  return <p style={{ color: "#94a3b8", marginTop: "1rem", fontStyle: "italic" }}>{msg}</p>;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = {
  page:        { background: "#f1f5f9", padding: "2rem", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" },
  card:        { maxWidth: "1020px", margin: "auto", background: "#fff", borderRadius: "14px", boxShadow: "0 12px 30px rgba(0,0,0,0.08)" },
  headerRow:   { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "1.75rem 2rem", borderBottom: "1px solid #f1f5f9" },
  logoutBtn:   { padding: "0.5rem 1.25rem", background: "#0f172a", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 },
  backBtn:     { padding: "0.4rem 1rem", background: "none", border: "1px solid #cbd5e1", borderRadius: "8px", cursor: "pointer", color: "#475569", fontSize: "0.9rem" },
  requestBox:  { background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "1.5rem 2rem" },
  emailInput:  { flex: 1, minWidth: "260px", padding: "0.65rem 1rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem" },
  requestBtn:  { padding: "0.65rem 1.5rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" },
  consentRow:  { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0", gap: "1rem" },
  viewBtn:     { padding: "0.45rem 1rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, whiteSpace: "nowrap" },
  tabNav:      { display: "flex", gap: "0.5rem", padding: "0 2rem", borderBottom: "2px solid #f1f5f9", flexWrap: "wrap" },
  tab:         { padding: "0.65rem 1.2rem", border: "none", background: "none", cursor: "pointer", fontWeight: 500, color: "#475569", fontSize: "0.9rem" },
  tabActive:   { color: "#2563eb", borderBottom: "2px solid #2563eb", fontWeight: 700 },
  modalOverlay:{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" },
  modalBox:    { background: "#fff", borderRadius: "14px", padding: "2rem", maxWidth: "400px", width: "90%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  cancelBtn:   { padding: "0.6rem 1.5rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontWeight: 600 },
  confirmBtn:  { padding: "0.6rem 1.5rem", borderRadius: "8px", border: "none", background: "#0f172a", color: "#fff", cursor: "pointer", fontWeight: 600 },
};
