import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Dataport Platform</h1>
      <p>Select your dashboard:</p>
      <div style={{ marginTop: "2rem" }}>
        <Link href="/employee/login">
          <button style={{ marginRight: "1rem" }}>Employee Dashboard</button>
        </Link>
        <Link href="/employer/login">
          <button>Employer Dashboard</button>
        </Link>
      </div>
    </div>
  );
}
