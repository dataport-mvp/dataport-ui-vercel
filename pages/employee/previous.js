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
    experienceLetter: null
  };

  const emptyGap = {
    fromDate: "",
    toDate: "",
    reason: ""
  };

  const [employments, setEmployments] = useState([emptyEmployment]);
  const [hasGaps, setHasGaps] = useState("");
  const [gaps, setGaps] = useState([]);

  const updateEmployment = (i, field, value) => {
    const copy = [...employments];
    copy[i][field] = value;
    setEmployments(copy);
  };

  const addEmployment = () => {
    setEmployments([...employments, { ...emptyEmployment, status: "Previous" }]);
  };

  const updateGap = (i, field, value) => {
    const copy = [...gaps];
    copy[i][field] = value;
    setGaps(copy);
  };

  const addGap = () => {
    setGaps([...gaps, emptyGap]);
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
          <Section key={index} title={`Employment ${index + 1}`}>
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

            <Select
              label="Type of Employment"
              value={emp.employmentType}
              onChange={(v) => updateEmployment(index, "employmentType", v)}
              options={["Full-time", "Intern", "Contract"]}
            />

            <Input
              label="Reason for Leaving / Relieving"
              value={emp.reasonForLeaving}
              onChange={(v) => updateEmployment(index, "reasonForLeaving", v)}
            />

            <Section title="Reference Details">
              <Row>
                <Input
                  label="Reference Name"
                  value={emp.referenceName}
                  onChange={(v) => updateEmployment(index, "referenceName", v)}
                />
                <Input
                  label="Reference Email"
                  value={emp.referenceEmail}
                  onChange={(v) => updateEmployment(index, "referenceEmail", v)}
                />
              </Row>
              <Select
                label="Reference Type"
                value={emp.referenceType}
                onChange={(v) => updateEmployment(index, "referenceType", v)}
                options={["Manager", "Colleague", "HR", "Client"]}
              />
            </Section>

            <Section title="Documents">
              <label style={styles.label}>Payslips</label>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  updateEmployment(index, "payslips", Array.from(e.target.files))
                }
              />

              <Input
                label="Offer Letter"
                type="file"
                onChange={(e) =>
                  updateEmployment(index, "offerLetter", e.target.files[0])
                }
              />

              <Input
                label="Resignation Acceptance"
                type="file"
                onChange={(e) =>
                  updateEmployment(index, "resignationLetter", e.target.files[0])
                }
              />

              <Input
                label="Experience / Relieving Letter"
                type="file"
                onChange={(e) =>
                  updateEmployment(index, "experienceLetter", e.target.files[0])
                }
              />
            </Section>
          </Section>
        ))}

        <button style={styles.addBtn} onClick={addEmployment}>
          + Add Another Employer
        </button>

        <Section title="Employment Gaps">
          <Select
            label="Did you have any employment gaps?"
            value={hasGaps}
            onChange={setHasGaps}
            options={["Yes", "No"]}
          />

          {hasGaps === "Yes" && (
            <>
              {gaps.map((gap, index) => (
                <Section key={index} title={`Gap ${index + 1}`}>
                  <Row>
                    <Input
                      label="Gap From Date"
                      type="month"
                      value={gap.fromDate}
                      onChange={(v) => updateGap(index, "fromDate", v)}
                    />
                    <Input
                      label="Gap To Date"
                      type="month"
                      value={gap.toDate}
                      onChange={(v) => updateGap(index, "toDate", v)}
                    />
                  </Row>
                  <Input
                    label="Reason for Gap"
                    value={gap.reason}
                    onChange={(v) => updateGap(index, "reason", v)}
                  />
                </Section>
              ))}

              <button style={styles.addBtn} onClick={addGap}>
                + Add Gap
              </button>
            </>
          )}
        </Section>

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
