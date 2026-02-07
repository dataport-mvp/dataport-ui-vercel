import { useEffect, useState } from "react";

export default function ProgressBar({ currentStep, totalSteps }) {
  const stepPercent = 100 / totalSteps; // 25 if 4 steps
  const minPercent = (currentStep - 1) * stepPercent;
  const maxPercent = currentStep * stepPercent;

  const [animatedPercent, setAnimatedPercent] = useState(minPercent);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedPercent(prev => {
        let next = prev + direction;
        if (next >= maxPercent) {
          setDirection(-1);
          next = maxPercent;
        } else if (next <= minPercent) {
          setDirection(1);
          next = minPercent;
        }
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [minPercent, maxPercent, direction]);

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
          transition: "width 0.1s ease"
        }}></div>
        <span style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontWeight: "bold"
        }}>
          {Math.round(animatedPercent)}% Complete
        </span>
      </div>
    </div>
  );
}
