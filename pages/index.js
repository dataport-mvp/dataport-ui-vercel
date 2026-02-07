import Link from "next/link";

export default function Home() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      background: "linear-gradient(to right, #e0f7fa, #f1f8e9)"
    }}>
      {/* Header */}
      <header style={{ textAlign: "center", padding: "1rem" }}>
        <nav>
          <Link href="/">Home</Link>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ display: "flex", flex: 1 }}>
        {/* Employee Dashboard */}
        <div style={{
          flex: 1,
          textAlign: "center",
          padding: "2rem",
          borderRight: "2px solid #ccc"
        }}>
          <h1>Employee Dashboard</h1>
          <Link href="/employee/login">
            <button style={{ padding: "1rem 2rem", fontSize: "1.2rem" }}>
              Employee Login
            </button>
          </Link>
        </div>

        {/* Employer Dashboard */}
        <div style={{ flex: 1, textAlign: "center", padding: "2rem" }}>
          <h1>Employer Dashboard</h1>
          <Link href="/employer/login">
            <button style={{ padding: "1rem 2rem", fontSize: "1.2rem" }}>
              Employer Login
            </button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: "center",
        padding: "2rem",
        background: "#f5f5f5"
      }}>
        <p>
          <strong>Datagate</strong> is a secure employee–employer data platform,
          simplifying onboarding, consent management, and record keeping.
        </p>
        <p>© 2026 Datagate. All Rights Reserved ®</p>
      </footer>
    </div>
  );
}
