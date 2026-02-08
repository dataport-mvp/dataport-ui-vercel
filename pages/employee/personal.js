import { useState } from "react";
import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";

export default function PersonalDetails() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fatherFirst, setFatherFirst] = useState("");
  const [fatherLast, setFatherLast] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [pan, setPan] = useState("");
  const [mobile, setMobile] = useState("");
  const [empCode, setEmpCode] = useState("");

  // Address fields
  const [doorStreet, setDoorStreet] = useState("");
  const [village, setVillage] = useState("");
  const [mandal, setMandal] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const router = useRouter();

  // Validation rules
  const validateAadhar = (value) => /^\d{12}$/.test(value);
  const validatePan = (value) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value);
  const validateMobile = (value) => /^\d{10}$/.test(value);
  const validatePincode = (value) => /^\d{6}$/.test(value);

  const allValid =
    firstName.trim() &&
    lastName.trim() &&
    fatherFirst.trim() &&
    fatherLast.trim() &&
    validateAadhar(aadhar) &&
    validatePan(pan) &&
    validateMobile(mobile) &&
    doorStreet.trim() &&
    village.trim() &&
    mandal.trim() &&
    district.trim() &&
    state.trim() &&
    validatePincode(pincode);

  const handleSave = () => {
    if (!allValid) return;

    const uniqueCode = "EMP" + Date.now().toString().slice(-6);
    setEmpCode(uniqueCode);

    setTimeout(() => {
      router.push("/employee/education");
    }, 2000);
  };

  return (
    <div style={{ padding: "2rem", background: "#f0f4f8", minHeight: "100vh" }}>
      <ProgressBar currentStep={1} totalSteps={4} />
      <h1>Personal Details</h1>

      <label>Name</label><br />
      <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} style={{ marginLeft: "1rem" }} /><br /><br />

      <label>Father Name</label><br />
      <input type="text" placeholder="First Name" value={fatherFirst} onChange={(e) => setFatherFirst(e.target.value)} />
      <input type="text" placeholder="Last Name" value={fatherLast} onChange={(e) => setFatherLast(e.target.value)} style={{ marginLeft: "1rem" }} /><br /><br />

      <label>Aadhar Card</label><br />
      <input type="text" value={aadhar} onChange={(e) => setAadhar(e.target.value)} maxLength={12} style={{ borderColor: aadhar && !validateAadhar(aadhar) ? "red" : "" }} />
      <input type="file" style={{ marginLeft: "1rem" }} /><br />
      {aadhar && !validateAadhar(aadhar) && <p style={{ color: "red" }}>Aadhaar must be 12 digits only.</p>}<br />

      <label>PAN Card</label><br />
      <input type="text" value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} maxLength={10} style={{ borderColor: pan && !validatePan(pan) ? "red" : "" }} />
      <input type="file" style={{ marginLeft: "1rem" }} /><br />
      {pan && !validatePan(pan) && <p style={{ color: "red" }}>PAN must be 5 letters, 4 digits, 1 letter.</p>}<br />

      <label>Mobile No</label><br />
      <input type="text" value={mobile} onChange={(e) => setMobile(e.target.value)} maxLength={10} style={{ borderColor: mobile && !validateMobile(mobile) ? "red" : "" }} /><br />
      {mobile && !validateMobile(mobile) && <p style={{ color: "red" }}>Mobile must be 10 digits only.</p>}<br />

      <h2>Address</h2>
      <label>Door No & Street</label><br />
      <input type="text" value={doorStreet} onChange={(e) => setDoorStreet(e.target.value)} /><br /><br />

      <label>Village</label><br />
      <input type="text" value={village} onChange={(e) => setVillage(e.target.value)} /><br /><br />

      <label>Mandal</label><br />
      <input type="text" value={mandal} onChange={(e) => setMandal(e.target.value)} /><br /><br />

      <label>District</label><br />
      <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} /><br /><br />

      <label>State</label><br />
      <input type="text" value={state} onChange={(e) => setState(e.target.value)} /><br /><br />

      <label>Pincode</label><br />
      <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} maxLength={6} style={{ borderColor: pincode && !validatePincode(pincode) ? "red" : "" }} /><br />
      {pincode && !validatePincode(pincode) && <p style={{ color: "red" }}>Pincode must be 6 digits only.</p>}<br />

      <button
        onClick={handleSave}
        disabled={!allValid}
        style={{
          padding: "1rem 2rem",
          fontSize: "1.2rem",
          background: allValid ? "#4CAF50" : "#ccc",
          color: "#fff",
          cursor: allValid ? "pointer" : "not-allowed"
        }}
      >
        Save & Next
      </button>

      {empCode && (
        <p style={{ color: "green", fontWeight: "bold", marginTop: "1rem" }}>
          ✅ Your Employee Code: {empCode}
        </p>
      )}
    </div>
  );
}
