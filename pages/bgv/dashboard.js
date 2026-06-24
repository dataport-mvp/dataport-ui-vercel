// pages/bgv/dashboard.js
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const CHECK_STATUS = {
  pending:        { label:"Pending",        color:"#94a3b8", bg:"#f1f5f9" },
  in_progress:    { label:"In Progress",    color:"#3b82f6", bg:"#eff6ff" },
  verified:       { label:"Verified ✓",     color:"#16a34a", bg:"#f0fdf4" },
  failed:         { label:"Discrepancy ✗",  color:"#ef4444", bg:"#fef2f2" },
  on_hold:        { label:"On Hold",        color:"#f59e0b", bg:"#fffbeb" },
  not_applicable: { label:"N/A",            color:"#64748b", bg:"#f8fafc" },
};

const BGV_STATUS_BADGE = {
  assigned:    { label:"Assigned",    color:"#4f46e5", bg:"#eef2ff" },
  in_progress: { label:"In Progress", color:"#3b82f6", bg:"#eff6ff" },
  discrepancy: { label:"Discrepancy", color:"#ef4444", bg:"#fef2f2" },
  completed:   { label:"Completed",   color:"#16a34a", bg:"#f0fdf4" },
};

const OVERALL_STATUS = {
  clear:        { label:"CLEAR",       color:"#16a34a" },
  discrepancy:  { label:"DISCREPANCY", color:"#f59e0b" },
  failed:       { label:"FAILED",      color:"#ef4444" },
  refer:        { label:"REFER",       color:"#3b82f6" },
};

const G = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{background:#f0ece6;font-family:'DM Sans',sans-serif;}
  .pg{min-height:100vh;background:#f0ece6;padding-bottom:3rem;}
  .topbar{background:#0f172a;padding:0.85rem 1.75rem;display:flex;justify-content:space-between;align-items:center;margin-bottom:1.75rem;position:sticky;top:0;z-index:50;box-shadow:0 4px 20px rgba(0,0,0,0.4);}
  .logo-text{font-size:1.3rem;font-weight:800;color:#4f46e5;letter-spacing:-0.5px;}
  .logo-badge{font-size:0.6rem;font-weight:700;color:#94a3b8;letter-spacing:1.5px;text-transform:uppercase;margin-left:0.5rem;}
  .topbar-right{display:flex;align-items:center;gap:0.75rem;}
  .user-name{font-size:0.84rem;color:#94a3b8;font-weight:500;}
  .signout-btn{padding:0.38rem 1rem;border:1.5px solid #334155;border-radius:8px;background:transparent;color:#94a3b8;font-size:0.82rem;cursor:pointer;font-weight:600;font-family:inherit;transition:all 0.2s;}
  .signout-btn:hover{border-color:#ef4444;color:#ef4444;}
  .wrap{max-width:1100px;margin:auto;padding:0 1.25rem;}
  .tabs{display:flex;gap:0.25rem;background:#fff;border-radius:12px;padding:0.35rem;margin-bottom:1.5rem;box-shadow:0 2px 8px rgba(30,26,62,0.08);}
  .tab{flex:1;padding:0.6rem 1rem;border:none;background:transparent;border-radius:9px;font-family:inherit;font-size:0.84rem;font-weight:600;cursor:pointer;color:#64748b;transition:all 0.18s;}
  .tab.active{background:#4f46e5;color:#fff;box-shadow:0 2px 8px rgba(79,70,229,0.3);}
  .stat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:0.85rem;margin-bottom:1.25rem;}
  .stat-card{background:#fff;border-radius:12px;padding:1rem 1.2rem;box-shadow:0 2px 8px rgba(30,26,62,0.08);}
  .stat-num{font-size:1.75rem;font-weight:800;color:#0f172a;}
  .stat-lbl{font-size:0.72rem;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;margin-top:0.15rem;}
  .cases-table{background:#fff;border-radius:14px;box-shadow:0 2px 8px rgba(30,26,62,0.08);overflow:hidden;}
  .tbl-head{display:grid;grid-template-columns:2fr 1.5fr 1.2fr 1fr 1fr 0.8fr;gap:0;padding:0.75rem 1.25rem;background:#f8fafc;border-bottom:1px solid #e8ecf2;}
  .tbl-th{font-size:0.68rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;}
  .tbl-row{display:grid;grid-template-columns:2fr 1.5fr 1.2fr 1fr 1fr 0.8fr;gap:0;padding:0.9rem 1.25rem;border-bottom:1px solid #f1f5f9;align-items:center;transition:background 0.15s;cursor:pointer;}
  .tbl-row:hover{background:#f8fafc;}
  .tbl-row.selected{background:#eef2ff;border-left:3px solid #4f46e5;}
  .tbl-row:last-child{border-bottom:none;}
  .td-primary{font-size:0.875rem;font-weight:700;color:#0f172a;}
  .td-secondary{font-size:0.78rem;color:#64748b;font-weight:500;}
  .badge{display:inline-block;padding:0.2rem 0.6rem;border-radius:999px;font-size:0.68rem;font-weight:700;}
  .progress-bar{height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden;margin-top:0.3rem;}
  .progress-fill{height:100%;background:#4f46e5;border-radius:3px;transition:width 0.3s;}
  .case-detail{background:#fff;border-radius:14px;margin-top:1rem;box-shadow:0 2px 8px rgba(30,26,62,0.08);overflow:hidden;}
  .case-detail-header{background:#1e1b4b;padding:1.1rem 1.5rem;display:flex;justify-content:space-between;align-items:center;}
  .case-title{font-size:1rem;font-weight:800;color:#fff;}
  .case-subtitle{font-size:0.78rem;color:#a5b4fc;margin-top:0.15rem;}
  .case-body{display:grid;grid-template-columns:1fr 1.6fr;gap:0;}
  .profile-panel{padding:1.25rem;border-right:1px solid #f1f5f9;}
  .checks-panel{padding:1.25rem;}
  .panel-title{font-size:0.72rem;font-weight:800;color:#4f46e5;text-transform:uppercase;letter-spacing:1px;margin-bottom:1rem;}
  .profile-kv{display:flex;flex-direction:column;gap:0.12rem;margin-bottom:0.75rem;}
  .profile-key{font-size:0.67rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;}
  .profile-val{font-size:0.84rem;font-weight:600;color:#0f172a;}
  .check-row{display:grid;grid-template-columns:1.8fr 1fr 0.9fr 0.7fr;gap:0.5rem;align-items:start;padding:0.7rem 0;border-bottom:1px solid #f1f5f9;}
  .check-row:last-child{border-bottom:none;}
  .check-label{font-size:0.8rem;font-weight:600;color:#0f172a;}
  .check-type-tag{font-size:0.64rem;color:#94a3b8;margin-top:0.12rem;}
  .check-select{width:100%;padding:0.35rem 0.5rem;border:1.5px solid #e2e8f0;border-radius:7px;font-family:inherit;font-size:0.75rem;font-weight:600;cursor:pointer;outline:none;transition:border-color 0.18s;}
  .check-select:focus{border-color:#4f46e5;}
  .upload-btn{padding:0.28rem 0.65rem;background:#eef2ff;color:#4f46e5;border:1.5px solid #c7d2fe;border-radius:6px;font-size:0.7rem;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;}
  .upload-btn:hover{background:#e0e7ff;}
  .view-btn{padding:0.28rem 0.65rem;background:#f0fdf4;color:#16a34a;border:1.5px solid #bbf7d0;border-radius:6px;font-size:0.7rem;font-weight:700;cursor:pointer;font-family:inherit;}
  .notes-input{width:100%;padding:0.35rem 0.5rem;border:1.5px solid #e2e8f0;border-radius:7px;font-family:inherit;font-size:0.75rem;resize:none;outline:none;min-height:46px;}
  .notes-input:focus{border-color:#4f46e5;}
  .report-section{padding:1.25rem;border-top:1px solid #f1f5f9;background:#fafafa;}
  .report-title{font-size:0.8rem;font-weight:700;color:#0f172a;margin-bottom:0.75rem;}
  .report-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.75rem;}
  .fi{display:flex;flex-direction:column;gap:0.25rem;}
  .fl{font-size:0.68rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;}
  .in{padding:0.55rem 0.75rem;border:1.5px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:0.82rem;color:#0f172a;outline:none;width:100%;background:#fff;}
  .in:focus{border-color:#4f46e5;}
  .submit-btn{padding:0.65rem 1.5rem;background:#4f46e5;color:#fff;border:none;border-radius:9px;font-family:inherit;font-size:0.875rem;font-weight:700;cursor:pointer;transition:all 0.2s;}
  .submit-btn:hover{background:#4338ca;}
  .submit-btn:disabled{opacity:0.5;cursor:not-allowed;}
  .msg-thread{display:flex;flex-direction:column;gap:0.65rem;padding:1rem;max-height:380px;overflow-y:auto;}
  .msg-bubble{max-width:80%;padding:0.7rem 0.9rem;border-radius:12px;font-size:0.82rem;line-height:1.6;}
  .msg-bubble.mine{align-self:flex-end;background:#4f46e5;color:#fff;border-bottom-right-radius:3px;}
  .msg-bubble.theirs{align-self:flex-start;background:#f1f5f9;color:#0f172a;border-bottom-left-radius:3px;}
  .msg-bubble.employer-cc{align-self:flex-start;background:#fefce8;color:#0f172a;border:1px solid #fde68a;border-bottom-left-radius:3px;}
  .msg-meta{font-size:0.65rem;margin-top:0.3rem;opacity:0.7;}
  .msg-input-row{display:flex;gap:0.5rem;padding:0.75rem 1rem;border-top:1px solid #f1f5f9;background:#fafafa;}
  .msg-textarea{flex:1;padding:0.6rem 0.85rem;border:1.5px solid #e2e8f0;border-radius:9px;font-family:inherit;font-size:0.84rem;resize:none;outline:none;min-height:42px;}
  .msg-textarea:focus{border-color:#4f46e5;}
  .msg-send-btn{padding:0.6rem 1.1rem;background:#4f46e5;color:#fff;border:none;border-radius:9px;font-family:inherit;font-size:0.82rem;font-weight:700;cursor:pointer;}
  .recipient-sel{padding:0.4rem 0.6rem;border:1.5px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:0.75rem;outline:none;background:#fff;}
  .inbox-thread{padding:0.9rem 1.25rem;border-bottom:1px solid #f1f5f9;cursor:pointer;transition:background 0.15s;}
  .inbox-thread:hover{background:#f8fafc;}
  .inbox-thread.active{background:#eef2ff;border-left:3px solid #4f46e5;}
  .unread-dot{width:8px;height:8px;background:#4f46e5;border-radius:50%;flex-shrink:0;}
  .empty-state{padding:3rem;text-align:center;color:#94a3b8;font-size:0.875rem;font-weight:500;}
  @media(max-width:768px){.case-body{grid-template-columns:1fr;}.stat-row{grid-template-columns:repeat(2,1fr);}.tbl-head,.tbl-row{grid-template-columns:2fr 1fr 1fr;}.tbl-th:nth-child(n+4),.tbl-row>*:nth-child(n+4){display:none;}}
`;

function isoDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
}

export default function BgvDashboard() {
  const router = useRouter();
  const { user, apiFetch, logout, ready } = useAuth();

  const [tab, setTab]             = useState("cases");
  const [cases, setCases]         = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [caseDetail, setCaseDetail] = useState(null);
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Messaging
  const [inbox, setInbox]         = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [threadMsgs, setThreadMsgs] = useState([]);
  const [msgBody, setMsgBody]     = useState("");
  const [msgRecipient, setMsgRecipient] = useState("employee");
  const [sendingMsg, setSendingMsg] = useState(false);

  // Check update
  const [savingCheck, setSavingCheck] = useState({});
  const [localChecks, setLocalChecks] = useState([]);
  const uploadInputRef = useRef({});

  // Report submission
  const [reportFile, setReportFile]     = useState(null);
  const [reportSummary, setReportSummary] = useState("");
  const [reportVerdict, setReportVerdict] = useState("clear");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportDone, setReportDone]     = useState(false);
  const [saveStatus, setSaveStatus]     = useState("");

  // Role guard
  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/bgv/login"); return; }
    if (user.role !== "bgv") { router.replace("/bgv/login"); return; }
  }, [ready, user, router]);

  // Load cases
  useEffect(() => {
    if (!ready || !user) return;
    const load = async () => {
      try {
        const res = await apiFetch(`${API}/bgv/cases`);
        if (res.ok) setCases(await res.json());
      } catch(_) {}
      setLoadingCases(false);
    };
    load();
  }, [ready, user, apiFetch]);

  // Load inbox
  useEffect(() => {
    if (!ready || !user || tab !== "inbox") return;
    const load = async () => {
      try {
        const res = await apiFetch(`${API}/messages/inbox`);
        if (res.ok) setInbox(await res.json());
      } catch(_) {}
    };
    load();
  }, [ready, user, apiFetch, tab]);

  const loadCaseDetail = useCallback(async (consentId) => {
    setLoadingDetail(true); setReportDone(false); setSaveStatus("");
    try {
      const res = await apiFetch(`${API}/bgv/case/${consentId}`);
      if (res.ok) {
        const d = await res.json();
        setCaseDetail(d);
        setLocalChecks(_copy(d.bgv_checks || []));
        if (d.bgv_overall_status) setReportVerdict(d.bgv_overall_status);
        if (d.bgv_summary) setReportSummary(d.bgv_summary);
        if (d.bgv_report_key) setReportDone(true);
      }
    } catch(_) {}
    setLoadingDetail(false);
  }, [apiFetch]);

  const selectCase = (id) => {
    setSelectedId(id);
    loadCaseDetail(id);
  };

  const _copy = (arr) => JSON.parse(JSON.stringify(arr));

  const updateCheckLocal = (idx, field, val) => {
    setLocalChecks(prev => {
      const next = _copy(prev);
      next[idx][field] = val;
      return next;
    });
  };

  const saveCheck = async (check) => {
    if (!selectedId) return;
    setSavingCheck(prev => ({...prev, [check.type]: true}));
    try {
      const res = await apiFetch(`${API}/bgv/checks/update`, {
        method: "POST",
        body: JSON.stringify({
          consent_id: selectedId,
          check_type: check.type,
          status: check.status,
          notes: check.notes || "",
          evidence_key: check.evidence_key || "",
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setSaveStatus(`✓ ${check.label || check.type} saved`);
        // Refresh cases list to update progress
        const cRes = await apiFetch(`${API}/bgv/cases`);
        if (cRes.ok) setCases(await cRes.json());
        setTimeout(() => setSaveStatus(""), 2500);
      } else {
        setSaveStatus("Error saving check");
        setTimeout(() => setSaveStatus(""), 2500);
      }
    } catch(_) { setSaveStatus("Error"); setTimeout(() => setSaveStatus(""), 2500); }
    setSavingCheck(prev => ({...prev, [check.type]: false}));
  };

  const handleEvidenceUpload = async (checkIdx, file) => {
    if (!file || !selectedId || !caseDetail?.employee_id) return;
    const check = localChecks[checkIdx];
    setSavingCheck(prev => ({...prev, [check.type]: true}));
    try {
      const presignRes = await apiFetch(
        `${API}/bgv/upload/presigned?consent_id=${selectedId}&check_type=${check.type}&filename=${encodeURIComponent(file.name)}`
      );
      if (!presignRes.ok) { setSaveStatus("Upload failed"); setSavingCheck(prev => ({...prev, [check.type]: false})); return; }
      const { upload_url, s3_key } = await presignRes.json();
      const uploadRes = await fetch(upload_url, { method:"PUT", body:file, headers:{"Content-Type":file.type||"application/octet-stream"} });
      if (!uploadRes.ok) { setSaveStatus("Upload failed"); setSavingCheck(prev => ({...prev, [check.type]: false})); return; }
      // Update check with evidence key
      const next = _copy(localChecks);
      next[checkIdx].evidence_key = s3_key;
      if (next[checkIdx].status === "pending") next[checkIdx].status = "in_progress";
      setLocalChecks(next);
      await saveCheck(next[checkIdx]);
    } catch(_) { setSaveStatus("Upload error"); setTimeout(() => setSaveStatus(""), 2500); }
    setSavingCheck(prev => ({...prev, [check.type]: false}));
  };

  const submitReport = async () => {
    if (!selectedId) return;
    setSubmittingReport(true); setSaveStatus("Uploading report…");
    try {
      let report_key = caseDetail?.bgv_report_key || "";
      if (reportFile) {
        const presignRes = await apiFetch(
          `${API}/bgv/upload/presigned?consent_id=${selectedId}&check_type=bgv_report&filename=${encodeURIComponent(reportFile.name)}`
        );
        if (!presignRes.ok) { setSaveStatus("Report upload failed"); setSubmittingReport(false); return; }
        const { upload_url, s3_key } = await presignRes.json();
        const uploadRes = await fetch(upload_url, { method:"PUT", body:reportFile, headers:{"Content-Type":reportFile.type||"application/pdf"} });
        if (!uploadRes.ok) { setSaveStatus("Report upload failed"); setSubmittingReport(false); return; }
        report_key = s3_key;
      }
      if (!report_key) { setSaveStatus("Please upload a report PDF"); setSubmittingReport(false); return; }
      const res = await apiFetch(`${API}/bgv/report/submit`, {
        method: "POST",
        body: JSON.stringify({ consent_id: selectedId, report_key, summary: reportSummary, overall_status: reportVerdict }),
      });
      if (res.ok) {
        setReportDone(true); setSaveStatus("✓ Report submitted — employer notified");
        const cRes = await apiFetch(`${API}/bgv/cases`); if (cRes.ok) setCases(await cRes.json());
        setTimeout(() => setSaveStatus(""), 4000);
      } else {
        const e = await res.json(); setSaveStatus(e.detail || "Submission failed");
        setTimeout(() => setSaveStatus(""), 3000);
      }
    } catch(_) { setSaveStatus("Error"); setTimeout(() => setSaveStatus(""), 2500); }
    setSubmittingReport(false);
  };

  const loadThread = async (consentId) => {
    setActiveThread(consentId);
    try {
      const res = await apiFetch(`${API}/messages/thread/${consentId}`);
      if (res.ok) { const d = await res.json(); setThreadMsgs(d.messages || []); }
    } catch(_) {}
  };

  const sendMsg = async () => {
    if (!msgBody.trim() || !activeThread) return;
    setSendingMsg(true);
    try {
      const res = await apiFetch(`${API}/messages/send`, {
        method: "POST",
        body: JSON.stringify({ consent_id: activeThread, body: msgBody, recipient_type: msgRecipient }),
      });
      if (res.ok) {
        setMsgBody("");
        await loadThread(activeThread);
        const iRes = await apiFetch(`${API}/messages/inbox`); if (iRes.ok) setInbox(await iRes.json());
      }
    } catch(_) {}
    setSendingMsg(false);
  };

  if (!ready || !user) return null;

  const stats = {
    total:      cases.length,
    in_prog:    cases.filter(c => c.bgv_status === "in_progress").length,
    completed:  cases.filter(c => c.bgv_status === "completed").length,
    pending:    cases.filter(c => c.bgv_status === "assigned").length,
  };

  const selectedCase = cases.find(c => c.consent_id === selectedId);

  return (
    <>
      <style>{G}</style>
      <div className="pg">
        <div className="topbar">
          <div style={{display:"flex",alignItems:"baseline",gap:"0.3rem"}}>
            <span className="logo-text">Datagate</span>
            <span className="logo-badge">BGV Portal</span>
          </div>
          <div className="topbar-right">
            <span className="user-name">🏢 {user.name || user.email}</span>
            <button className="signout-btn" onClick={()=>{logout();router.replace("/bgv/login");}}>Sign out</button>
          </div>
        </div>

        <div className="wrap">
          {/* Tab Nav */}
          <div className="tabs">
            {[["cases","📋 My Cases"],["inbox","💬 Inbox"],["reports","📄 Reports"]].map(([t,l])=>(
              <button key={t} className={`tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>{l}</button>
            ))}
          </div>

          {/* ── CASES TAB ── */}
          {tab === "cases" && (
            <>
              {/* Stats */}
              <div className="stat-row">
                {[
                  {num:stats.total,     label:"Total Cases"},
                  {num:stats.in_prog,   label:"In Progress"},
                  {num:stats.completed, label:"Completed"},
                  {num:stats.pending,   label:"Pending Start"},
                ].map((s,i)=>(
                  <div key={i} className="stat-card">
                    <div className="stat-num">{s.num}</div>
                    <div className="stat-lbl">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Cases Table */}
              <div className="cases-table">
                <div className="tbl-head">
                  <span className="tbl-th">Candidate</span>
                  <span className="tbl-th">Employer</span>
                  <span className="tbl-th">Assigned</span>
                  <span className="tbl-th">Status</span>
                  <span className="tbl-th">Progress</span>
                  <span className="tbl-th">Action</span>
                </div>
                {loadingCases && <div className="empty-state">Loading cases…</div>}
                {!loadingCases && cases.length === 0 && <div className="empty-state">No cases assigned yet.</div>}
                {cases.map(c => {
                  const bs = BGV_STATUS_BADGE[c.bgv_status] || BGV_STATUS_BADGE.assigned;
                  const pct = c.checks_total > 0 ? Math.round((c.checks_done / c.checks_total) * 100) : 0;
                  return (
                    <div key={c.consent_id} className={`tbl-row${selectedId===c.consent_id?" selected":""}`} onClick={()=>selectCase(c.consent_id)}>
                      <div>
                        <div className="td-primary">{c.candidate_name}</div>
                        <div className="td-secondary">{c.employee_email}</div>
                      </div>
                      <div>
                        <div className="td-secondary">{c.requestor_name || c.requestor_email}</div>
                      </div>
                      <div className="td-secondary">{isoDate(c.bgv_assigned_at)}</div>
                      <div>
                        <span className="badge" style={{color:bs.color,background:bs.bg}}>{bs.label}</span>
                      </div>
                      <div>
                        <div className="td-secondary" style={{fontSize:"0.72rem"}}>{c.checks_done}/{c.checks_total} checks</div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{width:`${pct}%`,background:pct===100?"#16a34a":"#4f46e5"}}/>
                        </div>
                      </div>
                      <div>
                        <button style={{padding:"0.28rem 0.75rem",background:"#eef2ff",color:"#4f46e5",border:"1.5px solid #c7d2fe",borderRadius:6,fontSize:"0.72rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}
                          onClick={e=>{e.stopPropagation();selectCase(c.consent_id);}}>
                          Open →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Case Detail Panel */}
              {selectedId && (
                <div className="case-detail">
                  {loadingDetail ? (
                    <div className="empty-state">Loading case…</div>
                  ) : caseDetail ? (
                    <>
                      <div className="case-detail-header">
                        <div>
                          <div className="case-title">
                            {(caseDetail.profile?.firstName||"") + " " + (caseDetail.profile?.lastName||"")} — BGV Case
                          </div>
                          <div className="case-subtitle">
                            {caseDetail.employee_email} &nbsp;·&nbsp; Assigned by {caseDetail.requestor_name || caseDetail.requestor_email} &nbsp;·&nbsp; {isoDate(caseDetail.bgv_assigned_at)}
                          </div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
                          {saveStatus && <span style={{fontSize:"0.78rem",color:saveStatus.startsWith("✓")?"#4ade80":"#fca5a5",fontWeight:600}}>{saveStatus}</span>}
                          {(BGV_STATUS_BADGE[caseDetail.bgv_status]||BGV_STATUS_BADGE.assigned) && (
                            <span className="badge" style={{color:(BGV_STATUS_BADGE[caseDetail.bgv_status]||BGV_STATUS_BADGE.assigned).color,background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.25)",color:"#fff"}}>
                              {(BGV_STATUS_BADGE[caseDetail.bgv_status]||BGV_STATUS_BADGE.assigned).label}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="case-body">
                        {/* Profile Panel */}
                        <div className="profile-panel">
                          <div className="panel-title">Candidate Profile</div>
                          {[
                            ["Full Name", `${caseDetail.profile?.firstName||""} ${caseDetail.profile?.middleName||""} ${caseDetail.profile?.lastName||""}`.replace(/\s+/g," ").trim()],
                            ["Date of Birth", caseDetail.profile?.dob],
                            ["Gender", caseDetail.profile?.gender],
                            ["Mobile", caseDetail.profile?.mobile],
                            ["Email", caseDetail.employee_email],
                            ["PAN", caseDetail.profile?.pan],
                            ["Aadhaar (last 4)", caseDetail.profile?.aadhaar || caseDetail.profile?.aadhar],
                            ["Nationality", caseDetail.profile?.nationality],
                          ].map(([k,v])=>v?(
                            <div key={k} className="profile-kv">
                              <span className="profile-key">{k}</span>
                              <span className="profile-val">{v}</span>
                            </div>
                          ):null)}

                          <div className="panel-title" style={{marginTop:"1rem"}}>Current Address</div>
                          {caseDetail.profile?.currentAddress && (
                            <div className="profile-kv">
                              <span className="profile-key">Address</span>
                              <span className="profile-val" style={{fontSize:"0.8rem",lineHeight:1.5}}>
                                {[caseDetail.profile.currentAddress.door, caseDetail.profile.currentAddress.street, caseDetail.profile.currentAddress.city, caseDetail.profile.currentAddress.state, caseDetail.profile.currentAddress.pincode].filter(Boolean).join(", ")}
                              </span>
                            </div>
                          )}

                          <div className="panel-title" style={{marginTop:"1rem"}}>Education Summary</div>
                          {caseDetail.profile?.education?.classX?.school && (
                            <div className="profile-kv">
                              <span className="profile-key">Class X</span>
                              <span className="profile-val">{caseDetail.profile.education.classX.school} — {caseDetail.profile.education.classX.yearOfPassing}</span>
                            </div>
                          )}
                          {caseDetail.profile?.education?.undergraduate?.college && (
                            <div className="profile-kv">
                              <span className="profile-key">UG</span>
                              <span className="profile-val">{caseDetail.profile.education.undergraduate.course} — {caseDetail.profile.education.undergraduate.college}</span>
                            </div>
                          )}

                          <div className="panel-title" style={{marginTop:"1rem"}}>Employment History</div>
                          {(caseDetail.employment_history||[]).map((e,i)=>(
                            <div key={i} className="profile-kv">
                              <span className="profile-key">{e.currentlyWorking==="Yes"?"Current":"Previous"}</span>
                              <span className="profile-val">{e.companyName} — {e.designation}</span>
                              <span style={{fontSize:"0.72rem",color:"#94a3b8"}}>{e.startDate} to {e.endDate||"Present"}</span>
                            </div>
                          ))}
                        </div>

                        {/* Checks Panel */}
                        <div className="checks-panel">
                          <div className="panel-title">BGV Checks Tracker</div>
                          {localChecks.map((ch, idx) => {
                            const st = CHECK_STATUS[ch.status] || CHECK_STATUS.pending;
                            return (
                              <div key={ch.type} className="check-row">
                                <div>
                                  <div className="check-label">{ch.label}</div>
                                  <div className="check-type-tag">{ch.type}</div>
                                  {ch.completed_at && <div style={{fontSize:"0.65rem",color:"#16a34a",marginTop:"0.1rem"}}>✓ {isoDate(ch.completed_at)}</div>}
                                </div>
                                <div>
                                  <select
                                    className="check-select"
                                    value={ch.status}
                                    style={{borderColor:st.color,color:st.color}}
                                    onChange={e=>updateCheckLocal(idx,"status",e.target.value)}
                                    onBlur={()=>saveCheck(localChecks[idx])}
                                  >
                                    {Object.entries(CHECK_STATUS).map(([v,{label}])=>(
                                      <option key={v} value={v}>{label}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <textarea
                                    className="notes-input"
                                    placeholder="Notes / findings…"
                                    value={ch.notes||""}
                                    onChange={e=>updateCheckLocal(idx,"notes",e.target.value)}
                                    onBlur={()=>saveCheck(localChecks[idx])}
                                    rows={2}
                                  />
                                </div>
                                <div style={{display:"flex",flexDirection:"column",gap:"0.35rem"}}>
                                  {ch.evidence_key ? (
                                    <button className="view-btn" onClick={async()=>{
                                      try {
                                        const r = await apiFetch(`${API}/documents/${caseDetail.employee_id}`);
                                        if (r.ok) {
                                          const docs = await r.json();
                                          const bgvDocs = docs.documents?.bgv || {};
                                          const key = Object.keys(bgvDocs).find(k => bgvDocs[k]?.s3_key === ch.evidence_key);
                                          if (key && bgvDocs[key]?.url) window.open(bgvDocs[key].url,"_blank");
                                        }
                                      } catch(_) {}
                                    }}>View</button>
                                  ) : null}
                                  <input ref={el=>uploadInputRef.current[ch.type]=el} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{display:"none"}} onChange={e=>{if(e.target.files[0])handleEvidenceUpload(idx,e.target.files[0]);e.target.value="";}}/>
                                  <button className="upload-btn" onClick={()=>uploadInputRef.current[ch.type]?.click()} disabled={savingCheck[ch.type]}>
                                    {savingCheck[ch.type]?"…":(ch.evidence_key?"Re-upload":"Upload")}
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                          {/* Final Report Section */}
                          <div className="report-section">
                            <div className="report-title">Submit Final BGV Report</div>
                            {reportDone && (
                              <div style={{padding:"0.65rem 0.9rem",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,marginBottom:"0.75rem",fontSize:"0.78rem",color:"#15803d",fontWeight:600}}>
                                ✓ Report submitted. Employer has been notified. You can re-submit if needed.
                              </div>
                            )}
                            <div className="report-grid">
                              <div className="fi">
                                <span className="fl">Overall Verdict</span>
                                <select className="in" value={reportVerdict} onChange={e=>setReportVerdict(e.target.value)}>
                                  {Object.entries(OVERALL_STATUS).map(([v,{label}])=>(
                                    <option key={v} value={v}>{label}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="fi">
                                <span className="fl">Report PDF</span>
                                <input type="file" accept=".pdf" style={{fontSize:"0.78rem",color:"#64748b"}} onChange={e=>setReportFile(e.target.files[0]||null)}/>
                              </div>
                            </div>
                            <div className="fi" style={{marginBottom:"0.75rem"}}>
                              <span className="fl">Summary / Remarks</span>
                              <textarea className="in" value={reportSummary} onChange={e=>setReportSummary(e.target.value)} placeholder="Brief summary of BGV findings…" rows={3} style={{resize:"vertical"}}/>
                            </div>
                            <button className="submit-btn" onClick={submitReport} disabled={submittingReport}>
                              {submittingReport ? "Submitting…" : reportDone ? "Re-submit Report" : "Submit Report to Employer →"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="empty-state">Could not load case.</div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── INBOX TAB ── */}
          {tab === "inbox" && (
            <div style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:"1rem",background:"#fff",borderRadius:14,overflow:"hidden",boxShadow:"0 2px 8px rgba(30,26,62,0.08)",minHeight:480}}>
              {/* Thread list */}
              <div style={{borderRight:"1px solid #f1f5f9"}}>
                <div style={{padding:"0.9rem 1.25rem",borderBottom:"1px solid #f1f5f9",fontWeight:700,fontSize:"0.84rem",color:"#0f172a"}}>Threads</div>
                {inbox.length === 0 && <div className="empty-state">No messages yet.</div>}
                {inbox.map(t=>(
                  <div key={t.consent_id} className={`inbox-thread${activeThread===t.consent_id?" active":""}`} onClick={()=>loadThread(t.consent_id)}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"0.5rem"}}>
                      <div style={{fontWeight:700,fontSize:"0.84rem",color:"#0f172a"}}>{t.candidate_name}</div>
                      {t.unread_count>0 && <div className="unread-dot"/>}
                    </div>
                    <div style={{fontSize:"0.72rem",color:"#64748b",margin:"0.15rem 0"}}>{t.other_party_email}</div>
                    <div style={{fontSize:"0.75rem",color:"#94a3b8",fontStyle:"italic",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.latest_message}</div>
                  </div>
                ))}
              </div>

              {/* Thread viewer */}
              <div style={{display:"flex",flexDirection:"column"}}>
                {!activeThread ? (
                  <div className="empty-state">Select a thread to view messages.</div>
                ) : (
                  <>
                    <div style={{padding:"0.75rem 1.25rem",borderBottom:"1px solid #f1f5f9",fontSize:"0.84rem",fontWeight:700,color:"#0f172a",background:"#fafafa"}}>
                      Conversation
                      <span style={{fontSize:"0.7rem",fontWeight:500,color:"#64748b",marginLeft:"0.5rem"}}>Messages visible to you based on your role</span>
                    </div>
                    <div className="msg-thread">
                      {threadMsgs.length===0 && <div style={{color:"#94a3b8",fontSize:"0.84rem",textAlign:"center",padding:"2rem"}}>No messages yet.</div>}
                      {threadMsgs.map(m=>{
                        const isMine = m.sender_role === "bgv";
                        const isEmployerCC = m.visible_to?.includes("employer") && m.sender_role !== "employer";
                        return (
                          <div key={m.message_id} style={{display:"flex",flexDirection:"column",alignItems:isMine?"flex-end":"flex-start"}}>
                            <div className={`msg-bubble${isMine?" mine":isEmployerCC?" employer-cc":" theirs"}`}>
                              <div style={{fontSize:"0.68rem",fontWeight:700,marginBottom:"0.25rem",opacity:0.7}}>
                                {m.sender_name} ({m.sender_role}) {isEmployerCC&&!isMine?"— 👁 employer CC'd":""}
                              </div>
                              {m.body}
                              <div className="msg-meta">{new Date(m.sent_at).toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="msg-input-row">
                      <select className="recipient-sel" value={msgRecipient} onChange={e=>setMsgRecipient(e.target.value)}>
                        <option value="employee">→ Candidate (employer CC'd)</option>
                        <option value="employer">→ Employer only</option>
                      </select>
                      <textarea className="msg-textarea" value={msgBody} onChange={e=>setMsgBody(e.target.value)} placeholder="Type a message…" onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg();}}}/>
                      <button className="msg-send-btn" onClick={sendMsg} disabled={sendingMsg||!msgBody.trim()}>
                        {sendingMsg?"…":"Send"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── REPORTS TAB ── */}
          {tab === "reports" && (
            <div style={{background:"#fff",borderRadius:14,padding:"1.25rem",boxShadow:"0 2px 8px rgba(30,26,62,0.08)"}}>
              <div style={{fontWeight:700,fontSize:"0.9rem",color:"#0f172a",marginBottom:"1rem"}}>Submitted Reports</div>
              {cases.filter(c=>c.bgv_report_key).length===0 && <div className="empty-state">No reports submitted yet.</div>}
              {cases.filter(c=>c.bgv_report_key).map(c=>{
                const ov = OVERALL_STATUS[c.bgv_overall_status];
                return (
                  <div key={c.consent_id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.85rem 1rem",border:"1px solid #f1f5f9",borderRadius:10,marginBottom:"0.65rem"}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:"0.875rem",color:"#0f172a"}}>{c.candidate_name}</div>
                      <div style={{fontSize:"0.75rem",color:"#64748b",marginTop:"0.15rem"}}>{c.requestor_name} · Submitted {isoDate(c.bgv_updated_at)}</div>
                    </div>
                    {ov && <span style={{fontWeight:800,fontSize:"0.78rem",color:ov.color,background:`${ov.color}15`,padding:"0.25rem 0.7rem",borderRadius:999}}>{ov.label}</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
