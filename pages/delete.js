import { useState } from "react";

export default function DeleteUser() {
  const [userId, setUserId] = useState("");
  const [result, setResult] = useState("");

  const handleDelete = async (e) => {
    e.preventDefault();
    const API_URL = process.env.NEXT_PUBLIC_API_URL + "/delete/" + userId;
    try {
      const res = await fetch(API_URL, { method: "DELETE" });
      const data = await res.json();
      setResult(JSON.stringify(data));
    } catch (err) {
      setResult("Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Delete User</h1>
      <form onSubmit={handleDelete}>
        <input
          type="text"
          placeholder="Enter user_id"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <button type="submit">Delete</button>
      </form>
      <pre>{result}</pre>
    </div>
  );
}
