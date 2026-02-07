import { useState } from "react";

export default function EmployerDashboard() {
  const [code, setCode] = useState("");
  const [employeeData, setEmployeeData] = useState(null);

  const handleSearch = () => {
    // For now, just mock data
    setEmployeeData({
      id: "EMP123",
      personal: { name: "John Doe", mobile: "9876543210" },
      education: { degree: "B.Tech" },
      previous: { company: "ABC Corp" },
      uan: { uan: "1234567890" }
    });
  };

  const handleConsent = () => {
    alert("Consent requested. Employee will be notified.");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Employer Dashboard</h1>
      <input
        type="text"
        placeholder="Enter unique code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      {employeeData && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Employee ID: {employeeData.id}</h2>
          <button onClick={handleConsent}>Consent</button>
          <pre>{JSON.stringify(employeeData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
