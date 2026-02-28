// pages/employer/dashboard.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const TABS = ["Personal", "Education", "Employment", "UAN & PF"];

export default function EmployerDashboard() {
  const router       = useRouter();
  const { token, user, logout } = useAuth();

  const [emailInput,    setEmailInput]    = useState("");
  const [searchError,   setSearchError]   = useState("");
  const [searching,     setSearching]     = useState(false);

  // Consent state
  const [consentId,     setConsentId]     = useState(null);
  const [consentStatus, setConsentStatus] = useState(null); // PENDING | APPROVED | DECLINED
  const [polling,       setPolling]       = useState(false);

  // Employee data (unlocked after APPROVED)
  const [employeeData,  setEmployeeData]  = useState(null);
  const [employeeId,    setEmployeeId]    = useState(null);
  const [activeTab,     setActiveTab]     = useState("Personal");

  // Past requests list
  const [myConsents,    setMyConsents]    = useState([]);

  // ─── Load past consent requests on mount ─────────────────────────
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

  // ─── Poll consent status until APPROVED or DECLINED ──────────────
  useEffect(() => {
    if (!consentId || !polling) return;

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
        } else if (data.status === "DECLINED") {
          setPolling(false);
          clearInterval(interval);
        }
      } catch (_) {}
    }, 4000); // poll every 4 seconds

    return () => clearInterval(interval);
  }, [consentId, polling]);

  // ─── Step 1: Employer types email and hits Enter / Search ────────
  const handleSearch = async () => {
    if (!emailInput.trim()) return;
    setSearchError("");
    setConsentId(null);
    setConsentStatus(null);
    setEmployeeData(null);
    setSearching(true);

    try {
      const res = await fetch(`${API}/consent/request`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ employee_email: emailInput.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `Error ${res.status}`);

      setConsentId(data.consent_id);
      setEmployeeId(data.employee_id);
      setConsentStatus(data.message === "Consent already pending" ? "PENDING" : "PENDING");
      setPolling(true);
      fetchMyConsents(); // refresh list
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearching(false);
    }
  };

  // ─── Step 2: Fetch employee data once consent is APPROVED ────────
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

  // ─── Reopen a past consent ────────────────────────────────────────
  const reopenConsent = async (consent) => {
    setEmailInput(consent.employee_email || "");
    setConsentId(consent.consent_id);
    setEmployeeId(consent.employee_id);
    setConsentStatus(consent.status);
    setEmployeeData(null);

    if (consent.status === "APPROVED") {
      await fetchEmployeeData(consent.employee_id);
    } else if (consent.status === "PENDING") {
      setPolling(true);
    }
  };

  // ─── Render helpers ──────────────────────────────────────────────

  const statusBadge = (status) => {
    const map = {
      PENDING:  { bg: "#fef3c7", color: "#92400e", label: "⏳ Pending" },
      APPROVED: { bg: "#d1fae5", color: "#065f46", label: "✅ Approved" },
      DECLINED: { bg: "#fee2e2", color: "#991b1b", label: "❌ Declined" },
    };
    const s = map[status] || map.PENDING;
    return (
      <span style={{ background: s.bg, color: s.color, padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: "600" }}>
        {s.label}
      </span>
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>Employer Dashboard</h1>
            {user && <p style={styles.subtitle}>Logged in as <strong>{user.email}</strong></p>}
          </div>
          <button style={styles.logoutBtn} onClick={() => { logout(); router.push("/employer/login"); }}>
            Sign Out
          </button>
        </div>

        {/* ── Search bar ─────────────────────────────────────────── */}
        <div style={styles.searchBox}>
          <h3 style={{ marginBottom: "1rem", color: "#0f172a" }}>Request Employee Data</h3>
          <p style={styles.hint}>
            Enter the employee's email address. A consent request will be sent to them.
            Once they approve, their profile will appear here.
          </p>
          <div style={styles.searchRow}>
            <input
              style={styles.searchInput}
              type="email"
              placeholder="employee@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              style={{ ...styles.searchBtn, opacity: searching ? 0.7 : 1 }}
              onClick={handleSearch}
              disabled={searching}
            >
              {searching ? "Sending..." : "Request Access"}
            </button>
          </div>
          {searchError && <p style={styles.error}>{searchError}</p>}
        </div>

        {/* ── Consent status ─────────────────────────────────────── */}
        {consentStatus && !employeeData && (
          <div style={styles.statusCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: 0, fontWeight: "600" }}>Consent request sent to: <em>{emailInput}</em></p>
                <p style={{ margin: "0.4rem 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                  {consentStatus === "PENDING"
                    ? "Waiting for employee to respond..."
                    : consentStatus === "DECLINED"
                    ? "Employee declined the request."
                    : "Employee approved — loading data..."}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {statusBadge(consentStatus)}
                {consentStatus === "PENDING" && (
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                    {polling ? "🔄 Auto-checking..." : ""}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Employee data tabs (after APPROVED) ────────────────── */}
        {employeeData && (
          <div style={styles.dataSection}>
            <div style={styles.dataHeader}>
              <h2 style={{ margin: 0 }}>
                {employeeData.firstName} {employeeData.lastName}
              </h2>
              {statusBadge("APPROVED")}
            </div>

            {/* Tab nav */}
            <div style={styles.tabNav}>
              {TABS.map((tab) => (
                <button
                  key={tab}
                  style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={styles.tabContent}>
              {activeTab === "Personal"    && <PersonalTab    data={employeeData} />}
              {activeTab === "Education"   && <EducationTab   data={employeeData.education} />}
              {activeTab === "Employment"  && <EmploymentTab  empId={employeeId} token={token} />}
              {activeTab === "UAN & PF"    && <UANTab         data={employeeData} />}
            </div>
          </div>
        )}

        {/* ── Past requests ──────────────────────────────────────── */}
        {myConsents.length > 0 && (
          <div style={{ marginTop: "2.5rem" }}>
            <h3 style={{ color: "#0f172a", marginBottom: "1rem" }}>Previous Requests</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {myConsents.map((c) => (
                <div key={c.consent_id} style={styles.consentRow}>
                  <div>
                    <p style={{ margin: 0, fontWeight: "600", fontSize: "0.95rem" }}>{c.employee_email || c.employee_id}</p>
                    <p style={{ margin: "0.25rem 0 0", fontSize: "0.8rem", color: "#94a3b8" }}>
                      Requested: {new Date(c.requested_at).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    {statusBadge(c.status)}
                    <button style={styles.viewBtn} onClick={() => reopenConsent(c)}>
                      {c.status === "APPROVED" ? "View Data" : "View"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


// ─── Tab Components ────────────────────────────────────────────────────────────

function PersonalTab({ data }) {
  const rows = [
    ["Full Name",    `${data.firstName || ""} ${data.middleName || ""} ${data.lastName || ""}`.trim()],
    ["Father Name",  data.fatherName   || "—"],
    ["Email",        data.email        || "—"],
    ["Mobile",       data.mobile       || "—"],
    ["Date of Birth",data.dob          || "—"],
    ["Gender",       data.gender       || "—"],
    ["Nationality",  data.nationality  || "—"],
    ["Aadhaar",      data.aadhaar ? `•••• •••• ${data.aadhaar.slice(-4)}` : "—"],
    ["PAN",          data.pan          || "—"],
    ["Passport",     data.passport     || "—"],
  ];
  const addr = data.currentAddress || {};
  const perm = data.permanentAddress || {};
  return (
    <div>
      <DataGrid rows={rows} />
      <h4 style={{ marginTop: "1.5rem" }}>Current Address</h4>
      <DataGrid rows={[
        ["Door & Street", addr.door     || "—"],
        ["Village/Mandal",addr.village  || "—"],
        ["District/State",addr.district || "—"],
        ["Pincode",       addr.pin      || "—"],
        ["From",          addr.from     || "—"],
        ["To",            addr.to       || "—"],
      ]} />
      <h4 style={{ marginTop: "1.5rem" }}>Permanent Address</h4>
      <DataGrid rows={[
        ["Door & Street", perm.door     || "—"],
        ["Village/Mandal",perm.village  || "—"],
        ["District/State",perm.district || "—"],
        ["Pincode",       perm.pin      || "—"],
      ]} />
    </div>
  );
}

function EducationTab({ data }) {
  if (!data) return <Empty msg="No education data available." />;
  const sections = [
    { title: "Class X",          d: data.classX },
    { title: "Intermediate",     d: data.intermediate },
    { title: "Undergraduate",    d: data.undergraduate },
    { title: "Postgraduate",     d: data.postgraduate },
  ];
  return (
    <div>
      {sections.map(({ title, d }) => d ? (
        <div key={title} style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ color: "#2563eb", marginBottom: "0.5rem" }}>{title}</h4>
          <DataGrid rows={Object.entries(d).map(([k, v]) => [k, String(v || "—")])} />
        </div>
      ) : null)}
    </div>
  );
}

function EmploymentTab({ empId, token }) {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empId) return;
    fetch(`${API}/employee/employment-history/${empId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { setHistory(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [empId]);

  if (loading) return <p style={{ color: "#94a3b8" }}>Loading employment history...</p>;
  if (!history || !history.employments?.length) return <Empty msg="No employment history available." />;

  return (
    <div>
      {history.employments.map((emp, i) => (
        <div key={i} style={{ marginBottom: "2rem", padding: "1.25rem", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <h4 style={{ color: "#2563eb", marginBottom: "0.75rem" }}>
            {i === 0 ? "Current" : `Previous ${i}`}: {emp.companyName}
          </h4>
          <DataGrid rows={[
            ["Employee ID",       emp.employeeId        || "—"],
            ["Work Email",        emp.workEmail         || "—"],
            ["Designation",       emp.designation       || "—"],
            ["Department",        emp.department        || "—"],
            ["Employment Type",   emp.employmentType    || "—"],
            ["Reason for Leaving",emp.reasonForRelieving|| "—"],
            ["Office Address",    emp.officeAddress     || "—"],
            ["Duties",            emp.duties            || "—"],
          ]} />
          {emp.reference?.name && (
            <>
              <h5 style={{ marginTop: "1rem" }}>Reference</h5>
              <DataGrid rows={[
                ["Name",   emp.reference.name   || "—"],
                ["Role",   emp.reference.role   || "—"],
                ["Email",  emp.reference.email  || "—"],
                ["Mobile", emp.reference.mobile || "—"],
              ]} />
            </>
          )}
          <DataGrid rows={[["Employment Gap", emp.gap?.hasGap === "Yes" ? `Yes — ${emp.gap.reason || ""}` : "No"]]} />
        </div>
      ))}

      {history.acknowledgements && (
        <div style={{ marginTop: "1rem" }}>
          <h4>Declarations</h4>
          <DataGrid rows={[
            ["Other Business",   history.acknowledgements.business?.val  || "—"],
            ["Dismissed",        history.acknowledgements.dismissed?.val || "—"],
            ["Criminal Record",  history.acknowledgements.criminal?.val  || "—"],
            ["Civil Dispute",    history.acknowledgements.civil?.val     || "—"],
          ]} />
        </div>
      )}
    </div>
  );
}

function UANTab({ data }) {
  const rows = [
    ["UAN Number",      data.uanNumber    || "—"],
    ["Name as per UAN", data.nameAsPerUan || "—"],
    ["Linked Mobile",   data.mobileLinked || "—"],
    ["UAN Active",      data.isActive     || "—"],
  ];
  return (
    <div>
      <DataGrid rows={rows} />
      {data.pfRecords?.length > 0 && (
        <>
          <h4 style={{ marginTop: "1.5rem" }}>PF Records</h4>
          {data.pfRecords.map((pf, i) => (
            <div key={i} style={{ marginBottom: "1rem", padding: "1rem", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <DataGrid rows={[
                ["Company",       pf.companyName  || "—"],
                ["PF Member ID",  pf.pfMemberId   || "—"],
                ["Date of Joining (EPFO)", pf.dojEpfo || "—"],
                ["Date of Exit (EPFO)",    pf.doeEpfo || "—"],
                ["PF Transferred",pf.pfTransferred|| "—"],
              ]} />
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─── Shared micro-components ──────────────────────────────────────────────────

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
  return <p style={{ color: "#94a3b8", marginTop: "1rem" }}>{msg}</p>;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  page:        { background: "#f1f5f9", padding: "2rem", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" },
  card:        { maxWidth: "980px", margin: "auto", background: "#fff", padding: "2rem", borderRadius: "14px", boxShadow: "0 12px 30px rgba(0,0,0,0.08)" },
  headerRow:   { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" },
  title:       { margin: 0 },
  subtitle:    { margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.9rem" },
  logoutBtn:   { padding: "0.5rem 1.25rem", background: "#0f172a", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" },
  searchBox:   { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" },
  hint:        { fontSize: "0.85rem", color: "#64748b", marginBottom: "1rem" },
  searchRow:   { display: "flex", gap: "0.75rem" },
  searchInput: { flex: 1, padding: "0.65rem 1rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem" },
  searchBtn:   { padding: "0.65rem 1.5rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", whiteSpace: "nowrap" },
  error:       { color: "#dc2626", fontSize: "0.85rem", marginTop: "0.75rem" },
  statusCard:  { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", padding: "1.25rem", marginBottom: "1.5rem" },
  dataSection: { marginTop: "1.5rem" },
  dataHeader:  { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" },
  tabNav:      { display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "2px solid #f1f5f9", paddingBottom: "0.5rem" },
  tab:         { padding: "0.5rem 1.2rem", borderRadius: "8px", border: "none", background: "#f1f5f9", cursor: "pointer", fontWeight: "500", color: "#475569" },
  tabActive:   { background: "#2563eb", color: "#fff" },
  tabContent:  { minHeight: "200px" },
  consentRow:  { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" },
  viewBtn:     { padding: "0.4rem 1rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" },
};
