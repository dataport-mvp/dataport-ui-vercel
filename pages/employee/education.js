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

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <ProgressBar currentStep={2} totalSteps={4} />
        <h1 style={styles.title}>Education Details</h1>

        {/* ===== CLASS X ===== */}
        <Section title="Class X">
          <Row>
            <Input label="School Name" value={xSchool} onChange={setXSchool} />
            <Input label="Board Name" value={xBoard} onChange={setXBoard} />
            <Input label="Hall Ticket / Roll Number" value={xHall} onChange={setXHall} />
          </Row>

          <Row>
            <Input type="date" label="From" value={xFrom} onChange={setXFrom} />
            <Input type="date" label="To" value={xTo} onChange={setXTo} />
          </Row>

          <Input label="School Address" value={xAddress} onChange={setXAddress} />

          <Row>
            <Input label="Year of Passing" value={xYear} onChange={setXYear} />
            <Select
              label="Result Type"
              value={xResultType}
              onChange={setXResultType}
              options={["Percentage", "Grade"]}
            />
            <Input label="Result Value" value={xResultValue} onChange={setXResultValue} />
          </Row>

          <Input label="Medium of Study" value={xMedium} onChange={setXMedium} />

          <File label="Upload Class X Certificate" />
        </Section>

        {/* ===== INTERMEDIATE ===== */}
        <Section title="Intermediate">
          <Row>
            <Input label="College Name" value={iCollege} onChange={setICollege} />
            <Input label="Board Name" value={iBoard} onChange={setIBoard} />
            <Input label="Hall Ticket / Roll Number" value={iHall} onChange={setIHall} />
          </Row>

          <Row>
            <Input type="date" label="From" value={iFrom} onChange={setIFrom} />
            <Input type="date" label="To" value={iTo} onChange={setITo} />
          </Row>

          <Input label="College Address" value={iAddress} onChange={setIAddress} />

          <Row>
            <Select
              label="Mode of Education"
              value={iMode}
              onChange={setIMode}
              options={["Full-time", "Part-time", "Distance"]}
            />
            <Input label="Year of Passing" value={iYear} onChange={setIYear} />
          </Row>

          <Row>
            <Select
              label="Result Type"
              value={iResultType}
              onChange={setIResultType}
              options={["Percentage", "Grade"]}
            />
            <Input label="Result Value" value={iResultValue} onChange={setIResultValue} />
          </Row>

          <Input label="Medium of Study" value={iMedium} onChange={setIMedium} />

          <File label="Upload Intermediate Certificate" />
        </Section>

        {/* ===== UG ===== */}
        <Section title="Undergraduate (UG)">
          <Row>
            <Input label="College Name" value={ugCollege} onChange={setUgCollege} />
            <Input label="University Name" value={ugUniversity} onChange={setUgUniversity} />
            <Input label="Course / Degree" value={ugCourse} onChange={setUgCourse} />
          </Row>

          <Row>
            <Input label="Hall Ticket / Roll Number" value={ugHall} onChange={setUgHall} />
            <Select
              label="Mode of Education"
              value={ugMode}
              onChange={setUgMode}
              options={["Full-time", "Part-time", "Distance"]}
            />
          </Row>

          <Row>
            <Input type="date" label="From" value={ugFrom} onChange={setUgFrom} />
            <Input type="date" label="To" value={ugTo} onChange={setUgTo} />
          </Row>

          <Input label="College Address" value={ugAddress} onChange={setUgAddress} />

          <Row>
            <Input label="Year of Passing" value={ugYear} onChange={setUgYear} />
            <Select
              label="Result Type"
              value={ugResultType}
              onChange={setUgResultType}
              options={["Percentage", "CGPA", "Grade"]}
            />
            <Input label="Result Value" value={ugResultValue} onChange={setUgResultValue} />
          </Row>

          <Input label="Medium of Study" value={ugMedium} onChange={setUgMedium} />

          <Select
            label="Any Active Backlogs?"
            value={ugBacklogs}
            onChange={setUgBacklogs}
            options={["No", "Yes"]}
          />

          <File label="Upload UG Degree / Provisional Certificate" />
        </Section>

        {/* ===== PG ===== */}
        <Section title="Postgraduate (PG)">
          <Row>
            <Input label="College Name" value={pgCollege} onChange={setPgCollege} />
            <Input label="University Name" value={pgUniversity} onChange={setPgUniversity} />
            <Input label="Course / Degree" value={pgCourse} onChange={setPgCourse} />
          </Row>

          <Row>
            <Input label="Hall Ticket / Roll Number" value={pgHall} onChange={setPgHall} />
            <Select
              label="Mode of Education"
              value={pgMode}
              onChange={setPgMode}
              options={["Full-time", "Part-time", "Distance"]}
            />
          </Row>

          <Row>
            <Input type="date" label="From" value={pgFrom} onChange={setPgFrom} />
            <Input type="date" label="To" value={pgTo} onChange={setPgTo} />
          </Row>

          <Input label="College Address" value={pgAddress} onChange={setPgAddress} />

          <Row>
            <Input label="Year of Passing" value={pgYear} onChange={setPgYear} />
            <Select
              label="Result Type"
              value={pgResultType}
              onChange={setPgResultType}
              options={["Percentage", "CGPA", "Grade"]}
            />
            <Input label="Result Value" value={pgResultValue} onChange={setPgResultValue} />
          </Row>

          <Input label="Medium of Study" value={pgMedium} onChange={setPgMedium} />

          <Select
            label="Any Active Backlogs?"
            value={pgBacklogs}
            onChange={setPgBacklogs}
            options={["No", "Yes"]}
          />

          <File label="Upload PG Degree / Provisional Certificate" />
        </Section>

        {/* NAVIGATION */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={() => router.push("/employee/personal")}
            style={styles.secondaryBtn}
          >
            ⬅ Previous
          </button>

          <button
            onClick={() => router.push("/employee/previous")}
            style={styles.primaryBtn}
          >
            Save & Proceed →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== HELPERS & STYLES (UNCHANGED, SAME AS personal.js) ===== */

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

