// pages/employee/personal.js  — Page 1 of 4
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";
import FileUpload from "../../components/FileUpload";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

/* ─── Signout Modal ─────────────────────────────────────────────────── */
function SignoutModal({ onConfirm, onCancel }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(4px)" }}>
      <div style={{ background:"#0f1a2e",border:"1px solid rgba(56,189,248,0.2)",borderRadius:16,padding:"2rem",maxWidth:360,width:"90%",textAlign:"center",boxShadow:"0 24px 64px rgba(0,0,0,0.5)" }}>
        <div style={{ fontSize:36,marginBottom:"0.75rem" }}>👋</div>
        <h3 style={{ margin:"0 0 0.5rem",color:"#f1f5f9",fontFamily:"'Syne',sans-serif" }}>Sign out?</h3>
        <p style={{ color:"#64748b",fontSize:"0.9rem",marginBottom:"1.5rem" }}>Your progress is saved. You can continue anytime.</p>
        <div style={{ display:"flex",gap:"0.75rem" }}>
          <button onClick={onCancel} style={{ flex:1,padding:"0.75rem",borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",cursor:"pointer",fontWeight:600,color:"#94a3b8" }}>Stay</button>
          <button onClick={onConfirm} style={{ flex:1,padding:"0.75rem",borderRadius:8,border:"none",background:"#ef4444",color:"#fff",cursor:"pointer",fontWeight:600 }}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Step Navigator ────────────────────────────────────────────────── */
function StepNav({ current, onNavigate }) {
  const steps = [
    { n:1, label:"Personal",   icon:"👤", path:"/employee/personal"   },
    { n:2, label:"Education",  icon:"🎓", path:"/employee/education"  },
    { n:3, label:"Employment", icon:"💼", path:"/employee/employment" },
    { n:4, label:"Review",     icon:"✅", path:"/employee/pf"         },
  ];
  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:"0",marginBottom:"2.5rem",position:"relative" }}>
      {steps.map((s,i) => (
        <div key={s.n} style={{ display:"flex",alignItems:"center" }}>
          <button
            onClick={() => onNavigate(s.path)}
            style={{
              display:"flex",flexDirection:"column",alignItems:"center",gap:"0.3rem",
              background:"none",border:"none",cursor:"pointer",padding:"0.5rem 1rem",
              position:"relative",
            }}
          >
            <div style={{
              width:40,height:40,borderRadius:"50%",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:"1rem",
              background: current===s.n ? "linear-gradient(135deg,#2563eb,#38bdf8)" : current>s.n ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.05)",
              border: current===s.n ? "2px solid #38bdf8" : current>s.n ? "2px solid rgba(56,189,248,0.4)" : "2px solid rgba(255,255,255,0.1)",
              boxShadow: current===s.n ? "0 0 20px rgba(56,189,248,0.4)" : "none",
              transition:"all 0.3s",
            }}>
              {current > s.n ? "✓" : s.icon}
            </div>
            <span style={{
              fontSize:"0.7rem",fontWeight:600,letterSpacing:"0.5px",
              color: current===s.n ? "#38bdf8" : current>s.n ? "rgba(56,189,248,0.6)" : "#334155",
              textTransform:"uppercase",
            }}>{s.label}</span>
          </button>
          {i < steps.length-1 && (
            <div style={{ width:60,height:2,background: current>s.n ? "rgba(56,189,248,0.4)" : "rgba(255,255,255,0.06)",margin:"0 -0.25rem",marginBottom:"1.4rem" }} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Consent Tab ───────────────────────────────────────────────────── */
function ConsentTab({ apiFetch }) {
  const [consents,setConsents]=useState([]);
  const [loading,setLoading]=useState(true);
  const [acting,setActing]=useState(null);
  const load=useCallback(async()=>{
    try{const res=await apiFetch(`${API}/consent/my`);if(res.ok)setConsents(await res.json());}catch(_){}
    setLoading(false);
  },[apiFetch]);
  useEffect(()=>{load();},[load]);
  useEffect(()=>{const id=setInterval(load,15000);return()=>clearInterval(id);},[load]);
  const respond=async(consentId,decision)=>{
    setActing(consentId);
    try{const res=await apiFetch(`${API}/consent/respond`,{method:"POST",body:JSON.stringify({consent_id:consentId,status:decision==="approved"?"APPROVED":"DECLINED",responded_at:Date.now()})});if(res.ok)await load();}catch(_){}
    setActing(null);
  };
  const norm=(c)=>({...c,status:String(c.status||"pending").toLowerCase()});
  if(loading)return <p style={{color:"#475569",padding:"1rem 0"}}>Loading consents…</p>;
  if(!consents.length)return(
    <div style={{textAlign:"center",padding:"3rem 0"}}>
      <div style={{fontSize:40,marginBottom:12}}>📋</div>
      <p style={{color:"#475569",margin:0,fontWeight:600}}>No consent requests yet</p>
      <p style={{fontSize:"0.82rem",color:"#334155",margin:"6px 0 0"}}>Employers will appear here when they request your data</p>
    </div>
  );
  const all=consents.map(norm);
  const pending=all.filter(c=>c.status==="pending");
  const approved=all.filter(c=>c.status==="approved");
  const declined=all.filter(c=>c.status==="declined");
  const statusColor={pending:"#f59e0b",approved:"#16a34a",declined:"#ef4444"};
  const ConsentCard=({c})=>(
    <div style={{border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"1.25rem",marginBottom:"0.75rem",background:"rgba(255,255,255,0.03)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,color:"#e2e8f0",fontSize:"0.95rem"}}>{c.requestor_name||c.employer_name||c.requestor_email||c.employer_email}</div>
          {c.message&&(<div style={{marginTop:"0.6rem",padding:"0.6rem 0.75rem",background:"rgba(37,99,235,0.1)",border:"1px solid rgba(56,189,248,0.2)",borderRadius:8}}>
            <div style={{fontSize:"0.68rem",fontWeight:700,color:"#38bdf8",textTransform:"uppercase",letterSpacing:0.5,marginBottom:3}}>Message</div>
            <div style={{fontSize:"0.85rem",color:"#94a3b8",lineHeight:1.5}}>{c.message}</div>
          </div>)}
        </div>
        <span style={{padding:"0.2rem 0.7rem",borderRadius:999,fontSize:"0.72rem",fontWeight:700,color:"#fff",background:statusColor[c.status]||"#475569",whiteSpace:"nowrap",marginLeft:"0.75rem"}}>{c.status.charAt(0).toUpperCase()+c.status.slice(1)}</span>
      </div>
      {c.status==="pending"&&(<div style={{display:"flex",gap:"0.5rem",marginTop:"0.85rem"}}>
        <button disabled={acting===c.consent_id} onClick={()=>respond(c.consent_id,"approved")} style={{flex:1,padding:"0.55rem",background:"#16a34a",color:"#fff",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:"0.875rem"}}>{acting===c.consent_id?"…":"Approve"}</button>
        <button disabled={acting===c.consent_id} onClick={()=>respond(c.consent_id,"declined")} style={{flex:1,padding:"0.55rem",background:"rgba(239,68,68,0.1)",color:"#ef4444",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:"0.875rem"}}>{acting===c.consent_id?"…":"Decline"}</button>
      </div>)}
    </div>
  );
  const SLabel=({text,count})=><div style={{fontSize:"0.72rem",fontWeight:700,color:"#334155",textTransform:"uppercase",letterSpacing:1,margin:"1.25rem 0 0.6rem"}}>{text}{count!==undefined&&` (${count})`}</div>;
  return(<div>{pending.length>0&&<><SLabel text="Pending" count={pending.length}/>{pending.map(c=><ConsentCard key={c.consent_id} c={c}/>)}</>}{approved.length>0&&<><SLabel text="Approved"/>{approved.map(c=><ConsentCard key={c.consent_id} c={c}/>)}</>}{declined.length>0&&<><SLabel text="Declined"/>{declined.map(c=><ConsentCard key={c.consent_id} c={c}/>)}</>}</div>);
}

/* ─── Main Page ─────────────────────────────────────────────────────── */
export default function PersonalDetails() {
  const router = useRouter();
  const { user, apiFetch, logout, ready } = useAuth();
  const [activeTab,setActiveTab]       = useState("profile");
  const [showSignout,setShowSignout]   = useState(false);
  const [saveStatus,setSaveStatus]     = useState("");
  const [loading,setLoading]           = useState(true);
  const [employeeId,setEmployeeId]     = useState("");
  const [photoPreview,setPhotoPreview] = useState(null);
  const isDirtyRef = useRef(false); // track if any field was edited

  // Personal
  const [firstName,setFirstName]   = useState("");
  const [middleName,setMiddleName] = useState("");
  const [lastName,setLastName]     = useState("");
  // Father
  const [fatherFirst,setFatherFirst]   = useState("");
  const [fatherMiddle,setFatherMiddle] = useState("");
  const [fatherLast,setFatherLast]     = useState("");
  // Mother
  const [motherFirst,setMotherFirst]   = useState("");
  const [motherMiddle,setMotherMiddle] = useState("");
  const [motherLast,setMotherLast]     = useState("");
  // Info
  const [dob,setDob]               = useState("");
  const [gender,setGender]         = useState("");
  const [nationality,setNationality] = useState("");
  const [mobile,setMobile]         = useState("");
  const [email,setEmail]           = useState("");
  const [aadhar,setAadhar]         = useState("");
  const [pan,setPan]               = useState("");
  const [passport,setPassport]     = useState("");
  const [bloodGroup,setBloodGroup] = useState("");
  const [emergName,setEmergName]   = useState("");
  const [emergRel,setEmergRel]     = useState("");
  const [emergPhone,setEmergPhone] = useState("");
  // Current Address
  const [curFrom,setCurFrom]           = useState("");
  const [curTo,setCurTo]               = useState("");
  const [curDoor,setCurDoor]           = useState("");
  const [curVillage,setCurVillage]     = useState("");
  const [curLocality,setCurLocality]   = useState("");
  const [curDistrict,setCurDistrict]   = useState("");
  const [curState,setCurState]         = useState("");
  const [curPin,setCurPin]             = useState("");
  // Permanent Address
  const [permFrom,setPermFrom]         = useState("");
  const [permDoor,setPermDoor]         = useState("");
  const [permVillage,setPermVillage]   = useState("");
  const [permLocality,setPermLocality] = useState("");
  const [permDistrict,setPermDistrict] = useState("");
  const [permState,setPermState]       = useState("");
  const [permPin,setPermPin]           = useState("");
  // S3 keys
  const [aadhaarKey,setAadhaarKey] = useState("");
  const [panKey,setPanKey]         = useState("");
  const [photoKey,setPhotoKey]     = useState("");

  // Mark dirty on any field change
  const dirty = (setter) => (val) => { setter(val); isDirtyRef.current = true; };

  useEffect(()=>{ if(!ready)return; if(!user){router.replace("/employee/login");return;} },[ready,user,router]);

  useEffect(()=>{
    if(!ready||!user)return;
    if(user?.email)setEmail(user.email);
    if(user?.phone)setMobile(user.phone);
    const fetchDraft=async()=>{
      try{
        const res=await apiFetch(`${API}/employee/draft`);
        if(res.ok){
          const d=await res.json();
          if(d.employee_id)setEmployeeId(d.employee_id);
          if(d.firstName)setFirstName(d.firstName);
          if(d.middleName)setMiddleName(d.middleName);
          if(d.lastName)setLastName(d.lastName);
          if(d.fatherFirst)setFatherFirst(d.fatherFirst);
          if(d.fatherMiddle)setFatherMiddle(d.fatherMiddle);
          if(d.fatherLast)setFatherLast(d.fatherLast);
          if(d.motherFirst)setMotherFirst(d.motherFirst);
          if(d.motherMiddle)setMotherMiddle(d.motherMiddle);
          if(d.motherLast)setMotherLast(d.motherLast);
          if(d.dob)setDob(d.dob);
          if(d.gender)setGender(d.gender);
          if(d.nationality)setNationality(d.nationality);
          if(d.mobile)setMobile(d.mobile);
          if(d.email)setEmail(d.email);
          if(d.aadhaar||d.aadhar)setAadhar(d.aadhaar||d.aadhar);
          if(d.pan)setPan(d.pan);
          if(d.passport)setPassport(d.passport);
          if(d.bloodGroup)setBloodGroup(d.bloodGroup);
          if(d.emergName)setEmergName(d.emergName);
          if(d.emergRel)setEmergRel(d.emergRel);
          if(d.emergPhone)setEmergPhone(d.emergPhone);
          if(d.aadhaarKey)setAadhaarKey(d.aadhaarKey);
          if(d.panKey)setPanKey(d.panKey);
          if(d.photoKey)setPhotoKey(d.photoKey);
          const cur=d.currentAddress||{};const perm=d.permanentAddress||{};
          if(cur.from)setCurFrom(cur.from); if(cur.to)setCurTo(cur.to);
          if(cur.door)setCurDoor(cur.door); if(cur.village)setCurVillage(cur.village);
          if(cur.locality)setCurLocality(cur.locality);
          if(cur.district)setCurDistrict(cur.district); if(cur.state)setCurState(cur.state);
          if(cur.pin)setCurPin(cur.pin);
          if(perm.from)setPermFrom(perm.from); if(perm.door)setPermDoor(perm.door);
          if(perm.village)setPermVillage(perm.village);
          if(perm.locality)setPermLocality(perm.locality);
          if(perm.district)setPermDistrict(perm.district); if(perm.state)setPermState(perm.state);
          if(perm.pin)setPermPin(perm.pin);
        }
      }catch(_){}
      setLoading(false);
    };
    fetchDraft();
  },[ready,user,apiFetch]);

  const buildPayload=(empId)=>({
    employee_id:empId, status:"draft",
    firstName, middleName, lastName,
    fatherFirst, fatherMiddle, fatherLast,
    motherFirst, motherMiddle, motherLast,
    fatherName:`${fatherFirst} ${fatherMiddle} ${fatherLast}`.trim(),
    motherName:`${motherFirst} ${motherMiddle} ${motherLast}`.trim(),
    dob, gender, nationality, mobile, email,
    aadhaar:aadhar, pan, passport,
    bloodGroup, emergName, emergRel, emergPhone,
    aadhaarKey, panKey, photoKey,
    currentAddress:  {from:curFrom,to:curTo,door:curDoor,village:curVillage,locality:curLocality,district:curDistrict,state:curState,pin:curPin},
    permanentAddress:{from:permFrom,door:permDoor,village:permVillage,locality:permLocality,district:permDistrict,state:permState,pin:permPin},
  });

  const saveDraft=async()=>{
    const empId=employeeId||`emp-${Date.now()}`;
    if(!employeeId)setEmployeeId(empId);
    const res=await apiFetch(`${API}/employee`,{method:"POST",body:JSON.stringify(buildPayload(empId))});
    if(!res.ok)throw new Error(parseError(await res.json().catch(()=>({}))));
    const rd=await res.json().catch(()=>({}));
    if(rd.employee_id)setEmployeeId(rd.employee_id);
  };

  const handleSave=async()=>{
    setSaveStatus("Saving...");
    try{ await saveDraft(); isDirtyRef.current=false; setSaveStatus("Saved ✓"); router.push("/employee/education"); }
    catch(err){ setSaveStatus(`Error: ${err.message||"Could not save"}`); }
  };

  // Navigate via step bar — only save if dirty
  const handleNavigate=async(path)=>{
    if(isDirtyRef.current){
      try{ await saveDraft(); isDirtyRef.current=false; }catch(_){}
    }
    router.push(path);
  };

  const handleSignout=async()=>{
    // Only save on signout if dirty
    if(isDirtyRef.current){ try{ await saveDraft(); }catch(_){} }
    logout();
  };

  if(!ready||!user)return null;
  if(loading)return(
    <div style={{minHeight:"100vh",background:"#050d1a",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p style={{color:"#475569",fontFamily:"'DM Sans',sans-serif"}}>Loading your profile…</p>
    </div>
  );

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:#050d1a;}
        .pg{min-height:100vh;background:linear-gradient(160deg,#050d1a 0%,#0a1628 100%);padding:2rem 1rem;font-family:'DM Sans',sans-serif;color:#e2e8f0;}
        .wrap{max-width:900px;margin:auto;}

        /* Top bar */
        .topbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem;}
        .logo-text{font-family:'Syne',sans-serif;font-size:1.3rem;font-weight:800;background:linear-gradient(135deg,#38bdf8,#2563eb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .user-pill{display:flex;align-items:center;gap:0.75rem;}
        .user-name{font-size:0.85rem;color:#475569;}
        .signout-btn{padding:0.4rem 1rem;border:1px solid rgba(255,255,255,0.1);border-radius:7px;background:rgba(255,255,255,0.04);color:#64748b;font-size:0.82rem;cursor:pointer;font-weight:600;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
        .signout-btn:hover{border-color:rgba(239,68,68,0.4);color:#ef4444;}

        /* Tabs */
        .tab-row{display:flex;border-bottom:1px solid rgba(255,255,255,0.08);margin-bottom:2rem;gap:4px;}
        .tab-btn{padding:0.65rem 1.5rem;border:none;background:none;font-family:'DM Sans',sans-serif;font-size:0.9rem;color:#475569;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;font-weight:500;transition:all 0.2s;}
        .tab-btn.active{color:#38bdf8;border-bottom-color:#38bdf8;font-weight:700;}

        /* Section card */
        .section-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:1.75rem;margin-bottom:1.5rem;position:relative;overflow:hidden;}
        .section-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;border-radius:16px 16px 0 0;}
        .section-card.blue::before{background:linear-gradient(90deg,#2563eb,#38bdf8);}
        .section-card.teal::before{background:linear-gradient(90deg,#0d9488,#38bdf8);}
        .section-card.amber::before{background:linear-gradient(90deg,#d97706,#fbbf24);}
        .section-card.rose::before{background:linear-gradient(90deg,#e11d48,#f43f5e);}
        .section-card.purple::before{background:linear-gradient(90deg,#7c3aed,#a78bfa);}
        .section-card.green::before{background:linear-gradient(90deg,#16a34a,#4ade80);}

        .section-head{display:flex;align-items:center;gap:0.6rem;margin-bottom:1.25rem;}
        .section-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:0.9rem;flex-shrink:0;}
        .section-icon.blue{background:rgba(37,99,235,0.2);}
        .section-icon.teal{background:rgba(13,148,136,0.2);}
        .section-icon.amber{background:rgba(217,119,6,0.2);}
        .section-icon.rose{background:rgba(225,29,72,0.2);}
        .section-icon.purple{background:rgba(124,58,237,0.2);}
        .section-icon.green{background:rgba(22,163,74,0.2);}
        .section-title{font-family:'Syne',sans-serif;font-size:0.95rem;font-weight:700;color:#e2e8f0;}

        /* Fields */
        .field-row{display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:1rem;}
        .field-row:last-child{margin-bottom:0;}
        .field{display:flex;flex-direction:column;gap:0.35rem;flex:1;min-width:140px;}
        .field-label{font-size:0.75rem;font-weight:600;color:#475569;letter-spacing:0.4px;text-transform:uppercase;}
        .field-input{padding:0.7rem 0.85rem;background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.08);border-radius:9px;font-family:'DM Sans',sans-serif;font-size:0.875rem;color:#e2e8f0;outline:none;width:100%;transition:border-color 0.2s;}
        .field-input::placeholder{color:#1e3a5f;}
        .field-input:focus{border-color:rgba(56,189,248,0.35);background:rgba(56,189,248,0.04);}
        .field-input:disabled{background:rgba(255,255,255,0.02);color:#334155;cursor:not-allowed;}
        .field-error{font-size:0.72rem;color:#f87171;margin-top:2px;}

        /* Photo */
        .photo-circle{width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,0.06);border:2px solid rgba(56,189,248,0.2);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;}
        .photo-circle img{width:100%;height:100%;object-fit:cover;}
        .photo-placeholder{color:#334155;font-size:0.75rem;}

        /* Save bar */
        .save-bar{display:flex;justify-content:space-between;align-items:center;margin-top:2rem;padding:1.25rem 1.75rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;}
        .save-status{font-size:0.85rem;color:#475569;}
        .save-status.ok{color:#4ade80;}
        .save-status.err{color:#f87171;}
        .save-btn{padding:0.8rem 2rem;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;border:none;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:0.9rem;font-weight:600;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 16px rgba(37,99,235,0.3);}
        .save-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(37,99,235,0.45);}

        @media(max-width:640px){
          .field-row{flex-direction:column;}
          .field{min-width:100%;}
          .topbar{flex-direction:column;gap:0.75rem;align-items:flex-start;}
        }
      `}</style>

      <div className="pg">
        {showSignout&&<SignoutModal onConfirm={handleSignout} onCancel={()=>setShowSignout(false)}/>}
        <div className="wrap">

          {/* Top bar */}
          <div className="topbar">
            <span className="logo-text">Datagate</span>
            <div className="user-pill">
              <span className="user-name">👤 {user.name||user.email}</span>
              <button className="signout-btn" onClick={()=>setShowSignout(true)}>Sign out</button>
            </div>
          </div>

          {/* Tabs */}
          <div className="tab-row">
            <button className={`tab-btn${activeTab==="profile"?" active":""}`} onClick={()=>setActiveTab("profile")}>My Profile</button>
            <button className={`tab-btn${activeTab==="consents"?" active":""}`} onClick={()=>setActiveTab("consents")}>Consent Requests</button>
          </div>

          {activeTab==="consents" ? <ConsentTab apiFetch={apiFetch}/> : (
            <>
              {/* Step Navigator */}
              <StepNav current={1} onNavigate={handleNavigate}/>

              {/* Profile Photo */}
              <div className="section-card blue">
                <div className="section-head">
                  <div className="section-icon blue">📸</div>
                  <span className="section-title">Profile Photo</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"1.5rem",flexWrap:"wrap"}}>
                  <div className="photo-circle">
                    {photoPreview?<img src={photoPreview} alt="profile"/>:<span className="photo-placeholder">No photo</span>}
                  </div>
                  <div style={{flex:1}}>
                    <FileUpload label="Upload Profile Photo" category="personal" subKey="photo" apiFetch={apiFetch} value={photoKey} onChange={(k)=>{setPhotoKey(k);isDirtyRef.current=true;}} accept="image/*"/>
                    <p style={{fontSize:"0.72rem",color:"#334155",marginTop:4}}>JPG or PNG, max 5MB</p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="section-card teal">
                <div className="section-head"><div className="section-icon teal">✏️</div><span className="section-title">Full Name</span></div>
                <div className="field-row">
                  <F label="First Name" value={firstName} onChange={dirty(setFirstName)}/>
                  <F label="Middle Name" value={middleName} onChange={dirty(setMiddleName)}/>
                  <F label="Last Name" value={lastName} onChange={dirty(setLastName)}/>
                </div>
              </div>

              {/* Father Name */}
              <div className="section-card purple">
                <div className="section-head"><div className="section-icon purple">👨</div><span className="section-title">Father's Name</span></div>
                <div className="field-row">
                  <F label="First Name" value={fatherFirst} onChange={dirty(setFatherFirst)}/>
                  <F label="Middle Name" value={fatherMiddle} onChange={dirty(setFatherMiddle)}/>
                  <F label="Last Name" value={fatherLast} onChange={dirty(setFatherLast)}/>
                </div>
              </div>

              {/* Mother Name */}
              <div className="section-card rose">
                <div className="section-head"><div className="section-icon rose">👩</div><span className="section-title">Mother's Name</span></div>
                <div className="field-row">
                  <F label="First Name" value={motherFirst} onChange={dirty(setMotherFirst)}/>
                  <F label="Middle Name" value={motherMiddle} onChange={dirty(setMotherMiddle)}/>
                  <F label="Last Name" value={motherLast} onChange={dirty(setMotherLast)}/>
                </div>
              </div>

              {/* Personal Info */}
              <div className="section-card amber">
                <div className="section-head"><div className="section-icon amber">🪪</div><span className="section-title">Personal Information</span></div>
                <div className="field-row">
                  <F label="Date of Birth" value={dob} onChange={dirty(setDob)} type="date"/>
                  <FS label="Gender" value={gender} onChange={dirty(setGender)} options={["Male","Female","Other"]}/>
                  <F label="Nationality" value={nationality} onChange={dirty(setNationality)}/>
                </div>
                <div className="field-row">
                  <div className="field">
                    <span className="field-label">Email <span style={{color:"#f87171"}}>*</span></span>
                    <input className="field-input" value={email} disabled/>
                  </div>
                  <div className="field">
                    <span className="field-label">Mobile Number <span style={{color:"#f87171"}}>*</span></span>
                    <div style={{display:"flex",gap:"0.5rem"}}>
                      <input className="field-input" value="+91" disabled style={{maxWidth:56}}/>
                      <input className="field-input" value={mobile} disabled style={{flex:1}}/>
                    </div>
                  </div>
                  <F label="Passport Number" value={passport} onChange={dirty(setPassport)}/>
                </div>
                <div className="field-row">
                  <FS label="Blood Group" value={bloodGroup} onChange={dirty(setBloodGroup)} options={["A+","A-","B+","B-","AB+","AB-","O+","O-"]}/>
                  <div className="field" style={{flex:2}}/>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="section-card rose">
                <div className="section-head"><div className="section-icon rose">🚨</div><span className="section-title">Emergency Contact</span></div>
                <div className="field-row">
                  <F label="Contact Name" value={emergName} onChange={dirty(setEmergName)}/>
                  <F label="Relationship" value={emergRel} onChange={dirty(setEmergRel)} placeholder="e.g. Spouse, Parent"/>
                  <F label="Phone Number" value={emergPhone} onChange={(v)=>{dirty(setEmergPhone)(v.replace(/\D/g,"").slice(0,10));}} placeholder="10-digit mobile"/>
                </div>
              </div>

              {/* Identity Documents */}
              <div className="section-card green">
                <div className="section-head"><div className="section-icon green">📄</div><span className="section-title">Identity Documents</span></div>
                <div className="field-row">
                  <div className="field">
                    <F label="Aadhaar Number" value={aadhar} onChange={(v)=>{const d=v.replace(/\D/g,"");if(d.length<=12){dirty(setAadhar)(d);}}} required={true}/>
                    {aadhar&&aadhar.length!==12&&<span className="field-error">Must be 12 digits</span>}
                    <div style={{marginTop:"0.75rem"}}>
                      <FileUpload label="Upload Aadhaar Card" category="personal" subKey="aadhaar" apiFetch={apiFetch} value={aadhaarKey} onChange={(k)=>{setAadhaarKey(k);isDirtyRef.current=true;}}/>
                    </div>
                  </div>
                  <div className="field">
                    <F label="PAN Number" value={pan} onChange={(v)=>{let val=v.toUpperCase();if(val.length<=5)val=val.replace(/[^A-Z]/g,"");else if(val.length<=9)val=val.slice(0,5)+val.slice(5).replace(/[^0-9]/g,"");else if(val.length<=10)val=val.slice(0,5)+val.slice(5,9)+val.slice(9).replace(/[^A-Z]/g,"");dirty(setPan)(val);}}/>
                    {pan&&pan.length!==10&&<span className="field-error">Format: AAAAA9999A</span>}
                    <div style={{marginTop:"0.75rem"}}>
                      <FileUpload label="Upload PAN Card" category="personal" subKey="pan" apiFetch={apiFetch} value={panKey} onChange={(k)=>{setPanKey(k);isDirtyRef.current=true;}}/>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Address */}
              <div className="section-card blue">
                <div className="section-head"><div className="section-icon blue">🏠</div><span className="section-title">Current Address</span></div>
                <div className="field-row">
                  <F label="Residing From" value={curFrom} onChange={dirty(setCurFrom)} type="date"/>
                  <F label="Residing To" value={curTo} onChange={dirty(setCurTo)} type="date"/>
                </div>
                <div className="field-row">
                  <F label="Door No. & Street" value={curDoor} onChange={dirty(setCurDoor)} placeholder="e.g. 12/3, MG Road"/>
                </div>
                <div className="field-row">
                  <F label="Village / Area" value={curVillage} onChange={dirty(setCurVillage)} placeholder="Village or Area name"/>
                  <F label="Tehsil / Taluk / Mandal" value={curLocality} onChange={dirty(setCurLocality)} placeholder="Local administrative unit"/>
                </div>
                <div className="field-row">
                  <F label="District" value={curDistrict} onChange={dirty(setCurDistrict)} placeholder="e.g. Bengaluru Urban"/>
                  <F label="State" value={curState} onChange={dirty(setCurState)} placeholder="e.g. Karnataka"/>
                  <F label="Pincode" value={curPin} onChange={(v)=>dirty(setCurPin)(v.replace(/\D/g,"").slice(0,6))} placeholder="6-digit PIN"/>
                </div>
              </div>

              {/* Permanent Address */}
              <div className="section-card teal">
                <div className="section-head"><div className="section-icon teal">📍</div><span className="section-title">Permanent Address</span></div>
                <div className="field-row">
                  <F label="Residing From" value={permFrom} onChange={dirty(setPermFrom)} type="date"/>
                  <div className="field"/>
                </div>
                <div className="field-row">
                  <F label="Door No. & Street" value={permDoor} onChange={dirty(setPermDoor)} placeholder="e.g. 12/3, MG Road"/>
                </div>
                <div className="field-row">
                  <F label="Village / Area" value={permVillage} onChange={dirty(setPermVillage)} placeholder="Village or Area name"/>
                  <F label="Tehsil / Taluk / Mandal" value={permLocality} onChange={dirty(setPermLocality)} placeholder="Local administrative unit"/>
                </div>
                <div className="field-row">
                  <F label="District" value={permDistrict} onChange={dirty(setPermDistrict)} placeholder="e.g. Visakhapatnam"/>
                  <F label="State" value={permState} onChange={dirty(setPermState)} placeholder="e.g. Andhra Pradesh"/>
                  <F label="Pincode" value={permPin} onChange={(v)=>dirty(setPermPin)(v.replace(/\D/g,"").slice(0,6))} placeholder="6-digit PIN"/>
                </div>
              </div>

              {/* Save bar */}
              <div className="save-bar">
                <span className={`save-status${saveStatus==="Saved ✓"?" ok":saveStatus.startsWith("Error")?" err":""}`}>{saveStatus}</span>
                <button className="save-btn" onClick={handleSave}>Save & Continue →</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Field helpers ─────────────────────────────────────────────────── */
function F({label,value,onChange,type="text",placeholder="",required=true}){
  return(
    <div className="field">
      <span className="field-label">{label}{required&&<span style={{color:"#f87171",marginLeft:2}}>*</span>}</span>
      <input className="field-input" type={type} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)}/>
    </div>
  );
}
function FS({label,value,onChange,options,required=true}){
  return(
    <div className="field">
      <span className="field-label">{label}{required&&<span style={{color:"#f87171",marginLeft:2}}>*</span>}</span>
      <select className="field-input" value={value} onChange={e=>onChange(e.target.value)}
        style={{background:"rgba(255,255,255,0.05)",color:value?"#e2e8f0":"#1e3a5f"}}>
        <option value="">Select</option>
        {options.map(o=><option key={o} value={o} style={{background:"#0f1a2e",color:"#e2e8f0"}}>{o}</option>)}
      </select>
    </div>
  );
}
