import Link from "next/link";

export default function Layout({ children }) {
  return (
    <div>
      {/* Header */}
      <header style={{ textAlign: "center", padding: "1rem", background: "#f5f5f5" }}>
        <nav>
          <Link href="/">Home</Link>
        </nav>
      </header>

      {/* Page Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "2rem", background: "#f5f5f5" }}>
        <p>
          <strong>Datagate</strong> is a secure employee–employer data platform,
          simplifying onboarding, consent management, and record keeping.
        </p>
        <p>© 2026 Datagate. All Rights Reserved ®</p>
      </footer>
    </div>
  );
}
