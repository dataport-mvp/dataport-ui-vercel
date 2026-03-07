// pages/employee/education.js  — Page 2 of 4
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";
import FileUpload from "../../components/FileUpload";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f0eff9; font-family: 'Plus Jakarta Sans', sans-serif; }
  .pg { min-height: 100vh; background: #f0eff9; padding-bottom: 3rem; }
  .wrap { max-width: 860px; margin: auto; padding: 0 1.25rem; }
  .topbar { background: #fff; border-bottom: 1px solid #e8e5f0; padding: 0.85rem 1.75rem;
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 1.75rem; position: sticky; top: 0; z-index: 50;
    box-shadow: 0 2px 8px rgba(79,70,229,0.06); }
  .logo-text { font-size: 1.3rem; font-weight: 800; color: #4f46e5; letter-spacing: -0.5px; }
  .user-pill { display: flex; align-items: center; gap: 0.75rem; }
  .user-name { font-size: 0.84rem; color: #64748b; font-weight: 500; }
  .signout-btn { padding: 0.38rem 1rem; border: 1.5px solid #e2e8f0; border-radius: 8px;
    background: #fff; color: #64748b; font-size: 0.82rem; cursor: pointer;
    font-weight: 600; font-family: inherit; transition: all 0.2s; }
  .signout-btn:hover { border-color: #fca5a5; color: #ef4444; background: #fff8f8; }
  .sc { background: #fff; border-radius: 14px; padding: 1.5rem 1.6rem;
    margin-bottom: 1.1rem; box-shadow: 0 1px 8px rgba(79,70,229,0.07), 0 0 0 1px #f0eef8;
    position: relative; overflow: hidden; }
  .sc::before { content: ''; position: absolute; top: 0; left: 0; bottom: 0;
    width: 4px; border-radius: 14px 0 0 14px; }
  .sc.ind::before { background: #4f46e5; }
  .sc.cyn::before { background: #0891b2; }
  .sc.amb::before { background: #d97706; }
  .sc.ros::before { background: #e11d48; }
  .sc.vio::before { background: #7c3aed; }
  .sc.grn::before { background: #16a34a; }
  .sh { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.15rem; }
  .si { width: 32px; height: 32px; border-radius: 8px; display: flex;
    align-items: center; justify-content: center; font-size: 0.95rem; flex-shrink: 0; }
  .si.ind{background:#eef2ff;} .si.cyn{background:#ecfeff;} .si.amb{background:#fffbeb;}
  .si.ros{background:#fff1f2;} .si.vio{background:#f5f3ff;} .si.grn{background:#f0fdf4;}
  .st { font-size: 0.93rem; font-weight: 700; color: #1e293b; }
  .fr { display: flex; gap: 0.9rem; flex-wrap: wrap; margin-bottom: 0.85rem; }
  .fr:last-child { margin-bottom: 0; }
  .fi { display: flex; flex-direction: column; gap: 0.28rem; flex: 1; min-width: 138px; }
  .fl { font-size: 0.7rem; font-weight: 700; color: #64748b; letter-spacing: 0.55px; text-transform: uppercase; }
  .in { padding: 0.65rem 0.875rem; background: #f8f9fc; border: 1.5px solid #e4e2ed;
    border-radius: 9px; font-family: inherit; font-size: 0.875rem; color: #1e293b;
    outline: none; width: 100%; transition: all 0.18s; }
  .in:focus { border-color: #4f46e5; background: #fff; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
  .sbar { display: flex; justify-content: space-between; align-items: center;
    margin-top: 1.5rem; padding: 1rem 1.5rem; background: #fff;
    border-radius: 12px; box-shadow: 0 1px 8px rgba(79,70,229,0.07), 0 0 0 1px #f0eef8; }
  .ss { font-size: 0.84rem; color: #94a3b8; font-weight: 500; }
  .ss.ok{color:#16a34a;} .ss.err{color:#ef4444;}
  .pbtn { padding: 0.72rem 1.9rem; background: #4f46e5; color: #fff; border: none;
    border-radius: 10px; font-family: inherit; font-size: 0.875rem; font-weight: 700;
    cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(79,70,229,0.28); }
  .pbtn:hover { background: #4338ca; transform: translateY(-1px); }
  .sbtn { padding: 0.72rem 1.5rem; background: #fff; color: #475569; border: 1.5px solid #e4e2ed;
    border-radius: 10px; font-family: inherit; font-size: 0.875rem; font-weight: 600; cursor: pointer; }
  .sbtn:hover { background: #f5f4f0; }
  .cert-box { background: #f8f9fc; border: 1.5px solid #e4e2ed; border-radius: 10px; padding: 1rem; margin-bottom: 0.6rem; }
  .add-btn { padding: 0.42rem 1.1rem; background: #eef2ff; color: #4f46e5; border: 1.5px solid #c7d2fe;
    border-radius: 8px; font-family: inherit; font-size: 0.8rem; font-weight: 700; cursor: pointer; margin-top: 0.65rem; }
  .rm-btn { padding: 0.28rem 0.7rem; background: #fff5f5; color: #ef4444; border: 1.5px solid #fecaca;
    border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; font-family: inherit; }
  @media (max-width:640px){ .fr{flex-direction:column;} .fi{min-width:100%;} .topbar{flex-direction:column;gap:0.6rem;position:relative;} }
`;

function SignoutModal({onConfirm,onCancel}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.35)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(3px)"}}>
      <div style={{background:"#fff",borderRadius:16,padding:"2rem",maxWidth:340,width:"90%",textAlign:"center",boxShadow:"0 20px 60px rgba(79,70,229,0.15)",border:"1px solid #e8e5f0"}}>
        <div style={{fontSize:34,marginBottom:"0.75rem"}}>👋</div>
        <h3 style={{margin:"0 0 0.4rem",color:"#1e293b",fontWeight:800,fontSize:"1.05rem"}}>Sign out?</h3>
        <p style={{color:"#64748b",fontSize:"0.875rem",marginBottom:"1.5rem",lineHeight:1.55}}>Your progress is saved. You can continue anytime.</p>
        <div style={{display:"flex",gap:"0.75rem"}}>
          <button onClick={onCancel} style={{flex:1,padding:"0.7rem",borderRadius:9,border:"1.5px solid #e4e2ed",background:"#f8f9fc",cursor:"pointer",fontWeight:600,color:"#475569",fontFamily:"inherit"}}>Stay</button>
          <button onClick={onConfirm} style={{flex:1,padding:"0.7rem",borderRadius:9,border:"none",background:"#ef4444",color:"#fff",cursor:"pointer",fontWeight:700,fontFamily:"inherit"}}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

function StepNav({current,onNavigate}){
  const steps=[
    {n:1,label:"Personal",  icon:"👤",path:"/employee/personal"},
    {n:2,label:"Education", icon:"🎓",path:"/employee/education"},
    {n:3,label:"Employment",icon:"💼",path:"/employee/previous"},
    {n:4,label:"Review",    icon:"✅",path:"/employee/uan"},
  ];
  return(
    <div style={{background:"#fff",borderRadius:14,padding:"1.1rem 0.5rem",marginBottom:"1.6rem",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 1px 8px rgba(79,70,229,0.07)",border:"1px solid #f0eef8"}}>
      {steps.map((s,i)=>(
        <div key={s.n} style={{display:"flex",alignItems:"center"}}>
          <button onClick={()=>onNavigate(s.path)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.3rem",background:"none",border:"none",cursor:"pointer",padding:"0.2rem 0.9rem"}}>
            <div style={{width:40,height:40,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",transition:"all 0.25s",
              background:current===s.n?"#4f46e5":current>s.n?"#eef2ff":"#f8f9fc",
              border:current===s.n?"2px solid #4f46e5":current>s.n?"2px solid #c7d2fe":"2px solid #e4e2ed",
              boxShadow:current===s.n?"0 4px 12px rgba(79,70,229,0.3)":"none"}}>
              {current>s.n?<span style={{color:"#4f46e5",fontWeight:800,fontSize:"0.9rem"}}>✓</span>:<span style={{fontSize:"1rem",filter:current===s.n?"brightness(0) invert(1)":"none"}}>{s.icon}</span>}
            </div>
            <span style={{fontSize:"0.67rem",fontWeight:700,letterSpacing:"0.6px",textTransform:"uppercase",color:current===s.n?"#4f46e5":current>s.n?"#6366f1":"#94a3b8"}}>{s.label}</span>
          </button>
          {i<steps.length-1&&<div style={{width:52,height:2,background:current>s.n?"#c7d2fe":"#e8e5f0",margin:"0 -0.25rem",marginBottom:"1.4rem",borderRadius:2}}/>}
        </div>
      ))}
    </div>
  );
}

function YesNo({label,value,onChange}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:"1rem",marginBottom:"1rem",flexWrap:"wrap"}}>
      <span style={{fontSize:"0.875rem",color:"#475569",fontWeight:600}}>{label}</span>
      {["Yes","No"].map(v=>(
        <button key={v} onClick={()=>onChange(v)} style={{padding:"0.32rem 1.1rem",borderRadius:999,border:value===v?"2px solid #4f46e5":"1.5px solid #e4e2ed",background:value===v?"#4f46e5":"#fff",color:value===v?"#fff":"#64748b",cursor:"pointer",fontSize:"0.82rem",fontWeight:700,transition:"all 0.18s"}}>{v}</button>
      ))}
    </div>
  );
}

function F({l,v,s,t="text",r=true}){
  return(
    <div className="fi">
      <span className="fl">{l}{r&&<span style={{color:"#ef4444",marginLeft:2}}>*</span>}</span>
      <input className="in" type={t} value={v||""} onChange={e=>s(e.target.value)}/>
    </div>
  );
}
function FS({l,v,s,o,r=true}){
  return(
    <div className="fi">
      <span className="fl">{l}{r&&<span style={{color:"#ef4444",marginLeft:2}}>*</span>}</span>
      <select className="in" value={v} onChange={e=>s(e.target.value)} style={{background:"#f8f9fc",color:v?"#1e293b":"#94a3b8"}}>
        <option value="">Select</option>
        {o.map(x=><option key={x} value={x}>{x}</option>)}
      </select>
    </div>
  );
}

export default function EducationDetails(){
  const router=useRouter();
  const {user,apiFetch,logout,ready}=useAuth();
  const [showSignout,setShowSignout]=useState(false);
  const [saveStatus,setSaveStatus]=useState("");
  const [loading,setLoading]=useState(true);
  const [serverDraft,setServerDraft]=useState(null);
  const isDirtyRef=useRef(false);
  const d=(fn)=>(val)=>{fn(val);isDirtyRef.current=true;};

  const [hasPG,setHasPG]=useState(""); const [hasDip,setHasDip]=useState(""); const [hasCerts,setHasCerts]=useState("");
  const [xSchool,setXSchool]=useState(""); const [xBoard,setXBoard]=useState(""); const [xHall,setXHall]=useState("");
  const [xFrom,setXFrom]=useState(""); const [xTo,setXTo]=useState(""); const [xAddress,setXAddress]=useState("");
  const [xYear,setXYear]=useState(""); const [xResultType,setXResultType]=useState(""); const [xResultValue,setXResultValue]=useState(""); const [xMedium,setXMedium]=useState(""); const [xCertKey,setXCertKey]=useState("");
  const [iCollege,setICollege]=useState(""); const [iBoard,setIBoard]=useState(""); const [iHall,setIHall]=useState("");
  const [iFrom,setIFrom]=useState(""); const [iTo,setITo]=useState(""); const [iAddress,setIAddress]=useState(""); const [iMode,setIMode]=useState("");
  const [iYear,setIYear]=useState(""); const [iResultType,setIResultType]=useState(""); const [iResultValue,setIResultValue]=useState(""); const [iMedium,setIMedium]=useState(""); const [iCertKey,setICertKey]=useState("");
  const [ugCollege,setUgCollege]=useState(""); const [ugUniversity,setUgUniversity]=useState(""); const [ugCourse,setUgCourse]=useState("");
  const [ugHall,setUgHall]=useState(""); const [ugFrom,setUgFrom]=useState(""); const [ugTo,setUgTo]=useState(""); const [ugAddress,setUgAddress]=useState(""); const [ugMode,setUgMode]=useState("");
  const [ugYear,setUgYear]=useState(""); const [ugResultType,setUgResultType]=useState(""); const [ugResultValue,setUgResultValue]=useState(""); const [ugBacklogs,setUgBacklogs]=useState(""); const [ugMedium,setUgMedium]=useState(""); const [ugCertKey,setUgCertKey]=useState("");
  const [pgCollege,setPgCollege]=useState(""); const [pgUniversity,setPgUniversity]=useState(""); const [pgCourse,setPgCourse]=useState("");
  const [pgHall,setPgHall]=useState(""); const [pgFrom,setPgFrom]=useState(""); const [pgTo,setPgTo]=useState(""); const [pgAddress,setPgAddress]=useState(""); const [pgMode,setPgMode]=useState("");
  const [pgYear,setPgYear]=useState(""); const [pgResultType,setPgResultType]=useState(""); const [pgResultValue,setPgResultValue]=useState(""); const [pgBacklogs,setPgBacklogs]=useState(""); const [pgMedium,setPgMedium]=useState(""); const [pgCertKey,setPgCertKey]=useState("");
  const [dipInstitute,setDipInstitute]=useState(""); const [dipBoard,setDipBoard]=useState(""); const [dipCourse,setDipCourse]=useState("");
  const [dipFrom,setDipFrom]=useState(""); const [dipTo,setDipTo]=useState(""); const [dipYear,setDipYear]=useState("");
  const [dipResultType,setDipResultType]=useState(""); const [dipResultValue,setDipResultValue]=useState(""); const [dipMode,setDipMode]=useState(""); const [dipCertKey,setDipCertKey]=useState("");
  const [certs,setCerts]=useState([{name:"",certKey:""}]);

  useEffect(()=>{if(!ready)return;if(!user){router.replace("/employee/login");return;}},[ready,user,router]);

  useEffect(()=>{
    if(!ready||!user)return;
    const fetchDraft=async()=>{
      try{
        const res=await apiFetch(`${API}/employee/draft`);
        if(res.ok){
          const dr=await res.json(); setServerDraft(dr);
          const edu=dr.education||{};
          const x=edu.classX||{}; const i=edu.intermediate||{}; const ug=edu.undergraduate||{}; const pg=edu.postgraduate||{}; const dip=edu.diploma||{}; const certsData=edu.certifications||[];
          if(x.school)setXSchool(x.school); if(x.board)setXBoard(x.board); if(x.hallTicket)setXHall(x.hallTicket);
          if(x.from)setXFrom(x.from); if(x.to)setXTo(x.to); if(x.address)setXAddress(x.address);
          if(x.yearOfPassing)setXYear(x.yearOfPassing); if(x.resultType)setXResultType(x.resultType); if(x.resultValue)setXResultValue(x.resultValue); if(x.medium)setXMedium(x.medium); if(x.certKey)setXCertKey(x.certKey);
          if(i.college)setICollege(i.college); if(i.board)setIBoard(i.board); if(i.hallTicket)setIHall(i.hallTicket);
          if(i.from)setIFrom(i.from); if(i.to)setITo(i.to); if(i.address)setIAddress(i.address); if(i.mode)setIMode(i.mode);
          if(i.yearOfPassing)setIYear(i.yearOfPassing); if(i.resultType)setIResultType(i.resultType); if(i.resultValue)setIResultValue(i.resultValue); if(i.medium)setIMedium(i.medium); if(i.certKey)setICertKey(i.certKey);
          if(ug.college)setUgCollege(ug.college); if(ug.university)setUgUniversity(ug.university); if(ug.course)setUgCourse(ug.course);
          if(ug.hallTicket)setUgHall(ug.hallTicket); if(ug.from)setUgFrom(ug.from); if(ug.to)setUgTo(ug.to); if(ug.address)setUgAddress(ug.address); if(ug.mode)setUgMode(ug.mode);
          if(ug.yearOfPassing)setUgYear(ug.yearOfPassing); if(ug.resultType)setUgResultType(ug.resultType); if(ug.resultValue)setUgResultValue(ug.resultValue); if(ug.backlogs)setUgBacklogs(ug.backlogs); if(ug.medium)setUgMedium(ug.medium); if(ug.certKey)setUgCertKey(ug.certKey);
          if(pg.college){setHasPG("Yes");setPgCollege(pg.college);} if(pg.university)setPgUniversity(pg.university); if(pg.course)setPgCourse(pg.course);
          if(pg.hallTicket)setPgHall(pg.hallTicket); if(pg.from)setPgFrom(pg.from); if(pg.to)setPgTo(pg.to); if(pg.address)setPgAddress(pg.address); if(pg.mode)setPgMode(pg.mode);
          if(pg.yearOfPassing)setPgYear(pg.yearOfPassing); if(pg.resultType)setPgResultType(pg.resultType); if(pg.resultValue)setPgResultValue(pg.resultValue); if(pg.backlogs)setPgBacklogs(pg.backlogs); if(pg.medium)setPgMedium(pg.medium); if(pg.certKey)setPgCertKey(pg.certKey);
          if(dip.institute){setHasDip("Yes");setDipInstitute(dip.institute);} if(dip.board)setDipBoard(dip.board); if(dip.course)setDipCourse(dip.course);
          if(dip.from)setDipFrom(dip.from); if(dip.to)setDipTo(dip.to); if(dip.yearOfPassing)setDipYear(dip.yearOfPassing);
          if(dip.resultType)setDipResultType(dip.resultType); if(dip.resultValue)setDipResultValue(dip.resultValue); if(dip.mode)setDipMode(dip.mode); if(dip.certKey)setDipCertKey(dip.certKey);
          if(certsData.length>0){setHasCerts("Yes");setCerts(certsData);}
        }
      }catch(_){}
      setLoading(false);
    };
    fetchDraft();
  },[ready,user,apiFetch]);

  const buildEducation=()=>({
    classX:{school:xSchool,board:xBoard,hallTicket:xHall,from:xFrom,to:xTo,address:xAddress,yearOfPassing:xYear,resultType:xResultType,resultValue:xResultValue,medium:xMedium,certKey:xCertKey},
    intermediate:{college:iCollege,board:iBoard,hallTicket:iHall,from:iFrom,to:iTo,address:iAddress,mode:iMode,yearOfPassing:iYear,resultType:iResultType,resultValue:iResultValue,medium:iMedium,certKey:iCertKey},
    undergraduate:{college:ugCollege,university:ugUniversity,course:ugCourse,hallTicket:ugHall,from:ugFrom,to:ugTo,address:ugAddress,mode:ugMode,yearOfPassing:ugYear,resultType:ugResultType,resultValue:ugResultValue,backlogs:ugBacklogs,medium:ugMedium,certKey:ugCertKey},
    postgraduate:hasPG==="Yes"?{college:pgCollege,university:pgUniversity,course:pgCourse,hallTicket:pgHall,from:pgFrom,to:pgTo,address:pgAddress,mode:pgMode,yearOfPassing:pgYear,resultType:pgResultType,resultValue:pgResultValue,backlogs:pgBacklogs,medium:pgMedium,certKey:pgCertKey}:{},
    diploma:hasDip==="Yes"?{institute:dipInstitute,board:dipBoard,course:dipCourse,from:dipFrom,to:dipTo,yearOfPassing:dipYear,resultType:dipResultType,resultValue:dipResultValue,mode:dipMode,certKey:dipCertKey}:{},
    certifications:hasCerts==="Yes"?certs:[],
  });

  const saveDraft=async()=>{
    if(!serverDraft||!serverDraft.employee_id)throw new Error("Please complete and save Page 1 first");
    const dr=serverDraft;
    const res=await apiFetch(`${API}/employee`,{method:"POST",body:JSON.stringify({
      employee_id:dr.employee_id,status:dr.status||"draft",
      firstName:dr.firstName||"",lastName:dr.lastName||"",middleName:dr.middleName,
      fatherName:dr.fatherName,fatherFirst:dr.fatherFirst,fatherMiddle:dr.fatherMiddle,fatherLast:dr.fatherLast,
      dob:dr.dob,gender:dr.gender,nationality:dr.nationality,mobile:dr.mobile||"",email:dr.email,
      aadhaar:dr.aadhaar,pan:dr.pan,passport:dr.passport,aadhaarKey:dr.aadhaarKey,panKey:dr.panKey,
      currentAddress:dr.currentAddress,permanentAddress:dr.permanentAddress,
      uanNumber:dr.uanNumber,nameAsPerUan:dr.nameAsPerUan,mobileLinked:dr.mobileLinked,isActive:dr.isActive,pfRecords:dr.pfRecords,
      acknowledgements_profile:dr.acknowledgements_profile,
      education:buildEducation(),
    })});
    if(!res.ok)throw new Error(parseError(await res.json().catch(()=>({}))));
    setServerDraft({...dr,education:buildEducation()});
    isDirtyRef.current=false;
  };

  const handleNavigate=async(path)=>{if(isDirtyRef.current){try{await saveDraft();}catch(_){}}router.push(path);};
  const handleSave=async()=>{setSaveStatus("Saving...");try{await saveDraft();setSaveStatus("Saved ✓");router.push("/employee/previous");}catch(err){setSaveStatus(`Error: ${err.message||"Could not save"}`);} };
  const handlePrevious=async()=>{if(isDirtyRef.current){try{await saveDraft();}catch(_){}}router.push("/employee/personal");};
  const handleSignout=async()=>{if(isDirtyRef.current){try{await saveDraft();}catch(_){}}logout();};

  if(!ready||!user)return null;
  if(loading)return(<div style={{minHeight:"100vh",background:"#f0eff9",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"#94a3b8",fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:500}}>Loading education details…</p></div>);

  const AL=({lbl})=><span className="fl" style={{display:"block",marginBottom:"0.28rem"}}>{lbl} <span style={{color:"#ef4444"}}>*</span></span>;

  return(
    <>
      <style>{G}</style>
      <div className="pg">
        {showSignout&&<SignoutModal onConfirm={handleSignout} onCancel={()=>setShowSignout(false)}/>}
        <div className="topbar">
          <span className="logo-text">Datagate</span>
          <div className="user-pill">
            <span className="user-name">👤 {user.name||user.email}</span>
            <button className="signout-btn" onClick={()=>setShowSignout(true)}>Sign out</button>
          </div>
        </div>
        <div className="wrap">
          <StepNav current={2} onNavigate={handleNavigate}/>

          {/* Class X */}
          <div className="sc ind">
            <div className="sh"><div className="si ind">📚</div><span className="st">Class X — SSC / Matriculation</span></div>
            <div className="fr"><F l="School Name" v={xSchool} s={d(setXSchool)}/><F l="Board Name" v={xBoard} s={d(setXBoard)}/><F l="Hall Ticket / Roll No." v={xHall} s={d(setXHall)}/></div>
            <div className="fr"><F l="From" v={xFrom} s={d(setXFrom)} t="date"/><F l="To" v={xTo} s={d(setXTo)} t="date"/><F l="Year of Passing" v={xYear} s={d(setXYear)}/></div>
            <div className="fr"><F l="School Address" v={xAddress} s={d(setXAddress)}/></div>
            <div className="fr"><FS l="Result Type" v={xResultType} s={d(setXResultType)} o={["Percentage","Grade"]}/><F l="Result Value" v={xResultValue} s={d(setXResultValue)}/><F l="Medium of Study" v={xMedium} s={d(setXMedium)}/></div>
            <div style={{marginTop:"0.7rem"}}><AL lbl="Upload Class X Certificate"/><FileUpload label="Upload Class X Certificate" category="education" subKey="classX" apiFetch={apiFetch} value={xCertKey} onChange={(k)=>{setXCertKey(k);isDirtyRef.current=true;}}/></div>
          </div>

          {/* Intermediate */}
          <div className="sc cyn">
            <div className="sh"><div className="si cyn">🏫</div><span className="st">Intermediate — HSC / 12th</span></div>
            <div className="fr"><F l="College Name" v={iCollege} s={d(setICollege)}/><F l="Board Name" v={iBoard} s={d(setIBoard)}/><F l="Hall Ticket / Roll No." v={iHall} s={d(setIHall)}/></div>
            <div className="fr"><F l="From" v={iFrom} s={d(setIFrom)} t="date"/><F l="To" v={iTo} s={d(setITo)} t="date"/><F l="Year of Passing" v={iYear} s={d(setIYear)}/></div>
            <div className="fr"><F l="College Address" v={iAddress} s={d(setIAddress)}/></div>
            <div className="fr"><FS l="Mode" v={iMode} s={d(setIMode)} o={["Full-time","Part-time","Distance"]}/><FS l="Result Type" v={iResultType} s={d(setIResultType)} o={["Percentage","Grade"]}/><F l="Result Value" v={iResultValue} s={d(setIResultValue)}/></div>
            <div className="fr"><F l="Medium of Study" v={iMedium} s={d(setIMedium)}/></div>
            <div style={{marginTop:"0.7rem"}}><AL lbl="Upload Intermediate Certificate"/><FileUpload label="Upload Intermediate Certificate" category="education" subKey="intermediate" apiFetch={apiFetch} value={iCertKey} onChange={(k)=>{setICertKey(k);isDirtyRef.current=true;}}/></div>
          </div>

          {/* UG */}
          <div className="sc amb">
            <div className="sh"><div className="si amb">🎓</div><span className="st">Undergraduate — UG / Degree</span></div>
            <div className="fr"><F l="College Name" v={ugCollege} s={d(setUgCollege)}/><F l="University Name" v={ugUniversity} s={d(setUgUniversity)}/><F l="Course / Degree" v={ugCourse} s={d(setUgCourse)}/></div>
            <div className="fr"><F l="Hall Ticket / Roll No." v={ugHall} s={d(setUgHall)}/><FS l="Mode" v={ugMode} s={d(setUgMode)} o={["Full-time","Part-time","Distance"]}/></div>
            <div className="fr"><F l="From" v={ugFrom} s={d(setUgFrom)} t="date"/><F l="To" v={ugTo} s={d(setUgTo)} t="date"/><F l="Year of Passing" v={ugYear} s={d(setUgYear)}/></div>
            <div className="fr"><F l="College Address" v={ugAddress} s={d(setUgAddress)}/></div>
            <div className="fr"><FS l="Result Type" v={ugResultType} s={d(setUgResultType)} o={["Percentage","CGPA","Grade"]}/><F l="Result Value" v={ugResultValue} s={d(setUgResultValue)}/><F l="Medium of Study" v={ugMedium} s={d(setUgMedium)}/></div>
            <div className="fr"><FS l="Any Active Backlogs?" v={ugBacklogs} s={d(setUgBacklogs)} o={["No","Yes"]}/></div>
            <div style={{marginTop:"0.7rem"}}><AL lbl="Upload UG Degree / Provisional Certificate"/><FileUpload label="Upload UG Certificate" category="education" subKey="undergraduate" apiFetch={apiFetch} value={ugCertKey} onChange={(k)=>{setUgCertKey(k);isDirtyRef.current=true;}}/></div>
          </div>

          {/* PG toggle */}
          <div className="sc vio">
            <div className="sh"><div className="si vio">🧑‍🎓</div><span className="st">Postgraduate — PG / Masters</span></div>
            <YesNo label="Do you have a Postgraduate degree?" value={hasPG} onChange={(v)=>{setHasPG(v);isDirtyRef.current=true;}}/>
            {hasPG==="Yes"&&(<>
              <div className="fr"><F l="College Name" v={pgCollege} s={d(setPgCollege)}/><F l="University Name" v={pgUniversity} s={d(setPgUniversity)}/><F l="Course / Degree" v={pgCourse} s={d(setPgCourse)}/></div>
              <div className="fr"><F l="Hall Ticket / Roll No." v={pgHall} s={d(setPgHall)}/><FS l="Mode" v={pgMode} s={d(setPgMode)} o={["Full-time","Part-time","Distance"]}/></div>
              <div className="fr"><F l="From" v={pgFrom} s={d(setPgFrom)} t="date"/><F l="To" v={pgTo} s={d(setPgTo)} t="date"/><F l="Year of Passing" v={pgYear} s={d(setPgYear)}/></div>
              <div className="fr"><F l="College Address" v={pgAddress} s={d(setPgAddress)}/></div>
              <div className="fr"><FS l="Result Type" v={pgResultType} s={d(setPgResultType)} o={["Percentage","CGPA","Grade"]}/><F l="Result Value" v={pgResultValue} s={d(setPgResultValue)}/><F l="Medium of Study" v={pgMedium} s={d(setPgMedium)}/></div>
              <div className="fr"><FS l="Any Active Backlogs?" v={pgBacklogs} s={d(setPgBacklogs)} o={["No","Yes"]}/></div>
              <div style={{marginTop:"0.7rem"}}><AL lbl="Upload PG Degree / Provisional Certificate"/><FileUpload label="Upload PG Certificate" category="education" subKey="postgraduate" apiFetch={apiFetch} value={pgCertKey} onChange={(k)=>{setPgCertKey(k);isDirtyRef.current=true;}}/></div>
            </>)}
          </div>

          {/* Diploma toggle */}
          <div className="sc grn">
            <div className="sh"><div className="si grn">🔧</div><span className="st">Diploma / Technical / Vocational Studies</span></div>
            <YesNo label="Do you have a Diploma or Technical qualification?" value={hasDip} onChange={(v)=>{setHasDip(v);isDirtyRef.current=true;}}/>
            {hasDip==="Yes"&&(<>
              <div className="fr"><F l="Institute Name" v={dipInstitute} s={d(setDipInstitute)}/><F l="Board / University" v={dipBoard} s={d(setDipBoard)}/><F l="Course / Programme" v={dipCourse} s={d(setDipCourse)}/></div>
              <div className="fr"><F l="From" v={dipFrom} s={d(setDipFrom)} t="date"/><F l="To" v={dipTo} s={d(setDipTo)} t="date"/><F l="Year of Passing" v={dipYear} s={d(setDipYear)}/></div>
              <div className="fr"><FS l="Mode" v={dipMode} s={d(setDipMode)} o={["Full-time","Part-time","Distance"]}/><FS l="Result Type" v={dipResultType} s={d(setDipResultType)} o={["Percentage","CGPA","Grade"]}/><F l="Result Value" v={dipResultValue} s={d(setDipResultValue)}/></div>
              <div style={{marginTop:"0.7rem"}}><AL lbl="Upload Diploma / Technical Certificate"/><FileUpload label="Upload Diploma Certificate" category="education" subKey="diploma" apiFetch={apiFetch} value={dipCertKey} onChange={(k)=>{setDipCertKey(k);isDirtyRef.current=true;}}/></div>
            </>)}
          </div>

          {/* Certifications toggle */}
          <div className="sc ros">
            <div className="sh"><div className="si ros">🏅</div><span className="st">Professional Certifications</span></div>
            <YesNo label="Do you have certifications? (AWS, Azure, PMP, etc.)" value={hasCerts} onChange={(v)=>{setHasCerts(v);isDirtyRef.current=true;}}/>
            {hasCerts==="Yes"&&(<>
              {certs.map((cert,idx)=>(
                <div key={idx} className="cert-box">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.6rem"}}>
                    <span style={{fontSize:"0.78rem",color:"#64748b",fontWeight:700}}>Certification {idx+1}</span>
                    {idx>0&&<button className="rm-btn" onClick={()=>{const c=[...certs];c.splice(idx,1);setCerts(c);isDirtyRef.current=true;}}>− Remove</button>}
                  </div>
                  <div className="fr">
                    <div className="fi">
                      <span className="fl">Certification Name <span style={{color:"#ef4444"}}>*</span></span>
                      <input className="in" value={cert.name} onChange={e=>{const c=[...certs];c[idx]={...c[idx],name:e.target.value};setCerts(c);isDirtyRef.current=true;}}/>
                    </div>
                  </div>
                  <div style={{marginTop:"0.5rem"}}>
                    <span className="fl" style={{display:"block",marginBottom:"0.28rem"}}>Upload Certificate <span style={{color:"#ef4444"}}>*</span></span>
                    <FileUpload label="Upload Certificate" category="education" subKey={`cert_${idx}`} apiFetch={apiFetch} value={cert.certKey} onChange={(k)=>{const c=[...certs];c[idx]={...c[idx],certKey:k};setCerts(c);isDirtyRef.current=true;}}/>
                  </div>
                </div>
              ))}
              <button className="add-btn" onClick={()=>{setCerts([...certs,{name:"",certKey:""}]);isDirtyRef.current=true;}}>+ Add Another Certification</button>
            </>)}
          </div>

          <div className="sbar">
            <button className="sbtn" onClick={handlePrevious}>← Previous</button>
            <span className={`ss${saveStatus==="Saved ✓"?" ok":saveStatus.startsWith("Error")?" err":""}`}>{saveStatus}</span>
            <button className="pbtn" onClick={handleSave}>Save & Continue →</button>
          </div>
        </div>
      </div>
    </>
  );
}
