import Link from "next/link";

export default function EmployerLogin() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Employer Login</h1>
      <Link href="/employer/dashboard">Go to Dashboard</Link>
    </div>
  );
}
