import Link from "next/link";
const UPDATED = "22 March 2026";

const NavBack = () => (
  <nav style={{position:"sticky",top:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"space-between",padding:".9rem 3rem",background:"rgba(14,14,16,0.96)",backdropFilter:"blur(16px)",borderBottom:"1px solid #1a1a1e"}}>
    <Link href="/" style={{display:"inline-flex",alignItems:"center",gap:".5rem",fontSize:".8rem",fontWeight:600,color:"#504a44",textDecoration:"none"}}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      Back
    </Link>
    <Link href="/" style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:"14px",color:"#f5f0e8",textDecoration:"none"}}>Datagate</Link>
  </nav>
);

export default function EmployerTerms() {
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
        .warn{background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.14);border-left:3px solid #ef4444;border-radius:0 10px 10px 0;padding:.85rem 1.1rem;margin:.85rem 0;font-size:.84rem;color:#a09888;line-height:1.75}
        .warn strong{color:#fca5a5}
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
        <h1 className="h1">Employer Terms &amp;<br/>Data Sharing Agreement</h1>
        <p className="meta">Last updated: {UPDATED}</p>

        <div className="toc">
          <div className="toc-t">Contents</div>
          <div className="toc-l">
            {[["1","Acceptance"],["2","What You May Do with Employee Data"],["3","What You Must Not Do"],["4","When an Employee Withdraws Consent"],["5","When an Employee Deletes Their Account"],["6","Your Responsibilities"],["7","Data Security"],["8","Liability"],["9","Termination"],["10","Governing Law"],["11","Contact"]].map(([n,t]) => (
              <a key={n} href={`#t${n}`} className="toc-a">{n}. {t}</a>
            ))}
          </div>
        </div>

        <div className="hl">
          <strong>Summary:</strong> Employee data shared through Datagate may only be used for the hiring purpose stated in your consent request. You cannot store it longer than necessary, share it further, or use it for any other purpose. When an employee withdraws consent or deletes their account, you must delete all copies. Violation puts full legal liability on you.
        </div>

        <div className="sec" id="t1">
          <div className="sec-h">1. Acceptance</div>
          <p className="p">By creating an employer account or accessing any employee profile data on Datagate, you agree to these Employer Terms and Data Sharing Agreement. If you do not agree, do not create an account or access employee data.</p>
          <p className="p">These terms are a legally binding agreement between you and Datagate Technologies. They operate alongside applicable Indian law including the Digital Personal Data Protection Act, 2023 (DPDP Act).</p>
        </div>

        <div className="sec" id="t2">
          <div className="sec-h">2. What You May Do with Employee Data</div>
          <p className="p">Once an employee approves your consent request, you may use their data only for:</p>
          <ul className="ul">
            <li>Background verification of the specific candidate you are considering for employment</li>
            <li>Onboarding of a candidate who has accepted your offer of employment</li>
            <li>Compliance with Indian labour law requirements directly related to this employment</li>
            <li>Any other purpose you explicitly stated in your consent request</li>
          </ul>
          <p className="p">Use is limited to the purpose stated. If your purpose changes, you must submit a new consent request.</p>
        </div>

        <div className="sec" id="t3">
          <div className="sec-h">3. What You Must Not Do</div>
          <div className="warn">
            <strong>These are strict prohibitions.</strong> Violation may constitute a breach of the DPDP Act, 2023. Full legal liability rests with you as the data processor.
          </div>
          <ul className="ul">
            <li>Do not store employee data beyond the period necessary for the stated hiring purpose</li>
            <li>Do not share employee data with any third party — including subsidiaries, affiliates, or recruitment agencies — without fresh consent from the employee</li>
            <li>Do not use employee data for any purpose other than that stated in the consent request</li>
            <li>Do not use employee data for marketing, profiling, or any commercial purpose</li>
            <li>Do not retain copies after the employee withdraws consent</li>
            <li>Do not retain copies if the candidate is rejected and the hiring process is concluded</li>
            <li>Do not sell, license, or transfer employee data to any party</li>
          </ul>
        </div>

        <div className="sec" id="t4">
          <div className="sec-h">4. When an Employee Withdraws Consent</div>
          <p className="p">An employee may withdraw their consent at any time. When this happens:</p>
          <ul className="ul">
            <li>You will receive an email notification immediately</li>
            <li>Your access to their profile on Datagate is revoked instantly</li>
            <li>You must delete all copies of their data in your possession within 30 days of receiving the notification</li>
            <li>The timestamp of the notification email constitutes legal notice. Any continued use of their data after that point is entirely your liability</li>
          </ul>
          <div className="hl"><strong>Important:</strong> Withdrawal of consent does not affect any lawful action you took before the withdrawal. It only governs use of data from the point of withdrawal onwards.</div>
        </div>

        <div className="sec" id="t5">
          <div className="sec-h">5. When an Employee Deletes Their Account</div>
          <p className="p">When an employee deletes their Datagate account, Datagate will notify you by email. Upon receiving this notification:</p>
          <ul className="ul">
            <li>You must delete all copies of their data from all your systems within 30 days</li>
            <li>This includes email, local storage, internal HR systems, and any third-party systems you have shared the data with</li>
            <li>Datagate retains a record of the notification as evidence that this obligation was communicated to you</li>
          </ul>
          <p className="p">You may not penalise, disadvantage, or retaliate against an employee for deleting their account or withdrawing consent.</p>
        </div>

        <div className="sec" id="t6">
          <div className="sec-h">6. Your Responsibilities</div>
          <p className="p">As a data processor under the DPDP Act, you agree to:</p>
          <ul className="ul">
            <li>Process employee data only for the purposes stated in your consent requests</li>
            <li>Ensure anyone in your organisation who accesses the data is bound by appropriate confidentiality obligations</li>
            <li>Not engage sub-processors without first notifying Datagate</li>
            <li>Notify Datagate within 72 hours if you become aware of any incident involving employee data</li>
            <li>Cooperate with any audit or regulatory investigation</li>
          </ul>
        </div>

        <div className="sec" id="t7">
          <div className="sec-h">7. Data Security</div>
          <p className="p">If you download or store any employee data from Datagate, you must:</p>
          <ul className="ul">
            <li>Restrict access to authorised personnel only</li>
            <li>Store it only in systems with appropriate access controls</li>
            <li>Not store it on personal devices or in personal email accounts</li>
          </ul>
        </div>

        <div className="sec" id="t8">
          <div className="sec-h">8. Liability</div>
          <p className="p">You agree to indemnify and hold harmless Datagate Technologies from any claims, damages, or expenses arising from:</p>
          <ul className="ul">
            <li>Your breach of this Agreement</li>
            <li>Your violation of the DPDP Act or any other applicable law</li>
            <li>Any misuse of employee data in your possession</li>
            <li>Any failure to delete data as required under these terms</li>
          </ul>
        </div>

        <div className="sec" id="t9">
          <div className="sec-h">9. Termination</div>
          <p className="p">Datagate may suspend or terminate your account without notice if you violate these terms, misuse employee data, or misrepresent your identity or purpose. On termination, your access to employee profiles is immediately revoked. Your obligations regarding data already received survive termination indefinitely.</p>
        </div>

        <div className="sec" id="t10">
          <div className="sec-h">10. Governing Law</div>
          <p className="p">This Agreement is governed by the laws of India. Disputes shall be subject to the jurisdiction of Indian courts. Both parties agree to attempt good-faith resolution before initiating legal proceedings.</p>
        </div>

        <div className="sec" id="t11">
          <div className="sec-h">11. Changes to These Terms</div>
          <p className="p">We may update these terms. Material changes will be communicated by email with at least 14 days notice before taking effect. Continued use of the platform after the effective date constitutes acceptance.</p>
        </div>

        <div className="box">
          <div className="box-t">Questions or Violations</div>
          <p>To report a suspected violation or ask a question about these terms:</p>
          <br/>
          <p>Email: <a href="mailto:support@datagate.co.in">support@datagate.co.in</a></p>
          <p>Response time: Within 5 business days</p>
        </div>
      </div>
    </>
  );
}