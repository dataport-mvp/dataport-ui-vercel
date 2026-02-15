import { useState } from "react";

export default function EmployerDashboard() {
  const [code, setCode] = useState("");
  const [employeeData, setEmployeeData] = useState(null);

  const api = process.env.NEXT_PUBLIC_API_URL_PROD; // ✅ points to staging domain

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
      // ✅ payload matches backend ConsentRequest model
      const payload = {
        consent_id: `consent-${Date.now()}`,   // unique ID
        employee_id: employeeData.id,          // from search result
        requestor_id: "company-b",             // employer identifier
        requested_at: Date.now()               // timestamp
      };

      const res = await fetch(`${api}/consent/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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