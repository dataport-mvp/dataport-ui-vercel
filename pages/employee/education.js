import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";

export default function Education() {
  const router = useRouter();

  const handleSave = () => {
    router.push("/employee/previous");
  };

  return (
    <div style={{ padding: "2rem", background: "#f0f4f8", minHeight: "100vh" }}>
      <ProgressBar currentStep={2} totalSteps={4} />
      <h1>Education Details</h1>

      <label>Degree</label>
      <input type="text" placeholder="Enter Degree" /><br /><br />

      <label>University</label>
      <input type="text" placeholder="Enter University" /><br /><br />

      <div style={{ marginTop: "2rem" }}>
        <button onClick={handleSave} style={{ padding: "1rem 2rem", fontSize: "1.2rem" }}>
          Save & Next
        </button>
      </div>
    </div>
  );
}
