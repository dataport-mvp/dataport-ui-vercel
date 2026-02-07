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
    </div>
  );
}
