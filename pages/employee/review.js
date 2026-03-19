// pages/employee/review.js  — Page 5 of 5
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const STEP_SHADOW  = "rgba(22,163,74,0.35)";
const STEP_DONE_BG = "#2a2460";
const STEP_DONE_CK = "#a78bfa";
const STEP_CONN    = "#a78bfa";

const STEPS = [
  { n:1, label:"Personal",   icon:"👤", path:"/employee/personal"  },
  { n:2, label:"Education",  icon:"🎓", path:"/employee/education" },
  { n:3, label:"Employment", icon:"💼", path:"/employee/previous"  },
  { n:4, label:"UAN",        icon:"🏦", path:"/employee/uan"       },
  { n:5, label:"Review",     icon:"📋", path:"/employee/review"    },
];
const ACCENTS = { 1:"#4f46e5", 2:"#d97706", 3:"#7c3aed", 4:"#0891b2", 5:"#16a34a" };

// ── Review-specific acknowledgements (different from page 3 employment declaration and page 4 acks)
const ACK_STATEMENTS = [
  "I confirm that I have reviewed all information across all sections of this profile and it is accurate and complete to the best of my knowledge.",
  "I authorise Datagate and its authorised verification partners to contact my previous employers, educational institutions, and references to verify the details I have submitted.",
  "I understand that this profile will be shared with a prospective employer only after I explicitly approve their consent request, and I retain the right to withdraw that approval at any time.",
  "I acknowledge that any material misrepresentation, falsification, or omission discovered at any stage — including after employment commences — may lead to immediate termination and possible legal action.",
  "I accept full responsibility for keeping my profile updated if any submitted information changes in the future.",
];

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
  .sc::before { content:''; position:absolute; top:0; left:0; bottom:0; width:4px; border-radius:16px 0 0 16px; }
  .sc.ind::before { background:#4f46e5; }
  .sc.amb::before { background:#d97706; }
  .sc.vio::before { background:#7c3aed; }
  .sc.cyn::before { background:#0891b2; }
  .sc.grn::before { background:#16a34a; }
  .sc.teal::before { background:#0d9488; }

  .sh { display:flex; align-items:center; gap:0.6rem; margin-bottom:1.15rem; }
  .si { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:0.95rem; flex-shrink:0; }
  .si.ind{background:#eef2ff;} .si.amb{background:#fffbeb;} .si.vio{background:#f5f3ff;}
  .si.cyn{background:#ecfeff;} .si.grn{background:#f0fdf4;} .si.teal{background:#f0fdfa;}
  .st { font-size:0.93rem; font-weight:700; color:#1e293b; }

  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:0.7rem; }
  .kv { display:flex; flex-direction:column; gap:0.15rem; }
  .kv-label { font-size:0.67rem; font-weight:700; color:#8b88b0; letter-spacing:0.55px; text-transform:uppercase; }
  .kv-val { font-size:0.875rem; font-weight:600; color:#1a1730; }
  .kv-val.empty { color:#b8b4d4; font-style:italic; font-weight:400; }

  .edit-link { font-size:0.72rem; font-weight:700; color:#4f46e5; cursor:pointer; margin-left:auto;
    background:none; border:none; font-family:inherit; padding:0.2rem 0.6rem; border-radius:6px; transition:all 0.15s; }
  .edit-link:hover { background:#eef2ff; }

  /* Attachment chip — clickable, opens in new tab */
  .att-chip { display:inline-flex; align-items:center; gap:0.35rem; padding:0.28rem 0.75rem;
    background:#eef2ff; border:1.5px solid #c7d2fe; border-radius:999px;
    font-size:0.72rem; font-weight:700; color:#4f46e5; cursor:pointer; text-decoration:none;
    transition:all 0.15s; white-space:nowrap; }
  .att-chip:hover { background:#e0e7ff; border-color:#818cf8; }
  .att-chip.missing { background:#fff5f5; border-color:#fecaca; color:#ef4444; cursor:default; }
  .att-grid { display:flex; flex-wrap:wrap; gap:0.45rem; margin-top:0.65rem; }

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

  .sec-divider { font-size:0.7rem; font-weight:700; color:#8b88b0; text-transform:uppercase;
    letter-spacing:0.5px; margin:0.9rem 0 0.5rem; padding-top:0.9rem; border-top:1px solid #f0eef8; }

  .sbar { display:flex; justify-content:space-between; align-items:center;
    margin-top:1.5rem; padding:1rem 1.5rem; background:#1e1a3e;
    border-radius:12px; box-shadow:0 6px 28px rgba(30,26,62,0.22); border:1px solid rgba(255,255,255,0.1); }
  .ss { font-size:0.84rem; color:#9d9bc4; font-weight:500; }
  .ss.ok { color:#4ade80; } .ss.err { color:#f87171; }
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

function StepNav({ current, onNavigate }) {
  return (
    <div style={{background:"#fff",borderRadius:14,padding:"1.1rem 0.5rem",marginBottom:"1.6rem",display:"flex",alignItems:"center",justifyContent:"center",overflowX:"auto",boxShadow:"0 6px 28px rgba(30,26,62,0.22), 0 2px 8px rgba(30,26,62,0.12)"}}>
      {STEPS.map((s,i)=>{
        const isDone=current>s.n, isActive=current===s.n, col=ACCENTS[s.n];
        return(
          <div key={s.n} style={{display:"flex",alignItems:"center"}}>
            <button onClick={()=>onNavigate(s.path)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.3rem",background:"none",border:"none",cursor:"pointer",padding:"0.2rem 0.75rem"}}>
              <div style={{width:40,height:40,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",transition:"all 0.25s",
                background:isActive?col:isDone?STEP_DONE_BG:"#f2f1f9",
                border:isActive?`2px solid ${col}`:isDone?`2px solid ${STEP_CONN}`:"2px solid #e4e2ed",
                boxShadow:isActive?`0 4px 12px ${STEP_SHADOW}`:"none"}}>
                {isDone?<span style={{color:STEP_DONE_CK,fontWeight:800,fontSize:"0.9rem"}}>✓</span>
                  :<span style={{fontSize:"1rem",filter:isActive?"brightness(0) invert(1)":"none"}}>{s.icon}</span>}
              </div>
              <span style={{fontSize:"0.67rem",fontWeight:700,letterSpacing:"0.6px",textTransform:"uppercase",whiteSpace:"nowrap",color:isActive?col:isDone?STEP_DONE_CK:"#8b88b0"}}>{s.label}</span>
            </button>
            {i<STEPS.length-1&&<div style={{width:38,height:2,background:current>s.n?STEP_CONN:"#ccc9e4",margin:"0 -0.25rem",marginBottom:"1.4rem",borderRadius:2,flexShrink:0}}/>}
          </div>
        );
      })}
    </div>
  );
}

function maskAadhaar(a) {
  if (!a) return "—";
  const d = String(a).replace(/\D/g, "");
  return `XXXX XXXX ${d.slice(-4)||d}`;
}
function maskAccount(last4) {
  if (!last4) return "—";
  return `XXXX XXXX XXXX ${last4}`;
}

function KV({ label, value }) {
  return (
    <div className="kv">
      <span className="kv-label">{label}</span>
      <span className={`kv-val${!value?" empty":""}`}>{value || "—"}</span>
    </div>
  );
}

function SectionHead({ icon, title, colorClass, onEdit }) {
  return (
    <div className="sh">
      <div className={`si ${colorClass}`}>{icon}</div>
      <span className="st">{title}</span>
      <button className="edit-link" onClick={onEdit}>✏️ Edit</button>
    </div>
  );
}

// ── Attachment chip — fetches signed URL and opens in new tab ──────────
function AttChip({ label, docKey, urls }) {
  if (!docKey) return <span className="att-chip missing">⚠ {label} missing</span>;
  const url = urls[docKey];
  if (!url) return <span className="att-chip" style={{opacity:0.6,cursor:"wait"}}>⏳ {label}</span>;
  return (
    <a className="att-chip" href={url} target="_blank" rel="noopener noreferrer">
      📎 {label}
    </a>
  );
}

// ── Missing fields validator ─────────────────────────────────────────
function getMissingFields(d, empHistory) {
  const issues = [];

  const p1 = [];
  if (!d.firstName)   p1.push("First Name");
  if (!d.lastName)    p1.push("Last Name");
  if (!d.dob)         p1.push("Date of Birth");
  if (!d.gender)      p1.push("Gender");
  if (!d.nationality) p1.push("Nationality");
  if (!d.mobile)      p1.push("Mobile");
  if (!(d.aadhaar || d.aadhar)) p1.push("Aadhaar Number");
  if (!d.nameAsPerAadhaar)      p1.push("Name as per Aadhaar");
  if (!d.pan)         p1.push("PAN Number");
  if (!d.nameAsPerPan) p1.push("Name as per PAN");
  if (!d.aadhaarKey)  p1.push("Aadhaar Document");
  if (!d.panKey)      p1.push("PAN Document");
  if (!d.photoKey)    p1.push("Profile Photo");
  const cur = d.currentAddress || {};
  if (!cur.door)      p1.push("Current Address – Door No.");
  if (!cur.district)  p1.push("Current Address – District");
  if (!cur.state)     p1.push("Current Address – State");
  if (!cur.pin)       p1.push("Current Address – Pincode");
  // Bank
  if (!d.bankName)        p1.push("Bank Name");
  if (!d.bankAccountName) p1.push("Name as per Bank Account");
  if (!d.ifsc)            p1.push("IFSC Code");
  if (!d.branch)          p1.push("Branch Name");
  if (!d.accountType)     p1.push("Account Type");
  if (!d.accountFull && !d.accountLast4) p1.push("Account Number");
  if (p1.length) issues.push({ step:1, label:"Personal Details", path:"/employee/personal", fields:p1 });

  const p2 = [];
  const edu = d.education || {};
  const x   = edu.classX        || {};
  const inter = edu.intermediate  || {};
  const ug  = edu.undergraduate  || {};
  if (!x.school)          p2.push("Class X – School Name");
  if (!x.yearOfPassing)   p2.push("Class X – Year");
  if (!x.resultValue)     p2.push("Class X – Result");
  if (!x.certKey)         p2.push("Class X – Document");
  if (!inter.college)     p2.push("Intermediate – College");
  if (!inter.yearOfPassing) p2.push("Intermediate – Year");
  if (!inter.resultValue) p2.push("Intermediate – Result");
  if (!inter.certKey)     p2.push("Intermediate – Document");
  if (!ug.college)        p2.push("UG – College Name");
  if (!ug.course)         p2.push("UG – Degree / Course");
  if (!ug.yearOfPassing)  p2.push("UG – Year");
  if (!ug.resultValue)    p2.push("UG – Result");
  if (ug.backlogs !== "Yes" && !ug.provKey) p2.push("UG – Provisional Marksheet");
  if (p2.length) issues.push({ step:2, label:"Education", path:"/employee/education", fields:p2 });

  if (empHistory.length > 0) {
    const p3 = [];
    empHistory.forEach((e, idx) => {
      const n = idx === 0 ? "Current Employer" : `Employer ${idx + 1}`;
      if (!e.companyName)    p3.push(`${n} – Company Name`);
      if (!e.designation)    p3.push(`${n} – Designation`);
      if (!e.startDate)      p3.push(`${n} – Date of Joining`);
      if (idx === 0 && !e.currentlyWorking) p3.push(`${n} – Currently Working?`);
      if (!e.documents?.offerLetterKey)  p3.push(`${n} – Offer Letter`);
      if (!e.documents?.experienceKey)   p3.push(`${n} – Experience Letter`);
      if (idx===0 && e.currentlyWorking==="No" && !e.documents?.resignationKey) p3.push(`${n} – Resignation Acceptance`);
    });
    if (p3.length) issues.push({ step:3, label:"Employment History", path:"/employee/previous", fields:p3 });
  }

  const p4 = [];
  if (d.hasUan === "yes" || d.hasUan === true) {
    if (!d.uanNumber) p4.push("UAN Number");
    if (!d.epfoKey)   p4.push("UAN Card Upload");
  }
  if (p4.length) issues.push({ step:4, label:"UAN Details", path:"/employee/uan", fields:p4 });

  return issues;
}

export default function ReviewPage() {
  const router = useRouter();
  const { user, apiFetch, logout, ready } = useAuth();
  const [draft,        setDraft]        = useState(null);
  const [empHistory,   setEmpHistory]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [acks,         setAcks]         = useState(Array(ACK_STATEMENTS.length).fill(false));
  const acksRestoredRef = useRef(false);
  const [profileEdited, setProfileEdited] = useState(false);
  // Capture ?edited=1 synchronously on first render — before router.replace cleans the URL
  const editedOnMount = useRef(
    typeof window !== "undefined" && window.location.search.includes("edited=1")
  );
  const [saveStatus,   setSaveStatus]   = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [showSignout,  setShowSignout]  = useState(false);
  const [missingIssues,setMissingIssues]= useState([]);
  // Signed URLs for attachments: { [docKey]: signedUrl }
  const [docUrls,      setDocUrls]      = useState({});

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/employee/login"); return; }
    if (user.role !== "employee") { router.replace("/employee/login"); return; }
  }, [ready, user, router]);

  // If user arrived with ?edited=1 — reset acks, show banner, clean URL
  useEffect(() => {
    if (editedOnMount.current) {
      setAcks(Array(ACK_STATEMENTS.length).fill(false));
      acksRestoredRef.current = false;
      setProfileEdited(true);
      router.replace("/employee/review", undefined, { shallow: true });
      editedOnMount.current = false; // consumed — clear so Back/forward nav works normally
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      const dRes = await apiFetch(`${API}/employee/draft`);
      if (dRes.ok) {
        const d = await dRes.json();
        setDraft(d);
        // Only restore acks if user did NOT arrive from editing a page
        if (!editedOnMount.current && d.acknowledgements_review && !acksRestoredRef.current) {
          const restored = ACK_STATEMENTS.map((_, i) => !!d.acknowledgements_review[String(i)]);
          if (restored.some(Boolean)) { setAcks(restored); acksRestoredRef.current = true; }
        }
        // Employment history
        if (d.employee_id) {
          try {
            const eRes = await apiFetch(`${API}/employee/employment-history/${d.employee_id}`);
            if (eRes.ok) {
              const ed = await eRes.json();
              const emps = ed.employments || (Array.isArray(ed) ? ed : (ed.items || []));
              setEmpHistory(emps);
            }
          } catch (_) {}
          // Fetch all document signed URLs
          try {
            const docRes = await apiFetch(`${API}/documents/${d.employee_id}`);
            if (docRes.ok) {
              const docData = await docRes.json();
              // Flatten all URLs into a key→url map
              const urls = {};
              const flatten = (obj, depth=0) => {
                if (!obj || typeof obj !== "object" || depth > 8) return;
                // Pattern 1: { key: "s3key", url: "https://..." }
                if (obj.key && obj.url) { urls[obj.key] = obj.url; return; }
                // Pattern 2: { s3_key: "s3key", url: "https://..." }
                if (obj.s3_key && obj.url) { urls[obj.s3_key] = obj.url; return; }
                // Pattern 3: { url: "https://...", key: ... } variations
                if (obj.url && typeof obj.url === "string") {
                  // Try to find any key-like field in the same object
                  const k = obj.key || obj.s3_key || obj.fileKey || obj.docKey;
                  if (k) { urls[k] = obj.url; }
                }
                if (Array.isArray(obj)) { obj.forEach(v => flatten(v, depth+1)); return; }
                Object.values(obj).forEach(v => flatten(v, depth+1));
              };
              flatten(docData);
              setDocUrls(urls);
            }
          } catch (_) {}
        }
      }
    } catch (_) {}
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => { if (ready && user) loadData(); }, [ready, user, loadData]);

  useEffect(() => {
    if (!draft) return;
    const d = { ...draft, employmentHistory: empHistory };
    setMissingIssues(getMissingFields(d, empHistory));
  }, [draft, empHistory]);

  const handleNavigate = (path) => { router.push(path); };
  const toggleAck = (i) => { setAcks(prev => { const n=[...prev]; n[i]=!n[i]; return n; }); };
  const allAcked = acks.every(Boolean);

  const handleSubmit = async () => {
    if (missingIssues.length > 0) {
      const msg = missingIssues.map(p => `Page ${p.step} (${p.label}): ${p.fields.slice(0,3).join(", ")}${p.fields.length>3?" & more":""}`).join(" · ");
      setSaveStatus(`⚠️ Incomplete: ${msg}`);
      window.scrollTo({ top:0, behavior:"smooth" });
      return;
    }
    if (!allAcked) {
      setSaveStatus("⚠️ Please accept all acknowledgements below before submitting.");
      document.getElementById("ack-section")?.scrollIntoView({ behavior:"smooth", block:"center" });
      return;
    }
    setSubmitting(true);
    setSaveStatus("Submitting…");
    const acksDict = Object.fromEntries(acks.map((v, i) => [String(i), v]));
    const safePfRecords = (Array.isArray(draft?.pfRecords) ? draft.pfRecords : [])
      .filter(r => r.companyName && (r.hasPf === "No" || (r.pfMemberId && r.dojEpfo && r.doeEpfo)));
    try {
      const res = await apiFetch(`${API}/employee`, {
        method: "POST",
        body: JSON.stringify({
          ...draft,
          pfRecords: safePfRecords,
          status: "submitted",
          submitted_at: Date.now(),
          acknowledgements_review: acksDict,
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const detail = errBody?.detail;
        let msg = "Submission failed";
        if (Array.isArray(detail)) msg = detail.map(e => `${e.loc?.slice(-1)[0]||"field"}: ${e.msg}`).join(", ");
        else if (typeof detail === "string") msg = detail;
        throw new Error(msg);
      }
      setSaveStatus("Submitted ✓");
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

  const d    = draft || {};
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
              <p style={{color:"#6b6894",fontSize:"0.875rem",marginBottom:"1.5rem"}}>Your progress is saved.</p>
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
          <StepNav current={5} onNavigate={handleNavigate}/>

          {/* Self-attested notice */}
          <div style={{background:"#f0f9ff",border:"1.5px solid #bae6fd",borderRadius:12,padding:"0.85rem 1.1rem",marginBottom:"1.1rem",fontSize:"0.78rem",color:"#0c4a6e",lineHeight:1.6}}>
            ℹ️ <strong>Self-reported profile.</strong> Please review every section carefully before submitting — false or misleading information may result in rejection or termination.
          </div>

          {missingIssues.length > 0 && (
            <div className="missing-banner">
              <h4>⚠️ {missingIssues.reduce((a,p)=>a+p.fields.length,0)} field{missingIssues.reduce((a,p)=>a+p.fields.length,0)>1?"s":""} still required across {missingIssues.length} page{missingIssues.length>1?"s":""}</h4>
              {missingIssues.map(p => (
                <div key={p.step} className="missing-item" onClick={() => router.push(p.path)}>
                  <span style={{fontSize:"0.8rem"}}>→</span>
                  <span><strong>Page {p.step} – {p.label}:</strong>{" "}{p.fields.slice(0,4).join(", ")}{p.fields.length>4?` +${p.fields.length-4} more`:""}</span>
                </div>
              ))}
              <p style={{fontSize:"0.72rem",color:"#92400e",marginTop:"0.6rem",fontWeight:500}}>Click any item above to go back and fill it in.</p>
            </div>
          )}

          {/* ── Page 1: Personal ──────────────────────────────────────── */}
          <div className="sc ind">
            <SectionHead icon="👤" title="Personal Details" colorClass="ind" onEdit={()=>router.push("/employee/personal")}/>
            <div className="grid">
              <KV label="Full Name"      value={[d.firstName,d.middleName,d.lastName].filter(Boolean).join(" ")}/>
              <KV label="Date of Birth"  value={d.dob}/>
              <KV label="Gender"         value={d.gender}/>
              <KV label="Nationality"    value={d.nationality}/>
              <KV label="Mobile"         value={d.mobile}/>
              <KV label="Email"          value={d.email}/>
              <KV label="Aadhaar"        value={maskAadhaar(d.aadhaar||d.aadhar)}/>
              <KV label="Name as per Aadhaar" value={d.nameAsPerAadhaar}/>
              <KV label="PAN"            value={d.pan}/>
              <KV label="Name as per PAN" value={d.nameAsPerPan}/>
              <KV label="Has Passport"   value={d.hasPassport||"—"}/>
              {(d.hasPassport==="Yes"||d.passport)&&<>
                <KV label="Passport No."   value={d.passport}/>
                <KV label="Issue Date"     value={d.passportIssue}/>
                <KV label="Expiry Date"    value={d.passportExpiry}/>
              </>}
              <KV label="Blood Group"    value={d.bloodGroup}/>
              <KV label="Marital Status" value={d.maritalStatus}/>
            </div>

            {(d.fatherFirst||d.fatherLast) && (
              <div>
                <div className="sec-divider">Family</div>
                <div className="grid">
                  <KV label="Father's Name" value={[d.fatherFirst,d.fatherMiddle,d.fatherLast].filter(Boolean).join(" ")}/>
                  <KV label="Mother's Name" value={[d.motherFirst,d.motherMiddle,d.motherLast].filter(Boolean).join(" ")}/>
                </div>
              </div>
            )}

            {(d.emergName||d.emergPhone) && (
              <div>
                <div className="sec-divider">Emergency Contact</div>
                <div className="grid">
                  <KV label="Name"         value={d.emergName}/>
                  <KV label="Relationship" value={d.emergRel}/>
                  <KV label="Phone"        value={d.emergPhone}/>
                </div>
              </div>
            )}

            <div>
              <div className="sec-divider">Current Address</div>
              <div className="grid">
                <KV label="Door / Street" value={cur.door}/>
                <KV label="Village / Area" value={cur.village}/>
                <KV label="Tehsil / Taluk" value={cur.locality}/>
                <KV label="District" value={cur.district}/>
                <KV label="State"    value={cur.state}/>
                <KV label="Pincode"  value={cur.pin}/>
              </div>
            </div>

            {(perm.door||perm.state) && (
              <div>
                <div className="sec-divider">Permanent / Native Address</div>
                <div className="grid">
                  <KV label="Door / Street" value={perm.door}/>
                  <KV label="Village / Area" value={perm.village}/>
                  <KV label="District" value={perm.district}/>
                  <KV label="State"    value={perm.state}/>
                  <KV label="Pincode"  value={perm.pin}/>
                </div>
              </div>
            )}

            {/* Attachments — Page 1 */}
            <div>
              <div className="sec-divider">Documents</div>
              <div className="att-grid">
                <AttChip label="Profile Photo"   docKey={d.photoKey}    urls={docUrls}/>
                <AttChip label="Aadhaar Card"    docKey={d.aadhaarKey}  urls={docUrls}/>
                <AttChip label="PAN Card"        docKey={d.panKey}      urls={docUrls}/>
                {d.hasPassport==="Yes"&&d.passportKey&&<AttChip label="Passport" docKey={d.passportKey} urls={docUrls}/>}
                {d.hasPassport==="Yes"&&!d.passportKey&&<span className="att-chip missing">⚠ Passport upload missing</span>}
              </div>
            </div>
          </div>

          {/* ── Bank Details ──────────────────────────────────────────── */}
          <div className="sc teal">
            <SectionHead icon="🏦" title="Bank Account Details" colorClass="teal" onEdit={()=>router.push("/employee/personal")}/>
            <div className="grid">
              <KV label="Bank Name"            value={d.bankName==="Other"&&d.bankOther ? `Other — ${d.bankOther}` : d.bankName}/>
              <KV label="Account Holder Name"  value={d.bankAccountName}/>
              <KV label="IFSC Code"            value={d.ifsc}/>
              <KV label="Branch"               value={d.branch}/>
              <KV label="Account Type"         value={d.accountType}/>
              <KV label="Account Number"       value={d.accountFull ? ("•".repeat(Math.max(0,d.accountFull.length-4))+d.accountFull.slice(-4)) : (d.accountLast4 ? ("•".repeat(8)+d.accountLast4) : "—")}/>
            </div>
          </div>

          {/* ── Page 2: Education ─────────────────────────────────────── */}
          <div className="sc amb">
            <SectionHead icon="🎓" title="Education" colorClass="amb" onEdit={()=>router.push("/employee/education")}/>

            {[
              { title:"Class X",        data:edu.classX,        subKey:"classX"       },
              ...((edu.afterTenth==="Intermediate"||edu.afterTenth==="Both"||edu.intermediate?.college) ? [{ title:"Intermediate",   data:edu.intermediate,  subKey:"intermediate" }] : []),
              ...((edu.afterTenth==="Diploma"||edu.afterTenth==="Both") ? [{ title:"Diploma (after 10th)", data:edu.diploma, subKey:"diploma" }] : []),
              { title:"Under Graduate", data:edu.undergraduate, subKey:"ug_provisional" },
            ].map(sec => {
              const s = sec.data || {};
              return (
                <div key={sec.title} style={{marginBottom:"0.9rem",paddingBottom:"0.9rem",borderBottom:"1px solid #f0eef8"}}>
                  <div style={{fontSize:"0.72rem",fontWeight:700,color:"#d97706",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.5rem"}}>{sec.title}</div>
                  <div className="grid">
                    <KV label="Institution"     value={s.school||s.college}/>
                    <KV label="Board / Univ."   value={s.board||s.university}/>
                    {s.course && <KV label="Degree / Course" value={s.course}/>}
                    <KV label="Year of Passing" value={s.yearOfPassing}/>
                    <KV label={s.resultType||"Result"} value={s.resultValue}/>
                    {s.backlogs && <KV label="Backlogs" value={s.backlogs}/>}
                  </div>
                  {(s.certKey||s.provKey) && (
                    <div className="att-grid">
                      {s.certKey  && <AttChip label={`${sec.title} Certificate`} docKey={s.certKey}  urls={docUrls}/>}
                      {s.provKey  && <AttChip label="Provisional Marksheet"      docKey={s.provKey}  urls={docUrls}/>}
                      {s.convoKey && <AttChip label="Convocation Certificate"    docKey={s.convoKey} urls={docUrls}/>}
                    </div>
                  )}
                </div>
              );
            })}

            {edu.postgraduate?.college && (
              <div style={{marginBottom:"0.9rem",paddingBottom:"0.9rem",borderBottom:"1px solid #f0eef8"}}>
                <div style={{fontSize:"0.72rem",fontWeight:700,color:"#d97706",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.5rem"}}>Post Graduate</div>
                <div className="grid">
                  <KV label="College"    value={edu.postgraduate?.college}/>
                  <KV label="University" value={edu.postgraduate?.university}/>
                  <KV label="Degree"     value={edu.postgraduate?.course}/>
                  <KV label="Year"       value={edu.postgraduate?.yearOfPassing}/>
                  <KV label="Result"     value={edu.postgraduate?.resultValue}/>
                </div>
                {(edu.postgraduate?.provKey||edu.postgraduate?.convoKey) && (
                  <div className="att-grid">
                    {edu.postgraduate.provKey  && <AttChip label="PG Provisional" docKey={edu.postgraduate.provKey}  urls={docUrls}/>}
                    {edu.postgraduate.convoKey && <AttChip label="PG Convocation"  docKey={edu.postgraduate.convoKey} urls={docUrls}/>}
                  </div>
                )}
              </div>
            )}

            {edu.diploma?.institute && (
              <div style={{marginBottom:"0.9rem",paddingBottom:"0.9rem",borderBottom:"1px solid #f0eef8"}}>
                <div style={{fontSize:"0.72rem",fontWeight:700,color:"#d97706",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.5rem"}}>Diploma / Technical</div>
                <div className="grid">
                  <KV label="Institution" value={edu.diploma?.institute}/>
                  <KV label="Course"      value={edu.diploma?.course}/>
                  <KV label="Year"        value={edu.diploma?.yearOfPassing}/>
                </div>
                {edu.diploma?.certKey && <div className="att-grid"><AttChip label="Diploma Certificate" docKey={edu.diploma.certKey} urls={docUrls}/></div>}
              </div>
            )}

            {Array.isArray(edu.certifications) && edu.certifications.length > 0 && (
              <div>
                <div style={{fontSize:"0.72rem",fontWeight:700,color:"#d97706",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.5rem"}}>Certifications</div>
                <div className="att-grid">
                  {edu.certifications.map((c,i) => (
                    <AttChip key={i} label={c.name||`Cert ${i+1}`} docKey={c.certKey} urls={docUrls}/>
                  ))}
                </div>
              </div>
            )}

            {/* Articleships */}
            {Array.isArray(edu.articleships) && edu.articleships.length > 0 && (
              <div style={{marginTop:"0.9rem",paddingTop:"0.9rem",borderTop:"1px solid #f0eef8"}}>
                <div style={{fontSize:"0.72rem",fontWeight:700,color:"#ea580c",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.5rem"}}>Articleship / Practical Training</div>
                {edu.articleships.map((a,i)=>(
                  <div key={i} style={{background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:8,padding:"0.65rem 0.85rem",marginBottom:"0.5rem"}}>
                    <div style={{fontSize:"0.78rem",fontWeight:700,color:"#ea580c",marginBottom:"0.3rem"}}>{a.type||`Training ${i+1}`} — {a.firm}</div>
                    <div className="grid" style={{gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))"}}>
                      {a.city&&<KV label="City" value={a.city}/>}
                      {a.from&&<KV label="From" value={a.from}/>}
                      {a.to&&<KV label="To" value={a.to}/>}
                      {a.isOngoing&&<KV label="Status" value={a.isOngoing}/>}
                    </div>
                    {a.certKey&&<div className="att-grid" style={{marginTop:"0.4rem"}}><AttChip label="Training Letter" docKey={a.certKey} urls={docUrls}/></div>}
                  </div>
                ))}
              </div>
            )}

            {/* Education Gap */}
            {edu.hasEduGap && (
              <div style={{marginTop:"0.9rem",paddingTop:"0.9rem",borderTop:"1px solid #f0eef8"}}>
                <div style={{fontSize:"0.72rem",fontWeight:700,color:"#4f46e5",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.4rem"}}>Education Gap Before First Job</div>
                <div className="grid">
                  <KV label="Had Education Gap" value={edu.hasEduGap}/>
                  {edu.eduGapReason&&<KV label="Reason" value={edu.eduGapReason}/>}
                </div>
              </div>
            )}
          </div>

          {/* ── Page 3: Employment ───────────────────────────────────── */}
          <div className="sc vio">
            <SectionHead icon="💼" title="Employment History" colorClass="vio" onEdit={()=>router.push("/employee/previous")}/>

            {/* Resume */}
            {d.resumeKey && (
              <div style={{marginBottom:"0.85rem"}}>
                <div className="att-grid"><AttChip label="Latest Resume / CV" docKey={d.resumeKey} urls={docUrls}/></div>
              </div>
            )}

            {empHistory.length === 0 ? (
              <p style={{color:"#b8b4d4",fontSize:"0.875rem",fontStyle:"italic"}}>No employment history added.</p>
            ) : empHistory.map((e, idx) => (
              <div key={e.company_id||idx} style={{marginBottom:"0.9rem",paddingBottom:"0.9rem",borderBottom:"1px solid #f0eef8"}}>
                <div style={{fontSize:"0.72rem",fontWeight:700,color:"#7c3aed",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.5rem"}}>
                  {idx===0?"Current / Most Recent Employer":`Previous Employer ${idx}`}
                </div>
                <div className="grid">
                  <KV label="Company"         value={e.companyName}/>
                  <KV label="Designation"     value={e.designation}/>
                  <KV label="Department"      value={e.department}/>
                  <KV label="Employment Type" value={e.employmentType}/>
                  <KV label="Date of Joining" value={e.startDate}/>
                  {idx===0
                    ? <KV label="Currently Working" value={e.currentlyWorking==="Yes"?"Yes — Still Employed":e.currentlyWorking==="No"?"No":e.currentlyWorking}/>
                    : <KV label="Date of Leaving"   value={e.endDate}/>
                  }
                  {idx===0&&e.currentlyWorking==="No"&&<KV label="Date of Leaving" value={e.endDate}/>}
                  <KV label="Work Email"      value={e.workEmail}/>
                  {e.employmentType==="Contract"&&<KV label="Vendor" value={e.contractVendor?.company}/>}
                </div>
                {/* Reference */}
                {e.reference?.name && (
                  <div style={{marginTop:"0.5rem"}}>
                    <div style={{fontSize:"0.68rem",fontWeight:700,color:"#8b88b0",textTransform:"uppercase",letterSpacing:0.4,marginBottom:"0.3rem"}}>Reference</div>
                    <div className="grid">
                      <KV label="Name"  value={e.reference.name}/>
                      <KV label="Role"  value={e.reference.role}/>
                      <KV label="Email" value={e.reference.email}/>
                    </div>
                  </div>
                )}
                {/* Employment attachments */}
                {(e.documents?.payslipsKey||e.documents?.offerLetterKey||e.documents?.resignationKey||e.documents?.experienceKey||e.documents?.idCardKey) && (
                  <div className="att-grid" style={{marginTop:"0.6rem"}}>
                    {e.documents.payslipsKey    && <AttChip label="Payslips"             docKey={e.documents.payslipsKey}    urls={docUrls}/>}
                    {e.documents.offerLetterKey && <AttChip label="Offer Letter"         docKey={e.documents.offerLetterKey} urls={docUrls}/>}
                    {e.documents.resignationKey && <AttChip label="Resignation"          docKey={e.documents.resignationKey} urls={docUrls}/>}
                    {e.documents.experienceKey  && <AttChip label="Experience Letter"    docKey={e.documents.experienceKey}  urls={docUrls}/>}
                    {e.documents.idCardKey      && <AttChip label="Company ID Card"      docKey={e.documents.idCardKey}      urls={docUrls}/>}
                  </div>
                )}
                {/* Gap */}
                {e.gap?.hasGap==="Yes"&&e.gap?.reason&&(
                  <div style={{marginTop:"0.5rem",padding:"0.5rem 0.75rem",background:"#fffbeb",borderRadius:8,border:"1px solid #fde68a",fontSize:"0.78rem",color:"#92400e",fontWeight:500}}>
                    ⏱ Gap: {e.gap.reason}
                  </div>
                )}
              </div>
            ))}

            {/* Employment declarations from page 3 */}
            {empHistory.length > 0 && (
              <div style={{marginTop:"0.5rem",padding:"0.7rem 0.9rem",background:"#f5f3ff",borderRadius:8,border:"1px solid #dddaf0",fontSize:"0.78rem",color:"#6b6894",fontWeight:500}}>
                {(empHistory[empHistory.length-1]?.declared || d.declared)
                  ? "✅ Employment declaration confirmed on page 3."
                  : "⚠️ Employment declaration not yet confirmed — go back to page 3."}
              </div>
            )}
          </div>

          {/* ── Page 4: UAN ──────────────────────────────────────────── */}
          <div className="sc cyn">
            <SectionHead icon="🏦" title="UAN / EPFO" colorClass="cyn" onEdit={()=>router.push("/employee/uan")}/>
            <div className="grid">
              <KV label="Has UAN"         value={d.hasUan==="yes"||d.hasUan===true?"Yes":"No"}/>
              {(d.hasUan==="yes"||d.hasUan===true)&&<>
                <KV label="UAN Number"      value={d.uanNumber}/>
                <KV label="Name as per UAN" value={d.nameAsPerUan}/>
                <KV label="Mobile Linked"   value={d.mobileLinked}/>
                <KV label="UAN Active"      value={d.isActive}/>
              </>}
            </div>
            {/* PF records */}
            {Array.isArray(d.pfRecords) && d.pfRecords.length > 0 && (
              <div style={{marginTop:"0.85rem"}}>
                <div className="sec-divider">PF Details per Employer</div>
                {d.pfRecords.map((pf, i) => (
                  <div key={i} style={{background:"#f8f7ff",border:"1px solid #e4e2f0",borderRadius:10,padding:"0.75rem 0.9rem",marginBottom:"0.6rem"}}>
                    <div style={{fontSize:"0.68rem",fontWeight:800,color:"#7c3aed",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.4rem"}}>
                      {pf.companyName||`Employer ${i+1}`}
                    </div>
                    {pf.hasPf==="No"
                      ? <p style={{fontSize:"0.78rem",color:"#0369a1",fontWeight:500}}>ℹ️ PF not maintained by this employer</p>
                      : <div className="grid">
                          <KV label="PF Member ID"     value={pf.pfMemberId}/>
                          <KV label="Date of Joining"  value={pf.dojEpfo}/>
                          <KV label="Date of Exit"     value={pf.doeEpfo}/>
                          <KV label="PF Transferred"   value={pf.pfTransferred}/>
                        </div>
                    }
                  </div>
                ))}
              </div>
            )}

            {/* UAN uploads */}
            <div className="att-grid" style={{marginTop:"0.65rem",display:"flex",gap:"0.6rem",flexWrap:"wrap"}}>
              {d.epfoKey && <AttChip label="UAN Card" docKey={d.epfoKey} urls={docUrls}/>}
              {d.serviceHistoryKey && <AttChip label="Service History Snapshot" docKey={d.serviceHistoryKey} urls={docUrls}/>}
            </div>

            {/* Nominees */}
            {Array.isArray(d.epfoNominees) && d.epfoNominees.length > 0 && (
              <div style={{marginTop:"0.85rem"}}>
                <div className="sec-divider">Nominee Details (Form 2)</div>
                {d.epfoNominees.map((nom, i) => (
                  <div key={i} style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"0.75rem 0.9rem",marginBottom:"0.6rem"}}>
                    <div style={{fontSize:"0.68rem",fontWeight:800,color:"#16a34a",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.4rem"}}>Nominee {i+1}</div>
                    <div className="grid">
                      <KV label="Full Name"     value={nom.name}/>
                      <KV label="Date of Birth" value={nom.dob}/>
                      <KV label="Relationship"  value={nom.relation==="Other"&&nom.otherRelation?nom.otherRelation:nom.relation}/>
                      <KV label="Address"       value={nom.address}/>
                      <KV label="Share (%)"     value={nom.share?`${nom.share}%`:undefined}/>
                      {nom.guardianName && <KV label="Guardian Name"    value={nom.guardianName}/>}
                      {nom.guardianAddress && <KV label="Guardian Address" value={nom.guardianAddress}/>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* EPFO Declarations */}
            {d.epfoDeclarations && (
              <div style={{marginTop:"0.85rem"}}>
                <div className="sec-divider">EPFO Declarations</div>
                <div className="grid">
                  <KV label="PF Nomination (Form 2 — Part A)"      value={d.epfoDeclarations.pfNomAck?"✓ Confirmed":"Not confirmed"}/>
                  <KV label="Pension Nomination (Form 2 — Part B)" value={d.epfoDeclarations.pensionNomAck?"✓ Confirmed":"Not confirmed"}/>
                  <KV label="General EPFO Declaration"             value={d.epfoDeclarations.epfoDecl?"✓ Confirmed":"Not confirmed"}/>
                </div>
              </div>
            )}

            {/* Digital Signature — displayed via S3 signed URL */}
            {(d.epfoSignature?.s3Key || d.epfoSignature?.dataUrl) && (
              <div style={{marginTop:"0.85rem"}}>
                <div className="sec-divider">Digital Signature</div>
                <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"0.75rem 0.9rem"}}>
                  {(() => {
                    const sigUrl = d.epfoSignature?.s3Key
                      ? (docUrls[d.epfoSignature.s3Key] || null)
                      : d.epfoSignature?.dataUrl; // legacy fallback
                    return sigUrl
                      ? <img src={sigUrl} alt="Digital Signature" style={{maxWidth:280,height:60,border:"1px solid #e4e2f0",borderRadius:6,background:"#fff",display:"block"}}/>
                      : <span style={{fontSize:"0.72rem",color:"#8b88b0"}}>⏳ Loading signature…</span>;
                  })()}
                  {d.epfoSignature.timestamp && (
                    <p style={{fontSize:"0.68rem",color:"#16a34a",fontWeight:600,marginTop:"0.4rem"}}>
                      ✓ Signed — {new Date(d.epfoSignature.timestamp).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Final Acknowledgements (review-specific) ─────────────── */}
          <div className="sc grn" id="ack-section">
            <div className="sh">
              <div className="si grn">✅</div>
              <span className="st">Final Acknowledgements</span>
              {allAcked && <span style={{marginLeft:"auto",fontSize:"0.72rem",fontWeight:700,color:"#16a34a"}}>All confirmed ✓</span>}
            </div>
            {profileEdited && (
              <div style={{background:"#fff8f0",border:"1.5px solid #fbbf24",borderRadius:10,padding:"0.75rem 1rem",marginBottom:"1rem",display:"flex",alignItems:"flex-start",gap:"0.6rem"}}>
                <span style={{fontSize:"1rem",flexShrink:0}}>⚠️</span>
                <div>
                  <div style={{fontSize:"0.78rem",fontWeight:700,color:"#92400e",marginBottom:"0.2rem"}}>You updated your profile — please re-confirm</div>
                  <div style={{fontSize:"0.72rem",color:"#92400e",fontWeight:500,lineHeight:1.5}}>Your acknowledgements have been reset because you made changes. Please read and re-confirm each statement below before submitting.</div>
                </div>
              </div>
            )}
            <p style={{fontSize:"0.78rem",color:"#6b6894",marginBottom:"1rem",lineHeight:1.55}}>
              These acknowledgements are specific to your final submission. Please read each carefully — they are different from the declarations made on earlier pages.
            </p>
            {ACK_STATEMENTS.map((stmt, i) => (
              <div key={i} className="ack-box" onClick={()=>toggleAck(i)} style={{cursor:"pointer"}}>
                <div className={`ack-check${acks[i]?" checked":""}`}>
                  {acks[i] && <span style={{color:"#fff",fontWeight:800,fontSize:"0.75rem"}}>✓</span>}
                </div>
                <span className="ack-text">{stmt}</span>
              </div>
            ))}
            {!allAcked && (
              <p style={{fontSize:"0.75rem",color:"#d97706",marginTop:"0.75rem",fontWeight:600}}>
                ⚠️ Please confirm all {ACK_STATEMENTS.length} statements to enable submission.
              </p>
            )}
          </div>

          {/* Submit bar */}
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
