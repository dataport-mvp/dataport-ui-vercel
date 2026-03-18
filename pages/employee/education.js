// pages/employee/education.js  — Page 2 of 5
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";
import FileUpload from "../../components/FileUpload";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;
const ACCENTS = { 1:"#4f46e5", 2:"#d97706", 3:"#7c3aed", 4:"#0891b2", 5:"#16a34a" };
const STEP_DONE_BG = "#2a2460"; const STEP_DONE_CK = "#a78bfa"; const STEP_CONN = "#a78bfa";

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{background:#cdd2ed;font-family:'Plus Jakarta Sans',sans-serif;}
  .pg{min-height:100vh;background:#cdd2ed;padding-bottom:3rem;}
  .wrap{max-width:860px;margin:auto;padding:0 1.25rem;}
  .topbar{background:#1e1a3e;border-bottom:1px solid #2d2860;padding:0.85rem 1.75rem;display:flex;justify-content:space-between;align-items:center;margin-bottom:1.75rem;position:sticky;top:0;z-index:50;box-shadow:0 4px 20px rgba(15,12,40,0.4);}
  .logo-text{font-size:1.3rem;font-weight:800;color:#a78bfa;letter-spacing:-0.5px;}
  .topbar-right{display:flex;align-items:center;gap:0.75rem;}
  .user-name{font-size:0.84rem;color:#9d9bc4;font-weight:500;}
  .signout-btn{padding:0.38rem 1rem;border:1.5px solid #2d2860;border-radius:8px;background:transparent;color:#9d9bc4;font-size:0.82rem;cursor:pointer;font-weight:600;font-family:inherit;transition:all 0.2s;}
  .signout-btn:hover{border-color:#ef4444;color:#ef4444;}
  .bell-btn{position:relative;width:36px;height:36px;border-radius:9px;border:1.5px solid #2d2860;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1rem;transition:all 0.2s;}
  .bell-btn:hover{border-color:#a78bfa;background:rgba(167,139,250,0.1);}
  .bell-badge{position:absolute;top:-5px;right:-5px;background:#ef4444;color:#fff;border-radius:999px;font-size:0.6rem;font-weight:800;min-width:16px;height:16px;display:flex;align-items:center;justify-content:center;padding:0 3px;border:2px solid #1e1a3e;}
  .sc{background:#fff;border-radius:16px;padding:1.5rem 1.6rem;margin-bottom:1.1rem;box-shadow:0 6px 28px rgba(30,26,62,0.22),0 2px 8px rgba(30,26,62,0.12);border:1px solid rgba(255,255,255,0.85);position:relative;overflow:hidden;}
  .sc::before{content:'';position:absolute;top:0;left:0;bottom:0;width:4px;border-radius:16px 0 0 16px;}
  .sc.ind::before{background:#4f46e5;}.sc.cyn::before{background:#0891b2;}.sc.amb::before{background:#d97706;}.sc.ros::before{background:#e11d48;}.sc.vio::before{background:#7c3aed;}.sc.grn::before{background:#16a34a;}.sc.slt::before{background:#475569;}.sc.ora::before{background:#ea580c;}
  .sh{display:flex;align-items:center;gap:0.6rem;margin-bottom:1.15rem;}
  .si{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:0.95rem;flex-shrink:0;}
  .si.ind{background:#eef2ff;}.si.cyn{background:#ecfeff;}.si.amb{background:#fffbeb;}.si.ros{background:#fff1f2;}.si.vio{background:#f5f3ff;}.si.grn{background:#f0fdf4;}.si.slt{background:#f1f5f9;}.si.ora{background:#fff7ed;}
  .st{font-size:0.93rem;font-weight:700;color:#1a1730;}
  .fr{display:flex;gap:0.9rem;flex-wrap:wrap;margin-bottom:0.85rem;}.fr:last-child{margin-bottom:0;}
  .fi{display:flex;flex-direction:column;gap:0.28rem;flex:1;min-width:138px;}
  .fl{font-size:0.7rem;font-weight:700;color:#8b88b0;letter-spacing:0.55px;text-transform:uppercase;}
  .in{padding:0.65rem 0.875rem;background:#ececf9;border:1.5px solid #b8b4d4;border-radius:9px;font-family:inherit;font-size:0.875rem;color:#1a1730;outline:none;width:100%;transition:all 0.18s;}
  .in:focus{border-color:#4f46e5;background:#fff;box-shadow:0 0 0 3px rgba(79,70,229,0.13);}
  .in.err{border-color:#ef4444!important;background:#fff8f8!important;box-shadow:0 0 0 3px rgba(239,68,68,0.10)!important;}
  .err-msg{font-size:0.68rem;color:#ef4444;font-weight:600;margin-top:0.2rem;display:block;}
  .date-input{padding:0.65rem 0.875rem;background:#ececf9;border:1.5px solid #b8b4d4;border-radius:9px;font-family:inherit;font-size:0.875rem;color:#1a1730;outline:none;width:100%;transition:all 0.18s;}
  .date-input:focus{border-color:#4f46e5;background:#fff;box-shadow:0 0 0 3px rgba(79,70,229,0.13);}
  .date-input::placeholder{color:#b8b4d4;}
  .date-input.err{border-color:#ef4444!important;background:#fff8f8!important;}
  .sbar{display:flex;justify-content:space-between;align-items:center;margin-top:1.5rem;padding:1rem 1.5rem;background:#1e1a3e;border-radius:14px;box-shadow:0 4px 20px rgba(15,12,40,0.28);}
  .ss{font-size:0.84rem;color:#9d9bc4;font-weight:500;}.ss.ok{color:#4ade80;}.ss.err{color:#f87171;}
  .pbtn{padding:0.72rem 1.9rem;background:#4f46e5;color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:0.875rem;font-weight:700;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 14px rgba(79,70,229,0.4);}
  .pbtn:hover{background:#4338ca;transform:translateY(-1px);}
  .sbtn{padding:0.72rem 1.5rem;background:transparent;color:#9d9bc4;border:1.5px solid #2d2860;border-radius:10px;font-family:inherit;font-size:0.875rem;font-weight:600;cursor:pointer;transition:all 0.2s;}
  .sbtn:hover{border-color:#a78bfa;color:#a78bfa;}
  .cert-box{background:#f0effe;border:1.5px solid #dddaf0;border-radius:10px;padding:1rem;margin-bottom:0.6rem;}
  .add-btn{padding:0.42rem 1.1rem;background:#eef2ff;color:#4f46e5;border:1.5px solid #c7d2fe;border-radius:8px;font-family:inherit;font-size:0.8rem;font-weight:700;cursor:pointer;margin-top:0.65rem;}
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
        <button key={v} onClick={()=>onChange(v)} style={{padding:"0.32rem 1.1rem",borderRadius:999,border:value===v?"2px solid #4f46e5":"1.5px solid #dddaf0",background:value===v?"#4f46e5":"#f2f1f9",color:value===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.82rem",fontWeight:700,transition:"all 0.18s"}}>{v}</button>
      ))}
    </div>
  );
}

function DateField({ l, v, s, r=true, errKey, errors, onFix }) {
  const hasErr = errKey && errors && errors[errKey];
  const [raw,setRaw] = useState(()=>{ if(v&&v.includes("-")){const[y,mo,dd]=v.split("-");return `${dd}/${mo}/${y}`;}return v||"";});
  const [focused,setFocused] = useState(false);
  useEffect(()=>{ if(!focused){if(v&&v.includes("-")){const[y,mo,dd]=v.split("-");setRaw(`${dd}/${mo}/${y}`);}else setRaw(v||"");}}, [v,focused]);
  const handleChange=(e)=>{
    let val=e.target.value.replace(/[^0-9/]/g,"");
    if(val.length===2&&raw.length===1)val=val+"/";
    if(val.length===5&&raw.length===4)val=val+"/";
    if(val.length>10)return;
    setRaw(val);
    if(val.length===10){const[dd,mo,y]=val.split("/");if(dd&&mo&&y&&y.length===4){s(`${y}-${mo}-${dd}`);if(onFix&&hasErr)onFix(errKey);}}else{s("");}
  };
  return(
    <div className="fi">
      <span className="fl">{l}{r&&<span style={{color:"#ef4444",marginLeft:2}}>*</span>}</span>
      <input className={`date-input${hasErr?" err":""}`} value={raw} placeholder="DD/MM/YYYY" onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} onChange={handleChange} maxLength={10} inputMode="numeric"/>
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

export default function EducationDetails() {
  const router = useRouter();
  const { user, apiFetch, logout, ready } = useAuth();
  const [showSignout,setShowSignout]=useState(false);
  const [saveStatus,setSaveStatus]=useState("");
  const [midSaveStatus,setMidSaveStatus]=useState("");
  const [loading,setLoading]=useState(true);
  const [serverDraft,setServerDraft]=useState(null);
  const [errors,setErrors]=useState({});
  const isDirtyRef=useRef(false);
  const d=(fn)=>(val)=>{fn(val);isDirtyRef.current=true;};
  const fixErr=(key)=>setErrors(p=>({...p,[key]:false}));

  // ── Qualification toggles ─────────────────────────────────────────
  const [hasUG,setHasUG]=useState("");
  const [hasPG,setHasPG]=useState("");
  const [hasDip,setHasDip]=useState("");
  // afterTenth: what did user pursue immediately after Class X?
  // "Intermediate" | "Diploma" | "Both" | ""
  const [afterTenth,setAfterTenth]=useState("");
  const [hasCerts,setHasCerts]=useState("");
  const [hasProfQual,setHasProfQual]=useState("");
  const [hasArticleship,setHasArticleship]=useState(""); // NEW

  // ── Class X ──────────────────────────────────────────────────────
  const [xSchool,setXSchool]=useState("");const [xBoard,setXBoard]=useState("");const [xHall,setXHall]=useState("");
  const [xFrom,setXFrom]=useState("");const [xTo,setXTo]=useState("");const [xAddress,setXAddress]=useState("");
  const [xYear,setXYear]=useState("");const [xResultType,setXResultType]=useState("");const [xResultValue,setXResultValue]=useState("");const [xMedium,setXMedium]=useState("");const [xCertKey,setXCertKey]=useState("");

  // ── Intermediate ─────────────────────────────────────────────────
  const [iCollege,setICollege]=useState("");const [iBoard,setIBoard]=useState("");const [iHall,setIHall]=useState("");
  const [iFrom,setIFrom]=useState("");const [iTo,setITo]=useState("");const [iAddress,setIAddress]=useState("");const [iMode,setIMode]=useState("");
  const [iYear,setIYear]=useState("");const [iResultType,setIResultType]=useState("");const [iResultValue,setIResultValue]=useState("");const [iMedium,setIMedium]=useState("");const [iCertKey,setICertKey]=useState("");

  // ── UG ───────────────────────────────────────────────────────────
  const [ugCollege,setUgCollege]=useState("");const [ugUniversity,setUgUniversity]=useState("");const [ugCourse,setUgCourse]=useState("");
  const [ugSpecialization,setUgSpecialization]=useState(""); // NEW — for MBBS/BDS/LLB/BArch/B.Pharm etc.
  const [ugHall,setUgHall]=useState("");const [ugFrom,setUgFrom]=useState("");const [ugTo,setUgTo]=useState("");const [ugAddress,setUgAddress]=useState("");const [ugMode,setUgMode]=useState("");
  const [ugYear,setUgYear]=useState("");const [ugResultType,setUgResultType]=useState("");const [ugResultValue,setUgResultValue]=useState("");const [ugBacklogs,setUgBacklogs]=useState("");const [ugMedium,setUgMedium]=useState("");
  const [ugProvKey,setUgProvKey]=useState("");const [ugConvoKey,setUgConvoKey]=useState("");

  // ── PG ───────────────────────────────────────────────────────────
  const [pgCollege,setPgCollege]=useState("");const [pgUniversity,setPgUniversity]=useState("");const [pgCourse,setPgCourse]=useState("");
  const [pgSpecialization,setPgSpecialization]=useState(""); // NEW — for MD/MS/MBA specialization
  const [pgHall,setPgHall]=useState("");const [pgFrom,setPgFrom]=useState("");const [pgTo,setPgTo]=useState("");const [pgAddress,setPgAddress]=useState("");const [pgMode,setPgMode]=useState("");
  const [pgYear,setPgYear]=useState("");const [pgResultType,setPgResultType]=useState("");const [pgResultValue,setPgResultValue]=useState("");const [pgBacklogs,setPgBacklogs]=useState("");const [pgMedium,setPgMedium]=useState("");
  const [pgProvKey,setPgProvKey]=useState("");const [pgConvoKey,setPgConvoKey]=useState("");

  // ── Diploma ──────────────────────────────────────────────────────
  const [dipInstitute,setDipInstitute]=useState("");const [dipBoard,setDipBoard]=useState("");const [dipCourse,setDipCourse]=useState("");
  const [dipFrom,setDipFrom]=useState("");const [dipTo,setDipTo]=useState("");const [dipYear,setDipYear]=useState("");
  const [dipResultType,setDipResultType]=useState("");const [dipResultValue,setDipResultValue]=useState("");const [dipMode,setDipMode]=useState("");const [dipCertKey,setDipCertKey]=useState("");

  // ── Certifications & Professional Qualifications ─────────────────
  const [certs,setCerts]=useState([{name:"",certKey:""}]);
  const [profQuals,setProfQuals]=useState([{type:"",level:"",year:"",certKey:""}]);

  // ── Articleship / Practical Training (CA/CS/CMA) ─────────────────
  // NEW section
  const [articleships,setArticleships]=useState([{
    firm:"", city:"", principalName:"", regNo:"",
    from:"", to:"", isOngoing:"",
    type:"",  // "CA Articleship" | "CS Training" | "CMA Training" | "Internship" | "Other"
    certKey:"",
  }]);

  // ── Education gap ────────────────────────────────────────────────
  // NEW — gap between last education and first job
  const [hasEduGap,setHasEduGap]=useState("");  // "Yes" | "No" | ""
  const [eduGapReason,setEduGapReason]=useState("");

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
          if(x.yearOfPassing)setXYear(x.yearOfPassing);if(x.resultType)setXResultType(x.resultType);if(x.resultValue)setXResultValue(x.resultValue);if(x.medium)setXMedium(x.medium);if(x.certKey)setXCertKey(x.certKey);

          if(i.college)setICollege(i.college);if(i.board)setIBoard(i.board);if(i.hallTicket)setIHall(i.hallTicket);
          if(i.from)setIFrom(i.from);if(i.to)setITo(i.to);if(i.address)setIAddress(i.address);if(i.mode)setIMode(i.mode);
          if(i.yearOfPassing)setIYear(i.yearOfPassing);if(i.resultType)setIResultType(i.resultType);if(i.resultValue)setIResultValue(i.resultValue);if(i.medium)setIMedium(i.medium);if(i.certKey)setICertKey(i.certKey);

          if(ug.college){setHasUG("Yes");setUgCollege(ug.college);}if(ug.university)setUgUniversity(ug.university);if(ug.course)setUgCourse(ug.course);
          if(ug.specialization)setUgSpecialization(ug.specialization);
          if(ug.hallTicket)setUgHall(ug.hallTicket);if(ug.from)setUgFrom(ug.from);if(ug.to)setUgTo(ug.to);if(ug.address)setUgAddress(ug.address);if(ug.mode)setUgMode(ug.mode);
          if(ug.yearOfPassing)setUgYear(ug.yearOfPassing);if(ug.resultType)setUgResultType(ug.resultType);if(ug.resultValue)setUgResultValue(ug.resultValue);if(ug.backlogs)setUgBacklogs(ug.backlogs);if(ug.medium)setUgMedium(ug.medium);
          if(ug.provKey)setUgProvKey(ug.provKey);if(ug.convoKey)setUgConvoKey(ug.convoKey);if(!ug.provKey&&ug.certKey)setUgProvKey(ug.certKey);

          if(pg.college){setHasPG("Yes");setPgCollege(pg.college);}if(pg.university)setPgUniversity(pg.university);if(pg.course)setPgCourse(pg.course);
          if(pg.specialization)setPgSpecialization(pg.specialization);
          if(pg.hallTicket)setPgHall(pg.hallTicket);if(pg.from)setPgFrom(pg.from);if(pg.to)setPgTo(pg.to);if(pg.address)setPgAddress(pg.address);if(pg.mode)setPgMode(pg.mode);
          if(pg.yearOfPassing)setPgYear(pg.yearOfPassing);if(pg.resultType)setPgResultType(pg.resultType);if(pg.resultValue)setPgResultValue(pg.resultValue);if(pg.backlogs)setPgBacklogs(pg.backlogs);if(pg.medium)setPgMedium(pg.medium);
          if(pg.provKey)setPgProvKey(pg.provKey);if(pg.convoKey)setPgConvoKey(pg.convoKey);if(!pg.provKey&&pg.certKey)setPgProvKey(pg.certKey);

          if(edu.afterTenth)setAfterTenth(edu.afterTenth);
          // legacy: if old data had hasDip="Yes" but no afterTenth, infer afterTenth
          else if(edu.hasDip==="Yes"&&dip.institute){setAfterTenth("Diploma");}
          if(edu.hasDip)setHasDip(edu.hasDip); else if(dip.institute)setHasDip("Yes");
          if(edu.hasCerts)setHasCerts(edu.hasCerts);
          if(edu.hasProfQual)setHasProfQual(edu.hasProfQual);
          if(edu.hasArticleship)setHasArticleship(edu.hasArticleship);
          if(dip.institute)setDipInstitute(dip.institute);if(dip.board)setDipBoard(dip.board);if(dip.course)setDipCourse(dip.course);
          if(dip.from)setDipFrom(dip.from);if(dip.to)setDipTo(dip.to);if(dip.yearOfPassing)setDipYear(dip.yearOfPassing);
          if(dip.resultType)setDipResultType(dip.resultType);if(dip.resultValue)setDipResultValue(dip.resultValue);if(dip.mode)setDipMode(dip.mode);if(dip.certKey)setDipCertKey(dip.certKey);

          if(certsData.length>0)setCerts(certsData.map(c=>({name:typeof c.name==="string"?c.name:"",certKey:typeof c.certKey==="string"?c.certKey:""})));
          if(profData.length>0)setProfQuals(profData);
          if(artData.length>0)setArticleships(artData);

          // Education gap
          if(edu.hasEduGap)setHasEduGap(edu.hasEduGap);
          if(edu.eduGapReason)setEduGapReason(edu.eduGapReason);
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
    if(!xResultType)e.xResultType=true;if(!xResultValue)e.xResultValue=true;if(!xMedium)e.xMedium=true;if(!xCertKey)e.xCertKey=true;
    if(!afterTenth) e.afterTenth=true;
    if(afterTenth==="Intermediate"||afterTenth==="Both"){
      if(!iCollege)e.iCollege=true;if(!iBoard)e.iBoard=true;if(!iHall)e.iHall=true;
      if(!iFrom)e.iFrom=true;if(!iTo)e.iTo=true;if(!iYear)e.iYear=true;if(!iAddress)e.iAddress=true;
      if(!iMode)e.iMode=true;if(!iResultType)e.iResultType=true;if(!iResultValue)e.iResultValue=true;if(!iMedium)e.iMedium=true;if(!iCertKey)e.iCertKey=true;
    }
    if(afterTenth==="Diploma"||afterTenth==="Both"){
      if(!dipInstitute)e.dipInstitute=true;if(!dipBoard)e.dipBoard=true;if(!dipCourse)e.dipCourse=true;
      if(!dipFrom)e.dipFrom=true;if(!dipTo)e.dipTo=true;if(!dipYear)e.dipYear=true;
      if(!dipResultType)e.dipResultType=true;if(!dipResultValue)e.dipResultValue=true;if(!dipMode)e.dipMode=true;if(!dipCertKey)e.dipCertKey=true;
    }
    if(hasUG==="Yes"){
      if(!ugCollege)e.ugCollege=true;if(!ugUniversity)e.ugUniversity=true;if(!ugCourse)e.ugCourse=true;if(!ugHall)e.ugHall=true;
      if(!ugFrom)e.ugFrom=true;if(!ugTo)e.ugTo=true;if(!ugYear)e.ugYear=true;if(!ugAddress)e.ugAddress=true;
      if(!ugMode)e.ugMode=true;if(!ugResultType)e.ugResultType=true;if(!ugResultValue)e.ugResultValue=true;if(!ugMedium)e.ugMedium=true;if(!ugBacklogs)e.ugBacklogs=true;if(ugBacklogs!=="Yes"&&!ugProvKey)e.ugProvKey=true;
    }
    if(hasPG==="Yes"){if(!pgCollege)e.pgCollege=true;if(!pgUniversity)e.pgUniversity=true;if(!pgCourse)e.pgCourse=true;if(!pgHall)e.pgHall=true;if(!pgFrom)e.pgFrom=true;if(!pgTo)e.pgTo=true;if(!pgYear)e.pgYear=true;if(!pgAddress)e.pgAddress=true;if(!pgMode)e.pgMode=true;if(!pgResultType)e.pgResultType=true;if(!pgResultValue)e.pgResultValue=true;if(!pgMedium)e.pgMedium=true;if(!pgBacklogs)e.pgBacklogs=true;if(pgBacklogs!=="Yes"&&!pgProvKey)e.pgProvKey=true;}
    // Additional diploma (separate from afterTenth path) — only if hasDip toggled Yes explicitly
    if(hasDip==="Yes"&&afterTenth!=="Diploma"&&afterTenth!=="Both"){if(!dipInstitute)e.dipInstitute=true;if(!dipBoard)e.dipBoard=true;if(!dipCourse)e.dipCourse=true;if(!dipFrom)e.dipFrom=true;if(!dipTo)e.dipTo=true;if(!dipYear)e.dipYear=true;if(!dipResultType)e.dipResultType=true;if(!dipResultValue)e.dipResultValue=true;if(!dipMode)e.dipMode=true;if(!dipCertKey)e.dipCertKey=true;}
    if(hasCerts==="Yes"){certs.forEach((c,idx)=>{if(!c.name)e[`cert_name_${idx}`]=true;if(!c.certKey)e[`cert_key_${idx}`]=true;});}
    if(hasProfQual==="Yes"){profQuals.forEach((q,idx)=>{if(!q.type)e[`pq_type_${idx}`]=true;if(!q.level)e[`pq_level_${idx}`]=true;if(!q.year)e[`pq_year_${idx}`]=true;});}
    if(hasArticleship==="Yes"){articleships.forEach((a,idx)=>{if(!a.firm)e[`art_firm_${idx}`]=true;if(!a.from)e[`art_from_${idx}`]=true;if(!a.type)e[`art_type_${idx}`]=true;});}
    // hasDip required only if afterTenth is already answered (additional diploma below is optional)
    if(!hasCerts) e.hasCerts=true;
    if(!hasProfQual) e.hasProfQual=true;
    if(!hasArticleship) e.hasArticleship=true;
    if(!hasEduGap) e.hasEduGap=true;
    if(hasEduGap==="Yes"&&!eduGapReason) e.eduGapReason=true;
    return e;
  };

  const buildEducation=()=>({
    classX:{school:xSchool,board:xBoard,hallTicket:xHall,from:xFrom,to:xTo,address:xAddress,yearOfPassing:xYear,resultType:xResultType,resultValue:xResultValue,medium:xMedium,certKey:xCertKey},
    intermediate:{college:iCollege,board:iBoard,hallTicket:iHall,from:iFrom,to:iTo,address:iAddress,mode:iMode,yearOfPassing:iYear,resultType:iResultType,resultValue:iResultValue,medium:iMedium,certKey:iCertKey},
    undergraduate:hasUG==="Yes"?{college:ugCollege,university:ugUniversity,course:ugCourse,specialization:ugSpecialization,hallTicket:ugHall,from:ugFrom,to:ugTo,address:ugAddress,mode:ugMode,yearOfPassing:ugYear,resultType:ugResultType,resultValue:ugResultValue,backlogs:ugBacklogs,medium:ugMedium,provKey:ugProvKey,convoKey:ugConvoKey}:{},
    postgraduate:hasPG==="Yes"?{college:pgCollege,university:pgUniversity,course:pgCourse,specialization:pgSpecialization,hallTicket:pgHall,from:pgFrom,to:pgTo,address:pgAddress,mode:pgMode,yearOfPassing:pgYear,resultType:pgResultType,resultValue:pgResultValue,backlogs:pgBacklogs,medium:pgMedium,provKey:pgProvKey,convoKey:pgConvoKey}:{},
    afterTenth, hasDip, hasCerts, hasProfQual, hasArticleship,
    diploma:hasDip==="Yes"?{institute:dipInstitute,board:dipBoard,course:dipCourse,from:dipFrom,to:dipTo,yearOfPassing:dipYear,resultType:dipResultType,resultValue:dipResultValue,mode:dipMode,certKey:dipCertKey}:{},
    certifications:hasCerts==="Yes"?certs:[],
    professionalQualifications:hasProfQual==="Yes"?profQuals:[],
    articleships:hasArticleship==="Yes"?articleships:[],
    hasEduGap,
    eduGapReason: hasEduGap==="Yes"?eduGapReason:"",
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
    })});
    if(!res.ok)throw new Error(parseError(await res.json().catch(()=>({}))));
    setServerDraft({...dr,education:buildEducation()});isDirtyRef.current=false;
  };

  const handleSaveSignout=async()=>{try{await saveDraft();}catch(_){}logout();};
  const handleMidSave=async()=>{setMidSaveStatus("Saving…");try{await saveDraft();setMidSaveStatus("Saved ✓");setTimeout(()=>setMidSaveStatus(""),2000);}catch(_){setMidSaveStatus("Error");setTimeout(()=>setMidSaveStatus(""),2500);}};
  const handleNavigate=async(path)=>{if(isDirtyRef.current){try{await saveDraft();}catch(_){}}router.push(path);};
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

  if(!ready||!user)return null;
  if(loading)return(<div style={{minHeight:"100vh",background:"#cdd2ed",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"#8b88b0",fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:500}}>Loading education details…</p></div>);

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
        <div className="topbar">
          <span className="logo-text">Datagate</span>
          <div className="topbar-right">
            <span className="user-name">👤 {user.name||user.email}</span>
            <ConsentBell apiFetch={apiFetch} router={router}/>
            <button className="signout-btn" onClick={handleSaveSignout} style={{borderColor:"#ef4444",color:"#ef4444"}}>Save & Sign out</button>
          </div>
        </div>
        <div className="wrap">
          <StepNav current={2} onNavigate={handleNavigate}/>

          {/* ── Class X ──────────────────────────────────────────────────── */}
          <div className="sc ind">
            <div className="sh"><div className="si ind">📚</div><span className="st">Class X — SSC / Matriculation</span></div>
            <div className="fr"><F l="School Name" v={xSchool} s={d(setXSchool)} errKey="xSchool" errors={errors} onFix={fixErr}/><F l="Board Name" v={xBoard} s={d(setXBoard)} errKey="xBoard" errors={errors} onFix={fixErr}/><F l="Hall Ticket / Roll No." v={xHall} s={d(setXHall)} errKey="xHall" errors={errors} onFix={fixErr}/></div>
            <div className="fr">
              <DateField l="From" v={xFrom} s={d(setXFrom)} errKey="xFrom" errors={errors} onFix={fixErr}/>
              <DateField l="To" v={xTo} s={d(setXTo)} errKey="xTo" errors={errors} onFix={fixErr}/>
              <YearField l="Year of Passing" v={xYear} s={d(setXYear)} errKey="xYear" errors={errors} onFix={fixErr}/>
            </div>
            <div className="fr"><F l="School Address" v={xAddress} s={d(setXAddress)} errKey="xAddress" errors={errors} onFix={fixErr}/></div>
            <div className="fr"><FS l="Result Type" v={xResultType} s={d(setXResultType)} o={["Percentage","Grade"]} errKey="xResultType" errors={errors} onFix={fixErr}/><F l="Result Value" v={xResultValue} s={d(setXResultValue)} errKey="xResultValue" errors={errors} onFix={fixErr}/><F l="Medium of Study" v={xMedium} s={d(setXMedium)} errKey="xMedium" errors={errors} onFix={fixErr}/></div>
            <div style={{marginTop:"0.7rem"}}><UL lbl="Upload Class X Certificate" errKey="xCertKey"/><FileUpload label="Upload Class X Certificate" category="education" subKey="classX" employeeId={serverDraft?.employee_id || ""} apiFetch={apiFetch} value={xCertKey} onChange={(k)=>{const key=typeof k==="string"?k:(k?.key||k?.s3_key||"");setXCertKey(key);isDirtyRef.current=true;fixErr("xCertKey");}}/></div>
          </div>

          {/* ── After Class X — smart path selector ───────────────────────── */}
          <div className="sc cyn">
            <div className="sh"><div className="si cyn">🔀</div><span className="st">After Class X — What did you pursue? <span style={{color:"#ef4444",fontSize:"0.82rem"}}>*</span></span></div>
            <p style={{fontSize:"0.76rem",color:"#6b6894",marginBottom:"1rem",fontWeight:500,lineHeight:1.55}}>
              After completing Class X (10th), what was your next qualification? This determines which sections appear below.
            </p>
            <div style={{display:"flex",gap:"0.6rem",flexWrap:"wrap"}}>
              {[
                {v:"Intermediate", label:"Intermediate / 12th", desc:"Regular HSC / Pre-University / +2"},
                {v:"Diploma",      label:"Diploma (after 10th)", desc:"3-year Polytechnic / ITI directly after 10th"},
                {v:"Both",         label:"Both",                 desc:"Did Intermediate AND a Diploma"},
              ].map(({v,label,desc})=>(
                <button key={v} type="button"
                  onClick={()=>{setAfterTenth(v);isDirtyRef.current=true;fixErr("afterTenth");}}
                  style={{
                    padding:"0.6rem 1rem",borderRadius:10,cursor:"pointer",textAlign:"left",transition:"all 0.18s",
                    border:afterTenth===v?"2px solid #0891b2":"1.5px solid #dddaf0",
                    background:afterTenth===v?"#ecfeff":"#f2f1f9",
                    minWidth:180,
                  }}>
                  <div style={{fontSize:"0.84rem",fontWeight:700,color:afterTenth===v?"#0891b2":"#1a1730"}}>{label}</div>
                  <div style={{fontSize:"0.68rem",color:"#8b88b0",marginTop:"0.15rem",fontWeight:500}}>{desc}</div>
                </button>
              ))}
            </div>
            {errors.afterTenth&&<span className="err-msg" style={{marginTop:"0.5rem",display:"block"}}>Please select your path after Class X</span>}
          </div>

          {/* ── Intermediate — shown when afterTenth is Intermediate or Both ── */}
          {(afterTenth==="Intermediate"||afterTenth==="Both")&&(
          <div className="sc cyn">
            <div className="sh"><div className="si cyn">🏫</div><span className="st">Intermediate — HSC / 12th</span></div>
            <div className="fr"><F l="College Name" v={iCollege} s={d(setICollege)} errKey="iCollege" errors={errors} onFix={fixErr}/><F l="Board Name" v={iBoard} s={d(setIBoard)} errKey="iBoard" errors={errors} onFix={fixErr}/><F l="Hall Ticket / Roll No." v={iHall} s={d(setIHall)} errKey="iHall" errors={errors} onFix={fixErr}/></div>
            <div className="fr">
              <DateField l="From" v={iFrom} s={d(setIFrom)} errKey="iFrom" errors={errors} onFix={fixErr}/>
              <DateField l="To" v={iTo} s={d(setITo)} errKey="iTo" errors={errors} onFix={fixErr}/>
              <YearField l="Year of Passing" v={iYear} s={d(setIYear)} errKey="iYear" errors={errors} onFix={fixErr}/>
            </div>
            <div className="fr"><F l="College Address" v={iAddress} s={d(setIAddress)} errKey="iAddress" errors={errors} onFix={fixErr}/></div>
            <div className="fr"><FS l="Mode" v={iMode} s={d(setIMode)} o={["Full-time","Part-time","Distance"]} errKey="iMode" errors={errors} onFix={fixErr}/><FS l="Result Type" v={iResultType} s={d(setIResultType)} o={["Percentage","Grade"]} errKey="iResultType" errors={errors} onFix={fixErr}/><F l="Result Value" v={iResultValue} s={d(setIResultValue)} errKey="iResultValue" errors={errors} onFix={fixErr}/></div>
            <div className="fr"><F l="Medium of Study" v={iMedium} s={d(setIMedium)} errKey="iMedium" errors={errors} onFix={fixErr}/></div>
            <div style={{marginTop:"0.7rem"}}><UL lbl="Upload Intermediate Certificate" errKey="iCertKey"/><FileUpload label="Upload Intermediate Certificate" category="education" subKey="intermediate" employeeId={serverDraft?.employee_id || ""} apiFetch={apiFetch} value={iCertKey} onChange={(k)=>{const key=typeof k==="string"?k:(k?.key||k?.s3_key||"");setICertKey(key);isDirtyRef.current=true;fixErr("iCertKey");}}/></div>
          </div>
          )}

          {/* ── Diploma after 10th — shown when afterTenth is Diploma or Both ── */}
          {(afterTenth==="Diploma"||afterTenth==="Both")&&(
          <div className="sc grn">
            <div className="sh"><div className="si grn">🔧</div><span className="st">Diploma — After Class X</span></div>
            <p style={{fontSize:"0.72rem",color:"#8b88b0",marginBottom:"0.85rem",fontWeight:500,lineHeight:1.5}}>3-year Polytechnic Diploma / ITI / Technical qualification pursued directly after 10th.</p>
            <div className="fr"><F l="Institute Name" v={dipInstitute} s={d(setDipInstitute)} errKey="dipInstitute" errors={errors} onFix={fixErr}/><F l="Board / University" v={dipBoard} s={d(setDipBoard)} errKey="dipBoard" errors={errors} onFix={fixErr}/><F l="Course / Programme" v={dipCourse} s={d(setDipCourse)} errKey="dipCourse" errors={errors} onFix={fixErr}/></div>
            <div className="fr">
              <DateField l="From" v={dipFrom} s={d(setDipFrom)} errKey="dipFrom" errors={errors} onFix={fixErr}/>
              <DateField l="To" v={dipTo} s={d(setDipTo)} errKey="dipTo" errors={errors} onFix={fixErr}/>
              <YearField l="Year of Passing" v={dipYear} s={d(setDipYear)} errKey="dipYear" errors={errors} onFix={fixErr}/>
            </div>
            <div className="fr"><FS l="Mode" v={dipMode} s={d(setDipMode)} o={["Full-time","Part-time","Distance"]} errKey="dipMode" errors={errors} onFix={fixErr}/><FS l="Result Type" v={dipResultType} s={d(setDipResultType)} o={["Percentage","CGPA","Grade"]} errKey="dipResultType" errors={errors} onFix={fixErr}/><F l="Result Value" v={dipResultValue} s={d(setDipResultValue)} errKey="dipResultValue" errors={errors} onFix={fixErr}/></div>
            <div style={{marginTop:"0.7rem"}}><UL lbl="Upload Diploma Certificate" errKey="dipCertKey"/><FileUpload label="Upload Diploma Certificate" category="education" subKey="diploma" employeeId={serverDraft?.employee_id || ""} apiFetch={apiFetch} value={dipCertKey} onChange={(k)=>{const key=typeof k==="string"?k:(k?.key||k?.s3_key||"");setDipCertKey(key);isDirtyRef.current=true;fixErr("dipCertKey");}}/></div>
          </div>
          )}

          {/* ── Undergraduate ─────────────────────────────────────────────── */}
          <div className="sc amb">
            <div className="sh"><div className="si amb">🎓</div><span className="st">Undergraduate — UG / Degree</span></div>
            <p style={{fontSize:"0.72rem",color:"#8b88b0",marginBottom:"0.85rem",fontWeight:500,lineHeight:1.5}}>Covers B.Tech, B.E, BCA, BBA, BCom, BA, BSc, MBBS, BDS, LLB, BArch, B.Pharm, B.Ed, BHM, BFA, and all undergraduate professional degrees.</p>
            <YesNo label="Do you have an Undergraduate degree?" value={hasUG} onChange={(v)=>{setHasUG(v);isDirtyRef.current=true;}}/>
            {hasUG==="Yes"&&(<>
              <div className="fr"><F l="College Name" v={ugCollege} s={d(setUgCollege)} errKey="ugCollege" errors={errors} onFix={fixErr}/><F l="University Name" v={ugUniversity} s={d(setUgUniversity)} errKey="ugUniversity" errors={errors} onFix={fixErr}/><F l="Course / Degree" v={ugCourse} s={d(setUgCourse)} errKey="ugCourse" errors={errors} onFix={fixErr}/></div>
              {/* Specialization — optional, for MBBS/BDS/LLB/BArch/B.Pharm etc. */}
              <div className="fr">
                <F l="Specialization / Branch" v={ugSpecialization} s={d(setUgSpecialization)} r={false} errKey="ugSpecialization" errors={errors} onFix={fixErr}/>
                <F l="Hall Ticket / Roll No." v={ugHall} s={d(setUgHall)} errKey="ugHall" errors={errors} onFix={fixErr}/>
                <FS l="Mode" v={ugMode} s={d(setUgMode)} o={["Full-time","Part-time","Distance","Integrated"]} errKey="ugMode" errors={errors} onFix={fixErr}/>
              </div>
              <div className="fr">
                <DateField l="From" v={ugFrom} s={d(setUgFrom)} errKey="ugFrom" errors={errors} onFix={fixErr}/>
                <DateField l="To" v={ugTo} s={d(setUgTo)} errKey="ugTo" errors={errors} onFix={fixErr}/>
                <YearField l="Year of Passing" v={ugYear} s={d(setUgYear)} errKey="ugYear" errors={errors} onFix={fixErr}/>
              </div>
              <div className="fr"><F l="College Address" v={ugAddress} s={d(setUgAddress)} errKey="ugAddress" errors={errors} onFix={fixErr}/></div>
              <div className="fr"><FS l="Result Type" v={ugResultType} s={d(setUgResultType)} o={["Percentage","CGPA","Grade"]} errKey="ugResultType" errors={errors} onFix={fixErr}/><F l="Result Value" v={ugResultValue} s={d(setUgResultValue)} errKey="ugResultValue" errors={errors} onFix={fixErr}/><F l="Medium of Study" v={ugMedium} s={d(setUgMedium)} errKey="ugMedium" errors={errors} onFix={fixErr}/></div>
              <div className="fr"><FS l="Any Active Backlogs?" v={ugBacklogs} s={d(setUgBacklogs)} o={["No","Yes"]} errKey="ugBacklogs" errors={errors} onFix={fixErr}/></div>
              <div className="att-split">
                <div className="att-box">
                  <UL lbl="Provisional Marksheet" required={ugBacklogs!=="Yes"} errKey="ugProvKey"/>
                  {ugBacklogs==="Yes"&&<p style={{fontSize:"0.7rem",color:"#d97706",fontWeight:600,marginBottom:"0.4rem"}}>⚠️ Upload when available after clearing backlogs</p>}
                  <FileUpload label="Upload Provisional Marksheet" category="education" subKey="ug_provisional" employeeId={serverDraft?.employee_id || ""} apiFetch={apiFetch} value={ugProvKey} onChange={(k)=>{const key=typeof k==="string"?k:(k?.key||k?.s3_key||"");setUgProvKey(key);isDirtyRef.current=true;fixErr("ugProvKey");}}/>
                </div>
                <div className="att-box"><span className="att-box-lbl">Convocation Certificate</span><FileUpload label="Upload Convocation Certificate" category="education" subKey="ug_convocation" employeeId={serverDraft?.employee_id || ""} apiFetch={apiFetch} value={ugConvoKey} onChange={(k)=>{const key=typeof k==="string"?k:(k?.key||k?.s3_key||"");setUgConvoKey(key);isDirtyRef.current=true;}}/></div>
              </div>
            </>)}
          </div>

          {/* ── Postgraduate ──────────────────────────────────────────────── */}
          <div className="sc vio">
            <div className="sh"><div className="si vio">🧑‍🎓</div><span className="st">Postgraduate — PG / Masters</span></div>
            <p style={{fontSize:"0.72rem",color:"#8b88b0",marginBottom:"0.85rem",fontWeight:500,lineHeight:1.5}}>Covers MBA, M.Tech, MCA, MCom, MA, MSc, MD, MS, MDS, LLM, M.Pharm, M.Ed, MFA, and all postgraduate professional degrees.</p>
            <YesNo label="Do you have a Postgraduate degree?" value={hasPG} onChange={(v)=>{setHasPG(v);isDirtyRef.current=true;}}/>
            {hasPG==="Yes"&&(<>
              <div className="fr"><F l="College Name" v={pgCollege} s={d(setPgCollege)} errKey="pgCollege" errors={errors} onFix={fixErr}/><F l="University Name" v={pgUniversity} s={d(setPgUniversity)} errKey="pgUniversity" errors={errors} onFix={fixErr}/><F l="Course / Degree" v={pgCourse} s={d(setPgCourse)} errKey="pgCourse" errors={errors} onFix={fixErr}/></div>
              {/* Specialization — required for MBA, MD, MS etc. */}
              <div className="fr">
                <F l="Specialization / Branch" v={pgSpecialization} s={d(setPgSpecialization)} r={false} errKey="pgSpecialization" errors={errors} onFix={fixErr}/>
                <F l="Hall Ticket / Roll No." v={pgHall} s={d(setPgHall)} errKey="pgHall" errors={errors} onFix={fixErr}/>
                <FS l="Mode" v={pgMode} s={d(setPgMode)} o={["Full-time","Part-time","Distance","Executive"]} errKey="pgMode" errors={errors} onFix={fixErr}/>
              </div>
              <div className="fr">
                <DateField l="From" v={pgFrom} s={d(setPgFrom)} errKey="pgFrom" errors={errors} onFix={fixErr}/>
                <DateField l="To" v={pgTo} s={d(setPgTo)} errKey="pgTo" errors={errors} onFix={fixErr}/>
                <YearField l="Year of Passing" v={pgYear} s={d(setPgYear)} errKey="pgYear" errors={errors} onFix={fixErr}/>
              </div>
              <div className="fr"><F l="College Address" v={pgAddress} s={d(setPgAddress)} errKey="pgAddress" errors={errors} onFix={fixErr}/></div>
              <div className="fr"><FS l="Result Type" v={pgResultType} s={d(setPgResultType)} o={["Percentage","CGPA","Grade"]} errKey="pgResultType" errors={errors} onFix={fixErr}/><F l="Result Value" v={pgResultValue} s={d(setPgResultValue)} errKey="pgResultValue" errors={errors} onFix={fixErr}/><F l="Medium of Study" v={pgMedium} s={d(setPgMedium)} errKey="pgMedium" errors={errors} onFix={fixErr}/></div>
              <div className="fr"><FS l="Any Active Backlogs?" v={pgBacklogs} s={d(setPgBacklogs)} o={["No","Yes"]} errKey="pgBacklogs" errors={errors} onFix={fixErr}/></div>
              <div className="att-split">
                <div className="att-box">
                  <UL lbl="Provisional Marksheet" required={pgBacklogs!=="Yes"} errKey="pgProvKey"/>
                  {pgBacklogs==="Yes"&&<p style={{fontSize:"0.7rem",color:"#d97706",fontWeight:600,marginBottom:"0.4rem"}}>⚠️ Upload when available after clearing backlogs</p>}
                  <FileUpload label="Upload Provisional Marksheet" category="education" subKey="pg_provisional" employeeId={serverDraft?.employee_id || ""} apiFetch={apiFetch} value={pgProvKey} onChange={(k)=>{const key=typeof k==="string"?k:(k?.key||k?.s3_key||"");setPgProvKey(key);isDirtyRef.current=true;fixErr("pgProvKey");}}/>
                </div>
                <div className="att-box"><span className="att-box-lbl">Convocation Certificate</span><FileUpload label="Upload Convocation Certificate" category="education" subKey="pg_convocation" employeeId={serverDraft?.employee_id || ""} apiFetch={apiFetch} value={pgConvoKey} onChange={(k)=>{const key=typeof k==="string"?k:(k?.key||k?.s3_key||"");setPgConvoKey(key);isDirtyRef.current=true;}}/></div>
              </div>
            </>)}
          </div>

          {/* ── Additional Diploma — only shown for Intermediate path users ── */}
          {/* Diploma path users already filled diploma above — skip this for them */}
          {afterTenth!=="Diploma"&&(
          <div className="sc grn">
            <div className="sh"><div className="si grn">🔧</div><span className="st">{afterTenth==="Both"?"Additional Diploma / Technical":"Diploma / Technical / Vocational"}</span></div>
            <p style={{fontSize:"0.72rem",color:"#8b88b0",marginBottom:"0.85rem",fontWeight:500,lineHeight:1.5}}>
              {afterTenth==="Both"
                ? "Any additional diploma / certificate course taken after Intermediate or during degree."
                : "Diploma, ITI, or any technical / vocational qualification not covered above."}
            </p>
            <div style={{display:"flex",alignItems:"center",gap:"0.5rem",flexWrap:"wrap",marginBottom:"1rem"}}>
              <span style={{fontSize:"0.875rem",color:"#1a1730",fontWeight:600}}>
                {afterTenth==="Both"?"Do you have an additional diploma?":"Do you have a Diploma or Technical qualification?"}{" "}
                <span style={{color:"#8b88b0",fontSize:"0.75rem",fontWeight:400}}>(optional)</span>
              </span>
              {["Yes","No"].map(v=>(
                <button key={v} onClick={()=>{setHasDip(v);isDirtyRef.current=true;fixErr("hasDip");}} style={{padding:"0.32rem 1.1rem",borderRadius:999,border:hasDip===v?"2px solid #4f46e5":"1.5px solid #dddaf0",background:hasDip===v?"#4f46e5":"#f2f1f9",color:hasDip===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.82rem",fontWeight:700,transition:"all 0.18s"}}>{v}</button>
              ))}
            </div>
            {hasDip==="Yes"&&(<>
              <div className="fr"><F l="Institute Name" v={dipInstitute} s={d(setDipInstitute)} errKey="dipInstitute" errors={errors} onFix={fixErr}/><F l="Board / University" v={dipBoard} s={d(setDipBoard)} errKey="dipBoard" errors={errors} onFix={fixErr}/><F l="Course / Programme" v={dipCourse} s={d(setDipCourse)} errKey="dipCourse" errors={errors} onFix={fixErr}/></div>
              <div className="fr">
                <DateField l="From" v={dipFrom} s={d(setDipFrom)} errKey="dipFrom" errors={errors} onFix={fixErr}/>
                <DateField l="To" v={dipTo} s={d(setDipTo)} errKey="dipTo" errors={errors} onFix={fixErr}/>
                <YearField l="Year of Passing" v={dipYear} s={d(setDipYear)} errKey="dipYear" errors={errors} onFix={fixErr}/>
              </div>
              <div className="fr"><FS l="Mode" v={dipMode} s={d(setDipMode)} o={["Full-time","Part-time","Distance"]} errKey="dipMode" errors={errors} onFix={fixErr}/><FS l="Result Type" v={dipResultType} s={d(setDipResultType)} o={["Percentage","CGPA","Grade"]} errKey="dipResultType" errors={errors} onFix={fixErr}/><F l="Result Value" v={dipResultValue} s={d(setDipResultValue)} errKey="dipResultValue" errors={errors} onFix={fixErr}/></div>
              <div style={{marginTop:"0.7rem"}}><UL lbl="Upload Diploma / Technical Certificate" errKey="dipCertKey"/><FileUpload label="Upload Diploma Certificate" category="education" subKey="diploma" employeeId={serverDraft?.employee_id || ""} apiFetch={apiFetch} value={dipCertKey} onChange={(k)=>{const key=typeof k==="string"?k:(k?.key||k?.s3_key||"");setDipCertKey(key);isDirtyRef.current=true;fixErr("dipCertKey");}}/></div>
            </>)}
          </div>
          )}

          {/* ── Professional Qualifications ────────────────────────────────── */}
          <div className="sc slt">
            <div className="sh"><div className="si slt">🏛️</div><span className="st">Professional Qualifications</span></div>
            <p style={{fontSize:"0.76rem",color:"#8b88b0",marginBottom:"0.9rem",fontWeight:500}}>CA, CMA (ICWA), CS, CFA, ACCA, CIMA, FRM, PMP, or any professional body qualification. CA / CMA students can also use this section even without a degree.</p>
            <div style={{display:"flex",alignItems:"center",gap:"0.5rem",flexWrap:"wrap",marginBottom:"1rem"}}>
              <span style={{fontSize:"0.875rem",color:"#1a1730",fontWeight:600}}>Do you have a professional qualification? <span style={{color:"#ef4444"}}>*</span></span>
              {["Yes","No"].map(v=>(
                <button key={v} onClick={()=>{setHasProfQual(v);isDirtyRef.current=true;fixErr("hasProfQual");}} style={{padding:"0.32rem 1.1rem",borderRadius:999,border:hasProfQual===v?"2px solid #4f46e5":"1.5px solid #dddaf0",background:hasProfQual===v?"#4f46e5":"#f2f1f9",color:hasProfQual===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.82rem",fontWeight:700,transition:"all 0.18s"}}>{v}</button>
              ))}
            </div>
            {errors.hasProfQual&&<span className="err-msg" style={{marginTop:"-0.5rem",marginBottom:"0.5rem",display:"block"}}>Please answer this question</span>}
            {hasProfQual==="Yes"&&(<>
              {profQuals.map((q,idx)=>(
                <div key={idx} className="cert-box">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.6rem"}}>
                    <span style={{fontSize:"0.78rem",color:"#8b88b0",fontWeight:700}}>Qualification {idx+1}</span>
                    {idx>0&&<button className="rm-btn" onClick={()=>{const p=[...profQuals];p.splice(idx,1);setProfQuals(p);isDirtyRef.current=true;}}>- Remove</button>}
                  </div>
                  <div className="fr">
                    <div className="fi">
                      <span className="fl">Qualification Type <span style={{color:"#ef4444"}}>*</span></span>
                      <select className={`in${errors[`pq_type_${idx}`]?" err":""}`} value={q.type} onChange={e=>{const p=[...profQuals];p[idx]={...p[idx],type:e.target.value};setProfQuals(p);isDirtyRef.current=true;fixErr(`pq_type_${idx}`);}}>
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
                    <div className="fi">
                      <span className="fl">Year of Passing <span style={{color:"#ef4444"}}>*</span></span>
                      <input className={`in${errors[`pq_year_${idx}`]?" err":""}`} value={q.year||""} placeholder="YYYY" inputMode="numeric" maxLength={4} onChange={e=>{const val=e.target.value.replace(/\D/g,"").slice(0,4);const p=[...profQuals];p[idx]={...p[idx],year:val};setProfQuals(p);isDirtyRef.current=true;if(val)fixErr(`pq_year_${idx}`);}}/>
                      {errors[`pq_year_${idx}`]&&<span className="err-msg">Required</span>}
                    </div>
                  </div>
                  <div style={{marginTop:"0.5rem"}}>
                    <span className="fl" style={{display:"block",marginBottom:"0.28rem"}}>Upload Certificate / Marksheet</span>
                    <FileUpload label="Upload Certificate" category="education" subKey={`profqual_${idx}`} employeeId={serverDraft?.employee_id || ""} apiFetch={apiFetch} value={typeof q.certKey==="string"?q.certKey:""} onChange={(k)=>{const p=[...profQuals];p[idx]={...p[idx],certKey:typeof k==="string"?k:""};setProfQuals(p);isDirtyRef.current=true;}}/>
                  </div>
                </div>
              ))}
              <button className="add-btn" onClick={()=>{setProfQuals([...profQuals,{type:"",level:"",year:"",certKey:""}]);isDirtyRef.current=true;}}>+ Add Another Qualification</button>
            </>)}
          </div>

          {/* ── Articleship / Practical Training ─────────────────────────── */}
          <div className="sc ora">
            <div className="sh"><div className="si ora">📝</div><span className="st">Articleship / Practical Training</span></div>
            <p style={{fontSize:"0.76rem",color:"#8b88b0",marginBottom:"0.9rem",fontWeight:500,lineHeight:1.5}}>
              For CA Articleship (ICAI), CS Training (ICSI), CMA Training, medical internships, pharmacy internships, law internships, and any mandatory practical training as part of a professional course.
            </p>
            <div style={{display:"flex",alignItems:"center",gap:"0.5rem",flexWrap:"wrap",marginBottom:"1rem"}}>
              <span style={{fontSize:"0.875rem",color:"#1a1730",fontWeight:600}}>Do you have any articleship or practical training? <span style={{color:"#ef4444"}}>*</span></span>
              {["Yes","No"].map(v=>(
                <button key={v} onClick={()=>{setHasArticleship(v);isDirtyRef.current=true;fixErr("hasArticleship");}} style={{padding:"0.32rem 1.1rem",borderRadius:999,border:hasArticleship===v?"2px solid #ea580c":"1.5px solid #dddaf0",background:hasArticleship===v?"#ea580c":"#f2f1f9",color:hasArticleship===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.82rem",fontWeight:700,transition:"all 0.18s"}}>{v}</button>
              ))}
            </div>
            {errors.hasArticleship&&<span className="err-msg" style={{marginTop:"-0.5rem",marginBottom:"0.5rem",display:"block"}}>Please answer this question</span>}
            {hasArticleship==="Yes"&&(<>
              {articleships.map((a,idx)=>(
                <div key={idx} className="cert-box" style={{background:"#fff7ed",border:"1.5px solid #fed7aa"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.75rem"}}>
                    <span style={{fontSize:"0.78rem",color:"#ea580c",fontWeight:700}}>Training / Articleship {idx+1}</span>
                    {idx>0&&<button className="rm-btn" onClick={()=>{const arr=[...articleships];arr.splice(idx,1);setArticleships(arr);isDirtyRef.current=true;}}>- Remove</button>}
                  </div>
                  <div className="fr">
                    <div className="fi">
                      <span className="fl">Training Type <span style={{color:"#ef4444"}}>*</span></span>
                      <select className={`in${errors[`art_type_${idx}`]?" err":""}`} value={a.type} onChange={e=>updateArticleship(idx,"type",e.target.value)}>
                        <option value="">Select</option>
                        {["CA Articleship (ICAI)","CS Training (ICSI)","CMA Training (ICMAI)","Medical Internship","Pharmacy Internship","Law Internship","Architecture Internship","Other Practical Training"].map(x=><option key={x} value={x}>{x}</option>)}
                      </select>
                      {errors[`art_type_${idx}`]&&<span className="err-msg">Required</span>}
                    </div>
                    <F l="Firm / Organisation Name" v={a.firm} s={v=>updateArticleship(idx,"firm",v)} errKey={`art_firm_${idx}`} errors={errors} onFix={fixErr}/>
                  </div>
                  <div className="fr">
                    <F l="City / Location" v={a.city} s={v=>updateArticleship(idx,"city",v)} r={false}/>
                    <F l="Principal / Supervisor Name" v={a.principalName} s={v=>updateArticleship(idx,"principalName",v)} r={false}/>
                    <F l="Registration / Membership No." v={a.regNo} s={v=>updateArticleship(idx,"regNo",v)} r={false}/>
                  </div>
                  <div className="fr">
                    <DateField l="From" v={a.from} s={v=>updateArticleship(idx,"from",v)} errKey={`art_from_${idx}`} errors={errors} onFix={fixErr}/>
                    <DateField l="To" v={a.to} s={v=>updateArticleship(idx,"to",v)} r={false}/>
                    <div className="fi">
                      <span className="fl">Status</span>
                      <div style={{display:"flex",gap:"0.55rem",marginTop:"0.15rem"}}>
                        {["Ongoing","Completed"].map(v=>(
                          <button key={v} type="button" onClick={()=>updateArticleship(idx,"isOngoing",v)} style={{flex:1,padding:"0.55rem 0",borderRadius:9,border:a.isOngoing===v?"2px solid #ea580c":"1.5px solid #b8b4d4",background:a.isOngoing===v?"#ea580c":"#ececf9",color:a.isOngoing===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.78rem",fontWeight:700,fontFamily:"inherit",transition:"all 0.18s"}}>{v}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{marginTop:"0.5rem"}}>
                    <span className="fl" style={{display:"block",marginBottom:"0.28rem"}}>Upload Completion / Experience Letter</span>
                    <FileUpload label="Upload Letter" category="education" subKey={`articleship_${idx}`} employeeId={serverDraft?.employee_id || ""} apiFetch={apiFetch} value={typeof a.certKey==="string"?a.certKey:""} onChange={(k)=>{updateArticleship(idx,"certKey",typeof k==="string"?k:"");}}/>
                  </div>
                </div>
              ))}
              <button className="add-btn" onClick={()=>{setArticleships([...articleships,{firm:"",city:"",principalName:"",regNo:"",from:"",to:"",isOngoing:"",type:"",certKey:""}]);isDirtyRef.current=true;}}>+ Add Another Training</button>
            </>)}
          </div>

          {/* ── Professional Certifications ────────────────────────────────── */}
          <div className="sc ros">
            <div className="sh"><div className="si ros">🏅</div><span className="st">Professional Certifications</span></div>
            <div style={{display:"flex",alignItems:"center",gap:"0.5rem",flexWrap:"wrap",marginBottom:"1rem"}}>
              <span style={{fontSize:"0.875rem",color:"#1a1730",fontWeight:600}}>Do you have certifications? (AWS, Azure, PMP, CPA, etc.) <span style={{color:"#ef4444"}}>*</span></span>
              {["Yes","No"].map(v=>(
                <button key={v} onClick={()=>{setHasCerts(v);isDirtyRef.current=true;fixErr("hasCerts");}} style={{padding:"0.32rem 1.1rem",borderRadius:999,border:hasCerts===v?"2px solid #e11d48":"1.5px solid #dddaf0",background:hasCerts===v?"#e11d48":"#f2f1f9",color:hasCerts===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.82rem",fontWeight:700,transition:"all 0.18s"}}>{v}</button>
              ))}
            </div>
            {errors.hasCerts&&<span className="err-msg" style={{marginTop:"-0.5rem",marginBottom:"0.5rem",display:"block"}}>Please answer this question</span>}
            {hasCerts==="Yes"&&(<>
              {certs.map((cert,idx)=>(
                <div key={idx} className="cert-box">
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
                    <FileUpload label="Upload Certificate" category="education" subKey={`cert_${idx}`} employeeId={serverDraft?.employee_id || ""} apiFetch={apiFetch} value={typeof cert.certKey==="string"?cert.certKey:""} onChange={(k)=>{const c=[...certs];c[idx]={...c[idx],certKey:typeof k==="string"?k:""};setCerts(c);isDirtyRef.current=true;fixErr(`cert_key_${idx}`);}}/>
                  </div>
                </div>
              ))}
              <button className="add-btn" onClick={()=>{setCerts([...certs,{name:"",certKey:""}]);isDirtyRef.current=true;}}>+ Add Another Certification</button>
            </>)}
          </div>

          {/* ── Education Gap Before First Job ─────────────────────────────── */}
          <div className="sc ind">
            <div className="sh"><div className="si ind">⏱</div><span className="st">Education Gap / Break Before First Job <span style={{color:"#ef4444",fontSize:"0.82rem"}}>*</span></span></div>
            <p style={{fontSize:"0.76rem",color:"#6b6894",marginBottom:"0.9rem",fontWeight:500,lineHeight:1.55}}>
              Was there any gap between completing your education and joining your first job? This includes breaks for exam preparation, personal reasons, higher education attempts, health reasons, or any other period of non-employment.
            </p>
            {/* Required Yes/No toggle */}
            <div style={{display:"flex",gap:"0.65rem",marginBottom:hasEduGap==="Yes"?"0.75rem":"0"}}>
              {["Yes","No"].map(v=>(
                <button key={v} type="button" onClick={()=>{d(setHasEduGap)(v);if(v==="No")setEduGapReason("");fixErr("hasEduGap");}} style={{padding:"0.45rem 1.6rem",borderRadius:999,border:hasEduGap===v?"2px solid #4f46e5":"1.5px solid #dddaf0",background:hasEduGap===v?"#4f46e5":"#f2f1f9",color:hasEduGap===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.875rem",fontWeight:700,transition:"all 0.18s"}}>{v}</button>
              ))}
            </div>
            {errors.hasEduGap&&<span className="err-msg" style={{marginTop:"0.4rem",display:"block"}}>Please answer this question before continuing</span>}
            {hasEduGap==="Yes"&&(
              <div style={{marginTop:"0.65rem"}}>
                <span className="fl" style={{display:"block",marginBottom:"0.28rem"}}>Reason for Gap <span style={{color:"#ef4444"}}>*</span></span>
                <textarea
                  className={`in${errors.eduGapReason?" err":""}`}
                  style={{minHeight:72,resize:"vertical"}}
                  value={eduGapReason}
                  placeholder="Briefly describe the gap period and reason (e.g. UPSC preparation, family obligation, medical recovery, pursuing further education, etc.)"
                  onChange={e=>{d(setEduGapReason)(e.target.value);fixErr("eduGapReason");}}
                />
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
              <button className="pbtn" onClick={handleSave}>Save & Continue →</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
