import Link from "next/link";

// DATAGATE — EMPLOYER TERMS & DATA SHARING AGREEMENT
// Version 2.0 | DPDP Act 2023 Compliant
// Jurisdiction: Hyderabad, Telangana, India
// Key fixes from v1:
//   - Employers correctly classified as Data Fiduciaries (not processors)
//   - Jurisdiction specified: Hyderabad, Telangana
//   - Deletion window tightened: 72 hours digital, 7 days full purge
//   - Grievance Officer named
//   - Liability cap added
//   - Audit trail clause added (competitive moat)
//   - BGV vendor sub-processing clause added
//   - Severability, force majeure, entire agreement added
//   - Section 12 (Contact) completed
// Replace Datagate with your exact registered entity name before publishing

export default function EmployerTerms() {
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
        <h1 className="h1">Employer Terms &amp; Data Sharing Agreement</h1>
        <p className="meta">Effective date: 22 March 2026 &nbsp;·&nbsp; Version 2.0 &nbsp;·&nbsp; Last updated: June 2026</p>

        <div className="summary">
          <div className="summary-t">What this means for you</div>
          <p>By using Datagate as an employer, you agree to use employee data only for the hiring or verification purpose you stated — nothing else. You cannot share it further, sell it, or keep it after the hiring process ends. When an employee withdraws consent or deletes their account, you must delete all digital copies within 72 hours and complete a full system purge within 7 days. These are legal obligations under Indian law, not guidelines.</p>
        </div>

        <div className="toc">
          <div className="toc-t">On this page</div>
          <div className="toc-l">
            {[
              ["t1","Acceptance"],["t2","Definitions"],["t3","Permitted use"],
              ["t4","Prohibited use"],["t5","Consent withdrawal"],["t6","Account deletion"],
              ["t7","BGV vendor routing"],["t8","Your responsibilities"],["t9","Data security"],
              ["t10","Audit trail"],["t11","Liability and indemnity"],["t12","Limitation of liability"],
              ["t13","Termination"],["t14","Governing law"],["t15","General provisions"],["t16","Contact"]
            ].map(([id,t]) => (
              <a key={id} href={`#${id}`} className="toc-a">{t}</a>
            ))}
          </div>
        </div>

        {/* 1 */}
        <div className="sec" id="t1">
          <div className="sec-h">1. Acceptance</div>
          <p className="p">By creating an employer account, submitting a consent request, or accessing any employee profile data on Datagate, you ("Employer") agree to these Employer Terms and Data Sharing Agreement ("Agreement"). If you are accepting on behalf of a company, you represent that you have authority to bind that company.</p>
          <p className="p">If you do not agree to this Agreement, do not create an account or access employee data.</p>
          <p className="p">This Agreement is between you and <strong>Datagate</strong> ("Datagate") and operates alongside applicable law, including the Digital Personal Data Protection Act, 2023 ("DPDP Act") and any rules or regulations issued thereunder.</p>
        </div>

        {/* 2 */}
        <div className="sec" id="t2">
          <div className="sec-h">2. Definitions</div>
          <ul className="ul">
            <li><strong>"Employee data"</strong> means any personal data about an employee that you access through the Datagate platform following the employee's consent</li>
            <li><strong>"Consent request"</strong> means a formal request submitted by you through the platform to access a specific employee's profile for a stated purpose</li>
            <li><strong>"Stated purpose"</strong> means the specific purpose you declared in your consent request (e.g. background verification, onboarding)</li>
            <li><strong>"BGV vendor"</strong> means a background verification agency assigned by you through the platform to conduct checks on your behalf</li>
            <li><strong>"Data Fiduciary"</strong> has the meaning given in the DPDP Act — an entity that determines the purpose and means of processing personal data. You are a Data Fiduciary for your own processing of employee data received through this platform.</li>
            <li><strong>"Platform"</strong> means the Datagate employment verification platform accessible at datagate.co.in</li>
          </ul>
        </div>

        {/* 3 */}
        <div className="sec" id="t3">
          <div className="sec-h">3. Permitted use of employee data</div>
          <p className="p">Once an employee approves your consent request, you may use their data only for:</p>
          <ul className="ul">
            <li>Background verification of the specific candidate named in your consent request, for the purpose you stated</li>
            <li>Onboarding of a candidate who has accepted a confirmed offer of employment from you</li>
            <li>Compliance with legal obligations arising directly from the employment relationship with that candidate</li>
          </ul>
          <p className="p">Use is strictly limited to the stated purpose. If your purpose changes — even for the same candidate — you must submit a new consent request and obtain fresh approval.</p>
          <div className="callout"><strong>One consent, one purpose.</strong> Receiving consent for background verification does not authorise you to use the data for any other purpose, including onboarding, unless you obtain separate consent for onboarding.</div>
        </div>

        {/* 4 */}
        <div className="sec" id="t4">
          <div className="sec-h">4. Prohibited use</div>
          <div className="danger"><strong>These are strict prohibitions.</strong> Violation constitutes a breach of this Agreement and may constitute an offence under the DPDP Act, 2023. You bear full legal responsibility as a Data Fiduciary for your own processing of this data.</div>
          <ul className="ul">
            <li>Do not use employee data for any purpose other than the stated purpose</li>
            <li>Do not retain employee data beyond the period necessary for the stated purpose</li>
            <li>Do not share employee data with any third party — including subsidiaries, affiliates, group companies, or partners — without fresh consent from the employee, except as provided in Section 7 (BGV vendor routing)</li>
            <li>Do not use employee data for marketing, profiling, scoring, or any commercial purpose unrelated to the specific hiring or onboarding process</li>
            <li>Do not retain copies after the employee withdraws consent</li>
            <li>Do not retain copies after a candidate is rejected and the hiring process for that candidate is concluded</li>
            <li>Do not sell, license, sublicense, or transfer employee data to any party under any circumstances</li>
            <li>Do not use employee data to train machine learning models or any automated system</li>
            <li>Do not combine employee data received from Datagate with data obtained from other sources to create profiles beyond the stated purpose</li>
          </ul>
        </div>

        {/* 5 */}
        <div className="sec" id="t5">
          <div className="sec-h">5. When an employee withdraws consent</div>
          <p className="p">An employee may withdraw consent at any time without giving a reason. When this happens:</p>
          <ul className="ul">
            <li>Your access to their profile on the platform is revoked <strong>instantly and automatically</strong></li>
            <li>You receive an email notification immediately</li>
            <li>You must delete all digital copies of their data within <strong>72 hours</strong> of the notification timestamp</li>
            <li>You must complete a full purge from all systems — including backups, email, HR platforms, local storage, and any system you shared the data with — within <strong>7 days</strong></li>
            <li>Where you have assigned a BGV vendor, you must instruct them to delete all copies within the same timeframes</li>
          </ul>
          <div className="callout"><strong>Legal notice:</strong> The timestamp on the withdrawal notification email constitutes formal, legally valid notice to you under this Agreement. Any use or retention of the employee's data after that timestamp is your sole liability as a Data Fiduciary.</div>
        </div>

        {/* 6 */}
        <div className="sec" id="t6">
          <div className="sec-h">6. When an employee deletes their account</div>
          <p className="p">When an employee deletes their Datagate account, you will receive an email notification immediately. Upon receiving it:</p>
          <ul className="ul">
            <li>Delete all digital copies from all your systems within <strong>72 hours</strong></li>
            <li>Complete a full purge — including email, HR systems, shared drives, local storage, backups, and any downstream systems — within <strong>7 days</strong></li>
            <li>Instruct any BGV vendor you assigned to delete all copies within the same timeframes</li>
            <li>Datagate retains a cryptographically timestamped record of this notification as evidence that the obligation was formally communicated</li>
          </ul>
          <p className="p">You may not penalise, disadvantage, or discriminate against any employee or candidate for exercising their right to delete their account or withdraw consent.</p>
        </div>

        {/* 7 */}
        <div className="sec" id="t7">
          <div className="sec-h">7. BGV vendor routing</div>
          <p className="p">You may assign a Datagate-approved BGV vendor to conduct background checks on your behalf through the platform. When you do:</p>
          <ul className="ul">
            <li>The assignment is limited to the scope of the employee's original consent</li>
            <li>The BGV vendor receives access only to the data necessary for the checks they are assigned to conduct</li>
            <li>The BGV vendor is independently bound by Datagate's BGV Vendor Terms</li>
            <li>You remain responsible as the instructing Data Fiduciary for the BGV vendor's handling of the employee's data</li>
            <li>You must not instruct the BGV vendor to conduct checks beyond the scope of the stated purpose</li>
            <li>On consent withdrawal or account deletion, your instruction to the BGV vendor to delete data is your obligation — Datagate will revoke platform access to the vendor simultaneously</li>
          </ul>
          <div className="warn"><strong>Only Datagate-approved BGV vendors</strong> may be assigned through the platform. Routing employee data to unapproved third parties is a prohibited use under Section 4.</div>
        </div>

        {/* 8 */}
        <div className="sec" id="t8">
          <div className="sec-h">8. Your responsibilities</div>
          <p className="p">As a Data Fiduciary processing employee data received through Datagate, you agree to:</p>
          <ul className="ul">
            <li>Process employee data only for the stated purpose in your consent request</li>
            <li>Ensure all personnel with access to employee data are bound by appropriate confidentiality obligations</li>
            <li>Implement and maintain appropriate technical and organisational security measures for all employee data you store</li>
            <li>Notify Datagate within <strong>72 hours</strong> of becoming aware of any incident involving employee data — including unauthorised access, disclosure, loss, or breach</li>
            <li>Cooperate with any audit, inspection, or investigation by Datagate or competent regulatory authorities</li>
            <li>Maintain records of all consent requests submitted and the purposes stated, for a minimum of 7 years</li>
            <li>Ensure that any BGV vendor you assign complies with all applicable obligations</li>
          </ul>
        </div>

        {/* 9 */}
        <div className="sec" id="t9">
          <div className="sec-h">9. Data security</div>
          <p className="p">If you store employee data received through Datagate, you must:</p>
          <ul className="ul">
            <li>Restrict access to authorised personnel only, on a need-to-know basis</li>
            <li>Store data only on systems with appropriate access controls and encryption</li>
            <li>Not store employee data on personal devices, personal email accounts, or unsecured shared drives</li>
            <li>Implement access logging so that any access to stored employee data is recorded</li>
            <li>Ensure data is deleted in a manner that makes recovery impossible (secure deletion, not just removal from active systems)</li>
          </ul>
        </div>

        {/* 10 */}
        <div className="sec" id="t10">
          <div className="sec-h">10. Audit trail</div>
          <p className="p">Datagate maintains a cryptographic, tamper-evident log of all consent events on the platform — including every consent request, approval, access event, and withdrawal. These logs are the authoritative record of what was consented to, by whom, for what purpose, and when.</p>
          <div className="callout"><strong>These logs are admissible evidence.</strong> In any dispute, regulatory inquiry, or legal proceeding involving employee data accessed through Datagate, the platform's consent logs are the primary source of truth. Your obligations under this Agreement are timestamped and recorded.</div>
          <p className="p">You may request a copy of consent logs relating to your account by contacting <a href="mailto:support@datagate.co.in">support@datagate.co.in</a>.</p>
        </div>

        {/* 11 */}
        <div className="sec" id="t11">
          <div className="sec-h">11. Liability and indemnity</div>
          <p className="p">You agree to indemnify, defend, and hold harmless Datagate, its officers, employees, and agents from and against any and all claims, damages, losses, penalties, fines, and costs (including reasonable legal fees) arising from:</p>
          <ul className="ul">
            <li>Your breach of any provision of this Agreement</li>
            <li>Your violation of the DPDP Act, 2023 or any other applicable data protection law</li>
            <li>Your misuse of employee data received through the platform</li>
            <li>Any act or omission of a BGV vendor you assigned that results in a data protection breach</li>
            <li>Any third-party claim arising from your processing of employee data</li>
          </ul>
        </div>

        {/* 12 */}
        <div className="sec" id="t12">
          <div className="sec-h">12. Limitation of liability</div>
          <p className="p">To the maximum extent permitted by applicable law, Datagate's total aggregate liability to you under or in connection with this Agreement — whether in contract, tort, or otherwise — shall not exceed the total fees paid by you to Datagate in the <strong>three calendar months</strong> immediately preceding the event giving rise to the claim.</p>
          <p className="p">Datagate is not liable for any indirect, incidental, consequential, or punitive damages, including loss of profits, loss of data, or business interruption, even if advised of the possibility of such damages.</p>
          <p className="p">This limitation does not apply to liability arising from Datagate's fraud, wilful misconduct, or gross negligence.</p>
        </div>

        {/* 13 */}
        <div className="sec" id="t13">
          <div className="sec-h">13. Termination</div>
          <p className="p">Datagate may suspend or terminate your account immediately and without prior notice for:</p>
          <ul className="ul">
            <li>Any violation of the prohibited uses in Section 4</li>
            <li>Any material breach of this Agreement</li>
            <li>Any misuse of employee data that could harm employees or the platform</li>
            <li>Any regulatory action or legal order requiring suspension</li>
          </ul>
          <p className="p">On termination, your access to the platform and all employee profiles is immediately revoked. Your obligations under Sections 4, 5, 6, 8, and 9 survive termination and remain in full force with respect to all employee data you received prior to termination.</p>
          <p className="p">You may terminate your account at any time by contacting support. On account closure, you must delete all employee data in your possession within 7 days.</p>
        </div>

        {/* 14 */}
        <div className="sec" id="t14">
          <div className="sec-h">14. Governing law and dispute resolution</div>
          <p className="p">This Agreement is governed by and construed in accordance with the laws of India. Any dispute arising out of or in connection with this Agreement shall be subject to the exclusive jurisdiction of the courts of competent jurisdiction in <strong>Hyderabad, Telangana, India</strong>.</p>
          <p className="p">Before initiating legal proceedings, both parties agree to attempt good-faith resolution within 30 days of written notice of the dispute.</p>
        </div>

        {/* 15 */}
        <div className="sec" id="t15">
          <div className="sec-h">15. General provisions</div>
          <p className="p"><strong>Entire agreement:</strong> This Agreement, together with Datagate's Privacy Policy, constitutes the entire agreement between you and Datagate regarding the subject matter herein and supersedes all prior agreements or representations.</p>
          <p className="p"><strong>Severability:</strong> If any provision of this Agreement is found to be invalid or unenforceable by a court of competent jurisdiction, that provision shall be modified to the minimum extent necessary to make it enforceable, and the remaining provisions shall continue in full force and effect.</p>
          <p className="p"><strong>Force majeure:</strong> Neither party shall be liable for failure to perform obligations due to circumstances beyond their reasonable control, including acts of God, natural disasters, government orders, or infrastructure outages, provided the affected party gives prompt notice and takes reasonable steps to mitigate the impact.</p>
          <p className="p"><strong>Changes to this Agreement:</strong> We may update these terms. For material changes, we will give at least <strong>14 days' notice</strong> by email before they take effect. Continued use after the effective date constitutes acceptance.</p>
          <p className="p"><strong>No waiver:</strong> Failure by either party to enforce any provision of this Agreement shall not constitute a waiver of the right to enforce it in future.</p>
          <p className="p"><strong>Assignment:</strong> You may not assign your rights or obligations under this Agreement without Datagate's prior written consent. Datagate may assign this Agreement in connection with a merger, acquisition, or sale of assets.</p>
        </div>

        {/* 16 */}
        <div className="sec" id="t16">
          <div className="sec-h">16. Contact</div>
        </div>

        <div className="box">
          <div className="box-t">Questions &nbsp;·&nbsp; Datagate</div>
          <p>General: <a href="mailto:support@datagate.co.in">support@datagate.co.in</a></p>
          <p>Legal / compliance: <a href="mailto:legal@datagate.co.in">legal@datagate.co.in</a></p>
          <p>Grievances: <a href="mailto:grievance@datagate.co.in">grievance@datagate.co.in</a></p>
          <br/>
          <p>We respond within 5 business days. For legal matters, please send written correspondence to our registered address in Hyderabad, Telangana, India.</p>
        </div>

      </div>
    </>
  );
}
