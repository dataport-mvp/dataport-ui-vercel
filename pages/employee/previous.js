// pages/employee/previous.js  — Page 3 of 4
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const emptyEmployment = () => ({
  companyName:        "",
  officeAddress:      "",
  employeeId:         "",
  workEmail:          "",
  designation:        "",
  department:         "",
  duties:             "",
  employmentType:     "",
  reasonForRelieving: "",
  reference:          { role: "", name: "", email: "", mobile: "" },
  contractVendor:     { company: "", email: "", mobile: "" },
  gap:                { hasGap: "", reason: "" },
});

function SignoutModal({ onConfirm, onCancel }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
      <div style={{ background:"#fff", borderRadius:14, padding:"2rem", maxWidth:360, width:"90%", textAlign:"center" }}>
        <h3 style={{ margin:"0 0 0.5rem" }}>Sign out?</h3>
        <p style={{ color:"#64748b", fontSize:"0.9rem", marginBottom:"1.5rem" }}>Your progress is saved. You can continue anytime.</p>
        <div style={{ display:"flex", gap:"0.75rem" }}>
          <button onClick={onCancel}  style={{ flex:1, padding:"0.75rem", borderRadius:8, border:"1px solid #cbd5e1", background:"#f8fafc", cursor:"pointer", fontWeight:600 }}>Stay</button>
          <button onClick={onConfirm} style={{ flex:1, padding:"0.75rem", borderRadius:8, border:"none", background:"#ef4444", color:"#fff", cursor:"pointer", fontWeight:600 }}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

export default function PreviousEmployment() {
  const router = useRouter();
  const { user, apiFetch, logout, ready } = useAuth();

  const [showSignout,  setShowSignout]  = useState(false);
  const [saveStatus,   setSaveStatus]   = useState("");
  const [loading,      setLoading]      = useState(true);
  const [employeeId,   setEmployeeId]   = useState("");
  const [employments,  setEmployments]  = useState([emptyEmployment()]);
  const [acknowledgements, setAcknowledgements] = useState({
    business:  { val: "", note: "" },
    dismissed: { val: "", note: "" },
    criminal:  { val: "", note: "" },
    civil:     { val: "", note: "" },
  });

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/employee/login"); return; }
  }, [ready, user, router]);

  // Fetch employment history from API on mount
  useEffect(() => {
    if (!ready || !user) return;
    const fetchData = async () => {
      try {
        // First get employee_id from draft
        const draftRes = await apiFetch(`${API}/employee/draft`);
        if (!draftRes.ok) { setLoading(false); return; }
        const draft = await draftRes.json();
        const empId = draft.employee_id;
        if (!empId) { setLoading(false); return; }
        setEmployeeId(empId);

        // Then fetch employment history
        const histRes = await apiFetch(`${API}/employee/employment-history/${empId}`);
        if (histRes.ok) {
          const data = await histRes.json();
          if (data.employments && data.employments.length > 0) {
            // Normalize each employment entry to match our local shape
            const normalized = data.employments.map((e) => ({
              companyName:        e.companyName        || "",
              officeAddress:      e.officeAddress      || "",
              employeeId:         e.employeeId         || "",
              workEmail:          e.workEmail          || "",
              designation:        e.designation        || "",
              department:         e.department         || "",
              duties:             e.duties             || "",
              employmentType:     e.employmentType     || "",
              reasonForRelieving: e.reasonForRelieving || "",
              reference:   { role: e.reference?.role || "", name: e.reference?.name || "", email: e.reference?.email || "", mobile: e.reference?.mobile || "" },
              contractVendor: { company: e.contractVendor?.company || "", email: e.contractVendor?.email || "", mobile: e.contractVendor?.mobile || "" },
              gap:         { hasGap: e.gap?.hasGap || "", reason: e.gap?.reason || "" },
            }));
            setEmployments(normalized);
          }
          // Restore acknowledgements from last entry
          const lastAck = data.acknowledgements || {};
          if (Object.keys(lastAck).length) {
            setAcknowledgements({
              business:  { val: lastAck.business?.val  || "", note: lastAck.business?.note  || "" },
              dismissed: { val: lastAck.dismissed?.val || "", note: lastAck.dismissed?.note || "" },
              criminal:  { val: lastAck.criminal?.val  || "", note: lastAck.criminal?.note  || "" },
              civil:     { val: lastAck.civil?.val     || "", note: lastAck.civil?.note     || "" },
            });
          }
        }
        // 404 = no employment history yet — show one empty form, that's fine
      } catch (_) {}
      setLoading(false);
    };
    fetchData();
  }, [ready, user, apiFetch]);

  const updateField = (index, field, value) => {
    setEmployments(prev => prev.map((e, i) => i === index ? { ...e, [field]: value } : e));
  };
  const updateNested = (index, section, field, value) => {
    setEmployments(prev => prev.map((e, i) => i === index ? { ...e, [section]: { ...e[section], [field]: value } } : e));
  };
  const updateAck = (key, field, value) => {
    setAcknowledgements(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };
  const addEmployment    = () => setEmployments(prev => [...prev, emptyEmployment()]);
  const removeEmployment = (index) => setEmployments(prev => prev.filter((_, i) => i !== index));

  const saveHistory = async () => {
    if (!employeeId) throw new Error("Profile not found — complete page 1 first");
    const res = await apiFetch(`${API}/employee/employment-history`, {
      method: "POST",
      body:   JSON.stringify({
        employments,
        acknowledgements,
      }),
    });
    if (!res.ok) throw new Error(parseError(await res.json().catch(() => ({}))));
  };

  const handleSave = async () => {
    setSaveStatus("Saving...");
    try {
      await saveHistory();
      setSaveStatus("Saved ✓");
      router.push("/employee/uan");
    } catch (err) {
      setSaveStatus(`Error: ${err.message || "Could not save"}`);
    }
  };

  const handlePrevious = async () => {
    setSaveStatus("Saving...");
    try { await saveHistory(); } catch (_) {}
    router.push("/employee/education");
  };

  const handleSignout = async () => {
    try { await saveHistory(); } catch (_) {}
    logout();
  };

  if (!ready || !user) return null;
  if (loading) return <div style={{ ...styles.page, display:"flex", alignItems:"center", justifyContent:"center" }}><p style={{ color:"#64748b" }}>Loading employment history…</p></div>;

  return (
    <div style={styles.page}>
      {showSignout && <SignoutModal onConfirm={handleSignout} onCancel={() => setShowSignout(false)} />}
      <div style={styles.card}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
          <span style={{ fontSize:"0.85rem", color:"#475569" }}>👤 {user.name || user.email}</span>
          <button onClick={() => setShowSignout(true)} style={styles.signoutBtn}>Sign out</button>
        </div>

        <ProgressBar currentStep={3} totalSteps={4} />
        <h1 style={styles.title}>Employment History</h1>

        {employments.map((emp, index) => (
          <div key={index} style={{ border:"1px solid #e2e8f0", borderRadius:12, padding:"1.5rem", marginBottom:"1.5rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
              <h3 style={{ margin:0, color:"#0f172a" }}>Company {index + 1}{emp.companyName ? ` — ${emp.companyName}` : ""}</h3>
              {employments.length > 1 && (
                <button onClick={() => removeEmployment(index)} style={{ padding:"0.3rem 0.75rem", border:"1px solid #fca5a5", borderRadius:6, background:"#fff5f5", color:"#dc2626", cursor:"pointer", fontSize:"0.8rem" }}>Remove</button>
              )}
            </div>

            <Section title="Company Info">
              <Row>
                <Input label="Company Name *"    value={emp.companyName}        onChange={(v) => updateField(index, "companyName",        v)} />
                <Input label="Office Address"    value={emp.officeAddress}      onChange={(v) => updateField(index, "officeAddress",      v)} />
                <Input label="Employee ID"       value={emp.employeeId}         onChange={(v) => updateField(index, "employeeId",         v)} />
                <Input label="Work Email"        value={emp.workEmail}          onChange={(v) => updateField(index, "workEmail",          v)} />
              </Row>
              <Row>
                <Input label="Designation"       value={emp.designation}        onChange={(v) => updateField(index, "designation",        v)} />
                <Input label="Department"        value={emp.department}         onChange={(v) => updateField(index, "department",         v)} />
                <Input label="Employment Type"   value={emp.employmentType}     onChange={(v) => updateField(index, "employmentType",     v)} />
                <Input label="Reason for Leaving" value={emp.reasonForRelieving} onChange={(v) => updateField(index, "reasonForRelieving", v)} />
              </Row>
              <Input label="Duties / Responsibilities" value={emp.duties} onChange={(v) => updateField(index, "duties", v)} />
            </Section>

            <Section title="Reference">
              <Row>
                <Input label="Role"   value={emp.reference.role}   onChange={(v) => updateNested(index, "reference", "role",   v)} />
                <Input label="Name"   value={emp.reference.name}   onChange={(v) => updateNested(index, "reference", "name",   v)} />
                <Input label="Email"  value={emp.reference.email}  onChange={(v) => updateNested(index, "reference", "email",  v)} />
                <Input label="Mobile" value={emp.reference.mobile} onChange={(v) => updateNested(index, "reference", "mobile", v)} />
              </Row>
            </Section>

            <Section title="Contract / Vendor (if applicable)">
              <Row>
                <Input label="Company" value={emp.contractVendor.company} onChange={(v) => updateNested(index, "contractVendor", "company", v)} />
                <Input label="Email"   value={emp.contractVendor.email}   onChange={(v) => updateNested(index, "contractVendor", "email",   v)} />
                <Input label="Mobile"  value={emp.contractVendor.mobile}  onChange={(v) => updateNested(index, "contractVendor", "mobile",  v)} />
              </Row>
            </Section>

            <Section title="Employment Gap">
              <Row>
                <SelectField label="Gap before this job?" value={emp.gap.hasGap} onChange={(v) => updateNested(index, "gap", "hasGap", v)} options={["Yes","No"]} />
                {emp.gap.hasGap === "Yes" && <Input label="Reason for Gap" value={emp.gap.reason} onChange={(v) => updateNested(index, "gap", "reason", v)} />}
              </Row>
            </Section>
          </div>
        ))}

        <button onClick={addEmployment} style={{ ...styles.button, background:"#0f172a", marginBottom:"2rem" }}>+ Add Another Company</button>

        <Section title="Acknowledgements">
          {[
            { key:"business",  label:"Any business interests / conflicts of interest?" },
            { key:"dismissed", label:"Ever dismissed or asked to resign?" },
            { key:"criminal",  label:"Any pending criminal cases?" },
            { key:"civil",     label:"Any pending civil cases?" },
          ].map(({ key, label }) => (
            <div key={key} style={{ marginBottom:"1rem" }}>
              <label style={styles.label}>{label}</label>
              <div style={{ display:"flex", gap:"1rem", marginTop:"0.25rem" }}>
                <SelectField value={acknowledgements[key].val} onChange={(v) => updateAck(key, "val", v)} options={["Yes","No"]} />
                {acknowledgements[key].val === "Yes" && <Input label="Details" value={acknowledgements[key].note} onChange={(v) => updateAck(key, "note", v)} />}
              </div>
            </div>
          ))}
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

const Section     = ({ title, children }) => (<div style={{ marginBottom:"1.5rem" }}><h4 style={{ color:"#475569", fontSize:"0.85rem", fontWeight:700, textTransform:"uppercase", letterSpacing:0.5, marginBottom:"0.75rem" }}>{title}</h4>{children}</div>);
const Row         = ({ children }) => <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap", marginBottom:"0.75rem" }}>{children}</div>;
const Input       = ({ label, value, onChange, type="text" }) => (<div style={{ flex:1, minWidth:"180px" }}>{label && <label style={styles.label}>{label}</label>}<input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={styles.input} /></div>);
const SelectField = ({ label, value, onChange, options }) => (<div style={{ flex:1 }}>{label && <label style={styles.label}>{label}</label>}<select value={value} onChange={(e) => onChange(e.target.value)} style={styles.input}><option value="">Select</option>{options.map((o) => <option key={o}>{o}</option>)}</select></div>);

const styles = {
  page:       { background:"#f1f5f9", padding:"2rem", minHeight:"100vh", fontFamily:"Inter, system-ui, sans-serif" },
  card:       { maxWidth:"980px", margin:"auto", background:"#fff", padding:"2rem", borderRadius:"14px", boxShadow:"0 12px 30px rgba(0,0,0,0.08)" },
  title:      { marginBottom:"2rem" },
  label:      { fontSize:"0.85rem", color:"#475569" },
  input:      { width:"100%", padding:"0.65rem", borderRadius:"8px", border:"1px solid #cbd5e1" },
  button:     { padding:"0.9rem 2rem", borderRadius:"10px", border:"none", color:"#fff", fontSize:"1rem", cursor:"pointer" },
  signoutBtn: { padding:"0.4rem 1rem", border:"1px solid #e2e8f0", borderRadius:7, background:"#fff", color:"#64748b", fontSize:"0.85rem", cursor:"pointer", fontWeight:600 },
};
