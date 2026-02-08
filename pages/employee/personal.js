import { useState } from "react";
import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";

export default function PersonalDetails() {
  const router = useRouter();

  // Name
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");

  // Father Name
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
  const [currentDoorStreet, setCurrentDoorStreet] = useState("");
  const [currentVillageMandal, setCurrentVillageMandal] = useState("");
  const [currentDistrictState, setCurrentDistrictState] = useState("");
  const [currentPincode, setCurrentPincode] = useState("");

  // Permanent Address
  const [permFrom, setPermFrom] = useState("");
  const [permTo, setPermTo] = useState("");
  const [permDoorStreet, setPermDoorStreet] = useState("");
  const [permVillageMandal, setPermVillageMandal] = useState("");
  const [permDistrictState, setPermDistrictState] = useState("");
  const [permPincode, setPermPincode] = useState("");

  // Validators
  const validateAadhar = (v) => /^\d{12}$/.test(v);
  const validatePan = (v) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
  const validateMobile = (v) => /^\d{10}$/.test(v);
  const validatePincode = (v) => /^\d{6}$/.test(v);
  const validatePassport = (v) => /^[A-Z0-9]{6,9}$/.test(v);

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
    validatePassport(passport) &&
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
      {/* Left */}
      <div style={{ flex: 2, marginRight: "2rem" }}>
        <ProgressBar currentStep={1} totalSteps={4} />
        <h1>Personal Details</h1>

        <h2>Name</h2>
        <input placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <input placeholder="Middle Name" value={middleName} onChange={(e) => setMiddleName(e.target.value)} style={{ marginLeft: "1rem" }} />
        <input placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} style={{ marginLeft: "1rem" }} />
        <br /><br />

        <h2>Father Name</h2>
        <input placeholder="First Name" value={fatherFirst} onChange={(e) => setFatherFirst(e.target.value)} />
        <input placeholder="Middle Name" value={fatherMiddle} onChange={(e) => setFatherMiddle(e.target.value)} style={{ marginLeft: "1rem" }} />
        <input placeholder="Last Name" value={fatherLast} onChange={(e) => setFatherLast(e.target.value)} style={{ marginLeft: "1rem" }} />
        <br /><br />

        <label>Date of Birth</label><br />
        <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} /><br /><br />

        <label>Nationality</label><br />
        <input value={nationality} onChange={(e) => setNationality(e.target.value)} /><br /><br />

        <label>Gender</label><br />
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">Select</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select><br /><br />

        <label>Mobile</label><br />
        <input value={mobile} maxLength={10}
          onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
          style={{ borderColor: mobile && !validateMobile(mobile) ? "red" : "" }} />
        <br /><br />

        <label>Aadhaar</label><br />
        <input value={aadhar} maxLength={12}
          onChange={(e) => setAadhar(e.target.value.replace(/\D/g, ""))}
          style={{ borderColor: aadhar && !validateAadhar(aadhar) ? "red" : "" }} />
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ marginLeft: "1rem" }} />
        <br /><br />

        <label>PAN</label><br />
        <input value={pan} maxLength={10}
          onChange={(e) => setPan(e.target.value.toUpperCase())}
          style={{ borderColor: pan && !validatePan(pan) ? "red" : "" }} />
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ marginLeft: "1rem" }} />
        <br /><br />

        <label>Passport</label><br />
        <input value={passport} onChange={(e) => setPassport(e.target.value.toUpperCase())} />
        <br /><br />

        <h2>Current Address</h2>
        <input type="date" value={currentFrom} onChange={(e) => setCurrentFrom(e.target.value)} />
        <input type="date" value={currentTo} onChange={(e) => setCurrentTo(e.target.value)} /><br /><br />

        <input placeholder="Door & Street" value={currentDoorStreet} onChange={(e) => setCurrentDoorStreet(e.target.value)} /><br /><br />
        <input placeholder="Village & Mandal" value={currentVillageMandal} onChange={(e) => setCurrentVillageMandal(e.target.value)} /><br /><br />
        <input placeholder="District & State" value={currentDistrictState} onChange={(e) => setCurrentDistrictState(e.target.value)} /><br /><br />
        <input placeholder="Pincode" maxLength={6}
          value={currentPincode}
          onChange={(e) => setCurrentPincode(e.target.value.replace(/\D/g, ""))} />
        <br /><br />

        <h2>Permanent Address</h2>
        <input type="date" value={permFrom} onChange={(e) => setPermFrom(e.target.value)} />
        <input type="date" value={permTo} onChange={(e) => setPermTo(e.target.value)} /><br /><br />

        <input placeholder="Door & Street" value={permDoorStreet} onChange={(e) => setPermDoorStreet(e.target.value)} /><br /><br />
        <input placeholder="Village & Mandal" value={permVillageMandal} onChange={(e) => setPermVillageMandal(e.target.value)} /><br /><br />
        <input placeholder="District & State" value={permDistrictState} onChange={(e) => setPermDistrictState(e.target.value)} /><br /><br />
        <input placeholder="Pincode" maxLength={6}
          value={permPincode}
          onChange={(e) => setPermPincode(e.target.value.replace(/\D/g, ""))} />
        <br /><br />

        <button
          onClick={handleSave}
          disabled={!allValid}
          style={{
            padding: "1rem 2rem",
            fontSize: "1.1rem",
            background: allValid ? "#4CAF50" : "#ccc",
            color: "#fff",
            cursor: allValid ? "pointer" : "not-allowed"
          }}
        >
          Save & Proceed →
        </button>
      </div>

      {/* Right */}
      <div style={{ flex: 1, textAlign: "center" }}>
        <h2>Upload Photo</h2>
        <input type="file" accept="image/*" />
      </div>
    </div>
  );
}
