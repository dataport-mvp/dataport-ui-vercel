import { useState } from "react";
import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";

/* ---------- STYLES ---------- */
const styles = {
  page: {
    background: "#f1f5f9",
    padding: "2rem",
    minHeight: "100vh",
    fontFamily: "Inter, system-ui, sans-serif"
  },
  card: {
    maxWidth: "980px",
    margin: "auto",
    background: "#fff",
    padding: "2rem",
    borderRadius: "14px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.08)"
  },
  title: { marginBottom: "2rem" },
  sectionTitle: { marginBottom: "1rem", color: "#0f172a", fontSize: "1.25rem" },
  label: { fontSize: "0.85rem", color: "#475569" },
  input: {
    width: "100%",
    padding: "0.65rem",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    boxSizing: "border-box"
  },
  primaryBtn: {
    padding: "0.9rem 2.5rem",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer"
  },
  secondaryBtn: {
    padding: "0.9rem 2.5rem",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    cursor: "pointer"
  },
  toggleBtn: {
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    cursor: "pointer",
    height: "36px",
    alignSelf: "center"
  },
  yesNo: (active) => ({
    padding: "0.4rem 1rem",
    borderRadius: "999px",
    border: "1px solid #cbd5e1",
    background: active ? "#2563eb" : "#f8fafc",
    color: active ? "#fff" : "#000",
    cursor: "pointer"
  }),
  employerCard: {
    marginBottom: "1.25rem",
    padding: "1rem",
    borderRadius: "10px",
    border: "1px solid #edf2f7",
    background: "#ffffff"
  },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" },
  headerTitle: { margin: 0, fontSize: "1.1rem", color: "#0f172a" }
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

const Select = ({ label, value, onChange, options }) => (
  <div style={{ flex: 1, minWidth: "200px" }}>
    <label style={styles.label}>{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} style={styles.input}>
      <option value="">Select</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

/* ---------- PAGE ---------- */
export default function PreviousCompany() {
  const router = useRouter();

  const emptyEmployment = {
    expanded: true,
    companyName: "",
    officeAddress: "",
    employeeId: "",
    workEmail: "",
    fromDate: "",
    toDate: "",
    designation: "",
    department: "",
    duties: "",
    employmentType: "",
    reference: {
      role: "",
      name: "",
      email: "",
      mobile: ""
    },
    documents: {
      payslips: [],
      offerLetter: null,
      resignation: null,
      experience: null
    }
  };

  const [employments, setEmployments] = useState([emptyEmployment]);

  const update = (i, path, value) => {
    // path is simple like "companyName" or "reference.name" or "documents.payslips"
    const copy = JSON.parse(JSON.stringify(employments)); // deep copy to avoid mutation
    const keys = path.split(".");
    let obj = copy[i];
    for (let k = 0; k < keys.length - 1; k++) {
      if (!obj[keys[k]]) obj[keys[k]] = {};
      obj = obj[keys[k]];
    }
    obj[keys[keys.length - 1]] = value;
    setEmployments(copy);
  };

  const addEmployer = () => {
    setEmployments([...employments, JSON.parse(JSON.stringify(emptyEmployment))]);
    // scroll not handled here; keep it simple
  };

  const toggleExpanded = (i) => {
    const copy = [...employments];
    copy[i].expanded = !copy[i].expanded;
    setEmployments(copy);
  };

  const handleFileChange = (i, path, files) => {
    // files: FileList
    const arr = Array.from(files || []);
    update(i, path, arr);
  };

  const handleSingleFileChange = (i, path, file) => {
    update(i, path, file || null);
  };

  const [declarations, setDeclarations] = useState({
    business: { value: "", note: "" },
    dismissed: { value: "", note: "" },
    criminal: { value: "", note: "", prosecution: "" },
    civil: { value: "", note: "" }
  });

  const handleSave = () => {
    // For now just navigate to next step; persist later
    router.push("/employee/uan");
  };

  return (
    <div style={styles.page}>
      <ProgressBar currentStep={3} totalSteps={4} />

      <div style={styles.card}>
        <h1 style={styles.title}>Employment History</h1>

        {/* EMPLOYER CARDS */}
        {employments.map((emp, index) => (
          <div key={index} style={styles.employerCard}>
            <div style={styles.headerRow}>
              <h3 style={styles.headerTitle}>{index === 0 ? "Current Employer" : "Previous Employer"}</h3>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <button
                  style={styles.toggleBtn}
                  onClick={() => toggleExpanded(index)}
                  aria-label={emp.expanded ? "Collapse employer" : "Expand employer"}
                >
                  {emp.expanded ? "−" : "+"}
                </button>
              </div>
            </div>

            {emp.expanded && (
              <>
                <Row>
                  <Input label="Company Name" value={emp.companyName} onChange={(v) => update(index, "companyName", v)} />
                  <Input label="Office Address" value={emp.officeAddress} onChange={(v) => update(index, "officeAddress", v)} />
                </Row>

                <Row>
                  <Input label="Employee ID" value={emp.employeeId} onChange={(v) => update(index, "employeeId", v)} />
                  <Input label="Official Work Email" value={emp.workEmail} onChange={(v) => update(index, "workEmail", v)} type="email" />
                </Row>

                <Row>
                  <Input label="From Date" value={emp.fromDate} type="month" onChange={(v) => update(index, "fromDate", v)} />
                  <Input label="To Date / Expected End Date" value={emp.toDate} type="month" onChange={(v) => update(index, "toDate", v)} />
                </Row>

                <Row>
                  <Input label="Designation / Job Title" value={emp.designation} onChange={(v) => update(index, "designation", v)} />
                  <Input label="Department / Functional Area" value={emp.department} onChange={(v) => update(index, "department", v)} />
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

                {/* Reference */}
                <div style={{ marginTop: "0.6rem", marginBottom: "0.6rem" }}>
                  <h4 style={{ margin: 0, marginBottom: "0.5rem", color: "#0f172a" }}>Reference Details</h4>
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
                    <Input label="Reference Email" value={emp.reference.email} onChange={(v) => update(index, "reference.email", v)} type="email" />
                    <Input
                      label="Reference Mobile (India)"
                      value={emp.reference.mobile}
                      maxLength={10}
                      onChange={(v) => {
                        if (/^\d*$/.test(v)) update(index, "reference.mobile", v);
                      }}
                    />
                  </Row>
                </div>

                {/* Attachments */}
                <div style={{ marginTop: "0.6rem", marginBottom: "0.6rem" }}>
                  <h4 style={{ margin: 0, marginBottom: "0.5rem", color: "#0f172a" }}>Attachments</h4>

                  <div style={{ marginBottom: "0.6rem" }}>
                    <label style={styles.label}>Payslips (multiple)</label>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(index, "documents.payslips", e.target.files)}
                    />
                    {/* show uploaded payslips */}
                    {emp.documents.payslips && emp.documents.payslips.length > 0 && (
                      <div style={{ marginTop: "0.5rem" }}>
                        {emp.documents.payslips.map((f, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                            <span style={{ fontSize: "0.9rem" }}>{f.name || f}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const copy = JSON.parse(JSON.stringify(employments));
                                copy[index].documents.payslips = copy[index].documents.payslips.filter((_, idx) => idx !== i);
                                setEmployments(copy);
                              }}
                              style={{ marginLeft: "0.5rem", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: "0.6rem" }}>
                    <label style={styles.label}>Offer Letter</label>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleSingleFileChange(index, "documents.offerLetter", e.target.files[0])} />
                    {emp.documents.offerLetter && <div style={{ marginTop: "0.5rem" }}>{emp.documents.offerLetter.name || "uploaded"}</div>}
                  </div>

                  <div style={{ marginBottom: "0.6rem" }}>
                    <label style={styles.label}>Resignation Acceptance</label>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleSingleFileChange(index, "documents.resignation", e.target.files[0])} />
                    {emp.documents.resignation && <div style={{ marginTop: "0.5rem" }}>{emp.documents.resignation.name || "uploaded"}</div>}
                  </div>

                  <div style={{ marginBottom: "0.6rem" }}>
                    <label style={styles.label}>Experience / Relieving Letter</label>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleSingleFileChange(index, "documents.experience", e.target.files[0])} />
                    {emp.documents.experience && <div style={{ marginTop: "0.5rem" }}>{emp.documents.experience.name || "uploaded"}</div>}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}

        <div style={{ margin: "1rem 0" }}>
          <button style={styles.secondaryBtn} onClick={addEmployer}>+ Add Another Employer</button>
        </div>

        {/* DECLARATIONS */}
        <div style={{ marginTop: "1.5rem" }}>
          <h2 style={styles.sectionTitle}>Other Declarations</h2>

          {[
            ["business", "Are you currently engaged in any other business or employment?"],
            ["dismissed", "Have you ever been dismissed from service of any employer?"],
            ["criminal", "Have you ever been convicted in a court of law or criminal offence?"],
            ["civil", "Have you ever had any civil judgments made against you?"]
          ].map(([key, label]) => (
            <div key={key} style={{ marginBottom: "1rem" }}>
              <p style={{ margin: "0 0 0.5rem 0" }}>{label}</p>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem" }}>
                <button style={styles.yesNo(declarations[key].value === "Yes")} onClick={() => setDeclarations({ ...declarations, [key]: { ...declarations[key], value: "Yes" } })}>Yes</button>
                <button style={styles.yesNo(declarations[key].value === "No")} onClick={() => setDeclarations({ ...declarations, [key]: { ...declarations[key], value: "No" } })}>No</button>
              </div>
              {declarations[key].value === "Yes" && (
                <Input label="Details" value={declarations[key].note} onChange={(v) => setDeclarations({ ...declarations, [key]: { ...declarations[key], note: v } })} />
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
          <button style={styles.secondaryBtn} onClick={() => router.back()}>Previous</button>
          <button style={styles.primaryBtn} onClick={handleSave}>Save & Proceed</button>
        </div>
      </div>
    </div>
  );
}
