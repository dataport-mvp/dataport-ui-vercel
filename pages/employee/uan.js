// pages/employee/uan.js  — Page 4 of 4
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

function SignoutModal({ onConfirm, onCancel, saveStatus }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
      <div style={{ background:"#fff", borderRadius:14, padding:"2rem", maxWidth:360, width:"90%", textAlign:"center" }}>
        <h3 style={{ margin:"0 0 0.5rem" }}>Sign out?</h3>
        <p style={{ color:"#64748b", fontSize:"0.9rem", marginBottom:"1.5rem" }}>Your progress is saved. You can continue anytime.</p>
        {saveStatus && <p style={{ fontSize:"0.8rem", color:"#94a3b8", marginBottom:"1rem" }}>{saveStatus}</p>}
        <div style={{ display:"flex", gap:"0.75rem" }}>
          <button onClick={onCancel}  style={{ flex:1, padding:"0.75rem", borderRadius:8, border:"1px solid #cbd5e1", background:"#f8fafc", cursor:"pointer", fontWeight:600 }}>Stay</button>
          <button onClick={onConfirm} style={{ flex:1, padding:"0.75rem", borderRadius:8, border:"none", background:"#ef4444", color:"#fff", cursor:"pointer", fontWeight:600 }}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

const emptyPfRecord = () => ({
  companyName:   "",
  pfMemberId:    "",
  dojEpfo:       "",
  doeEpfo:       "",
  pfTransferred: "",
});

export default function UanDetails() {
  const router = useRouter();
  const { user, apiFetch, logout, ready } = useAuth();

  const [showSignout,  setShowSignout]  = useState(false);
  const [saveStatus,   setSaveStatus]   = useState("");
  const [loading,      setLoading]      = useState(true);
  const [serverDraft,  setServerDraft]  = useState(null);

  // UAN fields
  const [uanNumber,    setUanNumber]    = useState("");
  const [nameAsPerUan, setNameAsPerUan] = useState("");
  const [mobileLinked, setMobileLinked] = useState("");
  const [isActive,     setIsActive]     = useState("");
  const [pfRecords,    setPfRecords]    = useState([emptyPfRecord()]);

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/employee/login"); return; }
  }, [ready, user, router]);

  // Fetch draft on mount — works on any device
  useEffect(() => {
    if (!ready || !user) return;
    const fetchDraft = async () => {
      try {
        const res = await apiFetch(`${API}/employee/draft`);
        if (res.ok) {
          const d = await res.json();
          setServerDraft(d); // cache for merge on save

          if (d.uanNumber)    setUanNumber(d.uanNumber);
          if (d.nameAsPerUan) setNameAsPerUan(d.nameAsPerUan);
          if (d.mobileLinked) setMobileLinked(d.mobileLinked);
          if (d.isActive)     setIsActive(d.isActive);
          if (d.pfRecords && d.pfRecords.length > 0) {
            setPfRecords(d.pfRecords.map((r) => ({
              companyName:   r.companyName   || "",
              pfMemberId:    r.pfMemberId    || "",
              dojEpfo:       r.dojEpfo       || "",
              doeEpfo:       r.doeEpfo       || "",
              pfTransferred: r.pfTransferred || "",
            })));
          }
        }
      } catch (_) {}
      setLoading(false);
    };
    fetchDraft();
  }, [ready, user, apiFetch]);

  const updatePf = (index, field, value) => {
    setPfRecords(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };
  const addPfRecord    = () => setPfRecords(prev => [...prev, emptyPfRecord()]);
  const removePfRecord = (index) => setPfRecords(prev => prev.filter((_, i) => i !== index));

  // Merge UAN fields into the full draft and POST
  const saveUanDraft = async (finalStatus = "draft") => {
    const d = serverDraft || {};
    const res = await apiFetch(`${API}/employee`, {
      method: "POST",
      body:   JSON.stringify({
        // Required fields — always carry forward from server draft
        employee_id:  d.employee_id,
        status:       finalStatus,
        firstName:    d.firstName    || "",
        lastName:     d.lastName     || "",
        mobile:       d.mobile       || "",
        // Carry all page-1 & page-2 fields untouched
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
        education:        d.education,
        // This page's data
        uanNumber,
        nameAsPerUan,
        mobileLinked,
        isActive,
        pfRecords,
      }),
    });
    if (!res.ok) throw new Error(parseError(await res.json().catch(() => ({}))));
    const updated = await res.json().catch(() => ({}));
    setServerDraft({ ...d, uanNumber, nameAsPerUan, mobileLinked, isActive, pfRecords, ...updated });
  };

  const handleSubmit = async () => {
    setSaveStatus("Submitting...");
    try {
      await saveUanDraft("submitted"); // final submission
      setSaveStatus("Submitted ✓");
      router.push("/employee/submitted");
    } catch (err) {
      setSaveStatus(`Error: ${err.message || "Could not submit"}`);
    }
  };

  const handlePrevious = async () => {
    setSaveStatus("Saving...");
    try { await saveUanDraft("draft"); } catch (_) {}
    router.push("/employee/previous");
  };

  const handleSignout = async () => {
    try { await saveUanDraft("draft"); } catch (_) {}
    logout();
  };

  if (!ready || !user) return null;
  if (loading) return <div style={{ ...styles.page, display:"flex", alignItems:"center", justifyContent:"center" }}><p style={{ color:"#64748b" }}>Loading UAN details…</p></div>;

  return (
    <div style={styles.page}>
      {showSignout && <SignoutModal onConfirm={handleSignout} onCancel={() => setShowSignout(false)} saveStatus={saveStatus} />}
      <div style={styles.card}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
          <span style={{ fontSize:"0.85rem", color:"#475569" }}>👤 {user.name || user.email}</span>
          <button onClick={() => setShowSignout(true)} style={styles.signoutBtn}>Sign out</button>
        </div>

        <ProgressBar currentStep={4} totalSteps={4} />
        <h1 style={styles.title}>UAN & PF Details</h1>

        <Section title="UAN Information">
          <Row>
            <Input label="UAN Number"          value={uanNumber}    onChange={setUanNumber} />
            <Input label="Name as per UAN"     value={nameAsPerUan} onChange={setNameAsPerUan} />
            <Input label="Mobile linked to UAN" value={mobileLinked} onChange={setMobileLinked} />
            <SelectField label="UAN Active?" value={isActive} onChange={setIsActive} options={["Yes","No"]} />
          </Row>
        </Section>

        <Section title="PF Records">
          {pfRecords.map((pf, index) => (
            <div key={index} style={{ border:"1px solid #e2e8f0", borderRadius:10, padding:"1rem", marginBottom:"1rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.75rem" }}>
                <strong style={{ color:"#0f172a", fontSize:"0.9rem" }}>PF Record {index + 1}</strong>
                {pfRecords.length > 1 && (
                  <button onClick={() => removePfRecord(index)} style={{ padding:"0.25rem 0.6rem", border:"1px solid #fca5a5", borderRadius:6, background:"#fff5f5", color:"#dc2626", cursor:"pointer", fontSize:"0.75rem" }}>Remove</button>
                )}
              </div>
              <Row>
                <Input label="Company Name"  value={pf.companyName}   onChange={(v) => updatePf(index, "companyName",   v)} />
                <Input label="PF Member ID"  value={pf.pfMemberId}    onChange={(v) => updatePf(index, "pfMemberId",    v)} />
              </Row>
              <Row>
                <Input type="date" label="Date of Joining (EPFO)"  value={pf.dojEpfo}       onChange={(v) => updatePf(index, "dojEpfo",       v)} />
                <Input type="date" label="Date of Exit (EPFO)"     value={pf.doeEpfo}       onChange={(v) => updatePf(index, "doeEpfo",       v)} />
                <SelectField       label="PF Transferred?"          value={pf.pfTransferred} onChange={(v) => updatePf(index, "pfTransferred", v)} options={["Yes","No","NA"]} />
              </Row>
            </div>
          ))}
          <button onClick={addPfRecord} style={{ ...styles.button, background:"#0f172a", marginBottom:"1rem" }}>+ Add PF Record</button>
        </Section>

        <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:10, padding:"1.25rem", marginBottom:"2rem" }}>
          <p style={{ margin:0, color:"#15803d", fontSize:"0.9rem", fontWeight:600 }}>Ready to submit?</p>
          <p style={{ margin:"0.25rem 0 0", color:"#16a34a", fontSize:"0.82rem" }}>Submitting will make your profile available for employer consent requests. You can still update it later.</p>
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <button onClick={handlePrevious} style={{ ...styles.button, background:"#64748b" }}>← Previous</button>
          <span style={{ color: saveStatus.startsWith("Error") ? "#dc2626" : "#64748b", fontSize:"0.85rem" }}>{saveStatus}</span>
          <button onClick={handleSubmit} style={{ ...styles.button, background:"#16a34a" }}>Submit Profile ✓</button>
        </div>
      </div>
    </div>
  );
}

const Section     = ({ title, children }) => (<div style={{ marginBottom:"2rem" }}><h2 style={{ marginBottom:"1rem", color:"#0f172a" }}>{title}</h2>{children}</div>);
const Row         = ({ children }) => <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap", marginBottom:"0.75rem" }}>{children}</div>;
const Input       = ({ label, value, onChange, type="text" }) => (<div style={{ flex:1, minWidth:"180px" }}><label style={styles.label}>{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={styles.input} /></div>);
const SelectField = ({ label, value, onChange, options }) => (<div style={{ flex:1 }}><label style={styles.label}>{label}</label><select value={value} onChange={(e) => onChange(e.target.value)} style={styles.input}><option value="">Select</option>{options.map((o) => <option key={o}>{o}</option>)}</select></div>);

const styles = {
  page:       { background:"#f1f5f9", padding:"2rem", minHeight:"100vh", fontFamily:"Inter, system-ui, sans-serif" },
  card:       { maxWidth:"980px", margin:"auto", background:"#fff", padding:"2rem", borderRadius:"14px", boxShadow:"0 12px 30px rgba(0,0,0,0.08)" },
  title:      { marginBottom:"2rem" },
  label:      { fontSize:"0.85rem", color:"#475569" },
  input:      { width:"100%", padding:"0.65rem", borderRadius:"8px", border:"1px solid #cbd5e1" },
  button:     { padding:"0.9rem 2rem", borderRadius:"10px", border:"none", color:"#fff", fontSize:"1rem", cursor:"pointer" },
  signoutBtn: { padding:"0.4rem 1rem", border:"1px solid #e2e8f0", borderRadius:7, background:"#fff", color:"#64748b", fontSize:"0.85rem", cursor:"pointer", fontWeight:600 },
};
