import Link from "next/link";

// DATAGATE — EMPLOYEE TERMS OF SERVICE
// Version 1.0 | DPDP Act 2023 Compliant
// This document was entirely missing from the platform
// Employees click through nothing currently — that's a legal gap
// Add a checkbox on employee signup: "I agree to the Employee Terms of Service"
// Route: /employee/terms
// Replace Datagate before publishing

export default function EmployeeTerms() {
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
        <h1 className="h1">Employee Terms of Service</h1>
        <p className="meta">Effective date: June 2026 &nbsp;·&nbsp; Version 1.0</p>

        <div className="summary">
          <div className="summary-t">Your rights in plain language</div>
          <p>Your profile is yours. You decide who sees it. No employer gets your data without your explicit approval. You can withdraw that approval at any time, and you can delete everything at any time. These are your legal rights — we've built the product to enforce them, and these terms explain how.</p>
        </div>

        <div className="toc">
          <div className="toc-t">On this page</div>
          <div className="toc-l">
            {[
              ["e1","Acceptance"],["e2","Your account"],["e3","What you can do"],
              ["e4","Consent — how it works"],["e5","Your data rights"],["e6","What you must not do"],
              ["e7","Accuracy of your profile"],["e8","Account deletion"],["e9","Our obligations to you"],
              ["e10","Limitation of liability"],["e11","Changes"],["e12","Governing law"],["e13","Contact"]
            ].map(([id,t]) => (
              <a key={id} href={`#${id}`} className="toc-a">{t}</a>
            ))}
          </div>
        </div>

        {/* 1 */}
        <div className="sec" id="e1">
          <div className="sec-h">1. Acceptance</div>
          <p className="p">By creating an employee account on Datagate, you agree to these Employee Terms of Service. These terms are a legally binding agreement between you and <strong>Datagate</strong> operating as Datagate.</p>
          <p className="p">These terms should be read alongside Datagate's <Link href="/privacy">Privacy Policy</Link>, which explains how your personal data is collected, used, and protected.</p>
          <p className="p">If you do not agree to these terms, do not create an account.</p>
        </div>

        {/* 2 */}
        <div className="sec" id="e2">
          <div className="sec-h">2. Your account</div>
          <p className="p">You must be at least 18 years old to create a Datagate account. By creating an account, you represent that you meet this requirement.</p>
          <p className="p">Your account is personal to you. You must not share your login credentials with anyone. You are responsible for all activity on your account. If you believe your account has been compromised, notify us immediately at <a href="mailto:security@datagate.co.in">security@datagate.co.in</a>.</p>
          <p className="p">Each person may hold only one active employee account on Datagate.</p>
        </div>

        {/* 3 */}
        <div className="sec" id="e3">
          <div className="sec-h">3. What you can do on Datagate</div>
          <p className="p">With your Datagate account, you can:</p>
          <ul className="ul">
            <li>Build and maintain a verified employment profile including personal details, education, employment history, and documents</li>
            <li>Receive and review consent requests from employers who wish to access your profile</li>
            <li>Approve or decline each consent request individually</li>
            <li>Withdraw consent from any employer at any time, instantly</li>
            <li>View a full audit log of every employer who has accessed your profile and when</li>
            <li>Update or correct your profile information at any time</li>
            <li>Delete your account and all associated data at any time</li>
          </ul>
        </div>

        {/* 4 */}
        <div className="sec" id="e4">
          <div className="sec-h">4. How consent works</div>
          <p className="p">Consent on Datagate is always explicit, specific, and revocable. Here is how it works:</p>
          <ul className="ul">
            <li>An employer sends you a consent request, identifying themselves and stating their specific purpose (e.g. background verification for a named role)</li>
            <li>You receive a notification and can review the request before deciding</li>
            <li>You must click <strong>Approve</strong> to grant access — Datagate never auto-approves on your behalf</li>
            <li>Once approved, the employer can view the data elements relevant to their stated purpose</li>
            <li>You can withdraw consent at any time from your dashboard — withdrawal is immediate</li>
            <li>On withdrawal, the employer loses platform access to your profile instantly and is notified of their obligation to delete all copies</li>
          </ul>
          <div className="callout"><strong>Each consent is separate.</strong> Approving one employer does not affect your decisions about any other employer. You are always in control of who sees what.</div>
          <p className="p">When you approve a consent request, you also acknowledge that the employer may assign a Datagate-approved background verification agency to conduct checks on their behalf. That agency accesses only the data relevant to their assigned checks and is bound by Datagate's BGV Vendor Terms.</p>
        </div>

        {/* 5 */}
        <div className="sec" id="e5">
          <div className="sec-h">5. Your rights</div>
          <p className="p">Under the Digital Personal Data Protection Act, 2023, you have the following rights, all exercisable from your account dashboard or by contacting us:</p>
          <ul className="ul">
            <li><strong>Access:</strong> See all personal data we hold about you and a list of every employer who has accessed it</li>
            <li><strong>Correction:</strong> Update any inaccurate or incomplete information in your profile</li>
            <li><strong>Erasure:</strong> Delete your account and all personal data at any time — no questions, no waiting period beyond the technical process</li>
            <li><strong>Withdraw consent:</strong> Revoke any employer's access at any time, instantly</li>
            <li><strong>Grievance redressal:</strong> Raise a complaint with Datagate's Grievance Officer and, if unsatisfied, with the Data Protection Board of India</li>
            <li><strong>Nomination:</strong> Nominate another person to exercise these rights on your behalf in the event of death or incapacity</li>
          </ul>
          <p className="p">We respond to rights requests within <strong>7 business days</strong>.</p>
        </div>

        {/* 6 */}
        <div className="sec" id="e6">
          <div className="sec-h">6. What you must not do</div>
          <p className="p">You must not use Datagate to:</p>
          <ul className="ul">
            <li>Create a profile with false, misleading, or fabricated information about your identity, qualifications, or employment history</li>
            <li>Upload documents that are forged, altered, or do not belong to you</li>
            <li>Impersonate any other person</li>
            <li>Attempt to gain unauthorised access to any other user's account or data</li>
            <li>Use the platform for any purpose other than managing your own employment verification profile</li>
            <li>Interfere with the platform's operation, security, or integrity</li>
          </ul>
          <div className="warn"><strong>Misrepresentation:</strong> Submitting false information on your profile may have consequences with employers independent of Datagate. Datagate is not liable for any employment decisions made by employers based on information you provided.</div>
        </div>

        {/* 7 */}
        <div className="sec" id="e7">
          <div className="sec-h">7. Accuracy of your profile</div>
          <p className="p">You are responsible for the accuracy and completeness of the information you add to your profile. Datagate does not independently verify all information you enter — we verify what we can through linked sources (such as EPFO), but most profile information is self-reported by you.</p>
          <p className="p">Keep your profile current. Outdated or inaccurate information may affect how employers evaluate your background verification results.</p>
          <p className="p">You can update any part of your profile at any time. Updates to data that has already been shared with an employer will not retroactively change what they received — but you may notify the employer through the platform's messaging system if a correction is relevant.</p>
        </div>

        {/* 8 */}
        <div className="sec" id="e8">
          <div className="sec-h">8. Deleting your account</div>
          <p className="p">You can delete your account at any time from your profile settings. When you do:</p>
          <ul className="ul">
            <li>Your profile, documents, and personal data are permanently deleted from Datagate's systems within 7 days</li>
            <li>Every employer who accessed your profile is notified immediately and legally required to delete all copies of your data within 72 hours (digital) and 7 days (full system purge)</li>
            <li>Datagate retains a timestamped log of this notification as evidence that the obligation was communicated — this protects you</li>
            <li>Your consent event logs are retained for 7 years as required by law, but these do not contain your personal data — only records of consent events</li>
          </ul>
          <p className="p">Account deletion is permanent and cannot be undone. If you create a new account in future, you will start with a blank profile.</p>
        </div>

        {/* 9 */}
        <div className="sec" id="e9">
          <div className="sec-h">9. Our obligations to you</div>
          <p className="p">Datagate commits to:</p>
          <ul className="ul">
            <li>Never share your data with any employer without your explicit consent</li>
            <li>Never sell your data to any third party, ever</li>
            <li>Store your data exclusively in India (AWS Mumbai region)</li>
            <li>Maintain a tamper-evident audit trail of every access to your profile</li>
            <li>Notify you promptly of any data breach that may affect your personal data</li>
            <li>Process all rights requests within 7 business days</li>
            <li>Revoke employer access instantly on consent withdrawal — no delay, no manual process</li>
          </ul>
        </div>

        {/* 10 */}
        <div className="sec" id="e10">
          <div className="sec-h">10. Limitation of liability</div>
          <p className="p">Datagate's platform facilitates consent-based sharing of your employment data. We are not responsible for:</p>
          <ul className="ul">
            <li>Decisions made by employers based on your background verification results</li>
            <li>How employers use data after it has been shared with your consent</li>
            <li>Inaccuracies in your profile that you entered yourself</li>
            <li>Actions of BGV vendors that violate their obligations to Datagate</li>
          </ul>
          <p className="p">To the maximum extent permitted by law, Datagate's total liability to you for any claim arising from your use of the platform shall not exceed ₹5,000.</p>
          <p className="p">This limitation does not affect your rights under the DPDP Act or other mandatory consumer protection laws.</p>
        </div>

        {/* 11 */}
        <div className="sec" id="e11">
          <div className="sec-h">11. Changes to these terms</div>
          <p className="p">We may update these terms as the platform evolves or as law requires. For material changes — those that affect your rights or obligations — we will notify you by email and in-app notification at least <strong>14 days before</strong> the change takes effect.</p>
          <p className="p">If you do not agree to updated terms, you may delete your account before the effective date. Continued use after the effective date constitutes acceptance.</p>
        </div>

        {/* 12 */}
        <div className="sec" id="e12">
          <div className="sec-h">12. Governing law</div>
          <p className="p">These terms are governed by the laws of India. Any dispute shall be subject to the jurisdiction of courts in <strong>Hyderabad, Telangana, India</strong>. Both parties will attempt good-faith resolution before legal proceedings.</p>
        </div>

        {/* 13 */}
        <div className="sec" id="e13">
          <div className="sec-h">13. Contact and grievance redressal</div>
        </div>

        <div className="box">
          <div className="box-t">Grievance Officer &nbsp;·&nbsp; Datagate</div>
          <p>Email: <a href="mailto:grievance@datagate.co.in">grievance@datagate.co.in</a></p>
          <p>Response time: Within 7 business days</p>
          <br/>
          <p>General support: <a href="mailto:support@datagate.co.in">support@datagate.co.in</a></p>
          <br/>
          <p>If you are not satisfied with our response, you may escalate to the <strong>Data Protection Board of India</strong> as established under the DPDP Act, 2023.</p>
        </div>

      </div>
    </>
  );
}
