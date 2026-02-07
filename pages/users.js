import { useState } from "react";

export default function Users() {
  const [userId, setUserId] = useState("");
  const [result, setResult] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const API_URL = process.env.NEXT_PUBLIC_API_URL + "/users";
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId })
      });
      const data = await res.json();
      setResult(JSON.stringify(data));
    } catch (err) {
      setResult("Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Create User</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter user_id"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <button type="submit">Create</button>
      </form>
      <pre>{result}</pre>
    </div>
  );
}
