import Link from "next/link";

export default function Privacy() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@400;500;600;700&display=swap');
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
        .box{background:#f8f7fa;border:1px solid #ede9f5;border-radius:12px;padding:1.6rem;margin-top:2rem}
        .box-t{font-size:.84rem;font-weight:700;color:#18151f;margin-bottom:.6rem}
        .box p{font-size:.83rem;color:#b8b3c2;line-height:1.75}
        @media(max-width:768px){
          .nav{padding:.9rem 1.25rem}
          .wrap{padding:3rem 1.5rem 6rem}
          .toc-l{grid-template-columns:1fr}
        }
      `}</style>

      <nav className="nav">
        <Link href="/" className="back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Datagate
        </Link>
        <Link href="/" className="nav-brand">Datagate</Link>
      </nav>

      <div className="wrap">
        <div className="lbl">Legal</div>
        <h1 className="h1">Privacy Policy</h1>
        <p className="meta">Effective date: 22 March 2026 &nbsp;·&nbsp; Last updated: 22 March 2026</p>

        <div className="summary">
          <div className="summary-t">The short version</div>
          <p>Your data belongs to you. We collect it only with your consent, use it only for the purpose you approved, and never sell it. You can delete everything at any time. When you do, we require employers who received your data to delete their copies too.</p>
        </div>

        <div className="toc">
          <div className="toc-t">On this page</div>
          <div className="toc-l">
            {[["p1","Who we are"],["p2","What we collect"],["p3","How we use your data"],["p4","Consent and control"],["p5","Who we share with"],["p6","How long we keep data"],["p7","Deletion and employer notification"],["p8","Security"],["p9","Your rights"],["p10","Sensitive data"],["p11","Changes"],["p12","Contact"]].map(([id,t]) => (
              <a key={id} href={`#${id}`} className="toc-a">{t}</a>
            ))}
          </div>
        </div>

        <div className="sec" id="p1">
          <div className="sec-h">1. Who we are</div>
          <p className="p">Datagate Technologies ("Datagate", "we", "us") operates the employment verification platform at datagate.co.in. We act as the data fiduciary responsible for your personal data under applicable Indian law, including the Digital Personal Data Protection Act, 2023.</p>
        </div>

        <div className="sec" id="p2">
          <div className="sec-h">2. What we collect</div>
          <p className="p"><strong>From employees:</strong></p>
          <ul className="ul">
            <li>Name, email address, mobile number</li>
            <li>Identity documents: Aadhaar number (masked — last 4 digits only visible to any party), PAN number</li>
            <li>Employment history: employers, designations, dates, UAN and PF details</li>
            <li>Education: qualifications, institutions, certificates</li>
            <li>Uploaded documents: certificates, payslips, relieving letters</li>
          </ul>
          <p className="p"><strong>From employers:</strong></p>
          <ul className="ul">
            <li>Company name and work email address</li>
            <li>Records of consent requests made through the platform</li>
          </ul>
        </div>

        <div className="sec" id="p3">
          <div className="sec-h">3. How we use your data</div>
          <ul className="ul">
            <li>To create and maintain your verified employment profile</li>
            <li>To process consent requests between you and employers</li>
            <li>To send you notifications about requests, approvals, and account activity</li>
            <li>To meet our legal obligations</li>
          </ul>
          <div className="callout"><strong>We do not</strong> sell your data, use it for advertising, or share it with anyone you have not personally approved.</div>
        </div>

        <div className="sec" id="p4">
          <div className="sec-h">4. Consent and control</div>
          <p className="p">Every data share on Datagate requires your active consent. When an employer requests access:</p>
          <ul className="ul">
            <li>You receive a notification identifying the employer and their stated purpose</li>
            <li>You must click Approve — we never pre-approve on your behalf</li>
            <li>You can withdraw consent at any time from your dashboard</li>
            <li>Withdrawal is immediate — the employer loses access instantly</li>
            <li>Every approval and withdrawal is logged with a timestamp</li>
          </ul>
        </div>

        <div className="sec" id="p5">
          <div className="sec-h">5. Who we share with</div>
          <ul className="ul">
            <li><strong>Employers you approve:</strong> Only after your explicit consent, for the stated purpose only</li>
            <li><strong>Legal requirements:</strong> When required by law or a lawful order from a competent authority</li>
            <li><strong>Service providers:</strong> We use carefully selected partners to operate the platform. These partners act only on our instructions and are bound by confidentiality obligations. We do not list them by name here as these relationships may change</li>
          </ul>
        </div>

        <div className="sec" id="p6">
          <div className="sec-h">6. How long we keep data</div>
          <ul className="ul">
            <li>Active account data is kept while your account remains active</li>
            <li>On deletion, your personal data is removed from our systems within 30 days</li>
            <li>Access logs are retained for the period required by applicable law</li>
          </ul>
        </div>

        <div className="sec" id="p7">
          <div className="sec-h">7. Deletion and employer notification</div>
          <p className="p">You may delete your account at any time from your profile settings.</p>
          <ul className="ul">
            <li>Your profile, documents, and personal data are permanently deleted from our systems within 30 days</li>
            <li>Every employer who accessed your data is notified and required under their agreement with us to delete all copies within 30 days</li>
            <li>We retain a timestamped record of this notification as evidence that the obligation was communicated</li>
          </ul>
          <div className="callout"><strong>Employer obligation:</strong> When you delete your account, employers are legally required under Datagate's Employer Terms to delete all copies of your data. The notification timestamp is our record of this requirement being communicated.</div>
        </div>

        <div className="sec" id="p8">
          <div className="sec-h">8. Security</div>
          <p className="p">We implement appropriate technical and organisational measures to protect your data against unauthorised access, disclosure, alteration, or loss. These measures are reviewed periodically. We do not publish details of our security infrastructure.</p>
          <p className="p">If you suspect a security issue involving your account, contact us immediately at <a href="mailto:support@datagate.co.in">support@datagate.co.in</a>.</p>
        </div>

        <div className="sec" id="p9">
          <div className="sec-h">9. Your rights</div>
          <p className="p">Under the Digital Personal Data Protection Act, 2023, you have the right to:</p>
          <ul className="ul">
            <li><strong>Access</strong> — request a summary of the personal data we hold about you</li>
            <li><strong>Correction</strong> — request correction of inaccurate or incomplete data</li>
            <li><strong>Erasure</strong> — delete your account and all associated data at any time</li>
            <li><strong>Withdraw consent</strong> — revoke any employer's access at any time</li>
            <li><strong>Grievance redressal</strong> — raise a complaint with us or with the Data Protection Board of India</li>
          </ul>
          <p className="p">To exercise these rights, use your account settings or contact <a href="mailto:support@datagate.co.in">support@datagate.co.in</a>. We respond within 30 days.</p>
        </div>

        <div className="sec" id="p10">
          <div className="sec-h">10. Sensitive personal data</div>
          <p className="p">Aadhaar and PAN numbers are collected with your explicit consent for employment verification purposes. Aadhaar numbers are masked — only the last 4 digits are visible to any party, including employers. We do not authenticate Aadhaar numbers against government databases. PAN is stored securely and shared only with employers you approve.</p>
        </div>

        <div className="sec" id="p11">
          <div className="sec-h">11. Changes to this policy</div>
          <p className="p">We may update this policy. For material changes, we will notify you by email and display a notice on the platform before changes take effect. The date at the top of this page shows when it was last updated.</p>
        </div>

        <div className="sec" id="p12">
          <div className="sec-h">12. Contact</div>
        </div>

        <div className="box">
          <div className="box-t">Grievance Officer &nbsp;·&nbsp; Datagate Technologies</div>
          <p>Email: <a href="mailto:support@datagate.co.in">support@datagate.co.in</a></p>
          <br/>
          <p>We respond within 30 days. If you are not satisfied with our response, you may escalate to the Data Protection Board of India.</p>
        </div>
      </div>
    </>
  );
}