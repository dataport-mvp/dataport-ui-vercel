// pages/employee/uan.js  — Page 4 of 4 (FINAL SUBMIT)
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";
import { useAuth } from "../../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

// ── Acknowledgement declarations ───────────────────────────────────────────────
// Employee must tick each one before submitting. Ticked items are stored and
// shown to employer on the Employment tab of their dashboard.
const ACK_ITEMS = [
  {
    id: "truthful",
    text: "I hereby declare that all information provided in this profile is true, accurate and complete to the best of my knowledge and belief.",
  },
  {
    id: "consent_aware",
    text: "I understand that my data will only be shared with an employer or BGV agency after I explicitly approve their consent request. I can decline or revoke access at any time.",
  },
  {
    id: "docs_genuine",
    text: "I confirm that all documents, certificates and identity proofs I have referenced are genuine and have not been tampered with.",
  },
  {
    id: "no_suppress",
    text: "I have not wilfully withheld or suppressed any material information regarding my employment history, qualifications or legal record.",
  },
  {
    id: "liability",
    text: "I accept that any false or misleading information may result in immediate disqualification, termination of employment and/or legal action.",
  },
];

const styles = {
  page:        { background: "#f1f5f9", padding: "2rem", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" },
  card:        { maxWidth: "980px", margin: "auto", background: "#fff", padding: "2rem", borderRadius: "14px", boxShadow: "0 12px 30px rgba(0,0,0,0.08)" },
  title:       { marginBottom: "2rem" },
  section:     { marginBottom: "2.5rem" },
  row:         { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" },
  label:       { fontSize: "0.85rem", color: "#475569" },
  input:       { width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1" },
  pillContainer: { display: "flex", gap: "1rem", marginTop: "0.5rem" },
  pill: (active) => ({
    padding: "0.5rem 1rem", borderRadius: "20px", cursor: "pointer",
    border: active ? "1px solid #2563eb" : "1px solid #cbd5e1",
    background: active ? "#2563eb" : "#fff",
    color:      active ? "#fff"    : "#000",
  }),
  uploadCard:  { border: "1px dashed #cbd5e1", padding: "1.5rem", borderRadius: "12px", background: "#f8fafc" },
  helperText:  { fontSize: "0.75rem", marginTop: "0.5rem", color: "#64748b" },
  addBtn:      { marginTop: "1rem", cursor: "pointer", color: "#2563eb", background: "none", border: "none", fontSize: "1rem" },
  removeBtn:   { cursor: "pointer", color: "#dc2626", marginTop: "0.75rem", background: "none", border: "none", fontSize: "0.9rem" },
  primaryBtn:  { marginTop: "2rem", padding: "0.9rem 2.5rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem" },
  secondaryBtn:{ padding: "0.9rem 2.5rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer" },
  errorBox:    { color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.9rem" },
  ackBox:      { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "1.5rem", marginBottom: "2rem" },
  ackItem:     { display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "1rem", cursor: "pointer" },
  ackCheck:    (checked) => ({
    width: "18px", height: "18px", minWidth: "18px", borderRadius: "4px", marginTop: "2px",
    border: checked ? "none" : "2px solid #cbd5e1",
    background: checked ? "#2563eb" : "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
  }),
  ackText:     { fontSize: "0.88rem", color: "#334155", lineHeight: "1.5" },
};

const emptyPfRecord = () => ({ companyName: "", pfMemberId: "", dojEpfo: "", doeEpfo: "", pfTransferred: "" });

export default function UANPage() {
  const router = useRouter();
  const { token, logout } = useAuth();

  const [form, setForm] = useState({
    uanMaster: { uanNumber: "", nameAsPerUan: "", mobileLinked: "", isActive: "" },
    pfRecords: [emptyPfRecord()],
  });

  // Acknowledgements — which items the user has checked
  const [checkedAcks, setCheckedAcks] = useState({});

  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading]         = useState(false);
  const [submitted, setSubmitted]     = useState(false);

  // Signout confirmation modal state
  const [showSignoutConfirm, setShowSignoutConfirm] = useState(false);

  /* ── Restore draft ───────────────────────────────────────────────────────── */
  useEffect(() => {
    // 1. localStorage first (fast, works mid-session)
    try {
      const saved = localStorage.getItem("dg_uan");
      if (saved) { setForm(JSON.parse(saved)); }
      const savedAcks = localStorage.getItem("dg_uan_acks");
      if (savedAcks) { setCheckedAcks(JSON.parse(savedAcks)); }
      if (saved) return;
    } catch (_) {}

    // 2. API fallback (re-login — localStorage was cleared)
    if (!token) return;
    fetch(`${API}/employee/draft`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        if (d.employee_id) localStorage.setItem("dg_employee_id", JSON.stringify(d.employee_id));
        const restored = {
          uanMaster: {
            uanNumber:    d.uanNumber    || "",
            nameAsPerUan: d.nameAsPerUan || "",
            mobileLinked: d.mobileLinked || "",
            isActive:     d.isActive     || "",
          },
          pfRecords: d.pfRecords?.length ? d.pfRecords : [emptyPfRecord()],
        };
        setForm(restored);
        localStorage.setItem("dg_uan", JSON.stringify(restored));
        // Restore saved acknowledgements if stored in profile
        if (d.acknowledgements_profile) {
          setCheckedAcks(d.acknowledgements_profile);
          localStorage.setItem("dg_uan_acks", JSON.stringify(d.acknowledgements_profile));
        }
      })
      .catch(() => {});
  }, [token]);

  /* ── Helpers ─────────────────────────────────────────────────────────────── */
  const updateUan = (field, value) =>
    setForm(prev => ({ ...prev, uanMaster: { ...prev.uanMaster, [field]: value } }));

  const updatePf = (index, field, value) => {
    const updated = form.pfRecords.map((r, i) => i === index ? { ...r, [field]: value } : r);
    setForm({ ...form, pfRecords: updated });
  };

  const toggleAck = (id) => {
    const next = { ...checkedAcks, [id]: !checkedAcks[id] };
    setCheckedAcks(next);
    localStorage.setItem("dg_uan_acks", JSON.stringify(next));
  };

  const allAcksChecked = ACK_ITEMS.every(a => checkedAcks[a.id]);

  /* ── FINAL SUBMIT ────────────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!allAcksChecked) {
      setSubmitError("Please read and accept all declarations before submitting.");
      return;
    }

    setSubmitError("");
    setLoading(true);
    localStorage.setItem("dg_uan", JSON.stringify(form));

    try {
      // ── Step 1: Fetch the FULL existing record from API ──────────────────────
      // This is the source of truth. We NEVER read personal/education from
      // localStorage here because it may be empty (re-login) or stale.
      // We only merge NEW data on top of what's already saved.
      const draftRes = await fetch(`${API}/employee/draft`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let existing = {};
      if (draftRes.ok) {
        existing = await draftRes.json();
        if (existing.employee_id) {
          localStorage.setItem("dg_employee_id", JSON.stringify(existing.employee_id));
        }
      }

      const empId = existing.employee_id
        || JSON.parse(localStorage.getItem("dg_employee_id") || "null")
        || `emp-${Date.now()}`;

      // ── Step 2: Build only the UAN fields from current form ─────────────────
      const ackProfile = {};
      ACK_ITEMS.forEach(a => { ackProfile[a.id] = checkedAcks[a.id] ? "Yes" : "No"; });

      // ── Step 3: Merge — existing record + UAN fields + mark submitted ────────
      // All other fields (personal, education) come from `existing` unchanged.
      // Only UAN/PF and acknowledgements are written from this page.
      const employeePayload = {
        ...existing,
        employee_id:             empId,
        status:                  "submitted",
        uanNumber:               form.uanMaster.uanNumber    || existing.uanNumber    || "",
        nameAsPerUan:            form.uanMaster.nameAsPerUan || existing.nameAsPerUan || "",
        mobileLinked:            form.uanMaster.mobileLinked || existing.mobileLinked || "",
        isActive:                form.uanMaster.isActive     || existing.isActive     || "",
        pfRecords:               form.pfRecords.length       ? form.pfRecords         : (existing.pfRecords || []),
        acknowledgements_profile: ackProfile,
        submitted_at:            Date.now(),
      };

      // ── Step 4: POST /employee (upsert — full merged record) ────────────────
      const empRes = await fetch(`${API}/employee`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(employeePayload),
      });
      if (!empRes.ok) {
        const e = await empRes.json().catch(() => ({}));
        throw new Error(e.detail || `Error ${empRes.status}`);
      }

      // ── Step 5: POST /employee/employment-history ────────────────────────────
      // Read from localStorage first, fall back to nothing (history saved on page 3)
      const employments = JSON.parse(localStorage.getItem("dg_employments") || "[]");
      const ack         = JSON.parse(localStorage.getItem("dg_ack")         || "{}");
      if (employments.length > 0) {
        const histRes = await fetch(`${API}/employee/employment-history`, {
          method:  "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body:    JSON.stringify({ employments, acknowledgements: ack }),
        });
        if (!histRes.ok) {
          const e = await histRes.json().catch(() => ({}));
          throw new Error(e.detail || `Employment history error ${histRes.status}`);
        }
      }

      // ── Step 6: Clear draft caches — but KEEP dg_employee_id ────────────────
      // dg_employee_id must survive so re-login can still find the profile
      ["dg_personal", "dg_education", "dg_employments", "dg_ack", "dg_uan", "dg_uan_acks"].forEach(
        k => localStorage.removeItem(k)
      );

      setSubmitted(true);

    } catch (err) {
      setSubmitError(err.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Sign out confirmation ───────────────────────────────────────────────── */
  const handleSignout = () => setShowSignoutConfirm(true);
  const confirmSignout = () => { logout(); router.push("/employee/login"); };

  /* ── SUCCESS SCREEN ──────────────────────────────────────────────────────── */
  if (submitted) {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.card, textAlign: "center", padding: "4rem 2rem" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
          <h2 style={{ color: "#2563eb", marginBottom: "0.75rem" }}>Profile Submitted Successfully!</h2>
          <p style={{ color: "#475569", maxWidth: "500px", margin: "0 auto 2rem", lineHeight: "1.6" }}>
            Your employment profile is securely saved on <strong>Datagate</strong>.
            When an employer or BGV agency requests your data, you will receive a consent notification to approve or decline.
          </p>
          <button style={styles.primaryBtn} onClick={() => router.push("/employee/personal")}>
            View My Profile
          </button>
        </div>
      </div>
    );
  }

  /* ── RENDER ──────────────────────────────────────────────────────────────── */
  return (
    <div style={styles.page}>
      {/* Signout confirmation modal */}
      {showSignoutConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: "14px", padding: "2rem", maxWidth: "400px", width: "90%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🚪</div>
            <h3 style={{ margin: "0 0 0.5rem", color: "#0f172a" }}>Sign Out?</h3>
            <p style={{ color: "#475569", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
              Your data is saved. You can continue from where you left off after logging back in.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button
                onClick={() => setShowSignoutConfirm(false)}
                style={{ padding: "0.6rem 1.5rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={confirmSignout}
                style={{ padding: "0.6rem 1.5rem", borderRadius: "8px", border: "none", background: "#0f172a", color: "#fff", cursor: "pointer", fontWeight: 600 }}
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.card}>
        <ProgressBar currentStep={4} totalSteps={4} />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h1 style={{ ...styles.title, margin: 0 }}>UAN & PF Information</h1>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={() => router.push("/consent")}
              style={{ background: "#fff", border: "1px solid #2563eb", color: "#2563eb", borderRadius: "8px", padding: "0.45rem 1rem", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}
            >
              🔒 Consent Center
            </button>
            <button
              onClick={handleSignout}
              style={{ background: "#0f172a", border: "none", color: "#fff", borderRadius: "8px", padding: "0.45rem 1rem", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* UAN MASTER */}
        <div style={styles.section}>
          <h3>UAN Details</h3>
          <div style={styles.row}>
            <div>
              <label style={styles.label}>UAN Number</label>
              <input style={styles.input} maxLength={12}
                value={form.uanMaster.uanNumber}
                onChange={e => updateUan("uanNumber", e.target.value.replace(/\D/g, ""))} />
              <div style={{ marginTop: "1rem" }}>
                <label style={styles.label}>Name as per UAN</label>
                <input style={styles.input}
                  value={form.uanMaster.nameAsPerUan}
                  onChange={e => updateUan("nameAsPerUan", e.target.value)} />
              </div>
            </div>
            <div>
              <div style={styles.uploadCard}>
                <label style={styles.label}>EPFO Service History Record</label>
                <input type="file" style={{ marginTop: "0.75rem", opacity: 0.5 }} disabled />
                <p style={styles.helperText}>Upload full service history screenshot from EPFO portal. <em>(Coming soon)</em></p>
              </div>
            </div>
          </div>
          <div style={styles.row}>
            <div>
              <label style={styles.label}>Mobile Linked with UAN</label>
              <input style={styles.input} maxLength={10}
                value={form.uanMaster.mobileLinked}
                onChange={e => updateUan("mobileLinked", e.target.value.replace(/\D/g, ""))} />
            </div>
            <div>
              <label style={styles.label}>Is UAN Active?</label>
              <div style={styles.pillContainer}>
                {["Yes", "No"].map(val => (
                  <div key={val} style={styles.pill(form.uanMaster.isActive === val)}
                    onClick={() => updateUan("isActive", val)}>{val}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PF RECORDS */}
        <div style={styles.section}>
          <h3>PF Details (Per Previous Employer)</h3>
          {form.pfRecords.map((record, index) => (
            <div key={index} style={{ marginBottom: "2rem" }}>
              <div style={styles.row}>
                <div>
                  <label style={styles.label}>Company Name</label>
                  <input style={styles.input} value={record.companyName}
                    onChange={e => updatePf(index, "companyName", e.target.value)} />
                </div>
                <div>
                  <label style={styles.label}>PF Member ID</label>
                  <input style={styles.input} value={record.pfMemberId}
                    onChange={e => updatePf(index, "pfMemberId", e.target.value)} />
                </div>
              </div>
              <div style={styles.row}>
                <div>
                  <label style={styles.label}>Date of Joining (EPFO)</label>
                  <input type="date" style={styles.input} value={record.dojEpfo}
                    onChange={e => updatePf(index, "dojEpfo", e.target.value)} />
                </div>
                <div>
                  <label style={styles.label}>Date of Exit (EPFO)</label>
                  <input type="date" style={styles.input} value={record.doeEpfo}
                    onChange={e => updatePf(index, "doeEpfo", e.target.value)} />
                </div>
              </div>
              <div>
                <label style={styles.label}>Was PF Transferred?</label>
                <div style={styles.pillContainer}>
                  {["Yes", "No"].map(val => (
                    <div key={val} style={styles.pill(record.pfTransferred === val)}
                      onClick={() => updatePf(index, "pfTransferred", val)}>{val}</div>
                  ))}
                </div>
              </div>
              {index > 0 && (
                <button style={styles.removeBtn} onClick={() => {
                  setForm({ ...form, pfRecords: form.pfRecords.filter((_, i) => i !== index) });
                }}>
                  − Remove This Company
                </button>
              )}
            </div>
          ))}
          <button style={styles.addBtn} onClick={() =>
            setForm({ ...form, pfRecords: [...form.pfRecords, emptyPfRecord()] })}>
            + Add Another Company
          </button>
        </div>

        {/* ── ACKNOWLEDGEMENT SECTION ───────────────────────────────────────── */}
        <div style={styles.section}>
          <h3 style={{ marginBottom: "0.25rem" }}>Declaration & Acknowledgement</h3>
          <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1.25rem" }}>
            Please read and tick each declaration below. All must be accepted before you can submit your profile.
          </p>
          <div style={styles.ackBox}>
            {ACK_ITEMS.map(item => (
              <div key={item.id} style={styles.ackItem} onClick={() => toggleAck(item.id)}>
                <div style={styles.ackCheck(checkedAcks[item.id])}>
                  {checkedAcks[item.id] && (
                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                      <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span style={styles.ackText}>{item.text}</span>
              </div>
            ))}
          </div>
          {!allAcksChecked && (
            <p style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
              {Object.values(checkedAcks).filter(Boolean).length} of {ACK_ITEMS.length} declarations accepted
            </p>
          )}
          {allAcksChecked && (
            <p style={{ fontSize: "0.82rem", color: "#16a34a", fontWeight: 600 }}>
              ✓ All declarations accepted — you may submit your profile
            </p>
          )}
        </div>
        {/* ─────────────────────────────────────────────────────────────────── */}

        {submitError && <div style={styles.errorBox}>⚠️ {submitError}</div>}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button style={styles.secondaryBtn} onClick={() => router.push("/employee/previous")}>
            ← Previous
          </button>
          <button
            style={{ ...styles.primaryBtn, marginTop: 0, opacity: (loading || !allAcksChecked) ? 0.6 : 1, cursor: allAcksChecked ? "pointer" : "not-allowed" }}
            onClick={handleSubmit}
            disabled={loading || !allAcksChecked}
          >
            {loading ? "Submitting..." : "Submit Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
