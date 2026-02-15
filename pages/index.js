import Link from "next/link";

export default function Home() {
  // Use prod API by default
  const api = process.env.NEXT_PUBLIC_API_URL_PROD;
  // For internal testing, switch to staging:
  // const api = process.env.NEXT_PUBLIC_API_URL_STAGING;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to right, #e0f7fa, #f1f8e9)",
      }}
    >
      {/* Main Content - Centered */}
      <main
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          maxWidth: "900px",
        }}
      >
        {/* Employee Dashboard */}
        <div
          style={{
            flex: 1,
            textAlign: "center",
            padding: "2rem",
            borderRight: "2px solid #ccc",
          }}
        >
          <h1>Employee Dashboard</h1>
          <Link href="/employee/login">
            <button style={{ padding: "1rem 2rem", fontSize: "1.2rem" }}>
              Employee Login
            </button>
          </Link>
        </div>

        {/* Employer Dashboard */}
        <div
          style={{
            flex: 1,
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <h1>Employer Dashboard</h1>
          <Link href="/employer/login">
            <button style={{ padding: "1rem 2rem", fontSize: "1.2rem" }}>
              Employer Login
            </button>
          </Link>
        </div>
      </main>

      {/* Datagate Info directly below dashboards */}
      <section
        style={{
          marginTop: "2rem",
          textAlign: "center",
          padding: "1.5rem",
          background: "linear-gradient(to right, #e0f7fa, #f1f8e9)",
          borderTop: "2px solid #ccc",
          width: "100%",
        }}
      >
        <p>
          <strong>Datagate</strong> is a secure employee–employer data platform,
          simplifying onboarding, consent management, and record keeping.
        </p>
        <p>© 2026 Datagate. All Rights Reserved ®</p>
        <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#555" }}>
          Current API Base: <code>{api}</code>
        </p>
      </section>
    </div>
  );
}