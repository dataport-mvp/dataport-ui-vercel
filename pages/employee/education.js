// pages/employee/education.js  — Page 2 of 4
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";
import { useAuth } from "../../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

export default function EducationDetails() {
  const router = useRouter();
  const { token } = useAuth();

  /* ================= CLASS X ================= */
  const [xSchool, setXSchool]           = useState("");
  const [xBoard, setXBoard]             = useState("");
  const [xHall, setXHall]               = useState("");
  const [xFrom, setXFrom]               = useState("");
  const [xTo, setXTo]                   = useState("");
  const [xAddress, setXAddress]         = useState("");
  const [xYear, setXYear]               = useState("");
  const [xResultType, setXResultType]   = useState("");
  const [xResultValue, setXResultValue] = useState("");
  const [xMedium, setXMedium]           = useState("");

  /* ================= INTERMEDIATE ================= */
  const [iCollege, setICollege]           = useState("");
  const [iBoard, setIBoard]               = useState("");
  const [iHall, setIHall]                 = useState("");
  const [iFrom, setIFrom]                 = useState("");
  const [iTo, setITo]                     = useState("");
  const [iAddress, setIAddress]           = useState("");
  const [iMode, setIMode]                 = useState("");
  const [iYear, setIYear]                 = useState("");
  const [iResultType, setIResultType]     = useState("");
  const [iResultValue, setIResultValue]   = useState("");
  const [iMedium, setIMedium]             = useState("");

  /* ================= UG ================= */
  const [ugCollege, setUgCollege]           = useState("");
  const [ugUniversity, setUgUniversity]     = useState("");
  const [ugCourse, setUgCourse]             = useState("");
  const [ugHall, setUgHall]                 = useState("");
  const [ugFrom, setUgFrom]                 = useState("");
  const [ugTo, setUgTo]                     = useState("");
  const [ugAddress, setUgAddress]           = useState("");
  const [ugMode, setUgMode]                 = useState("");
  const [ugYear, setUgYear]                 = useState("");
  const [ugResultType, setUgResultType]     = useState("");
  const [ugResultValue, setUgResultValue]   = useState("");
  const [ugBacklogs, setUgBacklogs]         = useState("");
  const [ugMedium, setUgMedium]             = useState("");

  /* ================= PG ================= */
  const [pgCollege, setPgCollege]           = useState("");
  const [pgUniversity, setPgUniversity]     = useState("");
  const [pgCourse, setPgCourse]             = useState("");
  const [pgHall, setPgHall]                 = useState("");
  const [pgFrom, setPgFrom]                 = useState("");
  const [pgTo, setPgTo]                     = useState("");
  const [pgAddress, setPgAddress]           = useState("");
  const [pgMode, setPgMode]                 = useState("");
  const [pgYear, setPgYear]                 = useState("");
  const [pgResultType, setPgResultType]     = useState("");
  const [pgResultValue, setPgResultValue]   = useState("");
  const [pgBacklogs, setPgBacklogs]         = useState("");
  const [pgMedium, setPgMedium]             = useState("");

  const [saveStatus, setSaveStatus] = useState("");

  /* ---------- Restore draft ---------- */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dg_education");
      if (!saved) return;
      const d = JSON.parse(saved);
      if (d.xSchool)       setXSchool(d.xSchool);
      if (d.xBoard)        setXBoard(d.xBoard);
      if (d.xHall)         setXHall(d.xHall);
      if (d.xFrom)         setXFrom(d.xFrom);
      if (d.xTo)           setXTo(d.xTo);
      if (d.xAddress)      setXAddress(d.xAddress);
      if (d.xYear)         setXYear(d.xYear);
      if (d.xResultType)   setXResultType(d.xResultType);
      if (d.xResultValue)  setXResultValue(d.xResultValue);
      if (d.xMedium)       setXMedium(d.xMedium);
      if (d.iCollege)      setICollege(d.iCollege);
      if (d.iBoard)        setIBoard(d.iBoard);
      if (d.iHall)         setIHall(d.iHall);
      if (d.iFrom)         setIFrom(d.iFrom);
      if (d.iTo)           setITo(d.iTo);
      if (d.iAddress)      setIAddress(d.iAddress);
      if (d.iMode)         setIMode(d.iMode);
      if (d.iYear)         setIYear(d.iYear);
      if (d.iResultType)   setIResultType(d.iResultType);
      if (d.iResultValue)  setIResultValue(d.iResultValue);
      if (d.iMedium)       setIMedium(d.iMedium);
      if (d.ugCollege)     setUgCollege(d.ugCollege);
      if (d.ugUniversity)  setUgUniversity(d.ugUniversity);
      if (d.ugCourse)      setUgCourse(d.ugCourse);
      if (d.ugHall)        setUgHall(d.ugHall);
      if (d.ugFrom)        setUgFrom(d.ugFrom);
      if (d.ugTo)          setUgTo(d.ugTo);
      if (d.ugAddress)     setUgAddress(d.ugAddress);
      if (d.ugMode)        setUgMode(d.ugMode);
      if (d.ugYear)        setUgYear(d.ugYear);
      if (d.ugResultType)  setUgResultType(d.ugResultType);
      if (d.ugResultValue) setUgResultValue(d.ugResultValue);
      if (d.ugBacklogs)    setUgBacklogs(d.ugBacklogs);
      if (d.ugMedium)      setUgMedium(d.ugMedium);
      if (d.pgCollege)     setPgCollege(d.pgCollege);
      if (d.pgUniversity)  setPgUniversity(d.pgUniversity);
      if (d.pgCourse)      setPgCourse(d.pgCourse);
      if (d.pgHall)        setPgHall(d.pgHall);
      if (d.pgFrom)        setPgFrom(d.pgFrom);
      if (d.pgTo)          setPgTo(d.pgTo);
      if (d.pgAddress)     setPgAddress(d.pgAddress);
      if (d.pgMode)        setPgMode(d.pgMode);
      if (d.pgYear)        setPgYear(d.pgYear);
      if (d.pgResultType)  setPgResultType(d.pgResultType);
      if (d.pgResultValue) setPgResultValue(d.pgResultValue);
      if (d.pgBacklogs)    setPgBacklogs(d.pgBacklogs);
      if (d.pgMedium)      setPgMedium(d.pgMedium);
    } catch (_) {}
  }, []);

  /* ---------- Build payload ---------- */
  const buildPayload = () => ({
    classX:         { school: xSchool, board: xBoard, hallTicket: xHall, from: xFrom, to: xTo, address: xAddress, yearOfPassing: xYear, resultType: xResultType, resultValue: xResultValue, medium: xMedium },
    intermediate:   { college: iCollege, board: iBoard, hallTicket: iHall, from: iFrom, to: iTo, address: iAddress, mode: iMode, yearOfPassing: iYear, resultType: iResultType, resultValue: iResultValue, medium: iMedium },
    undergraduate:  { college: ugCollege, university: ugUniversity, course: ugCourse, hallTicket: ugHall, from: ugFrom, to: ugTo, address: ugAddress, mode: ugMode, yearOfPassing: ugYear, resultType: ugResultType, resultValue: ugResultValue, backlogs: ugBacklogs, medium: ugMedium },
    postgraduate:   { college: pgCollege, university: pgUniversity, course: pgCourse, hallTicket: pgHall, from: pgFrom, to: pgTo, address: pgAddress, mode: pgMode, yearOfPassing: pgYear, resultType: pgResultType, resultValue: pgResultValue, backlogs: pgBacklogs, medium: pgMedium },
  });

  const saveDraft = async () => {
    const data = buildPayload();
    // Store flat copy for easy restoration
    const flat = {
      xSchool, xBoard, xHall, xFrom, xTo, xAddress, xYear, xResultType, xResultValue, xMedium,
      iCollege, iBoard, iHall, iFrom, iTo, iAddress, iMode, iYear, iResultType, iResultValue, iMedium,
      ugCollege, ugUniversity, ugCourse, ugHall, ugFrom, ugTo, ugAddress, ugMode, ugYear, ugResultType, ugResultValue, ugBacklogs, ugMedium,
      pgCollege, pgUniversity, pgCourse, pgHall, pgFrom, pgTo, pgAddress, pgMode, pgYear, pgResultType, pgResultValue, pgBacklogs, pgMedium,
    };
    localStorage.setItem("dg_education", JSON.stringify(flat));

    // Background API save (merged with personal)
    try {
      const personal = JSON.parse(localStorage.getItem("dg_personal") || "{}");
      const empId    = JSON.parse(localStorage.getItem("dg_employee_id") || "null") || `emp-${Date.now()}`;
      localStorage.setItem("dg_employee_id", JSON.stringify(empId));

      await fetch(`${API}/employee`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...personal, education: data, employee_id: empId, status: "draft" }),
      });
    } catch (_) {}
  };

  const handleSave = async () => {
    setSaveStatus("Saving...");
    await saveDraft();
    setSaveStatus("Saved ✓");
    router.push("/employee/previous");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <ProgressBar currentStep={2} totalSteps={4} />
        <h1 style={styles.title}>Education Details</h1>

        {/* ===== CLASS X ===== */}
        <Section title="Class X">
          <Row>
            <Input label="School Name"               value={xSchool}      onChange={setXSchool} />
            <Input label="Board Name"                value={xBoard}       onChange={setXBoard} />
            <Input label="Hall Ticket / Roll Number" value={xHall}        onChange={setXHall} />
          </Row>
          <Row>
            <Input type="date" label="From" value={xFrom} onChange={setXFrom} />
            <Input type="date" label="To"   value={xTo}   onChange={setXTo} />
          </Row>
          <Input label="School Address" value={xAddress} onChange={setXAddress} />
          <Row>
            <Input label="Year of Passing" value={xYear} onChange={setXYear} />
            <Select label="Result Type" value={xResultType} onChange={setXResultType} options={["Percentage","Grade"]} />
            <Input label="Result Value"    value={xResultValue} onChange={setXResultValue} />
          </Row>
          <Input label="Medium of Study" value={xMedium} onChange={setXMedium} />
          <FileField label="Upload Class X Certificate (coming soon)" />
        </Section>

        {/* ===== INTERMEDIATE ===== */}
        <Section title="Intermediate">
          <Row>
            <Input label="College Name"              value={iCollege} onChange={setICollege} />
            <Input label="Board Name"                value={iBoard}   onChange={setIBoard} />
            <Input label="Hall Ticket / Roll Number" value={iHall}    onChange={setIHall} />
          </Row>
          <Row>
            <Input type="date" label="From" value={iFrom} onChange={setIFrom} />
            <Input type="date" label="To"   value={iTo}   onChange={setITo} />
          </Row>
          <Input label="College Address" value={iAddress} onChange={setIAddress} />
          <Row>
            <Select label="Mode of Education" value={iMode} onChange={setIMode} options={["Full-time","Part-time","Distance"]} />
            <Input  label="Year of Passing"   value={iYear} onChange={setIYear} />
          </Row>
          <Row>
            <Select label="Result Type"  value={iResultType}  onChange={setIResultType}  options={["Percentage","Grade"]} />
            <Input  label="Result Value" value={iResultValue} onChange={setIResultValue} />
          </Row>
          <Input label="Medium of Study" value={iMedium} onChange={setIMedium} />
          <FileField label="Upload Intermediate Certificate (coming soon)" />
        </Section>

        {/* ===== UG ===== */}
        <Section title="Undergraduate (UG)">
          <Row>
            <Input label="College Name"    value={ugCollege}     onChange={setUgCollege} />
            <Input label="University Name" value={ugUniversity}  onChange={setUgUniversity} />
            <Input label="Course / Degree" value={ugCourse}      onChange={setUgCourse} />
          </Row>
          <Row>
            <Input label="Hall Ticket / Roll Number" value={ugHall} onChange={setUgHall} />
            <Select label="Mode of Education" value={ugMode} onChange={setUgMode} options={["Full-time","Part-time","Distance"]} />
          </Row>
          <Row>
            <Input type="date" label="From" value={ugFrom} onChange={setUgFrom} />
            <Input type="date" label="To"   value={ugTo}   onChange={setUgTo} />
          </Row>
          <Input label="College Address" value={ugAddress} onChange={setUgAddress} />
          <Row>
            <Input  label="Year of Passing" value={ugYear}        onChange={setUgYear} />
            <Select label="Result Type"     value={ugResultType}  onChange={setUgResultType}  options={["Percentage","CGPA","Grade"]} />
            <Input  label="Result Value"    value={ugResultValue} onChange={setUgResultValue} />
          </Row>
          <Input label="Medium of Study" value={ugMedium} onChange={setUgMedium} />
          <Select label="Any Active Backlogs?" value={ugBacklogs} onChange={setUgBacklogs} options={["No","Yes"]} />
          <FileField label="Upload UG Degree / Provisional Certificate (coming soon)" />
        </Section>

        {/* ===== PG ===== */}
        <Section title="Postgraduate (PG)">
          <Row>
            <Input label="College Name"    value={pgCollege}    onChange={setPgCollege} />
            <Input label="University Name" value={pgUniversity} onChange={setPgUniversity} />
            <Input label="Course / Degree" value={pgCourse}     onChange={setPgCourse} />
          </Row>
          <Row>
            <Input label="Hall Ticket / Roll Number" value={pgHall} onChange={setPgHall} />
            <Select label="Mode of Education" value={pgMode} onChange={setPgMode} options={["Full-time","Part-time","Distance"]} />
          </Row>
          <Row>
            <Input type="date" label="From" value={pgFrom} onChange={setPgFrom} />
            <Input type="date" label="To"   value={pgTo}   onChange={setPgTo} />
          </Row>
          <Input label="College Address" value={pgAddress} onChange={setPgAddress} />
          <Row>
            <Input  label="Year of Passing" value={pgYear}        onChange={setPgYear} />
            <Select label="Result Type"     value={pgResultType}  onChange={setPgResultType}  options={["Percentage","CGPA","Grade"]} />
            <Input  label="Result Value"    value={pgResultValue} onChange={setPgResultValue} />
          </Row>
          <Input label="Medium of Study" value={pgMedium} onChange={setPgMedium} />
          <Select label="Any Active Backlogs?" value={pgBacklogs} onChange={setPgBacklogs} options={["No","Yes"]} />
          <FileField label="Upload PG Degree / Provisional Certificate (coming soon)" />
        </Section>

        {/* NAVIGATION */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => router.push("/employee/personal")} style={styles.secondaryBtn}>
            ⬅ Previous
          </button>
          <span style={{ color: "#64748b", fontSize: "0.85rem" }}>{saveStatus}</span>
          <button onClick={handleSave} style={styles.primaryBtn}>
            Save & Proceed →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== HELPERS (same as original) ===== */
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
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={styles.input} />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div style={{ flex: 1 }}>
    <label style={styles.label}>{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} style={styles.input}>
      <option value="">Select</option>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  </div>
);

const FileField = ({ label }) => (
  <div style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>
    <label style={styles.label}>{label}</label>
    <input type="file" accept=".pdf,.jpg,.jpeg,.png" disabled style={{ opacity: 0.5 }} />
  </div>
);

const styles = {
  page:         { background: "#f1f5f9", padding: "2rem", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" },
  card:         { maxWidth: "980px", margin: "auto", background: "#fff", padding: "2rem", borderRadius: "14px", boxShadow: "0 12px 30px rgba(0,0,0,0.08)" },
  title:        { marginBottom: "2rem" },
  sectionTitle: { marginBottom: "1rem", color: "#0f172a" },
  label:        { fontSize: "0.85rem", color: "#475569" },
  input:        { width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1" },
  primaryBtn:   { padding: "0.9rem 2.5rem", borderRadius: "10px", border: "none", background: "#2563eb", color: "#fff", cursor: "pointer" },
  secondaryBtn: { padding: "0.9rem 2.5rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer" },
};
