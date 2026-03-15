// pages/employer/terms.js — Employer Data Access & Sharing Agreement
// Public page — no auth required
import Link from "next/link";

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f8fafc; font-family: 'Plus Jakarta Sans', sans-serif; color: #1e293b; }
  .topbar { background: #0f172a; padding: 0.85rem 2rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.07); }
  .logo { font-size: 1.15rem; font-weight: 800; color: #f8fafc; letter-spacing: -0.3px; text-decoration: none; }
  .back { font-size: 0.82rem; color: #64748b; text-decoration: none; font-weight: 500; }
  .back:hover { color: #94a3b8; }
  .wrap { max-width: 780px; margin: 0 auto; padding: 3rem 1.5rem 5rem; }
  .badge { display: inline-block; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 999px; font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.75rem; margin-bottom: 1rem; }
  h1 { font-size: 1.75rem; font-weight: 800; color: #0f172a; margin-bottom: 0.4rem; }
  .subtitle { font-size: 0.875rem; color: #64748b; margin-bottom: 2.5rem; }
  h2 { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 2rem 0 0.6rem; }
  p { font-size: 0.875rem; color: #475569; line-height: 1.75; margin-bottom: 0.75rem; }
  ul { padding-left: 1.25rem; margin-bottom: 0.75rem; }
  li { font-size: 0.875rem; color: #475569; line-height: 1.75; margin-bottom: 0.25rem; }
  .divider { border: none; border-top: 1.5px solid #e2e8f0; margin: 2rem 0; }
  .highlight { background: #fffbeb; border: 1.5px solid #fde68a; border-radius: 10px; padding: 1rem 1.25rem; margin: 1.5rem 0; }
  .highlight p { margin: 0; color: #92400e; font-size: 0.82rem; }
  .contact-box { background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 1.25rem 1.5rem; margin-top: 2rem; }
  .contact-box p { margin: 0; color: #374151; }
  a { color: #2563eb; }
`;

export default function EmployerTerms() {
  return (
    <>
      <style>{G}</style>
      <div className="topbar">
        <a href="/" className="logo">Datagate</a>
        <Link href="/" className="back">← Back to home</Link>
      </div>
      <div className="wrap">
        <div className="badge">Last updated: March 2026</div>
        <h1>Data Access & Sharing Agreement</h1>
        <p className="subtitle">For Employers and Agencies — datagate.co.in</p>

        <p>This Data Access & Sharing Agreement ("Agreement") governs your access to employee profile data on Datagate as an employer or agency. By accepting this Agreement, you confirm that your organisation will comply with its terms.</p>

        <div className="highlight">
          <p>⚠️ <strong>Important:</strong> All employee profile data on Datagate is self-reported by the employee. Datagate does not independently verify the accuracy of self-reported information unless a separately contracted verification service has been completed. You are responsible for conducting any additional verification required by your organisation.</p>
        </div>

        <h2>1. Definitions</h2>
        <p>"Employee Data" means any personal information, documents, or profile data belonging to an employee that is shared with you via the Datagate platform following the employee's explicit consent.</p>
        <p>"You" or "Employer" means the organisation or agency accessing employee data on Datagate.</p>
        <p>"Datagate" means the platform operated by Datagate Technologies.</p>

        <h2>2. Consent Requirement</h2>
        <p>You may only access an employee's profile data after that employee has explicitly approved your consent request on the Datagate platform. Attempting to access, infer, or reconstruct employee data without valid consent is strictly prohibited.</p>

        <h2>3. Permitted Use</h2>
        <p>You may use Employee Data only for:</p>
        <ul>
          <li>Background verification of a candidate you are actively considering for employment</li>
          <li>Onboarding purposes for a candidate who has accepted an offer from your organisation</li>
          <li>Any other specific purpose clearly stated to the employee at the time of the consent request</li>
        </ul>

        <h2>4. Prohibited Use</h2>
        <p>You must not:</p>
        <ul>
          <li>Use Employee Data for marketing, profiling, or any purpose beyond what was stated at consent</li>
          <li>Share, sell, transfer, or disclose Employee Data to any third party without fresh employee consent</li>
          <li>Retain Employee Data beyond the period necessary for the stated purpose</li>
          <li>Combine Employee Data from Datagate with data from other sources to create profiles without consent</li>
        </ul>

        <h2>5. Data Storage Obligations</h2>
        <p>If you store any Employee Data received from Datagate in your own systems:</p>
        <ul>
          <li>You become a Data Processor under India's DPDP Act 2023 for that data</li>
          <li>You are solely responsible for its secure storage, access controls, and processing</li>
          <li>You must delete the data upon the employee's request or upon consent withdrawal</li>
          <li>You must notify Datagate and the affected employee of any data breach involving this data</li>
        </ul>

        <h2>6. Consent Withdrawal</h2>
        <p>An employee may withdraw their consent at any time. Upon withdrawal notification from Datagate:</p>
        <ul>
          <li>You must immediately cease use of the employee's data</li>
          <li>You must delete any copies stored in your own systems within 30 days</li>
          <li>Access to the employee's profile on Datagate will be revoked automatically</li>
        </ul>

        <h2>7. Aadhaar Data</h2>
        <p>Aadhaar numbers displayed on Datagate are masked — only the last 4 digits are visible. You must not attempt to reconstruct, infer, or obtain the full Aadhaar number by any means. Use of Aadhaar data is governed by UIDAI regulations and the Aadhaar Act 2016.</p>

        <h2>8. Security Requirements</h2>
        <p>You must implement appropriate technical and organisational security measures to protect Employee Data, including access controls limiting data visibility to only those staff members with a legitimate need.</p>

        <h2>9. Compliance with Laws</h2>
        <p>You confirm that your organisation complies with all applicable data protection and privacy laws including but not limited to the Digital Personal Data Protection Act 2023, the Information Technology Act 2000, and applicable UIDAI guidelines.</p>

        <h2>10. Liability</h2>
        <p>Datagate is not liable for any misuse of Employee Data by your organisation after it has been shared pursuant to a valid employee consent. You indemnify Datagate against any claims, penalties, or losses arising from your breach of this Agreement.</p>

        <h2>11. Termination of Access</h2>
        <p>Datagate reserves the right to suspend or terminate your access to the platform if you are found to be in breach of this Agreement or any applicable law.</p>

        <hr className="divider" />

        <div className="contact-box">
          <p><strong>Questions about this Agreement?</strong><br />
          Email us at <a href="mailto:legal@datagate.co.in">legal@datagate.co.in</a><br />
          We will respond within 7 business days.</p>
        </div>
      </div>
    </>
  );
}