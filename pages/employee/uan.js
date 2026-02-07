import ProgressBar from "../../components/ProgressBar";

export default function UAN() {
  const handleSave = () => {
    alert("All forms completed successfully!");
  };

  return (
    <div style={{ padding: "2rem", background: "#f0f4f8", minHeight: "100vh" }}>
      <ProgressBar currentStep={4} totalSteps={4} />
      <h1>UAN Details</h1>

      <label>UAN Number</label>
      <input type="text" placeholder="Enter UAN" /><br /><br />

      <label>PF Number</label>
      <input type="text" placeholder="Enter PF Number" /><br /><br />

      <div style={{ marginTop: "2rem" }}>
        <button onClick={handleSave} style={{ padding: "1rem 2rem", fontSize: "1.2rem" }}>
          Final Save
        </button>
      </div>
    </div>
  );
}
