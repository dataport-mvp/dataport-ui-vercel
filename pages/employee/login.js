// pages/employee/login.js
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

export default function EmployeeLogin() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [phone, setPhone]       = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isSignup ? "/auth/register" : "/auth/login";

      const body = isSignup
        ? { email, password, name, phone, role: "employee" }
        : { email, password };

      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Something went wrong");
      }

      // Store token + user info in context & localStorage
      const userData = {
        email: data.email || email,
        name:  data.name  || name,
        phone: data.phone || phone,
        role:  data.role  || "employee",
      };
      login(data.access_token, userData);

      router.push("/employee/personal");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(to right, #f0f4f8, #d9e4ec)"
    }}>
      <div style={{
        background: "#fff",
        padding: "2.5rem",
        borderRadius: "14px",
        boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
        width: "100%",
        maxWidth: "420px"
      }}>
        <h1 style={{ marginBottom: "1.5rem", textAlign: "center" }}>
          {isSignup ? "Create Account" : "Employee Sign In"}
        </h1>

        <form onSubmit={handleSubmit}>
          <label style={ls.label}>Email</label>
          <input
            style={ls.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />

          <label style={ls.label}>Password</label>
          <input
            style={ls.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          {isSignup && (
            <>
              <label style={ls.label}>Full Name</label>
              <input
                style={ls.input}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your full name"
              />

              <label style={ls.label}>Mobile Number</label>
              <input
                style={ls.input}
                type="tel"
                value={phone}
                maxLength={10}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                required
                placeholder="10-digit mobile"
              />
            </>
          )}

          {error && (
            <p style={{ color: "#dc2626", fontSize: "0.85rem", marginBottom: "1rem" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.85rem",
              background: loading ? "#93c5fd" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "0.5rem"
            }}
          >
            {loading ? "Please wait..." : isSignup ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <p style={{ marginTop: "1.25rem", textAlign: "center", fontSize: "0.9rem" }}>
          {isSignup ? "Already have an account?" : "First time user?"}{" "}
          <span
            style={{ color: "#2563eb", cursor: "pointer", fontWeight: "600" }}
            onClick={() => { setIsSignup(!isSignup); setError(""); }}
          >
            {isSignup ? "Sign In" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}

const ls = {
  label: { fontSize: "0.85rem", color: "#475569", display: "block", marginBottom: "4px", marginTop: "1rem" },
  input: { width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box" }
};
