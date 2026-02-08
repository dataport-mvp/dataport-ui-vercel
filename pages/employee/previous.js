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
  addBtn: {
    marginBottom: "2rem",
    padding: "0.6rem 1.2rem",
    borderRadius: "8px",
    border: "1px dashed #cbd5e1",
    background: "#f8fafc",
    cursor: "pointer"
  }
};

/* ---------- HELPERS ---------- */
const Section = ({ title, children }) => (
  <div style={{ marginBottom: "2rem" }}>
    <h2 style={styles.sectionTitle}>{title}</h2>
    {children}
  </div>
);

const Row = ({ children }) => (
  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
    {children}
  </div>
);

const Input = ({ label, value, onChange, type = "text" }) => (
  <div style={{ flex: 1, minWidth: "200px" }}>
    <label style={styles.label}>{label}</label>
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      style={styles.input}
    />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div style={{ flex: 1, minWidth: "200px" }}>
    <label style={styles.label}>{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={styles.input}
    >
      <option value="">Select</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  </div>
);

/* ---------- PAGE ---------- */
export default function PreviousCompany() {
  const router = useRouter();

  const emptyEmployment = {
    status: "",
    companyName: "",
    fromDate: "",
    toDate: "",
    designation: "",
    department: "",
    employmentType: "",
    reasonForLeaving: "",
    referenceName: "",
    referenceEmail: "",
    referenceType: "",
    payslips: [],
    offerLetter: null,
    resignationLetter: null,
    experienceLetter: null,
    hasGap: "",
    gap: {
      fromDate: "",
      toDate: "",
      reason: ""
    }
  };

  const [employments, setEmployments] = useState([emptyEmployment]);

  const updateEmployment = (i, field, value) => {
    const copy = [...employments];
    copy[i][field] = value;
    setEmployments(copy);
  };

  const updateGap = (i, field, value) => {
    const copy = [...employments];
    copy[i].gap[field] = value;
    setEmployments(copy);
  };

  const addEmployment = () => {
    setEmployments([...employments, { ...emptyEmployment, status: "Previous" }]);
  };

  const handleSave = () => {
    router.push("/employee/uan");
  };

  return (
    <div style={styles.page}>
      <ProgressBar currentStep={3} totalSteps={4} />

      <div style={styles.card}>
        <h1 style={styles.title}>Employment History</h1>

        {employments.map((emp, index) => (
          <div key={index}>
            <Section title={`Employment ${index + 1}`}>
              <Row>
                <Select
                  label="Employment Status"
                  value={emp.status}
                  onChange={(v) => updateEmployment(index, "status", v)}
                  options={index === 0 ? ["Current", "Previous"] : ["Previous"]}
                />
                <Input
                  label="Company Name"
                  value={emp.companyName}
                  onChange={(v) => updateEmployment(index, "companyName", v)}
                />
              </Row>

              <Row>
                <Input
                  label="From Date"
                  type="month"
                  value={emp.fromDate}
                  onChange={(v) => updateEmployment(index, "fromDate", v)}
                />
                <Input
                  label={emp.status === "Current" ? "Expected End Date" : "End Date"}
                  type="month"
                  value={emp.toDate}
                  onChange={(v) => updateEmployment(index, "toDate", v)}
                />
              </Row>

              <Row>
                <Input
                  label="Designation"
                  value={emp.designation}
                  onChange={(v) => updateEmployment(index, "designation", v)}
                />
                <Input
                  label="Department / Field"
                  value={emp.department}
                  onChange={(v) => updateEmployment(index, "department", v)}
                />
              </Row>

              <Input
                label="Reason for Leaving / Relieving"
                value={emp.reasonForLeaving}
                onChange={(v) => updateEmployment(index, "reasonForLeaving", v)}
              />
            </Section>

            {/* GAP AFTER THIS EMPLOYMENT */}
            <Section title="Employment Gap">
              <Select
                label="Was there any gap after this employment?"
                value={emp.hasGap}
                onChange={(v) => updateEmployment(index, "hasGap", v)}
                options={["Yes", "No"]}
              />

              {emp.hasGap === "Yes" && (
                <>
                  <Row>
                    <Input
                      label="Gap From Date"
                      type="month"
                      value={emp.gap.fromDate}
                      onChange={(v) => updateGap(index, "fromDate", v)}
                    />
                    <Input
                      label="Gap To Date"
                      type="month"
                      value={emp.gap.toDate}
                      onChange={(v) => updateGap(index, "toDate", v)}
                    />
                  </Row>

                  <Input
                    label="Reason for Gap"
                    value={emp.gap.reason}
                    onChange={(v) => updateGap(index, "reason", v)}
                  />
                </>
              )}
            </Section>
          </div>
        ))}

        <button style={styles.addBtn} onClick={addEmployment}>
          + Add Another Employer
        </button>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button style={styles.secondaryBtn} onClick={() => router.back()}>
            Previous
          </button>
          <button style={styles.primaryBtn} onClick={handleSave}>
            Save & Proceed
          </button>
        </div>
      </div>
    </div>
  );
}
