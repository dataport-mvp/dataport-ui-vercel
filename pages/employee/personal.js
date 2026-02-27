// pages/employee/personal.js - Page 1/4
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";
import ProgressBar from "../../components/ProgressBar";

export default function PersonalDetails() {
  const router = useRouter();
  const { user, apiCall, isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/employee/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const [employeeId] = useState(() => `emp-${Date.now()}`);
  const [saving, setSaving] = useState(false);

  /* ---------------- Photo ---------------- */
  const [photoPreview, setPhotoPreview] = useState(null);

  /* ---------------- Names ---------------- */
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");

  const [fatherFirst, setFatherFirst] = useState("");
  const [fatherMiddle, setFatherMiddle] = useState("");
  const [fatherLast, setFatherLast] = useState("");

  /* ---------------- Personal ---------------- */
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [nationality, setNationality] = useState("");

  const [mobile, setMobile] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [pan, setPan] = useState("");
  const [passport, setPassport] = useState("");

  /* ---------------- Current Address ---------------- */
  const [curFrom, setCurFrom] = useState("");
  const [curTo, setCurTo] = useState("");
  const [curDoor, setCurDoor] = useState("");
  const [curVillage, setCurVillage] = useState("");
  const [curDistrict, setCurDistrict] = useState("");
  const [curPin, setCurPin] = useState("");

  /* ---------------- Permanent Address ---------------- */
  const [permFrom, setPermFrom] = useState("");
  const [permDoor, setPermDoor] = useState("");
  const [permVillage, setPermVillage] = useState("");
  const [permDistrict, setPermDistrict] = useState("");
  const [permPin, setPermPin] = useState("");

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem('datagate_personal');
    if (saved) {
      const data = JSON.parse(saved);
      setFirstName(data.firstName || "");
      setMiddleName(data.middleName || "");
      setLastName(data.lastName || "");
      setFatherFirst(data.fatherFirst || "");
      setFatherMiddle(data.fatherMiddle || "");
      setFatherLast(data.fatherLast || "");
      setDob(data.dob || "");
      setGender(data.gender || "");
      setNationality(data.nationality || "");
      setMobile(data.mobile || "");
      setAadhar(data.aadhar || "");
      setPan(data.pan || "");
      setPassport(data.passport || "");
      setCurFrom(data.curFrom || "");
      setCurTo(data.curTo || "");
      setCurDoor(data.curDoor || "");
      setCurVillage(data.curVillage || "");
      setCurDistrict(data.curDistrict || "");
      setCurPin(data.curPin || "");
      setPermFrom(data.permFrom || "");
      setPermDoor(data.permDoor || "");
      setPermVillage(data.permVillage || "");
      setPermDistrict(data.permDistrict || "");
      setPermPin(data.permPin || "");
      setPhotoPreview(data.photo || null);
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);

    const personalData = {
      photo: photoPreview,
      firstName, middleName, lastName,
      fatherFirst, fatherMiddle, fatherLast,
      dob, gender, nationality,
      mobile, aadhar, pan, passport,
      curFrom, curTo, curDoor, curVillage, curDistrict, curPin,
      permFrom, permDoor, permVillage, permDistrict, permPin
    };

    // Save to localStorage
    localStorage.setItem('datagate_personal', JSON.stringify(personalData));
    localStorage.setItem('datagate_employee_id', employeeId);
    
    // Save draft to API
    try {
      await apiCall('/employee', 'POST', {
        employee_id: employeeId,
        status: "draft",
        firstName: firstName || "temp",
        lastName: lastName || "temp",
        mobile: mobile || "0000000000",
        email: user?.email,
        personal: personalData
      });
    } catch (err) {
      console.error("Draft save failed:", err);
    }
    
    setSaving(false);
    router.push("/employee/education");
  };

  if (authLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  if (!isAuthenticated) return null;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <ProgressBar currentStep={1} totalSteps={4} />
        <h1 style={styles.title}>Personal Details</h1>

        {/* PHOTO */}
        <Section title="Profile Photo">
          <div style={{ textAlign: "center" }}>
            {photoPreview ? (
              <img src={photoPreview} style={styles.photo} alt="Profile" />
            ) : (
              <div style={styles.photoPlaceholder}>Upload Photo</div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) setPhotoPreview(URL.createObjectURL(file));
              }}
            />
          </div>
        </Section>

        {/* NAME */}
        <Section title="Name">
          <Row>
            <Input label="First Name" value={firstName} onChange={setFirstName} />
            <Input label="Middle Name" value={middleName} onChange={setMiddleName} />
            <Input label="Last Name" value={lastName} onChange={setLastName} />
          </Row>
        </Section>

        {/* FATHER */}
        <Section title="Father Name">
          <Row>
            <Input label="First Name" value={fatherFirst} onChange={setFatherFirst} />
            <Input label="Middle Name" value={fatherMiddle} onChange={setFatherMiddle} />
            <Input label="Last Name" value={fatherLast} onChange={setFatherLast} />
          </Row>
        </Section>

        {/* PERSONAL INFO */}
        <Section title="Personal Information">
          <Row>
            <Input type="date" label="Date of Birth" value={dob} onChange={setDob} />
            <Select label="Gender" value={gender} onChange={setGender} />
            <Input label="Nationality" value={nationality} onChange={setNationality} />
          </Row>

          <Row>
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
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    if (digits.length <= 10) setMobile(digits);
                  }}
                  style={styles.input}
                />
              </div>
              {mobile && mobile.length !== 10 && (
                <p style={styles.errorText}>Mobile number must be exactly 10 digits</p>
              )}
            </div>

            <Input label="Passport Number" value={passport} onChange={setPassport} />
          </Row>
        </Section>

        {/* AADHAAR + PAN */}
        <Section title="Identity Documents">
          <Row>
            <div style={{ flex: 1 }}>
              <Input
                label="Aadhaar Number"
                value={aadhar}
                onChange={(v) => {
                  const digits = v.replace(/\D/g, "");
                  if (digits.length <= 12) setAadhar(digits);
                }}
              />
              {aadhar && aadhar.length !== 12 && (
                <p style={styles.errorText}>Aadhaar must be exactly 12 digits</p>
              )}
              <File label="Upload Aadhaar" />
            </div>

            <div style={{ flex: 1 }}>
              <Input
                label="PAN Number"
                value={pan}
                onChange={(v) => {
                  let value = v.toUpperCase();
                  if (value.length <= 5) {
                    value = value.replace(/[^A-Z]/g, "");
                  } else if (value.length <= 9) {
                    value =
                      value.slice(0, 5).replace(/[^A-Z]/g, "") +
                      value.slice(5).replace(/[^0-9]/g, "");
                  } else if (value.length <= 10) {
                    value =
                      value.slice(0, 5).replace(/[^A-Z]/g, "") +
                      value.slice(5, 9).replace(/[^0-9]/g, "") +
                      value.slice(9).replace(/[^A-Z]/g, "");
                  }
                  setPan(value);
                }}
              />
              {pan && pan.length !== 10 && (
                <p style={styles.errorText}>PAN format: AAAAA9999A</p>
              )}
              <File label="Upload PAN" />
            </div>
          </Row>
        </Section>

        {/* CURRENT ADDRESS */}
        <Section title="Current Address">
          <Row>
            <Input type="date" label="Residing From" value={curFrom} onChange={setCurFrom} />
            <Input type="date" label="Residing To" value={curTo} onChange={setCurTo} />
          </Row>
          <Input label="Door & Street" value={curDoor} onChange={setCurDoor} />
          <Input label="Village / Mandal" value={curVillage} onChange={setCurVillage} />
          <Input label="District / State" value={curDistrict} onChange={setCurDistrict} />
          <Input label="Pincode" value={curPin} onChange={(v) => setCurPin(v.replace(/\D/g, ""))} />
        </Section>

        {/* PERMANENT ADDRESS */}
        <Section title="Permanent Address">
          <Input type="date" label="Residing From" value={permFrom} onChange={setPermFrom} />
          <Input label="Door & Street" value={permDoor} onChange={setPermDoor} />
          <Input label="Village / Mandal" value={permVillage} onChange={setPermVillage} />
          <Input label="District / State" value={permDistrict} onChange={setPermDistrict} />
          <Input
            label="Pincode"
            value={permPin}
            onChange={(v) => setPermPin(v.replace(/\D/g, ""))}
          />
        </Section>

        <button
          onClick={handleSave}
          style={{ ...styles.button, background: "#2563eb", opacity: saving ? 0.6 : 1 }}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save & Proceed →"}
        </button>
      </div>
    </div>
  );
}

/* ---------------- UI HELPERS ---------------- */

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

const Select = ({ label, value, onChange }) => (
  <div style={{ flex: 1 }}>
    <label style={styles.label}>{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} style={styles.input}>
      <option value="">Select</option>
      <option>Male</option>
      <option>Female</option>
      <option>Other</option>
    </select>
  </div>
);

const File = ({ label }) => (
  <div>
    <label style={styles.label}>{label}</label>
    <input type="file" accept=".pdf,.jpg,.jpeg,.png" />
  </div>
);

/* ---------------- STYLES ---------------- */

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
  title: {
    marginBottom: "2rem"
  },
  sectionTitle: {
    marginBottom: "1rem",
    color: "#0f172a"
  },
  label: {
    fontSize: "0.85rem",
    color: "#475569"
  },
  input: {
    width: "100%",
    padding: "0.65rem",
    borderRadius: "8px",
    border: "1px solid #cbd5e1"
  },
  button: {
    padding: "0.9rem 2.5rem",
    borderRadius: "10px",
    border: "none",
    color: "#fff",
    fontSize: "1rem",
    cursor: "pointer"
  },
  photo: {
    width: "140px",
    height: "140px",
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: "0.5rem"
  },
  photoPlaceholder: {
    width: "140px",
    height: "140px",
    borderRadius: "50%",
    background: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "0.5rem"
  },
  errorText: {
    color: "#dc2626",
    fontSize: "0.8rem",
    marginTop: "0.25rem"
  }
};
