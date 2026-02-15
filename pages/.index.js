import Link from "next/link";

export default function Home() {
  const api = process.env.NEXT_PUBLIC_API_URL_PROD; // ✅ single line added

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to right, #e0f7fa, #f1f8e9)",
        padding: "2rem",
      }}
    >
      <h1>Dataport Platform</h1>
      <p>Welcome to the UI for dataport.co.in 🚀</p>

      <div style={{ marginTop: "2rem", display: "flex", gap: "2rem" }}>
        <Link href="/employee/login">
          <button style={{ padding: "1rem 2rem", fontSize: "1.1rem" }}>
            Employee Login
          </button>
        </Link>
        <Link href="/employer/login">
          <button style={{ padding: "1rem 2rem", fontSize: "1.1rem" }}>
            Employer Login
          </button>
        </Link>
      </div>

      <p style={{ marginTop: "2rem", fontSize: "0.9rem", color: "#555" }}>
        Current API Base: <code>{api}</code>
      </p>
    </div>
  );
}