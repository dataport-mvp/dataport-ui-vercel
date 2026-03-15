// pages/employee/previous.js  — Page 3 of 5
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";
import FileUpload from "../../components/FileUpload";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const ACCENTS    = { 1:"#4f46e5", 2:"#d97706", 3:"#7c3aed", 4:"#0891b2", 5:"#16a34a" };
const STEP_DONE_BG = "#2a2460"; const STEP_DONE_CK = "#a78bfa"; const STEP_CONN = "#a78bfa";

const genId = () => typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)+Date.now().toString(36);
const emptyEmployment = () => ({
  companyName:"", officeAddress:"", employeeId:"", workEmail:"",
  designation:"", department:"", duties:"", employmentType:"", reasonForRelieving:"",
  reference:{ role:"", name:"", email:"", mobile:"" },
  contractVendor:{ company:"", email:"", mobile:"" },
  documents:{ payslipsKey:"", offerLetterKey:"", resignationKey:"", experienceKey:"", idCardKey:"" },
  gap:{ hasGap:"", reason:"" }, company_id: genId(),
});
const emptyAck = () => ({ val:"", note:"" });

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
  .emp-card { background: #ffffff; border-radius: 16px; padding: 1.5rem 1.6rem; margin-bottom: 1.1rem;
    box-shadow: 0 6px 28px rgba(30,26,62,0.22), 0 2px 8px rgba(30,26,62,0.12);
    border: 1px solid rgba(255,255,255,0.85); position: relative; overflow: hidden; }
  .emp-card::before { content:''; position:absolute; top:0; left:0; bottom:0; width:4px; border-radius:16px 0 0 16px; background:#4f46e5; }
  .emp-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.1rem; flex-wrap: wrap; gap: 0.5rem; }
  .emp-title { font-size: 0.93rem; font-weight: 700; color: #1a1730; }
  .emp-hdr-right { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }
  .gap-pill { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.26rem 0.8rem;
    border-radius: 999px; font-size: 0.72rem; font-weight: 700; cursor: pointer;
    font-family: inherit; transition: all 0.18s;
    border: 1.5px solid #e2e8f0; background: #f8fafc; color: #64748b; }
  .gap-pill:hover { border-color: #f59e0b; background: #fffbeb; color: #92400e; }
  .gap-pill.on { border-color: #f59e0b; background: #fffbeb; color: #92400e; }
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
  .decl-q { font-size: 0.875rem; color: #1a1730; margin-bottom: 0.5rem; font-weight: 500; line-height: 1.5; }
  .decl-item { padding: 0.9rem 1rem; background: #f0effe; border-radius: 10px; border: 1px solid #dddaf0; margin-bottom: 0.75rem; }
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
  .ta { padding: 0.65rem 0.875rem; background: #ececf9; border: 1.5px solid #b8b4d4;
    border-radius: 9px; font-family: inherit; font-size: 0.875rem; color: #1a1730;
    outline: none; width: 100%; min-height: 72px; resize: vertical; transition: all 0.18s; }
  .ta:focus { border-color: #4f46e5; background: #fff; box-shadow: 0 0 0 3px rgba(79,70,229,0.13); }
  .ta.err { border-color: #ef4444 !important; background: #fff8f8 !important; }
  .add-btn { padding: 0.6rem 1.4rem; background: #eef2ff; color: #4f46e5; border: 1.5px solid #c7d2fe;
    border-radius: 10px; font-family: inherit; font-size: 0.875rem; font-weight: 700; cursor: pointer; margin-bottom: 1.1rem; }
  .rm-btn { padding: 0.3rem 0.75rem; background: #fff5f5; color: #ef4444; border: 1.5px solid #fecaca;
    border-radius: 7px; font-size: 0.75rem; font-weight: 600; cursor: pointer; font-family: inherit; }
  .att-lbl { font-size: 0.7rem; font-weight: 700; color: #8b88b0; letter-spacing: 0.55px; text-transform: uppercase; display: block; margin-bottom: 0.28rem; }
  .att-wrap { margin-bottom: 0.65rem; }
  .sbar { display: flex; justify-content: space-between; align-items: center;
    margin-top: 1.5rem; padding: 1rem 1.5rem; background: #1e1a3e;
    border-radius: 14px; box-shadow: 0 4px 20px rgba(15,12,40,0.28); }
  .ss { font-size: 0.84rem; color: #9d9bc4; font-weight: 500; }
  .ss.ok{color:#4ade80;} .ss.err{color:#f87171;}
  .pbtn { padding: 0.72rem 1.9rem; background: #4f46e5; color: #fff; border: none;
    border-radius: 10px; font-family: inherit; font-size: 0.875rem; font-weight: 700;
    cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(79,70,229,0.4); }
  .pbtn:hover { background: #4338ca; transform: translateY(-1px); }
  .sbtn { padding: 0.72rem 1.5rem; background: transparent; color: #9d9bc4;
    border: 1.5px solid #2d2860; border-radius: 10px; font-family: inherit;
    font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .sbtn:hover { border-color: #a78bfa; color: #a78bfa; }
  @media (max-width:640px){ .fr{flex-direction:column;} .fi{min-width:100%;} .topbar{flex-direction:column;gap:0.6rem;position:relative;} }
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
          <button onClick={onSaveAndExit} style={{flex:1,padding:"0.65rem",borderRadius:9,border:"none",background:"#4f46e5",color:"#fff",cursor:"pointer",fontWeight:700,fontFamily:"inherit",minWidth:80}}>Save & Exit</button>
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
function YN({ val, onY, onN }) {
  return (
    <div style={{display:"flex",gap:"0.65rem",marginTop:"0.45rem"}}>
      {["Yes","No"].map(v=>(
        <button key={v} onClick={v==="Yes"?onY:onN} style={{padding:"0.3rem 1.1rem",borderRadius:999,border:(val===v)?"2px solid #4f46e5":"1.5px solid #dddaf0",background:(val===v)?"#4f46e5":"#f2f1f9",color:(val===v)?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.82rem",fontWeight:700,transition:"all 0.18s"}}>{v}</button>
      ))}
    </div>
  );
}

export default function PreviousCompany() {
  const router = useRouter();
  const { user, apiFetch, logout, ready } = useAuth();
  const [showSignout,setShowSignout]   = useState(false);
  const [showExitAck,setShowExitAck]   = useState(false);
  const [exitTarget,setExitTarget]     = useState(null);
  const [exitAction,setExitAction]     = useState(null);
  const [saveStatus,setSaveStatus]     = useState("");
  const [midSaveStatus,setMidSaveStatus] = useState("");
  const [loading,setLoading]           = useState(true);
  const [employeeId,setEmployeeId]     = useState("");
  const [resumeKey,setResumeKey]       = useState("");
  const [employments,setEmployments]   = useState([emptyEmployment()]);
  const [ack,setAck]                   = useState({business:emptyAck(),dismissed:emptyAck(),criminal:emptyAck(),civil:emptyAck()});
  const [errors,setErrors]             = useState({});
  const isDirtyRef = useRef(false);

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
        if(draft.resumeKey) setResumeKey(draft.resumeKey);
        const histRes=await apiFetch(`${API}/employee/employment-history/${draft.employee_id}`);
        if(histRes.ok){
          const data=await histRes.json();
          if(data.employments&&data.employments.length>0){
            setEmployments(data.employments.map(e=>({
              companyName:e.companyName||"",officeAddress:e.officeAddress||"",employeeId:e.employeeId||"",workEmail:e.workEmail||"",
              designation:e.designation||"",department:e.department||"",duties:e.duties||"",employmentType:e.employmentType||"",reasonForRelieving:e.reasonForRelieving||"",
              reference:{role:e.reference?.role||"",name:e.reference?.name||"",email:e.reference?.email||"",mobile:e.reference?.mobile||""},
              contractVendor:{company:e.contractVendor?.company||"",email:e.contractVendor?.email||"",mobile:e.contractVendor?.mobile||""},
              documents:{payslipsKey:e.documents?.payslipsKey||"",offerLetterKey:e.documents?.offerLetterKey||"",resignationKey:e.documents?.resignationKey||"",experienceKey:e.documents?.experienceKey||"",idCardKey:e.documents?.idCardKey||""},
              gap:{hasGap:e.gap?.hasGap||"",reason:e.gap?.reason||""},company_id:e.company_id||genId(),
            })));
          }
          if(data.acknowledgements){
            const a=data.acknowledgements;
            setAck({business:{val:a.business?.val||"",note:a.business?.note||""},dismissed:{val:a.dismissed?.val||"",note:a.dismissed?.note||""},criminal:{val:a.criminal?.val||"",note:a.criminal?.note||""},civil:{val:a.civil?.val||"",note:a.civil?.note||""}});
          }
        }
      }catch(_){}
      setLoading(false);
    };
    fetchData();
  },[ready,user,apiFetch]);

  const update=(i,path,value)=>{
    const copy=JSON.parse(JSON.stringify(employments));
    const keys=path.split(".");let obj=copy[i];
    for(let k=0;k<keys.length-1;k++)obj=obj[keys[k]];
    obj[keys[keys.length-1]]=value;
    setEmployments(copy);isDirtyRef.current=true;
  };
  const addEmployer=()=>{setEmployments([...employments,emptyEmployment()]);isDirtyRef.current=true;};
  const removeEmployer=(i)=>{setEmployments(employments.filter((_,idx)=>idx!==i));isDirtyRef.current=true;};
  const fixErr=(key)=>setErrors(p=>({...p,[key]:false}));

  const validate=()=>{
    const e={};
    if(!resumeKey) e.resumeKey=true;
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
      if(!emp.reasonForRelieving) e[`${i}_reasonForRelieving`]=true;
      if(!emp.reference.role) e[`${i}_refRole`]=true;
      if(!emp.reference.name) e[`${i}_refName`]=true;
      if(!emp.reference.email) e[`${i}_refEmail`]=true;
      if(!emp.reference.mobile) e[`${i}_refMobile`]=true;
      if(!emp.documents.payslipsKey) e[`${i}_payslips`]=true;
      if(!emp.documents.offerLetterKey) e[`${i}_offerLetter`]=true;
      if(i===0&&!emp.documents.resignationKey) e[`${i}_resignation`]=true;
      if(!emp.documents.experienceKey) e[`${i}_experience`]=true;
      if(emp.gap.hasGap==="Yes"&&!emp.gap.reason) e[`${i}_gapReason`]=true;
    });
    [["business"],["dismissed"],["criminal"],["civil"]].forEach(([k])=>{
      if(!ack[k].val) e[`ack_${k}`]=true;
    });
    return e;
  };

  const saveHistory=async()=>{
    if(!employeeId) throw new Error("Please complete and save Page 1 first");
    // Save resumeKey to employee record
    if(resumeKey){
      await apiFetch(`${API}/employee`,{method:"POST",body:JSON.stringify({
        employee_id:employeeId,status:"draft",resumeKey,
        firstName:"_",lastName:"_",mobile:"0000000000",email:user?.email||"",
      })});
    }
    const res=await apiFetch(`${API}/employee/employment-history`,{method:"POST",body:JSON.stringify({employments,acknowledgements:ack})});
    if(!res.ok) throw new Error(parseError(await res.json().catch(()=>({}))));
    isDirtyRef.current=false;
  };

  const handleSaveSignout=async()=>{try{await saveHistory();}catch(_){}logout();};
  const handleMidSave=async()=>{
    setMidSaveStatus("Saving\u2026");
    try{await saveHistory();setMidSaveStatus("Saved \u2713");setTimeout(()=>setMidSaveStatus(""),2000);}
    catch(_){setMidSaveStatus("Error");setTimeout(()=>setMidSaveStatus(""),2500);}
  };
  const handleNavigate=async(path)=>{if(isDirtyRef.current){setExitTarget(path);setExitAction("nav");setShowExitAck(true);return;}router.push(path);};
  const handleSignout=()=>{if(isDirtyRef.current){setExitAction("signout");setShowExitAck(true);return;}logout();};
  const onSaveAndExit=async()=>{try{await saveHistory();}catch(_){}setShowExitAck(false);if(exitAction==="signout")logout();else if(exitTarget)router.push(exitTarget);};
  const onExitWithout=()=>{setShowExitAck(false);isDirtyRef.current=false;if(exitAction==="signout")logout();else if(exitTarget)router.push(exitTarget);};

  const handleNext=async()=>{
    const errs=validate();
    if(Object.keys(errs).length>0){
      setErrors(errs);setSaveStatus("Please fill all required fields \u2191");
      setTimeout(()=>{const el=document.querySelector(".in.err,.ta.err");if(el)el.scrollIntoView({behavior:"smooth",block:"center"});},60);
      return;
    }
    setSaveStatus("Saving...");
    try{await saveHistory();setSaveStatus("Saved \u2713");router.push("/employee/uan");}
    catch(err){setSaveStatus(`Error: ${err.message||"Could not save"}`);}
  };

  if(!ready||!user)return null;
  if(loading)return(<div style={{minHeight:"100vh",background:"#cdd2ed",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"#8b88b0",fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:500}}>Loading employment history\u2026</p></div>);

  return (
    <>
      <style>{G}</style>
      <div className="pg">
        {showSignout&&<SignoutModal onConfirm={()=>{isDirtyRef.current=false;logout();}} onCancel={()=>setShowSignout(false)}/>}
        {showExitAck&&<ExitAckModal onSaveAndExit={onSaveAndExit} onExitWithout={onExitWithout} onCancel={()=>setShowExitAck(false)}/>}

        <div className="topbar">
          <span className="logo-text">Datagate</span>
          <div className="topbar-right">
            <span className="user-name">👤 {user.name||user.email}</span>
            <ConsentBell apiFetch={apiFetch} router={router}/>
            <button className="signout-btn" onClick={handleSaveSignout} style={{borderColor:"#ef4444",color:"#ef4444"}}>Save & Sign out</button>
          </div>
        </div>

        <div className="wrap">
          <StepNav current={3} onNavigate={handleNavigate}/>

          {/* ── Resume Upload ─────────────────────────────────────────── */}
          <div className="resume-card">
            <div style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"0.9rem"}}>
              <div style={{width:32,height:32,borderRadius:8,background:"#f0fdf4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.95rem",flexShrink:0}}>📄</div>
              <span style={{fontSize:"0.93rem",fontWeight:700,color:"#1a1730"}}>
                Latest Resume / CV <span style={{color:"#ef4444",fontSize:"0.82rem"}}>*</span>
              </span>
            </div>
            <p style={{fontSize:"0.76rem",color:"#8b88b0",marginBottom:"0.85rem",fontWeight:500}}>Upload your most recent resume. PDF only · max 5MB.</p>
            {errors.resumeKey&&<span className="err-msg" style={{marginBottom:"0.5rem",display:"block"}}>Resume upload is required</span>}
            <FileUpload
              label="Upload Resume / CV *"
              category="employment"
              subKey="resume"
              apiFetch={apiFetch}
              value={resumeKey}
              onChange={(k)=>{setResumeKey(k);isDirtyRef.current=true;fixErr("resumeKey");}}
            />
          </div>

          {/* ── Employer cards ────────────────────────────────────────── */}
          {employments.map((emp,index)=>(
            <div key={index} className="emp-card">

              {/* Header row — title + gap pill + remove */}
              <div className="emp-hdr">
                <span className="emp-title">
                  {index===0?"Current / Most Recent Employer":`Previous Employer ${index}`}
                </span>
                <div className="emp-hdr-right">
                  {/* Gap toggle pill — inline in header */}
                  <button
                    className={`gap-pill${emp.gap.hasGap==="Yes"?" on":""}`}
                    onClick={()=>update(index,"gap.hasGap",emp.gap.hasGap==="Yes"?"":"Yes")}
                  >
                    ⏱ {emp.gap.hasGap==="Yes"?"Gap before joining: Yes":"Gap before joining?"}
                  </button>
                  {index!==0&&<button className="rm-btn" onClick={()=>removeEmployer(index)}>− Remove</button>}
                </div>
              </div>

              {/* Gap reason box — expands below header when Yes */}
              {emp.gap.hasGap==="Yes"&&(
                <div className="gap-reason-box">
                  <span className="fl" style={{display:"block",marginBottom:"0.35rem"}}>
                    Reason for Gap <span style={{color:"#ef4444"}}>*</span>
                  </span>
                  <p style={{fontSize:"0.71rem",color:"#92400e",marginBottom:"0.5rem",fontWeight:500,lineHeight:1.4}}>
                    e.g. Between relieving from previous company and joining this one
                  </p>
                  <textarea
                    className={`ta${errors[`${index}_gapReason`]?" err":""}`}
                    value={emp.gap.reason||""}
                    placeholder="Describe the gap period and reason…"
                    style={{background:"#fffbeb",borderColor:errors[`${index}_gapReason`]?"#ef4444":"#fde68a"}}
                    onChange={e=>{update(index,"gap.reason",e.target.value);fixErr(`${index}_gapReason`);}}
                  />
                  {errors[`${index}_gapReason`]&&<span className="err-msg">Required</span>}
                </div>
              )}

              {/* Fields */}
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
              <div style={{marginTop:"0.75rem"}}>
                <TA l="Reason for Relieving / Leaving" v={emp.reasonForRelieving} s={v=>update(index,"reasonForRelieving",v)} errKey={`${index}_reasonForRelieving`} errors={errors} onFix={fixErr}/>
              </div>

              <div className="subsec">
                <div className="sub-lbl">Reference Details</div>
                <div className="fr">
                  <FS l="Reference Role" v={emp.reference.role} s={v=>update(index,"reference.role",v)} o={["Manager","Colleague","HR","Client"]} errKey={`${index}_refRole`} errors={errors} onFix={fixErr}/>
                  <F l="Reference Name" v={emp.reference.name} s={v=>update(index,"reference.name",v)} errKey={`${index}_refName`} errors={errors} onFix={fixErr}/>
                </div>
                <div className="fr">
                  <F l="Reference Official Email" v={emp.reference.email} s={v=>update(index,"reference.email",v)} errKey={`${index}_refEmail`} errors={errors} onFix={fixErr}/>
                  <F l="Reference Mobile" v={emp.reference.mobile} s={v=>/^\d*$/.test(v)&&update(index,"reference.mobile",v)} mx={10} errKey={`${index}_refMobile`} errors={errors} onFix={fixErr}/>
                </div>
              </div>

              <div className="subsec">
                <div className="sub-lbl">Attachments</div>
                <div className="att-wrap">
                  <span className="att-lbl">Payslips (Last 3 Months) <span style={{color:"#ef4444"}}>*</span></span>
                  {errors[`${index}_payslips`]&&<span className="err-msg" style={{marginBottom:"0.3rem"}}>Upload required</span>}
                  <FileUpload label="Payslips" category="employment" subKey="payslips" companyId={emp.company_id||undefined} apiFetch={apiFetch} value={emp.documents.payslipsKey} onChange={v=>{update(index,"documents.payslipsKey",v);fixErr(`${index}_payslips`);}}/>
                </div>
                <div className="att-wrap">
                  <span className="att-lbl">Offer Letter <span style={{color:"#ef4444"}}>*</span></span>
                  {errors[`${index}_offerLetter`]&&<span className="err-msg" style={{marginBottom:"0.3rem"}}>Upload required</span>}
                  <FileUpload label="Offer Letter" category="employment" subKey="offerLetter" companyId={emp.company_id||undefined} apiFetch={apiFetch} value={emp.documents.offerLetterKey} onChange={v=>{update(index,"documents.offerLetterKey",v);fixErr(`${index}_offerLetter`);}}/>
                </div>
                <div className="att-wrap">
                  <span className="att-lbl">Resignation Acceptance{index===0&&<span style={{color:"#ef4444"}}> *</span>}</span>
                  {errors[`${index}_resignation`]&&<span className="err-msg" style={{marginBottom:"0.3rem"}}>Upload required</span>}
                  <FileUpload label="Resignation" category="employment" subKey="resignation" companyId={emp.company_id||undefined} apiFetch={apiFetch} value={emp.documents.resignationKey} onChange={v=>{update(index,"documents.resignationKey",v);fixErr(`${index}_resignation`);}}/>
                </div>
                <div className="att-wrap">
                  <span className="att-lbl">Experience / Relieving Letter <span style={{color:"#ef4444"}}>*</span></span>
                  {errors[`${index}_experience`]&&<span className="err-msg" style={{marginBottom:"0.3rem"}}>Upload required</span>}
                  <FileUpload label="Experience Letter" category="employment" subKey="experience" companyId={emp.company_id||undefined} apiFetch={apiFetch} value={emp.documents.experienceKey} onChange={v=>{update(index,"documents.experienceKey",v);fixErr(`${index}_experience`);}}/>
                </div>
                <div className="att-wrap">
                  <span className="att-lbl">Company ID Card</span>
                  <FileUpload label="ID Card" category="employment" subKey="idCard" companyId={emp.company_id||undefined} apiFetch={apiFetch} value={emp.documents.idCardKey} onChange={v=>update(index,"documents.idCardKey",v)}/>
                </div>
              </div>

            </div>
          ))}

          <button className="add-btn" onClick={addEmployer}>+ Add Another Employer</button>

          <div className="decl-card">
            <div style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"1.1rem"}}>
              <div style={{width:32,height:32,borderRadius:8,background:"#f5f3ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.95rem"}}>📋</div>
              <span style={{fontSize:"0.93rem",fontWeight:700,color:"#1a1730"}}>Other Declarations</span>
            </div>
            {[["business","Are you currently engaged in any other business or employment?"],["dismissed","Have you ever been dismissed from any employer?"],["criminal","Have you ever been convicted in a court of law?"],["civil","Have you ever had any civil judgment against you?"]].map(([k,q])=>(
              <div key={k} className="decl-item">
                <p className="decl-q">{q}</p>
                <div style={{display:"flex",gap:"0.65rem"}}>
                  {["Yes","No"].map(v=>(
                    <button key={v} onClick={()=>{setAck({...ack,[k]:{...ack[k],val:v}});fixErr(`ack_${k}`);}} style={{padding:"0.3rem 1.1rem",borderRadius:999,border:ack[k].val===v?"2px solid #4f46e5":"1.5px solid #dddaf0",background:ack[k].val===v?"#4f46e5":"#f2f1f9",color:ack[k].val===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.82rem",fontWeight:700,transition:"all 0.18s"}}>{v}</button>
                  ))}
                </div>
                {errors[`ack_${k}`]&&<span className="err-msg" style={{marginTop:"0.4rem"}}>Please answer this question</span>}
                {ack[k].val==="Yes"&&<div style={{marginTop:"0.6rem"}}><TA l="Details" v={ack[k].note} s={v=>setAck({...ack,[k]:{...ack[k],note:v}})} r={false}/></div>}
              </div>
            ))}
          </div>

          <div className="sbar">
            <button className="sbtn" onClick={()=>handleNavigate("/employee/education")}>← Previous</button>
            <span className={`ss${saveStatus==="Saved \u2713"?" ok":saveStatus.startsWith("Error")||saveStatus.includes("required")?" err":""}`}>{saveStatus}</span>
            <div style={{display:"flex",gap:"0.65rem",alignItems:"center"}}>
              <button className="sbtn" onClick={handleMidSave} style={{fontSize:"0.8rem"}}>{midSaveStatus||"Save draft"}</button>
              <button className="pbtn" onClick={handleNext}>Save & Continue →</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
