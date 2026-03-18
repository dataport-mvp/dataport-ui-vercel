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

export default function FileUpload({
  label,
  category,
  subKey,
  employeeId,
  companyId,
  apiFetch,
  value,
  onChange,
  disabled
}) {
  const [status,   setStatus]   = useState("");
  const [progress, setProgress] = useState(0);
  const [error,    setError]    = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ File validations
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only PDF, JPG, PNG allowed");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("File must be under 5MB");
      return;
    }

    // ✅ 🔥 CRITICAL FIX — enforce company_id only when needed
    if (category === "employment" && !companyId) {
      setError("Internal error: company context missing for this upload");
      return;
    }

    setError("");
    setStatus("uploading");
    setProgress(15);

    const localPreviewUrl = file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : null;

    try {
      const ext            = ALLOWED_EXTS[file.type] || "pdf";
      const stableFilename = `${subKey}.${ext}`;

      // ✅ Clean payload builder
      const body = {
        category,
        sub_key: subKey,
        filename: stableFilename,
        employee_id: employeeId,
      };

      // Only attach company_id when required
      if (category === "employment") {
        body.company_id = companyId;
      }

      // 🚀 Step 1: get presigned URL
      const res = await apiFetch(`${API}/upload/presigned`, {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Could not get upload URL");
      }

      const { upload_url, s3_key } = await res.json();
      setProgress(40);

      // 🚀 Step 2: upload to S3
      const uploadRes = await fetch(upload_url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadRes.ok) throw new Error("Upload to S3 failed");

      setProgress(100);
      setStatus("done");

      onChange(s3_key, localPreviewUrl);

    } catch (err) {
      setStatus("error");
      setError(typeof err.message === "string" ? err.message : "Upload failed");
      setProgress(0);

      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    setError("");
    setStatus("deleting");

    try {
      const res = await apiFetch(
        `${API}/upload?s3_key=${encodeURIComponent(value)}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Could not delete file");
      }

      setStatus("");
      onChange("", null);

    } catch (err) {
      setStatus("error");
      setError(typeof err.message === "string" ? err.message : "Delete failed");
    }
  };

  const isUploaded  = !!(value && typeof value === "string");
  const displayName = value ? value.split("/").pop() : null;

  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <label style={fs.label}>{label}</label>

      <div
        style={{
          ...fs.box,
          borderColor:
            error || status === "error"
              ? "#ef4444"
              : isUploaded || status === "done"
              ? "#16a34a"
              : "#cbd5e1",
          background:
            isUploaded || status === "done" ? "#f0fdf4" : "#fafafa",
        }}
      >
        {status === "uploading" ? (
          <div>
            <div style={{ fontSize: "0.8rem", color: "#2563eb" }}>
              Uploading… {progress}%
            </div>
            <div style={{ height: 4, background: "#e2e8f0" }}>
              <div
                style={{
                  height: 4,
                  background: "#2563eb",
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
        ) : status === "deleting" ? (
          <div style={{ fontSize: "0.8rem", color: "#ef4444" }}>
            Removing file…
          </div>
        ) : isUploaded ? (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>✓ {displayName}</span>
            <div>
              <label style={fs.changeBtn}>
                Replace
                <input type="file" onChange={handleFile} hidden />
              </label>
              <button onClick={handleRemove} style={fs.removeBtn}>
                ✕
              </button>
            </div>
          </div>
        ) : (
          <label style={fs.uploadBtn}>
            📎 Choose file
            <input type="file" onChange={handleFile} hidden />
          </label>
        )}
      </div>

      {error && <p style={fs.error}>{error}</p>}
    </div>
  );
}

const fs = {
  label: { fontSize: "0.85rem", marginBottom: 4 },
  box: { border: "1.5px dashed", borderRadius: 8, padding: "0.65rem" },
  uploadBtn: { cursor: "pointer", color: "#2563eb" },
  changeBtn: { cursor: "pointer", marginRight: 8 },
  removeBtn: { cursor: "pointer", color: "red" },
  error: { color: "red", fontSize: "0.78rem" },
};
