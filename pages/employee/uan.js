// pages/employee/uan.js  — Page 4 of 5
// Fixes:
// 1. DateField — no calendar, DD/MM/YYYY, shows month name
// 2. Signature persists across normal revisits — shown as a static image (no canvas/CORS
//    dependency), never blank on return visits.
// 3. Editing ANY field on this page (UAN details, PF records, nominees) after signing forces
//    the canvas back open and resets all 3 declaration checkboxes — re-signing is mandatory,
//    not optional, and "Save & Continue" is blocked until both are redone.
// 4. Every signature that gets replaced is archived (signatureHistory, unique S3 key per
//    signing) rather than silently overwritten — see chat for the retention rationale.
// 5. page4_edited flag saved to DB → page 5 knows to re-ask review acks
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";
import FileUpload from "../../components/FileUpload";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const ACCENTS    = { 1:"#0d6e6e", 2:"#d97706", 3:"#7c3aed", 4:"#0891b2", 5:"#16a34a" };
const STEP_DONE_BG = "#0a4a4a";
const STEP_DONE_CK = "#5eead4";
const STEP_CONN    = "#0d6e6e";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function isoToDisplay(iso) {
  if (!iso || !iso.includes("-")) return iso || "";
  const [y, mo, d] = iso.split("-");
  const idx = parseInt(mo, 10) - 1;
  const mName = MONTH_NAMES[idx] || mo;
  return `${parseInt(d,10)} ${mName} ${y}`;
}

// Nominee DOB is stored as dd-mm-yyyy (not ISO), convert to "20 June 1998"
function ddmmyyyyToDisplay(val) {
  if (!val || val.length !== 10) return val || "";
  const parts = val.split("-");
  if (parts.length !== 3) return val;
  const [dd, mm, yyyy] = parts;
  const idx = parseInt(mm, 10) - 1;
  const mName = MONTH_NAMES[idx];
  if (!mName) return val;
  return `${parseInt(dd, 10)} ${mName} ${yyyy}`;
}

// Accepts either dd-mm-yyyy (NomineeDobField) or yyyy-mm-dd (ISO, e.g. draft.fatherDob) and
// returns a Date, or null if unparseable/invalid/in the future.
function parseAnyDob(val) {
  if (!val) return null;
  const parts = val.split("-");
  if (parts.length !== 3) return null;
  let d, m, y;
  if (parts[0].length === 4) { [y, m, d] = parts; }      // yyyy-mm-dd
  else { [d, m, y] = parts; }                             // dd-mm-yyyy
  d = parseInt(d, 10); m = parseInt(m, 10); y = parseInt(y, 10);
  if (!d || !m || !y || y.toString().length !== 4) return null;
  const dob = new Date(y, m - 1, d);
  if (dob.getFullYear() !== y || dob.getMonth() !== m - 1 || dob.getDate() !== d) return null; // rejects invalid dates like 31-02
  if (dob > new Date()) return null;
  return dob;
}

// Completed age as of today — counted from the exact date, not just calendar-year subtraction,
// so a child born 11 months ago correctly shows "11 months" rather than rounding to a year either way.
function calcAge(dobVal) {
  const dob = parseAnyDob(dobVal);
  if (!dob) return null;
  const today = new Date();
  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  let days = today.getDate() - dob.getDate();
  if (days < 0) { months -= 1; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
  if (months < 0) { years -= 1; months += 12; }
  const totalDays = Math.floor((today - dob) / 86400000);
  return { years, months, days, totalDays };
}

function formatAge(a) {
  if (!a) return "";
  if (a.years >= 1) return `${a.years} yr${a.years !== 1 ? "s" : ""} old`;
  if (a.months >= 1) return `${a.months} month${a.months !== 1 ? "s" : ""} old`;
  return `${a.totalDays} day${a.totalDays !== 1 ? "s" : ""} old`;
}

const makePfRecord = (companyName = "") => ({
  companyName, hasPf:"", pfType:"", pfMemberId:"", dojEpfo:"", doeEpfo:"", pfTransferred:"",
});

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
  .bell-btn { position: relative; width: 36px; height: 36px; border-radius: 9px;
    border: 1.5px solid #2a2535; background: transparent; cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: 1rem; transition: all 0.2s; }
  .bell-btn:hover { border-color: #0d6e6e; background: rgba(167,139,250,0.1); }
  .bell-badge { position: absolute; top: -5px; right: -5px; background: #ef4444; color: #fff;
    border-radius: 999px; font-size: 0.6rem; font-weight: 800; min-width: 16px; height: 16px;
    display: flex; align-items: center; justify-content: center; padding: 0 3px; border: 2px solid #18151f; }
  .sc { background: #ffffff; border-radius: 16px; padding: 1.5rem 1.6rem;
    margin-bottom: 1.1rem; box-shadow: 0 6px 28px rgba(30,26,62,0.22), 0 2px 8px rgba(30,26,62,0.12);
    border: 1px solid rgba(255,255,255,0.85); position: relative; overflow: hidden; }
  .sc::before { content:''; position:absolute; top:0; left:0; bottom:0; width:4px; border-radius:16px 0 0 16px; }
  .sc.cyn::before { background:#0891b2; }
  .sc.grn::before { background:#16a34a; }
  .sc.vio::before { background:#7c3aed; }
  .sh { display:flex; align-items:center; gap:0.6rem; margin-bottom:1.15rem; }
  .si { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:0.95rem; flex-shrink:0; }
  .si.cyn{background:#ecfeff;} .si.grn{background:#f0fdf4;} .si.vio{background:#f5f3ff;}
  .st { font-size:0.93rem; font-weight:700; color:#1e293b; }
  .fr { display:flex; gap:0.9rem; flex-wrap:wrap; margin-bottom:0.85rem; }
  .fr:last-child { margin-bottom:0; }
  .fi { display:flex; flex-direction:column; gap:0.28rem; flex:1; min-width:138px; }
  .fl { font-size:0.7rem; font-weight:700; color:#8b88b0; letter-spacing:0.55px; text-transform:uppercase; }
  .in { padding:0.65rem 0.875rem; background:#f0ece6; border:1.5px solid #d8d4e3;
    border-radius:9px; font-family:inherit; font-size:0.875rem; color:#1e293b;
    outline:none; width:100%; transition:all 0.18s; }
  .in:focus { border-color:#0891b2; background:#fff; box-shadow:0 0 0 3px rgba(8,145,178,0.13); }
  .in:disabled { background:#ece9f5; color:#a0aec0; cursor:not-allowed; }
  .in.err { border-color:#ef4444 !important; background:#fff8f8 !important; }
  .err-msg { font-size:0.68rem; color:#ef4444; font-weight:600; margin-top:0.2rem; display:block; }
  .date-input { padding:0.65rem 0.875rem; background:#f0ece6; border:1.5px solid #d8d4e3;
    border-radius:9px; font-family:inherit; font-size:0.875rem; color:#1e293b;
    outline:none; width:100%; transition:all 0.18s; }
  .date-input:focus { border-color:#0891b2; background:#fff; box-shadow:0 0 0 3px rgba(8,145,178,0.13); }
  .date-input::placeholder { color:#d8d4e3; }
  .date-input.err { border-color:#ef4444 !important; background:#fff8f8 !important; }
  .date-display { margin-top:0.22rem; font-size:0.72rem; color:#0891b2; font-weight:600; }
  .yn-row { display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap; margin-bottom:0.75rem; }
  .yn-lbl { font-size:0.875rem; color:#1e293b; font-weight:600; }
  .yn-btn { padding:0.32rem 1.1rem; border-radius:999px; font-family:inherit; font-size:0.82rem; font-weight:700; cursor:pointer; transition:all 0.18s; border:none; }
  .pf-row { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:0.7rem; margin-top:0.65rem; }
  .pf-kv { display:flex; flex-direction:column; gap:0.15rem; }
  .pf-key { font-size:0.67rem; font-weight:700; color:#8b88b0; text-transform:uppercase; letter-spacing:0.5px; }
  .pf-val { font-size:0.84rem; font-weight:600; color:#0f172a; }
  .pf-block { background:#f8f7ff; border:1px solid #e4e2f0; border-radius:12px; padding:1.1rem 1.2rem; margin-bottom:0.85rem; }
  .pf-block-hdr { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.85rem; gap:0.5rem; }
  .pf-block-title { font-size:0.72rem; font-weight:800; color:#7c3aed; text-transform:uppercase; letter-spacing:0.6px; }
  .pf-block-badge { font-size:0.68rem; font-weight:600; color:#6b6894; background:#ede9fe; padding:0.18rem 0.6rem; border-radius:999px; white-space:nowrap; }
  .add-btn { padding:0.55rem 1.3rem; background:#eef2ff; color:#0d6e6e; border:1.5px solid #c7d2fe;
    border-radius:10px; font-family:inherit; font-size:0.875rem; font-weight:700; cursor:pointer; }
  .rm-btn { padding:0.28rem 0.7rem; background:#fff5f5; color:#ef4444; border:1.5px solid #fecaca;
    border-radius:7px; font-size:0.75rem; font-weight:600; cursor:pointer; font-family:inherit; }
  .sbar { display:flex; justify-content:space-between; align-items:center;
    margin-top:1.5rem; padding:1rem 1.5rem; background:#111;
    border-radius:12px; box-shadow:0 6px 28px rgba(30,26,62,0.22); border:1px solid rgba(255,255,255,0.1); }
  .ss { font-size:0.84rem; color:#8b92a8; font-weight:500; }
  .ss.ok { color:#4ade80; } .ss.err { color:#f87171; }
  .pbtn { padding:0.72rem 1.9rem; background:#0891b2; color:#fff; border:none;
    border-radius:10px; font-family:inherit; font-size:0.875rem; font-weight:700;
    cursor:pointer; transition:all 0.2s; box-shadow:0 4px 14px rgba(8,145,178,0.28); }
  .pbtn:hover { background:#0e7490; transform:translateY(-1px); }
  .sbtn { padding:0.72rem 1.5rem; background:transparent; color:#8b92a8;
    border:1.5px solid #2a2535; border-radius:10px; font-family:inherit;
    font-size:0.875rem; font-weight:600; cursor:pointer; transition:all 0.2s; }
  .sbtn:hover { color:#0d6e6e; border-color:#0d6e6e; }
  .nom-block { background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 12px; padding: 1.1rem 1.2rem; margin-bottom: 0.85rem; }
  .sig-canvas { border: 1.5px solid #d8d4e3; border-radius: 9px; background: #fff; cursor: crosshair; display: block; touch-action: none; }
  .sig-canvas.signed { border-color: #16a34a; background: #f0fdf4; }
  @media(max-width:640px){
    .fr{flex-direction:column;} .fi{min-width:100%;}
    .topbar{flex-direction:column;gap:0.6rem;align-items:flex-start;position:relative;}
  }
`;

function ConsentBell({ apiFetch, router }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const load = async () => {
      try { const res = await apiFetch(`${API}/consent/my`); if(res.ok){const data=await res.json();setCount(data.filter(c=>String(c.status||"pending").toLowerCase()==="pending").length);} } catch(_) {}
    };
    load(); const id=setInterval(load,15000); return ()=>clearInterval(id);
  }, [apiFetch]);
  return (<button className="bell-btn" onClick={()=>router.push("/employee/personal?tab=consents")} title="Consent Requests">🔔{count>0&&<span className="bell-badge">{count}</span>}</button>);
}

function SignoutModal({ onConfirm, onCancel }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,12,40,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(3px)"}}>
      <div style={{background:"#fff",borderRadius:18,padding:"2rem",maxWidth:340,width:"90%",textAlign:"center",boxShadow:"0 24px 60px rgba(15,12,40,0.3)"}}>
        <div style={{fontSize:34,marginBottom:"0.75rem"}}>👋</div>
        <h3 style={{margin:"0 0 0.4rem",color:"#1a1730",fontWeight:800,fontSize:"1.05rem"}}>Sign out?</h3>
        <p style={{color:"#6b6894",fontSize:"0.875rem",marginBottom:"1.5rem",lineHeight:1.55}}>Your progress is saved. You can continue anytime.</p>
        <div style={{display:"flex",gap:"0.75rem"}}>
          <button onClick={onCancel} style={{flex:1,padding:"0.7rem",borderRadius:9,border:"1.5px solid #dddaf0",background:"inherit",cursor:"pointer",fontWeight:600,color:"#6b6894",fontFamily:"inherit",fontSize:"0.875rem"}}>Stay</button>
          <button onClick={onConfirm} style={{flex:1,padding:"0.7rem",borderRadius:9,border:"none",background:"#ef4444",color:"#fff",cursor:"pointer",fontWeight:700,fontFamily:"inherit",fontSize:"0.875rem"}}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

function StepNav({ current, onNavigate }) {
  const steps = [
    { n:1, label:"Personal",   icon:"👤", path:"/employee/personal"  },
    { n:2, label:"Education",  icon:"🎓", path:"/employee/education" },
    { n:3, label:"Employment", icon:"💼", path:"/employee/previous"  },
    { n:4, label:"UAN",        icon:"🏦", path:"/employee/uan"       },
    { n:5, label:"Review",     icon:"📋", path:"/employee/review"    },
  ];
  return (
    <div style={{background:"#fff",borderRadius:14,padding:"1.1rem 0.5rem",marginBottom:"1.6rem",display:"flex",alignItems:"center",justifyContent:"center",overflowX:"auto",boxShadow:"0 6px 28px rgba(30,26,62,0.22), 0 2px 8px rgba(30,26,62,0.12)"}}>
      {steps.map((s,i)=>{
        const isDone=current>s.n, isActive=current===s.n, col=ACCENTS[s.n];
        return(
          <div key={s.n} style={{display:"flex",alignItems:"center"}}>
            <button onClick={()=>onNavigate(s.path)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.3rem",background:"none",border:"none",cursor:"pointer",padding:"0.2rem 0.75rem"}}>
              <div style={{width:40,height:40,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",transition:"all 0.25s",
                background:isActive?col:isDone?STEP_DONE_BG:"#f2f1f9",
                border:isActive?`2px solid ${col}`:isDone?`2px solid ${STEP_CONN}`:"2px solid #e4e2ed",
                boxShadow:isActive?`0 4px 12px ${col}55`:"none"}}>
                {isDone?<span style={{color:STEP_DONE_CK,fontWeight:800,fontSize:"0.9rem"}}>✓</span>
                  :<span style={{fontSize:"1rem",filter:isActive?"brightness(0) invert(1)":"none"}}>{s.icon}</span>}
              </div>
              <span style={{fontSize:"0.67rem",fontWeight:700,letterSpacing:"0.6px",textTransform:"uppercase",whiteSpace:"nowrap",
                color:isActive?col:isDone?STEP_DONE_CK:"#8b88b0"}}>{s.label}</span>
            </button>
            {i<steps.length-1&&<div style={{width:38,height:2,background:current>s.n?STEP_CONN:"#ccc9e4",margin:"0 -0.25rem",marginBottom:"1.4rem",borderRadius:2,flexShrink:0}}/>}
          </div>
        );
      })}
    </div>
  );
}

// ── DateField: no calendar, DD/MM/YYYY with month name display ──
function F({ l, v, s, t="text", r=true, disabled=false, mx, errKey, errors, onFix }) {
  const hasErr = errKey && errors && errors[errKey];
  // Date type override — always use text for date fields
  const inputType = t === "date" ? "text" : t;
  return (
    <div className="fi">
      <span className="fl">{l}{r&&<span style={{color:"#ef4444",marginLeft:2}}>*</span>}</span>
      <input
        className={`in${hasErr?" err":""}`}
        type={inputType} value={v||""} disabled={disabled} maxLength={mx||undefined}
        onChange={e=>{s&&s(e.target.value);if(onFix&&hasErr)onFix(errKey);}}
        placeholder={t==="date"?"DD/MM/YYYY":undefined}
        style={{colorScheme:"light"}}
      />
      {hasErr&&<span className="err-msg">Required</span>}
    </div>
  );
}

// Date field specifically for PF dates (stored as YYYY-MM-DD, shown as month name)
function FDate({ l, v, s, r=true, errKey, errors, onFix }) {
  const [raw, setRaw] = useState(()=>{
    if(v&&v.includes("-")){const[y,mo,d]=v.split("-");return `${d}/${mo}/${y}`;}
    return v||"";
  });
  const [focused, setFocused] = useState(false);
  useEffect(()=>{
    if(!focused){
      if(v&&v.includes("-")){const[y,mo,d]=v.split("-");setRaw(`${d}/${mo}/${y}`);}
      else setRaw(v||"");
    }
  },[v,focused]);
  const hasErr = errKey && errors && errors[errKey];
  const handleChange=(e)=>{
    let val=e.target.value.replace(/[^0-9/]/g,"");
    if(val.length===2&&raw.length===1)val=val+"/";
    if(val.length===5&&raw.length===4)val=val+"/";
    if(val.length>10)return;
    setRaw(val);
    if(val.length===10){
      const[d,mo,y]=val.split("/");
      const day=parseInt(d,10),month=parseInt(mo,10);
      if(d&&mo&&y&&y.length===4&&month>=1&&month<=12&&day>=1&&day<=31){
        s(`${y}-${mo.padStart(2,"0")}-${d.padStart(2,"0")}`);
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
  return (
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

// Small inline age readout next to a DOB — computed, never manually entered.
// Flags newborns under 90 days since that's the one cutoff that genuinely varies
// by insurer (Day 1 add-on vs. standard 90-day vs. some policies requiring 1 year).
function AgeTag({ dob }) {
  const age = calcAge(dob);
  if (!age) return null;
  return (
    <span style={{fontSize:"0.72rem",color:"#6b6894",fontWeight:600,marginLeft:8}}>
      ({formatAge(age)})
      {age.totalDays < 90 && <span style={{color:"#d97706"}}> · newborn — confirm Day-1/90-day cover with your insurer</span>}
    </span>
  );
}

// Nominee DOB field — stores dd-mm-yyyy, shows "20 June 1998" when blurred
function NomineeDobField({ value, onChange }) {
  const [focused, setFocused] = useState(false);
  const [raw, setRaw] = useState(value || "");

  useEffect(() => {
    if (!focused) setRaw(value || "");
  }, [value, focused]);

  const handleChange = (e) => {
    let v = e.target.value.replace(/[^\d]/g, "");
    if (v.length > 2) v = v.slice(0, 2) + "-" + v.slice(2);
    if (v.length > 5) v = v.slice(0, 5) + "-" + v.slice(5);
    v = v.slice(0, 10);
    setRaw(v);
    onChange(v);
  };

  const displayVal = focused ? raw : (raw.length === 10 ? ddmmyyyyToDisplay(raw) : raw);

  return (
    <input
      className="in"
      type="text"
      value={displayVal}
      placeholder="dd-mm-yyyy"
      maxLength={focused ? 10 : 20}
      onFocus={() => { setFocused(true); setRaw(value || ""); }}
      onBlur={() => setFocused(false)}
      onChange={handleChange}
      inputMode="numeric"
      autoComplete="off"
    />
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
                      <div key={i} style={{background:"#f0fdf4",borderRadius:8,padding:"0.6rem 0.75rem",marginBottom:"0.5rem"}}>
                        <div style={{fontSize:"0.65rem",fontWeight:700,color:"#16a34a",marginBottom:"0.25rem"}}>Datagate Support — {new Date(r.at).toLocaleString("en-IN",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
                        <div style={{fontSize:"0.8rem",color:"#1a1730",whiteSpace:"pre-wrap"}}>{r.body}</div>
                        {r.attachment_url && <a href={r.attachment_url} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",marginTop:"0.4rem",fontSize:"0.72rem",color:"#16a34a",fontWeight:700,textDecoration:"none"}}>📎 View attachment</a>}
                      </div>
                    ))}
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

export default function UanDetails() {
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

  const [showSignout, setShowSignout] = useState(false);
  const [saveStatus,  setSaveStatus]  = useState("");
  const [loading,     setLoading]     = useState(true);
  const [draft,       setDraft]       = useState(null);
  const isDirtyRef = useRef(false);
  // Track whether user edited AFTER page was loaded (triggers ack reset)
  const wasEditedAfterLoad = useRef(false);

  // ── UAN fields ──
  const [hasUan,       setHasUan]       = useState("");
  const [activeUploads, setActiveUploads] = useState(0);
  const handleUploadState = useCallback((active) => setActiveUploads(c => Math.max(0, c + (active ? 1 : -1))), []);
  const [uanNumber,    setUanNumber]    = useState("");
  const [nameAsPerUan, setNameAsPerUan] = useState("");
  const [mobileLinked, setMobileLinked] = useState("");
  const [isActive,     setIsActive]     = useState("");
  const [epfoKey,      setEpfoKey]      = useState("");
  const [serviceHistoryKey, setServiceHistoryKey] = useState("");
  const [pfRecords,   setPfRecords]   = useState([makePfRecord()]);
  const [epfoFetched, setEpfoFetched] = useState([]);
  const [page3Companies, setPage3Companies] = useState([]);

  // ── Nominees ──
  const makeNominee = () => ({ name:"", dob:"", relation:"", address:"", share:"", guardianName:"", guardianAddress:"", _k:`nom-${Date.now()}-${Math.random().toString(36).slice(2,7)}` });
  const [nominees, setNominees] = useState([makeNominee()]);

  // ── Family Details (for company health insurance — Medibuddy/Acko-style enrollment) ──
  // All optional — this section is informational for insurance enrollment, never blocks Save/Sign.
  // Marital Status is NOT re-asked here — it's already collected (and required) on Personal Details;
  // we just read draft.maritalStatus to decide whether to show Spouse fields.
  // Spouse name/DOB now live on Personal Details (added there so it's asked once, in the
  // natural place, right when Marital Status is set) — read via draft.spouseName/spouseDob below.
  const [hasChildren, setHasChildren] = useState("");
  const makeChild = () => ({ name:"", dob:"", gender:"", _k:`child-${Date.now()}-${Math.random().toString(36).slice(2,7)}` });
  const [children, setChildren] = useState([makeChild()]);
  // Insurers cover ONE side of parents only — either the employee's own parents or the
  // spouse's parents (in-laws), never one from each side. This toggle enforces that.
  const [parentsCoverage, setParentsCoverage] = useState(""); // "My Parents" | "Spouse's Parents" | "Not Applicable"
  // If a parent has passed away, exclude them from insurance coverage here — this is local to
  // this health-insurance section, not a fact recorded on Personal Details.
  const [excludeFather, setExcludeFather] = useState(false);
  const [excludeMother, setExcludeMother] = useState(false);
  const [fatherName, setFatherName] = useState("");
  const [fatherDob, setFatherDob] = useState("");
  const [motherName, setMotherName] = useState("");
  const [motherDob, setMotherDob] = useState("");

  // ── Declarations ──
  const [pfNomAck, setPfNomAck] = useState(false);
  const [pensionNomAck, setPensionNomAck] = useState(false);
  const [epfoDecl, setEpfoDecl] = useState(false);

  // ── Signature ──
  // sigDataUrl: either a local data: URI (just drawn this session) or a fetched S3 preview URL
  // sigS3Key: the actual stored S3 key — this is what gets saved to DB
  // sigTimestamp: when signed
  const [sigDataUrl, setSigDataUrl] = useState("");
  const [sigTimestamp, setSigTimestamp] = useState("");
  const [sigS3Key, setSigS3Key] = useState("");
  // editedAfterSign: user changed something AFTER signing — must re-confirm acks but signature stays
  const [editedAfterSign, setEditedAfterSign] = useState(false);
  // signingMode: true = show blank canvas to draw a NEW signature. false = show the saved one as a static image.
  // Defaults to false; first-time users fall into draw mode automatically because hasSavedSignature is false.
  const [signingMode, setSigningMode] = useState(false);
  const [sigPreviewFailed, setSigPreviewFailed] = useState(false);
  // Archive of every signature this page has ever produced — old ones are never deleted or
  // silently overwritten, only versioned, so there's a defensible record of what was signed
  // and when if a nominee/PF detail is ever disputed later.
  const [signatureHistory, setSignatureHistory] = useState([]);
  const sigCanvasRef = useRef(null);
  const sigDrawingRef = useRef(false);
  const sigLastRef = useRef({x:0, y:0});
  const sigHasStrokeRef = useRef(false);
  const [sigEmptyWarn, setSigEmptyWarn] = useState(false);
  const wasSignedRef = useRef(false);

  const hasSavedSignature = !!(sigS3Key || sigDataUrl);
  // editedAfterSign forces the canvas back open — re-signing is mandatory after an edit,
  // not an optional "re-sign if you want to" action.
  const showSigCanvas = signingMode || !hasSavedSignature || editedAfterSign;

  // Canvas pixels default to transparent, and JPEG has no alpha channel — toDataURL("image/jpeg")
  // flattens any transparent pixel to black. Fill the canvas white the instant draw mode opens
  // (first-time signing, or after clicking "Re-sign") so the exported signature is never black.
  useEffect(() => {
    if (showSigCanvas && sigCanvasRef.current) {
      const ctx = sigCanvasRef.current.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, sigCanvasRef.current.width, sigCanvasRef.current.height);
      ctx.fillStyle = "#ffffff";
      sigHasStrokeRef.current = false;
      setSigEmptyWarn(false);
    }
  }, [showSigCanvas, loading]);

  // ── dirty setter — marks edited, resets acks but NOT signature ──
  const dirty = (setter) => (val) => {
    setter(val);
    isDirtyRef.current = true;
    wasEditedAfterLoad.current = true;
    if (wasSignedRef.current) {
      setEditedAfterSign(true);
      // Reset acks so user must re-confirm — but DO NOT touch signature
      setPfNomAck(false);
      setPensionNomAck(false);
      setEpfoDecl(false);
    }
  };

  // ── Soft flag used by nominee + PF record edits ──
  // Same behavior as dirty(): resets the 3 acks if already signed, but NEVER touches
  // the saved signature itself. Replaces the old clearSigOnNomineeEdit() which used to
  // wipe the signature on every nominee/PF keystroke — that contradicted the documented
  // design above and forced people to re-sign for unrelated edits.
  const flagPostSignEdit = () => {
    isDirtyRef.current = true;
    wasEditedAfterLoad.current = true;
    if (wasSignedRef.current) {
      setEditedAfterSign(true);
      setPfNomAck(false);
      setPensionNomAck(false);
      setEpfoDecl(false);
    }
  };

  // Role guard
  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/employee/login"); return; }
    if (user.role !== "employee") { router.replace("/employee/login"); return; }
  }, [ready, user, router]);

  // Load draft + employment history
  useEffect(() => {
    if (!ready || !user) return;
    const fetchData = async () => {
      try {
        const draftRes = await apiFetch(`${API}/employee/draft`);
        if (draftRes.ok) {
          const d = await draftRes.json();
          setDraft(d);

          if (d.hasUan !== undefined && d.hasUan !== null) {
            setHasUan(d.hasUan === true || d.hasUan === "yes" ? "yes" : "no");
          } else if (d.uanNumber) {
            setHasUan("yes");
          }
          if (d.uanNumber)    setUanNumber(d.uanNumber);
          if (d.nameAsPerUan) setNameAsPerUan(d.nameAsPerUan);
          if (d.mobileLinked) setMobileLinked(d.mobileLinked);
          if (d.isActive)     setIsActive(d.isActive);
          if (d.epfoKey)           setEpfoKey(d.epfoKey);
          if (d.serviceHistoryKey) setServiceHistoryKey(d.serviceHistoryKey);
          if (Array.isArray(d.epfoFetched) && d.epfoFetched.length > 0) setEpfoFetched(d.epfoFetched);
          if (Array.isArray(d.epfoNominees) && d.epfoNominees.length > 0) setNominees(d.epfoNominees.map((n,i)=>({...n,_k:n._k||`nom-restored-${i}-${Date.now()}`})));
          if (d.familyDetails) {
            const fam = d.familyDetails;
            // spouseName/spouseDob no longer restored here — read live from draft.spouseName/spouseDob
            if (fam.hasChildren)   setHasChildren(fam.hasChildren);
            if (Array.isArray(fam.children) && fam.children.length > 0) setChildren(fam.children.map((c,i)=>({...c,_k:c._k||`child-restored-${i}-${Date.now()}`})));
            if (fam.parentsCoverage) setParentsCoverage(fam.parentsCoverage);
            if (fam.excludeFather) setExcludeFather(true);
            if (fam.excludeMother) setExcludeMother(true);
            if (fam.fatherName)    setFatherName(fam.fatherName);
            if (fam.fatherDob)     setFatherDob(fam.fatherDob);
            if (fam.motherName)    setMotherName(fam.motherName);
            if (fam.motherDob)     setMotherDob(fam.motherDob);
          }
          if (d.epfoDeclarations) {
            if (d.epfoDeclarations.pfNomAck)     setPfNomAck(d.epfoDeclarations.pfNomAck);
            if (d.epfoDeclarations.pensionNomAck) setPensionNomAck(d.epfoDeclarations.pensionNomAck);
            if (d.epfoDeclarations.epfoDecl)     setEpfoDecl(d.epfoDeclarations.epfoDecl);
          }

          // ── Restore signature ──
          // Priority: s3Key (fetch signed URL for preview) > legacy dataUrl
          // Kick off employment-history fetch now, in the background — it only needs
          // d.employee_id (already available) and has nothing to do with the signature
          // logic below. Previously this didn't even start until after the signature
          // fetch fully completed, needlessly doubling wait time on every page load.
          const histPromise = d.employee_id
            ? apiFetch(`${API}/employee/employment-history/${d.employee_id}`).catch(() => null)
            : Promise.resolve(null);

          if (d.epfoSignature?.s3Key) {
            setSigS3Key(d.epfoSignature.s3Key);
            wasSignedRef.current = true;
            // Fetch signed URL for static preview — displayed as a plain <img>, never
            // drawn onto a canvas, so there is no CORS/crossOrigin requirement at all.
            try {
              const docRes = await apiFetch(`${API}/documents/${d.employee_id}`);
              if (docRes.ok) {
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
                const sigUrl = urls[d.epfoSignature.s3Key];
                if (sigUrl) setSigDataUrl(sigUrl);
              }
            } catch(_) {}
          } else if (d.epfoSignature?.dataUrl) {
            // Legacy: base64 stored directly
            setSigDataUrl(d.epfoSignature.dataUrl);
            wasSignedRef.current = true;
          }
          if (d.epfoSignature?.timestamp) setSigTimestamp(d.epfoSignature.timestamp);
          if (Array.isArray(d.signatureHistory)) setSignatureHistory(d.signatureHistory);

          // Load employment history for PF pre-fill — this was already kicked off
          // above, in parallel with the signature fetch; just await it here now.
          if (d.employee_id) {
            try {
              const histRes = await histPromise;
              if (histRes && histRes.ok) {
                const hist = await histRes.json();
                const emps = Array.isArray(hist.employments) ? hist.employments : [];
                const lastEmpIdx = emps.length - 1;
                const companies = emps.map((e, idx) => {
                      const isCurrentlyWorking = e.currentlyWorking === "Yes";
                      const hasEndDate = !!e.endDate;
                      // isCurrent = last entry, marked currently working, no end date
                      const isCurrent = idx === lastEmpIdx && isCurrentlyWorking && !hasEndDate;
                      return {
                        name: e.companyName || "",
                        label: isCurrent
                          ? (e.companyName ? `${e.companyName} (Current)` : "Current Employer")
                          : (e.companyName ? `${e.companyName}` : `Employer ${idx + 1}`),
                        isCurrent,
                        currentlyWorking: e.currentlyWorking || "",
                        endDate: e.endDate || "",
                      };
                    });
                setPage3Companies(companies);
                const savedPf = Array.isArray(d.pfRecords) ? d.pfRecords : [];
                if (savedPf.length > 0 && savedPf.length === companies.length) {
                  setPfRecords(savedPf.map((r, idx) => ({
                    ...r,
                    companyName: companies[idx]?.name || r.companyName || "",
                    hasPf: r.hasPf || "",
                    pfType: r.pfType || "",
                    pfMemberId: r.pfMemberId || "",
                    dojEpfo: r.dojEpfo || "",
                    doeEpfo: r.doeEpfo || "",
                    pfTransferred: r.pfTransferred || "",
                    isCurrent: companies[idx]?.isCurrent ?? (idx === companies.length - 1),
                  })));
                } else if (companies.length > 0) {
                  setPfRecords(companies.map((c) => {
                    const saved = savedPf.find(r => r.companyName === c.name);
                    return saved
                      ? { ...saved, companyName: c.name, isCurrent: c.isCurrent }
                      : { ...makePfRecord(c.name), isCurrent: c.isCurrent };
                  }));
                }
              }
            } catch(_) {}
          } else {
            if (Array.isArray(d.pfRecords) && d.pfRecords.length > 0) {
              setPfRecords(d.pfRecords.map((r, idx) => ({ companyName:r.companyName||"", hasPf:r.hasPf||"", pfType:r.pfType||"", pfMemberId:r.pfMemberId||"", dojEpfo:r.dojEpfo||"", doeEpfo:r.doeEpfo||"", pfTransferred:r.pfTransferred||"", isCurrent: idx === arr.length - 1 })));
            }
          }
        }
      } catch (_) {}
      setLoading(false);
    };
    fetchData();
  }, [ready, user, apiFetch]);

  const updatePf = (i, field, value) => {
    setPfRecords(prev => prev.map((r, idx) => idx === i ? {...r, [field]: value} : r));
    flagPostSignEdit();
  };

  // Upload canvas blob to S3 — filename includes the signing timestamp so each signature
  // lands at its own S3 key rather than overwriting the previous one in place.
  const uploadSignature = async (dataUrl, ts) => {
    if (!draft?.employee_id) return null;
    try {
      const res2 = await fetch(dataUrl);
      const blob = await res2.blob();
      const safeTs = (ts || new Date().toISOString()).replace(/[:.]/g, "-");
      const presignRes = await apiFetch(`${API}/upload/presigned`, {
        method: "POST",
        body: JSON.stringify({ category:"uan", sub_key:"signature", filename:"signature.jpg", employee_id:draft.employee_id }),
      });
      if (!presignRes.ok) return null;
      const { upload_url, s3_key } = await presignRes.json();
      const uploadRes = await fetch(upload_url, { method:"PUT", body:blob, headers:{"Content-Type":"image/jpeg"} });
      if (!uploadRes.ok) return null;
      return s3_key;
    } catch (_) { return null; }
  };

  // Shared finish-drawing handler for both mouse and touch
  const finishSignature = async () => {
    sigDrawingRef.current = false;
    if (!sigCanvasRef.current) return;
    if (!sigHasStrokeRef.current) { setSigEmptyWarn(true); return; }
    const dataUrl = sigCanvasRef.current.toDataURL("image/jpeg", 0.3);
    // Archive the signature being replaced — never silently discarded, only versioned.
    if (sigS3Key && sigTimestamp) {
      setSignatureHistory(prev => [...prev, { s3Key: sigS3Key, timestamp: sigTimestamp }]);
    }
    setSigDataUrl(dataUrl);
    setSigPreviewFailed(false);
    const ts = new Date().toISOString();
    setSigTimestamp(ts);
    isDirtyRef.current = true; wasSignedRef.current = true; setEditedAfterSign(false);
    setSigningMode(false); // flip back to "view" mode showing the freshly drawn (local, CORS-free) image
    const key = await uploadSignature(dataUrl, ts);
    if (key) setSigS3Key(key);
  };

  const saveDraft = async () => {
    if (!draft?.employee_id) throw new Error("Please complete and save Page 1 first");
    const freshRes = await apiFetch(`${API}/employee/draft`);
    const freshDraft = freshRes.ok ? await freshRes.json() : draft;
    const payload = {
      ...freshDraft,
      hasUan,
      uanNumber:    hasUan === "yes" ? uanNumber    : "",
      nameAsPerUan: hasUan === "yes" ? nameAsPerUan : "",
      mobileLinked: hasUan === "yes" ? mobileLinked : "",
      isActive:     hasUan === "yes" ? isActive     : "",
      epfoKey:      hasUan === "yes" ? epfoKey      : "",
      pfRecords:    hasUan === "yes" ? pfRecords    : [],
      serviceHistoryKey,
      epfoNominees: nominees,
      familyDetails: {
        spouseName:  draft?.maritalStatus === "Married" ? (draft?.spouseName || "") : "",
        spouseDob:   draft?.maritalStatus === "Married" ? (draft?.spouseDob  || "") : "",
        hasChildren,
        children:    hasChildren === "Yes" ? children : [],
        parentsCoverage,
        excludeFather: parentsCoverage === "My Parents" ? excludeFather : false,
        excludeMother: parentsCoverage === "My Parents" ? excludeMother : false,
        fatherName:  parentsCoverage === "My Parents" ? (excludeFather ? "" : draft?.fatherName || "") : parentsCoverage === "Spouse's Parents" ? fatherName : "",
        fatherDob:   parentsCoverage === "My Parents" ? (excludeFather ? "" : draft?.fatherDob  || "") : parentsCoverage === "Spouse's Parents" ? fatherDob  : "",
        motherName:  parentsCoverage === "My Parents" ? (excludeMother ? "" : draft?.motherName || "") : parentsCoverage === "Spouse's Parents" ? motherName : "",
        motherDob:   parentsCoverage === "My Parents" ? (excludeMother ? "" : draft?.motherDob  || "") : parentsCoverage === "Spouse's Parents" ? motherDob  : "",
      },
      epfoSignature: {
        s3Key: sigS3Key,
        timestamp: sigTimestamp,
      },
      signatureHistory,
      epfoDeclarations: { pfNomAck, pensionNomAck, epfoDecl },
      last_saved_at: Date.now(),
      // ── Cascade flag: page 4 was edited → page 5 must re-ask review acks
      page4_edited: wasEditedAfterLoad.current ? true : (freshDraft.page4_edited || false),
      ...(wasEditedAfterLoad.current ? { acknowledgements_review: {} } : {}),
    };
    const res = await apiFetch(`${API}/employee`, { method:"POST", body:JSON.stringify(payload) });
    if (!res.ok) throw new Error(parseError(await res.json().catch(() => ({}))));
    isDirtyRef.current = false;
  };

  const handleNavigate = async (path) => {
    const wasDirty = isDirtyRef.current;
    if (wasDirty) { try { await saveDraft(); } catch(_) {} }
    const dest = (path === "/employee/review" && wasDirty) ? "/employee/review?edited=1" : path;
    router.push(dest);
  };
  const handleSignout = async () => {
    if (isDirtyRef.current) {
      try {
        await saveDraft();
      } catch (e) {
        alert("Your changes could not be saved. Please check your connection and try again before signing out — signing out now would lose them.");
        return;
      }
    }
    logout();
  };
  const handleSaveSignout = async () => {
    try {
      await saveDraft();
      logout();
    } catch (e) {
      alert("Your changes could not be saved. Please check your connection and try again before signing out — signing out now would lose them.");
    }
  };
  const handleMidSave = async () => {
    setSaveStatus("Saving…");
    try { await saveDraft(); setSaveStatus("Saved ✓"); setTimeout(() => setSaveStatus(""), 2000); }
    catch(_) { setSaveStatus("Error"); setTimeout(() => setSaveStatus(""), 2500); }
  };

  const handleNext = async () => {
    // Only validate acks + signature when user has UAN
    if (hasUan === "yes") {
      const errs = [];
      const totalShare = nominees.reduce((s,n)=>s+(parseInt(n.share)||0),0);
      if (nominees.length > 0 && totalShare !== 100) errs.push(`Nominee Share Total (currently ${totalShare}%, must equal 100%)`);
      if (!pfNomAck)     errs.push("PF Nomination Declaration");
      if (!pensionNomAck) errs.push("Pension Nomination Declaration");
      if (!epfoDecl)     errs.push("General EPFO Declaration");
      if (editedAfterSign) errs.push("Digital Signature (information changed — please sign again)");
      else if (!sigS3Key && !sigDataUrl) errs.push("Digital Signature");

      if (errs.length > 0) {
        setSaveStatus(`⚠️ Required: ${errs.join(", ")}`);
        document.getElementById("epfo-decl-section")?.scrollIntoView({ behavior:"smooth", block:"center" });
        return;
      }
    }

    setSaveStatus("Saving...");
    const wasDirty = isDirtyRef.current;
    try {
      await saveDraft();
      setSaveStatus("Saved ✓");
      // If page 4 was edited, signal review page
      const dest = (wasEditedAfterLoad.current || wasDirty) ? "/employee/review?edited=1" : "/employee/review";
      router.push(dest);
    }
    catch(err) { setSaveStatus(`Error: ${err.message || "Could not save"}`); }
  };

  if (!ready || !user) return (
    <div style={{minHeight:"100vh",background:"#f5f4f0",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p style={{color:"#8b88b0",fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>Loading…</p>
    </div>
  );
  if (loading) return (
    <div style={{minHeight:"100vh",background:"#f5f4f0",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p style={{color:"#8b88b0",fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>Loading UAN details…</p>
    </div>
  );

  const showUanFields = hasUan === "yes";

  return (
    <>
      <style>{G}</style>
      <div className="pg">
        {showSignout && <SignoutModal onConfirm={handleSignout} onCancel={() => setShowSignout(false)}/>}
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
            <button className="signout-btn" onClick={()=>setShowSignout(true)} style={{borderColor:"#ef4444",color:"#ef4444"}}>Sign out</button>
          </div>
        </div>

        <div className="wrap">
          <StepNav current={4} onNavigate={handleNavigate}/>

          {/* ── UAN / EPFO Details ── */}
          <div className="sc cyn">
            <div className="sh"><div className="si cyn">🏦</div><span className="st">UAN / EPFO Details</span></div>

            <div className="yn-row">
              <span className="yn-lbl">Do you have a UAN (Universal Account Number)? <span style={{color:"#ef4444"}}>*</span></span>
              <button className="yn-btn" onClick={() => { setHasUan("yes"); dirty(() => {})(""); }}
                style={{border:hasUan==="yes"?"2px solid #0891b2":"1.5px solid #dddaf0",background:hasUan==="yes"?"#0891b2":"#f2f1f9",color:hasUan==="yes"?"#fff":"#6b6894"}}>Yes</button>
              <button className="yn-btn" onClick={() => { setHasUan("no"); dirty(() => {})(""); }}
                style={{border:hasUan==="no"?"2px solid #0891b2":"1.5px solid #dddaf0",background:hasUan==="no"?"#0891b2":"#f2f1f9",color:hasUan==="no"?"#fff":"#6b6894"}}>No</button>
            </div>

            {hasUan === "no" && (
              <div style={{padding:"0.75rem 1rem",background:"#f0f9ff",borderRadius:10,border:"1px solid #bae6fd",marginTop:"0.5rem"}}>
                <p style={{fontSize:"0.84rem",color:"#0369a1",fontWeight:500,lineHeight:1.5}}>No UAN recorded. You can update this later if you get one.</p>
              </div>
            )}

            {showUanFields && (
              <>
                <div className="fr">
                  <F l="UAN Number" v={uanNumber} s={v => dirty(setUanNumber)(v.replace(/\D/g, ""))} mx={12}/>
                  <F l="Name as per UAN" v={nameAsPerUan} s={dirty(setNameAsPerUan)}/>
                </div>
                <div className="fr">
                  <F l="Mobile Linked to UAN" v={mobileLinked} s={v => dirty(setMobileLinked)(v.replace(/\D/g, ""))} r={false} mx={10}/>
                  <div className="fi">
                    <span className="fl">UAN Active <span style={{color:"#ef4444"}}>*</span></span>
                    <select className="in" value={isActive} onChange={e => { setIsActive(e.target.value); flagPostSignEdit(); }} style={{background:isActive?"#fff":"#f2f1f9",color:isActive?"#1a1730":"#8b88b0"}}>
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
                <div style={{marginTop:"0.75rem"}}>
                  <span className="fl" style={{display:"block",marginBottom:"0.4rem"}}>UAN Card <span style={{color:"#ef4444"}}>*</span></span>
                  <FileUpload onUploadStateChange={handleUploadState} label="Upload UAN Card *" category="uan" subKey="uanCard" employeeId={draft?.employee_id || ""} apiFetch={apiFetch} value={epfoKey} onChange={k => { setEpfoKey(k); flagPostSignEdit(); }}/>
                </div>
                <div style={{marginTop:"0.75rem"}}>
                  <span className="fl" style={{display:"block",marginBottom:"0.28rem"}}>Service History Record Snapshot <span style={{color:"#ef4444"}}>*</span></span>
                  <p style={{fontSize:"0.7rem",color:"#6b6894",marginBottom:"0.4rem",fontWeight:500,lineHeight:1.5}}>Download from EPFO Member Portal (passbook.epfindia.gov.in) and upload screenshot or PDF.</p>
                  <FileUpload onUploadStateChange={handleUploadState} label="Upload Service History Snapshot *" category="uan" subKey="serviceHistory" employeeId={draft?.employee_id || ""} apiFetch={apiFetch} value={serviceHistoryKey} onChange={k => { const key = typeof k==="string"?k:(k?.key||k?.s3_key||""); setServiceHistoryKey(key); flagPostSignEdit(); }}/>
                </div>
              </>
            )}
          </div>

          {/* ── PF Details ── */}
          {showUanFields && (
            <div className="sc vio">
              <div className="sh"><div className="si vio">📋</div><span className="st">PF Details — Per Employer</span></div>
              <p style={{fontSize:"0.75rem",color:"#8b88b0",marginBottom:"0.75rem",fontWeight:500,lineHeight:1.5}}>
                {page3Companies.length > 0 ? "Pre-filled from your employment history on page 3." : "Enter PF details for each employer."}
              </p>

              {pfRecords.map((rec, i) => {
                const p3 = page3Companies[i];
                const pfLabel = rec.pfType === "Trust" ? "PF Trust" : "EPFO";
                return (
                  <div key={i} className="pf-block">
                    <div className="pf-block-hdr">
                      <div style={{display:"flex",flexDirection:"column",gap:"0.25rem"}}>
                        <span className="pf-block-title">{rec.companyName || (p3?.label) || `Employer ${i + 1}`}</span>
                        {p3 && <span className="pf-block-badge">{rec.isCurrent ? "🟢 Current / Most Recent" : `⬅ Previous Employer ${i + 1}`}</span>}
                      </div>
                    </div>
                    {/* Current employer — no PF fields needed yet */}
                    {rec.isCurrent && (
                      <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:10,padding:"0.9rem 1rem",marginTop:"0.25rem"}}>
                        <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.4rem"}}>
                          <span style={{fontSize:"1rem"}}>🟢</span>
                          <span style={{fontSize:"0.83rem",fontWeight:700,color:"#15803d"}}>Currently employed here</span>
                        </div>
                        <p style={{fontSize:"0.76rem",color:"#166534",lineHeight:1.65,margin:0}}>
                          PF details for your current employer will be collected once you update your end date on Page 3. 
                          You don't need to fill anything here right now.
                        </p>
                      </div>
                    )}
                    {!rec.isCurrent && (
                    <div className="fr">
                      <F l="Company Name" v={rec.companyName} s={v => updatePf(i, "companyName", v)}/>
                      <div className="fi">
                        <span className="fl">PF Maintained by Employer <span style={{color:"#ef4444",marginLeft:2}}>*</span></span>
                        <div style={{display:"flex",gap:"0.55rem",marginTop:"0.15rem"}}>
                          {["Yes","No"].map(v=>(
                            <button key={v} onClick={()=>updatePf(i,"hasPf",v)} style={{flex:1,padding:"0.62rem 0",borderRadius:9,border:rec.hasPf===v?"2px solid #7c3aed":"1.5px solid #d8d4e3",background:rec.hasPf===v?"#7c3aed":"#f5f4f0",color:rec.hasPf===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.82rem",fontWeight:700,fontFamily:"inherit",transition:"all 0.18s"}}>{v}</button>
                          ))}
                        </div>
                      </div>
                    </div>)}
                    {!rec.isCurrent && rec.hasPf === "No" && (
                      <div style={{padding:"0.7rem 0.9rem",background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:9,fontSize:"0.78rem",color:"#0369a1",fontWeight:500,marginTop:"0.1rem"}}>
                        ℹ️ No PF details required — employer does not maintain Provident Fund.
                      </div>
                    )}
                    {!rec.isCurrent && rec.hasPf === "Yes" && (
                      <>
                        <div className="fr">
                          <div className="fi">
                            <span className="fl">PF Type <span style={{color:"#ef4444"}}>*</span></span>
                            <select className="in" value={rec.pfType||""} onChange={e=>updatePf(i,"pfType",e.target.value)} style={{background:rec.pfType?"#fff":"#f2f1f9",color:rec.pfType?"#1a1730":"#8b88b0"}}>
                              <option value="">Select</option>
                              <option value="EPFO">EPFO — Government (linked to my UAN)</option>
                              <option value="Trust">Company's Own PF Trust (Exempted Establishment)</option>
                            </select>
                          </div>
                        </div>
                        {!rec.pfType && (
                          <p style={{fontSize:"0.7rem",color:"#6b6894",marginTop:"-0.55rem",marginBottom:"0.75rem",fontWeight:500,lineHeight:1.5}}>
                            Most companies use EPFO directly. Some large companies (e.g. TCS) maintain their own RPFC-exempted PF Trust instead — check your payslip or PF deduction note if unsure.
                          </p>
                        )}
                        <div className="fr"><F l={`${pfLabel} Member ID`} v={rec.pfMemberId} s={v => updatePf(i, "pfMemberId", v)}/></div>
                        <div className="fr">
                          <FDate l={`Date of Joining (${pfLabel})`} v={rec.dojEpfo} s={v => updatePf(i, "dojEpfo", v)}/>
                          {!rec.isCurrent && (
                            <FDate l={`Date of Exit (${pfLabel})`} v={rec.doeEpfo} s={v => updatePf(i, "doeEpfo", v)}/>
                          )}
                        </div>
                        {rec.isCurrent ? (
                          <div style={{background:"#f0f9f4",border:"1px solid #a8d5c2",borderRadius:8,padding:"0.6rem 0.9rem",fontSize:"0.78rem",color:"#1a6b4a",marginBottom:"0.5rem",lineHeight:1.6}}>
                            ℹ️ <strong>Currently employed here.</strong> Date of exit and PF transfer details will be filled when you leave this company. You can update this later.
                          </div>
                        ) : (
                          <div>
                            <span className="fl" style={{display:"block",marginBottom:"0.4rem"}}>Was PF Transferred? <span style={{color:"#ef4444"}}>*</span></span>
                            <div style={{display:"flex",gap:"0.6rem"}}>
                              {["Yes","No"].map(v => (
                                <button key={v} onClick={() => updatePf(i, "pfTransferred", v)} style={{padding:"0.3rem 1.1rem",borderRadius:999,border:rec.pfTransferred===v?"2px solid #7c3aed":"1.5px solid #dddaf0",background:rec.pfTransferred===v?"#7c3aed":"#f2f1f9",color:rec.pfTransferred===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.82rem",fontWeight:700,fontFamily:"inherit",transition:"all 0.18s"}}>{v}</button>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── EPFO-fetched read-only ── */}
          {showUanFields && epfoFetched.length > 0 && (
            <div className="sc grn">
              <div className="sh"><div className="si grn">📑</div><span className="st">PF Employment Records (from EPFO)</span></div>
              {epfoFetched.map((pf, i) => (
                <div key={i} style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"0.9rem 1rem",marginBottom:"0.65rem"}}>
                  <div style={{fontSize:"0.72rem",fontWeight:700,color:"#16a34a",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.5rem"}}>{pf.companyName||`Employer ${i+1}`}</div>
                  <div className="pf-row">
                    {pf.pfMemberId && <div className="pf-kv"><span className="pf-key">PF Member ID</span><span className="pf-val">{pf.pfMemberId}</span></div>}
                    {pf.dojEpfo    && <div className="pf-kv"><span className="pf-key">Date of Joining</span><span className="pf-val">{isoToDisplay(pf.dojEpfo)}</span></div>}
                    {pf.doeEpfo    && <div className="pf-kv"><span className="pf-key">Date of Exit</span><span className="pf-val">{isoToDisplay(pf.doeEpfo)}</span></div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Nominees ── */}
          {hasUan === "yes" && (
            <div className="sc grn" style={{marginBottom:"1.1rem"}}>
              <div className="sh"><div className="si grn">👨‍👩‍👧</div><span className="st">Nominee Details — PF & Pension (Form 2)</span></div>
              <p style={{fontSize:"0.75rem",color:"#6b6894",marginBottom:"0.9rem",fontWeight:500,lineHeight:1.5}}>Nominate beneficiaries for your PF and Pension. Shares must add up to 100%.</p>
              {nominees.map((nom, idx) => (
                <div key={nom._k||idx} className="nom-block">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.75rem"}}>
                    <span style={{fontSize:"0.72rem",fontWeight:800,color:"#16a34a",textTransform:"uppercase",letterSpacing:"0.5px"}}>Nominee {idx+1}</span>
                    {idx>0&&<button className="rm-btn" onClick={()=>{setNominees(prev=>prev.filter((_,i)=>i!==idx));flagPostSignEdit();}}>− Remove</button>}
                  </div>
                  <div className="fr">
                    <div className="fi">
                      <span className="fl">Full Name <span style={{color:"#ef4444"}}>*</span></span>
                      <input className="in" value={nom.name||""} placeholder="As per Aadhaar / PAN" onChange={e=>{setNominees(p=>{const n=[...p];n[idx]={...n[idx],name:e.target.value};return n;});flagPostSignEdit();}}/>
                    </div>
                    <div className="fi">
                      <span className="fl">Date of Birth <span style={{color:"#ef4444"}}>*</span></span>
                      <NomineeDobField value={nom.dob||""} onChange={v=>{setNominees(p=>{const n=[...p];n[idx]={...n[idx],dob:v};return n;});flagPostSignEdit();}}/>
                    </div>
                    <div className="fi">
                      <span className="fl">Relationship <span style={{color:"#ef4444"}}>*</span></span>
                      <select className="in" value={nom.relation||""} onChange={e=>{setNominees(p=>{const n=[...p];n[idx]={...n[idx],relation:e.target.value,otherRelation:""};return n;});flagPostSignEdit();}} style={{background:nom.relation?"#fff":"#f2f1f9",color:nom.relation?"#1a1730":"#8b88b0"}}>
                        <option value="">Select</option>
                        {["Spouse","Son","Daughter","Father","Mother","Brother","Sister","Other"].map(r=><option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="fr">
                    <div className="fi" style={{minWidth:220}}>
                      <span className="fl">Address <span style={{color:"#ef4444"}}>*</span></span>
                      <input className="in" value={nom.address||""} onChange={e=>{setNominees(p=>{const n=[...p];n[idx]={...n[idx],address:e.target.value};return n;});flagPostSignEdit();}}/>
                    </div>
                    <div className="fi" style={{maxWidth:140}}>
                      <span className="fl">Share (%) <span style={{color:"#ef4444"}}>*</span></span>
                      <input className="in" value={nom.share||""} placeholder="e.g. 50" inputMode="numeric" maxLength={3} onChange={e=>{const v=e.target.value.replace(/\D/g,"").slice(0,3);setNominees(p=>{const n=[...p];n[idx]={...n[idx],share:v};return n;});flagPostSignEdit();}}/>
                    </div>
                  </div>
                </div>
              ))}
              {nominees.length < 4 && <button className="add-btn" onClick={()=>{setNominees(p=>[...p,makeNominee()]);flagPostSignEdit();}}>+ Add Another Nominee</button>}
              {nominees.reduce((s,n)=>s+(parseInt(n.share)||0),0) !== 100 && (
                <p style={{fontSize:"0.75rem",color:"#ef4444",fontWeight:600,marginTop:"0.5rem"}}>⚠️ Total share must equal 100%. Current total: {nominees.reduce((s,n)=>s+(parseInt(n.share)||0),0)}%</p>
              )}
            </div>
          )}

          {/* ── Family Details — for company health insurance enrollment (Medibuddy/Acko-style) ── */}
          {/* Fully optional — informational only, never blocks Save or Signature. */}
          <div className="sc vio" style={{marginBottom:"1.1rem"}}>
            <div className="sh"><div className="si vio">🏥</div><span className="st">Family Details — Health Insurance</span></div>
            <p style={{fontSize:"0.75rem",color:"#6b6894",marginBottom:"0.9rem",fontWeight:500,lineHeight:1.5}}>Optional — share your family details so HR/insurer can add them to your company health cover. Skip anything that doesn't apply.</p>

            {draft?.maritalStatus ? (
              <p style={{fontSize:"0.75rem",color:"#6b6894",marginBottom:"0.7rem"}}>Marital status on file: <strong style={{color:"#1a1730"}}>{draft.maritalStatus}</strong> <span style={{color:"#8b88b0"}}>(from Personal Details — update it there if it's changed)</span></p>
            ) : (
              <p style={{fontSize:"0.75rem",color:"#d97706",fontWeight:600,marginBottom:"0.7rem"}}>⚠️ Marital status isn't set yet — add it on Personal Details to unlock Spouse fields here.</p>
            )}

            {draft?.maritalStatus==="Married" && (
              draft?.spouseName || draft?.spouseDob ? (
                <div style={{background:"#f5f3ff",border:"1px solid #ddd6fe",borderRadius:8,padding:"0.7rem 0.9rem",fontSize:"0.8rem",color:"#1a1730"}}>
                  💍 <strong>{draft.spouseName || "—"}</strong>{draft.spouseDob && ` — ${isoToDisplay(draft.spouseDob)}`}{draft.spouseDob && <AgeTag dob={draft.spouseDob}/>}
                  <div style={{fontSize:"0.7rem",color:"#8b88b0",marginTop:"0.2rem"}}>From Personal Details — update it there if it's changed.</div>
                </div>
              ) : (
                <p style={{fontSize:"0.75rem",color:"#d97706",fontWeight:600}}>⚠️ Spouse details aren't filled in on Personal Details yet — add them there.</p>
              )
            )}

            <div className="fi" style={{marginBottom:"0.85rem",marginTop:"0.4rem"}}>
              <span className="fl">Do you have children to add?</span>
              <p style={{fontSize:"0.68rem",color:"#8b88b0",margin:"0.2rem 0 0.4rem"}}>Optional — if you have children, you can add up to 2 for health insurance coverage. Applies regardless of marital status.</p>
              <div style={{display:"flex",gap:"0.55rem",marginTop:"0.15rem",maxWidth:280}}>
                {["Yes","No"].map(v=>(
                  <button key={v} type="button" onClick={()=>{setHasChildren(v);flagPostSignEdit();}} style={{flex:1,padding:"0.55rem 0",borderRadius:9,border:hasChildren===v?"2px solid #7c3aed":"1.5px solid #d8d4e3",background:hasChildren===v?"#7c3aed":"#f5f4f0",color:hasChildren===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.78rem",fontWeight:700,fontFamily:"inherit",transition:"all 0.18s"}}>{v}</button>
                ))}
              </div>
            </div>

            {hasChildren==="Yes" && (<>
              {children.map((c,idx)=>(
                <div key={c._k||idx} className="nom-block" style={{background:"#f5f3ff",border:"1.5px solid #ddd6fe"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.75rem"}}>
                    <span style={{fontSize:"0.72rem",fontWeight:800,color:"#7c3aed",textTransform:"uppercase",letterSpacing:"0.5px"}}>Child {idx+1}</span>
                    {idx>0&&<button className="rm-btn" onClick={()=>{setChildren(prev=>prev.filter((_,i)=>i!==idx));flagPostSignEdit();}}>− Remove</button>}
                  </div>
                  <div className="fr">
                    <div className="fi"><span className="fl">Name</span><input className="in" value={c.name} onChange={e=>{setChildren(p=>{const n=[...p];n[idx]={...n[idx],name:e.target.value};return n;});flagPostSignEdit();}}/></div>
                    <div className="fi"><span className="fl">Date of Birth</span><NomineeDobField value={c.dob} onChange={v=>{setChildren(p=>{const n=[...p];n[idx]={...n[idx],dob:v};return n;});flagPostSignEdit();}}/>{c.dob && <AgeTag dob={c.dob}/>}</div>
                    <div className="fi">
                      <span className="fl">Gender</span>
                      <select className="in" value={c.gender} onChange={e=>{setChildren(p=>{const n=[...p];n[idx]={...n[idx],gender:e.target.value};return n;});flagPostSignEdit();}} style={{background:c.gender?"#fff":"#f2f1f9",color:c.gender?"#1a1730":"#8b88b0"}}>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              {children.length < 2 && <button className="add-btn" onClick={()=>{setChildren(p=>[...p,makeChild()]);flagPostSignEdit();}}>+ Add Another Child</button>}
            </>)}

            <div className="fi" style={{marginBottom:"0.5rem",marginTop:"0.9rem"}}>
              <span className="fl">Parents to Cover (choose one side only)</span>
              <div style={{display:"flex",gap:"0.55rem",marginTop:"0.15rem",flexWrap:"wrap"}}>
                {["My Parents","Spouse's Parents","Not Applicable"].map(v=>(
                  <button key={v} type="button" onClick={()=>{setParentsCoverage(v);if(v!=="Spouse's Parents"){setFatherName("");setFatherDob("");setMotherName("");setMotherDob("");}if(v!=="My Parents"){setExcludeFather(false);setExcludeMother(false);}flagPostSignEdit();}} style={{flex:"1 1 140px",padding:"0.55rem 0.4rem",borderRadius:9,border:parentsCoverage===v?"2px solid #7c3aed":"1.5px solid #d8d4e3",background:parentsCoverage===v?"#7c3aed":"#f5f4f0",color:parentsCoverage===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.76rem",fontWeight:700,fontFamily:"inherit",transition:"all 0.18s"}}>{v}</button>
                ))}
              </div>
              <span style={{fontSize:"0.68rem",color:"#8b88b0",marginTop:"0.3rem"}}>Insurers cover one full set of parents per policy — either yours or your spouse's, not a mix of both sides.</span>
            </div>

            {parentsCoverage==="My Parents" && (
              draft?.fatherName || draft?.motherName ? (
                <div style={{background:"#f5f3ff",border:"1px solid #ddd6fe",borderRadius:8,padding:"0.7rem 0.9rem",fontSize:"0.8rem",color:"#1a1730",lineHeight:1.7}}>
                  <p style={{fontSize:"0.7rem",color:"#8b88b0",margin:"0 0 0.5rem"}}>If a parent has passed away, remove them below — they won't be sent for insurance coverage.</p>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <span>👨 <strong>{draft.fatherName || "—"}</strong>{draft.fatherDob && ` — ${isoToDisplay(draft.fatherDob)}`}{draft.fatherDob && !excludeFather && <AgeTag dob={draft.fatherDob}/>}</span>
                    {excludeFather
                      ? <span style={{fontSize:"0.7rem",color:"#64748b"}}>Removed — <button type="button" onClick={()=>{setExcludeFather(false);flagPostSignEdit();}} style={{background:"none",border:"none",color:"#7c3aed",fontWeight:700,cursor:"pointer",fontSize:"0.7rem",padding:0}}>Undo</button></span>
                      : <button type="button" onClick={()=>{setExcludeFather(true);flagPostSignEdit();}} style={{background:"none",border:"1px solid #d8d4e3",borderRadius:6,color:"#94a3b8",fontWeight:600,cursor:"pointer",fontSize:"0.68rem",padding:"0.2rem 0.5rem"}}>✕ Remove</button>}
                  </div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:"0.3rem"}}>
                    <span>👩 <strong>{draft.motherName || "—"}</strong>{draft.motherDob && ` — ${isoToDisplay(draft.motherDob)}`}{draft.motherDob && !excludeMother && <AgeTag dob={draft.motherDob}/>}</span>
                    {excludeMother
                      ? <span style={{fontSize:"0.7rem",color:"#64748b"}}>Removed — <button type="button" onClick={()=>{setExcludeMother(false);flagPostSignEdit();}} style={{background:"none",border:"none",color:"#7c3aed",fontWeight:700,cursor:"pointer",fontSize:"0.7rem",padding:0}}>Undo</button></span>
                      : <button type="button" onClick={()=>{setExcludeMother(true);flagPostSignEdit();}} style={{background:"none",border:"1px solid #d8d4e3",borderRadius:6,color:"#94a3b8",fontWeight:600,cursor:"pointer",fontSize:"0.68rem",padding:"0.2rem 0.5rem"}}>✕ Remove</button>}
                  </div>
                  {excludeFather && excludeMother && (
                    <div style={{marginTop:"0.4rem",fontSize:"0.75rem",color:"#92400e",fontWeight:600}}>Both parents removed — there's no one to cover under this option. You can set this back to "Not Applicable."</div>
                  )}
                  <div style={{fontSize:"0.7rem",color:"#8b88b0",marginTop:"0.4rem"}}>Name/DOB come from Personal Details — update it there if anything's changed. {(!draft.fatherDob || !draft.motherDob) && "(DOB missing for one or both — add it on Personal Details for complete insurance data.)"}</div>
                </div>
              ) : (
                <p style={{fontSize:"0.75rem",color:"#d97706",fontWeight:600}}>⚠️ Father's/Mother's names aren't filled in on Personal Details yet — add them there first.</p>
              )
            )}

            {parentsCoverage==="Spouse's Parents" && (
              <>
                <div className="fr">
                  <div className="fi"><span className="fl">Father-in-law Name</span><input className="in" value={fatherName} onChange={e=>{setFatherName(e.target.value);flagPostSignEdit();}}/></div>
                  <div className="fi"><span className="fl">Father-in-law Date of Birth</span><NomineeDobField value={fatherDob} onChange={v=>{setFatherDob(v);flagPostSignEdit();}}/>{fatherDob && <AgeTag dob={fatherDob}/>}</div>
                </div>
                <div className="fr">
                  <div className="fi"><span className="fl">Mother-in-law Name</span><input className="in" value={motherName} onChange={e=>{setMotherName(e.target.value);flagPostSignEdit();}}/></div>
                  <div className="fi"><span className="fl">Mother-in-law Date of Birth</span><NomineeDobField value={motherDob} onChange={v=>{setMotherDob(v);flagPostSignEdit();}}/>{motherDob && <AgeTag dob={motherDob}/>}</div>
                </div>
              </>
            )}
          </div>

          {/* ── EPFO Declarations + Signature ── only required when user has UAN ── */}
          {hasUan === "yes" && (
            <div id="epfo-decl-section" className="sc" style={{marginBottom:"1.1rem",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,bottom:0,width:4,borderRadius:"16px 0 0 16px",background:"#0d6e6e"}}/>
              <div className="sh"><div className="si" style={{background:"#eef2ff"}}>📜</div><span className="st">EPFO Declarations & Digital Signature</span></div>

              {editedAfterSign && (
                <div style={{background:"#fff8f0",border:"1.5px solid #fbbf24",borderRadius:10,padding:"0.65rem 1rem",marginBottom:"0.75rem",fontSize:"0.75rem",color:"#92400e",fontWeight:600}}>
                  ⚠️ You changed information on this page. Your previous signature no longer applies — re-confirm all 3 declarations below and sign again before you can continue.
                </div>
              )}

              <p style={{fontSize:"0.75rem",color:"#6b6894",marginBottom:"0.9rem",fontWeight:500,lineHeight:1.5}}>
                The following declarations are mandatory. All three must be confirmed and a signature must be drawn before you can continue.
              </p>

              {/* Declaration 1 */}
              <div style={{background:"#f0effe",border:"1px solid #dddaf0",borderRadius:10,padding:"0.9rem 1rem",marginBottom:"0.75rem",borderLeft:pfNomAck?"3px solid #16a34a":"3px solid #e4e2f0"}}>
                <label style={{display:"flex",alignItems:"flex-start",gap:"0.75rem",cursor:"pointer"}}>
                  <input type="checkbox" checked={pfNomAck} onChange={e=>{setPfNomAck(e.target.checked);isDirtyRef.current=true;if(wasSignedRef.current){setEditedAfterSign(true);}}} style={{marginTop:"0.2rem",width:17,height:17,accentColor:"#0d6e6e",flexShrink:0,cursor:"pointer"}}/>
                  <div>
                    <div style={{fontSize:"0.68rem",fontWeight:800,color:"#0d6e6e",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"0.3rem"}}>PF Nomination Declaration (Form 2 — Part A) <span style={{color:"#ef4444"}}>*</span></div>
                    <span style={{fontSize:"0.82rem",color:"#1a1730",fontWeight:500,lineHeight:1.65}}>I hereby nominate the person(s) listed above to receive the amount standing to my credit in the Provident Fund in the event of my death. I confirm the nominee details are accurate and shares add up to 100%.</span>
                  </div>
                </label>
              </div>

              {/* Declaration 2 */}
              <div style={{background:"#f0effe",border:"1px solid #dddaf0",borderRadius:10,padding:"0.9rem 1rem",marginBottom:"0.75rem",borderLeft:pensionNomAck?"3px solid #16a34a":"3px solid #e4e2f0"}}>
                <label style={{display:"flex",alignItems:"flex-start",gap:"0.75rem",cursor:"pointer"}}>
                  <input type="checkbox" checked={pensionNomAck} onChange={e=>{setPensionNomAck(e.target.checked);isDirtyRef.current=true;if(wasSignedRef.current){setEditedAfterSign(true);}}} style={{marginTop:"0.2rem",width:17,height:17,accentColor:"#0d6e6e",flexShrink:0,cursor:"pointer"}}/>
                  <div>
                    <div style={{fontSize:"0.68rem",fontWeight:800,color:"#0d6e6e",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"0.3rem"}}>Pension Nomination Declaration (Form 2 — Part B) <span style={{color:"#ef4444"}}>*</span></div>
                    <span style={{fontSize:"0.82rem",color:"#1a1730",fontWeight:500,lineHeight:1.65}}>I nominate the above person(s) to receive pension under the Employees' Pension Scheme, 1995. This nomination supersedes any previous nomination made by me.</span>
                  </div>
                </label>
              </div>

              {/* Declaration 3 */}
              <div style={{background:"#f0effe",border:"1px solid #dddaf0",borderRadius:10,padding:"0.9rem 1rem",marginBottom:"1rem",borderLeft:epfoDecl?"3px solid #16a34a":"3px solid #e4e2f0"}}>
                <label style={{display:"flex",alignItems:"flex-start",gap:"0.75rem",cursor:"pointer"}}>
                  <input type="checkbox" checked={epfoDecl} onChange={e=>{setEpfoDecl(e.target.checked);isDirtyRef.current=true;if(wasSignedRef.current){setEditedAfterSign(true);}}} style={{marginTop:"0.2rem",width:17,height:17,accentColor:"#0d6e6e",flexShrink:0,cursor:"pointer"}}/>
                  <div>
                    <div style={{fontSize:"0.68rem",fontWeight:800,color:"#0d6e6e",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"0.3rem"}}>General EPFO Declaration <span style={{color:"#ef4444"}}>*</span></div>
                    <span style={{fontSize:"0.82rem",color:"#1a1730",fontWeight:500,lineHeight:1.65}}>I declare that all UAN, PF member ID(s), service history, and nominee details provided are true and correct. I understand false declarations may result in legal action under the EPF Act, 1952.</span>
                  </div>
                </label>
              </div>

              {/* Digital Signature — persists across normal revisits; editing the page after
                  signing forces this back into draw mode, and every replaced signature is
                  archived (never overwritten in place) */}
              <div style={{background:"#fff",border:"1.5px solid #e4e2f0",borderRadius:12,padding:"1.1rem 1.2rem"}}>
                <div style={{fontSize:"0.72rem",fontWeight:800,color:"#0d6e6e",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"0.5rem"}}>
                  Digital Signature <span style={{color:"#ef4444"}}>*</span>
                </div>

                {editedAfterSign && (
                  <div style={{background:"#fff5f5",border:"1px solid #fecaca",borderRadius:8,padding:"0.6rem 0.9rem",marginBottom:"0.75rem",fontSize:"0.75rem",color:"#b91c1c",fontWeight:600}}>
                    ⚠️ Your previous signature was recorded against different information and no longer applies. Please sign again below.
                  </div>
                )}

                {!showSigCanvas ? (
                  // ── VIEW MODE: plain static image, no canvas, no CORS dependency ──
                  <>
                    <p style={{fontSize:"0.72rem",color:"#6b6894",marginBottom:"0.65rem",fontWeight:500,lineHeight:1.5}}>Your signature on file:</p>
                    <div style={{border:"1.5px solid #bbf7d0",borderRadius:9,background:"#f0fdf4",padding:"0.5rem",maxWidth:400}}>
                      {sigDataUrl && !sigPreviewFailed ? (
                        <img src={sigDataUrl} alt="Your saved signature" style={{width:"100%",maxWidth:400,height:90,objectFit:"contain",display:"block"}} onError={()=>setSigPreviewFailed(true)}/>
                      ) : (
                        <div style={{height:90,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.75rem",color:"#8b88b0",fontWeight:500}}>
                          {sigPreviewFailed ? "Signature on file (preview unavailable)" : "Loading signature…"}
                        </div>
                      )}
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"0.6rem",flexWrap:"wrap",gap:"0.5rem"}}>
                      {sigTimestamp && (
                        <span style={{fontSize:"0.7rem",color:"#16a34a",fontWeight:600}}>
                          ✓ Signed — {new Date(sigTimestamp).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}
                        </span>
                      )}
                      <button
                        onClick={()=>setSigningMode(true)}
                        style={{padding:"0.3rem 0.8rem",background:"#eef2ff",color:"#0d6e6e",border:"1.5px solid #c7d2fe",borderRadius:7,fontSize:"0.72rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                        ✎ Re-sign
                      </button>
                    </div>
                  </>
                ) : (
                  // ── DRAW MODE: blank canvas — first-time signing, or explicit re-sign ──
                  <>
                    <p style={{fontSize:"0.72rem",color:"#6b6894",marginBottom:"0.75rem",fontWeight:500,lineHeight:1.5}}>Draw your signature using mouse or finger. This is recorded with date/time as your digital consent.</p>

                    <canvas
                      ref={sigCanvasRef}
                      width={400} height={90}
                      className="sig-canvas"
                      style={{width:"100%",maxWidth:400,height:90}}
                      onMouseDown={e=>{
                        sigDrawingRef.current=true;
                        sigHasStrokeRef.current=true;
                        setSigEmptyWarn(false);
                        const r=sigCanvasRef.current.getBoundingClientRect();
                        const scaleX=sigCanvasRef.current.width/r.width;
                        const x=(e.clientX-r.left)*scaleX, y=(e.clientY-r.top)*scaleX;
                        sigLastRef.current={x,y};
                        // Draw a dot immediately on press so single clicks (like dot on j/i) are captured
                        const ctx=sigCanvasRef.current.getContext("2d");
                        ctx.beginPath();ctx.fillStyle="#1a1730";
                        ctx.arc(x,y,1.5,0,Math.PI*2);ctx.fill();
                      }}
                      onMouseMove={e=>{
                        if(!sigDrawingRef.current)return;
                        const r=sigCanvasRef.current.getBoundingClientRect();
                        const scaleX=sigCanvasRef.current.width/r.width;
                        const ctx=sigCanvasRef.current.getContext("2d");
                        // Clamp to canvas bounds — keeps the stroke going right up to the edge
                        // instead of the pen "lifting" the instant the cursor drifts outside.
                        const x=Math.min(Math.max((e.clientX-r.left)*scaleX,0),sigCanvasRef.current.width);
                        const y=Math.min(Math.max((e.clientY-r.top)*scaleX,0),sigCanvasRef.current.height);
                        ctx.beginPath();ctx.strokeStyle="#1a1730";ctx.lineWidth=2.2;ctx.lineCap="round";ctx.lineJoin="round";
                        ctx.moveTo(sigLastRef.current.x,sigLastRef.current.y);ctx.lineTo(x,y);ctx.stroke();
                        sigLastRef.current={x,y};
                      }}
                      onMouseUp={()=>{sigDrawingRef.current=false;}}
                      onTouchStart={e=>{
                        e.preventDefault();sigDrawingRef.current=true;
                        sigHasStrokeRef.current=true;
                        setSigEmptyWarn(false);
                        const r=sigCanvasRef.current.getBoundingClientRect();
                        const scaleX=sigCanvasRef.current.width/r.width;
                        const t=e.touches[0];
                        const x=(t.clientX-r.left)*scaleX, y=(t.clientY-r.top)*scaleX;
                        sigLastRef.current={x,y};
                        // Draw dot on press
                        const ctx=sigCanvasRef.current.getContext("2d");
                        ctx.beginPath();ctx.fillStyle="#1a1730";
                        ctx.arc(x,y,1.5,0,Math.PI*2);ctx.fill();
                      }}
                      onTouchMove={e=>{
                        e.preventDefault();if(!sigDrawingRef.current)return;
                        const r=sigCanvasRef.current.getBoundingClientRect();
                        const scaleX=sigCanvasRef.current.width/r.width;
                        const ctx=sigCanvasRef.current.getContext("2d");
                        const t=e.touches[0];
                        const x=Math.min(Math.max((t.clientX-r.left)*scaleX,0),sigCanvasRef.current.width);
                        const y=Math.min(Math.max((t.clientY-r.top)*scaleX,0),sigCanvasRef.current.height);
                        ctx.beginPath();ctx.strokeStyle="#1a1730";ctx.lineWidth=2.2;ctx.lineCap="round";ctx.lineJoin="round";
                        ctx.moveTo(sigLastRef.current.x,sigLastRef.current.y);ctx.lineTo(x,y);ctx.stroke();
                        sigLastRef.current={x,y};
                      }}
                      onTouchEnd={()=>{sigDrawingRef.current=false;}}
                      onMouseLeave={()=>{sigDrawingRef.current=false;}}
                    />

                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"0.6rem",flexWrap:"wrap",gap:"0.5rem"}}>
                      <span style={{fontSize:"0.7rem",color:"#8b88b0",fontWeight:500}}>Draw your signature, then tap Done <span style={{color:"#ef4444"}}>*</span></span>
                      <div style={{display:"flex",gap:"0.5rem"}}>
                        <button
                          onClick={()=>{ const ctx=sigCanvasRef.current.getContext("2d"); ctx.clearRect(0,0,sigCanvasRef.current.width,sigCanvasRef.current.height); ctx.fillStyle="#fff"; ctx.fillRect(0,0,sigCanvasRef.current.width,sigCanvasRef.current.height); sigHasStrokeRef.current=false; setSigEmptyWarn(false); }}
                          style={{padding:"0.3rem 0.8rem",background:"#fff5f5",color:"#ef4444",border:"1.5px solid #fecaca",borderRadius:7,fontSize:"0.72rem",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                          Clear
                        </button>
                        {hasSavedSignature && !editedAfterSign && (
                          <button
                            onClick={()=>setSigningMode(false)}
                            style={{padding:"0.3rem 0.8rem",background:"transparent",color:"#6b6894",border:"1.5px solid #dddaf0",borderRadius:7,fontSize:"0.72rem",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={finishSignature}
                          style={{padding:"0.3rem 0.9rem",background:"#16a34a",color:"#fff",border:"1.5px solid #16a34a",borderRadius:7,fontSize:"0.72rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                          ✓ Done
                        </button>
                      </div>
                    </div>
                    {sigEmptyWarn && <p style={{fontSize:"0.75rem",color:"#ef4444",fontWeight:600,marginTop:"0.4rem"}}>⚠️ Please draw your signature before tapping Done.</p>}
                  </>
                )}
              </div>
            </div>
          )}

          {hasUan === "yes" && (
          <div style={{background:"#fff",borderRadius:12,padding:"1rem 1.25rem",marginBottom:"1.1rem",border:"1px solid #e8e5f0",boxShadow:"0 2px 8px rgba(30,26,62,0.06)"}}>
            <p style={{fontSize:"0.78rem",color:"#6b6894",lineHeight:1.6,fontWeight:500}}>
              ℹ️ All 3 declarations must be checked and a signature must be drawn before you can continue to the Review page.
            </p>
          </div>
          )}

          <div className="sbar">
            <button className="sbtn" onClick={() => handleNavigate("/employee/previous")}>← Previous</button>
            <span className={`ss${saveStatus==="Saved ✓"?" ok":saveStatus.startsWith("Error")||saveStatus.startsWith("⚠️")?" err":""}`}>{saveStatus}</span>
            <div style={{display:"flex",gap:"0.65rem",alignItems:"center"}}>
              <button className="sbtn" onClick={handleMidSave} style={{fontSize:"0.8rem"}}>Save draft</button>
              <button className="pbtn" onClick={handleNext} disabled={activeUploads>0} title={activeUploads>0?"Please wait for the upload to finish before saving":""}>{activeUploads>0?"Uploading…":"Save & Continue →"}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
