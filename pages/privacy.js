// pages/privacy.js — Datagate Privacy Policy
// No auth required — public page
import Link from "next/link";

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f8fafc; font-family: 'Plus Jakarta Sans', sans-serif; color: #1e293b; }
  .topbar { background: #1e1a3e; padding: 0.85rem 2rem; display: flex; align-items: center; justify-content: space-between; }
  .logo { font-size: 1.2rem; font-weight: 800; color: #a78bfa; letter-spacing: -0.5px; text-decoration: none; }
  .back { font-size: 0.82rem; color: #9d9bc4; text-decoration: none; font-weight: 500; }
  .back:hover { color: #a78bfa; }
  .wrap { max-width: 780px; margin: 0 auto; padding: 3rem 1.5rem 5rem; }
  .badge { display: inline-block; background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; border-radius: 999px; font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.75rem; margin-bottom: 1rem; }
  h1 { font-size: 1.75rem; font-weight: 800; color: #1a1730; margin-bottom: 0.4rem; }
  .subtitle { font-size: 0.875rem; color: #64748b; margin-bottom: 2.5rem; }
  h2 { font-size: 1rem; font-weight: 700; color: #1a1730; margin: 2rem 0 0.6rem; }
  p { font-size: 0.875rem; color: #475569; line-height: 1.75; margin-bottom: 0.75rem; }
  ul { padding-left: 1.25rem; margin-bottom: 0.75rem; }
  li { font-size: 0.875rem; color: #475569; line-height: 1.75; margin-bottom: 0.25rem; }
  .divider { border: none; border-top: 1.5px solid #e2e8f0; margin: 2rem 0; }
  .contact-box { background: #f5f3ff; border: 1.5px solid #ddd6fe; border-radius: 12px; padding: 1.25rem 1.5rem; margin-top: 2rem; }
  .contact-box p { margin: 0; color: #4c1d95; }
  a { color: #4f46e5; }
`;

export default function PrivacyPolicy() {
  return (
    <>
      <style>{G}</style>
      <div className="topbar">
        <a href="/" className="logo">Datagate</a>
        <Link href="/" className="back">← Back to home</Link>
      </div>
      <div className="wrap">
        <div className="badge">Last updated: March 2026</div>
        <h1>Privacy Policy</h1>
        <p className="subtitle">Datagate Technologies — datagate.co.in</p>

        <p>This Privacy Policy explains how Datagate ("we", "our", "the platform") collects, uses, stores, and shares your personal data when you use our services. By using Datagate, you agree to the practices described in this policy.</p>

        <h2>1. Who We Are</h2>
        <p>Datagate is a consent-based employment profile and background verification platform that enables employees to build a verified employment profile and share it with employers and agencies with explicit consent. We operate as a Data Fiduciary under India's Digital Personal Data Protection Act, 2023 (DPDP Act).</p>

        <h2>2. What Data We Collect</h2>
        <p>We collect the following categories of personal data from employees who register on the platform:</p>
        <ul>
          <li>Identity information: name, date of birth, gender, nationality</li>
          <li>Contact information: email address, mobile number</li>
          <li>Government identifiers: Aadhaar number (masked — only last 4 digits stored and displayed), PAN number</li>
          <li>Address information: current and permanent address</li>
          <li>Educational records: institution names, years, qualifications</li>
          <li>Employment records: company names, designations, employment dates</li>
          <li>Financial records: UAN number, PF member IDs</li>
          <li>Documents: uploaded copies of certificates, identity proof, employment letters</li>
          <li>Emergency contact information</li>
        </ul>
        <p>From employers and agencies, we collect: company name, authorised representative email and contact details.</p>

        <h2>3. How We Use Your Data</h2>
        <ul>
          <li>To create and maintain your verified employment profile</li>
          <li>To facilitate background verification when you provide consent to an employer</li>
          <li>To share your profile data with employers or agencies you have explicitly approved</li>
          <li>To send you notifications about consent requests and profile activity</li>
          <li>To improve our platform and services</li>
        </ul>

        <h2>4. Consent and Data Sharing</h2>
        <p>Your data is <strong>never shared with any employer or agency without your explicit consent.</strong> Each time an employer requests access to your profile, you will receive a notification and must actively approve or decline the request.</p>
        <p>Each consent is purpose-limited — the employer can only use your data for the purpose stated at the time of the request. Consent can be withdrawn by you at any time through your account settings.</p>

        <h2>5. Aadhaar Data</h2>
        <p>In compliance with UIDAI guidelines, Datagate does not store your full Aadhaar number. Only the last 4 digits are retained for identification purposes. Full Aadhaar numbers entered during profile creation are masked before storage. Employers and third parties never see your full Aadhaar number on this platform.</p>

        <h2>6. Data Storage and Security</h2>
        <p>All data is stored on AWS infrastructure in the ap-south-1 (Mumbai) region, ensuring your data remains within India in compliance with data localisation requirements. Documents are stored in encrypted S3 buckets with access controlled via time-limited presigned URLs.</p>
        <p>We use industry-standard security measures including HTTPS encryption, JWT-based authentication, and role-based access controls.</p>

        <h2>7. Data Retention</h2>
        <p>We retain your personal data for as long as your account is active. If you delete your account, all personal data including uploaded documents will be permanently deleted from our systems within 30 days. Consent logs may be retained for up to 7 years for legal compliance purposes.</p>

        <h2>8. Your Rights</h2>
        <p>Under the DPDP Act 2023, you have the following rights:</p>
        <ul>
          <li><strong>Right to access:</strong> View all data we hold about you</li>
          <li><strong>Right to correction:</strong> Update any inaccurate data</li>
          <li><strong>Right to erasure:</strong> Request deletion of your account and all associated data</li>
          <li><strong>Right to withdraw consent:</strong> Revoke any employer's access to your data at any time</li>
          <li><strong>Right to grievance redressal:</strong> Raise a complaint with us if you believe your data rights have been violated</li>
        </ul>

        <h2>9. Employer Obligations</h2>
        <p>Employers who receive employee data via consent become Data Processors under the DPDP Act. They are bound by the Data Access & Sharing Agreement accepted at the time of first access, and are solely responsible for the secure handling of any data they store in their own systems.</p>

        <h2>10. Cookies</h2>
        <p>We use only essential cookies required for authentication and session management. We do not use tracking or advertising cookies. We do not serve advertisements on this platform.</p>

        <h2>11. Changes to This Policy</h2>
        <p>We may update this policy from time to time. We will notify registered users of any material changes via email. Continued use of the platform after changes constitutes acceptance of the updated policy.</p>

        <hr className="divider" />

        <div className="contact-box">
          <p><strong>Questions or grievances?</strong><br />
          Email us at <a href="mailto:privacy@datagate.co.in">privacy@datagate.co.in</a><br />
          We will respond within 7 business days.</p>
        </div>
      </div>
    </>
  );
}