import { useState } from "react";
import { useRouter } from "next/router";

export default function EmployeeLogin() {
  const [isSignup, setIsSignup] = useState(false);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: add real auth logic here (API call to backend)
    // For now, just redirect after "success"
    router.push("/employee/personal");
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
      <h1>{isSignup ? "Sign Up" : "Sign In"}</h1>
      <form style={{ textAlign: "center" }} onSubmit={handleSubmit}>
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
    </div>
  );
}
