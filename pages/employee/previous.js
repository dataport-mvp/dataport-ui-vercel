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
    company: {
      name: "",
      officeAddress: "",
      city: "",
      country: ""
    },
    identifiers: {
      employeeId: "",
      workEmail: ""
    },
    duration: {
      from: "",
      to: ""
    },
    role: {
      designation: "",
      department: "",
      employmentType: ""
    },
    contractDetails: {
      vendorCompany: "",
      clientCompany: "",
      vendorEmail: ""
    },
    reasonForLeaving: "",
    reference: {
      role: "",
      company: "",
      name: "",
      email: "",
      mobile: ""
    },
    documents: {
      payslips: [],
      offerLetter: null,
      resignationAcceptance: null,
      experienceLetter: null
    },
    gapAfter: {
      hasGap: "",
      from: "",
      to: "",
      reason: ""
    }
  };

  const [employments, setEmployments] = useState([emptyEmployment]);

  const updateEmployment = (i, path, value) => {
    const copy = [...employments];
    let obj = copy[i];
    const keys = path.split(".");
    for (let k = 0; k < keys.length - 1; k++) {
      obj = obj[keys[k]];
    }
    obj[keys[keys.length - 1]] = value;
    setEmployments(copy);
  };

  const addEmployment = () => {
    setEmployments([...employments, emptyEmployment]);
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
            <Section title={index === 0 ? "Current Employer" : "Previous Employer"}>
              <Row>
                <Input
                  label="Company Name"
                  value={emp.company.name}
                  onChange={(v) => updateEmployment(index, "company.name", v)}
                />
                <Input
                  label="Office Address"
                  value={emp.company.officeAddress}
                  onChange={(v) => updateEmployment(index, "company.officeAddress", v)}
                />
              </Row>

              <Row>
                <Input
                  label="Employee ID"
                  value={emp.identifiers.employeeId}
                  onChange={(v) => updateEmployment(index, "identifiers.employeeId", v)}
                />
                <Input
                  label="Official Work Email"
                  value={emp.identifiers.workEmail}
                  onChange={(v) => updateEmployment(index, "identifiers.workEmail", v)}
                  type="email"
                />
              </Row>

              <Row>
                <Input
                  label="From Date"
                  type="month"
                  value={emp.duration.from}
                  onChange={(v) => updateEmployment(index, "duration.from", v)}
                />
                <Input
                  label="To Date / Expected End Date"
                  type="month"
                  value={emp.duration.to}
                  onChange={(v) => updateEmployment(index, "duration.to", v)}
                />
              </Row>

              <Row>
                <Input
                  label="Designation"
                  value={emp.role.designation}
                  onChange={(v) => updateEmployment(index, "role.designation", v)}
                />
                <Input
                  label="Department / Field"
                  value={emp.role.department}
                  onChange={(v) => updateEmployment(index, "role.department", v)}
                />
              </Row>

              <Select
                label="Employment Type"
                value={emp.role.employmentType}
                onChange={(v) => updateEmployment(index, "role.employmentType", v)}
                options={["Full-time", "Intern", "Contract"]}
              />

              {emp.role.employmentType === "Contract" && (
                <Section title="Contract Details">
                  <Row>
                    <Input
                      label="Vendor Company"
                      value={emp.contractDetails.vendorCompany}
                      onChange={(v) =>
                        updateEmployment(index, "contractDetails.vendorCompany", v)
                      }
                    />
                    <Input
                      label="Client Company"
                      value={emp.contractDetails.clientCompany}
                      onChange={(v) =>
                        updateEmployment(index, "contractDetails.clientCompany", v)
                      }
                    />
                  </Row>
                  <Input
                    label="Vendor Contact Email"
                    value={emp.contractDetails.vendorEmail}
                    onChange={(v) =>
                      updateEmployment(index, "contractDetails.vendorEmail", v)
                    }
                    type="email"
                  />
                </Section>
              )}

              <Input
                label="Reason for Leaving / Relieving"
                value={emp.reasonForLeaving}
                onChange={(v) => updateEmployment(index, "reasonForLeaving", v)}
              />

              <Section title="Reference Details">
                <Select
                  label="Reference Role"
                  value={emp.reference.role}
                  onChange={(v) => updateEmployment(index, "reference.role", v)}
                  options={["Manager", "Colleague", "HR", "Client"]}
                />

                <Row>
                  <Input
                    label="Reference Company"
                    value={emp.reference.company}
                    onChange={(v) => updateEmployment(index, "reference.company", v)}
                  />
                  <Input
                    label="Reference Name"
                    value={emp.reference.name}
                    onChange={(v) => updateEmployment(index, "reference.name", v)}
                  />
                </Row>

                <Row>
                  <Input
                    label="Reference Email"
                    value={emp.reference.email}
                    onChange={(v) => updateEmployment(index, "reference.email", v)}
                    type="email"
                  />
                  <Input
                    label="Reference Mobile (India)"
                    value={emp.reference.mobile}
                    onChange={(v) => {
                      if (/^\d*$/.test(v)) {
                        updateEmployment(index, "reference.mobile", v);
                      }
                    }}
                    maxLength={10}
                  />
                </Row>
              </Section>

              <Section title="Documents">
                <label style={styles.label}>Payslips</label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    updateEmployment(
                      index,
                      "documents.payslips",
                      Array.from(e.target.files)
                    )
                  }
                />

                <Input
                  label="Offer Letter"
                  type="file"
                  onChange={(e) =>
                    updateEmployment(
                      index,
                      "documents.offerLetter",
                      e.target.files[0]
                    )
                  }
                />

                <Input
                  label="Resignation Acceptance"
                  type="file"
                  onChange={(e) =>
                    updateEmployment(
                      index,
                      "documents.resignationAcceptance",
                      e.target.files[0]
                    )
                  }
                />

                <Input
                  label="Experience / Relieving Letter"
                  type="file"
                  onChange={(e) =>
                    updateEmployment(
                      index,
                      "documents.experienceLetter",
                      e.target.files[0]
                    )
                  }
                />
              </Section>
            </Section>

            <Section title="Employment Gap">
              <Select
                label="Any employment gap?"
                value={emp.gapAfter.hasGap}
                onChange={(v) =>
                  updateEmployment(index, "gapAfter.hasGap", v)
                }
                options={["Yes", "No"]}
              />

              {emp.gapAfter.hasGap === "Yes" && (
                <>
                  <Row>
                    <Input
                      label="Gap From Date"
                      type="month"
                      value={emp.gapAfter.from}
                      onChange={(v) =>
                        updateEmployment(index, "gapAfter.from", v)
                      }
                    />
                    <Input
                      label="Gap To Date"
                      type="month"
                      value={emp.gapAfter.to}
                      onChange={(v) =>
                        updateEmployment(index, "gapAfter.to", v)
                      }
                    />
                  </Row>
                  <Input
                    label="Reason for Gap"
                    value={emp.gapAfter.reason}
                    onChange={(v) =>
                      updateEmployment(index, "gapAfter.reason", v)
                    }
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
