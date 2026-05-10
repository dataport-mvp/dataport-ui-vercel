// pages/employee/personal.js — Employee Dashboard tab
// This file is the DASHBOARD VIEW added to the existing personal.js
// It hooks into the same auth, apiFetch, and router — zero new API calls needed
// Drop this into pages/employee/dashboard.js as a NEW route

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const G = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:#f0ece6;font-family:'DM Sans',sans-serif;color:#111;-webkit-font-smoothing:antialiased}

  .shell{display:flex;min-height:100vh}

  /* ── TOPBAR ── */
  .topbar{
    position:fixed;top:0;left:0;right:0;z-index:50;
    background:#f5f2ee;border-bottom:1px solid #c8c2b8;
    height:48px;padding:0 20px;
    display:flex;align-items:center;justify-content:space-between;
  }
  .tb-logo{display:flex;align-items:center;gap:8px}
  .tb-logo-sq{width:26px;height:26px;background:#0d6e6e;border-radius:6px;display:flex;align-items:center;justify-content:center}
  .tb-logo-name{font-size:14px;font-weight:800;color:#111;letter-spacing:-.3px}
  .tb-label{font-size:11px;color:#7a6e64;font-weight:500}
  .tb-right{display:flex;align-items:center;gap:8px}
  .tb-user{display:flex;align-items:center;gap:7px;padding:4px 10px;border:1px solid #c8c2b8;border-radius:6px;background:#fff;cursor:pointer}
  .tb-av{width:22px;height:22px;border-radius:50%;background:#0d6e6e;color:#fff;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .tb-name{font-size:12px;font-weight:600;color:#111}
  .btn-view{padding:6px 14px;background:#0d6e6e;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 2px 8px rgba(13,110,110,.3)}
  .bell-wrap{position:relative}
  .bell-btn{width:32px;height:32px;border-radius:6px;border:1px solid #c8c2b8;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer}
  .bell-badge{position:absolute;top:-4px;right:-4px;background:#dc2626;color:#fff;border-radius:999px;font-size:8px;font-weight:700;min-width:15px;height:15px;display:flex;align-items:center;justify-content:center;padding:0 3px;border:2px solid #f5f2ee}

  /* ── SIDEBAR ── */
  .sidebar{
    width:200px;min-width:200px;
    background:#fff;border-right:1px solid #c8c2b8;
    padding-top:48px;display:flex;flex-direction:column;
    position:fixed;left:0;top:0;bottom:0;overflow-y:auto;
  }
  .sb-user{padding:14px 14px 12px;border-bottom:1px solid #e8e2da}
  .sb-av{width:36px;height:36px;border-radius:8px;background:#0d6e6e;color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-bottom:6px}
  .sb-uname{font-size:12px;font-weight:700;color:#111;line-height:1.3}
  .sb-email{font-size:10px;color:#7a6e64;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sb-comp{margin:10px 12px;background:#e0f0ee;border:1px solid #a8d5ce;border-radius:7px;padding:8px 10px}
  .sb-comp-lbl{font-size:8px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#0a5656;margin-bottom:2px}
  .sb-comp-val{font-size:12px;font-weight:700;color:#0d6e6e}
  .sb-comp-sub{font-size:9px;color:#5a8a80;margin-top:1px}
  .sb-bar-bg{height:3px;background:#a8d5ce;border-radius:2px;margin-top:4px}
  .sb-bar-fill{height:100%;background:#0d6e6e;border-radius:2px}
  .sb-sec{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#a09890;padding:10px 14px 5px}
  .sb-item{display:flex;align-items:center;justify-content:space-between;padding:7px 14px;font-size:12px;font-weight:500;color:#5a5248;cursor:pointer;border-left:2.5px solid transparent;transition:all .1s}
  .sb-item:hover{background:#f5f2ee;color:#111}
  .sb-item.on{background:#e0f0ee;color:#0d6e6e;border-left-color:#0d6e6e;font-weight:700}
  .sb-item-left{display:flex;align-items:center;gap:8px}
  .sb-check{font-size:10px;color:#16a34a;font-weight:700}
  .sb-pending{font-size:8px;font-weight:700;padding:1px 6px;border-radius:8px;background:#fef9c3;color:#854d0e;border:0.5px solid #fde68a}
  .sb-badge{background:#0d6e6e;color:#fff;font-size:8px;font-weight:700;padding:1px 5px;border-radius:8px}
  .sb-signout{margin:12px;padding:7px;border:1px solid #c8c2b8;border-radius:6px;background:none;font-size:11px;color:#7a6e64;cursor:pointer;font-family:inherit;width:calc(100% - 24px)}
  .sb-signout:hover{border-color:#dc2626;color:#dc2626}

  /* ── MAIN ── */
  .main{margin-left:200px;padding-top:48px;flex:1;overflow:auto;min-width:0}
  .content{padding:16px}

  /* ── WELCOME BAR ── */
  .welcome-bar{background:#fff;border:1px solid #c8c2b8;border-radius:10px;padding:14px 18px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between}
  .wb-title{font-size:15px;font-weight:800;color:#111;letter-spacing:-.3px;margin-bottom:2px}
  .wb-sub{font-size:11px;color:#7a6e64}
  .wb-right{display:flex;gap:8px;align-items:center}
  .btn-print{padding:6px 14px;background:#f5f2ee;border:1px solid #c8c2b8;border-radius:6px;font-size:12px;font-weight:600;color:#5a5248;cursor:pointer;font-family:inherit}
  .status-pill{padding:5px 12px;border-radius:5px;font-size:11px;font-weight:700}
  .pill-submitted{background:#e0f0ee;color:#0a5656;border:1px solid #a8d5ce}
  .pill-draft{background:#fef9c3;color:#854d0e;border:1px solid #fde68a}

  /* ── 4-STAT ROW ── */
  .stat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:0.5px;background:#c8c2b8;border:1px solid #c8c2b8;border-radius:9px;overflow:hidden;margin-bottom:14px}
  .stat{background:#fff;padding:11px 14px;position:relative}
  .stat-accent{position:absolute;top:0;left:0;right:0;height:2.5px}
  .stat-lbl{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#a09890;margin-bottom:4px}
  .stat-val{font-size:20px;font-weight:800;letter-spacing:-1px;line-height:1;margin-bottom:2px}
  .stat-sub{font-size:10px;color:#a09890}

  /* ── TWO COL ── */
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}

  /* ── CARD ── */
  .card{background:#fff;border:1px solid #c8c2b8;border-radius:9px;overflow:hidden}
  .card-hd{padding:10px 14px;border-bottom:1px solid #e8e2da;display:flex;align-items:center;justify-content:space-between}
  .card-title{font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#7a6e64}
  .card-action{font-size:11px;color:#0d6e6e;cursor:pointer;font-weight:600}
  .card-body{padding:10px 14px}

  /* ── PROFILE CHECKLIST ── */
  .step-row{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #f0ece6;cursor:pointer}
  .step-row:last-child{border-bottom:none}
  .step-ic{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:11px;font-weight:700}
  .step-ic.done{background:#e0f0ee;color:#0d6e6e;border:1px solid #a8d5ce}
  .step-ic.current{background:#fef9c3;color:#854d0e;border:1px solid #fde68a}
  .step-ic.todo{background:#f5f2ee;color:#a09890;border:1px solid #c8c2b8}
  .step-info{flex:1}
  .step-name{font-size:12px;font-weight:700;color:#111}
  .step-desc{font-size:10px;color:#a09890;margin-top:1px}
  .step-status{font-size:10px;font-weight:700}
  .st-done{color:#0d6e6e}
  .st-current{color:#d97706}
  .st-todo{color:#a09890}

  /* ── CONSENT CARDS ── */
  .consent-card{border:1px solid #c8c2b8;border-radius:7px;padding:10px 12px;margin-bottom:8px;background:#fff}
  .consent-card.pending{border-left:3px solid #d97706}
  .consent-card.approved{border-left:3px solid #0d6e6e}
  .consent-card:last-child{margin-bottom:0}
  .cc-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:7px}
  .cc-company{font-size:12px;font-weight:700;color:#111}
  .cc-date{font-size:10px;color:#a09890;margin-top:1px}
  .cc-badge{font-size:9px;font-weight:700;padding:2px 8px;border-radius:8px;text-transform:uppercase}
  .b-pending{background:#fef9c3;color:#854d0e;border:0.5px solid #fde68a}
  .b-approved{background:#e0f0ee;color:#0a5656;border:0.5px solid #a8d5ce}
  .cc-msg{font-size:11px;color:#5a5248;font-style:italic;background:#f5f2ee;border-radius:4px;padding:6px 8px;margin-bottom:8px;line-height:1.55;border-left:2px solid #c8c2b8}
  .cc-actions{display:flex;gap:7px}
  .btn-approve{flex:1;padding:7px;background:#0d6e6e;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 2px 6px rgba(13,110,110,.25)}
  .btn-approve:hover{background:#0a5656}
  .btn-decline{flex:1;padding:7px;background:#fff;color:#dc2626;border:1px solid #fca5a5;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit}
  .btn-decline:hover{background:#fef2f2}
  .btn-approve:disabled,.btn-decline:disabled{opacity:.5;cursor:not-allowed}

  /* ── DOCUMENT VAULT ── */
  .doc-row{display:flex;align-items:center;gap:9px;padding:7px 0;border-bottom:1px solid #f0ece6;font-size:11px}
  .doc-row:last-child{border-bottom:none}
  .doc-ic{width:24px;height:24px;border-radius:5px;background:#fef9c3;border:1px solid #fde68a;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:11px}
  .doc-name{font-size:12px;font-weight:600;color:#111;flex:1}
  .doc-sec{font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#a09890;margin-right:4px}
  .doc-ok{font-size:10px;font-weight:700;color:#0d6e6e}
  .doc-miss{font-size:10px;font-weight:700;color:#d97706}

  /* ── ACTIVITY FEED ── */
  .feed-row{display:flex;gap:8px;padding:7px 0;border-bottom:1px solid #f0ece6}
  .feed-row:last-child{border-bottom:none}
  .fdot{width:7px;height:7px;border-radius:50%;flex-shrink:0;margin-top:3px}
  .ftext{font-size:11px;color:#111;line-height:1.5;flex:1}
  .ftext b{font-weight:700}
  .ftime{font-size:10px;color:#a09890;white-space:nowrap}

  /* ── BLOCKER ── */
  .blocker{background:#fef9c3;border:1px solid #fde68a;border-radius:7px;padding:8px 12px;font-size:12px;color:#854d0e;margin-bottom:10px;line-height:1.55}

  .empty{padding:20px;text-align:center;color:#a09890;font-size:12px}
`;

function normalizeStatus(s) {
  const v = String(s||"pending").toLowerCase();
  if(["approved","approve","accepted","granted","allow"].includes(v)) return "approved";
  if(["declined","decline","rejected","denied","reject"].includes(v)) return "declined";
  return "pending";
}
const nc = c => ({
  ...c,
  consent_id: c?.consent_id||c?.id||c?.consentId||c?._id,
  status: normalizeStatus(c?.status),
  request_message: c?.request_message||c?.message||c?.comment||"",
  employer_name: c?.employer_name||c?.employerName||c?.company_name||c?.companyName||"",
  employer_email: c?.employer_email||c?.employerEmail||c?.email||"",
});
const gcid = c => c?.consent_id||c?.id||c?.consentId||c?._id;

function fmt(ts) {
  if(!ts) return "";
  try { return new Date(ts).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}); }
  catch { return ""; }
}

export default function EmployeeDashboard() {
  const { user, apiFetch, logout, ready } = useAuth();
  const router = useRouter();

  const [draft,     setDraft]     = useState(null);
  const [consents,  setConsents]  = useState([]);
  const [acting,    setActing]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [bellCount, setBellCount] = useState(0);

  useEffect(() => {
    if(!ready) return;
    if(!user) { router.replace("/employee/login"); return; }
    if(user.role !== "employee") { router.replace("/employee/login"); return; }
  }, [ready, user, router]);

  const loadData = useCallback(async () => {
    if(!ready || !user) return;
    try {
      const [dr, cr] = await Promise.all([
        apiFetch(`${API}/employee/draft`),
        apiFetch(`${API}/consent/my`),
      ]);
      if(dr.ok) setDraft(await dr.json());
      if(cr.ok) {
        const data = await cr.json();
        const mapped = Array.isArray(data) ? data.map(nc) : [];
        setConsents(mapped);
        setBellCount(mapped.filter(c=>c.status==="pending").length);
      }
    } catch(_) {}
    setLoading(false);
  }, [ready, user, apiFetch]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    if(!ready||!user) return;
    const id = setInterval(loadData, 15000);
    return () => clearInterval(id);
  }, [ready, user, loadData]);

  const respond = async (consentId, decision) => {
    if(profileStatus !== "submitted") return;
    setActing(consentId);
    try {
      const r = await apiFetch(`${API}/consent/respond`, {
        method:"POST",
        body: JSON.stringify({ consent_id:consentId, status:decision==="approve"?"APPROVED":"DECLINED", responded_at:Date.now() }),
      });
      if(r.ok) await loadData();
    } catch(_) {}
    setActing(null);
  };

  if(!ready||!user) return null;

  const profileStatus = String(draft?.status||"draft").toLowerCase();
  const isSubmitted   = profileStatus === "submitted";

  // Derive section completion from draft
  const p = draft || {};
  const sections = [
    {
      n:1, label:"Personal information",
      desc:"Identity, address, bank details",
      done: !!(p.firstName && p.aadhaar && p.pan),
      path:"/employee/personal",
    },
    {
      n:2, label:"Education",
      desc:"Qualifications and certificates",
      done: !!(p.education?.classX?.school || p.education?.xSchool),
      path:"/employee/education",
    },
    {
      n:3, label:"Employment history",
      desc:"Previous and current employers",
      done: Array.isArray(p.employmentHistory) && p.employmentHistory.length > 0,
      path:"/employee/previous",
    },
    {
      n:4, label:"UAN & PF details",
      desc:"Provident fund and EPFO records",
      done: !!(p.hasUan),
      current: !(p.hasUan),
      path:"/employee/uan",
    },
  ];

  const doneCount   = sections.filter(s=>s.done).length;
  const completion  = Math.round((doneCount / sections.length) * 100);

  const pending  = consents.filter(c=>c.status==="pending");
  const approved = consents.filter(c=>c.status==="approved");

  // Documents list from draft
  const docs = [
    { name:"Aadhaar card",       section:"Identity",   uploaded:!!(p.aadhaarKey||p.documents?.personal?.aadhaar) },
    { name:"PAN card",           section:"Identity",   uploaded:!!(p.panKey||p.documents?.personal?.pan) },
    { name:"Degree certificate", section:"Education",  uploaded:!!(p.documents?.education?.ug_provisional||p.documents?.education?.ug_convocation) },
    { name:"Offer letter (current)", section:"Employment", uploaded:!!(p.documents?.employment) },
    { name:"UAN passbook",       section:"UAN & PF",   uploaded:!!(p.documents?.uan?.uanCard) },
  ];

  const uploadedCount = docs.filter(d=>d.uploaded).length;

  const nameInit = (user.name||user.email||"").slice(0,2).toUpperCase();

  return (
    <>
      <style>{G}</style>

      {/* TOPBAR */}
      <div className="topbar">
        <div className="tb-logo">
          <div className="tb-logo-sq">
            <svg width="12" height="14" viewBox="0 0 24 28" fill="none">
              <rect x="5" y="15" width="4" height="9" rx="1.5" fill="white"/>
              <rect x="15" y="15" width="4" height="9" rx="1.5" fill="white"/>
              <path d="M7 15Q12 8 17 15" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="tb-logo-name">Datagate</div>
          <span style={{fontSize:11,color:"#a09890",marginLeft:6}}>My Profile & Consents</span>
        </div>
        <div className="tb-right">
          <div className="bell-wrap">
            <button className="bell-btn" onClick={()=>router.push("/consent")} title="Consent Requests">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5a5248" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </button>
            {bellCount>0 && <span className="bell-badge">{bellCount}</span>}
          </div>
          <div className="tb-user">
            <div className="tb-av">{nameInit}</div>
            <div className="tb-name">{user.name?.split(" ")[0]||user.email}</div>
          </div>
          <button className="btn-view" onClick={()=>router.push("/employee/review")}>View full profile</button>
        </div>
      </div>

      <div className="shell">
        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="sb-user">
            <div className="sb-av">{nameInit}</div>
            <div className="sb-uname">{user.name||"Your Name"}</div>
            <div className="sb-email">{user.email}</div>
          </div>

          <div className="sb-comp">
            <div className="sb-comp-lbl">Profile completion</div>
            <div className="sb-comp-val">{completion}%</div>
            <div className="sb-comp-sub">{sections.length - doneCount > 0 ? `${sections.length - doneCount} section${sections.length - doneCount>1?"s":""} remaining` : "All sections complete"}</div>
            <div className="sb-bar-bg"><div className="sb-bar-fill" style={{width:`${completion}%`}}/></div>
          </div>

          <div className="sb-sec">My Profile</div>
          <div className="sb-item on"><div className="sb-item-left"><span>⊞</span>Dashboard</div></div>
          <div className="sb-item" onClick={()=>router.push("/employee/personal")}><div className="sb-item-left"><span>👤</span>Personal Info</div><span className="sb-check">✓</span></div>
          <div className="sb-item" onClick={()=>router.push("/employee/education")}><div className="sb-item-left"><span>🎓</span>Education</div><span className="sb-check">✓</span></div>
          <div className="sb-item" onClick={()=>router.push("/employee/previous")}><div className="sb-item-left"><span>💼</span>Employment</div><span className="sb-check">✓</span></div>
          <div className="sb-item" onClick={()=>router.push("/employee/uan")}><div className="sb-item-left"><span>🏦</span>UAN & PF</div><span className="sb-pending">Pending</span></div>

          <div className="sb-sec">Activity</div>
          <div className="sb-item" onClick={()=>router.push("/consent")}>
            <div className="sb-item-left"><span>📋</span>Consent Requests</div>
            {bellCount>0 && <span className="sb-badge">{bellCount}</span>}
          </div>
          <div className="sb-item" onClick={()=>router.push("/employee/personal?tab=documents")}><div className="sb-item-left"><span>📁</span>Documents</div></div>
          <div className="sb-item"><div className="sb-item-left"><span>🕐</span>Access Log</div></div>

          <div style={{flex:1}}/>
          <button className="sb-signout" onClick={logout}>Sign out</button>
        </div>

        {/* MAIN */}
        <div className="main">
          <div className="content">

            {/* Welcome bar */}
            <div className="welcome-bar">
              <div>
                <div className="wb-title">Welcome back</div>
                <div className="wb-sub">Your profile is {isSubmitted?"live — employers request access through Datagate with your consent":"in progress — complete all sections to go live"}</div>
              </div>
              <div className="wb-right">
                <button className="btn-print" onClick={()=>router.push("/employee/review")}>Print / Export PDF</button>
                <div className={`status-pill ${isSubmitted?"pill-submitted":"pill-draft"}`}>
                  {isSubmitted?"Profile submitted ✓":"Draft — not submitted"}
                </div>
              </div>
            </div>

            {/* 4 stats */}
            <div className="stat-row">
              <div className="stat">
                <div className="stat-accent" style={{background:"#0d6e6e"}}/>
                <div className="stat-lbl">Profile status</div>
                <div className="stat-val" style={{color:"#0d6e6e",fontSize:15,fontWeight:700,marginTop:2}}>{isSubmitted?"Active":"Draft"}</div>
                <div className="stat-sub">Visible to employers</div>
              </div>
              <div className="stat">
                <div className="stat-accent" style={{background:"#d97706"}}/>
                <div className="stat-lbl">Pending consents</div>
                <div className="stat-val" style={{color:"#d97706"}}>{pending.length||"—"}</div>
                <div className="stat-sub">Awaiting your action</div>
              </div>
              <div className="stat">
                <div className="stat-accent" style={{background:"#0d6e6e"}}/>
                <div className="stat-lbl">Approved this month</div>
                <div className="stat-val" style={{color:"#0d6e6e"}}>{approved.length||"—"}</div>
                <div className="stat-sub">Employers with access</div>
              </div>
              <div className="stat">
                <div className="stat-accent" style={{background:"#2563eb"}}/>
                <div className="stat-lbl">Documents uploaded</div>
                <div className="stat-val" style={{color:"#2563eb"}}>{uploadedCount||"—"}</div>
                <div className="stat-sub">Across all sections</div>
              </div>
            </div>

            <div className="two-col">
              {/* Left col */}
              <div style={{display:"flex",flexDirection:"column",gap:12}}>

                {/* Profile checklist */}
                <div className="card">
                  <div className="card-hd">
                    <div className="card-title">Profile completion checklist</div>
                    <div className="card-action" onClick={()=>router.push("/employee/personal")}>Continue →</div>
                  </div>
                  <div className="card-body">
                    {sections.map(s => (
                      <div className="step-row" key={s.n} onClick={()=>router.push(s.path)}>
                        <div className={`step-ic ${s.done?"done":s.current?"current":"todo"}`}>
                          {s.done?"✓":s.n}
                        </div>
                        <div className="step-info">
                          <div className="step-name">{s.label}</div>
                          <div className="step-desc">{s.desc}</div>
                        </div>
                        <span className={`step-status ${s.done?"st-done":s.current?"st-current":"st-todo"}`}>
                          {s.done?"Complete":s.current?"In progress":"Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Document vault */}
                <div className="card">
                  <div className="card-hd">
                    <div className="card-title">Document vault</div>
                    <div className="card-action" onClick={()=>router.push("/employee/personal?tab=documents")}>Manage all →</div>
                  </div>
                  <div className="card-body">
                    {docs.map(d => (
                      <div className="doc-row" key={d.name}>
                        <div className="doc-ic">📄</div>
                        <div className="doc-name">{d.name}</div>
                        <span className="doc-sec">{d.section}</span>
                        <span className={d.uploaded?"doc-ok":"doc-miss"}>{d.uploaded?"✓ Uploaded":"⚠ Missing"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right col */}
              <div style={{display:"flex",flexDirection:"column",gap:12}}>

                {/* Consent requests */}
                <div className="card">
                  <div className="card-hd">
                    <div className="card-title">Consent requests</div>
                    <div className="card-action" onClick={()=>router.push("/consent")}>View all →</div>
                  </div>
                  <div className="card-body">
                    {loading && <div className="empty">Loading…</div>}
                    {!loading && consents.length===0 && (
                      <div className="empty">No consent requests yet.<br/>Employers will appear here.</div>
                    )}
                    {!isSubmitted && consents.length>0 && (
                      <div className="blocker">⚠ Complete and submit all 4 sections before approving requests.</div>
                    )}
                    {pending.slice(0,2).map(c => (
                      <div className="consent-card pending" key={gcid(c)}>
                        <div className="cc-top">
                          <div><div className="cc-company">{c.employer_name||c.employer_email}</div><div className="cc-date">Requested {fmt(c.created_at)}</div></div>
                          <span className="cc-badge b-pending">Pending</span>
                        </div>
                        {c.request_message && <div className="cc-msg">"{c.request_message}"</div>}
                        <div className="cc-actions">
                          <button className="btn-approve" onClick={()=>respond(gcid(c),"approve")} disabled={!!acting||!isSubmitted}>
                            {acting===gcid(c)?"…":"✓ Approve"}
                          </button>
                          <button className="btn-decline" onClick={()=>respond(gcid(c),"decline")} disabled={!!acting||!isSubmitted}>
                            {acting===gcid(c)?"…":"✕ Decline"}
                          </button>
                        </div>
                      </div>
                    ))}
                    {approved.slice(0,2).map(c => (
                      <div className="consent-card approved" key={gcid(c)}>
                        <div className="cc-top">
                          <div><div className="cc-company">{c.employer_name||c.employer_email}</div><div className="cc-date">Approved {fmt(c.responded_at||c.approved_at||c.updated_at)}</div></div>
                          <span className="cc-badge b-approved">Approved</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent activity */}
                <div className="card">
                  <div className="card-hd">
                    <div className="card-title">Recent activity</div>
                  </div>
                  <div className="card-body">
                    {consents.length===0 && <div className="empty">No recent activity.</div>}
                    {pending.slice(0,2).map(c=>(
                      <div className="feed-row" key={`p-${gcid(c)}`}>
                        <div className="fdot" style={{background:"#d97706"}}/>
                        <div className="ftext">New consent request from <b>{c.employer_name||c.employer_email}</b></div>
                        <span className="ftime">{fmt(c.created_at)}</span>
                      </div>
                    ))}
                    {approved.slice(0,2).map(c=>(
                      <div className="feed-row" key={`a-${gcid(c)}`}>
                        <div className="fdot" style={{background:"#0d6e6e"}}/>
                        <div className="ftext">You approved access for <b>{c.employer_name||c.employer_email}</b></div>
                        <span className="ftime">{fmt(c.responded_at||c.approved_at)}</span>
                      </div>
                    ))}
                    {consents.filter(c=>c.status==="declined").slice(0,1).map(c=>(
                      <div className="feed-row" key={`d-${gcid(c)}`}>
                        <div className="fdot" style={{background:"#dc2626"}}/>
                        <div className="ftext">You declined request from <b>{c.employer_name||c.employer_email}</b></div>
                        <span className="ftime">{fmt(c.responded_at)}</span>
                      </div>
                    ))}
                    <div className="feed-row">
                      <div className="fdot" style={{background:"#2563eb"}}/>
                      <div className="ftext">Profile viewed by employer after approval</div>
                      <span className="ftime">—</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}