import { useRouter } from "next/router";
import { useState } from "react";
import ProgressBar from "../../components/ProgressBar";

export default function EducationDetails() {
  const router = useRouter();

  // Minimal state for MVP (can expand later)
  const [loading, setLoading] = useState(false);

  const handleSaveAndNext = async () => {
    setLoading(true);

    // TODO: API call later (FastAPI)
    // await fetch("/api/education", { method: "POST", body: ... })

    setTimeout(() => {
      setLoading(false);
      router.push("/employee/previous");
    }, 500);
  };

  return (
    <div style={{ background: "#f1f5f9", minHeight: "100vh", padding: "2rem" }}>
      <ProgressBar currentStep={2} totalSteps={4} />

      <div
        style={{
          maxWidth: "960px",
          margin: "2rem auto",
          background: "#ffffff",
          borderRadius: "14px",
          padding: "2rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)"
        }}
      >
        <h1 style={{ marginBottom: "1.5rem" }}>Education Details</h1>

        {/* ========= CLASS X ========= */}
        <h2>Class X</h2>
        <input placeholder="School Name" /><br /><br />
        <input placeholder="Board Name" /><br /><br />
        <input placeholder="Hall Ticket / Roll Number" /><br /><br />
        <input type="file" /><br /><br />

        {/* ========= INTERMEDIATE ========= */}
        <h2>Intermediate</h2>
        <input placeholder="College Name" /><br /><br />
        <input placeholder="Board Name" /><br /><br />
        <input placeholder="Hall Ticket / Roll Number" /><br /><br />
        <input type="file" /><br /><br />

        {/* ========= UG ========= */}
        <h2>Undergraduate (UG)</h2>
        <input placeholder="College Name" /><br /><br />
        <input placeholder="University Name" /><br /><br />
        <input placeholder="Course / Degree" /><br /><br />
        <input type="file" /><br /><br />

        {/* ========= PG ========= */}
        <h2>Postgraduate (PG) (Optional)</h2>
        <input placeholder="College Name" /><br /><br />
        <input placeholder="University Name" /><br /><br />
        <input placeholder="Course / Degree" /><br /><br />
        <input type="file" /><br /><br />

        {/* ========= NAVIGATION ========= */}
        <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
          <button
            onClick={() => router.push("/employee/personal")}
            style={{
              padding: "0.8rem 1.5rem",
              background: "#e5e7eb",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            ⬅ Previous
          </button>

          <button
            onClick={handleSaveAndNext}
            disabled={loading}
            style={{
              padding: "0.8rem 1.5rem",
              background: loading ? "#cbd5e1" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Saving..." : "Save & Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

