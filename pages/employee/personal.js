import { useState } from "react";

export default function PersonalDetails() {
  const [aadhar, setAadhar] = useState("");
  const [pan, setPan] = useState("");
  const [mobile, setMobile] = useState("");
  const [empCode, setEmpCode] = useState("");

  const validateAadhar = (value) => /^\d{12}$/.test(value);
  const validatePan = (value) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value);
  const validateMobile = (value) => /^\d{10}$/.test(value);

  const handleSave = () => {
    if (validateAadhar(aadhar) && validatePan(pan) && validateMobile(mobile)) {
      const code = "EMP" + mobile.slice(-5); // Example unique code logic
      setEmpCode(code);
      alert(`Profile saved! Your Employee Code is ${code}`);
    } else {
      alert("Please fix validation errors before saving.");
    }
  };

  return (
    <div style={{
      padding: "2rem",
      background: "linear-gradient(to right, #f0f4f8, #d9e4ec)",
      minHeight: "100vh"
    }}>
      <h1>Personal Details</h1>

      {/* Name */}
      <label>Name</label>
      <div>
        <input type="text" placeholder="First Name" />
        <input type="text" placeholder="Last Name" style={{ marginLeft: "1rem" }} />
      </div>

      {/* Father Name */}
      <label>Father Name</label>
      <div>
        <input type="text" placeholder="First Name" />
        <input type="text" placeholder="Last Name" style={{ marginLeft: "1rem" }} />
      </div>

      {/* Aadhaar */}
      <label>Aadhar Card</label>
      <div>
        <input
          type="text"
          value={aadhar}
          onChange={(e) => setAadhar(e.target.value)}
          maxLength={12}
          style={{ borderColor: aadhar && !validateAadhar(aadhar) ? "red" : "" }}
          disabled={validateAadhar(aadhar)}
        />
        <input type="file" style={{ marginLeft: "1rem" }} />
      </div>

      {/* PAN */}
      <label>PAN Card</label>
      <div>
        <input
          type="text"
          value={pan}
          onChange={(e) => setPan(e.target.value.toUpperCase())}
          maxLength={10}
          style={{ borderColor: pan && !validatePan(pan) ? "red" : "" }}
        />
        <input type="file" style={{ marginLeft: "1rem" }} />
      </div>

      {/* Mobile */}
      <label>Mobile No</label>
      <input
        type="text"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
        maxLength={10}
        style={{ borderColor: mobile && !validateMobile(mobile) ? "red" : "" }}
      />

      {/* Save Button */}
      <div style={{ marginTop: "2rem" }}>
        <button onClick={handleSave} style={{ padding: "1rem 2rem", fontSize: "1.2rem" }}>
          Save
        </button>
      </div>

      {/* Show Employee Code */}
      {empCode && (
        <p style={{ marginTop: "1rem", fontWeight: "bold" }}>
          Your Employee Code: {empCode}
        </p>
      )}
    </div>
  );
}
