// pages/employee/dashboard.js — Employee Dashboard (standalone page)

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const G = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:#f0ece6;font-family:'DM Sans',sans-serif;color:#111;-webkit-font-smoothing:antialiased}

  .shell{display:flex;min-height:100vh}

  /* ── TOPBAR ── */
  .topbar{position:fixed;top:0;left:0;right:0;z-index:50;background:#f5f2ee;border-bottom:1px solid #c8c2b8;height:48px;padding:0 20px;display:flex;align-items:center;justify-content:space-between;}
  .tb-logo{display:flex;align-items:center;gap:8px}
  .tb-logo-sq{width:26px;height:26px;background:#0d6e6e;border-radius:6px;display:flex;align-items:center;justify-content:center}
  .tb-logo-name{font-size:14px;font-weight:800;color:#111;letter-spacing:-.3px}
  .tb-right{display:flex;align-items:center;gap:8px}
  .tb-user{display:flex;align-items:center;gap:7px;padding:4px 10px;border:1px solid #c8c2b8;border-radius:6px;background:#fff;cursor:pointer}
  .tb-av{width:22px;height:22px;border-radius:50%;background:#0d6e6e;color:#fff;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .tb-name{font-size:12px;font-weight:600;color:#111}
  .btn-view{padding:6px 14px;background:#0d6e6e;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 2px 8px rgba(13,110,110,.3)}
  .btn-view:hover{background:#0a5656}
  .icon-btn{width:32px;height:32px;border-radius:6px;border:1px solid #c8c2b8;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;flex-shrink:0}
  .icon-btn:hover{background:#f0ece6;border-color:#a09890}
  .icon-badge{position:absolute;top:-4px;right:-4px;background:#dc2626;color:#fff;border-radius:999px;font-size:8px;font-weight:700;min-width:15px;height:15px;display:flex;align-items:center;justify-content:center;padding:0 3px;border:2px solid #f5f2ee}

  /* ── GEAR DROPDOWN ── */
  .gear-wrap{position:relative}
  .gear-drop{position:absolute;top:calc(100% + 6px);right:0;background:#fff;border:1px solid #c8c2b8;border-radius:10px;box-shadow:0 8px 32px rgba(17,13,10,0.14);min-width:200px;z-index:200;overflow:hidden}
  .gear-item{display:flex;align-items:center;gap:9px;padding:9px 14px;font-size:12px;font-weight:500;color:#5a5248;cursor:pointer;transition:background .1s;border:none;background:none;width:100%;text-align:left;font-family:inherit}
  .gear-item:hover{background:#f5f2ee;color:#111}
  .gear-item.danger{color:#dc2626}
  .gear-item.danger:hover{background:#fef2f2}
  .gear-divider{height:1px;background:#e8e2da;margin:3px 0}

  /* ── SIDEBAR ── */
  .sidebar{width:200px;min-width:200px;background:#fff;border-right:1px solid #c8c2b8;padding-top:48px;display:flex;flex-direction:column;position:fixed;left:0;top:0;bottom:0;overflow-y:auto;}
  .sb-user{padding:14px 14px 12px;border-bottom:1px solid #e8e2da}
  .sb-av{width:36px;height:36px;border-radius:8px;background:#0d6e6e;color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-bottom:6px}
  .sb-uname{font-size:12px;font-weight:700;color:#111;line-height:1.3}
  .sb-email{font-size:10px;color:#7a6e64;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sb-comp{margin:10px 12px;background:#e0f0ee;border:1px solid #a8d5ce;border-radius:7px;padding:8px 10px}
  .sb-comp-lbl{font-size:8px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#0a5656;margin-bottom:2px}
  .sb-comp-val{font-size:12px;font-weight:700;color:#0d6e6e}
  .sb-comp-sub{font-size:9px;color:#5a8a80;margin-top:1px}
  .sb-bar-bg{height:3px;background:#a8d5ce;border-radius:2px;margin-top:4px}
  .sb-bar-fill{height:100%;background:#0d6e6e;border-radius:2px}
  .sb-sec{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#a09890;padding:10px 14px 5px}
  .sb-item{display:flex;align-items:center;justify-content:space-between;padding:7px 14px;font-size:12px;font-weight:500;color:#5a5248;cursor:pointer;border-left:2.5px solid transparent;transition:all .1s;user-select:none;-webkit-user-select:none;}
  .sb-item:hover{background:#f5f2ee;color:#111}
  .sb-item.on{background:#e0f0ee;color:#0d6e6e;border-left-color:#0d6e6e;font-weight:700}
  .sb-item-left{display:flex;align-items:center;gap:8px;pointer-events:none;}
  .sb-check{font-size:10px;color:#16a34a;font-weight:700;pointer-events:none}
  .sb-pending{font-size:8px;font-weight:700;padding:1px 6px;border-radius:8px;background:#fef9c3;color:#854d0e;border:0.5px solid #fde68a;pointer-events:none}
  .sb-badge{background:#0d6e6e;color:#fff;font-size:8px;font-weight:700;padding:1px 5px;border-radius:8px;pointer-events:none}
  .sb-signout{margin:12px;padding:7px;border:1px solid #c8c2b8;border-radius:6px;background:none;font-size:11px;color:#7a6e64;cursor:pointer;font-family:inherit;width:calc(100% - 24px)}
  .sb-signout:hover{border-color:#dc2626;color:#dc2626}

  /* ── MAIN ── */
  .main{margin-left:200px;padding-top:48px;flex:1;overflow:auto;min-width:0}
  .content{padding:16px}

  /* ── WELCOME BAR ── */
  .welcome-bar{background:#fff;border:1px solid #c8c2b8;border-radius:10px;padding:14px 18px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between}
  .wb-title{font-size:15px;font-weight:800;color:#111;letter-spacing:-.3px;margin-bottom:2px}
  .wb-sub{font-size:11px;color:#7a6e64}
  .wb-right{display:flex;gap:8px;align-items:center}
  .btn-print{padding:6px 14px;background:#f5f2ee;border:1px solid #c8c2b8;border-radius:6px;font-size:12px;font-weight:600;color:#5a5248;cursor:pointer;font-family:inherit}
  .btn-print:hover{background:#e8e2da}
  .status-pill{padding:5px 12px;border-radius:5px;font-size:11px;font-weight:700}
  .pill-submitted{background:#e0f0ee;color:#0a5656;border:1px solid #a8d5ce}
  .pill-draft{background:#fef9c3;color:#854d0e;border:1px solid #fde68a}

  /* ── 4-STAT ROW ── */
  .stat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:0.5px;background:#c8c2b8;border:1px solid #c8c2b8;border-radius:9px;overflow:hidden;margin-bottom:14px}
  .stat{background:#fff;padding:11px 14px;position:relative}
  .stat-accent{position:absolute;top:0;left:0;right:0;height:2.5px}
  .stat-lbl{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#a09890;margin-bottom:4px}
  .stat-val{font-size:20px;font-weight:800;letter-spacing:-1px;line-height:1;margin-bottom:2px}
  .stat-sub{font-size:10px;color:#a09890}

  /* ── TWO COL ── */
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}

  /* ── CARD ── */
  .card{background:#fff;border:1px solid #c8c2b8;border-radius:9px;overflow:hidden}
  .card-hd{padding:10px 14px;border-bottom:1px solid #e8e2da;display:flex;align-items:center;justify-content:space-between}
  .card-title{font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#7a6e64}
  .card-action{font-size:11px;color:#0d6e6e;cursor:pointer;font-weight:600}
  .card-action:hover{text-decoration:underline}
  .card-body{padding:10px 14px}

  /* ── PROFILE CHECKLIST ── */
  .step-row{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #f0ece6;cursor:pointer;transition:background .1s}
  .step-row:hover{background:#faf8f5;margin:0 -14px;padding:9px 14px}
  .step-row:last-child{border-bottom:none}
  .step-ic{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:11px;font-weight:700}
  .step-ic.done{background:#e0f0ee;color:#0d6e6e;border:1px solid #a8d5ce}
  .step-ic.current{background:#fef9c3;color:#854d0e;border:1px solid #fde68a}
  .step-ic.todo{background:#f5f2ee;color:#a09890;border:1px solid #c8c2b8}
  .step-info{flex:1}
  .step-name{font-size:12px;font-weight:700;color:#111}
  .step-desc{font-size:10px;color:#a09890;margin-top:1px}
  .step-status{font-size:10px;font-weight:700}
  .st-done{color:#0d6e6e}
  .st-current{color:#d97706}
  .st-todo{color:#a09890}

  /* ── CONSENT CARDS ── */
  .consent-card{border:1px solid #c8c2b8;border-radius:7px;padding:10px 12px;margin-bottom:8px;background:#fff}
  .consent-card.pending{border-left:3px solid #d97706}
  .consent-card.approved{border-left:3px solid #0d6e6e}
  .consent-card:last-child{margin-bottom:0}
  .cc-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:7px}
  .cc-company{font-size:12px;font-weight:700;color:#111}
  .cc-date{font-size:10px;color:#a09890;margin-top:1px}
  .cc-badge{font-size:9px;font-weight:700;padding:2px 8px;border-radius:8px;text-transform:uppercase}
  .b-pending{background:#fef9c3;color:#854d0e;border:0.5px solid #fde68a}
  .b-approved{background:#e0f0ee;color:#0a5656;border:0.5px solid #a8d5ce}
  .cc-msg{font-size:11px;color:#5a5248;font-style:italic;background:#f5f2ee;border-radius:4px;padding:6px 8px;margin-bottom:8px;line-height:1.55;border-left:2px solid #c8c2b8}
  .cc-actions{display:flex;gap:7px}
  .btn-approve{flex:1;padding:7px;background:#0d6e6e;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 2px 6px rgba(13,110,110,.25)}
  .btn-approve:hover:not(:disabled){background:#0a5656}
  .btn-decline{flex:1;padding:7px;background:#fff;color:#dc2626;border:1px solid #fca5a5;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit}
  .btn-decline:hover:not(:disabled){background:#fef2f2}
  .btn-approve:disabled,.btn-decline:disabled{opacity:.5;cursor:not-allowed}

  /* ── DOCUMENT VAULT ── */
  .doc-row{display:flex;align-items:center;gap:9px;padding:7px 0;border-bottom:1px solid #f0ece6}
  .doc-row:last-child{border-bottom:none}
  .doc-ic{width:24px;height:24px;border-radius:5px;background:#fef9c3;border:1px solid #fde68a;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:11px}
  .doc-name{font-size:12px;font-weight:600;color:#111;flex:1}
  .doc-sec{font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#a09890;margin-right:4px}
  .doc-ok{font-size:10px;font-weight:700;color:#0d6e6e}
  .doc-miss{font-size:10px;font-weight:700;color:#d97706}

  /* ── ACTIVITY FEED ── */
  .feed-row{display:flex;gap:8px;padding:7px 0;border-bottom:1px solid #f0ece6}
  .feed-row:last-child{border-bottom:none}
  .fdot{width:7px;height:7px;border-radius:50%;flex-shrink:0;margin-top:3px}
  .ftext{font-size:11px;color:#111;line-height:1.5;flex:1}
  .ftext b{font-weight:700}
  .ftime{font-size:10px;color:#a09890;white-space:nowrap}

  /* ── INBOX PANEL ── */
  .inbox-overlay{position:fixed;inset:0;background:rgba(17,13,10,0.45);z-index:300;backdrop-filter:blur(3px)}
  .inbox-panel{position:fixed;top:0;right:0;width:680px;max-width:98vw;height:100vh;background:#fff;box-shadow:-8px 0 48px rgba(17,13,10,0.18);z-index:301;display:flex;flex-direction:column}
  .inbox-head{padding:1rem 1.4rem;border-bottom:1px solid #c8c2b8;display:flex;align-items:center;justify-content:space-between;background:#f5f2ee;flex-shrink:0}
  .inbox-title{font-size:0.9rem;font-weight:700;color:#111}
  .inbox-close{width:28px;height:28px;border-radius:6px;border:1px solid #c8c2b8;background:transparent;color:#7a6e64;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center}
  .inbox-close:hover{border-color:#ef4444;color:#ef4444;background:#fef2f2}
  .inbox-body{display:flex;flex:1;overflow:hidden}
  .inbox-list{width:240px;min-width:240px;border-right:1px solid #c8c2b8;overflow-y:auto;background:#f5f2ee}
  .inbox-thread{flex:1;display:flex;flex-direction:column;overflow:hidden}
  .thread-item{padding:0.75rem 1rem;cursor:pointer;border-bottom:1px solid #c8c2b8;transition:background .1s}
  .thread-item:hover{background:#e0f0ee}
  .thread-item.active{background:#e0f0ee;border-left:3px solid #0d6e6e}
  .thread-email{font-size:0.72rem;font-weight:700;color:#111;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .thread-preview{font-size:0.65rem;color:#a09890;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .thread-time{font-size:0.58rem;color:#c8c2b8}
  .unread-dot{background:#0d6e6e;color:#fff;font-size:0.55rem;font-weight:800;padding:1px 6px;border-radius:999px}
  .msg-list{flex:1;overflow-y:auto;padding:1rem 1.25rem;display:flex;flex-direction:column;gap:0.65rem}
  .msg-bubble-wrap{display:flex;flex-direction:column}
  .msg-bubble-wrap.mine{align-items:flex-end}
  .msg-bubble-wrap.theirs{align-items:flex-start}
  .msg-bubble{max-width:75%;padding:0.65rem 0.9rem;border-radius:12px;font-size:0.82rem;line-height:1.55;word-break:break-word}
  .msg-bubble.mine{background:#0d6e6e;color:#fff;border-radius:12px 12px 3px 12px}
  .msg-bubble.theirs{background:#f5f2ee;color:#111;border-radius:12px 12px 12px 3px;border:1px solid #c8c2b8}
  .msg-sender{font-size:0.6rem;color:#a09890;margin-bottom:3px;font-weight:600}
  .msg-time{font-size:0.58rem;margin-top:3px;color:#c8c2b8}
  .msg-time.mine{color:rgba(255,255,255,.6);text-align:right}
  .msg-compose{padding:0.85rem 1.25rem;border-top:1px solid #c8c2b8;background:#fff;flex-shrink:0}
  .msg-input{width:100%;padding:0.6rem 0.875rem;background:#f5f2ee;border:1.5px solid #c8c2b8;border-radius:9px;font-family:inherit;font-size:0.82rem;color:#111;outline:none;resize:none;min-height:70px;max-height:140px;transition:border-color .15s}
  .msg-input:focus{border-color:#0d6e6e;background:#fff;box-shadow:0 0 0 3px rgba(13,110,110,.08)}
  .msg-send-btn{padding:0.5rem 1.1rem;background:#0d6e6e;color:#fff;border:none;border-radius:8px;font-family:inherit;font-size:0.78rem;font-weight:700;cursor:pointer;transition:all .15s;box-shadow:0 2px 8px rgba(13,110,110,.25)}
  .msg-send-btn:hover:not(:disabled){background:#0a5656}
  .msg-send-btn:disabled{opacity:.5;cursor:not-allowed}

  /* ── BLOCKER ── */
  .blocker{background:#fef9c3;border:1px solid #fde68a;border-radius:7px;padding:8px 12px;font-size:12px;color:#854d0e;margin-bottom:10px;line-height:1.55}
  .empty{padding:20px;text-align:center;color:#a09890;font-size:12px}

  /* ── LIVE indicator ── */
  @keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:.3}}
  .live-dot{width:6px;height:6px;border-radius:50%;background:#16a34a;animation:pulse-dot 2s ease-in-out infinite;flex-shrink:0}
`;

// ── Modals ────────────────────────────────────────────────────────────
function SignoutModal({ onConfirm, onCancel }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(17,13,10,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,backdropFilter:"blur(4px)"}}>
      <div style={{background:"#fff",borderRadius:12,padding:"1.75rem",maxWidth:320,width:"90%",textAlign:"center",boxShadow:"0 16px 48px rgba(17,13,10,0.18)",border:"1px solid #c8c2b8"}}>
        <div style={{fontSize:28,marginBottom:"0.5rem"}}>👋</div>
        <div style={{fontSize:"1rem",fontWeight:700,color:"#111",marginBottom:"0.3rem"}}>Sign out?</div>
        <p style={{color:"#7a6e64",fontSize:"0.82rem",marginBottom:"1.25rem",lineHeight:1.55}}>You can sign back in anytime.</p>
        <div style={{display:"flex",gap:"0.65rem"}}>
          <button onClick={onCancel} style={{flex:1,padding:"0.65rem",borderRadius:7,border:"1.5px solid #c8c2b8",background:"#f5f2ee",cursor:"pointer",fontWeight:600,color:"#5a5248",fontSize:"0.84rem",fontFamily:"inherit"}}>Cancel</button>
          <button onClick={onConfirm} style={{flex:1,padding:"0.65rem",borderRadius:7,border:"none",background:"#dc2626",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:"0.84rem",fontFamily:"inherit"}}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

function DeleteAccountModal({ onConfirm, onCancel, busy }) {
  const [confirm, setConfirm] = useState("");
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(17,13,10,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,backdropFilter:"blur(4px)"}}>
      <div style={{background:"#fff",borderRadius:12,padding:"1.75rem",maxWidth:360,width:"90%",boxShadow:"0 16px 48px rgba(17,13,10,0.2)",border:"1px solid #fca5a5"}}>
        <div style={{fontSize:"1rem",fontWeight:700,color:"#dc2626",marginBottom:"0.4rem"}}>⚠ Delete Account</div>
        <p style={{color:"#5a5248",fontSize:"0.82rem",marginBottom:"1rem",lineHeight:1.65}}>This will permanently delete your profile, all uploaded documents, and revoke all employer accesses. This cannot be undone.</p>
        <div style={{marginBottom:"1rem"}}>
          <div style={{fontSize:"11px",fontWeight:600,color:"#7a6e64",marginBottom:"5px"}}>Type <strong>DELETE</strong> to confirm</div>
          <input value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="DELETE" style={{width:"100%",padding:"8px 10px",border:"1.5px solid #c8c2b8",borderRadius:7,fontFamily:"inherit",fontSize:"13px",outline:"none"}} />
        </div>
        <div style={{display:"flex",gap:"0.65rem"}}>
          <button onClick={onCancel} style={{flex:1,padding:"0.65rem",borderRadius:7,border:"1.5px solid #c8c2b8",background:"#f5f2ee",cursor:"pointer",fontWeight:600,color:"#5a5248",fontSize:"0.84rem",fontFamily:"inherit"}}>Cancel</button>
          <button onClick={()=>confirm==="DELETE"&&onConfirm()} disabled={confirm!=="DELETE"||busy} style={{flex:1,padding:"0.65rem",borderRadius:7,border:"none",background:confirm==="DELETE"?"#dc2626":"#e8e2da",color:confirm==="DELETE"?"#fff":"#a09890",cursor:confirm==="DELETE"&&!busy?"pointer":"not-allowed",fontWeight:700,fontSize:"0.84rem",fontFamily:"inherit"}}>
            {busy?"Deleting…":"Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────
function normalizeStatus(s) {
  const v = String(s||"pending").toLowerCase();
  if(["approved","approve","accepted","granted","allow"].includes(v)) return "approved";
  if(["declined","decline","rejected","denied","reject"].includes(v)) return "declined";
  return "pending";
}
const nc = c => ({
  ...c,
  consent_id:      c?.consent_id||c?.id||c?.consentId||c?._id,
  status:          normalizeStatus(c?.status),
  request_message: c?.request_message||c?.message||c?.comment||"",
  employer_name:   c?.employer_name||c?.employerName||c?.company_name||c?.companyName||"",
  employer_email:  c?.employer_email||c?.employerEmail||c?.email||"",
});
const gcid = c => c?.consent_id||c?.id||c?.consentId||c?._id;
function fmt(ts) {
  if(!ts) return "";
  try { return new Date(ts).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}); }
  catch { return ""; }
}

// ── Main Component ────────────────────────────────────────────────────
export default function EmployeeDashboard() {
  const { user, apiFetch, logout, ready } = useAuth();
  const router = useRouter();
  const gearRef = useRef(null);

  // ── State ──
  const [draft,          setDraft]          = useState(null);
  const [consents,       setConsents]       = useState([]);
  const [acting,         setActing]         = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [bellCount,      setBellCount]      = useState(0);
  const [showSignout,    setShowSignout]    = useState(false);
  const [showDelete,     setShowDelete]     = useState(false);
  const [deleteBusy,     setDeleteBusy]     = useState(false);
  const [showGear,       setShowGear]       = useState(false);
  // Inbox
  const [showInbox,      setShowInbox]      = useState(false);
  const [inboxThreads,   setInboxThreads]   = useState([]);
  const [inboxLoading,   setInboxLoading]   = useState(false);
  const [inboxUnread,    setInboxUnread]    = useState(0);
  const [activeThread,   setActiveThread]   = useState(null);
  const [threadMsgs,     setThreadMsgs]     = useState([]);
  const [threadLoading,  setThreadLoading]  = useState(false);
  const [msgBody,        setMsgBody]        = useState("");
  const [msgSending,     setMsgSending]     = useState(false);
  const [msgErr,         setMsgErr]         = useState("");

  // ── Auth guard ──
  useEffect(() => {
    if(!ready) return;
    if(!user) { router.replace("/employee/login"); return; }
    if(user.role !== "employee") { router.replace("/employee/login"); return; }
  }, [ready, user, router]);

  // ── Close gear on outside click ──
  useEffect(() => {
    const handler = (e) => {
      if(gearRef.current && !gearRef.current.contains(e.target)) setShowGear(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Data loading (real-time: polls every 15s) ──
  const loadData = useCallback(async () => {
    if(!ready || !user) return;
    try {
      const [dr, cr] = await Promise.all([
        apiFetch(`${API}/employee/draft`),
        apiFetch(`${API}/consent/my`),
      ]);
      if(dr.ok) setDraft(await dr.json());
      if(cr.ok) {
        const data = await cr.json();
        const mapped = Array.isArray(data) ? data.map(nc) : [];
        setConsents(mapped);
        setBellCount(mapped.filter(c=>c.status==="pending").length);
      }
    } catch(_) {}
    setLoading(false);
  }, [ready, user, apiFetch]);

  useEffect(() => { loadData(); }, [loadData]);
  // Real-time: poll every 15s for consent updates and profile changes
  useEffect(() => {
    if(!ready||!user) return;
    const id = setInterval(loadData, 15000);
    return () => clearInterval(id);
  }, [ready, user, loadData]);

  // ── Inbox unread count poll ──
  const loadUnread = useCallback(async () => {
    try {
      const r = await apiFetch(`${API}/messages/unread-count`);
      if(r.ok) { const d = await r.json(); setInboxUnread(d.unread||0); }
    } catch(_) {}
  }, [apiFetch]);

  useEffect(() => { if(ready&&user) loadUnread(); }, [ready, user, loadUnread]);
  useEffect(() => {
    if(!ready||!user) return;
    const id = setInterval(loadUnread, 20000);
    return () => clearInterval(id);
  }, [ready, user, loadUnread]);

  // ── Inbox functions ──
  const loadInbox = async () => {
    setInboxLoading(true);
    try {
      const r = await apiFetch(`${API}/messages/inbox`);
      if(r.ok) setInboxThreads(await r.json());
    } catch(_) {}
    setInboxLoading(false);
  };

  const loadThread = async (threadId) => {
    setActiveThread(threadId); setThreadMsgs([]); setThreadLoading(true); setMsgErr("");
    try {
      const r = await apiFetch(`${API}/messages/thread/${threadId}`);
      if(r.ok) { const d = await r.json(); setThreadMsgs(d.messages||[]); }
    } catch(_) {}
    setThreadLoading(false);
    loadUnread();
  };

  const sendReply = async () => {
    if(!msgBody.trim()||!activeThread) return;
    setMsgSending(true); setMsgErr("");
    try {
      const r = await apiFetch(`${API}/messages/send`, {
        method:"POST",
        body: JSON.stringify({ consent_id: activeThread, body: msgBody.trim() }),
      });
      if(r.ok) { setMsgBody(""); await loadThread(activeThread); loadInbox(); }
      else { const d = await r.json(); setMsgErr(d.detail||"Failed to send"); }
    } catch(_) { setMsgErr("Network error"); }
    setMsgSending(false);
  };

  // ── Consent respond ──
  const respond = async (consentId, decision) => {
    if(profileStatus !== "submitted") return;
    setActing(consentId);
    try {
      const r = await apiFetch(`${API}/consent/respond`, {
        method:"POST",
        body: JSON.stringify({ consent_id:consentId, status:decision==="approve"?"APPROVED":"DECLINED", responded_at:Date.now() }),
      });
      if(r.ok) await loadData();
    } catch(_) {}
    setActing(null);
  };

  // ── Delete account ──
  const handleDeleteAccount = async () => {
    setDeleteBusy(true);
    try {
      const r = await apiFetch(`${API}/auth/delete-account`, { method:"DELETE" });
      if(r.ok) { logout(); return; }
      const d = await r.json();
      alert(d.detail||"Failed to delete account. Please contact support.");
    } catch(_) { alert("Network error. Please try again."); }
    setDeleteBusy(false);
    setShowDelete(false);
  };

  if(!ready||!user) return null;

  const profileStatus = String(draft?.status||"draft").toLowerCase();
  const isSubmitted   = profileStatus === "submitted";
  const p = draft || {};

  // ── Real-time granular progress — field keys match exactly what each page saves ──

  // PAGE 1: personal.js — matches buildPayload() exactly
  const p1Fields = [
    p.firstName, p.lastName, p.dob, p.gender, p.nationality, p.mobile,
    p.aadhaar || p.aadhar,
    p.nameAsPerAadhaar,
    p.pan, p.nameAsPerPan,
    p.hasPassport, p.bloodGroup, p.maritalStatus,
    p.currentAddress?.door,
    p.currentAddress?.district,
    p.currentAddress?.state,
    p.currentAddress?.pin,
    p.aadhaarKey || p.documents?.personal?.aadhaar,
    p.panKey     || p.documents?.personal?.pan,
    p.photoKey   || p.documents?.personal?.photo,
    p.bankName, p.bankAccountName, p.ifsc, p.branch, p.accountType,
    p.accountFull || p.accountLast4,
  ];
  const p1Filled = p1Fields.filter(Boolean).length;
  const p1Total  = p1Fields.length;
  const p1Pct    = Math.round((p1Filled / p1Total) * 100);

  // PAGE 2: education.js — buildEducation() fields
  // Class X + Intermediate are mandatory; UG optional bonus
  const edu = p.education || {};
  const cx  = edu.classX        || {};
  const int2 = edu.intermediate || {};
  const ug  = edu.undergraduate || {};
  const p2Core = [
    cx.school, cx.board, cx.hallTicket, cx.yearOfPassing, cx.resultValue,
    int2.school || int2.college, int2.board, int2.yearOfPassing,
  ];
  const p2Bonus = (edu.hasUG === "Yes" || ug.college)
    ? [ug.college, ug.course, ug.yearOfPassing] : [];
  const p2Fields = [...p2Core, ...p2Bonus];
  const p2Filled = p2Fields.filter(Boolean).length;
  const p2Total  = p2Fields.length;
  const p2Pct    = Math.round((p2Filled / p2Total) * 100);

  // PAGE 3: previous.js — employments array
  // Key: saved as p.employments (not employmentHistory)
  const empList = Array.isArray(p.employments)
    ? p.employments
    : Array.isArray(p.employmentHistory)
    ? p.employmentHistory
    : [];
  let p3Filled = 0, p3Total = 4;
  if (p.hasExperience === "No") {
    p3Filled = p3Total = 1; // Fresher — answered the question = done
  } else if (empList.length > 0) {
    p3Total = 0;
    empList.forEach(e => {
      const f = [e.companyName, e.designation, e.startDate, e.employmentType];
      p3Filled += f.filter(Boolean).length;
      p3Total  += f.length;
    });
  }
  const p3Pct = p3Total > 0 ? Math.round((p3Filled / p3Total) * 100) : 0;

  // PAGE 4: uan.js — hasUan + uanNumber + pfRecords
  let p4Filled = 0, p4Total = 3;
  if (p.hasUan === "no" || p.hasUan === false) {
    p4Filled = p4Total = 1; // answered "No UAN" = complete
  } else if (p.hasUan === "yes" || p.hasUan === true) {
    const uanF = [p.hasUan, p.uanNumber, p.nameAsPerUan];
    p4Filled = uanF.filter(Boolean).length;
    const pfList = Array.isArray(p.pfRecords) ? p.pfRecords : [];
    if (pfList.length > 0) { p4Total += 1; p4Filled += 1; }
  }
  const p4Pct = Math.round((p4Filled / p4Total) * 100);

  const sections = [
    {
      n:1, label:"Personal information",
      desc:"Identity, address, bank details",
      pct:p1Pct, done:p1Pct===100, started:p1Filled>0,
      filledOf:`${p1Filled} / ${p1Total} fields`,
      path:"/employee/personal",
    },
    {
      n:2, label:"Education",
      desc:"Qualifications and certificates",
      pct:p2Pct, done:p2Pct===100, started:p2Filled>0,
      filledOf:`${p2Filled} / ${p2Total} fields`,
      path:"/employee/education",
    },
    {
      n:3, label:"Employment history",
      desc:"Previous employers & current job",
      pct:p3Pct, done:p3Pct===100,
      started:empList.length>0 || p.hasExperience==="No",
      filledOf:p.hasExperience==="No"
        ? "Fresher — no experience"
        : empList.length>0
          ? `${empList.length} employer${empList.length>1?"s":""} added`
          : "Not started",
      path:"/employee/previous",
    },
    {
      n:4, label:"UAN & PF details",
      desc:"Provident fund and EPFO records",
      pct:p4Pct, done:p4Pct===100,
      started:p.hasUan!==undefined && p.hasUan!==null && p.hasUan!=="",
      filledOf:p.hasUan==="no"||p.hasUan===false
        ? "No UAN — complete"
        : p.uanNumber
          ? `UAN: ${p.uanNumber}`
          : p.hasUan
            ? "UAN number pending"
            : "Not started",
      path:"/employee/uan",
    },
  ];

  const completion = Math.round((p1Pct + p2Pct + p3Pct + p4Pct) / 4);
  const doneCount  = sections.filter(s=>s.done).length;

  const pending  = consents.filter(c=>c.status==="pending");
  const approved = consents.filter(c=>c.status==="approved");

  const docs = [
    { name:"Aadhaar card",          section:"Identity",   uploaded:!!(p.aadhaarKey||p.documents?.personal?.aadhaar) },
    { name:"PAN card",              section:"Identity",   uploaded:!!(p.panKey||p.documents?.personal?.pan) },
    { name:"Degree certificate",    section:"Education",  uploaded:!!(edu.undergraduate?.provKey||edu.undergraduate?.convoKey||p.documents?.education?.ug_provisional||p.documents?.education?.ug_convocation) },
    { name:"Resume / Offer letter", section:"Employment", uploaded:!!(p.resumeKey||p.documents?.general?.cv||p.documents?.employment) },
    { name:"UAN passbook",          section:"UAN & PF",   uploaded:!!(p.epfoKey||p.documents?.uan?.uanCard) },
  ];
  const uploadedCount = docs.filter(d=>d.uploaded).length;
  const nameInit = (user.name||user.email||"").slice(0,2).toUpperCase();

  return (
    <>
      <style>{G}</style>

      {showSignout  && <SignoutModal onConfirm={logout} onCancel={()=>setShowSignout(false)} />}
      {showDelete   && <DeleteAccountModal onConfirm={handleDeleteAccount} onCancel={()=>setShowDelete(false)} busy={deleteBusy} />}

      {/* ── INBOX PANEL ── */}
      {showInbox && (
        <>
          <div className="inbox-overlay" onClick={()=>setShowInbox(false)}/>
          <div className="inbox-panel">
            <div className="inbox-head">
              <div className="inbox-title">✉️ Messages</div>
              <button className="inbox-close" onClick={()=>setShowInbox(false)}>✕</button>
            </div>
            <div className="inbox-body">
              {/* Thread list */}
              <div className="inbox-list">
                {inboxLoading && <div style={{padding:"1rem",fontSize:"0.72rem",color:"#a09890"}}>Loading…</div>}
                {!inboxLoading && inboxThreads.length===0 && (
                  <div style={{padding:"2rem 1rem",textAlign:"center"}}>
                    <div style={{fontSize:"1.5rem",opacity:.2,marginBottom:"0.5rem"}}>✉️</div>
                    <div style={{fontSize:"0.72rem",color:"#a09890"}}>No messages yet</div>
                    <div style={{fontSize:"0.62rem",color:"#c8c2b8",marginTop:"0.3rem"}}>Employers will message you here</div>
                  </div>
                )}
                {inboxThreads.map(t=>(
                  <div key={t.thread_id} className={`thread-item${activeThread===t.thread_id?" active":""}`} onClick={()=>loadThread(t.thread_id)}>
                    <div className="thread-email">{t.other_party_name||t.other_party_email}</div>
                    <div className="thread-preview">{t.latest_message||"No messages"}</div>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:2}}>
                      <span className="thread-time">{t.latest_at?fmt(t.latest_at):""}</span>
                      {t.unread_count>0 && <span className="unread-dot">{t.unread_count}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Messages */}
              <div className="inbox-thread">
                {!activeThread ? (
                  <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:"0.5rem",padding:"3rem"}}>
                    <div style={{fontSize:"2.5rem",opacity:.15}}>✉️</div>
                    <div style={{fontSize:"0.84rem",color:"#a09890",fontWeight:500}}>Select a conversation</div>
                  </div>
                ) : (
                  <>
                    <div style={{padding:"0.75rem 1.1rem",borderBottom:"1px solid #c8c2b8",background:"#faf8f5",fontSize:"0.75rem",fontWeight:700,color:"#111"}}>
                      {inboxThreads.find(t=>t.thread_id===activeThread)?.other_party_name||inboxThreads.find(t=>t.thread_id===activeThread)?.other_party_email}
                      <span style={{fontSize:"0.62rem",color:"#a09890",fontWeight:400,marginLeft:8}}>{threadMsgs.length} message{threadMsgs.length!==1?"s":""}</span>
                    </div>
                    <div className="msg-list">
                      {threadLoading && <div style={{textAlign:"center",fontSize:"0.72rem",color:"#a09890"}}>Loading…</div>}
                      {!threadLoading&&threadMsgs.length===0 && <div style={{textAlign:"center",fontSize:"0.72rem",color:"#a09890",padding:"2rem"}}>No messages yet.</div>}
                      {threadMsgs.map((m,i)=>{
                        const mine = m.sender_role==="employee";
                        return (
                          <div key={m.message_id||i} className={`msg-bubble-wrap ${mine?"mine":"theirs"}`}>
                            {!mine && <div className="msg-sender">{m.sender_name||m.sender_email}</div>}
                            <div className={`msg-bubble ${mine?"mine":"theirs"}`}>{m.body}</div>
                            <div className={`msg-time ${mine?"mine":""}`}>
                              {new Date(m.sent_at).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}
                              {mine && <span style={{marginLeft:4}}>{m.read_by_recipient?"✓✓":"✓"}</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="msg-compose">
                      <textarea className="msg-input" value={msgBody} onChange={e=>setMsgBody(e.target.value)}
                        onKeyDown={e=>{if(e.key==="Enter"&&e.ctrlKey){e.preventDefault();sendReply();}}}
                        placeholder="Type your reply… (Ctrl+Enter to send)" />
                      {msgErr && <div style={{fontSize:"0.68rem",color:"#ef4444",marginBottom:"0.3rem",fontWeight:600}}>{msgErr}</div>}
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"0.4rem"}}>
                        <span style={{fontSize:"0.62rem",color:"#a09890"}}>Ctrl+Enter to send</span>
                        <button className="msg-send-btn" onClick={sendReply} disabled={msgSending||!msgBody.trim()}>
                          {msgSending?"Sending…":"Reply ↗"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── TOPBAR ── */}
      <div className="topbar">
        <div className="tb-logo">
          <div className="tb-logo-sq">
            <svg width="12" height="14" viewBox="0 0 24 28" fill="none">
              <rect x="5" y="15" width="4" height="9" rx="1.5" fill="white"/>
              <rect x="15" y="15" width="4" height="9" rx="1.5" fill="white"/>
              <path d="M7 15Q12 8 17 15" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="tb-logo-name">Datagate</div>
          <span style={{fontSize:11,color:"#a09890",marginLeft:6}}>My Profile & Consents</span>
          {/* Live indicator */}
          <div style={{display:"flex",alignItems:"center",gap:4,marginLeft:10,padding:"2px 8px",background:"#e0f0ee",borderRadius:20,border:"1px solid #a8d5ce"}}>
            <div className="live-dot"/>
            <span style={{fontSize:9,fontWeight:700,color:"#0a5656",letterSpacing:.5}}>LIVE</span>
          </div>
        </div>
        <div className="tb-right">
          {/* Inbox button */}
          <div style={{position:"relative"}}>
            <button className="icon-btn" onClick={()=>{setShowInbox(true);loadInbox();}} title="Messages">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5a5248" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </button>
            {inboxUnread>0 && <span className="icon-badge">{inboxUnread}</span>}
          </div>
          {/* Bell / consents */}
          <div style={{position:"relative"}}>
            <button className="icon-btn" onClick={()=>router.push("/consent")} title="Consent Requests">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5a5248" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </button>
            {bellCount>0 && <span className="icon-badge">{bellCount}</span>}
          </div>
          {/* User chip */}
          <div className="tb-user">
            <div className="tb-av">{nameInit}</div>
            <div className="tb-name">{user.name?.split(" ")[0]||user.email}</div>
          </div>
          {/* Gear / settings */}
          <div className="gear-wrap" ref={gearRef}>
            <button className="icon-btn" onClick={()=>setShowGear(g=>!g)} title="Settings">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5a5248" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
            {showGear && (
              <div className="gear-drop">
                <button className="gear-item" onClick={()=>{setShowGear(false);router.push("/employee/review");}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  View full profile
                </button>
                <button className="gear-item" onClick={()=>{setShowGear(false);router.push("/employee/personal");}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit profile
                </button>
                <button className="gear-item" onClick={()=>{setShowGear(false);router.push("/forgot-password");}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Change password
                </button>
                <div className="gear-divider"/>
                <button className="gear-item" onClick={()=>{setShowGear(false);setShowSignout(true);}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sign out
                </button>
                <button className="gear-item danger" onClick={()=>{setShowGear(false);setShowDelete(true);}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  Delete account
                </button>
              </div>
            )}
          </div>
          <button className="btn-view" onClick={()=>router.push("/employee/review")}>View full profile</button>
        </div>
      </div>

      <div className="shell">
        {/* ── SIDEBAR ── */}
        <div className="sidebar">
          <div className="sb-user">
            <div className="sb-av">{nameInit}</div>
            <div className="sb-uname">{user.name||"Your Name"}</div>
            <div className="sb-email">{user.email}</div>
          </div>

          <div className="sb-comp">
            <div className="sb-comp-lbl">Profile completion</div>
            <div className="sb-comp-val">{completion}%</div>
            <div className="sb-comp-sub">
              {completion === 100
                ? "All sections complete ✓"
                : sections.filter(s=>s.started&&!s.done).length > 0
                  ? `${sections.filter(s=>s.started&&!s.done).length} section${sections.filter(s=>s.started&&!s.done).length>1?"s":""} in progress`
                  : `${sections.filter(s=>!s.started).length} section${sections.filter(s=>!s.started).length>1?"s":""} not started`}
            </div>
            <div className="sb-bar-bg"><div className="sb-bar-fill" style={{width:`${completion}%`}}/></div>
          </div>

          <div className="sb-sec">My Profile</div>
          <div className="sb-item on"><div className="sb-item-left"><span>⊞</span>Dashboard</div></div>
          <div className="sb-item" role="button" tabIndex={0} onClick={()=>router.push("/employee/personal")} onKeyDown={e=>e.key==="Enter"&&router.push("/employee/personal")}>
            <div className="sb-item-left"><span>👤</span>Personal Info</div><span className="sb-check">✓</span>
          </div>
          <div className="sb-item" role="button" tabIndex={0} onClick={()=>router.push("/employee/education")} onKeyDown={e=>e.key==="Enter"&&router.push("/employee/education")}>
            <div className="sb-item-left"><span>🎓</span>Education</div><span className="sb-check">✓</span>
          </div>
          <div className="sb-item" role="button" tabIndex={0} onClick={()=>router.push("/employee/previous")} onKeyDown={e=>e.key==="Enter"&&router.push("/employee/previous")}>
            <div className="sb-item-left"><span>💼</span>Employment</div><span className="sb-check">✓</span>
          </div>
          <div className="sb-item" role="button" tabIndex={0} onClick={()=>router.push("/employee/uan")} onKeyDown={e=>e.key==="Enter"&&router.push("/employee/uan")}>
            <div className="sb-item-left"><span>🏦</span>UAN & PF</div><span className="sb-pending">Pending</span>
          </div>

          <div className="sb-sec">Activity</div>
          <div className="sb-item" role="button" tabIndex={0} onClick={()=>router.push("/consent")}>
            <div className="sb-item-left"><span>📋</span>Consent Requests</div>
            {bellCount>0 && <span className="sb-badge">{bellCount}</span>}
          </div>
          <div className="sb-item" role="button" tabIndex={0} onClick={()=>{setShowInbox(true);loadInbox();}}>
            <div className="sb-item-left"><span>✉️</span>Messages</div>
            {inboxUnread>0 && <span className="sb-badge">{inboxUnread}</span>}
          </div>
          <div className="sb-item" role="button" tabIndex={0} onClick={()=>router.push("/employee/personal?tab=documents")}>
            <div className="sb-item-left"><span>📁</span>Documents</div>
          </div>
          <div className="sb-item" role="button" tabIndex={0}>
            <div className="sb-item-left"><span>🕐</span>Access Log</div>
          </div>

          <div style={{flex:1}}/>
          <button className="sb-signout" onClick={()=>setShowSignout(true)}>Sign out</button>
        </div>

        {/* ── MAIN ── */}
        <div className="main">
          <div className="content">

            {/* Welcome bar */}
            <div className="welcome-bar">
              <div>
                <div className="wb-title">Welcome back{user.name?`, ${user.name.split(" ")[0]}`:""}</div>
                <div className="wb-sub">
                  {isSubmitted
                    ? "Your profile is live — employers request access with your consent"
                    : "Complete all sections to make your profile live"}
                </div>
              </div>
              <div className="wb-right">
                <button className="btn-print" onClick={()=>router.push("/employee/review")}>Print / Export PDF</button>
                <div className={`status-pill ${isSubmitted?"pill-submitted":"pill-draft"}`}>
                  {isSubmitted?"Profile submitted ✓":"Draft — not submitted"}
                </div>
              </div>
            </div>

            {/* 4 stats — pulled live from API data */}
            <div className="stat-row">
              <div className="stat">
                <div className="stat-accent" style={{background:"#0d6e6e"}}/>
                <div className="stat-lbl">Profile completion</div>
                <div className="stat-val" style={{color:"#0d6e6e"}}>{completion}<span style={{fontSize:12,fontWeight:600}}>%</span></div>
                <div className="stat-sub">{isSubmitted?"Submitted ✓":completion===100?"Ready to submit":`${doneCount}/4 sections done`}</div>
              </div>
              <div className="stat">
                <div className="stat-accent" style={{background:"#d97706"}}/>
                <div className="stat-lbl">Pending consents</div>
                <div className="stat-val" style={{color:pending.length>0?"#d97706":"#a09890"}}>{loading?"…":pending.length}</div>
                <div className="stat-sub">{pending.length>0?"Awaiting your action":"Nothing pending"}</div>
              </div>
              <div className="stat">
                <div className="stat-accent" style={{background:"#0d6e6e"}}/>
                <div className="stat-lbl">Employers with access</div>
                <div className="stat-val" style={{color:"#0d6e6e"}}>{loading?"…":approved.length}</div>
                <div className="stat-sub">{approved.length>0?"Currently approved":"No approvals yet"}</div>
              </div>
              <div className="stat">
                <div className="stat-accent" style={{background:"#2563eb"}}/>
                <div className="stat-lbl">Documents uploaded</div>
                <div className="stat-val" style={{color:"#2563eb"}}>{uploadedCount}<span style={{fontSize:12,fontWeight:600,color:"#a09890"}}>/{docs.length}</span></div>
                <div className="stat-sub">{uploadedCount===docs.length?"All uploaded":uploadedCount===0?"None yet":`${docs.length-uploadedCount} missing`}</div>
              </div>
            </div>

            <div className="two-col">
              {/* Left col */}
              <div style={{display:"flex",flexDirection:"column",gap:12}}>

                {/* Profile checklist */}
                <div className="card">
                  <div className="card-hd">
                    <div className="card-title">Profile completion checklist</div>
                    <div className="card-action" onClick={()=>router.push("/employee/personal")}>Continue →</div>
                  </div>
                  <div className="card-body">
                    {sections.map(s=>(
                      <div className="step-row" key={s.n} onClick={()=>router.push(s.path)}>
                        <div className={`step-ic ${s.done?"done":s.started?"current":"todo"}`}>
                          {s.done?"✓":s.n}
                        </div>
                        <div className="step-info">
                          <div className="step-name">{s.label}</div>
                          <div className="step-desc">{s.desc}</div>
                          {/* Per-section mini progress bar */}
                          {s.started && !s.done && (
                            <div style={{marginTop:4}}>
                              <div style={{height:3,background:"#e8e2da",borderRadius:2,overflow:"hidden",width:"100%"}}>
                                <div style={{height:"100%",width:`${s.pct}%`,background:"#d97706",borderRadius:2,transition:"width .4s"}}/>
                              </div>
                              <div style={{fontSize:9,color:"#a09890",marginTop:2}}>{s.filledOf}</div>
                            </div>
                          )}
                          {!s.started && (
                            <div style={{fontSize:9,color:"#c8c2b8",marginTop:2}}>Not started yet</div>
                          )}
                        </div>
                        <span className={`step-status ${s.done?"st-done":s.started?"st-current":"st-todo"}`}>
                          {s.done?"Complete":s.started?`${s.pct}%`:"Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Document vault */}
                <div className="card">
                  <div className="card-hd">
                    <div className="card-title">Document vault</div>
                    <div className="card-action" onClick={()=>router.push("/employee/personal?tab=documents")}>Manage all →</div>
                  </div>
                  <div className="card-body">
                    {docs.map(d=>(
                      <div className="doc-row" key={d.name}>
                        <div className="doc-ic">📄</div>
                        <div className="doc-name">{d.name}</div>
                        <span className="doc-sec">{d.section}</span>
                        <span className={d.uploaded?"doc-ok":"doc-miss"}>{d.uploaded?"✓ Uploaded":"⚠ Missing"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right col */}
              <div style={{display:"flex",flexDirection:"column",gap:12}}>

                {/* Consent requests */}
                <div className="card">
                  <div className="card-hd">
                    <div className="card-title">Consent requests</div>
                    <div className="card-action" onClick={()=>router.push("/consent")}>View all →</div>
                  </div>
                  <div className="card-body">
                    {loading && <div className="empty">Loading…</div>}
                    {!loading && consents.length===0 && (
                      <div className="empty">No consent requests yet.<br/>Employers will appear here.</div>
                    )}
                    {!isSubmitted && consents.length>0 && (
                      <div className="blocker">⚠ Complete and submit all 4 sections before approving requests.</div>
                    )}
                    {pending.slice(0,2).map(c=>(
                      <div className="consent-card pending" key={gcid(c)}>
                        <div className="cc-top">
                          <div><div className="cc-company">{c.employer_name||c.employer_email}</div><div className="cc-date">Requested {fmt(c.created_at)}</div></div>
                          <span className="cc-badge b-pending">Pending</span>
                        </div>
                        {c.request_message && <div className="cc-msg">"{c.request_message}"</div>}
                        <div className="cc-actions">
                          <button className="btn-approve" onClick={()=>respond(gcid(c),"approve")} disabled={!!acting||!isSubmitted}>
                            {acting===gcid(c)?"…":"✓ Approve"}
                          </button>
                          <button className="btn-decline" onClick={()=>respond(gcid(c),"decline")} disabled={!!acting||!isSubmitted}>
                            {acting===gcid(c)?"…":"✕ Decline"}
                          </button>
                        </div>
                      </div>
                    ))}
                    {approved.slice(0,2).map(c=>(
                      <div className="consent-card approved" key={gcid(c)}>
                        <div className="cc-top">
                          <div><div className="cc-company">{c.employer_name||c.employer_email}</div><div className="cc-date">Approved {fmt(c.responded_at||c.approved_at||c.updated_at)}</div></div>
                          <span className="cc-badge b-approved">Approved</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent activity */}
                <div className="card">
                  <div className="card-hd">
                    <div className="card-title">Recent activity</div>
                  </div>
                  <div className="card-body">
                    {consents.length===0 && <div className="empty">No recent activity.</div>}
                    {pending.slice(0,2).map(c=>(
                      <div className="feed-row" key={`p-${gcid(c)}`}>
                        <div className="fdot" style={{background:"#d97706"}}/>
                        <div className="ftext">New consent request from <b>{c.employer_name||c.employer_email}</b></div>
                        <span className="ftime">{fmt(c.created_at)}</span>
                      </div>
                    ))}
                    {approved.slice(0,2).map(c=>(
                      <div className="feed-row" key={`a-${gcid(c)}`}>
                        <div className="fdot" style={{background:"#0d6e6e"}}/>
                        <div className="ftext">You approved access for <b>{c.employer_name||c.employer_email}</b></div>
                        <span className="ftime">{fmt(c.responded_at||c.approved_at)}</span>
                      </div>
                    ))}
                    {consents.filter(c=>c.status==="declined").slice(0,1).map(c=>(
                      <div className="feed-row" key={`d-${gcid(c)}`}>
                        <div className="fdot" style={{background:"#dc2626"}}/>
                        <div className="ftext">You declined request from <b>{c.employer_name||c.employer_email}</b></div>
                        <span className="ftime">{fmt(c.responded_at)}</span>
                      </div>
                    ))}
                    <div className="feed-row">
                      <div className="fdot" style={{background:"#2563eb"}}/>
                      <div className="ftext">Profile viewed by employer after approval</div>
                      <span className="ftime">—</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}