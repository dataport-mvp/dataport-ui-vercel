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

function maskAadhaar(a) {
  if (!a) return "—";
  const d = String(a).replace(/\D/g, "");
  if (d.length < 4) return "XXXX XXXX XXXX";
  return `XXXX XXXX ${d.slice(-4)}`;
}

function SignoutModal({ onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,15,30,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(3px)" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "2rem", maxWidth: 340, width: "90%", textAlign: "center", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
        <div style={{ fontSize: 36, marginBottom: "0.75rem" }}>👋</div>
        <h3 style={{ margin: "0 0 0.4rem", color: "#0f172a", fontWeight: 700, fontSize: "1.05rem" }}>Sign out?</h3>
        <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1.5rem", lineHeight: 1.55 }}>You can sign back in anytime.</p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={onCancel}  style={{ flex: 1, padding: "0.7rem", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Stay</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "0.7rem", borderRadius: 9, border: "none", background: "#ef4444", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "0.875rem" }}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

const G = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f0f2f7; font-family: 'DM Sans', sans-serif; }

  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }

  .page { display: flex; min-height: 100vh; }

  /* ── Sidebar ── */
  .sidebar {
    width: 296px; min-width: 296px; background: #0f172a;
    display: flex; flex-direction: column;
    height: 100vh; position: sticky; top: 0; overflow-y: auto;
    border-right: 1px solid rgba(255,255,255,0.06);
  }

  .side-top {
    padding: 1.1rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.07);
    display: flex; align-items: center; gap: 0.75rem;
  }
  .brand { font-size: 1.15rem; font-weight: 700; color: #f8fafc; letter-spacing: -0.3px; }
  .brand-dot { width: 7px; height: 7px; border-radius: 50%; background: #3b82f6; flex-shrink: 0; margin-top: 1px; }
  .user-block { flex: 1; min-width: 0; }
  .user-name { font-size: 0.8rem; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .user-role { font-size: 0.68rem; color: #64748b; margin-top: 1px; text-transform: uppercase; letter-spacing: 0.5px; }
  .signout-btn {
    width: 30px; height: 30px; flex-shrink: 0; border-radius: 7px;
    border: 1px solid rgba(255,255,255,0.1); background: transparent;
    color: #64748b; font-size: 0.95rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center; transition: all 0.15s;
  }
  .signout-btn:hover { border-color: #ef4444; color: #ef4444; background: rgba(239,68,68,0.08); }

  .req-box { padding: 1rem 1.1rem; border-bottom: 1px solid rgba(255,255,255,0.07); }
  .req-label { font-size: 0.65rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 0.6rem; }
  .req-input {
    width: 100%; padding: 0.55rem 0.75rem; background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;
    font-family: inherit; font-size: 0.8rem; color: #e2e8f0; outline: none;
    transition: border-color 0.15s; margin-bottom: 0.45rem;
  }
  .req-input::placeholder { color: #475569; }
  .req-input:focus { border-color: #3b82f6; background: rgba(59,130,246,0.08); }
  .req-textarea { resize: vertical; min-height: 52px; line-height: 1.45; }
  .req-error   { font-size: 0.72rem; color: #f87171; margin: 0 0 0.3rem; }
  .req-success { font-size: 0.72rem; color: #4ade80; margin: 0 0 0.3rem; }
  .req-btn {
    width: 100%; padding: 0.58rem; background: #2563eb; color: #fff;
    border: none; border-radius: 8px; font-family: inherit; font-size: 0.8rem;
    font-weight: 600; cursor: pointer; transition: background 0.15s;
  }
  .req-btn:hover:not(:disabled) { background: #1d4ed8; }
  .req-btn:disabled { opacity: 0.55; cursor: not-allowed; }

  .tab-row { display: flex; border-bottom: 1px solid rgba(255,255,255,0.07); padding: 0 0.6rem; }
  .tab-btn {
    flex: 1; padding: 0.6rem 0.25rem; background: none; border: none;
    border-bottom: 2px solid transparent; font-size: 0.72rem; font-weight: 600;
    color: #475569; cursor: pointer; display: flex; align-items: center;
    justify-content: center; gap: 5px; margin-bottom: -1px; transition: color 0.15s;
    text-transform: uppercase; letter-spacing: 0.4px;
  }
  .tab-btn:hover { color: #94a3b8; }
  .tab-btn.active { color: #e2e8f0; border-bottom-color: #3b82f6; }
  .tab-badge {
    padding: 1px 6px; border-radius: 999px; font-size: 0.65rem; font-weight: 700;
    background: rgba(255,255,255,0.08); color: #94a3b8;
  }
  .tab-btn.active .tab-badge { background: #2563eb; color: #fff; }

  .search-wrap { padding: 0.65rem 0.9rem 0.3rem; }
  .search-input {
    width: 100%; padding: 0.45rem 0.7rem; background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08); border-radius: 7px;
    font-family: inherit; font-size: 0.78rem; color: #cbd5e1; outline: none;
    transition: border-color 0.15s;
  }
  .search-input::placeholder { color: #334155; }
  .search-input:focus { border-color: #3b82f6; }

  .consent-list { flex: 1; overflow-y: auto; padding: 0.3rem 0.5rem 1.5rem; }
  .list-empty { font-size: 0.78rem; color: #334155; padding: 1rem 0.6rem; }

  .c-item {
    display: flex; align-items: flex-start; gap: 0.6rem;
    padding: 0.65rem 0.75rem; border-radius: 9px; cursor: pointer;
    margin-bottom: 2px; transition: background 0.12s;
  }
  .c-item:hover { background: rgba(255,255,255,0.04); }
  .c-item.active { background: rgba(59,130,246,0.12); }
  .c-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
  .c-email { font-size: 0.78rem; color: #cbd5e1; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .c-msg { font-size: 0.7rem; color: #475569; font-style: italic; margin-top: 2px; }
  .c-ts { font-size: 0.68rem; color: #334155; margin-top: 2px; }

  /* ── Main ── */
  .main { flex: 1; padding: 2rem 2.25rem; overflow-y: auto; min-width: 0; }

  .empty-state {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; height: 100%; min-height: 420px; text-align: center;
  }
  .empty-icon { font-size: 44px; margin-bottom: 1rem; opacity: 0.35; }
  .empty-title { font-size: 1rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem; }
  .empty-sub { font-size: 0.84rem; color: #94a3b8; }

  .profile-card {
    background: #fff; border-radius: 14px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05);
    padding: 1.75rem; display: flex; flex-direction: column; gap: 1.25rem;
  }

  .p-email { font-size: 1.2rem; font-weight: 700; color: #0f172a; }
  .p-name  { font-size: 0.875rem; color: #64748b; margin-top: 3px; }

  .pill {
    display: inline-block; padding: 0.2rem 0.75rem; border-radius: 999px;
    font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px;
  }
  .pill-approved { background: #dcfce7; color: #15803d; }
  .pill-pending  { background: #fef9c3; color: #a16207; }
  .pill-declined { background: #fee2e2; color: #dc2626; }

  .ts-chip { font-size: 0.72rem; color: #64748b; background: #f1f5f9; padding: 0.2rem 0.6rem; border-radius: 6px; }

  .msg-box {
    padding: 0.75rem 1rem; background: #eff6ff; border: 1px solid #bfdbfe;
    border-radius: 9px; max-width: 480px;
  }
  .msg-label { font-size: 0.65rem; font-weight: 700; color: #1d4ed8; text-transform: uppercase; letter-spacing: 0.5px; }
  .msg-text  { margin-top: 4px; font-size: 0.82rem; color: #1e40af; line-height: 1.5; }

  .status-info {
    font-size: 0.875rem; color: #64748b; padding: 1rem 1.1rem;
    background: #f8fafc; border-radius: 9px; border: 1px solid #e2e8f0;
  }
  .status-declined {
    background: #fef2f2; color: #dc2626; border-color: #fecaca;
  }

  .snapshot-ts { font-size: 0.72rem; color: #94a3b8; }

  /* ── Data tabs ── */
  .data-tabs { display: flex; gap: 2px; border-bottom: 1.5px solid #e2e8f0; }
  .data-tab {
    padding: 0.55rem 1.1rem; background: none; border: none;
    border-bottom: 2.5px solid transparent; font-family: inherit;
    font-size: 0.82rem; font-weight: 500; color: #94a3b8; cursor: pointer;
    margin-bottom: -1.5px; transition: color 0.15s;
  }
  .data-tab:hover { color: #475569; }
  .data-tab.active { color: #2563eb; border-bottom-color: #2563eb; font-weight: 700; }

  /* ── Cards & grids ── */
  .section-card {
    border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 1rem 1.1rem; margin-bottom: 0.75rem;
  }
  .section-title { font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 0.75rem; }
  .kv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 0.75rem; }
  .kv-label { font-size: 0.65rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
  .kv-value { font-size: 0.875rem; color: #0f172a; font-weight: 500; margin-top: 2px; word-break: break-word; }
  .no-data { font-size: 0.82rem; color: #94a3b8; padding: 0.75rem; background: #f8fafc; border-radius: 8px; }

  .sub-divider { border-top: 1px solid #f1f5f9; margin-top: 0.75rem; padding-top: 0.75rem; }
  .sub-label { font-size: 0.65rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem; }

  /* ── Documents tab ── */
  .doc-section-title {
    font-size: 0.72rem; font-weight: 700; color: #374151;
    text-transform: uppercase; letter-spacing: 0.5px;
    margin-bottom: 0.6rem; margin-top: 0.25rem;
  }
  .doc-company-label { font-size: 0.65rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem; margin-top: 0.25rem; font-family: 'DM Mono', monospace; }
  .doc-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0.6rem 0.85rem; background: #f8fafc; border-radius: 8px;
    border: 1px solid #e2e8f0; margin-bottom: 0.4rem;
  }
  .doc-name { font-size: 0.82rem; font-weight: 600; color: #0f172a; }
  .doc-meta { font-size: 0.7rem; color: #94a3b8; margin-top: 2px; font-family: 'DM Mono', monospace; }
  .doc-view {
    padding: 0.38rem 0.9rem; background: #0f172a; color: #fff;
    border-radius: 7px; font-size: 0.78rem; font-weight: 600;
    text-decoration: none; white-space: nowrap; transition: background 0.15s;
  }
  .doc-view:hover { background: #1e293b; }
  .doc-expiry { font-size: 0.7rem; color: #94a3b8; margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #e2e8f0; }

  @media(max-width:768px){
    .sidebar { width: 100%; height: auto; position: relative; }
    .page { flex-direction: column; }
    .main { padding: 1.25rem; }
  }
`;

function TermsModal({ onAccept }) {
  const [checked, setChecked] = useState(false);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,15,30,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "2rem", maxWidth: 520, width: "90%", boxShadow: "0 24px 60px rgba(0,0,0,0.25)", maxHeight: "90vh", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div>
          <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.3rem" }}>Data Access & Sharing Agreement</div>
          <div style={{ fontSize: "0.78rem", color: "#64748b" }}>Please read and accept before accessing employee profiles</div>
        </div>
        <div style={{ overflowY: "auto", maxHeight: 320, fontSize: "0.8rem", color: "#374151", lineHeight: 1.7, padding: "1rem", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
          <p><strong>1. Purpose of Data Access</strong><br />You are accessing employee profile data solely for the purpose of background verification and/or onboarding of the employee who has given explicit consent for this access.</p>
          <p style={{ marginTop: "0.75rem" }}><strong>2. Data Usage Restrictions</strong><br />You agree not to use the employee's data for any purpose other than what was stated at the time of requesting consent. You will not share, sell, or transfer this data to any third party without obtaining fresh consent from the employee.</p>
          <p style={{ marginTop: "0.75rem" }}><strong>3. Data Storage Obligations</strong><br />If you store any data received from Datagate in your own systems, you become a data processor under India's Digital Personal Data Protection Act, 2023 (DPDP Act) and are solely responsible for its secure storage, processing, and deletion upon request.</p>
          <p style={{ marginTop: "0.75rem" }}><strong>4. Self-Reported Data</strong><br />All profile information has been self-reported by the employee. Datagate does not independently verify the accuracy of the data unless a verified check has been explicitly requested and completed. You are responsible for conducting any additional verification required.</p>
          <p style={{ marginTop: "0.75rem" }}><strong>5. Consent Withdrawal</strong><br />The employee retains the right to withdraw consent at any time. Upon withdrawal, you must cease using the data and delete any copies stored in your systems.</p>
          <p style={{ marginTop: "0.75rem" }}><strong>6. Compliance</strong><br />You confirm that your organisation complies with applicable data protection laws including the DPDP Act 2023 and will handle employee data accordingly.</p>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: "pointer" }} onClick={() => setChecked(p => !p)}>
          <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${checked ? "#2563eb" : "#cbd5e1"}`, background: checked ? "#2563eb" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
            {checked && <span style={{ color: "#fff", fontSize: "0.65rem", fontWeight: 800 }}>✓</span>}
          </div>
          <span style={{ fontSize: "0.8rem", color: "#374151", lineHeight: 1.55 }}>I have read and agree to the Data Access & Sharing Agreement on behalf of my organisation.</span>
        </div>
        <button
          onClick={() => { if (checked) { localStorage.setItem("dg_employer_terms", "1"); onAccept(); } }}
          disabled={!checked}
          style={{ padding: "0.75rem", background: checked ? "#0f172a" : "#e2e8f0", color: checked ? "#fff" : "#94a3b8", border: "none", borderRadius: 10, fontFamily: "inherit", fontSize: "0.875rem", fontWeight: 700, cursor: checked ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
          Accept & Continue to Dashboard
        </button>
      </div>
    </div>
  );
}

export default function EmployerDashboard() {
  const { user, apiFetch, logout, ready } = useAuth();
  const router = useRouter();

  const [showSignout,     setShowSignout]     = useState(false);
  const [termsAccepted,   setTermsAccepted]   = useState(false);
  const [consents,        setConsents]        = useState([]);
  const [selected,        setSelected]        = useState(null);
  const [profileData,     setProfileData]     = useState(null);
  const [documents,       setDocuments]       = useState(null);
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
    if (typeof window !== "undefined" && localStorage.getItem("dg_employer_terms") === "1") {
      setTermsAccepted(true);
    }
  }, []);

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
  if (!termsAccepted) return <TermsModal onAccept={() => setTermsAccepted(true)} />;

  const tabCounts        = { pending: pending.length, completed: completed.length, rejected: rejected.length };
  const currentList      = consentTab === "pending" ? filteredPending : consentTab === "completed" ? filteredCompleted : filteredRejected;
  const currentSearch    = consentTab === "pending" ? searchPending   : consentTab === "completed" ? searchCompleted   : searchRejected;
  const setCurrentSearch = consentTab === "pending" ? setSearchPending : consentTab === "completed" ? setSearchCompleted : setSearchRejected;

  return (
    <>
      <style>{G}</style>
      <div className="page">
        {showSignout && <SignoutModal onConfirm={logout} onCancel={() => setShowSignout(false)} />}

        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="side-top">
            <div className="brand-dot" />
            <div className="user-block">
              <div className="brand">Datagate</div>
              <div className="user-name">{user.name || user.email}</div>
              <div className="user-role">Employer</div>
            </div>
            <button className="signout-btn" onClick={() => setShowSignout(true)} title="Sign out">⏻</button>
          </div>

          {/* Request box */}
          <div className="req-box">
            <div className="req-label">Request Employee Data</div>
            <input
              className="req-input" type="email"
              placeholder="Employee email address"
              value={requestEmail} onChange={e => setRequestEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !requestMsg && sendRequest()}
            />
            <textarea
              className="req-input req-textarea"
              placeholder="Message to employee (optional) — they will see this"
              value={requestMsg} onChange={e => setRequestMsg(e.target.value)}
            />
            {requestError   && <p className="req-error">{requestError}</p>}
            {requestSuccess && <p className="req-success">{requestSuccess}</p>}
            <button className="req-btn" onClick={sendRequest} disabled={requesting}>
              {requesting ? "Sending…" : "Send Request"}
            </button>
          </div>

          {/* Tabs */}
          <div className="tab-row">
            {[["pending","Pending"],["completed","Approved"],["rejected","Declined"]].map(([key, label]) => (
              <button key={key} className={`tab-btn${consentTab === key ? " active" : ""}`} onClick={() => setConsentTab(key)}>
                {label}
                {tabCounts[key] > 0 && <span className="tab-badge">{tabCounts[key]}</span>}
              </button>
            ))}
          </div>

          <div className="search-wrap">
            <input className="search-input" placeholder="Search by email or name…" value={currentSearch} onChange={e => setCurrentSearch(e.target.value)} />
          </div>

          <div className="consent-list">
            {loading ? (
              <div className="list-empty">Loading…</div>
            ) : currentList.length === 0 ? (
              <div className="list-empty">{currentSearch ? "No matches found" : `No ${consentTab} requests`}</div>
            ) : currentList.map(c => {
              const dotColor = c.status === "approved" ? "#22c55e" : c.status === "pending" ? "#f59e0b" : "#ef4444";
              const ts = c.status === "approved" ? (c.approved_at || c.responded_at || c.updated_at) : c.status === "declined" ? (c.responded_at || c.updated_at) : (c.requested_at || c.created_at);
              return (
                <div key={getConsentId(c)} className={`c-item${getConsentId(selected) === getConsentId(c) ? " active" : ""}`} onClick={() => selectConsent(c)}>
                  <div className="c-dot" style={{ background: dotColor }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="c-email">{c.employee_email}</div>
                    {c.request_message && <div className="c-msg">"{c.request_message.slice(0, 38)}{c.request_message.length > 38 ? "…" : ""}"</div>}
                    <div className="c-ts">{toIST(ts)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="main">
          {!selected ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <div className="empty-title">Select an employee</div>
              <div className="empty-sub">Approved requests will show full profile data here</div>
            </div>
          ) : (
            <div className="profile-card">
              {/* Header */}
              <div>
                <div className="p-email">{selected.employee_email}</div>
                {selected.employee_name && <div className="p-name">{selected.employee_name}</div>}
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <span className={`pill pill-${selected.status}`}>
                    {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
                  </span>
                  {selected.requested_at && <span className="ts-chip">Requested: {toIST(selected.requested_at)}</span>}
                  {(selected.responded_at || selected.approved_at) && <span className="ts-chip">Responded: {toIST(selected.responded_at || selected.approved_at)}</span>}
                </div>
                {selected.request_message && (
                  <div className="msg-box" style={{ marginTop: "0.85rem" }}>
                    <div className="msg-label">Your message to employee</div>
                    <p className="msg-text">{selected.request_message}</p>
                  </div>
                )}
              </div>

              {selected.status === "pending"  && <div className="status-info">⏳ Waiting for employee to approve your request.</div>}
              {selected.status === "declined" && <div className="status-info status-declined">❌ Employee declined this request.</div>}

              {selected.status === "approved" && (
                loadingProfile ? (
                  <div className="status-info">Loading profile data…</div>
                ) : !profileData ? (
                  <div className="status-info">Could not load profile data.</div>
                ) : (
                  <>
                    {profileData.snapshot_at && <div className="snapshot-ts">📸 Snapshot taken: {toIST(profileData.snapshot_at)}</div>}
                  <div style={{ fontSize: "0.75rem", color: "#92400e", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "0.6rem 0.85rem" }}>
                    ⚠️ <strong>Self-reported data.</strong> This profile was filled and submitted by the employee. Documents are uploaded by the candidate and not independently verified by Datagate unless a verified check has been explicitly completed.
                  </div>
                    <div className="data-tabs">
                      {DATA_TABS.map(tab => (
                        <button key={tab} className={`data-tab${activeDataTab === tab ? " active" : ""}`} onClick={() => setActiveDataTab(tab)}>{tab}</button>
                      ))}
                    </div>
                    <div style={{ paddingTop: 4 }}>
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
    </>
  );
}

/* ── Shared components ──────────────────────────────────────────────── */
function SCard({ title, children }) {
  return (
    <div className="section-card">
      <div className="section-title">{title}</div>
      {children}
    </div>
  );
}

function KVGrid({ fields }) {
  const filled = fields.filter(([, v]) => v);
  if (!filled.length) return <div className="no-data">No data</div>;
  return (
    <div className="kv-grid">
      {filled.map(([label, value]) => (
        <div key={label}>
          <div className="kv-label">{label}</div>
          <div className="kv-value">{value}</div>
        </div>
      ))}
    </div>
  );
}

function NoData({ label = "No data available" }) {
  return <div className="no-data">{label}</div>;
}

/* ── Tab components ─────────────────────────────────────────────────── */
function PersonalTab({ data }) {
  if (!data) return <NoData />;
  const cur  = data.currentAddress   || {};
  const perm = data.permanentAddress || {};
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <SCard title="Name & Identity">
        <KVGrid fields={[["First Name", data.firstName], ["Middle Name", data.middleName], ["Last Name", data.lastName], ["Father's Name", data.fatherName || [data.fatherFirst, data.fatherMiddle, data.fatherLast].filter(Boolean).join(" ")], ["Date of Birth", data.dob], ["Gender", data.gender], ["Nationality", data.nationality], ["Passport", data.passport]]} />
      </SCard>
      <SCard title="Contact & Documents">
        <KVGrid fields={[["Email", data.email], ["Mobile", data.mobile], ["Aadhaar", maskAadhaar(data.aadhaar || data.aadhar)], ["PAN", data.pan]]} />
      </SCard>
      {Object.values(cur).some(Boolean) && (
        <SCard title="Current Address">
          <div style={{ fontSize: "0.875rem", color: "#0f172a" }}>{[cur.door, cur.village, cur.district, cur.pin].filter(Boolean).join(", ")}</div>
        </SCard>
      )}
      {Object.values(perm).some(Boolean) && (
        <SCard title="Permanent Address">
          <div style={{ fontSize: "0.875rem", color: "#0f172a" }}>{[perm.door, perm.village, perm.district, perm.pin].filter(Boolean).join(", ")}</div>
        </SCard>
      )}
    </div>
  );
}

function EducationTab({ data }) {
  if (!data) return <NoData label="No education records" />;
  const sections = [["10th / Class X", data.classX], ["12th / Intermediate", data.intermediate], ["Degree / Undergraduate", data.undergraduate], ["Post Graduation", data.postgraduate]].filter(([, d]) => d && Object.values(d).some(Boolean));
  if (!sections.length) return <NoData label="No education records found" />;
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {sections.map(([title, d]) => (
        <SCard key={title} title={title}>
          <KVGrid fields={[["School / College", d.school || d.college], ["Board / University", d.board || d.university], ["Course / Degree", d.course], ["Branch", d.branch], ["Year of Passing", d.yearOfPassing || d.year_of_passing], ["Percentage / CGPA", d.resultValue || d.result_value], ["Mode", d.mode], ["Medium", d.medium], ["Backlogs", d.backlogs]]} />
        </SCard>
      ))}
    </div>
  );
}

function EmploymentTab({ data }) {
  const list = Array.isArray(data) ? data : (data?.employments || []);
  if (!list.length) return <NoData label="No employment records" />;
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {list.map((job, i) => (
        <SCard key={i} title={`${job.designation || "Employee"} @ ${job.companyName || job.company_name || "—"}`}>
          <KVGrid fields={[["Company", job.companyName || job.company_name], ["Employee ID", job.employeeId || job.employee_id], ["Work Email", job.workEmail || job.work_email], ["Designation", job.designation], ["Department", job.department], ["Employment Type", job.employmentType || job.employment_type], ["Reason for Leaving", job.reasonForRelieving || job.reason_for_leaving], ["Office Address", job.officeAddress || job.office_address], ["Duties", job.duties]]} />
          {job.reference?.name && (
            <div className="sub-divider">
              <div className="sub-label">Reference</div>
              <KVGrid fields={[["Name", job.reference.name], ["Role", job.reference.role], ["Email", job.reference.email], ["Mobile", job.reference.mobile]]} />
            </div>
          )}
          {job.gap?.hasGap === "Yes" && (
            <div className="sub-divider">
              <div className="sub-label">Employment Gap</div>
              <KVGrid fields={[["Reason", job.gap.reason]]} />
            </div>
          )}
        </SCard>
      ))}
    </div>
  );
}

function UanTab({ data }) {
  if (!data) return <NoData />;
  const hasUan = data.uanNumber || data.nameAsPerUan;
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <SCard title="UAN Details">
        {hasUan
          ? <KVGrid fields={[["UAN Number", data.uanNumber], ["Name as per UAN", data.nameAsPerUan], ["Mobile Linked", data.mobileLinked], ["UAN Active", data.isActive]]} />
          : <NoData label="UAN details not provided" />}
      </SCard>
      {Array.isArray(data.pfRecords) && data.pfRecords.length > 0
        ? data.pfRecords.map((pf, i) => (
            <SCard key={i} title={`PF Record — ${pf.companyName || pf.company_name || `Company ${i + 1}`}`}>
              <KVGrid fields={[["Company", pf.companyName || pf.company_name], ["PF Member ID", pf.pfMemberId || pf.pf_member_id], ["Date of Joining", pf.dojEpfo || pf.doj_epfo], ["Date of Exit", pf.doeEpfo || pf.doe_epfo], ["PF Transferred", pf.pfTransferred || pf.pf_transferred]]} />
            </SCard>
          ))
        : <SCard title="PF Records"><NoData label="No PF records provided" /></SCard>
      }
    </div>
  );
}

const DOC_LABELS = {
  aadhaar: "Aadhaar Card", pan: "PAN Card", photo: "Profile Photo",
  classX: "Class X Certificate", intermediate: "Intermediate Certificate",
  ug_provisional: "UG Provisional Marksheet", ug_convocation: "UG Convocation",
  pg_provisional: "PG Provisional Marksheet", pg_convocation: "PG Convocation",
  undergraduate: "UG Degree", postgraduate: "PG Degree",
  diploma: "Diploma Certificate", uanCard: "UAN Card / Passbook", epfo: "EPFO Service History",
  payslips: "Payslips (Last 3 Months)", offerLetter: "Offer Letter",
  resignation: "Resignation Acceptance", experience: "Experience / Relieving Letter",
  idCard: "Company ID Card",
};

const SECTION_TITLES = {
  personal: "Identity Documents",
  education: "Education Certificates",
  uan: "UAN / EPFO Documents",
};

function DocumentsTab({ documents, loading }) {
  if (loading) return <div className="no-data">Loading documents…</div>;
  if (!documents || Object.keys(documents).length === 0) return <NoData label="No documents uploaded yet" />;

  const grouped = {};
  for (const [group, docs] of Object.entries(documents)) {
    const section = group.startsWith("employment/") ? "employment" : group;
    if (!grouped[section]) grouped[section] = [];
    grouped[section].push({ group, docs });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
      {Object.entries(grouped).map(([section, entries]) => (
        <div key={section}>
          <div className="doc-section-title">{SECTION_TITLES[section] || "Employment Documents"}</div>
          {entries.map(({ group, docs }) => (
            <div key={group}>
              {group.startsWith("employment/") && (
                <div className="doc-company-label">Company: {group.split("/")[1]}</div>
              )}
              {Object.entries(docs).map(([subKey, doc]) => (
                <div key={subKey} className="doc-row">
                  <div>
                    <div className="doc-name">{DOC_LABELS[subKey] || subKey}</div>
                    <div className="doc-meta">{doc.filename}{doc.uploaded_at ? ` · ${toIST(doc.uploaded_at)}` : ""}</div>
                  </div>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="doc-view">↓ View</a>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
      <div className="doc-expiry">⏱ Document links expire in 1 hour. Refresh the page to get new links.</div>
    </div>
  );
}