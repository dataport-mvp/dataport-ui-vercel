// pages/employee/uan.js  — Page 4 of 4 (FINAL SUBMIT)
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";
import FileUpload from "../../components/FileUpload";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

// ─── Page 4 step accent: GREEN ────────────────────────────────────────
const STEP_COLOR   = "#16a34a";
const STEP_DONE_BG = "#2a2460";
const STEP_DONE_CK = "#a78bfa";
const STEP_CONN    = "#a78bfa";
const STEP_SHADOW  = "rgba(22,163,74,0.35)";

const ACKNOWLEDGEMENTS = [
  { id:"truthful",    text:"I confirm that all information provided is true and accurate to the best of my knowledge." },
  { id:"notTampered", text:"I confirm that no documents or records have been tampered with or falsified." },
  { id:"consent",     text:"I consent to Datagate storing my employment profile and sharing it with employers only upon my explicit approval." },
  { id:"liability",   text:"I understand that providing false information may result in legal liability and disqualification from employment." },
  { id:"updates",     text:"I agree to update my profile if any information changes in the future." },
];
const emptyPfRecord = () => ({ companyName:"", pfMemberId:"", dojEpfo:"", doeEpfo:"", pfTransferred:"" });

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
  .signout-btn:hover { border-color: #ef4444; color: #ef4444; }
  .bell-btn { position: relative; width: 36px; height: 36px; border-radius: 9px;
    border: 1.5px solid #2d2860; background: transparent; cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: 1rem; transition: all 0.2s; }
  .bell-btn:hover { border-color: #a78bfa; background: rgba(167,139,250,0.1); }
  .bell-badge { position: absolute; top: -5px; right: -5px; background: #ef4444; color: #fff;
    border-radius: 999px; font-size: 0.6rem; font-weight: 800; min-width: 16px; height: 16px;
    display: flex; align-items: center; justify-content: center; padding: 0 3px; border: 2px solid #1e1a3e; }
  .sc { background: #ffffff; border-radius: 16px; padding: 1.5rem 1.6rem; margin-bottom: 1.1rem;
    box-shadow: 0 6px 28px rgba(30,26,62,0.22), 0 2px 8px rgba(30,26,62,0.12); border: 1px solid rgba(255,255,255,0.85); position: relative; overflow: hidden; }
  .sc::before { content:''; position:absolute; top:0; left:0; bottom:0; width:4px; border-radius:16px 0 0 16px; }
  .sc.ind::before{background:#4f46e5;} .sc.grn::before{background:#16a34a;} .sc.amb::before{background:#d97706;}
  .sh { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.15rem; }
  .si { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.95rem; flex-shrink: 0; }
  .si.ind{background:#eef2ff;} .si.grn{background:#f0fdf4;} .si.amb{background:#fffbeb;}
  .st { font-size: 0.93rem; font-weight: 700; color: #1a1730; }
  .fr { display: flex; gap: 0.9rem; flex-wrap: wrap; margin-bottom: 0.85rem; }
  .fr:last-child { margin-bottom: 0; }
  .fi { display: flex; flex-direction: column; gap: 0.28rem; flex: 1; min-width: 138px; }
  .fl { font-size: 0.7rem; font-weight: 700; color: #8b88b0; letter-spacing: 0.55px; text-transform: uppercase; }
  .in { padding: 0.65rem 0.875rem; background: #ececf9; border: 1.5px solid #b8b4d4;
    border-radius: 9px; font-family: inherit; font-size: 0.875rem; color: #1a1730;
    outline: none; width: 100%; transition: all 0.18s; }
  .in:focus { border-color: #4f46e5; background: #fff; box-shadow: 0 0 0 3px rgba(79,70,229,0.13); }
  .in.err { border-color: #ef4444 !important; background: #fff8f8 !important; box-shadow: 0 0 0 3px rgba(239,68,68,0.10) !important; }
  .err-msg { font-size: 0.68rem; color: #ef4444; font-weight: 600; margin-top: 0.2rem; display: block; }
  .pf-box { background: #f5f0e8; border: 1.5px solid #dddaf0; border-radius: 10px; padding: 1rem; margin-bottom: 0.6rem; }
  .ack-item { display: flex; gap: 0.75rem; align-items: flex-start; padding: 0.85rem 1rem;
    border-radius: 10px; cursor: pointer; transition: all 0.15s; margin-bottom: 0.45rem;
    border: 1.5px solid #dddaf0; background: #f5f0e8; }
  .ack-item.checked { border-color: #16a34a; background: #f0fdf4; }
  .ack-check { width: 20px; height: 20px; border-radius: 5px; flex-shrink: 0; margin-top: 1px;
    border: 2px solid #dddaf0; background: #f2f1f9; display: flex; align-items: center;
    justify-content: center; transition: all 0.15s; }
  .ack-check.on { border-color: #16a34a; background: #16a34a; }
  .sbar { display: flex; justify-content: space-between; align-items: center;
    margin-top: 1.5rem; padding: 1rem 1.5rem; background: #1e1a3e;
    border-radius: 14px; box-shadow: 0 4px 20px rgba(15,12,40,0.28); }
  .pbtn { padding: 0.72rem 1.9rem; background: #4f46e5; color: #fff; border: none;
    border-radius: 10px; font-family: inherit; font-size: 0.875rem; font-weight: 700;
    cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(79,70,229,0.4); }
  .pbtn:hover { background: #4338ca; transform: translateY(-1px); }
  .sbtn { padding: 0.72rem 1.5rem; background: transparent; color: #9d9bc4;
    border: 1.5px solid #2d2860; border-radius: 10px; font-family: inherit;
    font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .sbtn:hover { border-color: #a78bfa; color: #a78bfa; }
  .add-btn { padding: 0.5rem 1.1rem; background: #eef2ff; color: #4f46e5; border: 1.5px solid #c7d2fe;
    border-radius: 8px; font-family: inherit; font-size: 0.8rem; font-weight: 700; cursor: pointer; margin-top: 0.5rem; }
  .rm-btn { padding: 0.28rem 0.7rem; background: #fff5f5; color: #ef4444; border: 1.5px solid #fecaca;
    border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; font-family: inherit; }
  @media (max-width:640px){ .fr{flex-direction:column;} .fi{min-width:100%;} .topbar{flex-direction:column;gap:0.6rem;position:relative;} }
`;

function ConsentBell({ apiFetch, router }) {
  const [count,setCount]=useState(0);
  useEffect(()=>{
    const load=async()=>{try{const res=await apiFetch(`${API}/consent/my`);if(res.ok){const data=await res.json();setCount(data.filter(c=>String(c.status||"pending").toLowerCase()==="pending").length);}}catch(_){}};
    load();const id=setInterval(load,15000);return()=>clearInterval(id);
  },[apiFetch]);
  return(<button className="bell-btn" onClick={()=>router.push("/employee/personal?tab=consents")} title="Consent Requests">🔔{count>0&&<span className="bell-badge">{count}</span>}</button>);
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
  const steps=[{n:1,label:"Personal",icon:"👤",path:"/employee/personal"},{n:2,label:"Education",icon:"🎓",path:"/employee/education"},{n:3,label:"Employment",icon:"💼",path:"/employee/previous"},{n:4,label:"Review",icon:"✅",path:"/employee/uan"}];
  return (
    <div style={{background:"#fff",borderRadius:14,padding:"1.1rem 0.5rem",marginBottom:"1.6rem",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 6px 28px rgba(30,26,62,0.22), 0 2px 8px rgba(30,26,62,0.12)"}}>
      {steps.map((s,i)=>(
        <div key={s.n} style={{display:"flex",alignItems:"center"}}>
          <button onClick={()=>onNavigate(s.path)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.3rem",background:"none",border:"none",cursor:"pointer",padding:"0.2rem 0.9rem"}}>
            <div style={{width:40,height:40,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",transition:"all 0.25s",
              background:current===s.n?STEP_COLOR:current>s.n?STEP_DONE_BG:"#f2f1f9",
              border:current===s.n?`2px solid ${STEP_COLOR}`:current>s.n?`2px solid ${STEP_CONN}`:"2px solid #dddaf0",
              boxShadow:current===s.n?`0 4px 12px ${STEP_SHADOW}`:"none"}}>
              {current>s.n?<span style={{color:STEP_DONE_CK,fontWeight:800,fontSize:"0.9rem"}}>✓</span>:<span style={{fontSize:"1rem",filter:current===s.n?"brightness(0) invert(1)":"none"}}>{s.icon}</span>}
            </div>
            <span style={{fontSize:"0.67rem",fontWeight:700,letterSpacing:"0.6px",textTransform:"uppercase",color:current===s.n?STEP_COLOR:current>s.n?STEP_DONE_CK:"#8b88b0"}}>{s.label}</span>
          </button>
          {i<steps.length-1&&<div style={{width:52,height:2,background:current>s.n?STEP_CONN:"#ddd0bc",margin:"0 -0.25rem",marginBottom:"1.4rem",borderRadius:2}}/>}
        </div>
      ))}
    </div>
  );
}

function F({ l, v, s, t="text", mx, r=true, errKey, errors, onFix }) {
  const hasErr=errKey&&errors&&errors[errKey];
  return(<div className="fi"><span className="fl">{l}{r&&<span style={{color:"#ef4444",marginLeft:2}}>*</span>}</span><input className={`in${hasErr?" err":""}`} type={t} value={v||""} maxLength={mx} onChange={e=>{s(e.target.value);if(onFix&&hasErr)onFix(errKey);}}/>{hasErr&&<span className="err-msg">Required</span>}</div>);
}
function Pill({ active, onClick, label, isErr }) {
  return(<button onClick={onClick} style={{padding:"0.32rem 1.1rem",borderRadius:999,border:active?"2px solid #4f46e5":isErr?"1.5px solid #ef4444":"1.5px solid #dddaf0",background:active?"#4f46e5":"#f2f1f9",color:active?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.82rem",fontWeight:700,transition:"all 0.18s"}}>{label}</button>);
}

export default function UANPage() {
  const router = useRouter();
  const { user, apiFetch, logout, ready } = useAuth();
  const [showSignout,setShowSignout]       = useState(false);
  const [serverDraft,setServerDraft]       = useState(null);
  const [epfoKey,setEpfoKey]               = useState("");
  const [uanCardKey,setUanCardKey] = useState("");
  const [errors,setErrors]                 = useState({});
  const isDirtyRef = useRef(false);
  const [form,setForm] = useState({ uanMaster:{uanNumber:"",nameAsPerUan:"",mobileLinked:"",isActive:""}, pfRecords:[emptyPfRecord()] });
  const [hasUan,setHasUan]                 = useState(""); // "Yes" | "No" | "" fresher toggle
  const [uanPreviouslySaved,setUanPreviouslySaved] = useState(false); // true if UAN was saved before — skip toggle
  const [acks,setAcks] = useState({ truthful:false, notTampered:false, consent:false, liability:false, updates:false });
  const [submitError,setSubmitError] = useState("");
  const [loading,setLoading]         = useState(true);
  const [submitted,setSubmitted]     = useState(false);

  useEffect(()=>{if(!ready)return;if(!user){router.replace("/employee/login");return;}},[ready,user,router]);

  useEffect(()=>{
    if(!ready||!user)return;
    const fetchDraft=async()=>{
      try{
        const res=await apiFetch(`${API}/employee/draft`);
        if(res.ok){
          const dr=await res.json();setServerDraft(dr);
          if(dr.epfoKey)setEpfoKey(dr.epfoKey);
          if(dr.hasUan)setHasUan(dr.hasUan);
          if(dr.uanCardKey)setUanCardKey(dr.uanCardKey);
          // If UAN was previously filled, skip the Yes/No toggle on next load
          if(dr.hasUan==="Yes"&&dr.uanNumber)setUanPreviouslySaved(true);
          if(dr.hasUan==="No")setUanPreviouslySaved(true); // fresher confirmed No before — skip too
          // Never pre-load acks — user must always re-confirm on each submission.
          // Acks are intentional declarations and should not be silently carried over.
          if(dr.uanNumber||dr.nameAsPerUan||dr.mobileLinked||dr.isActive||dr.pfRecords){
            setForm({
              uanMaster:{uanNumber:dr.uanNumber||"",nameAsPerUan:dr.nameAsPerUan||"",mobileLinked:dr.mobileLinked||"",isActive:dr.isActive||""},
              pfRecords:dr.pfRecords&&dr.pfRecords.length>0?dr.pfRecords.map(r=>({companyName:r.companyName||"",pfMemberId:r.pfMemberId||"",dojEpfo:r.dojEpfo||"",doeEpfo:r.doeEpfo||"",pfTransferred:r.pfTransferred||""})):[emptyPfRecord()],
            });
          }
        }
      }catch(_){}
      setLoading(false);
    };
    fetchDraft();
  },[ready,user,apiFetch]);

  const updateUan=(field,value)=>{setForm(p=>({...p,uanMaster:{...p.uanMaster,[field]:value}}));markDirty();};
  const updatePf=(i,field,value)=>{setForm(p=>({...p,pfRecords:p.pfRecords.map((r,idx)=>idx===i?{...r,[field]:value}:r)}));markDirty();};
  const addPfRecord=()=>{setForm(p=>({...p,pfRecords:[...p.pfRecords,emptyPfRecord()]}));markDirty();};
  const removePfRecord=(i)=>{if(i===0)return;setForm(p=>({...p,pfRecords:p.pfRecords.filter((_,idx)=>idx!==i)}));markDirty();};
  // When user edits any field after a submitted profile, clear acks so they must re-confirm
  const markDirty=()=>{
    if(isDirtyRef.current===false&&serverDraft?.status==="submitted"){
      setAcks({truthful:false,notTampered:false,consent:false,liability:false,updates:false});
    }
    isDirtyRef.current=true;
  };
  const toggleAck=(id)=>setAcks(p=>({...p,[id]:!p[id]}));
  const allAcksChecked=Object.values(acks).every(Boolean);
  const fixErr=(key)=>setErrors(p=>({...p,[key]:false}));

  const validate=()=>{
    if(!hasUan) return {hasUan:true};
    const e={};
    if(hasUan==="Yes"){if(!form.uanMaster.uanNumber) e.uanNumber=true;
    if(!form.uanMaster.nameAsPerUan) e.nameAsPerUan=true;
    if(!form.uanMaster.mobileLinked) e.mobileLinked=true;
    if(!form.uanMaster.isActive) e.isActive=true;
    if(!epfoKey) e.epfoKey=true;
    if(!uanCardKey) e.uanCardKey=true;}
    if(hasUan==="Yes") form.pfRecords.forEach((r,i)=>{
      if(!r.companyName) e[`pf_${i}_company`]=true;
      if(!r.pfMemberId) e[`pf_${i}_memberId`]=true;
    });
    return e;
  };

  const handleSignout=async()=>{
    if(serverDraft&&serverDraft.employee_id){
      try{await apiFetch(`${API}/employee`,{method:"POST",body:JSON.stringify({...serverDraft,hasUan,uanNumber:form.uanMaster.uanNumber,nameAsPerUan:form.uanMaster.nameAsPerUan,mobileLinked:form.uanMaster.mobileLinked,isActive:form.uanMaster.isActive,pfRecords:form.pfRecords,epfoKey,uanCardKey})});}catch(_){}
    }
    logout();
  };

  const handleSubmit=async()=>{
    const errs=validate();
    if(Object.keys(errs).length>0){
      setErrors(errs);setSubmitError("Please fill all required fields before submitting.");
      setTimeout(()=>{const el=document.querySelector(".in.err");if(el)el.scrollIntoView({behavior:"smooth",block:"center"});},60);
      return;
    }
    if(!allAcksChecked){setSubmitError("Please confirm all acknowledgements before submitting.");return;}
    if(!serverDraft||!serverDraft.employee_id){setSubmitError("Profile not found — please complete Page 1 first.");return;}
    setSubmitError("");setErrors({});setLoading(true);
    try{
      const dr=serverDraft;
      const empRes=await apiFetch(`${API}/employee`,{method:"POST",body:JSON.stringify({
        employee_id:dr.employee_id,status:"submitted",
        firstName:dr.firstName||"",lastName:dr.lastName||"",middleName:dr.middleName,
        fatherName:dr.fatherName,fatherFirst:dr.fatherFirst,fatherMiddle:dr.fatherMiddle,fatherLast:dr.fatherLast,
        dob:dr.dob,gender:dr.gender,nationality:dr.nationality,
        mobile:dr.mobile||user?.phone||"",email:dr.email||user?.email||"",
        passport:dr.passport,aadhaar:dr.aadhaar,pan:dr.pan,aadhaarKey:dr.aadhaarKey,panKey:dr.panKey,
        currentAddress:dr.currentAddress,permanentAddress:dr.permanentAddress,education:dr.education,
        uanNumber:form.uanMaster.uanNumber||"",nameAsPerUan:form.uanMaster.nameAsPerUan||"",
        mobileLinked:form.uanMaster.mobileLinked||"",isActive:form.uanMaster.isActive||"",
        pfRecords:form.pfRecords,epfoKey,uanCardKey,acknowledgements_profile:acks,submitted_at:Date.now(),
      })});
      if(!empRes.ok) throw new Error(parseError(await empRes.json().catch(()=>({}))));
      setSubmitted(true);
    }catch(err){setSubmitError(err.message||"Submission failed. Please try again.");}
    finally{setLoading(false);}
  };

  if(!ready||!user)return null;

  if(submitted){
    return(
      <>
        <style>{G}</style>
        <div className="pg" style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}>
          <div style={{background:"#fff",borderRadius:20,padding:"3rem 2rem",maxWidth:520,width:"90%",textAlign:"center",boxShadow:"0 8px 40px rgba(30,26,62,0.15)"}}>
            <div style={{width:72,height:72,background:"#f0fdf4",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 1.25rem"}}>✅</div>
            <h2 style={{fontWeight:800,color:"#16a34a",fontSize:"1.35rem",marginBottom:"0.5rem"}}>Profile Submitted!</h2>
            <p style={{color:"#6b6894",lineHeight:1.65,marginBottom:"1rem",fontSize:"0.9rem"}}>Your employment profile is now securely stored with <strong style={{color:"#4f46e5"}}>Datagate</strong>.</p>
            <div style={{padding:"1rem",background:"#eef2ff",border:"1px solid #c7d2fe",borderRadius:10,marginBottom:"2rem"}}>
              <p style={{color:"#4338ca",fontSize:"0.84rem",lineHeight:1.6}}>🔒 Your data is <strong>private by default</strong>. We will only share your information with an employer when you explicitly approve their consent request.</p>
            </div>
            <button style={{padding:"0.8rem 2.25rem",background:"#4f46e5",color:"#fff",border:"none",borderRadius:10,fontSize:"0.9rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 14px rgba(79,70,229,0.4)"}} onClick={()=>router.push("/employee/personal")}>
              Go to My Profile & Consents →
            </button>
          </div>
        </div>
      </>
    );
  }

  if(loading)return(<div style={{minHeight:"100vh",background:"#cdd2ed",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"#8b88b0",fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:500}}>Loading UAN details…</p></div>);

  return(
    <>
      <style>{G}</style>
      <div className="pg">
        {showSignout&&<SignoutModal onConfirm={handleSignout} onCancel={()=>setShowSignout(false)}/>}
        <div className="topbar">
          <span className="logo-text">Datagate</span>
          <div className="topbar-right">
            <span className="user-name">👤 {user.name||user.email}</span>
            <ConsentBell apiFetch={apiFetch} router={router}/>
            <button className="signout-btn" onClick={()=>setShowSignout(true)}>Sign out</button>
          </div>
        </div>

        <div className="wrap">
          <StepNav current={4} onNavigate={(path)=>router.push(path)}/>

          {/* ── Do you have a UAN? — hidden if previously answered ─────────────────────── */}
          {!uanPreviouslySaved && (
          <div className="sc ind" style={{marginBottom:"1.2rem"}}>
            <div className="sh"><div className="si ind">🏦</div><span className="st">UAN / PF Details</span></div>
            <p style={{fontSize:"0.82rem",color:"#6b6894",marginBottom:"1rem"}}>
              If you are a <strong>fresher</strong> or have never worked before, select <strong>No</strong>. You can skip UAN details and directly proceed to acknowledgements.
            </p>
            <div style={{display:"flex",alignItems:"center",gap:"0.75rem",flexWrap:"wrap"}}>
              <span style={{fontSize:"0.8rem",fontWeight:700,color:"#1a1730",textTransform:"uppercase",letterSpacing:"0.5px"}}>Do you have a UAN?</span>
              {errors.hasUan&&<span style={{fontSize:"0.7rem",color:"#ef4444",fontWeight:600}}>Please select an option</span>}
              {["Yes","No"].map(opt=>(
                <button key={opt} onClick={()=>{setHasUan(opt);setErrors({});markDirty();setUanPreviouslySaved(true);}}
                  style={{padding:"0.45rem 1.4rem",borderRadius:999,fontWeight:700,fontSize:"0.82rem",cursor:"pointer",transition:"all 0.18s",
                    background:hasUan===opt?"#4f46e5":"transparent",
                    color:hasUan===opt?"#fff":"#4f46e5",
                    border:`2px solid ${errors.hasUan?"#ef4444":"#4f46e5"}`,
                    boxShadow:hasUan===opt?"0 2px 10px rgba(79,70,229,0.35)":"none"}}}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
          )}
          {/* ── UAN fields — only if hasUan===Yes ──────── */}
          {hasUan==="Yes" && <div className="sc ind">
            <div className="sh"><div className="si ind">🏦</div><span className="st">UAN Details</span></div>
            <div className="fr">
              <F l="UAN Number" v={form.uanMaster.uanNumber} s={v=>updateUan("uanNumber",v.replace(/\D/g,""))} mx={12} errKey="uanNumber" errors={errors} onFix={fixErr}/>
              <F l="Name as per UAN" v={form.uanMaster.nameAsPerUan} s={v=>updateUan("nameAsPerUan",v)} errKey="nameAsPerUan" errors={errors} onFix={fixErr}/>
            </div>
            <div className="fr">
              <F l="Mobile Linked with UAN" v={form.uanMaster.mobileLinked} s={v=>updateUan("mobileLinked",v.replace(/\D/g,""))} mx={10} errKey="mobileLinked" errors={errors} onFix={fixErr}/>
              <div className="fi">
                <span className="fl">Is UAN Active? <span style={{color:"#ef4444"}}>*</span></span>
                <div style={{display:"flex",gap:"0.6rem",marginTop:"0.3rem"}}>
                  {["Yes","No"].map(v=><Pill key={v} label={v} active={form.uanMaster.isActive===v} isErr={!!errors.isActive} onClick={()=>{updateUan("isActive",v);fixErr("isActive");}}/>)}
                </div>
                {errors.isActive&&<span className="err-msg">Required</span>}
              </div>
            </div>

            {/* EPFO Service History */}
            <div style={{marginTop:"0.85rem"}}>
              <span className="fl" style={{display:"block",marginBottom:"0.28rem"}}>EPFO Service History Record <span style={{color:"#ef4444"}}>*</span></span>
              {errors.epfoKey&&<span className="err-msg" style={{marginBottom:"0.3rem"}}>Upload is required</span>}
              <FileUpload label="EPFO Service History" category="uan" subKey="epfo" apiFetch={apiFetch} value={epfoKey} onChange={v=>{setEpfoKey(v);markDirty();fixErr("epfoKey");}}/>
              <p style={{fontSize:"0.7rem",color:"#8b88b0",marginTop:4}}>Download from EPFO portal → Upload here</p>
            </div>

            {/* UAN Card */}
            <div style={{marginTop:"0.85rem"}}>
              <span className="fl" style={{display:"block",marginBottom:"0.28rem"}}>UAN Card <span style={{color:"#ef4444"}}>*</span></span>
              {errors.uanCardKey&&<span className="err-msg" style={{marginBottom:"0.3rem"}}>Upload is required</span>}
              <FileUpload label="UAN Card" category="uan" subKey="uanCard" apiFetch={apiFetch} value={uanCardKey} onChange={v=>{setUanCardKey(v);markDirty();fixErr("uanCardKey");}}/>
              <p style={{fontSize:"0.7rem",color:"#8b88b0",marginTop:4}}>Download from UAN portal → Download UAN Card → Upload here</p>
            </div>
          </div>} {/* end hasUan===Yes UAN Details card */}

          {/* ── PF Details — only if hasUan===Yes ──────── */}
          {hasUan==="Yes" && <div className="sc grn">
            <div className="sh"><div className="si grn">📊</div><span className="st">PF Details (Per Previous Employer)</span></div>
            {form.pfRecords.map((record,i)=>(
              <div key={i} className="pf-box">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.6rem"}}>
                  <span style={{fontSize:"0.78rem",color:"#8b88b0",fontWeight:700}}>Company {i+1}</span>
                  {i>0&&<button className="rm-btn" onClick={()=>removePfRecord(i)}>− Remove</button>}
                </div>
                <div className="fr">
                  <F l="Company Name" v={record.companyName} s={v=>updatePf(i,"companyName",v)} errKey={`pf_${i}_company`} errors={errors} onFix={fixErr}/>
                  <F l="PF Member ID" v={record.pfMemberId} s={v=>updatePf(i,"pfMemberId",v)} errKey={`pf_${i}_memberId`} errors={errors} onFix={fixErr}/>
                </div>
                <div className="fr">
                  <F l="Date of Joining (EPFO)" v={record.dojEpfo} s={v=>updatePf(i,"dojEpfo",v)} t="date" r={false}/>
                  <F l="Date of Exit (EPFO)" v={record.doeEpfo} s={v=>updatePf(i,"doeEpfo",v)} t="date" r={false}/>
                </div>
                <div>
                  <span className="fl">Was PF Transferred? <span style={{color:"#ef4444"}}>*</span></span>
                  <div style={{display:"flex",gap:"0.6rem",marginTop:"0.3rem"}}>
                    {["Yes","No"].map(v=><Pill key={v} label={v} active={record.pfTransferred===v} onClick={()=>updatePf(i,"pfTransferred",v)}/>)}
                  </div>
                </div>
              </div>
            ))}
            <button className="add-btn" onClick={addPfRecord}>+ Add Another Company</button>
          </div>} {/* end hasUan===Yes PF Details card */}

          {/* Declaration — always visible */}
          <div className="sc amb">
            <div className="sh"><div className="si amb">✍️</div><span className="st">Declaration & Acknowledgement</span></div>
            <p style={{fontSize:"0.84rem",color:"#6b6894",marginBottom:"1rem",lineHeight:1.5}}>Please read and confirm each statement before submitting.</p>
            {ACKNOWLEDGEMENTS.map(({id,text})=>(
              <div key={id} className={`ack-item${acks[id]?" checked":""}`} onClick={()=>toggleAck(id)}>
                <div className={`ack-check${acks[id]?" on":""}`}>
                  {acks[id]&&<span style={{color:"#fff",fontSize:"0.75rem",fontWeight:800}}>✓</span>}
                </div>
                <span style={{fontSize:"0.875rem",color:acks[id]?"#15803d":"#1a1730",lineHeight:1.55,fontWeight:acks[id]?600:400}}>{text}</span>
              </div>
            ))}
            {!allAcksChecked&&<p style={{fontSize:"0.78rem",color:"#d97706",marginTop:"0.75rem",fontWeight:600}}>⚠️ Please confirm all {ACKNOWLEDGEMENTS.length} statements to enable submission.</p>}
          </div>

          {submitError&&(
            <div style={{color:"#ef4444",background:"#fff5f5",border:"1.5px solid #fecaca",borderRadius:10,padding:"0.75rem 1rem",marginBottom:"1rem",fontSize:"0.875rem",fontWeight:500}}>⚠️ {submitError}</div>
          )}

          <div className="sbar">
            <button className="sbtn" onClick={()=>router.push("/employee/previous")}>← Previous</button>
            <button className="pbtn" style={{opacity:loading?0.5:1,cursor:loading?"not-allowed":"pointer"}} onClick={handleSubmit} disabled={loading}>
              {loading?"Submitting…":"Submit Profile 🚀"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
