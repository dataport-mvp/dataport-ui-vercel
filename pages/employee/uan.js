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

// Build an empty PF record, optionally pre-filled with a company name from page 3
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

  .guide-banner { background: #eef2ff; border: 1.5px solid #c7d2fe; border-radius: 12px;
    padding: 0.9rem 1.1rem; margin-bottom: 1.1rem; display: flex; gap: 0.75rem; align-items: flex-start; }
  .guide-steps { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.4rem; }
  .guide-step { font-size: 0.72rem; font-weight: 700; color: #0891b2; background: #e0f2fe;
    padding: 0.2rem 0.55rem; border-radius: 999px; white-space: nowrap; }
  .guide-arrow { font-size: 0.7rem; color: #94a3b8; }
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

export default function UanDetails() {
  const router = useRouter();
  const { user, apiFetch, logout, ready } = useAuth();
  const [showSignout, setShowSignout] = useState(false);
  const [saveStatus,  setSaveStatus]  = useState("");
  const [loading,     setLoading]     = useState(true);
  const [draft,       setDraft]       = useState(null);
  const isDirtyRef = useRef(false);

  // ── UAN fields ──────────────────────────────────────────────────────
  const [hasUan,       setHasUan]       = useState("");
  const [uanNumber,    setUanNumber]    = useState("");
  const [nameAsPerUan, setNameAsPerUan] = useState("");
  const [mobileLinked, setMobileLinked] = useState("");
  const [isActive,     setIsActive]     = useState("");
  const [epfoKey,      setEpfoKey]      = useState("");

  // ── PF records — pre-filled from page 3 employment company names ────
  const [pfRecords,   setPfRecords]   = useState([makePfRecord()]);

  // ── EPFO-fetched read-only records (passbook fetch) ─────────────────
  const [epfoFetched, setEpfoFetched] = useState([]);

  // ── Company names pulled from page 3 employments ────────────────────
  // Used to show a "from page 3" badge on each PF block
  const [page3Companies, setPage3Companies] = useState([]); // [{name, index}]

  // ── Nominee fields (EPFO Form 2 / Pension nomination) ──────────────
  const makeNominee = () => ({
    name:"", dob:"", relation:"", address:"", share:"",
    guardianName:"", guardianAddress:"", // if nominee is minor
  });
  const [nominees, setNominees] = useState([makeNominee()]);
  const [pfNomAck, setPfNomAck] = useState(false); // PF nomination acknowledgement
  const [pensionNomAck, setPensionNomAck] = useState(false); // Pension nomination acknowledgement
  const [epfoDecl, setEpfoDecl] = useState(false); // General EPFO declaration
  // ── Digital Signature ───────────────────────────────────────────────
  const [sigDataUrl, setSigDataUrl] = useState(""); // base64 PNG of drawn signature
  const [sigTimestamp, setSigTimestamp] = useState(""); // ISO timestamp when signed
  const sigCanvasRef = useRef(null);
  const sigDrawingRef = useRef(false);
  const sigLastRef = useRef({x:0, y:0});

  const dirty = (setter) => (val) => { setter(val); isDirtyRef.current = true; };

  // ── Role guard ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/employee/login"); return; }
    if (user.role !== "employee") { router.replace("/employee/login"); return; }
  }, [ready, user, router]);

  // ── Load draft + employment history ─────────────────────────────────
  useEffect(() => {
    if (!ready || !user) return;
    const fetchData = async () => {
      try {
        // Load main draft
        const draftRes = await apiFetch(`${API}/employee/draft`);
        if (draftRes.ok) {
          const d = await draftRes.json();
          setDraft(d);

          // Restore UAN fields
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

          // EPFO-fetched read-only
          if (Array.isArray(d.epfoFetched) && d.epfoFetched.length > 0) {
            setEpfoFetched(d.epfoFetched);
          }
          // Nominees
          if (Array.isArray(d.epfoNominees) && d.epfoNominees.length > 0) {
            setNominees(d.epfoNominees);
          }
          // Declarations
          if (d.epfoDeclarations) {
            if (d.epfoDeclarations.pfNomAck) setPfNomAck(d.epfoDeclarations.pfNomAck);
            if (d.epfoDeclarations.pensionNomAck) setPensionNomAck(d.epfoDeclarations.pensionNomAck);
            if (d.epfoDeclarations.epfoDecl) setEpfoDecl(d.epfoDeclarations.epfoDecl);
          }

          // Load employment history to pre-fill company names
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

                // Restore saved PF records — if none saved, pre-fill from page 3 companies
                if (Array.isArray(d.pfRecords) && d.pfRecords.length > 0) {
                  setPfRecords(d.pfRecords.map(r => ({
                    companyName:   r.companyName   || "",
                    hasPf:         r.hasPf         || "",
                    pfMemberId:    r.pfMemberId    || "",
                    dojEpfo:       r.dojEpfo       || "",
                    doeEpfo:       r.doeEpfo       || "",
                    pfTransferred: r.pfTransferred || "",
                  })));
                } else if (companies.length > 0) {
                  // Pre-fill one PF row per employer from page 3
                  setPfRecords(companies.map(c => makePfRecord(c.name)));
                }
              }
            } catch(_) {}
          } else {
            // No employment history — restore saved PF records if any
            if (Array.isArray(d.pfRecords) && d.pfRecords.length > 0) {
              setPfRecords(d.pfRecords.map(r => ({
                companyName:   r.companyName   || "",
                hasPf:         r.hasPf         || "",
                pfMemberId:    r.pfMemberId    || "",
                dojEpfo:       r.dojEpfo       || "",
                doeEpfo:       r.doeEpfo       || "",
                pfTransferred: r.pfTransferred || "",
              })));
            }
          }
        }
      } catch (_) {}
      setLoading(false);
    };
    fetchData();
  }, [ready, user, apiFetch]);

  // ── PF record helpers ────────────────────────────────────────────────
  const updatePf = (i, field, value) => {
    setPfRecords(prev => prev.map((r, idx) => idx === i ? {...r, [field]: value} : r));
    isDirtyRef.current = true;
  };
  const addPfRecord    = () => { setPfRecords(prev => [...prev, makePfRecord()]); isDirtyRef.current = true; };
  const removePfRecord = (i) => { if(i === 0) return; setPfRecords(prev => prev.filter((_, idx) => idx !== i)); isDirtyRef.current = true; };

  // ── Build save payload ───────────────────────────────────────────────
  const buildPayload = () => ({
    ...(draft || {}),
    hasUan,
    uanNumber:    hasUan === "yes" ? uanNumber    : "",
    nameAsPerUan: hasUan === "yes" ? nameAsPerUan : "",
    mobileLinked: hasUan === "yes" ? mobileLinked : "",
    isActive:     hasUan === "yes" ? isActive     : "",
    epfoKey:      hasUan === "yes" ? epfoKey      : "",
    pfRecords:    hasUan === "yes" ? pfRecords    : [],
  });

  const saveDraft = async () => {
    if (!draft?.employee_id) throw new Error("Please complete and save Page 1 first");
    // Always fetch fresh draft before saving — prevents stale state from
    // overwriting document keys saved on other pages after this page mounted.
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
      epfoNominees: nominees,
      epfoSignature: { dataUrl: sigDataUrl, timestamp: sigTimestamp },
      epfoDeclarations: { pfNomAck, pensionNomAck, epfoDecl },
    };
    const res = await apiFetch(`${API}/employee`, { method:"POST", body:JSON.stringify(payload) });
    if (!res.ok) throw new Error(parseError(await res.json().catch(() => ({}))));
    isDirtyRef.current = false;
  };

  const handleNavigate = async (path) => {
    if (isDirtyRef.current) { try { await saveDraft(); } catch(_) {} }
    router.push(path);
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
    setSaveStatus("Saving...");
    try { await saveDraft(); setSaveStatus("Saved ✓"); router.push("/employee/review"); }
    catch(err) { setSaveStatus(`Error: ${err.message || "Could not save"}`); }
  };

  if (!ready || !user) return null;
  if (loading) return (
    <div style={{minHeight:"100vh",background:"#cdd2ed",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p style={{color:"#8b88b0",fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:500}}>Loading UAN details…</p>
    </div>
  );

  const showToggle    = hasUan === "" || hasUan === "no";
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

          {/* ── Chronological guide banner ───────────────────────── */}
          <div className="guide-banner">
            <div style={{fontSize:"1.2rem",flexShrink:0}}>💡</div>
            <div style={{flex:1}}>
              <div style={{fontSize:"0.82rem",fontWeight:700,color:"#0c4a6e",marginBottom:"0.25rem"}}>UAN & PF — What you'll fill on this page</div>
              <div style={{fontSize:"0.72rem",color:"#6b6894",marginBottom:"0.5rem",lineHeight:1.5}}>
                Your Universal Account Number (UAN) stays with you across jobs. Fill UAN details, upload your card, attach service history, add PF records per employer, nominee details, and digitally sign your EPFO declarations.
              </div>
              <div className="guide-steps">
                {[
                  {label:"UAN Details", sub:"number & card"},
                  {label:"Service History", sub:"snapshot upload"},
                  {label:"PF Per Employer", sub:"member ID"},
                  {label:"Nominees", sub:"Form 2 / pension"},
                  {label:"Declaration", sub:"digital sign"},
                ].map((s,i,arr)=>(
                  <span key={i} style={{display:"inline-flex",alignItems:"center",gap:"0.4rem"}}>
                    <span className="guide-step" style={{display:"inline-flex",flexDirection:"column",alignItems:"center",gap:"1px"}}>
                      <span>{s.label}</span>
                      {s.sub&&<span style={{fontSize:"0.6rem",fontWeight:500,color:"#0891b2",letterSpacing:0,textTransform:"none"}}>{s.sub}</span>}
                    </span>
                    {i<arr.length-1&&<span className="guide-arrow">→</span>}
                  </span>
                ))}
              </div>
              {/* Employer order strip — mirrors page 3, shows actual company names */}
              {page3Companies.length > 0 && (
                <div style={{marginTop:"0.6rem",paddingTop:"0.6rem",borderTop:"1px solid #c7d2fe",display:"flex",alignItems:"center",gap:"0.4rem",flexWrap:"wrap"}}>
                  <span style={{fontSize:"0.65rem",color:"#0891b2",fontWeight:700,marginRight:"0.15rem"}}>Your employers:</span>
                  {page3Companies.slice(0,5).map((c,i,arr)=>(
                    <span key={i} style={{display:"inline-flex",alignItems:"center",gap:"0.35rem"}}>
                      <span style={{display:"inline-flex",flexDirection:"column",alignItems:"center",gap:"1px",background:i===0?"#0891b2":"#e0f2fe",color:i===0?"#fff":"#0891b2",padding:"0.18rem 0.55rem",borderRadius:999,fontSize:"0.68rem",fontWeight:700,whiteSpace:"nowrap",maxWidth:110,overflow:"hidden"}}>
                        <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:106}}>{c.name||`Employer ${i+1}`}</span>
                        <span style={{fontSize:"0.58rem",fontWeight:500,opacity:0.85}}>{i===0?"most recent":i===arr.length-1?"oldest":i===1?"before that":""}</span>
                      </span>
                      {i<arr.length-1&&<span style={{fontSize:"0.65rem",color:"#94a3b8"}}>→</span>}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── UAN / EPFO Details ──────────────────────────────────── */}
          <div className="sc cyn">
            <div className="sh">
              <div className="si cyn">🏦</div>
              <span className="st">UAN / EPFO Details</span>
            </div>

            {showToggle && (
              <div className="yn-row">
                <span className="yn-lbl">Do you have a UAN (Universal Account Number)?</span>
                <button className="yn-btn" onClick={() => { setHasUan("yes"); isDirtyRef.current = true; }}
                  style={{border:hasUan==="yes"?"2px solid #0891b2":"1.5px solid #dddaf0",background:hasUan==="yes"?"#0891b2":"#f2f1f9",color:hasUan==="yes"?"#fff":"#6b6894"}}>Yes</button>
                <button className="yn-btn" onClick={() => { setHasUan("no"); isDirtyRef.current = true; }}
                  style={{border:hasUan==="no"?"2px solid #0891b2":"1.5px solid #dddaf0",background:hasUan==="no"?"#0891b2":"#f2f1f9",color:hasUan==="no"?"#fff":"#6b6894"}}>No</button>
              </div>
            )}

            {hasUan === "yes" && !showToggle && (
              <div style={{marginBottom:"0.75rem"}}>
                <span style={{fontSize:"0.78rem",color:"#0891b2",fontWeight:600}}>UAN on file</span>
                <button onClick={() => { setHasUan("no"); isDirtyRef.current = true; }} style={{marginLeft:"0.75rem",fontSize:"0.72rem",color:"#ef4444",background:"none",border:"none",cursor:"pointer",fontWeight:600,textDecoration:"underline"}}>I don't have a UAN</button>
              </div>
            )}

            {hasUan === "no" && (
              <div style={{padding:"0.75rem 1rem",background:"#f0f9ff",borderRadius:10,border:"1px solid #bae6fd",marginTop:"0.5rem"}}>
                <p style={{fontSize:"0.84rem",color:"#0369a1",fontWeight:500,lineHeight:1.5}}>
                  No UAN recorded. If you get a UAN in future, come back and update this section.
                </p>
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
                  <p style={{fontSize:"0.7rem",color:"#6b6894",marginBottom:"0.4rem",fontWeight:500,lineHeight:1.5}}>
                    Download your Service History from the EPFO Member Portal (passbook.epfindia.gov.in) and upload a screenshot or PDF. This shows your complete employment and PF contribution history.
                  </p>
                  <FileUpload label="Upload Service History Snapshot *" category="uan" subKey="serviceHistory" employeeId={draft?.employee_id || ""} apiFetch={apiFetch} value={draft?.serviceHistoryKey || ""} onChange={k => { isDirtyRef.current = true; setDraft(prev => ({...prev, serviceHistoryKey: typeof k==="string"?k:(k?.key||k?.s3_key||"")})); }}/>
                </div>
              </>
            )}
          </div>

          {/* ── PF Details — pre-filled from page 3 employers ───────── */}
          {showUanFields && (
            <div className="sc vio">
              <div className="sh">
                <div className="si vio">📋</div>
                <span className="st">PF Details — Per Employer</span>
              </div>
              <p style={{fontSize:"0.75rem",color:"#8b88b0",marginBottom:"0.75rem",fontWeight:500,lineHeight:1.5}}>
                {page3Companies.length > 0
                  ? "Pre-filled from your employment history on page 3 — same order as you entered them. Fill PF details for each."
                  : "Enter PF member details for each company where PF was deducted. Add one row per employer."}
              </p>
              {/* Mini flow guide — mirrors page 3 order */}
              {page3Companies.length > 0 && (
                <div style={{display:"flex",alignItems:"center",gap:"0.4rem",flexWrap:"wrap",marginBottom:"0.9rem",padding:"0.65rem 0.9rem",background:"#f5f3ff",border:"1px solid #dddaf0",borderRadius:10}}>
                  <span style={{fontSize:"0.68rem",color:"#7c3aed",fontWeight:700,marginRight:"0.2rem"}}>Order:</span>
                  {page3Companies.map((c,i,arr)=>(
                    <span key={i} style={{display:"inline-flex",alignItems:"center",gap:"0.35rem"}}>
                      <span style={{display:"inline-flex",flexDirection:"column",alignItems:"center",gap:"1px",background:i===0?"#7c3aed":"#ede9fe",color:i===0?"#fff":"#7c3aed",padding:"0.18rem 0.55rem",borderRadius:999,fontSize:"0.68rem",fontWeight:700,whiteSpace:"nowrap"}}>
                        <span>{i===0?"Current Employer":`Employer ${i+1}`}</span>
                        <span style={{fontSize:"0.58rem",fontWeight:500,opacity:0.85}}>{i===0?"most recent":"previous"}</span>
                      </span>
                      {i<arr.length-1&&<span style={{fontSize:"0.65rem",color:"#94a3b8"}}>→</span>}
                    </span>
                  ))}
                </div>
              )}

              {pfRecords.map((rec, i) => {
                const p3 = page3Companies[i];
                return (
                  <div key={i} className="pf-block">
                    <div className="pf-block-hdr">
                      <div style={{display:"flex",flexDirection:"column",gap:"0.25rem"}}>
                        <span className="pf-block-title">
                          {rec.companyName || (p3?.label) || `Employer ${i + 1}`}
                        </span>
                        {p3 && (
                          <span className="pf-block-badge">
                            {p3.isCurrent ? "🟢 Current / Most Recent" : i===1 ? "⬅ Previous Employer" : `⬅ Previous Employer ${i}`}
                          </span>
                        )}
                      </div>
                      {i > 0 && <button className="rm-btn" onClick={() => removePfRecord(i)}>− Remove</button>}
                    </div>

                    {/* Company name field */}
                    <div className="fr">
                      <F l="Company Name" v={rec.companyName} s={v => updatePf(i, "companyName", v)}/>
                      {/* hasPf toggle */}
                      <div className="fi">
                        <span className="fl">PF Maintained by Employer <span style={{color:"#ef4444",marginLeft:2}}>*</span></span>
                        <div style={{display:"flex",gap:"0.55rem",marginTop:"0.15rem"}}>
                          {["Yes","No"].map(v=>(
                            <button key={v} onClick={()=>updatePf(i,"hasPf",v)} style={{flex:1,padding:"0.62rem 0",borderRadius:9,border:rec.hasPf===v?"2px solid #7c3aed":"1.5px solid #b8b4d4",background:rec.hasPf===v?"#7c3aed":"#ececf9",color:rec.hasPf===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.82rem",fontWeight:700,fontFamily:"inherit",transition:"all 0.18s"}}>{v}</button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* If employer does NOT maintain PF — show a note and skip all PF fields */}
                    {rec.hasPf === "No" && (
                      <div style={{padding:"0.7rem 0.9rem",background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:9,fontSize:"0.78rem",color:"#0369a1",fontWeight:500,marginTop:"0.1rem"}}>
                        ℹ️ No PF details required — this employer does not maintain Provident Fund (e.g. startup, exempt establishment, or below threshold).
                      </div>
                    )}

                    {/* PF fields — only shown when hasPf is Yes */}
                    {rec.hasPf === "Yes" && (
                      <>
                        <div className="fr">
                          <F l="PF Member ID" v={rec.pfMemberId} s={v => updatePf(i, "pfMemberId", v)}/>
                        </div>
                        <div className="fr">
                          <F l="Date of Joining (EPFO)" v={rec.dojEpfo} s={v => updatePf(i, "dojEpfo", v)} t="date"/>
                          <F l="Date of Exit (EPFO)" v={rec.doeEpfo} s={v => updatePf(i, "doeEpfo", v)} t="date"/>
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

          {/* ── EPFO-fetched read-only records ───────────────────────── */}
          {showUanFields && epfoFetched.length > 0 && (
            <div className="sc grn">
              <div className="sh">
                <div className="si grn">📑</div>
                <span className="st">PF Employment Records (from EPFO)</span>
              </div>
              <p style={{fontSize:"0.75rem",color:"#8b88b0",marginBottom:"0.75rem",fontWeight:500}}>
                Records fetched from EPFO passbook — read only.
              </p>
              {epfoFetched.map((pf, i) => (
                <div key={i} style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"0.9rem 1rem",marginBottom:"0.65rem"}}>
                  <div style={{fontSize:"0.72rem",fontWeight:700,color:"#16a34a",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.5rem"}}>
                    {pf.companyName || `Employer ${i + 1}`}
                  </div>
                  <div className="pf-row">
                    {pf.pfMemberId    && <div className="pf-kv"><span className="pf-key">PF Member ID</span><span className="pf-val">{pf.pfMemberId}</span></div>}
                    {pf.dojEpfo       && <div className="pf-kv"><span className="pf-key">Date of Joining</span><span className="pf-val">{pf.dojEpfo}</span></div>}
                    {pf.doeEpfo       && <div className="pf-kv"><span className="pf-key">Date of Exit</span><span className="pf-val">{pf.doeEpfo}</span></div>}
                    {pf.pfTransferred !== undefined && <div className="pf-kv"><span className="pf-key">PF Transferred</span><span className="pf-val">{pf.pfTransferred ? "Yes" : "No"}</span></div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Nominee Details (EPFO Form 2 / Pension) ─────────────── */}
          {hasUan !== "" && (
            <div className="sc grn" style={{marginBottom:"1.1rem"}}>
              <div className="sh">
                <div className="si grn">👨‍👩‍👧</div>
                <span className="st">Nominee Details — PF & Pension (Form 2)</span>
              </div>
              <p style={{fontSize:"0.75rem",color:"#6b6894",marginBottom:"0.9rem",fontWeight:500,lineHeight:1.5}}>
                As per EPFO guidelines, you must nominate beneficiaries for your PF and Pension accumulations. These details are used to fill <strong>Form 2 (Revised)</strong>. You can nominate up to 4 persons. Shares must add up to 100%.
              </p>
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
                      <input className="in" type="date" value={nom.dob||""} onChange={e=>{setNominees(p=>{const n=[...p];n[idx]={...n[idx],dob:e.target.value};return n;});isDirtyRef.current=true;}} style={{colorScheme:"light"}}/>
                    </div>
                    <div className="fi">
                      <span className="fl">Relationship <span style={{color:"#ef4444"}}>*</span></span>
                      <select className="in" value={nom.relation||""} onChange={e=>{setNominees(p=>{const n=[...p];n[idx]={...n[idx],relation:e.target.value};return n;});isDirtyRef.current=true;}} style={{background:nom.relation?"#fff":"#f2f1f9",color:nom.relation?"#1a1730":"#8b88b0"}}>
                        <option value="">Select</option>
                        {["Spouse","Son","Daughter","Father","Mother","Brother","Sister","Other"].map(r=><option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="fr">
                    <div className="fi" style={{minWidth:220}}>
                      <span className="fl">Address <span style={{color:"#ef4444"}}>*</span></span>
                      <input className="in" value={nom.address||""} placeholder="Full residential address" onChange={e=>{setNominees(p=>{const n=[...p];n[idx]={...n[idx],address:e.target.value};return n;});isDirtyRef.current=true;}}/>
                    </div>
                    <div className="fi" style={{maxWidth:140}}>
                      <span className="fl">Share (%) <span style={{color:"#ef4444"}}>*</span></span>
                      <input className="in" value={nom.share||""} placeholder="e.g. 50" inputMode="numeric" maxLength={3} onChange={e=>{const v=e.target.value.replace(/\D/g,"").slice(0,3);setNominees(p=>{const n=[...p];n[idx]={...n[idx],share:v};return n;});isDirtyRef.current=true;}}/>
                      {nominees.length>1&&<span style={{fontSize:"0.65rem",color:"#6b6894",marginTop:2}}>Total: {nominees.reduce((s,n)=>s+(parseInt(n.share)||0),0)}%</span>}
                    </div>
                  </div>
                  {/* Guardian details if nominee is minor */}
                  {nom.dob && new Date().getFullYear() - new Date(nom.dob).getFullYear() < 18 && (
                    <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8,padding:"0.7rem 0.9rem",marginTop:"0.5rem"}}>
                      <div style={{fontSize:"0.68rem",fontWeight:700,color:"#92400e",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"0.5rem"}}>⚠️ Minor Nominee — Guardian Required</div>
                      <div className="fr">
                        <div className="fi">
                          <span className="fl">Guardian Name <span style={{color:"#ef4444"}}>*</span></span>
                          <input className="in" value={nom.guardianName||""} placeholder="Legal guardian's full name" onChange={e=>{setNominees(p=>{const n=[...p];n[idx]={...n[idx],guardianName:e.target.value};return n;});isDirtyRef.current=true;}}/>
                        </div>
                        <div className="fi">
                          <span className="fl">Guardian Address <span style={{color:"#ef4444"}}>*</span></span>
                          <input className="in" value={nom.guardianAddress||""} placeholder="Guardian's address" onChange={e=>{setNominees(p=>{const n=[...p];n[idx]={...n[idx],guardianAddress:e.target.value};return n;});isDirtyRef.current=true;}}/>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {nominees.length < 4 && (
                <button className="add-btn" onClick={()=>{setNominees(p=>[...p,makeNominee()]);isDirtyRef.current=true;}}>+ Add Another Nominee</button>
              )}
              {nominees.length > 1 && nominees.reduce((s,n)=>s+(parseInt(n.share)||0),0) !== 100 && (
                <p style={{fontSize:"0.75rem",color:"#ef4444",fontWeight:600,marginTop:"0.5rem"}}>⚠️ Total share must equal 100%. Current total: {nominees.reduce((s,n)=>s+(parseInt(n.share)||0),0)}%</p>
              )}
            </div>
          )}

          {/* ── EPFO Declarations + Digital Signature ────────────────── */}
          {hasUan !== "" && (
            <div className="sc" style={{marginBottom:"1.1rem",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,bottom:0,width:4,borderRadius:"16px 0 0 16px",background:"#4f46e5"}}/>
              <div className="sh">
                <div className="si" style={{background:"#eef2ff"}}>📜</div>
                <span className="st">EPFO Declarations & Digital Signature</span>
              </div>
              <p style={{fontSize:"0.75rem",color:"#6b6894",marginBottom:"0.9rem",fontWeight:500,lineHeight:1.5}}>
                As per EPFO guidelines, the following declarations are mandatory. Your digital signature with timestamp serves as your consent and replaces the physical Form 2 signature for this submission.
              </p>

              {/* Declaration 1 — PF Nomination */}
              <div style={{background:"#f0effe",border:"1px solid #dddaf0",borderRadius:10,padding:"0.9rem 1rem",marginBottom:"0.75rem"}}>
                <label style={{display:"flex",alignItems:"flex-start",gap:"0.75rem",cursor:"pointer"}}>
                  <input type="checkbox" checked={pfNomAck} onChange={e=>{setPfNomAck(e.target.checked);isDirtyRef.current=true;}} style={{marginTop:"0.2rem",width:17,height:17,accentColor:"#4f46e5",flexShrink:0,cursor:"pointer"}}/>
                  <div>
                    <div style={{fontSize:"0.68rem",fontWeight:800,color:"#4f46e5",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"0.3rem"}}>PF Nomination Declaration (Form 2 — Part A)</div>
                    <span style={{fontSize:"0.82rem",color:"#1a1730",fontWeight:500,lineHeight:1.65}}>
                      I hereby nominate the person(s) listed above to receive the amount standing to my credit in the Provident Fund in the event of my death before the amount becomes payable, or having become payable, remains unpaid at my death. I confirm the nominee details are accurate and the shares add up to 100%.
                    </span>
                  </div>
                </label>
              </div>

              {/* Declaration 2 — Pension Nomination */}
              <div style={{background:"#f0effe",border:"1px solid #dddaf0",borderRadius:10,padding:"0.9rem 1rem",marginBottom:"0.75rem"}}>
                <label style={{display:"flex",alignItems:"flex-start",gap:"0.75rem",cursor:"pointer"}}>
                  <input type="checkbox" checked={pensionNomAck} onChange={e=>{setPensionNomAck(e.target.checked);isDirtyRef.current=true;}} style={{marginTop:"0.2rem",width:17,height:17,accentColor:"#4f46e5",flexShrink:0,cursor:"pointer"}}/>
                  <div>
                    <div style={{fontSize:"0.68rem",fontWeight:800,color:"#4f46e5",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"0.3rem"}}>Pension Nomination Declaration (Form 2 — Part B)</div>
                    <span style={{fontSize:"0.82rem",color:"#1a1730",fontWeight:500,lineHeight:1.65}}>
                      I nominate the above person(s) to receive the monthly widow/widower pension or children pension payable under the Employees' Pension Scheme, 1995, in the event of my death while in service or after retirement. I confirm all nominee details and am aware that this nomination supersedes any previous nomination made by me.
                    </span>
                  </div>
                </label>
              </div>

              {/* Declaration 3 — General EPFO */}
              <div style={{background:"#f0effe",border:"1px solid #dddaf0",borderRadius:10,padding:"0.9rem 1rem",marginBottom:"1rem"}}>
                <label style={{display:"flex",alignItems:"flex-start",gap:"0.75rem",cursor:"pointer"}}>
                  <input type="checkbox" checked={epfoDecl} onChange={e=>{setEpfoDecl(e.target.checked);isDirtyRef.current=true;}} style={{marginTop:"0.2rem",width:17,height:17,accentColor:"#4f46e5",flexShrink:0,cursor:"pointer"}}/>
                  <div>
                    <div style={{fontSize:"0.68rem",fontWeight:800,color:"#4f46e5",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"0.3rem"}}>General EPFO Declaration</div>
                    <span style={{fontSize:"0.82rem",color:"#1a1730",fontWeight:500,lineHeight:1.65}}>
                      I hereby declare that the information provided in this form regarding my UAN, PF member ID(s), service history, and nominee details is true and correct to the best of my knowledge. I understand that any false declaration may result in legal action under the Employees' Provident Funds & Miscellaneous Provisions Act, 1952.
                    </span>
                  </div>
                </label>
              </div>

              {/* Digital Signature Canvas */}
              <div style={{background:"#fff",border:"1.5px solid #e4e2f0",borderRadius:12,padding:"1.1rem 1.2rem"}}>
                <div style={{fontSize:"0.72rem",fontWeight:800,color:"#4f46e5",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"0.5rem"}}>Digital Signature</div>
                <p style={{fontSize:"0.72rem",color:"#6b6894",marginBottom:"0.75rem",fontWeight:500,lineHeight:1.5}}>
                  Draw your signature below using mouse or finger. This will be recorded along with the date and time as your digital consent.
                </p>
                <canvas
                  ref={sigCanvasRef}
                  width={560} height={120}
                  className={`sig-canvas${sigDataUrl?" signed":""}`}
                  style={{width:"100%",maxWidth:560,height:120}}
                  onMouseDown={e=>{
                    sigDrawingRef.current=true;
                    const r=sigCanvasRef.current.getBoundingClientRect();
                    const scaleX=sigCanvasRef.current.width/r.width;
                    sigLastRef.current={x:(e.clientX-r.left)*scaleX,y:(e.clientY-r.top)*scaleX};
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
                  onMouseUp={()=>{
                    sigDrawingRef.current=false;
                    const dataUrl=sigCanvasRef.current.toDataURL("image/png");
                    setSigDataUrl(dataUrl);setSigTimestamp(new Date().toISOString());isDirtyRef.current=true;
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
                  onTouchEnd={()=>{
                    sigDrawingRef.current=false;
                    const dataUrl=sigCanvasRef.current.toDataURL("image/png");
                    setSigDataUrl(dataUrl);setSigTimestamp(new Date().toISOString());isDirtyRef.current=true;
                  }}
                  onMouseLeave={()=>{sigDrawingRef.current=false;}}
                />
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"0.6rem",flexWrap:"wrap",gap:"0.5rem"}}>
                  <div>
                    {sigDataUrl && sigTimestamp && (
                      <span style={{fontSize:"0.7rem",color:"#16a34a",fontWeight:600}}>
                        ✓ Signed — {new Date(sigTimestamp).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}
                      </span>
                    )}
                    {!sigDataUrl && <span style={{fontSize:"0.7rem",color:"#8b88b0",fontWeight:500}}>Draw your signature above</span>}
                  </div>
                  <button onClick={()=>{
                    const ctx=sigCanvasRef.current.getContext("2d");
                    ctx.clearRect(0,0,sigCanvasRef.current.width,sigCanvasRef.current.height);
                    setSigDataUrl("");setSigTimestamp("");isDirtyRef.current=true;
                  }} style={{padding:"0.3rem 0.8rem",background:"#fff5f5",color:"#ef4444",border:"1.5px solid #fecaca",borderRadius:7,fontSize:"0.72rem",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Clear</button>
                </div>
              </div>
            </div>
          )}

          {/* Info note */}
          <div style={{background:"#fff",borderRadius:12,padding:"1rem 1.25rem",marginBottom:"1.1rem",border:"1px solid #e8e5f0",boxShadow:"0 2px 8px rgba(30,26,62,0.06)"}}>
            <p style={{fontSize:"0.78rem",color:"#6b6894",lineHeight:1.6,fontWeight:500}}>
              ℹ️ After saving, you'll be taken to the <strong>Review</strong> page where you can check all your details and submit your profile.
            </p>
          </div>

          <div className="sbar">
            <button className="sbtn" onClick={() => handleNavigate("/employee/previous")}>← Previous</button>
            <span className={`ss${saveStatus==="Saved ✓"?" ok":saveStatus.startsWith("Error")?" err":""}`}>{saveStatus}</span>
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
