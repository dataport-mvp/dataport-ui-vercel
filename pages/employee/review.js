// pages/employee/review.js  — Page 5 of 5
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const STEP_COLOR  = "#16a34a";
const STEP_SHADOW = "rgba(22,163,74,0.35)";
const STEP_DONE_BG = "#2a2460";
const STEP_DONE_CK = "#a78bfa";
const STEP_CONN   = "#a78bfa";

const STEPS = [
  { n:1, label:"Personal",   icon:"👤", path:"/employee/personal"  },
  { n:2, label:"Education",  icon:"🎓", path:"/employee/education" },
  { n:3, label:"Employment", icon:"💼", path:"/employee/previous"  },
  { n:4, label:"UAN",        icon:"🏦", path:"/employee/uan"       },
  { n:5, label:"Review",     icon:"📋", path:"/employee/review"    },
];
const ACCENTS = {
  1:"#4f46e5", 2:"#d97706", 3:"#7c3aed", 4:"#0891b2", 5:"#16a34a"
};

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

  .sc { background: #ffffff; border-radius: 16px; padding: 1.5rem 1.6rem;
    margin-bottom: 1.1rem; box-shadow: 0 6px 28px rgba(30,26,62,0.22), 0 2px 8px rgba(30,26,62,0.12);
    border: 1px solid rgba(255,255,255,0.85); position: relative; overflow: hidden; }
  .sc::before { content:''; position:absolute; top:0; left:0; bottom:0;
    width:4px; border-radius:16px 0 0 16px; }
  .sc.ind::before { background:#4f46e5; }
  .sc.amb::before { background:#d97706; }
  .sc.vio::before { background:#7c3aed; }
  .sc.cyn::before { background:#0891b2; }
  .sc.grn::before { background:#16a34a; }
  .sc.ros::before { background:#e11d48; }

  .sh { display:flex; align-items:center; gap:0.6rem; margin-bottom:1.15rem; }
  .si { width:32px; height:32px; border-radius:8px; display:flex;
    align-items:center; justify-content:center; font-size:0.95rem; flex-shrink:0; }
  .si.ind{background:#eef2ff;} .si.amb{background:#fffbeb;} .si.vio{background:#f5f3ff;}
  .si.cyn{background:#ecfeff;} .si.grn{background:#f0fdf4;} .si.ros{background:#fff1f2;}
  .st { font-size:0.93rem; font-weight:700; color:#1e293b; }

  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:0.7rem; }
  .kv { display:flex; flex-direction:column; gap:0.15rem; }
  .kv-label { font-size:0.67rem; font-weight:700; color:#8b88b0; letter-spacing:0.55px; text-transform:uppercase; }
  .kv-val { font-size:0.875rem; font-weight:600; color:#1a1730; }
  .kv-val.empty { color:#b8b4d4; font-style:italic; font-weight:400; }

  .edit-link { font-size:0.72rem; font-weight:700; color:#4f46e5; cursor:pointer; margin-left:auto;
    background:none; border:none; font-family:inherit; padding:0.2rem 0.6rem; border-radius:6px;
    transition:all 0.15s; }
  .edit-link:hover { background:#eef2ff; }

  .missing-banner { background:#fff8f0; border:1.5px solid #fbbf24; border-radius:12px;
    padding:1rem 1.25rem; margin-bottom:1.1rem; }
  .missing-banner h4 { color:#92400e; font-size:0.875rem; font-weight:800; margin-bottom:0.5rem; }
  .missing-item { display:flex; align-items:center; gap:0.5rem; padding:0.3rem 0;
    font-size:0.82rem; color:#78350f; font-weight:600; cursor:pointer; }
  .missing-item:hover { color:#4f46e5; text-decoration:underline; }

  .ack-box { display:flex; align-items:flex-start; gap:0.75rem; padding:0.8rem 0; border-bottom:1px solid #f0eef8; }
  .ack-box:last-child { border-bottom:none; }
  .ack-check { width:20px; height:20px; border-radius:5px; border:2px solid #b8b4d4;
    background:#ececf9; cursor:pointer; flex-shrink:0; margin-top:1px;
    display:flex; align-items:center; justify-content:center; transition:all 0.15s; }
  .ack-check.checked { background:#16a34a; border-color:#16a34a; }
  .ack-text { font-size:0.84rem; color:#3d3a5c; line-height:1.55; font-weight:500; }

  .sbar { display:flex; justify-content:space-between; align-items:center;
    margin-top:1.5rem; padding:1rem 1.5rem; background:#1e1a3e;
    border-radius:12px; box-shadow:0 6px 28px rgba(30,26,62,0.22); border:1px solid rgba(255,255,255,0.1); }
  .ss { font-size:0.84rem; color:#9d9bc4; font-weight:500; }
  .ss.ok { color:#16a34a; } .ss.err { color:#ef4444; }
  .pbtn { padding:0.72rem 1.9rem; background:#16a34a; color:#fff; border:none;
    border-radius:10px; font-family:inherit; font-size:0.875rem; font-weight:700;
    cursor:pointer; transition:all 0.2s; box-shadow:0 4px 14px rgba(22,163,74,0.28); }
  .pbtn:hover:not(:disabled) { background:#15803d; transform:translateY(-1px); }
  .pbtn:disabled { opacity:0.6; cursor:not-allowed; }
  .sbtn { padding:0.72rem 1.5rem; background:transparent; color:#9d9bc4;
    border:1.5px solid #2d2860; border-radius:10px; font-family:inherit;
    font-size:0.875rem; font-weight:600; cursor:pointer; transition:all 0.2s; }
  .sbtn:hover { color:#a78bfa; border-color:#a78bfa; }

  @media(max-width:640px){
    .grid { grid-template-columns:1fr 1fr; }
    .topbar { flex-direction:column; gap:0.6rem; align-items:flex-start; position:relative; }
  }
`;

// ─── StepNav (inline, 5 steps) ─────────────────────────────────────
function StepNav({ current, onNavigate }) {
  return (
    <div style={{background:"#fff",borderRadius:14,padding:"1.1rem 0.5rem",marginBottom:"1.6rem",
      display:"flex",alignItems:"center",justifyContent:"center",overflowX:"auto",
      boxShadow:"0 6px 28px rgba(30,26,62,0.22), 0 2px 8px rgba(30,26,62,0.12)"}}>
      {STEPS.map((s,i)=>{
        const isDone=current>s.n, isActive=current===s.n;
        const col=ACCENTS[s.n];
        return(
          <div key={s.n} style={{display:"flex",alignItems:"center"}}>
            <button onClick={()=>onNavigate(s.path)}
              style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.3rem",
                background:"none",border:"none",cursor:"pointer",padding:"0.2rem 0.75rem"}}>
              <div style={{width:40,height:40,borderRadius:"50%",display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:"1rem",transition:"all 0.25s",
                background:isActive?col:isDone?STEP_DONE_BG:"#f2f1f9",
                border:isActive?`2px solid ${col}`:isDone?`2px solid ${STEP_CONN}`:"2px solid #e4e2ed",
                boxShadow:isActive?`0 4px 12px ${STEP_SHADOW}`:"none"}}>
                {isDone?<span style={{color:STEP_DONE_CK,fontWeight:800,fontSize:"0.9rem"}}>✓</span>
                  :<span style={{fontSize:"1rem",filter:isActive?"brightness(0) invert(1)":"none"}}>{s.icon}</span>}
              </div>
              <span style={{fontSize:"0.67rem",fontWeight:700,letterSpacing:"0.6px",textTransform:"uppercase",whiteSpace:"nowrap",
                color:isActive?col:isDone?STEP_DONE_CK:"#8b88b0"}}>{s.label}</span>
            </button>
            {i<STEPS.length-1&&(
              <div style={{width:38,height:2,background:current>s.n?STEP_CONN:"#ccc9e4",
                margin:"0 -0.25rem",marginBottom:"1.4rem",borderRadius:2,flexShrink:0}}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Aadhaar masking for display ──────────────────────────────────
function maskAadhaar(a) {
  if (!a) return "—";
  const d = String(a).replace(/\D/g, "");
  if (d.length === 4) return `XXXX XXXX ${d}`;          // already stored masked
  if (d.length === 12) return `XXXX XXXX ${d.slice(-4)}`; // full number still in state
  return `XXXX XXXX ${d}`;                               // fallback
}

// ─── KV display ────────────────────────────────────────────────────
function KV({ label, value }) {
  return (
    <div className="kv">
      <span className="kv-label">{label}</span>
      <span className={`kv-val${!value?" empty":""}`}>{value || "—"}</span>
    </div>
  );
}

// ─── Section header with Edit button ──────────────────────────────
function SectionHead({ icon, title, colorClass, onEdit }) {
  return (
    <div className="sh">
      <div className={`si ${colorClass}`}>{icon}</div>
      <span className="st">{title}</span>
      <button className="edit-link" onClick={onEdit}>✏️ Edit</button>
    </div>
  );
}

// ─── Acknowledgement statements ───────────────────────────────────
const ACK_STATEMENTS = [
  "I confirm that all information provided in this profile is true and accurate to the best of my knowledge.",
  "I understand that any false, misleading, or incomplete information may result in rejection of my application or termination of employment.",
  "I consent to Datagate and its authorised partners verifying the details I have provided, including background checks.",
  "I authorise Datagate to retain and process my personal data for the purposes of onboarding and background verification.",
  "I acknowledge that I have read and understood the terms, and I take full responsibility for the accuracy of this submission.",
];

// ─── Validation: what is missing per page ─────────────────────────
function getMissingFields(d) {
  const issues = [];

  // Page 1 — Personal
  const p1 = [];
  if (!d.firstName)   p1.push("First Name");
  if (!d.lastName)    p1.push("Last Name");
  if (!d.dob)         p1.push("Date of Birth");
  if (!d.gender)      p1.push("Gender");
  if (!d.nationality) p1.push("Nationality");
  if (!d.mobile)      p1.push("Mobile");
  if (!(d.aadhaar || d.aadhar)) p1.push("Aadhaar Number");
  if (!d.pan)         p1.push("PAN Number");
  if (!d.aadhaarKey)  p1.push("Aadhaar Document Upload");
  if (!d.panKey)      p1.push("PAN Document Upload");
  if (!d.photoKey)    p1.push("Profile Photo");
  const cur = d.currentAddress || {};
  if (!cur.door)      p1.push("Current Address – Door No.");
  if (!cur.district)  p1.push("Current Address – District");
  if (!cur.state)     p1.push("Current Address – State");
  if (!cur.pin)       p1.push("Current Address – Pincode");
  if (p1.length) issues.push({ step: 1, label: "Personal Details", path: "/employee/personal", fields: p1 });

  // Page 2 — Education
  // education.js saves nested: { classX: { school, yearOfPassing, resultValue, certKey },
  //   intermediate: { college, ... }, undergraduate: { college, course, provKey, ... } }
  const p2 = [];
  const edu = d.education || {};
  const x   = edu.classX        || {};
  const inter = edu.intermediate  || {};
  const ug  = edu.undergraduate  || {};
  if (!x.school)          p2.push("Class X – School Name");
  if (!x.yearOfPassing)   p2.push("Class X – Year");
  if (!x.resultValue)     p2.push("Class X – Result");
  if (!x.certKey)         p2.push("Class X – Document Upload");
  if (!inter.college)     p2.push("Intermediate – College Name");
  if (!inter.yearOfPassing) p2.push("Intermediate – Year");
  if (!inter.resultValue) p2.push("Intermediate – Result");
  if (!inter.certKey)     p2.push("Intermediate – Document Upload");
  if (!ug.college)        p2.push("UG – College Name");
  if (!ug.course)         p2.push("UG – Degree / Course");
  if (!ug.yearOfPassing)  p2.push("UG – Year");
  if (!ug.resultValue)    p2.push("UG – Result");
  if (ug.backlogs !== "Yes" && !ug.provKey) p2.push("UG – Provisional Marksheet Upload");
  if (p2.length) issues.push({ step: 2, label: "Education", path: "/employee/education", fields: p2 });

  // Page 3 — Employment (only if they have employment history)
  const emp = d.employmentHistory || [];
  if (emp.length > 0) {
    const p3 = [];
    emp.forEach((e, idx) => {
      const n = `Employer ${idx + 1}`;
      if (!e.companyName)     p3.push(`${n} – Company Name`);
      if (!e.designation)     p3.push(`${n} – Designation`);
      if (!e.employmentType)  p3.push(`${n} – Employment Type`);
      // documents is lowercase (as saved by previous.js)
      if (!e.documents?.offerLetterKey)    p3.push(`${n} – Offer Letter`);
      if (!e.documents?.experienceKey)     p3.push(`${n} – Experience Letter`);
      if (idx === 0 && !e.documents?.resignationKey) p3.push(`${n} – Resignation Acceptance`);
    });
    if (p3.length) issues.push({ step: 3, label: "Employment History", path: "/employee/previous", fields: p3 });
  }

  // Page 4 — UAN
  const p4 = [];
  if (d.hasUan === "yes" || d.hasUan === true) {
    if (!d.uanNumber)  p4.push("UAN Number");
    if (!d.epfoKey)  p4.push("UAN Card Upload");
  }
  if (p4.length) issues.push({ step: 4, label: "UAN Details", path: "/employee/uan", fields: p4 });

  return issues;
}

// ─── Main Page ─────────────────────────────────────────────────────
export default function ReviewPage() {
  const router = useRouter();
  const { user, apiFetch, logout, ready } = useAuth();
  const [draft, setDraft]         = useState(null);
  const [empHistory, setEmpHistory] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [acks, setAcks]           = useState(Array(ACK_STATEMENTS.length).fill(false));
  const [saveStatus, setSaveStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSignout, setShowSignout] = useState(false);
  const [missingIssues, setMissingIssues] = useState([]);

  // Role guard
  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/employee/login"); return; }
    if (user.role !== "employee") { router.replace("/employee/login"); return; }
  }, [ready, user, router]);

  const loadData = useCallback(async () => {
    try {
      const dRes = await apiFetch(`${API}/employee/draft`);
      if (dRes.ok) {
        const d = await dRes.json();
        setDraft(d);
        // Pre-fill acks if previously saved
        if (d.acknowledgements_profile) {
          const saved = d.acknowledgements_profile;
          // Handle both array (legacy) and dict (current) format
          if (Array.isArray(saved)) {
            setAcks(ACK_STATEMENTS.map((_, i) => !!saved[i]));
          } else if (typeof saved === "object") {
            setAcks(ACK_STATEMENTS.map((_, i) => !!saved[String(i)]));
          }
        }
        // Fetch employment history using employee_id (same as previous.js)
        if (d.employee_id) {
          try {
            const eRes = await apiFetch(`${API}/employee/employment-history/${d.employee_id}`);
            if (eRes.ok) {
              const ed = await eRes.json();
              // previous.js saves as { employments: [...], acknowledgements: {...} }
              const emps = ed.employments || (Array.isArray(ed) ? ed : (ed.items || []));
              setEmpHistory(emps);
            }
          } catch (_) {}
        }
      }
    } catch (_) {}
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => { if (ready && user) loadData(); }, [ready, user, loadData]);

  // Recompute missing whenever draft / empHistory changes
  useEffect(() => {
    if (!draft) return;
    const d = { ...draft, employmentHistory: empHistory };
    setMissingIssues(getMissingFields(d));
  }, [draft, empHistory]);

  const handleNavigate = (path) => { router.push(path); };

  const toggleAck = (i) => {
    setAcks(prev => { const n=[...prev]; n[i]=!n[i]; return n; });
  };
  const allAcked = acks.every(Boolean);

  const handleSubmit = async () => {
    // 1. Check missing fields
    if (missingIssues.length > 0) {
      const msg = missingIssues.map(p =>
        `Page ${p.step} (${p.label}): ${p.fields.slice(0,3).join(", ")}${p.fields.length>3?" & more":""}`
      ).join(" · ");
      setSaveStatus(`⚠️ Incomplete: ${msg}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // 2. Check acknowledgements
    if (!allAcked) {
      setSaveStatus("⚠️ Please accept all acknowledgements below before submitting.");
      document.getElementById("ack-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSubmitting(true);
    setSaveStatus("Submitting…");
    // Convert acks [true,false,...] → {"0":true,"1":false,...} — Pydantic expects dict not array
    const acksDict = Object.fromEntries(acks.map((v, i) => [String(i), v]));
    // Sanitize pfRecords: Pydantic PFRecord has all required fields — strip incomplete entries
    const safePfRecords = (Array.isArray(draft?.pfRecords) ? draft.pfRecords : [])
      .filter(r => r.companyName && r.pfMemberId && r.dojEpfo && r.doeEpfo && r.pfTransferred != null);
    try {
      const res = await apiFetch(`${API}/employee`, {
        method: "POST",
        body: JSON.stringify({
          ...draft,
          pfRecords: safePfRecords,
          status: "submitted",
          submitted_at: Date.now(),
          acknowledgements_profile: acksDict,
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const detail = errBody?.detail;
        let msg = "Submission failed";
        if (Array.isArray(detail)) {
          msg = detail.map(e => `${e.loc?.slice(-1)[0] || "field"}: ${e.msg}`).join(", ");
        } else if (typeof detail === "string") {
          msg = detail;
        }
        throw new Error(msg);
      }
      setSaveStatus("Submitted ✓");
      // Brief pause then show success state
      setTimeout(() => router.push("/employee/submitted"), 1200);
    } catch (err) {
      setSaveStatus(`Error: ${err.message}`);
    }
    setSubmitting(false);
  };

  if (!ready || !user) return null;
  if (loading) return (
    <div style={{minHeight:"100vh",background:"#cdd2ed",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p style={{color:"#8b88b0",fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:500}}>Loading your profile…</p>
    </div>
  );

  const d = draft || {};
  const cur  = d.currentAddress   || {};
  const perm = d.permanentAddress || {};
  const edu  = d.education        || {};

  return (
    <>
      <style>{G}</style>
      <div className="pg">
        {showSignout && (
          <div style={{position:"fixed",inset:0,background:"rgba(15,12,40,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(3px)"}}>
            <div style={{background:"#fff",borderRadius:18,padding:"2rem",maxWidth:340,width:"90%",textAlign:"center"}}>
              <div style={{fontSize:34,marginBottom:"0.75rem"}}>👋</div>
              <h3 style={{margin:"0 0 0.4rem",color:"#1a1730",fontWeight:800}}>Sign out?</h3>
              <p style={{color:"#6b6894",fontSize:"0.875rem",marginBottom:"1.5rem"}}>Your progress is saved. You can continue anytime.</p>
              <div style={{display:"flex",gap:"0.75rem"}}>
                <button onClick={()=>setShowSignout(false)} style={{flex:1,padding:"0.7rem",borderRadius:9,border:"1.5px solid #dddaf0",background:"inherit",cursor:"pointer",fontWeight:600,color:"#6b6894",fontFamily:"inherit",fontSize:"0.875rem"}}>Stay</button>
                <button onClick={()=>logout()} style={{flex:1,padding:"0.7rem",borderRadius:9,border:"none",background:"#ef4444",color:"#fff",cursor:"pointer",fontWeight:700,fontFamily:"inherit",fontSize:"0.875rem"}}>Sign out</button>
              </div>
            </div>
          </div>
        )}

        <div className="topbar">
          <span className="logo-text">Datagate</span>
          <div className="topbar-right">
            <span className="user-name">👤 {user.name || user.email}</span>
            <button className="signout-btn" onClick={()=>setShowSignout(true)}>Sign out</button>
          </div>
        </div>

        <div className="wrap">
          <StepNav current={5} onNavigate={handleNavigate} />

          {/* ── Self-attested notice ── */}
          <div style={{background:"#f0f9ff",border:"1.5px solid #bae6fd",borderRadius:12,padding:"0.85rem 1.1rem",marginBottom:"1.1rem",fontSize:"0.78rem",color:"#0c4a6e",lineHeight:1.6}}>
            ℹ️ <strong>Self-reported profile.</strong> All information you submit is your own declaration. Please ensure everything is accurate — false or misleading information may result in rejection of your application or termination of employment.
          </div>
          {missingIssues.length > 0 && (
            <div className="missing-banner">
              <h4>⚠️ {missingIssues.reduce((a,p)=>a+p.fields.length,0)} field{missingIssues.reduce((a,p)=>a+p.fields.length,0)>1?"s":""} still required across {missingIssues.length} page{missingIssues.length>1?"s":""}</h4>
              {missingIssues.map(p => (
                <div key={p.step} className="missing-item" onClick={() => router.push(p.path)}>
                  <span style={{fontSize:"0.8rem"}}>→</span>
                  <span>
                    <strong>Page {p.step} – {p.label}:</strong>{" "}
                    {p.fields.slice(0,4).join(", ")}{p.fields.length>4?` +${p.fields.length-4} more`:""}
                  </span>
                </div>
              ))}
              <p style={{fontSize:"0.72rem",color:"#92400e",marginTop:"0.6rem",fontWeight:500}}>Click any item above to go back and fill it in.</p>
            </div>
          )}

          {/* ── Page 1: Personal ── */}
          <div className="sc ind">
            <SectionHead icon="👤" title="Personal Details" colorClass="ind" onEdit={()=>router.push("/employee/personal")} />
            <div className="grid">
              <KV label="Full Name"   value={[d.firstName,d.middleName,d.lastName].filter(Boolean).join(" ")} />
              <KV label="Date of Birth" value={d.dob} />
              <KV label="Gender"      value={d.gender} />
              <KV label="Nationality" value={d.nationality} />
              <KV label="Mobile"      value={d.mobile} />
              <KV label="Email"       value={d.email} />
              <KV label="Aadhaar"     value={maskAadhaar(d.aadhaar||d.aadhar)} />
              <KV label="PAN"         value={d.pan} />
              <KV label="Passport"       value={d.passport} />
              <KV label="Blood Group"    value={d.bloodGroup} />
              <KV label="Marital Status" value={d.maritalStatus} />
            </div>
            {(d.fatherFirst||d.fatherLast) && (
              <div style={{marginTop:"0.9rem",paddingTop:"0.9rem",borderTop:"1px solid #f0eef8"}}>
                <div style={{fontSize:"0.7rem",fontWeight:700,color:"#8b88b0",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.5rem"}}>Family</div>
                <div className="grid">
                  <KV label="Father's Name" value={[d.fatherFirst,d.fatherMiddle,d.fatherLast].filter(Boolean).join(" ")} />
                  <KV label="Mother's Name" value={[d.motherFirst,d.motherMiddle,d.motherLast].filter(Boolean).join(" ")} />
                </div>
              </div>
            )}
            {(d.emergName||d.emergPhone) && (
              <div style={{marginTop:"0.9rem",paddingTop:"0.9rem",borderTop:"1px solid #f0eef8"}}>
                <div style={{fontSize:"0.7rem",fontWeight:700,color:"#8b88b0",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.5rem"}}>Emergency Contact</div>
                <div className="grid">
                  <KV label="Name"         value={d.emergName} />
                  <KV label="Relationship" value={d.emergRel} />
                  <KV label="Phone"        value={d.emergPhone} />
                </div>
              </div>
            )}
            <div style={{marginTop:"0.9rem",paddingTop:"0.9rem",borderTop:"1px solid #f0eef8"}}>
              <div style={{fontSize:"0.7rem",fontWeight:700,color:"#8b88b0",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.5rem"}}>Current Address</div>
              <div className="grid">
                <KV label="Door / Street" value={cur.door} />
                <KV label="Village / Area" value={cur.village} />
                <KV label="Tehsil / Taluk" value={cur.locality} />
                <KV label="District" value={cur.district} />
                <KV label="State"    value={cur.state} />
                <KV label="Pincode"  value={cur.pin} />
              </div>
            </div>
            {(perm.door||perm.state) && (
              <div style={{marginTop:"0.9rem",paddingTop:"0.9rem",borderTop:"1px solid #f0eef8"}}>
                <div style={{fontSize:"0.7rem",fontWeight:700,color:"#8b88b0",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.5rem"}}>Permanent / Native Address</div>
                <div className="grid">
                  <KV label="Door / Street" value={perm.door} />
                  <KV label="Village / Area" value={perm.village} />
                  <KV label="District" value={perm.district} />
                  <KV label="State"    value={perm.state} />
                  <KV label="Pincode"  value={perm.pin} />
                </div>
              </div>
            )}
          </div>

          {/* ── Page 2: Education ── */}
          <div className="sc amb">
            <SectionHead icon="🎓" title="Education" colorClass="amb" onEdit={()=>router.push("/employee/education")} />

            {[
              { title:"Class X",        keys:{ school:edu.classX?.school,       board:edu.classX?.board,       year:edu.classX?.yearOfPassing,  pct:edu.classX?.resultValue,  rtype:edu.classX?.resultType      } },
              { title:"Intermediate",   keys:{ school:edu.intermediate?.college, board:edu.intermediate?.board, year:edu.intermediate?.yearOfPassing, pct:edu.intermediate?.resultValue, rtype:edu.intermediate?.resultType } },
              { title:"Under Graduate", keys:{ school:edu.undergraduate?.college, board:edu.undergraduate?.university, year:edu.undergraduate?.yearOfPassing, pct:edu.undergraduate?.resultValue, degree:edu.undergraduate?.course, rtype:edu.undergraduate?.resultType } },
            ].map(sec => (
              <div key={sec.title} style={{marginBottom:"0.9rem",paddingBottom:"0.9rem",borderBottom:"1px solid #f0eef8"}}>
                <div style={{fontSize:"0.72rem",fontWeight:700,color:"#d97706",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.5rem"}}>{sec.title}</div>
                <div className="grid">
                  <KV label="Institution" value={sec.keys.school} />
                  {sec.keys.board && <KV label="Board / University" value={sec.keys.board} />}
                  {sec.keys.degree && <KV label="Degree / Course" value={sec.keys.degree} />}
                  <KV label="Year of Passing" value={sec.keys.year} />
                  <KV label={sec.keys.rtype || "Result"} value={sec.keys.pct} />
                </div>
              </div>
            ))}

            {edu.postgraduate?.college && (
              <div style={{marginBottom:"0.9rem",paddingBottom:"0.9rem",borderBottom:"1px solid #f0eef8"}}>
                <div style={{fontSize:"0.72rem",fontWeight:700,color:"#d97706",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.5rem"}}>Post Graduate</div>
                <div className="grid">
                  <KV label="College"    value={edu.postgraduate?.college} />
                  <KV label="University" value={edu.postgraduate?.university} />
                  <KV label="Degree"     value={edu.postgraduate?.course} />
                  <KV label="Year"       value={edu.postgraduate?.yearOfPassing} />
                  <KV label="Result"     value={edu.postgraduate?.resultValue} />
                </div>
              </div>
            )}

            {edu.diploma?.institute && (
              <div style={{marginBottom:"0.9rem"}}>
                <div style={{fontSize:"0.72rem",fontWeight:700,color:"#d97706",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.5rem"}}>Diploma / Technical</div>
                <div className="grid">
                  <KV label="Institution" value={edu.diploma?.institute} />
                  <KV label="Course"      value={edu.diploma?.course} />
                  <KV label="Year"        value={edu.diploma?.yearOfPassing} />
                </div>
              </div>
            )}

            {Array.isArray(edu.certifications) && edu.certifications.length > 0 && (
              <div>
                <div style={{fontSize:"0.72rem",fontWeight:700,color:"#d97706",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.5rem"}}>Certifications</div>
                {edu.certifications.map((c,i) => (
                  <div key={i} className="kv" style={{marginBottom:"0.4rem"}}>
                    <span className={`kv-val${!c.name?" empty":""}`}>{c.name||"—"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Page 3: Employment ── */}
          <div className="sc vio">
            <SectionHead icon="💼" title="Employment History" colorClass="vio" onEdit={()=>router.push("/employee/previous")} />
            {empHistory.length === 0 ? (
              <p style={{color:"#b8b4d4",fontSize:"0.875rem",fontStyle:"italic"}}>No employment history added.</p>
            ) : empHistory.map((e, idx) => (
              <div key={e.company_id||idx} style={{marginBottom:"0.9rem",paddingBottom:"0.9rem",borderBottom:"1px solid #f0eef8"}}>
                <div style={{fontSize:"0.72rem",fontWeight:700,color:"#7c3aed",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.5rem"}}>
                  {idx===0?"Current Employer":`Previous Employer ${idx}`}
                </div>
                <div className="grid">
                  <KV label="Company"     value={e.companyName} />
                  <KV label="Designation" value={e.designation} />
                  <KV label="Department"  value={e.department} />
                  <KV label="Employment Type" value={e.employmentType} />
                  {e.employmentType==="Contract" && <KV label="Vendor" value={e.contractVendor?.company} />}
                  <KV label="Work Email"  value={e.workEmail} />
                </div>
              </div>
            ))}
          </div>

          {/* ── Page 4: UAN ── */}
          <div className="sc cyn">
            <SectionHead icon="🏦" title="UAN / EPFO" colorClass="cyn" onEdit={()=>router.push("/employee/uan")} />
            <div className="grid">
              <KV label="Has UAN"  value={d.hasUan==="yes"||d.hasUan===true?"Yes":"No"} />
              {(d.hasUan==="yes"||d.hasUan===true) && <KV label="UAN Number" value={d.uanNumber} />}
            </div>
          </div>

          {/* ── Acknowledgements ── */}
          <div className="sc grn" id="ack-section">
            <div className="sh">
              <div className="si grn">✅</div>
              <span className="st">Acknowledgements</span>
              {allAcked && <span style={{marginLeft:"auto",fontSize:"0.72rem",fontWeight:700,color:"#16a34a"}}>All confirmed ✓</span>}
            </div>
            <p style={{fontSize:"0.78rem",color:"#6b6894",marginBottom:"1rem",lineHeight:1.55}}>
              Please read and confirm each statement before final submission.
            </p>
            {ACK_STATEMENTS.map((stmt, i) => (
              <div key={i} className="ack-box" onClick={()=>toggleAck(i)} style={{cursor:"pointer"}}>
                <div className={`ack-check${acks[i]?" checked":""}`}>
                  {acks[i] && <span style={{color:"#fff",fontWeight:800,fontSize:"0.75rem"}}>✓</span>}
                </div>
                <span className="ack-text">{stmt}</span>
              </div>
            ))}
          </div>

          {/* ── Save bar ── */}
          <div className="sbar">
            <div style={{display:"flex",flexDirection:"column",gap:"0.2rem"}}>
              {saveStatus && (
                <span className={`ss${saveStatus.includes("✓")?" ok":saveStatus.includes("⚠️")||saveStatus.startsWith("Error")?" err":""}`}>
                  {saveStatus}
                </span>
              )}
              {missingIssues.length===0 && allAcked && (
                <span className="ss ok" style={{fontSize:"0.75rem"}}>✓ Ready to submit</span>
              )}
            </div>
            <div style={{display:"flex",gap:"0.75rem"}}>
              <button className="sbtn" onClick={()=>router.push("/employee/uan")}>← Back</button>
              <button className="pbtn" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting…" : "Submit Profile →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}