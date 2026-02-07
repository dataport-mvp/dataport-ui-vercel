import Link from "next/link";

export default function EmployeeLogin() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Employee Login</h1>
      <p>Select a section:</p>
      <ul>
        <li><Link href="/employee/personal">Personal Details</Link></li>
        <li><Link href="/employee/education">Education Details</Link></li>
        <li><Link href="/employee/previous">Previous Company</Link></li>
        <li><Link href="/employee/uan">UAN Details</Link></li>
      </ul>
    </div>
  );
}
