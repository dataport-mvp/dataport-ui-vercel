// pages/employee/education.js  — Page 2 of 5
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";
import FileUpload from "../../components/FileUpload";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;
const ACCENTS = { 1:"#0d6e6e", 2:"#d97706", 3:"#7c3aed", 4:"#0891b2", 5:"#16a34a" };
const STEP_DONE_BG = "#0a4a4a"; const STEP_DONE_CK = "#5eead4"; const STEP_CONN = "#0d6e6e";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function isoToDisplay(iso) {
  if (!iso || !iso.includes("-")) return iso || "";
  const [y, mo, d] = iso.split("-");
  const idx = parseInt(mo, 10) - 1;
  const mName = MONTH_NAMES[idx] || mo;
  return `${parseInt(d,10)} ${mName} ${y}`;
}

const G = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{background:#f0ece6;font-family:'DM Sans',sans-serif;}
  .pg{min-height:100vh;background:#f0ece6;padding-bottom:3rem;}
  .wrap{max-width:860px;margin:auto;padding:0 1.25rem;}
  .topbar{background:#111;border-bottom:1px solid #2a2535;padding:0.85rem 1.75rem;display:flex;justify-content:space-between;align-items:center;margin-bottom:1.75rem;position:sticky;top:0;z-index:50;box-shadow:0 4px 20px rgba(15,12,40,0.4);}
  .logo-text{font-size:1.3rem;font-weight:800;color:#0d6e6e;letter-spacing:-0.5px;}
  .topbar-right{display:flex;align-items:center;gap:0.75rem;}
  .user-name{font-size:0.84rem;color:#8b92a8;font-weight:500;}
  .signout-btn{padding:0.38rem 1rem;border:1.5px solid #2a2535;border-radius:8px;background:transparent;color:#8b92a8;font-size:0.82rem;cursor:pointer;font-weight:600;font-family:inherit;transition:all 0.2s;}
  .signout-btn:hover{border-color:#ef4444;color:#ef4444;}
  .bell-btn{position:relative;width:36px;height:36px;border-radius:9px;border:1.5px solid #2a2535;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1rem;transition:all 0.2s;}
  .bell-btn:hover{border-color:#0d6e6e;background:rgba(167,139,250,0.1);}
  .bell-badge{position:absolute;top:-5px;right:-5px;background:#ef4444;color:#fff;border-radius:999px;font-size:0.6rem;font-weight:800;min-width:16px;height:16px;display:flex;align-items:center;justify-content:center;padding:0 3px;border:2px solid #18151f;}
  .sc{background:#fff;border:1px solid #c8c2b8;border-radius:16px;padding:1.5rem 1.6rem;margin-bottom:1.1rem;box-shadow:0 4px 20px rgba(17,13,10,.12),0 1px 4px rgba(17,13,10,.06);border:1px solid rgba(255,255,255,0.85);position:relative;overflow:hidden;}
  .sc::before{content:'';position:absolute;top:0;left:0;bottom:0;width:4px;border-radius:16px 0 0 16px;}
  .sc.ind::before{background:#0d6e6e;box-shadow:0 4px 14px rgba(13,110,110,.35);}.sc.cyn::before{background:#0891b2;}.sc.amb::before{background:#d97706;}.sc.ros::before{background:#e11d48;}.sc.vio::before{background:#7c3aed;}.sc.grn::before{background:#16a34a;}.sc.slt::before{background:#475569;}.sc.ora::before{background:#ea580c;}
  .sh{display:flex;align-items:center;gap:0.6rem;margin-bottom:1.15rem;}
  .si{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:0.95rem;flex-shrink:0;}
  .si.ind{background:#eef2ff;}.si.cyn{background:#ecfeff;}.si.amb{background:#fffbeb;}.si.ros{background:#fff1f2;}.si.vio{background:#f5f3ff;}.si.grn{background:#f0fdf4;}.si.slt{background:#f1f5f9;}.si.ora{background:#fff7ed;}
  .st{font-size:0.93rem;font-weight:700;color:#1a1730;}
  .fr{display:flex;gap:0.9rem;flex-wrap:wrap;margin-bottom:0.85rem;}.fr:last-child{margin-bottom:0;}
  .fi{display:flex;flex-direction:column;gap:0.28rem;flex:1;min-width:138px;}
  .fl{font-size:0.7rem;font-weight:700;color:#8b88b0;letter-spacing:0.55px;text-transform:uppercase;}
  .in{padding:0.65rem 0.875rem;background:#f0ece6;border:1.5px solid #d8d4e3;border-radius:9px;font-family:inherit;font-size:0.875rem;color:#1a1730;outline:none;width:100%;transition:all 0.18s;}
  .in:focus{border-color:#0d6e6e;background:#fff;box-shadow:0 0 0 3px rgba(13,110,110,0.13);}
  .in.err{border-color:#ef4444!important;background:#fff8f8!important;box-shadow:0 0 0 3px rgba(239,68,68,0.10)!important;}
  .err-msg{font-size:0.68rem;color:#ef4444;font-weight:600;margin-top:0.2rem;display:block;}
  .date-wrap{position:relative;}
  .date-input{padding:0.65rem 0.875rem;background:#f0ece6;border:1.5px solid #d8d4e3;border-radius:9px;font-family:inherit;font-size:0.875rem;color:#1a1730;outline:none;width:100%;transition:all 0.18s;}
  .date-input:focus{border-color:#0d6e6e;background:#fff;box-shadow:0 0 0 3px rgba(13,110,110,0.13);}
  .date-input::placeholder{color:#d8d4e3;}
  .date-input.err{border-color:#ef4444!important;background:#fff8f8!important;}
  .date-display{margin-top:0.22rem;font-size:0.72rem;color:#0d6e6e;font-weight:600;letter-spacing:0.2px;}
  .sbar{display:flex;justify-content:space-between;align-items:center;margin-top:1.5rem;padding:1rem 1.5rem;background:#111;border-radius:14px;box-shadow:0 4px 20px rgba(15,12,40,0.28);}
  .ss{font-size:0.84rem;color:#8b92a8;font-weight:500;}.ss.ok{color:#4ade80;}.ss.err{color:#f87171;}
  .pbtn{padding:0.72rem 1.9rem;background:#0d6e6e;box-shadow:0 4px 14px rgba(13,110,110,.35);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:0.875rem;font-weight:700;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 14px rgba(13,110,110,0.4);}
  .pbtn:hover{background:#0f8a8a;transform:translateY(-1px);}
  .sbtn{padding:0.72rem 1.5rem;background:transparent;color:#8b92a8;border:1.5px solid #2a2535;border-radius:10px;font-family:inherit;font-size:0.875rem;font-weight:600;cursor:pointer;transition:all 0.2s;}
  .sbtn:hover{border-color:#0d6e6e;color:#0d6e6e;}
  .cert-box{background:#f0effe;border:1.5px solid #dddaf0;border-radius:10px;padding:1rem;margin-bottom:0.6rem;}
  .add-btn{padding:0.42rem 1.1rem;background:#eef2ff;color:#0d6e6e;border:1.5px solid #c7d2fe;border-radius:8px;font-family:inherit;font-size:0.8rem;font-weight:700;cursor:pointer;margin-top:0.65rem;}
  .rm-btn{padding:0.28rem 0.7rem;background:#fff5f5;color:#ef4444;border:1.5px solid #fecaca;border-radius:6px;font-size:0.75rem;font-weight:600;cursor:pointer;font-family:inherit;}
  .att-split{display:flex;gap:0.9rem;flex-wrap:wrap;margin-top:0.85rem;}
  .att-box{flex:1;min-width:200px;background:#f0effe;border:1.5px solid #dddaf0;border-radius:10px;padding:0.9rem 1rem;}
  .att-box-lbl{font-size:0.7rem;font-weight:700;color:#8b88b0;letter-spacing:0.55px;text-transform:uppercase;display:block;margin-bottom:0.5rem;}
  @media(max-width:640px){.fr{flex-direction:column;}.fi{min-width:100%;}.topbar{flex-direction:column;gap:0.6rem;position:relative;}.att-split{flex-direction:column;}}
`;

function ConsentBell({ apiFetch, router }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const load = async () => {
      try { const res = await apiFetch(`${API}/consent/my`); if (res.ok) { const data = await res.json(); setCount(data.filter(c => String(c.status||"pending").toLowerCase()==="pending").length); } } catch (_) {}
    };
    load(); const id = setInterval(load, 15000); return () => clearInterval(id);
  }, [apiFetch]);
  return (<button className="bell-btn" onClick={() => router.push("/employee/personal?tab=consents")} title="Consent Requests">🔔{count > 0 && <span className="bell-badge">{count}</span>}</button>);
}

function SignoutModal({ onConfirm, onCancel }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,12,40,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(4px)"}}>
      <div style={{background:"#fff",borderRadius:18,padding:"2rem",maxWidth:340,width:"90%",textAlign:"center",boxShadow:"0 24px 60px rgba(15,12,40,0.3)"}}>
        <div style={{fontSize:34,marginBottom:"0.75rem"}}>👋</div>
        <h3 style={{margin:"0 0 0.4rem",color:"#1a1730",fontWeight:800,fontSize:"1.05rem"}}>Sign out?</h3>
        <p style={{color:"#6b6894",fontSize:"0.875rem",marginBottom:"1.5rem",lineHeight:1.55}}>Your progress is saved. You can continue anytime.</p>
        <div style={{display:"flex",gap:"0.75rem"}}>
          <button onClick={onCancel} style={{flex:1,padding:"0.7rem",borderRadius:9,border:"1.5px solid #dddaf0",background:"#f7f6fd",cursor:"pointer",fontWeight:600,color:"#6b6894",fontFamily:"inherit"}}>Stay</button>
          <button onClick={onConfirm} style={{flex:1,padding:"0.7rem",borderRadius:9,border:"none",background:"#ef4444",color:"#fff",cursor:"pointer",fontWeight:700,fontFamily:"inherit"}}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

function StepNav({ current, onNavigate }) {
  const steps = [
    { n:1, label:"Personal", icon:"👤", path:"/employee/personal" },
    { n:2, label:"Education", icon:"🎓", path:"/employee/education" },
    { n:3, label:"Employment", icon:"💼", path:"/employee/previous" },
    { n:4, label:"UAN", icon:"🏦", path:"/employee/uan" },
    { n:5, label:"Review", icon:"📋", path:"/employee/review" },
  ];
  return (
    <div style={{background:"#fff",borderRadius:14,padding:"1.1rem 0.5rem",marginBottom:"1.6rem",display:"flex",alignItems:"center",justifyContent:"center",overflowX:"auto",boxShadow:"0 6px 28px rgba(30,26,62,0.22),0 2px 8px rgba(30,26,62,0.12)"}}>
      {steps.map((s,i)=>{
        const isDone=current>s.n,isActive=current===s.n,col=ACCENTS[s.n];
        return(
          <div key={s.n} style={{display:"flex",alignItems:"center"}}>
            <button onClick={()=>onNavigate(s.path)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.3rem",background:"none",border:"none",cursor:"pointer",padding:"0.2rem 0.75rem"}}>
              <div style={{width:40,height:40,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",transition:"all 0.25s",background:isActive?col:isDone?STEP_DONE_BG:"#f2f1f9",border:isActive?`2px solid ${col}`:isDone?`2px solid ${STEP_CONN}`:"2px solid #e4e2ed",boxShadow:isActive?`0 4px 12px ${col}55`:"none"}}>
                {isDone?<span style={{color:STEP_DONE_CK,fontWeight:800,fontSize:"0.9rem"}}>✓</span>:<span style={{fontSize:"1rem",filter:isActive?"brightness(0) invert(1)":"none"}}>{s.icon}</span>}
              </div>
              <span style={{fontSize:"0.67rem",fontWeight:700,letterSpacing:"0.6px",textTransform:"uppercase",whiteSpace:"nowrap",color:isActive?col:isDone?STEP_DONE_CK:"#8b88b0"}}>{s.label}</span>
            </button>
            {i<steps.length-1&&<div style={{width:38,height:2,background:current>s.n?STEP_CONN:"#c5d6ea",margin:"0 -0.25rem",marginBottom:"1.4rem",borderRadius:2,flexShrink:0}}/>}
          </div>
        );
      })}
    </div>
  );
}

function YesNo({ label, value, onChange }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:"1rem",marginBottom:"1rem",flexWrap:"wrap"}}>
      <span style={{fontSize:"0.875rem",color:"#1a1730",fontWeight:600}}>{label}</span>
      {["Yes","No"].map(v=>(
        <button key={v} onClick={()=>onChange(v)} style={{padding:"0.32rem 1.1rem",borderRadius:999,border:value===v?"2px solid #0d6e6e":"1.5px solid #dddaf0",background:value===v?"#0d6e6e":"#f2f1f9",color:value===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.82rem",fontWeight:700,transition:"all 0.18s"}}>{v}</button>
      ))}
    </div>
  );
}

// ── DateField: text input DD/MM/YYYY, no calendar, shows month name ──
function DateField({ l, v, s, r=true, errKey, errors, onFix }) {
  const hasErr = errKey && errors && errors[errKey];
  const [raw,setRaw] = useState(()=>{ if(v&&v.includes("-")){const[y,mo,dd]=v.split("-");return `${dd}/${mo}/${y}`;}return v||"";});
  const [focused,setFocused] = useState(false);

  useEffect(()=>{
    if(!focused){
      if(v&&v.includes("-")){const[y,mo,dd]=v.split("-");setRaw(`${dd}/${mo}/${y}`);}
      else setRaw(v||"");
    }
  },[v,focused]);

  const handleChange=(e)=>{
    let val=e.target.value.replace(/[^0-9/]/g,"");
    if(val.length===2&&raw.length===1)val=val+"/";
    if(val.length===5&&raw.length===4)val=val+"/";
    if(val.length>10)return;
    setRaw(val);
    if(val.length===10){
      const[dd,mo,y]=val.split("/");
      if(dd&&mo&&y&&y.length===4){
        s(`${y}-${mo}-${dd}`);
        if(onFix&&hasErr)onFix(errKey);
      }
    } else { s(""); }
  };

  const getDisplayValue = () => {
    if (focused) return raw;
    if (v && v.includes("-")) {
      const [y, mo, d] = v.split("-");
      const idx = parseInt(mo, 10) - 1;
      const mName = MONTH_NAMES[idx];
      if (mName) return `${parseInt(d, 10)} ${mName} ${y}`;
    }
    return raw;
  };

  return(
    <div className="fi">
      <span className="fl">{l}{r&&<span style={{color:"#ef4444",marginLeft:2}}>*</span>}</span>
      <input
        className={`date-input${hasErr?" err":""}`}
        value={getDisplayValue()}
        placeholder="DD/MM/YYYY"
        onFocus={()=>setFocused(true)}
        onBlur={()=>setFocused(false)}
        onChange={handleChange}
        maxLength={10}
        inputMode="numeric"
        autoComplete="off"
      />
      {hasErr&&<span className="err-msg">Required</span>}
    </div>
  );
}

function YearField({ l, v, s, r=true, errKey, errors, onFix }) {
  const hasErr = errKey && errors && errors[errKey];
  return(
    <div className="fi">
      <span className="fl">{l}{r&&<span style={{color:"#ef4444",marginLeft:2}}>*</span>}</span>
      <input className={`in${hasErr?" err":""}`} value={v||""} placeholder="YYYY" inputMode="numeric" maxLength={4} onChange={e=>{const val=e.target.value.replace(/\D/g,"").slice(0,4);s(val);if(onFix&&hasErr&&val)onFix(errKey);}}/>
      {hasErr&&<span className="err-msg">Required</span>}
    </div>
  );
}

function F({ l, v, s, t="text", r=true, errKey, errors, onFix }) {
  const hasErr = errKey && errors && errors[errKey];
  return(
    <div className="fi">
      <span className="fl">{l}{r&&<span style={{color:"#ef4444",marginLeft:2}}>*</span>}</span>
      <input className={`in${hasErr?" err":""}`} type={t} value={v||""} onChange={e=>{s(e.target.value);if(onFix&&hasErr)onFix(errKey);}}/>
      {hasErr&&<span className="err-msg">Required</span>}
    </div>
  );
}
function FS({ l, v, s, o, r=true, errKey, errors, onFix }) {
  const hasErr = errKey && errors && errors[errKey];
  return(
    <div className="fi">
      <span className="fl">{l}{r&&<span style={{color:"#ef4444",marginLeft:2}}>*</span>}</span>
      <select className={`in${hasErr?" err":""}`} value={v} onChange={e=>{s(e.target.value);if(onFix&&hasErr)onFix(errKey);}} style={{background:v?"#fff":"#f2f1f9",color:v?"#1a1730":"#8b88b0"}}>
        <option value="">Select</option>
        {o.map(x=><option key={x} value={x}>{x}</option>)}
      </select>
      {hasErr&&<span className="err-msg">Required</span>}
    </div>
  );
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
  const [expandedTicket, setExpandedTicket] = useState("");
  const [tLoading,setTLoading]= useState(false);
  const [attachmentKey, setAttachmentKey] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [uploadingAtt, setUploadingAtt] = useState(false);
  const [attErr, setAttErr] = useState("");

  const [replyText, setReplyText] = useState("");
  const [replyAttKey, setReplyAttKey] = useState("");
  const [replyAttName, setReplyAttName] = useState("");
  const [replyUploadingAtt, setReplyUploadingAtt] = useState(false);
  const [replySending, setReplySending] = useState(false);
  const [replyErr, setReplyErr] = useState("");

  const handleReplyAttachmentSelect = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setReplyErr("File must be under 10MB"); return; }
    setReplyUploadingAtt(true); setReplyErr("");
    try {
      const r = await apiFetch(`${API}/support/tickets/upload-url`, {
        method: "POST",
        body: JSON.stringify({ filename: file.name }),
      });
      const d = await r.json();
      if (!r.ok) { setReplyErr(d.detail || "Could not prepare upload"); setReplyUploadingAtt(false); return; }
      const putRes = await fetch(d.upload_url, { method: "PUT", body: file, headers: { "Content-Type": file.type || "application/octet-stream" } });
      if (!putRes.ok) { setReplyErr("Upload failed — please try again"); setReplyUploadingAtt(false); return; }
      setReplyAttKey(d.s3_key);
      setReplyAttName(file.name);
    } catch (_) { setReplyErr("Network error — please try again"); }
    setReplyUploadingAtt(false);
  };

  const submitReply = async (ticketId) => {
    if (!replyText.trim()) return;
    setReplySending(true); setReplyErr("");
    try {
      const r = await apiFetch(`${API}/support/tickets/reply`, {
        method: "POST",
        body: JSON.stringify({ ticket_id: ticketId, body: replyText.trim(), attachment_key: replyAttKey }),
      });
      const d = await r.json();
      if (!r.ok) { setReplyErr(d.detail || "Failed to send reply"); setReplySending(false); return; }
      setReplyText(""); setReplyAttKey(""); setReplyAttName("");
      await loadTickets();
    } catch (_) { setReplyErr("Network error — please try again"); }
    setReplySending(false);
  };


  const handleAttachmentSelect = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setAttErr("File must be under 10MB"); return; }
    setUploadingAtt(true); setAttErr("");
    try {
      const r = await apiFetch(`${API}/support/tickets/upload-url`, {
        method: "POST",
        body: JSON.stringify({ filename: file.name }),
      });
      const d = await r.json();
      if (!r.ok) { setAttErr(d.detail || "Could not prepare upload"); setUploadingAtt(false); return; }
      const putRes = await fetch(d.upload_url, { method: "PUT", body: file, headers: { "Content-Type": file.type || "application/octet-stream" } });
      if (!putRes.ok) { setAttErr("Upload failed — please try again"); setUploadingAtt(false); return; }
      setAttachmentKey(d.s3_key);
      setAttachmentName(file.name);
    } catch (_) { setAttErr("Network error — please try again"); }
    setUploadingAtt(false);
  };

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
        body: JSON.stringify({ category: cat, subject: subject.trim(), body: body.trim(), attachment_key: attachmentKey }),
      });
      const d = await r.json();
      if (!r.ok) { setErr(d.detail || "Failed to submit"); setBusy(false); return; }
      setOk("✅ Ticket submitted! We'll get back to you within 2 business days.");
      setSubject(""); setBody(""); setCat("account"); setAttachmentKey(""); setAttachmentName("");
      setTimeout(() => { setOk(""); setTab("tickets"); loadTickets(); }, 1800);
    } catch(_) { setErr("Network error — please try again"); }
    setBusy(false);
  };

  const statusColor = { open:"#f59e0b", in_progress:"#3b82f6", resolved:"#16a34a", closed:"#334155" };

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

            <div>
              <div style={{fontSize:"0.65rem",fontWeight:700,color:"#8b88b0",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.35rem"}}>Attachment (optional)</div>
              {!attachmentKey ? (
                <label style={{display:"flex",alignItems:"center",gap:"0.5rem",padding:"0.6rem 0.875rem",background:"#f8f7ff",border:"1.5px dashed #ddd8f5",borderRadius:9,cursor:uploadingAtt?"not-allowed":"pointer",fontSize:"0.78rem",color:"#6b6894",fontWeight:600}}>
                  📎 {uploadingAtt ? "Uploading…" : "Attach a screenshot or document (max 10MB)"}
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" disabled={uploadingAtt} style={{display:"none"}} onChange={e=>handleAttachmentSelect(e.target.files?.[0])}/>
                </label>
              ) : (
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.55rem 0.875rem",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:9,fontSize:"0.78rem",color:"#16a34a",fontWeight:600}}>
                  <span>📎 {attachmentName || "Attached"}</span>
                  <button type="button" onClick={()=>{setAttachmentKey("");setAttachmentName("");}} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:"0.78rem",fontWeight:700}}>Remove</button>
                </div>
              )}
              {attErr && <div style={{fontSize:"0.7rem",color:"#ef4444",fontWeight:600,marginTop:"0.3rem"}}>{attErr}</div>}
            </div>

            {err && <div style={{fontSize:"0.72rem",color:"#ef4444",fontWeight:600}}>{err}</div>}
            {ok  && <div style={{fontSize:"0.72rem",color:"#16a34a",fontWeight:600,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,padding:"0.5rem 0.75rem"}}>{ok}</div>}

            <button onClick={submit} disabled={busy || uploadingAtt}
              style={{padding:"0.7rem",background:"#0d6e6e",color:"#fff",border:"none",borderRadius:10,fontFamily:"inherit",fontSize:"0.875rem",fontWeight:700,cursor:(busy||uploadingAtt)?"not-allowed":"pointer",opacity:(busy||uploadingAtt)?0.6:1,transition:"all 0.15s"}}>
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
            {tickets.map(t=>{
              const isOpen = expandedTicket === t.ticket_id;
              return (
              <div key={t.ticket_id} style={{border:"1px solid #ebe9f5",borderRadius:10,padding:"0.85rem 1rem",marginBottom:"0.6rem",cursor:"pointer"}}
                onClick={()=>setExpandedTicket(isOpen?"":t.ticket_id)}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.35rem"}}>
                  <div style={{fontWeight:700,fontSize:"0.84rem",color:"#1a1730",flex:1,paddingRight:"0.5rem"}}>{t.subject}</div>
                  <span style={{fontSize:"0.65rem",fontWeight:700,color:statusColor[t.status]||"#94a3b8",background:`${statusColor[t.status]||"#94a3b8"}15`,padding:"2px 8px",borderRadius:999,whiteSpace:"nowrap",textTransform:"capitalize"}}>{t.status?.replace("_"," ")}</span>
                </div>
                <div style={{display:"flex",gap:"0.5rem",fontSize:"0.65rem",color:"#94a3b8"}}>
                  <span style={{background:"#f0ece6",padding:"1px 7px",borderRadius:999,textTransform:"capitalize"}}>{t.category}</span>
                  <span>{new Date(t.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
                </div>
                {t.replies?.length > 0 && (
                  <div style={{marginTop:"0.5rem",fontSize:"0.72rem",color:"#0d6e6e",fontWeight:600}}>💬 {t.replies.length} repl{t.replies.length===1?"y":"ies"} — {isOpen?"tap to collapse":"tap to view"}</div>
                )}
                {!t.replies?.length && <div style={{marginTop:"0.5rem",fontSize:"0.7rem",color:"#94a3b8"}}>{isOpen?"tap to collapse":"tap to view your message"}</div>}
                {isOpen && (
                  <div style={{marginTop:"0.7rem",paddingTop:"0.7rem",borderTop:"1px solid #f0eef8"}}>
                    <div style={{background:"#f8f7ff",borderRadius:8,padding:"0.6rem 0.75rem",marginBottom:"0.5rem"}}>
                      <div style={{fontSize:"0.65rem",fontWeight:700,color:"#6b6894",marginBottom:"0.25rem"}}>You wrote:</div>
                      <div style={{fontSize:"0.8rem",color:"#1a1730",whiteSpace:"pre-wrap"}}>{t.body}</div>
                      {t.attachment_url && <a href={t.attachment_url} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",marginTop:"0.4rem",fontSize:"0.72rem",color:"#0d6e6e",fontWeight:700,textDecoration:"none"}}>📎 View attachment</a>}
                    </div>
                    {(t.replies||[]).map((r,i)=>(
                      <div key={i} style={r.by==="admin"?{background:"#f0fdf4",borderRadius:8,padding:"0.6rem 0.75rem",marginBottom:"0.5rem"}:{background:"#f8f7ff",borderRadius:8,padding:"0.6rem 0.75rem",marginBottom:"0.5rem"}}>
                        <div style={{fontSize:"0.65rem",fontWeight:700,color:r.by==="admin"?"#16a34a":"#6b6894",marginBottom:"0.25rem"}}>{r.by==="admin"?"Datagate Support":"You"} — {new Date(r.at).toLocaleString("en-IN",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
                        <div style={{fontSize:"0.8rem",color:"#1a1730",whiteSpace:"pre-wrap"}}>{r.body}</div>
                        {r.attachment_url && <a href={r.attachment_url} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",marginTop:"0.4rem",fontSize:"0.72rem",color:r.by==="admin"?"#16a34a":"#0d6e6e",fontWeight:700,textDecoration:"none"}}>📎 View attachment</a>}
                      </div>
                    ))}
                    {t.status!=="closed" ? (
                      <div style={{marginTop:"0.6rem",paddingTop:"0.6rem",borderTop:"1px solid #f0eef8"}} onClick={e=>e.stopPropagation()}>
                        <textarea value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="Type a reply…" rows={3}
                          style={{width:"100%",padding:"0.5rem 0.7rem",background:"#faf9ff",border:"1.5px solid #ddd8f5",borderRadius:8,fontFamily:"inherit",fontSize:"0.78rem",color:"#1a1730",outline:"none",resize:"vertical"}}/>
                        <div style={{marginTop:"0.4rem",display:"flex",alignItems:"center",gap:"0.5rem",flexWrap:"wrap"}}>
                          {!replyAttKey ? (
                            <label style={{display:"inline-flex",alignItems:"center",gap:"0.35rem",padding:"0.35rem 0.6rem",background:"#f8f7ff",border:"1.5px dashed #ddd8f5",borderRadius:7,cursor:replyUploadingAtt?"not-allowed":"pointer",fontSize:"0.68rem",color:"#6b6894",fontWeight:600}}>
                              📎 {replyUploadingAtt ? "Uploading…" : "Attach"}
                              <input type="file" accept=".pdf,.jpg,.jpeg,.png" disabled={replyUploadingAtt} style={{display:"none"}} onChange={e=>handleReplyAttachmentSelect(e.target.files?.[0])}/>
                            </label>
                          ) : (
                            <div style={{display:"inline-flex",alignItems:"center",gap:"0.4rem",padding:"0.3rem 0.6rem",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:7,fontSize:"0.68rem",color:"#16a34a",fontWeight:600}}>
                              📎 {replyAttName}
                              <button type="button" onClick={()=>{setReplyAttKey("");setReplyAttName("");}} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:"0.68rem",fontWeight:700}}>✕</button>
                            </div>
                          )}
                          <button onClick={()=>submitReply(t.ticket_id)} disabled={replySending || replyUploadingAtt || !replyText.trim()}
                            style={{marginLeft:"auto",padding:"0.4rem 0.9rem",background:"#0d6e6e",color:"#fff",border:"none",borderRadius:7,fontFamily:"inherit",fontSize:"0.72rem",fontWeight:700,cursor:(replySending||replyUploadingAtt||!replyText.trim())?"not-allowed":"pointer",opacity:(replySending||replyUploadingAtt||!replyText.trim())?0.5:1}}>
                            {replySending?"Sending…":"Send Reply"}
                          </button>
                        </div>
                        {replyErr && <div style={{fontSize:"0.68rem",color:"#ef4444",fontWeight:600,marginTop:"0.3rem"}}>{replyErr}</div>}
                      </div>
                    ) : (
                      <div style={{marginTop:"0.5rem",fontSize:"0.7rem",color:"#94a3b8",fontStyle:"italic"}}>This ticket is closed. Raise a new ticket if you need further help.</div>
                    )}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EducationDetails() {
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

  const [showSignout,setShowSignout]=useState(false);
  const [saveStatus,setSaveStatus]=useState("");
  const [midSaveStatus,setMidSaveStatus]=useState("");
  const [loading,setLoading]=useState(true);
  const [serverDraft,setServerDraft]=useState(null);
  const [errors,setErrors]=useState({});
  const isDirtyRef=useRef(false);
  const wasEditedRef=useRef(false);
  const d=(fn)=>(val)=>{fn(val);isDirtyRef.current=true;wasEditedRef.current=true;};
  const fixErr=(key)=>setErrors(p=>({...p,[key]:false}));

  const [hasUG,setHasUG]=useState("");
  const [activeUploads, setActiveUploads] = useState(0);
  const handleUploadState = useCallback((active) => setActiveUploads(c => Math.max(0, c + (active ? 1 : -1))), []);
  const [hasPG,setHasPG]=useState("");
  const [hasDip,setHasDip]=useState("");
  const [afterTenth,setAfterTenth]=useState("");
  const [hasCerts,setHasCerts]=useState("");
  const [hasProfQual,setHasProfQual]=useState("");
  const [hasArticleship,setHasArticleship]=useState("");

  const [xSchool,setXSchool]=useState("");const [xBoard,setXBoard]=useState("");const [xHall,setXHall]=useState("");
  const [xFrom,setXFrom]=useState("");const [xTo,setXTo]=useState("");const [xAddress,setXAddress]=useState("");
  const [xYear,setXYear]=useState("");const [xResultType,setXResultType]=useState("");const [xResultTypeOther,setXResultTypeOther]=useState("");const [xResultValue,setXResultValue]=useState("");const [xMedium,setXMedium]=useState("");const [xCertKey,setXCertKey]=useState("");
  const [xCountry,setXCountry]=useState("India");const [xCountryName,setXCountryName]=useState("");const [xEquivalencyKey,setXEquivalencyKey]=useState("");

  const [iCollege,setICollege]=useState("");const [iBoard,setIBoard]=useState("");const [iHall,setIHall]=useState("");
  const [iFrom,setIFrom]=useState("");const [iTo,setITo]=useState("");const [iAddress,setIAddress]=useState("");const [iMode,setIMode]=useState("");
  const [iYear,setIYear]=useState("");const [iResultType,setIResultType]=useState("");const [iResultTypeOther,setIResultTypeOther]=useState("");const [iResultValue,setIResultValue]=useState("");const [iMedium,setIMedium]=useState("");const [iCertKey,setICertKey]=useState("");const [iStream,setIStream]=useState("");const [iStreamOther,setIStreamOther]=useState("");
  const [iCountry,setICountry]=useState("India");const [iCountryName,setICountryName]=useState("");const [iEquivalencyKey,setIEquivalencyKey]=useState("");

  const [ugCollege,setUgCollege]=useState("");const [ugUniversity,setUgUniversity]=useState("");const [ugCourse,setUgCourse]=useState("");
  const [ugSpecialization,setUgSpecialization]=useState("");
  const [ugHall,setUgHall]=useState("");const [ugFrom,setUgFrom]=useState("");const [ugTo,setUgTo]=useState("");const [ugAddress,setUgAddress]=useState("");const [ugMode,setUgMode]=useState("");
  const [ugYear,setUgYear]=useState("");const [ugResultType,setUgResultType]=useState("");const [ugResultTypeOther,setUgResultTypeOther]=useState("");const [ugResultValue,setUgResultValue]=useState("");const [ugBacklogs,setUgBacklogs]=useState("");const [ugMedium,setUgMedium]=useState("");
  const [ugProvKey,setUgProvKey]=useState("");const [ugConvoKey,setUgConvoKey]=useState("");
  const [ugCountry,setUgCountry]=useState("India");const [ugCountryName,setUgCountryName]=useState("");const [ugEquivalencyKey,setUgEquivalencyKey]=useState("");

  const [pgCollege,setPgCollege]=useState("");const [pgUniversity,setPgUniversity]=useState("");const [pgCourse,setPgCourse]=useState("");
  const [pgSpecialization,setPgSpecialization]=useState("");
  const [pgHall,setPgHall]=useState("");const [pgFrom,setPgFrom]=useState("");const [pgTo,setPgTo]=useState("");const [pgAddress,setPgAddress]=useState("");const [pgMode,setPgMode]=useState("");
  const [pgYear,setPgYear]=useState("");const [pgResultType,setPgResultType]=useState("");const [pgResultTypeOther,setPgResultTypeOther]=useState("");const [pgResultValue,setPgResultValue]=useState("");const [pgBacklogs,setPgBacklogs]=useState("");const [pgMedium,setPgMedium]=useState("");
  const [pgProvKey,setPgProvKey]=useState("");const [pgConvoKey,setPgConvoKey]=useState("");
  const [pgCountry,setPgCountry]=useState("India");const [pgCountryName,setPgCountryName]=useState("");const [pgEquivalencyKey,setPgEquivalencyKey]=useState("");

  const [dipInstitute,setDipInstitute]=useState("");const [dipBoard,setDipBoard]=useState("");const [dipCourse,setDipCourse]=useState("");const [dipBacklogs,setDipBacklogs]=useState("");
  const [dipFrom,setDipFrom]=useState("");const [dipTo,setDipTo]=useState("");const [dipYear,setDipYear]=useState("");
  const [dipResultType,setDipResultType]=useState("");const [dipResultTypeOther,setDipResultTypeOther]=useState("");const [dipResultValue,setDipResultValue]=useState("");const [dipMode,setDipMode]=useState("");const [dipCertKey,setDipCertKey]=useState("");
  const [dipCountry,setDipCountry]=useState("India");const [dipCountryName,setDipCountryName]=useState("");const [dipEquivalencyKey,setDipEquivalencyKey]=useState("");

  const [certs,setCerts]=useState([{name:"",certKey:"",_k:"cert-init"}]);
  const [profQuals,setProfQuals]=useState([{type:"",otherType:"",level:"",year:"",regNo:"",certKey:"",_k:"pq-init"}]);
  const [articleships,setArticleships]=useState([{firm:"",city:"",principalName:"",regNo:"",from:"",to:"",isOngoing:"",type:"",otherType:"",certKey:"",_k:"art-init"}]);
  const [hasEduGap,setHasEduGap]=useState("");
  const [eduGapReason,setEduGapReason]=useState("");
  const [eduGapFrom,setEduGapFrom]=useState("");
  const [eduGapTo,setEduGapTo]=useState("");

  useEffect(()=>{
    if(!ready)return;
    if(!user){router.replace("/employee/login");return;}
    if(user.role!=="employee"){router.replace("/employee/login");return;}
  },[ready,user,router]);

  useEffect(()=>{
    if(!ready||!user)return;
    const fetchDraft=async()=>{
      try{
        const res=await apiFetch(`${API}/employee/draft`);
        if(res.ok){
          const dr=await res.json();setServerDraft(dr);
          const edu=dr.education||{};
          const x=edu.classX||{};const i=edu.intermediate||{};const ug=edu.undergraduate||{};
          const pg=edu.postgraduate||{};const dip=edu.diploma||{};
          const certsData=edu.certifications||[];const profData=edu.professionalQualifications||[];
          const artData=edu.articleships||[];

          if(x.school)setXSchool(x.school);if(x.board)setXBoard(x.board);if(x.hallTicket)setXHall(x.hallTicket);
          if(x.from)setXFrom(x.from);if(x.to)setXTo(x.to);if(x.address)setXAddress(x.address);
          if(x.yearOfPassing)setXYear(x.yearOfPassing);if(x.resultType)setXResultType(x.resultType);if(x.resultTypeOther)setXResultTypeOther(x.resultTypeOther);if(x.resultValue)setXResultValue(x.resultValue);if(x.medium)setXMedium(x.medium);if(x.certKey)setXCertKey(x.certKey);
          setXCountry(x.country||"India");if(x.countryName)setXCountryName(x.countryName);if(x.equivalencyKey)setXEquivalencyKey(x.equivalencyKey);

          if(i.college)setICollege(i.college);if(i.board)setIBoard(i.board);if(i.hallTicket)setIHall(i.hallTicket);
          if(i.from)setIFrom(i.from);if(i.to)setITo(i.to);if(i.address)setIAddress(i.address);if(i.mode)setIMode(i.mode);
          if(i.yearOfPassing)setIYear(i.yearOfPassing);if(i.resultType)setIResultType(i.resultType);if(i.resultTypeOther)setIResultTypeOther(i.resultTypeOther);if(i.resultValue)setIResultValue(i.resultValue);if(i.medium)setIMedium(i.medium);if(i.certKey)setICertKey(i.certKey);if(i.stream)setIStream(i.stream);if(i.streamOther)setIStreamOther(i.streamOther);
          setICountry(i.country||"India");if(i.countryName)setICountryName(i.countryName);if(i.equivalencyKey)setIEquivalencyKey(i.equivalencyKey);

          if(edu.hasUG){setHasUG(edu.hasUG);}else if(ug.college){setHasUG("Yes");}
          if(ug.college)setUgCollege(ug.college);if(ug.university)setUgUniversity(ug.university);if(ug.course)setUgCourse(ug.course);
          if(ug.specialization)setUgSpecialization(ug.specialization);
          if(ug.hallTicket)setUgHall(ug.hallTicket);if(ug.from)setUgFrom(ug.from);if(ug.to)setUgTo(ug.to);if(ug.address)setUgAddress(ug.address);if(ug.mode)setUgMode(ug.mode);
          if(ug.yearOfPassing)setUgYear(ug.yearOfPassing);if(ug.resultType)setUgResultType(ug.resultType);if(ug.resultTypeOther)setUgResultTypeOther(ug.resultTypeOther);if(ug.resultValue)setUgResultValue(ug.resultValue);if(ug.backlogs)setUgBacklogs(ug.backlogs);if(ug.medium)setUgMedium(ug.medium);
          if(ug.provKey)setUgProvKey(ug.provKey);if(ug.convoKey)setUgConvoKey(ug.convoKey);if(!ug.provKey&&ug.certKey)setUgProvKey(ug.certKey);
          setUgCountry(ug.country||"India");if(ug.countryName)setUgCountryName(ug.countryName);if(ug.equivalencyKey)setUgEquivalencyKey(ug.equivalencyKey);

          if(edu.hasPG){setHasPG(edu.hasPG);}else if(pg.college){setHasPG("Yes");}
          if(pg.college)setPgCollege(pg.college);if(pg.university)setPgUniversity(pg.university);if(pg.course)setPgCourse(pg.course);
          if(pg.specialization)setPgSpecialization(pg.specialization);
          if(pg.hallTicket)setPgHall(pg.hallTicket);if(pg.from)setPgFrom(pg.from);if(pg.to)setPgTo(pg.to);if(pg.address)setPgAddress(pg.address);if(pg.mode)setPgMode(pg.mode);
          if(pg.yearOfPassing)setPgYear(pg.yearOfPassing);if(pg.resultType)setPgResultType(pg.resultType);if(pg.resultTypeOther)setPgResultTypeOther(pg.resultTypeOther);if(pg.resultValue)setPgResultValue(pg.resultValue);if(pg.backlogs)setPgBacklogs(pg.backlogs);if(pg.medium)setPgMedium(pg.medium);
          if(pg.provKey)setPgProvKey(pg.provKey);if(pg.convoKey)setPgConvoKey(pg.convoKey);if(!pg.provKey&&pg.certKey)setPgProvKey(pg.certKey);
          setPgCountry(pg.country||"India");if(pg.countryName)setPgCountryName(pg.countryName);if(pg.equivalencyKey)setPgEquivalencyKey(pg.equivalencyKey);

          if(edu.afterTenth)setAfterTenth(edu.afterTenth);
          else if(edu.hasDip==="Yes"&&dip.institute){setAfterTenth("Diploma");}
          if(edu.hasDip)setHasDip(edu.hasDip); else if(dip.institute)setHasDip("Yes");
          if(edu.hasCerts)setHasCerts(edu.hasCerts);
          if(edu.hasProfQual)setHasProfQual(edu.hasProfQual);
          if(edu.hasArticleship)setHasArticleship(edu.hasArticleship);
          if(dip.institute)setDipInstitute(dip.institute);if(dip.board)setDipBoard(dip.board);if(dip.course)setDipCourse(dip.course);if(dip.backlogs)setDipBacklogs(dip.backlogs);
          if(dip.from)setDipFrom(dip.from);if(dip.to)setDipTo(dip.to);if(dip.yearOfPassing)setDipYear(dip.yearOfPassing);
          if(dip.resultType)setDipResultType(dip.resultType);if(dip.resultTypeOther)setDipResultTypeOther(dip.resultTypeOther);if(dip.resultValue)setDipResultValue(dip.resultValue);if(dip.mode)setDipMode(dip.mode);if(dip.certKey)setDipCertKey(dip.certKey);
          setDipCountry(dip.country||"India");if(dip.countryName)setDipCountryName(dip.countryName);if(dip.equivalencyKey)setDipEquivalencyKey(dip.equivalencyKey);

          if(certsData.length>0)setCerts(certsData.map((c,i)=>({name:typeof c.name==="string"?c.name:"",certKey:typeof c.certKey==="string"?c.certKey:"",_k:c._k||`cert-restored-${i}-${Date.now()}`})));
          if(profData.length>0)setProfQuals(profData.map((q,i)=>({...q,_k:q._k||`pq-restored-${i}-${Date.now()}`})));
          if(artData.length>0)setArticleships(artData.map((a,i)=>({...a,_k:a._k||`art-restored-${i}-${Date.now()}`})));
          if(edu.hasEduGap)setHasEduGap(edu.hasEduGap);
          if(edu.eduGapReason)setEduGapReason(edu.eduGapReason);
          if(edu.eduGapFrom)setEduGapFrom(edu.eduGapFrom);
          if(edu.eduGapTo)setEduGapTo(edu.eduGapTo);
        }
      }catch(_){}
      setLoading(false);
    };
    fetchDraft();
  },[ready,user,apiFetch]);

  const validate=()=>{
    const e={};
    if(!xSchool)e.xSchool=true;if(!xBoard)e.xBoard=true;if(!xHall)e.xHall=true;
    if(!xFrom)e.xFrom=true;if(!xTo)e.xTo=true;if(!xYear)e.xYear=true;if(!xAddress)e.xAddress=true;
    if(!xResultType)e.xResultType=true;if(xResultType==="Other"&&!xResultTypeOther)e.xResultTypeOther=true;if(!xResultValue)e.xResultValue=true;if(!xMedium)e.xMedium=true;if(!xCertKey)e.xCertKey=true;
    if(!afterTenth) e.afterTenth=true;
    if(afterTenth==="Intermediate"||afterTenth==="Both"){
      if(!iCollege)e.iCollege=true;if(!iBoard)e.iBoard=true;if(!iHall)e.iHall=true;
      if(!iFrom)e.iFrom=true;if(!iTo)e.iTo=true;if(!iYear)e.iYear=true;if(!iAddress)e.iAddress=true;
      if(!iMode)e.iMode=true;if(!iResultType)e.iResultType=true;if(iResultType==="Other"&&!iResultTypeOther)e.iResultTypeOther=true;if(!iResultValue)e.iResultValue=true;if(!iMedium)e.iMedium=true;if(!iCertKey)e.iCertKey=true;if(!iStream)e.iStream=true;if(iStream==="Other"&&!iStreamOther)e.iStreamOther=true;
    }
    if(afterTenth==="Diploma"||afterTenth==="Both"){
      if(!dipInstitute)e.dipInstitute=true;if(!dipBoard)e.dipBoard=true;if(!dipCourse)e.dipCourse=true;
      if(!dipFrom)e.dipFrom=true;if(!dipTo)e.dipTo=true;if(!dipYear)e.dipYear=true;
      if(!dipResultType)e.dipResultType=true;if(dipResultType==="Other"&&!dipResultTypeOther)e.dipResultTypeOther=true;if(!dipResultValue)e.dipResultValue=true;if(!dipMode)e.dipMode=true;if(!dipBacklogs)e.dipBacklogs=true;if(dipBacklogs!=="Yes"&&!dipCertKey)e.dipCertKey=true;
    }
    if(hasUG==="Yes"){
      if(!ugCountry)e.ugCountry=true;if(ugCountry==="Outside India"&&!ugCountryName)e.ugCountryName=true;
      if(!ugCollege)e.ugCollege=true;if(!ugUniversity)e.ugUniversity=true;if(!ugCourse)e.ugCourse=true;if(ugCountry!=="Outside India"&&!ugHall)e.ugHall=true;
      if(!ugFrom)e.ugFrom=true;if(!ugTo)e.ugTo=true;if(!ugYear)e.ugYear=true;if(!ugAddress)e.ugAddress=true;
      if(!ugMode)e.ugMode=true;if(!ugResultType)e.ugResultType=true;if(ugResultType==="Other"&&!ugResultTypeOther)e.ugResultTypeOther=true;if(!ugResultValue)e.ugResultValue=true;if(!ugMedium)e.ugMedium=true;if(!ugBacklogs)e.ugBacklogs=true;if(ugBacklogs!=="Yes"&&!ugProvKey)e.ugProvKey=true;
    }
    if(hasPG==="Yes"){
      if(!pgCountry)e.pgCountry=true;if(pgCountry==="Outside India"&&!pgCountryName)e.pgCountryName=true;
      if(!pgCollege)e.pgCollege=true;if(!pgUniversity)e.pgUniversity=true;if(!pgCourse)e.pgCourse=true;if(pgCountry!=="Outside India"&&!pgHall)e.pgHall=true;if(!pgFrom)e.pgFrom=true;if(!pgTo)e.pgTo=true;if(!pgYear)e.pgYear=true;if(!pgAddress)e.pgAddress=true;if(!pgMode)e.pgMode=true;if(!pgResultType)e.pgResultType=true;if(pgResultType==="Other"&&!pgResultTypeOther)e.pgResultTypeOther=true;if(!pgResultValue)e.pgResultValue=true;if(!pgMedium)e.pgMedium=true;if(!pgBacklogs)e.pgBacklogs=true;if(pgBacklogs!=="Yes"&&!pgProvKey)e.pgProvKey=true;
    }
    if(hasDip==="Yes"&&afterTenth!=="Diploma"&&afterTenth!=="Both"){if(!dipInstitute)e.dipInstitute=true;if(!dipBoard)e.dipBoard=true;if(!dipCourse)e.dipCourse=true;if(!dipFrom)e.dipFrom=true;if(!dipTo)e.dipTo=true;if(!dipYear)e.dipYear=true;if(!dipResultType)e.dipResultType=true;if(dipResultType==="Other"&&!dipResultTypeOther)e.dipResultTypeOther=true;if(!dipResultValue)e.dipResultValue=true;if(!dipMode)e.dipMode=true;if(!dipBacklogs)e.dipBacklogs=true;if(dipBacklogs!=="Yes"&&!dipCertKey)e.dipCertKey=true;}
    if(hasCerts==="Yes"){certs.forEach((c,idx)=>{if(!c.name)e[`cert_name_${idx}`]=true;if(!c.certKey)e[`cert_key_${idx}`]=true;});}
    if(hasProfQual==="Yes"){profQuals.forEach((q,idx)=>{if(!q.type)e[`pq_type_${idx}`]=true;if(q.type==="Other"&&!q.otherType)e[`pq_other_${idx}`]=true;if(!q.level)e[`pq_level_${idx}`]=true;if(q.level!=="Pursuing"&&!q.year)e[`pq_year_${idx}`]=true;});}
    if(hasArticleship==="Yes"){articleships.forEach((a,idx)=>{if(!a.firm)e[`art_firm_${idx}`]=true;if(!a.from)e[`art_from_${idx}`]=true;if(!a.type)e[`art_type_${idx}`]=true;if(a.type==="Other Practical Training"&&!a.otherType)e[`art_other_${idx}`]=true;if(!a.isOngoing)e[`art_status_${idx}`]=true;if(a.isOngoing==="Completed"&&!a.to)e[`art_to_${idx}`]=true;});}
    if(!hasCerts) e.hasCerts=true;
    if(!hasProfQual) e.hasProfQual=true;
    if(!hasArticleship) e.hasArticleship=true;
    if(!hasEduGap) e.hasEduGap=true;
    if(hasEduGap==="Yes"&&!eduGapReason) e.eduGapReason=true;
    if(hasEduGap==="Yes"&&!eduGapFrom) e.eduGapFrom=true;
    if(hasEduGap==="Yes"&&!eduGapTo) e.eduGapTo=true;
    return e;
  };

  const buildEducation=()=>({
    classX:{school:xSchool,board:xBoard,hallTicket:xHall,from:xFrom,to:xTo,address:xAddress,yearOfPassing:xYear,resultType:xResultType,resultTypeOther:xResultType==="Other"?xResultTypeOther:"",resultValue:xResultValue,medium:xMedium,certKey:xCertKey,country:xCountry,countryName:xCountry==="Outside India"?xCountryName:"",equivalencyKey:xEquivalencyKey},
    intermediate:{college:iCollege,board:iBoard,hallTicket:iHall,from:iFrom,to:iTo,address:iAddress,mode:iMode,stream:iStream,streamOther:iStream==="Other"?iStreamOther:"",yearOfPassing:iYear,resultType:iResultType,resultTypeOther:iResultType==="Other"?iResultTypeOther:"",resultValue:iResultValue,medium:iMedium,certKey:iCertKey,country:iCountry,countryName:iCountry==="Outside India"?iCountryName:"",equivalencyKey:iEquivalencyKey},
    undergraduate:hasUG==="Yes"?{college:ugCollege,university:ugUniversity,course:ugCourse,specialization:ugSpecialization,hallTicket:ugHall,from:ugFrom,to:ugTo,address:ugAddress,mode:ugMode,yearOfPassing:ugYear,resultType:ugResultType,resultTypeOther:ugResultType==="Other"?ugResultTypeOther:"",resultValue:ugResultValue,backlogs:ugBacklogs,medium:ugMedium,provKey:ugProvKey,convoKey:ugConvoKey,country:ugCountry,countryName:ugCountry==="Outside India"?ugCountryName:"",equivalencyKey:ugEquivalencyKey}:{},
    postgraduate:hasPG==="Yes"?{college:pgCollege,university:pgUniversity,course:pgCourse,specialization:pgSpecialization,hallTicket:pgHall,from:pgFrom,to:pgTo,address:pgAddress,mode:pgMode,yearOfPassing:pgYear,resultType:pgResultType,resultTypeOther:pgResultType==="Other"?pgResultTypeOther:"",resultValue:pgResultValue,backlogs:pgBacklogs,medium:pgMedium,provKey:pgProvKey,convoKey:pgConvoKey,country:pgCountry,countryName:pgCountry==="Outside India"?pgCountryName:"",equivalencyKey:pgEquivalencyKey}:{},
    afterTenth, hasDip, hasCerts, hasProfQual, hasArticleship, hasUG, hasPG,
    diploma:hasDip==="Yes"?{institute:dipInstitute,board:dipBoard,course:dipCourse,from:dipFrom,to:dipTo,yearOfPassing:dipYear,resultType:dipResultType,resultTypeOther:dipResultType==="Other"?dipResultTypeOther:"",resultValue:dipResultValue,mode:dipMode,backlogs:dipBacklogs,certKey:dipCertKey,country:dipCountry,countryName:dipCountry==="Outside India"?dipCountryName:"",equivalencyKey:dipEquivalencyKey}:{},
    certifications:hasCerts==="Yes"?certs:[],
    professionalQualifications:hasProfQual==="Yes"?profQuals:[],
    articleships:hasArticleship==="Yes"?articleships:[],
    hasEduGap,
    eduGapReason: hasEduGap==="Yes"?eduGapReason:"",
    eduGapFrom: hasEduGap==="Yes"?eduGapFrom:"",
    eduGapTo: hasEduGap==="Yes"?eduGapTo:"",
  });

  const saveDraft=async()=>{
    if(!serverDraft||!serverDraft.employee_id)throw new Error("Please complete and save Page 1 first");
    const dr=serverDraft;
    const res=await apiFetch(`${API}/employee`,{method:"POST",body:JSON.stringify({
      employee_id:dr.employee_id,status:dr.status||"draft",
      firstName:dr.firstName||"",lastName:dr.lastName||"",middleName:dr.middleName,
      fatherName:dr.fatherName,fatherFirst:dr.fatherFirst,fatherMiddle:dr.fatherMiddle,fatherLast:dr.fatherLast,
      dob:dr.dob,gender:dr.gender,nationality:dr.nationality,mobile:dr.mobile||"",email:dr.email,
      aadhaar:dr.aadhaar,pan:dr.pan,hasPassport:dr.hasPassport,passport:dr.passport,passportIssue:dr.passportIssue,passportExpiry:dr.passportExpiry,
      aadhaarKey:dr.aadhaarKey,panKey:dr.panKey,
      currentAddress:dr.currentAddress,permanentAddress:dr.permanentAddress,
      bankName:dr.bankName,bankAccountName:dr.bankAccountName,ifsc:dr.ifsc,branch:dr.branch,accountType:dr.accountType,accountFull:dr.accountFull,accountLast4:dr.accountLast4,
      uanNumber:dr.uanNumber,nameAsPerUan:dr.nameAsPerUan,mobileLinked:dr.mobileLinked,isActive:dr.isActive,pfRecords:dr.pfRecords,
      acknowledgements_profile:dr.acknowledgements_profile,education:buildEducation(),
      last_saved_at: Date.now(),
      // ── Cascade flag: page 2 edited → page 5 must re-ask review acks ──
      page2_edited: wasEditedRef.current ? true : (dr.page2_edited || false),
      ...(wasEditedRef.current ? { acknowledgements_review: {} } : {}),
    })});
    if(!res.ok)throw new Error(parseError(await res.json().catch(()=>({}))));
    setServerDraft({...dr,education:buildEducation()});isDirtyRef.current=false;
  };

  const handleSaveSignout=async()=>{
    try {
      await saveDraft();
      logout();
    } catch (e) {
      alert("Your changes could not be saved. Please check your connection and try again before signing out — signing out now would lose them.");
    }
  };
  const handleMidSave=async()=>{setMidSaveStatus("Saving…");try{await saveDraft();setMidSaveStatus("Saved ✓");setTimeout(()=>setMidSaveStatus(""),2000);}catch(_){setMidSaveStatus("Error");setTimeout(()=>setMidSaveStatus(""),2500);}};
  const handleNavigate=async(path)=>{const wasDirty=isDirtyRef.current;if(wasDirty){try{await saveDraft();}catch(_){}}const dest=(path==="/employee/review"&&wasDirty)?"/employee/review?edited=1":path;router.push(dest);};
  const handlePrevious=async()=>{if(isDirtyRef.current){try{await saveDraft();}catch(_){}}router.push("/employee/personal");};
  const handleSignout=async()=>{if(isDirtyRef.current){try{await saveDraft();}catch(_){}}logout();};

  const handleSave=async()=>{
    const errs=validate();
    if(Object.keys(errs).length>0){
      setErrors(errs);setSaveStatus("Please fill all required fields ↑");
      setTimeout(()=>{const el=document.querySelector(".in.err,.date-input.err");if(el)el.scrollIntoView({behavior:"smooth",block:"center"});},60);
      return;
    }
    setErrors({});setSaveStatus("Saving...");
    try{await saveDraft();setSaveStatus("Saved ✓");router.push("/employee/previous");}
    catch(err){setSaveStatus(`Error: ${err.message||"Could not save"}`);}
  };

  if(!ready||!user)return(<div style={{minHeight:"100vh",background:"#f5f4f0",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"#8b88b0",fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>Loading…</p></div>);
  if(loading)return(<div style={{minHeight:"100vh",background:"#f5f4f0",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"#8b88b0",fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>Loading education details…</p></div>);

  const UL=({lbl,required=true,errKey:ek})=>(<>
    <span className="fl" style={{display:"block",marginBottom:"0.28rem"}}>{lbl}{required&&<span style={{color:"#ef4444",marginLeft:2}}>*</span>}</span>
    {ek&&errors[ek]&&<span className="err-msg" style={{marginBottom:"0.3rem"}}>Upload is required</span>}
  </>);

  const updateArticleship=(i,field,val)=>{
    const a=[...articleships];a[i]={...a[i],[field]:val};setArticleships(a);isDirtyRef.current=true;
  };

  return(
    <>
      <style>{G}</style>
      <div className="pg">
        {showSignout&&<SignoutModal onConfirm={handleSignout} onCancel={()=>setShowSignout(false)}/>}
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
                  <input type="password" value={val} onChange={e=>setter(e.target.value)}
                    style={{width:"100%",padding:"0.6rem 0.8rem",border:"1.5px solid #dddaf0",borderRadius:8,fontFamily:"inherit",fontSize:"0.84rem",outline:"none",background:"#f8f7ff"}}/>
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
            <span className="user-name">👤 {user.name||user.email}</span>
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
            <button className="signout-btn" onClick={()=>setShowSignout(true)} style={{borderColor:"#ef4444",color:"#ef4444"}}>Sign out</button>
          </div>
        </div>
        <div className="wrap">
          <StepNav current={2} onNavigate={handleNavigate}/>

          {/* ── Class X ── */}
          <div className="sc ind">
            <div className="sh"><div className="si ind">📚</div><span className="st">Class X — SSC / Matriculation</span></div>
            <div className="fr">
              <div className="fi">
                <span className="fl">Where was this completed? <span style={{color:"#ef4444"}}>*</span></span>
                <div style={{display:"flex",gap:"0.55rem",marginTop:"0.15rem"}}>
                  {["India","Outside India"].map(v=>(
                    <button key={v} type="button" onClick={()=>{d(setXCountry)(v);if(v==="India")d(setXCountryName)("");}} style={{flex:1,padding:"0.55rem 0",borderRadius:9,border:xCountry===v?"2px solid #d97706":"1.5px solid #d8d4e3",background:xCountry===v?"#d97706":"#f5f4f0",color:xCountry===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.78rem",fontWeight:700,fontFamily:"inherit",transition:"all 0.18s"}}>{v}</button>
                  ))}
                </div>
              </div>
              {xCountry==="Outside India"&&<F l="Country" v={xCountryName} s={d(setXCountryName)} errKey="xCountryName" errors={errors} onFix={fixErr}/>}
            </div>
            <div className="fr"><F l="School Name" v={xSchool} s={d(setXSchool)} errKey="xSchool" errors={errors} onFix={fixErr}/><F l="Board Name" v={xBoard} s={d(setXBoard)} errKey="xBoard" errors={errors} onFix={fixErr}/><F l={xCountry==="Outside India"?"Roll No. / Student ID":"Hall Ticket / Roll No."} v={xHall} s={d(setXHall)} errKey="xHall" errors={errors} onFix={fixErr}/></div>
            <div className="fr">
              <DateField l="From" v={xFrom} s={d(setXFrom)} errKey="xFrom" errors={errors} onFix={fixErr}/>
              <DateField l="To" v={xTo} s={d(setXTo)} errKey="xTo" errors={errors} onFix={fixErr}/>
              <YearField l="Year of Passing" v={xYear} s={d(setXYear)} errKey="xYear" errors={errors} onFix={fixErr}/>
            </div>
            <div className="fr"><F l="School Address" v={xAddress} s={d(setXAddress)} errKey="xAddress" errors={errors} onFix={fixErr}/></div>
            <div className="fr"><FS l="Result Type" v={xResultType} s={(v)=>{d(setXResultType)(v);if(v!=="Other")setXResultTypeOther("");}} o={["Percentage","CGPA (out of 10)","GPA (out of 4.0)","Class / Division","Grade","Pass / Fail","Other"]} errKey="xResultType" errors={errors} onFix={fixErr}/><F l="Result Value" v={xResultValue} s={d(setXResultValue)} errKey="xResultValue" errors={errors} onFix={fixErr}/><F l="Medium of Study" v={xMedium} s={d(setXMedium)} errKey="xMedium" errors={errors} onFix={fixErr}/></div>
            {xResultType==="Other"&&<div className="fr"><F l="Please specify your grading system" v={xResultTypeOther} s={d(setXResultTypeOther)} errKey="xResultTypeOther" errors={errors} onFix={fixErr}/></div>}
            <div style={{marginTop:"0.7rem"}}><UL lbl="Upload Class X Certificate" errKey="xCertKey"/><FileUpload onUploadStateChange={handleUploadState} label="Upload Class X Certificate" category="education" subKey="classX" employeeId={serverDraft?.employee_id || ""} apiFetch={apiFetch} value={xCertKey} onChange={(k)=>{const key=typeof k==="string"?k:(k?.key||k?.s3_key||"");setXCertKey(key);isDirtyRef.current=true;fixErr("xCertKey");}}/></div>
            {xCountry==="Outside India"&&(
              <div className="att-split">
                <div className="att-box" style={{flex:"0 0 100%"}}>
                  <span className="att-box-lbl">Equivalency Certificate (AIU / WES)</span>
                  <p style={{fontSize:"0.7rem",color:"#d97706",fontWeight:600,marginBottom:"0.4rem"}}>⚠️ Recommended for foreign schooling — needed for final BGV verification. Upload later if not yet obtained.</p>
                  <FileUpload onUploadStateChange={handleUploadState} label="Upload Equivalency Certificate" category="education" subKey="classx_equivalency" employeeId={serverDraft?.employee_id || ""} apiFetch={apiFetch} value={xEquivalencyKey} onChange={(k)=>{const key=typeof k==="string"?k:(k?.key||k?.s3_key||"");setXEquivalencyKey(key);isDirtyRef.current=true;}}/>
                </div>
              </div>
            )}
          </div>

          {/* ── After Class X ── */}
          <div className="sc cyn">
            <div className="sh"><div className="si cyn">🔀</div><span className="st">After Class X — What did you pursue? <span style={{color:"#ef4444",fontSize:"0.82rem"}}>*</span></span></div>
            <p style={{fontSize:"0.76rem",color:"#6b6894",marginBottom:"1rem",fontWeight:500,lineHeight:1.55}}>After completing Class X (10th), what was your next qualification?</p>
            <div style={{display:"flex",gap:"0.6rem",flexWrap:"wrap"}}>
              {[
                {v:"Intermediate", label:"Intermediate / 12th", desc:"Regular HSC / Pre-University / +2"},
                {v:"Diploma",      label:"Diploma (after 10th)", desc:"3-year Polytechnic / ITI directly after 10th"},
                {v:"Both",         label:"Both",                 desc:"Did Intermediate AND a Diploma"},
              ].map(({v,label,desc})=>(
                <button key={v} type="button"
                  onClick={()=>{setAfterTenth(v);isDirtyRef.current=true;fixErr("afterTenth");}}
                  style={{padding:"0.6rem 1rem",borderRadius:10,cursor:"pointer",textAlign:"left",transition:"all 0.18s",border:afterTenth===v?"2px solid #0891b2":"1.5px solid #dddaf0",background:afterTenth===v?"#ecfeff":"#f2f1f9",minWidth:180}}>
                  <div style={{fontSize:"0.84rem",fontWeight:700,color:afterTenth===v?"#0891b2":"#1a1730"}}>{label}</div>
                  <div style={{fontSize:"0.68rem",color:"#8b88b0",marginTop:"0.15rem",fontWeight:500}}>{desc}</div>
                </button>
              ))}
            </div>
            {errors.afterTenth&&<span className="err-msg" style={{marginTop:"0.5rem",display:"block"}}>Please select your path after Class X</span>}
          </div>

          {/* ── Intermediate ── */}
          {(afterTenth==="Intermediate"||afterTenth==="Both")&&(
          <div className="sc cyn">
            <div className="sh"><div className="si cyn">🏫</div><span className="st">Intermediate — HSC / 12th</span></div>
            <div className="fr">
              <div className="fi">
                <span className="fl">Where was this completed? <span style={{color:"#ef4444"}}>*</span></span>
                <div style={{display:"flex",gap:"0.55rem",marginTop:"0.15rem"}}>
                  {["India","Outside India"].map(v=>(
                    <button key={v} type="button" onClick={()=>{d(setICountry)(v);if(v==="India")d(setICountryName)("");}} style={{flex:1,padding:"0.55rem 0",borderRadius:9,border:iCountry===v?"2px solid #d97706":"1.5px solid #d8d4e3",background:iCountry===v?"#d97706":"#f5f4f0",color:iCountry===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.78rem",fontWeight:700,fontFamily:"inherit",transition:"all 0.18s"}}>{v}</button>
                  ))}
                </div>
              </div>
              {iCountry==="Outside India"&&<F l="Country" v={iCountryName} s={d(setICountryName)} errKey="iCountryName" errors={errors} onFix={fixErr}/>}
            </div>
            <div className="fr"><F l="College Name" v={iCollege} s={d(setICollege)} errKey="iCollege" errors={errors} onFix={fixErr}/><F l="Board Name" v={iBoard} s={d(setIBoard)} errKey="iBoard" errors={errors} onFix={fixErr}/><F l={iCountry==="Outside India"?"Roll No. / Student ID":"Hall Ticket / Roll No."} v={iHall} s={d(setIHall)} errKey="iHall" errors={errors} onFix={fixErr}/></div>
            <div className="fr">
              <DateField l="From" v={iFrom} s={d(setIFrom)} errKey="iFrom" errors={errors} onFix={fixErr}/>
              <DateField l="To" v={iTo} s={d(setITo)} errKey="iTo" errors={errors} onFix={fixErr}/>
              <YearField l="Year of Passing" v={iYear} s={d(setIYear)} errKey="iYear" errors={errors} onFix={fixErr}/>
            </div>
            <div className="fr"><F l="College Address" v={iAddress} s={d(setIAddress)} errKey="iAddress" errors={errors} onFix={fixErr}/></div>
            <div className="fr"><FS l="Mode" v={iMode} s={d(setIMode)} o={["Full-time","Part-time","Distance"]} errKey="iMode" errors={errors} onFix={fixErr}/><FS l="Result Type" v={iResultType} s={(v)=>{d(setIResultType)(v);if(v!=="Other")setIResultTypeOther("");}} o={["Percentage","CGPA (out of 10)","GPA (out of 4.0)","Class / Division","Grade","Pass / Fail","Other"]} errKey="iResultType" errors={errors} onFix={fixErr}/><F l="Result Value" v={iResultValue} s={d(setIResultValue)} errKey="iResultValue" errors={errors} onFix={fixErr}/></div>
            {iResultType==="Other"&&<div className="fr"><F l="Please specify your grading system" v={iResultTypeOther} s={d(setIResultTypeOther)} errKey="iResultTypeOther" errors={errors} onFix={fixErr}/></div>}
            <div className="fr"><FS l="Stream" v={iStream} s={(v)=>{d(setIStream)(v);if(v!=="Other")setIStreamOther("");}} o={["Science","Commerce","Arts","Vocational","Other"]} errKey="iStream" errors={errors} onFix={fixErr}/><F l="Medium of Study" v={iMedium} s={d(setIMedium)} errKey="iMedium" errors={errors} onFix={fixErr}/></div>
            {iStream==="Other"&&<div className="fr"><F l="Please specify your stream" v={iStreamOther} s={d(setIStreamOther)} errKey="iStreamOther" errors={errors} onFix={fixErr}/></div>}
            <div style={{marginTop:"0.7rem"}}><UL lbl="Upload Intermediate Certificate" errKey="iCertKey"/><FileUpload onUploadStateChange={handleUploadState} label="Upload Intermediate Certificate" category="education" subKey="intermediate" employeeId={serverDraft?.employee_id || ""} apiFetch={apiFetch} value={iCertKey} onChange={(k)=>{const key=typeof k==="string"?k:(k?.key||k?.s3_key||"");setICertKey(key);isDirtyRef.current=true;fixErr("iCertKey");}}/></div>
            {iCountry==="Outside India"&&(
              <div className="att-split">
                <div className="att-box" style={{flex:"0 0 100%"}}>
                  <span className="att-box-lbl">Equivalency Certificate (AIU / WES)</span>
                  <p style={{fontSize:"0.7rem",color:"#d97706",fontWeight:600,marginBottom:"0.4rem"}}>⚠️ Recommended for foreign schooling — needed for final BGV verification. Upload later if not yet obtained.</p>
                  <FileUpload onUploadStateChange={handleUploadState} label="Upload Equivalency Certificate" category="education" subKey="intermediate_equivalency" employeeId={serverDraft?.employee_id || ""} apiFetch={apiFetch} value={iEquivalencyKey} onChange={(k)=>{const key=typeof k==="string"?k:(k?.key||k?.s3_key||"");setIEquivalencyKey(key);isDirtyRef.current=true;}}/>
                </div>
              </div>
            )}
          </div>
          )}

          {/* ── Diploma after 10th ── */}
          {(afterTenth==="Diploma"||afterTenth==="Both")&&(
          <div className="sc grn">
            <div className="sh"><div className="si grn">🔧</div><span className="st">Diploma — After Class X</span></div>
            <div className="fr">
              <div className="fi">
                <span className="fl">Where was this completed? <span style={{color:"#ef4444"}}>*</span></span>
                <div style={{display:"flex",gap:"0.55rem",marginTop:"0.15rem"}}>
                  {["India","Outside India"].map(v=>(
                    <button key={v} type="button" onClick={()=>{d(setDipCountry)(v);if(v==="India")d(setDipCountryName)("");}} style={{flex:1,padding:"0.55rem 0",borderRadius:9,border:dipCountry===v?"2px solid #16a34a":"1.5px solid #d8d4e3",background:dipCountry===v?"#16a34a":"#f5f4f0",color:dipCountry===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.78rem",fontWeight:700,fontFamily:"inherit",transition:"all 0.18s"}}>{v}</button>
                  ))}
                </div>
              </div>
              {dipCountry==="Outside India"&&<F l="Country" v={dipCountryName} s={d(setDipCountryName)} errKey="dipCountryName" errors={errors} onFix={fixErr}/>}
            </div>
            <div className="fr"><F l="Institute Name" v={dipInstitute} s={d(setDipInstitute)} errKey="dipInstitute" errors={errors} onFix={fixErr}/><F l="Board / University" v={dipBoard} s={d(setDipBoard)} errKey="dipBoard" errors={errors} onFix={fixErr}/><F l="Course / Programme" v={dipCourse} s={d(setDipCourse)} errKey="dipCourse" errors={errors} onFix={fixErr}/></div>
            <div className="fr">
              <DateField l="From" v={dipFrom} s={d(setDipFrom)} errKey="dipFrom" errors={errors} onFix={fixErr}/>
              <DateField l="To" v={dipTo} s={d(setDipTo)} errKey="dipTo" errors={errors} onFix={fixErr}/>
              <YearField l="Year of Passing" v={dipYear} s={d(setDipYear)} errKey="dipYear" errors={errors} onFix={fixErr}/>
            </div>
            <div className="fr"><FS l="Mode" v={dipMode} s={d(setDipMode)} o={["Full-time","Part-time","Distance"]} errKey="dipMode" errors={errors} onFix={fixErr}/><FS l="Result Type" v={dipResultType} s={(v)=>{d(setDipResultType)(v);if(v!=="Other")setDipResultTypeOther("");}} o={["Percentage","CGPA (out of 10)","GPA (out of 4.0)","Class / Division","Grade","Pass / Fail","Other"]} errKey="dipResultType" errors={errors} onFix={fixErr}/><F l="Result Value" v={dipResultValue} s={d(setDipResultValue)} errKey="dipResultValue" errors={errors} onFix={fixErr}/></div>
            {dipResultType==="Other"&&<div className="fr"><F l="Please specify your grading system" v={dipResultTypeOther} s={d(setDipResultTypeOther)} errKey="dipResultTypeOther" errors={errors} onFix={fixErr}/></div>}
            <div style={{marginTop:"0.7rem"}}><UL lbl="Upload Diploma Certificate" errKey="dipCertKey"/><FileUpload onUploadStateChange={handleUploadState} label="Upload Diploma Certificate" category="education" subKey="diploma" employeeId={serverDraft?.employee_id || ""} apiFetch={apiFetch} value={dipCertKey} onChange={(k)=>{const key=typeof k==="string"?k:(k?.key||k?.s3_key||"");setDipCertKey(key);isDirtyRef.current=true;fixErr("dipCertKey");}}/></div>
            {dipCountry==="Outside India"&&(
              <div className="att-split">
                <div className="att-box" style={{flex:"0 0 100%"}}>
                  <span className="att-box-lbl">Equivalency Certificate (AIU / WES)</span>
                  <p style={{fontSize:"0.7rem",color:"#d97706",fontWeight:600,marginBottom:"0.4rem"}}>⚠️ Recommended for foreign diplomas — needed for final BGV verification. Upload later if not yet obtained.</p>
                  <FileUpload onUploadStateChange={handleUploadState} label="Upload Equivalency Certificate" category="education" subKey="diploma_equivalency" employeeId={serverDraft?.employee_id || ""} apiFetch={apiFetch} value={dipEquivalencyKey} onChange={(k)=>{const key=typeof k==="string"?k:(k?.key||k?.s3_key||"");setDipEquivalencyKey(key);isDirtyRef.current=true;}}/>
                </div>
              </div>
            )}
          </div>
          )}

          {/* ── Undergraduate ── */}
          <div className="sc amb">
            <div className="sh"><div className="si amb">🎓</div><span className="st">Undergraduate — UG / Degree</span></div>
            <YesNo label={<>Do you have an Undergraduate degree? <span style={{color:"#ef4444"}}>*</span></>} value={hasUG} onChange={(v)=>{setHasUG(v);isDirtyRef.current=true;}}/>
            {hasUG==="Yes"&&(<>
              <div className="fr">
                <div className="fi">
                  <span className="fl">Where was this completed? <span style={{color:"#ef4444"}}>*</span></span>
                  <div style={{display:"flex",gap:"0.55rem",marginTop:"0.15rem"}}>
                    {["India","Outside India"].map(v=>(
                      <button key={v} type="button" onClick={()=>{d(setUgCountry)(v);if(v==="India")d(setUgCountryName)("");}} style={{flex:1,padding:"0.55rem 0",borderRadius:9,border:ugCountry===v?"2px solid #d97706":"1.5px solid #d8d4e3",background:ugCountry===v?"#d97706":"#f5f4f0",color:ugCountry===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.78rem",fontWeight:700,fontFamily:"inherit",transition:"all 0.18s"}}>{v}</button>
                    ))}
                  </div>
                </div>
                {ugCountry==="Outside India"&&<F l="Country" v={ugCountryName} s={d(setUgCountryName)} errKey="ugCountryName" errors={errors} onFix={fixErr}/>}
              </div>
              <div className="fr"><F l="College Name" v={ugCollege} s={d(setUgCollege)} errKey="ugCollege" errors={errors} onFix={fixErr}/><F l="University Name" v={ugUniversity} s={d(setUgUniversity)} errKey="ugUniversity" errors={errors} onFix={fixErr}/><F l="Course / Degree" v={ugCourse} s={d(setUgCourse)} errKey="ugCourse" errors={errors} onFix={fixErr}/></div>
              <div className="fr">
                <F l="Specialization / Branch" v={ugSpecialization} s={d(setUgSpecialization)} r={false}/>
                <F l={ugCountry==="Outside India"?"Roll No. / Student ID":"Hall Ticket / Roll No."} v={ugHall} s={d(setUgHall)} r={ugCountry!=="Outside India"} errKey="ugHall" errors={errors} onFix={fixErr}/>
                <FS l="Mode" v={ugMode} s={d(setUgMode)} o={["Full-time","Part-time","Distance","Integrated"]} errKey="ugMode" errors={errors} onFix={fixErr}/>
              </div>
              <div className="fr">
                <DateField l="From" v={ugFrom} s={d(setUgFrom)} errKey="ugFrom" errors={errors} onFix={fixErr}/>
                <DateField l="To" v={ugTo} s={d(setUgTo)} errKey="ugTo" errors={errors} onFix={fixErr}/>
                <YearField l="Year of Passing" v={ugYear} s={d(setUgYear)} errKey="ugYear" errors={errors} onFix={fixErr}/>
              </div>
              <div className="fr"><F l="College Address" v={ugAddress} s={d(setUgAddress)} errKey="ugAddress" errors={errors} onFix={fixErr}/></div>
              <div className="fr"><FS l="Result Type" v={ugResultType} s={(v)=>{d(setUgResultType)(v);if(v!=="Other")setUgResultTypeOther("");}} o={["Percentage","CGPA (out of 10)","GPA (out of 4.0)","Class / Division","Grade","Pass / Fail","Other"]} errKey="ugResultType" errors={errors} onFix={fixErr}/><F l="Result Value" v={ugResultValue} s={d(setUgResultValue)} errKey="ugResultValue" errors={errors} onFix={fixErr}/><F l="Medium of Study" v={ugMedium} s={d(setUgMedium)} errKey="ugMedium" errors={errors} onFix={fixErr}/></div>
              {ugResultType==="Other"&&<div className="fr"><F l="Please specify your grading system" v={ugResultTypeOther} s={d(setUgResultTypeOther)} errKey="ugResultTypeOther" errors={errors} onFix={fixErr}/></div>}
              <div className="fr"><FS l="Any Active Backlogs?" v={ugBacklogs} s={d(setUgBacklogs)} o={["No","Yes"]} errKey="ugBacklogs" errors={errors} onFix={fixErr}/></div>
              <div className="att-split">
                <div className="att-box">
                  <UL lbl="Provisional Marksheet" required={ugBacklogs!=="Yes"} errKey="ugProvKey"/>
                  {ugBacklogs==="Yes"&&<p style={{fontSize:"0.7rem",color:"#d97706",fontWeight:600,marginBottom:"0.4rem"}}>⚠️ Upload when available after clearing backlogs</p>}
                  <FileUpload onUploadStateChange={handleUploadState} label="Upload Provisional Marksheet" category="education" subKey="ug_provisional" employeeId={serverDraft?.employee_id || ""} apiFetch={apiFetch} value={ugProvKey} onChange={(k)=>{const key=typeof k==="string"?k:(k?.key||k?.s3_key||"");setUgProvKey(key);isDirtyRef.current=true;fixErr("ugProvKey");}}/>
                </div>
                <div className="att-box"><span className="att-box-lbl">Convocation Certificate</span><FileUpload onUploadStateChange={handleUploadState} label="Upload Convocation Certificate" category="education" subKey="ug_convocation" employeeId={serverDraft?.employee_id || ""} apiFetch={apiFetch} value={ugConvoKey} onChange={(k)=>{const key=typeof k==="string"?k:(k?.key||k?.s3_key||"");setUgConvoKey(key);isDirtyRef.current=true;}}/></div>
              </div>
              {ugCountry==="Outside India"&&(
                <div className="att-split">
                  <div className="att-box" style={{flex:"0 0 100%"}}>
                    <span className="att-box-lbl">Equivalency Certificate (AIU / WES)</span>
                    <p style={{fontSize:"0.7rem",color:"#d97706",fontWeight:600,marginBottom:"0.4rem"}}>⚠️ Recommended for foreign degrees — needed for final BGV verification. Upload later if not yet obtained.</p>
                    <FileUpload onUploadStateChange={handleUploadState} label="Upload Equivalency Certificate" category="education" subKey="ug_equivalency" employeeId={serverDraft?.employee_id || ""} apiFetch={apiFetch} value={ugEquivalencyKey} onChange={(k)=>{const key=typeof k==="string"?k:(k?.key||k?.s3_key||"");setUgEquivalencyKey(key);isDirtyRef.current=true;}}/>
                  </div>
                </div>
              )}
            </>)}
          </div>

          {/* ── Postgraduate ── */}
          <div className="sc vio">
            <div className="sh"><div className="si vio">🧑‍🎓</div><span className="st">Postgraduate — PG / Masters</span></div>
            <YesNo label={<>Do you have a Postgraduate degree? <span style={{color:"#ef4444"}}>*</span></>} value={hasPG} onChange={(v)=>{setHasPG(v);isDirtyRef.current=true;}}/>
            {hasPG==="Yes"&&(<>
              <div className="fr">
                <div className="fi">
                  <span className="fl">Where was this completed? <span style={{color:"#ef4444"}}>*</span></span>
                  <div style={{display:"flex",gap:"0.55rem",marginTop:"0.15rem"}}>
                    {["India","Outside India"].map(v=>(
                      <button key={v} type="button" onClick={()=>{d(setPgCountry)(v);if(v==="India")d(setPgCountryName)("");}} style={{flex:1,padding:"0.55rem 0",borderRadius:9,border:pgCountry===v?"2px solid #7c3aed":"1.5px solid #d8d4e3",background:pgCountry===v?"#7c3aed":"#f5f4f0",color:pgCountry===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.78rem",fontWeight:700,fontFamily:"inherit",transition:"all 0.18s"}}>{v}</button>
                    ))}
                  </div>
                </div>
                {pgCountry==="Outside India"&&<F l="Country" v={pgCountryName} s={d(setPgCountryName)} errKey="pgCountryName" errors={errors} onFix={fixErr}/>}
              </div>
              <div className="fr"><F l="College Name" v={pgCollege} s={d(setPgCollege)} errKey="pgCollege" errors={errors} onFix={fixErr}/><F l="University Name" v={pgUniversity} s={d(setPgUniversity)} errKey="pgUniversity" errors={errors} onFix={fixErr}/><F l="Course / Degree" v={pgCourse} s={d(setPgCourse)} errKey="pgCourse" errors={errors} onFix={fixErr}/></div>
              <div className="fr">
                <F l="Specialization / Branch" v={pgSpecialization} s={d(setPgSpecialization)} r={false}/>
                <F l={pgCountry==="Outside India"?"Roll No. / Student ID":"Hall Ticket / Roll No."} v={pgHall} s={d(setPgHall)} r={pgCountry!=="Outside India"} errKey="pgHall" errors={errors} onFix={fixErr}/>
                <FS l="Mode" v={pgMode} s={d(setPgMode)} o={["Full-time","Part-time","Distance","Executive"]} errKey="pgMode" errors={errors} onFix={fixErr}/>
              </div>
              <div className="fr">
                <DateField l="From" v={pgFrom} s={d(setPgFrom)} errKey="pgFrom" errors={errors} onFix={fixErr}/>
                <DateField l="To" v={pgTo} s={d(setPgTo)} errKey="pgTo" errors={errors} onFix={fixErr}/>
                <YearField l="Year of Passing" v={pgYear} s={d(setPgYear)} errKey="pgYear" errors={errors} onFix={fixErr}/>
              </div>
              <div className="fr"><F l="College Address" v={pgAddress} s={d(setPgAddress)} errKey="pgAddress" errors={errors} onFix={fixErr}/></div>
              <div className="fr"><FS l="Result Type" v={pgResultType} s={(v)=>{d(setPgResultType)(v);if(v!=="Other")setPgResultTypeOther("");}} o={["Percentage","CGPA (out of 10)","GPA (out of 4.0)","Class / Division","Grade","Pass / Fail","Other"]} errKey="pgResultType" errors={errors} onFix={fixErr}/><F l="Result Value" v={pgResultValue} s={d(setPgResultValue)} errKey="pgResultValue" errors={errors} onFix={fixErr}/><F l="Medium of Study" v={pgMedium} s={d(setPgMedium)} errKey="pgMedium" errors={errors} onFix={fixErr}/></div>
              {pgResultType==="Other"&&<div className="fr"><F l="Please specify your grading system" v={pgResultTypeOther} s={d(setPgResultTypeOther)} errKey="pgResultTypeOther" errors={errors} onFix={fixErr}/></div>}
              <div className="fr"><FS l="Any Active Backlogs?" v={pgBacklogs} s={d(setPgBacklogs)} o={["No","Yes"]} errKey="pgBacklogs" errors={errors} onFix={fixErr}/></div>
              <div className="att-split">
                <div className="att-box">
                  <UL lbl="Provisional Marksheet" required={pgBacklogs!=="Yes"} errKey="pgProvKey"/>
                  {pgBacklogs==="Yes"&&<p style={{fontSize:"0.7rem",color:"#d97706",fontWeight:600,marginBottom:"0.4rem"}}>⚠️ Upload when available after clearing backlogs</p>}
                  <FileUpload onUploadStateChange={handleUploadState} label="Upload Provisional Marksheet" category="education" subKey="pg_provisional" employeeId={serverDraft?.employee_id || ""} apiFetch={apiFetch} value={pgProvKey} onChange={(k)=>{const key=typeof k==="string"?k:(k?.key||k?.s3_key||"");setPgProvKey(key);isDirtyRef.current=true;fixErr("pgProvKey");}}/>
                </div>
                <div className="att-box"><span className="att-box-lbl">Convocation Certificate</span><FileUpload onUploadStateChange={handleUploadState} label="Upload Convocation Certificate" category="education" subKey="pg_convocation" employeeId={serverDraft?.employee_id || ""} apiFetch={apiFetch} value={pgConvoKey} onChange={(k)=>{const key=typeof k==="string"?k:(k?.key||k?.s3_key||"");setPgConvoKey(key);isDirtyRef.current=true;}}/></div>
              </div>
              {pgCountry==="Outside India"&&(
                <div className="att-split">
                  <div className="att-box" style={{flex:"0 0 100%"}}>
                    <span className="att-box-lbl">Equivalency Certificate (AIU / WES)</span>
                    <p style={{fontSize:"0.7rem",color:"#d97706",fontWeight:600,marginBottom:"0.4rem"}}>⚠️ Recommended for foreign degrees — needed for final BGV verification. Upload later if not yet obtained.</p>
                    <FileUpload onUploadStateChange={handleUploadState} label="Upload Equivalency Certificate" category="education" subKey="pg_equivalency" employeeId={serverDraft?.employee_id || ""} apiFetch={apiFetch} value={pgEquivalencyKey} onChange={(k)=>{const key=typeof k==="string"?k:(k?.key||k?.s3_key||"");setPgEquivalencyKey(key);isDirtyRef.current=true;}}/>
                  </div>
                </div>
              )}
            </>)}
          </div>

          {/* ── Additional Diploma ── */}
          {afterTenth==="Intermediate"&&(
          <div className="sc grn">
            <div className="sh"><div className="si grn">🔧</div><span className="st">Diploma / Technical / Vocational</span></div>
            <div style={{display:"flex",alignItems:"center",gap:"0.5rem",flexWrap:"wrap",marginBottom:"1rem"}}>
              <span style={{fontSize:"0.875rem",color:"#1a1730",fontWeight:600}}>
                Do you have a Diploma or Technical qualification?
                {" "}<span style={{color:"#ef4444"}}>*</span>
              </span>
              {["Yes","No"].map(v=>(
                <button key={v} onClick={()=>{setHasDip(v);isDirtyRef.current=true;fixErr("hasDip");}} style={{padding:"0.32rem 1.1rem",borderRadius:999,border:hasDip===v?"2px solid #0d6e6e":"1.5px solid #dddaf0",background:hasDip===v?"#0d6e6e":"#f2f1f9",color:hasDip===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.82rem",fontWeight:700,transition:"all 0.18s"}}>{v}</button>
              ))}
            </div>
            {hasDip==="Yes"&&(<>
              <div className="fr">
                <div className="fi">
                  <span className="fl">Where was this completed? <span style={{color:"#ef4444"}}>*</span></span>
                  <div style={{display:"flex",gap:"0.55rem",marginTop:"0.15rem"}}>
                    {["India","Outside India"].map(v=>(
                      <button key={v} type="button" onClick={()=>{d(setDipCountry)(v);if(v==="India")d(setDipCountryName)("");}} style={{flex:1,padding:"0.55rem 0",borderRadius:9,border:dipCountry===v?"2px solid #16a34a":"1.5px solid #d8d4e3",background:dipCountry===v?"#16a34a":"#f5f4f0",color:dipCountry===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.78rem",fontWeight:700,fontFamily:"inherit",transition:"all 0.18s"}}>{v}</button>
                    ))}
                  </div>
                </div>
                {dipCountry==="Outside India"&&<F l="Country" v={dipCountryName} s={d(setDipCountryName)} errKey="dipCountryName" errors={errors} onFix={fixErr}/>}
              </div>
              <div className="fr"><F l="Institute Name" v={dipInstitute} s={d(setDipInstitute)} errKey="dipInstitute" errors={errors} onFix={fixErr}/><F l="Board / University" v={dipBoard} s={d(setDipBoard)} errKey="dipBoard" errors={errors} onFix={fixErr}/><F l="Course / Programme" v={dipCourse} s={d(setDipCourse)} errKey="dipCourse" errors={errors} onFix={fixErr}/></div>
              <div className="fr">
                <DateField l="From" v={dipFrom} s={d(setDipFrom)} errKey="dipFrom" errors={errors} onFix={fixErr}/>
                <DateField l="To" v={dipTo} s={d(setDipTo)} errKey="dipTo" errors={errors} onFix={fixErr}/>
                <YearField l="Year of Passing" v={dipYear} s={d(setDipYear)} errKey="dipYear" errors={errors} onFix={fixErr}/>
              </div>
              <div className="fr"><FS l="Mode" v={dipMode} s={d(setDipMode)} o={["Full-time","Part-time","Distance"]} errKey="dipMode" errors={errors} onFix={fixErr}/><FS l="Result Type" v={dipResultType} s={(v)=>{d(setDipResultType)(v);if(v!=="Other")setDipResultTypeOther("");}} o={["Percentage","CGPA (out of 10)","GPA (out of 4.0)","Class / Division","Grade","Pass / Fail","Other"]} errKey="dipResultType" errors={errors} onFix={fixErr}/><F l="Result Value" v={dipResultValue} s={d(setDipResultValue)} errKey="dipResultValue" errors={errors} onFix={fixErr}/></div>
            {dipResultType==="Other"&&<div className="fr"><F l="Please specify your grading system" v={dipResultTypeOther} s={d(setDipResultTypeOther)} errKey="dipResultTypeOther" errors={errors} onFix={fixErr}/></div>}
              <div className="fr"><FS l="Any Active Backlogs?" v={dipBacklogs} s={d(setDipBacklogs)} o={["No","Yes"]} errKey="dipBacklogs" errors={errors} onFix={fixErr}/></div>
              <div style={{marginTop:"0.7rem"}}>
                <UL lbl="Upload Diploma / Technical Certificate" required={dipBacklogs!=="Yes"} errKey="dipCertKey"/>
                {dipBacklogs==="Yes"&&<p style={{fontSize:"0.7rem",color:"#d97706",fontWeight:600,marginBottom:"0.4rem"}}>⚠️ Upload when available after clearing backlogs</p>}
                <FileUpload onUploadStateChange={handleUploadState} label="Upload Diploma Certificate" category="education" subKey="diploma" employeeId={serverDraft?.employee_id || ""} apiFetch={apiFetch} value={dipCertKey} onChange={(k)=>{const key=typeof k==="string"?k:(k?.key||k?.s3_key||"");setDipCertKey(key);isDirtyRef.current=true;fixErr("dipCertKey");}}/>
              </div>
              {dipCountry==="Outside India"&&(
                <div className="att-split">
                  <div className="att-box" style={{flex:"0 0 100%"}}>
                    <span className="att-box-lbl">Equivalency Certificate (AIU / WES)</span>
                    <p style={{fontSize:"0.7rem",color:"#d97706",fontWeight:600,marginBottom:"0.4rem"}}>⚠️ Recommended for foreign diplomas — needed for final BGV verification. Upload later if not yet obtained.</p>
                    <FileUpload onUploadStateChange={handleUploadState} label="Upload Equivalency Certificate" category="education" subKey="diploma_equivalency" employeeId={serverDraft?.employee_id || ""} apiFetch={apiFetch} value={dipEquivalencyKey} onChange={(k)=>{const key=typeof k==="string"?k:(k?.key||k?.s3_key||"");setDipEquivalencyKey(key);isDirtyRef.current=true;}}/>
                  </div>
                </div>
              )}
            </>)}
          </div>
          )}

          {/* ── Professional Qualifications ── */}
          <div className="sc slt">
            <div className="sh"><div className="si slt">🏛️</div><span className="st">Professional Qualifications</span></div>
            <div style={{display:"flex",alignItems:"center",gap:"0.5rem",flexWrap:"wrap",marginBottom:"1rem"}}>
              <span style={{fontSize:"0.875rem",color:"#1a1730",fontWeight:600}}>Do you have a professional qualification? <span style={{color:"#ef4444"}}>*</span></span>
              {["Yes","No"].map(v=>(
                <button key={v} onClick={()=>{setHasProfQual(v);isDirtyRef.current=true;fixErr("hasProfQual");}} style={{padding:"0.32rem 1.1rem",borderRadius:999,border:hasProfQual===v?"2px solid #0d6e6e":"1.5px solid #dddaf0",background:hasProfQual===v?"#0d6e6e":"#f2f1f9",color:hasProfQual===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.82rem",fontWeight:700,transition:"all 0.18s"}}>{v}</button>
              ))}
            </div>
            {errors.hasProfQual&&<span className="err-msg" style={{marginTop:"-0.5rem",marginBottom:"0.5rem",display:"block"}}>Please answer this question</span>}
            {hasProfQual==="Yes"&&(<>
              {profQuals.map((q,idx)=>(
                <div key={q._k||idx} className="cert-box">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.6rem"}}>
                    <span style={{fontSize:"0.78rem",color:"#8b88b0",fontWeight:700}}>Qualification {idx+1}</span>
                    {idx>0&&<button className="rm-btn" onClick={()=>{const p=[...profQuals];p.splice(idx,1);setProfQuals(p);isDirtyRef.current=true;}}>- Remove</button>}
                  </div>
                  <div className="fr">
                    <div className="fi">
                      <span className="fl">Qualification Type <span style={{color:"#ef4444"}}>*</span></span>
                      <select className={`in${errors[`pq_type_${idx}`]?" err":""}`} value={q.type} onChange={e=>{const p=[...profQuals];p[idx]={...p[idx],type:e.target.value,...(e.target.value!=="Other"?{otherType:""}:{})};setProfQuals(p);isDirtyRef.current=true;fixErr(`pq_type_${idx}`);}}>
                        <option value="">Select</option>
                        {["CA (Chartered Accountant)","CMA / ICWA","CS (Company Secretary)","CFA","ACCA","CIMA","FRM","PMP","ICSI","Other"].map(x=><option key={x} value={x}>{x}</option>)}
                      </select>
                      {errors[`pq_type_${idx}`]&&<span className="err-msg">Required</span>}
                    </div>
                    <div className="fi">
                      <span className="fl">Level / Stage <span style={{color:"#ef4444"}}>*</span></span>
                      <select className={`in${errors[`pq_level_${idx}`]?" err":""}`} value={q.level} onChange={e=>{const p=[...profQuals];p[idx]={...p[idx],level:e.target.value};setProfQuals(p);isDirtyRef.current=true;fixErr(`pq_level_${idx}`);}}>
                        <option value="">Select</option>
                        {["Foundation","Intermediate / Inter","Final","Qualified / Completed","Pursuing"].map(x=><option key={x} value={x}>{x}</option>)}
                      </select>
                      {errors[`pq_level_${idx}`]&&<span className="err-msg">Required</span>}
                    </div>
                    {q.level==="Pursuing"?(
                      <div className="fi">
                        <span className="fl">Year of Passing</span>
                        <div style={{padding:"0.65rem 0.875rem",background:"#fffbeb",border:"1.5px dashed #fcd34d",borderRadius:9,fontSize:"0.78rem",color:"#92400e",fontWeight:600}}>
                          ⏳ Still pursuing — you can update this once completed
                        </div>
                      </div>
                    ):(
                      <div className="fi">
                        <span className="fl">Year of Passing <span style={{color:"#ef4444"}}>*</span></span>
                        <input className={`in${errors[`pq_year_${idx}`]?" err":""}`} value={q.year||""} placeholder="YYYY" inputMode="numeric" maxLength={4} onChange={e=>{const val=e.target.value.replace(/\D/g,"").slice(0,4);const p=[...profQuals];p[idx]={...p[idx],year:val};setProfQuals(p);isDirtyRef.current=true;if(val)fixErr(`pq_year_${idx}`);}}/>
                        {errors[`pq_year_${idx}`]&&<span className="err-msg">Required</span>}
                      </div>
                    )}
                  </div>
                  <div className="fr" style={{marginTop:"0.6rem"}}>
                    <F l="Registration / Membership No. (if applicable)" v={q.regNo||""} s={(v)=>{const p=[...profQuals];p[idx]={...p[idx],regNo:v};setProfQuals(p);isDirtyRef.current=true;}} r={false}/>
                  </div>
                  {q.type==="Other"&&(
                    <div className="fr">
                      <div className="fi">
                        <span className="fl">Specify Qualification Name <span style={{color:"#ef4444"}}>*</span></span>
                        <input className={`in${errors[`pq_other_${idx}`]?" err":""}`} value={q.otherType||""} placeholder="Enter the qualification name" onChange={e=>{const p=[...profQuals];p[idx]={...p[idx],otherType:e.target.value};setProfQuals(p);isDirtyRef.current=true;fixErr(`pq_other_${idx}`);}}/>
                        {errors[`pq_other_${idx}`]&&<span className="err-msg">Required</span>}
                      </div>
                    </div>
                  )}
                  <div style={{marginTop:"0.5rem"}}>
                    <span className="fl" style={{display:"block",marginBottom:"0.28rem"}}>Upload Certificate / Marksheet</span>
                    <FileUpload onUploadStateChange={handleUploadState} label="Upload Certificate" category="education" subKey={`profqual_${idx}`} employeeId={serverDraft?.employee_id || ""} apiFetch={apiFetch} value={typeof q.certKey==="string"?q.certKey:""} onChange={(k)=>{const p=[...profQuals];p[idx]={...p[idx],certKey:typeof k==="string"?k:""};setProfQuals(p);isDirtyRef.current=true;}}/>
                  </div>
                </div>
              ))}
              <button className="add-btn" onClick={()=>{setProfQuals([...profQuals,{type:"",otherType:"",level:"",year:"",regNo:"",certKey:"",_k:`pq-${Date.now()}-${Math.random().toString(36).slice(2,7)}`}]);isDirtyRef.current=true;}}>+ Add Another Qualification</button>
            </>)}
          </div>

          {/* ── Articleship ── */}
          <div className="sc ora">
            <div className="sh"><div className="si ora">📝</div><span className="st">Articleship / Practical Training</span></div>
            <div style={{display:"flex",alignItems:"center",gap:"0.5rem",flexWrap:"wrap",marginBottom:"1rem"}}>
              <span style={{fontSize:"0.875rem",color:"#1a1730",fontWeight:600}}>Do you have any articleship or practical training? <span style={{color:"#ef4444"}}>*</span></span>
              {["Yes","No"].map(v=>(
                <button key={v} onClick={()=>{setHasArticleship(v);isDirtyRef.current=true;fixErr("hasArticleship");}} style={{padding:"0.32rem 1.1rem",borderRadius:999,border:hasArticleship===v?"2px solid #ea580c":"1.5px solid #dddaf0",background:hasArticleship===v?"#ea580c":"#f2f1f9",color:hasArticleship===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.82rem",fontWeight:700,transition:"all 0.18s"}}>{v}</button>
              ))}
            </div>
            {errors.hasArticleship&&<span className="err-msg" style={{marginTop:"-0.5rem",marginBottom:"0.5rem",display:"block"}}>Please answer this question</span>}
            {hasArticleship==="Yes"&&(<>
              {articleships.map((a,idx)=>(
                <div key={a._k||idx} className="cert-box" style={{background:"#fff7ed",border:"1.5px solid #fed7aa"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.75rem"}}>
                    <span style={{fontSize:"0.78rem",color:"#ea580c",fontWeight:700}}>Training / Articleship {idx+1}</span>
                    {idx>0&&<button className="rm-btn" onClick={()=>{const arr=[...articleships];arr.splice(idx,1);setArticleships(arr);isDirtyRef.current=true;}}>- Remove</button>}
                  </div>
                  <div className="fr">
                    <div className="fi">
                      <span className="fl">Training Type <span style={{color:"#ef4444"}}>*</span></span>
                      <select className={`in${errors[`art_type_${idx}`]?" err":""}`} value={a.type} onChange={e=>{const val=e.target.value;const arr=[...articleships];arr[idx]={...arr[idx],type:val,...(val!=="Other Practical Training"?{otherType:""}:{})};setArticleships(arr);isDirtyRef.current=true;fixErr(`art_type_${idx}`);}}>
                        <option value="">Select</option>
                        {["CA Articleship (ICAI)","CS Training (ICSI)","CMA Training (ICMAI)","Medical Internship","Pharmacy Internship","Law Internship","Architecture Internship","Other Practical Training"].map(x=><option key={x} value={x}>{x}</option>)}
                      </select>
                      {errors[`art_type_${idx}`]&&<span className="err-msg">Required</span>}
                    </div>
                    <F l="Firm / Organisation Name" v={a.firm} s={v=>updateArticleship(idx,"firm",v)} errKey={`art_firm_${idx}`} errors={errors} onFix={fixErr}/>
                  </div>
                  {a.type==="Other Practical Training"&&(
                    <div className="fr">
                      <div className="fi">
                        <span className="fl">Specify Training Type <span style={{color:"#ef4444"}}>*</span></span>
                        <input className={`in${errors[`art_other_${idx}`]?" err":""}`} value={a.otherType||""} placeholder="Enter the type of training" onChange={e=>{updateArticleship(idx,"otherType",e.target.value);fixErr(`art_other_${idx}`);}}/>
                        {errors[`art_other_${idx}`]&&<span className="err-msg">Required</span>}
                      </div>
                    </div>
                  )}
                  <div className="fr">
                    <F l="City / Location" v={a.city} s={v=>updateArticleship(idx,"city",v)} r={false}/>
                    <F l="Principal / Supervisor Name" v={a.principalName} s={v=>updateArticleship(idx,"principalName",v)} r={false}/>
                    <F l="Registration / Membership No." v={a.regNo} s={v=>updateArticleship(idx,"regNo",v)} r={false}/>
                  </div>
                  <div className="fr">
                    <DateField l="From" v={a.from} s={v=>updateArticleship(idx,"from",v)} errKey={`art_from_${idx}`} errors={errors} onFix={fixErr}/>
                    {a.isOngoing==="Ongoing"?(
                      <div className="fi">
                        <span className="fl">To</span>
                        <div style={{padding:"0.65rem 0.875rem",background:"#fffbeb",border:"1.5px solid #fcd34d",borderRadius:9,fontSize:"0.78rem",color:"#92400e",fontWeight:600}}>
                          ⏳ Ongoing — update once completed
                        </div>
                      </div>
                    ):(
                      <DateField l="To" v={a.to} s={v=>updateArticleship(idx,"to",v)} r={a.isOngoing==="Completed"} errKey={`art_to_${idx}`} errors={errors} onFix={fixErr}/>
                    )}
                    <div className="fi">
                      <span className="fl">Status <span style={{color:"#ef4444"}}>*</span></span>
                      <div style={{display:"flex",gap:"0.55rem",marginTop:"0.15rem"}}>
                        {["Ongoing","Completed"].map(v=>(
                          <button key={v} type="button" onClick={()=>{updateArticleship(idx,"isOngoing",v);fixErr(`art_status_${idx}`);}} style={{flex:1,padding:"0.55rem 0",borderRadius:9,border:a.isOngoing===v?"2px solid #ea580c":(errors[`art_status_${idx}`]?"1.5px solid #ef4444":"1.5px solid #d8d4e3"),background:a.isOngoing===v?"#ea580c":"#f5f4f0",color:a.isOngoing===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.78rem",fontWeight:700,fontFamily:"inherit",transition:"all 0.18s"}}>{v}</button>
                        ))}
                      </div>
                      {errors[`art_status_${idx}`]&&<span className="err-msg">Required</span>}
                    </div>
                  </div>
                  <div style={{marginTop:"0.5rem"}}>
                    <span className="fl" style={{display:"block",marginBottom:"0.28rem"}}>Upload Completion / Experience Letter</span>
                    <FileUpload onUploadStateChange={handleUploadState} label="Upload Letter" category="education" subKey={`articleship_${idx}`} employeeId={serverDraft?.employee_id || ""} apiFetch={apiFetch} value={typeof a.certKey==="string"?a.certKey:""} onChange={(k)=>{updateArticleship(idx,"certKey",typeof k==="string"?k:"");}}/>
                  </div>
                </div>
              ))}
              <button className="add-btn" onClick={()=>{setArticleships([...articleships,{firm:"",city:"",principalName:"",regNo:"",from:"",to:"",isOngoing:"",type:"",otherType:"",certKey:"",_k:`art-${Date.now()}-${Math.random().toString(36).slice(2,7)}`}]);isDirtyRef.current=true;}}>+ Add Another Training</button>
            </>)}
          </div>

          {/* ── Certifications ── */}
          <div className="sc ros">
            <div className="sh"><div className="si ros">🏅</div><span className="st">Professional Certifications</span></div>
            <div style={{display:"flex",alignItems:"center",gap:"0.5rem",flexWrap:"wrap",marginBottom:"1rem"}}>
              <span style={{fontSize:"0.875rem",color:"#1a1730",fontWeight:600}}>Do you have certifications? <span style={{color:"#ef4444"}}>*</span></span>
              {["Yes","No"].map(v=>(
                <button key={v} onClick={()=>{setHasCerts(v);isDirtyRef.current=true;fixErr("hasCerts");}} style={{padding:"0.32rem 1.1rem",borderRadius:999,border:hasCerts===v?"2px solid #e11d48":"1.5px solid #dddaf0",background:hasCerts===v?"#e11d48":"#f2f1f9",color:hasCerts===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.82rem",fontWeight:700,transition:"all 0.18s"}}>{v}</button>
              ))}
            </div>
            {errors.hasCerts&&<span className="err-msg" style={{marginTop:"-0.5rem",marginBottom:"0.5rem",display:"block"}}>Please answer this question</span>}
            {hasCerts==="Yes"&&(<>
              {certs.map((cert,idx)=>(
                <div key={cert._k||idx} className="cert-box">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.6rem"}}>
                    <span style={{fontSize:"0.78rem",color:"#8b88b0",fontWeight:700}}>Certification {idx+1}</span>
                    {idx>0&&<button className="rm-btn" onClick={()=>{const c=[...certs];c.splice(idx,1);setCerts(c);isDirtyRef.current=true;}}>- Remove</button>}
                  </div>
                  <div className="fr">
                    <div className="fi">
                      <span className="fl">Certification Name <span style={{color:"#ef4444"}}>*</span></span>
                      <input className={`in${errors[`cert_name_${idx}`]?" err":""}`} value={cert.name} onChange={e=>{const c=[...certs];c[idx]={...c[idx],name:e.target.value};setCerts(c);isDirtyRef.current=true;fixErr(`cert_name_${idx}`);}}/>
                      {errors[`cert_name_${idx}`]&&<span className="err-msg">Required</span>}
                    </div>
                  </div>
                  <div style={{marginTop:"0.5rem"}}>
                    <span className="fl" style={{display:"block",marginBottom:"0.28rem"}}>Upload Certificate <span style={{color:"#ef4444"}}>*</span></span>
                    {errors[`cert_key_${idx}`]&&<span className="err-msg" style={{marginBottom:"0.3rem"}}>Upload is required</span>}
                    <FileUpload onUploadStateChange={handleUploadState} label="Upload Certificate" category="education" subKey={`cert_${idx}`} employeeId={serverDraft?.employee_id || ""} apiFetch={apiFetch} value={typeof cert.certKey==="string"?cert.certKey:""} onChange={(k)=>{const c=[...certs];c[idx]={...c[idx],certKey:typeof k==="string"?k:""};setCerts(c);isDirtyRef.current=true;fixErr(`cert_key_${idx}`);}}/>
                  </div>
                </div>
              ))}
              <button className="add-btn" onClick={()=>{setCerts([...certs,{name:"",certKey:"",_k:`cert-${Date.now()}-${Math.random().toString(36).slice(2,7)}`}]);isDirtyRef.current=true;}}>+ Add Another Certification</button>
            </>)}
          </div>

          {/* ── Education Gap ── */}
          <div className="sc ind">
            <div className="sh"><div className="si ind">⏱</div><span className="st">Education Gap / Break Before First Job <span style={{color:"#ef4444",fontSize:"0.82rem"}}>*</span></span></div>
            <div style={{display:"flex",gap:"0.65rem",marginBottom:hasEduGap==="Yes"?"0.75rem":"0"}}>
              {["Yes","No"].map(v=>(
                <button key={v} type="button" onClick={()=>{d(setHasEduGap)(v);if(v==="No")setEduGapReason("");fixErr("hasEduGap");}} style={{padding:"0.45rem 1.6rem",borderRadius:999,border:hasEduGap===v?"2px solid #0d6e6e":"1.5px solid #dddaf0",background:hasEduGap===v?"#0d6e6e":"#f2f1f9",color:hasEduGap===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.875rem",fontWeight:700,transition:"all 0.18s"}}>{v}</button>
              ))}
            </div>
            {errors.hasEduGap&&<span className="err-msg" style={{marginTop:"0.4rem",display:"block"}}>Please answer this question before continuing</span>}
            {hasEduGap==="Yes"&&(
              <div style={{marginTop:"0.65rem"}}>
                <div className="fr" style={{marginBottom:"0.65rem"}}>
                  <DateField l="Gap From" v={eduGapFrom} s={d(setEduGapFrom)} errKey="eduGapFrom" errors={errors} onFix={fixErr}/>
                  <DateField l="Gap To" v={eduGapTo} s={d(setEduGapTo)} errKey="eduGapTo" errors={errors} onFix={fixErr}/>
                </div>
                <span className="fl" style={{display:"block",marginBottom:"0.28rem"}}>Reason for Gap <span style={{color:"#ef4444"}}>*</span></span>
                <textarea className={`in${errors.eduGapReason?" err":""}`} style={{minHeight:72,resize:"vertical"}} value={eduGapReason} placeholder="Briefly describe the gap period and reason" onChange={e=>{d(setEduGapReason)(e.target.value);fixErr("eduGapReason");}}/>
                {errors.eduGapReason&&<span className="err-msg">Please describe the reason for the gap</span>}
              </div>
            )}
            {hasEduGap==="No"&&(
              <div style={{marginTop:"0.5rem",padding:"0.65rem 0.875rem",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:9,fontSize:"0.78rem",color:"#15803d",fontWeight:500}}>
                ✓ No gap between education and first job.
              </div>
            )}
          </div>

          <div className="sbar">
            <button className="sbtn" onClick={handlePrevious}>← Previous</button>
            <span className={`ss${saveStatus==="Saved ✓"?" ok":saveStatus.startsWith("Error")||saveStatus.includes("required")?" err":""}`}>{saveStatus}</span>
            <div style={{display:"flex",gap:"0.65rem",alignItems:"center"}}>
              <button className="sbtn" onClick={handleMidSave} style={{fontSize:"0.8rem"}}>{midSaveStatus||"Save draft"}</button>
              <button className="pbtn" onClick={handleSave} disabled={activeUploads>0} title={activeUploads>0?"Please wait for the upload to finish before saving":""}>{activeUploads>0?"Uploading…":"Save & Continue →"}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
