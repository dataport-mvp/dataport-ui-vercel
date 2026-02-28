// pages/employee/uan.js  — Page 4 of 4  (FINAL SUBMIT)
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";
import { useAuth } from "../../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

/* ---------- STYLES (match previous pages) ---------- */
const styles = {
  page:      { background: "#f1f5f9", padding: "2rem", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" },
  card:      { maxWidth: "980px", margin: "auto", background: "#fff", padding: "2rem", borderRadius: "14px", boxShadow: "0 12px 30px rgba(0,0,0,0.08)" },
  title:     { marginBottom: "2rem" },
  section:   { marginBottom: "2.5rem" },
  row:       { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" },
  label:     { fontSize: "0.85rem", color: "#475569" },
  input:     { width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1" },
  pillContainer: { display: "flex", gap: "1rem", marginTop: "0.5rem" },
  pill: (active) => ({
    padding: "0.5rem 1rem",
    borderRadius: "20px",
    cursor: "pointer",
    border: active ? "1px solid #2563eb" : "1px solid #cbd5e1",
    background: active ? "#2563eb" : "#fff",
    color:      active ? "#fff"    : "#000"
  }),
  uploadCard: { border: "1px dashed #cbd5e1", padding: "1.5rem", borderRadius: "12px", background: "#f8fafc" },
  helperText: { fontSize: "0.75rem", marginTop: "0.5rem", color: "#64748b" },
  addBtn:     { marginTop: "1rem", cursor: "pointer", color: "#2563eb", background: "none", border: "none", fontSize: "1rem" },
  removeBtn:  { cursor: "pointer", color: "#dc2626", marginTop: "0.75rem", background: "none", border: "none", fontSize: "0.9rem" },
  primaryBtn: { marginTop: "2rem", padding: "0.9rem 2.5rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem" },
  secondaryBtn: { padding: "0.9rem 2.5rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer" },
  errorBox:   { color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.9rem" },
};

const emptyPfRecord = () => ({
  companyName: "", pfMemberId: "", dojEpfo: "", doeEpfo: "", pfTransferred: ""
});

export default function UANPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [form, setForm] = useState({
    uanMaster: {
      uanNumber: "", nameAsPerUan: "", mobileLinked: "",
      isActive: "", aadhaarLinked: "", panLinked: "", serviceHistory: null
    },
    pfRecords: [emptyPfRecord()]
  });

  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading]         = useState(false);
  const [submitted, setSubmitted]     = useState(false);

  /* ---------- Restore draft ---------- */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dg_uan");
      if (saved) setForm(JSON.parse(saved));
    } catch (_) {}
  }, []);

  /* ---------- Update helpers ---------- */
  const updateUan = (field, value) =>
    setForm((prev) => ({ ...prev, uanMaster: { ...prev.uanMaster, [field]: value } }));

  const updatePf = (index, field, value) => {
    const updated = form.pfRecords.map((r, i) => i === index ? { ...r, [field]: value } : r);
    setForm({ ...form, pfRecords: updated });
  };

  const addPfRecord    = () => setForm({ ...form, pfRecords: [...form.pfRecords, emptyPfRecord()] });
  const removePfRecord = (index) => {
    if (index === 0) return;
    setForm({ ...form, pfRecords: form.pfRecords.filter((_, i) => i !== index) });
  };

  /* ---------- FINAL SUBMIT — collects all 4 pages ---------- */
  const handleSubmit = async () => {
    setSubmitError("");
    setLoading(true);

    // 1. Save UAN to localStorage
    localStorage.setItem("dg_uan", JSON.stringify(form));

    try {
      // 2. Pull all pages from localStorage
      const personal    = JSON.parse(localStorage.getItem("dg_personal")    || "{}");
      const education   = JSON.parse(localStorage.getItem("dg_education")   || "{}");
      const employments = JSON.parse(localStorage.getItem("dg_employments") || "[]");
      const ack         = JSON.parse(localStorage.getItem("dg_ack")         || "{}");
      const empId       = JSON.parse(localStorage.getItem("dg_employee_id") || "null") || `emp-${Date.now()}`;

      // 3. Build final payload matching your API models.py EmployeeCreate
      const employeePayload = {
        employee_id:   empId,
        status:        "submitted",

        // Personal
        firstName:     personal.firstName    || "",
        lastName:      personal.lastName     || "",
        fatherName:    personal.fatherName   || "",
        aadhaar:       personal.aadhaar      || "",
        pan:           personal.pan          || "",
        mobile:        personal.mobile       || "",
        email:         personal.email        || "",
        passport:      personal.passport     || "",
        dob:           personal.dob          || "",
        gender:        personal.gender       || "",
        nationality:   personal.nationality  || "",
        currentAddress:   personal.currentAddress   || {},
        permanentAddress: personal.permanentAddress || {},

        // Education
        education: education,

        // UAN / PF
        uanNumber:    form.uanMaster.uanNumber    || "",
        nameAsPerUan: form.uanMaster.nameAsPerUan || "",
        mobileLinked: form.uanMaster.mobileLinked || "",
        isActive:     form.uanMaster.isActive     || "",
        pfRecords:    form.pfRecords,

        submitted_at: Date.now(),
      };

      // 4. POST /employee  (final submit)
      const empRes = await fetch(`${API}/employee`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(employeePayload),
      });

      if (!empRes.ok) {
        const errData = await empRes.json().catch(() => ({}));
        throw new Error(errData.detail || `Error ${empRes.status}`);
      }

      // 5. POST /employee/employment-history  (employment + ack)
      if (employments.length > 0) {
        const histRes = await fetch(`${API}/employee/employment-history`, {
          method:  "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body:    JSON.stringify({ employments, acknowledgements: ack }),
        });
        if (!histRes.ok) {
          const errData = await histRes.json().catch(() => ({}));
          throw new Error(errData.detail || `Employment history error ${histRes.status}`);
        }
      }

      // 6. Clear all local drafts
      ["dg_personal", "dg_education", "dg_employments", "dg_ack", "dg_uan", "dg_employee_id"].forEach(
        (k) => localStorage.removeItem(k)
      );

      setSubmitted(true);

    } catch (err) {
      // err.message is now always a plain string — no [object Object]
      setSubmitError(err.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- SUCCESS SCREEN ---------- */
  if (submitted) {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.card, textAlign: "center", padding: "4rem 2rem" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
          <h2 style={{ color: "#2563eb", marginBottom: "0.75rem" }}>Profile Submitted Successfully!</h2>
          <p style={{ color: "#475569", maxWidth: "500px", margin: "0 auto 2rem", lineHeight: "1.6" }}>
            Your employment profile is securely saved on <strong>Datagate</strong>.
            When an employer or BGV agency requests your data, you'll receive a consent notification.
          </p>
          <button style={styles.primaryBtn} onClick={() => router.push("/")}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  /* ---------- RENDER ---------- */
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <ProgressBar currentStep={4} totalSteps={4} />
        <h1 style={styles.title}>UAN & PF Information</h1>

        {/* ---------- UAN MASTER ---------- */}
        <div style={styles.section}>
          <h3>UAN Details</h3>

          <div style={styles.row}>
            {/* LEFT */}
            <div>
              <label style={styles.label}>UAN Number</label>
              <input
                style={styles.input}
                maxLength={12}
                value={form.uanMaster.uanNumber}
                onChange={(e) => updateUan("uanNumber", e.target.value.replace(/\D/g, ""))}
              />

              <div style={{ marginTop: "1rem" }}>
                <label style={styles.label}>Name as per UAN</label>
                <input
                  style={styles.input}
                  value={form.uanMaster.nameAsPerUan}
                  onChange={(e) => updateUan("nameAsPerUan", e.target.value)}
                />
              </div>
            </div>

            {/* RIGHT — service history upload (disabled until S3) */}
            <div>
              <div style={styles.uploadCard}>
                <label style={styles.label}>EPFO Service History Record</label>
                <input type="file" style={{ marginTop: "0.75rem", opacity: 0.5 }} disabled />
                <p style={styles.helperText}>
                  Upload full service history screenshot from EPFO portal.{" "}
                  <em>(S3 upload — next commit)</em>
                </p>
              </div>
            </div>
          </div>

          <div style={styles.row}>
            <div>
              <label style={styles.label}>Mobile Linked with UAN</label>
              <input
                style={styles.input}
                maxLength={10}
                value={form.uanMaster.mobileLinked}
                onChange={(e) => updateUan("mobileLinked", e.target.value.replace(/\D/g, ""))}
              />
            </div>

            <div>
              <label style={styles.label}>Is UAN Active?</label>
              <div style={styles.pillContainer}>
                {["Yes", "No"].map((val) => (
                  <div
                    key={val}
                    style={styles.pill(form.uanMaster.isActive === val)}
                    onClick={() => updateUan("isActive", val)}
                  >
                    {val}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ---------- PF RECORDS ---------- */}
        <div style={styles.section}>
          <h3>PF Details (Per Previous Employer)</h3>

          {form.pfRecords.map((record, index) => (
            <div key={index} style={{ marginBottom: "2rem" }}>
              <div style={styles.row}>
                <div>
                  <label style={styles.label}>Company Name</label>
                  <input
                    style={styles.input}
                    value={record.companyName}
                    onChange={(e) => updatePf(index, "companyName", e.target.value)}
                  />
                </div>
                <div>
                  <label style={styles.label}>PF Member ID</label>
                  <input
                    style={styles.input}
                    value={record.pfMemberId}
                    onChange={(e) => updatePf(index, "pfMemberId", e.target.value)}
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div>
                  <label style={styles.label}>Date of Joining (EPFO)</label>
                  <input
                    type="date"
                    style={styles.input}
                    value={record.dojEpfo}
                    onChange={(e) => updatePf(index, "dojEpfo", e.target.value)}
                  />
                </div>
                <div>
                  <label style={styles.label}>Date of Exit (EPFO)</label>
                  <input
                    type="date"
                    style={styles.input}
                    value={record.doeEpfo}
                    onChange={(e) => updatePf(index, "doeEpfo", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={styles.label}>Was PF Transferred?</label>
                <div style={styles.pillContainer}>
                  {["Yes", "No"].map((val) => (
                    <div
                      key={val}
                      style={styles.pill(record.pfTransferred === val)}
                      onClick={() => updatePf(index, "pfTransferred", val)}
                    >
                      {val}
                    </div>
                  ))}
                </div>
              </div>

              {index > 0 && (
                <button style={styles.removeBtn} onClick={() => removePfRecord(index)}>
                  − Remove This Company
                </button>
              )}
            </div>
          ))}

          <button style={styles.addBtn} onClick={addPfRecord}>
            + Add Another Company
          </button>
        </div>

        {/* Error display */}
        {submitError && (
          <div style={styles.errorBox}>
            ⚠️ {submitError}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button style={styles.secondaryBtn} onClick={() => router.push("/employee/previous")}>
            Previous
          </button>
          <button
            style={{ ...styles.primaryBtn, marginTop: 0, opacity: loading ? 0.7 : 1 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Save & Proceed"}
          </button>
        </div>
      </div>
    </div>
  );
}
