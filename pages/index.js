import Link from "next/link";

const Logo = ({ variant = "dark" }) => (
  <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
    <svg width="28" height="32" viewBox="0 0 36 40" fill="none">
      <defs><style>{`
        @keyframes lgp5{0%{r:4.5;opacity:.4}100%{r:13;opacity:0}}
        @keyframes lgd5{0%,100%{r:3.5}50%{r:2.6}}
        @keyframes lgf5{0%{opacity:0;transform:translateY(0)}15%{opacity:.9}85%{opacity:.9}100%{opacity:0;transform:translateY(20px)}}
        .lgpr5{animation:lgp5 2.2s ease-out infinite;fill:none;stroke:#0d6e6e;stroke-width:1}
        .lgdt5{animation:lgd5 2.2s ease-in-out infinite;fill:#0d6e6e}
        .lgf15{animation:lgf5 2.6s ease-in-out infinite}
        .lgf25{animation:lgf5 2.6s ease-in-out infinite .87s}
        .lgf35{animation:lgf5 2.6s ease-in-out infinite 1.74s}
      `}</style></defs>
      <path d="M18 1.5L33 8V23Q33 36.5 18 39Q3 36.5 3 23V8Z"
        fill={variant==="light"?"rgba(255,255,255,0.12)":"#111"}
        stroke={variant==="light"?"rgba(255,255,255,0.25)":"#1e1a14"}
        strokeWidth="0.8"/>
      <rect x="9.5" y="22" width="4.5" height="13" rx="1.8" fill="#0d6e6e"/>
      <rect x="22" y="22" width="4.5" height="13" rx="1.8" fill="#0d6e6e"/>
      <path d="M11.5 22Q18 13.5 24.5 22" fill="none" stroke="#0d6e6e" strokeWidth="3.8" strokeLinecap="round"/>
      <circle cx="18" cy="14" r="1.8" fill="#0d6e6e" opacity="0" className="lgf15"/>
      <circle cx="18" cy="14" r="1.8" fill="#0d6e6e" opacity="0" className="lgf25"/>
      <circle cx="18" cy="14" r="1.8" fill="#0d6e6e" opacity="0" className="lgf35"/>
      <circle cx="28.5" cy="7.5" className="lgdt5"/>
      <circle cx="28.5" cy="7.5" className="lgpr5"/>
    </svg>
    <div>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:"15px",
        color:variant==="light"?"#fff":"#111",letterSpacing:"-0.4px",lineHeight:1}}>Datagate</div>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:"6.5px",
        color:"#0d6e6e",letterSpacing:"2px",textTransform:"uppercase",marginTop:"3px"}}>Verified Employment</div>
    </div>
  </div>
);

const Chk = ({size=9,col="#0d6e6e"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const Arr = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
const X = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

const LinkedInIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
  </svg>
);

const scroll = (id) => document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"});

export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{background:#f5f2ee;color:#111;font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}
        a{text-decoration:none;color:inherit}
        ::selection{background:#0d6e6e;color:#fff}

        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .f1{animation:fadeUp .6s ease both}
        .f2{animation:fadeUp .6s .1s ease both}
        .f3{animation:fadeUp .6s .2s ease both}
        .f4{animation:fadeUp .6s .3s ease both}

        /* NAV */
        .nav{position:fixed;top:0;left:0;right:0;z-index:100;height:60px;padding:0 52px;display:flex;align-items:center;justify-content:space-between;background:rgba(245,242,238,.96);backdrop-filter:blur(20px);border-bottom:1px solid #d8d2c8}
        .nav-links{display:flex;gap:2px}
        .nav-lk{font-size:13px;font-weight:500;color:#5a5248;padding:6px 14px;border-radius:6px;border:none;background:none;cursor:pointer;transition:all .15s}
        .nav-lk:hover{color:#0d6e6e;background:rgba(13,110,110,.08)}
        .nav-r{display:flex;align-items:center;gap:8px}
        .n-emp{padding:7px 18px;border-radius:7px;border:1.5px solid #c8c2b8;color:#5a5248;font-size:13px;font-weight:600;background:transparent;cursor:pointer;transition:all .15s}
        .n-emp:hover{border-color:#0d6e6e;color:#0d6e6e}
        .n-er{padding:7px 20px;border-radius:7px;background:#0d6e6e;color:#fff;font-size:13px;font-weight:700;border:none;cursor:pointer;transition:all .15s;box-shadow:0 2px 8px rgba(13,110,110,.3)}
        .n-er:hover{background:#0a5656}
        .n-li{display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border-radius:7px;border:1.5px solid #c8c2b8;color:#5a5248;font-size:12px;font-weight:600;text-decoration:none;transition:all .15s}
        .n-li:hover{border-color:#0d6e6e;color:#0d6e6e;background:rgba(13,110,110,.05)}

        /* TICKER */
        .ticker{background:#0d6e6e;overflow:hidden;height:38px;display:flex;align-items:center;margin-top:60px}
        .ticker-track{display:flex;white-space:nowrap;animation:ticker 38s linear infinite;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,.75)}
        .ti{padding:0 28px;display:flex;align-items:center;gap:10px}
        .ti-dot{color:rgba(255,255,255,.4);font-size:7px}

        /* HERO */
        .hero{background:#f5f2ee;padding:72px 52px 80px;max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 440px;gap:72px;align-items:center}
        .tag{display:inline-flex;align-items:center;gap:6px;padding:5px 14px;border-radius:100px;background:#e0f0ee;border:1px solid #a8d5ce;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#0d6e6e;margin-bottom:22px}
        .tag-dot{width:5px;height:5px;border-radius:50%;background:#0d6e6e;animation:blink 2s ease-in-out infinite}
        .h1{font-family:'Cormorant Garamond',serif;font-size:clamp(3.2rem,5vw,5.5rem);font-weight:500;line-height:1.04;color:#111;letter-spacing:-2px;margin-bottom:22px}
        .h1 em{font-style:italic;color:#0d6e6e}
        .hero-p{font-size:15.5px;color:#6b6258;line-height:1.85;max-width:460px;margin-bottom:32px}
        .btns{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:32px}
        .btn-p{padding:14px 28px;background:#0d6e6e;color:#fff;font-size:14px;font-weight:700;border:none;border-radius:8px;display:inline-flex;align-items:center;gap:8px;cursor:pointer;transition:all .2s;box-shadow:0 4px 20px rgba(13,110,110,.35)}
        .btn-p:hover{background:#0a5656;transform:translateY(-2px);box-shadow:0 8px 32px rgba(13,110,110,.4)}
        .btn-s{padding:14px 24px;background:transparent;color:#111;font-size:14px;font-weight:600;border:1.5px solid #c8c2b8;border-radius:8px;cursor:pointer;transition:all .2s}
        .btn-s:hover{border-color:#0d6e6e;color:#0d6e6e}
        .trust-pills{display:flex;gap:6px;flex-wrap:wrap}
        .t-pill{display:flex;align-items:center;gap:5px;padding:4px 10px;background:rgba(13,110,110,.07);border:1px solid rgba(13,110,110,.18);border-radius:100px;font-size:11px;font-weight:500;color:#0d6e6e}
        .t-dot{width:4px;height:4px;border-radius:50%;background:#0d6e6e}

        /* HERO CARD */
        .hero-card{background:#fff;border:1.5px solid #d8d2c8;border-radius:18px;overflow:hidden;box-shadow:0 12px 48px rgba(17,13,10,.12),0 2px 8px rgba(17,13,10,.06)}
        .hc-top{background:#111;padding:13px 18px;display:flex;align-items:center;justify-content:space-between}
        .hc-top-title{font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,.4)}
        .hc-live{display:flex;align-items:center;gap:5px;font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#4ade80}
        .hc-live-dot{width:5px;height:5px;border-radius:50%;background:#4ade80;animation:blink 1.8s ease-in-out infinite}
        .hc-body{padding:18px}
        .flow{display:flex;align-items:center;gap:7px;margin-bottom:14px}
        .fn{flex:1;text-align:center;padding:11px 7px;border-radius:10px;background:#f5f2ee;border:1.5px solid #ddd8d0}
        .fn.gate{background:#e0f0ee;border-color:#a8d5ce}
        .fn-ic{font-size:18px;margin-bottom:4px}
        .fn-lbl{font-size:11px;font-weight:700;color:#111}
        .fn.gate .fn-lbl{color:#0d6e6e}
        .fn-sub{font-size:9px;color:#a09890;margin-top:2px}
        .fn-arr{color:#c8c2b8;font-size:14px;flex-shrink:0}
        .flow-status{display:flex;align-items:center;gap:7px;background:#e0f0ee;border:1px solid #a8d5ce;border-radius:8px;padding:8px 12px;margin-bottom:12px}
        .fs-dot{width:7px;height:7px;border-radius:50%;background:#0d6e6e;flex-shrink:0;animation:blink 2s ease-in-out infinite}
        .fs-txt{font-size:12px;font-weight:600;color:#0a5656}
        .hc-checks{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
        .hc-chk{display:flex;align-items:center;gap:7px;font-size:12px;color:#5a5248}
        .hc-chk-ic{width:15px;height:15px;border-radius:4px;background:#e0f0ee;border:1px solid #a8d5ce;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .hc-table{border-top:1px solid #e8e2da}
        .hctr{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #f0ece6;font-size:11.5px}
        .hctr:last-child{border-bottom:none}
        .hctr-k{color:#a09890}
        .hctr-v{color:#0d6e6e;font-weight:700}

        /* STATS BAND */
        .stats-band{background:#111;border-top:1px solid #1e1a14}
        .stats-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr)}
        .sc{padding:32px 36px;border-right:1px solid #2a2520}
        .sc:last-child{border-right:none}
        .sc-ey{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:8px}
        .sc-num{font-family:'Cormorant Garamond',serif;font-size:48px;font-weight:500;color:#0d6e6e;line-height:1;letter-spacing:-2px;margin-bottom:5px}
        .sc-desc{font-size:13px;color:rgba(255,255,255,.5)}

        /* PROBLEM */
        .prob-strip{background:#0a1a18;padding:64px 52px}
        .prob-inner{max-width:1200px;margin:0 auto}
        .prob-head{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;margin-bottom:48px}
        .prob-lbl{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#0d6e6e;display:flex;align-items:center;gap:7px;margin-bottom:10px}
        .prob-lbl::before{content:'';width:18px;height:1.5px;background:#0d6e6e}
        .prob-h{font-family:'Cormorant Garamond',serif;font-size:clamp(1.8rem,2.5vw,2.8rem);font-weight:500;color:#f5f2ee;letter-spacing:-.5px;line-height:1.2}
        .prob-h em{font-style:italic;color:#0d6e6e}
        .prob-p{font-size:14px;color:rgba(255,255,255,.45);line-height:1.8;max-width:420px}
        .ct{width:100%;border-collapse:separate;border-spacing:0;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,.08)}
        .ct th{padding:12px 20px;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;background:rgba(255,255,255,.06);color:rgba(255,255,255,.4);text-align:left}
        .ct th:not(:first-child){text-align:center}
        .ct td{padding:13px 20px;font-size:13px;color:rgba(255,255,255,.55);border-top:1px solid rgba(255,255,255,.06)}
        .ct td:not(:first-child){text-align:center}
        .ct tr:hover td{background:rgba(13,110,110,.06)}
        .th-dg{color:#0d6e6e!important;background:rgba(13,110,110,.12)!important}
        .td-dg{background:rgba(13,110,110,.05)}

        /* SECTIONS */
        .sec-wrap{background:#f5f2ee;padding:88px 52px;border-top:1px solid #ddd8d0}
        .sec-inner{max-width:1200px;margin:0 auto}
        .sec-alt{background:#fff}
        .lbl{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#0d6e6e;display:flex;align-items:center;gap:7px;margin-bottom:10px}
        .lbl::before{content:'';width:18px;height:1.5px;background:#0d6e6e}
        .sec-h{font-family:'Cormorant Garamond',serif;font-size:clamp(2.2rem,3vw,3.2rem);font-weight:500;color:#111;letter-spacing:-.5px;line-height:1.12;margin-bottom:52px}

        /* STEPS */
        .steps-grid{display:grid;grid-template-columns:repeat(3,1fr);border:1.5px solid #c8c2b8;border-radius:16px;overflow:hidden;background:#c8c2b8;gap:1px}
        .step-card{background:#fff;padding:40px 32px;transition:all .2s;position:relative}
        .step-card:hover{background:#f0ece6}
        .step-n{font-family:'Cormorant Garamond',serif;font-size:72px;font-weight:400;color:#e8e2da;line-height:1;margin-bottom:20px;letter-spacing:-3px}
        .step-card:hover .step-n{color:#a8d5ce}
        .step-badge{position:absolute;top:22px;right:22px;font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#0d6e6e;background:#e0f0ee;border:1px solid #a8d5ce;padding:3px 9px;border-radius:4px}
        .step-t{font-size:16px;font-weight:700;color:#111;margin-bottom:10px;letter-spacing:-.2px}
        .step-d{font-size:13px;color:#7a6e64;line-height:1.75}

        /* FEATURES */
        .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);border:1.5px solid #c8c2b8;border-radius:16px;overflow:hidden;background:#c8c2b8;gap:1px;margin-top:52px}
        .fc{background:#faf8f5;padding:32px 26px;transition:all .2s}
        .fc:hover{background:#fff}
        .fi{width:44px;height:44px;border-radius:12px;background:#e0f0ee;border:1px solid #a8d5ce;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:16px}
        .ft{font-size:14px;font-weight:700;color:#111;margin-bottom:7px;letter-spacing:-.2px}
        .fd{font-size:13px;color:#7a6e64;line-height:1.75}

        /* FOR WHO */
        .for-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
        .for-card{border:1.5px solid #c8c2b8;border-radius:16px;padding:40px;background:#fff;position:relative;overflow:hidden;transition:all .22s}
        .for-card::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:#0d6e6e;transform:scaleX(0);transform-origin:left;transition:transform .25s}
        .for-card:hover{border-color:#0d6e6e;box-shadow:0 12px 48px rgba(13,110,110,.12)}
        .for-card:hover::before{transform:scaleX(1)}
        .for-ey{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#0d6e6e;margin-bottom:14px;display:flex;align-items:center;gap:6px}
        .for-ey::before{content:'';width:14px;height:1.5px;background:#0d6e6e}
        .for-t{font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:500;color:#111;margin-bottom:12px;line-height:1.3;letter-spacing:-.3px}
        .for-d{font-size:13px;color:#7a6e64;line-height:1.85;margin-bottom:22px}
        .for-pts{display:flex;flex-direction:column;gap:10px;margin-bottom:28px}
        .for-pt{display:flex;align-items:flex-start;gap:9px;font-size:13px;color:#5a5248;line-height:1.55}
        .for-ptck{width:18px;height:18px;border-radius:5px;background:#e0f0ee;border:1px solid #a8d5ce;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
        .btn-for{display:inline-flex;align-items:center;gap:7px;padding:11px 22px;background:#111;color:#fff;font-size:13.5px;font-weight:700;border:none;border-radius:8px;cursor:pointer;transition:all .18s}
        .btn-for:hover{background:#0d6e6e;gap:10px}

        /* TRUST */
        .trust-section{background:#111;padding:80px 52px;border-top:1px solid #1e1a14}
        .trust-inner{max-width:1200px;margin:0 auto}
        .trust-lbl{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#0d6e6e;display:flex;align-items:center;gap:7px;margin-bottom:10px}
        .trust-lbl::before{content:'';width:18px;height:1.5px;background:#0d6e6e}
        .trust-h{font-family:'Cormorant Garamond',serif;font-size:clamp(2.2rem,3vw,3.2rem);font-weight:500;color:#f5f2ee;letter-spacing:-.5px;line-height:1.15;margin-bottom:48px}
        .trust-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden}
        .tc{background:#1a1510;padding:32px 26px;transition:all .2s;position:relative;overflow:hidden}
        .tc::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:#0d6e6e;opacity:0;transition:opacity .2s}
        .tc:hover{background:#0f1c1a}
        .tc:hover::before{opacity:1}
        .tc-ic{font-size:24px;margin-bottom:14px}
        .tc-t{font-size:14px;font-weight:700;color:#f5f2ee;margin-bottom:7px;letter-spacing:-.2px}
        .tc-d{font-size:12.5px;color:rgba(255,255,255,.38);line-height:1.75}

        /* FOOTER */
        footer{background:#1a1510;border-top:1px solid #2a2520;padding:52px 52px 40px}
        .f-top{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:40px;margin-bottom:40px;padding-bottom:40px;border-bottom:1px solid rgba(255,255,255,.08)}
        .f-brand{max-width:280px}
        .f-tagline{font-size:13px;color:rgba(255,255,255,.4);line-height:1.7;margin-top:14px}
        .f-social{display:flex;gap:10px;margin-top:18px}
        .f-social-lk{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border:1px solid rgba(255,255,255,.12);border-radius:7px;font-size:12px;font-weight:600;color:rgba(255,255,255,.5);text-decoration:none;transition:all .15s}
        .f-social-lk:hover{border-color:#0d6e6e;color:#0d6e6e;background:rgba(13,110,110,.08)}
        .f-links-grid{display:flex;gap:52px;flex-wrap:wrap}
        .f-col-title{font-size:9.5px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:14px}
        .f-links{display:flex;flex-direction:column;gap:9px}
        .f-lk{font-size:13px;color:rgba(255,255,255,.45);font-weight:500;transition:color .15s;text-decoration:none}
        .f-lk:hover{color:#0d6e6e}
        .f-bottom{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
        .f-copy{font-size:11.5px;color:rgba(255,255,255,.2)}
        .f-legal{display:flex;gap:20px}
        .f-legal-lk{font-size:11px;color:rgba(255,255,255,.2);text-decoration:none;transition:color .15s}
        .f-legal-lk:hover{color:rgba(255,255,255,.5)}

        @media(max-width:1024px){
          .nav,.prob-strip,.trust-section{padding-left:24px;padding-right:24px}
          .hero{padding:48px 24px 64px;grid-template-columns:1fr;gap:40px}
          .sec-wrap{padding:64px 24px}
          footer{padding:40px 24px 32px}
          .stats-inner{grid-template-columns:repeat(2,1fr)}
          .steps-grid,.feat-grid,.for-grid,.trust-grid{grid-template-columns:1fr}
          .prob-head{grid-template-columns:1fr}
          .nav-links{display:none}
          .f-top{flex-direction:column}
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <Logo />
        <div className="nav-links">
          <button className="nav-lk" onClick={()=>scroll("how-it-works")}>How it works</button>
          <button className="nav-lk" onClick={()=>scroll("features")}>Features</button>
          <button className="nav-lk" onClick={()=>scroll("for-employers")}>For employers</button>
          <Link href="/privacy"><button className="nav-lk">Privacy</button></Link>
        </div>
        <div className="nav-r">
          <Link href="/employee/login"><button className="n-emp">Employee</button></Link>
          <a href="https://www.linkedin.com/company/datagate-technologies" target="_blank" rel="noopener noreferrer" className="n-li"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>LinkedIn</a><Link href="/employer/login"><button className="n-er">Employer Login</button></Link>
        </div>
      </nav>

      {/* TICKER */}
      <div className="ticker">
        <div className="ticker-track">
          {[...Array(2)].map((_,i)=>(
            <span key={i} style={{display:"flex"}}>
              {["DPDP Act 2023 Compliant","Consent-first architecture","Zero document chasing","Instant BGV on approval","Employee-controlled access","EPFO-linked verification","Full audit trail","No data sold ever","Background verification simplified","Built for India"].map((t,j)=>(
                <span className="ti" key={j}><span className="ti-dot">●</span>{t}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section className="hero">
        <div>
          <div className="tag f1"><span className="tag-dot"/>Consent-based employment verification</div>
          <h1 className="h1 f2">One profile.<br/>Every employer.<br/><em>Your consent.</em></h1>
          <p className="hero-p f3">Employees build a verified employment record once. Employers get structured, reliable BGV data the moment you approve — no forms, no chasing, no duplicate effort.</p>
          <div className="btns f4">
            <Link href="/employee/login"><button className="btn-p">Create employee profile <Arr/></button></Link>
            <Link href="/employer/login"><button className="btn-s">Employer portal</button></Link>
          </div>
          <div className="trust-pills f4">
            {["DPDP Act 2023","End-to-end encrypted","No data sold","Consent-first","EPFO-linked"].map(t=>(
              <div className="t-pill" key={t}><span className="t-dot"/>{t}</div>
            ))}
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
                <div className="hc-chk" key={t}><div className="hc-chk-ic"><Chk/></div>{t}</div>
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

      {/* STATS BAND */}
      <div className="stats-band">
        <div className="stats-inner">
          {[["Consent-first","Architecture, not an afterthought"],["1-click","Consent request sent"],["Instant","Data on employer approval"],["100%","Employee-consented sharing"]].map(([n,l])=>(
            <div className="sc" key={l}><div className="sc-ey">Platform principle</div><div className="sc-num" style={{fontSize:"clamp(1.6rem,3vw,2.8rem)",letterSpacing:"-1px"}}>{n}</div><div className="sc-desc">{l}</div></div>
          ))}
        </div>
      </div>

      {/* PROBLEM */}
      <div className="prob-strip" id="for-employers">
        <div className="prob-inner">
          <div className="prob-head">
            <div>
              <div className="prob-lbl">The problem we solve</div>
              <div className="prob-h">BGV without<br/><em>the chaos.</em></div>
            </div>
            <p className="prob-p">Traditional background verification involves duplicate paperwork, manual chasing, and no audit trail. Datagate solves all of it — with employee consent at every step.</p>
          </div>
          <table className="ct">
            <thead>
              <tr>
                <th>What changes</th>
                <th>Traditional BGV</th>
                <th className="th-dg">With Datagate</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Employee fills forms","Every new employer",<span style={{color:"#4ade80",fontWeight:700}}>Once, ever</span>],
                ["Document collection","Manual, weeks of chasing",<span style={{color:"#4ade80",fontWeight:700}}>Instant on approval</span>],
                ["Employee consent","Assumed or buried in T&Cs",<span style={{color:"#4ade80",fontWeight:700}}>Explicit, logged, revocable</span>],
                ["Data portability","None — stuck per employer",<span style={{color:"#4ade80",fontWeight:700}}>Fully portable profile</span>],
                ["Audit trail","Non-existent",<span style={{color:"#4ade80",fontWeight:700}}>Timestamped, full log</span>],
                ["DPDP 2023 compliance","Employer's problem",<span style={{color:"#4ade80",fontWeight:700}}>Built-in from day one</span>],
              ].map(([w,o,n])=>(
                <tr key={w}>
                  <td style={{fontWeight:600,color:"rgba(255,255,255,.75)"}}>{w}</td>
                  <td><span style={{display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}><X/><span>{o}</span></span></td>
                  <td className="td-dg"><span style={{display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}><Chk col="#4ade80"/>{n}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="sec-wrap" id="how-it-works">
        <div className="sec-inner">
          <div className="lbl">How it works</div>
          <div className="sec-h">Three steps to a<br/>verified profile</div>
          <div className="steps-grid">
            {[["01","Build your profile","Fill personal details, education, employment history and upload documents — once, on Datagate. Structured, verified, ready for any employer.","Step 1"],
              ["02","Employer requests access","When a company wants your background data, you receive a consent request. You review their stated purpose and decide.","Step 2"],
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
      </div>

      {/* FEATURES */}
      <div className="sec-wrap sec-alt" id="features">
        <div className="sec-inner">
          <div className="lbl">Platform capabilities</div>
          <div className="sec-h" style={{marginBottom:0}}>Everything background<br/>verification needs</div>
          <div className="feat-grid">
            {[["🔐","Consent on every share","No employer sees your data without your explicit approval. Every access is logged with timestamp and stated purpose."],
              ["📄","Complete BGV coverage","Aadhaar, PAN, education records, employment history, UAN and PF — all structured in one verified profile."],
              ["⚡","Instant for returning users","Profile built once. Every future employer gets your verified data the moment you approve — zero repeat paperwork."],
              ["🛡️","Secure document storage","All documents encrypted and stored securely on AWS infrastructure in India. Only you control who gets access."],
              ["🔗","EPFO-linked records","Employment history sourced from EPFO — not self-reported. Independently verified at the source."],
              ["📱","Works on any device","Complete your full profile from any phone or computer. No app download required."]
            ].map(([icon,t,d])=>(
              <div className="fc" key={t}><div className="fi">{icon}</div><div className="ft">{t}</div><div className="fd">{d}</div></div>
            ))}
          </div>
        </div>
      </div>

      {/* FOR WHO */}
      <div className="sec-wrap">
        <div className="sec-inner">
          <div className="lbl">Who it's for</div>
          <div className="sec-h">Built for both<br/>sides of hiring</div>
          <div className="for-grid">
            {[
              {ey:"For Individuals",t:"Tired of filling the same forms for every employer?",d:"Build your verified employment profile once. Share it with any company, any time. You stay in full control of who sees what — always.",pts:["Fill details once — personal, education, employment","Approve or decline every employer request individually","See exactly who accessed your data and when"],href:"/employee/login",cta:"Create your profile"},
              {ey:"For Organisations",t:"Verified candidate data without the paperwork chase?",d:"Stop chasing candidates for documents. Request access to a pre-built verified profile and receive structured data the moment they approve.",pts:["Send a consent request in one click","Receive structured BGV and onboarding data instantly","Full consent audit trail for every data access"],href:"/employer/login",cta:"Access employer portal"},
            ].map(card=>(
              <div className="for-card" key={card.ey}>
                <div className="for-ey">{card.ey}</div>
                <div className="for-t">{card.t}</div>
                <div className="for-d">{card.d}</div>
                <div className="for-pts">{card.pts.map(p=><div className="for-pt" key={p}><div className="for-ptck"><Chk/></div>{p}</div>)}</div>
                <Link href={card.href}><button className="btn-for">{card.cta} <Arr/></button></Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TRUST */}
      <div className="trust-section">
        <div className="trust-inner">
          <div className="trust-lbl">Security &amp; compliance</div>
          <div className="trust-h">Built with trust<br/>at every layer</div>
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

      {/* FOOTER */}
      <footer>
        <div className="f-top">
          <div className="f-brand">
            <Logo variant="light"/>
            <p className="f-tagline">Consent-based employment verification for India. Built on the DPDP Act 2023. Your data, your control — always.</p>
            <div className="f-social">
              <a href="https://www.linkedin.com/company/datagate-technologies" target="_blank" rel="noopener noreferrer" className="f-social-lk">
                <LinkedInIcon /> LinkedIn
              </a>
            </div>
          </div>
          <div className="f-links-grid">
            <div>
              <div className="f-col-title">Platform</div>
              <div className="f-links">
                <Link href="/employee/login" className="f-lk">Employee login</Link>
                <Link href="/employer/login" className="f-lk">Employer portal</Link>
                <Link href="/bgv/login" className="f-lk">BGV vendor portal</Link>
              </div>
            </div>
            <div>
              <div className="f-col-title">Company</div>
              <div className="f-links">
                <a href="#how-it-works" className="f-lk" onClick={e=>{e.preventDefault();scroll("how-it-works")}}>How it works</a>
                <a href="#features" className="f-lk" onClick={e=>{e.preventDefault();scroll("features")}}>Features</a>
                <a href="https://www.linkedin.com/company/datagate-technologies" target="_blank" rel="noopener noreferrer" className="f-lk">LinkedIn</a>
              </div>
            </div>
            <div>
              <div className="f-col-title">Legal</div>
              <div className="f-links">
                <Link href="/privacy" className="f-lk">Privacy Policy</Link>
                <Link href="/employer/terms" className="f-lk">Employer Terms</Link>
                <Link href="/employee/terms" className="f-lk">Employee Terms</Link>
                <Link href="/bgv/terms" className="f-lk">BGV Vendor Terms</Link>
              </div>
            </div>
            <div>
              <div className="f-col-title">Support</div>
              <div className="f-links">
                <a href="mailto:support@datagate.co.in" className="f-lk">support@datagate.co.in</a>
                <a href="mailto:grievance@datagate.co.in" className="f-lk">Grievance Officer</a>
              </div>
            </div>
          </div>
        </div>
        <div className="f-bottom">
          <span className="f-copy">© 2026 Datagate. All rights reserved. Data stored in India (AWS Mumbai).</span>
          <div className="f-legal">
            <Link href="/privacy" className="f-legal-lk">Privacy Policy</Link>
            <Link href="/employer/terms" className="f-legal-lk">Terms</Link>
            <a href="mailto:grievance@datagate.co.in" className="f-legal-lk">Grievance</a>
          </div>
        </div>
      </footer>
    </>
  );
}
