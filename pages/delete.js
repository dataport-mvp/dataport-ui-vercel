import { useState } from "react";

export default function DeleteUser() {
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState(null);

  const api = process.env.NEXT_PUBLIC_API_URL_PROD; // ✅ single line added

  const handleDelete = async () => {
    try {
      const res = await fetch(`${api}/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setStatus(`User ${userId} deleted successfully.`);
      console.log("Delete response:", data);
    } catch (err) {
      console.error("Error deleting user:", err);
      setStatus("Failed to delete user.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Delete User</h1>
      <input
        type="text"
        placeholder="Enter User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        style={{ marginRight: "1rem", padding: "0.5rem" }}
      />
      <button onClick={handleDelete} style={{ padding: "0.5rem 1.5rem" }}>
        Delete
      </button>

      {status && <p style={{ marginTop: "1rem" }}>{status}</p>}
    </div>
  );
}