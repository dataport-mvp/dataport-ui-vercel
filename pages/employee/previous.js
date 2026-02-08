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
  sectionTitle: { marginBottom: "1rem", color: "#0f172a" },
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
  yesNo: (active) => ({
    padding: "0.4rem 1rem",
    borderRadius: "999px",
    border: "1px solid #cbd5e1",
    background: active ? "#2563eb" : "#f8fafc",
    color: active ? "#fff" : "#000",
    cursor: "pointer"
  })
};

/* ---------- HELPERS ---------- */
const Section = ({ title, children, right }) => (
  <div style={{ marginBottom: "2rem" }}>
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      {right}
    </div>
    {children}
  </div>
);

const Row = ({ children }) => (
  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
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

/* ---------- PAGE ---------- */
export default function PreviousCompany() {
  const router = useRouter();

  const emptyEmployment = {
    expanded: true,
    companyName: "",
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

  const update = (i, field, value) => {
    const copy = [...employments];
    copy[i][field] = value;
    setEmployments(copy);
  };

  const addEmployer = () => {
    setEmployments([...employments, { ...emptyEmployment }]);
  };

  /* ---------- DECLARATIONS ---------- */
  const [declarations, setDeclarations] = useState({
    business: { value: "", note: "" },
    dismissed: { value: "", note: "" },
    criminal: { value: "", note: "", prosecution: "" },
    civil: { value: "", note: "" }
  });

  const handleSave = () => router.push("/employee/uan");

  return (
    <div style={styles.page}>
      <ProgressBar currentStep={3} totalSteps={4} />

      <div style={styles.card}>
        <h1 style={styles.title}>Employment History</h1>

        {employments.map((emp, index) => (
          <Section
            key={index}
            title={index === 0 ? "Current Employer" : "Previous Employer"}
            right={
              <button
                style={styles.toggleBtn}
                onClick={() => update(index, "expanded", !emp.expanded)}
              >
                {emp.expanded ? "−" : "+"}
              </button>
            }
          >
            {emp.expanded && (
              <>
                <Row>
                  <Input label="Company Name" value={emp.companyName} onChange={(v) => update(index, "companyName", v)} />
                  <Input label="Employee ID" value={emp.employeeId} onChange={(v) => update(index, "employeeId", v)} />
                </Row>

                <Row>
                  <Input label="Official Work Email" value={emp.workEmail} onChange={(v) => update(index, "workEmail", v)} />
                  <Input label="Designation / Job Title" value={emp.designation} onChange={(v) => update(index, "designation", v)} />
                </Row>

                <Row>
                  <Input label="Department / Functional Area" value={emp.department} onChange={(v) => update(index, "department", v)} />
                  <Input label="Duties & Responsibilities" value={emp.duties} onChange={(v) => update(index, "duties", v)} />
                </Row>

                <Section title="Reference Details">
                  <Row>
                    <Input label="Reference Role" value={emp.reference.role} onChange={(v) => update(index, "reference", { ...emp.reference, role: v })} />
                    <Input label="Reference Name" value={emp.reference.name} onChange={(v) => update(index, "reference", { ...emp.reference, name: v })} />
                  </Row>
                  <Row>
                    <Input label="Reference Email" value={emp.reference.email} onChange={(v) => update(index, "reference", { ...emp.reference, email: v })} />
                    <Input
                      label="Reference Mobile (India)"
                      value={emp.reference.mobile}
                      maxLength={10}
                      onChange={(v) => {
                        if (/^\d*$/.test(v)) {
                          update(index, "reference", { ...emp.reference, mobile: v });
                        }
                      }}
                    />
                  </Row>
                </Section>

                <Section title="Attachments">
                  <input type="file" multiple />
                  <Input label="Offer Letter" type="file" />
                  <Input label="Resignation Acceptance" type="file" />
                  <Input label="Experience / Relieving Letter" type="file" />
                </Section>
              </>
            )}
          </Section>
        ))}

        <button style={styles.secondaryBtn} onClick={addEmployer}>
          + Add Another Employer
        </button>

        {/* ---------- DECLARATIONS ---------- */}
        <Section title="Other Declarations">
          {[
            ["business", "Are you currently engaged in any other business or employment?"],
            ["dismissed", "Have you ever been dismissed from service of any employer?"],
            ["criminal", "Have you ever been convicted in a court of law or criminal offence?"],
            ["civil", "Have you ever had any civil judgments made against you?"]
          ].map(([key, label]) => (
            <div key={key} style={{ marginBottom: "1rem" }}>
              <p>{label}</p>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button style={styles.yesNo(declarations[key].value === "Yes")} onClick={() => setDeclarations({ ...declarations, [key]: { ...declarations[key], value: "Yes" } })}>Yes</button>
                <button style={styles.yesNo(declarations[key].value === "No")} onClick={() => setDeclarations({ ...declarations, [key]: { ...declarations[key], value: "No" } })}>No</button>
              </div>

              {declarations[key].value === "Yes" && (
                <Input
                  label="Details"
                  value={declarations[key].note}
                  onChange={(v) => setDeclarations({ ...declarations, [key]: { ...declarations[key], note: v } })}
                />
              )}
            </div>
          ))}
        </Section>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button style={styles.secondaryBtn} onClick={() => router.back()}>Previous</button>
          <button style={styles.primaryBtn} onClick={handleSave}>Save & Proceed</button>
        </div>
      </div>
    </div>
  );
}
