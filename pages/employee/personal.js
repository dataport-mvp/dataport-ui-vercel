import { useState } from "react";

export default function PersonalDetails() {
  const [name, setName] = useState("");
  const [father, setFather] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [pan, setPan] = useState("");
  const [mobile, setMobile] = useState("");
  const [code, setCode] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    const uniqueCode =
      name.substring(0, 4).toUpperCase() + mobile.slice(-5);
    setCode(uniqueCode);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Personal Details</h1>
      <form onSubmit={handleSave}>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} /><br/>
        <input type="text" placeholder="Father Name" value={father} onChange={(e) => setFather(e.target.value)} /><br/>
        <input type="text" placeholder="Aadhar Card" value={aadhar} onChange={(e) => setAadhar(e.target.value)} /><br/>
        <input type="text" placeholder="PAN Card" value={pan} onChange={(e) => setPan(e.target.value)} /><br/>
        <input type="text" placeholder="Mobile No" value={mobile} onChange={(e) => setMobile(e.target.value)} /><br/>
        <button type="submit">Save</button>
      </form>
      {code && (
        <div style={{ marginTop: "1rem" }}>
          <strong>Your Unique Code:</strong> {code}
        </div>
      )}
    </div>
  );
}
