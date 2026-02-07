import { useState } from "react";
import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";

export default function PersonalDetails() {
  const [aadhar, setAadhar] = useState("");
  const [pan, setPan] = useState("");
  const [mobile, setMobile] = useState("");
  const router = useRouter();

  const validateAadhar = (value) => /^\d{12}$/.test(value);
  const validatePan = (value) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value);
  const validateMobile = (value) => /^\d{10}$/.test(value);

  const handleSave = () => {
    if (validateAadhar(aadhar) && validatePan(pan) && validateMobile(mobile)) {
      router.push("/employee/education"); // go to next page
    } else {
      alert("Please fix validation errors before saving.");
    }
  };

  return (
    <div style={{ padding: "2rem", background: "#f0f4f8", minHeight: "100vh" }}>
      <ProgressBar currentStep={1} totalSteps={4} />
      <h1>Personal Details</h1>

      <label>Aadhar Card</label>
      <input
        type="text"
        value={aadhar}
        onChange={(e) => setAadhar(e.target.value)}
        maxLength={12}
      />
      <input type="file" style={{ marginLeft: "1rem" }} />

      <label>PAN Card</label>
      <input
        type="text"
        value={pan}
        onChange={(e) => setPan(e.target.value.toUpperCase())}
        maxLength={10}
      />
      <input type="file" style={{ marginLeft: "1rem" }} />

      <label>Mobile No</label>
      <input
        type="text"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
        maxLength={10}
      />

      <div style={{ marginTop: "2rem" }}>
        <button onClick={handleSave} style={{ padding: "1rem 2rem", fontSize: "1.2rem" }}>
          Save & Next
        </button>
      </div>
    </div>
  );
}
