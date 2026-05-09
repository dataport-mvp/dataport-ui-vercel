import Link from "next/link";

const Logo = ({ dark = true }) => (
  <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
    <svg width="28" height="32" viewBox="0 0 36 40" fill="none">
      <defs><style>{`
        @keyframes lgp3{0%{r:4.5;opacity:.4}100%{r:13;opacity:0}}
        @keyframes lgd3{0%,100%{r:3.5}50%{r:2.6}}
        @keyframes lgf3{0%{opacity:0;transform:translateY(0)}15%{opacity:.9}85%{opacity:.9}100%{opacity:0;transform:translateY(20px)}}
        .lgpr3{animation:lgp3 2.2s ease-out infinite;fill:none;stroke:#0d6e6e;stroke-width:1}
        .lgdt3{animation:lgd3 2.2s ease-in-out infinite;fill:#0d6e6e}
        .lgf13{animation:lgf3 2.6s ease-in-out infinite}
        .lgf23{animation:lgf3 2.6s ease-in-out infinite .87s}
        .lgf33{animation:lgf3 2.6s ease-in-out infinite 1.74s}
      `}</style></defs>
      <path d="M18 1.5L33 8V23Q33 36.5 18 39Q3 36.5 3 23V8Z" fill={dark?"#18151f":"rgba(255,255,255,0.12)"} stroke={dark?"#2d2838":"rgba(255,255,255,0.3)"} strokeWidth="0.8"/>
      <rect x="9.5" y="22" width="4.5" height="13" rx="1.8" fill="#0d6e6e"/>
      <rect x="22" y="22" width="4.5" height="13" rx="1.8" fill="#0d6e6e"/>
      <path d="M11.5 22Q18 13.5 24.5 22" fill="none" stroke="#0d6e6e" strokeWidth="3.8" strokeLinecap="round"/>
      <circle cx="18" cy="14" r="1.8" fill="#0d6e6e" opacity="0" className="lgf13"/>
      <circle cx="18" cy="14" r="1.8" fill="#0d6e6e" opacity="0" className="lgf23"/>
      <circle cx="18" cy="14" r="1.8" fill="#0d6e6e" opacity="0" className="lgf33"/>
      <circle cx="28.5" cy="7.5" className="lgdt3"/>
      <circle cx="28.5" cy="7.5" className="lgpr3"/>
    </svg>
    <div>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:"15px",color:dark?"#18151f":"#fff",letterSpacing:"-0.4px",lineHeight:1}}>Datagate</div>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:"6.5px",color:"#0d6e6e",letterSpacing:"2px",textTransform:"uppercase",marginTop:"3px"}}>Verified Employment</div>
    </div>
  </div>
);

const Chk = ({c="#0d6e6e"}) => <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const Arr = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;

export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{background:#fff;color:#18151f;font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}
        a{text-decoration:none;color:inherit}
        ::selection{background:#0d6e6e;color:#fff}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.25}}
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        .f1{animation:fadeUp .65s ease both}
        .f2{animation:fadeUp .65s .1s ease both}
        .f3{animation:fadeUp .65s .2s ease both}
        .f4{animation:fadeUp .65s .3s ease both}

        .nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 52px;height:64px;background:rgba(255,255,255,.97);backdrop-filter:blur(16px);border-bottom:1px solid #ede9f5}
        .nav-links{display:flex;gap:4px}
        .nav-lk{font-size:13px;font-weight:500;color:#7a7386;padding:6px 14px;border-radius:7px;border:none;background:none;cursor:pointer;transition:all .15s}
        .nav-lk:hover{color:#18151f;background:#f8f7fa}
        .nav-r{display:flex;align-items:center;gap:8px}
        .n-emp{padding:7px 18px;border-radius:8px;border:1.5px solid #e2dded;color:#7a7386;font-size:13px;font-weight:600;background:#fff;cursor:pointer;transition:all .15s}
        .n-emp:hover{border-color:#0d6e6e;color:#0d6e6e}
        .n-er{padding:7px 20px;border-radius:8px;background:#18151f;color:#fff;font-size:13px;font-weight:700;border:none;cursor:pointer;transition:all .15s}
        .n-er:hover{background:#0d6e6e}

        .ticker{background:#18151f;overflow:hidden;height:36px;display:flex;align-items:center;margin-top:64px}
        .ticker-track{display:flex;white-space:nowrap;animation:ticker 32s linear infinite;font-size:10.5px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,.35)}
        .ti{padding:0 32px;display:flex;align-items:center;gap:10px}
        .ti-dot{color:#0d6e6e;font-size:7px}

        .hero{padding:72px 52px 80px;max-width:1180px;margin:0 auto;display:grid;grid-template-columns:1fr 420px;gap:80px;align-items:center}
        .tag{display:inline-flex;align-items:center;gap:6px;padding:5px 13px;border-radius:100px;background:#f0f9f9;border:1px solid rgba(13,110,110,.2);font-size:10.5px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#0d6e6e;margin-bottom:24px}
        .tag-dot{width:5px;height:5px;border-radius:50%;background:#0d6e6e;animation:blink 2s ease-in-out infinite}
        .h1{font-family:'Cormorant Garamond',serif;font-size:clamp(3rem,4.5vw,4.5rem);font-weight:500;line-height:1.08;color:#18151f;letter-spacing:-1.5px;margin-bottom:20px}
        .h1 em{font-style:italic;color:#0d6e6e}
        .hero-p{font-size:15px;color:#7a7386;line-height:1.85;max-width:440px;margin-bottom:32px}
        .btns{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:36px}
        .btn-p{padding:13px 26px;background:#0d6e6e;color:#fff;font-size:14px;font-weight:700;border:none;border-radius:8px;display:inline-flex;align-items:center;gap:8px;cursor:pointer;transition:all .2s;box-shadow:0 4px 20px rgba(13,110,110,.25)}
        .btn-p:hover{background:#0f8a8a;transform:translateY(-1px);box-shadow:0 8px 28px rgba(13,110,110,.3)}
        .btn-s{padding:13px 22px;background:#fff;color:#18151f;font-size:14px;font-weight:600;border:1.5px solid #e2dded;border-radius:8px;cursor:pointer;transition:all .2s}
        .btn-s:hover{border-color:#18151f}
        .sp{display:flex;align-items:center;gap:12px}
        .sp-avs{display:flex}
        .sp-av{width:30px;height:30px;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;margin-left:-7px}
        .sp-av:first-child{margin-left:0}
        .sp-text{font-size:12px;color:#7a7386;line-height:1.5}
        .sp-text strong{color:#18151f;font-weight:700}

        .hero-card{background:#fff;border:1.5px solid #ede9f5;border-radius:18px;overflow:hidden;box-shadow:0 8px 48px rgba(24,21,31,.07),0 1px 4px rgba(24,21,31,.04)}
        .hc-top{background:#18151f;padding:13px 18px;display:flex;align-items:center;justify-content:space-between}
        .hc-top-title{font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,.35)}
        .hc-live{display:flex;align-items:center;gap:5px;font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#4ade80}
        .hc-live-dot{width:5px;height:5px;border-radius:50%;background:#4ade80;animation:blink 1.8s ease-in-out infinite}
        .hc-body{padding:18px}
        .flow{display:flex;align-items:center;gap:7px;margin-bottom:14px}
        .fn{flex:1;text-align:center;padding:11px 7px;border-radius:10px;background:#f8f7fa;border:1.5px solid #ede9f5}
        .fn.gate{background:#f0f9f9;border-color:rgba(13,110,110,.2)}
        .fn-ic{font-size:18px;margin-bottom:4px}
        .fn-lbl{font-size:11px;font-weight:700;color:#18151f}
        .fn.gate .fn-lbl{color:#0d6e6e}
        .fn-sub{font-size:9px;color:#b8b3c2;margin-top:2px}
        .fn-arr{color:#e2dded;font-size:14px;flex-shrink:0}
        .flow-status{display:flex;align-items:center;gap:7px;background:#f0f9f9;border:1px solid rgba(13,110,110,.18);border-radius:8px;padding:8px 12px;margin-bottom:12px}
        .fs-dot{width:7px;height:7px;border-radius:50%;background:#0d6e6e;flex-shrink:0;animation:blink 2s ease-in-out infinite}
        .fs-txt{font-size:12px;font-weight:600;color:#0d6e6e}
        .hc-checks{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
        .hc-chk{display:flex;align-items:center;gap:7px;font-size:12px;color:#7a7386}
        .hc-chk-ic{width:15px;height:15px;border-radius:4px;background:#f0f9f9;border:1px solid rgba(13,110,110,.2);display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .hc-table{border-top:1px solid #f2f0f5}
        .hctr{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #faf9fc;font-size:11.5px}
        .hctr:last-child{border-bottom:none}
        .hctr-k{color:#b8b3c2}
        .hctr-v{color:#0d6e6e;font-weight:700}

        .stats-band{border-top:1px solid #ede9f5;border-bottom:1px solid #ede9f5;background:#f8f7fa}
        .stats-inner{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr)}
        .sc{padding:28px 32px;border-right:1px solid #ede9f5}
        .sc:last-child{border-right:none}
        .sc-ey{font-size:9.5px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#b8b3c2;margin-bottom:8px}
        .sc-num{font-family:'Cormorant Garamond',serif;font-size:44px;font-weight:500;color:#0d6e6e;line-height:1;letter-spacing:-2px;margin-bottom:4px}
        .sc-desc{font-size:12.5px;color:#7a7386}

        .section{padding:80px 52px;max-width:1180px;margin:0 auto}
        .sec-full{border-top:1px solid #ede9f5;border-bottom:1px solid #ede9f5;background:#f8f7fa;padding:80px 0}
        .sec-full-inner{max-width:1180px;margin:0 auto;padding:0 52px}
        .lbl{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#0d6e6e;display:flex;align-items:center;gap:7px;margin-bottom:10px}
        .lbl::before{content:'';width:18px;height:1.5px;background:#0d6e6e}
        .sec-h{font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,3vw,2.8rem);font-weight:500;color:#18151f;letter-spacing:-.5px;line-height:1.15;margin-bottom:48px}

        .steps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#ede9f5;border:1px solid #ede9f5;border-radius:14px;overflow:hidden}
        .step-card{background:#fff;padding:36px 30px;transition:background .18s;position:relative}
        .step-card:hover{background:#f0f9f9}
        .step-n{font-family:'Cormorant Garamond',serif;font-size:64px;font-weight:400;color:#ede9f5;line-height:1;margin-bottom:18px;letter-spacing:-3px}
        .step-badge{position:absolute;top:22px;right:22px;font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#0d6e6e;background:#f0f9f9;border:1px solid rgba(13,110,110,.2);padding:3px 9px;border-radius:4px}
        .step-t{font-size:15px;font-weight:700;color:#18151f;margin-bottom:8px}
        .step-d{font-size:12.5px;color:#b8b3c2;line-height:1.75}

        .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#ede9f5;border:1px solid #ede9f5;border-radius:14px;overflow:hidden;margin-top:48px}
        .fc{background:#fff;padding:28px 24px;transition:background .18s}
        .fc:hover{background:#f8f7fa}
        .fi{width:40px;height:40px;border-radius:10px;background:#f0f9f9;border:1px solid rgba(13,110,110,.18);display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:14px}
        .ft{font-size:13.5px;font-weight:700;color:#18151f;margin-bottom:6px}
        .fd{font-size:12px;color:#b8b3c2;line-height:1.75}

        .for-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .for-card{border:1.5px solid #ede9f5;border-radius:14px;padding:36px;background:#fff;position:relative;overflow:hidden;transition:all .2s}
        .for-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:#0d6e6e;transform:scaleX(0);transform-origin:left;transition:transform .25s}
        .for-card:hover{border-color:rgba(13,110,110,.3);box-shadow:0 10px 40px rgba(13,110,110,.07)}
        .for-card:hover::after{transform:scaleX(1)}
        .for-ey{font-size:9.5px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#0d6e6e;margin-bottom:12px}
        .for-t{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:500;color:#18151f;margin-bottom:10px;line-height:1.3;letter-spacing:-.3px}
        .for-d{font-size:12.5px;color:#b8b3c2;line-height:1.8;margin-bottom:20px}
        .for-pts{display:flex;flex-direction:column;gap:8px;margin-bottom:24px}
        .for-pt{display:flex;align-items:flex-start;gap:8px;font-size:12.5px;color:#7a7386;line-height:1.5}
        .for-ptck{width:16px;height:16px;border-radius:5px;background:#f0f9f9;border:1px solid rgba(13,110,110,.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
        .btn-for{display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:#18151f;color:#fff;font-size:13px;font-weight:700;border:none;border-radius:8px;cursor:pointer;transition:all .15s}
        .btn-for:hover{background:#0d6e6e;gap:9px}

        .trust-section{background:#18151f;padding:72px 52px}
        .trust-inner{max-width:1180px;margin:0 auto}
        .trust-lbl{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#0d6e6e;display:flex;align-items:center;gap:7px;margin-bottom:10px}
        .trust-lbl::before{content:'';width:18px;height:1.5px;background:#0d6e6e}
        .trust-h{font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,3vw,2.8rem);font-weight:500;color:#f5f0f8;letter-spacing:-.5px;line-height:1.2;margin-bottom:40px}
        .trust-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.05);border-radius:14px;overflow:hidden}
        .tc{background:rgba(255,255,255,.03);padding:28px 24px;transition:background .18s}
        .tc:hover{background:rgba(13,110,110,.06)}
        .tc-ic{font-size:22px;margin-bottom:12px}
        .tc-t{font-size:13px;font-weight:700;color:#f5f0f8;margin-bottom:6px}
        .tc-d{font-size:12px;color:rgba(255,255,255,.35);line-height:1.7}

        footer{border-top:1px solid #f2f0f5;background:#f8f7fa;padding:36px 52px;display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:24px}
        .f-copy{font-size:11.5px;color:#d8d4e3;margin-top:8px}
        .f-links-grid{display:flex;gap:48px;flex-wrap:wrap}
        .f-col-title{font-size:9.5px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#b8b3c2;margin-bottom:12px}
        .f-links{display:flex;flex-direction:column;gap:7px}
        .f-lk{font-size:12.5px;color:#7a7386;font-weight:500;transition:color .15s}
        .f-lk:hover{color:#0d6e6e}

        @media(max-width:1024px){
          .nav,.hero,.section,.trust-section,footer{padding-left:24px;padding-right:24px}
          .hero{grid-template-columns:1fr;gap:40px;padding-top:48px}
          .stats-inner{grid-template-columns:repeat(2,1fr)}
          .steps-grid,.feat-grid,.for-grid,.trust-grid{grid-template-columns:1fr}
          .nav-links{display:none}
          .sec-full-inner{padding:0 24px}
          .f-links-grid{gap:24px}
        }
      `}</style>

      <nav className="nav">
        <Logo />
        <div className="nav-links">
          <button className="nav-lk">How it works</button>
          <button className="nav-lk">Features</button>
          <button className="nav-lk">For employers</button>
          <button className="nav-lk">Privacy</button>
        </div>
        <div className="nav-r">
          <Link href="/employee/login"><button className="n-emp">Employee</button></Link>
          <Link href="/employer/login"><button className="n-er">Employer Login</button></Link>
        </div>
      </nav>

      <div className="ticker">
        <div className="ticker-track">
          {[...Array(2)].map((_,i)=>(
            <span key={i} style={{display:"flex"}}>
              {["DPDP Act 2023 Compliant","Consent-first architecture","Zero document chasing","Instant BGV on approval","Employee-controlled access","EPFO-linked verification","Full audit trail on every share","No data sold ever","ISO-grade security","Background verification simplified"].map((t,j)=>(
                <span className="ti" key={j}><span className="ti-dot">●</span>{t}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <section className="hero">
        <div>
          <div className="tag f1"><span className="tag-dot"/>Consent-based employment verification</div>
          <h1 className="h1 f2">One profile.<br/>Every employer.<br/><em>Your consent.</em></h1>
          <p className="hero-p f3">Employees build a verified employment record once. Employers get structured, reliable BGV data the moment you approve — no forms, no chasing, no duplicate effort.</p>
          <div className="btns f4">
            <Link href="/employee/login"><button className="btn-p">Create employee profile <Arr /></button></Link>
            <Link href="/employer/login"><button className="btn-s">Employer portal</button></Link>
          </div>
          <div className="sp f4">
            <div className="sp-avs">
              {[["#0d6e6e","AR"],["#2d6a4f","PS"],["#18151f","KM"],["#4a4458","DV"]].map(([bg,init])=>(
                <div key={init} className="sp-av" style={{background:bg}}>{init}</div>
              ))}
            </div>
            <div className="sp-text"><strong>2,400+ employees</strong> have built verified profiles.<br/>Trusted by hiring teams across India.</div>
          </div>
        </div>

        <div className="hero-card f4">
          <div className="hc-top">
            <span className="hc-top-title">Consent Gateway</span>
            <span className="hc-live"><span className="hc-live-dot"/>Live</span>
          </div>
          <div className="hc-body">
            <div className="flow">
              <div className="fn"><div className="fn-ic">👤</div><div className="fn-lbl">Employee</div><div className="fn-sub">Owns the data</div></div>
              <span className="fn-arr">→</span>
              <div className="fn gate"><div className="fn-ic">🔐</div><div className="fn-lbl">Datagate</div><div className="fn-sub">Consent gateway</div></div>
              <span className="fn-arr">→</span>
              <div className="fn"><div className="fn-ic">🏢</div><div className="fn-lbl">Employer</div><div className="fn-sub">Receives data</div></div>
            </div>
            <div className="flow-status"><span className="fs-dot"/><span className="fs-txt">Data moves only after your explicit approval</span></div>
            <div className="hc-checks">
              {["Approve each request individually — no auto-sharing","Revoke access at any time, instantly","Full log of every data share with timestamps"].map(t=>(
                <div className="hc-chk" key={t}><div className="hc-chk-ic"><Chk /></div>{t}</div>
              ))}
            </div>
            <div className="hc-table">
              {[["Profile sections","4 structured sections"],["Document types","8 accepted formats"],["Consent log","Full audit trail"],["Data sharing","Employee-approved only"],["Compliance","DPDP Act 2023"]].map(([k,v])=>(
                <div className="hctr" key={k}><span className="hctr-k">{k}</span><span className="hctr-v">{v}</span></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="stats-band">
        <div className="stats-inner">
          {[["2,400+","Verified employee profiles"],["1-click","Consent request sent"],["Instant","Data on employer approval"],["100%","Employee-consented sharing"]].map(([n,l])=>(
            <div className="sc" key={l}><div className="sc-ey">Platform metric</div><div className="sc-num">{n}</div><div className="sc-desc">{l}</div></div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="lbl">How it works</div>
        <div className="sec-h">Three steps to a verified profile</div>
        <div className="steps-grid">
          {[["01","Build your profile","Fill personal details, education, employment history and upload documents — once, on Datagate. Structured, verified, ready.","Step 1"],
            ["02","Employer requests access","When a company wants your background data, you receive a consent request. You review their purpose and decide.","Step 2"],
            ["03","Approve and done","One tap. Your verified data reaches the employer instantly. Every share is timestamped and logged in your audit trail.","Step 3"]
          ].map(([n,t,d,tag])=>(
            <div className="step-card" key={n}>
              <div className="step-badge">{tag}</div>
              <div className="step-n">{n}</div>
              <div className="step-t">{t}</div>
              <div className="step-d">{d}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="sec-full">
        <div className="sec-full-inner">
          <div className="lbl">Platform capabilities</div>
          <div className="sec-h" style={{marginBottom:0}}>Everything background verification needs</div>
          <div className="feat-grid">
            {[["🔐","Consent on every share","No employer sees your data without your explicit approval. Every access is logged with timestamp and purpose."],
              ["📄","Complete BGV coverage","Aadhaar, PAN, education records, employment history, UAN and PF — all structured in one verified profile."],
              ["⚡","Instant for returning users","Profile built once. Every future employer gets your verified data the moment you approve — zero repeat paperwork."],
              ["🛡️","Secure document storage","All documents encrypted and stored securely. Only you control who gets access and when it expires."],
              ["🔗","EPFO-linked records","Employment history sourced from EPFO — not self-reported. Independently verified at the source."],
              ["📱","Works on any device","Complete your full profile from any phone or computer. No app download required ever."]
            ].map(([icon,t,d])=>(
              <div className="fc" key={t}><div className="fi">{icon}</div><div className="ft">{t}</div><div className="fd">{d}</div></div>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="lbl">Who it's for</div>
        <div className="sec-h">Built for both sides of hiring</div>
        <div className="for-grid">
          {[
            {ey:"For Individuals",t:"Tired of filling the same forms for every employer?",d:"Build your verified employment profile once. Share it with any company, any time. You stay in full control of who sees what, always.",pts:["Fill details once — personal, education, employment","Approve or decline every employer request individually","See exactly who accessed your data and when"],href:"/employee/login",cta:"Create your profile"},
            {ey:"For Organisations",t:"Verified candidate data without the paperwork chase?",d:"Stop chasing candidates for documents. Request access to a pre-built verified profile and receive structured data the moment they approve.",pts:["Send a consent request in one click","Receive structured BGV and onboarding data instantly","Full consent audit trail for every data access"],href:"/employer/login",cta:"Access employer portal"},
          ].map(card=>(
            <div className="for-card" key={card.ey}>
              <div className="for-ey">{card.ey}</div>
              <div className="for-t">{card.t}</div>
              <div className="for-d">{card.d}</div>
              <div className="for-pts">{card.pts.map(p=><div className="for-pt" key={p}><div className="for-ptck"><Chk /></div>{p}</div>)}</div>
              <Link href={card.href}><button className="btn-for">{card.cta} <Arr /></button></Link>
            </div>
          ))}
        </div>
      </div>

      <div className="trust-section">
        <div className="trust-inner">
          <div className="trust-lbl">Security &amp; compliance</div>
          <div className="trust-h">Built with trust at every layer</div>
          <div className="trust-grid">
            {[["🏛️","DPDP Act 2023 Compliant","Designed to comply with India's Digital Personal Data Protection Act, 2023 from the ground up."],
              ["🔒","Explicit consent every time","No auto-approvals. No pre-ticked boxes. Every employer request requires your active decision."],
              ["📋","Full audit trail","Every data access is logged — who requested, when you approved, and when access was revoked."],
              ["🗑️","Right to delete","Delete your account anytime. Employers are legally notified and required to remove all copies of your data."]
            ].map(([icon,t,d])=>(
              <div className="tc" key={t}><div className="tc-ic">{icon}</div><div className="tc-t">{t}</div><div className="tc-d">{d}</div></div>
            ))}
          </div>
        </div>
      </div>

      <footer>
        <div>
          <Logo />
          <div className="f-copy">© 2026 Datagate Technologies. All rights reserved.</div>
        </div>
        <div className="f-links-grid">
          <div><div className="f-col-title">Platform</div><div className="f-links"><Link href="/employee/login" className="f-lk">Employee login</Link><Link href="/employer/login" className="f-lk">Employer portal</Link></div></div>
          <div><div className="f-col-title">Legal</div><div className="f-links"><Link href="/privacy" className="f-lk">Privacy Policy</Link><Link href="/employer/terms" className="f-lk">Employer Terms</Link></div></div>
          <div><div className="f-col-title">Support</div><div className="f-links"><a href="mailto:support@datagate.co.in" className="f-lk">support@datagate.co.in</a></div></div>
        </div>
      </footer>
    </>
  );
}