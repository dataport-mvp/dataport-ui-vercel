// pages/employee/education.js  — Page 2 of 4
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

function SignoutModal({ onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "2rem", maxWidth: 360, width: "90%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize: 36, marginBottom: "0.75rem" }}>👋</div>
        <h3 style={{ margin: "0 0 0.5rem", color: "#0f172a" }}>Sign out?</h3>
        <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Your progress is saved. You can continue anytime.</p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={onCancel}  style={{ flex: 1, padding: "0.75rem", borderRadius: 8, border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontWeight: 600 }}>Stay</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "0.75rem", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

export default function EducationDetails() {
  const router = useRouter();
  const { user, apiFetch, logout, ready } = useAuth();
  const [showSignout, setShowSignout] = useState(false);
  const [saveStatus,  setSaveStatus]  = useState("");
  const [loading,     setLoading]     = useState(true);

  // We cache the full server draft so we can merge education into it on save
  // without blanking out page 1 fields (firstName, lastName, etc.)
  const [serverDraft, setServerDraft] = useState(null);

  // Class X
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

  // Intermediate
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

  // Undergraduate
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

  // Postgraduate
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

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/employee/login"); return; }
  }, [ready, user, router]);

  // Fetch draft from API on mount — restores data on any device
  useEffect(() => {
    if (!ready || !user) return;
    const fetchDraft = async () => {
      try {
        const res = await apiFetch(`${API}/employee/draft`);
        if (res.ok) {
          const d = await res.json();
          setServerDraft(d); // cache full draft for merge on save

          // education is stored as nested dict under d.education
          const edu = d.education || {};
          const x   = edu.classX        || {};
          const i   = edu.intermediate  || {};
          const ug  = edu.undergraduate || {};
          const pg  = edu.postgraduate  || {};

          if (x.school)       setXSchool(x.school);
          if (x.board)        setXBoard(x.board);
          if (x.hallTicket)   setXHall(x.hallTicket);
          if (x.from)         setXFrom(x.from);
          if (x.to)           setXTo(x.to);
          if (x.address)      setXAddress(x.address);
          if (x.yearOfPassing)setXYear(x.yearOfPassing);
          if (x.resultType)   setXResultType(x.resultType);
          if (x.resultValue)  setXResultValue(x.resultValue);
          if (x.medium)       setXMedium(x.medium);

          if (i.college)      setICollege(i.college);
          if (i.board)        setIBoard(i.board);
          if (i.hallTicket)   setIHall(i.hallTicket);
          if (i.from)         setIFrom(i.from);
          if (i.to)           setITo(i.to);
          if (i.address)      setIAddress(i.address);
          if (i.mode)         setIMode(i.mode);
          if (i.yearOfPassing)setIYear(i.yearOfPassing);
          if (i.resultType)   setIResultType(i.resultType);
          if (i.resultValue)  setIResultValue(i.resultValue);
          if (i.medium)       setIMedium(i.medium);

          if (ug.college)     setUgCollege(ug.college);
          if (ug.university)  setUgUniversity(ug.university);
          if (ug.course)      setUgCourse(ug.course);
          if (ug.hallTicket)  setUgHall(ug.hallTicket);
          if (ug.from)        setUgFrom(ug.from);
          if (ug.to)          setUgTo(ug.to);
          if (ug.address)     setUgAddress(ug.address);
          if (ug.mode)        setUgMode(ug.mode);
          if (ug.yearOfPassing)setUgYear(ug.yearOfPassing);
          if (ug.resultType)  setUgResultType(ug.resultType);
          if (ug.resultValue) setUgResultValue(ug.resultValue);
          if (ug.backlogs)    setUgBacklogs(ug.backlogs);
          if (ug.medium)      setUgMedium(ug.medium);

          if (pg.college)     setPgCollege(pg.college);
          if (pg.university)  setPgUniversity(pg.university);
          if (pg.course)      setPgCourse(pg.course);
          if (pg.hallTicket)  setPgHall(pg.hallTicket);
          if (pg.from)        setPgFrom(pg.from);
          if (pg.to)          setPgTo(pg.to);
          if (pg.address)     setPgAddress(pg.address);
          if (pg.mode)        setPgMode(pg.mode);
          if (pg.yearOfPassing)setPgYear(pg.yearOfPassing);
          if (pg.resultType)  setPgResultType(pg.resultType);
          if (pg.resultValue) setPgResultValue(pg.resultValue);
          if (pg.backlogs)    setPgBacklogs(pg.backlogs);
          if (pg.medium)      setPgMedium(pg.medium);
        }
        // 404 = page 1 not saved yet — empty form is fine
      } catch (_) {}
      setLoading(false);
    };
    fetchDraft();
  }, [ready, user, apiFetch]);

  const buildEducation = () => ({
    classX:        { school: xSchool, board: xBoard, hallTicket: xHall, from: xFrom, to: xTo, address: xAddress, yearOfPassing: xYear, resultType: xResultType, resultValue: xResultValue, medium: xMedium },
    intermediate:  { college: iCollege, board: iBoard, hallTicket: iHall, from: iFrom, to: iTo, address: iAddress, mode: iMode, yearOfPassing: iYear, resultType: iResultType, resultValue: iResultValue, medium: iMedium },
    undergraduate: { college: ugCollege, university: ugUniversity, course: ugCourse, hallTicket: ugHall, from: ugFrom, to: ugTo, address: ugAddress, mode: ugMode, yearOfPassing: ugYear, resultType: ugResultType, resultValue: ugResultValue, backlogs: ugBacklogs, medium: ugMedium },
    postgraduate:  { college: pgCollege, university: pgUniversity, course: pgCourse, hallTicket: pgHall, from: pgFrom, to: pgTo, address: pgAddress, mode: pgMode, yearOfPassing: pgYear, resultType: pgResultType, resultValue: pgResultValue, backlogs: pgBacklogs, medium: pgMedium },
  });

  const saveDraft = async () => {
    // Must have a draft from page 1 to know the employee_id and carry required fields
    if (!serverDraft || !serverDraft.employee_id) {
      throw new Error("Please complete and save Page 1 first");
    }
    const d = serverDraft;
    const res = await apiFetch(`${API}/employee`, {
      method: "POST",
      body: JSON.stringify({
        // Carry all page-1 fields forward exactly as stored — never blank them
        employee_id:      d.employee_id,
        status:           d.status || "draft",
        firstName:        d.firstName        || "",
        lastName:         d.lastName         || "",
        middleName:       d.middleName,
        fatherName:       d.fatherName,
        fatherFirst:      d.fatherFirst,
        fatherMiddle:     d.fatherMiddle,
        fatherLast:       d.fatherLast,
        dob:              d.dob,
        gender:           d.gender,
        nationality:      d.nationality,
        mobile:           d.mobile           || "",
        email:            d.email,
        aadhaar:          d.aadhaar,
        pan:              d.pan,
        passport:         d.passport,
        currentAddress:   d.currentAddress,
        permanentAddress: d.permanentAddress,
        // UAN fields — carry forward if already saved on page 4
        uanNumber:        d.uanNumber,
        nameAsPerUan:     d.nameAsPerUan,
        mobileLinked:     d.mobileLinked,
        isActive:         d.isActive,
        pfRecords:        d.pfRecords,
        acknowledgements_profile: d.acknowledgements_profile,
        // This page's data
        education: buildEducation(),
      }),
    });
    if (!res.ok) throw new Error(parseError(await res.json().catch(() => ({}))));
    // Update cached draft
    setServerDraft({ ...d, education: buildEducation() });
  };

  const handleSave = async () => {
    setSaveStatus("Saving...");
    try {
      await saveDraft();
      setSaveStatus("Saved ✓");
      router.push("/employee/previous");
    } catch (err) {
      setSaveStatus(`Error: ${err.message || "Could not save"}`);
    }
  };

  const handlePrevious = async () => {
    try { await saveDraft(); } catch (_) {}
    router.push("/employee/personal");
  };

  const handleSignout = async () => {
    try { await saveDraft(); } catch (_) {}
    logout();
  };

  if (!ready || !user) return null;
  if (loading) return <div style={{ ...styles.page, display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ color: "#64748b" }}>Loading education details…</p></div>;

  return (
    <div style={styles.page}>
      {showSignout && <SignoutModal onConfirm={handleSignout} onCancel={() => setShowSignout(false)} />}
      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <span style={{ fontSize: "0.85rem", color: "#475569" }}>👤 {user.name || user.email}</span>
          <button onClick={() => setShowSignout(true)} style={styles.signoutBtn}>Sign out</button>
        </div>
        <ProgressBar currentStep={2} totalSteps={4} />
        <h1 style={styles.title}>Education Details</h1>

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
            <Input  label="Year of Passing" value={xYear}        onChange={setXYear} />
            <Select label="Result Type"     value={xResultType}  onChange={setXResultType}  options={["Percentage","Grade"]} />
            <Input  label="Result Value"    value={xResultValue} onChange={setXResultValue} />
          </Row>
          <Input label="Medium of Study" value={xMedium} onChange={setXMedium} />
          <FileField label="Upload Class X Certificate (coming soon)" />
        </Section>

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
          <Input label="Medium of Study" value={ugMedium} onChange={setUgMedium} />
          <Select label="Any Active Backlogs?" value={ugBacklogs} onChange={setUgBacklogs} options={["No","Yes"]} />
          <FileField label="Upload UG Degree / Provisional Certificate (coming soon)" />
        </Section>

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
          <Input label="Medium of Study" value={pgMedium} onChange={setPgMedium} />
          <Select label="Any Active Backlogs?" value={pgBacklogs} onChange={setPgBacklogs} options={["No","Yes"]} />
          <FileField label="Upload PG Degree / Provisional Certificate (coming soon)" />
        </Section>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={handlePrevious} style={styles.secondaryBtn}>⬅ Previous</button>
          <span style={{ color: saveStatus.startsWith("Error") ? "#dc2626" : "#64748b", fontSize: "0.85rem" }}>{saveStatus}</span>
          <button onClick={handleSave} style={styles.primaryBtn}>Save & Proceed →</button>
        </div>
      </div>
    </div>
  );
}

const Section   = ({ title, children }) => (<div style={{ marginBottom: "2rem" }}><h2 style={styles.sectionTitle}>{title}</h2>{children}</div>);
const Row       = ({ children }) => <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>{children}</div>;
const Input     = ({ label, value, onChange, type = "text" }) => (<div style={{ flex: 1, minWidth: "200px" }}><label style={styles.label}>{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={styles.input} /></div>);
const Select    = ({ label, value, onChange, options }) => (<div style={{ flex: 1 }}><label style={styles.label}>{label}</label><select value={value} onChange={(e) => onChange(e.target.value)} style={styles.input}><option value="">Select</option>{options.map((o) => <option key={o}>{o}</option>)}</select></div>);
const FileField = ({ label }) => (<div style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}><label style={styles.label}>{label}</label><input type="file" accept=".pdf,.jpg,.jpeg,.png" disabled style={{ opacity: 0.5 }} /></div>);

const styles = {
  page:         { background: "#f1f5f9", padding: "2rem", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" },
  card:         { maxWidth: "980px", margin: "auto", background: "#fff", padding: "2rem", borderRadius: "14px", boxShadow: "0 12px 30px rgba(0,0,0,0.08)" },
  title:        { marginBottom: "2rem" },
  sectionTitle: { marginBottom: "1rem", color: "#0f172a" },
  label:        { fontSize: "0.85rem", color: "#475569" },
  input:        { width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1" },
  primaryBtn:   { padding: "0.9rem 2.5rem", borderRadius: "10px", border: "none", background: "#2563eb", color: "#fff", cursor: "pointer" },
  secondaryBtn: { padding: "0.9rem 2.5rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer" },
  signoutBtn:   { padding: "0.4rem 1rem", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", color: "#64748b", fontSize: "0.85rem", cursor: "pointer", fontWeight: 600 },
};
