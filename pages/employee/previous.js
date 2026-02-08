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
  label: { fontSize: "0.85rem", color: "#475569" },
  input: {
    width: "100%",
    padding: "0.65rem",
    borderRadius: "8px",
    border: "1px solid #cbd5e1"
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
    cursor: "pointer"
  },
  employerCard: {
    marginBottom: "1.25rem",
    padding: "1rem",
    borderRadius: "10px",
    border: "1px solid #edf2f7"
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
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
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
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
    designation: "",
    department: "",
    duties: "",
    employmentType: "",
    reasonForRelieving: "",
    contractVendor: {
      company: "",
      email: "",
      mobile: ""
    },
    documents: {
      payslips: [],
      offerLetter: null,
      resignation: null,
      experience: null
    },
    gap: {
      hasGap: "",
      from: "",
      to: "",
      reason: ""
    }
  };

  const [employments, setEmployments] = useState([emptyEmployment]);

  const update = (i, path, value) => {
    const copy = JSON.parse(JSON.stringify(employments));
    const keys = path.split(".");
    let obj = copy[i];
    for (let k = 0; k < keys.length - 1; k++) obj = obj[keys[k]];
    obj[keys[keys.length - 1]] = value;
    setEmployments(copy);
  };

  const addEmployer = () => {
    setEmployments([...employments, JSON.parse(JSON.stringify(emptyEmployment))]);
  };

  const toggleExpanded = (i) => {
    const copy = [...employments];
    copy[i].expanded = !copy[i].expanded;
    setEmployments(copy);
  };

  const hasAnyData = (emp) =>
    emp.companyName || emp.employeeId || emp.workEmail || emp.designation || emp.department;

  return (
    <div style={styles.page}>
      <ProgressBar currentStep={3} totalSteps={4} />

      <div style={styles.card}>
        <h1 style={styles.title}>Employment History</h1>

        {employments.map((emp, index) => {
          if (!emp.expanded && !hasAnyData(emp)) return null;

          return (
            <div key={index} style={styles.employerCard}>
              <div style={styles.headerRow}>
                <h3>{index === 0 ? "Current Employer" : "Previous Employer"}</h3>
                <button style={styles.toggleBtn} onClick={() => toggleExpanded(index)}>
                  {emp.expanded ? "−" : "+"}
                </button>
              </div>

              {emp.expanded && (
                <>
                  {/* 1. DETAILS */}
                  <Row>
                    <Input label="Company Name" value={emp.companyName} onChange={(v) => update(index, "companyName", v)} />
                    <Input label="Office Address" value={emp.officeAddress} onChange={(v) => update(index, "officeAddress", v)} />
                  </Row>

                  <Row>
                    <Input label="Employee ID" value={emp.employeeId} onChange={(v) => update(index, "employeeId", v)} />
                    <Input label="Official Work Email" value={emp.workEmail} onChange={(v) => update(index, "workEmail", v)} />
                  </Row>

                  <Row>
                    <Input label="Designation" value={emp.designation} onChange={(v) => update(index, "designation", v)} />
                    <Input label="Department" value={emp.department} onChange={(v) => update(index, "department", v)} />
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

                  {/* CONTRACT */}
                  {emp.employmentType === "Contract" && (
                    <>
                      <h4>Vendor / Third-Party Details</h4>
                      <Row>
                        <Input label="Company Name" value={emp.contractVendor.company} onChange={(v) => update(index, "contractVendor.company", v)} />
                        <Input label="Company Email" value={emp.contractVendor.email} onChange={(v) => update(index, "contractVendor.email", v)} />
                        <Input
                          label="Mobile (India)"
                          value={emp.contractVendor.mobile}
                          maxLength={10}
                          onChange={(v) => /^\d*$/.test(v) && update(index, "contractVendor.mobile", v)}
                        />
                      </Row>
                    </>
                  )}

                  {/* 2. REASON */}
                  <TextArea
                    label="Reason for Relieving / Leaving"
                    value={emp.reasonForRelieving}
                    onChange={(v) => update(index, "reasonForRelieving", v)}
                  />

                  {/* 3. ATTACHMENTS */}
                  <h4>Attachments</h4>
                  <Input type="file" label="Payslips (Multiple)" onChange={(e) => update(index, "documents.payslips", Array.from(e.target.files))} />
                  <Input type="file" label="Offer Letter" onChange={(e) => update(index, "documents.offerLetter", e.target.files[0])} />
                  <Input type="file" label="Resignation Acceptance" onChange={(e) => update(index, "documents.resignation", e.target.files[0])} />
                  <Input type="file" label="Experience / Relieving Letter" onChange={(e) => update(index, "documents.experience", e.target.files[0])} />

                  {/* 4. GAP */}
                  {index !== employments.length - 1 && (
                    <>
                      <h4>Employment Gap</h4>
                      <div style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem" }}>
                        <button style={styles.yesNo(emp.gap.hasGap === "Yes")} onClick={() => update(index, "gap.hasGap", "Yes")}>Yes</button>
                        <button style={styles.yesNo(emp.gap.hasGap === "No")} onClick={() => update(index, "gap.hasGap", "No")}>No</button>
                      </div>

                      {emp.gap.hasGap === "Yes" && (
                        <>
                          <Row>
                            <Input type="month" label="Gap From" value={emp.gap.from} onChange={(v) => update(index, "gap.from", v)} />
                            <Input type="month" label="Gap To" value={emp.gap.to} onChange={(v) => update(index, "gap.to", v)} />
                          </Row>
                          <TextArea label="Reason for Gap" value={emp.gap.reason} onChange={(v) => update(index, "gap.reason", v)} />
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          );
        })}

        {/* 5. ADD EMPLOYER */}
        <button style={styles.secondaryBtn} onClick={addEmployer}>+ Add Another Employer</button>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
          <button style={styles.secondaryBtn} onClick={() => router.back()}>Previous</button>
          <button style={styles.primaryBtn} onClick={() => router.push("/employee/uan")}>Save & Proceed</button>
        </div>
      </div>
    </div>
  );
}
