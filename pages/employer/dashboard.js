import { useState } from "react";

export default function EmployerDashboard() {
  const [code, setCode] = useState("");
  const [employeeData, setEmployeeData] = useState(null);

  const api = process.env.NEXT_PUBLIC_API_URL_PROD; // ✅ single line added

  const handleSearch = async () => {
    try {
      const res = await fetch(`${api}/employer/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setEmployeeData(data);
    } catch (err) {
      console.error("Error fetching employee data:", err);
      alert("Failed to fetch employee data");
    }
  };

  const handleConsent = async () => {
    try {
      const res = await fetch(`${api}/employer/consent-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: employeeData.id }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      alert("Consent requested successfully!");
      console.log("Consent response:", data);
    } catch (err) {
      console.error("Error requesting consent:", err);
      alert("Failed to request consent");
    }
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