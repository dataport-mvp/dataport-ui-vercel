// pages/employee/uan.js  — Page 4 of 4  (FINAL SUBMIT)
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
          {saveStatus && <span style={{ color: saveStatus.startsWith("Error") ? "#dc2626" : "#64748b", fontSize: "0.85rem", flex: 1, textAlign: "center" }}>{saveStatus}</span>}
          <button onClick={onConfirm} style={{ flex: 1, padding: "0.75rem", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

const ACKNOWLEDGEMENTS = [
  { id: "truthful",    text: "I confirm that all information provided is true and accurate to the best of my knowledge." },
  { id: "notTampered", text: "I confirm that no documents or records have been tampered with or falsified." },
  { id: "consent",     text: "I consent to Datagate storing my employment profile and sharing it with employers only upon my explicit approval." },
  { id: "liability",   text: "I understand that providing false information may result in legal liability and disqualification from employment." },
  { id: "updates",     text: "I agree to update my profile if any information changes in the future." },
];

const emptyPfRecord = () => ({ companyName: "", pfMemberId: "", dojEpfo: "", doeEpfo: "", pfTransferred: "" });

const hasMeaningfulUan = (data = {}) => {
  const u = data?.uanMaster || {};
  const pf = Array.isArray(data?.pfRecords) ? data.pfRecords : [];
  const uanValues = [u.uanNumber, u.nameAsPerUan, u.mobileLinked, u.isActive];
  const hasUan = uanValues.some(v => String(v || "").trim().length > 0);
  const hasPf = pf.some(r => Object.values(r || {}).some(v => String(v || "").trim().length > 0));
  return hasUan || hasPf;
};

const safeParseLocalJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (_) {
    return fallback;
  }
};

export default function UANPage() {
  const router = useRouter();
  const { user, apiFetch, logout, ready } = useAuth();
  const [showSignout, setShowSignout] = useState(false);

  const [form, setForm] = useState({
    uanMaster: { uanNumber: "", nameAsPerUan: "", mobileLinked: "", isActive: "" },
    pfRecords: [emptyPfRecord()]
  });

  const [acks, setAcks] = useState({
    truthful: false, notTampered: false, consent: false, liability: false, updates: false
  });

  const [submitError, setSubmitError] = useState("");
  const [saveStatus, setSaveStatus]   = useState("");
  const [loading, setLoading]         = useState(false);
  const [submitted, setSubmitted]     = useState(false);

  // Auth guard
  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/employee/login"); return; }
  }, [ready, user, router]);

  // Restore from localStorage, API fallback for cross-device/re-login
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dg_uan");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.uanMaster || parsed.pfRecords) {
          setForm(parsed);
          return;
        }
      }
    } catch (_) {}

    const fetchDraft = async () => {
      if (!ready || !user) return;
      try {
        const res = await apiFetch(`${API}/employee/draft`);
        if (!res.ok) return;
        const d = await res.json();
        setForm({
          uanMaster: {
            uanNumber: d?.uanNumber || "",
            nameAsPerUan: d?.nameAsPerUan || "",
            mobileLinked: d?.mobileLinked || "",
            isActive: d?.isActive || "",
          },
          pfRecords: Array.isArray(d?.pfRecords) && d.pfRecords.length ? d.pfRecords : [emptyPfRecord()],
        });
      } catch (_) {}
    };

    fetchDraft();
  }, [ready, user, apiFetch]);

  // Auto-save UAN form on every change
  useEffect(() => {
    try {
      if (!hasMeaningfulUan(form)) return;
      localStorage.setItem("dg_uan", JSON.stringify(form));
    } catch (_) {}
  }, [form]);

  const updateUan = (field, value) => setForm(prev => ({ ...prev, uanMaster: { ...prev.uanMaster, [field]: value } }));
  const updatePf  = (i, field, value) => setForm(prev => ({ ...prev, pfRecords: prev.pfRecords.map((r, idx) => idx === i ? { ...r, [field]: value } : r) }));
  const addPfRecord    = () => setForm(prev => ({ ...prev, pfRecords: [...prev.pfRecords, emptyPfRecord()] }));
  const removePfRecord = (i) => { if (i === 0) return; setForm(prev => ({ ...prev, pfRecords: prev.pfRecords.filter((_, idx) => idx !== i) })); };
  const toggleAck = (id) => setAcks(prev => ({ ...prev, [id]: !prev[id] }));

  const allAcksChecked = Object.values(acks).every(Boolean);

  const loadServerDraft = async () => {
    try {
      const res = await apiFetch(`${API}/employee/draft`);
      if (!res.ok) return {};
      const d = await res.json();
      return d || {};
    } catch (_) {
      return {};
    }
  };

  const loadServerEmploymentHistory = async (employeeId) => {
    try {
      if (!employeeId) return {};
      const res = await apiFetch(`${API}/employee/employment-history/${employeeId}`);
      if (!res.ok) return {};
      const d = await res.json();
      return d || {};
    } catch (_) {
      return {};
    }
  };

  /* ── FINAL SUBMIT ── */
  const handleSubmit = async () => {
    if (!allAcksChecked) {
      setSubmitError("Please confirm all acknowledgements before submitting.");
      return;
    }
    setSubmitError("");
    setLoading(true);

    try {
      const personalLocal    = JSON.parse(localStorage.getItem("dg_personal")    || "{}");
      const educationLocal   = JSON.parse(localStorage.getItem("dg_education")   || "{}");
      const employmentsLocal = JSON.parse(localStorage.getItem("dg_employments") || "[]");
      const ackLocal         = JSON.parse(localStorage.getItem("dg_ack")         || "{}");

      const serverDraft = await loadServerDraft();
      const inferredEmpId = localStorage.getItem("dg_employee_id") || serverDraft?.employee_id;
      const serverHist  = await loadServerEmploymentHistory(inferredEmpId);

      const personal = { ...serverDraft, ...personalLocal };
      const education = Object.keys(educationLocal || {}).length ? educationLocal : (serverDraft.education || {});
      const employments = Array.isArray(employmentsLocal) && employmentsLocal.length ? employmentsLocal : (Array.isArray(serverHist?.employments) ? serverHist.employments : []);
      const ack = Object.keys(ackLocal || {}).length ? ackLocal : (serverHist?.acknowledgements || {});
      const empId = localStorage.getItem("dg_employee_id") || serverDraft?.employee_id || `emp-${Date.now()}`;

      // Build education dict from flat localStorage keys
      const educationPayload = education?.classX ? education : {
        classX:        { school: education.xSchool, board: education.xBoard, hallTicket: education.xHall, from: education.xFrom, to: education.xTo, address: education.xAddress, yearOfPassing: education.xYear, resultType: education.xResultType, resultValue: education.xResultValue, medium: education.xMedium },
        intermediate:  { college: education.iCollege, board: education.iBoard, hallTicket: education.iHall, from: education.iFrom, to: education.iTo, address: education.iAddress, mode: education.iMode, yearOfPassing: education.iYear, resultType: education.iResultType, resultValue: education.iResultValue, medium: education.iMedium },
        undergraduate: { college: education.ugCollege, university: education.ugUniversity, course: education.ugCourse, hallTicket: education.ugHall, from: education.ugFrom, to: education.ugTo, address: education.ugAddress, mode: education.ugMode, yearOfPassing: education.ugYear, resultType: education.ugResultType, resultValue: education.ugResultValue, backlogs: education.ugBacklogs, medium: education.ugMedium },
        postgraduate:  { college: education.pgCollege, university: education.pgUniversity, course: education.pgCourse, hallTicket: education.pgHall, from: education.pgFrom, to: education.pgTo, address: education.pgAddress, mode: education.pgMode, yearOfPassing: education.pgYear, resultType: education.pgResultType, resultValue: education.pgResultValue, backlogs: education.pgBacklogs, medium: education.pgMedium },
      };

      const payload = {
        employee_id:      empId,
        status:           "submitted",
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
        aadhaar:          personal.aadhar || personal.aadhaar || "",
        pan:              personal.pan          || "",
        currentAddress:   {
          from: personal.curFrom || personal?.currentAddress?.from || "",
          to: personal.curTo || personal?.currentAddress?.to || "",
          door: personal.curDoor || personal?.currentAddress?.door || "",
          village: personal.curVillage || personal?.currentAddress?.village || "",
          district: personal.curDistrict || personal?.currentAddress?.district || "",
          pin: personal.curPin || personal?.currentAddress?.pin || "",
        },
        permanentAddress: {
          from: personal.permFrom || personal?.permanentAddress?.from || "",
          door: personal.permDoor || personal?.permanentAddress?.door || "",
          village: personal.permVillage || personal?.permanentAddress?.village || "",
          district: personal.permDistrict || personal?.permanentAddress?.district || "",
          pin: personal.permPin || personal?.permanentAddress?.pin || "",
        },
        education:        educationPayload,
        uanNumber:        form.uanMaster.uanNumber    || "",
        nameAsPerUan:     form.uanMaster.nameAsPerUan || "",
        mobileLinked:     form.uanMaster.mobileLinked || "",
        isActive:         form.uanMaster.isActive     || "",
        pfRecords:        form.pfRecords,
        acknowledgements_profile: acks,
        submitted_at:     Date.now(),
      };

      // API call 1: employee profile (pages 1+2+4)
      const empRes = await apiFetch(`${API}/employee`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!empRes.ok) {
        const errData = await empRes.json().catch(() => ({}));
        throw new Error(parseError(errData));
      }

      // API call 2: employment history (page 3)
      const hasEmploymentHistory = Array.isArray(employments) && employments.some((e) =>
        e && Object.values(e).some((v) => {
          if (v == null) return false;
          if (typeof v === "string") return v.trim().length > 0;
          if (Array.isArray(v)) return v.length > 0;
          if (typeof v === "object") return Object.values(v).some((inner) => String(inner || "").trim().length > 0);
          return Boolean(v);
        })
      );

      if (hasEmploymentHistory) {
        const histRes = await apiFetch(`${API}/employee/employment-history`, {
          method: "POST",
          body: JSON.stringify({ employee_id: empId, employments, acknowledgements: ack }),
        });
        if (!histRes.ok) {
          const errData = await histRes.json().catch(() => ({}));
          throw new Error(parseError(errData));
        }
      }

      // Clear all local drafts
      ["dg_personal","dg_education","dg_employments","dg_ack","dg_uan","dg_employee_id"].forEach(k => localStorage.removeItem(k));
      setSubmitted(true);

    } catch (err) {
      setSubmitError(err.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!ready || !user) return null;

  /* ── SUCCESS SCREEN ── */
  if (submitted) {
    return (
      <div style={styles.page}>
        <div style={{ maxWidth: 600, margin: "auto", paddingTop: "4rem", textAlign: "center" }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "3rem 2rem", boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 64, marginBottom: "1rem" }}>✅</div>
            <h2 style={{ color: "#16a34a", fontSize: 24, marginBottom: "0.5rem" }}>Data Saved Successfully!</h2>
            <p style={{ color: "#374151", fontSize: 16, lineHeight: 1.6, marginBottom: "0.5rem" }}>
              Your employment profile is now securely stored with <strong>Datagate</strong>.
            </p>
            <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6, marginBottom: "2rem", padding: "1rem", background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0" }}>
              🔒 Your data is <strong>private by default</strong>. We will only share your information with an employer when you explicitly approve their consent request. You are always in control.
            </p>
            <button
              style={{ padding: "0.85rem 2.5rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}
              onClick={() => router.push("/employee/personal")}
            >
              Go to My Profile & Consents →
            </button>
          </div>
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

        {/* UAN Details */}
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
                <p style={styles.helperText}>Upload from EPFO portal. <em>(S3 upload — next commit)</em></p>
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
                {["Yes","No"].map(val => (
                  <div key={val} style={styles.pill(form.uanMaster.isActive === val)} onClick={() => updateUan("isActive", val)}>{val}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PF Records */}
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
                  {["Yes","No"].map(val => (
                    <div key={val} style={styles.pill(record.pfTransferred === val)} onClick={() => updatePf(i, "pfTransferred", val)}>{val}</div>
                  ))}
                </div>
              </div>
              {i > 0 && <button style={styles.removeBtn} onClick={() => removePfRecord(i)}>− Remove This Company</button>}
            </div>
          ))}
          <button style={styles.addBtn} onClick={addPfRecord}>+ Add Another Company</button>
        </div>

        {/* Acknowledgements */}
        <div style={styles.section}>
          <h3>Declaration & Acknowledgement</h3>
          <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1rem" }}>
            Please read and confirm each statement before submitting your profile.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {ACKNOWLEDGEMENTS.map(({ id, text }) => (
              <div
                key={id}
                onClick={() => toggleAck(id)}
                style={{
                  display: "flex", gap: "0.75rem", alignItems: "flex-start",
                  padding: "0.85rem 1rem",
                  borderRadius: 10,
                  border: `1.5px solid ${acks[id] ? "#16a34a" : "#e2e8f0"}`,
                  background: acks[id] ? "#f0fdf4" : "#fafafa",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
                  border: `2px solid ${acks[id] ? "#16a34a" : "#cbd5e1"}`,
                  background: acks[id] ? "#16a34a" : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {acks[id] && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700, lineHeight: 1 }}>✓</span>}
                </div>
                <span style={{ fontSize: "0.88rem", color: acks[id] ? "#15803d" : "#374151", lineHeight: 1.5 }}>{text}</span>
              </div>
            ))}
          </div>

          {!allAcksChecked && (
            <p style={{ fontSize: "0.8rem", color: "#f59e0b", marginTop: "0.75rem" }}>
              ⚠️ Please confirm all {ACKNOWLEDGEMENTS.length} statements to enable submission.
            </p>
          )}
        </div>

        {submitError && (
          <div style={{ color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.9rem" }}>
            ⚠️ {submitError}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <button style={styles.secondaryBtn} onClick={async () => {
            setSaveStatus("Saving draft...");
            try {
              await saveDraftServer();
              setSaveStatus("Draft saved ✓");
              router.push("/employee/previous");
            } catch (err) {
              setSaveStatus(`Error: ${err.message || "Could not save draft"}`);
            }
          }}>Previous</button>
          {saveStatus && <span style={{ color: saveStatus.startsWith("Error") ? "#dc2626" : "#64748b", fontSize: "0.85rem", flex: 1, textAlign: "center" }}>{saveStatus}</span>}
          <button
            style={{
              ...styles.primaryBtn,
              opacity: (!allAcksChecked || loading) ? 0.5 : 1,
              cursor: (!allAcksChecked || loading) ? "not-allowed" : "pointer",
            }}
            onClick={handleSubmit}
            disabled={!allAcksChecked || loading}
          >
            {loading ? "Submitting…" : "Submit Profile"}
          </button>
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
  label:        { fontSize: "0.85rem", color: "#475569", display: "block", marginBottom: "4px" },
  input:        { width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box" },
  pillContainer:{ display: "flex", gap: "1rem", marginTop: "0.5rem" },
  pill: (active) => ({ padding: "0.5rem 1rem", borderRadius: "20px", cursor: "pointer", border: active ? "1px solid #2563eb" : "1px solid #cbd5e1", background: active ? "#2563eb" : "#fff", color: active ? "#fff" : "#000" }),
  uploadCard:   { border: "1px dashed #cbd5e1", padding: "1.5rem", borderRadius: "12px", background: "#f8fafc" },
  helperText:   { fontSize: "0.75rem", marginTop: "0.5rem", color: "#64748b" },
  addBtn:       { cursor: "pointer", color: "#2563eb", background: "none", border: "none", fontSize: "1rem" },
  removeBtn:    { cursor: "pointer", color: "#dc2626", marginTop: "0.75rem", background: "none", border: "none", fontSize: "0.9rem" },
  primaryBtn:   { padding: "0.9rem 2.5rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem", fontWeight: 700 },
  secondaryBtn: { padding: "0.9rem 2.5rem", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer" },
  signoutBtn:   { padding: "0.4rem 1rem", border: "1px solid #e2e8f0", borderRadius: 7, background: "#fff", color: "#64748b", fontSize: "0.85rem", cursor: "pointer", fontWeight: 600 },
};
