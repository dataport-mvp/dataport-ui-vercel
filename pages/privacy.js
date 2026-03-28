import Link from "next/link";

const LAST_UPDATED = "22 March 2026";

export default function Privacy() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#0e0e10;color:#f5f0e8;font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}
        .prv-nav{
          position:sticky;top:0;z-index:100;
          display:flex;align-items:center;justify-content:space-between;
          padding:.9rem 3rem;
          background:rgba(14,14,16,0.96);
          backdrop-filter:blur(16px);
          border-bottom:1px solid #1a1a1e;
        }
        .prv-back{
          display:inline-flex;align-items:center;gap:.5rem;
          font-size:.8rem;font-weight:600;color:#504a44;
          text-decoration:none;transition:color .15s;
        }
        .prv-back:hover{color:#c9a84c}
        .prv-logo{font-family:'DM Sans',sans-serif;font-weight:700;font-size:15px;color:#f5f0e8;text-decoration:none}

        .prv-wrap{max-width:760px;margin:0 auto;padding:5rem 3rem 8rem}

        .prv-eyebrow{
          font-size:.66rem;font-weight:700;letter-spacing:2px;
          text-transform:uppercase;color:#c9a84c;
          display:flex;align-items:center;gap:.6rem;margin-bottom:1.25rem;
        }
        .prv-eyebrow::before{content:'';width:20px;height:1.5px;background:#c9a84c}

        .prv-h1{
          font-family:'Playfair Display',serif;
          font-size:clamp(2rem,4vw,3rem);font-weight:600;
          color:#f5f0e8;letter-spacing:-.5px;margin-bottom:.75rem;line-height:1.15;
        }
        .prv-meta{font-size:.8rem;color:#3a3530;margin-bottom:3rem;padding-bottom:2rem;border-bottom:1px solid #1a1a1e}

        .prv-toc{
          background:#141416;border:1px solid #1a1a1e;border-radius:14px;
          padding:1.5rem 1.75rem;margin-bottom:3rem;
        }
        .prv-toc-title{font-size:.72rem;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#504a44;margin-bottom:1rem}
        .prv-toc-list{display:flex;flex-direction:column;gap:.4rem}
        .prv-toc-item{font-size:.82rem;color:#504a44;text-decoration:none;transition:color .15s}
        .prv-toc-item:hover{color:#c9a84c}

        .prv-sec{margin-bottom:3rem}
        .prv-sec-h{
          font-family:'Playfair Display',serif;
          font-size:1.25rem;font-weight:600;color:#f5f0e8;
          margin-bottom:1rem;padding-bottom:.6rem;
          border-bottom:1px solid #1a1a1e;letter-spacing:-.2px;
        }
        .prv-p{font-size:.88rem;color:#a09888;line-height:1.85;margin-bottom:.85rem}
        .prv-p:last-child{margin-bottom:0}
        .prv-ul{padding-left:1.25rem;margin-bottom:.85rem}
        .prv-ul li{font-size:.88rem;color:#a09888;line-height:1.85;margin-bottom:.35rem}
        .prv-ul li::marker{color:#c9a84c}
        .prv-highlight{
          background:rgba(201,168,76,0.06);
          border:1px solid rgba(201,168,76,0.15);
          border-left:3px solid #c9a84c;
          border-radius:0 10px 10px 0;
          padding:.85rem 1.1rem;margin:.85rem 0;
          font-size:.84rem;color:#a09888;line-height:1.75;
        }
        .prv-highlight strong{color:#c9a84c}
        .prv-contact{
          background:#141416;border:1px solid #1a1a1e;border-radius:14px;
          padding:1.75rem;margin-top:2rem;
        }
        .prv-contact-title{font-size:.85rem;font-weight:700;color:#f5f0e8;margin-bottom:.75rem}
        .prv-contact p{font-size:.84rem;color:#504a44;line-height:1.75}
        .prv-contact a{color:#c9a84c;text-decoration:none}
        .prv-contact a:hover{text-decoration:underline}
        a{color:#c9a84c}

        @media(max-width:768px){
          .prv-nav{padding:.9rem 1.25rem}
          .prv-wrap{padding:3rem 1.5rem 6rem}
        }
      `}</style>

      <nav className="prv-nav">
        <Link href="/" className="prv-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Datagate
        </Link>
        <Link href="/" className="prv-logo">Datagate</Link>
      </nav>

      <div className="prv-wrap">
        <div className="prv-eyebrow">Legal</div>
        <h1 className="prv-h1">Privacy Policy</h1>
        <p className="prv-meta">Last updated: {LAST_UPDATED} · Effective from: {LAST_UPDATED}</p>

        <div className="prv-toc">
          <div className="prv-toc-title">Table of Contents</div>
          <div className="prv-toc-list">
            {[["1","Who We Are"],["2","Data We Collect"],["3","How We Use Your Data"],["4","Consent and Control"],["5","Data Sharing"],["6","Data Retention"],["7","Security"],["8","Your Rights under DPDP Act 2023"],["9","Aadhaar and Sensitive Data"],["10","Cookies"],["11","Contact Us"]].map(([n,t]) => (
              <a key={n} href={`#s${n}`} className="prv-toc-item">{n}. {t}</a>
            ))}
          </div>
        </div>

        <div className="prv-highlight">
          <strong>Plain English summary:</strong> Datagate collects your employment and identity data only with your explicit consent. We never sell your data. You can delete your account and all data at any time. Employers only see your data after you personally approve their request.
        </div>

        <div className="prv-sec" id="s1">
          <div className="prv-sec-h">1. Who We Are</div>
          <p className="prv-p">Datagate Technologies ("Datagate", "we", "us") operates the platform at datagate.co.in. We are a data fiduciary under the Digital Personal Data Protection Act, 2023 (DPDP Act). Our registered address is in India.</p>
          <p className="prv-p">We provide a consent-based employment verification platform that enables individuals to build verified employment profiles and share them with employers of their choice.</p>
        </div>

        <div className="prv-sec" id="s2">
          <div className="prv-sec-h">2. Data We Collect</div>
          <p className="prv-p"><strong style={{color:"#f5f0e8"}}>From Employees (Data Principals):</strong></p>
          <ul className="prv-ul">
            <li>Identity: Full name, email address, mobile number, date of birth</li>
            <li>Identity documents: Aadhaar number (last 4 digits displayed; full number stored encrypted), PAN number</li>
            <li>Employment history: Previous employers, designations, dates of joining and leaving, UAN, PF member ID</li>
            <li>Education: Degrees, institutions, passing year, certificates</li>
            <li>Documents: Uploaded files including certificates, payslips, relieving letters (stored encrypted in AWS S3, India region)</li>
            <li>Technical: IP address, browser type, session tokens (deleted on logout)</li>
          </ul>
          <p className="prv-p"><strong style={{color:"#f5f0e8"}}>From Employers (Data Processors):</strong></p>
          <ul className="prv-ul">
            <li>Company name, work email address, contact details</li>
            <li>Consent request history and audit logs</li>
          </ul>
        </div>

        <div className="prv-sec" id="s3">
          <div className="prv-sec-h">3. How We Use Your Data</div>
          <ul className="prv-ul">
            <li>To create and maintain your verified employment profile</li>
            <li>To process and log consent requests between employees and employers</li>
            <li>To send transactional emails (consent requests, reminders, account notifications)</li>
            <li>To comply with legal obligations under Indian law</li>
            <li>To improve the platform (aggregated, anonymised analytics only)</li>
          </ul>
          <div className="prv-highlight">
            <strong>We never:</strong> sell your personal data, use it for advertising, share it with third parties without your explicit consent, or use it for any purpose beyond what is stated here.
          </div>
        </div>

        <div className="prv-sec" id="s4">
          <div className="prv-sec-h">4. Consent and Control</div>
          <p className="prv-p">Every data share requires your active, informed consent. When an employer requests access to your profile:</p>
          <ul className="prv-ul">
            <li>You receive a notification with the employer's name and stated purpose</li>
            <li>You must explicitly click "Approve" — pre-ticked boxes are never used</li>
            <li>You can withdraw consent at any time — the employer's access is immediately revoked</li>
            <li>Every approval is logged with timestamp and purpose</li>
          </ul>
          <p className="prv-p">You can review all active consents and revoke any of them from your profile dashboard at any time.</p>
        </div>

        <div className="prv-sec" id="s5">
          <div className="prv-sec-h">5. Data Sharing</div>
          <p className="prv-p">We share your data only in the following circumstances:</p>
          <ul className="prv-ul">
            <li><strong style={{color:"#f5f0e8"}}>With employers you approve:</strong> Only after you explicitly consent to a specific employer's request</li>
            <li><strong style={{color:"#f5f0e8"}}>Legal requirements:</strong> If required by law, court order, or government authority under applicable Indian law</li>
            <li><strong style={{color:"#f5f0e8"}}>Service providers:</strong> AWS (data storage, India region), Resend (transactional email) — bound by data processing agreements</li>
          </ul>
          <p className="prv-p">We do not share data with advertising networks, data brokers, or any third party for commercial purposes.</p>
        </div>

        <div className="prv-sec" id="s6">
          <div className="prv-sec-h">6. Data Retention</div>
          <ul className="prv-ul">
            <li>Active account data: Retained while your account is active</li>
            <li>Deleted account: All personal data wiped within 30 days of deletion request (DynamoDB records, S3 files, tokens)</li>
            <li>Document versions in S3: Versioned copies may survive up to 90 days after deletion due to our backup lifecycle policy</li>
            <li>Audit logs: Retained for 7 years to comply with legal obligations</li>
            <li>Employer access logs: Retained for 3 years from date of consent</li>
          </ul>
        </div>

        <div className="prv-sec" id="s7">
          <div className="prv-sec-h">7. Security</div>
          <ul className="prv-ul">
            <li>All data stored in AWS Mumbai (ap-south-1) — India data localisation compliant</li>
            <li>Documents encrypted at rest (AES-256) and in transit (TLS 1.2+)</li>
            <li>Passwords stored as one-way hashed values (PBKDF2-SHA256) — never retrievable</li>
            <li>DynamoDB Point-in-Time Recovery enabled (35-day backup window)</li>
            <li>JWT tokens expire in 15 minutes; refresh tokens invalidated on logout</li>
            <li>Brute-force protection: accounts locked after 5 failed login attempts</li>
            <li>Rate limiting on all authentication endpoints</li>
          </ul>
        </div>

        <div className="prv-sec" id="s8">
          <div className="prv-sec-h">8. Your Rights under DPDP Act 2023</div>
          <p className="prv-p">As a Data Principal under the Digital Personal Data Protection Act, 2023, you have the following rights:</p>
          <ul className="prv-ul">
            <li><strong style={{color:"#f5f0e8"}}>Right to access:</strong> Request a copy of all personal data we hold about you</li>
            <li><strong style={{color:"#f5f0e8"}}>Right to correction:</strong> Request correction of inaccurate or incomplete data</li>
            <li><strong style={{color:"#f5f0e8"}}>Right to erasure:</strong> Delete your account and all associated data at any time via your profile settings</li>
            <li><strong style={{color:"#f5f0e8"}}>Right to withdraw consent:</strong> Revoke any employer's access to your data at any time</li>
            <li><strong style={{color:"#f5f0e8"}}>Right to grievance redressal:</strong> Raise a complaint via our support ticket system or email support@datagate.co.in</li>
          </ul>
          <p className="prv-p">To exercise these rights, use the settings in your profile or contact us at support@datagate.co.in. We will respond within 30 days.</p>
        </div>

        <div className="prv-sec" id="s9">
          <div className="prv-sec-h">9. Aadhaar and Sensitive Data</div>
          <div className="prv-highlight">
            <strong>Important:</strong> Datagate is not a licensed Aadhaar Authentication User Agency (AUA). We do not perform Aadhaar OTP verification. Aadhaar numbers are self-reported by employees for record purposes only.
          </div>
          <ul className="prv-ul">
            <li>Full Aadhaar numbers are stored encrypted and masked (only last 4 digits displayed)</li>
            <li>We do not verify Aadhaar numbers against UIDAI databases</li>
            <li>PAN numbers are stored encrypted with employee consent</li>
            <li>Biometric data is never collected</li>
          </ul>
        </div>

        <div className="prv-sec" id="s10">
          <div className="prv-sec-h">10. Cookies</div>
          <p className="prv-p">We use only essential session cookies required for authentication. We do not use tracking cookies, advertising cookies, or third-party analytics cookies. You cannot opt out of essential session cookies as they are required for the platform to function.</p>
        </div>

        <div className="prv-sec" id="s11">
          <div className="prv-sec-h">11. Changes to This Policy</div>
          <p className="prv-p">We may update this Privacy Policy periodically. When we make material changes, we will notify you by email and display a notice on the platform. Continued use of the platform after notice constitutes acceptance of the updated policy.</p>
        </div>

        <div className="prv-contact">
          <div className="prv-contact-title">Contact & Grievance Officer</div>
          <p>For privacy concerns, data requests, or complaints under the DPDP Act 2023:</p>
          <br/>
          <p>Email: <a href="mailto:support@datagate.co.in">support@datagate.co.in</a></p>
          <p>Grievance Officer: Datagate Technologies</p>
          <p>Response time: Within 30 days of receipt</p>
          <br/>
          <p style={{fontSize:".78rem",color:"#3a3530"}}>If you are not satisfied with our response, you may file a complaint with the Data Protection Board of India once it is constituted under the DPDP Act, 2023.</p>
        </div>
      </div>
    </>
  );
}