// pages/employee/previous.js  — Page 3 of 4
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";
import FileUpload from "../../components/FileUpload";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const emptyEmployment=()=>({
  companyName:"",officeAddress:"",employeeId:"",workEmail:"",
  designation:"",department:"",duties:"",employmentType:"",reasonForRelieving:"",
  reference:{role:"",name:"",email:"",mobile:""},
  contractVendor:{company:"",email:"",mobile:""},
  documents:{payslipsKey:"",offerLetterKey:"",resignationKey:"",experienceKey:"",idCardKey:""},
  gap:{hasGap:"",reason:""},company_id:"",
});
const emptyAck=()=>({val:"",note:""});

const G=`
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{background:#f0eff9;font-family:'Plus Jakarta Sans',sans-serif;}
  .pg{min-height:100vh;background:#f0eff9;padding-bottom:3rem;}
  .wrap{max-width:860px;margin:auto;padding:0 1.25rem;}
  .topbar{background:#fff;border-bottom:1px solid #e8e5f0;padding:0.85rem 1.75rem;display:flex;justify-content:space-between;align-items:center;margin-bottom:1.75rem;position:sticky;top:0;z-index:50;box-shadow:0 2px 8px rgba(79,70,229,0.06);}
  .logo-text{font-size:1.3rem;font-weight:800;color:#4f46e5;letter-spacing:-0.5px;}
  .user-pill{display:flex;align-items:center;gap:0.75rem;}
  .user-name{font-size:0.84rem;color:#64748b;font-weight:500;}
  .signout-btn{padding:0.38rem 1rem;border:1.5px solid #e2e8f0;border-radius:8px;background:#fff;color:#64748b;font-size:0.82rem;cursor:pointer;font-weight:600;font-family:inherit;transition:all 0.2s;}
  .signout-btn:hover{border-color:#fca5a5;color:#ef4444;background:#fff8f8;}
  .emp-card{background:#fff;border-radius:14px;padding:1.5rem 1.6rem;margin-bottom:1.1rem;box-shadow:0 1px 8px rgba(79,70,229,0.07),0 0 0 1px #f0eef8;position:relative;overflow:hidden;}
  .emp-card::before{content:'';position:absolute;top:0;left:0;bottom:0;width:4px;border-radius:14px 0 0 14px;background:#4f46e5;}
  .emp-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.1rem;}
  .emp-title{font-size:0.93rem;font-weight:700;color:#1e293b;}
  .subsec{background:#f8f9fc;border:1px solid #e8e5f0;border-radius:10px;padding:1rem 1.1rem;margin-top:0.85rem;}
  .sub-lbl{font-size:0.68rem;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:0.7px;margin-bottom:0.75rem;}
  .decl-card{background:#fff;border-radius:14px;padding:1.5rem 1.6rem;margin-bottom:1.1rem;box-shadow:0 1px 8px rgba(79,70,229,0.07),0 0 0 1px #f0eef8;position:relative;overflow:hidden;}
  .decl-card::before{content:'';position:absolute;top:0;left:0;bottom:0;width:4px;border-radius:14px 0 0 14px;background:#7c3aed;}
  .decl-q{font-size:0.875rem;color:#334155;margin-bottom:0.5rem;font-weight:500;line-height:1.5;}
  .decl-item{padding:0.9rem 1rem;background:#f8f9fc;border-radius:10px;border:1px solid #e8e5f0;margin-bottom:0.75rem;}
  .fr{display:flex;gap:0.9rem;flex-wrap:wrap;margin-bottom:0.85rem;}
  .fr:last-child{margin-bottom:0;}
  .fi{display:flex;flex-direction:column;gap:0.28rem;flex:1;min-width:138px;}
  .fl{font-size:0.7rem;font-weight:700;color:#64748b;letter-spacing:0.55px;text-transform:uppercase;}
  .in{padding:0.65rem 0.875rem;background:#f8f9fc;border:1.5px solid #e4e2ed;border-radius:9px;font-family:inherit;font-size:0.875rem;color:#1e293b;outline:none;width:100%;transition:all 0.18s;}
  .in:focus{border-color:#4f46e5;background:#fff;box-shadow:0 0 0 3px rgba(79,70,229,0.1);}
  .ta{padding:0.65rem 0.875rem;background:#f8f9fc;border:1.5px solid #e4e2ed;border-radius:9px;font-family:inherit;font-size:0.875rem;color:#1e293b;outline:none;width:100%;min-height:72px;resize:vertical;transition:all 0.18s;}
  .ta:focus{border-color:#4f46e5;background:#fff;box-shadow:0 0 0 3px rgba(79,70,229,0.1);}
  .add-btn{padding:0.6rem 1.4rem;background:#eef2ff;color:#4f46e5;border:1.5px solid #c7d2fe;border-radius:10px;font-family:inherit;font-size:0.875rem;font-weight:700;cursor:pointer;margin-bottom:1.1rem;}
  .rm-btn{padding:0.3rem 0.75rem;background:#fff5f5;color:#ef4444;border:1.5px solid #fecaca;border-radius:7px;font-size:0.75rem;font-weight:600;cursor:pointer;font-family:inherit;}
  .att-lbl{font-size:0.7rem;font-weight:700;color:#64748b;letter-spacing:0.55px;text-transform:uppercase;display:block;margin-bottom:0.28rem;}
  .att-wrap{margin-bottom:0.65rem;}
  .sbar{display:flex;justify-content:space-between;align-items:center;margin-top:1.5rem;padding:1rem 1.5rem;background:#fff;border-radius:12px;box-shadow:0 1px 8px rgba(79,70,229,0.07),0 0 0 1px #f0eef8;}
  .ss{font-size:0.84rem;color:#94a3b8;font-weight:500;}
  .ss.ok{color:#16a34a;} .ss.err{color:#ef4444;}
  .pbtn{padding:0.72rem 1.9rem;background:#4f46e5;color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:0.875rem;font-weight:700;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 14px rgba(79,70,229,0.28);}
  .pbtn:hover{background:#4338ca;transform:translateY(-1px);}
  .sbtn{padding:0.72rem 1.5rem;background:#fff;color:#475569;border:1.5px solid #e4e2ed;border-radius:10px;font-family:inherit;font-size:0.875rem;font-weight:600;cursor:pointer;}
  .sbtn:hover{background:#f5f4f0;}
  @media(max-width:640px){.fr{flex-direction:column;}.fi{min-width:100%;}.topbar{flex-direction:column;gap:0.6rem;position:relative;}}
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

function ExitAckModal({onSaveAndExit,onExitWithout,onCancel}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(3px)"}}>
      <div style={{background:"#fff",borderRadius:16,padding:"2rem",maxWidth:400,width:"90%",textAlign:"center",boxShadow:"0 20px 60px rgba(79,70,229,0.15)",border:"1.5px solid #fde68a"}}>
        <div style={{fontSize:34,marginBottom:"0.75rem"}}>⚠️</div>
        <h3 style={{margin:"0 0 0.4rem",color:"#1e293b",fontWeight:800,fontSize:"1.05rem"}}>Unsaved Changes</h3>
        <p style={{color:"#64748b",fontSize:"0.875rem",marginBottom:"1.5rem",lineHeight:1.55}}>You have unsaved employment data. Save before leaving?</p>
        <div style={{display:"flex",gap:"0.6rem",flexWrap:"wrap"}}>
          <button onClick={onCancel} style={{flex:1,padding:"0.65rem",borderRadius:9,border:"1.5px solid #e4e2ed",background:"#f8f9fc",cursor:"pointer",fontWeight:600,color:"#475569",fontFamily:"inherit",minWidth:80}}>Stay</button>
          <button onClick={onExitWithout} style={{flex:1,padding:"0.65rem",borderRadius:9,border:"1.5px solid #fecaca",background:"#fff5f5",color:"#ef4444",cursor:"pointer",fontWeight:600,fontFamily:"inherit",minWidth:80}}>Exit anyway</button>
          <button onClick={onSaveAndExit} style={{flex:1,padding:"0.65rem",borderRadius:9,border:"none",background:"#4f46e5",color:"#fff",cursor:"pointer",fontWeight:700,fontFamily:"inherit",minWidth:80}}>Save & Exit</button>
        </div>
      </div>
    </div>
  );
}

function StepNav({current,onNavigate}){
  const steps=[{n:1,label:"Personal",icon:"👤",path:"/employee/personal"},{n:2,label:"Education",icon:"🎓",path:"/employee/education"},{n:3,label:"Employment",icon:"💼",path:"/employee/previous"},{n:4,label:"Review",icon:"✅",path:"/employee/uan"}];
  return(
    <div style={{background:"#fff",borderRadius:14,padding:"1.1rem 0.5rem",marginBottom:"1.6rem",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 1px 8px rgba(79,70,229,0.07)",border:"1px solid #f0eef8"}}>
      {steps.map((s,i)=>(
        <div key={s.n} style={{display:"flex",alignItems:"center"}}>
          <button onClick={()=>onNavigate(s.path)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.3rem",background:"none",border:"none",cursor:"pointer",padding:"0.2rem 0.9rem"}}>
            <div style={{width:40,height:40,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",transition:"all 0.25s",background:current===s.n?"#4f46e5":current>s.n?"#eef2ff":"#f8f9fc",border:current===s.n?"2px solid #4f46e5":current>s.n?"2px solid #c7d2fe":"2px solid #e4e2ed",boxShadow:current===s.n?"0 4px 12px rgba(79,70,229,0.3)":"none"}}>
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

function F({l,v,s,t="text",r=true,mx}){
  return(<div className="fi"><span className="fl">{l}{r&&<span style={{color:"#ef4444",marginLeft:2}}>*</span>}</span><input className="in" type={t} value={v||""} maxLength={mx} onChange={e=>s(e.target.value)}/></div>);
}
function FS({l,v,s,o,r=true}){
  return(<div className="fi"><span className="fl">{l}{r&&<span style={{color:"#ef4444",marginLeft:2}}>*</span>}</span><select className="in" value={v} onChange={e=>s(e.target.value)} style={{background:"#f8f9fc",color:v?"#1e293b":"#94a3b8"}}><option value="">Select</option>{o.map(x=><option key={x} value={x}>{x}</option>)}</select></div>);
}
function TA({l,v,s,r=true}){
  return(<div style={{width:"100%",marginBottom:"0.75rem"}}><span className="fl">{l}{r&&<span style={{color:"#ef4444",marginLeft:2}}>*</span>}</span><textarea className="ta" value={v||""} onChange={e=>s(e.target.value)}/></div>);
}

function YN({val,onY,onN}){
  return(
    <div style={{display:"flex",gap:"0.65rem",marginTop:"0.45rem"}}>
      {["Yes","No"].map(v=>(
        <button key={v} onClick={v==="Yes"?onY:onN} style={{padding:"0.3rem 1.1rem",borderRadius:999,border:(val===v)?"2px solid #4f46e5":"1.5px solid #e4e2ed",background:(val===v)?"#4f46e5":"#fff",color:(val===v)?"#fff":"#64748b",cursor:"pointer",fontSize:"0.82rem",fontWeight:700,transition:"all 0.18s"}}>{v}</button>
      ))}
    </div>
  );
}

export default function PreviousCompany(){
  const router=useRouter();
  const {user,apiFetch,logout,ready}=useAuth();
  const [showSignout,setShowSignout]=useState(false);
  const [showExitAck,setShowExitAck]=useState(false);
  const [exitTarget,setExitTarget]=useState(null);
  const [exitAction,setExitAction]=useState(null);
  const [saveStatus,setSaveStatus]=useState("");
  const [loading,setLoading]=useState(true);
  const [employeeId,setEmployeeId]=useState("");
  const [employments,setEmployments]=useState([emptyEmployment()]);
  const [ack,setAck]=useState({business:emptyAck(),dismissed:emptyAck(),criminal:emptyAck(),civil:emptyAck()});
  const isDirtyRef=useRef(false);

  useEffect(()=>{if(!ready)return;if(!user){router.replace("/employee/login");return;}},[ready,user,router]);

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
              reference:{role:e.reference?.role||"",name:e.reference?.name||"",email:e.reference?.email||"",mobile:e.reference?.mobile||""},
              contractVendor:{company:e.contractVendor?.company||"",email:e.contractVendor?.email||"",mobile:e.contractVendor?.mobile||""},
              documents:{payslipsKey:e.documents?.payslipsKey||"",offerLetterKey:e.documents?.offerLetterKey||"",resignationKey:e.documents?.resignationKey||"",experienceKey:e.documents?.experienceKey||"",idCardKey:e.documents?.idCardKey||""},
              gap:{hasGap:e.gap?.hasGap||"",reason:e.gap?.reason||""},company_id:e.company_id||"",
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

  const saveHistory=async()=>{
    if(!employeeId)throw new Error("Please complete and save Page 1 first");
    const res=await apiFetch(`${API}/employee/employment-history`,{method:"POST",body:JSON.stringify({employments,acknowledgements:ack})});
    if(!res.ok)throw new Error(parseError(await res.json().catch(()=>({}))));
    isDirtyRef.current=false;
  };

  const handleNavigate=async(path)=>{
    if(isDirtyRef.current){setExitTarget(path);setExitAction("nav");setShowExitAck(true);return;}
    router.push(path);
  };
  const handleNext=async()=>{setSaveStatus("Saving...");try{await saveHistory();setSaveStatus("Saved ✓");router.push("/employee/uan");}catch(err){setSaveStatus(`Error: ${err.message||"Could not save"}`);} };
  const handlePrevious=async()=>handleNavigate("/employee/education");
  const handleSignout=()=>{if(isDirtyRef.current){setExitAction("signout");setShowExitAck(true);return;}logout();};
  const onSaveAndExit=async()=>{try{await saveHistory();}catch(_){}setShowExitAck(false);if(exitAction==="signout")logout();else if(exitTarget)router.push(exitTarget);};
  const onExitWithout=()=>{setShowExitAck(false);isDirtyRef.current=false;if(exitAction==="signout")logout();else if(exitTarget)router.push(exitTarget);};

  if(!ready||!user)return null;
  if(loading)return(<div style={{minHeight:"100vh",background:"#f0eff9",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"#94a3b8",fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:500}}>Loading employment history…</p></div>);

  return(
    <>
      <style>{G}</style>
      <div className="pg">
        {showSignout&&<SignoutModal onConfirm={()=>{isDirtyRef.current=false;logout();}} onCancel={()=>setShowSignout(false)}/>}
        {showExitAck&&<ExitAckModal onSaveAndExit={onSaveAndExit} onExitWithout={onExitWithout} onCancel={()=>setShowExitAck(false)}/>}
        <div className="topbar">
          <span className="logo-text">Datagate</span>
          <div className="user-pill">
            <span className="user-name">👤 {user.name||user.email}</span>
            <button className="signout-btn" onClick={handleSignout}>Sign out</button>
          </div>
        </div>
        <div className="wrap">
          <StepNav current={3} onNavigate={handleNavigate}/>

          {employments.map((emp,index)=>(
            <div key={index} className="emp-card">
              <div className="emp-hdr">
                <span className="emp-title">{index===0?"Current / Most Recent Employer":`Previous Employer ${index}`}</span>
                {index!==0&&<button className="rm-btn" onClick={()=>removeEmployer(index)}>− Remove</button>}
              </div>
              <div className="fr"><F l="Company Name" v={emp.companyName} s={v=>update(index,"companyName",v)}/><F l="Office Address" v={emp.officeAddress} s={v=>update(index,"officeAddress",v)}/></div>
              <div className="fr"><F l="Employee ID" v={emp.employeeId} s={v=>update(index,"employeeId",v)}/><F l="Official Work Email" v={emp.workEmail} s={v=>update(index,"workEmail",v)}/></div>
              <div className="fr"><F l="Designation" v={emp.designation} s={v=>update(index,"designation",v)}/><F l="Department" v={emp.department} s={v=>update(index,"department",v)}/></div>
              <div className="fr"><F l="Duties & Responsibilities" v={emp.duties} s={v=>update(index,"duties",v)}/><FS l="Employment Type" v={emp.employmentType} s={v=>update(index,"employmentType",v)} o={["Full-time","Intern","Contract"]}/></div>
              {emp.employmentType==="Contract"&&(
                <div className="subsec">
                  <div className="sub-lbl">Vendor / Third-Party Details</div>
                  <div className="fr"><F l="Vendor Company" v={emp.contractVendor.company} s={v=>update(index,"contractVendor.company",v)}/><F l="Vendor Email" v={emp.contractVendor.email} s={v=>update(index,"contractVendor.email",v)}/><F l="Vendor Mobile" v={emp.contractVendor.mobile} s={v=>/^\d*$/.test(v)&&update(index,"contractVendor.mobile",v)} mx={10}/></div>
                </div>
              )}
              <div style={{marginTop:"0.75rem"}}><TA l="Reason for Relieving / Leaving" v={emp.reasonForRelieving} s={v=>update(index,"reasonForRelieving",v)}/></div>

              <div className="subsec">
                <div className="sub-lbl">Reference Details</div>
                <div className="fr"><FS l="Reference Role" v={emp.reference.role} s={v=>update(index,"reference.role",v)} o={["Manager","Colleague","HR","Client"]}/><F l="Reference Name" v={emp.reference.name} s={v=>update(index,"reference.name",v)}/></div>
                <div className="fr"><F l="Reference Official Email" v={emp.reference.email} s={v=>update(index,"reference.email",v)}/><F l="Reference Mobile" v={emp.reference.mobile} s={v=>/^\d*$/.test(v)&&update(index,"reference.mobile",v)} mx={10}/></div>
              </div>

              <div className="subsec">
                <div className="sub-lbl">Attachments</div>
                <div className="att-wrap"><span className="att-lbl">Payslips (Last 3 Months) <span style={{color:"#ef4444"}}>*</span></span><FileUpload label="Payslips" category="employment" subKey="payslips" companyId={emp.company_id||undefined} apiFetch={apiFetch} value={emp.documents.payslipsKey} onChange={v=>update(index,"documents.payslipsKey",v)}/></div>
                <div className="att-wrap"><span className="att-lbl">Offer Letter <span style={{color:"#ef4444"}}>*</span></span><FileUpload label="Offer Letter" category="employment" subKey="offerLetter" companyId={emp.company_id||undefined} apiFetch={apiFetch} value={emp.documents.offerLetterKey} onChange={v=>update(index,"documents.offerLetterKey",v)}/></div>
                <div className="att-wrap"><span className="att-lbl">Resignation Acceptance <span style={{color:"#ef4444"}}>*</span></span><FileUpload label="Resignation" category="employment" subKey="resignation" companyId={emp.company_id||undefined} apiFetch={apiFetch} value={emp.documents.resignationKey} onChange={v=>update(index,"documents.resignationKey",v)}/></div>
                <div className="att-wrap"><span className="att-lbl">Experience / Relieving Letter <span style={{color:"#ef4444"}}>*</span></span><FileUpload label="Experience Letter" category="employment" subKey="experience" companyId={emp.company_id||undefined} apiFetch={apiFetch} value={emp.documents.experienceKey} onChange={v=>update(index,"documents.experienceKey",v)}/></div>
                <div className="att-wrap"><span className="att-lbl">Company ID Card</span><FileUpload label="ID Card" category="employment" subKey="idCard" companyId={emp.company_id||undefined} apiFetch={apiFetch} value={emp.documents.idCardKey} onChange={v=>update(index,"documents.idCardKey",v)}/></div>
              </div>

              <div className="subsec">
                <div className="sub-lbl">Employment Gap</div>
                <span className="fl">Was there a gap before joining this company?</span>
                <YN val={emp.gap.hasGap} onY={()=>update(index,"gap.hasGap","Yes")} onN={()=>update(index,"gap.hasGap","No")}/>
                {emp.gap.hasGap==="Yes"&&<div style={{marginTop:"0.75rem"}}><TA l="Reason for Gap" v={emp.gap.reason} s={v=>update(index,"gap.reason",v)}/></div>}
              </div>
            </div>
          ))}

          <button className="add-btn" onClick={addEmployer}>+ Add Another Employer</button>

          <div className="decl-card">
            <div style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"1.1rem"}}>
              <div style={{width:32,height:32,borderRadius:8,background:"#f5f3ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.95rem"}}>📋</div>
              <span style={{fontSize:"0.93rem",fontWeight:700,color:"#1e293b"}}>Other Declarations</span>
            </div>
            {[["business","Are you currently engaged in any other business or employment?"],["dismissed","Have you ever been dismissed from any employer?"],["criminal","Have you ever been convicted in a court of law?"],["civil","Have you ever had any civil judgment against you?"]].map(([k,q])=>(
              <div key={k} className="decl-item">
                <p className="decl-q">{q}</p>
                <div style={{display:"flex",gap:"0.65rem"}}>
                  {["Yes","No"].map(v=>(
                    <button key={v} onClick={()=>setAck({...ack,[k]:{...ack[k],val:v}})} style={{padding:"0.3rem 1.1rem",borderRadius:999,border:ack[k].val===v?"2px solid #4f46e5":"1.5px solid #e4e2ed",background:ack[k].val===v?"#4f46e5":"#fff",color:ack[k].val===v?"#fff":"#64748b",cursor:"pointer",fontSize:"0.82rem",fontWeight:700,transition:"all 0.18s"}}>{v}</button>
                  ))}
                </div>
                {ack[k].val==="Yes"&&<div style={{marginTop:"0.6rem"}}><TA l="Details" v={ack[k].note} s={v=>setAck({...ack,[k]:{...ack[k],note:v}})} r={false}/></div>}
              </div>
            ))}
          </div>

          <div className="sbar">
            <button className="sbtn" onClick={handlePrevious}>← Previous</button>
            <span className={`ss${saveStatus==="Saved ✓"?" ok":saveStatus.startsWith("Error")?" err":""}`}>{saveStatus}</span>
            <button className="pbtn" onClick={handleNext}>Save & Continue →</button>
          </div>
        </div>
      </div>
    </>
  );
}
