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
  employerCard: {
    marginBottom: "1rem",
    padding: "1rem",
    borderRadius: "10px",
    border: "1px solid #edf2f7"
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }
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
      {options.map((o) => <option key={o}>{o}</option>)}
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
    contractVendor: {
      company: "",
      email: "",
      mobile: ""
    }
  };

  const [employments, setEmployments] = useState([emptyEmployment]);

  const update = (i, field, value) => {
    const copy = [...employments];
    copy[i] = { ...copy[i], [field]: value };
    setEmployments(copy);
  };

  const addEmployer = () => {
    setEmployments([...employments, { ...emptyEmployment }]);
  };

  const toggleExpanded = (i) => {
    const copy = [...employments];
    copy[i].expanded = !copy[i].expanded;
    setEmployments(copy);
  };

  const hasAnyData = (emp) =>
    emp.companyName ||
    emp.employeeId ||
    emp.workEmail ||
    emp.designation ||
    emp.department;

  return (
    <div style={styles.page}>
      <ProgressBar currentStep={3} totalSteps={4} />

      <div style={styles.card}>
        <h1 style={styles.title}>Employment History</h1>

        {employments.map((emp, index) => {
          // 🔑 KEY FIX: hide empty collapsed employers
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

                  {/* CONTRACT DETAILS */}
                  {emp.employmentType === "Contract" && (
                    <div style={{ marginTop: "1rem" }}>
                      <h4>Vendor / Third-Party Details</h4>
                      <Row>
                        <Input label="Company Name" value={emp.contractVendor.company} onChange={(v) => {
                          const copy = [...employments];
                          copy[index].contractVendor.company = v;
                          setEmployments(copy);
                        }} />
                        <Input label="Company Email" value={emp.contractVendor.email} onChange={(v) => {
                          const copy = [...employments];
                          copy[index].contractVendor.email = v;
                          setEmployments(copy);
                        }} />
                        <Input
                          label="Mobile (India)"
                          value={emp.contractVendor.mobile}
                          maxLength={10}
                          onChange={(v) => {
                            if (/^\d*$/.test(v)) {
                              const copy = [...employments];
                              copy[index].contractVendor.mobile = v;
                              setEmployments(copy);
                            }
                          }}
                        />
                      </Row>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}

        <button style={styles.secondaryBtn} onClick={addEmployer}>
          + Add Another Employer
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
          <button style={styles.secondaryBtn} onClick={() => router.back()}>Previous</button>
          <button style={styles.primaryBtn} onClick={() => router.push("/employee/uan")}>Save & Proceed</button>
        </div>
      </div>
    </div>
  );
}
