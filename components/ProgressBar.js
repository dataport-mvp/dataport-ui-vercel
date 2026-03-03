// components/ProgressBar.js — replaced with real step indicator
export default function ProgressBar({ currentStep, totalSteps }) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  const labels = ["Personal", "Education", "Employment", "UAN & PF"];

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem 2rem",
      gap: 0,
    }}>
      {steps.map((step, i) => {
        const done = step < currentStep;
        const active = step === currentStep;
        return (
          <div key={step} style={{ display: "flex", alignItems: "center" }}>
            {/* Connector line before */}
            {i > 0 && (
              <div style={{
                width: 48,
                height: 2,
                background: done || active ? "#2563eb" : "#e2e8f0",
                transition: "background 0.3s",
              }} />
            )}
            {/* Circle + label */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
                border: `2px solid ${done || active ? "#2563eb" : "#cbd5e1"}`,
                background: done ? "#2563eb" : active ? "#eff6ff" : "#fff",
                color: done ? "#fff" : active ? "#2563eb" : "#94a3b8",
                transition: "all 0.3s",
              }}>
                {done ? "✓" : step}
              </div>
              <span style={{
                fontSize: 11,
                fontWeight: active ? 600 : 400,
                color: active ? "#2563eb" : done ? "#475569" : "#94a3b8",
                whiteSpace: "nowrap",
              }}>
                {labels[i] || `Step ${step}`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
