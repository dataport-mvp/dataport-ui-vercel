// pages/employee/previous.js  — Page 3 of 4
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";
import { useAuth } from "../../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

/* ---------- STYLES ---------- */
const styles = {
  page:         { background: "#f1f5f9", padding: "2rem", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" },
  card:         { maxWidth: "980px", margin: "auto", background: "#fff", padding: "2rem", borderRadius: "14px", boxShadow: "0 12px 30px rgba(0,0,0,0.08)" },
  title:        { marginBottom: "2rem" },
  label:        { fontSize: "0.85rem", color: "#475569" },
  input:        { width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1" },
  primaryBtn:   { padding: "0.9rem 2.5rem", borderRadius: "10px", border: "none", background: "#2563eb", color: "#fff", cursor: "pointer" },
  secondaryBtn: { padding: "0.9rem 2.5rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer" },
  toggleBtn:    { padding: "0.4rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer" },
  employerCard: { marginBottom: "1.25rem", padding: "1rem", borderRadius: "10px", border: "1px solid #edf2f7" },
  headerRow:    { display: "flex", justifyContent: "space-between", alignItems: "center" },
  yesNo: (active) => ({
    padding: "0.35rem 1rem",
    borderRadius: "999px",
    border: "1px solid #cbd5e1",
    background: active ? "#2563eb" : "#f8fafc",
    color: active ? "#fff" : "#000",
    cursor: "pointer"
  })
};

/* ---------- HELPERS ---------- */
const Row = ({ children }) => (
  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
    {children}
  </div>
);

const Input = ({ label, value, onChange, type = "text", maxLength }) => (
  <div style={{ flex: 1, minWidth: "200px" }}>
    <label style={styles.label}>{label}</label>
    <input
      type={type}
      value={value || ""}
      maxLength={maxLength}
      onChange={(e) => onChange(e.target.value)}
      style={styles.input}
    />
  </div>
);

const TextArea = ({ label, value, onChange }) => (
  <div style={{ width: "100%", marginBottom: "0.75rem" }}>
    <label style={styles.label}>{label}</label>
    <textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...styles.input, minHeight: "80px" }}
    />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div style={{ flex: 1, minWidth: "200px" }}>
    <label style={styles.label}>{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} style={styles.input}>
      <option value="">Select</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

/* ---------- Empty shapes ---------- */
const emptyEmployment = () => ({
  companyName: "", officeAddress: "", employeeId: "", workEmail: "",
  designation: "", department: "", duties: "", employmentType: "",
  reasonForRelieving: "",
  reference:      { role: "", name: "", email: "", mobile: "" },
  contractVendor: { company: "", email: "", mobile: "" },
  documents:      { payslips: [], offerLetter: null, resignation: null, experience: null },
  gap:            { hasGap: "", reason: "" }
});

const emptyAck = () => ({ val: "", note: "" });

/* ---------- PAGE ---------- */
export default function PreviousCompany() {
  const router = useRouter();
  const { token } = useAuth();

  const [employments, setEmployments] = useState([emptyEmployment()]);
  const [ack, setAck] = useState({
    business: emptyAck(), dismissed: emptyAck(), criminal: emptyAck(), civil: emptyAck()
  });
  const [saveStatus, setSaveStatus] = useState("");

  /* ---------- Restore draft ---------- */
  useEffect(() => {
    try {
      const savedEmp = localStorage.getItem("dg_employments");
      const savedAck = localStorage.getItem("dg_ack");
      if (savedEmp) setEmployments(JSON.parse(savedEmp));
      if (savedAck) setAck(JSON.parse(savedAck));
    } catch (_) {}
  }, []);

  /* ---------- Update helper ---------- */
  const update = (i, path, value) => {
    const copy = JSON.parse(JSON.stringify(employments));
    const keys = path.split(".");
    let obj = copy[i];
    for (let k = 0; k < keys.length - 1; k++) obj = obj[keys[k]];
    obj[keys[keys.length - 1]] = value;
    setEmployments(copy);
  };

  const addEmployer = () => setEmployments([...employments, emptyEmployment()]);
  const removeEmployer = (i) => setEmployments(employments.filter((_, idx) => idx !== i));

  /* ---------- Save ---------- */
  const saveDraft = async () => {
    // 1. localStorage (primary — instant, never fails)
    localStorage.setItem("dg_employments", JSON.stringify(employments));
    localStorage.setItem("dg_ack",         JSON.stringify(ack));

    // 2. Background API save — silent on error
    try {
      await fetch(`${API}/employee/employment-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ employments, acknowledgements: ack }),
      });
    } catch (_) {}
  };

  const handleNext = async () => {
    setSaveStatus("Saving...");
    await saveDraft();
    setSaveStatus("Saved ✓");
    router.push("/employee/uan");
  };

  return (
    <div style={styles.page}>
      <ProgressBar currentStep={3} totalSteps={4} />

      <div style={styles.card}>
        <h1 style={styles.title}>Employment History</h1>

        {employments.map((emp, index) => (
          <div key={index} style={styles.employerCard}>
            <div style={styles.headerRow}>
              <h3>{index === 0 ? "Current Employer" : `Previous Employer ${index}`}</h3>
              {index !== 0 && (
                <button style={styles.toggleBtn} onClick={() => removeEmployer(index)}>−</button>
              )}
            </div>

            <Row>
              <Input label="Company Name"        value={emp.companyName}   onChange={(v) => update(index, "companyName", v)} />
              <Input label="Office Address"      value={emp.officeAddress} onChange={(v) => update(index, "officeAddress", v)} />
            </Row>
            <Row>
              <Input label="Employee ID"         value={emp.employeeId}    onChange={(v) => update(index, "employeeId", v)} />
              <Input label="Official Work Email" value={emp.workEmail}     onChange={(v) => update(index, "workEmail", v)} />
            </Row>
            <Row>
              <Input label="Designation" value={emp.designation} onChange={(v) => update(index, "designation", v)} />
              <Input label="Department"  value={emp.department}  onChange={(v) => update(index, "department", v)} />
            </Row>
            <Row>
              <Input label="Duties & Responsibilities" value={emp.duties} onChange={(v) => update(index, "duties", v)} />
              <Select
                label="Employment Type"
                value={emp.employmentType}
                onChange={(v) => update(index, "employmentType", v)}
                options={["Full-time", "Intern", "Contract"]}
              />
            </Row>

            {emp.employmentType === "Contract" && (
              <>
                <h4>Vendor / Third-Party Details</h4>
                <Row>
                  <Input label="Vendor Company Name" value={emp.contractVendor.company} onChange={(v) => update(index, "contractVendor.company", v)} />
                  <Input label="Vendor Email"        value={emp.contractVendor.email}   onChange={(v) => update(index, "contractVendor.email", v)} />
                  <Input
                    label="Vendor Mobile (India)"
                    value={emp.contractVendor.mobile}
                    maxLength={10}
                    onChange={(v) => /^\d*$/.test(v) && update(index, "contractVendor.mobile", v)}
                  />
                </Row>
              </>
            )}

            <TextArea
              label="Reason for Relieving / Leaving"
              value={emp.reasonForRelieving}
              onChange={(v) => update(index, "reasonForRelieving", v)}
            />

            <h4>Reference Details</h4>
            <Row>
              <Select
                label="Reference Role"
                value={emp.reference.role}
                onChange={(v) => update(index, "reference.role", v)}
                options={["Manager", "Colleague", "HR", "Client"]}
              />
              <Input label="Reference Name" value={emp.reference.name} onChange={(v) => update(index, "reference.name", v)} />
            </Row>
            <Row>
              <Input label="Reference Official Email" value={emp.reference.email}  onChange={(v) => update(index, "reference.email", v)} />
              <Input
                label="Reference Mobile (India)"
                maxLength={10}
                value={emp.reference.mobile}
                onChange={(v) => /^\d*$/.test(v) && update(index, "reference.mobile", v)}
              />
            </Row>

            <h4>
              Attachments{" "}
              <span style={{ fontWeight: 400, fontSize: "0.8rem", color: "#94a3b8" }}>
                (S3 upload — next commit)
              </span>
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {["Payslips (Last 3 Months)", "Offer Letter", "Resignation Acceptance", "Experience / Relieving Letter"].map((lbl) => (
                <div key={lbl}>
                  <label style={styles.label}>{lbl}</label>
                  <input type="file" disabled style={{ opacity: 0.5 }} />
                </div>
              ))}
            </div>

            <h4>Employment Gap</h4>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button style={styles.yesNo(emp.gap.hasGap === "Yes")} onClick={() => update(index, "gap.hasGap", "Yes")}>Yes</button>
              <button style={styles.yesNo(emp.gap.hasGap === "No")}  onClick={() => update(index, "gap.hasGap", "No")}>No</button>
            </div>
            {emp.gap.hasGap === "Yes" && (
              <TextArea label="Reason for Employment Gap" value={emp.gap.reason} onChange={(v) => update(index, "gap.reason", v)} />
            )}
          </div>
        ))}

        <button style={styles.secondaryBtn} onClick={addEmployer}>+ Add Another Employer</button>

        <h2 style={{ marginTop: "2rem" }}>Other Declarations</h2>
        {[
          ["business",  "Are you currently engaged in any other business or employment?"],
          ["dismissed", "Have you ever been dismissed from any employer?"],
          ["criminal",  "Have you ever been convicted in a court of law?"],
          ["civil",     "Have you ever had any civil judgment against you?"]
        ].map(([k, q]) => (
          <div key={k} style={{ marginBottom: "1rem" }}>
            <p>{q}</p>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button style={styles.yesNo(ack[k].val === "Yes")} onClick={() => setAck({ ...ack, [k]: { ...ack[k], val: "Yes" } })}>Yes</button>
              <button style={styles.yesNo(ack[k].val === "No")}  onClick={() => setAck({ ...ack, [k]: { ...ack[k], val: "No"  } })}>No</button>
            </div>
            {ack[k].val === "Yes" && (
              <TextArea label="Details" value={ack[k].note} onChange={(v) => setAck({ ...ack, [k]: { ...ack[k], note: v } })} />
            )}
          </div>
        ))}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2rem" }}>
          <button style={styles.secondaryBtn} onClick={() => router.back()}>Previous</button>
          <span style={{ color: "#64748b", fontSize: "0.85rem" }}>{saveStatus}</span>
          <button style={styles.primaryBtn} onClick={handleNext}>Save & Proceed</button>
        </div>
      </div>
    </div>
  );
}
