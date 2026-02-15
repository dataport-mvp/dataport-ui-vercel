import { useState } from "react";
import { useRouter } from "next/router";

export default function EmployerLogin() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const router = useRouter();

  const api = process.env.NEXT_PUBLIC_API_URL_PROD; // ✅ single line added

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = isSignup
        ? { email, password, companyName, contactPerson }
        : { email, password };

      const endpoint = isSignup ? "/employer/signup" : "/employer/login";

      const res = await fetch(`${api}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      console.log("Employer auth success:", data);

      // Redirect after success
      router.push("/employer/dashboard");
    } catch (err) {
      console.error("Employer auth failed:", err);
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
      <h1>{isSignup ? "Employer Sign Up" : "Employer Sign In"}</h1>
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
              placeholder="Company Name"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            /><br /><br />
            <input
              type="text"
              placeholder="Contact Person"
              required
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
            /><br /><br />
          </>
        )}
        <button type="submit" style={{ padding: "0.5rem 1.5rem" }}>
          {isSignup ? "Sign Up" : "Sign In"}
        </button>
      </form>
      <p style={{ marginTop: "1rem" }}>
        {isSignup ? "Already registered?" : "New employer?"}{" "}
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