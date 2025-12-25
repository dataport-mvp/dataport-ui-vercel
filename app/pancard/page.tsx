"use client";

import { useState, useRef } from "react";

type FormState = {
  firstName: string;
  lastName: string;
  dob: string; // ISO date string yyyy-mm-dd
  panNumber: string;
  file?: File | null;
};

export default function PanUploadPage() {
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    dob: "",
    panNumber: "",
    file: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.dob) e.dob = "Date of birth is required";
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.panNumber.trim().toUpperCase()))
      e.panNumber = "PAN must be in format AAAAA9999A";
    if (!form.file) e.file = "PAN card image is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setForm((s) => ({ ...s, file: f }));
    setMessage(null);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }

  function onChangeField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((s) => ({ ...s, [key]: value }));
    setErrors((prev) => ({ ...prev, [String(key)]: "" }));
  }

  async function onSave() {
    setMessage(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("firstName", form.firstName.trim());
      fd.append("lastName", form.lastName.trim());
      fd.append("dob", form.dob);
      fd.append("panNumber", form.panNumber.trim().toUpperCase());
      if (form.file) fd.append("panFile", form.file);

      const res = await fetch("/api/pan", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Server responded ${res.status}`);
      }

      const json = await res.json();
      setMessage("Saved successfully");
      // Optionally clear form
      // setForm({ firstName: "", lastName: "", dob: "", panNumber: "", file: null });
      // setPreviewUrl(null);
    } catch (err: any) {
      setMessage(`Save failed: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }

  function onCancel() {
    setForm({ firstName: "", lastName: "", dob: "", panNumber: "", file: null });
    setPreviewUrl(null);
    setErrors({});
    setMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">PAN Card Upload</h1>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First name</label>
              <input
                value={form.firstName}
                onChange={(e) => onChangeField("firstName", e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2"
                type="text"
                name="firstName"
                autoComplete="given-name"
              />
              {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Last name</label>
              <input
                value={form.lastName}
                onChange={(e) => onChangeField("lastName", e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2"
                type="text"
                name="lastName"
                autoComplete="family-name"
              />
              {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date of birth</label>
              <input
                value={form.dob}
                onChange={(e) => onChangeField("dob", e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2"
                type="date"
                name="dob"
              />
              {errors.dob && <p className="text-red-600 text-sm mt-1">{errors.dob}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">PAN number</label>
              <input
                value={form.panNumber}
                onChange={(e) => onChangeField("panNumber", e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2 uppercase"
                type="text"
                name="panNumber"
                placeholder="AAAAA9999A"
                maxLength={10}
              />
              {errors.panNumber && <p className="text-red-600 text-sm mt-1">{errors.panNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">PAN card image</label>
              <input
                ref={fileInputRef}
                onChange={onFileChange}
                className="mt-1 block w-full"
                type="file"
                accept="image/*,application/pdf"
                name="panFile"
              />
              {errors.file && <p className="text-red-600 text-sm mt-1">{errors.file}</p>}
            </div>

            {previewUrl && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">Preview</p>
                <img src={previewUrl} alt="PAN preview" className="max-h-48 rounded border" />
              </div>
            )}

            {message && <div className="text-sm text-gray-700 mt-2">{message}</div>}
          </div>
        </div>

        <footer className="bg-gray-50 border-t p-4 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-white border rounded text-gray-700 hover:bg-gray-100"
            type="button"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
            type="button"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </footer>
      </div>
    </main>
  );
}
