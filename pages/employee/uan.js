// pages/employee/uan.js — Page 4 of 4 (FINAL SUBMIT)
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";
import { useAuth } from "../../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const EMPTY_PF = { employer_name: "", pf_account_number: "", epf_member_id: "", period: "" };

export default function UanPage() {
  const { user, apiFetch, ready } = useAuth();
  const router = useRouter();
  const [uanNumber, setUanNumber] = useState("");
  const [pfRecords, setPfRecords] = useState([{ ...EMPTY_PF }]);
  const [ackChecked, setAckChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

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
          if (data?.uanNumber) setUanNumber(data.uanNumber);
          if (data?.pfRecords && Array.isArray(data.pfRecords) && data.pfRecords.length > 0) {
            setPfRecords(data.pfRecords);
          }
          if (data?.status === "submitted") setSubmitted(true);
        }
      } catch (_) {}
      setFetching(false);
    };
    load();
  }, [ready, user, apiFetch]);

  const setPf = (i, k, v) => setPfRecords(prev => prev.map((r, idx) => idx === i ? { ...r, [k]: v } : r));
  const addPf = () => setPfRecords(prev => [...prev, { ...EMPTY_PF }]);
  const removePf = i => setPfRecords(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    setError("");
    if (!ackChecked) { setError("Please confirm that all information is accurate"); return; }
    if (!uanNumber) { setError("UAN number is required"); return; }

    setLoading(true);
    try {
      const employeeId = localStorage.getItem("dg_employee_id");
      const res = await apiFetch(`${API}/employee`, {
        method: "POST",
        body: JSON.stringify({
          employee_id: employeeId,
          uanNumber,
          pfRecords,
          status: "submitted",
          step: "uan",
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Submission failed"); return; }
      setSubmitted(true);
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  if (!ready || !user) return null;
  if (fetching) return <div style={styles.loading}>Loading…</div>;

  if (submitted) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <ProgressBar currentStep={4} totalSteps={4} />
          <div style={styles.successCard}>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.successTitle}>Profile Submitted!</h2>
            <p style={styles.successSub}>
              Your profile is complete. Employers can now request access to your information.
              You'll receive an email when a consent request arrives.
            </p>
            <button style={styles.btnPrimary} onClick={() => router.push("/consent")}>
              View Consent Requests
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.logo}>Datagate</div>
        </div>
        <ProgressBar currentStep={4} totalSteps={4} />

        <div style={styles.card}>
          <h2 style={styles.title}>UAN & PF Details</h2>
          <p style={styles.sub}>Your Universal Account Number and Provident Fund records</p>

          <Field label="UAN Number *" value={uanNumber} onChange={setUanNumber}
            placeholder="12-digit UAN" />

          <div style={styles.sectionLabel}>PF Account Records</div>

          {pfRecords.map((pf, i) => (
            <div key={i} style={styles.entryBlock}>
              <div style={styles.entryHeader}>
                <span style={styles.entryLabel}>PF Record {i + 1}</span>
                {pfRecords.length > 1 && (
                  <button style={styles.removeBtn} onClick={() => removePf(i)}>Remove</button>
                )}
              </div>
              <Field label="Employer Name" value={pf.employer_name}
                onChange={v => setPf(i, "employer_name", v)} />
              <div style={styles.grid2}>
                <Field label="PF Account Number" value={pf.pf_account_number}
                  onChange={v => setPf(i, "pf_account_number", v)} />
                <Field label="EPF Member ID" value={pf.epf_member_id}
                  onChange={v => setPf(i, "epf_member_id", v)} />
              </div>
              <Field label="Period (e.g. Jan 2020 – Dec 2022)" value={pf.period}
                onChange={v => setPf(i, "period", v)} />
            </div>
          ))}

          <button style={styles.addBtn} onClick={addPf}>+ Add PF record</button>

          {/* Acknowledgement */}
          <div style={styles.ackBox}>
            <label style={styles.checkLabel}>
              <input type="checkbox" checked={ackChecked} onChange={e => setAckChecked(e.target.checked)} />
              <span>
                I confirm that all information provided is accurate and I authorise Datagate to share
                this data with employers upon my explicit consent.
              </span>
            </label>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <div style={styles.actions}>
            <button style={styles.btnSecondary} onClick={() => router.push("/employee/previous")}>← Back</button>
            <button style={styles.btnSubmit} onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting…" : "Submit Profile ✓"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{label}</label>
      <input
        style={{ width: "100%", padding: "0.7rem 0.9rem", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
        value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      />
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
  sectionLabel: { fontSize: 15, fontWeight: 700, color: "#1e293b", borderBottom: "1.5px solid #e2e8f0", paddingBottom: 8 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  entryBlock: { border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" },
  entryHeader: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  entryLabel: { fontWeight: 700, fontSize: 14, color: "#1e293b" },
  removeBtn: { background: "none", border: "none", color: "#ef4444", fontSize: 13, cursor: "pointer", fontWeight: 600 },
  addBtn: { background: "none", border: "1.5px dashed #cbd5e1", color: "#2563eb", padding: "0.65rem", borderRadius: 8, fontSize: 14, cursor: "pointer", fontWeight: 600 },
  ackBox: { background: "#f8fafc", borderRadius: 10, padding: "1rem", border: "1.5px solid #e2e8f0" },
  checkLabel: { display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "#374151", cursor: "pointer", lineHeight: 1.5 },
  error: { color: "#ef4444", fontSize: 13, margin: 0 },
  actions: { display: "flex", justifyContent: "space-between", marginTop: 8 },
  btnPrimary: { padding: "0.8rem 2rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" },
  btnSecondary: { padding: "0.8rem 1.5rem", background: "#f1f5f9", color: "#374151", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" },
  btnSubmit: { padding: "0.8rem 2rem", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" },
  successCard: { background: "#fff", borderRadius: 16, padding: "3rem 2rem", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", textAlign: "center" },
  successIcon: { width: 64, height: 64, borderRadius: "50%", background: "#dcfce7", color: "#16a34a", fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 },
  successTitle: { fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 },
  successSub: { fontSize: 15, color: "#64748b", maxWidth: 420, lineHeight: 1.6, margin: 0 },
};
