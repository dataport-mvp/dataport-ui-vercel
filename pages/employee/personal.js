// pages/employee/personal.js  — Page 1 of 4
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";
import { useAuth } from "../../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

export default function PersonalDetails() {
  const router = useRouter();
  const { token, user } = useAuth();

  /* ---------------- Photo ---------------- */
  const [photoPreview, setPhotoPreview] = useState(null);

  /* ---------------- Names ---------------- */
  const [firstName,    setFirstName]    = useState("");
  const [middleName,   setMiddleName]   = useState("");
  const [lastName,     setLastName]     = useState("");

  const [fatherFirst,  setFatherFirst]  = useState("");
  const [fatherMiddle, setFatherMiddle] = useState("");
  const [fatherLast,   setFatherLast]   = useState("");

  /* ---------------- Personal ---------------- */
  const [dob,         setDob]         = useState("");
  const [gender,      setGender]      = useState("");
  const [nationality, setNationality] = useState("");

  // Pre-filled from signup
  const [mobile,  setMobile]  = useState("");
  const [email,   setEmail]   = useState("");

  const [aadhar,   setAadhar]  = useState("");
  const [pan,      setPan]     = useState("");
  const [passport, setPassport] = useState("");

  /* ---------------- Current Address ---------------- */
  const [curFrom,     setCurFrom]     = useState("");
  const [curTo,       setCurTo]       = useState("");
  const [curDoor,     setCurDoor]     = useState("");
  const [curVillage,  setCurVillage]  = useState("");
  const [curDistrict, setCurDistrict] = useState("");
  const [curPin,      setCurPin]      = useState("");

  /* ---------------- Permanent Address ---------------- */
  const [permFrom,     setPermFrom]     = useState("");
  const [permDoor,     setPermDoor]     = useState("");
  const [permVillage,  setPermVillage]  = useState("");
  const [permDistrict, setPermDistrict] = useState("");
  const [permPin,      setPermPin]      = useState("");

  const [saveStatus, setSaveStatus] = useState("");

  /* ---------- Auto-populate from signup & restore draft ---------- */
  useEffect(() => {
    // 1. Pre-fill from auth context (signup data)
    if (user?.email) setEmail(user.email);
    if (user?.phone) setMobile(user.phone);

    // 2. Restore any saved draft
    try {
      const saved = localStorage.getItem("dg_personal");
      if (saved) {
        const d = JSON.parse(saved);
        if (d.firstName)    setFirstName(d.firstName);
        if (d.middleName)   setMiddleName(d.middleName);
        if (d.lastName)     setLastName(d.lastName);
        if (d.fatherFirst)  setFatherFirst(d.fatherFirst);
        if (d.fatherMiddle) setFatherMiddle(d.fatherMiddle);
        if (d.fatherLast)   setFatherLast(d.fatherLast);
        if (d.dob)          setDob(d.dob);
        if (d.gender)       setGender(d.gender);
        if (d.nationality)  setNationality(d.nationality);
        if (d.aadhar)       setAadhar(d.aadhar);
        if (d.pan)          setPan(d.pan);
        if (d.passport)     setPassport(d.passport);
        if (d.curFrom)      setCurFrom(d.curFrom);
        if (d.curTo)        setCurTo(d.curTo);
        if (d.curDoor)      setCurDoor(d.curDoor);
        if (d.curVillage)   setCurVillage(d.curVillage);
        if (d.curDistrict)  setCurDistrict(d.curDistrict);
        if (d.curPin)       setCurPin(d.curPin);
        if (d.permFrom)     setPermFrom(d.permFrom);
        if (d.permDoor)     setPermDoor(d.permDoor);
        if (d.permVillage)  setPermVillage(d.permVillage);
        if (d.permDistrict) setPermDistrict(d.permDistrict);
        if (d.permPin)      setPermPin(d.permPin);
      }
    } catch (_) {}
  }, [user]);

  /* ---------- Build payload ---------- */
  const buildPayload = () => ({
    firstName, middleName, lastName,
    fatherName: `${fatherFirst} ${fatherMiddle} ${fatherLast}`.trim(),
    fatherFirst, fatherMiddle, fatherLast,
    dob, gender, nationality,
    mobile, email,
    aadhaar: aadhar, pan, passport,
    currentAddress: { from: curFrom, to: curTo, door: curDoor, village: curVillage, district: curDistrict, pin: curPin },
    permanentAddress: { from: permFrom, door: permDoor, village: permVillage, district: permDistrict, pin: permPin },
  });

  /* ---------- Save to localStorage + background API ---------- */
  const saveDraft = async () => {
    const data = buildPayload();
    localStorage.setItem("dg_personal", JSON.stringify(data));

    // Merge with any existing employee record in API (draft)
    try {
      const existing = JSON.parse(localStorage.getItem("dg_employee_id") || "null");
      const payload = {
        ...data,
        employee_id: existing || `emp-${Date.now()}`,
        status: "draft",
      };
      if (!existing) localStorage.setItem("dg_employee_id", JSON.stringify(payload.employee_id));

      await fetch(`${API}/employee`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
    } catch (_) { /* silent — localStorage is the primary store */ }
  };

  /* ---------- Navigate ---------- */
  const handleSave = async () => {
    setSaveStatus("Saving...");
    await saveDraft();
    setSaveStatus("Saved ✓");
    router.push("/employee/education");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <ProgressBar currentStep={1} totalSteps={4} />
        <h1 style={styles.title}>Personal Details</h1>

        {/* PHOTO */}
        <Section title="Profile Photo">
          <div style={{ textAlign: "center" }}>
            {photoPreview ? (
              <img src={photoPreview} style={styles.photo} alt="profile" />
            ) : (
              <div style={styles.photoPlaceholder}>Upload Photo</div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoPreview(URL.createObjectURL(e.target.files[0]))}
            />
          </div>
        </Section>

        {/* NAME */}
        <Section title="Name">
          <Row>
            <Input label="First Name"  value={firstName}  onChange={setFirstName} />
            <Input label="Middle Name" value={middleName} onChange={setMiddleName} />
            <Input label="Last Name"   value={lastName}   onChange={setLastName} />
          </Row>
        </Section>

        {/* FATHER */}
        <Section title="Father Name">
          <Row>
            <Input label="First Name"  value={fatherFirst}  onChange={setFatherFirst} />
            <Input label="Middle Name" value={fatherMiddle} onChange={setFatherMiddle} />
            <Input label="Last Name"   value={fatherLast}   onChange={setFatherLast} />
          </Row>
        </Section>

        {/* PERSONAL INFO */}
        <Section title="Personal Information">
          <Row>
            <Input type="date" label="Date of Birth" value={dob} onChange={setDob} />
            <SelectField label="Gender" value={gender} onChange={setGender} options={["Male","Female","Other"]} />
            <Input label="Nationality" value={nationality} onChange={setNationality} />
          </Row>

          <Row>
            {/* EMAIL — pre-filled, read-only */}
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Email (from signup)</label>
              <input
                value={email}
                disabled
                style={{ ...styles.input, background: "#f1f5f9", color: "#64748b" }}
              />
            </div>

            {/* MOBILE — pre-filled, read-only */}
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Mobile Number (India)</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  value="+91"
                  disabled
                  style={{ ...styles.input, maxWidth: "80px", background: "#e5e7eb" }}
                />
                <input
                  value={mobile}
                  disabled
                  style={{ ...styles.input, background: "#f1f5f9", color: "#64748b" }}
                />
              </div>
            </div>

            <Input label="Passport Number" value={passport} onChange={setPassport} />
          </Row>
        </Section>

        {/* AADHAAR + PAN */}
        <Section title="Identity Documents">
          <Row>
            {/* Aadhaar */}
            <div style={{ flex: 1 }}>
              <Input
                label="Aadhaar Number"
                value={aadhar}
                onChange={(v) => { const d = v.replace(/\D/g,""); if(d.length<=12) setAadhar(d); }}
              />
              {aadhar && aadhar.length !== 12 && <p style={styles.error}>Must be 12 digits</p>}
              {/* File upload UI preserved — S3 integration coming */}
              <div style={{ marginTop: "0.5rem" }}>
                <label style={styles.label}>Upload Aadhaar (coming soon)</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" disabled style={{ opacity: 0.5 }} />
              </div>
            </div>

            {/* PAN */}
            <div style={{ flex: 1 }}>
              <Input
                label="PAN Number"
                value={pan}
                onChange={(v) => {
                  let val = v.toUpperCase();
                  if (val.length <= 5)       val = val.replace(/[^A-Z]/g,"");
                  else if (val.length <= 9)  val = val.slice(0,5).replace(/[^A-Z]/g,"") + val.slice(5).replace(/[^0-9]/g,"");
                  else if (val.length <= 10) val = val.slice(0,5).replace(/[^A-Z]/g,"") + val.slice(5,9).replace(/[^0-9]/g,"") + val.slice(9).replace(/[^A-Z]/g,"");
                  setPan(val);
                }}
              />
              {pan && pan.length !== 10 && <p style={styles.error}>Format: AAAAA9999A</p>}
              <div style={{ marginTop: "0.5rem" }}>
                <label style={styles.label}>Upload PAN (coming soon)</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" disabled style={{ opacity: 0.5 }} />
              </div>
            </div>
          </Row>
        </Section>

        {/* CURRENT ADDRESS */}
        <Section title="Current Address">
          <Row>
            <Input type="date" label="Residing From" value={curFrom} onChange={setCurFrom} />
            <Input type="date" label="Residing To"   value={curTo}   onChange={setCurTo} />
          </Row>
          <Input label="Door & Street"   value={curDoor}     onChange={setCurDoor} />
          <Input label="Village / Mandal" value={curVillage} onChange={setCurVillage} />
          <Input label="District / State" value={curDistrict} onChange={setCurDistrict} />
          <Input label="Pincode" value={curPin} onChange={(v) => setCurPin(v.replace(/\D/g,""))} />
        </Section>

        {/* PERMANENT ADDRESS */}
        <Section title="Permanent Address">
          <Input type="date" label="Residing From" value={permFrom} onChange={setPermFrom} />
          <Input label="Door & Street"    value={permDoor}     onChange={setPermDoor} />
          <Input label="Village / Mandal" value={permVillage}  onChange={setPermVillage} />
          <Input label="District / State" value={permDistrict} onChange={setPermDistrict} />
          <Input label="Pincode" value={permPin} onChange={(v) => setPermPin(v.replace(/\D/g,""))} />
        </Section>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#64748b", fontSize: "0.85rem" }}>{saveStatus}</span>
          <button onClick={handleSave} style={{ ...styles.button, background: "#2563eb" }}>
            Save & Proceed →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- UI HELPERS (exact same as original) ---------------- */
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

const SelectField = ({ label, value, onChange, options }) => (
  <div style={{ flex: 1 }}>
    <label style={styles.label}>{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} style={styles.input}>
      <option value="">Select</option>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  </div>
);

/* ---------------- STYLES (exact same as original) ---------------- */
const styles = {
  page:             { background: "#f1f5f9", padding: "2rem", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" },
  card:             { maxWidth: "980px", margin: "auto", background: "#fff", padding: "2rem", borderRadius: "14px", boxShadow: "0 12px 30px rgba(0,0,0,0.08)" },
  title:            { marginBottom: "2rem" },
  sectionTitle:     { marginBottom: "1rem", color: "#0f172a" },
  label:            { fontSize: "0.85rem", color: "#475569" },
  input:            { width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1" },
  button:           { padding: "0.9rem 2.5rem", borderRadius: "10px", border: "none", color: "#fff", fontSize: "1rem", cursor: "pointer" },
  photo:            { width: "140px", height: "140px", borderRadius: "50%", objectFit: "cover", marginBottom: "0.5rem" },
  photoPlaceholder: { width: "140px", height: "140px", borderRadius: "50%", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.5rem" },
  error:            { color: "#dc2626", fontSize: "0.8rem", marginTop: "0.25rem" },
};
