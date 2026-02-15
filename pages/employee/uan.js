import { useState } from "react";
import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";

/* ---------- STYLES ---------- */
const styles = {
  page: { background: "#f1f5f9", padding: "2rem", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" },
  card: { maxWidth: "980px", margin: "auto", background: "#fff", padding: "2rem", borderRadius: "14px", boxShadow: "0 12px 30px rgba(0,0,0,0.08)" },
  title: { marginBottom: "2rem" },
  section: { marginBottom: "2.5rem" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" },
  label: { fontSize: "0.85rem", color: "#475569" },
  input: { width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1" },
  pillContainer: { display: "flex", gap: "1rem", marginTop: "0.5rem" },
  pill: (active) => ({ padding: "0.5rem 1rem", borderRadius: "20px", cursor: "pointer", border: active ? "1px solid #2563eb" : "1px solid #cbd5e1", background: active ? "#2563eb" : "#fff", color: active ? "#fff" : "#000" }),
  uploadCard: { border: "1px dashed #cbd5e1", padding: "1.5rem", borderRadius: "12px", background: "#f8fafc" },
  helperText: { fontSize: "0.75rem", marginTop: "0.5rem", color: "#64748b" },
  addBtn: { marginTop: "1rem", cursor: "pointer", color: "#2563eb" },
  removeBtn: { cursor: "pointer", color: "#dc2626", marginTop: "0.75rem" },
  primaryBtn: { marginTop: "2rem", padding: "0.9rem 2.5rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }
};

export default function UANPage() {
  const router = useRouter();
  const api = process.env.NEXT_PUBLIC_API_URL_PROD;

  const [form, setForm] = useState({
    uanMaster: { uanNumber: "", nameAsPerUan: "", mobileLinked: "", isActive: "", aadhaarLinked: "", panLinked: "", serviceHistory: null },
    pfRecords: [{ companyName: "", pfMemberId: "", dojEpfo: "", doeEpfo: "", pfTransferred: "" }]
  });

  const updateUan = (field, value) => setForm((prev) => ({ ...prev, uanMaster: { ...prev.uanMaster, [field]: value } }));
  const updatePf = (index, field, value) => { const updated = [...form.pfRecords]; updated[index][field] = value; setForm({ ...form, pfRecords: updated }); };
  const addPfRecord = () => setForm({ ...form, pfRecords: [...form.pfRecords, { companyName: "", pfMemberId: "", dojEpfo: "", doeEpfo: "", pfTransferred: "" }] });
  const removePfRecord = (index) => { if (index === 0) return; setForm({ ...form, pfRecords: form.pfRecords.filter((_, i) => i !== index) }); };

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${api}/employee/uan-details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      await res.json();
      router.push("/consent");
    } catch (err) {
      console.error("Error saving UAN details:", err);
      alert("Failed to save UAN details");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <ProgressBar step={4} />
        <h1 style={styles.title}>UAN & PF Information</h1>

        {/* UAN MASTER SECTION */}
        <div style={styles.section}>
          <h3>UAN Details</h3>
          <div style={styles.row}>
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
            <div>
              <div style={styles.uploadCard}>
                <label style={styles.label}>EPFO Service History Record</label>
                <input
                  type="file"
                  style={{ marginTop: "0.75rem" }}
                  onChange={(e) => updateUan("serviceHistory", e.target.files[0])}
                />
                <p style={styles.helperText}>Upload full service history screenshot from EPFO portal.</p>
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

        {/* PF RECORDS SECTION */}
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
                <div style={styles.removeBtn} onClick={() => removePfRecord(index)}>
                  - Remove This Company
                </div>
              )}
            </div>
          ))}
          <div style={styles.addBtn} onClick={addPfRecord}>
            +