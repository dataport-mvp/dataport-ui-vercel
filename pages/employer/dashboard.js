// pages/employer/dashboard.js
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;
const DATA_TABS = ["Personal", "Education", "Employment", "UAN & PF"];

const pick = (...vals) => vals.find(v => v !== undefined && v !== null && v !== "");

const normalizeEducationSnapshot = (ed = {}) => ({
  classX: ed?.classX || ed?.class_x || {},
  intermediate: ed?.intermediate || ed?.classXII || ed?.class_xii || {},
  undergraduate: ed?.undergraduate || ed?.ug || {},
  postgraduate: ed?.postgraduate || ed?.pg || {},
});

const normalizeProfileSnapshot = (snap = {}) => {
  const u = snap?.uanMaster || snap?.uan_master || {};
  return {
    ...snap,
    education: normalizeEducationSnapshot(snap?.education || {}),
    uanNumber: pick(snap?.uanNumber, snap?.uan_number, u?.uanNumber, u?.uan_number),
    nameAsPerUan: pick(snap?.nameAsPerUan, snap?.name_as_per_uan, u?.nameAsPerUan, u?.name_as_per_uan),
    mobileLinked: pick(snap?.mobileLinked, snap?.mobile_linked, u?.mobileLinked, u?.mobile_linked),
    isActive: pick(snap?.isActive, snap?.is_active, u?.isActive, u?.is_active),
    pfRecords: Array.isArray(snap?.pfRecords) ? snap.pfRecords : (Array.isArray(snap?.pf_records) ? snap.pf_records : []),
  };
};


/* ── IST timestamp helper ─────────────────────────────────────────────── */
function toIST(ts) {
  if (!ts) return "—";
  try {
    const d = new Date(typeof ts === "number" && ts < 1e12 ? ts * 1000 : ts);
    return d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return "—"; }
}

/* ── Signout modal ────────────────────────────────────────────────────── */
function SignoutModal({ onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "2rem", maxWidth: 340, width: "90%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize: 34, marginBottom: "0.75rem" }}>👋</div>
        <h3 style={{ margin: "0 0 0.5rem", color: "#0f172a" }}>Sign out?</h3>
        <p style={{ color: "#64748b", fontSize: "0.88rem", marginBottom: "1.5rem" }}>You can sign back in anytime.</p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={onCancel}  style={{ flex: 1, padding: "0.7rem", borderRadius: 8, border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontWeight: 600 }}>Stay</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "0.7rem", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

/* ── Main dashboard ───────────────────────────────────────────────────── */
export default function EmployerDashboard() {
  const { user, apiFetch, logout, ready } = useAuth();
  const router = useRouter();

  const [showSignout,    setShowSignout]    = useState(false);
  const [consents,       setConsents]       = useState([]);
  const [selected,       setSelected]       = useState(null);
  const [profileData,    setProfileData]    = useState(null);
  const [activeDataTab,  setActiveDataTab]  = useState("Personal");
  const [consentTab,     setConsentTab]     = useState("pending"); // pending | completed | rejected
  const [searchPending,  setSearchPending]  = useState("");
  const [searchCompleted,setSearchCompleted]= useState("");
  const [searchRejected, setSearchRejected] = useState("");
  const [requestEmail,   setRequestEmail]   = useState("");
  const [requestMsg,     setRequestMsg]     = useState("");
  const [requesting,     setRequesting]     = useState(false);
  const [requestError,   setRequestError]   = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loading,        setLoading]        = useState(true);

  // Auth guard
  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/employer/login"); return; }
    if (user.role !== "employer") { router.replace("/employee/login"); return; }
  }, [ready, user, router]);

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
    request_message: c?.message || c?.comment || c?.request_message || c?.note || "",
    employee_email: c?.employee_email || c?.employeeEmail || c?.email || c?.target_employee_email || c?.targetEmail || c?.user_email || "",
    employee_name: c?.employee_name || c?.employeeName || c?.name || c?.user_name || "",
  });

  const getConsentId = (c) => c?.consent_id || c?.id || c?.consentId || c?._id;

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

  // Buckets
  const pending   = useMemo(() => consents.filter(c => c.status === "pending"),  [consents]);
  const completed = useMemo(() => consents.filter(c => c.status === "approved"), [consents]);
  const rejected  = useMemo(() => consents.filter(c => c.status === "declined"), [consents]);

  // Filtered per tab search
  const filter = (list, q) => {
    if (!q.trim()) return list;
    const lq = q.toLowerCase();
    return list.filter(c =>
      (c.employee_email || "").toLowerCase().includes(lq) ||
      (c.employee_name  || "").toLowerCase().includes(lq) ||
      (c.request_message || "").toLowerCase().includes(lq)
    );
  };
  const filteredPending   = useMemo(() => filter(pending,   searchPending),   [pending,   searchPending]);
  const filteredCompleted = useMemo(() => filter(completed, searchCompleted), [completed, searchCompleted]);
  const filteredRejected  = useMemo(() => filter(rejected,  searchRejected),  [rejected,  searchRejected]);

  const selectConsent = useCallback(async (consent) => {
    setSelected(consent);
    setProfileData(null);
    setActiveDataTab("Personal");
    if (consent.status !== "approved") return;
    setLoadingProfile(true);
    try {
      const res = await apiFetch(`${API}/consent/${getConsentId(consent)}`);
      if (res.ok) {
        const raw = await res.json();
        setProfileData({
          ...raw,
          profile_snapshot: normalizeProfileSnapshot(raw?.profile_snapshot || raw?.employee || {}),
          employment_snapshot: raw?.employment_snapshot || raw?.employmentHistory || raw?.employment_history || [],
        });
      }
    } catch (_) {}
    setLoadingProfile(false);
  }, [apiFetch]);

  const sendRequest = async () => {
    setRequestError(""); setRequestSuccess("");
    if (!requestEmail) { setRequestError("Email is required"); return; }
    setRequesting(true);
    try {
      const res = await apiFetch(`${API}/consent/request`, {
        method: "POST",
        body: JSON.stringify({ employee_email: requestEmail, message: requestMsg }),
      });
      const data = await res.json();
      if (!res.ok) { setRequestError(parseError(data)); return; }
      setRequestSuccess("Request sent!");
      setRequestEmail(""); setRequestMsg("");
      loadConsents();
    } catch { setRequestError("Network error"); }
    finally { setRequesting(false); }
  };

  if (!ready || !user) return null;

  const tabCounts = { pending: pending.length, completed: completed.length, rejected: rejected.length };
  const currentList = consentTab === "pending" ? filteredPending : consentTab === "completed" ? filteredCompleted : filteredRejected;
  const currentSearch = consentTab === "pending" ? searchPending : consentTab === "completed" ? searchCompleted : searchRejected;
  const setCurrentSearch = consentTab === "pending" ? setSearchPending : consentTab === "completed" ? setSearchCompleted : setSearchRejected;

  return (
    <div style={s.page}>
      {showSignout && <SignoutModal onConfirm={logout} onCancel={() => setShowSignout(false)} />}

      {/* ── LEFT PANEL ─────────────────────────────────────── */}
      <aside style={s.sidebar}>
        {/* Header */}
        <div style={s.sideHeader}>
          <div style={s.logo}>Datagate</div>
          <div style={{ flex: 1 }}>
            <div style={s.userName}>{user.name || user.email}</div>
            <div style={s.userRole}>Employer</div>
          </div>
          <button onClick={() => setShowSignout(true)} style={s.signoutBtn} title="Sign out">⏻</button>
        </div>

        {/* Request box */}
        <div style={s.requestBox}>
          <div style={s.boxTitle}>Request Employee Data</div>
          <input
            style={s.sideInput}
            type="email"
            placeholder="Employee email address"
            value={requestEmail}
            onChange={e => setRequestEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendRequest()}
          />
          <textarea
            style={{ ...s.sideInput, resize: "vertical", minHeight: 52 }}
            placeholder="Message (optional)"
            value={requestMsg}
            onChange={e => setRequestMsg(e.target.value)}
          />
          {requestError   && <p style={s.reqError}>{requestError}</p>}
          {requestSuccess && <p style={s.reqSuccess}>{requestSuccess}</p>}
          <button style={s.reqBtn} onClick={sendRequest} disabled={requesting}>
            {requesting ? "Sending…" : "Send Request"}
          </button>
        </div>

        {/* Consent tabs */}
        <div style={s.tabRow}>
          {[["pending","Pending"],["completed","Completed"],["rejected","Rejected"]].map(([key, label]) => (
            <button key={key} style={{ ...s.tabBtn, ...(consentTab === key ? s.tabBtnActive : {}) }} onClick={() => setConsentTab(key)}>
              {label}
              {tabCounts[key] > 0 && (
                <span style={{ ...s.badge, background: consentTab === key ? "#2563eb" : "#e2e8f0", color: consentTab === key ? "#fff" : "#64748b" }}>
                  {tabCounts[key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ padding: "0.5rem 0.75rem 0.25rem" }}>
          <input
            style={s.searchInput}
            placeholder="Search by email or name…"
            value={currentSearch}
            onChange={e => setCurrentSearch(e.target.value)}
          />
        </div>

        {/* List */}
        <div style={s.consentList}>
          {loading ? (
            <div style={s.sideEmpty}>Loading…</div>
          ) : currentList.length === 0 ? (
            <div style={s.sideEmpty}>
              {currentSearch ? "No matches found" : `No ${consentTab} requests`}
            </div>
          ) : (
            currentList.map(c => {
              const dotColor = c.status === "approved" ? "#16a34a" : c.status === "pending" ? "#f59e0b" : "#ef4444";
              const ts = c.status === "approved" ? (c.approved_at || c.responded_at || c.updated_at) : c.status === "declined" ? (c.responded_at || c.updated_at) : (c.requested_at || c.created_at);
              return (
                <div
                  key={getConsentId(c)}
                  style={{ ...s.sideItem, ...(getConsentId(selected) === getConsentId(c) ? s.sideItemActive : {}) }}
                  onClick={() => selectConsent(c)}
                >
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, flexShrink: 0, marginTop: 3 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={s.sideEmail}>{c.employee_email}</div>
                    {c.employee_name && <div style={s.sideName}>{c.employee_name}</div>}
                    <div style={s.sideTs}>{toIST(ts)}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* ── RIGHT PANEL ────────────────────────────────────── */}
      <main style={s.main}>
        {!selected ? (
          <div style={s.emptyState}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Select an employee</div>
            <div style={{ fontSize: 14, color: "#94a3b8" }}>Approved requests will show full profile data here</div>
          </div>
        ) : (
          <div style={s.profileCard}>
            {/* Profile header */}
            <div style={s.profileHeader}>
              <div>
                <div style={s.profileEmail}>{selected.employee_email}</div>
                {selected.employee_name && <div style={s.profileName}>{selected.employee_name}</div>}
                <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                  <span style={{ ...s.pill, background: selected.status === "approved" ? "#dcfce7" : selected.status === "pending" ? "#fef9c3" : "#fee2e2", color: selected.status === "approved" ? "#15803d" : selected.status === "pending" ? "#a16207" : "#dc2626" }}>
                    {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
                  </span>
                  {selected.requested_at && <span style={s.tsChip}>Requested: {toIST(selected.requested_at)}</span>}
                  {(selected.responded_at || selected.approved_at || selected.updated_at) && <span style={s.tsChip}>Responded: {toIST(selected.responded_at || selected.approved_at || selected.updated_at)}</span>}
                  {(selected.request_message || selected.message || selected.comment) && (
                    <span style={s.msgChip}>Message: {selected.request_message || selected.message || selected.comment}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            {selected.status === "pending" && (
              <div style={s.statusMsg}>⏳ Waiting for employee to respond to your request.</div>
            )}
            {selected.status === "declined" && (
              <div style={{ ...s.statusMsg, background: "#fef2f2", color: "#dc2626" }}>❌ Employee declined this request.</div>
            )}
            {selected.status === "approved" && (
              loadingProfile ? (
                <div style={s.statusMsg}>Loading profile…</div>
              ) : !profileData ? (
                <div style={s.statusMsg}>Could not load profile data.</div>
              ) : (
                <>
                  <div style={s.dataTabs}>
                    {DATA_TABS.map(tab => (
                      <button key={tab} style={{ ...s.dataTab, ...(activeDataTab === tab ? s.dataTabActive : {}) }} onClick={() => setActiveDataTab(tab)}>
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div style={{ paddingTop: 8 }}>
                    {activeDataTab === "Personal"    && <PersonalTab   data={profileData?.profile_snapshot} />}
                    {activeDataTab === "Education"   && <EducationTab  data={profileData?.profile_snapshot?.education} />}
                    {activeDataTab === "Employment"  && <EmploymentTab data={profileData?.employment_snapshot} />}
                    {activeDataTab === "UAN & PF"    && <UanTab        data={profileData?.profile_snapshot} />}
                  </div>
                </>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/* ── Data tab components ─────────────────────────────────────────────── */

function PersonalTab({ data }) {
  if (!data) return <NoData />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Card title="Name & Identity">
        <Grid fields={[
          ["First Name",    data.firstName],
          ["Middle Name",   data.middleName],
          ["Last Name",     data.lastName],
          ["Father's Name", data.fatherName],
          ["Date of Birth", data.dob],
          ["Gender",        data.gender],
          ["Nationality",   data.nationality],
          ["Passport",      data.passport],
        ]} />
      </Card>
      <Card title="Contact">
        <Grid fields={[
          ["Email",  data.email],
          ["Mobile", data.mobile],
          ["Aadhaar",data.aadhaar],
          ["PAN",    data.pan],
        ]} />
      </Card>
      {data.currentAddress && <Card title="Current Address"><AddressBlock a={data.currentAddress} /></Card>}
      {data.permanentAddress && <Card title="Permanent Address"><AddressBlock a={data.permanentAddress} /></Card>}
    </div>
  );
}

function EducationTab({ data }) {
  if (!data) return <NoData label="No education records" />;
  const sections = [
    ["Class X",         data.classX],
    ["Intermediate",    data.intermediate],
    ["Undergraduate",   data.undergraduate],
    ["Postgraduate",    data.postgraduate],
  ].filter(([, d]) => d && Object.values(d).some(Boolean));
  if (!sections.length) return <NoData label="No education records" />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {sections.map(([title, d]) => (
        <Card key={title} title={title}>
          <Grid fields={[
            ["School / College",  d.school || d.college || d.school_name],
            ["Board / University",d.board  || d.university || d.board_name],
            ["Course / Degree",   d.course],
            ["Hall Ticket",       d.hallTicket || d.hall_ticket],
            ["Year of Passing",   d.yearOfPassing || d.year_of_passing],
            ["Result Type",       d.resultType || d.result_type],
            ["Result Value",      d.resultValue || d.result_value],
            ["Mode",              d.mode],
            ["Medium",            d.medium],
            ["Backlogs",          d.backlogs],
            ["From",              d.from],
            ["To",                d.to],
          ]} />
        </Card>
      ))}
    </div>
  );
}

function EmploymentTab({ data }) {
  const list = Array.isArray(data) ? data : (data?.employments || []);
  if (!list.length) return <NoData label="No employment records" />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {list.map((job, i) => (
        <Card key={i} title={`${job.designation || "Employee"} @ ${job.companyName || job.company_name || "—"}`}>
          <Grid fields={[
            ["Company",          job.companyName    || job.company_name],
            ["Employee ID",      job.employeeId     || job.employee_id],
            ["Work Email",       job.workEmail      || job.work_email],
            ["Designation",      job.designation],
            ["Department",       job.department],
            ["Employment Type",  job.employmentType || job.employment_type],
            ["Reason for Leaving",job.reasonForRelieving || job.reason_for_leaving],
            ["Office Address",   job.officeAddress  || job.office_address],
          ]} />
          {job.reference?.name && (
            <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Reference</div>
              <Grid fields={[
                ["Name",  job.reference.name],
                ["Role",  job.reference.role],
                ["Email", job.reference.email],
                ["Mobile",job.reference.mobile],
              ]} />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function UanTab({ data }) {
  if (!data) return <NoData />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Card title="UAN Details">
        <Grid fields={[
          ["UAN Number",     data.uanNumber],
          ["Name as per UAN",data.nameAsPerUan],
          ["Mobile Linked",  data.mobileLinked],
          ["UAN Active",     data.isActive],
        ]} />
      </Card>
      {Array.isArray(data.pfRecords) && data.pfRecords.map((pf, i) => (
        <Card key={i} title={`PF Record — ${pf.companyName || `Company ${i + 1}`}`}>
          <Grid fields={[
            ["Company",         pf.companyName || pf.company_name],
            ["PF Member ID",    pf.pfMemberId || pf.pf_member_id],
            ["Date of Joining", pf.dojEpfo || pf.doj_epfo],
            ["Date of Exit",    pf.doeEpfo || pf.doe_epfo],
            ["PF Transferred",  pf.pfTransferred || pf.pf_transferred],
          ]} />
        </Card>
      ))}
    </div>
  );
}

/* ── Shared UI helpers ───────────────────────────────────────────────── */
function Card({ title, children }) {
  return (
    <div style={{ border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "1rem" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: "0.75rem" }}>{title}</div>
      {children}
    </div>
  );
}

function Grid({ fields }) {
  const filled = fields.filter(([, v]) => v);
  if (!filled.length) return <div style={{ fontSize: 13, color: "#94a3b8" }}>No data</div>;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
      {filled.map(([label, value]) => (
        <div key={label}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
          <div style={{ fontSize: 14, color: "#0f172a", fontWeight: 500, marginTop: 2 }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

function AddressBlock({ a }) {
  const parts = [a.door, a.village, a.district, a.pin].filter(Boolean).join(", ");
  const period = a.from ? `${a.from}${a.to ? ` → ${a.to}` : ""}` : null;
  return (
    <div>
      {parts && <div style={{ fontSize: 14, color: "#0f172a" }}>{parts}</div>}
      {period && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Residing: {period}</div>}
    </div>
  );
}

function NoData({ label = "No data available" }) {
  return <div style={{ fontSize: 14, color: "#94a3b8", padding: "1rem", background: "#f8fafc", borderRadius: 8 }}>{label}</div>;
}

/* ── Styles ──────────────────────────────────────────────────────────── */
const s = {
  page:        { display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif", background: "#f1f5f9" },
  sidebar:     { width: 300, minWidth: 300, background: "#fff", borderRight: "1.5px solid #e2e8f0", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0 },
  sideHeader:  { display: "flex", alignItems: "center", gap: 10, padding: "1rem 0.85rem", borderBottom: "1.5px solid #f1f5f9" },
  logo:        { fontSize: 17, fontWeight: 800, color: "#2563eb", letterSpacing: -0.5, flexShrink: 0 },
  userName:    { fontSize: 13, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  userRole:    { fontSize: 11, color: "#94a3b8" },
  signoutBtn:  { background: "none", border: "1px solid #e2e8f0", borderRadius: 7, width: 30, height: 30, cursor: "pointer", color: "#64748b", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  requestBox:  { padding: "0.85rem", borderBottom: "1.5px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "0.5rem" },
  boxTitle:    { fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 },
  sideInput:   { width: "100%", padding: "0.55rem 0.75rem", border: "1.5px solid #e2e8f0", borderRadius: 7, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  reqError:    { fontSize: 12, color: "#ef4444", margin: 0 },
  reqSuccess:  { fontSize: 12, color: "#16a34a", margin: 0 },
  reqBtn:      { padding: "0.55rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  tabRow:      { display: "flex", borderBottom: "1.5px solid #f1f5f9", padding: "0 0.5rem" },
  tabBtn:      { flex: 1, padding: "0.6rem 0.25rem", background: "none", border: "none", borderBottom: "2px solid transparent", fontSize: 12, fontWeight: 600, color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginBottom: -1.5 },
  tabBtnActive:{ color: "#2563eb", borderBottomColor: "#2563eb" },
  badge:       { padding: "1px 7px", borderRadius: 999, fontSize: 11, fontWeight: 700 },
  searchInput: { width: "100%", padding: "0.5rem 0.75rem", border: "1.5px solid #e2e8f0", borderRadius: 7, fontSize: 12, outline: "none", fontFamily: "inherit", boxSizing: "border-box", background: "#f8fafc" },
  consentList: { flex: 1, overflowY: "auto", padding: "0.25rem 0 1rem" },
  sideEmpty:   { fontSize: 13, color: "#94a3b8", padding: "1rem 0.85rem" },
  sideItem:    { display: "flex", alignItems: "flex-start", gap: 8, padding: "0.6rem 0.85rem", cursor: "pointer", borderRadius: 8, margin: "0 0.3rem 2px", transition: "background 0.1s" },
  sideItemActive: { background: "#eff6ff" },
  sideEmail:   { fontSize: 13, color: "#1e293b", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  sideName:    { fontSize: 11, color: "#64748b", marginTop: 1 },
  sideTs:      { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  main:        { flex: 1, padding: "2rem", overflowY: "auto" },
  emptyState:  { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 400, textAlign: "center" },
  profileCard: { background: "#fff", borderRadius: 16, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" },
  profileHeader:{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
  profileEmail:{ fontSize: 18, fontWeight: 700, color: "#0f172a" },
  profileName: { fontSize: 14, color: "#64748b", marginTop: 2 },
  pill:        { padding: "0.2rem 0.75rem", borderRadius: 999, fontSize: 12, fontWeight: 700 },
  tsChip:      { fontSize: 12, color: "#64748b", background: "#f1f5f9", padding: "0.2rem 0.6rem", borderRadius: 6 },
  msgChip:     { fontSize: 12, color: "#1d4ed8", background: "#eff6ff", padding: "0.2rem 0.6rem", borderRadius: 6, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  statusMsg:   { fontSize: 14, color: "#64748b", padding: "1rem", background: "#f8fafc", borderRadius: 8 },
  dataTabs:    { display: "flex", gap: 4, borderBottom: "1.5px solid #e2e8f0", marginBottom: 0 },
  dataTab:     { padding: "0.55rem 1rem", background: "none", border: "none", borderBottom: "2.5px solid transparent", fontSize: 14, fontWeight: 500, color: "#64748b", cursor: "pointer", marginBottom: -1.5 },
  dataTabActive:{ borderBottomColor: "#2563eb", color: "#2563eb", fontWeight: 700 },
};
