// pages/employee/education.js — Page 2 of 4
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";
import { useAuth } from "../../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const LEVELS = ["10th", "12th", "Diploma", "Bachelor's", "Master's", "PhD", "Other"];

const EMPTY_EDU = {
  level: "",
  institution: "",
  board_or_university: "",
  year_of_passing: "",
  percentage_or_cgpa: "",
  field_of_study: "",
};

export default function EducationPage() {
  const { user, apiFetch, ready } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState([{ ...EMPTY_EDU }]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // Auth guard
  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/employee/login"); return; }
  }, [ready, user, router]);

  // Load existing draft
  useEffect(() => {
    if (!ready || !user) return;
    const load = async () => {
      try {
        const res = await apiFetch(`${API}/employee/draft`);
        if (res.ok) {
          const data = await res.json();
          if (data?.education && Array.isArray(data.education) && data.education.length > 0) {
            setEntries(data.education);
          }
        }
      } catch (_) {}
      setFetching(false);
    };
    load();
  }, [ready, user, apiFetch]);

  const set = (i, k, v) => setEntries(prev => prev.map((e, idx) => idx === i ? { ...e, [k]: v } : e));
  const addEntry = () => setEntries(prev => [...prev, { ...EMPTY_EDU }]);
  const removeEntry = i => setEntries(prev => prev.filter((_, idx) => idx !== i));

  const handleNext = async () => {
    setError("");
    const valid = entries.every(e => e.level && e.institution && e.year_of_passing);
    if (!valid) { setError("Please fill Level, Institution, and Year for each entry"); return; }

    setLoading(true);
    try {
      const employeeId = localStorage.getItem("dg_employee_id");
      const res = await apiFetch(`${API}/employee`, {
        method: "POST",
        body: JSON.stringify({ employee_id: employeeId, education: entries, step: "education" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Save failed"); return; }
      router.push("/employee/previous");
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  if (!ready || !user) return null;
  if (fetching) return <div style={styles.loading}>Loading…</div>;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.logo}>Datagate</div>
        </div>
        <ProgressBar currentStep={2} totalSteps={4} />

        <div style={styles.card}>
          <h2 style={styles.title}>Education</h2>
          <p style={styles.sub}>Add your educational qualifications</p>

          {entries.map((edu, i) => (
            <div key={i} style={styles.entryBlock}>
              <div style={styles.entryHeader}>
                <span style={styles.entryLabel}>Qualification {i + 1}</span>
                {entries.length > 1 && (
                  <button style={styles.removeBtn} onClick={() => removeEntry(i)}>Remove</button>
                )}
              </div>

              <div style={styles.grid2}>
                <Field label="Level *" as="select" value={edu.level} onChange={v => set(i, "level", v)}
                  options={["", ...LEVELS]} />
                <Field label="Year of Passing *" type="number" value={edu.year_of_passing}
                  onChange={v => set(i, "year_of_passing", v)} placeholder="2020" />
              </div>
              <Field label="Institution *" value={edu.institution}
                onChange={v => set(i, "institution", v)} placeholder="College / School name" />
              <Field label="Board / University" value={edu.board_or_university}
                onChange={v => set(i, "board_or_university", v)} placeholder="e.g. CBSE, Anna University" />
              <div style={styles.grid2}>
                <Field label="Field of Study" value={edu.field_of_study}
                  onChange={v => set(i, "field_of_study", v)} placeholder="e.g. Computer Science" />
                <Field label="Percentage / CGPA" value={edu.percentage_or_cgpa}
                  onChange={v => set(i, "percentage_or_cgpa", v)} placeholder="e.g. 85% or 8.5" />
              </div>
            </div>
          ))}

          <button style={styles.addBtn} onClick={addEntry}>+ Add another qualification</button>

          {error && <p style={styles.error}>{error}</p>}

          <div style={styles.actions}>
            <button style={styles.btnSecondary} onClick={() => router.push("/employee/personal")}>← Back</button>
            <button style={styles.btnPrimary} onClick={handleNext} disabled={loading}>
              {loading ? "Saving…" : "Next: Employment →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", as, options, placeholder }) {
  const inputStyle = {
    width: "100%", padding: "0.7rem 0.9rem", border: "1.5px solid #e2e8f0",
    borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{label}</label>
      {as === "select" ? (
        <select style={inputStyle} value={value} onChange={e => onChange(e.target.value)}>
          {options.map(o => <option key={o} value={o}>{o || "Select…"}</option>)}
        </select>
      ) : (
        <input style={inputStyle} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: 640, margin: "0 auto", padding: "1.5rem 1rem" },
  header: { display: "flex", alignItems: "center", marginBottom: 8 },
  logo: { fontSize: 20, fontWeight: 800, color: "#2563eb" },
  loading: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontSize: 15, color: "#64748b" },
  card: { background: "#fff", borderRadius: 16, padding: "2rem", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: "1rem" },
  title: { fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 },
  sub: { fontSize: 14, color: "#64748b", margin: 0 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  entryBlock: { border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" },
  entryHeader: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  entryLabel: { fontWeight: 700, fontSize: 14, color: "#1e293b" },
  removeBtn: { background: "none", border: "none", color: "#ef4444", fontSize: 13, cursor: "pointer", fontWeight: 600 },
  addBtn: { background: "none", border: "1.5px dashed #cbd5e1", color: "#2563eb", padding: "0.65rem", borderRadius: 8, fontSize: 14, cursor: "pointer", fontWeight: 600 },
  error: { color: "#ef4444", fontSize: 13, margin: 0 },
  actions: { display: "flex", justifyContent: "space-between", marginTop: 8 },
  btnPrimary: { padding: "0.8rem 2rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" },
  btnSecondary: { padding: "0.8rem 1.5rem", background: "#f1f5f9", color: "#374151", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" },
};
