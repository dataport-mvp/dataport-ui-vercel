import Link from "next/link";
const UPDATED = "22 March 2026";

const NavBack = () => (
  <nav style={{position:"sticky",top:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"space-between",padding:".9rem 3rem",background:"rgba(14,14,16,0.96)",backdropFilter:"blur(16px)",borderBottom:"1px solid #1a1a1e"}}>
    <Link href="/" style={{display:"inline-flex",alignItems:"center",gap:".5rem",fontSize:".8rem",fontWeight:600,color:"#504a44",textDecoration:"none",transition:"color .15s"}}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      Back
    </Link>
    <Link href="/" style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:"14px",color:"#f5f0e8",textDecoration:"none"}}>Datagate</Link>
  </nav>
);

export default function Privacy() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#0e0e10;color:#f5f0e8;font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}
        a{color:#c9a84c;text-decoration:none}
        a:hover{text-decoration:underline}
        .wrap{max-width:740px;margin:0 auto;padding:5rem 3rem 8rem}
        .eyebrow{font-size:.65rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#c9a84c;display:flex;align-items:center;gap:.6rem;margin-bottom:1.25rem}
        .eyebrow::before{content:'';width:18px;height:1.5px;background:#c9a84c}
        .h1{font-family:'Playfair Display',serif;font-size:clamp(2rem,4vw,2.8rem);font-weight:600;color:#f5f0e8;letter-spacing:-.5px;margin-bottom:.6rem;line-height:1.15}
        .meta{font-size:.78rem;color:#2a2a30;margin-bottom:2.5rem;padding-bottom:2rem;border-bottom:1px solid #1a1a1e}
        .toc{background:#141416;border:1px solid #1a1a1e;border-radius:14px;padding:1.5rem 1.75rem;margin-bottom:3rem}
        .toc-t{font-size:.7rem;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#3a3530;margin-bottom:1rem}
        .toc-l{display:flex;flex-direction:column;gap:.38rem}
        .toc-a{font-size:.81rem;color:#504a44;text-decoration:none;transition:color .15s}
        .toc-a:hover{color:#c9a84c;text-decoration:none}
        .hl{background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.14);border-left:3px solid #c9a84c;border-radius:0 10px 10px 0;padding:.85rem 1.1rem;margin:.85rem 0;font-size:.84rem;color:#a09888;line-height:1.75}
        .hl strong{color:#c9a84c}
        .sec{margin-bottom:2.75rem}
        .sec-h{font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:600;color:#f5f0e8;margin-bottom:.85rem;padding-bottom:.55rem;border-bottom:1px solid #1a1a1e}
        .p{font-size:.875rem;color:#a09888;line-height:1.85;margin-bottom:.8rem}
        .ul{padding-left:1.2rem;margin-bottom:.8rem}
        .ul li{font-size:.875rem;color:#a09888;line-height:1.85;margin-bottom:.3rem}
        .ul li::marker{color:#c9a84c}
        .box{background:#141416;border:1px solid #1a1a1e;border-radius:14px;padding:1.6rem;margin-top:2.5rem}
        .box-t{font-size:.84rem;font-weight:700;color:#f5f0e8;margin-bottom:.6rem}
        .box p{font-size:.82rem;color:#504a44;line-height:1.75}
        @media(max-width:768px){.wrap{padding:3rem 1.5rem 6rem}}
      `}</style>
      <NavBack />
      <div className="wrap">
        <div className="eyebrow">Legal</div>
        <h1 className="h1">Privacy Policy</h1>
        <p className="meta">Last updated: {UPDATED}</p>

        <div className="toc">
          <div className="toc-t">Contents</div>
          <div className="toc-l">
            {[["1","Who We Are"],["2","What Data We Collect"],["3","How We Use Your Data"],["4","Your Consent and Control"],["5","Who We Share Data With"],["6","How Long We Keep Your Data"],["7","Deletion and Your Right to Erasure"],["8","Security"],["9","Your Rights"],["10","Sensitive Personal Data"],["11","Changes to This Policy"],["12","Contact Us"]].map(([n,t]) => (
              <a key={n} href={`#p${n}`} className="toc-a">{n}. {t}</a>
            ))}
          </div>
        </div>

        <div className="hl">
          <strong>The short version:</strong> Datagate collects your employment and identity data only with your explicit consent. We never sell your data. You can delete everything at any time. Employers only see your data after you personally approve their request. If you request deletion, we notify the employer and require them to delete their copies too.
        </div>

        <div className="sec" id="p1">
          <div className="sec-h">1. Who We Are</div>
          <p className="p">Datagate Technologies ("Datagate", "we", "us") operates the platform at datagate.co.in. We are a data fiduciary under the Digital Personal Data Protection Act, 2023 (DPDP Act) and are responsible for how your personal data is collected, used, and protected.</p>
          <p className="p">We provide a consent-based employment verification platform. Employees build verified profiles. Employers access those profiles only with employee approval.</p>
        </div>

        <div className="sec" id="p2">
          <div className="sec-h">2. What Data We Collect</div>
          <p className="p"><strong style={{color:"#f5f0e8"}}>From employees:</strong></p>
          <ul className="ul">
            <li>Identity: Full name, email address, mobile number</li>
            <li>Identity documents: Aadhaar number (stored masked — only last 4 digits visible to any party), PAN number</li>
            <li>Employment history: Previous employers, designations, dates, UAN and PF details</li>
            <li>Education: Qualifications, institutions, certificates</li>
            <li>Uploaded documents: Certificates, payslips, relieving letters</li>
          </ul>
          <p className="p"><strong style={{color:"#f5f0e8"}}>From employers:</strong></p>
          <ul className="ul">
            <li>Company name and work email address</li>
            <li>Records of consent requests sent and received</li>
          </ul>
        </div>

        <div className="sec" id="p3">
          <div className="sec-h">3. How We Use Your Data</div>
          <ul className="ul">
            <li>To create and maintain your verified employment profile</li>
            <li>To process consent requests between employees and employers</li>
            <li>To send you notifications about consent requests, approvals, and account activity</li>
            <li>To comply with our legal obligations under Indian law</li>
          </ul>
          <div className="hl"><strong>We never</strong> sell your data, use it for advertising, or share it with anyone you have not explicitly approved.</div>
        </div>

        <div className="sec" id="p4">
          <div className="sec-h">4. Your Consent and Control</div>
          <p className="p">Every data share requires your active, informed consent. When an employer requests access:</p>
          <ul className="ul">
            <li>You receive a notification with the employer's name and their stated purpose</li>
            <li>You must click "Approve" — we never pre-approve on your behalf</li>
            <li>You can withdraw consent at any time from your profile dashboard</li>
            <li>Withdrawal is immediate — the employer's access is revoked instantly</li>
            <li>Every approval and withdrawal is logged with timestamp</li>
          </ul>
        </div>

        <div className="sec" id="p5">
          <div className="sec-h">5. Who We Share Data With</div>
          <p className="p">We share your data only in these circumstances:</p>
          <ul className="ul">
            <li><strong style={{color:"#f5f0e8"}}>Employers you approve:</strong> Only after you explicitly consent to a specific employer's request, for the stated purpose only</li>
            <li><strong style={{color:"#f5f0e8"}}>Legal requirements:</strong> If required by law, court order, or lawful authority under applicable Indian law</li>
            <li><strong style={{color:"#f5f0e8"}}>Infrastructure partners:</strong> We use trusted third-party services for storage and communication. These partners process data only on our instruction and are bound by strict confidentiality obligations. We do not name them here as these relationships change — contact us if you need specifics</li>
          </ul>
          <p className="p">We do not share data with advertising networks, data brokers, or any commercial third party.</p>
        </div>

        <div className="sec" id="p6">
          <div className="sec-h">6. How Long We Keep Your Data</div>
          <ul className="ul">
            <li>Active accounts: Data retained while your account is active</li>
            <li>After account deletion: All personal data removed within 30 days</li>
            <li>Employer access logs: Retained for audit and compliance purposes for a period required by applicable law</li>
          </ul>
        </div>

        <div className="sec" id="p7">
          <div className="sec-h">7. Deletion and Your Right to Erasure</div>
          <p className="p">You may delete your account at any time from your profile settings. When you do:</p>
          <ul className="ul">
            <li>Your profile, documents, and personal data are permanently deleted from our systems within 30 days</li>
            <li>All employers who previously received your data are notified and required under our Employer Terms to delete their copies within 30 days</li>
            <li>Our audit log of the notification to employers is retained as evidence that we fulfilled this obligation</li>
          </ul>
          <div className="hl"><strong>Employer obligation on your deletion:</strong> When you delete your account, Datagate notifies every employer who accessed your data. Under their agreement with us, they are legally required to delete all copies of your data. The timestamped notification serves as legal evidence of this requirement being communicated.</div>
        </div>

        <div className="sec" id="p8">
          <div className="sec-h">8. Security</div>
          <p className="p">We take reasonable and appropriate technical and organisational measures to protect your personal data against unauthorised access, loss, or misuse. These measures are reviewed and updated as necessary. We do not publish details of our security infrastructure.</p>
          <p className="p">If you believe there has been a security incident involving your data, contact us immediately at <a href="mailto:support@datagate.co.in">support@datagate.co.in</a>.</p>
        </div>

        <div className="sec" id="p9">
          <div className="sec-h">9. Your Rights</div>
          <p className="p">Under the DPDP Act, 2023, you have the right to:</p>
          <ul className="ul">
            <li><strong style={{color:"#f5f0e8"}}>Access:</strong> Request a summary of personal data we hold about you</li>
            <li><strong style={{color:"#f5f0e8"}}>Correction:</strong> Request correction of inaccurate data</li>
            <li><strong style={{color:"#f5f0e8"}}>Erasure:</strong> Delete your account and all data at any time</li>
            <li><strong style={{color:"#f5f0e8"}}>Withdraw consent:</strong> Revoke any employer's access at any time</li>
            <li><strong style={{color:"#f5f0e8"}}>Grievance:</strong> Raise a complaint with us or with the Data Protection Board of India</li>
          </ul>
          <p className="p">To exercise these rights, use your profile settings or email us at <a href="mailto:support@datagate.co.in">support@datagate.co.in</a>. We respond within 30 days.</p>
        </div>

        <div className="sec" id="p10">
          <div className="sec-h">10. Sensitive Personal Data</div>
          <p className="p">We collect Aadhaar and PAN numbers with your explicit consent, for the sole purpose of employment verification. Aadhaar numbers are masked — only the last 4 digits are visible to any party including employers. We do not perform Aadhaar authentication against government databases. PAN is stored securely and shared only with employers you approve.</p>
        </div>

        <div className="sec" id="p11">
          <div className="sec-h">11. Changes to This Policy</div>
          <p className="p">We may update this policy. When we make material changes, we will notify you by email and show a notice on the platform before the changes take effect. The date at the top of this page reflects the most recent update.</p>
        </div>

        <div className="sec" id="p12">
          <div className="sec-h">12. Contact Us</div>
          <p className="p">For any privacy concern, data request, or complaint:</p>
        </div>

        <div className="box">
          <div className="box-t">Grievance Officer — Datagate Technologies</div>
          <p>Email: <a href="mailto:support@datagate.co.in">support@datagate.co.in</a></p>
          <br/>
          <p style={{fontSize:".78rem",color:"#2a2a30"}}>We will respond within 30 days. If you remain unsatisfied, you may escalate to the Data Protection Board of India once constituted under the DPDP Act, 2023.</p>
        </div>
      </div>
    </>
  );
}