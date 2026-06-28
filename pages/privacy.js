import Link from "next/link";

// DATAGATE — PRIVACY POLICY
// Version 2.0 | DPDP Act 2023 Compliant
// Jurisdiction: Hyderabad, Telangana, India
// Data storage: AWS Mumbai (ap-south-1)
// Replace Datagate Support Team with your full legal name before publishing
// Replace Datagate with your exact registered entity name
// Review with a legal professional before going live with paying customers

export default function PrivacyPolicy() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#fff;color:#18151f;font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}
        a{color:#0d6e6e;text-decoration:none}
        a:hover{text-decoration:underline}
        .nav{position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:.9rem 3.5rem;background:rgba(255,255,255,0.96);backdrop-filter:blur(12px);border-bottom:1px solid #ede9f5}
        .back{display:inline-flex;align-items:center;gap:.5rem;font-size:.8rem;font-weight:600;color:#7a7386;text-decoration:none;transition:color .15s}
        .back:hover{color:#0d6e6e;text-decoration:none}
        .nav-brand{font-family:'DM Sans',sans-serif;font-weight:700;font-size:14px;color:#18151f;text-decoration:none}
        .wrap{max-width:720px;margin:0 auto;padding:5rem 3rem 8rem}
        .lbl{font-size:.64rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#0d6e6e;display:flex;align-items:center;gap:.5rem;margin-bottom:1rem}
        .lbl::before{content:'';width:16px;height:1.5px;background:#0d6e6e}
        .h1{font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,4vw,2.8rem);font-weight:600;color:#18151f;letter-spacing:-.4px;margin-bottom:.6rem;line-height:1.1}
        .meta{font-size:.78rem;color:#d8d4e3;margin-bottom:2.5rem;padding-bottom:2rem;border-bottom:1px solid #f2f0f5}
        .summary{background:#f0f9f4;border:1.5px solid rgba(13,110,110,0.15);border-radius:12px;padding:1.25rem 1.5rem;margin-bottom:3rem}
        .summary-t{font-size:.72rem;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#0d6e6e;margin-bottom:.6rem}
        .summary p{font-size:.875rem;color:#2d6a4f;line-height:1.75}
        .toc{background:#f8f7fa;border:1px solid #ede9f5;border-radius:12px;padding:1.4rem 1.75rem;margin-bottom:3rem}
        .toc-t{font-size:.7rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#b8b3c2;margin-bottom:.9rem}
        .toc-l{display:grid;grid-template-columns:1fr 1fr;gap:.32rem}
        .toc-a{font-size:.8rem;color:#7a7386;text-decoration:none;transition:color .15s;padding:.15rem 0}
        .toc-a:hover{color:#0d6e6e;text-decoration:none}
        .sec{margin-bottom:2.75rem}
        .sec-h{font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:600;color:#18151f;margin-bottom:.85rem;padding-bottom:.5rem;border-bottom:1px solid #f2f0f5}
        .p{font-size:.875rem;color:#7a7386;line-height:1.85;margin-bottom:.75rem}
        .p:last-child{margin-bottom:0}
        .p strong{color:#18151f;font-weight:600}
        .ul{padding-left:1.2rem;margin-bottom:.75rem}
        .ul li{font-size:.875rem;color:#7a7386;line-height:1.85;margin-bottom:.28rem}
        .ul li::marker{color:#0d6e6e}
        .callout{background:#f0f9f4;border-left:3px solid #0d6e6e;border-radius:0 9px 9px 0;padding:.85rem 1.1rem;margin:.85rem 0;font-size:.84rem;color:#2d6a4f;line-height:1.75}
        .callout strong{color:#0d6e6e}
        .warn{background:#fff8f0;border-left:3px solid #f59e0b;border-radius:0 9px 9px 0;padding:.85rem 1.1rem;margin:.85rem 0;font-size:.84rem;color:#92400e;line-height:1.75}
        .warn strong{color:#d97706}
        .box{background:#f8f7fa;border:1px solid #ede9f5;border-radius:12px;padding:1.6rem;margin-top:2rem}
        .box-t{font-size:.84rem;font-weight:700;color:#18151f;margin-bottom:.6rem}
        .box p{font-size:.83rem;color:#7a7386;line-height:1.75}
        .table-wrap{overflow-x:auto;margin:.85rem 0}
        table{width:100%;border-collapse:collapse;font-size:.83rem}
        th{background:#f8f7fa;color:#18151f;font-weight:600;padding:.6rem .85rem;text-align:left;border:1px solid #ede9f5}
        td{padding:.55rem .85rem;border:1px solid #ede9f5;color:#7a7386;line-height:1.6}
        @media(max-width:768px){
          .nav{padding:.9rem 1.25rem}
          .wrap{padding:3rem 1.5rem 6rem}
          .toc-l{grid-template-columns:1fr}
        }
      `}</style>

      <nav className="nav">
        <Link href="/" className="back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Datagate
        </Link>
        <Link href="/" className="nav-brand">Datagate</Link>
      </nav>

      <div className="wrap">
        <div className="lbl">Legal</div>
        <h1 className="h1">Privacy Policy</h1>
        <p className="meta">Effective date: 22 March 2026 &nbsp;·&nbsp; Version 2.0 &nbsp;·&nbsp; Last updated: June 2026</p>

        <div className="summary">
          <div className="summary-t">The short version</div>
          <p>Your data belongs to you. We collect it only with your consent, use it only for the purpose you approved, and never sell it. All data is stored in India. You can delete everything at any time — and when you do, every employer who received your data is legally required to delete their copies too.</p>
        </div>

        <div className="toc">
          <div className="toc-t">On this page</div>
          <div className="toc-l">
            {[
              ["p1","Who we are"],["p2","Who this applies to"],["p3","What we collect"],
              ["p4","How we use your data"],["p5","Consent and control"],["p6","Who we share with"],
              ["p7","Data storage and localisation"],["p8","How long we keep data"],
              ["p9","Your rights under DPDP 2023"],["p10","Sensitive personal data"],
              ["p11","Security"],["p12","Changes to this policy"],["p13","Grievance redressal"],["p14","Contact"]
            ].map(([id,t]) => (
              <a key={id} href={`#${id}`} className="toc-a">{t}</a>
            ))}
          </div>
        </div>

        {/* 1 */}
        <div className="sec" id="p1">
          <div className="sec-h">1. Who we are</div>
          <p className="p">Datagate ("Datagate", "we", "us", "our") operates the consent-based employment verification platform at <strong>datagate.co.in</strong>. The platform is owned and operated by <strong>Datagate</strong>, Hyderabad, Telangana, India.</p>
          <p className="p">Datagate acts as a <strong>Data Fiduciary</strong> as defined under the Digital Personal Data Protection Act, 2023 ("DPDP Act"). We determine the purpose and means of processing personal data on this platform.</p>
          <p className="p">Employers who access employee data through this platform are independent Data Fiduciaries for their own processing activities and are bound by Datagate's Employer Terms and Data Sharing Agreement.</p>
        </div>

        {/* 2 */}
        <div className="sec" id="p2">
          <div className="sec-h">2. Who this policy applies to</div>
          <p className="p">This policy applies to:</p>
          <ul className="ul">
            <li><strong>Employees (Data Principals)</strong> — individuals who create a verified employment profile on Datagate</li>
            <li><strong>Employers</strong> — organisations that request access to employee profiles for background verification or onboarding</li>
            <li><strong>BGV Vendors</strong> — background verification agencies assigned by employers to conduct checks through the platform</li>
            <li><strong>Visitors</strong> — anyone who accesses datagate.co.in without creating an account</li>
          </ul>
        </div>

        {/* 3 */}
        <div className="sec" id="p3">
          <div className="sec-h">3. What we collect</div>

          <p className="p"><strong>From employees:</strong></p>
          <ul className="ul">
            <li>Full name, email address, mobile number</li>
            <li>Identity: Aadhaar number (masked — last 4 digits only stored and displayed), PAN number</li>
            <li>Employment history: employer names, designations, dates of joining and exit, UAN, PF account details</li>
            <li>Education: qualifications, institutions, years of passing, certificate references</li>
            <li>Documents uploaded by you: certificates, payslips, relieving letters, offer letters</li>
            <li>Digital signature (where applicable, for consent records)</li>
            <li>Consent event logs: timestamps of every approval and withdrawal</li>
          </ul>

          <p className="p"><strong>From employers:</strong></p>
          <ul className="ul">
            <li>Company name, registered address, GST number (where provided)</li>
            <li>Authorised representative name, designation, work email</li>
            <li>Records of consent requests submitted and their stated purposes</li>
            <li>BGV vendor assignments made through the platform</li>
          </ul>

          <p className="p"><strong>From BGV vendors:</strong></p>
          <ul className="ul">
            <li>Agency name, registered address, operating licences (where applicable)</li>
            <li>Authorised contact name and email</li>
            <li>Case records, check outcomes, and final reports submitted through the platform</li>
          </ul>

          <p className="p"><strong>Automatically collected:</strong></p>
          <ul className="ul">
            <li>IP address, browser type, device type, and session identifiers — for security and fraud prevention only</li>
            <li>Platform usage logs — for platform integrity and debugging only</li>
          </ul>
          <div className="callout"><strong>We do not collect:</strong> Biometric data, caste, religion, political opinion, financial account credentials, or any data not listed above.</div>
        </div>

        {/* 4 */}
        <div className="sec" id="p4">
          <div className="sec-h">4. How we use your data</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Purpose</th><th>Data used</th><th>Legal basis</th></tr>
              </thead>
              <tbody>
                <tr><td>Create and maintain your verified profile</td><td>All employee data</td><td>Your consent</td></tr>
                <tr><td>Process consent requests between you and employers</td><td>Profile data, consent logs</td><td>Your consent</td></tr>
                <tr><td>Notify you of requests, approvals, withdrawals</td><td>Email, mobile</td><td>Legitimate interest / consent</td></tr>
                <tr><td>Route BGV checks to assigned vendor</td><td>Profile data (employer-approved only)</td><td>Your consent + employer consent</td></tr>
                <tr><td>Maintain audit trail of all data access events</td><td>Consent logs, timestamps</td><td>Legal obligation (DPDP Act)</td></tr>
                <tr><td>Comply with lawful orders from competent authorities</td><td>As required by the order</td><td>Legal obligation</td></tr>
                <tr><td>Prevent fraud and platform abuse</td><td>Session data, IP logs</td><td>Legitimate interest</td></tr>
              </tbody>
            </table>
          </div>
          <div className="callout"><strong>We do not:</strong> sell your data, use it for advertising, train AI models on it, or share it with any party you have not personally approved.</div>
        </div>

        {/* 5 */}
        <div className="sec" id="p5">
          <div className="sec-h">5. Consent and control</div>
          <p className="p">Every data share on Datagate requires your active, informed consent. The consent mechanism works as follows:</p>
          <ul className="ul">
            <li>You receive a notification identifying the employer and their stated purpose before any data is shared</li>
            <li>You must click <strong>Approve</strong> — we never pre-approve, auto-approve, or infer consent on your behalf</li>
            <li>Each consent is purpose-limited: if an employer's purpose changes, a new consent request is required</li>
            <li>You can withdraw consent at any time from your dashboard — withdrawal is instantaneous</li>
            <li>On withdrawal, the employer's access is revoked immediately and they are notified of their obligation to delete</li>
            <li>Every approval, access event, and withdrawal is cryptographically logged with a timestamp</li>
          </ul>
          <div className="callout"><strong>Your consent log is your record.</strong> You can view every consent event — who requested, what purpose was stated, when you approved, and when access was revoked — from your account dashboard at any time.</div>
        </div>

        {/* 6 */}
        <div className="sec" id="p6">
          <div className="sec-h">6. Who we share your data with</div>

          <p className="p"><strong>Employers you approve:</strong> Only after your explicit consent, strictly for the purpose you approved. Employers are bound by our Employer Terms and Data Sharing Agreement.</p>

          <p className="p"><strong>BGV vendors assigned by your employer:</strong> When an employer assigns a BGV vendor to conduct background checks on their behalf, your data (already approved by you for the employer) may be routed to that vendor through the platform. BGV vendors are separately bound by Datagate's BGV Vendor Terms and operate only within the scope of the employer's authorised check.</p>

          <p className="p"><strong>Infrastructure and service providers:</strong> We use the following sub-processors to operate the platform. All are bound by data processing agreements and act only on our instructions:</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Provider</th><th>Purpose</th><th>Location</th></tr>
              </thead>
              <tbody>
                <tr><td>Amazon Web Services (AWS)</td><td>Cloud infrastructure, storage, compute</td><td>Mumbai, India (ap-south-1)</td></tr>
                <tr><td>Email delivery provider</td><td>Transactional notifications</td><td>India / EU (SCCs in place)</td></tr>
              </tbody>
            </table>
          </div>

          <p className="p"><strong>Legal authorities:</strong> We may disclose data if required by a lawful order from a competent Indian authority. We will notify you of any such request where legally permitted to do so.</p>

          <p className="p"><strong>We do not share your data</strong> with data brokers, advertisers, analytics companies, or any party not listed above.</p>
        </div>

        {/* 7 */}
        <div className="sec" id="p7">
          <div className="sec-h">7. Data storage and localisation</div>
          <p className="p">All personal data processed by Datagate is stored exclusively on servers located in India — specifically on Amazon Web Services' Mumbai region (<strong>ap-south-1</strong>). No personal data is transferred outside India except where required by a lawful order of a competent authority or where you explicitly consent to cross-border transfer for a specific purpose.</p>
          <div className="callout"><strong>DPDP Act compliance:</strong> This storage architecture is designed to comply with data localisation requirements under the Digital Personal Data Protection Act, 2023.</div>
        </div>

        {/* 8 */}
        <div className="sec" id="p8">
          <div className="sec-h">8. How long we keep your data</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Data type</th><th>Retention period</th></tr>
              </thead>
              <tbody>
                <tr><td>Employee profile and documents</td><td>While your account is active. Deleted within 7 days of account deletion request.</td></tr>
                <tr><td>Consent event logs</td><td>7 years from the date of the consent event (legal compliance requirement)</td></tr>
                <tr><td>Employer notification records (deletion / withdrawal)</td><td>7 years (evidence of obligation communicated)</td></tr>
                <tr><td>Session and security logs</td><td>90 days</td></tr>
                <tr><td>BGV case records</td><td>As required by applicable law; minimum 2 years from case closure</td></tr>
              </tbody>
            </table>
          </div>
          <div className="warn"><strong>Why we retain consent logs:</strong> Even after your account is deleted, we retain cryptographic logs of consent events. This protects you — it is evidence that your consent was properly obtained and that employers were notified of their deletion obligation. We do not retain your profile data, documents, or personal information after deletion.</div>
        </div>

        {/* 9 */}
        <div className="sec" id="p9">
          <div className="sec-h">9. Your rights under the DPDP Act, 2023</div>
          <p className="p">As a Data Principal under the Digital Personal Data Protection Act, 2023, you have the following rights:</p>
          <ul className="ul">
            <li><strong>Right to access</strong> — request a summary of personal data we hold about you and a list of all entities it has been shared with</li>
            <li><strong>Right to correction</strong> — request correction of inaccurate, incomplete, or outdated personal data</li>
            <li><strong>Right to erasure</strong> — delete your account and all associated personal data at any time</li>
            <li><strong>Right to withdraw consent</strong> — revoke any employer's access at any time, instantly, from your dashboard</li>
            <li><strong>Right to grievance redressal</strong> — raise a complaint with our Grievance Officer (see Section 13)</li>
            <li><strong>Right to nominate</strong> — nominate another individual to exercise these rights on your behalf in the event of your death or incapacity</li>
          </ul>
          <p className="p">To exercise any right, use your account settings or contact <a href="mailto:grievance@datagate.co.in">grievance@datagate.co.in</a>. We respond within <strong>7 business days</strong>. If you are not satisfied with our response, you may escalate to the <strong>Data Protection Board of India</strong>.</p>
        </div>

        {/* 10 */}
        <div className="sec" id="p10">
          <div className="sec-h">10. Sensitive personal data</div>
          <p className="p">The following data elements collected on Datagate are classified as sensitive and handled with additional controls:</p>
          <ul className="ul">
            <li><strong>Aadhaar number:</strong> Collected with your explicit consent for employment verification purposes only. The full number is never stored or displayed — only the last 4 digits are retained and visible to any party, including employers. We do not authenticate Aadhaar against UIDAI databases.</li>
            <li><strong>PAN number:</strong> Stored in encrypted form. Shared with employers only on your explicit approval and only for the verification purpose stated.</li>
            <li><strong>UAN / PF details:</strong> Used to source EPFO-linked employment records. Shared only after your approval.</li>
          </ul>
          <p className="p">We do not collect health data, financial account credentials, biometric data, caste, religion, or political affiliations.</p>
        </div>

        {/* 11 */}
        <div className="sec" id="p11">
          <div className="sec-h">11. Security</div>
          <p className="p">We implement the following technical and organisational measures:</p>
          <ul className="ul">
            <li>All data encrypted in transit (TLS 1.2+) and at rest (AES-256)</li>
            <li>Access to production systems restricted to authorised personnel only</li>
            <li>All consent events cryptographically logged and tamper-evident</li>
            <li>Infrastructure on AWS Mumbai region with VPC isolation</li>
            <li>Automated smoke tests on every deployment to detect regressions</li>
            <li>Periodic security reviews of the platform architecture</li>
          </ul>
          <p className="p">If you suspect a security issue involving your account or data, contact us immediately at <a href="mailto:security@datagate.co.in">security@datagate.co.in</a>. We treat all security reports as urgent.</p>
          <p className="p">In the event of a data breach affecting your personal data, we will notify you and relevant authorities as required by applicable law.</p>
        </div>

        {/* 12 */}
        <div className="sec" id="p12">
          <div className="sec-h">12. Changes to this policy</div>
          <p className="p">We may update this policy as the platform evolves or as legal requirements change. For material changes — those that affect your rights or how your data is used — we will notify you by email at least <strong>14 days before</strong> the change takes effect and display a prominent notice on the platform. The version date at the top of this page records when it was last updated.</p>
          <p className="p">Continued use of Datagate after the effective date of a material change constitutes your acceptance of the updated policy.</p>
        </div>

        {/* 13 */}
        <div className="sec" id="p13">
          <div className="sec-h">13. Grievance redressal</div>
          <p className="p">In accordance with the Digital Personal Data Protection Act, 2023, we have designated a Grievance Officer to address any complaints or concerns about the processing of your personal data.</p>
          <div className="box">
            <div className="box-t">Grievance Officer</div>
            <p><strong>Datagate Support Team</strong></p>
            <p>Hyderabad, Telangana, India</p>
            <br/>
            <p>Email: <a href="mailto:grievance@datagate.co.in">grievance@datagate.co.in</a></p>
            <p>Response time: Within 7 business days</p>
            <br/>
            <p>If you are not satisfied with the resolution provided by the Grievance Officer, you may escalate your complaint to the <strong>Data Protection Board of India</strong> as established under the DPDP Act, 2023.</p>
          </div>
        </div>

        {/* 14 */}
        <div className="sec" id="p14">
          <div className="sec-h">14. Contact</div>
          <div className="box">
            <div className="box-t">General enquiries &nbsp;·&nbsp; Datagate</div>
            <p>Email: <a href="mailto:support@datagate.co.in">support@datagate.co.in</a></p>
            <br/>
            <p>Security issues: <a href="mailto:security@datagate.co.in">security@datagate.co.in</a></p>
            <p>Grievances: <a href="mailto:grievance@datagate.co.in">grievance@datagate.co.in</a></p>
            <br/>
            <p>We respond within 7 business days.</p>
          </div>
        </div>

      </div>
    </>
  );
}
