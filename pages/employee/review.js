// pages/employee/review.js  — Page 5 of 5
// Fixes:
// Reader mode: user arrives to view submitted profile → NO acks required, banner hidden
// Editor mode: triggered by ANY of:
//   1. ?edited=1 URL param (user just navigated from any page after editing)
//   2. draft.page1_edited === true (personal page was changed)
//   3. draft.page2_edited === true (education page was changed)
//   4. draft.page3_edited === true (employment page was changed)
//   5. draft.page4_edited === true (UAN page was changed)
// In editor mode: acks reset to all-false, banner shown, must re-confirm before submit
// On successful submit: clears page1_edited, page2_edited, page3_edited, page4_edited flags in DB
import { useState, useEffect, useCallback, useRef } from "react";
import PasswordInput from "../../components/PasswordInput";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const STEP_SHADOW  = "rgba(22,163,74,0.35)";
const STEP_DONE_BG = "#0a4a4a";
const STEP_DONE_CK = "#5eead4";
const STEP_CONN    = "#0d6e6e";

const STEPS = [
  { n:1, label:"Personal",   icon:"👤", path:"/employee/personal"  },
  { n:2, label:"Education",  icon:"🎓", path:"/employee/education" },
  { n:3, label:"Employment", icon:"💼", path:"/employee/previous"  },
  { n:4, label:"UAN",        icon:"🏦", path:"/employee/uan"       },
  { n:5, label:"Review",     icon:"📋", path:"/employee/review"    },
];
const ACCENTS = { 1:"#0d6e6e", 2:"#d97706", 3:"#7c3aed", 4:"#0891b2", 5:"#16a34a" };

const ACK_STATEMENTS = [
  "I confirm that I have carefully reviewed all sections of this profile — personal details, education, employment history, UAN/PF records, and supporting documents — and that all information is true, accurate, and complete to the best of my knowledge.",
  "I authorise Datagate Technologies and its authorised background verification partners to contact my previous employers, educational institutions, government bodies, and references to verify any details submitted in this profile, in accordance with the Digital Personal Data Protection Act 2023 (DPDP Act).",
  "I understand and agree that this profile and its contents will be shared with a prospective employer only after I provide my explicit, informed consent to that specific employer's request. I retain the right to withdraw that consent at any time, subject to the terms of the Datagate platform.",
  "I acknowledge that any material misrepresentation, falsification, or deliberate omission discovered at any stage — whether before or after commencement of employment — may result in immediate rejection of my application, termination of employment, and/or civil or criminal proceedings under applicable Indian law including the IPC, IT Act 2000, and DPDP Act 2023.",
  "I accept full responsibility for promptly updating my Datagate profile if any submitted information changes in the future, and I acknowledge that sharing outdated or incorrect information with prospective employers may have legal and professional consequences.",
];

function ConsentBell({ apiFetch, router }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const load = async () => {
      try { const res = await apiFetch(`${API}/consent/my`); if(res.ok){const data=await res.json();setCount(data.filter(c=>String(c.status||"pending").toLowerCase()==="pending").length);} } catch(_) {}
    };
    load(); const id=setInterval(load,15000); return ()=>clearInterval(id);
  }, [apiFetch]);
  return (<button style={{position:"relative",width:36,height:36,borderRadius:9,border:"1.5px solid #2a2535",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",transition:"all 0.2s"}} onClick={()=>router.push("/employee/personal?tab=consents")} title="Consent Requests">🔔{count>0&&<span style={{position:"absolute",top:-5,right:-5,background:"#ef4444",color:"#fff",borderRadius:999,fontSize:"0.6rem",fontWeight:800,minWidth:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px",border:"2px solid #18151f"}}>{count}</span>}</button>);
}

const G = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f0ece6; font-family: 'DM Sans', sans-serif; }
  .pg  { min-height: 100vh; background: #f0ece6; padding-bottom: 3rem; }
  .wrap { max-width: 860px; margin: auto; padding: 0 1.25rem; }

  .topbar { background: #111; border-bottom: 1px solid #2a2535; padding: 0.85rem 1.75rem;
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 1.75rem; position: sticky; top: 0; z-index: 50;
    box-shadow: 0 4px 20px rgba(15,12,40,0.4); }
  .logo-text { font-size: 1.3rem; font-weight: 800; color: #0d6e6e; letter-spacing: -0.5px; }
  .topbar-right { display: flex; align-items: center; gap: 0.75rem; }
  .user-name { font-size: 0.84rem; color: #8b92a8; font-weight: 500; }
  .signout-btn { padding: 0.38rem 1rem; border: 1.5px solid #2a2535; border-radius: 8px;
    background: transparent; color: #8b92a8; font-size: 0.82rem; cursor: pointer;
    font-weight: 600; font-family: inherit; transition: all 0.2s; }
  .signout-btn:hover { border-color: #fca5a5; color: #ef4444; background: rgba(239,68,68,0.08); }
  .bell-btn { position: relative; width: 32px; height: 32px; border-radius: 7px;
    border: 1.5px solid #2a2535; background: transparent; cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: 0.9rem; transition: all 0.2s; }
  .bell-btn:hover { border-color: #0d6e6e; background: rgba(167,139,250,0.1); }

  .sc { background: #ffffff; border-radius: 16px; padding: 1.5rem 1.6rem;
    margin-bottom: 1.1rem; box-shadow: 0 6px 28px rgba(30,26,62,0.22), 0 2px 8px rgba(30,26,62,0.12);
    border: 1px solid rgba(255,255,255,0.85); position: relative; overflow: hidden; }
  .sc::before { content:''; position:absolute; top:0; left:0; bottom:0; width:4px; border-radius:16px 0 0 16px; }
  .sc.ind::before { background:#0d6e6e;box-shadow:0 4px 14px rgba(13,110,110,.35); }
  .sc.amb::before { background:#d97706; }
  .sc.vio::before { background:#7c3aed; }
  .sc.cyn::before { background:#0891b2; }
  .sc.grn::before { background:#16a34a; }
  .sc.teal::before { background:#0d9488; }

  .sh { display:flex; align-items:center; gap:0.6rem; margin-bottom:1.15rem; }
  .si { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:0.95rem; flex-shrink:0; }
  .si.ind{background:#eef2ff;} .si.amb{background:#fffbeb;} .si.vio{background:#f5f3ff;}
  .si.cyn{background:#ecfeff;} .si.grn{background:#f0fdf4;} .si.teal{background:#f0fdfa;}
  .st { font-size:0.93rem; font-weight:700; color:#1e293b; }

  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:0.7rem; }
  .kv { display:flex; flex-direction:column; gap:0.15rem; }
  .kv-label { font-size:0.67rem; font-weight:700; color:#8b88b0; letter-spacing:0.55px; text-transform:uppercase; }
  .kv-val { font-size:0.875rem; font-weight:600; color:#1a1730; }
  .kv-val.empty { color:#d8d4e3; font-style:italic; font-weight:400; }

  .edit-link { font-size:0.72rem; font-weight:700; color:#0d6e6e; cursor:pointer; margin-left:auto;
    background:none; border:none; font-family:inherit; padding:0.2rem 0.6rem; border-radius:6px; transition:all 0.15s; }
  .edit-link:hover { background:#eef2ff; }

  .att-chip { display:inline-flex; align-items:center; gap:0.35rem; padding:0.28rem 0.75rem;
    background:#eef2ff; border:1.5px solid #c7d2fe; border-radius:999px;
    font-size:0.72rem; font-weight:700; color:#0d6e6e; cursor:pointer; text-decoration:none;
    transition:all 0.15s; white-space:nowrap; }
  .att-chip:hover { background:#e0e7ff; border-color:#818cf8; }
  .att-chip.missing { background:#fff5f5; border-color:#fecaca; color:#ef4444; cursor:default; }
  .att-grid { display:flex; flex-wrap:wrap; gap:0.45rem; margin-top:0.65rem; }

  .missing-banner { background:#fff8f0; border:1.5px solid #fbbf24; border-radius:12px;
    padding:1rem 1.25rem; margin-bottom:1.1rem; }
  .missing-banner h4 { color:#92400e; font-size:0.875rem; font-weight:800; margin-bottom:0.5rem; }
  .missing-item { display:flex; align-items:center; gap:0.5rem; padding:0.3rem 0;
    font-size:0.82rem; color:#78350f; font-weight:600; cursor:pointer; }
  .missing-item:hover { color:#0d6e6e; text-decoration:underline; }

  .ack-box { display:flex; align-items:flex-start; gap:0.75rem; padding:0.8rem 0; border-bottom:1px solid #f0eef8; }
  .ack-box:last-child { border-bottom:none; }
  .ack-check { width:20px; height:20px; border-radius:5px; border:2px solid #d8d4e3;
    background:#f0ece6; cursor:pointer; flex-shrink:0; margin-top:1px;
    display:flex; align-items:center; justify-content:center; transition:all 0.15s; }
  .ack-check.checked { background:#16a34a; border-color:#16a34a; }
  .ack-text { font-size:0.84rem; color:#3d3a5c; line-height:1.55; font-weight:500; }

  .sec-divider { font-size:0.7rem; font-weight:700; color:#8b88b0; text-transform:uppercase;
    letter-spacing:0.5px; margin:0.9rem 0 0.5rem; padding-top:0.9rem; border-top:1px solid #f0eef8; }

  .sbar { display:flex; justify-content:space-between; align-items:center;
    margin-top:1.5rem; padding:1rem 1.5rem; background:#111;
    border-radius:12px; box-shadow:0 6px 28px rgba(30,26,62,0.22); border:1px solid rgba(255,255,255,0.1); }
  .ss { font-size:0.84rem; color:#8b92a8; font-weight:500; }
  .ss.ok { color:#4ade80; } .ss.err { color:#f87171; }
  .pbtn { padding:0.72rem 1.9rem; background:#16a34a; color:#fff; border:none;
    border-radius:10px; font-family:inherit; font-size:0.875rem; font-weight:700;
    cursor:pointer; transition:all 0.2s; box-shadow:0 4px 14px rgba(22,163,74,0.28); }
  .pbtn:hover:not(:disabled) { background:#15803d; transform:translateY(-1px); }
  .pbtn:disabled { opacity:0.6; cursor:not-allowed; }
  .sbtn { padding:0.72rem 1.5rem; background:transparent; color:#8b92a8;
    border:1.5px solid #2a2535; border-radius:10px; font-family:inherit;
    font-size:0.875rem; font-weight:600; cursor:pointer; transition:all 0.2s; }
  .sbtn:hover { color:#0d6e6e; border-color:#0d6e6e; }

  @media(max-width:640px){
    .grid { grid-template-columns:1fr 1fr; }
    .topbar { flex-direction:column; gap:0.6rem; align-items:flex-start; position:relative; }
  }
`;

function StepNav({ current, onNavigate }) {
  return (
    <div style={{background:"#fff",borderRadius:14,padding:"1.1rem 0.5rem",marginBottom:"1.6rem",display:"flex",alignItems:"center",justifyContent:"center",overflowX:"auto",boxShadow:"0 6px 28px rgba(30,26,62,0.22), 0 2px 8px rgba(30,26,62,0.12)"}}>
      {STEPS.map((s,i)=>{
        const isDone=current>s.n, isActive=current===s.n, col=ACCENTS[s.n];
        return(
          <div key={s.n} style={{display:"flex",alignItems:"center"}}>
            <button onClick={()=>onNavigate(s.path)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.3rem",background:"none",border:"none",cursor:"pointer",padding:"0.2rem 0.75rem"}}>
              <div style={{width:40,height:40,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",transition:"all 0.25s",
                background:isActive?col:isDone?STEP_DONE_BG:"#f2f1f9",
                border:isActive?`2px solid ${col}`:isDone?`2px solid ${STEP_CONN}`:"2px solid #e4e2ed",
                boxShadow:isActive?`0 4px 12px ${STEP_SHADOW}`:"none"}}>
                {isDone?<span style={{color:STEP_DONE_CK,fontWeight:800,fontSize:"0.9rem"}}>✓</span>
                  :<span style={{fontSize:"1rem",filter:isActive?"brightness(0) invert(1)":"none"}}>{s.icon}</span>}
              </div>
              <span style={{fontSize:"0.67rem",fontWeight:700,letterSpacing:"0.6px",textTransform:"uppercase",whiteSpace:"nowrap",color:isActive?col:isDone?STEP_DONE_CK:"#8b88b0"}}>{s.label}</span>
            </button>
            {i<STEPS.length-1&&<div style={{width:38,height:2,background:current>s.n?STEP_CONN:"#ccc9e4",margin:"0 -0.25rem",marginBottom:"1.4rem",borderRadius:2,flexShrink:0}}/>}
          </div>
        );
      })}
    </div>
  );
}

function maskAadhaar(a) {
  if (!a) return "—";
  const d = String(a).replace(/\D/g, "");
  return `XXXX XXXX ${d.slice(-4)||d}`;
}
function maskAccount(last4, full) {
  if (!last4 && !full) return "—";
  const l4 = last4 || (full ? full.slice(-4) : "");
  const len = full ? full.length : 12;
  return "•".repeat(Math.max(0, len - 4)) + " " + l4;
}

function KV({ label, value }) {
  return (
    <div className="kv">
      <span className="kv-label">{label}</span>
      <span className={`kv-val${!value?" empty":""}`}>{value || "—"}</span>
    </div>
  );
}

function SectionHead({ icon, title, colorClass, onEdit }) {
  return (
    <div className="sh">
      <div className={`si ${colorClass}`}>{icon}</div>
      <span className="st">{title}</span>
      <button className="edit-link" onClick={onEdit}>✏️ Edit</button>
    </div>
  );
}

function AttChip({ label, docKey, urls }) {
  if (!docKey) return <span className="att-chip missing">⚠ {label} missing</span>;
  const url = urls[docKey];
  if (!url) return <span className="att-chip" style={{opacity:0.6,cursor:"wait"}}>⏳ {label}</span>;
  return <a className="att-chip" href={url} target="_blank" rel="noopener noreferrer">📎 {label}</a>;
}

function getMissingFields(d, empHistory, empAcksData) {
  const issues = [];

  // ── Page 1 — Personal Details ──
  const p1 = [];
  if (!d.firstName)   p1.push("First Name");
  if (!d.lastName)    p1.push("Last Name");
  if (!d.dob)         p1.push("Date of Birth");
  if (!d.gender)      p1.push("Gender");
  if (!d.nationality) p1.push("Nationality");
  if (!d.mobile)      p1.push("Mobile");
  if (!(d.aadhaar || d.aadhar)) p1.push("Aadhaar Number");
  if (!d.nameAsPerAadhaar)      p1.push("Name as per Aadhaar");
  if (!d.pan)         p1.push("PAN Number");
  if (!d.nameAsPerPan) p1.push("Name as per PAN");
  if (!d.hasPassport)  p1.push("Do you have a Passport?");
  if (!d.bloodGroup)   p1.push("Blood Group");
  if (!d.maritalStatus) p1.push("Marital Status");
  if (!d.aadhaarKey)  p1.push("Aadhaar Document");
  if (!d.panKey)      p1.push("PAN Document");
  if (!d.photoKey)    p1.push("Profile Photo");
  const cur = d.currentAddress || {};
  if (!cur.door)      p1.push("Current Address – Door No.");
  if (!cur.district)  p1.push("Current Address – District");
  if (!cur.state)     p1.push("Current Address – State");
  if (!cur.pin)       p1.push("Current Address – Pincode");
  if (!d.bankName)        p1.push("Bank Name");
  if (d.bankName === "Other" && !d.bankOther) p1.push("Bank Name (Other)");
  if (!d.bankAccountName) p1.push("Name as per Bank Account");
  if (!d.ifsc)            p1.push("IFSC Code");
  if (!d.branch)          p1.push("Branch Name");
  if (!d.accountType)     p1.push("Account Type");
  if (!d.accountFull && !d.accountLast4) p1.push("Account Number");
  if (p1.length) issues.push({ step:1, label:"Personal Details", path:"/employee/personal", fields:p1 });

  // ── Page 2 — Education ──
  const p2 = [];
  const edu   = d.education || {};
  const x     = edu.classX        || {};
  const inter = edu.intermediate  || {};
  const dip   = edu.diploma       || {};
  const ug    = edu.undergraduate || {};
  const pg    = edu.postgraduate  || {};
  if (!x.school)        p2.push("Class X – School Name");
  if (!x.board)         p2.push("Class X – Board");
  if (!x.hallTicket)    p2.push("Class X – Hall Ticket / Roll No.");
  if (!x.from)          p2.push("Class X – From Date");
  if (!x.to)            p2.push("Class X – To Date");
  if (!x.yearOfPassing) p2.push("Class X – Year");
  if (!x.address)       p2.push("Class X – School Address");
  if (!x.resultType)    p2.push("Class X – Result Type");
  if (!x.resultValue)   p2.push("Class X – Result");
  if (!x.medium)        p2.push("Class X – Medium of Study");
  if (!x.certKey)       p2.push("Class X – Document");
  if (!edu.afterTenth)  p2.push("What did you do after Class X?");
  if (edu.afterTenth === "Intermediate" || edu.afterTenth === "Both") {
    if (!inter.college)       p2.push("Intermediate – College");
    if (!inter.board)         p2.push("Intermediate – Board");
    if (!inter.hallTicket)    p2.push("Intermediate – Hall Ticket / Roll No.");
    if (!inter.from)          p2.push("Intermediate – From Date");
    if (!inter.to)            p2.push("Intermediate – To Date");
    if (!inter.yearOfPassing) p2.push("Intermediate – Year");
    if (!inter.address)      p2.push("Intermediate – College Address");
    if (!inter.mode)          p2.push("Intermediate – Mode");
    if (!inter.stream)        p2.push("Intermediate – Stream");
    if (!inter.resultType)    p2.push("Intermediate – Result Type");
    if (!inter.resultValue)   p2.push("Intermediate – Result");
    if (!inter.medium)        p2.push("Intermediate – Medium of Study");
    if (!inter.certKey)       p2.push("Intermediate – Document");
  }
  if (edu.afterTenth === "Diploma" || edu.afterTenth === "Both" || edu.hasDip === "Yes") {
    if (!dip.institute)    p2.push("Diploma – Institute Name");
    if (!dip.board)        p2.push("Diploma – Board / University");
    if (!dip.course)       p2.push("Diploma – Course");
    if (!dip.from)         p2.push("Diploma – From Date");
    if (!dip.to)           p2.push("Diploma – To Date");
    if (!dip.yearOfPassing) p2.push("Diploma – Year");
    if (!dip.resultType)   p2.push("Diploma – Result Type");
    if (!dip.resultValue)  p2.push("Diploma – Result");
    if (!dip.mode)         p2.push("Diploma – Mode");
    if (!dip.certKey)      p2.push("Diploma – Document");
  }
  if (edu.hasUG === "Yes") {
    if (!ug.country)                            p2.push("UG – Country of Institution");
    if (ug.country === "Outside India" && !ug.countryName) p2.push("UG – Country Name");
    if (!ug.college)     p2.push("UG – College Name");
    if (!ug.university)  p2.push("UG – University Name");
    if (!ug.course)      p2.push("UG – Course / Degree");
    if (ug.country !== "Outside India" && !ug.hallTicket) p2.push("UG – Hall Ticket / Roll No.");
    if (!ug.from)        p2.push("UG – From Date");
    if (!ug.to)          p2.push("UG – To Date");
    if (!ug.yearOfPassing) p2.push("UG – Year of Passing");
    if (!ug.address)     p2.push("UG – College Address");
    if (!ug.mode)        p2.push("UG – Mode");
    if (!ug.resultType)  p2.push("UG – Result Type");
    if (!ug.resultValue) p2.push("UG – Result");
    if (!ug.medium)      p2.push("UG – Medium of Study");
    if (!ug.backlogs)    p2.push("UG – Any Active Backlogs?");
    if (ug.backlogs !== "Yes" && !ug.provKey) p2.push("UG – Provisional Marksheet");
  }
  if (edu.hasPG === "Yes") {
    if (!pg.country)                            p2.push("PG – Country of Institution");
    if (pg.country === "Outside India" && !pg.countryName) p2.push("PG – Country Name");
    if (!pg.college)     p2.push("PG – College Name");
    if (!pg.university)  p2.push("PG – University Name");
    if (!pg.course)      p2.push("PG – Course / Degree");
    if (pg.country !== "Outside India" && !pg.hallTicket) p2.push("PG – Hall Ticket / Roll No.");
    if (!pg.from)        p2.push("PG – From Date");
    if (!pg.to)          p2.push("PG – To Date");
    if (!pg.yearOfPassing) p2.push("PG – Year of Passing");
    if (!pg.address)     p2.push("PG – College Address");
    if (!pg.mode)        p2.push("PG – Mode");
    if (!pg.resultType)  p2.push("PG – Result Type");
    if (!pg.resultValue) p2.push("PG – Result");
    if (!pg.medium)      p2.push("PG – Medium of Study");
    if (!pg.backlogs)    p2.push("PG – Any Active Backlogs?");
    if (pg.backlogs !== "Yes" && !pg.provKey) p2.push("PG – Provisional Marksheet");
  }
  if (!edu.hasCerts)      p2.push("Do you have any Certifications?");
  if (!edu.hasProfQual)   p2.push("Do you have any Professional Qualifications?");
  if (!edu.hasArticleship) p2.push("Do you have any Articleship / Practical Training?");
  if (edu.hasCerts === "Yes" && Array.isArray(edu.certifications)) {
    edu.certifications.forEach((c, i) => {
      if (!c.name)    p2.push(`Certification ${i+1} – Name`);
      if (!c.certKey) p2.push(`Certification ${i+1} – Document`);
    });
  }
  if (edu.hasProfQual === "Yes" && Array.isArray(edu.professionalQualifications)) {
    edu.professionalQualifications.forEach((q, i) => {
      if (!q.type)                       p2.push(`Professional Qualification ${i+1} – Type`);
      if (q.type === "Other" && !q.otherType) p2.push(`Professional Qualification ${i+1} – Specify Type`);
      if (!q.level)                      p2.push(`Professional Qualification ${i+1} – Level`);
      if (q.level !== "Pursuing" && !q.year) p2.push(`Professional Qualification ${i+1} – Year`);
    });
  }
  if (edu.hasArticleship === "Yes" && Array.isArray(edu.articleships)) {
    edu.articleships.forEach((a, i) => {
      if (!a.firm)                                    p2.push(`Articleship ${i+1} – Firm / Organisation`);
      if (!a.from)                                     p2.push(`Articleship ${i+1} – From Date`);
      if (!a.type)                                     p2.push(`Articleship ${i+1} – Training Type`);
      if (a.type === "Other Practical Training" && !a.otherType) p2.push(`Articleship ${i+1} – Specify Type`);
      if (!a.isOngoing)                                p2.push(`Articleship ${i+1} – Status`);
      if (a.isOngoing === "Completed" && !a.to)         p2.push(`Articleship ${i+1} – To Date`);
    });
  }
  if (!edu.hasEduGap) p2.push("Education Gap / Break Before First Job?");
  if (edu.hasEduGap === "Yes") {
    if (!edu.eduGapReason) p2.push("Education Gap – Reason");
    if (!edu.eduGapFrom)   p2.push("Education Gap – From Date");
    if (!edu.eduGapTo)     p2.push("Education Gap – To Date");
  }
  if (p2.length) issues.push({ step:2, label:"Education", path:"/employee/education", fields:p2 });

  // ── Page 3 — Employment History ──
  const p3 = [];
  if (!empAcksData) {
    // Employment-history record hasn't loaded/been created at all
    p3.push("At least one employment record required");
  } else {
    if (!empAcksData.resumeKey)     p3.push("Resume / CV Upload");
    if (!empAcksData.hasExperience) p3.push("Do you have prior work experience?");
    if (empAcksData.hasExperience === "Yes" && empHistory.length === 0) {
      p3.push("At least one employment record required");
    } else if (empAcksData.hasExperience === "Yes") {
      const lastIdx = empHistory.length - 1;
      empHistory.forEach((e, idx) => {
        const isCurrent = idx === lastIdx;
        const stillWorking = isCurrent && e.currentlyWorking === "Yes";
        const n = isCurrent ? "Current Employer" : `Employer ${idx + 1}`;
        if (!e.companyName)    p3.push(`${n} – Company Name`);
        if (!e.officeAddress)  p3.push(`${n} – Office Address`);
        if (!e.employeeId)     p3.push(`${n} – Employee ID`);
        if (!e.workEmail)      p3.push(`${n} – Official Work Email`);
        if (!e.designation)    p3.push(`${n} – Designation`);
        if (!e.department)     p3.push(`${n} – Department`);
        if (!e.duties)         p3.push(`${n} – Duties & Responsibilities`);
        if (!e.employmentType) p3.push(`${n} – Employment Type`);
        if (e.employmentType === "Contract") {
          if (!e.contractVendor?.company) p3.push(`${n} – Vendor Company`);
          if (!e.contractVendor?.email)   p3.push(`${n} – Vendor Email`);
          if (!e.contractVendor?.mobile)  p3.push(`${n} – Vendor Mobile`);
        }
        if (!e.startDate) p3.push(`${n} – Date of Joining`);
        if (isCurrent) {
          if (!e.currentlyWorking) p3.push(`${n} – Currently Working?`);
          if (e.currentlyWorking === "No" && !e.endDate) p3.push(`${n} – Date of Leaving`);
        } else if (!e.endDate) p3.push(`${n} – Date of Leaving`);
        if (!stillWorking && !e.reasonForRelieving) p3.push(`${n} – Reason for Leaving`);
        if (!stillWorking) {
          if (!e.reference?.role)   p3.push(`${n} – Reference Role`);
          if (!e.reference?.name)   p3.push(`${n} – Reference Name`);
          if (!e.reference?.email)  p3.push(`${n} – Reference Email`);
          if (!e.reference?.mobile) p3.push(`${n} – Reference Mobile`);
          if (!e.documents?.payslipsKey) p3.push(`${n} – Payslips`);
        }
        if (!e.documents?.offerLetterKey) p3.push(`${n} – Offer Letter`);
        if (isCurrent && e.currentlyWorking === "No" && !e.documents?.resignationKey) p3.push(`${n} – Resignation Acceptance`);
        // Experience/Relieving Letter deliberately NOT required — former employers can take weeks to issue it.
        if (e.gap?.hasGap === "Yes") {
          if (!e.gap.reason) p3.push(`${n} – Employment Gap Reason`);
          if (!e.gap.from)   p3.push(`${n} – Employment Gap From Date`);
          if (!e.gap.to)     p3.push(`${n} – Employment Gap To Date`);
        }
      });
    }
    const ackLabels = { business:"Other Business/Employment Declaration", dismissed:"Dismissal/Termination Declaration", criminal:"Criminal Conviction Declaration", civil:"Civil Judgment Declaration" };
    Object.entries(ackLabels).forEach(([key, label]) => {
      if (!empAcksData.acknowledgements?.[key]?.val) p3.push(label);
    });
    if (!empAcksData.declared) p3.push("Employment History Declaration Checkbox");
  }
  if (p3.length) issues.push({ step:3, label:"Employment History", path:"/employee/previous", fields:p3 });

  // ── Page 4 — UAN Details ──
  const p4 = [];
  if (!d.uanNumber && !d.hasUan) p4.push("UAN details not filled");
  else if (d.hasUan === "yes" || d.hasUan === true) {
    if (!d.uanNumber) p4.push("UAN Number");
    if (!d.epfoKey)   p4.push("UAN Card Upload");
    if (Array.isArray(d.epfoNominees) && d.epfoNominees.length > 0) {
      const totalShare = d.epfoNominees.reduce((s,n)=>s+(parseInt(n.share)||0),0);
      if (totalShare !== 100) p4.push(`Nominee Share Total (currently ${totalShare}%, must equal 100%)`);
    }
    if (!d.epfoDeclarations?.pfNomAck)      p4.push("PF Nomination Declaration");
    if (!d.epfoDeclarations?.pensionNomAck) p4.push("Pension Nomination Declaration");
    if (!d.epfoDeclarations?.epfoDecl)      p4.push("General EPFO Declaration");
    if (!d.epfoSignature?.s3Key) p4.push("Digital Signature");
  }
  if (p4.length) issues.push({ step:4, label:"UAN Details", path:"/employee/uan", fields:p4 });

  return issues;
}

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function isoToDisplay(iso) {
  if (!iso || !iso.includes("-")) return iso || "";
  const [y, mo, d] = iso.split("-");
  const idx = parseInt(mo, 10) - 1;
  const mName = MONTH_NAMES[idx] || mo;
  return `${parseInt(d,10)} ${mName} ${y}`;
}


// ── Self-export PDF helpers (mirrors employer dashboard's report builder,
//    adapted so an employee can download their own profile) ──────────────
const normalizeEducationSelf = (ed = {}) => {
  const isNewFormat = !!(ed.xSchool || ed.xBoard || ed.xiiSchool || ed.degCollege || ed.pgCollege);
  const base = isNewFormat ? {
    classX:        { school: ed.xSchool, board: ed.xBoard, yearOfPassing: ed.xYear, resultValue: ed.xPercent },
    intermediate:  { school: ed.xiiSchool, board: ed.xiiBoard, yearOfPassing: ed.xiiYear, resultValue: ed.xiiPercent },
    undergraduate: { college: ed.degCollege, course: ed.degName, branch: ed.degBranch, yearOfPassing: ed.degYear, resultValue: ed.degPercent },
    postgraduate:  { college: ed.pgCollege, course: ed.pgName, branch: ed.pgBranch, yearOfPassing: ed.pgYear, resultValue: ed.pgPercent },
  } : {
    classX:        ed?.classX        || ed?.class_x   || {},
    intermediate:  ed?.intermediate  || ed?.classXII  || ed?.class_xii || {},
    undergraduate: ed?.undergraduate || ed?.ug        || {},
    postgraduate:  ed?.postgraduate  || ed?.pg        || {},
  };
  return {
    ...base,
    diploma:                    ed?.diploma                    || {},
    certifications:             Array.isArray(ed?.certifications)             ? ed.certifications             : [],
    professionalQualifications: Array.isArray(ed?.professionalQualifications) ? ed.professionalQualifications : [],
    articleships:               Array.isArray(ed?.articleships)               ? ed.articleships               : [],
    hasEduGap:      ed?.hasEduGap      || "",
    eduGapReason:   ed?.eduGapReason   || "",
    eduGapFrom:     ed?.eduGapFrom     || "",
    eduGapTo:       ed?.eduGapTo       || "",
    hasDip:         ed?.hasDip         || "",
    hasCerts:       ed?.hasCerts       || "",
    hasProfQual:    ed?.hasProfQual    || "",
    hasArticleship: ed?.hasArticleship || "",
  };
};

const normalizeProfileSelf = (snap = {}) => {
  const u = snap?.uanMaster || snap?.uan_master || {};
  return {
    ...snap,
    education:    normalizeEducationSelf(snap?.education || {}),
    uanNumber:    snap?.uanNumber    || snap?.uan_number    || u?.uanNumber    || u?.uan_number,
    nameAsPerUan: snap?.nameAsPerUan || snap?.name_as_per_uan || u?.nameAsPerUan || u?.name_as_per_uan,
    mobileLinked: snap?.mobileLinked || snap?.mobile_linked  || u?.mobileLinked || u?.mobile_linked,
    isActive:     snap?.isActive     || snap?.is_active      || u?.isActive     || u?.is_active,
    pfRecords:    Array.isArray(snap?.pfRecords) ? snap.pfRecords : Array.isArray(snap?.pf_records) ? snap.pf_records : [],
  };
};

// familyDetails mixes two DOB formats: ISO (yyyy-mm-dd) when copied straight from Personal
// Details ("My Parents"), and dd-mm-yyyy from NomineeDobField everywhere else (spouse,
// children, in-laws). Detect which one we've got and format either correctly.
function anyDobToDisplaySelf(val) {
  if (!val) return "";
  const parts = val.split("-");
  if (parts.length !== 3) return val;
  return parts[0].length === 4 ? isoToDisplay(val) : ddmmyyyyToDisplaySelf(val);
}
function ddmmyyyyToDisplaySelf(val) {
  if (!val || val.length !== 10) return val || "";
  const [dd, mm, yyyy] = val.split("-");
  const idx = parseInt(mm, 10) - 1;
  const mName = MONTH_NAMES[idx];
  if (!mName) return val;
  return `${parseInt(dd, 10)} ${mName} ${yyyy}`;
}

async function buildMyProfilePdf(profile, empHistory, documents, employeeSelfName) {
  const d   = profile || {};
  const cur  = d.currentAddress   || {};
  const perm = d.permanentAddress || {};
  const edu  = d.education        || {};

  // Build ordered document list with base64 images
  // Sequence: personal → education → employment → uan
  const DOC_ORDER = [
    // ── Personal (Page 1) ──────────────────────────────────────────
    { key: "photo",          label: "Profile Photo",                  group: "personal" },
    { key: "aadhaar",        label: "Aadhaar Card",                   group: "personal" },
    { key: "pan",            label: "PAN Card",                       group: "personal" },
    { key: "passport",       label: "Passport",                       group: "personal" },
    // ── Education (Page 2) — same order as form ───────────────────
    { key: "classX",         label: "Class X Certificate",            group: "education" },
    { key: "intermediate",   label: "Intermediate Certificate",       group: "education" },
    { key: "diploma",        label: "Diploma Certificate",            group: "education" },
    { key: "ug_provisional", label: "UG Provisional Marksheet",       group: "education" },
    { key: "ug_convocation", label: "UG Convocation Certificate",     group: "education" },
    { key: "ug_equivalency", label: "UG Equivalency Certificate (Foreign Degree)", group: "education" },
    { key: "pg_provisional", label: "PG Provisional Marksheet",       group: "education" },
    { key: "pg_convocation", label: "PG Convocation Certificate",     group: "education" },
    { key: "pg_equivalency", label: "PG Equivalency Certificate (Foreign Degree)", group: "education" },
    { key: /^profqual_/,     label: "Professional Qualification",     group: "education" },
    { key: /^articleship_/,  label: "Articleship / Training Letter",  group: "education" },
    // NOTE: cert_ (Professional Certifications) intentionally excluded from PDF
    // ── Employment (Page 3) — CV first, then per-employer docs ────
    { key: "cv",             label: "Resume / CV",                    group: "general" },
    { key: "offerLetter",    label: "Offer Letter",                   group: "employment" },
    { key: "payslips",       label: "Payslips (Last 3 Months)",       group: "employment" },
    { key: "resignation",    label: "Resignation Acceptance",         group: "employment" },
    { key: "experience",     label: "Experience / Relieving Letter",  group: "employment" },
    { key: "idCard",         label: "Company ID Card",                group: "employment" },
    // ── UAN (Page 4) ──────────────────────────────────────────────
    { key: "uanCard",        label: "UAN Card / Passbook",            group: "uan" },
    { key: "serviceHistory", label: "Service History Snapshot",       group: "uan" },
    { key: "signature",      label: "Digital Signature (latest)",     group: "uan" },
  ];

  // Flatten all documents
  const allDocs = [];
  if (documents) {
    for (const [group, docs] of Object.entries(documents)) {
      for (const [subKey, doc] of Object.entries(docs)) {
        allDocs.push({ subKey, doc, group });
      }
    }
  }

  // Sort by DOC_ORDER
  const sortedDocs = [];
  for (const orderEntry of DOC_ORDER) {
    const matches = allDocs.filter(({ subKey, group }) => {
      const keyMatch = typeof orderEntry.key === "string"
        ? subKey === orderEntry.key
        : orderEntry.key.test(subKey);
      return keyMatch;
    });
    for (const m of matches) {
      const idx = sortedDocs.findIndex(x => x.subKey === m.subKey && x.group === m.group);
      if (idx === -1) sortedDocs.push({ ...m, label: orderEntry.label });
    }
  }
  // Add any not matched — but never include cert_ (Professional Certifications excluded from PDF)
  for (const item of allDocs) {
    if (!sortedDocs.find(x => x.subKey === item.subKey && x.group === item.group)) {
      if (/^cert_/.test(item.subKey)) continue; // Professional Certifications excluded
      sortedDocs.push({ ...item, label: item.subKey });
    }
  }

  // Build doc list with type info — use URLs directly (avoids S3 CORS issues with fetch)
  const docsWithData = sortedDocs.map((item) => {
    const url = item.doc.url || item.doc.signedUrl || item.doc.signed_url || item.doc.downloadUrl || item.doc.download_url || item.doc.presignedUrl || item.doc.presigned_url || item.doc.link || item.doc.href || "";
    const filename = item.doc.filename || "";
    const isImage = /\.(jpg|jpeg|png)$/i.test(filename);
    const isPdf   = /\.pdf$/i.test(filename);
    return { ...item, isImage, isPdf, url };
  });

  const row = (label, value) => value && value !== "—" ? `
    <tr>
      <td style="padding:5px 12px 5px 0;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;width:36%;border-bottom:1px solid #f1f5f9;vertical-align:top">${label}</td>
      <td style="padding:5px 0 5px 0;color:#0f172a;font-size:12px;border-bottom:1px solid #f1f5f9">${value}</td>
    </tr>` : "";

  const section = (title, rows, color = "#1e293b") => rows.trim() ? `
    <div style="margin-bottom:22px;page-break-inside:avoid">
      <div style="background:${color};color:#fff;padding:5px 12px;font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;border-radius:4px 4px 0 0;margin-bottom:0">${title}</div>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 4px 4px">${rows}</table>
    </div>` : "";

  const eduSection = (title, s, color) => {
    if (!s || !Object.values(s).some(Boolean)) return "";
    return section(title, [
      row("Institution",          s.school || s.college || s.institute),
      row("Board / University",   s.board || s.university),
      row("Country",              s.country === "Outside India" ? (s.countryName || "Outside India") : ""),
      row("Stream",               s.stream),
      row("Course / Degree",      s.course),
      row("Branch / Specialization", s.branch || s.specialization),
      row("Year of Passing",      s.yearOfPassing),
      row("From",                 isoToDisplay(s.from)),
      row("To",                   isoToDisplay(s.to)),
      row("Hall Ticket / Roll No.", s.hallTicket),
      row("Result",               s.resultValue ? `${s.resultType || ""} ${s.resultValue}`.trim() : ""),
      row("Mode",                 s.mode),
      row("Medium",               s.medium),
      row("Backlogs",             s.backlogs),
      row("Equivalency Certificate", s.country === "Outside India" ? (s.equivalencyKey ? "Uploaded" : "Not yet uploaded") : ""),
      row("Address",              s.address),
    ].join(""), color);
  };

  // Return HTML string instead of opening new tab
  const htmlString = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>My Profile — ${[d.firstName, d.lastName].filter(Boolean).join(" ") || "Employee"}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #0f172a; font-size: 12px; line-height: 1.5; }
    @page { margin: 20mm 15mm; }
    @media print {
      .no-print { display: none !important; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body style="padding:32px;max-width:900px;margin:0 auto">

  <!-- Report Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;padding-bottom:14px;border-bottom:2.5px solid #1e293b">
    <div>
      <div style="font-size:20px;font-weight:800;color:#1e293b;letter-spacing:-0.5px">Datagate</div>
      <div style="font-size:9px;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;margin-top:2px">Your Profile — Self-Downloaded Copy</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:10px;color:#64748b">Generated: ${new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})}</div>
      <div style="font-size:10px;color:#64748b;margin-top:1px">Downloaded by: <strong>${employeeSelfName || "—"}</strong> (self-export)</div>
      <div style="margin-top:6px;display:inline-block;background:#dcfce7;color:#15803d;padding:3px 10px;border-radius:999px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">📄 Your Own Copy — Not an Employer-Shared Report</div>
    </div>
  </div>

  <!-- Name Banner -->
  <div style="background:#1e293b;color:#fff;padding:14px 18px;border-radius:8px;margin-bottom:22px">
    <div style="font-size:17px;font-weight:700">${[d.firstName, d.middleName, d.lastName].filter(Boolean).join(" ") || "—"}</div>
    <div style="font-size:10px;color:#94a3b8;margin-top:3px">${d.email || ""} ${d.mobile ? "· +91 " + d.mobile : ""}</div>
  </div>

  <!-- ══ SECTION 1: PERSONAL ══ -->
  <div style="font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;margin-top:4px">Page 1 — Personal Details</div>

  ${section("Personal Information", [
    row("Date of Birth",    isoToDisplay(d.dob)),
    row("Gender",           d.gender==="Other"&&d.genderOther?`Other — ${d.genderOther}`:d.gender),
    row("Religion",         d.religion),
    row("Category",         d.category),
    row("Nationality",      d.nationality),
    row("Blood Group",      d.bloodGroup),
    row("Marital Status",   d.maritalStatus),
  ].join(""))}

  ${section("Family", [
    row("Father's Name", d.fatherName || [d.fatherFirst, d.fatherMiddle, d.fatherLast].filter(Boolean).join(" ")),
    row("Father's Date of Birth", isoToDisplay(d.fatherDob)),
    row("Mother's Name", d.motherName || [d.motherFirst, d.motherMiddle, d.motherLast].filter(Boolean).join(" ")),
    row("Mother's Date of Birth", isoToDisplay(d.motherDob)),
    d.maritalStatus === "Married" ? row("Spouse Name", d.spouseName) : "",
    d.maritalStatus === "Married" ? row("Spouse Date of Birth", isoToDisplay(d.spouseDob)) : "",
  ].join(""))}

  ${section("Identity Documents", [
    row("Aadhaar Number",     d.aadhaar || d.aadhar),
    row("Name as per Aadhaar", d.nameAsPerAadhaar),
    row("PAN Number",         d.pan),
    row("Name as per PAN",    d.nameAsPerPan),
    row("Has Passport",       d.hasPassport),
    d.hasPassport === "Yes" ? row("Passport Number",   d.passport)      : "",
    d.hasPassport === "Yes" ? row("Issue Date",         isoToDisplay(d.passportIssue)) : "",
    d.hasPassport === "Yes" ? row("Expiry Date",        isoToDisplay(d.passportExpiry)): "",
  ].join(""))}

  ${section("Emergency Contact", [
    row("Name",         d.emergName),
    row("Relationship", d.emergRel),
    row("Phone",        d.emergPhone),
  ].join(""))}

  ${section("Current Address", [
    row("Door / Street",   cur.door),
    row("Village / Area",  cur.village),
    row("Tehsil / Taluk",  cur.locality),
    row("District",        cur.district),
    row("State",           cur.state),
    row("Pincode",         cur.pin),
    row("Residing From",   isoToDisplay(cur.from)),
  ].join(""))}

  ${(perm.door || perm.state) ? section("Permanent / Native Address", [
    row("Door / Street",   perm.door),
    row("Village / Area",  perm.village),
    row("Tehsil / Taluk",  perm.locality),
    row("District",        perm.district),
    row("State",           perm.state),
    row("Pincode",         perm.pin),
  ].join("")) : ""}

  ${section("Bank Account Details", [
    row("Bank Name",           d.bankName === "Other" && d.bankOther ? `Other — ${d.bankOther}` : d.bankName),
    row("Account Holder Name", d.bankAccountName),
    row("IFSC Code",           d.ifsc),
    row("Branch",              d.branch),
    row("Account Type",        d.accountType),
    row("Account Number",      d.accountFull || (d.accountLast4 ? `••••••••${d.accountLast4}` : "")),
  ].join(""))}

  <!-- ══ SECTION 2: EDUCATION ══ -->
  <div style="font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;margin-top:20px">Page 2 — Education</div>

  ${eduSection("Class X — SSC / Matriculation",      edu.classX,        "#334155")}
  ${eduSection("Intermediate — HSC / 12th",           edu.intermediate,  "#334155")}
  ${(edu.hasDip==="Yes"||edu.diploma?.institute) && edu.diploma && Object.values(edu.diploma).some(Boolean) ? eduSection("Diploma / Technical / Vocational", edu.diploma, "#334155") : ""}
  ${eduSection("Undergraduate / Degree",              edu.undergraduate, "#334155")}
  ${edu.postgraduate?.college ? eduSection("Postgraduate / Masters", edu.postgraduate, "#334155") : ""}

  ${Array.isArray(edu.professionalQualifications) && edu.professionalQualifications.length > 0 ? section("Professional Qualifications", edu.professionalQualifications.map((q,i) => [
    row(`Qualification ${i+1} — Type`,  q.type==="Other"?(q.otherType||"Other"):q.type),
    row(`Qualification ${i+1} — Level`, q.level),
    row(`Qualification ${i+1} — Year`,  q.year || (q.level === "Pursuing" ? "Pursuing" : "")),
  ].join("")).join(""), "#334155") : ""}

  ${Array.isArray(edu.articleships) && edu.articleships.length > 0 ? section("Articleship / Practical Training", edu.articleships.map((a,i) => [
    row(`Training ${i+1} — Type`,      a.type==="Other Practical Training"?(a.otherType||a.type):a.type),
    row(`Training ${i+1} — Firm`,      a.firm),
    row(`Training ${i+1} — City`,      a.city),
    row(`Training ${i+1} — Principal`, a.principalName),
    row(`Training ${i+1} — Reg. No.`,  a.regNo),
    row(`Training ${i+1} — From`,      a.from),
    row(`Training ${i+1} — To`,        a.to || (a.isOngoing === "Ongoing" ? "Ongoing" : "")),
  ].join("")).join(""), "#334155") : ""}

  ${Array.isArray(edu.certifications) && edu.certifications.length > 0 ? section("Certifications", edu.certifications.map((c,i) => row(`Certification ${i+1}`, c.name)).join(""), "#334155") : ""}

  ${edu.hasEduGap === "Yes" ? section("Education Gap Before First Job", [
    row("Had Gap",  edu.hasEduGap),
    row("From",     isoToDisplay(edu.eduGapFrom)),
    row("To",       isoToDisplay(edu.eduGapTo)),
    row("Reason",   edu.eduGapReason),
  ].join(""), "#334155") : ""}

  <!-- ══ SECTION 3: EMPLOYMENT ══ -->
  <div style="font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;margin-top:20px">Page 3 — Employment History</div>

  ${empHistory.length === 0 ? `<div style="padding:10px;color:#94a3b8;font-size:11px">No employment history provided.</div>` : [...empHistory].sort((a,b)=>(Number(a.sort_order??999))-(Number(b.sort_order??999))).map((e,i,arr) => section(
    i === arr.length-1 ? "Current / Most Recent Employer" : `Previous Employer ${i+1}`,
    [
      row("Company Name",          e.companyName),
      row("Designation",           e.designation),
      row("Department",            e.department),
      row("Employment Type",       e.employmentType),
      row("Employee ID",           e.employeeId),
      row("Work Email",            e.workEmail),
      row("Office Address",        e.officeAddress),
      row("Date of Joining",       isoToDisplay(e.startDate)),
      i === arr.length-1 ? row("Currently Working", e.currentlyWorking === "Yes" ? "Yes — Still Employed" : "No") : row("Date of Leaving", isoToDisplay(e.endDate)),
      i === arr.length-1 && e.currentlyWorking === "No" ? row("Date of Leaving", isoToDisplay(e.endDate)) : "",
      row("Reason for Leaving",    e.reasonForRelieving),
      row("Duties",                e.duties),
      e.employmentType === "Contract" ? row("Vendor Company", e.contractVendor?.company) : "",
      e.employmentType === "Contract" ? row("Vendor Email",   e.contractVendor?.email)   : "",
      e.employmentType === "Contract" ? row("Vendor Mobile",  e.contractVendor?.mobile)  : "",
      row("Reference Name",        e.reference?.name),
      row("Reference Role",        e.reference?.role),
      row("Reference Email",       e.reference?.email),
      row("Reference Mobile",      e.reference?.mobile),
      e.gap?.hasGap === "Yes" ? row("Employment Gap", e.gap?.reason) : "",
      e.gap?.hasGap === "Yes" ? row("Employment Gap From", isoToDisplay(e.gap?.from)) : "",
      e.gap?.hasGap === "Yes" ? row("Employment Gap To",   isoToDisplay(e.gap?.to))   : "",
    ].join(""), i === arr.length-1 ? "#18151f" : "#334155"
  )).join("")}

  <!-- ══ SECTION 4: UAN / EPFO ══ -->
  <div style="font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;margin-top:20px">Page 4 — UAN / EPFO</div>

  ${section("UAN Details", [
    row("Has UAN",           d.hasUan === "yes" || d.hasUan === true ? "Yes" : "No"),
    row("UAN Number",        d.uanNumber),
    row("Name as per UAN",   d.nameAsPerUan),
    row("Mobile Linked",     d.mobileLinked),
    row("UAN Active",        d.isActive),
  ].join(""), "#334155")}

  ${Array.isArray(d.pfRecords) && d.pfRecords.length > 0 ? d.pfRecords.filter(pf => pf.companyName).map((pf,i) => section(
    `PF Record — ${pf.companyName}`,
    pf.hasPf === "No"
      ? row("PF Status", "PF not maintained by this employer")
      : [
          row("PF Type",          pf.pfType === "Trust" ? "Company's Own PF Trust (Exempted)" : pf.pfType === "EPFO" ? "EPFO (Government)" : ""),
          row("PF Member ID",     pf.pfMemberId),
          row("Date of Joining",  pf.dojEpfo),
          row("Date of Exit",     pf.doeEpfo),
          row("PF Transferred",   pf.pfTransferred),
        ].join(""),
    "#334155"
  )).join("") : ""}

  ${d.familyDetails && (d.familyDetails.spouseName || d.familyDetails.spouseDob || d.familyDetails.hasChildren === "Yes" || (d.familyDetails.parentsCoverage && d.familyDetails.parentsCoverage !== "Not Applicable")) ? section("Family Details — Health Insurance", [
    row("Spouse Name",             d.familyDetails.spouseName),
    row("Spouse Date of Birth",    anyDobToDisplaySelf(d.familyDetails.spouseDob)),
    ...(Array.isArray(d.familyDetails.children) ? d.familyDetails.children.flatMap((c,i) => [
      row(`Child ${i+1} Name`,   c.name),
      row(`Child ${i+1} DOB`,    anyDobToDisplaySelf(c.dob)),
      row(`Child ${i+1} Gender`, c.gender),
    ]) : []),
    d.familyDetails.parentsCoverage && d.familyDetails.parentsCoverage !== "Not Applicable" ? row("Parents Covered", d.familyDetails.parentsCoverage) : "",
    row(d.familyDetails.parentsCoverage === "My Parents" ? "Father's Name" : "Father-in-law's Name", d.familyDetails.excludeFather ? "Excluded — passed away" : d.familyDetails.fatherName),
    row(d.familyDetails.parentsCoverage === "My Parents" ? "Father's DOB"  : "Father-in-law's DOB",  d.familyDetails.excludeFather ? "" : anyDobToDisplaySelf(d.familyDetails.fatherDob)),
    row(d.familyDetails.parentsCoverage === "My Parents" ? "Mother's Name" : "Mother-in-law's Name", d.familyDetails.excludeMother ? "Excluded — passed away" : d.familyDetails.motherName),
    row(d.familyDetails.parentsCoverage === "My Parents" ? "Mother's DOB"  : "Mother-in-law's DOB",  d.familyDetails.excludeMother ? "" : anyDobToDisplaySelf(d.familyDetails.motherDob)),
  ].join(""), "#334155") : ""}

  ${section("EPFO Declarations & Digital Signature", [
    row("PF Nomination Declaration (Form 2 — Part A)",      d.epfoDeclarations?.pfNomAck ? "✓ Agreed" : "Not agreed"),
    row("Pension Nomination Declaration (Form 2 — Part B)", d.epfoDeclarations?.pensionNomAck ? "✓ Agreed" : "Not agreed"),
    row("General EPFO Declaration",                          d.epfoDeclarations?.epfoDecl ? "✓ Agreed" : "Not agreed"),
    row("Digital Signature", d.epfoSignature?.s3Key ? `✓ Signed${d.epfoSignature?.timestamp ? " on " + new Date(d.epfoSignature.timestamp).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}) : ""}` : "⚠ Not yet signed"),
  ].join(""), "#334155")}

  <!-- ══ SECTION 5: DOCUMENTS ══ -->
  <div style="font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin-bottom:14px;margin-top:20px">Documents — In Sequence Order</div>

  ${docsWithData.length > 0 ? (() => {
    // Group docs by employer — sort by employment history order
    const sortedEmp = [...(empHistory||[])].sort((a,b)=>(Number(a.sort_order??999))-(Number(b.sort_order??999)));
    const groups = {};
    const nonEmpDocs = [];
    docsWithData.forEach(item => {
      if (item.group.startsWith("employment/")) {
        const cid = item.group.split("/")[1];
        if (!groups[cid]) groups[cid] = [];
        groups[cid].push(item);
      } else {
        nonEmpDocs.push(item);
      }
    });
    const docBlock = (item, label) => `
    <div style="margin-bottom:16px;page-break-inside:avoid">
      <div style="background:#475569;color:#fff;padding:4px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;border-radius:4px 4px 0 0">${label}</div>
      <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 4px 4px;padding:10px;background:#fafafa">
        <div style="font-size:9px;color:#94a3b8;margin-bottom:6px;font-family:monospace">${item.doc.filename || item.subKey}</div>
        ${!item.url ? `<div style="padding:8px;background:#fef2f2;border-radius:4px;font-size:10px;color:#dc2626">⚠ No URL found.</div>`
          : item.isImage ? `<img src="${item.url}" referrerpolicy="no-referrer" style="max-width:100%;max-height:400px;object-fit:contain;border-radius:4px;border:1px solid #e2e8f0;display:block" />`
          : item.isPdf ? `<div style="padding:12px;background:#eff6ff;border-radius:4px;border:1px solid #bfdbfe;text-align:center"><div style="font-size:12px;margin-bottom:4px">📄 PDF Document</div><a href="${item.url}" target="_blank" style="color:#2563eb;font-size:10px;font-weight:600">Open PDF ↗</a><div style="font-size:9px;color:#94a3b8;margin-top:3px">Links expire in 1 hour</div></div>`
          : `<a href="${item.url}" target="_blank" style="color:#2563eb;font-size:10px">View Document ↗</a>`}
      </div>
    </div>`;
    // Non-employment docs first (resume, identity etc)
    let html = nonEmpDocs.map(item => docBlock(item, item.label)).join("");
    // Then per-employer grouped docs in employment history order
    sortedEmp.forEach((emp, ei) => {
      const empDocs = groups[emp.company_id] || [];
      if (empDocs.length === 0) return;
      const empLabel = ei === sortedEmp.length - 1 ? "Current Employer" : `Previous Employer ${ei + 1}`;
      html += `<div style="margin-top:20px;margin-bottom:8px;padding:6px 12px;background:#1e293b;color:#fff;border-radius:6px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;page-break-before:auto">${empLabel} — ${emp.companyName || emp.company_id}</div>`;
      html += empDocs.map(item => docBlock(item, item.label)).join("");
    });
    return html;
  })() : `<div style="padding:14px;background:#fffbeb;border:1px solid #fde68a;border-radius:6px;font-size:11px;color:#92400e">No documents on file for this candidate.</div>`}

  <!-- Footer -->
  <div style="border-top:1px solid #e2e8f0;padding-top:10px;margin-top:24px;display:flex;justify-content:space-between">
    <div style="font-size:9px;color:#94a3b8">Generated by Datagate · datagate.co.in</div>
    <div style="font-size:9px;color:#94a3b8">Self-reported data. Not independently verified by Datagate.</div>
  </div>

  <!-- Print Button -->
  <div class="no-print" style="position:fixed;bottom:20px;right:20px;display:flex;gap:10px;z-index:999">
    <button onclick="window.print()" style="padding:10px 22px;background:#1e293b;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,0.2)">🖨 Print / Save PDF</button>
    <button onclick="window.close()" style="padding:10px 18px;background:#f1f5f9;color:#475569;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer">Close</button>
  </div>
</body>
</html>`;
  return htmlString;
}

function MyPrintPreviewModal({ html, onClose }) {
  if (!html) return null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:999,display:"flex",flexDirection:"column",background:"#1a1a1a"}}>
      <div className="no-print" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.6rem 1.2rem",background:"#111",borderBottom:"1px solid #2a2a2a",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
          <span style={{color:"#fff",fontWeight:700,fontSize:"0.9rem",fontFamily:"inherit"}}>📄 Your Profile — Preview</span>
          <span style={{color:"#94a3b8",fontSize:"0.72rem"}}>Review before printing or saving as PDF</span>
        </div>
        <div style={{display:"flex",gap:"0.6rem"}}>
          <button
            onClick={() => {
              const iframe = document.getElementById("dg-my-print-frame");
              if (iframe) { iframe.contentWindow.focus(); iframe.contentWindow.print(); }
            }}
            style={{padding:"0.45rem 1.1rem",background:"#0d6e6e",color:"#fff",border:"none",borderRadius:7,fontFamily:"inherit",fontSize:"0.78rem",fontWeight:700,cursor:"pointer"}}>
            🖨 Print / Save as PDF
          </button>
          <button
            onClick={onClose}
            style={{padding:"0.45rem 0.9rem",background:"#2a2a2a",color:"#94a3b8",border:"1px solid #3a3a3a",borderRadius:7,fontFamily:"inherit",fontSize:"0.78rem",fontWeight:600,cursor:"pointer"}}>
            ✕ Close
          </button>
        </div>
      </div>
      <iframe
        id="dg-my-print-frame"
        srcDoc={html}
        style={{flex:1,border:"none",background:"#fff"}}
        title="My Profile Preview"
      />
    </div>
  );
}

function DeleteAccountModal({ onConfirm, onCancel, loading }) {
  const [typed, setTyped] = useState("");
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,12,40,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,backdropFilter:"blur(4px)"}}>
      <div style={{background:"#fff",borderRadius:18,padding:"2rem",maxWidth:400,width:"90%",boxShadow:"0 24px 60px rgba(15,12,40,0.3)"}}>
        <div style={{fontSize:34,marginBottom:"0.75rem",textAlign:"center"}}>⚠️</div>
        <h3 style={{margin:"0 0 0.5rem",color:"#1a1730",fontWeight:800,fontSize:"1.05rem",textAlign:"center"}}>Delete your account?</h3>
        <p style={{color:"#6b6894",fontSize:"0.84rem",marginBottom:"1rem",lineHeight:1.6,textAlign:"center"}}>This permanently deletes your profile, all documents, and consent history. <strong>This cannot be undone.</strong></p>
        <p style={{fontSize:"0.78rem",color:"#6b6894",marginBottom:"0.4rem",fontWeight:600}}>Type <strong>DELETE</strong> to confirm:</p>
        <input
          style={{width:"100%",padding:"0.65rem 0.875rem",background:"#fff8f8",border:"1.5px solid #fecaca",borderRadius:9,fontFamily:"inherit",fontSize:"0.875rem",color:"#1a1730",outline:"none",marginBottom:"1rem",letterSpacing:"0.05em"}}
          value={typed} onChange={e=>setTyped(e.target.value.toUpperCase())} placeholder="Type DELETE here"
        />
        <div style={{display:"flex",gap:"0.75rem"}}>
          <button onClick={onCancel} style={{flex:1,padding:"0.7rem",borderRadius:9,border:"1.5px solid #dddaf0",background:"#f7f6fd",cursor:"pointer",fontWeight:600,color:"#6b6894",fontFamily:"inherit",fontSize:"0.875rem"}}>Cancel</button>
          <button onClick={onConfirm} disabled={typed!=="DELETE"||loading} style={{flex:1,padding:"0.7rem",borderRadius:9,border:"none",background:typed==="DELETE"?"#ef4444":"#fecaca",color:"#fff",cursor:typed==="DELETE"&&!loading?"pointer":"not-allowed",fontWeight:700,fontFamily:"inherit",fontSize:"0.875rem",transition:"background 0.15s"}}>{loading?"Deleting…":"Delete forever"}</button>
        </div>
      </div>
    </div>
  );
}

function SupportModal({ apiFetch, onClose }) {
  const CATS = ["account","consent","document","bgv","billing","other"];
  const [tab,     setTab]     = useState("new");   // "new" | "tickets"
  const [cat,     setCat]     = useState("account");
  const [subject, setSubject] = useState("");
  const [body,    setBody]    = useState("");
  const [busy,    setBusy]    = useState(false);
  const [ok,      setOk]      = useState("");
  const [err,     setErr]     = useState("");
  const [tickets, setTickets] = useState([]);
  const [tLoading,setTLoading]= useState(false);

  const loadTickets = async () => {
    setTLoading(true);
    try {
      const r = await apiFetch(`${API}/support/tickets`);
      if (r.ok) setTickets(await r.json());
    } catch(_) {}
    setTLoading(false);
  };

  const submit = async () => {
    if (!subject.trim() || !body.trim()) { setErr("Subject and message are required"); return; }
    setBusy(true); setErr("");
    try {
      const r = await apiFetch(`${API}/support/tickets`, {
        method: "POST",
        body: JSON.stringify({ category: cat, subject: subject.trim(), body: body.trim() }),
      });
      const d = await r.json();
      if (!r.ok) { setErr(d.detail || "Failed to submit"); setBusy(false); return; }
      setOk("✅ Ticket submitted! We'll get back to you within 2 business days.");
      setSubject(""); setBody(""); setCat("account");
      setTimeout(() => { setOk(""); setTab("tickets"); loadTickets(); }, 1800);
    } catch(_) { setErr("Network error — please try again"); }
    setBusy(false);
  };

  const statusColor = { open:"#f59e0b", in_progress:"#3b82f6", resolved:"#16a34a" };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,12,40,0.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3000,backdropFilter:"blur(4px)"}}>
      <div style={{background:"#fff",borderRadius:18,padding:"1.75rem",maxWidth:460,width:"92%",maxHeight:"85vh",overflow:"auto",boxShadow:"0 24px 60px rgba(15,12,40,0.3)"}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.1rem"}}>
          <div>
            <div style={{fontWeight:800,fontSize:"1rem",color:"#1a1730"}}>🎧 Help & Support</div>
            <div style={{fontSize:"0.7rem",color:"#8b88b0",marginTop:2}}>Datagate support team · usually replies in 1–2 days</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:"1.2rem",cursor:"pointer",color:"#8b88b0",lineHeight:1}}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",borderBottom:"2px solid #ebe9f5",marginBottom:"1.1rem"}}>
          {[["new","✍️ New Ticket"],["tickets","📋 My Tickets"]].map(([k,l])=>(
            <button key={k} onClick={()=>{setTab(k);if(k==="tickets")loadTickets();}}
              style={{padding:"0.45rem 0.9rem",background:"none",border:"none",borderBottom:`2.5px solid ${tab===k?"#0d6e6e":"transparent"}`,marginBottom:-2,cursor:"pointer",fontFamily:"inherit",fontSize:"0.75rem",fontWeight:700,color:tab===k?"#0d6e6e":"#94a3b8"}}>
              {l}
            </button>
          ))}
        </div>

        {tab === "new" ? (
          <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
            {/* Category */}
            <div>
              <div style={{fontSize:"0.65rem",fontWeight:700,color:"#8b88b0",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.35rem"}}>Category</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
                {CATS.map(c=>(
                  <button key={c} onClick={()=>setCat(c)}
                    style={{padding:"0.3rem 0.75rem",borderRadius:999,border:`1.5px solid ${cat===c?"#0d6e6e":"#ddd8f5"}`,background:cat===c?"#0d6e6e":"#f8f7ff",color:cat===c?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.72rem",fontWeight:600,fontFamily:"inherit",transition:"all 0.12s",textTransform:"capitalize"}}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div>
              <div style={{fontSize:"0.65rem",fontWeight:700,color:"#8b88b0",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.35rem"}}>Subject <span style={{color:"#ef4444"}}>*</span></div>
              <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Brief summary of your issue"
                style={{width:"100%",padding:"0.6rem 0.875rem",background:"#f8f7ff",border:"1.5px solid #ddd8f5",borderRadius:9,fontFamily:"inherit",fontSize:"0.84rem",color:"#1a1730",outline:"none"}}/>
            </div>

            {/* Body */}
            <div>
              <div style={{fontSize:"0.65rem",fontWeight:700,color:"#8b88b0",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.35rem"}}>Message <span style={{color:"#ef4444"}}>*</span></div>
              <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Describe your issue in detail…" rows={5}
                style={{width:"100%",padding:"0.6rem 0.875rem",background:"#f8f7ff",border:"1.5px solid #ddd8f5",borderRadius:9,fontFamily:"inherit",fontSize:"0.84rem",color:"#1a1730",outline:"none",resize:"vertical"}}/>
            </div>

            {err && <div style={{fontSize:"0.72rem",color:"#ef4444",fontWeight:600}}>{err}</div>}
            {ok  && <div style={{fontSize:"0.72rem",color:"#16a34a",fontWeight:600,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,padding:"0.5rem 0.75rem"}}>{ok}</div>}

            <button onClick={submit} disabled={busy}
              style={{padding:"0.7rem",background:"#0d6e6e",color:"#fff",border:"none",borderRadius:10,fontFamily:"inherit",fontSize:"0.875rem",fontWeight:700,cursor:busy?"not-allowed":"pointer",opacity:busy?0.6:1,transition:"all 0.15s"}}>
              {busy?"Submitting…":"Submit Ticket"}
            </button>
          </div>
        ) : (
          <div>
            {tLoading && <div style={{textAlign:"center",padding:"2rem",fontSize:"0.8rem",color:"#94a3b8"}}>Loading…</div>}
            {!tLoading && tickets.length === 0 && (
              <div style={{textAlign:"center",padding:"2.5rem 1rem"}}>
                <div style={{fontSize:32,opacity:0.2,marginBottom:"0.5rem"}}>🎫</div>
                <div style={{fontSize:"0.8rem",color:"#94a3b8"}}>No tickets yet</div>
              </div>
            )}
            {tickets.map(t=>(
              <div key={t.ticket_id} style={{border:"1px solid #ebe9f5",borderRadius:10,padding:"0.85rem 1rem",marginBottom:"0.6rem"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.35rem"}}>
                  <div style={{fontWeight:700,fontSize:"0.84rem",color:"#1a1730",flex:1,paddingRight:"0.5rem"}}>{t.subject}</div>
                  <span style={{fontSize:"0.65rem",fontWeight:700,color:statusColor[t.status]||"#94a3b8",background:`${statusColor[t.status]||"#94a3b8"}15`,padding:"2px 8px",borderRadius:999,whiteSpace:"nowrap",textTransform:"capitalize"}}>{t.status?.replace("_"," ")}</span>
                </div>
                <div style={{display:"flex",gap:"0.5rem",fontSize:"0.65rem",color:"#94a3b8"}}>
                  <span style={{background:"#f0ece6",padding:"1px 7px",borderRadius:999,textTransform:"capitalize"}}>{t.category}</span>
                  <span>{new Date(t.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
                </div>
                {t.replies?.length > 0 && (
                  <div style={{marginTop:"0.5rem",fontSize:"0.72rem",color:"#0d6e6e",fontWeight:600}}>💬 {t.replies.length} repl{t.replies.length===1?"y":"ies"}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReviewPage() {
  const router = useRouter();
  const { user, apiFetch, logout, ready } = useAuth();

  const [showSupport, setShowSupport]   = useState(false);
  const [showGearMenu, setShowGearMenu] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [myPrintHtml, setMyPrintHtml] = useState(null);
  const [showDeleteModal,setShowDeleteModal] = useState(false);
  const [deleteLoading,setDeleteLoading]     = useState(false);
  const [showPwChange,  setShowPwChange]    = useState(false);
  const [pwCurrent,     setPwCurrent]       = useState("");
  const [pwNew,         setPwNew]           = useState("");
  const [pwConfirm,     setPwConfirm]       = useState("");
  const [pwErr,         setPwErr]           = useState("");
  const [pwOk,          setPwOk]            = useState("");
  const [pwBusy,        setPwBusy]          = useState(false);

  const handleChangePassword = async () => {
    setPwErr(""); setPwOk("");
    if (!pwCurrent || !pwNew || !pwConfirm) { setPwErr("All fields required"); return; }
    if (pwNew !== pwConfirm) { setPwErr("Passwords do not match"); return; }
    if (pwNew.length < 8) { setPwErr("Must be at least 8 characters"); return; }
    setPwBusy(true);
    try {
      const r = await apiFetch(`${API}/auth/change-password`, {
        method: "POST",
        body: JSON.stringify({ current_password: pwCurrent, new_password: pwNew }),
      });
      const d = await r.json();
      if (!r.ok) { setPwErr(d.detail || "Failed to change password"); return; }
      setPwOk("Password changed! You will be signed out shortly.");
      setPwCurrent(""); setPwNew(""); setPwConfirm("");
      setTimeout(() => { setShowPwChange(false); logout(); }, 2500);
    } catch(_) { setPwErr("Network error. Please try again."); }
    finally { setPwBusy(false); }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const res = await apiFetch(`${API}/employee/account`, { method: "DELETE" });
      if (res.ok) {
        logout();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.detail || "Could not delete account. Please try again.");
        setDeleteLoading(false);
        setShowDeleteModal(false);
      }
    } catch (_) {
      alert("Network error. Please try again.");
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  const downloadMyProfile = async () => {
    setDownloadingPdf(true);
    try {
      const draftRes = await apiFetch(`${API}/employee/draft`);
      if (!draftRes.ok) { setDownloadingPdf(false); return; }
      const draft = await draftRes.json();
      if (!draft.employee_id) { setDownloadingPdf(false); return; }

      const [histRes, docsRes] = await Promise.all([
        apiFetch(`${API}/employee/employment-history/${draft.employee_id}`).catch(()=>null),
        apiFetch(`${API}/documents/${draft.employee_id}`).catch(()=>null),
      ]);
      const histData = histRes && histRes.ok ? await histRes.json() : {};
      const docsData = docsRes && docsRes.ok ? await docsRes.json() : {};

      const normalized = normalizeProfileSelf(draft);
      const employments = Array.isArray(histData.employments) ? histData.employments : [];
      const selfName = [draft.firstName, draft.lastName].filter(Boolean).join(" ") || user?.name || user?.email;

      const html = await buildMyProfilePdf(normalized, employments, docsData.documents || {}, selfName);
      setMyPrintHtml(html);
    } catch (_) {}
    setDownloadingPdf(false);
  };

  const [draft,        setDraft]        = useState(null);
  const [empHistory,   setEmpHistory]   = useState([]);
  const [empAcksData,  setEmpAcksData]  = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [acks,         setAcks]         = useState(Array(ACK_STATEMENTS.length).fill(false));
  const [profileEdited, setProfileEdited] = useState(false);
  const [saveStatus,   setSaveStatus]   = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [showSignout,  setShowSignout]  = useState(false);
  const [missingIssues,setMissingIssues]= useState([]);
  const [docUrls,      setDocUrls]      = useState({});

  // ── Capture ?edited=1 synchronously BEFORE router.replace cleans URL ──
  // This ref is set on first render from window.location so it never misses the param
  const editedOnMount = useRef(
    typeof window !== "undefined" && window.location.search.includes("edited=1")
  );
  // Track whether we've already applied the "edited" logic to avoid double-reset
  const editedAppliedRef = useRef(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/employee/login"); return; }
    if (user.role !== "employee") { router.replace("/employee/login"); return; }
  }, [ready, user, router]);

  // ── Data load: fetch draft, employment history, documents ──
  const loadData = useCallback(async () => {
    try {
      const dRes = await apiFetch(`${API}/employee/draft`);
      if (dRes.ok) {
        const d = await dRes.json();
        setDraft(d);

        // ── Determine editor vs reader mode ──
        // Editor mode if:
        //   (a) ?edited=1 was in the URL when page loaded
        //   (b) draft.page3_edited === true (page 3 was changed since last submit)
        //   (c) draft.page4_edited === true (page 4 was changed since last submit)
        const urlEdited = editedOnMount.current;
        const p1edited  = !!d.page1_edited;
        const p2edited  = !!d.page2_edited;
        const p3edited  = !!d.page3_edited;
        const p4edited  = !!d.page4_edited;
        const isEditorMode = urlEdited || p1edited || p2edited || p3edited || p4edited;

        if (isEditorMode && !editedAppliedRef.current) {
          editedAppliedRef.current = true;
          // Reset acks — user must re-confirm
          setAcks(Array(ACK_STATEMENTS.length).fill(false));
          setProfileEdited(true);
          // Clean the URL if it had ?edited=1
          if (urlEdited) {
            router.replace("/employee/review", undefined, { shallow: true });
          }
        } else if (!isEditorMode) {
          // Reader mode: restore saved acks if any
          if (d.acknowledgements_review && !editedAppliedRef.current) {
            const restored = ACK_STATEMENTS.map((_, i) => !!d.acknowledgements_review[String(i)]);
            if (restored.some(Boolean)) setAcks(restored);
          }
        }

        // Employment history + signed document URLs — run in parallel instead of
        // sequentially, since they're independent of each other. This was previously
        // waiting for employment-history to fully complete before even starting the
        // documents fetch, roughly doubling wait time on every single page load for
        // no reason — the two calls don't depend on each other's results.
        if (d.employee_id) {
          const [eRes, docRes] = await Promise.all([
            apiFetch(`${API}/employee/employment-history/${d.employee_id}`).catch(() => null),
            apiFetch(`${API}/documents/${d.employee_id}`).catch(() => null),
          ]);

          try {
            if (eRes && eRes.ok) {
              const ed = await eRes.json();
              const emps = ed.employments || (Array.isArray(ed) ? ed : (ed.items || []));
              const sortedEmps = [...emps].sort((a,b)=>(Number(a.sort_order??999))-(Number(b.sort_order??999)));
              setEmpHistory(sortedEmps);
              setEmpAcksData({ acknowledgements: ed.acknowledgements || {}, declared: !!ed.declared, resumeKey: ed.resumeKey || "", hasExperience: ed.hasExperience || "" });
            }
          } catch (_) {}

          try {
            if (docRes && docRes.ok) {
              const docData = await docRes.json();
              const urls = {};
              const flatten = (obj, depth=0) => {
                if (!obj || typeof obj !== "object" || depth > 8) return;
                if (obj.key && obj.url)    { urls[obj.key]    = obj.url; return; }
                if (obj.s3_key && obj.url) { urls[obj.s3_key] = obj.url; return; }
                if (obj.url && typeof obj.url === "string") {
                  const k = obj.key || obj.s3_key || obj.fileKey || obj.docKey;
                  if (k) urls[k] = obj.url;
                }
                if (Array.isArray(obj)) { obj.forEach(v => flatten(v, depth+1)); return; }
                Object.values(obj).forEach(v => flatten(v, depth+1));
              };
              flatten(docData);
              setDocUrls(urls);
            }
          } catch (_) {}
        }
      }
    } catch (_) {}
    setLoading(false);
  }, [apiFetch, router]);

  useEffect(() => { if (ready && user) loadData(); }, [ready, user, loadData]);

  useEffect(() => {
    if (!draft) return;
    setMissingIssues(getMissingFields(draft, empHistory, empAcksData));
  }, [draft, empHistory, empAcksData]);

  // ── If user edits something directly on page 5, switch to editor mode ──
  const handleInlineEdit = () => {
    if (!profileEdited) {
      setProfileEdited(true);
      setAcks(Array(ACK_STATEMENTS.length).fill(false));
    }
  };

  const handleNavigate = (path) => { router.push(path); };
  const toggleAck = (i) => {
    // If reader mode and user starts checking acks, treat as editor mode
    if (!profileEdited) handleInlineEdit();
    setAcks(prev => { const n=[...prev]; n[i]=!n[i]; return n; });
  };
  const allAcked = acks.every(Boolean);

  const handleSubmit = async () => {
    if (missingIssues.length > 0) {
      const msg = missingIssues.map(p => `Page ${p.step} (${p.label}): ${p.fields.slice(0,3).join(", ")}${p.fields.length>3?" & more":""}`).join(" · ");
      setSaveStatus(`⚠️ Incomplete: ${msg}`);
      window.scrollTo({ top:0, behavior:"smooth" });
      return;
    }

    // Only require acks if in editor mode
    if (profileEdited && !allAcked) {
      setSaveStatus("⚠️ Please accept all acknowledgements below before submitting.");
      document.getElementById("ack-section")?.scrollIntoView({ behavior:"smooth", block:"center" });
      return;
    }

    setSubmitting(true);
    setSaveStatus("Submitting…");
    const acksDict = Object.fromEntries(acks.map((v, i) => [String(i), v]));

    const safePfRecords = (Array.isArray(draft?.pfRecords) ? draft.pfRecords : [])
      .filter(r => r.companyName && (r.hasPf === "No" || (r.pfMemberId && r.dojEpfo && r.doeEpfo)));

    try {
      const res = await apiFetch(`${API}/employee`, {
        method: "POST",
        body: JSON.stringify({
          ...draft,
          pfRecords: safePfRecords,
          status: "submitted",
          submitted_at: Date.now(),
          last_saved_at: Date.now(),
          acknowledgements_review: acksDict,
          // ── Clear cascade flags on successful submit ──
          page1_edited: false,
          page2_edited: false,
          page3_edited: false,
          page4_edited: false,
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const detail = errBody?.detail;
        let msg = "Submission failed";
        if (Array.isArray(detail)) msg = detail.map(e => `${e.loc?.slice(-1)[0]||"field"}: ${e.msg}`).join(", ");
        else if (typeof detail === "string") msg = detail;
        throw new Error(msg);
      }
      setSaveStatus("Submitted ✓");
      setTimeout(() => router.push("/employee/submitted"), 1200);
    } catch (err) {
      setSaveStatus(`Error: ${err.message}`);
    }
    setSubmitting(false);
  };

  if (!ready || !user) return null;
  if (loading) return (
    <div style={{minHeight:"100vh",background:"#f5f4f0",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p style={{color:"#8b88b0",fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>Loading your profile…</p>
    </div>
  );

  const d    = draft || {};
  const cur  = d.currentAddress   || {};
  const perm = d.permanentAddress || {};
  const edu  = d.education        || {};

  return (
    <>
      <style>{G}</style>
      <div className="pg">
        {showSignout && (
          <div style={{position:"fixed",inset:0,background:"rgba(15,12,40,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(3px)"}}>
            <div style={{background:"#fff",borderRadius:18,padding:"2rem",maxWidth:340,width:"90%",textAlign:"center"}}>
              <div style={{fontSize:34,marginBottom:"0.75rem"}}>👋</div>
              <h3 style={{margin:"0 0 0.4rem",color:"#1a1730",fontWeight:800}}>Sign out?</h3>
              <p style={{color:"#6b6894",fontSize:"0.875rem",marginBottom:"1.5rem"}}>Your progress is saved.</p>
              <div style={{display:"flex",gap:"0.75rem"}}>
                <button onClick={()=>setShowSignout(false)} style={{flex:1,padding:"0.7rem",borderRadius:9,border:"1.5px solid #dddaf0",background:"inherit",cursor:"pointer",fontWeight:600,color:"#6b6894",fontFamily:"inherit",fontSize:"0.875rem"}}>Stay</button>
                <button onClick={()=>logout()} style={{flex:1,padding:"0.7rem",borderRadius:9,border:"none",background:"#ef4444",color:"#fff",cursor:"pointer",fontWeight:700,fontFamily:"inherit",fontSize:"0.875rem"}}>Sign out</button>
              </div>
            </div>
          </div>
        )}

        {myPrintHtml && <MyPrintPreviewModal html={myPrintHtml} onClose={() => setMyPrintHtml(null)} />}
        {showSupport && <SupportModal apiFetch={apiFetch} onClose={()=>setShowSupport(false)} />}
        {showDeleteModal && <DeleteAccountModal onConfirm={handleDeleteAccount} onCancel={()=>{setShowDeleteModal(false);}} loading={deleteLoading}/>}
        {showPwChange && (
          <div style={{position:"fixed",inset:0,background:"rgba(15,12,40,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,backdropFilter:"blur(4px)"}}>
            <div style={{background:"#fff",borderRadius:14,padding:"1.75rem",maxWidth:360,width:"90%",boxShadow:"0 32px 80px rgba(0,0,0,0.2)"}}>
              <div style={{fontSize:"0.95rem",fontWeight:700,color:"#0f172a",marginBottom:"1rem"}}>Change Password</div>
              {[["Current password",pwCurrent,setPwCurrent],["New password",pwNew,setPwNew],["Confirm new password",pwConfirm,setPwConfirm]].map(([label,val,setter])=>(
                <div key={label} style={{marginBottom:"0.65rem"}}>
                  <div style={{fontSize:"0.65rem",fontWeight:600,color:"#6b7280",marginBottom:"0.3rem",textTransform:"uppercase",letterSpacing:"0.4px"}}>{label}</div>
                  <PasswordInput value={val} onChange={e=>setter(e.target.value)}
                    inputStyle={{width:"100%",padding:"0.6rem 0.8rem",border:"1.5px solid #dddaf0",borderRadius:8,fontFamily:"inherit",fontSize:"0.84rem",outline:"none",background:"#f8f7ff"}} />
                </div>
              ))}
              {pwErr && <div style={{fontSize:"0.72rem",color:"#ef4444",marginBottom:"0.6rem",fontWeight:600}}>{pwErr}</div>}
              {pwOk  && <div style={{fontSize:"0.72rem",color:"#16a34a",marginBottom:"0.6rem",fontWeight:600}}>{pwOk}</div>}
              <div style={{display:"flex",gap:"0.6rem",marginTop:"0.5rem"}}>
                <button onClick={()=>{setShowPwChange(false);setPwErr("");setPwOk("");setPwCurrent("");setPwNew("");setPwConfirm("");}}
                  style={{flex:1,padding:"0.6rem",borderRadius:7,border:"1px solid #dddaf0",background:"#f5f4f0",cursor:"pointer",fontWeight:600,color:"#6b7280",fontFamily:"inherit",fontSize:"0.82rem"}}>Cancel</button>
                <button onClick={handleChangePassword} disabled={pwBusy}
                  style={{flex:1,padding:"0.6rem",borderRadius:7,border:"none",background:"#0d6e6e",color:"#fff",cursor:pwBusy?"not-allowed":"pointer",fontWeight:700,fontFamily:"inherit",fontSize:"0.82rem",opacity:pwBusy?0.6:1}}>
                  {pwBusy?"Saving…":"Change Password"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="topbar">
          <span className="logo-text">Datagate</span>
          <div className="topbar-right">
            <button className="bell-btn" title="Home — Personal Details" onClick={()=>router.push("/employee/personal")}>🏠</button>
            <span className="user-name">👤 {user.name || user.email}</span>
            <ConsentBell apiFetch={apiFetch} router={router}/>
            <div style={{position:"relative"}}>
              <button className="bell-btn" title="Settings" onClick={()=>setShowGearMenu(g=>!g)}>⚙️</button>
              {showGearMenu && (
                <>
                  <div style={{position:"fixed",inset:0,zIndex:199}} onClick={()=>setShowGearMenu(false)}/>
                  <div style={{position:"absolute",top:"calc(100% + 8px)",right:0,background:"#fff",border:"1.5px solid #dddaf0",borderRadius:10,boxShadow:"0 12px 32px rgba(26,23,48,0.14)",minWidth:210,zIndex:200,overflow:"hidden"}}>
                    <button onClick={()=>{setShowGearMenu(false);setShowPwChange(true);}} style={{display:"flex",alignItems:"center",gap:"0.6rem",width:"100%",textAlign:"left",padding:"0.6rem 0.9rem",background:"none",border:"none",fontSize:"0.8rem",fontWeight:600,color:"#1a1730",cursor:"pointer",fontFamily:"inherit"}}>🔑 Change password</button>
                    <button onClick={()=>{setShowGearMenu(false);downloadMyProfile();}} disabled={downloadingPdf} style={{display:"flex",alignItems:"center",gap:"0.6rem",width:"100%",textAlign:"left",padding:"0.6rem 0.9rem",background:"none",border:"none",borderTop:"1px solid #f0eef8",fontSize:"0.8rem",fontWeight:600,color:"#1a1730",cursor:downloadingPdf?"not-allowed":"pointer",fontFamily:"inherit"}}>{downloadingPdf ? "⏳ Preparing…" : "📄 Download My Profile (PDF)"}</button>
                    <button onClick={()=>{setShowGearMenu(false);setShowSupport(true);}} style={{display:"flex",alignItems:"center",gap:"0.6rem",width:"100%",textAlign:"left",padding:"0.6rem 0.9rem",background:"none",border:"none",borderTop:"1px solid #f0eef8",fontSize:"0.8rem",fontWeight:600,color:"#1a1730",cursor:"pointer",fontFamily:"inherit"}}>🎧 Help & Support</button>
                    <button onClick={()=>{setShowGearMenu(false);setShowDeleteModal(true);}} style={{display:"flex",alignItems:"center",gap:"0.6rem",width:"100%",textAlign:"left",padding:"0.6rem 0.9rem",background:"none",border:"none",borderTop:"1px solid #f0eef8",fontSize:"0.8rem",fontWeight:600,color:"#ef4444",cursor:"pointer",fontFamily:"inherit"}}>🗑️ Delete account</button>
                  </div>
                </>
              )}
            </div>
            <button className="signout-btn" onClick={()=>setShowSignout(true)}>Sign out</button>
          </div>
        </div>

        <div className="wrap">
          <StepNav current={5} onNavigate={handleNavigate}/>

          {/* Self-attested notice */}
          <div style={{background:"#f0f9ff",border:"1.5px solid #bae6fd",borderRadius:12,padding:"0.85rem 1.1rem",marginBottom:"1.1rem",fontSize:"0.78rem",color:"#0c4a6e",lineHeight:1.6}}>
            ℹ️ <strong>Self-reported profile.</strong> Please review every section carefully before submitting — false or misleading information may result in rejection or termination.
          </div>

          {/* Last modified timestamp */}
          {d.last_saved_at && (
            <div style={{background:"#fff",border:"1px solid #e8e5f0",borderRadius:10,padding:"0.6rem 1rem",marginBottom:"1.1rem",display:"flex",alignItems:"center",gap:"0.5rem",boxShadow:"0 1px 4px rgba(30,26,62,0.07)"}}>
              <span style={{fontSize:"0.72rem",color:"#8b88b0"}}>🕐</span>
              <span style={{fontSize:"0.72rem",color:"#6b6894",fontWeight:500}}>
                Last modified: <strong style={{color:"#1a1730"}}>{new Date(d.last_saved_at).toLocaleString("en-IN",{timeZone:"Asia/Kolkata",day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</strong>
              </span>
              {d.status === "submitted" && d.submitted_at && (
                <span style={{marginLeft:"auto",fontSize:"0.72rem",color:"#16a34a",fontWeight:600,background:"#f0fdf4",padding:"0.15rem 0.55rem",borderRadius:6,border:"1px solid #bbf7d0"}}>
                  ✓ Submitted: {new Date(d.submitted_at).toLocaleString("en-IN",{timeZone:"Asia/Kolkata",day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}
                </span>
              )}
            </div>
          )}

          {missingIssues.length > 0 && (
            <div className="missing-banner">
              <h4>⚠️ {missingIssues.reduce((a,p)=>a+p.fields.length,0)} field{missingIssues.reduce((a,p)=>a+p.fields.length,0)>1?"s":""} still required across {missingIssues.length} page{missingIssues.length>1?"s":""}</h4>
              {missingIssues.map(p => (
                <div key={p.step} className="missing-item" onClick={() => router.push(p.path)}>
                  <span style={{fontSize:"0.8rem"}}>→</span>
                  <span><strong>Page {p.step} – {p.label}:</strong>{" "}{p.fields.slice(0,4).join(", ")}{p.fields.length>4?` +${p.fields.length-4} more`:""}</span>
                </div>
              ))}
              <p style={{fontSize:"0.72rem",color:"#92400e",marginTop:"0.6rem",fontWeight:500}}>Click any item above to go back and fill it in.</p>
            </div>
          )}

          {/* ── Page 1: Personal ── */}
          <div className="sc ind">
            <SectionHead icon="👤" title="Personal Details" colorClass="ind" onEdit={()=>{handleInlineEdit();router.push("/employee/personal");}}/>
            <div className="grid">
              <KV label="Full Name"      value={[d.firstName,d.middleName,d.lastName].filter(Boolean).join(" ")}/>
              <KV label="Date of Birth"  value={d.dob}/>
              <KV label="Gender"         value={d.gender}/>
              <KV label="Nationality"    value={d.nationality}/>
              <KV label="Mobile"         value={d.mobile}/>
              <KV label="Email"          value={d.email}/>
              <KV label="Aadhaar"        value={maskAadhaar(d.aadhaar||d.aadhar)}/>
              <KV label="Name as per Aadhaar" value={d.nameAsPerAadhaar}/>
              <KV label="PAN"            value={d.pan}/>
              <KV label="Name as per PAN" value={d.nameAsPerPan}/>
              <KV label="Has Passport"   value={d.hasPassport||"—"}/>
              {(d.hasPassport==="Yes"||d.passport)&&<>
                <KV label="Passport No."   value={d.passport}/>
                <KV label="Issue Date"     value={d.passportIssue}/>
                <KV label="Expiry Date"    value={d.passportExpiry}/>
              </>}
              <KV label="Blood Group"    value={d.bloodGroup}/>
              <KV label="Marital Status" value={d.maritalStatus}/>
              <KV label="Religion"       value={d.religion}/>
              <KV label="Category"       value={d.category}/>
            </div>
            {(d.fatherFirst||d.fatherName||d.maritalStatus==="Married")&&(<>
              <div className="sec-divider">Family</div>
              <div className="grid">
                <KV label="Father's Name" value={d.fatherName||[d.fatherFirst,d.fatherMiddle,d.fatherLast].filter(Boolean).join(" ")}/>
                <KV label="Father's DOB"  value={d.fatherDob}/>
                <KV label="Mother's Name" value={d.motherName||[d.motherFirst,d.motherMiddle,d.motherLast].filter(Boolean).join(" ")}/>
                <KV label="Mother's DOB"  value={d.motherDob}/>
                {d.maritalStatus==="Married"&&<>
                  <KV label="Spouse Name" value={d.spouseName}/>
                  <KV label="Spouse DOB"  value={d.spouseDob}/>
                </>}
              </div>
            </>)}
            {(d.emergName||d.emergPhone)&&(<>
              <div className="sec-divider">Emergency Contact</div>
              <div className="grid">
                <KV label="Name"         value={d.emergName}/>
                <KV label="Relationship" value={d.emergRel}/>
                <KV label="Phone"        value={d.emergPhone}/>
              </div>
            </>)}
            <div className="sec-divider">Current Address</div>
            <div className="grid">
              <KV label="Door / Street"  value={cur.door}/>
              <KV label="Village / Area" value={cur.village}/>
              <KV label="Tehsil / Taluk" value={cur.locality}/>
              <KV label="District"       value={cur.district}/>
              <KV label="State"          value={cur.state}/>
              <KV label="Pincode"        value={cur.pin}/>
            </div>
            {(perm.door||perm.state)&&(<>
              <div className="sec-divider">Permanent / Native Address</div>
              <div className="grid">
                <KV label="Door / Street"  value={perm.door}/>
                <KV label="Village / Area" value={perm.village}/>
                <KV label="District"       value={perm.district}/>
                <KV label="State"          value={perm.state}/>
                <KV label="Pincode"        value={perm.pin}/>
              </div>
            </>)}
            <div className="sec-divider">Documents</div>
            <div className="att-grid">
              <AttChip label="Profile Photo"   docKey={d.photoKey}    urls={docUrls}/>
              <AttChip label="Aadhaar Card"    docKey={d.aadhaarKey}  urls={docUrls}/>
              <AttChip label="PAN Card"        docKey={d.panKey}      urls={docUrls}/>
              {d.hasPassport==="Yes"&&d.passportKey&&<AttChip label="Passport" docKey={d.passportKey} urls={docUrls}/>}
              {d.hasPassport==="Yes"&&!d.passportKey&&<span className="att-chip missing">⚠ Passport upload missing</span>}
            </div>
          </div>

          {/* ── Bank Details ── */}
          <div className="sc teal">
            <SectionHead icon="🏦" title="Bank Account Details" colorClass="teal" onEdit={()=>{handleInlineEdit();router.push("/employee/personal");}}/>
            <div className="grid">
              <KV label="Bank Name"            value={d.bankName==="Other"&&d.bankOther?`Other — ${d.bankOther}`:d.bankName}/>
              <KV label="Account Holder Name"  value={d.bankAccountName}/>
              <KV label="IFSC Code"            value={d.ifsc}/>
              <KV label="Branch"               value={d.branch}/>
              <KV label="Account Type"         value={d.accountType}/>
              <KV label="Account Number"       value={maskAccount(d.accountLast4, d.accountFull)}/>
            </div>
          </div>

          {/* ── Page 2: Education ── */}
          <div className="sc amb">
            <SectionHead icon="🎓" title="Education" colorClass="amb" onEdit={()=>{handleInlineEdit();router.push("/employee/education");}}/>
            {[
              { title:"Class X",        data:edu.classX,        subKey:"classX"       },
              ...((edu.afterTenth==="Intermediate"||edu.afterTenth==="Both"||edu.intermediate?.college) ? [{ title:"Intermediate",   data:edu.intermediate,  subKey:"intermediate" }] : []),
              ...((edu.afterTenth==="Diploma"||edu.afterTenth==="Both") ? [{ title:"Diploma (after 10th)", data:edu.diploma, subKey:"diploma" }] : []),
              { title:"Under Graduate", data:edu.undergraduate, subKey:"ug_provisional" },
            ].map(sec => {
              const s = sec.data || {};
              return (
                <div key={sec.title} style={{marginBottom:"0.9rem",paddingBottom:"0.9rem",borderBottom:"1px solid #f0eef8"}}>
                  <div style={{fontSize:"0.72rem",fontWeight:700,color:"#d97706",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.5rem"}}>{sec.title}</div>
                  <div className="grid">
                    <KV label="Institution"     value={s.school||s.college}/>
                    <KV label="Board / Univ."   value={s.board||s.university}/>
                    {s.course && <KV label="Degree / Course" value={s.course}/>}
                    <KV label="Year of Passing" value={s.yearOfPassing}/>
                    <KV label={s.resultType||"Result"} value={s.resultValue}/>
                    {s.backlogs && <KV label="Backlogs" value={s.backlogs}/>}
                  </div>
                  {(s.certKey||s.provKey) && (
                    <div className="att-grid">
                      {s.certKey  && <AttChip label={`${sec.title} Certificate`} docKey={s.certKey}  urls={docUrls}/>}
                      {s.provKey  && <AttChip label="Provisional Marksheet"      docKey={s.provKey}  urls={docUrls}/>}
                      {s.convoKey && <AttChip label="Convocation Certificate"    docKey={s.convoKey} urls={docUrls}/>}
                    </div>
                  )}
                </div>
              );
            })}
            {edu.postgraduate?.college && (
              <div style={{marginBottom:"0.9rem",paddingBottom:"0.9rem",borderBottom:"1px solid #f0eef8"}}>
                <div style={{fontSize:"0.72rem",fontWeight:700,color:"#d97706",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.5rem"}}>Post Graduate</div>
                <div className="grid">
                  <KV label="College"    value={edu.postgraduate?.college}/>
                  <KV label="University" value={edu.postgraduate?.university}/>
                  <KV label="Degree"     value={edu.postgraduate?.course}/>
                  <KV label="Year"       value={edu.postgraduate?.yearOfPassing}/>
                  <KV label="Result"     value={edu.postgraduate?.resultValue}/>
                </div>
                {(edu.postgraduate?.provKey||edu.postgraduate?.convoKey) && (
                  <div className="att-grid">
                    {edu.postgraduate.provKey  && <AttChip label="PG Provisional" docKey={edu.postgraduate.provKey}  urls={docUrls}/>}
                    {edu.postgraduate.convoKey && <AttChip label="PG Convocation"  docKey={edu.postgraduate.convoKey} urls={docUrls}/>}
                  </div>
                )}
              </div>
            )}
            {edu.diploma?.institute && (
              <div style={{marginBottom:"0.9rem",paddingBottom:"0.9rem",borderBottom:"1px solid #f0eef8"}}>
                <div style={{fontSize:"0.72rem",fontWeight:700,color:"#d97706",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.5rem"}}>Diploma / Technical</div>
                <div className="grid">
                  <KV label="Institution" value={edu.diploma?.institute}/>
                  <KV label="Course"      value={edu.diploma?.course}/>
                  <KV label="Year"        value={edu.diploma?.yearOfPassing}/>
                </div>
                {edu.diploma?.certKey && <div className="att-grid"><AttChip label="Diploma Certificate" docKey={edu.diploma.certKey} urls={docUrls}/></div>}
              </div>
            )}
            {Array.isArray(edu.professionalQualifications) && edu.professionalQualifications.length > 0 && (
              <div style={{marginBottom:"0.9rem",paddingBottom:"0.9rem",borderBottom:"1px solid #f0eef8"}}>
                <div style={{fontSize:"0.72rem",fontWeight:700,color:"#7c3aed",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.5rem"}}>Professional Qualifications</div>
                {edu.professionalQualifications.map((q,i)=>(
                  <div key={i} style={{background:"#f5f3ff",border:"1px solid #ddd6fe",borderRadius:8,padding:"0.6rem 0.85rem",marginBottom:"0.4rem"}}>
                    <div className="grid" style={{gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))"}}>
                      <KV label="Type"  value={q.type==="Other"?(q.otherType||"Other"):q.type}/>
                      <KV label="Level" value={q.level}/>
                      <KV label="Year"  value={q.year || (q.level==="Pursuing"?"Pursuing":"")}/>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {Array.isArray(edu.certifications) && edu.certifications.length > 0 && (
              <div>
                <div style={{fontSize:"0.72rem",fontWeight:700,color:"#d97706",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.5rem"}}>Certifications</div>
                <div className="att-grid">
                  {edu.certifications.map((c,i) => <AttChip key={i} label={c.name||`Cert ${i+1}`} docKey={c.certKey} urls={docUrls}/>)}
                </div>
              </div>
            )}
            {Array.isArray(edu.articleships) && edu.articleships.length > 0 && (
              <div style={{marginTop:"0.9rem",paddingTop:"0.9rem",borderTop:"1px solid #f0eef8"}}>
                <div style={{fontSize:"0.72rem",fontWeight:700,color:"#ea580c",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.5rem"}}>Articleship / Practical Training</div>
                {edu.articleships.map((a,i)=>(
                  <div key={i} style={{background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:8,padding:"0.65rem 0.85rem",marginBottom:"0.5rem"}}>
                    <div style={{fontSize:"0.78rem",fontWeight:700,color:"#ea580c",marginBottom:"0.3rem"}}>{a.type||`Training ${i+1}`} — {a.firm}</div>
                    <div className="grid" style={{gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))"}}>
                      {a.city&&<KV label="City" value={a.city}/>}
                      {a.from&&<KV label="From" value={a.from}/>}
                      {a.to&&<KV label="To" value={a.to}/>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {edu.hasEduGap && (
              <div style={{marginTop:"0.9rem",paddingTop:"0.9rem",borderTop:"1px solid #f0eef8"}}>
                <div style={{fontSize:"0.72rem",fontWeight:700,color:"#0d6e6e",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.4rem"}}>Education Gap Before First Job</div>
                <div className="grid">
                  <KV label="Had Education Gap" value={edu.hasEduGap}/>
                  {edu.eduGapFrom&&<KV label="From" value={edu.eduGapFrom}/>}
                  {edu.eduGapTo&&<KV label="To" value={edu.eduGapTo}/>}
                  {edu.eduGapReason&&<KV label="Reason" value={edu.eduGapReason}/>}
                </div>
              </div>
            )}
          </div>

          {/* ── Page 3: Employment ── */}
          <div className="sc vio">
            <SectionHead icon="💼" title="Employment History" colorClass="vio" onEdit={()=>{handleInlineEdit();router.push("/employee/previous");}}/>
            {d.resumeKey && <div style={{marginBottom:"0.85rem"}}><div className="att-grid"><AttChip label="Latest Resume / CV" docKey={d.resumeKey} urls={docUrls}/></div></div>}
            {empHistory.length === 0 ? (
              <p style={{color:"#d8d4e3",fontSize:"0.875rem",fontStyle:"italic"}}>No employment history added.</p>
            ) : empHistory.map((e, idx) => {
              const isCurrent = idx === empHistory.length - 1;
              return (
              <div key={e.company_id||idx} style={{marginBottom:"0.9rem",paddingBottom:"0.9rem",borderBottom:"1px solid #f0eef8"}}>
                <div style={{fontSize:"0.72rem",fontWeight:700,color:"#7c3aed",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.5rem"}}>
                  {isCurrent?"Current / Most Recent Employer":`Previous Employer ${idx+1}`}
                </div>
                <div className="grid">
                  <KV label="Company"         value={e.companyName}/>
                  <KV label="Designation"     value={e.designation}/>
                  <KV label="Department"      value={e.department}/>
                  <KV label="Employment Type" value={e.employmentType}/>
                  <KV label="Date of Joining" value={e.startDate}/>
                  {isCurrent
                    ?<KV label="Currently Working" value={e.currentlyWorking==="Yes"?"Yes — Still Employed":e.currentlyWorking==="No"?"No":e.currentlyWorking}/>
                    :<KV label="Date of Leaving"   value={e.endDate}/>}
                  {isCurrent&&e.currentlyWorking==="No"&&<KV label="Date of Leaving" value={e.endDate}/>}
                  <KV label="Work Email"      value={e.workEmail}/>
                  {e.employmentType==="Contract"&&<KV label="Vendor" value={e.contractVendor?.company}/>}
                </div>
                {e.reference?.name && (
                  <div style={{marginTop:"0.5rem"}}>
                    <div style={{fontSize:"0.68rem",fontWeight:700,color:"#8b88b0",textTransform:"uppercase",letterSpacing:0.4,marginBottom:"0.3rem"}}>Reference</div>
                    <div className="grid">
                      <KV label="Name"  value={e.reference.name}/>
                      <KV label="Role"  value={e.reference.role}/>
                      <KV label="Email" value={e.reference.email}/>
                    </div>
                  </div>
                )}
                {(e.documents?.payslipsKey||e.documents?.offerLetterKey||e.documents?.resignationKey||e.documents?.experienceKey||e.documents?.idCardKey) && (
                  <div className="att-grid" style={{marginTop:"0.6rem"}}>
                    {e.documents.payslipsKey    && <AttChip label="Payslips"          docKey={e.documents.payslipsKey}    urls={docUrls}/>}
                    {e.documents.offerLetterKey && <AttChip label="Offer Letter"      docKey={e.documents.offerLetterKey} urls={docUrls}/>}
                    {e.documents.resignationKey && <AttChip label="Resignation"       docKey={e.documents.resignationKey} urls={docUrls}/>}
                    {e.documents.experienceKey  && <AttChip label="Experience Letter" docKey={e.documents.experienceKey}  urls={docUrls}/>}
                    {e.documents.idCardKey      && <AttChip label="Company ID Card"   docKey={e.documents.idCardKey}      urls={docUrls}/>}
                  </div>
                )}
                {e.gap?.hasGap==="Yes"&&e.gap?.reason&&(
                  <div style={{marginTop:"0.5rem",padding:"0.5rem 0.75rem",background:"#fffbeb",borderRadius:8,border:"1px solid #fde68a",fontSize:"0.78rem",color:"#92400e",fontWeight:500}}>
                    ⏱ Gap{(e.gap.from||e.gap.to)?` (${e.gap.from} – ${e.gap.to})`:""}: {e.gap.reason}
                  </div>
                )}
              </div>
              );
            })}
          </div>

          {/* ── Page 4: UAN ── */}
          <div className="sc cyn">
            <SectionHead icon="🏦" title="UAN / EPFO" colorClass="cyn" onEdit={()=>{handleInlineEdit();router.push("/employee/uan");}}/>
            <div className="grid">
              <KV label="Has UAN"         value={d.hasUan==="yes"||d.hasUan===true?"Yes":"No"}/>
              {(d.hasUan==="yes"||d.hasUan===true)&&<>
                <KV label="UAN Number"      value={d.uanNumber}/>
                <KV label="Name as per UAN" value={d.nameAsPerUan}/>
                <KV label="Mobile Linked"   value={d.mobileLinked}/>
                <KV label="UAN Active"      value={d.isActive}/>
              </>}
            </div>
            {Array.isArray(d.pfRecords) && d.pfRecords.length > 0 && (
              <div style={{marginTop:"0.85rem"}}>
                <div className="sec-divider">PF Details per Employer</div>
                {d.pfRecords.map((pf, i) => (
                  <div key={i} style={{background:"#f8f7ff",border:"1px solid #e4e2f0",borderRadius:10,padding:"0.75rem 0.9rem",marginBottom:"0.6rem"}}>
                    <div style={{fontSize:"0.68rem",fontWeight:800,color:"#7c3aed",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.4rem"}}>{pf.companyName||`Employer ${i+1}`}</div>
                    {pf.hasPf==="No"
                      ? <p style={{fontSize:"0.78rem",color:"#0369a1",fontWeight:500}}>ℹ️ PF not maintained by this employer</p>
                      : <div className="grid">
                          <KV label="PF Member ID"     value={pf.pfMemberId}/>
                          <KV label="Date of Joining"  value={pf.dojEpfo}/>
                          <KV label="Date of Exit"     value={pf.doeEpfo}/>
                          <KV label="PF Transferred"   value={pf.pfTransferred}/>
                        </div>
                    }
                  </div>
                ))}
              </div>
            )}
            <div className="att-grid" style={{marginTop:"0.65rem",display:"flex",gap:"0.6rem",flexWrap:"wrap"}}>
              {d.epfoKey && <AttChip label="UAN Card" docKey={d.epfoKey} urls={docUrls}/>}
              {d.serviceHistoryKey && <AttChip label="Service History Snapshot" docKey={d.serviceHistoryKey} urls={docUrls}/>}
            </div>
            {d.familyDetails && (d.familyDetails.spouseName || d.familyDetails.hasChildren==="Yes" || (d.familyDetails.parentsCoverage && d.familyDetails.parentsCoverage!=="Not Applicable")) && (
              <div style={{marginTop:"0.85rem"}}>
                <div className="sec-divider">Family Details — Health Insurance</div>
                <div style={{background:"#f5f3ff",border:"1px solid #ddd6fe",borderRadius:10,padding:"0.75rem 0.9rem"}}>
                  {(d.familyDetails.spouseName||d.familyDetails.spouseDob) && (
                    <div className="grid" style={{marginBottom:"0.4rem"}}>
                      <KV label="Spouse Name" value={d.familyDetails.spouseName}/>
                      <KV label="Spouse DOB"  value={d.familyDetails.spouseDob}/>
                    </div>
                  )}
                  {d.familyDetails.hasChildren==="Yes" && Array.isArray(d.familyDetails.children) && d.familyDetails.children.filter(c=>c.name||c.dob).length>0 && (
                    <div style={{marginBottom:"0.4rem"}}>
                      {d.familyDetails.children.map((c,i)=>(c.name||c.dob) && (
                        <div key={i} className="grid" style={{marginBottom:"0.3rem"}}>
                          <KV label={`Child ${i+1} Name`}   value={c.name}/>
                          <KV label={`Child ${i+1} DOB`}    value={c.dob}/>
                          <KV label={`Child ${i+1} Gender`} value={c.gender}/>
                        </div>
                      ))}
                    </div>
                  )}
                  {d.familyDetails.parentsCoverage && d.familyDetails.parentsCoverage!=="Not Applicable" && (
                    <div className="grid">
                      <KV label="Parents Covered" value={d.familyDetails.parentsCoverage}/>
                      <KV label={d.familyDetails.parentsCoverage==="My Parents"?"Father":"Father-in-law"} value={d.familyDetails.excludeFather?"Excluded — passed away":d.familyDetails.fatherName}/>
                      <KV label={d.familyDetails.parentsCoverage==="My Parents"?"Mother":"Mother-in-law"} value={d.familyDetails.excludeMother?"Excluded — passed away":d.familyDetails.motherName}/>
                    </div>
                  )}
                </div>
              </div>
            )}
            {Array.isArray(d.epfoNominees) && d.epfoNominees.length > 0 && (
              <div style={{marginTop:"0.85rem"}}>
                <div className="sec-divider">Nominee Details (Form 2)</div>
                {d.epfoNominees.map((nom, i) => (
                  <div key={i} style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"0.75rem 0.9rem",marginBottom:"0.6rem"}}>
                    <div style={{fontSize:"0.68rem",fontWeight:800,color:"#16a34a",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.4rem"}}>Nominee {i+1}</div>
                    <div className="grid">
                      <KV label="Full Name"     value={nom.name}/>
                      <KV label="Date of Birth" value={nom.dob}/>
                      <KV label="Relationship"  value={nom.relation==="Other"&&nom.otherRelation?nom.otherRelation:nom.relation}/>
                      <KV label="Address"       value={nom.address}/>
                      <KV label="Share (%)"     value={nom.share?`${nom.share}%`:undefined}/>
                      {nom.guardianName && <KV label="Guardian Name" value={nom.guardianName}/>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {d.epfoDeclarations && (
              <div style={{marginTop:"0.85rem"}}>
                <div className="sec-divider">EPFO Declarations</div>
                <div className="grid">
                  <KV label="PF Nomination (Form 2 — Part A)"      value={d.epfoDeclarations.pfNomAck?"✓ Confirmed":"Not confirmed"}/>
                  <KV label="Pension Nomination (Form 2 — Part B)" value={d.epfoDeclarations.pensionNomAck?"✓ Confirmed":"Not confirmed"}/>
                  <KV label="General EPFO Declaration"             value={d.epfoDeclarations.epfoDecl?"✓ Confirmed":"Not confirmed"}/>
                </div>
              </div>
            )}
            {(d.epfoSignature?.s3Key || d.epfoSignature?.dataUrl) && (
              <div style={{marginTop:"0.85rem"}}>
                <div className="sec-divider">Digital Signature</div>
                <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"0.75rem 0.9rem"}}>
                  {(()=>{
                    const sigUrl = d.epfoSignature?.s3Key ? (docUrls[d.epfoSignature.s3Key] || null) : d.epfoSignature?.dataUrl;
                    return sigUrl
                      ? <img src={sigUrl} alt="Digital Signature" style={{maxWidth:280,height:60,border:"1px solid #e4e2f0",borderRadius:6,background:"#fff",display:"block"}}/>
                      : <span style={{fontSize:"0.72rem",color:"#8b88b0"}}>⏳ Loading signature…</span>;
                  })()}
                  {d.epfoSignature?.timestamp && (
                    <p style={{fontSize:"0.68rem",color:"#16a34a",fontWeight:600,marginTop:"0.4rem"}}>
                      ✓ Signed — {new Date(d.epfoSignature.timestamp).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Final Acknowledgements ── */}
          {/* Reader mode: shown but greyed/informational; Editor mode: required */}
          <div className="sc grn" id="ack-section">
            <div className="sh">
              <div className="si grn">✅</div>
              <span className="st">Final Acknowledgements</span>
              {!profileEdited && (
                <span style={{marginLeft:"auto",fontSize:"0.72rem",color:"#16a34a",fontWeight:600,background:"#f0fdf4",padding:"0.2rem 0.6rem",borderRadius:6,border:"1px solid #bbf7d0"}}>
                  View mode — no changes detected
                </span>
              )}
              {profileEdited && allAcked && (
                <span style={{marginLeft:"auto",fontSize:"0.72rem",fontWeight:700,color:"#16a34a"}}>All confirmed ✓</span>
              )}
            </div>

            {/* Reader mode banner */}
            {!profileEdited && (
              <div style={{background:"#f0fdf4",border:"1.5px solid #bbf7d0",borderRadius:10,padding:"0.75rem 1rem",marginBottom:"1rem",display:"flex",alignItems:"flex-start",gap:"0.6rem"}}>
                <span style={{fontSize:"1rem",flexShrink:0}}>ℹ️</span>
                <div>
                  <div style={{fontSize:"0.78rem",fontWeight:700,color:"#15803d",marginBottom:"0.2rem"}}>Viewing your submitted profile</div>
                  <div style={{fontSize:"0.72rem",color:"#166534",fontWeight:500,lineHeight:1.5}}>
                    You haven't made any changes. Acknowledgements are only required when you edit and re-submit. If you make changes on any page and return here, you'll be asked to re-confirm.
                  </div>
                </div>
              </div>
            )}

            {/* Editor mode banner */}
            {profileEdited && (
              <div style={{background:"#fff8f0",border:"1.5px solid #fbbf24",borderRadius:10,padding:"0.75rem 1rem",marginBottom:"1rem",display:"flex",alignItems:"flex-start",gap:"0.6rem"}}>
                <span style={{fontSize:"1rem",flexShrink:0}}>⚠️</span>
                <div>
                  <div style={{fontSize:"0.78rem",fontWeight:700,color:"#92400e",marginBottom:"0.2rem"}}>Profile changes detected — please re-confirm</div>
                  <div style={{fontSize:"0.72rem",color:"#92400e",fontWeight:500,lineHeight:1.5}}>
                    Changes were made to your profile. Please read and re-confirm each statement below before submitting. These are different from the declarations made on earlier pages.
                  </div>
                </div>
              </div>
            )}

            <p style={{fontSize:"0.78rem",color:"#6b6894",marginBottom:"1rem",lineHeight:1.55}}>
              {profileEdited
                ? "These acknowledgements confirm your final submission. Please read each carefully."
                : "These are the acknowledgements you confirmed on your last submission."}
            </p>

            {ACK_STATEMENTS.map((stmt, i) => (
              <div
                key={i}
                className="ack-box"
                onClick={() => profileEdited && toggleAck(i)}
                style={{cursor: profileEdited ? "pointer" : "default", opacity: profileEdited ? 1 : 0.65}}
              >
                <div className={`ack-check${acks[i]?" checked":""}`} style={{cursor: profileEdited ? "pointer" : "default"}}>
                  {acks[i] && <span style={{color:"#fff",fontWeight:800,fontSize:"0.75rem"}}>✓</span>}
                </div>
                <span className="ack-text">{stmt}</span>
              </div>
            ))}

            {profileEdited && !allAcked && (
              <p style={{fontSize:"0.75rem",color:"#d97706",marginTop:"0.75rem",fontWeight:600}}>
                ⚠️ Please confirm all {ACK_STATEMENTS.length} statements to enable submission.
              </p>
            )}
          </div>

          {/* Submit bar */}
          <div className="sbar">
            <div style={{display:"flex",flexDirection:"column",gap:"0.2rem"}}>
              {saveStatus && (
                <span className={`ss${saveStatus.includes("✓")?" ok":saveStatus.includes("⚠️")||saveStatus.startsWith("Error")?" err":""}`}>
                  {saveStatus}
                </span>
              )}
              {missingIssues.length===0 && (!profileEdited || allAcked) && (
                <span className="ss ok" style={{fontSize:"0.75rem"}}>✓ Ready to submit</span>
              )}
            </div>
            <div style={{display:"flex",gap:"0.75rem"}}>
              <button className="sbtn" onClick={()=>router.push("/employee/uan")}>← Back</button>
              <button className="pbtn" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting…" : "Submit Profile →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
