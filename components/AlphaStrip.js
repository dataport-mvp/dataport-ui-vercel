// components/AlphaStrip.js
import { useRef } from "react";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/**
 * Sorts a list of items alphabetically by display name (falling back to email),
 * and returns both the sorted list and the set of letters that actually have
 * at least one entry — so the A-Z strip can grey out letters with nothing to jump to.
 *
 * getName/getEmail are accessor functions, since the two dashboards use slightly
 * different field names on their thread objects.
 */
export function sortAlpha(items, getName, getEmail) {
  const sorted = [...items].sort((a, b) => {
    const an = (getName(a) || getEmail(a) || "").toLowerCase();
    const bn = (getName(b) || getEmail(b) || "").toLowerCase();
    return an.localeCompare(bn);
  });
  const available = new Set();
  sorted.forEach(item => {
    const n = (getName(item) || getEmail(item) || "").trim();
    const letter = n ? n[0].toUpperCase() : "#";
    available.add(/[A-Z]/.test(letter) ? letter : "#");
  });
  return { sorted, available };
}

/**
 * Vertical A-Z strip. containerRef must point at the scrollable list element —
 * scrolling is done by directly setting containerRef.current.scrollTop to the
 * target letter-header's offset, so only the panel scrolls, never the whole page.
 */
export default function AlphaStrip({ available, containerRef, accentColor = "#0d6e6e" }) {
  const jumpTo = (letter) => {
    const container = containerRef.current;
    if (!container) return;
    const target = container.querySelector(`[data-letter-header="${letter}"]`);
    if (target) {
      container.scrollTop = target.offsetTop - container.offsetTop - 4;
    }
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 1, padding: "6px 3px",
      userSelect: "none",
    }}>
      {["#", ...LETTERS].map(letter => {
        const active = available.has(letter);
        return (
          <div
            key={letter}
            onClick={() => active && jumpTo(letter)}
            style={{
              fontSize: 9, fontWeight: 700, lineHeight: "13px", width: 14, textAlign: "center",
              color: active ? accentColor : "#d8d4c8",
              cursor: active ? "pointer" : "default",
              borderRadius: 3,
              transition: "background 0.12s, transform 0.12s",
            }}
            onMouseEnter={e => { if (active) { e.currentTarget.style.background = accentColor; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "scale(1.25)"; } }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = active ? accentColor : "#d8d4c8"; e.currentTarget.style.transform = "scale(1)"; }}
          >
            {letter}
          </div>
        );
      })}
    </div>
  );
}

/** Small pill-style header rendered inline in the list wherever the letter changes. */
export function AlphaHeader({ letter, accentColor = "#0d6e6e" }) {
  return (
    <div data-letter-header={letter} style={{
      padding: "5px 12px 4px", fontSize: 10.5, fontWeight: 800, color: accentColor,
      letterSpacing: 0.5, background: "inherit", position: "sticky", top: 0, zIndex: 1,
    }}>
      {letter}
    </div>
  );
}
