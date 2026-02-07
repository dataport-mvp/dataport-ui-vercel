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
  const [errors, setErrors] = useState({});
  const router = useRouter();

  // Validation rules
  const validateAadhar = (value) => /^\d{12}$/.test(value);
  const validatePan = (value) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value);
  const validateMobile = (value) => /^\d{10}$/.test(value);

  const handleSave = () => {
    const newErrors = {};

    if (!validateAadhar(aadhar)) {
      newErrors.aadhar = "Aadhaar must be 12 digits only.";
    }
    if (!validatePan(pan)) {
      newErrors.pan = "PAN must be 5 letters, 4 digits, 1 letter.";
    }
    if (!validateMobile(mobile)) {
      newErrors.mobile = "Mobile must be 10 digits only.";
    }

    setErrors(newErrors);

    // Stop if errors exist
    if (Object.keys(newErrors).length > 0) return;

    // Generate unique employee code
    const uniqueCode = "EMP" + Date.now().toString().slice(-5);
    setEmpCode(uniqueCode);

    // After showing code, move to next page
    setTimeout(() => {
      router.push("/employee/education");
    }, 2000); // wait 2 seconds so user sees code
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
        style={{ borderColor: errors.aadhar ? "red" : "" }}
      />
      <input type="file" style={{ marginLeft: "1rem" }} /><br />
      {errors.aadhar && <p style={{ color: "red" }}>{errors.aadhar}</p>}<br />

      <label>PAN Card</label><br />
      <input
        type="text"
        value={pan}
        onChange={(e) => setPan(e.target.value.toUpperCase())}
        maxLength={10}
        style={{ borderColor: errors.pan ? "red" : "" }}
      />
      <input type="file" style={{ marginLeft: "1rem" }} /><br />
      {errors.pan && <p style={{ color: "red" }}>{errors.pan}</p>}<br />

      <label>Mobile No</label><br />
      <input
        type="text"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
        maxLength={10}
        style={{ borderColor: errors.mobile ? "red" : "" }}
      /><br />
      {errors.mobile && <p style={{ color: "red" }}>{errors.mobile}</p>}<br />

      <button onClick={handleSave} style={{ padding: "1rem 2rem", fontSize: "1.2rem" }}>
        Save & Next
      </button>

      {empCode && (
        <p style={{ color: "green", fontWeight: "bold", marginTop: "1rem" }}>
          Your Employee Code: {empCode}
        </p>
      )}
    </div>
  );
}
