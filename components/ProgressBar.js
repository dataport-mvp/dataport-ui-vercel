export default function ProgressBar({ currentStep, totalSteps }) {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div style={{ textAlign: "center", margin: "2rem 0" }}>
      <div style={{
        width: "300px",
        height: "40px",
        border: "2px solid #333",
        borderRadius: "8px",
        margin: "0 auto",
        position: "relative",
        background: "#eee"
      }}>
        <div style={{
          width: `${percentage}%`,
          height: "100%",
          background: percentage === 100 ? "green" : "blue",
          borderRadius: "6px",
          transition: "width 0.3s ease"
        }}></div>
        <span style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontWeight: "bold"
        }}>
          {percentage}% Complete
        </span>
      </div>
    </div>
  );
}
