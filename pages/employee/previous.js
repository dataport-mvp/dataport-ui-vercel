// pages/employee/previous.js — Page 3 of 4
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";
import { useAuth } from "../../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const EMPTY_JOB = {
  company_name: "",
  designation: "",
  start_date: "",
  end_date: "",
  is_current: false,
  location: "",
  employment_type: "",
  reason_for_leaving: "",
};

const EMP_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"];

export default function PreviousPage() {
  const { user, apiFetch, ready } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState([{ ...EMPTY_JOB }]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // Auth guard
  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/employee/login"); return; }
  }, [ready, user, router]);

  // Load existing employment history
  useEffect(() => {
    if (!ready || !user) return;
    const load = async () => {
      try {
        const employeeId = localStorage.getItem("dg_employee_id");
        if (!employeeId) { setFetching(false); return; }
        const res = await apiFetch(`${API}/employee/employment-history/${employeeId}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) setJobs(data);
        }
      } catch (_) {}
      setFetching(false);
    };
    load();
  }, [ready, user, apiFetch]);

  const set = (i, k, v) => setJobs(prev => prev.map((j, idx) => idx === i ? { ...j, [k]: v } : j));
  const addJob = () => setJobs(prev => [...prev, { ...EMPTY_JOB }]);
  const removeJob = i => setJobs(prev => prev.filter((_, idx) => idx !== i));

  const handleNext = async () => {
    setError("");
    const valid = jobs.every(j => j.company_name && j.designation && j.start_date);
    if (!valid) { setError("Please fill Company, Designation, and Start Date for each entry"); return; }

    setLoading(true);
    try {
      const employeeId = localStorage.getItem("dg_employee_id");
      const res = await apiFetch(`${API}/employee/employment-history`, {
        method: "POST",
        body: JSON.stringify({ employee_id: employeeId, employment_history: jobs }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Save failed"); return; }
      router.push("/employee/uan");
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
        <ProgressBar currentStep={3} totalSteps={4} />

        <div style={styles.card}>
          <h2 style={styles.title}>Employment History</h2>
          <p style={styles.sub}>Add your previous and current employers</p>

          {jobs.map((job, i) => (
            <div key={i} style={styles.entryBlock}>
              <div style={styles.entryHeader}>
                <span style={styles.entryLabel}>Job {i + 1}</span>
                {jobs.length > 1 && (
                  <button style={styles.removeBtn} onClick={() => removeJob(i)}>Remove</button>
                )}
              </div>

              <div style={styles.grid2}>
                <Field label="Company Name *" value={job.company_name} onChange={v => set(i, "company_name", v)} />
                <Field label="Designation *" value={job.designation} onChange={v => set(i, "designation", v)} />
              </div>
              <div style={styles.grid2}>
                <Field label="Employment Type" as="select" value={job.employment_type}
                  onChange={v => set(i, "employment_type", v)} options={["", ...EMP_TYPES]} />
                <Field label="Location" value={job.location} onChange={v => set(i, "location", v)} />
              </div>
              <div style={styles.grid2}>
                <Field label="Start Date *" type="date" value={job.start_date} onChange={v => set(i, "start_date", v)} />
                {!job.is_current && (
                  <Field label="End Date" type="date" value={job.end_date} onChange={v => set(i, "end_date", v)} />
                )}
              </div>

              <label style={styles.checkLabel}>
                <input type="checkbox" checked={job.is_current}
                  onChange={e => set(i, "is_current", e.target.checked)} />
                <span>Currently working here</span>
              </label>

              {!job.is_current && (
                <Field label="Reason for Leaving" as="textarea" value={job.reason_for_leaving}
                  onChange={v => set(i, "reason_for_leaving", v)} rows={2} />
              )}
            </div>
          ))}

          <button style={styles.addBtn} onClick={addJob}>+ Add another job</button>

          {error && <p style={styles.error}>{error}</p>}

          <div style={styles.actions}>
            <button style={styles.btnSecondary} onClick={() => router.push("/employee/education")}>← Back</button>
            <button style={styles.btnPrimary} onClick={handleNext} disabled={loading}>
              {loading ? "Saving…" : "Next: UAN & PF →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", as, options, placeholder, rows }) {
  const inputStyle = {
    width: "100%", padding: "0.7rem 0.9rem", border: "1.5px solid #e2e8f0",
    borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
    resize: as === "textarea" ? "vertical" : undefined,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{label}</label>
      {as === "select" ? (
        <select style={inputStyle} value={value} onChange={e => onChange(e.target.value)}>
          {options.map(o => <option key={o} value={o}>{o || "Select…"}</option>)}
        </select>
      ) : as === "textarea" ? (
        <textarea style={inputStyle} value={value} onChange={e => onChange(e.target.value)} rows={rows || 3} placeholder={placeholder} />
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
  checkLabel: { display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#374151", cursor: "pointer" },
  error: { color: "#ef4444", fontSize: 13, margin: 0 },
  actions: { display: "flex", justifyContent: "space-between", marginTop: 8 },
  btnPrimary: { padding: "0.8rem 2rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" },
  btnSecondary: { padding: "0.8rem 1.5rem", background: "#f1f5f9", color: "#374151", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" },
};
