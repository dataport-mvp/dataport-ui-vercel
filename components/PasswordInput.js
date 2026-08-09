// components/PasswordInput.js
import { useState } from "react";

const Eye = ({ open }) => open ? (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
) : (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
);

/**
 * Drop-in replacement for <input type="password">, with a built-in show/hide
 * eye toggle. Manages its own visibility state internally, so callers don't
 * need any extra useState — just swap the input tag for this component.
 *
 * Usage: <PasswordInput value={pw} onChange={e=>setPw(e.target.value)}
 *          placeholder="..." style={{...}} className="..." onKeyDown={...} />
 *
 * inputStyle / wrapperStyle let callers fine-tune either layer if the
 * surrounding page has specific styling needs.
 */
export default function PasswordInput({
  value, onChange, placeholder, onKeyDown, className, style, inputStyle, wrapperStyle, autoFocus, id, name,
}) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative", width: "100%", ...wrapperStyle }}>
      <input
        id={id}
        name={name}
        className={className}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{ width: "100%", boxSizing: "border-box", paddingRight: 40, ...style, ...inputStyle }}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow(v => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        style={{
          position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
          background: "none", border: "none", padding: 4, cursor: "pointer",
          color: "#94a3b8", display: "flex", alignItems: "center",
        }}
      >
        <Eye open={show} />
      </button>
    </div>
  );
}
