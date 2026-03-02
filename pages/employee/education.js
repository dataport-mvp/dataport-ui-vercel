// pages/employee/education.js  — Page 2 of 4
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";
import { useAuth } from "../../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

export default function EducationDetails() {
  const router = useRouter();
  const { token, logout } = useAuth();

  /* ================= CLASS X ================= */
  const [xSchool,      setXSchool]      = useState("");
  const [xBoard,       setXBoard]       = useState("");
  const [xHall,        setXHall]        = useState("");
  const [xFrom,        setXFrom]        = useState("");
  const [xTo,          setXTo]          = useState("");
  const [xAddress,     setXAddress]     = useState("");
  const [xYear,        setXYear]        = useState("");
  const [xResultType,  setXResultType]  = useState("");
  const [xResultValue, setXResultValue] = useState("");
  const [xMedium,      setXMedium]      = useState("");

  /* ================= INTERMEDIATE ================= */
  const [iCollege,     setICollege]     = useState("");
  const [iBoard,       setIBoard]       = useState("");
  const [iHall,        setIHall]        = useState("");
  const [iFrom,        setIFrom]        = useState("");
  const [iTo,          setITo]          = useState("");
  const [iAddress,     setIAddress]     = useState("");
  const [iMode,        setIMode]        = useState("");
  const [iYear,        setIYear]        = useState("");
  const [iResultType,  setIResultType]  = useState("");
  const [iResultValue, setIResultValue] = useState("");
  const [iMedium,      setIMedium]      = useState("");

  /* ================= UG ================= */
  const [ugCollege,     setUgCollege]     = useState("");
  const [ugUniversity,  setUgUniversity]  = useState("");
  const [ugCourse,      setUgCourse]      = useState("");
  const [ugHall,        setUgHall]        = useState("");
  const [ugFrom,        setUgFrom]        = useState("");
  const [ugTo,          setUgTo]          = useState("");
  const [ugAddress,     setUgAddress]     = useState("");
  const [ugMode,        setUgMode]        = useState("");
  const [ugYear,        setUgYear]        = useState("");
  const [ugResultType,  setUgResultType]  = useState("");
  const [ugResultValue, setUgResultValue] = useState("");
  const [ugBacklogs,    setUgBacklogs]    = useState("");
  const [ugMedium,      setUgMedium]      = useState("");

  /* ================= PG ================= */
  const [pgCollege,     setPgCollege]     = useState("");
  const [pgUniversity,  setPgUniversity]  = useState("");
  const [pgCourse,      setPgCourse]      = useState("");
  const [pgHall,        setPgHall]        = useState("");
  const [pgFrom,        setPgFrom]        = useState("");
  const [pgTo,          setPgTo]          = useState("");
  const [pgAddress,     setPgAddress]     = useState("");
  const [pgMode,        setPgMode]        = useState("");
  const [pgYear,        setPgYear]        = useState("");
  const [pgResultType,  setPgResultType]  = useState("");
  const [pgResultValue, setPgResultValue] = useState("");
  const [pgBacklogs,    setPgBacklogs]    = useState("");
  const [pgMedium,      setPgMedium]      = useState("");

  const [saveStatus,         setSaveStatus]         = useState("");
  const [showSignoutConfirm, setShowSignoutConfirm] = useState(false);
  const [errors,             setErrors]             = useState({});

  /* ---------- Restore draft ---------- */
  useEffect(() => {
    // KEY FIX: use (val ?? "") so empty strings "" restore correctly.
    // The old code used "if (val)" which treated "" as falsy — fields stayed blank.
    // This matches exactly how pages 1 & 3 work (their Input uses value={v || ""})
    const applyFlat = (f) => {
      setXSchool(f.xSchool       ?? ""); setXBoard(f.xBoard         ?? "");
      setXHall(f.xHall           ?? ""); setXFrom(f.xFrom           ?? "");
      setXTo(f.xTo               ?? ""); setXAddress(f.xAddress     ?? "");
      setXYear(f.xYear           ?? ""); setXResultType(f.xResultType ?? "");
      setXResultValue(f.xResultValue ?? ""); setXMedium(f.xMedium   ?? "");
      setICollege(f.iCollege     ?? ""); setIBoard(f.iBoard         ?? "");
      setIHall(f.iHall           ?? ""); setIFrom(f.iFrom           ?? "");
      setITo(f.iTo               ?? ""); setIAddress(f.iAddress     ?? "");
      setIMode(f.iMode           ?? ""); setIYear(f.iYear           ?? "");
      setIResultType(f.iResultType ?? ""); setIResultValue(f.iResultValue ?? "");
      setIMedium(f.iMedium       ?? "");
      setUgCollege(f.ugCollege   ?? ""); setUgUniversity(f.ugUniversity ?? "");
      setUgCourse(f.ugCourse     ?? ""); setUgHall(f.ugHall         ?? "");
      setUgFrom(f.ugFrom         ?? ""); setUgTo(f.ugTo             ?? "");
      setUgAddress(f.ugAddress   ?? ""); setUgMode(f.ugMode         ?? "");
      setUgYear(f.ugYear         ?? ""); setUgResultType(f.ugResultType ?? "");
      setUgResultValue(f.ugResultValue ?? ""); setUgBacklogs(f.ugBacklogs ?? "");
      setUgMedium(f.ugMedium     ?? "");
      setPgCollege(f.pgCollege   ?? ""); setPgUniversity(f.pgUniversity ?? "");
      setPgCourse(f.pgCourse     ?? ""); setPgHall(f.pgHall         ?? "");
      setPgFrom(f.pgFrom         ?? ""); setPgTo(f.pgTo             ?? "");
      setPgAddress(f.pgAddress   ?? ""); setPgMode(f.pgMode         ?? "");
      setPgYear(f.pgYear         ?? ""); setPgResultType(f.pgResultType ?? "");
      setPgResultValue(f.pgResultValue ?? ""); setPgBacklogs(f.pgBacklogs ?? "");
      setPgMedium(f.pgMedium     ?? "");
    };

    // Convert nested API format → flat state keys
    const applyNested = (edu) => {
      if (!edu) return;
      const x  = edu.classX        || {};
      const i  = edu.intermediate  || {};
      const ug = edu.undergraduate || {};
      const pg = edu.postgraduate  || {};
      applyFlat({
        xSchool: x.school,            xBoard: x.board,              xHall: x.hallTicket,
        xFrom: x.from,                xTo: x.to,                    xAddress: x.address,
        xYear: x.yearOfPassing,       xResultType: x.resultType,    xResultValue: x.resultValue,
        xMedium: x.medium,
        iCollege: i.college,          iBoard: i.board,              iHall: i.hallTicket,
        iFrom: i.from,                iTo: i.to,                    iAddress: i.address,
        iMode: i.mode,                iYear: i.yearOfPassing,       iResultType: i.resultType,
        iResultValue: i.resultValue,  iMedium: i.medium,
        ugCollege: ug.college,        ugUniversity: ug.university,  ugCourse: ug.course,
        ugHall: ug.hallTicket,        ugFrom: ug.from,              ugTo: ug.to,
        ugAddress: ug.address,        ugMode: ug.mode,              ugYear: ug.yearOfPassing,
        ugResultType: ug.resultType,  ugResultValue: ug.resultValue, ugBacklogs: ug.backlogs,
        ugMedium: ug.medium,
        pgCollege: pg.college,        pgUniversity: pg.university,  pgCourse: pg.course,
        pgHall: pg.hallTicket,        pgFrom: pg.from,              pgTo: pg.to,
        pgAddress: pg.address,        pgMode: pg.mode,              pgYear: pg.yearOfPassing,
        pgResultType: pg.resultType,  pgResultValue: pg.resultValue, pgBacklogs: pg.backlogs,
        pgMedium: pg.medium,
      });
    };

    // 1. localStorage first (fast — works mid-session)
    try {
      const saved = localStorage.getItem("dg_education");
      if (saved) { applyFlat(JSON.parse(saved)); return; }
    } catch (_) {}

    // 2. API fallback (re-login — localStorage cleared by logout)
    if (!token) return;
    fetch(`${API}/employee/draft`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        if (d.employee_id) localStorage.setItem("dg_employee_id", JSON.stringify(d.employee_id));
        // Always call applyNested — even when all fields are "" it still restores correctly
        applyNested(d.education);
      })
      .catch(() => {});
  }, [token]);

  /* ---------- Validation ---------- */
  const validate = () => {
    const e = {};
    if (!xSchool.trim())  e.xSchool  = "Required";
    if (!xBoard.trim())   e.xBoard   = "Required";
    if (!xYear.trim())    e.xYear    = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ---------- Build payload ---------- */
  const buildPayload = () => ({
    classX:        { school: xSchool, board: xBoard, hallTicket: xHall, from: xFrom, to: xTo, address: xAddress, yearOfPassing: xYear, resultType: xResultType, resultValue: xResultValue, medium: xMedium },
    intermediate:  { college: iCollege, board: iBoard, hallTicket: iHall, from: iFrom, to: iTo, address: iAddress, mode: iMode, yearOfPassing: iYear, resultType: iResultType, resultValue: iResultValue, medium: iMedium },
    undergraduate: { college: ugCollege, university: ugUniversity, course: ugCourse, hallTicket: ugHall, from: ugFrom, to: ugTo, address: ugAddress, mode: ugMode, yearOfPassing: ugYear, resultType: ugResultType, resultValue: ugResultValue, backlogs: ugBacklogs, medium: ugMedium },
    postgraduate:  { college: pgCollege, university: pgUniversity, course: pgCourse, hallTicket: pgHall, from: pgFrom, to: pgTo, address: pgAddress, mode: pgMode, yearOfPassing: pgYear, resultType: pgResultType, resultValue: pgResultValue, backlogs: pgBacklogs, medium: pgMedium },
  });

  const saveDraft = async () => {
    const data = buildPayload();
    const flat = {
      xSchool, xBoard, xHall, xFrom, xTo, xAddress, xYear, xResultType, xResultValue, xMedium,
      iCollege, iBoard, iHall, iFrom, iTo, iAddress, iMode, iYear, iResultType, iResultValue, iMedium,
      ugCollege, ugUniversity, ugCourse, ugHall, ugFrom, ugTo, ugAddress, ugMode, ugYear, ugResultType, ugResultValue, ugBacklogs, ugMedium,
      pgCollege, pgUniversity, pgCourse, pgHall, pgFrom, pgTo, pgAddress, pgMode, pgYear, pgResultType, pgResultValue, pgBacklogs, pgMedium,
    };
    localStorage.setItem("dg_education", JSON.stringify(flat));

    try {
      const draftRes = await fetch(`${API}/employee/draft`, { headers: { Authorization: `Bearer ${token}` } });
      if (draftRes.ok) {
        const existing = await draftRes.json();
        if (existing.employee_id) localStorage.setItem("dg_employee_id", JSON.stringify(existing.employee_id));
        await fetch(`${API}/employee`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ...existing, education: data, status: existing.status || "draft" }),
        });
      }
    } catch (_) {}
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaveStatus("Saving...");
    await saveDraft();
    setSaveStatus("Saved ✓");
    router.push("/employee/previous");
  };

  return (
    <div style={styles.page}>
      {showSignoutConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: "14px", padding: "2rem", maxWidth: "400px", width: "90%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🚪</div>
            <h3 style={{ margin: "0 0 0.5rem", color: "#0f172a" }}>Sign Out?</h3>
            <p style={{ color: "#475569", marginBottom: "1.5rem", fontSize: "0.9rem" }}>Your progress is saved. You can continue from where you left off after logging back in.</p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button onClick={() => setShowSignoutConfirm(false)} style={{ padding: "0.6rem 1.5rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
              <button onClick={() => { logout(); router.push("/employee/login"); }} style={{ padding: "0.6rem 1.5rem", borderRadius: "8px", border: "none", background: "#0f172a", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Yes, Sign Out</button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.card}>
        <ProgressBar currentStep={2} totalSteps={4} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h1 style={{ ...styles.title, margin: 0 }}>Education Details</h1>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={() => router.push("/consent")} style={{ background: "#fff", border: "1px solid #2563eb", color: "#2563eb", borderRadius: "8px", padding: "0.45rem 1rem", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>🔒 Consent Center</button>
            <button onClick={() => setShowSignoutConfirm(true)} style={{ background: "#0f172a", border: "none", color: "#fff", borderRadius: "8px", padding: "0.45rem 1rem", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>Sign Out</button>
          </div>
        </div>

        {/* CLASS X */}
        <Section title="Class X">
          <Row>
            <Input label="School Name"               required value={xSchool}      onChange={setXSchool}      error={errors.xSchool} />
            <Input label="Board Name"                required value={xBoard}       onChange={setXBoard}       error={errors.xBoard} />
            <Input label="Hall Ticket / Roll Number"          value={xHall}        onChange={setXHall} />
          </Row>
          <Row>
            <Input type="date" label="From" value={xFrom} onChange={setXFrom} />
            <Input type="date" label="To"   value={xTo}   onChange={setXTo} />
          </Row>
          <Input label="School Address" value={xAddress} onChange={setXAddress} />
          <Row>
            <Input  label="Year of Passing" required value={xYear}        onChange={setXYear}        error={errors.xYear} />
            <Select label="Result Type"              value={xResultType}   onChange={setXResultType}  options={["Percentage","Grade"]} />
            <Input  label="Result Value"             value={xResultValue}  onChange={setXResultValue} />
          </Row>
          <Input label="Medium of Study" value={xMedium} onChange={setXMedium} />
          <FileField label="Upload Class X Certificate (coming soon)" />
        </Section>

        {/* INTERMEDIATE */}
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
            <Select label="Mode of Education" value={iMode}        onChange={setIMode}        options={["Full-time","Part-time","Distance"]} />
            <Input  label="Year of Passing"   value={iYear}        onChange={setIYear} />
          </Row>
          <Row>
            <Select label="Result Type"  value={iResultType}  onChange={setIResultType}  options={["Percentage","Grade"]} />
            <Input  label="Result Value" value={iResultValue} onChange={setIResultValue} />
          </Row>
          <Input label="Medium of Study" value={iMedium} onChange={setIMedium} />
          <FileField label="Upload Intermediate Certificate (coming soon)" />
        </Section>

        {/* UNDERGRADUATE */}
        <Section title="Undergraduate (UG)">
          <Row>
            <Input label="College Name"    value={ugCollege}    onChange={setUgCollege} />
            <Input label="University Name" value={ugUniversity} onChange={setUgUniversity} />
            <Input label="Course / Degree" value={ugCourse}     onChange={setUgCourse} />
          </Row>
          <Row>
            <Input  label="Hall Ticket / Roll Number" value={ugHall} onChange={setUgHall} />
            <Select label="Mode of Education"         value={ugMode} onChange={setUgMode} options={["Full-time","Part-time","Distance"]} />
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
          <Input  label="Medium of Study"     value={ugMedium}   onChange={setUgMedium} />
          <Select label="Any Active Backlogs?" value={ugBacklogs} onChange={setUgBacklogs} options={["No","Yes"]} />
          <FileField label="Upload UG Degree / Provisional Certificate (coming soon)" />
        </Section>

        {/* POSTGRADUATE */}
        <Section title="Postgraduate (PG)">
          <Row>
            <Input label="College Name"    value={pgCollege}    onChange={setPgCollege} />
            <Input label="University Name" value={pgUniversity} onChange={setPgUniversity} />
            <Input label="Course / Degree" value={pgCourse}     onChange={setPgCourse} />
          </Row>
          <Row>
            <Input  label="Hall Ticket / Roll Number" value={pgHall} onChange={setPgHall} />
            <Select label="Mode of Education"         value={pgMode} onChange={setPgMode} options={["Full-time","Part-time","Distance"]} />
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
          <Input  label="Medium of Study"      value={pgMedium}   onChange={setPgMedium} />
          <Select label="Any Active Backlogs?" value={pgBacklogs}  onChange={setPgBacklogs} options={["No","Yes"]} />
          <FileField label="Upload PG Degree / Provisional Certificate (coming soon)" />
        </Section>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => router.push("/employee/personal")} style={styles.secondaryBtn}>⬅ Previous</button>
          <span style={{ color: "#64748b", fontSize: "0.85rem" }}>{saveStatus}</span>
          <button onClick={handleSave} style={styles.primaryBtn}>Save & Proceed →</button>
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
  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>{children}</div>
);
const Input = ({ label, value, onChange, type = "text", required, error }) => (
  <div style={{ flex: 1, minWidth: "200px" }}>
    <label style={styles.label}>
      {label}{required && <span style={{ color: "#dc2626", marginLeft: "3px" }}>*</span>}
    </label>
    <input
      type={type}
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      style={{ ...styles.input, borderColor: error ? "#dc2626" : "#cbd5e1" }}
    />
    {error && <p style={{ color: "#dc2626", fontSize: "0.78rem", marginTop: "0.2rem" }}>{error}</p>}
  </div>
);
const Select = ({ label, value, onChange, options, required }) => (
  <div style={{ flex: 1, minWidth: "180px" }}>
    <label style={styles.label}>
      {label}{required && <span style={{ color: "#dc2626", marginLeft: "3px" }}>*</span>}
    </label>
    <select value={value || ""} onChange={e => onChange(e.target.value)} style={styles.input}>
      <option value="">Select</option>
      {options.map(o => <option key={o}>{o}</option>)}
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
  label:        { fontSize: "0.85rem", color: "#475569", display: "block", marginBottom: "0.2rem" },
  input:        { width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box" },
  primaryBtn:   { padding: "0.9rem 2.5rem", borderRadius: "10px", border: "none", background: "#2563eb", color: "#fff", cursor: "pointer" },
  secondaryBtn: { padding: "0.9rem 2.5rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer" },
};
