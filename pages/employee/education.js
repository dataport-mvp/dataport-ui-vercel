// pages/employee/education.js  — Page 2 of 4
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

function SignoutModal({ onConfirm, onCancel }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
      <div style={{ background:"#fff", borderRadius:14, padding:"2rem", maxWidth:360, width:"90%", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
        <h3 style={{ margin:"0 0 0.5rem", color:"#0f172a" }}>Sign out?</h3>
        <p style={{ color:"#64748b", fontSize:"0.9rem", marginBottom:"1.5rem" }}>Your progress is saved. You can continue anytime.</p>
        <div style={{ display:"flex", gap:"0.75rem" }}>
          <button onClick={onCancel}  style={{ flex:1, padding:"0.75rem", borderRadius:8, border:"1px solid #cbd5e1", background:"#f8fafc", cursor:"pointer", fontWeight:600 }}>Stay</button>
          <button onClick={onConfirm} style={{ flex:1, padding:"0.75rem", borderRadius:8, border:"none", background:"#ef4444", color:"#fff", cursor:"pointer", fontWeight:600 }}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

export default function EducationDetails() {
  const router = useRouter();
  const { user, apiFetch, logout, ready } = useAuth();

  const [showSignout, setShowSignout] = useState(false);
  const [saveStatus,  setSaveStatus]  = useState("");
  const [loading,     setLoading]     = useState(true);

  // We keep the full draft in state so we can merge on save
  // without making an extra API call
  const [serverDraft, setServerDraft] = useState(null);

  // 10th
  const [xSchool,   setXSchool]   = useState("");
  const [xBoard,    setXBoard]    = useState("");
  const [xYear,     setXYear]     = useState("");
  const [xPercent,  setXPercent]  = useState("");
  // 12th
  const [xiiSchool,  setXiiSchool]  = useState("");
  const [xiiBoard,   setXiiBoard]   = useState("");
  const [xiiYear,    setXiiYear]    = useState("");
  const [xiiPercent, setXiiPercent] = useState("");
  // Degree
  const [degCollege, setDegCollege] = useState("");
  const [degName,    setDegName]    = useState("");
  const [degBranch,  setDegBranch]  = useState("");
  const [degYear,    setDegYear]    = useState("");
  const [degPercent, setDegPercent] = useState("");
  // PG
  const [pgCollege,  setPgCollege]  = useState("");
  const [pgName,     setPgName]     = useState("");
  const [pgBranch,   setPgBranch]   = useState("");
  const [pgYear,     setPgYear]     = useState("");
  const [pgPercent,  setPgPercent]  = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/employee/login"); return; }
  }, [ready, user, router]);

  // Fetch draft from API on mount — any device, any browser
  useEffect(() => {
    if (!ready || !user) return;
    const fetchDraft = async () => {
      try {
        const res = await apiFetch(`${API}/employee/draft`);
        if (res.ok) {
          const d = await res.json();
          setServerDraft(d); // cache full draft for merge on save

          // education is stored as a dict under d.education
          const edu = d.education || {};

          // 10th
          if (edu.xSchool)   setXSchool(edu.xSchool);
          if (edu.xBoard)    setXBoard(edu.xBoard);
          if (edu.xYear)     setXYear(edu.xYear);
          if (edu.xPercent)  setXPercent(edu.xPercent);
          // 12th
          if (edu.xiiSchool)  setXiiSchool(edu.xiiSchool);
          if (edu.xiiBoard)   setXiiBoard(edu.xiiBoard);
          if (edu.xiiYear)    setXiiYear(edu.xiiYear);
          if (edu.xiiPercent) setXiiPercent(edu.xiiPercent);
          // Degree
          if (edu.degCollege) setDegCollege(edu.degCollege);
          if (edu.degName)    setDegName(edu.degName);
          if (edu.degBranch)  setDegBranch(edu.degBranch);
          if (edu.degYear)    setDegYear(edu.degYear);
          if (edu.degPercent) setDegPercent(edu.degPercent);
          // PG
          if (edu.pgCollege)  setPgCollege(edu.pgCollege);
          if (edu.pgName)     setPgName(edu.pgName);
          if (edu.pgBranch)   setPgBranch(edu.pgBranch);
          if (edu.pgYear)     setPgYear(edu.pgYear);
          if (edu.pgPercent)  setPgPercent(edu.pgPercent);
        }
        // 404 = new user or page 1 not done yet — empty form is fine
      } catch (_) {}
      setLoading(false);
    };
    fetchDraft();
  }, [ready, user, apiFetch]);

  const saveDraft = async () => {
    // Guard: if serverDraft didn't load (network issue), we can't safely save
    // because we'd send empty firstName/lastName/employee_id to the API
    if (!serverDraft || !serverDraft.employee_id) {
      throw new Error("Profile not loaded — please go back to page 1 first");
    }
    const d = serverDraft;

    const payload = {
      // Required fields from page 1 — must always be present
      employee_id:  d.employee_id,
      status:       d.status === "submitted" ? "submitted" : "draft",
      firstName:    d.firstName    || "",
      lastName:     d.lastName     || "",
      mobile:       d.mobile       || "",
      // Carry forward all other page-1 fields untouched
      middleName:       d.middleName,
      fatherName:       d.fatherName,
      fatherFirst:      d.fatherFirst,
      fatherMiddle:     d.fatherMiddle,
      fatherLast:       d.fatherLast,
      dob:              d.dob,
      gender:           d.gender,
      nationality:      d.nationality,
      email:            d.email,
      aadhaar:          d.aadhaar,
      pan:              d.pan,
      passport:         d.passport,
      currentAddress:   d.currentAddress,
      permanentAddress: d.permanentAddress,
      // Carry forward uan fields if already saved
      uanNumber:    d.uanNumber,
      nameAsPerUan: d.nameAsPerUan,
      mobileLinked: d.mobileLinked,
      isActive:     d.isActive,
      pfRecords:    d.pfRecords,
      // This page's data — education dict
      education: {
        xSchool,   xBoard,    xYear,     xPercent,
        xiiSchool, xiiBoard,  xiiYear,   xiiPercent,
        degCollege, degName,  degBranch, degYear, degPercent,
        pgCollege,  pgName,   pgBranch,  pgYear,  pgPercent,
      },
    };

    const res = await apiFetch(`${API}/employee`, {
      method: "POST",
      body:   JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(parseError(await res.json().catch(() => ({}))));

    // Update cached draft so if user navigates back, we have fresh data
    const updated = await res.json().catch(() => ({}));
    setServerDraft({ ...payload, ...updated });
  };

  const handleSave = async () => {
    setSaveStatus("Saving...");
    try {
      await saveDraft();
      setSaveStatus("Saved ✓");
      router.push("/employee/previous");
    } catch (err) {
      setSaveStatus(`Error: ${err.message || "Could not save"}`);
    }
  };

  const handlePrevious = async () => {
    setSaveStatus("Saving...");
    try {
      await saveDraft();
      router.push("/employee/personal");
    } catch (_) {
      router.push("/employee/personal");
    }
  };

  const handleSignout = async () => {
    try { await saveDraft(); } catch (_) {}
    logout();
  };

  if (!ready || !user) return null;
  if (loading) return <div style={{ ...styles.page, display:"flex", alignItems:"center", justifyContent:"center" }}><p style={{ color:"#64748b" }}>Loading education details…</p></div>;

  return (
    <div style={styles.page}>
      {showSignout && <SignoutModal onConfirm={handleSignout} onCancel={() => setShowSignout(false)} />}
      <div style={styles.card}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
          <span style={{ fontSize:"0.85rem", color:"#475569" }}>👤 {user.name || user.email}</span>
          <button onClick={() => setShowSignout(true)} style={styles.signoutBtn}>Sign out</button>
        </div>

        <ProgressBar currentStep={2} totalSteps={4} />
        <h1 style={styles.title}>Education Details</h1>

        <Section title="10th Standard">
          <Row>
            <Input label="School Name"   value={xSchool}  onChange={setXSchool} />
            <Input label="Board"         value={xBoard}   onChange={setXBoard} />
            <Input label="Year"          value={xYear}    onChange={setXYear} />
            <Input label="Percentage"    value={xPercent} onChange={setXPercent} />
          </Row>
        </Section>

        <Section title="12th Standard">
          <Row>
            <Input label="School Name"   value={xiiSchool}  onChange={setXiiSchool} />
            <Input label="Board"         value={xiiBoard}   onChange={setXiiBoard} />
            <Input label="Year"          value={xiiYear}    onChange={setXiiYear} />
            <Input label="Percentage"    value={xiiPercent} onChange={setXiiPercent} />
          </Row>
        </Section>

        <Section title="Degree / Graduation">
          <Row>
            <Input label="College Name"  value={degCollege} onChange={setDegCollege} />
            <Input label="Degree Name"   value={degName}    onChange={setDegName} />
            <Input label="Branch"        value={degBranch}  onChange={setDegBranch} />
            <Input label="Year"          value={degYear}    onChange={setDegYear} />
            <Input label="Percentage"    value={degPercent} onChange={setDegPercent} />
          </Row>
        </Section>

        <Section title="Post Graduation (optional)">
          <Row>
            <Input label="College Name"  value={pgCollege} onChange={setPgCollege} />
            <Input label="Degree Name"   value={pgName}    onChange={setPgName} />
            <Input label="Branch"        value={pgBranch}  onChange={setPgBranch} />
            <Input label="Year"          value={pgYear}    onChange={setPgYear} />
            <Input label="Percentage"    value={pgPercent} onChange={setPgPercent} />
          </Row>
        </Section>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <button onClick={handlePrevious} style={{ ...styles.button, background:"#64748b" }}>← Previous</button>
          <span style={{ color: saveStatus.startsWith("Error") ? "#dc2626" : "#64748b", fontSize:"0.85rem" }}>{saveStatus}</span>
          <button onClick={handleSave} style={{ ...styles.button, background:"#2563eb" }}>Save & Proceed →</button>
        </div>
      </div>
    </div>
  );
}

const Section = ({ title, children }) => (<div style={{ marginBottom:"2rem" }}><h2 style={styles.sectionTitle}>{title}</h2>{children}</div>);
const Row     = ({ children }) => <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap" }}>{children}</div>;
const Input   = ({ label, value, onChange, type="text" }) => (
  <div style={{ flex:1, minWidth:"180px" }}>
    <label style={styles.label}>{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={styles.input} />
  </div>
);

const styles = {
  page:         { background:"#f1f5f9", padding:"2rem", minHeight:"100vh", fontFamily:"Inter, system-ui, sans-serif" },
  card:         { maxWidth:"980px", margin:"auto", background:"#fff", padding:"2rem", borderRadius:"14px", boxShadow:"0 12px 30px rgba(0,0,0,0.08)" },
  title:        { marginBottom:"2rem" },
  sectionTitle: { marginBottom:"1rem", color:"#0f172a" },
  label:        { fontSize:"0.85rem", color:"#475569" },
  input:        { width:"100%", padding:"0.65rem", borderRadius:"8px", border:"1px solid #cbd5e1" },
  button:       { padding:"0.9rem 2rem", borderRadius:"10px", border:"none", color:"#fff", fontSize:"1rem", cursor:"pointer" },
  signoutBtn:   { padding:"0.4rem 1rem", border:"1px solid #e2e8f0", borderRadius:7, background:"#fff", color:"#64748b", fontSize:"0.85rem", cursor:"pointer", fontWeight:600 },
};
