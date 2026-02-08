import { useState } from "react";
import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";

/* ---------- STYLES (LOCKED) ---------- */
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

const Input = ({ label, value, onChange, type = "text", disabled }) => (
  <div style={{ flex: 1, minWidth: "200px" }}>
    <label style={styles.label}>{label}</label>
    <input
      type={type}
      value={value || ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      style={styles.input}
    />
  </div>
);

const Select = ({ label, value, onChange, options, disabled }) => (
  <div style={{ flex: 1, minWidth: "200px" }}>
    <label style={styles.label}>{label}</label>
    <select
      value={value}
      disabled={disabled}
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
    location: "",
    employeeId: "",
    officialEmail: "",
    fromDate: "",
    toDate: "",
    designation: "",
    department: "",
    employmentType: "",
    vendorName: "",
    clientCompany: "",
    vendorEmail: "",
    supervisorName: "",
    supervisorEmail: "",
    supervisorTitle: "",
    payslips: [],
    offerLetter: null,
    resignationLetter: null,
    experienceLetter: null
  };

  const [employments, setEmployments] = useState([emptyEmployment]);

  const updateEmployment = (index, field, value) => {
    const updated = [...employments];
    updated[index][field] = value;
    setEmployments(updated);
  };

  const addEmployer = () => {
    if (employments.length >= 5) return;
    setEmployments([...employments, { ...emptyEmployment, status: "Previous" }]);
  };

  const handlePayslipUpload = (index, files) => {
    const updated = [...employments];
    updated[index].payslips = [
      ...updated[index].payslips,
      ...Array.from(files)
    ];
    setEmployments(updated);
  };

  const removePayslip = (empIndex, fileIndex) => {
    const updated = [...employments];
    updated[empIndex].payslips = updated[empIndex].payslips.filter(
      (_, i) => i !== fileIndex
    );
    setEmployments(updated);
  };

  const handleSave = () => {
    router.push("/employee/uan");
  };

  return (
    <div style={styles.page}>
      <ProgressBar currentStep={3} totalSteps={4} />

      <div style={styles.card}>
        <h1 style={styles.title}>Employment Details</h1>

        {employments.map((emp, index) => (
          <Section key={index} title={`Employment ${index + 1}`}>
            <Row>
              <Select
                label="Employment Status"
                value={emp.status}
                onChange={(v) => updateEmployment(index, "status", v)}
                options={index === 0 ? ["Current", "Previous"] : ["Previous"]}
                disabled={index !== 0}
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
                label={
                  emp.status === "Current"
                    ? "Expected End Date (optional)"
                    : "End Date"
                }
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

            {emp.employmentType === "Contract" && (
              <Section title="Contract Details">
                <Row>
                  <Input
                    label="Vendor Company"
                    value={emp.vendorName}
                    onChange={(v) => updateEmployment(index, "vendorName", v)}
                  />
                  <Input
                    label="Client Company"
                    value={emp.clientCompany}
                    onChange={(v) => updateEmployment(index, "clientCompany", v)}
                  />
                </Row>
                <Input
                  label="Vendor Contact Email"
                  type="email"
                  value={emp.vendorEmail}
                  onChange={(v) => updateEmployment(index, "vendorEmail", v)}
                />
              </Section>
            )}

            <Section title="Supervisor Details">
              <Row>
                <Input
                  label="Supervisor Name"
                  value={emp.supervisorName}
                  onChange={(v) => updateEmployment(index, "supervisorName", v)}
                />
                <Input
                  label="Supervisor Email"
                  type="email"
                  value={emp.supervisorEmail}
                  onChange={(v) => updateEmployment(index, "supervisorEmail", v)}
                />
              </Row>
              <Input
                label="Supervisor Designation"
                value={emp.supervisorTitle}
                onChange={(v) => updateEmployment(index, "supervisorTitle", v)}
              />
            </Section>

            <Section title="Documents">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  handlePayslipUpload(index, e.target.files)
                }
              />

              {emp.payslips.map((file, i) => (
                <div key={i}>
                  {file.name}
                  <button
                    type="button"
                    onClick={() => removePayslip(index, i)}
                    style={{ marginLeft: "1rem", color: "red", background: "none", border: "none" }}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <Input
                label="Offer Letter (optional)"
                type="file"
                onChange={(e) =>
                  updateEmployment(index, "offerLetter", e.target.files[0])
                }
              />

              <Input
                label="Resignation Acceptance (optional)"
                type="file"
                onChange={(e) =>
                  updateEmployment(index, "resignationLetter", e.target.files[0])
                }
              />

              <Input
                label="Experience / Relieving Letter (optional)"
                type="file"
                onChange={(e) =>
                  updateEmployment(index, "experienceLetter", e.target.files[0])
                }
              />
            </Section>
          </Section>
        ))}

        {employments.length < 5 && (
          <button
            type="button"
            onClick={addEmployer}
            style={{ marginBottom: "2rem" }}
          >
            + Add Another Employer
          </button>
        )}

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
