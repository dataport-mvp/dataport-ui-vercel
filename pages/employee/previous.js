import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";

export default function PreviousCompany() {
  const router = useRouter();

  const handleSave = () => {
    router.push("/employee/uan");
  };

  return (
    <div style={{ padding: "2rem", background: "#f0f4f8", minHeight: "100vh" }}>
      <ProgressBar currentStep={3} totalSteps={4} />
      <h1>Previous Company Details</h1>

      <label>Company Name</label>
      <input type="text" placeholder="Enter Company Name" /><br /><br />

      <label>Start Date</label>
      <input type="date" /><br /><br />

      <label>End Date</label>
      <input type="date" /><br /><br />

      <div style={{ marginTop: "2rem" }}>
        <button onClick={handleSave} style={{ padding: "1rem 2rem", fontSize: "1.2rem" }}>
          Save & Next
        </button>
      </div>
    </div>
  );
}
