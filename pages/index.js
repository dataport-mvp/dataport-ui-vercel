import Link from "next/link";

export default function Home() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      background: "linear-gradient(to right, #e0f7fa, #f1f8e9)"
    }}>
      {/* Employee Dashboard (Left) */}
      <div style={{
        flex: 1,
        textAlign: "center",
        padding: "2rem",
        borderRight: "2px solid #ccc"
      }}>
        <h1>Employee Dashboard</h1>
        <Link href="/employee/login">
          <button style={{ padding: "1rem 2rem", fontSize: "1.2rem" }}>
            Go to Employee
          </button>
        </Link>
      </div>

      {/* Employer Dashboard (Right) */}
      <div style={{
        flex: 1,
        textAlign: "center",
        padding: "2rem"
      }}>
        <h1>Employer Dashboard</h1>
        <Link href="/employer/login">
          <button style={{ padding: "1rem 2rem", fontSize: "1.2rem" }}>
            Go to Employer
          </button>
        </Link>
      </div>
    </div>
  );
}
