import { useState } from "react";
import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";

export default function EducationDetails() {
  const router = useRouter();
  const api = process.env.NEXT_PUBLIC_API_URL_PROD;

  /* ================= CLASS X ================= */
  const [xSchool, setXSchool] = useState("");
  const [xBoard, setXBoard] = useState("");
  const [xHall, setXHall] = useState("");
  const [xFrom, setXFrom] = useState("");
  const [xTo, setXTo] = useState("");
  const [xAddress, setXAddress] = useState("");
  const [xYear, setXYear] = useState("");
  const [xResultType, setXResultType] = useState("");
  const [xResultValue, setXResultValue] = useState("");
  const [xMedium, setXMedium] = useState("");

  /* ================= INTERMEDIATE ================= */
  const [iCollege, setICollege] = useState("");
  const [iBoard, setIBoard] = useState("");
  const [iHall, setIHall] = useState("");
  const [iFrom, setIFrom] = useState("");
  const [iTo, setITo] = useState("");
  const [iAddress, setIAddress] = useState("");
  const [iMode, setIMode] = useState("");
  const [iYear, setIYear] = useState("");
  const [iResultType, setIResultType] = useState("");
  const [iResultValue, setIResultValue] = useState("");
  const [iMedium, setIMedium] = useState("");

  /* ================= UG ================= */
  const [ugCollege, setUgCollege] = useState("");
  const [ugUniversity, setUgUniversity] = useState("");
  const [ugCourse, setUgCourse] = useState("");
  const [ugHall, setUgHall] = useState("");
  const [ugFrom, setUgFrom] = useState("");
  const [ugTo, setUgTo] = useState("");
  const [ugAddress, setUgAddress] = useState("");
  const [ugMode, setUgMode] = useState("");
  const [ugYear, setUgYear] = useState("");
  const [ugResultType, setUgResultType] = useState("");
  const [ugResultValue, setUgResultValue] = useState("");
  const [ugBacklogs, setUgBacklogs] = useState("");
  const [ugMedium, setUgMedium] = useState("");

  /* ================= PG ================= */
  const [pgCollege, setPgCollege] = useState("");
  const [pgUniversity, setPgUniversity] = useState("");
  const [pgCourse, setPgCourse] = useState("");
  const [pgHall, setPgHall] = useState("");
  const [pgFrom, setPgFrom] = useState("");
  const [pgTo, setPgTo] = useState("");
  const [pgAddress, setPgAddress] = useState("");
  const [pgMode, setPgMode] = useState("");
  const [pgYear, setPgYear] = useState("");
  const [pgResultType, setPgResultType] = useState("");
  const [pgResultValue, setPgResultValue] = useState("");
  const [pgBacklogs, setPgBacklogs] = useState("");
  const [pgMedium, setPgMedium] = useState("");

  const handleSubmit = async () => {
    try {
      const payload = {
        classX: { xSchool, xBoard, xHall, xFrom, xTo, xAddress, xYear, xResultType, xResultValue, xMedium },
        intermediate: { iCollege, iBoard, iHall, iFrom, iTo, iAddress, iMode, iYear, iResultType, iResultValue, iMedium },
        ug: { ugCollege, ugUniversity, ugCourse, ugHall, ugFrom, ugTo, ugAddress, ugMode, ugYear, ugResultType, ugResultValue, ugBacklogs, ugMedium },
        pg: { pgCollege, pgUniversity, pgCourse, pgHall, pgFrom, pgTo, pgAddress, pgMode, pgYear, pgResultType, pgResultValue, pgBacklogs, pgMedium }
      };

      const res = await fetch(`${api}/employee/education`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      await res.json();

      router.push("/employee/previous");
    } catch (err) {
      console.error("Error saving education details:", err);
      alert("Failed to save education details");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <ProgressBar currentStep={2} totalSteps={4} />
        <h1 style={styles.title}>Education Details</h1>

        {/* ===== CLASS X ===== */}
        <Section title="Class X">{/* ...inputs same as your code... */}</Section>

        {/* ===== INTERMEDIATE ===== */}
        <Section title="Intermediate">{/* ...inputs same as your code... */}</Section>

        {/* ===== UG ===== */}
        <Section title="Undergraduate (UG)">{/* ...inputs same as your code... */}</Section>

        {/* ===== PG ===== */}
        <Section title="Postgraduate (PG)">{/* ...inputs same as your code... */}</Section>

        {/* NAVIGATION */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={() => router.push("/employee/personal")}
            style={styles.secondaryBtn}
          >
            ⬅ Previous
          </button>

          <button
            onClick={handleSubmit}
            style={styles.primaryBtn}
          >
            Save & Proceed →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== HELPERS & STYLES ===== */
const Section = ({ title, children }) => (
  <div style={{ marginBottom: "2rem" }}>
    <h2 style={styles.sectionTitle}>{title}</h2>
    {children}
  </div>
);

const Row = ({ children }) => (
  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>{children}</div>
);

const Input = ({ label, value, onChange, type = "text" }) => (
  <div style={{ flex: 1, minWidth: "200px" }}>
    <label style={styles.label}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={styles.input}
    />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div style={{ flex: 1 }}>
    <label style={styles.label}>{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} style={styles.input}>
      <option value="">Select</option>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  </div>
);

const File = ({ label }) => (
  <div>
    <label style={styles.label}>{label}</label>
    <input type="file" accept=".pdf,.jpg,.jpeg,.png" />
  </div>
);

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