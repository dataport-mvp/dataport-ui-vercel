// utils/apiError.js
export function parseError(data, fallback = "Something went wrong") {
  if (!data) return fallback;
  const detail = data.detail;
  if (!detail) return fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    // Pick the first validation error's msg field
    return detail.map(e => e.msg || JSON.stringify(e)).join(", ");
  }
  if (typeof detail === "object") return detail.msg || JSON.stringify(detail);
  return String(detail);
}
