// pages/employee/previous.js  ← Page 3 of 4

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL_PROD;

const emptyEmployment = () => ({
  companyName: "",
  officeAddress: "",
  employeeId: "",
  workEmail: "",
  designation: "",
  department: "",
  duties: "",
  employmentType: "",
  reasonForRelieving: "",
  reference: { role: "", name: "", email: "", mobile: "" },
  contractVendor: { company: "", email: "", mobile: "" },
  documents: { payslips: [], offerLetter: "", resignation: "", experience: "" },
  gap: { hasGap: "No", reason: "" },
});

const emptyAck = { val: "", note: "" };

export default function PreviousEmployment() {
  const router = useRouter();
  const { token } = useAuth();

  const [employments, setEmployments] = useState([emptyEmployment()]);
  const [acknowledgements, setAcknowledgements] = useState({
    business: { ...emptyAck },
    dismissed: { ...emptyAck },
    criminal: { ...emptyAck },
    civil: { ...emptyAck },
  });
  const [saveStatus, setSaveStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("employmentHistory");
    const savedAck = localStorage.getItem("acknowledgements");
    if (saved) setEmployments(JSON.parse(saved));
    if (savedAck) setAcknowledgements(JSON.parse(savedAck));
  }, []);

  // ─── Field helpers ───────────────────────────────────────────────

  const updateEmp = (index, field, value) => {
    setEmployments((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const updateNested = (index, parent, field, value) => {
    setEmployments((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [parent]: { ...copy[index][parent], [field]: value },
      };
      return copy;
    });
  };

  const updateAck = (key, field, value) => {
    setAcknowledgements((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const addEmployment = () => setEmployments((prev) => [...prev, emptyEmployment()]);
  const removeEmployment = (index) => {
    if (employments.length === 1) return;
    setEmployments((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Save & Navigate ─────────────────────────────────────────────

  const handleSave = async (status = "draft") => {
    setLoading(true);
    setSaveStatus("Saving...");

    // 1. Save to localStorage
    localStorage.setItem("employmentHistory", JSON.stringify(employments));
    localStorage.setItem("acknowledgements", JSON.stringify(acknowledgements));

    // 2. Background save to API
    try {
      const personalData = JSON.parse(localStorage.getItem("personalDetails") || "{}");
      const educationData = JSON.parse(localStorage.getItem("educationDetails") || "{}");

      const payload = {
        ...personalData,
        ...educationData,
        employmentHistory: employments,
        acknowledgements,
        status,
        updated_at: Date.now(),
      };

      const res = await fetch(`${API_URL}/employee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("API save failed");
      setSaveStatus("Saved ✓");
    } catch {
      setSaveStatus("Saved locally");
    }

    setLoading(false);

    if (status !== "draft") {
      router.push("/employee/uan");
    }
  };

  // ─── Styles ──────────────────────────────────────────────────────

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(to right, #e0f7fa, #f1f8e9)",
      padding: "2rem",
      fontFamily: "Arial, sans-serif",
    },
    card: {
      background: "#fff",
      borderRadius: "12px",
      padding: "2rem",
      maxWidth: "860px",
      margin: "0 auto",
      boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
    },
    progress: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "2rem",
    },
    step: (active) => ({
      flex: 1,
      height: "6px",
      background: active ? "#00838f" : "#cce5e8",
      borderRadius: "4px",
      margin: "0 4px",
    }),
    h2: { color: "#00838f", marginBottom: "1.5rem" },
    h3: { color: "#333", marginBottom: "1rem", borderBottom: "1px solid #eee", paddingBottom: "0.5rem" },
    section: { marginBottom: "1.5rem" },
    row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" },
    label: { display: "block", fontSize: "0.85rem", color: "#555", marginBottom: "4px", fontWeight: "600" },
    input: {
      width: "100%",
      padding: "0.55rem 0.75rem",
      borderRadius: "6px",
      border: "1px solid #ccc",
      fontSize: "0.95rem",
      boxSizing: "border-box",
    },
    select: {
      width: "100%",
      padding: "0.55rem 0.75rem",
      borderRadius: "6px",
      border: "1px solid #ccc",
      fontSize: "0.95rem",
      background: "#fff",
      boxSizing: "border-box",
    },
    textarea: {
      width: "100%",
      padding: "0.55rem 0.75rem",
      borderRadius: "6px",
      border: "1px solid #ccc",
      fontSize: "0.95rem",
      minHeight: "80px",
      resize: "vertical",
      boxSizing: "border-box",
    },
    empBlock: {
      border: "1px solid #b2dfdb",
      borderRadius: "10px",
      padding: "1.5rem",
      marginBottom: "1.5rem",
      background: "#f9fffe",
    },
    empHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1rem",
    },
    removeBtn: {
      background: "#ffebee",
      color: "#c62828",
      border: "1px solid #ef9a9a",
      borderRadius: "6px",
      padding: "0.3rem 0.8rem",
      cursor: "pointer",
      fontSize: "0.85rem",
    },
    addBtn: {
      background: "#e0f2f1",
      color: "#00838f",
      border: "1px solid #80cbc4",
      borderRadius: "8px",
      padding: "0.6rem 1.4rem",
      cursor: "pointer",
      fontWeight: "600",
      marginBottom: "2rem",
    },
    ackRow: {
      display: "grid",
      gridTemplateColumns: "1fr 100px 1fr",
      gap: "1rem",
      alignItems: "start",
      marginBottom: "1rem",
      padding: "0.75rem",
      background: "#f5f5f5",
      borderRadius: "8px",
    },
    ackLabel: { fontSize: "0.9rem", color: "#333", fontWeight: "600", paddingTop: "0.4rem" },
    buttonRow: { display: "flex", gap: "1rem", marginTop: "2rem", justifyContent: "flex-end" },
    backBtn: {
      padding: "0.75rem 2rem",
      borderRadius: "8px",
      border: "1px solid #ccc",
      background: "#fff",
      cursor: "pointer",
      fontSize: "1rem",
    },
    saveBtn: {
      padding: "0.75rem 2rem",
      borderRadius: "8px",
      border: "none",
      background: "#80cbc4",
      color: "#004d40",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "1rem",
    },
    nextBtn: {
      padding: "0.75rem 2.5rem",
      borderRadius: "8px",
      border: "none",
      background: "#00838f",
      color: "#fff",
      cursor: "pointer",
      fontWeight: "700",
      fontSize: "1rem",
    },
    statusText: { fontSize: "0.85rem", color: "#555", alignSelf: "center" },
    subHeading: { fontSize: "0.95rem", fontWeight: "700", color: "#00695c", marginBottom: "0.75rem" },
  };

  // ─── Acknowledgement rows config ─────────────────────────────────

  const ackConfig = [
    { key: "business", label: "Involved in own business / self-employment while employed?" },
    { key: "dismissed", label: "Ever dismissed or asked to resign from any employer?" },
    { key: "criminal", label: "Any pending or past criminal proceedings?" },
    { key: "civil", label: "Any pending or past civil disputes related to employment?" },
  ];

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* Progress Bar */}
        <div style={styles.progress}>
          {[1, 2, 3, 4].map((s) => (
            <div key={s} style={styles.step(s <= 3)} />
          ))}
        </div>
        <p style={{ textAlign: "right", fontSize: "0.85rem", color: "#888", marginTop: "-1rem", marginBottom: "1.5rem" }}>
          Step 3 of 4
        </p>

        <h2 style={styles.h2}>Previous Employment History</h2>

        {/* ── Employment blocks ──────────────────────────────────── */}
        {employments.map((emp, idx) => (
          <div key={idx} style={styles.empBlock}>
            <div style={styles.empHeader}>
              <strong style={{ color: "#00695c" }}>Employer {idx + 1}</strong>
              {employments.length > 1 && (
                <button style={styles.removeBtn} onClick={() => removeEmployment(idx)}>
                  Remove
                </button>
              )}
            </div>

            {/* Company Info */}
            <div style={styles.section}>
              <p style={styles.subHeading}>Company Details</p>
              <div style={styles.row}>
                <div>
                  <label style={styles.label}>Company Name *</label>
                  <input style={styles.input} value={emp.companyName}
                    onChange={(e) => updateEmp(idx, "companyName", e.target.value)}
                    placeholder="e.g. Infosys Ltd" />
                </div>
                <div>
                  <label style={styles.label}>Employee ID *</label>
                  <input style={styles.input} value={emp.employeeId}
                    onChange={(e) => updateEmp(idx, "employeeId", e.target.value)}
                    placeholder="e.g. EMP-12345" />
                </div>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={styles.label}>Office Address *</label>
                <textarea style={styles.textarea} value={emp.officeAddress}
                  onChange={(e) => updateEmp(idx, "officeAddress", e.target.value)}
                  placeholder="Full office address" />
              </div>
              <div style={styles.row}>
                <div>
                  <label style={styles.label}>Work Email *</label>
                  <input style={styles.input} type="email" value={emp.workEmail}
                    onChange={(e) => updateEmp(idx, "workEmail", e.target.value)}
                    placeholder="you@company.com" />
                </div>
                <div>
                  <label style={styles.label}>Employment Type *</label>
                  <select style={styles.select} value={emp.employmentType}
                    onChange={(e) => updateEmp(idx, "employmentType", e.target.value)}>
                    <option value="">Select type</option>
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                    <option>Freelance</option>
                  </select>
                </div>
              </div>
              <div style={styles.row}>
                <div>
                  <label style={styles.label}>Designation *</label>
                  <input style={styles.input} value={emp.designation}
                    onChange={(e) => updateEmp(idx, "designation", e.target.value)}
                    placeholder="e.g. Software Engineer" />
                </div>
                <div>
                  <label style={styles.label}>Department *</label>
                  <input style={styles.input} value={emp.department}
                    onChange={(e) => updateEmp(idx, "department", e.target.value)}
                    placeholder="e.g. Engineering" />
                </div>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={styles.label}>Key Duties & Responsibilities *</label>
                <textarea style={styles.textarea} value={emp.duties}
                  onChange={(e) => updateEmp(idx, "duties", e.target.value)}
                  placeholder="Brief description of your role and responsibilities" />
              </div>
              <div>
                <label style={styles.label}>Reason for Relieving *</label>
                <select style={styles.select} value={emp.reasonForRelieving}
                  onChange={(e) => updateEmp(idx, "reasonForRelieving", e.target.value)}>
                  <option value="">Select reason</option>
                  <option>Better Opportunity</option>
                  <option>Higher Studies</option>
                  <option>Personal Reasons</option>
                  <option>Relocation</option>
                  <option>Layoff / Redundancy</option>
                  <option>Contract End</option>
                  <option>Company Closure</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            {/* Reference */}
            <div style={styles.section}>
              <p style={styles.subHeading}>Reference / Reporting Manager</p>
              <div style={styles.row}>
                <div>
                  <label style={styles.label}>Reference Name *</label>
                  <input style={styles.input} value={emp.reference.name}
                    onChange={(e) => updateNested(idx, "reference", "name", e.target.value)}
                    placeholder="Full name" />
                </div>
                <div>
                  <label style={styles.label}>Role / Designation</label>
                  <input style={styles.input} value={emp.reference.role}
                    onChange={(e) => updateNested(idx, "reference", "role", e.target.value)}
                    placeholder="e.g. Manager" />
                </div>
              </div>
              <div style={styles.row}>
                <div>
                  <label style={styles.label}>Reference Email *</label>
                  <input style={styles.input} type="email" value={emp.reference.email}
                    onChange={(e) => updateNested(idx, "reference", "email", e.target.value)}
                    placeholder="manager@company.com" />
                </div>
                <div>
                  <label style={styles.label}>Reference Mobile *</label>
                  <input style={styles.input} type="tel" value={emp.reference.mobile}
                    onChange={(e) => updateNested(idx, "reference", "mobile", e.target.value)}
                    placeholder="10-digit mobile" maxLength={10} />
                </div>
              </div>
            </div>

            {/* Contract / Vendor (only for contract employment) */}
            {emp.employmentType === "Contract" && (
              <div style={styles.section}>
                <p style={styles.subHeading}>Contract / Vendor Details</p>
                <div style={styles.row}>
                  <div>
                    <label style={styles.label}>Vendor Company Name</label>
                    <input style={styles.input} value={emp.contractVendor.company}
                      onChange={(e) => updateNested(idx, "contractVendor", "company", e.target.value)}
                      placeholder="Vendor company" />
                  </div>
                  <div>
                    <label style={styles.label}>Vendor Email</label>
                    <input style={styles.input} type="email" value={emp.contractVendor.email}
                      onChange={(e) => updateNested(idx, "contractVendor", "email", e.target.value)}
                      placeholder="vendor@company.com" />
                  </div>
                </div>
                <div style={{ maxWidth: "50%" }}>
                  <label style={styles.label}>Vendor Mobile</label>
                  <input style={styles.input} type="tel" value={emp.contractVendor.mobile}
                    onChange={(e) => updateNested(idx, "contractVendor", "mobile", e.target.value)}
                    placeholder="10-digit mobile" maxLength={10} />
                </div>
              </div>
            )}

            {/* Documents */}
            <div style={styles.section}>
              <p style={styles.subHeading}>Documents (S3 URLs — coming soon)</p>
              <div style={styles.row}>
                <div>
                  <label style={styles.label}>Offer Letter URL</label>
                  <input style={styles.input} value={emp.documents.offerLetter}
                    onChange={(e) => updateNested(idx, "documents", "offerLetter", e.target.value)}
                    placeholder="https://s3.amazonaws.com/..." />
                </div>
                <div>
                  <label style={styles.label}>Resignation Letter URL</label>
                  <input style={styles.input} value={emp.documents.resignation}
                    onChange={(e) => updateNested(idx, "documents", "resignation", e.target.value)}
                    placeholder="https://s3.amazonaws.com/..." />
                </div>
              </div>
              <div>
                <label style={styles.label}>Experience / Relieving Letter URL</label>
                <input style={styles.input} value={emp.documents.experience}
                  onChange={(e) => updateNested(idx, "documents", "experience", e.target.value)}
                  placeholder="https://s3.amazonaws.com/..." />
              </div>
            </div>

            {/* Employment Gap */}
            <div style={styles.section}>
              <p style={styles.subHeading}>Employment Gap</p>
              <div style={styles.row}>
                <div>
                  <label style={styles.label}>Was there a gap after this employment? *</label>
                  <select style={styles.select} value={emp.gap.hasGap}
                    onChange={(e) => updateNested(idx, "gap", "hasGap", e.target.value)}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                {emp.gap.hasGap === "Yes" && (
                  <div>
                    <label style={styles.label}>Reason for Gap</label>
                    <input style={styles.input} value={emp.gap.reason}
                      onChange={(e) => updateNested(idx, "gap", "reason", e.target.value)}
                      placeholder="Briefly explain the gap" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        <button style={styles.addBtn} onClick={addEmployment}>
          + Add Another Employer
        </button>

        {/* ── Acknowledgements ───────────────────────────────────── */}
        <h3 style={styles.h3}>Declarations & Acknowledgements</h3>

        {ackConfig.map(({ key, label }) => (
          <div key={key} style={styles.ackRow}>
            <span style={styles.ackLabel}>{label}</span>
            <select style={styles.select} value={acknowledgements[key].val}
              onChange={(e) => updateAck(key, "val", e.target.value)}>
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {acknowledgements[key].val === "Yes" && (
              <div>
                <label style={styles.label}>Please specify</label>
                <input style={styles.input} value={acknowledgements[key].note}
                  onChange={(e) => updateAck(key, "note", e.target.value)}
                  placeholder="Details..." />
              </div>
            )}
            {acknowledgements[key].val !== "Yes" && <div />}
          </div>
        ))}

        {/* ── Buttons ─────────────────────────────────────────────── */}
        <div style={styles.buttonRow}>
          <span style={styles.statusText}>{saveStatus}</span>
          <button style={styles.backBtn} onClick={() => router.push("/employee/education")}>
            ← Back
          </button>
          <button style={styles.saveBtn} disabled={loading}
            onClick={() => handleSave("draft")}>
            Save Draft
          </button>
          <button style={styles.nextBtn} disabled={loading}
            onClick={() => handleSave("proceed")}>
            Save & Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
