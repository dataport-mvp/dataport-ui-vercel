import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <div>
      <nav style={{ padding: "1rem", background: "#eee" }}>
        <Link href="/">Home</Link> |{" "}
        <Link href="/users">Users</Link> |{" "}
        <Link href="/consent">Consent</Link> |{" "}
        <Link href="/delete">Delete</Link>
      </nav>
      <main>{children}</main>
    </div>
  );
}
