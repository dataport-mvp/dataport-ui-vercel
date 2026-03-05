// components/FileUpload.js
// Reusable S3 upload component — uploads directly to S3 via pre-signed URL.
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

export default function FileUpload({ label, category, subKey, companyId, apiFetch, value, onChange, disabled }) {
  const [status,   setStatus]   = useState("");
  const [progress, setProgress] = useState(0);
  const [error,    setError]    = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) { setError("Only PDF, JPG, PNG files allowed"); return; }
    if (file.size > 5 * 1024 * 1024)  { setError("File must be under 5MB"); return; }
    setError(""); setStatus("uploading"); setProgress(10);
    try {
      const body = { category, sub_key: subKey, filename: file.name };
      if (companyId) body.company_id = companyId;
      const res = await apiFetch(`${API}/upload/presigned`, {
        method: "POST",
        body:   JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Could not get upload URL");
      }
      const { upload_url, s3_key } = await res.json();
      setProgress(40);
      const uploadRes = await fetch(upload_url, {
        method:  "PUT",
        body:    file,
        headers: { "Content-Type": "application/octet-stream" },
      });
      if (!uploadRes.ok) throw new Error("Upload to S3 failed");
      setProgress(100); setStatus("done");
      onChange(s3_key);
    } catch (err) {
      setStatus("error"); setError(err.message || "Upload failed");
    }
  };

  const isUploaded = !!value;
  const filename   = value ? (value.includes("__") ? value.split("__").slice(1).join("__") : value.split("/").pop()) : null;

  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <label style={fs.label}>{label}</label>
      <div style={{ ...fs.box, borderColor: status === "error" ? "#ef4444" : (status === "done" || isUploaded) ? "#16a34a" : "#cbd5e1", background: (status === "done" || isUploaded) ? "#f0fdf4" : "#fafafa" }}>
        {isUploaded && status !== "uploading" ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontSize: "0.8rem", color: "#15803d" }}>✓ {filename}</span>
            <label style={fs.changeBtn}>Change<input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFile} disabled={disabled} style={{ display: "none" }} /></label>
          </div>
        ) : status === "uploading" ? (
          <div>
            <div style={{ fontSize: "0.8rem", color: "#2563eb", marginBottom: 4 }}>Uploading… {progress}%</div>
            <div style={{ height: 4, background: "#e2e8f0", borderRadius: 2 }}><div style={{ height: 4, background: "#2563eb", borderRadius: 2, width: `${progress}%`, transition: "width 0.3s" }} /></div>
          </div>
        ) : (
          <label style={fs.uploadBtn}>📎 Choose file (PDF / JPG / PNG, max 5MB)<input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFile} disabled={disabled} style={{ display: "none" }} /></label>
        )}
      </div>
      {error && <p style={fs.error}>{error}</p>}
    </div>
  );
}

const fs = {
  label:     { fontSize: "0.85rem", color: "#475569", display: "block", marginBottom: 4 },
  box:       { border: "1.5px dashed", borderRadius: 8, padding: "0.65rem 0.85rem", transition: "all 0.2s" },
  uploadBtn: { fontSize: "0.82rem", color: "#2563eb", cursor: "pointer", fontWeight: 500 },
  changeBtn: { fontSize: "0.75rem", color: "#2563eb", cursor: "pointer", padding: "0.2rem 0.6rem", border: "1px solid #2563eb", borderRadius: 5, background: "#fff", whiteSpace: "nowrap" },
  error:     { fontSize: "0.78rem", color: "#ef4444", marginTop: 3 },
};
