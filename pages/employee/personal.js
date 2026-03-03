// pages/employee/personal.js — Page 1 of 4
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";
import { useAuth } from "../../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const INITIAL = {
  firstName: "", lastName: "", dob: "", gender: "",
  phone: "", aadhaar: "", pan: "", address: "",
};

export default function PersonalPage() {
  const { user, apiFetch, ready } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState(INITIAL);
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
          if (data) {
            setForm(prev => ({
              ...prev,
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              dob: data.dob || "",
              gender: data.gender || "",
              phone: data.phone || "",
              aadhaar: data.aadhaar || "",
              pan: data.pan || "",
              address: data.address || "",
            }));
            if (data.employee_id) localStorage.setItem("dg_employee_id", data.employee_id);
          }
        }
      } catch (_) {}
      setFetching(false);
    };
    load();
  }, [ready, user, apiFetch]);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleNext = async () => {
    setError("");
    if (!form.firstName || !form.lastName || !form.dob || !form.phone) {
      setError("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch(`${API}/employee`, {
        method: "POST",
        body: JSON.stringify({ ...form, step: "personal" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Save failed"); return; }
      if (data.employee_id) localStorage.setItem("dg_employee_id", data.employee_id);
      router.push("/employee/education");
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
        <ProgressBar currentStep={1} totalSteps={4} />

        <div style={styles.card}>
          <h2 style={styles.title}>Personal Information</h2>
          <p style={styles.sub}>Tell us about yourself</p>

          <div style={styles.grid2}>
            <Field label="First Name *" value={form.firstName} onChange={v => set("firstName", v)} />
            <Field label="Last Name *" value={form.lastName} onChange={v => set("lastName", v)} />
          </div>
          <div style={styles.grid2}>
            <Field label="Date of Birth *" type="date" value={form.dob} onChange={v => set("dob", v)} />
            <Field label="Gender" as="select" value={form.gender} onChange={v => set("gender", v)}
              options={["", "Male", "Female", "Other", "Prefer not to say"]} />
          </div>
          <Field label="Phone Number *" value={form.phone} onChange={v => set("phone", v)} placeholder="+91 XXXXX XXXXX" />
          <Field label="Aadhaar Number" value={form.aadhaar} onChange={v => set("aadhaar", v)} placeholder="XXXX XXXX XXXX" />
          <Field label="PAN Number" value={form.pan} onChange={v => set("pan", v)} placeholder="ABCDE1234F" />
          <Field label="Address" as="textarea" value={form.address} onChange={v => set("address", v)} rows={3} />

          {error && <p style={styles.error}>{error}</p>}

          <div style={styles.actions}>
            <button style={styles.btnPrimary} onClick={handleNext} disabled={loading}>
              {loading ? "Saving…" : "Next: Education →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", as, options, placeholder, rows }) {
  const inputStyle = {
    width: "100%",
    padding: "0.7rem 0.9rem",
    border: "1.5px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
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
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  logo: { fontSize: 20, fontWeight: 800, color: "#2563eb" },
  loading: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontSize: 15, color: "#64748b" },
  card: { background: "#fff", borderRadius: 16, padding: "2rem", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: "1rem" },
  title: { fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 },
  sub: { fontSize: 14, color: "#64748b", margin: 0 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  error: { color: "#ef4444", fontSize: 13, margin: 0 },
  actions: { display: "flex", justifyContent: "flex-end", marginTop: 8 },
  btnPrimary: {
    padding: "0.8rem 2rem",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
};
