// pages/employee/uan.js  — Page 4 of 4  (FINAL SUBMIT — single API call)
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

function SignoutModal({ onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "2rem", maxWidth: 360, width: "90%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize: 36, marginBottom: "0.75rem" }}>👋</div>
        <h3 style={{ margin: "0 0 0.5rem", color: "#0f172a" }}>Sign out?</h3>
        <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Your progress is saved. You can continue anytime.</p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={onCancel}  style={{ flex: 1, padding: "0.75rem", borderRadius: 8, border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontWeight: 600 }}>Stay</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "0.75rem", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page:         { background: "#f1f5f9", padding: "2rem", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" },
  card:         { maxWidth: "980px", margin: "auto", background: "#fff", padding: "2rem", borderRadius: "14px", boxShadow: "0 12px 30px rgba(0,0,0,0.08)" },
  title:        { marginBottom: "2rem" },
  section:      { marginBottom: "2.5rem" },
  row:          { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" },
  label:        { fontSize: "0.85rem", color: "#475569" },
  input:        { width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1" },
  pillContainer:{ display: "flex", gap: "1rem", marginTop: "0.5rem" },
  pill: (active) => ({ padding: "0.5rem 1rem", borderRadius: "20px", cursor: "pointer", border: active ? "1px solid #2563eb" : "1px solid #cbd5e1", background: active ? "#2563eb" : "#fff", color: active ? "#fff" : "#000" }),
  uploadCard:   { border: "1px dashed #cbd5e1", padding: "1.5rem", borderRadius: "12px", background: "#f8fafc" },
  helperText:   { fontSize: "0.75rem", marginTop: "0.5rem", color: "#64748b" },
  addBtn:       { marginTop: "1rem", cursor: "pointer", color: "#2563eb", background: "none", border: "none", fontSize: "1rem" },
  removeBtn:    { cursor: "pointer", color: "#dc2626", marginTop: "0.75rem", background: "none", border: "none", fontSize: "0.9rem" },
  primaryBtn:   { marginTop: "2rem", padding: "0.9rem 2.5rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem" },
  secondaryBtn: { padding: "0.9rem 2.5rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer" },
  signoutBtn:   { padding: "0.4rem 1rem", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", color: "#64748b", fontSize: "0.85rem", cursor: "pointer", fontWeight: 600 },
  errorBox:     { color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.9rem" },
};

const emptyPfRecord = () => ({ companyName: "", pfMemberId: "", dojEpfo: "", doeEpfo: "", pfTransferred: "" });

export default function UANPage() {
  const router = useRouter();
  const { user, apiFetch, logout, ready } = useAuth();
  const [showSignout, setShowSignout] = useState(false);

  const [form, setForm] = useState({
    uanMaster: { uanNumber: "", nameAsPerUan: "", mobileLinked: "", isActive: "" },
    pfRecords: [emptyPfRecord()]
  });
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading]         = useState(false);
  const [submitted, setSubmitted]     = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/employee/login"); return; }
  }, [ready, user, router]);

  useEffect(() => {
    if (!ready || !user) return;
    try {
      const saved = localStorage.getItem("dg_uan");
      if (saved) setForm(JSON.parse(saved));
    } catch (_) {}
  }, [ready, user]);

  const updateUan = (field, value) => setForm(prev => ({ ...prev, uanMaster: { ...prev.uanMaster, [field]: value } }));
  const updatePf  = (i, field, value) => setForm(prev => ({ ...prev, pfRecords: prev.pfRecords.map((r, idx) => idx === i ? { ...r, [field]: value } : r) }));
  const addPfRecord    = () => setForm(prev => ({ ...prev, pfRecords: [...prev.pfRecords, emptyPfRecord()] }));
  const removePfRecord = (i) => { if (i === 0) return; setForm(prev => ({ ...prev, pfRecords: prev.pfRecords.filter((_, idx) => idx !== i) })); };

  /* ── SINGLE FINAL API CALL — collects all 4 pages from localStorage ── */
  const handleSubmit = async () => {
    setSubmitError("");
    setLoading(true);
    localStorage.setItem("dg_uan", JSON.stringify(form));

    try {
      const personal    = JSON.parse(localStorage.getItem("dg_personal")    || "{}");
      const education   = JSON.parse(localStorage.getItem("dg_education")   || "{}");
      const employments = JSON.parse(localStorage.getItem("dg_employments") || "[]");
      const ack         = JSON.parse(localStorage.getItem("dg_ack")         || "{}");
      const empId       = localStorage.getItem("dg_employee_id") || `emp-${Date.now()}`;

      // Build education dict from flat localStorage keys
      const educationPayload = education.classX ? education : {
        classX:        { school: education.xSchool, board: education.xBoard, hallTicket: education.xHall, from: education.xFrom, to: education.xTo, address: education.xAddress, yearOfPassing: education.xYear, resultType: education.xResultType, resultValue: education.xResultValue, medium: education.xMedium },
        intermediate:  { college: education.iCollege, board: education.iBoard, hallTicket: education.iHall, from: education.iFrom, to: education.iTo, address: education.iAddress, mode: education.iMode, yearOfPassing: education.iYear, resultType: education.iResultType, resultValue: education.iResultValue, medium: education.iMedium },
        undergraduate: { college: education.ugCollege, university: education.ugUniversity, course: education.ugCourse, hallTicket: education.ugHall, from: education.ugFrom, to: education.ugTo, address: education.ugAddress, mode: education.ugMode, yearOfPassing: education.ugYear, resultType: education.ugResultType, resultValue: education.ugResultValue, backlogs: education.ugBacklogs, medium: education.ugMedium },
        postgraduate:  { college: education.pgCollege, university: education.pgUniversity, course: education.pgCourse, hallTicket: education.pgHall, from: education.pgFrom, to: education.pgTo, address: education.pgAddress, mode: education.pgMode, yearOfPassing: education.pgYear, resultType: education.pgResultType, resultValue: education.pgResultValue, backlogs: education.pgBacklogs, medium: education.pgMedium },
      };

      const payload = {
        employee_id:      empId,
        status:           "submitted",
        // Page 1 — personal
        firstName:        personal.firstName    || "",
        lastName:         personal.lastName     || "",
        middleName:       personal.middleName   || "",
        fatherName:       personal.fatherName   || `${personal.fatherFirst||""} ${personal.fatherMiddle||""} ${personal.fatherLast||""}`.trim(),
        fatherFirst:      personal.fatherFirst  || "",
        fatherMiddle:     personal.fatherMiddle || "",
        fatherLast:       personal.fatherLast   || "",
        dob:              personal.dob          || "",
        gender:           personal.gender       || "",
        nationality:      personal.nationality  || "",
        mobile:           personal.mobile       || user?.phone || "",
        email:            personal.email        || user?.email || "",
        passport:         personal.passport     || "",
        aadhaar:          personal.aadhar       || "",
        pan:              personal.pan          || "",
        currentAddress:   { from: personal.curFrom, to: personal.curTo, door: personal.curDoor, village: personal.curVillage, district: personal.curDistrict, pin: personal.curPin },
        permanentAddress: { from: personal.permFrom, door: personal.permDoor, village: personal.permVillage, district: personal.permDistrict, pin: personal.permPin },
        // Page 2 — education
        education:        educationPayload,
        // Page 4 — UAN
        uanNumber:        form.uanMaster.uanNumber    || "",
        nameAsPerUan:     form.uanMaster.nameAsPerUan || "",
        mobileLinked:     form.uanMaster.mobileLinked || "",
        isActive:         form.uanMaster.isActive     || "",
        pfRecords:        form.pfRecords,
        submitted_at:     Date.now(),
      };

      // API call 1: employee profile (pages 1 + 2 + 4)
      const empRes = await apiFetch(`${API}/employee`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!empRes.ok) {
        const errData = await empRes.json().catch(() => ({}));
        throw new Error(parseError(errData));
      }

      // API call 2: employment history (page 3) — only if data exists
      if (employments.length > 0 && employments[0].companyName) {
        const histRes = await apiFetch(`${API}/employee/employment-history`, {
          method: "POST",
          body: JSON.stringify({ employments, acknowledgements: ack }),
        });
        if (!histRes.ok) {
          const errData = await histRes.json().catch(() => ({}));
          throw new Error(parseError(errData));
        }
      }

      // Clear all local drafts after successful submit
      ["dg_personal","dg_education","dg_employments","dg_ack","dg_uan","dg_employee_id"].forEach(k => localStorage.removeItem(k));
      setSubmitted(true);

    } catch (err) {
      setSubmitError(err.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!ready || !user) return null;

  if (submitted) {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.card, textAlign: "center", padding: "4rem 2rem" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
          <h2 style={{ color: "#2563eb", marginBottom: "0.75rem" }}>Profile Submitted Successfully!</h2>
          <p style={{ color: "#475569", maxWidth: "500px", margin: "0 auto 2rem", lineHeight: "1.6" }}>
            Your employment profile is securely saved on <strong>Datagate</strong>.
            When an employer requests your data, you'll receive a consent notification on your profile page.
          </p>
          <button style={styles.primaryBtn} onClick={() => router.push("/employee/personal")}>Go to My Profile</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {showSignout && <SignoutModal onConfirm={logout} onCancel={() => setShowSignout(false)} />}
      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <span style={{ fontSize: "0.85rem", color: "#475569" }}>👤 {user.name || user.email}</span>
          <button onClick={() => setShowSignout(true)} style={styles.signoutBtn}>Sign out</button>
        </div>
        <ProgressBar currentStep={4} totalSteps={4} />
        <h1 style={styles.title}>UAN & PF Information</h1>

        <div style={styles.section}>
          <h3>UAN Details</h3>
          <div style={styles.row}>
            <div>
              <label style={styles.label}>UAN Number</label>
              <input style={styles.input} maxLength={12} value={form.uanMaster.uanNumber} onChange={e => updateUan("uanNumber", e.target.value.replace(/\D/g,""))} />
              <div style={{ marginTop: "1rem" }}>
                <label style={styles.label}>Name as per UAN</label>
                <input style={styles.input} value={form.uanMaster.nameAsPerUan} onChange={e => updateUan("nameAsPerUan", e.target.value)} />
              </div>
            </div>
            <div>
              <div style={styles.uploadCard}>
                <label style={styles.label}>EPFO Service History Record</label>
                <input type="file" style={{ marginTop: "0.75rem", opacity: 0.5 }} disabled />
                <p style={styles.helperText}>Upload full service history from EPFO portal. <em>(S3 upload — next commit)</em></p>
              </div>
            </div>
          </div>
          <div style={styles.row}>
            <div>
              <label style={styles.label}>Mobile Linked with UAN</label>
              <input style={styles.input} maxLength={10} value={form.uanMaster.mobileLinked} onChange={e => updateUan("mobileLinked", e.target.value.replace(/\D/g,""))} />
            </div>
            <div>
              <label style={styles.label}>Is UAN Active?</label>
              <div style={styles.pillContainer}>
                {["Yes","No"].map(val => <div key={val} style={styles.pill(form.uanMaster.isActive === val)} onClick={() => updateUan("isActive", val)}>{val}</div>)}
              </div>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h3>PF Details (Per Previous Employer)</h3>
          {form.pfRecords.map((record, i) => (
            <div key={i} style={{ marginBottom: "2rem" }}>
              <div style={styles.row}>
                <div>
                  <label style={styles.label}>Company Name</label>
                  <input style={styles.input} value={record.companyName} onChange={e => updatePf(i, "companyName", e.target.value)} />
                </div>
                <div>
                  <label style={styles.label}>PF Member ID</label>
                  <input style={styles.input} value={record.pfMemberId} onChange={e => updatePf(i, "pfMemberId", e.target.value)} />
                </div>
              </div>
              <div style={styles.row}>
                <div>
                  <label style={styles.label}>Date of Joining (EPFO)</label>
                  <input type="date" style={styles.input} value={record.dojEpfo} onChange={e => updatePf(i, "dojEpfo", e.target.value)} />
                </div>
                <div>
                  <label style={styles.label}>Date of Exit (EPFO)</label>
                  <input type="date" style={styles.input} value={record.doeEpfo} onChange={e => updatePf(i, "doeEpfo", e.target.value)} />
                </div>
              </div>
              <div>
                <label style={styles.label}>Was PF Transferred?</label>
                <div style={styles.pillContainer}>
                  {["Yes","No"].map(val => <div key={val} style={styles.pill(record.pfTransferred === val)} onClick={() => updatePf(i, "pfTransferred", val)}>{val}</div>)}
                </div>
              </div>
              {i > 0 && <button style={styles.removeBtn} onClick={() => removePfRecord(i)}>− Remove This Company</button>}
            </div>
          ))}
          <button style={styles.addBtn} onClick={addPfRecord}>+ Add Another Company</button>
        </div>

        {submitError && <div style={styles.errorBox}>⚠️ {submitError}</div>}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button style={styles.secondaryBtn} onClick={() => router.push("/employee/previous")}>Previous</button>
          <button style={{ ...styles.primaryBtn, marginTop: 0, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting…" : "Submit Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
