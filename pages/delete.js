import { useState } from "react";

export default function DeleteUser() {
  const [email, setEmail] = useState("");   // ✅ use email instead of userId
  const [status, setStatus] = useState(null);

  const api = process.env.NEXT_PUBLIC_API_URL_PROD; // ✅ points to staging domain

  const handleDelete = async () => {
    try {
      const res = await fetch(`${api}/users/${email}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setStatus(`User ${email} deleted successfully.`);
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
        type="email"
        placeholder="Enter User Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ marginRight: "1rem", padding: "0.5rem" }}
      />
      <button onClick={handleDelete} style={{ padding: "0.5rem 1.5rem" }}>
        Delete
      </button>

      {status && <p style={{ marginTop: "1rem" }}>{status}</p>}
    </div>
  );
}