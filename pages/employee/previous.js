// pages/employee/previous.js  — Page 3 of 5
// Fixes: DateField no calendar + DD/MM/YYYY with month name display
// Ack cascade: if user edits page 3, flags page3_edited in DB so page 5 knows to re-ask acks
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";
import FileUpload from "../../components/FileUpload";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const ACCENTS    = { 1:"#0d6e6e", 2:"#d97706", 3:"#7c3aed", 4:"#0891b2", 5:"#16a34a" };
const STEP_DONE_BG = "#0a4a4a"; const STEP_DONE_CK = "#5eead4"; const STEP_CONN = "#0d6e6e";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function isoToDisplay(iso) {
  if (!iso || !iso.includes("-")) return iso || "";
  const [y, mo, d] = iso.split("-");
  const idx = parseInt(mo, 10) - 1;
  const mName = MONTH_NAMES[idx] || mo;
  return `${parseInt(d,10)} ${mName} ${y}`;
}

const genId = () => typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)+Date.now().toString(36);
const emptyEmployment = () => ({
  companyName:"", officeAddress:"", employeeId:"", workEmail:"",
  designation:"", department:"", duties:"", employmentType:"", reasonForRelieving:"",
  startDate:"", endDate:"", currentlyWorking:"",
  reference:{ role:"", name:"", email:"", mobile:"" },
  contractVendor:{ company:"", email:"", mobile:"" },
  documents:{ payslipsKey:"", offerLetterKey:"", resignationKey:"", experienceKey:"", idCardKey:"" },
  gap:{ hasGap:"", reason:"", from:"", to:"" }, company_id: genId(),
});
const emptyAck = () => ({ val:"", note:"" });

const G = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f0ece6; font-family: 'DM Sans', sans-serif; }
  .pg { min-height: 100vh; background: #f0ece6; padding-bottom: 3rem; }
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
  .signout-btn:hover { border-color: #ef4444; color: #ef4444; }
  .bell-btn { position: relative; width: 36px; height: 36px; border-radius: 9px;
    border: 1.5px solid #2a2535; background: transparent; cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: 1rem; transition: all 0.2s; }
  .bell-btn:hover { border-color: #0d6e6e; background: rgba(167,139,250,0.1); }
  .bell-badge { position: absolute; top: -5px; right: -5px; background: #ef4444; color: #fff;
    border-radius: 999px; font-size: 0.6rem; font-weight: 800; min-width: 16px; height: 16px;
    display: flex; align-items: center; justify-content: center; padding: 0 3px; border: 2px solid #18151f; }
  .emp-card { background: #ffffff; border-radius: 16px; padding: 1.5rem 1.6rem; margin-bottom: 1.1rem;
    box-shadow: 0 6px 28px rgba(30,26,62,0.22), 0 2px 8px rgba(30,26,62,0.12);
    border: 1px solid rgba(255,255,255,0.85); position: relative; overflow: hidden; }
  .emp-card::before { content:''; position:absolute; top:0; left:0; bottom:0; width:4px; border-radius:16px 0 0 16px; background:#0d6e6e;box-shadow:0 4px 14px rgba(13,110,110,.35); }
  .emp-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.1rem; flex-wrap: wrap; gap: 0.5rem; }
  .emp-title { font-size: 0.93rem; font-weight: 700; color: #1a1730; }
  .emp-hdr-right { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }
  .gap-pill { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.26rem 0.8rem;
    border-radius: 999px; font-size: 0.72rem; font-weight: 700; cursor: pointer;
    font-family: inherit; transition: all 0.18s;
    border: 1.5px solid #e2e8f0; background: #f8fafc; color: #64748b; }
  .gap-pill:hover { border-color: #f59e0b; background: #fffbeb; color: #92400e; }
  .gap-pill.on { border-color: #f59e0b; background: #fffbeb; color: #92400e; }
  .guide-banner { background: #eef2ff; border: 1.5px solid #c7d2fe; border-radius: 12px;
    padding: 0.9rem 1.1rem; margin-bottom: 1.1rem; display: flex; gap: 0.75rem; align-items: flex-start; }
  .guide-steps { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.4rem; }
  .guide-step { font-size: 0.72rem; font-weight: 700; color: #0d6e6e; background: #e0e7ff;
    padding: 0.2rem 0.55rem; border-radius: 999px; white-space: nowrap; }
  .guide-arrow { font-size: 0.7rem; color: #94a3b8; }
  .exp-card { background: #ffffff; border-radius: 16px; padding: 1.5rem 1.6rem; margin-bottom: 1.1rem;
    box-shadow: 0 6px 28px rgba(30,26,62,0.22), 0 2px 8px rgba(30,26,62,0.12);
    border: 1px solid rgba(255,255,255,0.85); position: relative; overflow: hidden; }
  .exp-card::before { content:''; position:absolute; top:0; left:0; bottom:0; width:4px; border-radius:16px 0 0 16px; background:#7c3aed; }
  .gap-reason-box { background: #fffbeb; border: 1.5px solid #fde68a; border-radius: 10px;
    padding: 0.9rem 1rem; margin-top: 0.7rem; margin-bottom: 0.1rem; }
  .resume-card { background: #ffffff; border-radius: 16px; padding: 1.5rem 1.6rem; margin-bottom: 1.1rem;
    box-shadow: 0 6px 28px rgba(30,26,62,0.22), 0 2px 8px rgba(30,26,62,0.12);
    border: 1px solid rgba(255,255,255,0.85); position: relative; overflow: hidden; }
  .resume-card::before { content:''; position:absolute; top:0; left:0; bottom:0; width:4px; border-radius:16px 0 0 16px; background:#16a34a; }
  .subsec { background: #f0effe; border: 1px solid #dddaf0; border-radius: 10px; padding: 1rem 1.1rem; margin-top: 0.85rem; }
  .sub-lbl { font-size: 0.68rem; font-weight: 800; color: #8b88b0; text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 0.75rem; }
  .decl-card { background: #ffffff; border-radius: 16px; padding: 1.5rem 1.6rem; margin-bottom: 1.1rem;
    box-shadow: 0 6px 28px rgba(30,26,62,0.22), 0 2px 8px rgba(30,26,62,0.12);
    border: 1px solid rgba(255,255,255,0.85); position: relative; overflow: hidden; }
  .decl-card::before { content:''; position:absolute; top:0; left:0; bottom:0; width:4px; border-radius:16px 0 0 16px; background:#7c3aed; }
  .decl-q { font-size: 0.875rem; color: #1a1730; margin-bottom: 0.3rem; font-weight: 600; line-height: 1.5; }
  .decl-sub { font-size: 0.78rem; color: #6b6894; line-height: 1.55; margin-bottom: 0.6rem; font-weight: 400; }
  .decl-item { padding: 1rem 1.1rem; background: #f0effe; border-radius: 10px; border: 1px solid #dddaf0; margin-bottom: 0.75rem; }
  .fr { display: flex; gap: 0.9rem; flex-wrap: wrap; margin-bottom: 0.85rem; }
  .fr:last-child { margin-bottom: 0; }
  .fi { display: flex; flex-direction: column; gap: 0.28rem; flex: 1; min-width: 138px; }
  .fl { font-size: 0.7rem; font-weight: 700; color: #8b88b0; letter-spacing: 0.55px; text-transform: uppercase; }
  .in { padding: 0.65rem 0.875rem; background: #f0ece6; border: 1.5px solid #d8d4e3;
    border-radius: 9px; font-family: inherit; font-size: 0.875rem; color: #1a1730;
    outline: none; width: 100%; transition: all 0.18s; }
  .in:focus { border-color: #0d6e6e; background: #fff; box-shadow: 0 0 0 3px rgba(13,110,110,0.13); }
  .in.err { border-color: #ef4444 !important; background: #fff8f8 !important; box-shadow: 0 0 0 3px rgba(239,68,68,0.10) !important; }
  .err-msg { font-size: 0.68rem; color: #ef4444; font-weight: 600; margin-top: 0.2rem; display: block; }
  .ta { padding: 0.65rem 0.875rem; background: #f0ece6; border: 1.5px solid #d8d4e3;
    border-radius: 9px; font-family: inherit; font-size: 0.875rem; color: #1a1730;
    outline: none; width: 100%; min-height: 72px; resize: vertical; transition: all 0.18s; }
  .ta:focus { border-color: #0d6e6e; background: #fff; box-shadow: 0 0 0 3px rgba(13,110,110,0.13); }
  .ta.err { border-color: #ef4444 !important; background: #fff8f8 !important; }
  .date-input { padding: 0.65rem 0.875rem; background: #f0ece6; border: 1.5px solid #d8d4e3;
    border-radius: 9px; font-family: inherit; font-size: 0.875rem; color: #1a1730;
    outline: none; width: 100%; transition: all 0.18s; }
  .date-input:focus { border-color: #0d6e6e; background: #fff; box-shadow: 0 0 0 3px rgba(13,110,110,0.13); }
  .date-input::placeholder { color: #d8d4e3; }
  .date-input.err { border-color: #ef4444 !important; background: #fff8f8 !important; }
  .date-display { margin-top: 0.22rem; font-size: 0.72rem; color: #0d6e6e; font-weight: 600; letter-spacing: 0.2px; }
  .add-btn { padding: 0.6rem 1.4rem; background: #eef2ff; color: #0d6e6e; border: 1.5px solid #c7d2fe;
    border-radius: 10px; font-family: inherit; font-size: 0.875rem; font-weight: 700; cursor: pointer; margin-bottom: 1.1rem; }
  .rm-btn { padding: 0.3rem 0.75rem; background: #fff5f5; color: #ef4444; border: 1.5px solid #fecaca;
    border-radius: 7px; font-size: 0.75rem; font-weight: 600; cursor: pointer; font-family: inherit; }
  .att-lbl { font-size: 0.7rem; font-weight: 700; color: #8b88b0; letter-spacing: 0.55px; text-transform: uppercase; display: block; margin-bottom: 0.28rem; }
  .att-wrap { margin-bottom: 0.65rem; }
  .cur-badge { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.22rem 0.7rem;
    border-radius: 999px; font-size: 0.68rem; font-weight: 700; background: #dcfce7;
    color: #15803d; border: 1.5px solid #bbf7d0; white-space: nowrap; }
  .sbar { display: flex; justify-content: space-between; align-items: center;
    margin-top: 1.5rem; padding: 1rem 1.5rem; background: #111;
    border-radius: 14px; box-shadow: 0 4px 20px rgba(15,12,40,0.28); }
  .ss { font-size: 0.84rem; color: #8b92a8; font-weight: 500; }
  .ss.ok{color:#4ade80;} .ss.err{color:#f87171;}
  .pbtn { padding: 0.72rem 1.9rem; background: #0d6e6e; color: #fff; border: none;
    border-radius: 10px; font-family: inherit; font-size: 0.875rem; font-weight: 700;
    cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(13,110,110,0.4); }
  .pbtn:hover { background: #0f8a8a; transform: translateY(-1px); }
  .sbtn { padding: 0.72rem 1.5rem; background: transparent; color: #8b92a8;
    border: 1.5px solid #2a2535; border-radius: 10px; font-family: inherit;
    font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .sbtn:hover { border-color: #0d6e6e; color: #0d6e6e; }
  @media (max-width:640px){ .fr{flex-direction:column;} .fi{min-width:100%;} .topbar{flex-direction:column;gap:0.6rem;position:relative;} }
`;

const ACK_DEFS = [
  { key:"business", title:"Other Business or Employment", question:"Are you currently engaged in any other business, employment, or professional activity outside of this role?", detail:"This includes part-time employment, freelance or consulting work, directorships, partnerships, or any activity that generates income or could create a conflict of interest." },
  { key:"dismissed", title:"Dismissal or Termination for Cause", question:"Have you ever been dismissed, discharged, or asked to resign from any position of employment for reasons of misconduct, performance, or any disciplinary action?", detail:"This includes termination with cause, constructive dismissal, or any exit that followed a formal disciplinary process." },
  { key:"criminal", title:"Criminal Conviction or Pending Proceedings", question:"Have you ever been convicted of a criminal offence, or do you currently have any criminal proceedings pending against you in any court of law?", detail:"This includes convictions resulting in fines, community service, probation, imprisonment, or any other sentence." },
  { key:"civil", title:"Civil Judgments or Regulatory Actions", question:"Have you ever had a civil judgment entered against you, or been subject to a regulatory finding, ban, or sanction by any court, tribunal, or regulatory authority?", detail:"This includes money decrees, injunctions, adverse orders in consumer or labour disputes." },
];

// ── DateField: no calendar, DD/MM/YYYY input, shows month name below ──
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
      if(d&&mo&&y&&y.length===4){
        s(`${y}-${mo}-${d}`);
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

function ExitAckModal({ onSaveAndExit, onExitWithout, onCancel }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,12,40,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(4px)"}}>
      <div style={{background:"#fff",borderRadius:18,padding:"2rem",maxWidth:400,width:"90%",textAlign:"center",boxShadow:"0 24px 60px rgba(15,12,40,0.3)",border:"1.5px solid #fde68a"}}>
        <div style={{fontSize:34,marginBottom:"0.75rem"}}>⚠️</div>
        <h3 style={{margin:"0 0 0.4rem",color:"#1a1730",fontWeight:800,fontSize:"1.05rem"}}>Unsaved Changes</h3>
        <p style={{color:"#6b6894",fontSize:"0.875rem",marginBottom:"1.5rem",lineHeight:1.55}}>You have unsaved employment data. Save before leaving?</p>
        <div style={{display:"flex",gap:"0.6rem",flexWrap:"wrap"}}>
          <button onClick={onCancel} style={{flex:1,padding:"0.65rem",borderRadius:9,border:"1.5px solid #dddaf0",background:"#f7f6fd",cursor:"pointer",fontWeight:600,color:"#6b6894",fontFamily:"inherit",minWidth:80}}>Stay</button>
          <button onClick={onExitWithout} style={{flex:1,padding:"0.65rem",borderRadius:9,border:"1.5px solid #fecaca",background:"#fff5f5",color:"#ef4444",cursor:"pointer",fontWeight:600,fontFamily:"inherit",minWidth:80}}>Exit anyway</button>
          <button onClick={onSaveAndExit} style={{flex:1,padding:"0.65rem",borderRadius:9,border:"none",background:"#0d6e6e",color:"#fff",cursor:"pointer",fontWeight:700,fontFamily:"inherit",minWidth:80}}>Save & Exit</button>
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
            {i<steps.length-1&&<div style={{width:38,height:2,background:current>s.n?STEP_CONN:"#c2d9c8",margin:"0 -0.25rem",marginBottom:"1.4rem",borderRadius:2,flexShrink:0}}/>}
          </div>
        );
      })}
    </div>
  );
}

function F({ l, v, s, t="text", r=true, mx, errKey, errors, onFix }) {
  const hasErr = errKey&&errors&&errors[errKey];
  return (<div className="fi"><span className="fl">{l}{r&&<span style={{color:"#ef4444",marginLeft:2}}>*</span>}</span><input className={`in${hasErr?" err":""}`} type={t} value={v||""} maxLength={mx} onChange={e=>{s(e.target.value);if(onFix&&hasErr)onFix(errKey);}}/>{hasErr&&<span className="err-msg">Required</span>}</div>);
}
function FS({ l, v, s, o, r=true, errKey, errors, onFix }) {
  const hasErr = errKey&&errors&&errors[errKey];
  return (<div className="fi"><span className="fl">{l}{r&&<span style={{color:"#ef4444",marginLeft:2}}>*</span>}</span><select className={`in${hasErr?" err":""}`} value={v} onChange={e=>{s(e.target.value);if(onFix&&hasErr)onFix(errKey);}} style={{background:v?"#fff":"#f2f1f9",color:v?"#1a1730":"#8b88b0"}}><option value="">Select</option>{o.map(x=><option key={x} value={x}>{x}</option>)}</select>{hasErr&&<span className="err-msg">Required</span>}</div>);
}
function TA({ l, v, s, r=true, errKey, errors, onFix }) {
  const hasErr = errKey&&errors&&errors[errKey];
  return (<div style={{width:"100%",marginBottom:"0.75rem"}}><span className="fl">{l}{r&&<span style={{color:"#ef4444",marginLeft:2}}>*</span>}</span><textarea className={`ta${hasErr?" err":""}`} value={v||""} onChange={e=>{s(e.target.value);if(onFix&&hasErr)onFix(errKey);}}/>{hasErr&&<span className="err-msg">Required</span>}</div>);
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

export default function PreviousCompany() {
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

  const [showSignout,setShowSignout]   = useState(false);
  const [showExitAck,setShowExitAck]   = useState(false);
  const [exitTarget,setExitTarget]     = useState(null);
  const [exitAction,setExitAction]     = useState(null);
  const [saveStatus,setSaveStatus]     = useState("");
  const [midSaveStatus,setMidSaveStatus] = useState("");
  const [loading,setLoading]           = useState(true);
  const [employeeId,setEmployeeId]     = useState("");
  const [resumeKey,setResumeKey]       = useState("");
  const [hasExperience,setHasExperience] = useState("");
  const [employments,setEmployments]   = useState([emptyEmployment()]);
  const [activeUploads, setActiveUploads] = useState(0);
  const handleUploadState = useCallback((active) => setActiveUploads(c => Math.max(0, c + (active ? 1 : -1))), []);
  const [ack,setAck]                   = useState({business:emptyAck(),dismissed:emptyAck(),criminal:emptyAck(),civil:emptyAck()});
  const [declared,setDeclared]         = useState(false);
  const [errors,setErrors]             = useState({});
  const isDirtyRef = useRef(false);
  const wasEdited = useRef(false);

  const todayISO = new Date().toISOString().split("T")[0];

  useEffect(()=>{
    if(!ready)return;
    if(!user){router.replace("/employee/login");return;}
    if(user.role!=="employee"){router.replace("/employee/login");return;}
  },[ready,user,router]);

  useEffect(()=>{
    if(!ready||!user)return;
    const fetchData=async()=>{
      try{
        const draftRes=await apiFetch(`${API}/employee/draft`);
        if(!draftRes.ok){setLoading(false);return;}
        const draft=await draftRes.json();
        if(!draft.employee_id){setLoading(false);return;}
        setEmployeeId(draft.employee_id);
        const histRes=await apiFetch(`${API}/employee/employment-history/${draft.employee_id}`);
        if(histRes.ok){
          const data=await histRes.json();
          if(data.employments&&data.employments.length>0){
            setEmployments(data.employments.map(e=>({
              companyName:e.companyName||"",officeAddress:e.officeAddress||"",employeeId:e.employeeId||"",workEmail:e.workEmail||"",
              designation:e.designation||"",department:e.department||"",duties:e.duties||"",employmentType:e.employmentType||"",reasonForRelieving:e.reasonForRelieving||"",
              startDate:e.startDate||"",endDate:e.endDate||"",currentlyWorking:e.currentlyWorking||"",
              reference:{role:e.reference?.role||"",name:e.reference?.name||"",email:e.reference?.email||"",mobile:e.reference?.mobile||""},
              contractVendor:{company:e.contractVendor?.company||"",email:e.contractVendor?.email||"",mobile:e.contractVendor?.mobile||""},
              documents:{payslipsKey:e.documents?.payslipsKey||"",offerLetterKey:e.documents?.offerLetterKey||"",resignationKey:e.documents?.resignationKey||"",experienceKey:e.documents?.experienceKey||"",idCardKey:e.documents?.idCardKey||""},
              gap:{hasGap:e.gap?.hasGap||"",reason:e.gap?.reason||"",from:e.gap?.from||"",to:e.gap?.to||""},company_id:e.company_id||genId(),
            })));
          }
          if(data.acknowledgements){
            const a=data.acknowledgements;
            setAck({business:{val:a.business?.val||"",note:a.business?.note||""},dismissed:{val:a.dismissed?.val||"",note:a.dismissed?.note||""},criminal:{val:a.criminal?.val||"",note:a.criminal?.note||""},civil:{val:a.civil?.val||"",note:a.civil?.note||""}});
          }
          if(data.resumeKey) setResumeKey(data.resumeKey);
          if(data.hasExperience) setHasExperience(data.hasExperience);
          if(typeof data.declared==="boolean") setDeclared(data.declared);
        }
      }catch(_){}
      setLoading(false);
    };
    fetchData();
  },[ready,user,apiFetch]);

  // Mark edited — resets declaration so user must re-confirm
  const markEdited = () => {
    wasEdited.current = true;
    setDeclared(false);
    isDirtyRef.current = true;
  };

  const update = (i, path, value) => {
    setEmployments(prev => {
      const updated = [...prev];
      const keys = path.split(".");
      let obj = { ...updated[i] };
      let current = obj;
      for (let k = 0; k < keys.length - 1; k++) {
        current[keys[k]] = { ...current[keys[k]] };
        current = current[keys[k]];
      }
      current[keys[keys.length - 1]] = value;
      updated[i] = obj;
      return updated;
    });
    markEdited();
  };

  const addEmployer=()=>{setEmployments([...employments,emptyEmployment()]);markEdited();};
  const removeEmployer=(i)=>{setEmployments(employments.filter((_,idx)=>idx!==i));markEdited();};
  const fixErr=(key)=>setErrors(p=>({...p,[key]:false}));

  const validate=()=>{
    const e={};
    if(!resumeKey) e.resumeKey=true;
    if(!hasExperience) e.hasExperience=true;
    if(hasExperience==="Yes"){
      employments.forEach((emp,i)=>{
        if(!emp.companyName) e[`${i}_companyName`]=true;
        if(!emp.officeAddress) e[`${i}_officeAddress`]=true;
        if(!emp.employeeId) e[`${i}_employeeId`]=true;
        if(!emp.workEmail) e[`${i}_workEmail`]=true;
        if(!emp.designation) e[`${i}_designation`]=true;
        if(!emp.department) e[`${i}_department`]=true;
        if(!emp.duties) e[`${i}_duties`]=true;
        if(!emp.employmentType) e[`${i}_employmentType`]=true;
        if(emp.employmentType==="Contract"){
          if(!emp.contractVendor.company) e[`${i}_vendorCompany`]=true;
          if(!emp.contractVendor.email) e[`${i}_vendorEmail`]=true;
          if(!emp.contractVendor.mobile) e[`${i}_vendorMobile`]=true;
        }
        if(!emp.startDate) e[`${i}_startDate`]=true;
        const lastIdx = employments.length - 1;
        if(i===lastIdx){
          if(!emp.currentlyWorking) e[`${i}_currentlyWorking`]=true;
          if(emp.currentlyWorking==="No"&&!emp.endDate) e[`${i}_endDate`]=true;
        } else {
          if(!emp.endDate) e[`${i}_endDate`]=true;
        }
        if(!(i===lastIdx&&emp.currentlyWorking==="Yes")&&!emp.reasonForRelieving) e[`${i}_reasonForRelieving`]=true;
        const stillWorking = i===lastIdx && emp.currentlyWorking==="Yes";
        if(!stillWorking&&!emp.reference.role) e[`${i}_refRole`]=true;
        if(!stillWorking&&!emp.reference.name) e[`${i}_refName`]=true;
        if(!stillWorking&&!emp.reference.email) e[`${i}_refEmail`]=true;
        if(!stillWorking&&!emp.reference.mobile) e[`${i}_refMobile`]=true;
        if(!stillWorking&&!emp.documents.payslipsKey) e[`${i}_payslips`]=true;
        if(!emp.documents.offerLetterKey) e[`${i}_offerLetter`]=true;
        // Resignation Acceptance proves you properly left the employer immediately
        // before your current/latest one — it belongs on the second-to-last entry,
        // never the latest (you can't resign from a job you're still doing), and
        // never further back (only the immediate hand-off matters for verification).
        // This is fully dynamic: if you later add a new current employer and mark
        // an old "current" entry as ended, whichever entry is now second-to-last
        // automatically becomes the one requiring this — no manual re-tagging needed.
        // Resignation Acceptance is required from whoever is the LAST employer in the
        // list — but only once THEY have an end date (no longer currently working).
        // Nothing is required while the last entry is still marked as current — there's
        // no completed transition to document yet.
        if(i===lastIdx && emp.currentlyWorking==="No" && !emp.documents.resignationKey) e[`${i}_resignation`]=true;
        // Experience letter not required for current employer (no end date yet)
        // Experience/Relieving Letter is NOT a submission blocker — former employers can take
        // weeks to issue these. We just remind the employee to attach it once they have it
        // (see the note rendered next to the upload field below).
        if(emp.gap.hasGap==="Yes"&&!emp.gap.reason) e[`${i}_gapReason`]=true;
        if(emp.gap.hasGap==="Yes"&&!emp.gap.from) e[`${i}_gapFrom`]=true;
        if(emp.gap.hasGap==="Yes"&&!emp.gap.to) e[`${i}_gapTo`]=true;
      });
    }
    ACK_DEFS.forEach(({key})=>{ if(!ack[key].val) e[`ack_${key}`]=true; });
    if(!declared) e.declared=true;
    return e;
  };

  const saveHistory=async()=>{
    if(!employeeId) throw new Error("Please complete and save Page 1 first");

    if(resumeKey||hasExperience){
      const existingRes = await apiFetch(`${API}/employee/draft`);
      const existing = existingRes.ok ? await existingRes.json() : {};
      await apiFetch(`${API}/employee`,{method:"POST",body:JSON.stringify({
        ...existing,
        employee_id: employeeId,
        resumeKey,
        hasExperience,
        last_saved_at: Date.now(),
        // ── Cascade flag: if page 3 was edited, page 5 review acks must be re-done
        page3_edited: wasEdited.current ? true : (existing.page3_edited || false),
        // Reset review acks so page 5 prompts again
        ...(wasEdited.current ? { acknowledgements_review: {} } : {}),
      })});
    }

    const res=await apiFetch(`${API}/employee/employment-history`,{method:"POST",body:JSON.stringify({employments,acknowledgements:ack,declared,resumeKey,hasExperience})});
    if(!res.ok) throw new Error(parseError(await res.json().catch(()=>({}))));
    isDirtyRef.current=false;
  };

  const handleSaveSignout=async()=>{
    try {
      await saveHistory();
      logout();
    } catch (e) {
      alert("Your changes could not be saved. Please check your connection and try again before signing out — signing out now would lose them.");
    }
  };
  const handleMidSave=async()=>{
    setMidSaveStatus("Saving…");
    try{await saveHistory();setMidSaveStatus("Saved ✓");setTimeout(()=>setMidSaveStatus(""),2000);}
    catch(_){setMidSaveStatus("Error");setTimeout(()=>setMidSaveStatus(""),2500);}
  };
  const handleNavigate=async(path)=>{if(isDirtyRef.current){setExitTarget(path);setExitAction("nav");setShowExitAck(true);return;}router.push(path);};
  const handleSignout=()=>{if(isDirtyRef.current){setExitAction("signout");setShowExitAck(true);return;}logout();};
  const onSaveAndExit=async()=>{try{await saveHistory();}catch(_){}setShowExitAck(false);if(exitAction==="signout")logout();else if(exitTarget){const dest=exitTarget==="/employee/review"?"/employee/review?edited=1":exitTarget;router.push(dest);}};
  const onExitWithout=()=>{setShowExitAck(false);isDirtyRef.current=false;if(exitAction==="signout")logout();else if(exitTarget)router.push(exitTarget);};

  const handleNext=async()=>{
    const errs=validate();
    if(Object.keys(errs).length>0){
      setErrors(errs);setSaveStatus("Please fill all required fields ↑");
      setTimeout(()=>{const el=document.querySelector(".in.err,.ta.err");if(el)el.scrollIntoView({behavior:"smooth",block:"center"});},60);
      return;
    }
    setSaveStatus("Saving...");
    try{
      await saveHistory();
      setSaveStatus("Saved ✓");
      // If page 3 was edited, signal review page to re-ask acks
      const dest = wasEdited.current ? "/employee/uan?p3edited=1" : "/employee/uan";
      router.push(dest);
    }
    catch(err){setSaveStatus(`Error: ${err.message||"Could not save"}`);}
  };

  if(!ready||!user)return null;
  if(loading)return(<div style={{minHeight:"100vh",background:"#f5f4f0",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"#8b88b0",fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>Loading employment history…</p></div>);

  return (
    <>
      <style>{G}</style>
      <div className="pg">
        {showSignout&&<SignoutModal onConfirm={()=>{isDirtyRef.current=false;logout();}} onCancel={()=>setShowSignout(false)}/>}
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
        {showExitAck&&<ExitAckModal onSaveAndExit={onSaveAndExit} onExitWithout={onExitWithout} onCancel={()=>setShowExitAck(false)}/>}

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
          <StepNav current={3} onNavigate={handleNavigate}/>

          {/* ── Guide ── */}
          <div className="guide-banner">
            <div style={{fontSize:"1.2rem",flexShrink:0}}>💡</div>
            <div style={{flex:1}}>
              <div style={{fontSize:"0.82rem",fontWeight:700,color:"#3730a3",marginBottom:"0.25rem"}}>Employment History — Chronological Order</div>
              <div style={{fontSize:"0.72rem",color:"#6b6894",lineHeight:1.5}}>Please add your employment history in chronological order, beginning with your first role and concluding with your current or most recent position.</div>
            </div>
          </div>

          {/* ── Experience toggle ── */}
          <div className="exp-card">
            <div style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"0.85rem"}}>
              <div style={{width:32,height:32,borderRadius:8,background:"#f5f3ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.95rem",flexShrink:0}}>💼</div>
              <span style={{fontSize:"0.93rem",fontWeight:700,color:"#1a1730"}}>Work Experience <span style={{color:"#ef4444",fontSize:"0.82rem"}}>*</span></span>
            </div>
            <p style={{fontSize:"0.82rem",color:"#4b5563",marginBottom:"0.85rem",fontWeight:500,lineHeight:1.55}}>Do you have prior work experience?</p>
            <div style={{display:"flex",gap:"0.65rem"}}>
              {["Yes","No"].map(v=>(
                <button key={v} onClick={()=>{setHasExperience(v);markEdited();fixErr("hasExperience");}} style={{padding:"0.45rem 1.6rem",borderRadius:999,border:hasExperience===v?"2px solid #7c3aed":"1.5px solid #dddaf0",background:hasExperience===v?"#7c3aed":"#f2f1f9",color:hasExperience===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.875rem",fontWeight:700,transition:"all 0.18s"}}>{v}</button>
              ))}
            </div>
            {errors.hasExperience&&<span className="err-msg" style={{marginTop:"0.4rem",display:"block"}}>Please select Yes or No</span>}
          </div>

          {/* ── Resume ── */}
          <div className="resume-card">
            <div style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"0.9rem"}}>
              <div style={{width:32,height:32,borderRadius:8,background:"#f0fdf4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.95rem",flexShrink:0}}>📄</div>
              <span style={{fontSize:"0.93rem",fontWeight:700,color:"#1a1730"}}>Latest Resume / CV <span style={{color:"#ef4444",fontSize:"0.82rem"}}>*</span></span>
            </div>
            {errors.resumeKey&&<span className="err-msg" style={{marginBottom:"0.5rem",display:"block"}}>Resume upload is required</span>}
            <FileUpload onUploadStateChange={handleUploadState} label="Upload Resume / CV *" category="general" subKey="cv" employeeId={employeeId} apiFetch={apiFetch} value={resumeKey} onChange={(k)=>{const key=typeof k==="string"?k:(k?.key||k?.s3_key||"");setResumeKey(key);markEdited();fixErr("resumeKey");}}/>
          </div>

          {/* ── Employer cards ── */}
          {hasExperience==="Yes"&&(<>
          {employments.map((emp,index)=>{
            const isLast = index === employments.length - 1;
            const isCurrentlyWorking = isLast && emp.currentlyWorking==="Yes";
            const gapPillLabel = emp.gap.hasGap==="Yes"
              ? (index===0?"Gap before joining: Yes":"Gap before this job: Yes")
              : (index===0?"Gap before joining?":"Gap before this job?");
            const gapHint = index===0
              ? "Any gap between finishing your education and joining this company."
              : `Any gap between leaving ${employments[index-1]?.companyName||"the previous company"} and joining this one.`;

            return (
            <div key={emp.company_id} className="emp-card">
              <div className="emp-hdr">
                <div style={{display:"flex",alignItems:"center",gap:"0.55rem",flexWrap:"wrap"}}>
                  <span className="emp-title">{employments.length===1?`Employer 1${emp.currentlyWorking==="Yes"?" — Current":""}`:isLast?"Current / Most Recent Employer":index===0?"First Job / Oldest Employer":`Employer ${index + 1}`}</span>
                  {isLast&&isCurrentlyWorking&&<span className="cur-badge">✓ Currently working here</span>}
                </div>
                <div className="emp-hdr-right">
                  {index > 0 && <button className={`gap-pill${emp.gap.hasGap==="Yes"?" on":""}`} onClick={()=>update(index,"gap.hasGap",emp.gap.hasGap==="Yes"?"":"Yes")}>⏱ {gapPillLabel}</button>}
                  {employments.length>1&&<button className="rm-btn" onClick={()=>removeEmployer(index)}>− Remove</button>}
                </div>
              </div>

              {emp.gap.hasGap==="Yes"&&(
                <div className="gap-reason-box">
                  <p style={{fontSize:"0.71rem",color:"#92400e",marginBottom:"0.5rem",fontWeight:500,lineHeight:1.4}}>{gapHint}</p>
                  <div className="fr" style={{marginBottom:"0.6rem"}}>
                    <FDate l="Gap From" v={emp.gap.from} s={v=>update(index,"gap.from",v)} errKey={`${index}_gapFrom`} errors={errors} onFix={fixErr}/>
                    <FDate l="Gap To" v={emp.gap.to} s={v=>update(index,"gap.to",v)} errKey={`${index}_gapTo`} errors={errors} onFix={fixErr}/>
                  </div>
                  <span className="fl" style={{display:"block",marginBottom:"0.35rem"}}>Reason for Gap <span style={{color:"#ef4444"}}>*</span></span>
                  <textarea className={`ta${errors[`${index}_gapReason`]?" err":""}`} value={emp.gap.reason||""} placeholder="Describe the gap period and reason…" style={{background:"#fffbeb",borderColor:errors[`${index}_gapReason`]?"#ef4444":"#fde68a"}} onChange={e=>{update(index,"gap.reason",e.target.value);fixErr(`${index}_gapReason`);}}/>
                  {errors[`${index}_gapReason`]&&<span className="err-msg">Required</span>}
                </div>
              )}

              <div className="fr">
                <F l="Company Name" v={emp.companyName} s={v=>update(index,"companyName",v)} errKey={`${index}_companyName`} errors={errors} onFix={fixErr}/>
                <F l="Office Address" v={emp.officeAddress} s={v=>update(index,"officeAddress",v)} errKey={`${index}_officeAddress`} errors={errors} onFix={fixErr}/>
              </div>
              <div className="fr">
                <F l="Employee ID" v={emp.employeeId} s={v=>update(index,"employeeId",v)} errKey={`${index}_employeeId`} errors={errors} onFix={fixErr}/>
                <F l="Official Work Email" v={emp.workEmail} s={v=>update(index,"workEmail",v)} errKey={`${index}_workEmail`} errors={errors} onFix={fixErr}/>
              </div>
              <div className="fr">
                <F l="Designation" v={emp.designation} s={v=>update(index,"designation",v)} errKey={`${index}_designation`} errors={errors} onFix={fixErr}/>
                <F l="Department" v={emp.department} s={v=>update(index,"department",v)} errKey={`${index}_department`} errors={errors} onFix={fixErr}/>
              </div>
              <div className="fr">
                <F l="Duties & Responsibilities" v={emp.duties} s={v=>update(index,"duties",v)} errKey={`${index}_duties`} errors={errors} onFix={fixErr}/>
                <FS l="Employment Type" v={emp.employmentType} s={v=>update(index,"employmentType",v)} o={["Full-time","Intern","Contract"]} errKey={`${index}_employmentType`} errors={errors} onFix={fixErr}/>
              </div>

              <div className="fr">
                <FDate l="Date of Joining" v={emp.startDate} s={v=>update(index,"startDate",v)} errKey={`${index}_startDate`} errors={errors} onFix={fixErr}/>
                {(!isLast || emp.currentlyWorking==="No")&&(
                  <FDate l="Date of Leaving" v={emp.endDate} s={v=>update(index,"endDate",v)} errKey={`${index}_endDate`} errors={errors} onFix={fixErr}/>
                )}
                {isLast&&(
                  <div className="fi">
                    <span className="fl">Currently Working Here <span style={{color:"#ef4444",marginLeft:2}}>*</span></span>
                    <div style={{display:"flex",gap:"0.55rem",marginTop:"0.15rem"}}>
                      {["Yes","No"].map(v=>(
                        <button key={v} onClick={()=>{update(index,"currentlyWorking",v);fixErr(`${index}_currentlyWorking`);}} style={{flex:1,padding:"0.62rem 0",borderRadius:9,border:emp.currentlyWorking===v?"2px solid #0d6e6e":"1.5px solid #d8d4e3",background:emp.currentlyWorking===v?"#0d6e6e":"#f5f4f0",color:emp.currentlyWorking===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.82rem",fontWeight:700,fontFamily:"inherit",transition:"all 0.18s"}}>{v}</button>
                      ))}
                    </div>
                    {errors[`${index}_currentlyWorking`]&&<span className="err-msg">Required</span>}
                  </div>
                )}
              </div>

              {emp.employmentType==="Contract"&&(
                <div className="subsec">
                  <div className="sub-lbl">Vendor / Third-Party Details</div>
                  <div className="fr">
                    <F l="Vendor Company" v={emp.contractVendor.company} s={v=>update(index,"contractVendor.company",v)} r={true} errKey={`${index}_vendorCompany`} errors={errors} onFix={fixErr}/>
                    <F l="Vendor Email" v={emp.contractVendor.email} s={v=>update(index,"contractVendor.email",v)} r={true} errKey={`${index}_vendorEmail`} errors={errors} onFix={fixErr}/>
                    <F l="Vendor Mobile" v={emp.contractVendor.mobile} s={v=>/^\d*$/.test(v)&&update(index,"contractVendor.mobile",v)} mx={10} r={true} errKey={`${index}_vendorMobile`} errors={errors} onFix={fixErr}/>
                  </div>
                </div>
              )}

              {!(isLast && emp.currentlyWorking==="Yes") && (
                <div style={{marginTop:"0.75rem"}}>
                  <TA l="Reason for Relieving / Leaving" v={emp.reasonForRelieving} s={v=>update(index,"reasonForRelieving",v)} errKey={`${index}_reasonForRelieving`} errors={errors} onFix={fixErr}/>
                </div>
              )}

              <div className="subsec">
                <div className="sub-lbl">Reference Details{isLast&&emp.currentlyWorking==="Yes"&&<span style={{fontSize:"0.7rem",color:"#16a34a",fontWeight:500,marginLeft:"0.5rem"}}>(optional while currently employed)</span>}</div>
                <p style={{fontSize:"0.72rem",color:"#6b6894",marginTop:"-0.35rem",marginBottom:"0.7rem",lineHeight:1.5}}>A colleague or manager at <strong>this company</strong> who can confirm your role if our verification team calls or emails them — not the person who referred you for a job.</p>
                <div className="fr">
                  <FS l="Reference Role" v={emp.reference.role} s={v=>update(index,"reference.role",v)} o={["Manager","Colleague","HR","Client"]} r={false} errKey={`${index}_refRole`} errors={errors} onFix={fixErr}/>
                  <F l="Reference Name" v={emp.reference.name} s={v=>update(index,"reference.name",v)} r={false} errKey={`${index}_refName`} errors={errors} onFix={fixErr}/>
                </div>
                <div className="fr">
                  <F l="Reference Official Email" v={emp.reference.email} s={v=>update(index,"reference.email",v)} r={false} errKey={`${index}_refEmail`} errors={errors} onFix={fixErr}/>
                  <F l="Reference Mobile" v={emp.reference.mobile} s={v=>/^\d*$/.test(v)&&update(index,"reference.mobile",v)} mx={10} r={false} errKey={`${index}_refMobile`} errors={errors} onFix={fixErr}/>
                </div>
              </div>

              <div className="subsec">
                <div className="sub-lbl">Attachments</div>

                {/* Offer Letter — always required for every employer */}
                <div className="att-wrap">
                  <span className="att-lbl">Offer Letter <span style={{color:"#ef4444"}}>*</span></span>
                  {errors[`${index}_offerLetter`]&&<span className="err-msg" style={{marginBottom:"0.3rem"}}>Upload required</span>}
                  <FileUpload onUploadStateChange={handleUploadState} label="Offer Letter" category="employment" subKey="offerLetter" employeeId={employeeId} companyId={emp.company_id||undefined} apiFetch={apiFetch} value={emp.documents.offerLetterKey} onChange={v=>{const k=typeof v==="string"?v:(v?.key||v?.s3_key||"");update(index,"documents.offerLetterKey",k);fixErr(`${index}_offerLetter`);}}/>
                </div>

                {/* Currently employed — no other docs needed yet */}
                {isCurrentlyWorking && (
                  <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:9,padding:"0.7rem 0.9rem",fontSize:"0.76rem",color:"#15803d",lineHeight:1.6,marginTop:"0.25rem"}}>
                    ℹ️ You're currently employed here. Payslips, resignation letter, and experience letter will be collected once you update your end date.
                  </div>
                )}

                {/* Left this company — collect remaining docs */}
                {!isCurrentlyWorking && (<>
                  <div className="att-wrap">
                    <span className="att-lbl">Payslips — Last 3 Months <span style={{color:"#ef4444"}}>*</span></span>
                    <p style={{fontSize:"0.68rem",color:"#6b6894",margin:"0.15rem 0 0.35rem",lineHeight:1.4}}>Merge your last 3 months payslips into one PDF before uploading.</p>
                    {errors[`${index}_payslips`]&&<span className="err-msg" style={{marginBottom:"0.3rem"}}>Upload required</span>}
                    <FileUpload onUploadStateChange={handleUploadState} label="Payslips" category="employment" subKey="payslips" employeeId={employeeId} companyId={emp.company_id||undefined} apiFetch={apiFetch} value={emp.documents.payslipsKey} onChange={v=>{const k=typeof v==="string"?v:(v?.key||v?.s3_key||"");update(index,"documents.payslipsKey",k);fixErr(`${index}_payslips`);}}/>
                  </div>
                  <div className="att-wrap">
                    <span className="att-lbl">Resignation Acceptance{(isLast && emp.currentlyWorking==="No")&&<span style={{color:"#ef4444"}}> *</span>}</span>
                    {(isLast && emp.currentlyWorking==="No") && (
                      <p style={{fontSize:"0.68rem",color:"#6b6894",margin:"0.15rem 0 0.35rem",lineHeight:1.4}}>Proves you properly resigned from this role.</p>
                    )}
                    {errors[`${index}_resignation`]&&<span className="err-msg" style={{marginBottom:"0.3rem"}}>Upload required</span>}
                    <FileUpload onUploadStateChange={handleUploadState} label="Resignation" category="employment" subKey="resignation" employeeId={employeeId} companyId={emp.company_id||undefined} apiFetch={apiFetch} value={emp.documents.resignationKey} onChange={v=>{const k=typeof v==="string"?v:(v?.key||v?.s3_key||"");update(index,"documents.resignationKey",k);fixErr(`${index}_resignation`);}}/>
                  </div>
                  <div className="att-wrap">
                    <span className="att-lbl">Experience / Relieving Letter</span>
                    {!emp.documents.experienceKey && (
                      <p style={{fontSize:"0.72rem",color:"#0369a1",background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:8,padding:"0.5rem 0.75rem",margin:"0.2rem 0 0.4rem",lineHeight:1.5}}>
                        💡 Haven't received it yet? No worries, just come back and add it whenever you receive it — it'll make future onboarding and BGV seamless.
                      </p>
                    )}
                    <FileUpload onUploadStateChange={handleUploadState} label="Experience Letter" category="employment" subKey="experience" employeeId={employeeId} companyId={emp.company_id||undefined} apiFetch={apiFetch} value={emp.documents.experienceKey} onChange={v=>{const k=typeof v==="string"?v:(v?.key||v?.s3_key||"");update(index,"documents.experienceKey",k);}}/>
                  </div>
                  <div className="att-wrap">
                    <span className="att-lbl">Company ID Card</span>
                    <FileUpload onUploadStateChange={handleUploadState} label="ID Card" category="employment" subKey="idCard" employeeId={employeeId} companyId={emp.company_id||undefined} apiFetch={apiFetch} value={emp.documents.idCardKey} onChange={v=>{const k=typeof v==="string"?v:(v?.key||v?.s3_key||"");update(index,"documents.idCardKey",k);}}/>
                  </div>
                </>)}
              </div>
            </div>
            );
          })}
          <button className="add-btn" onClick={()=>{
            const last = employments[employments.length-1];
            if(last && last.currentlyWorking==="Yes" && !last.endDate){
              alert(`Please update the end date for "${last.companyName||"your current employer"}" on this page before adding a new employer.`);
              return;
            }
            addEmployer();
          }}>+ Add New / Current Employer</button>
          </>)}

          {/* ── Other Declarations ── */}
          <div className="decl-card">
            <div style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"0.5rem"}}>
              <div style={{width:32,height:32,borderRadius:8,background:"#f5f3ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.95rem"}}>📋</div>
              <span style={{fontSize:"0.93rem",fontWeight:700,color:"#1a1730"}}>Other Declarations</span>
            </div>
            <p style={{fontSize:"0.78rem",color:"#6b6894",lineHeight:1.6,marginBottom:"1.1rem"}}>Please read each declaration carefully and respond accurately.</p>

            {ACK_DEFS.map(({key,title,question,detail})=>(
              <div key={key} className="decl-item">
                <p style={{fontSize:"0.68rem",fontWeight:800,color:"#7c3aed",textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:"0.35rem"}}>{title} <span style={{color:"#ef4444"}}>*</span></p>
                <p className="decl-q">{question}</p>
                <p className="decl-sub">{detail}</p>
                <div style={{display:"flex",gap:"0.65rem",marginBottom:ack[key].val==="Yes"?"0.75rem":"0"}}>
                  {["Yes","No"].map(v=>(
                    <button key={v} onClick={()=>{setAck({...ack,[key]:{...ack[key],val:v}});markEdited();fixErr(`ack_${key}`);}} style={{padding:"0.3rem 1.1rem",borderRadius:999,border:ack[key].val===v?"2px solid #0d6e6e":"1.5px solid #dddaf0",background:ack[key].val===v?"#0d6e6e":"#f2f1f9",color:ack[key].val===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.82rem",fontWeight:700,transition:"all 0.18s"}}>{v}</button>
                  ))}
                </div>
                {errors[`ack_${key}`]&&<span className="err-msg" style={{marginTop:"0.4rem",display:"block"}}>⚠️ This field is required — please select Yes or No</span>}
                {ack[key].val==="Yes"&&(
                  <div style={{marginTop:"0.6rem"}}>
                    <TA l="Please provide details" v={ack[key].note} s={v=>setAck({...ack,[key]:{...ack[key],note:v}})} r={false}/>
                  </div>
                )}
              </div>
            ))}

            {wasEdited.current && !declared && (
              <div style={{background:"#fff8f0",border:"1.5px solid #fbbf24",borderRadius:10,padding:"0.65rem 1rem",marginBottom:"0.6rem",fontSize:"0.75rem",color:"#92400e",fontWeight:600}}>
                ⚠️ You edited employment information — please re-confirm the declaration below before continuing.
              </div>
            )}
            <div style={{marginTop:"0.5rem",padding:"1rem 1.1rem",borderRadius:10,transition:"all 0.18s",background:errors.declared?"#fff8f8":"#f5f3ff",border:`1.5px solid ${errors.declared?"#fecaca":"#dddaf0"}`}}>
              <label style={{display:"flex",alignItems:"flex-start",gap:"0.75rem",cursor:"pointer"}}>
                <input type="checkbox" checked={declared} onChange={e=>{setDeclared(e.target.checked);isDirtyRef.current=true;if(e.target.checked)fixErr("declared");}} style={{marginTop:"0.18rem",width:17,height:17,accentColor:"#0d6e6e",flexShrink:0,cursor:"pointer"}}/>
                <span style={{fontSize:"0.82rem",color:"#1a1730",fontWeight:500,lineHeight:1.65}}>
                  I hereby declare that all information provided in this employment history section is true, complete, and accurate to the best of my knowledge. I understand that any misrepresentation or omission may result in rejection of my application or termination of employment.
                </span>
              </label>
              {errors.declared&&<p style={{fontSize:"0.68rem",color:"#ef4444",fontWeight:600,marginTop:"0.5rem",marginLeft:"1.7rem"}}>Please confirm this declaration before proceeding</p>}
            </div>
          </div>

          <div className="sbar">
            <button className="sbtn" onClick={()=>handleNavigate("/employee/education")}>← Previous</button>
            <span className={`ss${saveStatus==="Saved ✓"?" ok":saveStatus.startsWith("Error")||saveStatus.includes("required")?" err":""}`}>{saveStatus}</span>
            <div style={{display:"flex",gap:"0.65rem",alignItems:"center"}}>
              <button className="sbtn" onClick={handleMidSave} style={{fontSize:"0.8rem"}}>{midSaveStatus||"Save draft"}</button>
              <button className="pbtn" onClick={handleNext} disabled={activeUploads>0} title={activeUploads>0?"Please wait for the upload to finish before saving":""}>{activeUploads>0?"Uploading…":"Save & Continue →"}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
