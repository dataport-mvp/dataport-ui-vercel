// pages/employer/dashboard.js
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;
const DATA_TABS = ["Personal", "Education", "Employment", "UAN & PF"];

export default function EmployerDashboard() {
  const { user, apiFetch, logout, ready } = useAuth();
  const router = useRouter();

  const [consents, setConsents] = useState([]);
  const [selected, setSelected] = useState(null); // active consent
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState("Personal");
  const [requestEmail, setRequestEmail] = useState("");
  const [requestMsg, setRequestMsg] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  // Auth guard
  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/employer/login"); return; }
    if (user.role !== "employer") { router.replace("/employee/login"); return; }
  }, [ready, user, router]);

  const loadConsents = useCallback(async () => {
    try {
      const res = await apiFetch(`${API}/consent/my`);
      if (res.ok) {
        const data = await res.json();
        setConsents(Array.isArray(data) ? data : []);
      }
    } catch (_) {}
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => {
    if (ready && user) loadConsents();
  }, [ready, user, loadConsents]);

  const selectConsent = useCallback(async (consent) => {
    setSelected(consent);
    setProfileData(null);
    setActiveTab("Personal");
    if (consent.status !== "approved") return;
    try {
      // Profile snapshot is embedded in consent details
      const res = await apiFetch(`${API}/consent/${consent.consent_id}`);
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
      }
    } catch (_) {}
  }, [apiFetch]);

  const sendRequest = async () => {
    setRequestError("");
    setRequestSuccess("");
    if (!requestEmail) { setRequestError("Email is required"); return; }
    setRequesting(true);
    try {
      const res = await apiFetch(`${API}/consent/request`, {
        method: "POST",
        body: JSON.stringify({ employee_email: requestEmail, message: requestMsg }),
      });
      const data = await res.json();
      if (!res.ok) { setRequestError(data.detail || "Request failed"); return; }
      setRequestSuccess("Request sent successfully!");
      setRequestEmail("");
      setRequestMsg("");
      loadConsents();
    } catch {
      setRequestError("Network error — please try again");
    } finally {
      setRequesting(false);
    }
  };

  if (!ready || !user) return null;

  const approved = consents.filter(c => c.status === "approved");
  const pending = consents.filter(c => c.status === "pending");
  const declined = consents.filter(c => c.status === "declined");

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarTop}>
          <div style={styles.logo}>Datagate</div>
          <div style={styles.employerName}>{user.name}</div>
          <div style={styles.employerRole}>Employer</div>
        </div>

        {/* Request new */}
        <div style={styles.requestBox}>
          <div style={styles.requestTitle}>Request Employee Data</div>
          <input
            style={styles.sideInput}
            type="email"
            placeholder="Employee email"
            value={requestEmail}
            onChange={e => setRequestEmail(e.target.value)}
          />
          <textarea
            style={{ ...styles.sideInput, resize: "vertical", minHeight: 56 }}
            placeholder="Message (optional)"
            value={requestMsg}
            onChange={e => setRequestMsg(e.target.value)}
          />
          {requestError && <p style={styles.reqError}>{requestError}</p>}
          {requestSuccess && <p style={styles.reqSuccess}>{requestSuccess}</p>}
          <button style={styles.reqBtn} onClick={sendRequest} disabled={requesting}>
            {requesting ? "Sending…" : "Send Request"}
          </button>
        </div>

        {/* Consent list */}
        <div style={styles.consentList}>
          {loading ? (
            <div style={styles.sideEmpty}>Loading…</div>
          ) : consents.length === 0 ? (
            <div style={styles.sideEmpty}>No requests yet</div>
          ) : (
            <>
              {approved.length > 0 && <SideSection label="Approved" items={approved} selected={selected} onSelect={selectConsent} color="#16a34a" />}
              {pending.length > 0 && <SideSection label="Pending" items={pending} selected={selected} onSelect={selectConsent} color="#f59e0b" />}
              {declined.length > 0 && <SideSection label="Declined" items={declined} selected={selected} onSelect={selectConsent} color="#ef4444" />}
            </>
          )}
        </div>

        <button style={styles.logoutBtn} onClick={logout}>Sign out</button>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        {!selected ? (
          <div style={styles.emptyMain}>
            <div style={styles.emptyIcon}>👥</div>
            <p style={styles.emptyText}>Select an employee from the sidebar</p>
            <p style={styles.emptySub}>Approved requests will show full employee data here</p>
          </div>
        ) : (
          <div style={styles.profilePanel}>
            <div style={styles.profileHeader}>
              <div>
                <h2 style={styles.profileName}>{selected.employee_email}</h2>
                <span style={{ ...styles.statusBadge, background: selected.status === "approved" ? "#16a34a" : selected.status === "pending" ? "#f59e0b" : "#ef4444" }}>
                  {selected.status}
                </span>
              </div>
            </div>

            {selected.status !== "approved" ? (
              <div style={styles.pendingMsg}>
                {selected.status === "pending"
                  ? "Waiting for employee to respond to your request."
                  : "Employee declined this request."}
              </div>
            ) : !profileData ? (
              <div style={styles.pendingMsg}>Loading profile…</div>
            ) : (
              <>
                <div style={styles.tabs}>
                  {DATA_TABS.map(tab => (
                    <button
                      key={tab}
                      style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div style={styles.tabContent}>
                  {activeTab === "Personal" && <PersonalTab data={profileData?.profile_snapshot} />}
                  {activeTab === "Education" && <EducationTab data={profileData?.profile_snapshot?.education} />}
                  {activeTab === "Employment" && <EmploymentTab data={profileData?.employment_snapshot} />}
                  {activeTab === "UAN & PF" && <UanTab data={profileData?.profile_snapshot} />}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ── Sidebar sub-components ────────────────────────────────────────────────────

function SideSection({ label, items, selected, onSelect, color }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, padding: "0 0.75rem", marginBottom: 4 }}>{label}</div>
      {items.map(c => (
        <div
          key={c.consent_id}
          style={{
            ...styles.sideItem,
            ...(selected?.consent_id === c.consent_id ? styles.sideItemActive : {}),
          }}
          onClick={() => onSelect(c)}
        >
          <div style={styles.sideItemDot(color)} />
          <span style={styles.sideItemEmail}>{c.employee_email}</span>
        </div>
      ))}
    </div>
  );
}

// ── Data tab components ───────────────────────────────────────────────────────

function PersonalTab({ data }) {
  if (!data) return <Empty />;
  const fields = [
    ["First Name", data.firstName],
    ["Last Name", data.lastName],
    ["Date of Birth", data.dob],
    ["Gender", data.gender],
    ["Phone", data.phone],
    ["Aadhaar", data.aadhaar],
    ["PAN", data.pan],
    ["Address", data.address],
  ];
  return <FieldGrid fields={fields} />;
}

function EducationTab({ data }) {
  if (!data || !Array.isArray(data) || data.length === 0) return <Empty label="No education records" />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {data.map((edu, i) => (
        <div key={i} style={styles.dataCard}>
          <div style={styles.dataCardTitle}>{edu.level} — {edu.institution}</div>
          <FieldGrid fields={[
            ["Board / University", edu.board_or_university],
            ["Field of Study", edu.field_of_study],
            ["Year of Passing", edu.year_of_passing],
            ["Percentage / CGPA", edu.percentage_or_cgpa],
          ]} />
        </div>
      ))}
    </div>
  );
}

function EmploymentTab({ data }) {
  if (!data || !Array.isArray(data) || data.length === 0) return <Empty label="No employment records" />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {data.map((job, i) => (
        <div key={i} style={styles.dataCard}>
          <div style={styles.dataCardTitle}>{job.designation} @ {job.company_name}</div>
          <FieldGrid fields={[
            ["Employment Type", job.employment_type],
            ["Location", job.location],
            ["Start Date", job.start_date],
            ["End Date", job.is_current ? "Present" : job.end_date],
            ["Reason for Leaving", job.reason_for_leaving],
          ]} />
        </div>
      ))}
    </div>
  );
}

function UanTab({ data }) {
  if (!data) return <Empty />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <FieldGrid fields={[["UAN Number", data.uanNumber]]} />
      {Array.isArray(data.pfRecords) && data.pfRecords.map((pf, i) => (
        <div key={i} style={styles.dataCard}>
          <div style={styles.dataCardTitle}>PF Record {i + 1}</div>
          <FieldGrid fields={[
            ["Employer", pf.employer_name],
            ["PF Account", pf.pf_account_number],
            ["EPF Member ID", pf.epf_member_id],
            ["Period", pf.period],
          ]} />
        </div>
      ))}
    </div>
  );
}

function FieldGrid({ fields }) {
  return (
    <div style={styles.fieldGrid}>
      {fields.filter(([, v]) => v).map(([label, value]) => (
        <div key={label} style={styles.fieldItem}>
          <div style={styles.fieldLabel}>{label}</div>
          <div style={styles.fieldValue}>{value}</div>
        </div>
      ))}
    </div>
  );
}

function Empty({ label = "No data available" }) {
  return <div style={styles.pendingMsg}>{label}</div>;
}

const styles = {
  page: { display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif", background: "#f8fafc" },
  sidebar: { width: 280, minWidth: 280, background: "#fff", borderRight: "1.5px solid #e2e8f0", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0, overflow: "hidden" },
  sidebarTop: { padding: "1.25rem 1rem 0.75rem", borderBottom: "1.5px solid #f1f5f9" },
  logo: { fontSize: 18, fontWeight: 800, color: "#2563eb", marginBottom: 4 },
  employerName: { fontSize: 14, fontWeight: 600, color: "#0f172a" },
  employerRole: { fontSize: 12, color: "#94a3b8" },
  requestBox: { padding: "1rem", borderBottom: "1.5px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "0.5rem" },
  requestTitle: { fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 },
  sideInput: { width: "100%", padding: "0.6rem 0.75rem", border: "1.5px solid #e2e8f0", borderRadius: 7, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  reqError: { fontSize: 12, color: "#ef4444", margin: 0 },
  reqSuccess: { fontSize: 12, color: "#16a34a", margin: 0 },
  reqBtn: { padding: "0.6rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  consentList: { flex: 1, overflowY: "auto", padding: "0.75rem 0" },
  sideEmpty: { fontSize: 13, color: "#94a3b8", padding: "0.75rem 1rem" },
  sideItem: { display: "flex", alignItems: "center", gap: 8, padding: "0.6rem 0.75rem", cursor: "pointer", borderRadius: 7, margin: "0 0.25rem 2px", transition: "background 0.15s" },
  sideItemActive: { background: "#eff6ff" },
  sideItemDot: (color) => ({ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }),
  sideItemEmail: { fontSize: 13, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  logoutBtn: { margin: "0.75rem", padding: "0.6rem", background: "none", border: "1.5px solid #e2e8f0", borderRadius: 7, fontSize: 13, color: "#64748b", cursor: "pointer" },
  main: { flex: 1, padding: "2rem", overflowY: "auto" },
  emptyMain: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 400, gap: 8, textAlign: "center" },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 16, fontWeight: 600, color: "#374151", margin: 0 },
  emptySub: { fontSize: 14, color: "#94a3b8", margin: 0 },
  profilePanel: { background: "#fff", borderRadius: 16, boxShadow: "0 2px 16px rgba(0,0,0,0.07)", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" },
  profileHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
  profileName: { fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" },
  statusBadge: { padding: "0.2rem 0.7rem", borderRadius: 999, fontSize: 12, fontWeight: 600, color: "#fff" },
  pendingMsg: { fontSize: 14, color: "#64748b", padding: "1rem", background: "#f8fafc", borderRadius: 8 },
  tabs: { display: "flex", gap: 4, borderBottom: "1.5px solid #e2e8f0", paddingBottom: 0 },
  tab: { padding: "0.6rem 1.1rem", background: "none", border: "none", borderBottom: "2.5px solid transparent", fontSize: 14, fontWeight: 500, color: "#64748b", cursor: "pointer", marginBottom: -1.5 },
  tabActive: { borderBottomColor: "#2563eb", color: "#2563eb", fontWeight: 700 },
  tabContent: { paddingTop: 8 },
  dataCard: { border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" },
  dataCardTitle: { fontSize: 15, fontWeight: 700, color: "#1e293b" },
  fieldGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" },
  fieldItem: { display: "flex", flexDirection: "column", gap: 2 },
  fieldLabel: { fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 },
  fieldValue: { fontSize: 14, color: "#0f172a", fontWeight: 500 },
};
