import Link from "next/link";

// DATAGATE — BGV VENDOR TERMS & CONDITIONS
// Version 1.0 | DPDP Act 2023 Compliant
// Jurisdiction: Hyderabad, Telangana, India
// This document was entirely missing from the platform — critical for the 3-sided model
// Replace Datagate with your exact registered entity name before publishing

export default function BGVVendorTerms() {
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
        .danger{background:#fff5f5;border-left:3px solid #e53e3e;border-radius:0 9px 9px 0;padding:.85rem 1.1rem;margin:.85rem 0;font-size:.84rem;color:#742a2a;line-height:1.75}
        .danger strong{color:#e53e3e}
        .box{background:#f8f7fa;border:1px solid #ede9f5;border-radius:12px;padding:1.6rem;margin-top:2rem}
        .box-t{font-size:.84rem;font-weight:700;color:#18151f;margin-bottom:.6rem}
        .box p{font-size:.83rem;color:#7a7386;line-height:1.75}
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
        <h1 className="h1">BGV Vendor Terms &amp; Conditions</h1>
        <p className="meta">Effective date: June 2026 &nbsp;·&nbsp; Version 1.0</p>

        <div className="summary">
          <div className="summary-t">What this means for BGV vendors</div>
          <p>As a background verification vendor on Datagate, you access employee data that has been consented to by the employee for a specific employer's purpose. Your access is limited to that scope — nothing more. You must handle this data with the same care as the employer, and delete it when instructed. Violations of these terms will result in immediate removal from the platform.</p>
        </div>

        <div className="toc">
          <div className="toc-t">On this page</div>
          <div className="toc-l">
            {[
              ["v1","Acceptance and approval"],["v2","Definitions"],["v3","Nature of your access"],
              ["v4","Permitted use"],["v5","Prohibited use"],["v6","Data handling obligations"],
              ["v7","Deletion obligations"],["v8","Security requirements"],["v9","Reporting obligations"],
              ["v10","Accuracy and conduct"],["v11","Liability"],["v12","Termination"],
              ["v13","Governing law"],["v14","General provisions"],["v15","Contact"]
            ].map(([id,t]) => (
              <a key={id} href={`#${id}`} className="toc-a">{t}</a>
            ))}
          </div>
        </div>

        {/* 1 */}
        <div className="sec" id="v1">
          <div className="sec-h">1. Acceptance and approval process</div>
          <p className="p">BGV vendors do not self-register on Datagate. Access to the platform as a BGV vendor requires prior approval by Datagate. The approval process includes:</p>
          <ul className="ul">
            <li>Submission of company registration documents and operating licences</li>
            <li>Review of data handling practices and security posture</li>
            <li>Acceptance of these terms in writing</li>
            <li>Onboarding by Datagate's admin team</li>
          </ul>
          <p className="p">By accepting these terms — whether electronically or in writing — you ("BGV Vendor", "you") agree to be bound by them in full. If you are accepting on behalf of an organisation, you represent that you have authority to do so.</p>
          <p className="p">These terms are a legally binding agreement between you and <strong>Datagate</strong> ("Datagate") and operate alongside the DPDP Act, 2023.</p>
        </div>

        {/* 2 */}
        <div className="sec" id="v2">
          <div className="sec-h">2. Definitions</div>
          <ul className="ul">
            <li><strong>"Employee data"</strong> means personal data about a candidate that you access through the platform pursuant to an employer's assignment</li>
            <li><strong>"Assigned case"</strong> means a specific background verification case assigned to you by an employer through the platform</li>
            <li><strong>"Instructing employer"</strong> means the employer who assigned the case to you through the platform</li>
            <li><strong>"Scope of check"</strong> means the specific verification checks you are assigned to conduct — for example, identity, education, employment, address, criminal, court, or reference checks</li>
            <li><strong>"Platform"</strong> means the Datagate employment verification platform at datagate.co.in</li>
          </ul>
        </div>

        {/* 3 */}
        <div className="sec" id="v3">
          <div className="sec-h">3. Nature of your access</div>
          <p className="p">Your access to employee data on Datagate is:</p>
          <ul className="ul">
            <li><strong>Derived:</strong> You receive access because an employer assigned a case to you. The underlying consent was given by the employee to the employer, not to you directly.</li>
            <li><strong>Scoped:</strong> You access only the data elements necessary for the specific checks you are assigned to conduct</li>
            <li><strong>Temporary:</strong> Your access exists only for the duration of the assigned case</li>
            <li><strong>Revocable:</strong> Datagate or the instructing employer may revoke your access at any time</li>
          </ul>
          <div className="warn"><strong>You are not the consent holder.</strong> The employee consented to the employer, not to you. If the employee withdraws consent, your access is revoked instantly regardless of the status of the case.</div>
        </div>

        {/* 4 */}
        <div className="sec" id="v4">
          <div className="sec-h">4. Permitted use</div>
          <p className="p">You may use employee data accessed through the platform only to:</p>
          <ul className="ul">
            <li>Conduct the specific background checks assigned to you by the instructing employer</li>
            <li>Upload evidence, check outcomes, and case documentation through the platform</li>
            <li>Communicate with the instructing employer and employee through the platform's messaging system regarding the assigned case</li>
            <li>Submit a final verification report through the platform on completion of assigned checks</li>
          </ul>
        </div>

        {/* 5 */}
        <div className="sec" id="v5">
          <div className="sec-h">5. Prohibited use</div>
          <div className="danger"><strong>Strict prohibitions.</strong> Any violation results in immediate removal from the platform and may constitute a criminal offence under applicable law.</div>
          <ul className="ul">
            <li>Do not use employee data for any purpose other than the assigned checks</li>
            <li>Do not retain employee data after the case is closed or your access is revoked</li>
            <li>Do not share employee data with any person or system outside the assigned case workflow</li>
            <li>Do not use employee data to build databases, profiles, or repositories of candidate information</li>
            <li>Do not sell, license, or transfer employee data under any circumstances</li>
            <li>Do not conduct checks beyond the scope assigned to you</li>
            <li>Do not contact the employee directly outside the platform's messaging system</li>
            <li>Do not use employee data to train AI or machine learning systems</li>
            <li>Do not share platform credentials with any person not authorised by Datagate</li>
          </ul>
        </div>

        {/* 6 */}
        <div className="sec" id="v6">
          <div className="sec-h">6. Data handling obligations</div>
          <p className="p">While a case is active, you must:</p>
          <ul className="ul">
            <li>Access and process employee data only within the Datagate platform where possible</li>
            <li>Where data must be accessed outside the platform (e.g. for field verification), store it only on secured, access-controlled systems for the minimum time necessary</li>
            <li>Ensure all personnel involved in a case are bound by confidentiality obligations at least as protective as these terms</li>
            <li>Encrypt any data stored or transmitted outside the platform</li>
            <li>Maintain an internal log of all personnel who accessed employee data for each case</li>
          </ul>
        </div>

        {/* 7 */}
        <div className="sec" id="v7">
          <div className="sec-h">7. Deletion obligations</div>
          <p className="p">You must delete all employee data in your possession:</p>
          <ul className="ul">
            <li>Within <strong>72 hours</strong> of case closure</li>
            <li>Within <strong>72 hours</strong> of your platform access being revoked for any reason</li>
            <li>Within <strong>72 hours</strong> of receiving notice that the employee has withdrawn consent or deleted their account</li>
          </ul>
          <p className="p">Deletion must be secure and complete — including any copies in email, local storage, shared drives, or internal case management systems. Secure deletion means data cannot be recovered.</p>
          <div className="callout"><strong>Case reports are an exception:</strong> You may retain a de-identified record of a completed case (case reference number, check type, outcome status) for your internal records — but not the employee's personal data.</div>
        </div>

        {/* 8 */}
        <div className="sec" id="v8">
          <div className="sec-h">8. Security requirements</div>
          <p className="p">You must maintain at a minimum:</p>
          <ul className="ul">
            <li>Access controls limiting employee data to personnel assigned to the specific case</li>
            <li>Encryption of data at rest and in transit</li>
            <li>Multi-factor authentication for access to any system holding employee data</li>
            <li>A documented data breach response procedure</li>
          </ul>
          <p className="p">Datagate may request evidence of these controls as part of onboarding or periodic review. Failure to demonstrate adequate controls is grounds for removal from the platform.</p>
        </div>

        {/* 9 */}
        <div className="sec" id="v9">
          <div className="sec-h">9. Reporting obligations</div>
          <p className="p">You must notify Datagate within <strong>24 hours</strong> of becoming aware of:</p>
          <ul className="ul">
            <li>Any actual or suspected breach involving employee data</li>
            <li>Any unauthorised access to your systems that could affect employee data</li>
            <li>Any legal order or regulatory inquiry involving employee data from the platform</li>
            <li>Any change in your organisation's legal status, ownership, or data handling practices material to this Agreement</li>
          </ul>
          <p className="p">Notification must be sent to <a href="mailto:security@datagate.co.in">security@datagate.co.in</a> and must include: the nature of the incident, the data affected, the steps taken or planned, and the likely impact.</p>
        </div>

        {/* 10 */}
        <div className="sec" id="v10">
          <div className="sec-h">10. Accuracy and professional conduct</div>
          <p className="p">You agree to:</p>
          <ul className="ul">
            <li>Conduct all assigned checks with due diligence, accuracy, and professional care</li>
            <li>Not submit reports based on unverified or fabricated information</li>
            <li>Disclose any conflict of interest involving a candidate before accepting a case</li>
            <li>Communicate with employees and employers through the platform in a professional and respectful manner</li>
            <li>Not make adverse findings about a candidate without adequate evidence documented in the case record</li>
          </ul>
          <div className="warn"><strong>False reports</strong> submitted through the platform may expose you to civil and criminal liability independent of these terms.</div>
        </div>

        {/* 11 */}
        <div className="sec" id="v11">
          <div className="sec-h">11. Liability and indemnity</div>
          <p className="p">You agree to indemnify and hold harmless Datagate from any claims, damages, losses, penalties, and costs arising from:</p>
          <ul className="ul">
            <li>Your breach of any provision of these terms</li>
            <li>Your violation of the DPDP Act, 2023 or applicable law</li>
            <li>Any inaccuracy or negligence in a verification report you submitted</li>
            <li>Any data breach or security incident attributable to your systems or personnel</li>
          </ul>
          <p className="p">Datagate's total liability to you for any claim shall not exceed the fees paid by the instructing employer to Datagate for the specific case giving rise to the claim.</p>
        </div>

        {/* 12 */}
        <div className="sec" id="v12">
          <div className="sec-h">12. Termination and removal</div>
          <p className="p">Datagate may remove you from the platform immediately and without notice for:</p>
          <ul className="ul">
            <li>Any violation of the prohibited uses in Section 5</li>
            <li>Any data breach or security incident attributable to your systems</li>
            <li>Submission of inaccurate or fraudulent reports</li>
            <li>Failure to meet security requirements under Section 8</li>
            <li>Any conduct that damages the trust of employees or employers on the platform</li>
          </ul>
          <p className="p">On removal, your access to all platform data is revoked immediately. Your obligations regarding data already received survive removal.</p>
        </div>

        {/* 13 */}
        <div className="sec" id="v13">
          <div className="sec-h">13. Governing law</div>
          <p className="p">This Agreement is governed by the laws of India. Any dispute shall be subject to the exclusive jurisdiction of courts of competent jurisdiction in <strong>Hyderabad, Telangana, India</strong>. Both parties agree to attempt good-faith resolution within 30 days of written notice of any dispute.</p>
        </div>

        {/* 14 */}
        <div className="sec" id="v14">
          <div className="sec-h">14. General provisions</div>
          <p className="p"><strong>Entire agreement:</strong> These terms, together with Datagate's Privacy Policy, constitute the entire agreement between you and Datagate regarding BGV vendor access to the platform.</p>
          <p className="p"><strong>Severability:</strong> If any provision is found invalid or unenforceable, the remaining provisions continue in full force.</p>
          <p className="p"><strong>Changes:</strong> Datagate may update these terms with 14 days' notice for material changes. Continued use constitutes acceptance.</p>
          <p className="p"><strong>No assignment:</strong> You may not assign these terms or your platform access to any other entity without Datagate's prior written consent.</p>
        </div>

        {/* 15 */}
        <div className="sec" id="v15">
          <div className="sec-h">15. Contact</div>
        </div>

        <div className="box">
          <div className="box-t">BGV Vendor enquiries &nbsp;·&nbsp; Datagate</div>
          <p>Onboarding: <a href="mailto:vendors@datagate.co.in">vendors@datagate.co.in</a></p>
          <p>Security incidents: <a href="mailto:security@datagate.co.in">security@datagate.co.in</a></p>
          <p>General: <a href="mailto:support@datagate.co.in">support@datagate.co.in</a></p>
          <br/>
          <p>We respond within 2 business days for vendor matters.</p>
        </div>

      </div>
    </>
  );
}
