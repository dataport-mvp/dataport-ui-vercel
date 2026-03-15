// components/FileUpload.js
// Uploads directly to S3 via pre-signed PUT URL.
// Deterministic S3 key: {employee_id}/{category}/{subKey}.{ext}
// Re-uploading overwrites the same S3 object — no orphans.
// Removing calls DELETE /upload — file is physically deleted from S3 immediately.
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
const ALLOWED_EXTS  = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/jpg": "jpg" };
const MAX_SIZE      = 5 * 1024 * 1024; // 5MB

export default function FileUpload({ label, category, subKey, companyId, apiFetch, value, onChange, disabled }) {
  const [status,   setStatus]   = useState(""); // "" | "uploading" | "deleting" | "done" | "error"
  const [progress, setProgress] = useState(0);
  const [error,    setError]    = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) { setError("Only PDF, JPG, PNG allowed"); return; }
    if (file.size > MAX_SIZE)               { setError("File must be under 5MB"); return; }

    setError(""); setStatus("uploading"); setProgress(15);

    // Create a local object URL for immediate preview (images only)
    // This allows the photo circle to show instantly without waiting for S3
    const localPreviewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;

    try {
      const ext            = ALLOWED_EXTS[file.type] || "pdf";
      const stableFilename = `${subKey}.${ext}`;

      const body = { category, sub_key: subKey, filename: stableFilename };
      if (companyId) body.company_id = companyId;

      // Step 1: Get pre-signed PUT URL from backend (RBAC enforced there)
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

      // Step 2: PUT file directly to S3 — Lambda never touches file bytes
      const uploadRes = await fetch(upload_url, {
        method:  "PUT",
        body:    file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadRes.ok) throw new Error("Upload to S3 failed");

      setProgress(100);
      setStatus("done");
      // Pass s3_key as first arg, localPreviewUrl as second arg
      // personal.js uses the second arg to set photoPreview immediately
      onChange(s3_key, localPreviewUrl);
    } catch (err) {
      setStatus("error");
      setError(typeof err.message==="string"?err.message:"Upload failed");
      setProgress(0);
      // Revoke the object URL if upload failed
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    }
  };

  const handleRemove = async () => {
    if (!value) return;
    setError(""); setStatus("deleting");

    try {
      // DELETE /upload?s3_key=... — physically removes the file from S3
      const res = await apiFetch(`${API}/upload?s3_key=${encodeURIComponent(value)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Could not delete file");
      }

      setStatus("");
      onChange("", null); // clear s3_key and preview in parent
    } catch (err) {
      setStatus("error");
      setError(typeof err.message==="string"?err.message:"Delete failed");
    }
  };

  const isUploaded  = !!(value && typeof value==="string");
  const displayName = value && typeof value==="string" ? value.split("/").pop() : null;

  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <label style={fs.label}>{label}</label>
      <div style={{
        ...fs.box,
        borderColor: error || status === "error" ? "#ef4444"
                   : isUploaded || status === "done" ? "#16a34a"
                   : "#cbd5e1",
        background:  isUploaded || status === "done" ? "#f0fdf4" : "#fafafa",
      }}>
        {status === "uploading" ? (
          <div>
            <div style={{ fontSize: "0.8rem", color: "#2563eb", marginBottom: 4 }}>Uploading… {progress}%</div>
            <div style={{ height: 4, background: "#e2e8f0", borderRadius: 2 }}>
              <div style={{ height: 4, background: "#2563eb", borderRadius: 2, width: `${progress}%`, transition: "width 0.3s" }} />
            </div>
          </div>
        ) : status === "deleting" ? (
          <div style={{ fontSize: "0.8rem", color: "#ef4444" }}>Removing file…</div>
        ) : isUploaded ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontSize: "0.82rem", color: "#15803d", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              ✓ {displayName}
            </span>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <label style={fs.changeBtn}>
                Replace
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFile}
                  disabled={disabled}
                  style={{ display: "none" }}
                />
              </label>
              <button
                onClick={handleRemove}
                disabled={disabled}
                style={fs.removeBtn}
                title="Remove file"
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <label style={fs.uploadBtn}>
            📎 Choose file (PDF / JPG / PNG, max 5MB)
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFile}
              disabled={disabled}
              style={{ display: "none" }}
            />
          </label>
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
  removeBtn: { fontSize: "0.75rem", color: "#ef4444", cursor: "pointer", padding: "0.2rem 0.5rem", border: "1px solid #fca5a5", borderRadius: 5, background: "#fff", whiteSpace: "nowrap" },
  error:     { fontSize: "0.78rem", color: "#ef4444", marginTop: 3, margin: 0 },
};