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
  const router = useRouter();

  // Validation rules
  const validateAadhar = (value) => /^\d{12}$/.test(value);
  const validatePan = (value) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value);
  const validateMobile = (value) => /^\d{10}$/.test(value);

  const handleSave = () => {
    if (!validateAadhar(aadhar)) {
      alert("Invalid Aadhaar: must be 12 digits only.");
      return;
    }
    if (!validatePan(pan)) {
      alert("Invalid PAN: must be 5 letters, 4 digits, 1 letter.");
      return;
    }
    if (!validateMobile(mobile)) {
      alert("Invalid Mobile: must be 10 digits.");
      return;
    }

    // Generate unique employee code
    const uniqueCode = "EMP" + Date.now().toString().slice(-5);
    setEmpCode(uniqueCode);

    // Show code for user before moving on
    alert("Your Employee Code: " + uniqueCode);

    // Redirect to next page
    router.push("/employee/education");
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
      <input
        type="text"
        value={aadhar}
        onChange={(e) => setAadhar(e.target.value)}
        maxLength={12}
        style={{ borderColor: aadhar && !validateAadhar(aadhar) ? "red" : "" }}
      />
      <input type="file" style={{ marginLeft: "1rem" }} /><br /><br />

      <label>PAN Card</label><br />
      <input
        type="text"
        value={pan}
        onChange={(e) => setPan(e.target.value.toUpperCase())}
        maxLength={10}
        style={{ borderColor: pan && !validatePan(pan) ? "red" : "" }}
      />
      <input type="file" style={{ marginLeft: "1rem" }} /><br /><br />

      <label>Mobile No</label><br />
      <input
        type="text"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
        maxLength={10}
        style={{ borderColor: mobile && !validateMobile(mobile) ? "red" : "" }}
      /><br /><br />

      <button onClick={handleSave} style={{ padding: "1rem 2rem", fontSize: "1.2rem" }}>
        Save & Next
      </button>

      {empCode && <p>Your Employee Code: {empCode}</p>}
    </div>
  );
}
