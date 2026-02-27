// pages/employee/uan.js  ← Page 4 of 4

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL_PROD;

const emptyPFRecord = () => ({
  companyName: "",
  pfMemberId: "",
  dojEpfo: "",
  doeEpfo: "",
  pfTransferred: "No",
});

export default function UanDetails() {
  const router = useRouter();
  const { token, user } = useAuth();

  const [uanNumber, setUanNumber] = useState("");
  const [nameAsPerUan, setNameAsPerUan] = useState("");
  const [mobileLinked, setMobileLinked] = useState("");
  const [isActive, setIsActive] = useState("");
  const [pfRecords, setPfRecords] = useState([emptyPFRecord()]);
  const [saveStatus, setSaveStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("uanDetails");
    if (saved) {
      const data = JSON.parse(saved);
      setUanNumber(data.uanNumber || "");
      setNameAsPerUan(data.nameAsPerUan || "");
      setMobileLinked(data.mobileLinked || "");
      setIsActive(data.isActive || "");
      if (data.pfRecords?.length) setPfRecords(data.pfRecords);
    }
  }, []);

  // PF record helpers
  const updatePF = (index, field, value) => {
    setPfRecords((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addPFRecord = () => setPfRecords((prev) => [...prev, emptyPFRecord()]);
  const removePFRecord = (index) => {
    if (pfRecords.length === 1) return;
    setPfRecords((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Final Submit ─────────────────────────────────────────────────

  const handleSubmit = async () => {
    setLoading(true);
    setSaveStatus("Submitting...");

    const uanData = { uanNumber, nameAsPerUan, mobileLinked, isActive, pfRecords };
    localStorage.setItem("uanDetails", JSON.stringify(uanData));

    try {
      // Collect all data from previous pages
      const personalData = JSON.parse(localStorage.getItem("personalDetails") || "{}");
      const educationData = JSON.parse(localStorage.getItem("educationDetails") || "{}");
      const employmentHistory = JSON.parse(localStorage.getItem("employmentHistory") || "[]");
      const acknowledgements = JSON.parse(localStorage.getItem("acknowledgements") || "{}");

      const completePayload = {
        ...personalData,
        ...educationData,
        employmentHistory,
        acknowledgements,
        uanNumber,
        nameAsPerUan,
        mobileLinked,
        isActive,
        pfRecords,
        status: "submitted",
        employee_id: personalData.employee_id || `emp-${Date.now()}`,
        submitted_at: Date.now(),
      };

      const res = await fetch(`${API_URL}/employee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(completePayload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Submission failed");
      }

      // Also save employment history separately
      if (employmentHistory.length > 0) {
        await fetch(`${API_URL}/employee/employment-history`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ employments: employmentHistory, acknowledgements }),
        });
      }

      // Clear localStorage after successful submission
      ["personalDetails", "educationDetails", "employmentHistory", "acknowledgements", "uanDetails"].forEach(
        (key) => localStorage.removeItem(key)
      );

      setSaveStatus("Submitted ✓");
      setSubmitted(true);
    } catch (err) {
      setSaveStatus(`Error: ${err.message}`);
    }

    setLoading(false);
  };

  // ─── Styles ──────────────────────────────────────────────────────

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(to right, #e0f7fa, #f1f8e9)",
      padding: "2rem",
      fontFamily: "Arial, sans-serif",
    },
    card: {
      background: "#fff",
      borderRadius: "12px",
      padding: "2rem",
      maxWidth: "860px",
      margin: "0 auto",
      boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
    },
    progress: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "2rem",
    },
    step: (active) => ({
      flex: 1,
      height: "6px",
      background: active ? "#00838f" : "#cce5e8",
      borderRadius: "4px",
      margin: "0 4px",
    }),
    h2: { color: "#00838f", marginBottom: "1.5rem" },
    h3: {
      color: "#333",
      marginBottom: "1rem",
      borderBottom: "1px solid #eee",
      paddingBottom: "0.5rem",
    },
    section: { marginBottom: "1.5rem" },
    row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" },
    label: { display: "block", fontSize: "0.85rem", color: "#555", marginBottom: "4px", fontWeight: "600" },
    input: {
      width: "100%",
      padding: "0.55rem 0.75rem",
      borderRadius: "6px",
      border: "1px solid #ccc",
      fontSize: "0.95rem",
      boxSizing: "border-box",
    },
    select: {
      width: "100%",
      padding: "0.55rem 0.75rem",
      borderRadius: "6px",
      border: "1px solid #ccc",
      fontSize: "0.95rem",
      background: "#fff",
      boxSizing: "border-box",
    },
    pfBlock: {
      border: "1px solid #b2dfdb",
      borderRadius: "10px",
      padding: "1.5rem",
      marginBottom: "1.5rem",
      background: "#f9fffe",
    },
    pfHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1rem",
    },
    removeBtn: {
      background: "#ffebee",
      color: "#c62828",
      border: "1px solid #ef9a9a",
      borderRadius: "6px",
      padding: "0.3rem 0.8rem",
      cursor: "pointer",
      fontSize: "0.85rem",
    },
    addBtn: {
      background: "#e0f2f1",
      color: "#00838f",
      border: "1px solid #80cbc4",
      borderRadius: "8px",
      padding: "0.6rem 1.4rem",
      cursor: "pointer",
      fontWeight: "600",
      marginBottom: "2rem",
    },
    infoBox: {
      background: "#e8f5e9",
      border: "1px solid #a5d6a7",
      borderRadius: "8px",
      padding: "1rem",
      marginBottom: "1.5rem",
      fontSize: "0.9rem",
      color: "#2e7d32",
    },
    buttonRow: {
      display: "flex",
      gap: "1rem",
      marginTop: "2rem",
      justifyContent: "flex-end",
    },
    backBtn: {
      padding: "0.75rem 2rem",
      borderRadius: "8px",
      border: "1px solid #ccc",
      background: "#fff",
      cursor: "pointer",
      fontSize: "1rem",
    },
    submitBtn: {
      padding: "0.75rem 2.5rem",
      borderRadius: "8px",
      border: "none",
      background: loading ? "#b2dfdb" : "#00838f",
      color: "#fff",
      cursor: loading ? "not-allowed" : "pointer",
      fontWeight: "700",
      fontSize: "1rem",
    },
    statusText: { fontSize: "0.85rem", color: "#555", alignSelf: "center" },
    successCard: {
      textAlign: "center",
      padding: "3rem 2rem",
    },
    successIcon: { fontSize: "4rem", marginBottom: "1rem" },
    successTitle: { color: "#00838f", fontSize: "1.8rem", marginBottom: "0.75rem" },
    successMsg: { color: "#555", marginBottom: "2rem", lineHeight: "1.6" },
    homeBtn: {
      padding: "0.85rem 2.5rem",
      borderRadius: "8px",
      border: "none",
      background: "#00838f",
      color: "#fff",
      cursor: "pointer",
      fontWeight: "700",
      fontSize: "1rem",
    },
  };

  // ─── Success Screen ───────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}>✅</div>
            <h2 style={styles.successTitle}>Profile Submitted Successfully!</h2>
            <p style={styles.successMsg}>
              Your employment profile has been securely saved on <strong>Datagate</strong>.
              When a prospective employer or BGV agency requests your details, you will receive a
              consent notification to approve or deny access.
            </p>
            <button style={styles.homeBtn} onClick={() => router.push("/")}>
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* Progress Bar */}
        <div style={styles.progress}>
          {[1, 2, 3, 4].map((s) => (
            <div key={s} style={styles.step(s <= 4)} />
          ))}
        </div>
        <p style={{ textAlign: "right", fontSize: "0.85rem", color: "#888", marginTop: "-1rem", marginBottom: "1.5rem" }}>
          Step 4 of 4
        </p>

        <h2 style={styles.h2}>UAN & PF Details</h2>

        <div style={styles.infoBox}>
          ℹ️ Your UAN (Universal Account Number) is issued by EPFO. It remains the same across all
          employers. You can find it on your payslip or by visiting the EPFO Member Portal.
        </div>

        {/* ── UAN Details ────────────────────────────────────────── */}
        <h3 style={styles.h3}>UAN Information</h3>
        <div style={styles.section}>
          <div style={styles.row}>
            <div>
              <label style={styles.label}>UAN Number</label>
              <input style={styles.input} value={uanNumber}
                onChange={(e) => setUanNumber(e.target.value)}
                placeholder="12-digit UAN number" maxLength={12} />
            </div>
            <div>
              <label style={styles.label}>Name as per UAN (EPFO records)</label>
              <input style={styles.input} value={nameAsPerUan}
                onChange={(e) => setNameAsPerUan(e.target.value)}
                placeholder="Exactly as shown on EPFO portal" />
            </div>
          </div>
          <div style={styles.row}>
            <div>
              <label style={styles.label}>Mobile Linked with UAN</label>
              <input style={styles.input} type="tel" value={mobileLinked}
                onChange={(e) => setMobileLinked(e.target.value)}
                placeholder="10-digit mobile" maxLength={10} />
            </div>
            <div>
              <label style={styles.label}>UAN Activation Status</label>
              <select style={styles.select} value={isActive}
                onChange={(e) => setIsActive(e.target.value)}>
                <option value="">Select status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Not Sure">Not Sure</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── PF Member Records ──────────────────────────────────── */}
        <h3 style={styles.h3}>PF Member ID Records (per employer)</h3>
        <p style={{ fontSize: "0.85rem", color: "#777", marginBottom: "1rem" }}>
          Add one PF record for each company you were employed with. The PF Member ID is assigned per employer and is different from UAN.
        </p>

        {pfRecords.map((pf, idx) => (
          <div key={idx} style={styles.pfBlock}>
            <div style={styles.pfHeader}>
              <strong style={{ color: "#00695c" }}>PF Record {idx + 1}</strong>
              {pfRecords.length > 1 && (
                <button style={styles.removeBtn} onClick={() => removePFRecord(idx)}>
                  Remove
                </button>
              )}
            </div>

            <div style={styles.row}>
              <div>
                <label style={styles.label}>Company Name *</label>
                <input style={styles.input} value={pf.companyName}
                  onChange={(e) => updatePF(idx, "companyName", e.target.value)}
                  placeholder="e.g. Infosys Ltd" />
              </div>
              <div>
                <label style={styles.label}>PF Member ID *</label>
                <input style={styles.input} value={pf.pfMemberId}
                  onChange={(e) => updatePF(idx, "pfMemberId", e.target.value)}
                  placeholder="e.g. MH/BAN/12345/000/0000001" />
              </div>
            </div>

            <div style={styles.row}>
              <div>
                <label style={styles.label}>Date of Joining (EPFO) *</label>
                <input style={styles.input} type="date" value={pf.dojEpfo}
                  onChange={(e) => updatePF(idx, "dojEpfo", e.target.value)} />
              </div>
              <div>
                <label style={styles.label}>Date of Exit (EPFO)</label>
                <input style={styles.input} type="date" value={pf.doeEpfo}
                  onChange={(e) => updatePF(idx, "doeEpfo", e.target.value)} />
              </div>
            </div>

            <div style={{ maxWidth: "50%" }}>
              <label style={styles.label}>PF Transferred to Current UAN?</label>
              <select style={styles.select} value={pf.pfTransferred}
                onChange={(e) => updatePF(idx, "pfTransferred", e.target.value)}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="Pending">Pending</option>
                <option value="Not Applicable">Not Applicable</option>
              </select>
            </div>
          </div>
        ))}

        <button style={styles.addBtn} onClick={addPFRecord}>
          + Add Another PF Record
        </button>

        {/* ── Final Declaration ──────────────────────────────────── */}
        <div style={{
          background: "#fff8e1",
          border: "1px solid #ffe082",
          borderRadius: "8px",
          padding: "1rem 1.5rem",
          marginBottom: "1.5rem",
          fontSize: "0.9rem",
          color: "#5d4037",
        }}>
          <strong>Declaration:</strong> I hereby confirm that all the information provided in this
          profile is true and accurate to the best of my knowledge. I consent to Datagate storing my
          data securely and sharing it with third parties only upon my explicit approval.
        </div>

        {/* ── Buttons ─────────────────────────────────────────────── */}
        <div style={styles.buttonRow}>
          <span style={styles.statusText}>{saveStatus}</span>
          <button style={styles.backBtn} onClick={() => router.push("/employee/previous")}>
            ← Back
          </button>
          <button style={styles.submitBtn} disabled={loading} onClick={handleSubmit}>
            {loading ? "Submitting..." : "Submit Profile ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}
