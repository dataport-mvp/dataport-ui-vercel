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
  const router = useRouter();

  const handleSave = () => {
    // TODO: validation logic
    router.push("/employee/education"); // go to next page
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
      <input type="text" value={aadhar} onChange={(e) => setAadhar(e.target.value)} maxLength={12} />
      <input type="file" style={{ marginLeft: "1rem" }} /><br /><br />

      <label>PAN Card</label><br />
      <input type="text" value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} maxLength={10} />
      <input type="file" style={{ marginLeft: "1rem" }} /><br /><br />

      <label>Mobile No</label><br />
      <input type="text" value={mobile} onChange={(e) => setMobile(e.target.value)} maxLength={10} /><br /><br />

      <button onClick={handleSave} style={{ padding: "1rem 2rem", fontSize: "1.2rem" }}>
        Save & Next
      </button>
    </div>
  );
}
