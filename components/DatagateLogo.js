// components/DatagateLogo.js
// Animated shield+gate logo with pulsing live dot
// Props: size ("sm"|"md"|"lg"), variant ("dark"|"light"|"color"), showWordmark (bool)

export default function DatagateLogo({ size = "md", variant = "dark", showWordmark = true }) {
  const scales = { sm: 0.55, md: 0.78, lg: 1 };
  const sc = scales[size] || 0.78;

  // Shield fill and gate cutout colors
  const shieldFill  = variant === "light" ? "#ffffff" : "#1a1a1a";
  const gateFill    = variant === "light" ? "#1a1a1a" : "#ffffff";
  const wordColor   = variant === "light" ? "#ffffff" : "#1a1a1a";
  const subColor    = variant === "light" ? "rgba(255,255,255,0.5)" : "#888";

  const W = 42 * sc;
  const H = 58 * sc;
  const totalW = showWordmark ? W + 100 * sc : W;

  const css = `
    @keyframes dg-pulse {
      0%   { r: 5px; opacity: 0.7; }
      100% { r: 15px; opacity: 0; }
    }
    @keyframes dg-dot {
      0%, 100% { r: 4px; }
      50%       { r: 3px; }
    }
    @keyframes dg-particle {
      0%         { transform: translateY(0px);  opacity: 0; }
      15%        { opacity: 1; }
      85%        { opacity: 1; }
      100%       { transform: translateY(28px); opacity: 0; }
    }
    .dg-pulse-ring { animation: dg-pulse 1.8s ease-out infinite; }
    .dg-dot        { animation: dg-dot 1.8s ease-in-out infinite; }
    .dg-p1         { animation: dg-particle 2.2s ease-in-out infinite; }
    .dg-p2         { animation: dg-particle 2.2s ease-in-out infinite 0.73s; }
    .dg-p3         { animation: dg-particle 2.2s ease-in-out infinite 1.46s; }
  `;

  return (
    <svg
      width={totalW}
      height={H}
      viewBox={`0 0 ${showWordmark ? 42 + 108 : 42} 58`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", flexShrink: 0 }}
    >
      <defs>
        <style>{css}</style>
      </defs>

      {/* Shield body */}
      <path
        d="M21 2 L40 10 L40 34 Q40 52 21 60 Q2 52 2 34 L2 10 Z"
        fill={shieldFill}
      />

      {/* Gate — left pillar */}
      <rect x="11" y="26" width="6" height="20" rx="2" fill={gateFill} />
      {/* Gate — right pillar */}
      <rect x="25" y="26" width="6" height="20" rx="2" fill={gateFill} />
      {/* Gate — arch */}
      <path
        d="M14 26 Q21 16 28 26"
        fill="none"
        stroke={gateFill}
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Data particles falling through gate */}
      <circle cx="21" cy="18" r="2.5" fill="#16a34a" opacity="0" className="dg-p1" />
      <circle cx="21" cy="18" r="2.5" fill="#16a34a" opacity="0" className="dg-p2" />
      <circle cx="21" cy="18" r="2.5" fill="#16a34a" opacity="0" className="dg-p3" />

      {/* Live dot */}
      <circle cx="33" cy="10" r="4" fill="#16a34a" className="dg-dot" />
      <circle cx="33" cy="10" r="5" stroke="#16a34a" strokeWidth="1.5" fill="none" className="dg-pulse-ring" />

      {/* Wordmark */}
      {showWordmark && (
        <>
          <text
            x="48"
            y="34"
            fontFamily="'DM Sans', sans-serif"
            fontSize="18"
            fontWeight="700"
            fill={wordColor}
            letterSpacing="-0.3"
          >
            Datagate
          </text>
          <text
            x="49"
            y="46"
            fontFamily="'DM Sans', sans-serif"
            fontSize="8"
            fontWeight="600"
            fill={subColor}
            letterSpacing="1.2"
          >
            VERIFIED EMPLOYMENT
          </text>
        </>
      )}
    </svg>
  );
}