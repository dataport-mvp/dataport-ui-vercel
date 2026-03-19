// pages/employee/personal.js  — Page 1 of 5
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";
import FileUpload from "../../components/FileUpload";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const ACCENTS = { 1:"#4f46e5", 2:"#d97706", 3:"#7c3aed", 4:"#0891b2", 5:"#16a34a" };
const STEP_DONE_BG = "#2a2460";
const STEP_DONE_CK = "#a78bfa";
const STEP_CONN    = "#a78bfa";

// ── Gender options — inclusive list ──────────────────────────────────
const GENDER_OPTIONS = [
  "Male",
  "Female",
  "Non-binary",
  "Genderqueer",
  "Genderfluid",
  "Agender",
  "Bigender",
  "Two-Spirit",
  "Transgender Male",
  "Transgender Female",
  "Intersex",
  "Prefer not to say",
  "Other",
];

// ── Bank logos (emoji fallback) ───────────────────────────────────────
const BANK_LIST = [
  "State Bank of India (SBI)",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank (PNB)",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "Bank of India",
  "Indian Bank",
  "Central Bank of India",
  "Indian Overseas Bank",
  "UCO Bank",
  "Bank of Maharashtra",
  "Punjab & Sind Bank",
  "Yes Bank",
  "IDFC First Bank",
  "IndusInd Bank",
  "Federal Bank",
  "South Indian Bank",
  "Karnataka Bank",
  "Karur Vysya Bank",
  "City Union Bank",
  "Dhanlaxmi Bank",
  "Nainital Bank",
  "RBL Bank",
  "DCB Bank",
  "Bandhan Bank",
  "AU Small Finance Bank",
  "Ujjivan Small Finance Bank",
  "Jana Small Finance Bank",
  "Equitas Small Finance Bank",
  "ESAF Small Finance Bank",
  "Suryoday Small Finance Bank",
  "Other",
];

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #cdd2ed; font-family: 'Plus Jakarta Sans', sans-serif; }
  .pg { min-height: 100vh; background: #cdd2ed; padding-bottom: 3rem; }
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
    display: flex; align-items: center; justify-content: center; font-size: 1rem;
    transition: all 0.2s; }
  .bell-btn:hover { border-color: #a78bfa; background: rgba(167,139,250,0.1); }
  .bell-badge { position: absolute; top: -5px; right: -5px; background: #ef4444; color: #fff;
    border-radius: 999px; font-size: 0.6rem; font-weight: 800; min-width: 16px; height: 16px;
    display: flex; align-items: center; justify-content: center; padding: 0 3px; border: 2px solid #1e1a3e; }

  .tab-row { display: flex; border-bottom: 2px solid #e8e5f0; margin-bottom: 1.75rem; }
  .tab-btn { padding: 0.6rem 1.4rem; border: none; background: none; font-family: inherit;
    font-size: 0.875rem; color: #94a3b8; cursor: pointer; border-bottom: 2.5px solid transparent;
    margin-bottom: -2px; font-weight: 600; transition: all 0.2s; }
  .tab-btn.active { color: #4f46e5; border-bottom-color: #4f46e5; }
  .tab-btn:hover:not(.active) { color: #475569; }

  .sc { background: #ffffff; border-radius: 16px; padding: 1.5rem 1.6rem;
    margin-bottom: 1.1rem; box-shadow: 0 6px 28px rgba(30,26,62,0.22), 0 2px 8px rgba(30,26,62,0.12);
    border: 1px solid rgba(255,255,255,0.85); position: relative; overflow: hidden; }
  .sc::before { content: ''; position: absolute; top: 0; left: 0; bottom: 0;
    width: 4px; border-radius: 16px 0 0 16px; }
  .sc.ind::before { background: #4f46e5; }
  .sc.cyn::before { background: #0891b2; }
  .sc.amb::before { background: #d97706; }
  .sc.ros::before { background: #e11d48; }
  .sc.vio::before { background: #7c3aed; }
  .sc.grn::before { background: #16a34a; }
  .sc.teal::before { background: #0d9488; }

  .sh { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.15rem; }
  .si { width: 32px; height: 32px; border-radius: 8px; display: flex;
    align-items: center; justify-content: center; font-size: 0.95rem; flex-shrink: 0; }
  .si.ind { background: #eef2ff; } .si.cyn { background: #ecfeff; }
  .si.amb { background: #fffbeb; } .si.ros { background: #fff1f2; }
  .si.vio { background: #f5f3ff; } .si.grn { background: #f0fdf4; }
  .si.teal { background: #f0fdfa; }
  .st { font-size: 0.93rem; font-weight: 700; color: #1e293b; }

  .fr { display: flex; gap: 0.9rem; flex-wrap: wrap; margin-bottom: 0.85rem; }
  .fr:last-child { margin-bottom: 0; }
  .fi { display: flex; flex-direction: column; gap: 0.28rem; flex: 1; min-width: 138px; }
  .fl { font-size: 0.7rem; font-weight: 700; color: #8b88b0; letter-spacing: 0.55px; text-transform: uppercase; }
  .in { padding: 0.65rem 0.875rem; background: #ececf9; border: 1.5px solid #b8b4d4;
    border-radius: 9px; font-family: inherit; font-size: 0.875rem; color: #1e293b;
    outline: none; width: 100%; transition: all 0.18s; }
  .in:focus { border-color: #4f46e5; background: #fff; box-shadow: 0 0 0 3px rgba(79,70,229,0.13); }
  .in:disabled { background: #ece9f5; color: #a0aec0; cursor: not-allowed; }
  .in.err { border-color: #ef4444 !important; background: #fff8f8 !important; box-shadow: 0 0 0 3px rgba(239,68,68,0.10) !important; }
  .err-msg { font-size: 0.68rem; color: #ef4444; font-weight: 600; margin-top: 0.2rem; display: block; }
  .fe { font-size: 0.7rem; color: #ef4444; margin-top: 2px; font-weight: 500; }

  .photo-wrap { width: 90px; height: 90px; border-radius: 50%; background: #eef2ff;
    border: 2.5px solid #c7d2fe; display: flex; align-items: center;
    justify-content: center; overflow: hidden; flex-shrink: 0; }
  .photo-wrap img { width: 100%; height: 100%; object-fit: cover; }

  .sbar { display: flex; justify-content: space-between; align-items: center;
    margin-top: 1.5rem; padding: 1rem 1.5rem; background: #1e1a3e;
    border-radius: 12px; box-shadow: 0 6px 28px rgba(30,26,62,0.22); border: 1px solid rgba(255,255,255,0.85); }
  .ss { font-size: 0.84rem; color: #9d9bc4; font-weight: 500; }
  .ss.ok { color: #16a34a; } .ss.err { color: #ef4444; }
  .pbtn { padding: 0.72rem 1.9rem; background: #4f46e5; color: #fff; border: none;
    border-radius: 10px; font-family: inherit; font-size: 0.875rem; font-weight: 700;
    cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(79,70,229,0.28); }
  .pbtn:hover { background: #4338ca; transform: translateY(-1px); }
  .sbtn { padding: 0.72rem 1.5rem; background: transparent; color: #9d9bc4; border: 1.5px solid #2d2860;
    border-radius: 10px; font-family: inherit; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .sbtn:hover { background: #f5f4f0; }

  .date-input { padding: 0.65rem 0.875rem; background: #ececf9; border: 1.5px solid #b8b4d4;
    border-radius: 9px; font-family: inherit; font-size: 0.875rem; color: #1e293b;
    outline: none; width: 100%; cursor: pointer; transition: all 0.18s; }
  .date-input:focus { border-color: #4f46e5; background: #fff; box-shadow: 0 0 0 3px rgba(79,70,229,0.13); }
  .date-input::placeholder { color: #b8b4d4; }

  .mid-save { display: flex; justify-content: flex-end; margin: 0.5rem 0 1rem; }
  .mid-save-btn { padding: 0.45rem 1.1rem; background: transparent; color: #4f46e5;
    border: 1.5px solid #c7d2fe; border-radius: 8px; font-family: inherit;
    font-size: 0.78rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
  .mid-save-btn:hover { background: #eef2ff; border-color: #4f46e5; }

  .cmsg { padding: 0.6rem 0.875rem; background: #ececf9; border: 1.5px solid #b8b4d4;
    border-radius: 9px; font-family: inherit; font-size: 0.84rem; color: #1e293b;
    outline: none; width: 100%; resize: vertical; min-height: 72px; transition: all 0.18s; }
  .cmsg:focus { border-color: #4f46e5; background: #fff; box-shadow: 0 0 0 3px rgba(79,70,229,0.13); }

  /* Bank section divider */
  .bank-note { font-size: 0.72rem; color: #0d9488; background: #f0fdfa; border: 1px solid #99f6e4;
    border-radius: 8px; padding: 0.5rem 0.75rem; margin-bottom: 0.85rem; font-weight: 500; line-height: 1.5; }

  @media (max-width: 640px) {
    .fr { flex-direction: column; } .fi { min-width: 100%; }
    .topbar { flex-direction: column; gap: 0.6rem; align-items: flex-start; position: relative; }
  }
`;

function ConsentBell({ apiFetch, router }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch(`${API}/consent/my`);
        if (res.ok) {
          const data = await res.json();
          setCount(data.filter(c => String(c.status || "pending").toLowerCase() === "pending").length);
        }
      } catch (_) {}
    };
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [apiFetch]);
  return (
    <button className="bell-btn" onClick={() => router.push("/employee/personal?tab=consents")} title="Consent Requests">
      🔔
      {count > 0 && <span className="bell-badge">{count}</span>}
    </button>
  );
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
      {steps.map((s, i) => {
        const isDone = current > s.n, isActive = current === s.n;
        const col = ACCENTS[s.n];
        return (
          <div key={s.n} style={{display:"flex",alignItems:"center"}}>
            <button onClick={() => onNavigate(s.path)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.3rem",background:"none",border:"none",cursor:"pointer",padding:"0.2rem 0.75rem"}}>
              <div style={{width:40,height:40,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",transition:"all 0.25s",
                background:isActive?col:isDone?STEP_DONE_BG:"#f2f1f9",
                border:isActive?`2px solid ${col}`:isDone?`2px solid ${STEP_CONN}`:"2px solid #e4e2ed",
                boxShadow:isActive?`0 4px 12px ${col}55`:"none"}}>
                {isDone
                  ? <span style={{color:STEP_DONE_CK,fontWeight:800,fontSize:"0.9rem"}}>✓</span>
                  : <span style={{fontSize:"1rem",filter:isActive?"brightness(0) invert(1)":"none"}}>{s.icon}</span>}
              </div>
              <span style={{fontSize:"0.67rem",fontWeight:700,letterSpacing:"0.6px",textTransform:"uppercase",whiteSpace:"nowrap",
                color:isActive?col:isDone?STEP_DONE_CK:"#8b88b0"}}>{s.label}</span>
            </button>
            {i < steps.length - 1 && (
              <div style={{width:38,height:2,background:current>s.n?STEP_CONN:"#ccc9e4",margin:"0 -0.25rem",marginBottom:"1.4rem",borderRadius:2,flexShrink:0}}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ConsentTab({ apiFetch, profileStatus }) {
  const [consents,setConsents]=useState([]);
  const [loading,setLoading]=useState(true);
  const [acting,setActing]=useState(null);
  const [actionError,setActionError]=useState({});
  const [replyMsg,setReplyMsg]=useState({});
  const load=useCallback(async()=>{
    try{const res=await apiFetch(`${API}/consent/my`);if(res.ok)setConsents(await res.json());}catch(_){}
    setLoading(false);
  },[apiFetch]);
  useEffect(()=>{load();},[load]);
  useEffect(()=>{const id=setInterval(load,15000);return()=>clearInterval(id);},[load]);
  const respond=useCallback(async(consentId,decision,msg)=>{
    setActing(consentId);setActionError(p=>({...p,[consentId]:""}));
    try{
      const res=await apiFetch(`${API}/consent/respond`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({consent_id:consentId,status:decision==="approved"?"APPROVED":"DECLINED",responded_at:Date.now(),reply_message:msg||""})});
      if(res.ok){await load();}else{const errData=await res.json().catch(()=>({}));setActionError(p=>({...p,[consentId]:errData.detail||errData.message||`Error ${res.status}`}));}
    }catch(e){setActionError(p=>({...p,[consentId]:"Network error — please retry"}));}
    setActing(null);
  },[apiFetch,load]);
  const withdraw=useCallback(async(consentId)=>{
    setActing(consentId);setActionError(p=>({...p,[consentId]:""}));
    try{
      const res=await apiFetch(`${API}/consent/withdraw?consent_id=${consentId}`,{method:"POST"});
      if(res.ok){await load();}else{const errData=await res.json().catch(()=>({}));setActionError(p=>({...p,[consentId]:errData.detail||errData.message||`Error ${res.status}`}));}
    }catch(e){setActionError(p=>({...p,[consentId]:"Network error — please retry"}));}
    setActing(null);
  },[apiFetch,load]);
  const norm=(c)=>({...c,status:String(c.status||"pending").toLowerCase()});
  if(loading)return <p style={{color:"#8b88b0",padding:"1rem 0",fontSize:"0.875rem"}}>Loading consents…</p>;
  if(!consents.length)return(<div style={{textAlign:"center",padding:"3rem",background:"#fff",borderRadius:14,boxShadow:"0 6px 28px rgba(30,26,62,0.22)"}}>
    <div style={{fontSize:38,marginBottom:10}}>📋</div>
    <p style={{color:"#1a1730",margin:0,fontWeight:700}}>No consent requests yet</p>
    <p style={{fontSize:"0.82rem",color:"#8b88b0",marginTop:6}}>Employers will appear here when they request your data</p>
  </div>);
  const all=consents.map(norm);
  const pending=all.filter(c=>c.status==="pending");
  const approved=all.filter(c=>c.status==="approved");
  const declined=all.filter(c=>c.status==="declined");
  const revoked=all.filter(c=>c.status==="revoked");
  const sColor={pending:"#f59e0b",approved:"#16a34a",declined:"#ef4444",revoked:"#94a3b8"};
  const sBg={pending:"#fffbeb",approved:"#f0fdf4",declined:"#fff5f5",revoked:"#f8fafc"};
  const profileNotSubmitted=profileStatus!=="submitted";

  const renderCard=(c)=>(
    <div key={c.consent_id} style={{border:"1px solid #ebe9f5",borderRadius:12,padding:"1.1rem 1.25rem",marginBottom:"0.65rem",background:"#fff",boxShadow:"0 1px 5px rgba(79,70,229,0.05)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,color:"#1a1730",fontSize:"0.93rem"}}>{c.requestor_name||c.employer_name||c.requestor_email||c.employer_email}</div>
          {c.message&&<div style={{marginTop:"0.5rem",padding:"0.5rem 0.75rem",background:"#f5f3ff",border:"1px solid #ddd6fe",borderRadius:8}}>
            <div style={{fontSize:"0.67rem",fontWeight:700,color:"#4f46e5",textTransform:"uppercase",letterSpacing:0.5,marginBottom:3}}>Message</div>
            <div style={{fontSize:"0.84rem",color:"#6b6894",lineHeight:1.5}}>{c.message}</div>
          </div>}
        </div>
        <span style={{padding:"0.18rem 0.7rem",borderRadius:999,fontSize:"0.7rem",fontWeight:700,color:sColor[c.status]||"#64748b",background:sBg[c.status]||"#f8fafc",whiteSpace:"nowrap",marginLeft:"0.75rem",border:`1px solid ${(sColor[c.status]||"#94a3b8")}33`}}>{c.status.charAt(0).toUpperCase()+c.status.slice(1)}</span>
      </div>
      {actionError[c.consent_id]&&<p style={{fontSize:"0.75rem",color:"#ef4444",marginTop:"0.5rem",fontWeight:600}}>⚠️ {actionError[c.consent_id]}</p>}
      {c.status==="pending"&&(<div style={{marginTop:"0.8rem"}}>
        {profileNotSubmitted&&<div style={{fontSize:"0.75rem",color:"#92400e",background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8,padding:"0.5rem 0.75rem",marginBottom:"0.6rem"}}>⚠️ Complete and submit your profile before approving consent requests.</div>}
        <textarea
          className="cmsg"
          placeholder="Optional message to employer…"
          value={replyMsg[c.consent_id]||""}
          onChange={e=>{const val=e.target.value;setReplyMsg(p=>({...p,[c.consent_id]:val}));}}
          style={{marginBottom:"0.5rem"}}
        />
        <div style={{display:"flex",gap:"0.5rem"}}>
          <button disabled={acting===c.consent_id||profileNotSubmitted} onClick={()=>respond(c.consent_id,"approved",replyMsg[c.consent_id]||"")} style={{flex:1,padding:"0.5rem",background:profileNotSubmitted?"#e5e7eb":"#16a34a",color:profileNotSubmitted?"#9ca3af":"#fff",border:"none",borderRadius:8,fontWeight:700,cursor:(acting===c.consent_id||profileNotSubmitted)?"not-allowed":"pointer",fontSize:"0.875rem",fontFamily:"inherit",opacity:acting===c.consent_id?0.7:1}}>{acting===c.consent_id?"…":"Approve"}</button>
          <button disabled={acting===c.consent_id} onClick={()=>respond(c.consent_id,"declined",replyMsg[c.consent_id]||"")} style={{flex:1,padding:"0.5rem",background:"#fff5f5",color:"#ef4444",border:"1.5px solid #fecaca",borderRadius:8,fontWeight:700,cursor:acting===c.consent_id?"not-allowed":"pointer",fontSize:"0.875rem",fontFamily:"inherit",opacity:acting===c.consent_id?0.7:1}}>{acting===c.consent_id?"…":"Decline"}</button>
        </div>
      </div>)}
      {c.status==="approved"&&(<div style={{marginTop:"0.8rem"}}>
        <button disabled={acting===c.consent_id} onClick={()=>withdraw(c.consent_id)} style={{padding:"0.45rem 1rem",background:"#fff5f5",color:"#ef4444",border:"1.5px solid #fecaca",borderRadius:8,fontWeight:600,cursor:acting===c.consent_id?"not-allowed":"pointer",fontSize:"0.8rem",fontFamily:"inherit",opacity:acting===c.consent_id?0.7:1}}>{acting===c.consent_id?"…":"Withdraw consent"}</button>
        <span style={{fontSize:"0.7rem",color:"#94a3b8",marginLeft:"0.6rem"}}>Employer will immediately lose access</span>
      </div>)}
    </div>
  );

  const SL=({text,cnt})=><div style={{fontSize:"0.68rem",fontWeight:700,color:"#8b88b0",textTransform:"uppercase",letterSpacing:1,margin:"1.1rem 0 0.5rem"}}>{text}{cnt!==undefined&&` (${cnt})`}</div>;
  return(
    <div>
      {pending.length>0&&<><SL text="Pending" cnt={pending.length}/>{pending.map(c=>renderCard(c))}</>}
      {approved.length>0&&<><SL text="Approved"/>{approved.map(c=>renderCard(c))}</>}
      {declined.length>0&&<><SL text="Declined"/>{declined.map(c=>renderCard(c))}</>}
      {revoked.length>0&&<><SL text="Withdrawn"/>{revoked.map(c=>renderCard(c))}</>}
    </div>
  );
}

function F({ l, v, s, t = "text", r = true }) {
  return (
    <div className="fi">
      <span className="fl">{l}{r && <span style={{color:"#ef4444",marginLeft:2}}>*</span>}</span>
      <input className="in" type={t} value={v || ""} onChange={e => s(e.target.value)} />
    </div>
  );
}
function FS({ l, v, s, o, r = true }) {
  return (
    <div className="fi">
      <span className="fl">{l}{r && <span style={{color:"#ef4444",marginLeft:2}}>*</span>}</span>
      <select className="in" value={v} onChange={e => s(e.target.value)} style={{background:"inherit",color:v?"#1a1730":"#8b88b0",appearance:"auto"}}>
        <option value="">Select</option>
        {o.map(x => <option key={x} value={x}>{x}</option>)}
      </select>
    </div>
  );
}

function DateField({ l, v, s, r = true }) {
  const [raw, setRaw] = useState(() => {
    if (v && v.includes("-")) { const [y, mo, d] = v.split("-"); return `${d}/${mo}/${y}`; }
    return v || "";
  });
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) {
      if (v && v.includes("-")) { const [y, mo, d] = v.split("-"); setRaw(`${d}/${mo}/${y}`); }
      else setRaw(v || "");
    }
  }, [v, focused]);
  const handleChange = (e) => {
    let val = e.target.value.replace(/[^0-9/]/g, "");
    if (val.length === 2 && raw.length === 1) val = val + "/";
    if (val.length === 5 && raw.length === 4) val = val + "/";
    if (val.length > 10) return;
    setRaw(val);
    if (val.length === 10) { const [d, mo, y] = val.split("/"); if (d && mo && y && y.length === 4) s(`${y}-${mo}-${d}`); }
    else s("");
  };
  return (
    <div className="fi">
      <span className="fl">{l}{r && <span style={{color:"#ef4444",marginLeft:2}}>*</span>}</span>
      <input className="date-input" value={raw} placeholder="DD/MM/YYYY" onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onChange={handleChange} maxLength={10} inputMode="numeric"/>
    </div>
  );
}

export default function PersonalDetails() {
  const router = useRouter();
  const { user, apiFetch, logout, ready } = useAuth();
  const [activeTab,setActiveTab]         = useState("profile");
  const [showSignout,setShowSignout]     = useState(false);
  const [saveStatus,setSaveStatus]       = useState("");
  const [midSaveStatus,setMidSaveStatus] = useState("");
  const [loading,setLoading]             = useState(true);
  const [employeeId,setEmployeeId]       = useState("");
  const [draftReady,setDraftReady]       = useState(false); // true only after draft confirmed in DB
  const employeeIdRef                    = useRef(""); // immediately available, no render delay
  const [profileStatus,setProfileStatus] = useState("");
  const [photoPreview,setPhotoPreview]   = useState(null);
  const [errors,setErrors]               = useState({});
  const isDirtyRef = useRef(false);
  const fixErr = (key) => setErrors(p => ({ ...p, [key]: false }));

  useEffect(() => { if (router.query.tab === "consents") setActiveTab("consents"); }, [router.query.tab]);

  // ── Personal fields ─────────────────────────────────────────────────
  const [firstName,setFirstName]         = useState("");
  const [middleName,setMiddleName]       = useState("");
  const [lastName,setLastName]           = useState("");
  const [fatherFirst,setFatherFirst]     = useState("");
  const [fatherMiddle,setFatherMiddle]   = useState("");
  const [fatherLast,setFatherLast]       = useState("");
  const [motherFirst,setMotherFirst]     = useState("");
  const [motherMiddle,setMotherMiddle]   = useState("");
  const [motherLast,setMotherLast]       = useState("");
  const [dob,setDob]                     = useState("");
  const [gender,setGender]               = useState("");
  const [nationality,setNationality]     = useState("");
  const [mobile,setMobile]               = useState("");
  const [email,setEmail]                 = useState("");
  const [aadhar,setAadhar]               = useState("");
  const [aadhaarEditing,setAadhaarEditing] = useState(false);
  const [nameAsPerAadhaar,setNameAsPerAadhaar] = useState("");
  const [pan,setPan]                     = useState("");
  const [nameAsPerPan,setNameAsPerPan]   = useState("");
  const [hasPassport,setHasPassport]     = useState("");   // "Yes" | "No" | ""
  const [passport,setPassport]           = useState("");
  const [passportIssue,setPassportIssue] = useState("");   // YYYY-MM-DD
  const [passportExpiry,setPassportExpiry] = useState(""); // YYYY-MM-DD
  const [passportKey,setPassportKey]     = useState("");         // passport document upload
  const [bloodGroup,setBloodGroup]       = useState("");
  const [maritalStatus,setMaritalStatus] = useState("");
  const [emergName,setEmergName]         = useState("");
  const [emergRel,setEmergRel]           = useState("");
  const [emergPhone,setEmergPhone]       = useState("");
  const [curFrom,setCurFrom]             = useState("");
  const [curDoor,setCurDoor]             = useState("");
  const [curVillage,setCurVillage]       = useState("");
  const [curLocality,setCurLocality]     = useState("");
  const [curDistrict,setCurDistrict]     = useState("");
  const [curState,setCurState]           = useState("");
  const [curPin,setCurPin]               = useState("");
  const [permFrom,setPermFrom]           = useState("");
  const [permDoor,setPermDoor]           = useState("");
  const [sameAsCurrent,setSameAsCurrent] = useState(false);
  const [permVillage,setPermVillage]     = useState("");
  const [permLocality,setPermLocality]   = useState("");
  const [permDistrict,setPermDistrict]   = useState("");
  const [permState,setPermState]         = useState("");
  const [permPin,setPermPin]             = useState("");
  const [aadhaarKey,setAadhaarKey]       = useState("");
  const [panKey,setPanKey]               = useState("");
  const [photoKey,setPhotoKey]           = useState("");

  // ── Bank details ─────────────────────────────────────────────────────
  const [bankName,setBankName]           = useState("");
  const [bankOther,setBankOther]         = useState("");   // custom bank name when "Other" selected
  const [bankAccountName,setBankAccountName] = useState("");
  const [ifsc,setIfsc]                   = useState("");
  const [branch,setBranch]               = useState("");
  const [accountNo,setAccountNo]         = useState("");         // raw entry
  const [accountNoConfirm,setAccountNoConfirm] = useState("");   // confirm field
  const [accountType,setAccountType]     = useState("");
  const [accountFull,setAccountFull]     = useState("");         // full number stored, shown masked
  const [accountLast4,setAccountLast4]   = useState("");         // last 4 for display

  const dirty = (setter) => (val) => { setter(val); isDirtyRef.current = true; };

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/employee/login"); return; }
    if (user.role !== "employee") { router.replace("/employee/login"); return; }
  }, [ready, user, router]);

  useEffect(() => {
    if (!ready || !user) return;
    if (user?.email) setEmail(user.email);
    if (user?.phone) setMobile(user.phone);
    const init = async () => {
      if (!user || user.role !== "employee") return;
      try {
        const res = await apiFetch(`${API}/employee/draft`);
        if (res.ok) {
          const d = await res.json();
          if (d.employee_id) { setEmployeeId(d.employee_id); employeeIdRef.current = d.employee_id; setProfileStatus(d.status || "draft"); setDraftReady(true); }
          if (d.firstName)    setFirstName(d.firstName);
          if (d.middleName)   setMiddleName(d.middleName);
          if (d.lastName)     setLastName(d.lastName);
          if (d.fatherFirst)  setFatherFirst(d.fatherFirst);
          if (d.fatherMiddle) setFatherMiddle(d.fatherMiddle);
          if (d.fatherLast)   setFatherLast(d.fatherLast);
          if (d.motherFirst)  setMotherFirst(d.motherFirst);
          if (d.motherMiddle) setMotherMiddle(d.motherMiddle);
          if (d.motherLast)   setMotherLast(d.motherLast);
          if (d.dob)          setDob(d.dob);
          if (d.gender)       setGender(d.gender);
          if (d.nationality)  setNationality(d.nationality);
          if (d.mobile)       setMobile(d.mobile);
          if (d.email)        setEmail(d.email);
          if (d.aadhaar || d.aadhar) setAadhar(d.aadhaar || d.aadhar);
          if (d.nameAsPerAadhaar) setNameAsPerAadhaar(d.nameAsPerAadhaar);
          if (d.pan)          setPan(d.pan);
          if (d.nameAsPerPan) setNameAsPerPan(d.nameAsPerPan);
          if (d.hasPassport)     setHasPassport(d.hasPassport);
          if (d.passport)       setPassport(d.passport);
          if (d.passportIssue)  setPassportIssue(d.passportIssue);
          if (d.passportExpiry) setPassportExpiry(d.passportExpiry);
          if (d.passportKey)   setPassportKey(d.passportKey);
          if (d.bloodGroup)   setBloodGroup(d.bloodGroup);
          if (d.maritalStatus) setMaritalStatus(d.maritalStatus);
          if (d.emergName)    setEmergName(d.emergName);
          if (d.emergRel)     setEmergRel(d.emergRel);
          if (d.emergPhone)   setEmergPhone(d.emergPhone);
          if (d.aadhaarKey)   setAadhaarKey(d.aadhaarKey);
          if (d.panKey)       setPanKey(d.panKey);
          if (d.photoKey)     setPhotoKey(d.photoKey);
          // Bank
          if (d.bankName)        setBankName(d.bankName);
          if (d.bankOther)       setBankOther(d.bankOther);
          if (d.bankAccountName) setBankAccountName(d.bankAccountName);
          if (d.ifsc)            setIfsc(d.ifsc);
          if (d.branch)          setBranch(d.branch);
          if (d.accountFull)     setAccountFull(d.accountFull);
          if (d.accountLast4)    setAccountLast4(d.accountFull ? d.accountFull.slice(-4) : (d.accountLast4||""));
          if (d.accountType)     setAccountType(d.accountType);
          const cur  = d.currentAddress   || {};
          const perm = d.permanentAddress || {};
          if (cur.from)     setCurFrom(cur.from);
          if (cur.door)     setCurDoor(cur.door);
          if (cur.village)  setCurVillage(cur.village);
          if (cur.locality) setCurLocality(cur.locality);
          if (cur.district) setCurDistrict(cur.district);
          if (cur.state)    setCurState(cur.state);
          if (cur.pin)      setCurPin(cur.pin);
          if (perm.from)     setPermFrom(perm.from);
          if (perm.door)     setPermDoor(perm.door);
          if (d.sameAsCurrent) setSameAsCurrent(true);
          if (perm.village)  setPermVillage(perm.village);
          if (perm.locality) setPermLocality(perm.locality);
          if (perm.district) setPermDistrict(perm.district);
          if (perm.state)    setPermState(perm.state);
          if (perm.pin)      setPermPin(perm.pin);
        } else {
          const empId = `emp-${Date.now()}`;
          const createRes = await apiFetch(`${API}/employee`, {
            method: "POST",
            body: JSON.stringify({
              employee_id: empId,
              status: "draft",
              email: user?.email || "",
              mobile: user?.phone || "0000000000",
              firstName: "draft",
              lastName:  "draft",
            }),
          });
          const rd = await createRes.json().catch(() => ({}));
          const confirmedId = rd.employee_id || empId;
          setEmployeeId(confirmedId);
          employeeIdRef.current = confirmedId;
          setDraftReady(true);
        }
      } catch (_) {}
      setLoading(false);
    };
    init();
  }, [ready, user, apiFetch]);

  // Load photo preview
  useEffect(() => {
    if (!employeeId || !photoKey || photoPreview) return;
    const loadPreview = async () => {
      try {
        const res = await apiFetch(`${API}/documents/${employeeId}`);
        if (res.ok) { const data = await res.json(); const url = data?.documents?.personal?.photo?.url; if (url) setPhotoPreview(url); }
      } catch (_) {}
    };
    loadPreview();
  }, [employeeId, photoKey]);

  const buildPayload = (empId) => ({
    employee_id: empId, status: "draft",
    firstName, middleName, lastName,
    fatherFirst, fatherMiddle, fatherLast,
    motherFirst, motherMiddle, motherLast,
    fatherName: `${fatherFirst} ${fatherMiddle} ${fatherLast}`.trim(),
    motherName: `${motherFirst} ${motherMiddle} ${motherLast}`.trim(),
    dob, gender, nationality, mobile, email,
    aadhaar: aadhar.length <= 4 ? aadhar : aadhar.slice(-4),
    nameAsPerAadhaar,
    pan, nameAsPerPan,
    hasPassport, passport, passportIssue, passportExpiry, passportKey, bloodGroup, maritalStatus,
    emergName, emergRel, emergPhone,
    aadhaarKey, panKey, photoKey,
    sameAsCurrent,
    // Bank — full account number stored securely, displayed masked
    bankName: bankName === "Other" ? (bankOther || bankName) : bankName,
    bankOther,
    bankAccountName, ifsc, branch, accountType,
    accountFull: accountNo || accountFull || "",
    accountLast4: accountNo.length >= 4
      ? accountNo.slice(-4)
      : (accountLast4 || ""),
    currentAddress:   { from:curFrom, door:curDoor, village:curVillage, locality:curLocality, district:curDistrict, state:curState, pin:curPin },
    permanentAddress: {
      from:     sameAsCurrent ? curFrom     : permFrom,
      door:     sameAsCurrent ? curDoor     : permDoor,
      village:  sameAsCurrent ? curVillage  : permVillage,
      locality: sameAsCurrent ? curLocality : permLocality,
      district: sameAsCurrent ? curDistrict : permDistrict,
      state:    sameAsCurrent ? curState    : permState,
      pin:      sameAsCurrent ? curPin      : permPin,
    },
  });

  const saveDraft = async () => {
    const empId = employeeId || `emp-${Date.now()}`;
    if (!employeeId) setEmployeeId(empId);
    const res = await apiFetch(`${API}/employee`, { method:"POST", body:JSON.stringify(buildPayload(empId)) });
    if (!res.ok) throw new Error(parseError(await res.json().catch(() => ({}))));
    const rd = await res.json().catch(() => ({}));
    if (rd.employee_id) setEmployeeId(rd.employee_id);
    // After saving, store full number in accountFull for masked display
    if (accountNo.length >= 4) { setAccountFull(accountNo); setAccountLast4(accountNo.slice(-4)); setAccountNo(""); setAccountNoConfirm(""); }
  };

  const handleSave = async () => {
    const e = {};
    if (!firstName)    e.firstName = true;
    if (!lastName)     e.lastName = true;
    if (!dob)          e.dob = true;
    if (!gender)       e.gender = true;
    if (!nationality)  e.nationality = true;
    if (!mobile)       e.mobile = true;
    if (!aadhar)                                      e.aadhar = true;
    if (aadhar && aadhar.length !== 12 && aadhar.length !== 4) e.aadhar = true;
    if (!nameAsPerAadhaar)  e.nameAsPerAadhaar = true;
    if (!pan)           e.pan = true;
    if (!nameAsPerPan)  e.nameAsPerPan = true;
    if (!hasPassport)   e.hasPassport = true;
    if (!bloodGroup)    e.bloodGroup = true;
    if (!maritalStatus) e.maritalStatus = true;
    if (!curDoor)       e.curDoor = true;
    if (!curDistrict)   e.curDistrict = true;
    if (!curState)      e.curState = true;
    if (!curPin)        e.curPin = true;
    if (!aadhaarKey)    e.aadhaarKey = true;
    if (!panKey)        e.panKey = true;
    if (!photoKey)      e.photoKey = true;
    // Bank — required
    if (!bankName)         e.bankName = true;
    if (bankName==="Other" && !bankOther) e.bankOther = true;
    if (!bankAccountName)  e.bankAccountName = true;
    if (!ifsc)             e.ifsc = true;
    if (!branch)           e.branch = true;
    if (!accountType)      e.accountType = true;
    // Account number: required if not yet saved (accountLast4 empty) and accountNo not filled
    if (!accountLast4 && !accountNo) e.accountNo = true;
    if (accountNo && accountNo !== accountNoConfirm) e.accountNoConfirm = true;
    if (Object.keys(e).length > 0) {
      setErrors(e);
      setSaveStatus("Please fill all required fields ↑");
      setTimeout(() => { const el = document.querySelector(".in.err"); if (el) el.scrollIntoView({ behavior:"smooth", block:"center" }); }, 60);
      return;
    }
    setErrors({});
    setSaveStatus("Saving...");
    try { await saveDraft(); isDirtyRef.current = false; setSaveStatus("Saved ✓"); router.push("/employee/education"); }
    catch (err) { setSaveStatus(`Error: ${err.message || "Could not save"}`); }
  };

  const handleMidSave = async () => {
    setMidSaveStatus("Saving…");
    try { await saveDraft(); isDirtyRef.current = false; setMidSaveStatus("Saved ✓"); setTimeout(() => setMidSaveStatus(""), 2000); }
    catch (_) { setMidSaveStatus("Error saving"); setTimeout(() => setMidSaveStatus(""), 2500); }
  };

  const handleSaveSignout = async () => { try { await saveDraft(); isDirtyRef.current = false; } catch (_) {} logout(); };
  const handleNavigate = async (path) => { if (isDirtyRef.current) { try { await saveDraft(); isDirtyRef.current = false; } catch (_) {} } const dest = path === "/employee/review" ? "/employee/review?edited=1" : path; router.push(dest); };
  const handleSignout  = async () => { if (isDirtyRef.current) { try { await saveDraft(); } catch (_) {} } logout(); };

  const aadhaarDisplay = aadhaarEditing
    ? aadhar
    : (aadhar.length >= 4 ? `XXXX XXXX ${aadhar.slice(-4)}` : aadhar);

  if (!ready || !user) return null;
  if (loading) return (<div style={{minHeight:"100vh",background:"#cdd2ed",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"#8b88b0",fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:500}}>Loading your profile…</p></div>);

  return (
    <>
      <style>{G}</style>
      <div className="pg">
        {showSignout && <SignoutModal onConfirm={handleSignout} onCancel={() => setShowSignout(false)} />}

        <div className="topbar">
          <span className="logo-text">Datagate</span>
          <div className="topbar-right">
            <span className="user-name">👤 {user.name || user.email}</span>
            <ConsentBell apiFetch={apiFetch} router={router} />
            <button className="signout-btn" onClick={handleSaveSignout} style={{borderColor:"#ef4444",color:"#ef4444"}}>Save & Sign out</button>
          </div>
        </div>

        <div className="wrap">
          <div className="tab-row">
            <button className={`tab-btn${activeTab==="profile"?" active":""}`} onClick={() => setActiveTab("profile")}>My Profile</button>
            <button className={`tab-btn${activeTab==="consents"?" active":""}`} onClick={() => setActiveTab("consents")}>Consent Requests</button>
          </div>

          {activeTab === "consents" ? <ConsentTab apiFetch={apiFetch} profileStatus={profileStatus} /> : (
            <>
              <StepNav current={1} onNavigate={handleNavigate} />

              {/* Profile Photo */}
              <div className="sc ind">
                <div className="sh"><div className="si ind">📸</div><span className="st">Profile Photo <span style={{color:"#ef4444",fontSize:"0.8rem"}}>*</span></span></div>
                <div style={{display:"flex",alignItems:"center",gap:"1.25rem",flexWrap:"wrap"}}>
                  <div className="photo-wrap">
                    {photoPreview ? <img src={photoPreview} alt="profile"/> : <span style={{color:"#8b88b0",fontSize:"0.7rem",fontWeight:600,textAlign:"center",padding:"0 0.5rem"}}>No photo</span>}
                  </div>
                  <div style={{flex:1}}>
                    <FileUpload label="Upload Profile Photo" category="personal" subKey="photo" employeeId={employeeIdRef.current || employeeId} disabled={!draftReady} apiFetch={apiFetch} value={photoKey} onChange={(k, url) => { const key=typeof k==="string"?k:(k?.key||k?.s3_key||""); setPhotoKey(key); if (url) setPhotoPreview(url); else if (!key) setPhotoPreview(null); isDirtyRef.current = true; }} accept="image/*"/>
                    <p style={{fontSize:"0.7rem",color:"#8b88b0",marginTop:4}}>JPG or PNG · max 5MB</p>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div className="sc cyn">
                <div className="sh"><div className="si cyn">✏️</div><span className="st">Full Name</span></div>
                <div className="fr">
                  <F l="First Name"  v={firstName}  s={dirty(setFirstName)} />
                  <F l="Middle Name" v={middleName} s={dirty(setMiddleName)} r={false} />
                  <F l="Last Name"   v={lastName}   s={dirty(setLastName)} />
                </div>
              </div>

              {/* Father's Name */}
              <div className="sc vio">
                <div className="sh"><div className="si vio">👨</div><span className="st">Father's Name</span></div>
                <div className="fr">
                  <F l="First Name"  v={fatherFirst}  s={dirty(setFatherFirst)} />
                  <F l="Middle Name" v={fatherMiddle} s={dirty(setFatherMiddle)} r={false} />
                  <F l="Last Name"   v={fatherLast}   s={dirty(setFatherLast)} />
                </div>
              </div>

              {/* Mother's Name */}
              <div className="sc ros">
                <div className="sh"><div className="si ros">👩</div><span className="st">Mother's Name</span></div>
                <div className="fr">
                  <F l="First Name"  v={motherFirst}  s={dirty(setMotherFirst)} />
                  <F l="Middle Name" v={motherMiddle} s={dirty(setMotherMiddle)} r={false} />
                  <F l="Last Name"   v={motherLast}   s={dirty(setMotherLast)} />
                </div>
              </div>

              {/* Personal Info */}
              <div className="sc amb">
                <div className="sh"><div className="si amb">🪪</div><span className="st">Personal Information</span></div>
                <div className="fr">
                  <DateField l="Date of Birth" v={dob} s={dirty(setDob)} />
                  {/* ── Expanded gender dropdown ── */}
                  <FS l="Gender" v={gender} s={dirty(setGender)} o={GENDER_OPTIONS} />
                  <F l="Nationality" v={nationality} s={dirty(setNationality)} />
                </div>
                <div className="fr">
                  <div className="fi">
                    <span className="fl">Email <span style={{color:"#ef4444"}}>*</span></span>
                    <input className="in" value={email} disabled />
                  </div>
                  <div className="fi">
                    <span className="fl">Mobile <span style={{color:"#ef4444"}}>*</span></span>
                    <div style={{display:"flex",gap:"0.4rem"}}>
                      <input className="in" value="+91" disabled style={{maxWidth:52,textAlign:"center"}} />
                      <input className="in" value={mobile} disabled style={{flex:1}} />
                    </div>
                  </div>
                </div>
                {/* ── Passport toggle ── */}
                <div className="fr">
                  <div className="fi">
                    <span className="fl">Do you have a Passport? <span style={{color:"#ef4444"}}>*</span></span>
                    <div style={{display:"flex",gap:"0.55rem",marginTop:"0.15rem"}}>
                      {["Yes","No"].map(v=>(
                        <button key={v} type="button" onClick={()=>{dirty(setHasPassport)(v);if(v==="No"){setPassport("");setPassportIssue("");setPassportExpiry("");}}} style={{flex:1,padding:"0.62rem 0",borderRadius:9,border:hasPassport===v?"2px solid #4f46e5":"1.5px solid #b8b4d4",background:hasPassport===v?"#4f46e5":"#ececf9",color:hasPassport===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.82rem",fontWeight:700,fontFamily:"inherit",transition:"all 0.18s"}}>{v}</button>
                      ))}
                    </div>
                  </div>
                  <div className="fi"/>
                  <div className="fi"/>
                </div>
                {hasPassport==="Yes"&&(
                  <>
                  <div className="fr">
                    <div className="fi">
                      <span className="fl">Passport Number <span style={{color:"#ef4444"}}>*</span></span>
                      <input className="in" value={passport} placeholder="e.g. A1234567" maxLength={8} onChange={e=>dirty(setPassport)(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,""))}/>
                    </div>
                    <DateField l="Issue Date" v={passportIssue} s={dirty(setPassportIssue)} />
                    <DateField l="Expiry Date" v={passportExpiry} s={dirty(setPassportExpiry)} />
                  </div>
                  <div style={{marginTop:"0.15rem"}}>
                    <span className="fl" style={{display:"block",marginBottom:"0.28rem"}}>Upload Passport <span style={{color:"#ef4444"}}>*</span></span>
                    <FileUpload label="Upload Passport" category="personal" subKey="passport" employeeId={employeeIdRef.current || employeeId} disabled={!draftReady} apiFetch={apiFetch} value={passportKey} onChange={(k)=>{const key=typeof k==="string"?k:(k?.key||k?.s3_key||"");setPassportKey(key);isDirtyRef.current=true;fixErr&&fixErr("passportKey");}}/>
                  </div>
                  </>
                )}
                <div className="fr">
                  <FS l="Blood Group"    v={bloodGroup}    s={dirty(setBloodGroup)}    o={["A+","A-","B+","B-","AB+","AB-","O+","O-"]} />
                  <FS l="Marital Status" v={maritalStatus} s={dirty(setMaritalStatus)} o={["Single","Married","Divorced","Widowed","Separated"]} />
                  <div className="fi" />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="sc ros">
                <div className="sh"><div className="si ros">🚨</div><span className="st">Emergency Contact</span></div>
                <div className="fr">
                  <F l="Contact Name"  v={emergName}  s={dirty(setEmergName)} />
                  <F l="Relationship"  v={emergRel}   s={dirty(setEmergRel)} />
                  <F l="Phone Number"  v={emergPhone} s={(v) => dirty(setEmergPhone)(v.replace(/\D/g,"").slice(0,10))} />
                </div>
              </div>

              {/* Identity Documents */}
              <div className="sc grn">
                <div className="sh"><div className="si grn">📄</div><span className="st">Identity Documents</span></div>
                <div className="fr">
                  {/* Aadhaar */}
                  <div className="fi">
                    <span className="fl">Aadhaar Number <span style={{color:"#ef4444"}}>*</span></span>
                    <input
                      className={`in${errors.aadhar?" err":""}`}
                      value={aadhaarDisplay}
                      placeholder="Enter 12-digit Aadhaar"
                      onFocus={() => setAadhaarEditing(true)}
                      onBlur={() => setAadhaarEditing(false)}
                      onChange={(e) => { const raw = e.target.value.replace(/[^0-9]/g, ""); if (raw.length <= 12) dirty(setAadhar)(raw); }}
                    />
                    {aadhar && aadhar.length !== 12 && aadhar.length !== 4 && <span className="fe">Must be exactly 12 digits ({aadhar.length}/12)</span>}

                    {/* Name as per Aadhaar */}
                    <div style={{marginTop:"0.75rem"}}>
                      <span className="fl" style={{display:"block",marginBottom:"0.28rem"}}>Name as per Aadhaar <span style={{color:"#ef4444"}}>*</span></span>
                      <input className={`in${errors.nameAsPerAadhaar?" err":""}`} value={nameAsPerAadhaar} placeholder="Exactly as printed on Aadhaar card" onChange={e=>{dirty(setNameAsPerAadhaar)(e.target.value);fixErr("nameAsPerAadhaar");}}/>
                      {errors.nameAsPerAadhaar && <span className="err-msg">Required</span>}
                    </div>
                    <div style={{marginTop:"0.75rem"}}>
                      <FileUpload label="Upload Aadhaar Card *" category="personal" subKey="aadhaar" employeeId={employeeIdRef.current || employeeId} disabled={!draftReady} apiFetch={apiFetch} value={aadhaarKey} onChange={(k) => { const key=typeof k==="string"?k:(k?.key||k?.s3_key||""); setAadhaarKey(key); isDirtyRef.current = true; }} />
                    </div>
                  </div>
                  {/* PAN */}
                  <div className="fi">
                    <F l="PAN Number" v={pan} s={(v) => { let val = v.toUpperCase(); if (val.length<=5) val=val.replace(/[^A-Z]/g,""); else if (val.length<=9) val=val.slice(0,5)+val.slice(5).replace(/[^0-9]/g,""); else if (val.length<=10) val=val.slice(0,5)+val.slice(5,9)+val.slice(9).replace(/[^A-Z]/g,""); dirty(setPan)(val); }} />
                    {pan && pan.length !== 10 && <span className="fe">Format: AAAAA9999A</span>}
                    {/* Name as per PAN */}
                    <div style={{marginTop:"0.75rem"}}>
                      <span className="fl" style={{display:"block",marginBottom:"0.28rem"}}>Name as per PAN <span style={{color:"#ef4444"}}>*</span></span>
                      <input className={`in${errors.nameAsPerPan?" err":""}`} value={nameAsPerPan} placeholder="Exactly as printed on PAN card" onChange={e=>{dirty(setNameAsPerPan)(e.target.value);fixErr("nameAsPerPan");}}/>
                      {errors.nameAsPerPan && <span className="err-msg">Required</span>}
                    </div>
                    <div style={{marginTop:"0.75rem"}}>
                      <FileUpload label="Upload PAN Card *" category="personal" subKey="pan" employeeId={employeeIdRef.current || employeeId} disabled={!draftReady} apiFetch={apiFetch} value={panKey} onChange={(k) => { const key=typeof k==="string"?k:(k?.key||k?.s3_key||""); setPanKey(key); isDirtyRef.current = true; }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Bank Details ─────────────────────────────────────── */}
              <div className="sc teal">
                <div className="sh">
                  <div className="si teal">🏦</div>
                  <span className="st">Bank Account Details</span>
                </div>
                <div style={{background:"#f0fdfa",border:"1px solid #99f6e4",borderRadius:8,padding:"0.5rem 0.75rem",marginBottom:"0.85rem",fontSize:"0.72rem",color:"#0d9488",fontWeight:500,lineHeight:1.5}}>
                  🏦 Please verify your bank details carefully — this will be used for salary processing.
                </div>
                <div className="fr">
                  {/* Bank name with dropdown */}
                  <div className="fi">
                    <span className="fl">Bank Name <span style={{color:"#ef4444"}}>*</span></span>
                    <select className={`in${errors.bankName?" err":""}`} value={bankName} onChange={e=>{dirty(setBankName)(e.target.value);if(e.target.value!=="Other")setBankOther("");fixErr("bankName");}} style={{background:bankName?"#fff":"#f2f1f9",color:bankName?"#1a1730":"#8b88b0",appearance:"auto"}}>
                      <option value="">Select your bank</option>
                      {BANK_LIST.map(b=><option key={b} value={b}>{b}</option>)}
                    </select>
                    {bankName==="Other"&&(
                      <>
                        <input className={`in${errors.bankOther?" err":""}`} style={{marginTop:"0.4rem"}} value={bankOther} placeholder="Enter your bank name" onChange={e=>{dirty(setBankOther)(e.target.value);fixErr("bankOther");}}/>
                        {errors.bankOther && <span className="err-msg">Please enter your bank name</span>}
                      </>
                    )}
                    {errors.bankName && <span className="err-msg">Required</span>}
                  </div>
                  <div className="fi">
                    <span className="fl">Name as per Bank Account <span style={{color:"#ef4444"}}>*</span></span>
                    <input className={`in${errors.bankAccountName?" err":""}`} value={bankAccountName} placeholder="Full name as per bank records" onChange={e=>{dirty(setBankAccountName)(e.target.value);fixErr("bankAccountName");}}/>
                    {errors.bankAccountName && <span className="err-msg">Required</span>}
                  </div>
                </div>
                <div className="fr">
                  <div className="fi">
                    <span className="fl">IFSC Code <span style={{color:"#ef4444"}}>*</span></span>
                    <input className={`in${errors.ifsc?" err":""}`} value={ifsc} placeholder="e.g. SBIN0001234" maxLength={11} onChange={e=>{dirty(setIfsc)(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,""));fixErr("ifsc");}}/>
                    {errors.ifsc && <span className="err-msg">Required</span>}
                    {ifsc && ifsc.length !== 11 && <span className="fe">IFSC must be 11 characters</span>}
                  </div>
                  <div className="fi">
                    <span className="fl">Branch Name <span style={{color:"#ef4444"}}>*</span></span>
                    <input className={`in${errors.branch?" err":""}`} value={branch} placeholder="e.g. Hyderabad Main Branch" onChange={e=>{dirty(setBranch)(e.target.value);fixErr("branch");}}/>
                    {errors.branch && <span className="err-msg">Required</span>}
                  </div>
                  <div className="fi">
                    <span className="fl">Account Type <span style={{color:"#ef4444"}}>*</span></span>
                    <select className={`in${errors.accountType?" err":""}`} value={accountType} onChange={e=>{dirty(setAccountType)(e.target.value);fixErr("accountType");}} style={{background:accountType?"#fff":"#f2f1f9",color:accountType?"#1a1730":"#8b88b0",appearance:"auto"}}>
                      <option value="">Select</option>
                      <option value="Savings">Savings</option>
                      <option value="Current">Current</option>
                      <option value="Salary">Salary</option>
                      <option value="NRE">NRE</option>
                      <option value="NRO">NRO</option>
                    </select>
                    {errors.accountType && <span className="err-msg">Required</span>}
                  </div>
                </div>
                <div className="fr">
                  <div className="fi">
                    <span className="fl">
                      Account Number <span style={{color:"#ef4444"}}>*</span>
                    </span>
                    {/* If already saved, show masked + option to update */}
                    {accountLast4 && !accountNo ? (
                      <div>
                        <input className="in" value={accountFull ? "•".repeat(accountFull.length-4)+" "+accountFull.slice(-4) : `•••• ${accountLast4}`} disabled style={{letterSpacing:"0.08em",fontFamily:"monospace"}}/>
                        <button type="button" onClick={()=>{setAccountFull("");setAccountLast4("");isDirtyRef.current=true;}} style={{marginTop:"0.3rem",fontSize:"0.68rem",color:"#4f46e5",background:"none",border:"none",cursor:"pointer",fontWeight:600,padding:0}}>Update account number</button>
                      </div>
                    ) : (
                      <input
                        className={`in${errors.accountNo?" err":""}`}
                        value={accountNo.length > 4 ? "•".repeat(accountNo.length - 4) + accountNo.slice(-4) : accountNo}
                        placeholder="Enter full account number"
                        inputMode="numeric"
                        onChange={e=>{
                          // Strip bullets, merge with existing raw to get actual digits typed
                          const typed = e.target.value.replace(/[^0-9]/g,"");
                          dirty(setAccountNo)(typed);
                          fixErr("accountNo");
                          if(accountNoConfirm) fixErr("accountNoConfirm");
                        }}
                      />
                    )}
                    {errors.accountNo && <span className="err-msg">Account number is required</span>}
                  </div>
                  <div className="fi">
                    <span className="fl">
                      Re-enter Account Number <span style={{color:"#ef4444"}}>*</span>
                    </span>
                    {accountLast4 && !accountNo ? (
                      <input className="in" value={accountFull ? "•".repeat(accountFull.length-4)+" "+accountFull.slice(-4) : `•••• ${accountLast4}`} disabled style={{letterSpacing:"0.08em",fontFamily:"monospace"}}/>
                    ) : (
                      <input
                        className={`in${errors.accountNoConfirm?" err":""}`}
                        value={accountNoConfirm.length > 4 ? "•".repeat(accountNoConfirm.length - 4) + accountNoConfirm.slice(-4) : accountNoConfirm}
                        placeholder="Re-enter to confirm"
                        inputMode="numeric"
                        onPaste={e=>e.preventDefault()}
                        onChange={e=>{
                          const typed = e.target.value.replace(/[^0-9]/g,"");
                          setAccountNoConfirm(typed);
                          isDirtyRef.current=true;
                          fixErr("accountNoConfirm");
                        }}
                      />
                    )}
                    {errors.accountNoConfirm && <span className="err-msg">Account numbers do not match</span>}
                    {accountNoConfirm && accountNo && accountNo !== accountNoConfirm && !errors.accountNoConfirm && (
                      <span className="fe">Numbers don't match yet</span>
                    )}
                    {accountNoConfirm && accountNo && accountNo === accountNoConfirm && (
                      <span style={{fontSize:"0.68rem",color:"#16a34a",marginTop:3,display:"block",fontWeight:600}}>✓ Account numbers match</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Current Address */}
              <div className="sc ind">
                <div className="sh"><div className="si ind">🏠</div><span className="st">Current Address</span></div>
                <div className="fr">
                  <DateField l="Residing From" v={curFrom} s={dirty(setCurFrom)} r={false} />
                  <div className="fi" />
                </div>
                <div className="fr"><F l="Door No. & Street" v={curDoor} s={dirty(setCurDoor)} /></div>
                <div className="fr">
                  <F l="Village / Area"          v={curVillage}  s={dirty(setCurVillage)}  r={false} />
                  <F l="Tehsil / Taluk / Mandal" v={curLocality} s={dirty(setCurLocality)} r={false} />
                </div>
                <div className="fr">
                  <F l="District" v={curDistrict} s={dirty(setCurDistrict)} />
                  <F l="State"    v={curState}    s={dirty(setCurState)} />
                  <F l="Pincode"  v={curPin}      s={(v) => dirty(setCurPin)(v.replace(/\D/g,"").slice(0,6))} />
                </div>
              </div>

              {/* Permanent Address */}
              <div className="sc cyn">
                <div className="sh"><div className="si cyn">📍</div><span className="st">Permanent / Native Address</span></div>
                <div style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"1rem",padding:"0.65rem 0.875rem",background:"#f0f9ff",border:`1.5px solid ${sameAsCurrent?"#0891b2":"#bae6fd"}`,borderRadius:9,cursor:"pointer",transition:"all 0.15s"}}
                  onClick={() => { const v = !sameAsCurrent; setSameAsCurrent(v); isDirtyRef.current = true; }}>
                  <div style={{width:18,height:18,borderRadius:5,border:`2px solid ${sameAsCurrent?"#0891b2":"#b8b4d4"}`,background:sameAsCurrent?"#0891b2":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>
                    {sameAsCurrent && <span style={{color:"#fff",fontWeight:800,fontSize:"0.7rem"}}>✓</span>}
                  </div>
                  <span style={{fontSize:"0.84rem",fontWeight:600,color:"#0c4a6e"}}>Same as current address</span>
                </div>
                {!sameAsCurrent && (<>
                  <div className="fr">
                    <DateField l="Residing From" v={permFrom} s={dirty(setPermFrom)} r={false} />
                    <div className="fi" />
                  </div>
                  <div className="fr"><F l="Door No. & Street" v={permDoor} s={dirty(setPermDoor)} r={false} /></div>
                  <div className="fr">
                    <F l="Village / Area"          v={permVillage}  s={dirty(setPermVillage)} r={false} />
                    <F l="Tehsil / Taluk / Mandal" v={permLocality} s={dirty(setPermLocality)} r={false} />
                  </div>
                  <div className="fr">
                    <F l="District" v={permDistrict} s={dirty(setPermDistrict)} r={false} />
                    <F l="State"    v={permState}    s={dirty(setPermState)}    r={false} />
                    <F l="Pincode"  v={permPin}      s={(v) => dirty(setPermPin)(v.replace(/\D/g,"").slice(0,6))} r={false} />
                  </div>
                </>)}
                {sameAsCurrent && (
                  <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:9,padding:"0.75rem 1rem",fontSize:"0.8rem",color:"#15803d",fontWeight:500}}>
                    ✓ Same as current address — {[curDoor,curVillage,curDistrict,curState,curPin].filter(Boolean).join(", ") || "fill your current address above first"}
                  </div>
                )}
              </div>

              <div className="sbar">
                <span className={`ss${saveStatus==="Saved ✓"?" ok":saveStatus.startsWith("Error")?" err":""}`}>{saveStatus}</span>
                <div style={{display:"flex",gap:"0.65rem",alignItems:"center"}}>
                  <button className="sbtn" onClick={handleMidSave} style={{fontSize:"0.8rem"}}>{midSaveStatus || "Save draft"}</button>
                  <button className="pbtn" onClick={handleSave}>Save & Continue →</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
