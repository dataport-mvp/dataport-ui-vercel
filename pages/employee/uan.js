// pages/employee/uan.js  — Page 4 of 4 (FINAL SUBMIT)
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";
import FileUpload from "../../components/FileUpload";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const ACKNOWLEDGEMENTS=[
  {id:"truthful",    text:"I confirm that all information provided is true and accurate to the best of my knowledge."},
  {id:"notTampered", text:"I confirm that no documents or records have been tampered with or falsified."},
  {id:"consent",     text:"I consent to Datagate storing my employment profile and sharing it with employers only upon my explicit approval."},
  {id:"liability",   text:"I understand that providing false information may result in legal liability and disqualification from employment."},
  {id:"updates",     text:"I agree to update my profile if any information changes in the future."},
];
const emptyPfRecord=()=>({companyName:"",pfMemberId:"",dojEpfo:"",doeEpfo:"",pfTransferred:""});

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
  .sc{background:#fff;border-radius:14px;padding:1.5rem 1.6rem;margin-bottom:1.1rem;box-shadow:0 1px 8px rgba(79,70,229,0.07),0 0 0 1px #f0eef8;position:relative;overflow:hidden;}
  .sc::before{content:'';position:absolute;top:0;left:0;bottom:0;width:4px;border-radius:14px 0 0 14px;}
  .sc.ind::before{background:#4f46e5;} .sc.grn::before{background:#16a34a;} .sc.amb::before{background:#d97706;}
  .sh{display:flex;align-items:center;gap:0.6rem;margin-bottom:1.15rem;}
  .si{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:0.95rem;flex-shrink:0;}
  .si.ind{background:#eef2ff;} .si.grn{background:#f0fdf4;} .si.amb{background:#fffbeb;}
  .st{font-size:0.93rem;font-weight:700;color:#1e293b;}
  .fr{display:flex;gap:0.9rem;flex-wrap:wrap;margin-bottom:0.85rem;}
  .fr:last-child{margin-bottom:0;}
  .fi{display:flex;flex-direction:column;gap:0.28rem;flex:1;min-width:138px;}
  .fl{font-size:0.7rem;font-weight:700;color:#64748b;letter-spacing:0.55px;text-transform:uppercase;}
  .in{padding:0.65rem 0.875rem;background:#f8f9fc;border:1.5px solid #e4e2ed;border-radius:9px;font-family:inherit;font-size:0.875rem;color:#1e293b;outline:none;width:100%;transition:all 0.18s;}
  .in:focus{border-color:#4f46e5;background:#fff;box-shadow:0 0 0 3px rgba(79,70,229,0.1);}
  .pf-box{background:#f8f9fc;border:1.5px solid #e4e2ed;border-radius:10px;padding:1rem;margin-bottom:0.6rem;}
  .ack-item{display:flex;gap:0.75rem;align-items:flex-start;padding:0.85rem 1rem;border-radius:10px;cursor:pointer;transition:all 0.15s;margin-bottom:0.45rem;border:1.5px solid #e4e2ed;background:#f8f9fc;}
  .ack-item.checked{border-color:#16a34a;background:#f0fdf4;}
  .ack-check{width:20px;height:20px;border-radius:5px;flex-shrink:0;margin-top:1px;border:2px solid #e4e2ed;background:#fff;display:flex;align-items:center;justify-content:center;transition:all 0.15s;}
  .ack-check.on{border-color:#16a34a;background:#16a34a;}
  .sbar{display:flex;justify-content:space-between;align-items:center;margin-top:1.5rem;padding:1rem 1.5rem;background:#fff;border-radius:12px;box-shadow:0 1px 8px rgba(79,70,229,0.07),0 0 0 1px #f0eef8;}
  .pbtn{padding:0.72rem 1.9rem;background:#4f46e5;color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:0.875rem;font-weight:700;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 14px rgba(79,70,229,0.28);}
  .pbtn:hover{background:#4338ca;transform:translateY(-1px);}
  .sbtn{padding:0.72rem 1.5rem;background:#fff;color:#475569;border:1.5px solid #e4e2ed;border-radius:10px;font-family:inherit;font-size:0.875rem;font-weight:600;cursor:pointer;}
  .add-btn{padding:0.5rem 1.1rem;background:#eef2ff;color:#4f46e5;border:1.5px solid #c7d2fe;border-radius:8px;font-family:inherit;font-size:0.8rem;font-weight:700;cursor:pointer;margin-top:0.5rem;}
  .rm-btn{padding:0.28rem 0.7rem;background:#fff5f5;color:#ef4444;border:1.5px solid #fecaca;border-radius:6px;font-size:0.75rem;font-weight:600;cursor:pointer;font-family:inherit;}
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

function F({l,v,s,t="text",mx,r=true}){
  return(<div className="fi"><span className="fl">{l}{r&&<span style={{color:"#ef4444",marginLeft:2}}>*</span>}</span><input className="in" type={t} value={v||""} maxLength={mx} onChange={e=>s(e.target.value)}/></div>);
}
function Pill({active,onClick,label}){
  return(<button onClick={onClick} style={{padding:"0.32rem 1.1rem",borderRadius:999,border:active?"2px solid #4f46e5":"1.5px solid #e4e2ed",background:active?"#4f46e5":"#fff",color:active?"#fff":"#64748b",cursor:"pointer",fontSize:"0.82rem",fontWeight:700,transition:"all 0.18s"}}>{label}</button>);
}

export default function UANPage(){
  const router=useRouter();
  const {user,apiFetch,logout,ready}=useAuth();
  const [showSignout,setShowSignout]=useState(false);
  const [serverDraft,setServerDraft]=useState(null);
  const [epfoKey,setEpfoKey]=useState("");
  const isDirtyRef=useRef(false);
  const [form,setForm]=useState({uanMaster:{uanNumber:"",nameAsPerUan:"",mobileLinked:"",isActive:""},pfRecords:[emptyPfRecord()]});
  const [acks,setAcks]=useState({truthful:false,notTampered:false,consent:false,liability:false,updates:false});
  const [submitError,setSubmitError]=useState("");
  const [loading,setLoading]=useState(true);
  const [submitted,setSubmitted]=useState(false);

  useEffect(()=>{if(!ready)return;if(!user){router.replace("/employee/login");return;}},[ready,user,router]);

  useEffect(()=>{
    if(!ready||!user)return;
    const fetchDraft=async()=>{
      try{
        const res=await apiFetch(`${API}/employee/draft`);
        if(res.ok){
          const dr=await res.json(); setServerDraft(dr);
          if(dr.epfoKey)setEpfoKey(dr.epfoKey);
          if(dr.uanNumber||dr.nameAsPerUan||dr.mobileLinked||dr.isActive||dr.pfRecords){
            setForm({
              uanMaster:{uanNumber:dr.uanNumber||"",nameAsPerUan:dr.nameAsPerUan||"",mobileLinked:dr.mobileLinked||"",isActive:dr.isActive||""},
              pfRecords:dr.pfRecords&&dr.pfRecords.length>0?dr.pfRecords.map(r=>({companyName:r.companyName||"",pfMemberId:r.pfMemberId||"",dojEpfo:r.dojEpfo||"",doeEpfo:r.doeEpfo||"",pfTransferred:r.pfTransferred||""}) ):[emptyPfRecord()],
            });
          }
        }
      }catch(_){}
      setLoading(false);
    };
    fetchDraft();
  },[ready,user,apiFetch]);

  const updateUan=(field,value)=>{setForm(p=>({...p,uanMaster:{...p.uanMaster,[field]:value}}));isDirtyRef.current=true;};
  const updatePf=(i,field,value)=>{setForm(p=>({...p,pfRecords:p.pfRecords.map((r,idx)=>idx===i?{...r,[field]:value}:r)}));isDirtyRef.current=true;};
  const addPfRecord=()=>{setForm(p=>({...p,pfRecords:[...p.pfRecords,emptyPfRecord()]}));isDirtyRef.current=true;};
  const removePfRecord=(i)=>{if(i===0)return;setForm(p=>({...p,pfRecords:p.pfRecords.filter((_,idx)=>idx!==i)}));isDirtyRef.current=true;};
  const toggleAck=(id)=>setAcks(p=>({...p,[id]:!p[id]}));
  const allAcksChecked=Object.values(acks).every(Boolean);

  const handleSignout=async()=>{
    if(serverDraft&&serverDraft.employee_id){
      try{await apiFetch(`${API}/employee`,{method:"POST",body:JSON.stringify({...serverDraft,uanNumber:form.uanMaster.uanNumber,nameAsPerUan:form.uanMaster.nameAsPerUan,mobileLinked:form.uanMaster.mobileLinked,isActive:form.uanMaster.isActive,pfRecords:form.pfRecords,epfoKey})});}catch(_){}
    }
    logout();
  };

  const handleSubmit=async()=>{
    if(!allAcksChecked){setSubmitError("Please confirm all acknowledgements before submitting.");return;}
    if(!serverDraft||!serverDraft.employee_id){setSubmitError("Profile not found — please complete Page 1 first.");return;}
    setSubmitError("");setLoading(true);
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
        pfRecords:form.pfRecords,epfoKey,acknowledgements_profile:acks,submitted_at:Date.now(),
      })});
      if(!empRes.ok)throw new Error(parseError(await empRes.json().catch(()=>({}))));
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
          <div style={{background:"#fff",borderRadius:20,padding:"3rem 2rem",maxWidth:520,width:"90%",textAlign:"center",boxShadow:"0 8px 40px rgba(79,70,229,0.12)",border:"1px solid #e8e5f0"}}>
            <div style={{width:72,height:72,background:"#f0fdf4",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 1.25rem"}}>✅</div>
            <h2 style={{fontWeight:800,color:"#16a34a",fontSize:"1.35rem",marginBottom:"0.5rem"}}>Profile Submitted!</h2>
            <p style={{color:"#475569",lineHeight:1.65,marginBottom:"1rem",fontSize:"0.9rem"}}>Your employment profile is now securely stored with <strong style={{color:"#4f46e5"}}>Datagate</strong>.</p>
            <div style={{padding:"1rem",background:"#eef2ff",border:"1px solid #c7d2fe",borderRadius:10,marginBottom:"2rem"}}>
              <p style={{color:"#4338ca",fontSize:"0.84rem",lineHeight:1.6}}>🔒 Your data is <strong>private by default</strong>. We will only share your information with an employer when you explicitly approve their consent request.</p>
            </div>
            <button style={{padding:"0.8rem 2.25rem",background:"#4f46e5",color:"#fff",border:"none",borderRadius:10,fontSize:"0.9rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 14px rgba(79,70,229,0.28)"}} onClick={()=>router.push("/employee/personal")}>
              Go to My Profile & Consents →
            </button>
          </div>
        </div>
      </>
    );
  }

  if(loading)return(<div style={{minHeight:"100vh",background:"#f0eff9",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"#94a3b8",fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:500}}>Loading UAN details…</p></div>);

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
          <StepNav current={4} onNavigate={(path)=>router.push(path)}/>

          <div className="sc ind">
            <div className="sh"><div className="si ind">🏦</div><span className="st">UAN Details</span></div>
            <div className="fr">
              <F l="UAN Number" v={form.uanMaster.uanNumber} s={v=>updateUan("uanNumber",v.replace(/\D/g,""))} mx={12}/>
              <F l="Name as per UAN" v={form.uanMaster.nameAsPerUan} s={v=>updateUan("nameAsPerUan",v)}/>
            </div>
            <div className="fr">
              <F l="Mobile Linked with UAN" v={form.uanMaster.mobileLinked} s={v=>updateUan("mobileLinked",v.replace(/\D/g,""))} mx={10}/>
              <div className="fi">
                <span className="fl">Is UAN Active? <span style={{color:"#ef4444"}}>*</span></span>
                <div style={{display:"flex",gap:"0.6rem",marginTop:"0.3rem"}}>
                  {["Yes","No"].map(v=><Pill key={v} label={v} active={form.uanMaster.isActive===v} onClick={()=>updateUan("isActive",v)}/>)}
                </div>
              </div>
            </div>
            <div style={{marginTop:"0.5rem"}}>
              <span className="fl" style={{display:"block",marginBottom:"0.28rem"}}>EPFO Service History Record <span style={{color:"#ef4444"}}>*</span></span>
              <FileUpload label="EPFO Service History" category="uan" subKey="epfo" apiFetch={apiFetch} value={epfoKey} onChange={v=>{setEpfoKey(v);isDirtyRef.current=true;}}/>
              <p style={{fontSize:"0.7rem",color:"#94a3b8",marginTop:4}}>Download from EPFO portal → Upload here</p>
            </div>
          </div>

          <div className="sc grn">
            <div className="sh"><div className="si grn">📊</div><span className="st">PF Details (Per Previous Employer)</span></div>
            {form.pfRecords.map((record,i)=>(
              <div key={i} className="pf-box">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.6rem"}}>
                  <span style={{fontSize:"0.78rem",color:"#64748b",fontWeight:700}}>Company {i+1}</span>
                  {i>0&&<button className="rm-btn" onClick={()=>removePfRecord(i)}>− Remove</button>}
                </div>
                <div className="fr"><F l="Company Name" v={record.companyName} s={v=>updatePf(i,"companyName",v)}/><F l="PF Member ID" v={record.pfMemberId} s={v=>updatePf(i,"pfMemberId",v)}/></div>
                <div className="fr"><F l="Date of Joining (EPFO)" v={record.dojEpfo} s={v=>updatePf(i,"dojEpfo",v)} t="date"/><F l="Date of Exit (EPFO)" v={record.doeEpfo} s={v=>updatePf(i,"doeEpfo",v)} t="date"/></div>
                <div>
                  <span className="fl">Was PF Transferred? <span style={{color:"#ef4444"}}>*</span></span>
                  <div style={{display:"flex",gap:"0.6rem",marginTop:"0.3rem"}}>
                    {["Yes","No"].map(v=><Pill key={v} label={v} active={record.pfTransferred===v} onClick={()=>updatePf(i,"pfTransferred",v)}/>)}
                  </div>
                </div>
              </div>
            ))}
            <button className="add-btn" onClick={addPfRecord}>+ Add Another Company</button>
          </div>

          <div className="sc amb">
            <div className="sh"><div className="si amb">✍️</div><span className="st">Declaration & Acknowledgement</span></div>
            <p style={{fontSize:"0.84rem",color:"#64748b",marginBottom:"1rem",lineHeight:1.5}}>Please read and confirm each statement before submitting.</p>
            {ACKNOWLEDGEMENTS.map(({id,text})=>(
              <div key={id} className={`ack-item${acks[id]?" checked":""}`} onClick={()=>toggleAck(id)}>
                <div className={`ack-check${acks[id]?" on":""}`}>
                  {acks[id]&&<span style={{color:"#fff",fontSize:"0.75rem",fontWeight:800}}>✓</span>}
                </div>
                <span style={{fontSize:"0.875rem",color:acks[id]?"#15803d":"#334155",lineHeight:1.55,fontWeight:acks[id]?600:400}}>{text}</span>
              </div>
            ))}
            {!allAcksChecked&&<p style={{fontSize:"0.78rem",color:"#d97706",marginTop:"0.75rem",fontWeight:600}}>⚠️ Please confirm all {ACKNOWLEDGEMENTS.length} statements to enable submission.</p>}
          </div>

          {submitError&&(
            <div style={{color:"#ef4444",background:"#fff5f5",border:"1.5px solid #fecaca",borderRadius:10,padding:"0.75rem 1rem",marginBottom:"1rem",fontSize:"0.875rem",fontWeight:500}}>⚠️ {submitError}</div>
          )}

          <div className="sbar">
            <button className="sbtn" onClick={()=>router.push("/employee/previous")}>← Previous</button>
            <button className="pbtn" style={{opacity:(!allAcksChecked||loading)?0.5:1,cursor:(!allAcksChecked||loading)?"not-allowed":"pointer"}} onClick={handleSubmit} disabled={!allAcksChecked||loading}>
              {loading?"Submitting…":"Submit Profile 🚀"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
