// pages/employee/uan.js  — Page 4 of 5
// Fixes:
// 1. DateField — no calendar, DD/MM/YYYY, shows month name
// 2. Signature — NOT cleared when user edits; only cleared manually via "Clear" button
// 3. If user edits after signing: acks reset so they must re-confirm, but signature stays
// 4. Signature + all 3 acks mandatory before Save & Continue
// 5. page4_edited flag saved to DB → page 5 knows to re-ask review acks
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";
import FileUpload from "../../components/FileUpload";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const ACCENTS    = { 1:"#4f46e5", 2:"#d97706", 3:"#7c3aed", 4:"#0891b2", 5:"#16a34a" };
const STEP_DONE_BG = "#2a2460";
const STEP_DONE_CK = "#a78bfa";
const STEP_CONN    = "#a78bfa";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function isoToDisplay(iso) {
  if (!iso || !iso.includes("-")) return iso || "";
  const [y, mo, d] = iso.split("-");
  const idx = parseInt(mo, 10) - 1;
  const mName = MONTH_NAMES[idx] || mo;
  return `${parseInt(d,10)} ${mName} ${y}`;
}

const makePfRecord = (companyName = "") => ({
  companyName, hasPf:"", pfMemberId:"", dojEpfo:"", doeEpfo:"", pfTransferred:"",
});

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #cdd2ed; font-family: 'Plus Jakarta Sans', sans-serif; }
  .pg  { min-height: 100vh; background: #cdd2ed; padding-bottom: 3rem; }
  .wrap { max-width: 860px; margin: auto; padding: 0 1.25rem; }
  .topbar { background: #1e1a3e; border-bottom: 1px solid #2d2860; padding: 0.85rem 1.75rem;
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 1.75rem; position: sticky; top: 0; z-index: 50;
    box-shadow: 0 4px 20px rgba(15,12,40,0.4); }
  .logo-text { font-size: 1.3rem; font-weight: 800; color: #a78bfa; letter-spacing: -0.5px; }
  .topbar-right { display: flex; align-items: center; gap: 0.75rem; }
  .user-name { font-size: 0.84rem; color: #9d9bc4; font-weight: 500; }
  .signout-btn { padding: 0.38rem 1rem; border: 1.5px solid #2d2860; border-radius: 8px;
    background: transparent; color: #9d9bc4; font-size: 0.82rem; cursor: pointer;
    font-weight: 600; font-family: inherit; transition: all 0.2s; }
  .signout-btn:hover { border-color: #fca5a5; color: #ef4444; background: rgba(239,68,68,0.08); }
  .bell-btn { position: relative; width: 36px; height: 36px; border-radius: 9px;
    border: 1.5px solid #2d2860; background: transparent; cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: 1rem; transition: all 0.2s; }
  .bell-btn:hover { border-color: #a78bfa; background: rgba(167,139,250,0.1); }
  .bell-badge { position: absolute; top: -5px; right: -5px; background: #ef4444; color: #fff;
    border-radius: 999px; font-size: 0.6rem; font-weight: 800; min-width: 16px; height: 16px;
    display: flex; align-items: center; justify-content: center; padding: 0 3px; border: 2px solid #1e1a3e; }
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
  .in { padding:0.65rem 0.875rem; background:#ececf9; border:1.5px solid #b8b4d4;
    border-radius:9px; font-family:inherit; font-size:0.875rem; color:#1e293b;
    outline:none; width:100%; transition:all 0.18s; }
  .in:focus { border-color:#0891b2; background:#fff; box-shadow:0 0 0 3px rgba(8,145,178,0.13); }
  .in:disabled { background:#ece9f5; color:#a0aec0; cursor:not-allowed; }
  .in.err { border-color:#ef4444 !important; background:#fff8f8 !important; }
  .err-msg { font-size:0.68rem; color:#ef4444; font-weight:600; margin-top:0.2rem; display:block; }
  .date-input { padding:0.65rem 0.875rem; background:#ececf9; border:1.5px solid #b8b4d4;
    border-radius:9px; font-family:inherit; font-size:0.875rem; color:#1e293b;
    outline:none; width:100%; transition:all 0.18s; }
  .date-input:focus { border-color:#0891b2; background:#fff; box-shadow:0 0 0 3px rgba(8,145,178,0.13); }
  .date-input::placeholder { color:#b8b4d4; }
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
  .add-btn { padding:0.55rem 1.3rem; background:#eef2ff; color:#4f46e5; border:1.5px solid #c7d2fe;
    border-radius:10px; font-family:inherit; font-size:0.875rem; font-weight:700; cursor:pointer; }
  .rm-btn { padding:0.28rem 0.7rem; background:#fff5f5; color:#ef4444; border:1.5px solid #fecaca;
    border-radius:7px; font-size:0.75rem; font-weight:600; cursor:pointer; font-family:inherit; }
  .sbar { display:flex; justify-content:space-between; align-items:center;
    margin-top:1.5rem; padding:1rem 1.5rem; background:#1e1a3e;
    border-radius:12px; box-shadow:0 6px 28px rgba(30,26,62,0.22); border:1px solid rgba(255,255,255,0.1); }
  .ss { font-size:0.84rem; color:#9d9bc4; font-weight:500; }
  .ss.ok { color:#4ade80; } .ss.err { color:#f87171; }
  .pbtn { padding:0.72rem 1.9rem; background:#0891b2; color:#fff; border:none;
    border-radius:10px; font-family:inherit; font-size:0.875rem; font-weight:700;
    cursor:pointer; transition:all 0.2s; box-shadow:0 4px 14px rgba(8,145,178,0.28); }
  .pbtn:hover { background:#0e7490; transform:translateY(-1px); }
  .sbtn { padding:0.72rem 1.5rem; background:transparent; color:#9d9bc4;
    border:1.5px solid #2d2860; border-radius:10px; font-family:inherit;
    font-size:0.875rem; font-weight:600; cursor:pointer; transition:all 0.2s; }
  .sbtn:hover { color:#a78bfa; border-color:#a78bfa; }
  .nom-block { background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 12px; padding: 1.1rem 1.2rem; margin-bottom: 0.85rem; }
  .sig-canvas { border: 1.5px solid #b8b4d4; border-radius: 9px; background: #fff; cursor: crosshair; display: block; touch-action: none; }
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

export default function UanDetails() {
  const router = useRouter();
  const { user, apiFetch, logout, ready } = useAuth();
  const [showSignout, setShowSignout] = useState(false);
  const [saveStatus,  setSaveStatus]  = useState("");
  const [loading,     setLoading]     = useState(true);
  const [draft,       setDraft]       = useState(null);
  const isDirtyRef = useRef(false);
  // Track whether user edited AFTER page was loaded (triggers ack reset)
  const wasEditedAfterLoad = useRef(false);

  // ── UAN fields ──
  const [hasUan,       setHasUan]       = useState("");
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
  const makeNominee = () => ({ name:"", dob:"", relation:"", address:"", share:"", guardianName:"", guardianAddress:"" });
  const [nominees, setNominees] = useState([makeNominee()]);

  // ── Declarations ──
  const [pfNomAck, setPfNomAck] = useState(false);
  const [pensionNomAck, setPensionNomAck] = useState(false);
  const [epfoDecl, setEpfoDecl] = useState(false);

  // ── Signature ──
  // sigDataUrl: used only for canvas preview drawing (base64 or signed URL)
  // sigS3Key: the actual stored S3 key — this is what gets saved to DB
  // sigTimestamp: when signed
  const [sigDataUrl, setSigDataUrl] = useState("");
  const [sigTimestamp, setSigTimestamp] = useState("");
  const [sigS3Key, setSigS3Key] = useState("");
  // editedAfterSign: user changed something AFTER signing — must re-confirm acks but signature stays
  const [editedAfterSign, setEditedAfterSign] = useState(false);
  const sigCanvasRef = useRef(null);
  const sigDrawingRef = useRef(false);
  const sigLastRef = useRef({x:0, y:0});
  const wasSignedRef = useRef(false);
  // Prevent canvas wipe on re-renders — track if we've restored sig once
  const sigRestoredRef = useRef(false);

  // ── Restore signature to canvas after every render ──
  // useLayoutEffect fires synchronously after DOM mutations, before browser paint
  // This ensures canvas is redrawn before user sees a blank canvas
  useEffect(() => {
    if (!sigDataUrl || !sigCanvasRef.current) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (!sigCanvasRef.current) return;
      const ctx = sigCanvasRef.current.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, sigCanvasRef.current.width, sigCanvasRef.current.height);
      ctx.drawImage(img, 0, 0, sigCanvasRef.current.width, sigCanvasRef.current.height);
    };
    img.onerror = () => {
      // CORS blocked — canvas stays blank but sigS3Key still valid; timestamp shown
    };
    img.src = sigDataUrl;
    // Re-run on every render cycle so signature stays visible after state updates
  });  // No dependency array — runs after every render to prevent wipe

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
          if (Array.isArray(d.epfoNominees) && d.epfoNominees.length > 0) setNominees(d.epfoNominees);
          if (d.epfoDeclarations) {
            if (d.epfoDeclarations.pfNomAck)     setPfNomAck(d.epfoDeclarations.pfNomAck);
            if (d.epfoDeclarations.pensionNomAck) setPensionNomAck(d.epfoDeclarations.pensionNomAck);
            if (d.epfoDeclarations.epfoDecl)     setEpfoDecl(d.epfoDeclarations.epfoDecl);
          }

          // ── Restore signature ──
          // Priority: s3Key (fetch signed URL) > legacy dataUrl
          if (d.epfoSignature?.s3Key) {
            setSigS3Key(d.epfoSignature.s3Key);
            wasSignedRef.current = true;
            // Fetch signed URL for canvas preview
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

          // Load employment history for PF pre-fill
          if (d.employee_id) {
            try {
              const histRes = await apiFetch(`${API}/employee/employment-history/${d.employee_id}`);
              if (histRes.ok) {
                const hist = await histRes.json();
                const companies = Array.isArray(hist.employments)
                  ? hist.employments.map((e, idx) => ({
                      name: e.companyName || "",
                      label: idx === 0
                        ? (e.companyName ? `${e.companyName} (Current)` : "Current Employer")
                        : (e.companyName ? `${e.companyName}` : `Previous Employer ${idx}`),
                      isCurrent: idx === 0,
                    }))
                  : [];
                setPage3Companies(companies);
                if (Array.isArray(d.pfRecords) && d.pfRecords.length > 0) {
                  setPfRecords(d.pfRecords.map(r => ({ companyName:r.companyName||"", hasPf:r.hasPf||"", pfMemberId:r.pfMemberId||"", dojEpfo:r.dojEpfo||"", doeEpfo:r.doeEpfo||"", pfTransferred:r.pfTransferred||"" })));
                } else if (companies.length > 0) {
                  setPfRecords(companies.map(c => makePfRecord(c.name)));
                }
              }
            } catch(_) {}
          } else {
            if (Array.isArray(d.pfRecords) && d.pfRecords.length > 0) {
              setPfRecords(d.pfRecords.map(r => ({ companyName:r.companyName||"", hasPf:r.hasPf||"", pfMemberId:r.pfMemberId||"", dojEpfo:r.dojEpfo||"", doeEpfo:r.doeEpfo||"", pfTransferred:r.pfTransferred||"" })));
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
    dirty(() => {})("");
  };
  const addPfRecord    = () => { setPfRecords(prev => [...prev, makePfRecord()]); isDirtyRef.current = true; };
  const removePfRecord = (i) => { if(i === 0) return; setPfRecords(prev => prev.filter((_, idx) => idx !== i)); isDirtyRef.current = true; };

  // Upload canvas blob to S3
  const uploadSignature = async (dataUrl) => {
    if (!draft?.employee_id) return null;
    try {
      const res2 = await fetch(dataUrl);
      const blob = await res2.blob();
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
      epfoSignature: {
        s3Key: sigS3Key,
        timestamp: sigTimestamp,
      },
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
    if (isDirtyRef.current) { try { await saveDraft(); } catch(_) {} }
    logout();
  };
  const handleSaveSignout = async () => {
    try { await saveDraft(); } catch(_) {}
    logout();
  };
  const handleMidSave = async () => {
    setSaveStatus("Saving…");
    try { await saveDraft(); setSaveStatus("Saved ✓"); setTimeout(() => setSaveStatus(""), 2000); }
    catch(_) { setSaveStatus("Error"); setTimeout(() => setSaveStatus(""), 2500); }
  };

  const handleNext = async () => {
    // Validate: acks + signature mandatory
    const errs = [];
    if (!pfNomAck)     errs.push("PF Nomination Declaration");
    if (!pensionNomAck) errs.push("Pension Nomination Declaration");
    if (!epfoDecl)     errs.push("General EPFO Declaration");
    if (!sigS3Key && !sigDataUrl) errs.push("Digital Signature");

    if (errs.length > 0) {
      setSaveStatus(`⚠️ Required: ${errs.join(", ")}`);
      document.getElementById("epfo-decl-section")?.scrollIntoView({ behavior:"smooth", block:"center" });
      return;
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

  if (!ready || !user) return null;
  if (loading) return (
    <div style={{minHeight:"100vh",background:"#cdd2ed",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p style={{color:"#8b88b0",fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:500}}>Loading UAN details…</p>
    </div>
  );

  const showUanFields = hasUan === "yes";

  return (
    <>
      <style>{G}</style>
      <div className="pg">
        {showSignout && <SignoutModal onConfirm={handleSignout} onCancel={() => setShowSignout(false)}/>}

        <div className="topbar">
          <span className="logo-text">Datagate</span>
          <div className="topbar-right">
            <span className="user-name">👤 {user.name || user.email}</span>
            <ConsentBell apiFetch={apiFetch} router={router}/>
            <button className="signout-btn" onClick={handleSaveSignout} style={{borderColor:"#ef4444",color:"#ef4444"}}>Save & Sign out</button>
          </div>
        </div>

        <div className="wrap">
          <StepNav current={4} onNavigate={handleNavigate}/>

          {/* ── UAN / EPFO Details ── */}
          <div className="sc cyn">
            <div className="sh"><div className="si cyn">🏦</div><span className="st">UAN / EPFO Details</span></div>

            <div className="yn-row">
              <span className="yn-lbl">Do you have a UAN (Universal Account Number)?</span>
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
                    <select className="in" value={isActive} onChange={e => { setIsActive(e.target.value); isDirtyRef.current = true; }} style={{background:isActive?"#fff":"#f2f1f9",color:isActive?"#1a1730":"#8b88b0"}}>
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
                <div style={{marginTop:"0.75rem"}}>
                  <span className="fl" style={{display:"block",marginBottom:"0.4rem"}}>UAN Card <span style={{color:"#ef4444"}}>*</span></span>
                  <FileUpload label="Upload UAN Card *" category="uan" subKey="uanCard" employeeId={draft?.employee_id || ""} apiFetch={apiFetch} value={epfoKey} onChange={k => { setEpfoKey(k); isDirtyRef.current = true; }}/>
                </div>
                <div style={{marginTop:"0.75rem"}}>
                  <span className="fl" style={{display:"block",marginBottom:"0.28rem"}}>Service History Record Snapshot <span style={{color:"#ef4444"}}>*</span></span>
                  <p style={{fontSize:"0.7rem",color:"#6b6894",marginBottom:"0.4rem",fontWeight:500,lineHeight:1.5}}>Download from EPFO Member Portal (passbook.epfindia.gov.in) and upload screenshot or PDF.</p>
                  <FileUpload label="Upload Service History Snapshot *" category="uan" subKey="serviceHistory" employeeId={draft?.employee_id || ""} apiFetch={apiFetch} value={serviceHistoryKey} onChange={k => { const key = typeof k==="string"?k:(k?.key||k?.s3_key||""); setServiceHistoryKey(key); isDirtyRef.current = true; }}/>
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
                return (
                  <div key={i} className="pf-block">
                    <div className="pf-block-hdr">
                      <div style={{display:"flex",flexDirection:"column",gap:"0.25rem"}}>
                        <span className="pf-block-title">{rec.companyName || (p3?.label) || `Employer ${i + 1}`}</span>
                        {p3 && <span className="pf-block-badge">{p3.isCurrent ? "🟢 Current / Most Recent" : `⬅ Previous Employer ${i}`}</span>}
                      </div>
                      {i > 0 && <button className="rm-btn" onClick={() => removePfRecord(i)}>− Remove</button>}
                    </div>
                    <div className="fr">
                      <F l="Company Name" v={rec.companyName} s={v => updatePf(i, "companyName", v)}/>
                      <div className="fi">
                        <span className="fl">PF Maintained by Employer <span style={{color:"#ef4444",marginLeft:2}}>*</span></span>
                        <div style={{display:"flex",gap:"0.55rem",marginTop:"0.15rem"}}>
                          {["Yes","No"].map(v=>(
                            <button key={v} onClick={()=>updatePf(i,"hasPf",v)} style={{flex:1,padding:"0.62rem 0",borderRadius:9,border:rec.hasPf===v?"2px solid #7c3aed":"1.5px solid #b8b4d4",background:rec.hasPf===v?"#7c3aed":"#ececf9",color:rec.hasPf===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.82rem",fontWeight:700,fontFamily:"inherit",transition:"all 0.18s"}}>{v}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                    {rec.hasPf === "No" && (
                      <div style={{padding:"0.7rem 0.9rem",background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:9,fontSize:"0.78rem",color:"#0369a1",fontWeight:500,marginTop:"0.1rem"}}>
                        ℹ️ No PF details required — employer does not maintain Provident Fund.
                      </div>
                    )}
                    {rec.hasPf === "Yes" && (
                      <>
                        <div className="fr"><F l="PF Member ID" v={rec.pfMemberId} s={v => updatePf(i, "pfMemberId", v)}/></div>
                        <div className="fr">
                          <FDate l="Date of Joining (EPFO)" v={rec.dojEpfo} s={v => updatePf(i, "dojEpfo", v)}/>
                          <FDate l="Date of Exit (EPFO)" v={rec.doeEpfo} s={v => updatePf(i, "doeEpfo", v)}/>
                        </div>
                        <div>
                          <span className="fl" style={{display:"block",marginBottom:"0.4rem"}}>Was PF Transferred?</span>
                          <div style={{display:"flex",gap:"0.6rem"}}>
                            {["Yes","No"].map(v => (
                              <button key={v} onClick={() => updatePf(i, "pfTransferred", v)} style={{padding:"0.3rem 1.1rem",borderRadius:999,border:rec.pfTransferred===v?"2px solid #7c3aed":"1.5px solid #dddaf0",background:rec.pfTransferred===v?"#7c3aed":"#f2f1f9",color:rec.pfTransferred===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.82rem",fontWeight:700,fontFamily:"inherit",transition:"all 0.18s"}}>{v}</button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
              <button className="add-btn" onClick={addPfRecord} style={{marginTop:"0.25rem"}}>+ Add Another Employer</button>
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
          {hasUan !== "" && (
            <div className="sc grn" style={{marginBottom:"1.1rem"}}>
              <div className="sh"><div className="si grn">👨‍👩‍👧</div><span className="st">Nominee Details — PF & Pension (Form 2)</span></div>
              <p style={{fontSize:"0.75rem",color:"#6b6894",marginBottom:"0.9rem",fontWeight:500,lineHeight:1.5}}>Nominate beneficiaries for your PF and Pension. Shares must add up to 100%.</p>
              {nominees.map((nom, idx) => (
                <div key={idx} className="nom-block">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.75rem"}}>
                    <span style={{fontSize:"0.72rem",fontWeight:800,color:"#16a34a",textTransform:"uppercase",letterSpacing:"0.5px"}}>Nominee {idx+1}</span>
                    {idx>0&&<button className="rm-btn" onClick={()=>{setNominees(prev=>prev.filter((_,i)=>i!==idx));isDirtyRef.current=true;}}>− Remove</button>}
                  </div>
                  <div className="fr">
                    <div className="fi">
                      <span className="fl">Full Name <span style={{color:"#ef4444"}}>*</span></span>
                      <input className="in" value={nom.name||""} placeholder="As per Aadhaar / PAN" onChange={e=>{setNominees(p=>{const n=[...p];n[idx]={...n[idx],name:e.target.value};return n;});isDirtyRef.current=true;}}/>
                    </div>
                    <div className="fi">
                      <span className="fl">Date of Birth <span style={{color:"#ef4444"}}>*</span></span>
                      <input className="in" type="text" value={nom.dob||""} placeholder="dd-mm-yyyy" maxLength={10}
                        onChange={e=>{
                          let v=e.target.value.replace(/[^\d]/g,"");
                          if(v.length>2) v=v.slice(0,2)+"-"+v.slice(2);
                          if(v.length>5) v=v.slice(0,5)+"-"+v.slice(5);
                          v=v.slice(0,10);
                          setNominees(p=>{const n=[...p];n[idx]={...n[idx],dob:v};return n;});isDirtyRef.current=true;
                        }}/>
                    </div>
                    <div className="fi">
                      <span className="fl">Relationship <span style={{color:"#ef4444"}}>*</span></span>
                      <select className="in" value={nom.relation||""} onChange={e=>{setNominees(p=>{const n=[...p];n[idx]={...n[idx],relation:e.target.value,otherRelation:""};return n;});isDirtyRef.current=true;}} style={{background:nom.relation?"#fff":"#f2f1f9",color:nom.relation?"#1a1730":"#8b88b0"}}>
                        <option value="">Select</option>
                        {["Spouse","Son","Daughter","Father","Mother","Brother","Sister","Other"].map(r=><option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="fr">
                    <div className="fi" style={{minWidth:220}}>
                      <span className="fl">Address <span style={{color:"#ef4444"}}>*</span></span>
                      <input className="in" value={nom.address||""} onChange={e=>{setNominees(p=>{const n=[...p];n[idx]={...n[idx],address:e.target.value};return n;});isDirtyRef.current=true;}}/>
                    </div>
                    <div className="fi" style={{maxWidth:140}}>
                      <span className="fl">Share (%) <span style={{color:"#ef4444"}}>*</span></span>
                      <input className="in" value={nom.share||""} placeholder="e.g. 50" inputMode="numeric" maxLength={3} onChange={e=>{const v=e.target.value.replace(/\D/g,"").slice(0,3);setNominees(p=>{const n=[...p];n[idx]={...n[idx],share:v};return n;});isDirtyRef.current=true;}}/>
                    </div>
                  </div>
                </div>
              ))}
              {nominees.length < 4 && <button className="add-btn" onClick={()=>{setNominees(p=>[...p,makeNominee()]);isDirtyRef.current=true;}}>+ Add Another Nominee</button>}
              {nominees.length > 1 && nominees.reduce((s,n)=>s+(parseInt(n.share)||0),0) !== 100 && (
                <p style={{fontSize:"0.75rem",color:"#ef4444",fontWeight:600,marginTop:"0.5rem"}}>⚠️ Total share must equal 100%. Current total: {nominees.reduce((s,n)=>s+(parseInt(n.share)||0),0)}%</p>
              )}
            </div>
          )}

          {/* ── EPFO Declarations + Signature ── always required ── */}
          {true && (
            <div id="epfo-decl-section" className="sc" style={{marginBottom:"1.1rem",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,bottom:0,width:4,borderRadius:"16px 0 0 16px",background:"#4f46e5"}}/>
              <div className="sh"><div className="si" style={{background:"#eef2ff"}}>📜</div><span className="st">EPFO Declarations & Digital Signature</span></div>

              {editedAfterSign && (
                <div style={{background:"#fff8f0",border:"1.5px solid #fbbf24",borderRadius:10,padding:"0.65rem 1rem",marginBottom:"0.75rem",fontSize:"0.75rem",color:"#92400e",fontWeight:600}}>
                  ⚠️ You edited information — please re-confirm all declarations below. Your existing signature is still saved; re-sign only if you wish to update it.
                </div>
              )}

              <p style={{fontSize:"0.75rem",color:"#6b6894",marginBottom:"0.9rem",fontWeight:500,lineHeight:1.5}}>
                The following declarations are mandatory. All three must be confirmed and a signature must be drawn before you can continue.
              </p>

              {/* Declaration 1 */}
              <div style={{background:"#f0effe",border:"1px solid #dddaf0",borderRadius:10,padding:"0.9rem 1rem",marginBottom:"0.75rem",borderLeft:pfNomAck?"3px solid #16a34a":"3px solid #e4e2f0"}}>
                <label style={{display:"flex",alignItems:"flex-start",gap:"0.75rem",cursor:"pointer"}}>
                  <input type="checkbox" checked={pfNomAck} onChange={e=>{setPfNomAck(e.target.checked);isDirtyRef.current=true;if(wasSignedRef.current){setEditedAfterSign(true);}}} style={{marginTop:"0.2rem",width:17,height:17,accentColor:"#4f46e5",flexShrink:0,cursor:"pointer"}}/>
                  <div>
                    <div style={{fontSize:"0.68rem",fontWeight:800,color:"#4f46e5",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"0.3rem"}}>PF Nomination Declaration (Form 2 — Part A) <span style={{color:"#ef4444"}}>*</span></div>
                    <span style={{fontSize:"0.82rem",color:"#1a1730",fontWeight:500,lineHeight:1.65}}>I hereby nominate the person(s) listed above to receive the amount standing to my credit in the Provident Fund in the event of my death. I confirm the nominee details are accurate and shares add up to 100%.</span>
                  </div>
                </label>
              </div>

              {/* Declaration 2 */}
              <div style={{background:"#f0effe",border:"1px solid #dddaf0",borderRadius:10,padding:"0.9rem 1rem",marginBottom:"0.75rem",borderLeft:pensionNomAck?"3px solid #16a34a":"3px solid #e4e2f0"}}>
                <label style={{display:"flex",alignItems:"flex-start",gap:"0.75rem",cursor:"pointer"}}>
                  <input type="checkbox" checked={pensionNomAck} onChange={e=>{setPensionNomAck(e.target.checked);isDirtyRef.current=true;if(wasSignedRef.current){setEditedAfterSign(true);}}} style={{marginTop:"0.2rem",width:17,height:17,accentColor:"#4f46e5",flexShrink:0,cursor:"pointer"}}/>
                  <div>
                    <div style={{fontSize:"0.68rem",fontWeight:800,color:"#4f46e5",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"0.3rem"}}>Pension Nomination Declaration (Form 2 — Part B) <span style={{color:"#ef4444"}}>*</span></div>
                    <span style={{fontSize:"0.82rem",color:"#1a1730",fontWeight:500,lineHeight:1.65}}>I nominate the above person(s) to receive pension under the Employees' Pension Scheme, 1995. This nomination supersedes any previous nomination made by me.</span>
                  </div>
                </label>
              </div>

              {/* Declaration 3 */}
              <div style={{background:"#f0effe",border:"1px solid #dddaf0",borderRadius:10,padding:"0.9rem 1rem",marginBottom:"1rem",borderLeft:epfoDecl?"3px solid #16a34a":"3px solid #e4e2f0"}}>
                <label style={{display:"flex",alignItems:"flex-start",gap:"0.75rem",cursor:"pointer"}}>
                  <input type="checkbox" checked={epfoDecl} onChange={e=>{setEpfoDecl(e.target.checked);isDirtyRef.current=true;if(wasSignedRef.current){setEditedAfterSign(true);}}} style={{marginTop:"0.2rem",width:17,height:17,accentColor:"#4f46e5",flexShrink:0,cursor:"pointer"}}/>
                  <div>
                    <div style={{fontSize:"0.68rem",fontWeight:800,color:"#4f46e5",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"0.3rem"}}>General EPFO Declaration <span style={{color:"#ef4444"}}>*</span></div>
                    <span style={{fontSize:"0.82rem",color:"#1a1730",fontWeight:500,lineHeight:1.65}}>I declare that all UAN, PF member ID(s), service history, and nominee details provided are true and correct. I understand false declarations may result in legal action under the EPF Act, 1952.</span>
                  </div>
                </label>
              </div>

              {/* Digital Signature — NEVER auto-cleared, only cleared by "Clear" button */}
              <div style={{background:"#fff",border:"1.5px solid #e4e2f0",borderRadius:12,padding:"1.1rem 1.2rem"}}>
                <div style={{fontSize:"0.72rem",fontWeight:800,color:"#4f46e5",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"0.5rem"}}>
                  Digital Signature <span style={{color:"#ef4444"}}>*</span>
                </div>

                {editedAfterSign && (sigS3Key || sigDataUrl) && (
                  <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,padding:"0.6rem 0.9rem",marginBottom:"0.75rem",fontSize:"0.75rem",color:"#15803d",fontWeight:500}}>
                    ✓ Your existing signature is saved. You only need to re-sign if you want to update it. Re-confirm the declarations above to continue.
                  </div>
                )}

                <p style={{fontSize:"0.72rem",color:"#6b6894",marginBottom:"0.75rem",fontWeight:500,lineHeight:1.5}}>Draw your signature using mouse or finger. This is recorded with date/time as your digital consent.</p>

                <canvas
                  ref={sigCanvasRef}
                  width={400} height={90}
                  className={`sig-canvas${(sigDataUrl||sigS3Key)?" signed":""}`}
                  style={{width:"100%",maxWidth:400,height:90}}
                  onMouseDown={e=>{
                    sigDrawingRef.current=true;
                    const r=sigCanvasRef.current.getBoundingClientRect();
                    const scaleX=sigCanvasRef.current.width/r.width;
                    sigLastRef.current={x:(e.clientX-r.left)*scaleX,y:(e.clientY-r.top)*scaleX};
                    if(!sigDataUrl&&!sigS3Key){const ctx=sigCanvasRef.current.getContext("2d");ctx.fillStyle="#fff";ctx.fillRect(0,0,sigCanvasRef.current.width,sigCanvasRef.current.height);}
                  }}
                  onMouseMove={e=>{
                    if(!sigDrawingRef.current)return;
                    const r=sigCanvasRef.current.getBoundingClientRect();
                    const scaleX=sigCanvasRef.current.width/r.width;
                    const ctx=sigCanvasRef.current.getContext("2d");
                    const x=(e.clientX-r.left)*scaleX, y=(e.clientY-r.top)*scaleX;
                    ctx.beginPath();ctx.strokeStyle="#1a1730";ctx.lineWidth=2;ctx.lineCap="round";
                    ctx.moveTo(sigLastRef.current.x,sigLastRef.current.y);ctx.lineTo(x,y);ctx.stroke();
                    sigLastRef.current={x,y};
                  }}
                  onMouseUp={async ()=>{
                    sigDrawingRef.current=false;
                    const dataUrl=sigCanvasRef.current.toDataURL("image/jpeg",0.3);
                    setSigDataUrl(dataUrl);
                    const ts=new Date().toISOString();
                    setSigTimestamp(ts);
                    isDirtyRef.current=true;wasSignedRef.current=true;setEditedAfterSign(false);
                    const key = await uploadSignature(dataUrl);
                    if (key) setSigS3Key(key);
                  }}
                  onTouchStart={e=>{
                    e.preventDefault();sigDrawingRef.current=true;
                    const r=sigCanvasRef.current.getBoundingClientRect();
                    const scaleX=sigCanvasRef.current.width/r.width;
                    const t=e.touches[0];
                    sigLastRef.current={x:(t.clientX-r.left)*scaleX,y:(t.clientY-r.top)*scaleX};
                  }}
                  onTouchMove={e=>{
                    e.preventDefault();if(!sigDrawingRef.current)return;
                    const r=sigCanvasRef.current.getBoundingClientRect();
                    const scaleX=sigCanvasRef.current.width/r.width;
                    const ctx=sigCanvasRef.current.getContext("2d");
                    const t=e.touches[0];
                    const x=(t.clientX-r.left)*scaleX, y=(t.clientY-r.top)*scaleX;
                    ctx.beginPath();ctx.strokeStyle="#1a1730";ctx.lineWidth=2;ctx.lineCap="round";
                    ctx.moveTo(sigLastRef.current.x,sigLastRef.current.y);ctx.lineTo(x,y);ctx.stroke();
                    sigLastRef.current={x,y};
                  }}
                  onTouchEnd={async ()=>{
                    sigDrawingRef.current=false;
                    const dataUrl=sigCanvasRef.current.toDataURL("image/jpeg",0.3);
                    setSigDataUrl(dataUrl);
                    const ts=new Date().toISOString();
                    setSigTimestamp(ts);
                    isDirtyRef.current=true;wasSignedRef.current=true;setEditedAfterSign(false);
                    const key = await uploadSignature(dataUrl);
                    if (key) setSigS3Key(key);
                  }}
                  onMouseLeave={()=>{sigDrawingRef.current=false;}}
                />

                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"0.6rem",flexWrap:"wrap",gap:"0.5rem"}}>
                  <div>
                    {(sigS3Key || sigDataUrl) && sigTimestamp && (
                      <span style={{fontSize:"0.7rem",color:"#16a34a",fontWeight:600}}>
                        ✓ Signed — {new Date(sigTimestamp).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}
                      </span>
                    )}
                    {sigDataUrl && !sigS3Key && (
                      <span style={{fontSize:"0.7rem",color:"#d97706",fontWeight:500}}>⏳ Saving signature…</span>
                    )}
                    {!sigDataUrl && !sigS3Key && <span style={{fontSize:"0.7rem",color:"#8b88b0",fontWeight:500}}>Draw your signature above <span style={{color:"#ef4444"}}>*</span></span>}
                  </div>
                  {/* Only manual Clear button can erase signature */}
                  <button
                    onClick={()=>{
                      const ctx=sigCanvasRef.current.getContext("2d");
                      ctx.clearRect(0,0,sigCanvasRef.current.width,sigCanvasRef.current.height);
                      setSigDataUrl("");setSigTimestamp("");setSigS3Key("");
                      isDirtyRef.current=true;wasSignedRef.current=false;setEditedAfterSign(false);
                    }}
                    style={{padding:"0.3rem 0.8rem",background:"#fff5f5",color:"#ef4444",border:"1.5px solid #fecaca",borderRadius:7,fontSize:"0.72rem",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          <div style={{background:"#fff",borderRadius:12,padding:"1rem 1.25rem",marginBottom:"1.1rem",border:"1px solid #e8e5f0",boxShadow:"0 2px 8px rgba(30,26,62,0.06)"}}>
            <p style={{fontSize:"0.78rem",color:"#6b6894",lineHeight:1.6,fontWeight:500}}>
              ℹ️ All 3 declarations must be checked and a signature must be drawn before you can continue to the Review page.
            </p>
          </div>

          <div className="sbar">
            <button className="sbtn" onClick={() => handleNavigate("/employee/previous")}>← Previous</button>
            <span className={`ss${saveStatus==="Saved ✓"?" ok":saveStatus.startsWith("Error")||saveStatus.startsWith("⚠️")?" err":""}`}>{saveStatus}</span>
            <div style={{display:"flex",gap:"0.65rem",alignItems:"center"}}>
              <button className="sbtn" onClick={handleMidSave} style={{fontSize:"0.8rem"}}>Save draft</button>
              <button className="pbtn" onClick={handleNext}>Save & Continue →</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
