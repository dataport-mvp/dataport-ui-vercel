import { useState } from "react";
import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";

export default function PersonalDetails() {
  const router = useRouter();

  // Photo
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Name
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");

  // Father
  const [fatherFirst, setFatherFirst] = useState("");
  const [fatherMiddle, setFatherMiddle] = useState("");
  const [fatherLast, setFatherLast] = useState("");

  // Personal
  const [dob, setDob] = useState("");
  const [nationality, setNationality] = useState("");
  const [gender, setGender] = useState("");
  const [mobile, setMobile] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [pan, setPan] = useState("");
  const [passport, setPassport] = useState("");

  // Current Address
  const [currentFrom, setCurrentFrom] = useState("");
  const [currentTo, setCurrentTo] = useState("");
  const [currentDoor, setCurrentDoor] = useState("");
  const [currentVillage, setCurrentVillage] = useState("");
  const [currentDistrict, setCurrentDistrict] = useState("");
  const [currentPincode, setCurrentPincode] = useState("");

  // Permanent Address
  const [permFrom, setPermFrom] = useState("");
  const [permDoor, setPermDoor] = useState("");
  const [permVillage, setPermVillage] = useState("");
  const [permDistrict, setPermDistrict] = useState("");
  const [permPincode, setPermPincode] = useState("");

  // Validators
  const vMobile = (v) => /^\d{10}$/.test(v);
  const vAadhar = (v) => /^\d{12}$/.test(v);
  const vPan = (v) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v);
  const vPin = (v) => /^\d{6}$/.test(v);

  const allValid =
    firstName &&
    lastName &&
    fatherFirst &&
    fatherLast &&
    dob &&
    nationality &&
    gender &&
    vMobile(mobile) &&
    vAadhar(aadhar) &&
    vPan(pan) &&
    currentFrom &&
    currentTo &&
    currentDoor &&
    currentVillage &&
    currentDistrict &&
    vPin(currentPincode) &&
    permFrom &&
    permDoor &&
    permVillage &&
    permDistrict &&
    vPin(permPincode);

  const handlePhoto = (file) => {
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = () => {
    if (!allValid) return;
    router.push("/employee/education");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <ProgressBar currentStep={1} totalSteps={4} />
        <h1 style={styles.title}>Personal Details</h1>

        <Section title="Profile Photo">
          <div style={{ textAlign: "center" }}>
            {photoPreview ? (
              <img src={photoPreview} style={styles.photo} />
            ) : (
              <div style={styles.photoPlaceholder}>Upload Photo</div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePhoto(e.target.files[0])}
            />
          </div>
        </Section>

        <Section title="Name">
          <Row>
            <Input label="First Name" value={firstName} onChange={setFirstName} />
            <Input label="Middle Name" value={middleName} onChange={setMiddleName} />
            <Input label="Last Name" value={lastName} onChange={setLastName} />
          </Row>
        </Section>

        <Section title="Father Name">
          <Row>
            <Input label="First Name" value={fatherFirst} onChange={setFatherFirst} />
            <Input label="Middle Name" value={fatherMiddle} onChange={setFatherMiddle} />
            <Input label="Last Name" value={fatherLast} onChange={setFatherLast} />
          </Row>
        </Section>

        <Section title="Personal Info">
          <Row>
            <Input type="date" label="Date of Birth" value={dob} onChange={setDob} />
            <Input label="Nationality" value={nationality} onChange={setNationality} />
            <Select label="Gender" value={gender} onChange={setGender} />
          </Row>
        </Section>

        <Section title="Current Address">
          <Row>
            <Input type="date" label="Residing From" value={currentFrom} onChange={setCurrentFrom} />
            <Input type="date" label="Residing To" value={currentTo} onChange={setCurrentTo} />
          </Row>
          <Input label="Door & Street" value={currentDoor} onChange={setCurrentDoor} />
          <Input label="Village / Mandal" value={currentVillage} onChange={setCurrentVillage} />
          <Input label="District / State" value={currentDistrict} onChange={setCurrentDistrict} />
          <Input label="Pincode" value={currentPincode} onChange={(v)=>setCurrentPincode(v.replace(/\D/g,""))} />
        </Section>

        <Section title="Permanent Address">
          <Input type="date" label="Residing From" value={permFrom} onChange={setPermFrom} />
          <Input label="Door & Street" value={permDoor} onChange={setPermDoor} />
          <Input label="Village / Mandal" value={permVillage} onChange={setPermVillage} />
          <Input label="District / State" value={permDistrict} onChange={setPermDistrict} />
          <Input label="Pincode" value={permPincode} onChange={(v)=>setPermPincode(v.replace(/\D/g,""))} />
        </Section>

        <button
          onClick={handleSave}
          disabled={!allValid}
          style={{
            ...styles.button,
            background: allValid ? "#2563eb" : "#cbd5e1"
          }}
        >
          Save & Proceed →
        </button>
      </div>
    </div>
  );
}

/* ----------------- Small UI helpers ----------------- */

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

const styles = {
  page: {
    background: "#f1f5f9",
    padding: "2rem",
    minHeight: "100vh",
    fontFamily: "Inter, system-ui, sans-serif"
  },
  card: {
    maxWidth: "900px",
    margin: "auto",
    background: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
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
    padding: "0.6rem",
    borderRadius: "8px",
    border: "1px solid #cbd5e1"
  },
  button: {
    padding: "0.9rem 2rem",
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
  }
};
