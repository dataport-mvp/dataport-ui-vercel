import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";

export default function EducationDetails() {
  const router = useRouter();

  return (
    <div style={{ padding: "2rem", background: "#f0f4f8", minHeight: "100vh" }}>
      <ProgressBar currentStep={2} totalSteps={4} />
      <h1>Education Details</h1>

      <h2>Class X</h2>
      <input type="text" placeholder="School Name" /><br />
      <input type="text" placeholder="Board Name" /><br />
      <input type="file" /><br /><br />

      <h2>Intermediate</h2>
      <input type="text" placeholder="College Name" /><br />
      <input type="text" placeholder="Board Name" /><br />
      <input type="file" /><br /><br />

      <h2>UG</h2>
      <input type="text" placeholder="College Name" /><br />
      <input type="text" placeholder="Board Name" /><br />
      <input type="file" /><br /><br />

      <h2>PG</h2>
      <input type="text" placeholder="College Name" /><br />
      <input type="text" placeholder="Board Name" /><br />
      <input type="file" /><br /><br />

      {/* Navigation */}
      <button onClick={() => router.push("/employee/personal")} style={{ marginRight: "1rem" }}>
        ⬅ Back
      </button>
      <button onClick={() => router.push("/employee/previous")}>
        Next ➡
      </button>
    </div>
  );
}
