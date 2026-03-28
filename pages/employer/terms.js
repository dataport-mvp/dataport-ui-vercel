import Link from "next/link";

const LAST_UPDATED = "22 March 2026";

export default function EmployerTerms() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#0e0e10;color:#f5f0e8;font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}
        .t-nav{
          position:sticky;top:0;z-index:100;
          display:flex;align-items:center;justify-content:space-between;
          padding:.9rem 3rem;
          background:rgba(14,14,16,0.96);
          backdrop-filter:blur(16px);
          border-bottom:1px solid #1a1a1e;
        }
        .t-back{display:inline-flex;align-items:center;gap:.5rem;font-size:.8rem;font-weight:600;color:#504a44;text-decoration:none;transition:color .15s}
        .t-back:hover{color:#c9a84c}
        .t-logo{font-family:'DM Sans',sans-serif;font-weight:700;font-size:15px;color:#f5f0e8;text-decoration:none}
        .t-wrap{max-width:760px;margin:0 auto;padding:5rem 3rem 8rem}
        .t-eyebrow{font-size:.66rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#c9a84c;display:flex;align-items:center;gap:.6rem;margin-bottom:1.25rem}
        .t-eyebrow::before{content:'';width:20px;height:1.5px;background:#c9a84c}
        .t-h1{font-family:'Playfair Display',serif;font-size:clamp(2rem,4vw,3rem);font-weight:600;color:#f5f0e8;letter-spacing:-.5px;margin-bottom:.75rem;line-height:1.15}
        .t-meta{font-size:.8rem;color:#3a3530;margin-bottom:3rem;padding-bottom:2rem;border-bottom:1px solid #1a1a1e}
        .t-toc{background:#141416;border:1px solid #1a1a1e;border-radius:14px;padding:1.5rem 1.75rem;margin-bottom:3rem}
        .t-toc-title{font-size:.72rem;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#504a44;margin-bottom:1rem}
        .t-toc-list{display:flex;flex-direction:column;gap:.4rem}
        .t-toc-item{font-size:.82rem;color:#504a44;text-decoration:none;transition:color .15s}
        .t-toc-item:hover{color:#c9a84c}
        .t-highlight{background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.15);border-left:3px solid #c9a84c;border-radius:0 10px 10px 0;padding:.85rem 1.1rem;margin:.85rem 0;font-size:.84rem;color:#a09888;line-height:1.75}
        .t-highlight strong{color:#c9a84c}
        .t-warn{background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.15);border-left:3px solid #ef4444;border-radius:0 10px 10px 0;padding:.85rem 1.1rem;margin:.85rem 0;font-size:.84rem;color:#a09888;line-height:1.75}
        .t-warn strong{color:#fca5a5}
        .t-sec{margin-bottom:3rem}
        .t-sec-h{font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:600;color:#f5f0e8;margin-bottom:1rem;padding-bottom:.6rem;border-bottom:1px solid #1a1a1e;letter-spacing:-.2px}
        .t-p{font-size:.88rem;color:#a09888;line-height:1.85;margin-bottom:.85rem}
        .t-p:last-child{margin-bottom:0}
        .t-ul{padding-left:1.25rem;margin-bottom:.85rem}
        .t-ul li{font-size:.88rem;color:#a09888;line-height:1.85;margin-bottom:.35rem}
        .t-ul li::marker{color:#c9a84c}
        .t-contact{background:#141416;border:1px solid #1a1a1e;border-radius:14px;padding:1.75rem;margin-top:2rem}
        .t-contact-title{font-size:.85rem;font-weight:700;color:#f5f0e8;margin-bottom:.75rem}
        .t-contact p{font-size:.84rem;color:#504a44;line-height:1.75}
        .t-contact a{color:#c9a84c;text-decoration:none}
        .t-contact a:hover{text-decoration:underline}
        a{color:#c9a84c}
        @media(max-width:768px){.t-nav{padding:.9rem 1.25rem}.t-wrap{padding:3rem 1.5rem 6rem}}
      `}</style>

      <nav className="t-nav">
        <Link href="/" className="t-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Datagate
        </Link>
        <Link href="/" className="t-logo">Datagate</Link>
      </nav>

      <div className="t-wrap">
        <div className="t-eyebrow">Legal</div>
        <h1 className="t-h1">Employer Terms &amp; Data Sharing Agreement</h1>
        <p className="t-meta">Last updated: {LAST_UPDATED} · Effective from: {LAST_UPDATED}</p>

        <div className="t-toc">
          <div className="t-toc-title">Table of Contents</div>
          <div className="t-toc-list">
            {[["1","Acceptance of Terms"],["2","Definitions"],["3","Permitted Use of Data"],["4","Prohibited Use of Data"],["5","Your Obligations as Data Processor"],["6","Consent Framework"],["7","Data Security Requirements"],["8","Data Retention and Deletion"],["9","Liability and Indemnification"],["10","Termination"],["11","Governing Law"],["12","Contact"]].map(([n,t]) => (
              <a key={n} href={`#t${n}`} className="t-toc-item">{n}. {t}</a>
            ))}
          </div>
        </div>

        <div className="t-highlight">
          <strong>Summary:</strong> As an employer on Datagate, you may only use employee data for the legitimate hiring purpose for which it was shared. You cannot store, copy, sell, or share employee data without further consent. When an employee withdraws consent, you must immediately cease using their data. Violation of these terms is a breach of DPDP Act 2023 and your liability.
        </div>

        <div className="t-sec" id="t1">
          <div className="t-sec-h">1. Acceptance of Terms</div>
          <p className="t-p">By creating an employer account on Datagate or accessing any employee profile data, you ("Employer", "you") agree to be bound by these Employer Terms and Data Sharing Agreement ("Agreement"). If you do not agree, do not create an account or access employee data.</p>
          <p className="t-p">These terms constitute a legally binding agreement between you and Datagate Technologies ("Datagate"). These terms are in addition to, and not in place of, applicable Indian law including the DPDP Act, 2023, Information Technology Act, 2000, and any regulations thereunder.</p>
        </div>

        <div className="t-sec" id="t2">
          <div className="t-sec-h">2. Definitions</div>
          <ul className="t-ul">
            <li><strong style={{color:"#f5f0e8"}}>"Employee Data"</strong> means any personal data of an employee shared with you through the Datagate platform following employee consent, including identity documents, employment history, education records, and uploaded files.</li>
            <li><strong style={{color:"#f5f0e8"}}>"Consent"</strong> means the explicit, timestamped, purpose-specific approval granted by an employee through the Datagate platform to share their data with you.</li>
            <li><strong style={{color:"#f5f0e8"}}>"Data Fiduciary"</strong> means Datagate Technologies, which determines the purpose and means of processing personal data.</li>
            <li><strong style={{color:"#f5f0e8"}}>"Data Processor"</strong> means you, the Employer, who processes employee data on behalf of and subject to the instructions of the data fiduciary and the employee's consent.</li>
          </ul>
        </div>

        <div className="t-sec" id="t3">
          <div className="t-sec-h">3. Permitted Use of Data</div>
          <p className="t-p">You may use Employee Data solely for the following purposes:</p>
          <ul className="t-ul">
            <li>Background verification of candidates you are actively considering for employment</li>
            <li>Employee onboarding processes for candidates who have accepted an offer of employment</li>
            <li>Compliance with Indian labour law requirements related to the specific employment</li>
            <li>Any other purpose explicitly stated in your consent request and approved by the employee</li>
          </ul>
        </div>

        <div className="t-sec" id="t4">
          <div className="t-sec-h">4. Prohibited Use of Data</div>
          <div className="t-warn">
            <strong>Strictly prohibited.</strong> Any violation may constitute a breach of DPDP Act 2023 and applicable law, for which you bear full liability.
          </div>
          <p className="t-p">You must NOT:</p>
          <ul className="t-ul">
            <li>Store Employee Data in your own systems beyond the period necessary for the stated purpose</li>
            <li>Share Employee Data with any third party including subsidiaries, affiliates, or recruitment agencies, without fresh consent from the employee</li>
            <li>Use Employee Data for any purpose other than that stated in the consent request</li>
            <li>Use Employee Data for marketing, profiling, or any commercial purpose unrelated to the stated hiring</li>
            <li>Retain copies of Employee Data after the employee withdraws consent</li>
            <li>Retain copies of Employee Data if the candidate is rejected and the hiring process is concluded</li>
            <li>Use Aadhaar numbers for any purpose beyond verification of identity for the stated hiring purpose</li>
            <li>Sell, license, or otherwise transfer Employee Data to any party</li>
          </ul>
        </div>

        <div className="t-sec" id="t5">
          <div className="t-sec-h">5. Your Obligations as Data Processor</div>
          <p className="t-p">As a data processor under the DPDP Act, 2023, you agree to:</p>
          <ul className="t-ul">
            <li>Process Employee Data only on documented instructions from Datagate and in accordance with employee consent</li>
            <li>Ensure that persons authorised to process Employee Data are bound by appropriate confidentiality obligations</li>
            <li>Implement appropriate technical and organisational measures to protect Employee Data</li>
            <li>Not engage sub-processors without Datagate's prior written consent</li>
            <li>Delete all Employee Data within 30 days of consent withdrawal or conclusion of the hiring process, whichever is earlier</li>
            <li>Notify Datagate within 72 hours of becoming aware of any breach involving Employee Data</li>
            <li>Cooperate with any audit or investigation by Datagate or regulatory authorities</li>
          </ul>
        </div>

        <div className="t-sec" id="t6">
          <div className="t-sec-h">6. Consent Framework</div>
          <ul className="t-ul">
            <li>Each consent request must include a specific, honest statement of purpose</li>
            <li>You must not misrepresent your identity, company, or purpose when requesting consent</li>
            <li>When an employee withdraws consent on the Datagate platform, you will receive a notification by email. You must immediately cease all use of their data and delete any copies within 30 days</li>
            <li>Withdrawal of consent does not affect the lawfulness of processing based on consent before withdrawal</li>
            <li>You may not penalise or retaliate against an employee for withdrawing consent</li>
          </ul>
        </div>

        <div className="t-sec" id="t7">
          <div className="t-sec-h">7. Data Security Requirements</div>
          <p className="t-p">If you download or export any Employee Data from the Datagate platform, you must:</p>
          <ul className="t-ul">
            <li>Store it only in systems with access controls limiting access to authorised personnel</li>
            <li>Encrypt any stored copies using industry-standard encryption</li>
            <li>Maintain logs of who in your organisation accessed the data and when</li>
            <li>Not store it on personal devices, personal email, or unencrypted file storage</li>
          </ul>
        </div>

        <div className="t-sec" id="t8">
          <div className="t-sec-h">8. Data Retention and Deletion</div>
          <ul className="t-ul">
            <li>You must delete all copies of Employee Data within 30 days of: (a) employee withdrawal of consent, (b) conclusion of the hiring process (offer accepted or rejected), or (c) your account termination</li>
            <li>Deletion must be complete — including from email, local storage, backups, and any third-party systems</li>
            <li>Datagate may request a written confirmation of deletion. You must provide this within 7 days of request</li>
          </ul>
        </div>

        <div className="t-sec" id="t9">
          <div className="t-sec-h">9. Liability and Indemnification</div>
          <p className="t-p">You agree to indemnify, defend, and hold harmless Datagate Technologies, its officers, directors, and employees from any claims, damages, losses, and expenses (including legal fees) arising from:</p>
          <ul className="t-ul">
            <li>Your breach of this Agreement</li>
            <li>Your violation of the DPDP Act, 2023 or any other applicable law</li>
            <li>Any misuse of Employee Data</li>
            <li>Any security breach resulting from your failure to implement adequate safeguards</li>
          </ul>
          <div className="t-highlight">
            <strong>Important:</strong> When an employee withdraws consent and you receive the withdrawal notification email, your liability for any continued use of their data is entirely yours. Datagate's audit trail documenting the notification timestamp serves as evidence of notification.
          </div>
        </div>

        <div className="t-sec" id="t10">
          <div className="t-sec-h">10. Termination</div>
          <p className="t-p">Datagate may suspend or terminate your employer account without notice if you:</p>
          <ul className="t-ul">
            <li>Violate any provision of this Agreement</li>
            <li>Use Employee Data for unauthorised purposes</li>
            <li>Misrepresent your identity or purpose to employees</li>
            <li>Fail to delete Employee Data as required</li>
          </ul>
          <p className="t-p">Upon termination, all your access to Employee Data through the platform is immediately revoked. Your obligations regarding previously accessed Employee Data survive termination.</p>
        </div>

        <div className="t-sec" id="t11">
          <div className="t-sec-h">11. Governing Law</div>
          <p className="t-p">This Agreement is governed by the laws of India. Any dispute arising from this Agreement shall be subject to the exclusive jurisdiction of the courts in India. The parties agree to first attempt resolution through good-faith negotiation before initiating legal proceedings.</p>
        </div>

        <div className="t-sec" id="t12">
          <div className="t-sec-h">12. Changes to These Terms</div>
          <p className="t-p">We may update these terms periodically. Material changes will be communicated by email and in-platform notice with at least 14 days' notice. Continued use of the platform after the effective date constitutes acceptance.</p>
        </div>

        <div className="t-contact">
          <div className="t-contact-title">Questions or Concerns</div>
          <p>For questions about these terms or to report a violation:</p>
          <br/>
          <p>Email: <a href="mailto:support@datagate.co.in">support@datagate.co.in</a></p>
          <p>Response time: Within 5 business days</p>
          <br/>
          <p style={{fontSize:".78rem",color:"#3a3530"}}>Disputes related to data processing may also be escalated to the Data Protection Board of India once constituted under the DPDP Act, 2023.</p>
        </div>
      </div>
    </>
  );
}