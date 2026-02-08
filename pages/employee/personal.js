Right — the errors you saw were because the file wasn’t actually JavaScript/JSX code at the top. It started with my explanatory text (“You’re right, Manoj…”) instead of valid imports. That’s why Turbopack flagged `Unexpected character '’'` on line 1.  

To fix this permanently, you need a **clean file that contains only valid React/Next.js code**. Here’s the **full corrected `personal.js`** with all sections complete, including the Permanent Address and the Save & Proceed button at the bottom:

---

## 📂 `pages/employee/personal.js`

```javascript
import { useState } from "react";
import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";

export default function PersonalDetails() {
  const router = useRouter();

  // State for fields
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fatherFirst, setFatherFirst] = useState("");
  const [fatherMiddle, setFatherMiddle] = useState("");
  const [fatherLast, setFatherLast] = useState("");
  const [dob, setDob] = useState("");
  const [nationality, setNationality] = useState("");
  const [gender, setGender] = useState("");
  const [mobile, setMobile] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [pan, setPan] = useState("");
  const [passport, setPassport] = useState("");

  // Current address
  const [currentFrom, setCurrentFrom] = useState("");
  const [currentTo, setCurrentTo] = useState("");
  const [currentDoorStreet, setCurrentDoorStreet] = useState("");
  const [currentVillageMandal, setCurrentVillageMandal] = useState("");
  const [currentDistrictState, setCurrentDistrictState] = useState("");
  const [currentPincode, setCurrentPincode] = useState("");

  // Permanent address
  const [permFrom, setPermFrom] = useState("");
  const [permTo, setPermTo] = useState("");
  const [permDoorStreet, setPermDoorStreet] = useState("");
  const [permVillageMandal, setPermVillageMandal] = useState("");
  const [permDistrictState, setPermDistrictState] = useState("");
  const [permPincode, setPermPincode] = useState("");

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
    dob &&
    nationality.trim() &&
    gender &&
    validateMobile(mobile) &&
    validateAadhar(aadhar) &&
    validatePan(pan) &&
    passport.trim() &&
    currentDoorStreet.trim() &&
    currentVillageMandal.trim() &&
    currentDistrictState.trim() &&
    validatePincode(currentPincode) &&
    permDoorStreet.trim() &&
    permVillageMandal.trim() &&
    permDistrictState.trim() &&
    validatePincode(permPincode);

  const handleSave = () => {
    if (!allValid) return;
    router.push("/employee/education");
  };

  return (
    <div style={{ display: "flex", padding: "2rem", background: "#f9fafc", minHeight: "100vh" }}>
      {/* Left Section */}
      <div style={{ flex: 2, marginRight: "2rem" }}>
        <ProgressBar currentStep={1} totalSteps={4} />
        <h1 style={{ marginBottom: "1rem" }}>Personal Details</h1>

        {/* Name */}
        <h2>Name</h2>
        <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <input type="text" placeholder="Middle Name" value={middleName} onChange={(e) => setMiddleName(e.target.value)} style={{ marginLeft: "1rem" }} />
        <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} style={{ marginLeft: "1rem" }} /><br /><br />

        {/* Father Name */}
        <h2>Father Name</h2>
        <input type="text" placeholder="First Name" value={fatherFirst} onChange={(e) => setFatherFirst(e.target.value)} />
        <input type="text" placeholder="Middle Name" value={fatherMiddle} onChange={(e) => setFatherMiddle(e.target.value)} style={{ marginLeft: "1rem" }} />
        <input type="text" placeholder="Last Name" value={fatherLast} onChange={(e) => setFatherLast(e.target.value)} style={{ marginLeft: "1rem" }} /><br /><br />

        {/* Other personal details */}
        <label>Date of Birth</label><br />
        <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} /><br /><br />

        <label>Nationality</label><br />
        <input type="text" value={nationality} onChange={(e) => setNationality(e.target.value)} /><br /><br />

        <label>Gender</label><br />
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Rather not to say</option>
        </select><br /><br />

        <label>Mobile No</label><br />
        <input type="text" value={mobile} onChange={(e) => setMobile(e.target.value)} maxLength={10} style={{ borderColor: mobile && !validateMobile(mobile) ? "red" : "" }} /><br />
        {mobile && !validateMobile(mobile) && <p style={{ color: "red" }}>Mobile must be 10 digits only.</p>}<br />

        <label>Aadhar Card</label><br />
        <input type="text" value={aadhar} onChange={(e) => setAadhar(e.target.value)} maxLength={12} style={{ borderColor: aadhar && !validateAadhar(aadhar) ? "red" : "" }} />
        <input type="file" style={{ marginLeft: "1rem" }} /><br />
        {aadhar && !validateAadhar(aadhar) && <p style={{ color: "red" }}>Aadhaar must be 12 digits only.</p>}<br />

        <label>PAN Card</label><br />
        <input type="text" value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} maxLength={10} style={{ borderColor: pan && !validatePan(pan) ? "red" : "" }} />
        <input type="file" style={{ marginLeft: "1rem" }} /><br />
        {pan && !validatePan(pan) && <p style={{ color: "red" }}>PAN must be 5 letters, 4 digits, 1 letter.</p>}<br />

        <label>Passport No</label><br />
        <input type="text" value={passport} onChange={(e) => setPassport(e.target.value)} /><br /><br />

        {/* Current Address */}
        <h2>Current Address</h2>
        <label>Residing From</label><br />
        <input type="date" value={currentFrom} onChange={(e) => setCurrentFrom(e.target.value)} /><br />
        <label>Residing To</label><br />
        <input type="date" value={currentTo} onChange={(e) => setCurrentTo(e.target.value)} /><br /><br />

        <input type="text" placeholder="Door No & Street" value={currentDoorStreet} onChange={(e) => setCurrentDoorStreet(e.target.value)} /><br /><br />
        <input type="text" placeholder="Village & Mandal" value={currentVillageMandal} onChange={(e) => setCurrentVillageMandal(e.target.value)} /><br /><br />
        <input type="text" placeholder="District & State" value={currentDistrictState} onChange={(e) => setCurrentDistrictState(e.target.value)} /><br /><br />
        <input type="text" placeholder="Pincode" value={currentPincode} onChange={(e) => setCurrentPincode(e.target.value)} maxLength={6} style={{ borderColor: currentPincode && !validatePincode(currentPincode) ? "red" : "" }} /><br />
        {currentPincode && !validatePincode(currentPincode) && <p style={{ color: "red" }}>Pincode must be 6 digits only.</p>}<br />

        {/* Permanent Address */}
        <h2>Permanent Address</h2>
        <label>Residing From</label><br />
       
