import Link from "next/link";

export default function EmployerTerms() {
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
        .warn{background:#fff8f0;border-left:3px solid #f59e0b;border-radius:0 9px 9px 0;padding:.85rem 1.1rem;margin:.85rem 0;font-size:.84rem;color:#92400e;line-height:1.75}
        .warn strong{color:#d97706}
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
        <h1 className="h1">Employer Terms &amp; Data Sharing Agreement</h1>
        <p className="meta">Effective date: 22 March 2026 &nbsp;·&nbsp; Last updated: 22 March 2026</p>

        <div className="summary">
          <div className="summary-t">What this means for you</div>
          <p>By using Datagate as an employer, you agree to use employee data only for the hiring purpose you stated. You cannot share it further, sell it, or keep it after the hiring process ends. When an employee withdraws consent or deletes their account, you must delete all copies. These are legal obligations, not guidelines.</p>
        </div>

        <div className="toc">
          <div className="toc-t">On this page</div>
          <div className="toc-l">
            {[["t1","Acceptance"],["t2","Permitted use"],["t3","Prohibited use"],["t4","Consent withdrawal"],["t5","Employee account deletion"],["t6","Your responsibilities"],["t7","Data security"],["t8","Liability"],["t9","Termination"],["t10","Governing law"],["t11","Changes"],["t12","Contact"]].map(([id,t]) => (
              <a key={id} href={`#${id}`} className="toc-a">{t}</a>
            ))}
          </div>
        </div>

        <div className="sec" id="t1">
          <div className="sec-h">1. Acceptance</div>
          <p className="p">By creating an employer account or accessing any employee profile data on Datagate, you agree to these Employer Terms and Data Sharing Agreement. If you do not agree, do not create an account or access employee data.</p>
          <p className="p">These terms are a legally binding agreement between you and Datagate Technologies, and operate alongside applicable law including the Digital Personal Data Protection Act, 2023.</p>
        </div>

        <div className="sec" id="t2">
          <div className="sec-h">2. Permitted use of employee data</div>
          <p className="p">Once an employee approves your consent request, you may use their data only for:</p>
          <ul className="ul">
            <li>Background verification of the specific candidate you stated in the consent request</li>
            <li>Onboarding of a candidate who has accepted your offer of employment</li>
            <li>Compliance with legal obligations directly related to this employment relationship</li>
          </ul>
          <p className="p">Use is limited to the purpose you stated. If your purpose changes, you must submit a new consent request.</p>
        </div>

        <div className="sec" id="t3">
          <div className="sec-h">3. Prohibited use</div>
          <div className="warn"><strong>These are strict prohibitions.</strong> Violation may constitute a breach of applicable data protection law. You bear full legal responsibility as a data processor.</div>
          <ul className="ul">
            <li>Do not retain employee data beyond the period necessary for the stated purpose</li>
            <li>Do not share employee data with any third party — including subsidiaries, affiliates, or partners — without fresh consent from the employee</li>
            <li>Do not use employee data for any purpose other than that stated in your consent request</li>
            <li>Do not use employee data for marketing, profiling, or commercial purposes unrelated to the hiring</li>
            <li>Do not retain copies after the employee withdraws consent</li>
            <li>Do not retain copies after a candidate is rejected and the hiring process is concluded</li>
            <li>Do not sell, license, or transfer employee data to any party</li>
          </ul>
        </div>

        <div className="sec" id="t4">
          <div className="sec-h">4. When an employee withdraws consent</div>
          <p className="p">Employees may withdraw consent at any time. When this happens:</p>
          <ul className="ul">
            <li>You receive an email notification immediately</li>
            <li>Your access to their profile on Datagate is revoked instantly</li>
            <li>You must delete all copies of their data in your possession within 30 days of the notification</li>
          </ul>
          <div className="callout"><strong>Legal notice:</strong> The timestamp on the withdrawal notification email constitutes formal notice to you. Any continued use or retention of the employee's data after that point is your sole liability.</div>
        </div>

        <div className="sec" id="t5">
          <div className="sec-h">5. When an employee deletes their account</div>
          <p className="p">When an employee deletes their Datagate account, you will receive an email notification. Upon receiving it:</p>
          <ul className="ul">
            <li>Delete all copies of their data from all your systems within 30 days</li>
            <li>This includes email, internal HR systems, local storage, and any system you shared the data with</li>
            <li>Datagate retains a record of this notification as evidence that the obligation was communicated</li>
          </ul>
          <p className="p">You may not penalise or disadvantage an employee for exercising their right to delete their account.</p>
        </div>

        <div className="sec" id="t6">
          <div className="sec-h">6. Your responsibilities</div>
          <p className="p">As a data processor, you agree to:</p>
          <ul className="ul">
            <li>Process employee data only for the purposes you stated in consent requests</li>
            <li>Ensure personnel who access employee data are bound by appropriate confidentiality obligations</li>
            <li>Notify Datagate within 72 hours if you become aware of any incident involving employee data</li>
            <li>Cooperate with any audit or investigation by Datagate or regulatory authorities</li>
          </ul>
        </div>

        <div className="sec" id="t7">
          <div className="sec-h">7. Data security</div>
          <p className="p">If you store employee data received through Datagate, you must:</p>
          <ul className="ul">
            <li>Restrict access to authorised personnel only</li>
            <li>Store it only on systems with appropriate access controls</li>
            <li>Not store it on personal devices or personal email accounts</li>
          </ul>
        </div>

        <div className="sec" id="t8">
          <div className="sec-h">8. Liability</div>
          <p className="p">You agree to indemnify and hold harmless Datagate Technologies from any claims, damages, or costs arising from your breach of these terms, your violation of applicable data protection law, or your misuse of employee data.</p>
        </div>

        <div className="sec" id="t9">
          <div className="sec-h">9. Termination</div>
          <p className="p">Datagate may suspend or terminate your account without notice for violations of these terms or misuse of employee data. On termination, your access to employee profiles is immediately revoked. Your obligations regarding data already received survive termination.</p>
        </div>

        <div className="sec" id="t10">
          <div className="sec-h">10. Governing law</div>
          <p className="p">This agreement is governed by the laws of India. Disputes are subject to Indian courts. Both parties agree to attempt resolution in good faith before legal proceedings.</p>
        </div>

        <div className="sec" id="t11">
          <div className="sec-h">11. Changes</div>
          <p className="p">We may update these terms. For material changes, we will give at least 14 days' notice by email before they take effect. Continued use after the effective date constitutes acceptance.</p>
        </div>

        <div className="sec" id="t12">
          <div className="sec-h">12. Contact</div>
        </div>

        <div className="box">
          <div className="box-t">Questions &nbsp;·&nbsp; Datagate Technologies</div>
          <p>Email: <a href="mailto:support@datagate.co.in">support@datagate.co.in</a></p>
          <br/>
          <p>We respond within 5 business days.</p>
        </div>
      </div>
    </>
  );
}