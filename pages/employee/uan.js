// pages/employee/uan.js  — Page 4 of 5
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

const emptyPfRecord = () => ({
  companyName:"", pfMemberId:"", dojEpfo:"", doeEpfo:"", pfTransferred:"",
});

// 5 acknowledgement statements — all must be checked before submitting
const ACKNOWLEDGEMENTS = [
  { id:"truthful",    text:"I confirm that all information provided is true and accurate to the best of my knowledge." },
  { id:"notTampered", text:"I confirm that no documents or records have been tampered with or falsified." },
  { id:"consent",     text:"I consent to Datagate storing my employment profile and sharing it with employers only upon my explicit approval." },
  { id:"liability",   text:"I understand that providing false information may result in legal liability and disqualification from employment." },
  { id:"updates",     text:"I agree to update my profile if any information changes in the future." },
];

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
  .sc.amb::before { background:#d97706; }

  .sh { display:flex; align-items:center; gap:0.6rem; margin-bottom:1.15rem; }
  .si { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:0.95rem; flex-shrink:0; }
  .si.cyn{background:#ecfeff;} .si.grn{background:#f0fdf4;} .si.vio{background:#f5f3ff;} .si.amb{background:#fffbeb;}
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

  .yn-row { display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap; margin-bottom:0.75rem; }
  .yn-lbl { font-size:0.875rem; color:#1e293b; font-weight:600; }
  .yn-btn { padding:0.32rem 1.1rem; border-radius:999px; font-family:inherit; font-size:0.82rem; font-weight:700; cursor:pointer; transition:all 0.18s; border:none; }

  .pf-row { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:0.7rem; margin-top:0.65rem; }
  .pf-kv { display:flex; flex-direction:column; gap:0.15rem; }
  .pf-key { font-size:0.67rem; font-weight:700; color:#8b88b0; text-transform:uppercase; letter-spacing:0.5px; }
  .pf-val { font-size:0.84rem; font-weight:600; color:#0f172a; }

  .pf-block { background:#f8f7ff; border:1px solid #e4e2f0; border-radius:12px; padding:1.1rem 1.2rem; margin-bottom:0.85rem; position:relative; }
  .pf-block-title { font-size:0.72rem; font-weight:800; color:#7c3aed; text-transform:uppercase; letter-spacing:0.6px; margin-bottom:0.85rem; }
  .add-btn { padding:0.55rem 1.3rem; background:#eef2ff; color:#4f46e5; border:1.5px solid #c7d2fe;
    border-radius:10px; font-family:inherit; font-size:0.875rem; font-weight:700; cursor:pointer; }
  .rm-btn { padding:0.28rem 0.7rem; background:#fff5f5; color:#ef4444; border:1.5px solid #fecaca;
    border-radius:7px; font-size:0.75rem; font-weight:600; cursor:pointer; font-family:inherit; }

  .ack-item { display:flex; gap:0.75rem; align-items:flex-start; padding:0.85rem 1rem; border-radius:10px;
    cursor:pointer; transition:all 0.15s; margin-bottom:0.6rem; }
  .ack-box { width:20px; height:20px; border-radius:5px; flex-shrink:0; margin-top:1px;
    display:flex; align-items:center; justify-content:center; transition:all 0.15s; }

  .sbar { display:flex; justify-content:space-between; align-items:center;
    margin-top:1.5rem; padding:1rem 1.5rem; background:#1e1a3e;
    border-radius:12px; box-shadow:0 6px 28px rgba(30,26,62,0.22); border:1px solid rgba(255,255,255,0.1); }
  .ss { font-size:0.84rem; color:#9d9bc4; font-weight:500; }
  .ss.ok { color:#4ade80; } .ss.err { color:#f87171; }
  .pbtn { padding:0.72rem 1.9rem; background:#0891b2; color:#fff; border:none;
    border-radius:10px; font-family:inherit; font-size:0.875rem; font-weight:700;
    cursor:pointer; transition:all 0.2s; box-shadow:0 4px 14px rgba(8,145,178,0.28); }
  .pbtn:hover:not(:disabled) { background:#0e7490; transform:translateY(-1px); }
  .pbtn:disabled { opacity:0.5; cursor:not-allowed; }
  .sbtn { padding:0.72rem 1.5rem; background:transparent; color:#9d9bc4;
    border:1.5px solid #2d2860; border-radius:10px; font-family:inherit;
    font-size:0.875rem; font-weight:600; cursor:pointer; transition:all 0.2s; }
  .sbtn:hover { color:#a78bfa; border-color:#a78bfa; }

  @media(max-width:640px){
    .fr{flex-direction:column;} .fi{min-width:100%;}
    .topbar{flex-direction:column;gap:0.6rem;align-items:flex-start;position:relative;}
  }
`;

// ── Sub-components ────────────────────────────────────────────────────────────

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

function F({ l, v, s, t="text", r=true, disabled=false, mx, errKey, errors, onFix }) {
  const hasErr = errKey && errors && errors[errKey];
  return (
    <div className="fi">
      <span className="fl">{l}{r&&<span style={{color:"#ef4444",marginLeft:2}}>*</span>}</span>
      <input
        className={`in${hasErr?" err":""}`}
        type={t} value={v||""} disabled={disabled} maxLength={mx||undefined}
        onChange={e=>{s&&s(e.target.value);if(onFix&&hasErr)onFix(errKey);}}
        style={{colorScheme:"light"}}
      />
      {hasErr&&<span className="err-msg">Required</span>}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function UanDetails() {
  const router = useRouter();
  const { user, apiFetch, logout, ready } = useAuth();
  const [showSignout, setShowSignout] = useState(false);
  const [saveStatus,  setSaveStatus]  = useState("");
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [draft,       setDraft]       = useState(null);
  const [errors,      setErrors]      = useState({});
  const isDirtyRef = useRef(false);

  // ── UAN fields ──────────────────────────────────────────────────────
  const [hasUan,       setHasUan]       = useState("");   // "" | "yes" | "no"
  const [uanNumber,    setUanNumber]    = useState("");
  const [nameAsPerUan, setNameAsPerUan] = useState("");
  const [mobileLinked, setMobileLinked] = useState("");
  const [isActive,     setIsActive]     = useState("");
  const [epfoKey,      setEpfoKey]      = useState("");

  // ── PF records — one per previous employer, manually entered ────────
  const [pfRecords, setPfRecords] = useState([emptyPfRecord()]);

  // ── EPFO-fetched read-only records (from passbook fetch if any) ──────
  const [epfoFetched, setEpfoFetched] = useState([]);

  // ── Acknowledgements — all 5 must be checked before submit ──────────
  const [acks, setAcks] = useState({ truthful:false, notTampered:false, consent:false, liability:false, updates:false });

  const dirty = (setter) => (val) => { setter(val); isDirtyRef.current = true; };
  const fixErr = (key) => setErrors(p=>({...p,[key]:false}));
  const allAcksChecked = Object.values(acks).every(Boolean);

  // ── Role guard ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/employee/login"); return; }
    if (user.role !== "employee") { router.replace("/employee/login"); return; }
  }, [ready, user, router]);

  // ── Load draft ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!ready || !user) return;
    const fetchDraft = async () => {
      try {
        const res = await apiFetch(`${API}/employee/draft`);
        if (res.ok) {
          const d = await res.json();
          setDraft(d);
          // Restore hasUan
          if (d.hasUan !== undefined && d.hasUan !== null) {
            setHasUan(d.hasUan === true || d.hasUan === "yes" ? "yes" : "no");
          } else if (d.uanNumber) {
            setHasUan("yes");
          }
          if (d.uanNumber)    setUanNumber(d.uanNumber);
          if (d.nameAsPerUan) setNameAsPerUan(d.nameAsPerUan);
          if (d.mobileLinked) setMobileLinked(d.mobileLinked);
          if (d.isActive)     setIsActive(d.isActive);
          if (d.epfoKey)      setEpfoKey(d.epfoKey);
          // Manual PF records
          if (Array.isArray(d.pfRecords) && d.pfRecords.length > 0) {
            setPfRecords(d.pfRecords.map(r=>({
              companyName:   r.companyName   || "",
              pfMemberId:    r.pfMemberId    || "",
              dojEpfo:       r.dojEpfo       || "",
              doeEpfo:       r.doeEpfo       || "",
              pfTransferred: r.pfTransferred || "",
            })));
          }
          // EPFO-fetched read-only records (separate field)
          if (Array.isArray(d.epfoFetched) && d.epfoFetched.length > 0) {
            setEpfoFetched(d.epfoFetched);
          }
          // Restore acks if previously saved
          if (d.acknowledgements_profile) {
            setAcks(prev=>({...prev,...d.acknowledgements_profile}));
          }
        }
      } catch (_) {}
      setLoading(false);
    };
    fetchDraft();
  }, [ready, user, apiFetch]);

  // ── PF record helpers ────────────────────────────────────────────────
  const updatePf = (i, field, value) => {
    setPfRecords(prev=>prev.map((r,idx)=>idx===i?{...r,[field]:value}:r));
    isDirtyRef.current = true;
  };
  const addPfRecord    = () => { setPfRecords(prev=>[...prev,emptyPfRecord()]); isDirtyRef.current=true; };
  const removePfRecord = (i) => { if(i===0)return; setPfRecords(prev=>prev.filter((_,idx)=>idx!==i)); isDirtyRef.current=true; };

  // ── Build save payload ───────────────────────────────────────────────
  const buildPayload = () => ({
    ...(draft||{}),
    hasUan,
    uanNumber:    hasUan==="yes" ? uanNumber    : "",
    nameAsPerUan: hasUan==="yes" ? nameAsPerUan : "",
    mobileLinked: hasUan==="yes" ? mobileLinked : "",
    isActive:     hasUan==="yes" ? isActive     : "",
    epfoKey:      hasUan==="yes" ? epfoKey      : "",
    pfRecords:    hasUan==="yes" ? pfRecords    : [],
    acknowledgements_profile: acks,
  });

  // ── Save draft (mid-save, navigate-away) ─────────────────────────────
  const saveDraft = async () => {
    if (!draft?.employee_id) throw new Error("Please complete and save Page 1 first");
    const res = await apiFetch(`${API}/employee`, { method:"POST", body:JSON.stringify(buildPayload()) });
    if (!res.ok) throw new Error(parseError(await res.json().catch(()=>({}))));
    isDirtyRef.current = false;
  };

  // ── Final submit — sets status:"submitted" ───────────────────────────
  const handleSubmit = async () => {
    if (!allAcksChecked) { setSubmitError("Please confirm all acknowledgements before submitting."); return; }
    if (!draft?.employee_id) { setSubmitError("Profile not found — please complete Page 1 first."); return; }
    setSubmitError("");
    setSubmitting(true);
    try {
      const d = draft;
      const res = await apiFetch(`${API}/employee`, {
        method: "POST",
        body: JSON.stringify({
          ...buildPayload(),
          status:           "submitted",
          // Carry all page 1 fields explicitly from server draft
          firstName:        d.firstName        || "",
          lastName:         d.lastName         || "",
          middleName:       d.middleName,
          fatherName:       d.fatherName,
          fatherFirst:      d.fatherFirst,
          fatherMiddle:     d.fatherMiddle,
          fatherLast:       d.fatherLast,
          dob:              d.dob,
          gender:           d.gender,
          nationality:      d.nationality,
          mobile:           d.mobile           || user?.phone || "",
          email:            d.email            || user?.email || "",
          passport:         d.passport,
          aadhaar:          d.aadhaar,
          pan:              d.pan,
          currentAddress:   d.currentAddress,
          permanentAddress: d.permanentAddress,
          // Page 2
          education:        d.education,
          // Page 3 — employment history saved separately via /employee/employment-history
          // Page 4 — UAN already in buildPayload()
          submitted_at: Date.now(),
        }),
      });
      if (!res.ok) throw new Error(parseError(await res.json().catch(()=>({}))));
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNavigate = async (path) => {
    if (isDirtyRef.current) { try { await saveDraft(); } catch(_) {} }
    router.push(path);
  };
  const handleSignout = async () => {
    if (isDirtyRef.current) { try { await saveDraft(); } catch(_) {} }
    logout();
  };
  const handleMidSave = async () => {
    setSaveStatus("Saving…");
    try { await saveDraft(); setSaveStatus("Saved ✓"); setTimeout(()=>setSaveStatus(""),2000); }
    catch(_) { setSaveStatus("Error"); setTimeout(()=>setSaveStatus(""),2500); }
  };

  if (!ready || !user) return null;
  if (loading) return (
    <div style={{minHeight:"100vh",background:"#cdd2ed",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p style={{color:"#8b88b0",fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:500}}>Loading UAN details…</p>
    </div>
  );

  // ── Success screen ───────────────────────────────────────────────────
  if (submitted) return (
    <>
      <style>{G}</style>
      <div className="pg" style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{maxWidth:580,width:"90%",background:"#fff",borderRadius:20,padding:"3rem 2.5rem",boxShadow:"0 8px 40px rgba(30,26,62,0.18)",textAlign:"center"}}>
          <div style={{fontSize:64,marginBottom:"1rem"}}>✅</div>
          <h2 style={{color:"#16a34a",fontSize:"1.45rem",fontWeight:800,marginBottom:"0.5rem"}}>Profile Submitted!</h2>
          <p style={{color:"#374151",fontSize:"0.95rem",lineHeight:1.65,marginBottom:"0.75rem"}}>
            Your employment profile is now securely stored with <strong>Datagate</strong>.
          </p>
          <div style={{padding:"1rem 1.25rem",background:"#f0fdf4",borderRadius:10,border:"1px solid #bbf7d0",marginBottom:"2rem"}}>
            <p style={{fontSize:"0.84rem",color:"#15803d",lineHeight:1.6,fontWeight:500}}>
              🔒 Your data is <strong>private by default</strong>. We will only share your information with an employer when you explicitly approve their consent request. You are always in control.
            </p>
          </div>
          <button
            style={{padding:"0.85rem 2.5rem",background:"#4f46e5",color:"#fff",border:"none",borderRadius:10,fontSize:"0.95rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}
            onClick={()=>router.push("/employee/personal")}
          >
            Go to My Profile & Consents →
          </button>
        </div>
      </div>
    </>
  );

  const showToggle   = hasUan === "" || hasUan === "no";
  const showUanFields = hasUan === "yes";

  return (
    <>
      <style>{G}</style>
      <div className="pg">
        {showSignout && <SignoutModal onConfirm={handleSignout} onCancel={()=>setShowSignout(false)}/>}

        <div className="topbar">
          <span className="logo-text">Datagate</span>
          <div className="topbar-right">
            <span className="user-name">👤 {user.name||user.email}</span>
            <ConsentBell apiFetch={apiFetch} router={router}/>
            <button className="signout-btn" onClick={()=>setShowSignout(true)}>Sign out</button>
          </div>
        </div>

        <div className="wrap">
          <StepNav current={4} onNavigate={handleNavigate}/>

          {/* ── UAN / EPFO Details ──────────────────────────────────── */}
          <div className="sc cyn">
            <div className="sh">
              <div className="si cyn">🏦</div>
              <span className="st">UAN / EPFO Details</span>
            </div>

            {/* Has UAN toggle */}
            {showToggle && (
              <div className="yn-row">
                <span className="yn-lbl">Do you have a UAN (Universal Account Number)?</span>
                <button className="yn-btn" onClick={()=>{setHasUan("yes");isDirtyRef.current=true;}}
                  style={{border:hasUan==="yes"?"2px solid #0891b2":"1.5px solid #dddaf0",background:hasUan==="yes"?"#0891b2":"#f2f1f9",color:hasUan==="yes"?"#fff":"#6b6894"}}>Yes</button>
                <button className="yn-btn" onClick={()=>{setHasUan("no");isDirtyRef.current=true;}}
                  style={{border:hasUan==="no"?"2px solid #0891b2":"1.5px solid #dddaf0",background:hasUan==="no"?"#0891b2":"#f2f1f9",color:hasUan==="no"?"#fff":"#6b6894"}}>No</button>
              </div>
            )}

            {hasUan==="yes"&&!showToggle&&(
              <div style={{marginBottom:"0.75rem"}}>
                <span style={{fontSize:"0.78rem",color:"#0891b2",fontWeight:600}}>UAN on file</span>
                <button onClick={()=>{setHasUan("no");isDirtyRef.current=true;}} style={{marginLeft:"0.75rem",fontSize:"0.72rem",color:"#ef4444",background:"none",border:"none",cursor:"pointer",fontWeight:600,textDecoration:"underline"}}>I don't have a UAN</button>
              </div>
            )}

            {hasUan==="no"&&(
              <div style={{padding:"0.75rem 1rem",background:"#f0f9ff",borderRadius:10,border:"1px solid #bae6fd",marginTop:"0.5rem"}}>
                <p style={{fontSize:"0.84rem",color:"#0369a1",fontWeight:500,lineHeight:1.5}}>
                  No UAN recorded. If you get a UAN in future, come back and update this section.
                </p>
              </div>
            )}

            {showUanFields&&(
              <>
                <div className="fr">
                  <F l="UAN Number" v={uanNumber} s={v=>{ dirty(setUanNumber)(v.replace(/\D/g,"")); }} mx={12}/>
                  <F l="Name as per UAN" v={nameAsPerUan} s={dirty(setNameAsPerUan)}/>
                </div>
                <div className="fr">
                  <F l="Mobile Linked to UAN" v={mobileLinked} s={v=>dirty(setMobileLinked)(v.replace(/\D/g,""))} r={false} mx={10}/>
                  <div className="fi">
                    <span className="fl">UAN Active <span style={{color:"#ef4444"}}>*</span></span>
                    <select className="in" value={isActive} onChange={e=>{setIsActive(e.target.value);isDirtyRef.current=true;}} style={{background:isActive?"#fff":"#f2f1f9",color:isActive?"#1a1730":"#8b88b0"}}>
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
                <div style={{marginTop:"0.75rem"}}>
                  <span className="fl" style={{display:"block",marginBottom:"0.4rem"}}>UAN Card / Passbook <span style={{color:"#ef4444"}}>*</span></span>
                  <FileUpload label="Upload UAN Card or Passbook" category="uan" subKey="uanCard" apiFetch={apiFetch} value={epfoKey} onChange={k=>{setEpfoKey(k);isDirtyRef.current=true;}}/>
                </div>
              </>
            )}
          </div>

          {/* ── PF Details — manual entry per previous employer ─────── */}
          {showUanFields&&(
            <div className="sc vio">
              <div className="sh">
                <div className="si vio">📋</div>
                <span className="st">PF Details (Per Previous Employer)</span>
              </div>
              <p style={{fontSize:"0.75rem",color:"#8b88b0",marginBottom:"0.9rem",fontWeight:500,lineHeight:1.5}}>
                Enter PF member details for each company where PF was deducted. Add one row per employer.
              </p>

              {pfRecords.map((rec,i)=>(
                <div key={i} className="pf-block">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.85rem"}}>
                    <span className="pf-block-title">
                      {rec.companyName ? rec.companyName : `Employer ${i+1}`}
                    </span>
                    {i>0&&<button className="rm-btn" onClick={()=>removePfRecord(i)}>− Remove</button>}
                  </div>
                  <div className="fr">
                    <F l="Company Name" v={rec.companyName} s={v=>updatePf(i,"companyName",v)}/>
                    <F l="PF Member ID" v={rec.pfMemberId} s={v=>updatePf(i,"pfMemberId",v)}/>
                  </div>
                  <div className="fr">
                    <F l="Date of Joining (EPFO)" v={rec.dojEpfo} s={v=>updatePf(i,"dojEpfo",v)} t="date"/>
                    <F l="Date of Exit (EPFO)" v={rec.doeEpfo} s={v=>updatePf(i,"doeEpfo",v)} t="date"/>
                  </div>
                  <div>
                    <span className="fl" style={{display:"block",marginBottom:"0.4rem"}}>Was PF Transferred?</span>
                    <div style={{display:"flex",gap:"0.6rem"}}>
                      {["Yes","No"].map(v=>(
                        <button key={v} onClick={()=>updatePf(i,"pfTransferred",v)} style={{padding:"0.3rem 1.1rem",borderRadius:999,border:rec.pfTransferred===v?"2px solid #7c3aed":"1.5px solid #dddaf0",background:rec.pfTransferred===v?"#7c3aed":"#f2f1f9",color:rec.pfTransferred===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.82rem",fontWeight:700,fontFamily:"inherit",transition:"all 0.18s"}}>{v}</button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <button className="add-btn" onClick={addPfRecord} style={{marginTop:"0.25rem"}}>+ Add Another Employer</button>
            </div>
          )}

          {/* ── EPFO-fetched read-only records (if passbook was fetched) */}
          {showUanFields&&epfoFetched.length>0&&(
            <div className="sc grn">
              <div className="sh">
                <div className="si grn">📑</div>
                <span className="st">PF Employment Records (from EPFO)</span>
              </div>
              <p style={{fontSize:"0.75rem",color:"#8b88b0",marginBottom:"0.75rem",fontWeight:500}}>
                Records fetched from EPFO passbook — read only.
              </p>
              {epfoFetched.map((pf,i)=>(
                <div key={i} style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"0.9rem 1rem",marginBottom:"0.65rem"}}>
                  <div style={{fontSize:"0.72rem",fontWeight:700,color:"#16a34a",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.5rem"}}>
                    {pf.companyName||`Employer ${i+1}`}
                  </div>
                  <div className="pf-row">
                    {pf.pfMemberId&&<div className="pf-kv"><span className="pf-key">PF Member ID</span><span className="pf-val">{pf.pfMemberId}</span></div>}
                    {pf.dojEpfo&&<div className="pf-kv"><span className="pf-key">Date of Joining</span><span className="pf-val">{pf.dojEpfo}</span></div>}
                    {pf.doeEpfo&&<div className="pf-kv"><span className="pf-key">Date of Exit</span><span className="pf-val">{pf.doeEpfo}</span></div>}
                    {pf.pfTransferred!==undefined&&<div className="pf-kv"><span className="pf-key">PF Transferred</span><span className="pf-val">{pf.pfTransferred?"Yes":"No"}</span></div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Declaration & Acknowledgements ─────────────────────── */}
          <div className="sc amb">
            <div className="sh">
              <div className="si amb">📜</div>
              <span className="st">Declaration & Acknowledgement</span>
            </div>
            <p style={{fontSize:"0.78rem",color:"#6b6894",lineHeight:1.6,marginBottom:"1rem",fontWeight:400}}>
              Please read and confirm each statement before submitting your profile. All five must be acknowledged.
            </p>
            {ACKNOWLEDGEMENTS.map(({id,text})=>(
              <div
                key={id}
                className="ack-item"
                onClick={()=>{setAcks(prev=>({...prev,[id]:!prev[id]}));isDirtyRef.current=true;}}
                style={{border:`1.5px solid ${acks[id]?"#16a34a":"#e4e2f0"}`,background:acks[id]?"#f0fdf4":"#fafaf9"}}
              >
                <div className="ack-box" style={{border:`2px solid ${acks[id]?"#16a34a":"#cbd5e1"}`,background:acks[id]?"#16a34a":"#fff"}}>
                  {acks[id]&&<span style={{color:"#fff",fontSize:12,fontWeight:800,lineHeight:1}}>✓</span>}
                </div>
                <span style={{fontSize:"0.875rem",color:acks[id]?"#15803d":"#374151",lineHeight:1.55,fontWeight:acks[id]?600:400}}>{text}</span>
              </div>
            ))}
            {!allAcksChecked&&(
              <p style={{fontSize:"0.75rem",color:"#d97706",marginTop:"0.5rem",fontWeight:600}}>
                ⚠️ Please confirm all {ACKNOWLEDGEMENTS.length} statements to enable submission.
              </p>
            )}
          </div>

          {/* Submit error */}
          {submitError&&(
            <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10,padding:"0.75rem 1rem",marginBottom:"1rem",fontSize:"0.875rem",color:"#dc2626",fontWeight:500}}>
              ⚠️ {submitError}
            </div>
          )}

          {/* Info note */}
          <div style={{background:"#fff",borderRadius:12,padding:"1rem 1.25rem",marginBottom:"1.1rem",border:"1px solid #e8e5f0",boxShadow:"0 2px 8px rgba(30,26,62,0.06)"}}>
            <p style={{fontSize:"0.78rem",color:"#6b6894",lineHeight:1.6,fontWeight:500}}>
              ℹ️ Clicking <strong>Submit Profile</strong> will finalise your submission. You will be taken to your profile page where you can manage employer consent requests.
            </p>
          </div>

          <div className="sbar">
            <button className="sbtn" onClick={()=>handleNavigate("/employee/previous")}>← Previous</button>
            <span className={`ss${saveStatus==="Saved ✓"?" ok":saveStatus.startsWith("Error")?" err":""}`}>{saveStatus}</span>
            <div style={{display:"flex",gap:"0.65rem",alignItems:"center"}}>
              <button className="sbtn" onClick={handleMidSave} style={{fontSize:"0.8rem"}}>Save draft</button>
              <button
                className="pbtn"
                onClick={handleSubmit}
                disabled={!allAcksChecked||submitting}
                style={{background:allAcksChecked?"#0891b2":"#94a3b8"}}
              >
                {submitting?"Submitting…":"Submit Profile"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
