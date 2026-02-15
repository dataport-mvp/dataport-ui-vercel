import { useState } from "react";
import { useRouter } from "next/router";

export default function EmployeeLogin() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const router = useRouter();

  // ✅ Use your custom domain from .env.local
  const api = process.env.NEXT_PUBLIC_API_URL_PROD;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // ✅ Payload matches backend RegisterRequest / LoginRequest
      const payload = isSignup
        ? { email, password, role: "employee", name: fullName, phone: mobile }
        : { email, password };

      // ✅ Endpoints match backend routes
      const endpoint = isSignup ? "/auth/register" : "/auth/login";

      const res = await fetch(`${api}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      console.log("Auth success:", data);

      // Redirect after success
      router.push("/employee/personal");
    } catch (err) {
      console.error("Auth failed:", err);
      alert("Authentication failed. Please try again.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to right, #f0f4f8, #d9e4ec)",
      }}
    >
      <h1>{isSignup ? "Sign Up" : "Sign In"}</h1>
      <form style={{ textAlign: "center" }} onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br /><br />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br /><br />
        {isSignup && (
          <>
            <input
              type="text"
              placeholder="Full Name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            /><br /><br />
            <input
              type="text"
              placeholder="Mobile Number"
              required
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            /><br /><br />
          </>
        )}
        <button type="submit" style={{ padding: "0.5rem 1.5rem" }}>
          {isSignup ? "Sign Up" : "Sign In"}
        </button>
      </form>
      <p style={{ marginTop: "1rem" }}>
        {isSignup ? "Already have an account?" : "First time user?"}{" "}
        <span
          style={{ color: "blue", cursor: "pointer" }}
          onClick={() => setIsSignup(!isSignup)}
        >
          {isSignup ? "Sign In" : "Sign Up"}
        </span>
      </p>
    </div>
  );
}