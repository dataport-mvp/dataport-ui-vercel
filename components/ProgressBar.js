import { useEffect, useState } from "react";

export default function ProgressBar({ currentStep, totalSteps }) {
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const targetPercent = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 1;
      if (progress <= targetPercent) {
        setAnimatedPercent(progress);
      } else {
        clearInterval(interval);
      }
    }, 30); // speed of animation
    return () => clearInterval(interval);
  }, [targetPercent]);

  return (
    <div style={{ textAlign: "center", margin: "2rem 0" }}>
      <div style={{
        width: "300px",
        height: "60px",
        border: "3px solid #333",
        borderRadius: "8px",
        margin: "0 auto",
        position: "relative",
        background: "#eee",
        overflow: "hidden"
      }}>
        <div style={{
          width: `${animatedPercent}%`,
          height: "100%",
          background: "linear-gradient(90deg, #00ff00, #009900)",
          animation: "pulse 1s infinite alternate"
        }}></div>
        <span style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontWeight: "bold"
        }}>
          {animatedPercent}% Complete
        </span>
      </div>
      <style jsx>{`
        @keyframes pulse {
          from { opacity: 0.7; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
