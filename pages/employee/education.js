// pages/employee/education.js - Page 2/4
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";
import ProgressBar from "../../components/ProgressBar";

export default function EducationDetails() {
  const router = useRouter();
  const { apiCall, isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/employee/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const [saving, setSaving] = useState(false);

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

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem('datagate_education');
    if (saved) {
      const data = JSON.parse(saved);
      setXSchool(data.xSchool || ""); setXBoard(data.xBoard || ""); setXHall(data.xHall || "");
      setXFrom(data.xFrom || ""); setXTo(data.xTo || ""); setXAddress(data.xAddress || "");
      setXYear(data.xYear || ""); setXResultType(data.xResultType || ""); setXResultValue(data.xResultValue || "");
      setXMedium(data.xMedium || "");
      
      setICollege(data.iCollege || ""); setIBoard(data.iBoard || ""); setIHall(data.iHall || "");
      setIFrom(data.iFrom || ""); setITo(data.iTo || ""); setIAddress(data.iAddress || "");
      setIMode(data.iMode || ""); setIYear(data.iYear || ""); setIResultType(data.iResultType || "");
      setIResultValue(data.iResultValue || ""); setIMedium(data.iMedium || "");
      
      setUgCollege(data.ugCollege || ""); setUgUniversity(data.ugUniversity || ""); setUgCourse(data.ugCourse || "");
      setUgHall(data.ugHall || ""); setUgFrom(data.ugFrom || ""); setUgTo(data.ugTo || "");
      setUgAddress(data.ugAddress || ""); setUgMode(data.ugMode || ""); setUgYear(data.ugYear || "");
      setUgResultType(data.ugResultType || ""); setUgResultValue(data.ugResultValue || "");
      setUgBacklogs(data.ugBacklogs || ""); setUgMedium(data.ugMedium || "");
      
      setPgCollege(data.pgCollege || ""); setPgUniversity(data.pgUniversity || ""); setPgCourse(data.pgCourse || "");
      setPgHall(data.pgHall || ""); setPgFrom(data.pgFrom || ""); setPgTo(data.pgTo || "");
      setPgAddress(data.pgAddress || ""); setPgMode(data.pgMode || ""); setPgYear(data.pgYear || "");
      setPgResultType(data.pgResultType || ""); setPgResultValue(data.pgResultValue || "");
      setPgBacklogs(data.pgBacklogs || ""); setPgMedium(data.pgMedium || "");
    }
  }, []);

  const handleSubmit = async () => {
    setSaving(true);
    
    const educationData = {
      classX: { xSchool, xBoard, xHall, xFrom, xTo, xAddress, xYear, xResultType, xResultValue, xMedium },
      intermediate: { iCollege, iBoard, iHall, iFrom, iTo, iAddress, iMode, iYear, iResultType, iResultValue, iMedium },
      ug: { ugCollege, ugUniversity, ugCourse, ugHall, ugFrom, ugTo, ugAddress, ugMode, ugYear, ugResultType, ugResultValue, ugBacklogs, ugMedium },
      pg: { pgCollege, pgUniversity, pgCourse, pgHall, pgFrom, pgTo, pgAddress, pgMode, pgYear, pgResultType, pgResultValue, pgBacklogs, pgMedium }
    };

    localStorage.setItem('datagate_education', JSON.stringify(educationData));
    
    try {
      const employeeId = localStorage.getItem('datagate_employee_id');
      await apiCall('/employee', 'POST', {
        employee_id: employeeId,
        status: "draft",
        firstName: "temp",
        lastName: "temp",
        mobile: "0000000000",
        education: educationData
      });
    } catch (err) {
      console.error("Save failed:", err);
    }
    
    setSaving(false);
    router.push("/employee/previous");
  };

  if (authLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  if (!isAuthenticated) return null;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <ProgressBar currentStep={2} totalSteps={4} />
        <h1 style={styles.title}>Education Details</h1>

        {/* ===== CLASS X ===== */}
        <Section title="Class X">
          <Row>
            <Input label="School Name" value={xSchool} onChange={setXSchool} />
            <Input label="Board" value={xBoard} onChange={setXBoard} />
            <Input label="Hall Ticket No" value={xHall} onChange={setXHall} />
          </Row>
          <Row>
            <Input type="date" label="From" value={xFrom} onChange={setXFrom} />
            <Input type="date" label="To" value={xTo} onChange={setXTo} />
            <Input label="Year of Passing" value={xYear} onChange={setXYear} />
          </Row>
          <Input label="School Address" value={xAddress} onChange={setXAddress} />
          <Row>
            <Select label="Result Type" value={xResultType} onChange={setXResultType} options={["GPA", "Percentage", "CGPA"]} />
            <Input label="Result Value" value={xResultValue} onChange={setXResultValue} />
            <Select label="Medium" value={xMedium} onChange={setXMedium} options={["English", "Telugu", "Hindi", "Other"]} />
          </Row>
          <File label="Upload Marksheet" />
        </Section>

        {/* ===== INTERMEDIATE ===== */}
        <Section title="Intermediate / Class XII">
          <Row>
            <Input label="College Name" value={iCollege} onChange={setICollege} />
            <Input label="Board/University" value={iBoard} onChange={setIBoard} />
            <Input label="Hall Ticket No" value={iHall} onChange={setIHall} />
          </Row>
          <Row>
            <Input type="date" label="From" value={iFrom} onChange={setIFrom} />
            <Input type="date" label="To" value={iTo} onChange={setITo} />
            <Select label="Mode" value={iMode} onChange={setIMode} options={["Regular", "Distance", "Correspondence"]} />
          </Row>
          <Input label="College Address" value={iAddress} onChange={setIAddress} />
          <Row>
            <Input label="Year of Passing" value={iYear} onChange={setIYear} />
            <Select label="Result Type" value={iResultType} onChange={setIResultType} options={["GPA", "Percentage", "CGPA"]} />
            <Input label="Result Value" value={iResultValue} onChange={setIResultValue} />
          </Row>
          <Row>
            <Select label="Medium" value={iMedium} onChange={setIMedium} options={["English", "Telugu", "Hindi", "Other"]} />
          </Row>
          <File label="Upload Marksheet" />
        </Section>

        {/* ===== UG ===== */}
        <Section title="Undergraduate (UG)">
          <Row>
            <Input label="College Name" value={ugCollege} onChange={setUgCollege} />
            <Input label="University" value={ugUniversity} onChange={setUgUniversity} />
            <Input label="Course" value={ugCourse} onChange={setUgCourse} placeholder="B.Tech, B.Com, etc" />
          </Row>
          <Row>
            <Input label="Hall Ticket No" value={ugHall} onChange={setUgHall} />
            <Input type="date" label="From" value={ugFrom} onChange={setUgFrom} />
            <Input type="date" label="To" value={ugTo} onChange={setUgTo} />
          </Row>
          <Input label="College Address" value={ugAddress} onChange={setUgAddress} />
          <Row>
            <Select label="Mode" value={ugMode} onChange={setUgMode} options={["Regular", "Distance", "Correspondence"]} />
            <Input label="Year of Passing" value={ugYear} onChange={setUgYear} />
            <Select label="Result Type" value={ugResultType} onChange={setUgResultType} options={["GPA", "Percentage", "CGPA"]} />
          </Row>
          <Row>
            <Input label="Result Value" value={ugResultValue} onChange={setUgResultValue} />
            <Input label="Backlogs" value={ugBacklogs} onChange={setUgBacklogs} placeholder="0" />
            <Select label="Medium" value={ugMedium} onChange={setUgMedium} options={["English", "Telugu", "Hindi", "Other"]} />
          </Row>
          <File label="Upload Degree/Provisional Certificate" />
        </Section>

        {/* ===== PG ===== */}
        <Section title="Postgraduate (PG) - Optional">
          <Row>
            <Input label="College Name" value={pgCollege} onChange={setPgCollege} />
            <Input label="University" value={pgUniversity} onChange={setPgUniversity} />
            <Input label="Course" value={pgCourse} onChange={setPgCourse} placeholder="M.Tech, MBA, etc" />
          </Row>
          <Row>
            <Input label="Hall Ticket No" value={pgHall} onChange={setPgHall} />
            <Input type="date" label="From" value={pgFrom} onChange={setPgFrom} />
            <Input type="date" label="To" value={pgTo} onChange={setPgTo} />
          </Row>
          <Input label="College Address" value={pgAddress} onChange={setPgAddress} />
          <Row>
            <Select label="Mode" value={pgMode} onChange={setPgMode} options={["Regular", "Distance", "Correspondence"]} />
            <Input label="Year of Passing" value={pgYear} onChange={setPgYear} />
            <Select label="Result Type" value={pgResultType} onChange={setPgResultType} options={["GPA", "Percentage", "CGPA"]} />
          </Row>
          <Row>
            <Input label="Result Value" value={pgResultValue} onChange={setPgResultValue} />
            <Input label="Backlogs" value={pgBacklogs} onChange={setPgBacklogs} placeholder="0" />
            <Select label="Medium" value={pgMedium} onChange={setPgMedium} options={["English", "Telugu", "Hindi", "Other"]} />
          </Row>
          <File label="Upload Degree/Provisional Certificate" />
        </Section>

        {/* NAVIGATION */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={() => router.push("/employee/personal")} style={styles.secondaryBtn}>
            ⬅ Previous
          </button>
          <button onClick={handleSubmit} style={{...styles.primaryBtn, opacity: saving ? 0.6 : 1}} disabled={saving}>
            {saving ? "Saving..." : "Save & Proceed →"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== HELPERS ===== */
const Section = ({ title, children }) => (
  <div style={{ marginBottom: "2rem" }}>
    <h2 style={styles.sectionTitle}>{title}</h2>
    {children}
  </div>
);

const Row = ({ children }) => (
  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>{children}</div>
);

const Input = ({ label, value, onChange, type = "text", placeholder = "" }) => (
  <div style={{ flex: 1, minWidth: "200px" }}>
    <label style={styles.label}>{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={styles.input} placeholder={placeholder} />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div style={{ flex: 1, minWidth: "200px" }}>
    <label style={styles.label}>{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} style={styles.input}>
      <option value="">Select</option>
      {options.map((o) => (<option key={o} value={o}>{o}</option>))}
    </select>
  </div>
);

const File = ({ label }) => (
  <div style={{ marginTop: "0.5rem" }}>
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
    cursor: "pointer",
    flex: 1
  },
  secondaryBtn: {
    padding: "0.9rem 2.5rem",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    cursor: "pointer",
    flex: 1
  }
};
