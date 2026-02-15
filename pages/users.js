import { useState } from "react";

export default function Users() {
  // Use prod API by default
  const api = process.env.NEXT_PUBLIC_API_URL_PROD;
  // For internal testing, switch to staging:
  // const api = process.env.NEXT_PUBLIC_API_URL_STAGING;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function createUser() {
    try {
      const res = await fetch(`${api}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }), // ✅ use email instead of username
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      console.log("User created:", data);
      alert("User created successfully!");
    } catch (err) {
      console.error("Error creating user:", err);
      alert("Failed to create user");
    }
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Create User</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ marginBottom: "1rem", display: "block" }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginBottom: "1rem", display: "block" }}
      />
      <button onClick={createUser}>Create User</button>
    </div>
  );
}