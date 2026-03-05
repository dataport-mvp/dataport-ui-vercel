// pages/employer/dashboard.js
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;
const DATA_TABS = ["Personal", "Education", "Employment", "UAN & PF", "Documents"];

const normalizeEducation = (ed = {}) => {
  const isNewFormat = !!(ed.xSchool || ed.xBoard || ed.xiiSchool || ed.degCollege || ed.pgCollege);
  if (isNewFormat) {
    return {
      classX:        { school: ed.xSchool,    board: ed.xBoard,    yearOfPassing: ed.xYear,   resultValue: ed.xPercent },
      intermediate:  { school: ed.xiiSchool,  board: ed.xiiBoard,  yearOfPassing: ed.xiiYear, resultValue: ed.xiiPercent },
      undergraduate: { college: ed.degCollege, course: ed.degName,  branch: ed.degBranch,      yearOfPassing: ed.degYear, resultValue: ed.degPercent },
      postgraduate:  { college: ed.pgCollege,  course: ed.pgName,   branch: ed.pgBranch,       yearOfPassing: ed.pgYear,  resultValue: ed.pgPercent },
    };
  }
  return {
    classX:        ed?.classX        || ed?.class_x   || {},
    intermediate:  ed?.intermediate  || ed?.classXII  || ed?.class_xii || {},
    undergraduate: ed?.undergraduate || ed?.ug        || {},
    postgraduate:  ed?.postgraduate  || ed?.pg        || {},
  };
};

const normalizeProfile = (snap = {}) => {
  const u = snap?.uanMaster || snap?.uan_master || {};
  return {
    ...snap,
    education:    normalizeEducation(snap?.education || {}),
    uanNumber:    snap?.uanNumber    || snap?.uan_number    || u?.uanNumber    || u?.uan_number,
    nameAsPerUan: snap?.nameAsPerUan || snap?.name_as_per_uan || u?.nameAsPerUan || u?.name_as_per_uan,
    mobileLinked: snap?.mobileLinked || snap?.mobile_linked  || u?.mobileLinked || u?.mobile_linked,
    isActive:     snap?.isActive     || snap?.is_active      || u?.isActive     || u?.is_active,
    pfRecords:    Array.isArray(snap?.pfRecords) ? snap.pfRecords : Array.isArray(snap?.pf_records) ? snap.pf_records : [],
  };
};

function toIST(ts) {
  if (!ts) return "—";
  try {
    const d = new Date(typeof ts === "number" && ts < 1e12 ? ts * 1000 : ts);
    return d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return "—"; }
}

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

export default function EmployerDashboard() {
  const { user, apiFetch, logout, ready } = useAuth();
  const router = useRouter();

  const [showSignout,     setShowSignout]     = useState(false);
  const [consents,        setConsents]        = useState([]);
  const [selected,        setSelected]        = useState(null);
  const [profileData,     setProfileData]     = useState(null);
  const [documents,       setDocuments]       = useState(null);  // S3 documents
  const [docsLoading,     setDocsLoading]     = useState(false);
  const [activeDataTab,   setActiveDataTab]   = useState("Personal");
  const [consentTab,      setConsentTab]      = useState("pending");
  const [searchPending,   setSearchPending]   = useState("");
  const [searchCompleted, setSearchCompleted] = useState("");
  const [searchRejected,  setSearchRejected]  = useState("");
  const [requestEmail,    setRequestEmail]    = useState("");
  const [requestMsg,      setRequestMsg]      = useState("");
  const [requesting,      setRequesting]      = useState(false);
  const [requestError,    setRequestError]    = useState("");
  const [requestSuccess,  setRequestSuccess]  = useState("");
  const [loadingProfile,  setLoadingProfile]  = useState(false);
  const [loading,         setLoading]         = useState(true);

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/employer/login"); return; }
    if (user.role !== "employer") { router.replace("/employee/login"); return; }
  }, [ready, user, router]);

  const normalizeStatus = (status) => {
    const s = String(status || "pending").toLowerCase();
    if (["approved","approve","accepted","granted","allow"].includes(s)) return "approved";
    if (["declined","decline","rejected","denied","reject"].includes(s)) return "declined";
    return "pending";
  };

  const normalizeConsent = (c) => ({
    ...c,
    consent_id:      c?.consent_id     || c?.id        || c?.consentId  || c?._id,
    status:          normalizeStatus(c?.status),
    request_message: c?.request_message || c?.message   || c?.comment   || c?.note || "",
    employee_email:  c?.employee_email  || c?.employeeEmail || c?.email || c?.target_employee_email || c?.user_email || "",
    employee_name:   c?.employee_name   || c?.employeeName  || c?.name  || c?.user_name || "",
    employer_name:   c?.requestor_name  || c?.employer_name || c?.employerName || "",
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

  useEffect(() => { if (ready && user) loadConsents(); }, [ready, user, loadConsents]);
  useEffect(() => {
    if (!ready || !user) return;
    const id = setInterval(loadConsents, 15000);
    return () => clearInterval(id);
  }, [ready, user, loadConsents]);

  const pending   = useMemo(() => consents.filter(c => c.status === "pending"),  [consents]);
  const completed = useMemo(() => consents.filter(c => c.status === "approved"), [consents]);
  const rejected  = useMemo(() => consents.filter(c => c.status === "declined"), [consents]);

  const filter = (list, q) => {
    if (!q.trim()) return list;
    const lq = q.toLowerCase();
    return list.filter(c => (c.employee_email || "").toLowerCase().includes(lq) || (c.employee_name || "").toLowerCase().includes(lq) || (c.request_message || "").toLowerCase().includes(lq));
  };

  const filteredPending   = useMemo(() => filter(pending,   searchPending),   [pending,   searchPending]);
  const filteredCompleted = useMemo(() => filter(completed, searchCompleted), [completed, searchCompleted]);
  const filteredRejected  = useMemo(() => filter(rejected,  searchRejected),  [rejected,  searchRejected]);

  const loadDocuments = useCallback(async (employeeId) => {
    if (!employeeId) return;
    setDocsLoading(true);
    try {
      const res = await apiFetch(`${API}/documents/${employeeId}`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || {});
      }
    } catch (_) {}
    setDocsLoading(false);
  }, [apiFetch]);

  const selectConsent = useCallback(async (consent) => {
    setSelected(consent);
    setProfileData(null);
    setDocuments(null);
    setActiveDataTab("Personal");
    if (consent.status !== "approved") return;
    setLoadingProfile(true);
    try {
      const res = await apiFetch(`${API}/consent/${getConsentId(consent)}`);
      if (res.ok) {
        const raw = await res.json();
        const profile = normalizeProfile(raw?.profile_snapshot || raw?.employee || {});
        setProfileData({
          ...raw,
          profile_snapshot:    profile,
          employment_snapshot: raw?.employment_snapshot || raw?.employmentHistory || raw?.employment_history || [],
        });
        // Load documents using employee_id from profile snapshot
        const empId = profile?.employee_id || raw?.employee_id || consent?.employee_id;
        if (empId) loadDocuments(empId);
      }
    } catch (_) {}
    setLoadingProfile(false);
  }, [apiFetch, loadDocuments]);

  const sendRequest = async () => {
    setRequestError(""); setRequestSuccess("");
    if (!requestEmail.trim()) { setRequestError("Email is required"); return; }
    setRequesting(true);
    try {
      const res = await apiFetch(`${API}/consent/request`, {
        method: "POST",
        body: JSON.stringify({ employee_email: requestEmail.trim().toLowerCase(), message: requestMsg.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setRequestError(parseError(data)); return; }
      setRequestSuccess("Request sent successfully!");
      setRequestEmail(""); setRequestMsg("");
      loadConsents();
    } catch { setRequestError("Network error — please try again"); }
    finally { setRequesting(false); }
  };

  if (!ready || !user) return null;

  const tabCounts        = { pending: pending.length, completed: completed.length, rejected: rejected.length };
  const currentList      = consentTab === "pending" ? filteredPending : consentTab === "completed" ? filteredCompleted : filteredRejected;
  const currentSearch    = consentTab === "pending" ? searchPending   : consentTab === "completed" ? searchCompleted   : searchRejected;
  const setCurrentSearch = consentTab === "pending" ? setSearchPending : consentTab === "completed" ? setSearchCompleted : setSearchRejected;

  return (
    <div style={s.page}>
      {showSignout && <SignoutModal onConfirm={logout} onCancel={() => setShowSignout(false)} />}

      <aside style={s.sidebar}>
        <div style={s.sideHeader}>
          <div style={s.logo}>Datagate</div>
          <div style={{ flex: 1 }}>
            <div style={s.userName}>{user.name || user.email}</div>
            <div style={s.userRole}>Employer</div>
          </div>
          <button onClick={() => setShowSignout(true)} style={s.signoutBtn} title="Sign out">⏻</button>
        </div>

        <div style={s.requestBox}>
          <div style={s.boxTitle}>Request Employee Data</div>
          <input style={s.sideInput} type="email" placeholder="Employee email address" value={requestEmail} onChange={e => setRequestEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && !requestMsg && sendRequest()} />
          <textarea style={{ ...s.sideInput, resize: "vertical", minHeight: 60, lineHeight: 1.4 }} placeholder="Message to employee (optional) — they will see this" value={requestMsg} onChange={e => setRequestMsg(e.target.value)} />
          {requestError   && <p style={s.reqError}>{requestError}</p>}
          {requestSuccess && <p style={s.reqSuccess}>{requestSuccess}</p>}
          <button style={s.reqBtn} onClick={sendRequest} disabled={requesting}>{requesting ? "Sending…" : "Send Request"}</button>
        </div>

        <div style={s.tabRow}>
          {[["pending","Pending"],["completed","Approved"],["rejected","Declined"]].map(([key, label]) => (
            <button key={key} style={{ ...s.tabBtn, ...(consentTab === key ? s.tabBtnActive : {}) }} onClick={() => setConsentTab(key)}>
              {label}
              {tabCounts[key] > 0 && <span style={{ ...s.badge, background: consentTab === key ? "#2563eb" : "#e2e8f0", color: consentTab === key ? "#fff" : "#64748b" }}>{tabCounts[key]}</span>}
            </button>
          ))}
        </div>

        <div style={{ padding: "0.5rem 0.75rem 0.25rem" }}>
          <input style={s.searchInput} placeholder="Search by email or name…" value={currentSearch} onChange={e => setCurrentSearch(e.target.value)} />
        </div>

        <div style={s.consentList}>
          {loading ? (
            <div style={s.sideEmpty}>Loading…</div>
          ) : currentList.length === 0 ? (
            <div style={s.sideEmpty}>{currentSearch ? "No matches found" : `No ${consentTab} requests`}</div>
          ) : (
            currentList.map(c => {
              const dotColor = c.status === "approved" ? "#16a34a" : c.status === "pending" ? "#f59e0b" : "#ef4444";
              const ts = c.status === "approved" ? (c.approved_at || c.responded_at || c.updated_at) : c.status === "declined" ? (c.responded_at || c.updated_at) : (c.requested_at || c.created_at);
              return (
                <div key={getConsentId(c)} style={{ ...s.sideItem, ...(getConsentId(selected) === getConsentId(c) ? s.sideItemActive : {}) }} onClick={() => selectConsent(c)}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, flexShrink: 0, marginTop: 4 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={s.sideEmail}>{c.employee_email}</div>
                    {c.employee_name && <div style={s.sideName}>{c.employee_name}</div>}
                    {c.request_message && <div style={{ ...s.sideTs, fontStyle: "italic", color: "#94a3b8" }}>"{c.request_message.slice(0, 40)}{c.request_message.length > 40 ? "…" : ""}"</div>}
                    <div style={s.sideTs}>{toIST(ts)}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      <main style={s.main}>
        {!selected ? (
          <div style={s.emptyState}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Select an employee</div>
            <div style={{ fontSize: 14, color: "#94a3b8" }}>Approved requests will show full profile data here</div>
          </div>
        ) : (
          <div style={s.profileCard}>
            <div style={s.profileHeader}>
              <div>
                <div style={s.profileEmail}>{selected.employee_email}</div>
                {selected.employee_name && <div style={s.profileName}>{selected.employee_name}</div>}
                <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ ...s.pill, background: selected.status === "approved" ? "#dcfce7" : selected.status === "pending" ? "#fef9c3" : "#fee2e2", color: selected.status === "approved" ? "#15803d" : selected.status === "pending" ? "#a16207" : "#dc2626" }}>
                    {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
                  </span>
                  {selected.requested_at && <span style={s.tsChip}>Requested: {toIST(selected.requested_at)}</span>}
                  {(selected.responded_at || selected.approved_at) && <span style={s.tsChip}>Responded: {toIST(selected.responded_at || selected.approved_at)}</span>}
                </div>
                {selected.request_message && (
                  <div style={s.msgBox}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: 0.5 }}>Your message to employee</span>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "#1e40af", lineHeight: 1.5 }}>{selected.request_message}</p>
                  </div>
                )}
              </div>
            </div>

            {selected.status === "pending"  && <div style={s.statusMsg}>⏳ Waiting for employee to approve your request.</div>}
            {selected.status === "declined" && <div style={{ ...s.statusMsg, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>❌ Employee declined this request.</div>}

            {selected.status === "approved" && (
              loadingProfile ? (
                <div style={s.statusMsg}>Loading profile data…</div>
              ) : !profileData ? (
                <div style={s.statusMsg}>Could not load profile data.</div>
              ) : (
                <>
                  {profileData.snapshot_at && <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>📸 Data snapshot taken at: {toIST(profileData.snapshot_at)}</div>}
                  <div style={s.dataTabs}>
                    {DATA_TABS.map(tab => (
                      <button key={tab} style={{ ...s.dataTab, ...(activeDataTab === tab ? s.dataTabActive : {}) }} onClick={() => setActiveDataTab(tab)}>{tab}</button>
                    ))}
                  </div>
                  <div style={{ paddingTop: 8 }}>
                    {activeDataTab === "Personal"   && <PersonalTab   data={profileData?.profile_snapshot} />}
                    {activeDataTab === "Education"  && <EducationTab  data={profileData?.profile_snapshot?.education} />}
                    {activeDataTab === "Employment" && <EmploymentTab data={profileData?.employment_snapshot} />}
                    {activeDataTab === "UAN & PF"   && <UanTab        data={profileData?.profile_snapshot} />}
                    {activeDataTab === "Documents"  && <DocumentsTab  documents={documents} loading={docsLoading} />}
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

/* ── Documents tab ───────────────────────────────────────────────────── */
const DOC_LABELS = {
  aadhaar:       "Aadhaar Card",
  pan:           "PAN Card",
  classX:        "Class X Certificate",
  intermediate:  "Intermediate Certificate",
  undergraduate: "UG Degree / Provisional",
  postgraduate:  "PG Degree / Provisional",
  epfo:          "EPFO Service History",
  payslips:      "Payslips (Last 3 Months)",
  offerLetter:   "Offer Letter",
  resignation:   "Resignation Acceptance",
  experience:    "Experience / Relieving Letter",
};

const SECTION_LABELS = {
  personal:    "Identity Documents",
  education:   "Education Certificates",
  uan:         "UAN / EPFO Documents",
};

function DocumentsTab({ documents, loading }) {
  if (loading) return <div style={{ fontSize: 14, color: "#64748b", padding: "1rem" }}>Loading documents…</div>;
  if (!documents || Object.keys(documents).length === 0) {
    return <NoData label="No documents uploaded yet" />;
  }

  // Group by section — personal, education, uan, employment/company_id
  const grouped = {};
  for (const [group, docs] of Object.entries(documents)) {
    const section = group.startsWith("employment/") ? "employment" : group;
    if (!grouped[section]) grouped[section] = [];
    grouped[section].push({ group, docs });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {Object.entries(grouped).map(([section, entries]) => (
        <Card key={section} title={SECTION_LABELS[section] || "Employment Documents"}>
          {entries.map(({ group, docs }) => (
            <div key={group}>
              {group.startsWith("employment/") && (
                <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, marginTop: 4 }}>
                  Company: {group.split("/")[1]}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {Object.entries(docs).map(([subKey, doc]) => (
                  <div key={subKey} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0.75rem", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{DOC_LABELS[subKey] || subKey}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{doc.filename} {doc.uploaded_at ? `· ${toIST(doc.uploaded_at)}` : ""}</div>
                    </div>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ padding: "0.4rem 1rem", background: "#2563eb", color: "#fff", borderRadius: 7, fontSize: 13, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
                      ↓ View
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Card>
      ))}
      <p style={{ fontSize: 12, color: "#94a3b8" }}>⏱ Document links expire in 1 hour. Refresh the page to get new links.</p>
    </div>
  );
}

/* ── Other data tab components ───────────────────────────────────────── */
function PersonalTab({ data }) {
  if (!data) return <NoData />;
  const cur  = data.currentAddress   || {};
  const perm = data.permanentAddress || {};
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Card title="Name & Identity">
        <Grid fields={[["First Name", data.firstName], ["Middle Name", data.middleName], ["Last Name", data.lastName], ["Father's Name", data.fatherName || [data.fatherFirst, data.fatherMiddle, data.fatherLast].filter(Boolean).join(" ")], ["Date of Birth", data.dob], ["Gender", data.gender], ["Nationality", data.nationality], ["Passport", data.passport]]} />
      </Card>
      <Card title="Contact & Documents">
        <Grid fields={[["Email", data.email], ["Mobile", data.mobile], ["Aadhaar", data.aadhaar || data.aadhar], ["PAN", data.pan]]} />
      </Card>
      {Object.values(cur).some(Boolean)  && <Card title="Current Address"><AddressBlock  a={cur}  /></Card>}
      {Object.values(perm).some(Boolean) && <Card title="Permanent Address"><AddressBlock a={perm} /></Card>}
    </div>
  );
}

function EducationTab({ data }) {
  if (!data) return <NoData label="No education records" />;
  const sections = [["10th / Class X", data.classX], ["12th / Intermediate", data.intermediate], ["Degree / Undergraduate", data.undergraduate], ["Post Graduation", data.postgraduate]].filter(([, d]) => d && Object.values(d).some(Boolean));
  if (!sections.length) return <NoData label="No education records found" />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {sections.map(([title, d]) => (
        <Card key={title} title={title}>
          <Grid fields={[["School / College", d.school || d.college], ["Board / University", d.board || d.university], ["Course / Degree", d.course], ["Branch", d.branch], ["Year of Passing", d.yearOfPassing || d.year_of_passing], ["Percentage / CGPA", d.resultValue || d.result_value], ["Mode", d.mode], ["Medium", d.medium], ["Backlogs", d.backlogs]]} />
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
          <Grid fields={[["Company", job.companyName || job.company_name], ["Employee ID", job.employeeId || job.employee_id], ["Work Email", job.workEmail || job.work_email], ["Designation", job.designation], ["Department", job.department], ["Employment Type", job.employmentType || job.employment_type], ["Reason for Leaving", job.reasonForRelieving || job.reason_for_leaving], ["Office Address", job.officeAddress || job.office_address], ["Duties", job.duties]]} />
          {job.reference?.name && (<div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #f1f5f9" }}><div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Reference</div><Grid fields={[["Name", job.reference.name], ["Role", job.reference.role], ["Email", job.reference.email], ["Mobile", job.reference.mobile]]} /></div>)}
          {job.gap?.hasGap === "Yes" && (<div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #f1f5f9" }}><div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Employment Gap</div><Grid fields={[["Reason", job.gap.reason]]} /></div>)}
        </Card>
      ))}
    </div>
  );
}

function UanTab({ data }) {
  if (!data) return <NoData />;
  const hasUan = data.uanNumber || data.nameAsPerUan;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Card title="UAN Details">
        {hasUan ? <Grid fields={[["UAN Number", data.uanNumber], ["Name as per UAN", data.nameAsPerUan], ["Mobile Linked", data.mobileLinked], ["UAN Active", data.isActive]]} /> : <NoData label="UAN details not provided" />}
      </Card>
      {Array.isArray(data.pfRecords) && data.pfRecords.length > 0
        ? data.pfRecords.map((pf, i) => (
            <Card key={i} title={`PF Record — ${pf.companyName || pf.company_name || `Company ${i + 1}`}`}>
              <Grid fields={[["Company", pf.companyName || pf.company_name], ["PF Member ID", pf.pfMemberId || pf.pf_member_id], ["Date of Joining", pf.dojEpfo || pf.doj_epfo], ["Date of Exit", pf.doeEpfo || pf.doe_epfo], ["PF Transferred", pf.pfTransferred || pf.pf_transferred]]} />
            </Card>
          ))
        : <Card title="PF Records"><NoData label="No PF records provided" /></Card>
      }
    </div>
  );
}

function Card({ title, children }) {
  return (<div style={{ border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "1rem" }}><div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: "0.75rem" }}>{title}</div>{children}</div>);
}
function Grid({ fields }) {
  const filled = fields.filter(([, v]) => v);
  if (!filled.length) return <div style={{ fontSize: 13, color: "#94a3b8" }}>No data</div>;
  return (<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.75rem" }}>{filled.map(([label, value]) => (<div key={label}><div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div><div style={{ fontSize: 14, color: "#0f172a", fontWeight: 500, marginTop: 2, wordBreak: "break-word" }}>{value}</div></div>))}</div>);
}
function AddressBlock({ a }) {
  const parts  = [a.door, a.village, a.district, a.pin].filter(Boolean).join(", ");
  const period = a.from ? `${a.from}${a.to ? ` → ${a.to}` : ""}` : null;
  return (<div>{parts && <div style={{ fontSize: 14, color: "#0f172a" }}>{parts}</div>}{period && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Residing: {period}</div>}</div>);
}
function NoData({ label = "No data available" }) {
  return <div style={{ fontSize: 14, color: "#94a3b8", padding: "1rem", background: "#f8fafc", borderRadius: 8 }}>{label}</div>;
}

const s = {
  page:         { display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif", background: "#f1f5f9" },
  sidebar:      { width: 300, minWidth: 300, background: "#fff", borderRight: "1.5px solid #e2e8f0", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0, overflowY: "auto" },
  sideHeader:   { display: "flex", alignItems: "center", gap: 10, padding: "1rem 0.85rem", borderBottom: "1.5px solid #f1f5f9" },
  logo:         { fontSize: 17, fontWeight: 800, color: "#2563eb", letterSpacing: -0.5, flexShrink: 0 },
  userName:     { fontSize: 13, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  userRole:     { fontSize: 11, color: "#94a3b8" },
  signoutBtn:   { background: "none", border: "1px solid #e2e8f0", borderRadius: 7, width: 30, height: 30, cursor: "pointer", color: "#64748b", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  requestBox:   { padding: "0.85rem", borderBottom: "1.5px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "0.5rem" },
  boxTitle:     { fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 },
  sideInput:    { width: "100%", padding: "0.55rem 0.75rem", border: "1.5px solid #e2e8f0", borderRadius: 7, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  reqError:     { fontSize: 12, color: "#ef4444", margin: 0 },
  reqSuccess:   { fontSize: 12, color: "#16a34a", margin: 0 },
  reqBtn:       { padding: "0.55rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  tabRow:       { display: "flex", borderBottom: "1.5px solid #f1f5f9", padding: "0 0.5rem" },
  tabBtn:       { flex: 1, padding: "0.6rem 0.25rem", background: "none", border: "none", borderBottom: "2px solid transparent", fontSize: 12, fontWeight: 600, color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginBottom: -1.5 },
  tabBtnActive: { color: "#2563eb", borderBottomColor: "#2563eb" },
  badge:        { padding: "1px 7px", borderRadius: 999, fontSize: 11, fontWeight: 700 },
  searchInput:  { width: "100%", padding: "0.5rem 0.75rem", border: "1.5px solid #e2e8f0", borderRadius: 7, fontSize: 12, outline: "none", fontFamily: "inherit", boxSizing: "border-box", background: "#f8fafc" },
  consentList:  { flex: 1, overflowY: "auto", padding: "0.25rem 0 1rem" },
  sideEmpty:    { fontSize: 13, color: "#94a3b8", padding: "1rem 0.85rem" },
  sideItem:     { display: "flex", alignItems: "flex-start", gap: 8, padding: "0.6rem 0.85rem", cursor: "pointer", borderRadius: 8, margin: "0 0.3rem 2px", transition: "background 0.1s" },
  sideItemActive:{ background: "#eff6ff" },
  sideEmail:    { fontSize: 13, color: "#1e293b", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  sideName:     { fontSize: 11, color: "#64748b", marginTop: 1 },
  sideTs:       { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  main:         { flex: 1, padding: "2rem", overflowY: "auto" },
  emptyState:   { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 400, textAlign: "center" },
  profileCard:  { background: "#fff", borderRadius: 16, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" },
  profileHeader:{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
  profileEmail: { fontSize: 18, fontWeight: 700, color: "#0f172a" },
  profileName:  { fontSize: 14, color: "#64748b", marginTop: 2 },
  pill:         { padding: "0.2rem 0.75rem", borderRadius: 999, fontSize: 12, fontWeight: 700 },
  tsChip:       { fontSize: 12, color: "#64748b", background: "#f1f5f9", padding: "0.2rem 0.6rem", borderRadius: 6 },
  msgBox:       { marginTop: "0.75rem", padding: "0.75rem 1rem", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, maxWidth: 480 },
  statusMsg:    { fontSize: 14, color: "#64748b", padding: "1rem", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" },
  dataTabs:     { display: "flex", gap: 4, borderBottom: "1.5px solid #e2e8f0", marginBottom: 0 },
  dataTab:      { padding: "0.55rem 1rem", background: "none", border: "none", borderBottom: "2.5px solid transparent", fontSize: 14, fontWeight: 500, color: "#64748b", cursor: "pointer", marginBottom: -1.5 },
  dataTabActive:{ borderBottomColor: "#2563eb", color: "#2563eb", fontWeight: 700 },
};
