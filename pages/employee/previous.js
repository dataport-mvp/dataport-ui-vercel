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
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  </div>
);

/* ---------- PAGE ---------- */
export default function PreviousCompany() {
  const router = useRouter();
  const api = process.env.NEXT_PUBLIC_API_URL_PROD;

  const emptyEmployment = {
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
    documents: { payslips: [], offerLetter: null, resignation: null, experience: null },
    gap: { hasGap: "", reason: "" }
  };

  const [employments, setEmployments] = useState([structuredClone(emptyEmployment)]);

  const [ack, setAck] = useState({
    business: { val: "", note: "" },
    dismissed: { val: "", note: "" },
    criminal: { val: "", note: "" },
    civil: { val: "", note: "" }
  });

  const update = (i, path, value) => {
    const copy = structuredClone(employments);
    const keys = path.split(".");
    let obj = copy[i];
    for (let k = 0; k < keys.length - 1; k++) obj = obj[keys[k]];
    obj[keys[keys.length - 1]] = value;
    setEmployments(copy);
  };

  const addEmployer = () =>
    setEmployments([...employments, structuredClone(emptyEmployment)]);

  const removeEmployer = (i) =>
    setEmployments(employments.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    try {
      const payload = { employments, acknowledgements: ack };

      const res = await fetch(`${api}/employee/employment-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      await res.json();

      router.push("/employee/uan");
    } catch (err) {
      console.error("Error saving employment history:", err);
      alert("Failed to save employment history");
    }
  };

  return (
    <div style={styles.page}>
      <ProgressBar currentStep={3} totalSteps={4} />

      <div style={styles.card}>
        <h1 style={styles.title}>Employment History</h1>

        {employments.map((emp, index) => (
          <div key={index} style={styles.employerCard}>
            {/* ...all your employer fields, references, attachments, gap logic... */}
          </div>
        ))}

        <button style={styles.secondaryBtn} onClick={addEmployer}>+ Add Another Employer</button>

        {/* ACKNOWLEDGEMENTS */}
        <h2 style={{ marginTop: "2rem" }}>Other Declarations</h2>
        {/* ...acknowledgement questions... */}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
          <button style={styles.secondaryBtn} onClick={() => router.back()}>Previous</button>
          <button style={styles.primaryBtn} onClick={handleSubmit}>Save & Proceed</button>
        </div>
      </div>
    </div>
  );
}