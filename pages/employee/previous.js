import { useState } from "react";
import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";

/* ---------- BASE STYLES (LOCKED) ---------- */
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
  title: {
    marginBottom: "2rem"
  },
  sectionTitle: {
    marginBottom: "1rem",
    color: "#0f172a"
  },
  label: {
    fontSize: "0.85rem",
    color: "#475569"
  },
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

/* ---------- HELPERS (LOCKED) ---------- */
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
      value={value}
      disabled={disabled}
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

  const [employmentStatus, setEmploymentStatus] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [employmentType, setEmploymentType] = useState("");

  const [vendorName, setVendorName] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");

  const [supervisorName, setSupervisorName] = useState("");
  const [supervisorEmail, setSupervisorEmail] = useState("");
  const [supervisorTitle, setSupervisorTitle] = useState("");

  const [payslips, setPayslips] = useState([]);

  const handlePayslipUpload = (files) => {
    setPayslips([...payslips, ...Array.from(files)]);
  };

  const removePayslip = (index) => {
    setPayslips(payslips.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    router.push("/employee/uan");
  };

  return (
    <div style={styles.page}>
      <ProgressBar currentStep={3} totalSteps={4} />

      <div style={styles.card}>
        <h1 style={styles.title}>Employment Details</h1>

        {/* Employment Overview */}
        <Section title="Employment Overview">
          <Row>
            <Select
              label="Employment Status"
              value={employmentStatus}
              onChange={setEmploymentStatus}
              options={["Current", "Previous"]}
            />
            <Input label="Company Name" value={companyName} onChange={setCompanyName} />
          </Row>

          <Row>
            <Input label="Work Location (City, Country)" value={location} onChange={setLocation} />
            <Input label="Employee ID / Code" value={employeeId} onChange={setEmployeeId} />
          </Row>

          <Input
            label="Official Company Email"
            value={officialEmail}
            onChange={setOfficialEmail}
            type="email"
          />
        </Section>

        {/* Duration & Role */}
        <Section title="Duration & Role">
          <Row>
            <Input label="From Date" type="month" value={fromDate} onChange={setFromDate} />
            <Input
              label="To Date"
              type="month"
              value={employmentStatus === "Current" ? "Present" : toDate}
              onChange={setToDate}
              disabled={employmentStatus === "Current"}
            />
          </Row>

          <Row>
            <Input label="Designation / Job Title" value={designation} onChange={setDesignation} />
            <Input label="Department / Field" value={department} onChange={setDepartment} />
          </Row>

          <Select
            label="Type of Employment"
            value={employmentType}
            onChange={setEmploymentType}
            options={["Full-time", "Intern", "Contract"]}
          />
        </Section>

        {/* Contract Details */}
        {employmentType === "Contract" && (
          <Section title="Contract / Vendor Details">
            <Row>
              <Input label="Vendor Company Name" value={vendorName} onChange={setVendorName} />
              <Input label="Client Company Name" value={clientCompany} onChange={setClientCompany} />
            </Row>
            <Input
              label="Vendor Contact Email"
              value={vendorEmail}
              onChange={setVendorEmail}
              type="email"
            />
          </Section>
        )}

        {/* Supervisor */}
        <Section title="Supervisor Details">
          <Row>
            <Input label="Supervisor Name" value={supervisorName} onChange={setSupervisorName} />
            <Input
              label="Supervisor Email"
              value={supervisorEmail}
              onChange={setSupervisorEmail}
              type="email"
            />
          </Row>
          <Input
            label="Supervisor Designation"
            value={supervisorTitle}
            onChange={setSupervisorTitle}
          />
        </Section>

        {/* Documents */}
        <Section title="Payslips (Last 3 Months)">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            onChange={(e) => handlePayslipUpload(e.target.files)}
          />

          {payslips.map((file, index) => (
            <div key={index} style={{ marginTop: "0.5rem" }}>
              í³„ {file.name}
              <button
                onClick={() => removePayslip(index)}
                style={{ marginLeft: "1rem", color: "red", border: "none", background: "none", cursor: "pointer" }}
              >
                Remove
              </button>
            </div>
          ))}
        </Section>

        {/* Navigation */}
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

