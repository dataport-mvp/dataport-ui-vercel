import { useState } from "react";
import Link from "next/link";

export default function EmployeeLogin() {
  const [isSignup, setIsSignup] = useState(false);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(to right, #f0f4f8, #d9e4ec)"
    }}>
      <h1>{isSignup ? "Sign Up" : "Sign In"}</h1>
      <form style={{ textAlign: "center" }}>
        <input type="email" placeholder="Email" required /><br /><br />
        <input type="password" placeholder="Password" required /><br /><br />
        {isSignup && (
          <>
            <input type="text" placeholder="Full Name" required /><br /><br />
            <input type="text" placeholder="Mobile Number" required /><br /><br />
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

      {/* After login, link to Personal Details */}
      <p style={{ marginTop: "2rem" }}>
        <Link href="/employee/personal">Go to Personal Details</Link>
      </p>
    </div>
  );
}
