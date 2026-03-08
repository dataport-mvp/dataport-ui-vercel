// pages/employee/education.js  — Page 2 of 4
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";
import FileUpload from "../../components/FileUpload";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

// ─── Page 2 step accent: AMBER ────────────────────────────────────────
const STEP_COLOR   = "#d97706";
const STEP_DONE_BG = "#2a2460";
const STEP_DONE_CK = "#a78bfa";
const STEP_CONN    = "#a78bfa";
const STEP_SHADOW  = "rgba(217,119,6,0.35)";

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
  .sc { background: #ffffff; border-radius: 16px; padding: 1.5rem 1.6rem;
    margin-bottom: 1.1rem; box-shadow: 0 6px 28px rgba(30,26,62,0.22), 0 2px 8px rgba(30,26,62,0.12); border: 1px solid rgba(255,255,255,0.85);
    position: relative; overflow: hidden; }
  .sc::before { content: ''; position: absolute; top: 0; left: 0; bottom: 0; width: 4px; border-radius: 16px 0 0 16px; }
  .sc.ind::before{background:#4f46e5;} .sc.cyn::before{background:#0891b2;}
  .sc.amb::before{background:#d97706;} .sc.ros::before{background:#e11d48;}
  .sc.vio::before{background:#7c3aed;} .sc.grn::before{background:#16a34a;}
  .sh { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.15rem; }
  .si { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.95rem; flex-shrink: 0; }
  .si.ind{background:#eef2ff;} .si.cyn{background:#ecfeff;} .si.amb{background:#fffbeb;}
  .si.ros{background:#fff1f2;} .si.vio{background:#f5f3ff;} .si.grn{background:#f0fdf4;}
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
  .cert-box { background: #f0effe; border: 1.5px solid #dddaf0; border-radius: 10px; padding: 1rem; margin-bottom: 0.6rem; }
  .add-btn { padding: 0.42rem 1.1rem; background: #eef2ff; color: #4f46e5; border: 1.5px solid #c7d2fe;
    border-radius: 8px; font-family: inherit; font-size: 0.8rem; font-weight: 700; cursor: pointer; margin-top: 0.65rem; }
  .rm-btn { padding: 0.28rem 0.7rem; background: #fff5f5; color: #ef4444; border: 1.5px solid #fecaca;
    border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; font-family: inherit; }
  .att-split { display: flex; gap: 0.9rem; flex-wrap: wrap; margin-top: 0.85rem; }
  .att-box { flex: 1; min-width: 200px; background: #f0effe; border: 1.5px solid #dddaf0; border-radius: 10px; padding: 0.9rem 1rem; }
  .att-box-lbl { font-size: 0.7rem; font-weight: 700; color: #8b88b0; letter-spacing: 0.55px; text-transform: uppercase; display: block; margin-bottom: 0.5rem; }
  @media (max-width:640px){ .fr{flex-direction:column;} .fi{min-width:100%;} .topbar{flex-direction:column;gap:0.6rem;position:relative;} .att-split{flex-direction:column;} }
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
    { n:4, label:"Review", icon:"✅", path:"/employee/uan" },
  ];
  return (
    <div style={{background:"#fff",borderRadius:14,padding:"1.1rem 0.5rem",marginBottom:"1.6rem",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 6px 28px rgba(30,26,62,0.22), 0 2px 8px rgba(30,26,62,0.12)"}}>
      {steps.map((s, i) => (
        <div key={s.n} style={{display:"flex",alignItems:"center"}}>
          <button onClick={() => onNavigate(s.path)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.3rem",background:"none",border:"none",cursor:"pointer",padding:"0.2rem 0.9rem"}}>
            <div style={{width:40,height:40,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",transition:"all 0.25s",
              background:current===s.n?STEP_COLOR:current>s.n?STEP_DONE_BG:"#f2f1f9",
              border:current===s.n?`2px solid ${STEP_COLOR}`:current>s.n?`2px solid ${STEP_CONN}`:"2px solid #dddaf0",
              boxShadow:current===s.n?`0 4px 12px ${STEP_SHADOW}`:"none"}}>
              {current>s.n?<span style={{color:STEP_DONE_CK,fontWeight:800,fontSize:"0.9rem"}}>✓</span>:<span style={{fontSize:"1rem",filter:current===s.n?"brightness(0) invert(1)":"none"}}>{s.icon}</span>}
            </div>
            <span style={{fontSize:"0.67rem",fontWeight:700,letterSpacing:"0.6px",textTransform:"uppercase",color:current===s.n?STEP_COLOR:current>s.n?STEP_DONE_CK:"#8b88b0"}}>{s.label}</span>
          </button>
          {i < steps.length-1 && <div style={{width:52,height:2,background:current>s.n?STEP_CONN:"#c5d6ea",margin:"0 -0.25rem",marginBottom:"1.4rem",borderRadius:2}}/>}
        </div>
      ))}
    </div>
  );
}

function YesNo({ label, value, onChange }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:"1rem",marginBottom:"1rem",flexWrap:"wrap"}}>
      <span style={{fontSize:"0.875rem",color:"#1a1730",fontWeight:600}}>{label}</span>
      {["Yes","No"].map(v => (
        <button key={v} onClick={() => onChange(v)} style={{padding:"0.32rem 1.1rem",borderRadius:999,border:value===v?"2px solid #4f46e5":"1.5px solid #dddaf0",background:value===v?"#4f46e5":"#f2f1f9",color:value===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.82rem",fontWeight:700,transition:"all 0.18s"}}>{v}</button>
      ))}
    </div>
  );
}

function F({ l, v, s, t="text", r=true, errKey, errors, onFix }) {
  const hasErr = errKey && errors && errors[errKey];
  return (
    <div className="fi">
      <span className="fl">{l}{r&&<span style={{color:"#ef4444",marginLeft:2}}>*</span>}</span>
      <input className={`in${hasErr?" err":""}`} type={t} value={v||""} onChange={e=>{s(e.target.value);if(onFix&&hasErr)onFix(errKey);}} />
      {hasErr && <span className="err-msg">Required</span>}
    </div>
  );
}
function FS({ l, v, s, o, r=true, errKey, errors, onFix }) {
  const hasErr = errKey && errors && errors[errKey];
  return (
    <div className="fi">
      <span className="fl">{l}{r&&<span style={{color:"#ef4444",marginLeft:2}}>*</span>}</span>
      <select className={`in${hasErr?" err":""}`} value={v} onChange={e=>{s(e.target.value);if(onFix&&hasErr)onFix(errKey);}} style={{background:v?"#fff":"#f2f1f9",color:v?"#1a1730":"#8b88b0"}}>
        <option value="">Select</option>
        {o.map(x=><option key={x} value={x}>{x}</option>)}
      </select>
      {hasErr && <span className="err-msg">Required</span>}
    </div>
  );
}

export default function EducationDetails() {
  const router = useRouter();
  const { user, apiFetch, logout, ready } = useAuth();
  const [showSignout,setShowSignout] = useState(false);
  const [saveStatus,setSaveStatus]   = useState("");
  const [loading,setLoading]         = useState(true);
  const [serverDraft,setServerDraft] = useState(null);
  const [errors,setErrors]           = useState({});
  const isDirtyRef = useRef(false);
  const d = (fn) => (val) => { fn(val); isDirtyRef.current = true; };
  const fixErr = (key) => setErrors(p => ({ ...p, [key]: false }));

  const [hasPG,setHasPG]=useState(""); const [hasDip,setHasDip]=useState(""); const [hasCerts,setHasCerts]=useState("");
  const [xSchool,setXSchool]=useState(""); const [xBoard,setXBoard]=useState(""); const [xHall,setXHall]=useState("");
  const [xFrom,setXFrom]=useState(""); const [xTo,setXTo]=useState(""); const [xAddress,setXAddress]=useState("");
  const [xYear,setXYear]=useState(""); const [xResultType,setXResultType]=useState(""); const [xResultValue,setXResultValue]=useState(""); const [xMedium,setXMedium]=useState(""); const [xCertKey,setXCertKey]=useState("");
  const [iCollege,setICollege]=useState(""); const [iBoard,setIBoard]=useState(""); const [iHall,setIHall]=useState("");
  const [iFrom,setIFrom]=useState(""); const [iTo,setITo]=useState(""); const [iAddress,setIAddress]=useState(""); const [iMode,setIMode]=useState("");
  const [iYear,setIYear]=useState(""); const [iResultType,setIResultType]=useState(""); const [iResultValue,setIResultValue]=useState(""); const [iMedium,setIMedium]=useState(""); const [iCertKey,setICertKey]=useState("");
  const [ugCollege,setUgCollege]=useState(""); const [ugUniversity,setUgUniversity]=useState(""); const [ugCourse,setUgCourse]=useState("");
  const [ugHall,setUgHall]=useState(""); const [ugFrom,setUgFrom]=useState(""); const [ugTo,setUgTo]=useState(""); const [ugAddress,setUgAddress]=useState(""); const [ugMode,setUgMode]=useState("");
  const [ugYear,setUgYear]=useState(""); const [ugResultType,setUgResultType]=useState(""); const [ugResultValue,setUgResultValue]=useState(""); const [ugBacklogs,setUgBacklogs]=useState(""); const [ugMedium,setUgMedium]=useState("");
  const [ugProvKey,setUgProvKey]=useState(""); const [ugConvoKey,setUgConvoKey]=useState("");
  const [pgCollege,setPgCollege]=useState(""); const [pgUniversity,setPgUniversity]=useState(""); const [pgCourse,setPgCourse]=useState("");
  const [pgHall,setPgHall]=useState(""); const [pgFrom,setPgFrom]=useState(""); const [pgTo,setPgTo]=useState(""); const [pgAddress,setPgAddress]=useState(""); const [pgMode,setPgMode]=useState("");
  const [pgYear,setPgYear]=useState(""); const [pgResultType,setPgResultType]=useState(""); const [pgResultValue,setPgResultValue]=useState(""); const [pgBacklogs,setPgBacklogs]=useState(""); const [pgMedium,setPgMedium]=useState("");
  const [pgProvKey,setPgProvKey]=useState(""); const [pgConvoKey,setPgConvoKey]=useState("");
  const [dipInstitute,setDipInstitute]=useState(""); const [dipBoard,setDipBoard]=useState(""); const [dipCourse,setDipCourse]=useState("");
  const [dipFrom,setDipFrom]=useState(""); const [dipTo,setDipTo]=useState(""); const [dipYear,setDipYear]=useState("");
  const [dipResultType,setDipResultType]=useState(""); const [dipResultValue,setDipResultValue]=useState(""); const [dipMode,setDipMode]=useState(""); const [dipCertKey,setDipCertKey]=useState("");
  const [certs,setCerts]=useState([{name:"",certKey:""}]);

  useEffect(() => { if (!ready) return; if (!user) { router.replace("/employee/login"); return; } }, [ready, user, router]);

  useEffect(() => {
    if (!ready || !user) return;
    const fetchDraft = async () => {
      try {
        const res = await apiFetch(`${API}/employee/draft`);
        if (res.ok) {
          const dr = await res.json(); setServerDraft(dr);
          const edu = dr.education || {}; const x=edu.classX||{}; const i=edu.intermediate||{}; const ug=edu.undergraduate||{};
          const pg=edu.postgraduate||{}; const dip=edu.diploma||{}; const certsData=edu.certifications||[];
          if(x.school)setXSchool(x.school); if(x.board)setXBoard(x.board); if(x.hallTicket)setXHall(x.hallTicket);
          if(x.from)setXFrom(x.from); if(x.to)setXTo(x.to); if(x.address)setXAddress(x.address);
          if(x.yearOfPassing)setXYear(x.yearOfPassing); if(x.resultType)setXResultType(x.resultType); if(x.resultValue)setXResultValue(x.resultValue); if(x.medium)setXMedium(x.medium); if(x.certKey)setXCertKey(x.certKey);
          if(i.college)setICollege(i.college); if(i.board)setIBoard(i.board); if(i.hallTicket)setIHall(i.hallTicket);
          if(i.from)setIFrom(i.from); if(i.to)setITo(i.to); if(i.address)setIAddress(i.address); if(i.mode)setIMode(i.mode);
          if(i.yearOfPassing)setIYear(i.yearOfPassing); if(i.resultType)setIResultType(i.resultType); if(i.resultValue)setIResultValue(i.resultValue); if(i.medium)setIMedium(i.medium); if(i.certKey)setICertKey(i.certKey);
          if(ug.college)setUgCollege(ug.college); if(ug.university)setUgUniversity(ug.university); if(ug.course)setUgCourse(ug.course);
          if(ug.hallTicket)setUgHall(ug.hallTicket); if(ug.from)setUgFrom(ug.from); if(ug.to)setUgTo(ug.to); if(ug.address)setUgAddress(ug.address); if(ug.mode)setUgMode(ug.mode);
          if(ug.yearOfPassing)setUgYear(ug.yearOfPassing); if(ug.resultType)setUgResultType(ug.resultType); if(ug.resultValue)setUgResultValue(ug.resultValue); if(ug.backlogs)setUgBacklogs(ug.backlogs); if(ug.medium)setUgMedium(ug.medium);
          if(ug.provKey)setUgProvKey(ug.provKey); if(ug.convoKey)setUgConvoKey(ug.convoKey); if(!ug.provKey&&ug.certKey)setUgProvKey(ug.certKey);
          if(pg.college){setHasPG("Yes");setPgCollege(pg.college);} if(pg.university)setPgUniversity(pg.university); if(pg.course)setPgCourse(pg.course);
          if(pg.hallTicket)setPgHall(pg.hallTicket); if(pg.from)setPgFrom(pg.from); if(pg.to)setPgTo(pg.to); if(pg.address)setPgAddress(pg.address); if(pg.mode)setPgMode(pg.mode);
          if(pg.yearOfPassing)setPgYear(pg.yearOfPassing); if(pg.resultType)setPgResultType(pg.resultType); if(pg.resultValue)setPgResultValue(pg.resultValue); if(pg.backlogs)setPgBacklogs(pg.backlogs); if(pg.medium)setPgMedium(pg.medium);
          if(pg.provKey)setPgProvKey(pg.provKey); if(pg.convoKey)setPgConvoKey(pg.convoKey); if(!pg.provKey&&pg.certKey)setPgProvKey(pg.certKey);
          if(dip.institute){setHasDip("Yes");setDipInstitute(dip.institute);} if(dip.board)setDipBoard(dip.board); if(dip.course)setDipCourse(dip.course);
          if(dip.from)setDipFrom(dip.from); if(dip.to)setDipTo(dip.to); if(dip.yearOfPassing)setDipYear(dip.yearOfPassing);
          if(dip.resultType)setDipResultType(dip.resultType); if(dip.resultValue)setDipResultValue(dip.resultValue); if(dip.mode)setDipMode(dip.mode); if(dip.certKey)setDipCertKey(dip.certKey);
          if(certsData.length>0){setHasCerts("Yes");setCerts(certsData.map(c=>({name:typeof c.name==="string"?c.name:"",certKey:typeof c.certKey==="string"?c.certKey:""})));}
        }
      } catch(_) {}
      setLoading(false);
    };
    fetchDraft();
  }, [ready, user, apiFetch]);

  const validate = () => {
    const e = {};
    if(!xSchool)e.xSchool=true; if(!xBoard)e.xBoard=true; if(!xHall)e.xHall=true;
    if(!xFrom)e.xFrom=true; if(!xTo)e.xTo=true; if(!xYear)e.xYear=true; if(!xAddress)e.xAddress=true;
    if(!xResultType)e.xResultType=true; if(!xResultValue)e.xResultValue=true; if(!xMedium)e.xMedium=true; if(!xCertKey)e.xCertKey=true;
    if(!iCollege)e.iCollege=true; if(!iBoard)e.iBoard=true; if(!iHall)e.iHall=true;
    if(!iFrom)e.iFrom=true; if(!iTo)e.iTo=true; if(!iYear)e.iYear=true; if(!iAddress)e.iAddress=true;
    if(!iMode)e.iMode=true; if(!iResultType)e.iResultType=true; if(!iResultValue)e.iResultValue=true; if(!iMedium)e.iMedium=true; if(!iCertKey)e.iCertKey=true;
    if(!ugCollege)e.ugCollege=true; if(!ugUniversity)e.ugUniversity=true; if(!ugCourse)e.ugCourse=true; if(!ugHall)e.ugHall=true;
    if(!ugFrom)e.ugFrom=true; if(!ugTo)e.ugTo=true; if(!ugYear)e.ugYear=true; if(!ugAddress)e.ugAddress=true;
    if(!ugMode)e.ugMode=true; if(!ugResultType)e.ugResultType=true; if(!ugResultValue)e.ugResultValue=true; if(!ugMedium)e.ugMedium=true; if(!ugBacklogs)e.ugBacklogs=true; if(ugBacklogs!=="Yes"&&!ugProvKey)e.ugProvKey=true;
    if(hasPG==="Yes"){ if(!pgCollege)e.pgCollege=true; if(!pgUniversity)e.pgUniversity=true; if(!pgCourse)e.pgCourse=true; if(!pgHall)e.pgHall=true; if(!pgFrom)e.pgFrom=true; if(!pgTo)e.pgTo=true; if(!pgYear)e.pgYear=true; if(!pgAddress)e.pgAddress=true; if(!pgMode)e.pgMode=true; if(!pgResultType)e.pgResultType=true; if(!pgResultValue)e.pgResultValue=true; if(!pgMedium)e.pgMedium=true; if(!pgBacklogs)e.pgBacklogs=true; if(pgBacklogs!=="Yes"&&!pgProvKey)e.pgProvKey=true; }
    if(hasDip==="Yes"){ if(!dipInstitute)e.dipInstitute=true; if(!dipBoard)e.dipBoard=true; if(!dipCourse)e.dipCourse=true; if(!dipFrom)e.dipFrom=true; if(!dipTo)e.dipTo=true; if(!dipYear)e.dipYear=true; if(!dipResultType)e.dipResultType=true; if(!dipResultValue)e.dipResultValue=true; if(!dipMode)e.dipMode=true; if(!dipCertKey)e.dipCertKey=true; }
    if(hasCerts==="Yes"){ certs.forEach((c,idx)=>{ if(!c.name)e[`cert_name_${idx}`]=true; if(!c.certKey)e[`cert_key_${idx}`]=true; }); }
    return e;
  };

  const buildEducation = () => ({
    classX:{school:xSchool,board:xBoard,hallTicket:xHall,from:xFrom,to:xTo,address:xAddress,yearOfPassing:xYear,resultType:xResultType,resultValue:xResultValue,medium:xMedium,certKey:xCertKey},
    intermediate:{college:iCollege,board:iBoard,hallTicket:iHall,from:iFrom,to:iTo,address:iAddress,mode:iMode,yearOfPassing:iYear,resultType:iResultType,resultValue:iResultValue,medium:iMedium,certKey:iCertKey},
    undergraduate:{college:ugCollege,university:ugUniversity,course:ugCourse,hallTicket:ugHall,from:ugFrom,to:ugTo,address:ugAddress,mode:ugMode,yearOfPassing:ugYear,resultType:ugResultType,resultValue:ugResultValue,backlogs:ugBacklogs,medium:ugMedium,provKey:ugProvKey,convoKey:ugConvoKey},
    postgraduate:hasPG==="Yes"?{college:pgCollege,university:pgUniversity,course:pgCourse,hallTicket:pgHall,from:pgFrom,to:pgTo,address:pgAddress,mode:pgMode,yearOfPassing:pgYear,resultType:pgResultType,resultValue:pgResultValue,backlogs:pgBacklogs,medium:pgMedium,provKey:pgProvKey,convoKey:pgConvoKey}:{},
    diploma:hasDip==="Yes"?{institute:dipInstitute,board:dipBoard,course:dipCourse,from:dipFrom,to:dipTo,yearOfPassing:dipYear,resultType:dipResultType,resultValue:dipResultValue,mode:dipMode,certKey:dipCertKey}:{},
    certifications:hasCerts==="Yes"?certs:[],
  });

  const saveDraft = async () => {
    if(!serverDraft||!serverDraft.employee_id) throw new Error("Please complete and save Page 1 first");
    const dr=serverDraft;
    const res=await apiFetch(`${API}/employee`,{method:"POST",body:JSON.stringify({
      employee_id:dr.employee_id,status:dr.status||"draft",
      firstName:dr.firstName||"",lastName:dr.lastName||"",middleName:dr.middleName,
      fatherName:dr.fatherName,fatherFirst:dr.fatherFirst,fatherMiddle:dr.fatherMiddle,fatherLast:dr.fatherLast,
      dob:dr.dob,gender:dr.gender,nationality:dr.nationality,mobile:dr.mobile||"",email:dr.email,
      aadhaar:dr.aadhaar,pan:dr.pan,passport:dr.passport,aadhaarKey:dr.aadhaarKey,panKey:dr.panKey,
      currentAddress:dr.currentAddress,permanentAddress:dr.permanentAddress,
      uanNumber:dr.uanNumber,nameAsPerUan:dr.nameAsPerUan,mobileLinked:dr.mobileLinked,isActive:dr.isActive,pfRecords:dr.pfRecords,
      acknowledgements_profile:dr.acknowledgements_profile,education:buildEducation(),
    })});
    if(!res.ok) throw new Error(parseError(await res.json().catch(()=>({}))));
    setServerDraft({...dr,education:buildEducation()}); isDirtyRef.current=false;
  };

  const handleNavigate = async(path)=>{if(isDirtyRef.current){try{await saveDraft();}catch(_){}}router.push(path);};
  const handlePrevious = async()=>{if(isDirtyRef.current){try{await saveDraft();}catch(_){}}router.push("/employee/personal");};
  const handleSignout  = async()=>{if(isDirtyRef.current){try{await saveDraft();}catch(_){}}logout();};

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setSaveStatus("Please fill all required fields ↑");
      setTimeout(() => { const el = document.querySelector(".in.err"); if(el) el.scrollIntoView({behavior:"smooth",block:"center"}); }, 60);
      return;
    }
    setErrors({}); setSaveStatus("Saving...");
    try { await saveDraft(); setSaveStatus("Saved ✓"); router.push("/employee/previous"); }
    catch(err) { setSaveStatus(`Error: ${err.message||"Could not save"}`); }
  };

  if(!ready||!user) return null;
  if(loading) return (<div style={{minHeight:"100vh",background:"#cdd2ed",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"#8b88b0",fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:500}}>Loading education details…</p></div>);

  const UL = ({lbl,required=true,errKey:ek}) => (<>
    <span className="fl" style={{display:"block",marginBottom:"0.28rem"}}>{lbl}{required&&<span style={{color:"#ef4444",marginLeft:2}}>*</span>}</span>
    {ek&&errors[ek]&&<span className="err-msg" style={{marginBottom:"0.3rem"}}>Upload is required</span>}
  </>);

  return (
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
          <StepNav current={2} onNavigate={handleNavigate}/>

          {/* Class X */}
          <div className="sc ind">
            <div className="sh"><div className="si ind">📚</div><span className="st">Class X — SSC / Matriculation</span></div>
            <div className="fr"><F l="School Name" v={xSchool} s={d(setXSchool)} errKey="xSchool" errors={errors} onFix={fixErr}/><F l="Board Name" v={xBoard} s={d(setXBoard)} errKey="xBoard" errors={errors} onFix={fixErr}/><F l="Hall Ticket / Roll No." v={xHall} s={d(setXHall)} errKey="xHall" errors={errors} onFix={fixErr}/></div>
            <div className="fr"><F l="From" v={xFrom} s={d(setXFrom)} t="date" errKey="xFrom" errors={errors} onFix={fixErr}/><F l="To" v={xTo} s={d(setXTo)} t="date" errKey="xTo" errors={errors} onFix={fixErr}/><F l="Year of Passing" v={xYear} s={d(setXYear)} errKey="xYear" errors={errors} onFix={fixErr}/></div>
            <div className="fr"><F l="School Address" v={xAddress} s={d(setXAddress)} errKey="xAddress" errors={errors} onFix={fixErr}/></div>
            <div className="fr"><FS l="Result Type" v={xResultType} s={d(setXResultType)} o={["Percentage","Grade"]} errKey="xResultType" errors={errors} onFix={fixErr}/><F l="Result Value" v={xResultValue} s={d(setXResultValue)} errKey="xResultValue" errors={errors} onFix={fixErr}/><F l="Medium of Study" v={xMedium} s={d(setXMedium)} errKey="xMedium" errors={errors} onFix={fixErr}/></div>
            <div style={{marginTop:"0.7rem"}}><UL lbl="Upload Class X Certificate" errKey="xCertKey"/><FileUpload label="Upload Class X Certificate" category="education" subKey="classX" apiFetch={apiFetch} value={xCertKey} onChange={(k)=>{setXCertKey(k);isDirtyRef.current=true;fixErr("xCertKey");}}/></div>
          </div>

          {/* Intermediate */}
          <div className="sc cyn">
            <div className="sh"><div className="si cyn">🏫</div><span className="st">Intermediate — HSC / 12th</span></div>
            <div className="fr"><F l="College Name" v={iCollege} s={d(setICollege)} errKey="iCollege" errors={errors} onFix={fixErr}/><F l="Board Name" v={iBoard} s={d(setIBoard)} errKey="iBoard" errors={errors} onFix={fixErr}/><F l="Hall Ticket / Roll No." v={iHall} s={d(setIHall)} errKey="iHall" errors={errors} onFix={fixErr}/></div>
            <div className="fr"><F l="From" v={iFrom} s={d(setIFrom)} t="date" errKey="iFrom" errors={errors} onFix={fixErr}/><F l="To" v={iTo} s={d(setITo)} t="date" errKey="iTo" errors={errors} onFix={fixErr}/><F l="Year of Passing" v={iYear} s={d(setIYear)} errKey="iYear" errors={errors} onFix={fixErr}/></div>
            <div className="fr"><F l="College Address" v={iAddress} s={d(setIAddress)} errKey="iAddress" errors={errors} onFix={fixErr}/></div>
            <div className="fr"><FS l="Mode" v={iMode} s={d(setIMode)} o={["Full-time","Part-time","Distance"]} errKey="iMode" errors={errors} onFix={fixErr}/><FS l="Result Type" v={iResultType} s={d(setIResultType)} o={["Percentage","Grade"]} errKey="iResultType" errors={errors} onFix={fixErr}/><F l="Result Value" v={iResultValue} s={d(setIResultValue)} errKey="iResultValue" errors={errors} onFix={fixErr}/></div>
            <div className="fr"><F l="Medium of Study" v={iMedium} s={d(setIMedium)} errKey="iMedium" errors={errors} onFix={fixErr}/></div>
            <div style={{marginTop:"0.7rem"}}><UL lbl="Upload Intermediate Certificate" errKey="iCertKey"/><FileUpload label="Upload Intermediate Certificate" category="education" subKey="intermediate" apiFetch={apiFetch} value={iCertKey} onChange={(k)=>{setICertKey(k);isDirtyRef.current=true;fixErr("iCertKey");}}/></div>
          </div>

          {/* UG */}
          <div className="sc amb">
            <div className="sh"><div className="si amb">🎓</div><span className="st">Undergraduate — UG / Degree</span></div>
            <div className="fr"><F l="College Name" v={ugCollege} s={d(setUgCollege)} errKey="ugCollege" errors={errors} onFix={fixErr}/><F l="University Name" v={ugUniversity} s={d(setUgUniversity)} errKey="ugUniversity" errors={errors} onFix={fixErr}/><F l="Course / Degree" v={ugCourse} s={d(setUgCourse)} errKey="ugCourse" errors={errors} onFix={fixErr}/></div>
            <div className="fr"><F l="Hall Ticket / Roll No." v={ugHall} s={d(setUgHall)} errKey="ugHall" errors={errors} onFix={fixErr}/><FS l="Mode" v={ugMode} s={d(setUgMode)} o={["Full-time","Part-time","Distance"]} errKey="ugMode" errors={errors} onFix={fixErr}/></div>
            <div className="fr"><F l="From" v={ugFrom} s={d(setUgFrom)} t="date" errKey="ugFrom" errors={errors} onFix={fixErr}/><F l="To" v={ugTo} s={d(setUgTo)} t="date" errKey="ugTo" errors={errors} onFix={fixErr}/><F l="Year of Passing" v={ugYear} s={d(setUgYear)} errKey="ugYear" errors={errors} onFix={fixErr}/></div>
            <div className="fr"><F l="College Address" v={ugAddress} s={d(setUgAddress)} errKey="ugAddress" errors={errors} onFix={fixErr}/></div>
            <div className="fr"><FS l="Result Type" v={ugResultType} s={d(setUgResultType)} o={["Percentage","CGPA","Grade"]} errKey="ugResultType" errors={errors} onFix={fixErr}/><F l="Result Value" v={ugResultValue} s={d(setUgResultValue)} errKey="ugResultValue" errors={errors} onFix={fixErr}/><F l="Medium of Study" v={ugMedium} s={d(setUgMedium)} errKey="ugMedium" errors={errors} onFix={fixErr}/></div>
            <div className="fr"><FS l="Any Active Backlogs?" v={ugBacklogs} s={d(setUgBacklogs)} o={["No","Yes"]} errKey="ugBacklogs" errors={errors} onFix={fixErr}/></div>
            <div className="att-split">
              <div className="att-box">
                <UL lbl="Provisional Marksheet" required={ugBacklogs!=="Yes"} errKey="ugProvKey"/>
                {ugBacklogs==="Yes"&&<p style={{fontSize:"0.7rem",color:"#d97706",fontWeight:600,marginBottom:"0.4rem"}}>⚠️ Upload when available after clearing backlogs</p>}
                <FileUpload label="Upload Provisional Marksheet" category="education" subKey="ug_provisional" apiFetch={apiFetch} value={ugProvKey} onChange={(k)=>{setUgProvKey(k);isDirtyRef.current=true;fixErr("ugProvKey");}}/>
              </div>
              <div className="att-box"><span className="att-box-lbl">Convocation Certificate</span><FileUpload label="Upload Convocation Certificate" category="education" subKey="ug_convocation" apiFetch={apiFetch} value={ugConvoKey} onChange={(k)=>{setUgConvoKey(k);isDirtyRef.current=true;}}/></div>
            </div>
          </div>

          {/* PG */}
          <div className="sc vio">
            <div className="sh"><div className="si vio">🧑‍🎓</div><span className="st">Postgraduate — PG / Masters</span></div>
            <YesNo label="Do you have a Postgraduate degree?" value={hasPG} onChange={(v)=>{setHasPG(v);isDirtyRef.current=true;}}/>
            {hasPG==="Yes"&&(<>
              <div className="fr"><F l="College Name" v={pgCollege} s={d(setPgCollege)} errKey="pgCollege" errors={errors} onFix={fixErr}/><F l="University Name" v={pgUniversity} s={d(setPgUniversity)} errKey="pgUniversity" errors={errors} onFix={fixErr}/><F l="Course / Degree" v={pgCourse} s={d(setPgCourse)} errKey="pgCourse" errors={errors} onFix={fixErr}/></div>
              <div className="fr"><F l="Hall Ticket / Roll No." v={pgHall} s={d(setPgHall)} errKey="pgHall" errors={errors} onFix={fixErr}/><FS l="Mode" v={pgMode} s={d(setPgMode)} o={["Full-time","Part-time","Distance"]} errKey="pgMode" errors={errors} onFix={fixErr}/></div>
              <div className="fr"><F l="From" v={pgFrom} s={d(setPgFrom)} t="date" errKey="pgFrom" errors={errors} onFix={fixErr}/><F l="To" v={pgTo} s={d(setPgTo)} t="date" errKey="pgTo" errors={errors} onFix={fixErr}/><F l="Year of Passing" v={pgYear} s={d(setPgYear)} errKey="pgYear" errors={errors} onFix={fixErr}/></div>
              <div className="fr"><F l="College Address" v={pgAddress} s={d(setPgAddress)} errKey="pgAddress" errors={errors} onFix={fixErr}/></div>
              <div className="fr"><FS l="Result Type" v={pgResultType} s={d(setPgResultType)} o={["Percentage","CGPA","Grade"]} errKey="pgResultType" errors={errors} onFix={fixErr}/><F l="Result Value" v={pgResultValue} s={d(setPgResultValue)} errKey="pgResultValue" errors={errors} onFix={fixErr}/><F l="Medium of Study" v={pgMedium} s={d(setPgMedium)} errKey="pgMedium" errors={errors} onFix={fixErr}/></div>
              <div className="fr"><FS l="Any Active Backlogs?" v={pgBacklogs} s={d(setPgBacklogs)} o={["No","Yes"]} errKey="pgBacklogs" errors={errors} onFix={fixErr}/></div>
              <div className="att-split">
                <div className="att-box">
                  <UL lbl="Provisional Marksheet" required={pgBacklogs!=="Yes"} errKey="pgProvKey"/>
                  {pgBacklogs==="Yes"&&<p style={{fontSize:"0.7rem",color:"#d97706",fontWeight:600,marginBottom:"0.4rem"}}>⚠️ Upload when available after clearing backlogs</p>}
                  <FileUpload label="Upload Provisional Marksheet" category="education" subKey="pg_provisional" apiFetch={apiFetch} value={pgProvKey} onChange={(k)=>{setPgProvKey(k);isDirtyRef.current=true;fixErr("pgProvKey");}}/>
                </div>
                <div className="att-box"><span className="att-box-lbl">Convocation Certificate</span><FileUpload label="Upload Convocation Certificate" category="education" subKey="pg_convocation" apiFetch={apiFetch} value={pgConvoKey} onChange={(k)=>{setPgConvoKey(k);isDirtyRef.current=true;}}/></div>
              </div>
            </>)}
          </div>

          {/* Diploma */}
          <div className="sc grn">
            <div className="sh"><div className="si grn">🔧</div><span className="st">Diploma / Technical / Vocational Studies</span></div>
            <YesNo label="Do you have a Diploma or Technical qualification?" value={hasDip} onChange={(v)=>{setHasDip(v);isDirtyRef.current=true;}}/>
            {hasDip==="Yes"&&(<>
              <div className="fr"><F l="Institute Name" v={dipInstitute} s={d(setDipInstitute)} errKey="dipInstitute" errors={errors} onFix={fixErr}/><F l="Board / University" v={dipBoard} s={d(setDipBoard)} errKey="dipBoard" errors={errors} onFix={fixErr}/><F l="Course / Programme" v={dipCourse} s={d(setDipCourse)} errKey="dipCourse" errors={errors} onFix={fixErr}/></div>
              <div className="fr"><F l="From" v={dipFrom} s={d(setDipFrom)} t="date" errKey="dipFrom" errors={errors} onFix={fixErr}/><F l="To" v={dipTo} s={d(setDipTo)} t="date" errKey="dipTo" errors={errors} onFix={fixErr}/><F l="Year of Passing" v={dipYear} s={d(setDipYear)} errKey="dipYear" errors={errors} onFix={fixErr}/></div>
              <div className="fr"><FS l="Mode" v={dipMode} s={d(setDipMode)} o={["Full-time","Part-time","Distance"]} errKey="dipMode" errors={errors} onFix={fixErr}/><FS l="Result Type" v={dipResultType} s={d(setDipResultType)} o={["Percentage","CGPA","Grade"]} errKey="dipResultType" errors={errors} onFix={fixErr}/><F l="Result Value" v={dipResultValue} s={d(setDipResultValue)} errKey="dipResultValue" errors={errors} onFix={fixErr}/></div>
              <div style={{marginTop:"0.7rem"}}><UL lbl="Upload Diploma / Technical Certificate" errKey="dipCertKey"/><FileUpload label="Upload Diploma Certificate" category="education" subKey="diploma" apiFetch={apiFetch} value={dipCertKey} onChange={(k)=>{setDipCertKey(k);isDirtyRef.current=true;fixErr("dipCertKey");}}/></div>
            </>)}
          </div>

          {/* Certifications */}
          <div className="sc ros">
            <div className="sh"><div className="si ros">🏅</div><span className="st">Professional Certifications</span></div>
            <YesNo label="Do you have certifications? (AWS, Azure, PMP, etc.)" value={hasCerts} onChange={(v)=>{setHasCerts(v);isDirtyRef.current=true;}}/>
            {hasCerts==="Yes"&&(<>
              {certs.map((cert,idx)=>(
                <div key={idx} className="cert-box">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.6rem"}}>
                    <span style={{fontSize:"0.78rem",color:"#8b88b0",fontWeight:700}}>Certification {idx+1}</span>
                    {idx>0&&<button className="rm-btn" onClick={()=>{const c=[...certs];c.splice(idx,1);setCerts(c);isDirtyRef.current=true;}}>− Remove</button>}
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
                    <FileUpload label="Upload Certificate" category="education" subKey={`cert_${idx}`} apiFetch={apiFetch} value={typeof cert.certKey==="string"?cert.certKey:""} onChange={(k)=>{const c=[...certs];c[idx]={...c[idx],certKey:typeof k==="string"?k:""};setCerts(c);isDirtyRef.current=true;fixErr(`cert_key_${idx}`);}}/>
                  </div>
                </div>
              ))}
              <button className="add-btn" onClick={()=>{setCerts([...certs,{name:"",certKey:""}]);isDirtyRef.current=true;}}>+ Add Another Certification</button>
            </>)}
          </div>

          <div className="sbar">
            <button className="sbtn" onClick={handlePrevious}>← Previous</button>
            <span className={`ss${saveStatus==="Saved ✓"?" ok":saveStatus.startsWith("Error")||saveStatus.includes("required")?" err":""}`}>{saveStatus}</span>
            <button className="pbtn" onClick={handleSave}>Save & Continue →</button>
          </div>
        </div>
      </div>
    </>
  );
}
