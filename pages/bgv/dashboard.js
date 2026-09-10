// pages/bgv/dashboard.js
import { useState, useEffect, useRef, useCallback } from "react";
import PasswordInput from "../../components/PasswordInput";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const BGV_LIFECYCLE = {
  groomed:     {label:"Assigned",    color:"#6366f1",bg:"#eef2ff"},
  in_progress: {label:"In Progress", color:"#d97706",bg:"#fffbeb"},
  on_hold:     {label:"On Hold",     color:"#dc2626",bg:"#fef2f2"},
  completed:   {label:"Completed",   color:"#16a34a",bg:"#f0fdf4"},
};
const RESULT_FLAG = {
  green:{label:"Clear",        color:"#16a34a",bg:"#f0fdf4"},
  amber:{label:"Minor Issues", color:"#d97706",bg:"#fffbeb"},
  red:  {label:"Discrepancy",  color:"#dc2626",bg:"#fef2f2"},
};
const CHECK_STATUS = {
  pending:        { label:"Pending",        color:"#94a3b8", bg:"#f1f5f9" },
  in_progress:    { label:"In Progress",    color:"#3b82f6", bg:"#eff6ff" },
  verified:       { label:"Verified ✓",     color:"#16a34a", bg:"#f0fdf4" },
  failed:         { label:"Discrepancy ✗",  color:"#ef4444", bg:"#fef2f2" },
  on_hold:        { label:"On Hold",        color:"#f59e0b", bg:"#fffbeb" },
  not_applicable: { label:"N/A",            color:"#64748b", bg:"#f8fafc" },
};

const BGV_STATUS_BADGE = {
  // BUG FIX (2026-09-09): the backend's actual status vocabulary is groomed/in_progress/
  // on_hold/completed (confirmed directly in _bgv_overall_status and /bgv/assign) — this
  // object only ever had "assigned", a value the backend never actually sets. Every fresh
  // case (bgv_status === "groomed") and every on_hold case were silently falling back to
  // an "Assigned" badge, which is misleading either way.
  groomed:     { label:"Not Started", color:"#6366f1", bg:"#eef2ff" },
  in_progress: { label:"In Progress", color:"#3b82f6", bg:"#eff6ff" },
  on_hold:     { label:"On Hold",     color:"#dc2626", bg:"#fef2f2" },
  discrepancy: { label:"Discrepancy", color:"#ef4444", bg:"#fef2f2" },
  completed:   { label:"Completed",   color:"#16a34a", bg:"#f0fdf4" },
};

const OVERALL_STATUS = {
  clear:        { label:"CLEAR",       color:"#16a34a" },
  discrepancy:  { label:"DISCREPANCY", color:"#f59e0b" },
  failed:       { label:"FAILED",      color:"#ef4444" },
  refer:        { label:"REFER",       color:"#3b82f6" },
};

const G = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{background:#f0ece6;font-family:'DM Sans',sans-serif;}
  .pg{min-height:100vh;background:#f0ece6;padding-bottom:3rem;}
  .topbar{background:#0f172a;padding:0.85rem 1.75rem;display:flex;justify-content:space-between;align-items:center;margin-bottom:1.75rem;position:sticky;top:0;z-index:50;box-shadow:0 4px 20px rgba(0,0,0,0.4);}
  .logo-text{font-size:1.3rem;font-weight:800;color:#4f46e5;letter-spacing:-0.5px;}
  .logo-badge{font-size:0.6rem;font-weight:700;color:#94a3b8;letter-spacing:1.5px;text-transform:uppercase;margin-left:0.5rem;}
  .topbar-right{display:flex;align-items:center;gap:0.75rem;}
  .user-name{font-size:0.84rem;color:#94a3b8;font-weight:500;}
  .signout-btn{padding:0.38rem 1rem;border:1.5px solid #334155;border-radius:8px;background:transparent;color:#94a3b8;font-size:0.82rem;cursor:pointer;font-weight:600;font-family:inherit;transition:all 0.2s;}
  .signout-btn:hover{border-color:#ef4444;color:#ef4444;}
  .wrap{max-width:1100px;margin:auto;padding:0 1.25rem;}
  .tabs{display:flex;gap:0.25rem;background:#fff;border-radius:12px;padding:0.35rem;margin-bottom:1.5rem;box-shadow:0 2px 8px rgba(30,26,62,0.08);}
  .tab{flex:1;padding:0.6rem 1rem;border:none;background:transparent;border-radius:9px;font-family:inherit;font-size:0.84rem;font-weight:600;cursor:pointer;color:#64748b;transition:all 0.18s;}
  .tab.active{background:#4f46e5;color:#fff;box-shadow:0 2px 8px rgba(79,70,229,0.3);}
  .stat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:0.85rem;margin-bottom:1.25rem;}
  .stat-card{background:#fff;border-radius:12px;padding:1rem 1.2rem;box-shadow:0 2px 8px rgba(30,26,62,0.08);}
  .stat-num{font-size:1.75rem;font-weight:800;color:#0f172a;}
  .stat-lbl{font-size:0.72rem;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;margin-top:0.15rem;}
  .cases-table{background:#fff;border-radius:14px;box-shadow:0 2px 8px rgba(30,26,62,0.08);overflow:hidden;}
  .tbl-head{display:grid;grid-template-columns:2fr 1.5fr 1.2fr 1fr 1fr 0.8fr;gap:0;padding:0.75rem 1.25rem;background:#f8fafc;border-bottom:1px solid #e8ecf2;}
  .tbl-th{font-size:0.68rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;}
  .tbl-row{display:grid;grid-template-columns:2fr 1.5fr 1.2fr 1fr 1fr 0.8fr;gap:0;padding:0.9rem 1.25rem;border-bottom:1px solid #f1f5f9;align-items:center;transition:background 0.15s;cursor:pointer;}
  .tbl-row:hover{background:#f8fafc;}
  .tbl-row.selected{background:#eef2ff;border-left:3px solid #4f46e5;}
  .tbl-row:last-child{border-bottom:none;}
  .td-primary{font-size:0.875rem;font-weight:700;color:#0f172a;}
  .td-secondary{font-size:0.78rem;color:#64748b;font-weight:500;}
  .badge{display:inline-block;padding:0.2rem 0.6rem;border-radius:999px;font-size:0.68rem;font-weight:700;}
  .progress-bar{height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden;margin-top:0.3rem;}
  .progress-fill{height:100%;background:#4f46e5;border-radius:3px;transition:width 0.3s;}
  .case-detail{background:#fff;border-radius:14px;margin-top:1rem;box-shadow:0 2px 8px rgba(30,26,62,0.08);overflow:hidden;}
  .case-detail-header{background:#1e1b4b;padding:1.1rem 1.5rem;display:flex;justify-content:space-between;align-items:center;}
  .case-title{font-size:1rem;font-weight:800;color:#fff;}
  .case-subtitle{font-size:0.78rem;color:#a5b4fc;margin-top:0.15rem;}
  .case-body{display:flex;flex-direction:column;gap:1.5rem;}
  .profile-panel{padding:1.25rem;}
  .checks-panel{padding:1.25rem;}
  .panel-title{font-size:0.72rem;font-weight:800;color:#4f46e5;text-transform:uppercase;letter-spacing:1px;margin-bottom:1rem;}
  .profile-kv{display:flex;flex-direction:column;gap:0.12rem;margin-bottom:0.75rem;}
  .profile-key{font-size:0.67rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;}
  .profile-val{font-size:0.84rem;font-weight:600;color:#0f172a;}
  .check-row{display:grid;grid-template-columns:1.8fr 1fr 0.9fr 0.7fr;gap:0.5rem;align-items:start;padding:0.7rem 0;border-bottom:1px solid #f1f5f9;}
  .check-row:last-child{border-bottom:none;}
  .check-label{font-size:0.8rem;font-weight:600;color:#0f172a;}
  .check-type-tag{font-size:0.64rem;color:#94a3b8;margin-top:0.12rem;}
  .check-select{width:100%;padding:0.35rem 0.5rem;border:1.5px solid #e2e8f0;border-radius:7px;font-family:inherit;font-size:0.75rem;font-weight:600;cursor:pointer;outline:none;transition:border-color 0.18s;}
  .check-select:focus{border-color:#4f46e5;}
  .upload-btn{padding:0.28rem 0.65rem;background:#eef2ff;color:#4f46e5;border:1.5px solid #c7d2fe;border-radius:6px;font-size:0.7rem;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;}
  .upload-btn:hover{background:#e0e7ff;}
  .view-btn{padding:0.28rem 0.65rem;background:#f0fdf4;color:#16a34a;border:1.5px solid #bbf7d0;border-radius:6px;font-size:0.7rem;font-weight:700;cursor:pointer;font-family:inherit;}
  .notes-input{width:100%;padding:0.35rem 0.5rem;border:1.5px solid #e2e8f0;border-radius:7px;font-family:inherit;font-size:0.75rem;resize:none;outline:none;min-height:46px;}
  .notes-input:focus{border-color:#4f46e5;}
  .report-section{padding:1.25rem;border-top:1px solid #f1f5f9;background:#fafafa;}
  .report-title{font-size:0.8rem;font-weight:700;color:#0f172a;margin-bottom:0.75rem;}
  .report-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.75rem;}
  .fi{display:flex;flex-direction:column;gap:0.25rem;}
  .fl{font-size:0.68rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;}
  .in{padding:0.55rem 0.75rem;border:1.5px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:0.82rem;color:#0f172a;outline:none;width:100%;background:#fff;}
  .in:focus{border-color:#4f46e5;}
  .submit-btn{padding:0.65rem 1.5rem;background:#4f46e5;color:#fff;border:none;border-radius:9px;font-family:inherit;font-size:0.875rem;font-weight:700;cursor:pointer;transition:all 0.2s;}
  .submit-btn:hover{background:#4338ca;}
  .submit-btn:disabled{opacity:0.5;cursor:not-allowed;}
  .msg-thread{display:flex;flex-direction:column;gap:0.65rem;padding:1rem;max-height:380px;overflow-y:auto;}
  .msg-bubble{max-width:80%;padding:0.7rem 0.9rem;border-radius:12px;font-size:0.82rem;line-height:1.6;}
  .msg-bubble.mine{align-self:flex-end;background:#4f46e5;color:#fff;border-bottom-right-radius:3px;}
  .msg-bubble.theirs{align-self:flex-start;background:#f1f5f9;color:#0f172a;border-bottom-left-radius:3px;}
  .msg-meta{font-size:0.65rem;margin-top:0.3rem;opacity:0.7;}
  .msg-input-row{display:flex;gap:0.5rem;padding:0.75rem 1rem;border-top:1px solid #f1f5f9;background:#fafafa;}
  .msg-textarea{flex:1;padding:0.6rem 0.85rem;border:1.5px solid #e2e8f0;border-radius:9px;font-family:inherit;font-size:0.84rem;resize:none;outline:none;min-height:42px;}
  .msg-textarea:focus{border-color:#4f46e5;}
  .msg-send-btn{padding:0.6rem 1.1rem;background:#4f46e5;color:#fff;border:none;border-radius:9px;font-family:inherit;font-size:0.82rem;font-weight:700;cursor:pointer;}
  .recipient-sel{padding:0.4rem 0.6rem;border:1.5px solid #e2e8f0;border-radius:8px;font-family:inherit;font-size:0.75rem;outline:none;background:#fff;}
  .inbox-thread{padding:0.9rem 1.25rem;border-bottom:1px solid #f1f5f9;cursor:pointer;transition:background 0.15s;}
  .inbox-thread:hover{background:#f8fafc;}
  .inbox-thread.active{background:#eef2ff;border-left:3px solid #4f46e5;}
  .unread-dot{width:8px;height:8px;background:#4f46e5;border-radius:50%;flex-shrink:0;}
  .empty-state{padding:3rem;text-align:center;color:#94a3b8;font-size:0.875rem;font-weight:500;}
  @media(max-width:768px){.case-body{grid-template-columns:1fr;}.stat-row{grid-template-columns:repeat(2,1fr);}.tbl-head,.tbl-row{grid-template-columns:2fr 1fr 1fr;}.tbl-th:nth-child(n+4),.tbl-row>*:nth-child(n+4){display:none;}}
`;

function isoDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
}

function SupportModal({ apiFetch, onClose }) {
  const CATS = ["account","consent","document","bgv","billing","other"];
  const [tab,     setTab]     = useState("new");   // "new" | "tickets"
  const [cat,     setCat]     = useState("account");
  const [subject, setSubject] = useState("");
  const [body,    setBody]    = useState("");
  const [busy,    setBusy]    = useState(false);
  const [ok,      setOk]      = useState("");
  const [err,     setErr]     = useState("");
  const [tickets, setTickets] = useState([]);
  const [expandedTicket, setExpandedTicket] = useState("");
  const [tLoading,setTLoading]= useState(false);
  const [attachmentKey, setAttachmentKey] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [uploadingAtt, setUploadingAtt] = useState(false);
  const [attErr, setAttErr] = useState("");

  const [replyText, setReplyText] = useState("");
  const [replyAttKey, setReplyAttKey] = useState("");
  const [replyAttName, setReplyAttName] = useState("");
  const [replyUploadingAtt, setReplyUploadingAtt] = useState(false);
  const [replySending, setReplySending] = useState(false);
  const [replyErr, setReplyErr] = useState("");

  const handleReplyAttachmentSelect = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setReplyErr("File must be under 10MB"); return; }
    setReplyUploadingAtt(true); setReplyErr("");
    try {
      const r = await apiFetch(`${API}/support/tickets/upload-url`, {
        method: "POST",
        body: JSON.stringify({ filename: file.name }),
      });
      const d = await r.json();
      if (!r.ok) { setReplyErr(d.detail || "Could not prepare upload"); setReplyUploadingAtt(false); return; }
      const putRes = await fetch(d.upload_url, { method: "PUT", body: file, headers: { "Content-Type": file.type || "application/octet-stream" } });
      if (!putRes.ok) { setReplyErr("Upload failed — please try again"); setReplyUploadingAtt(false); return; }
      setReplyAttKey(d.s3_key);
      setReplyAttName(file.name);
    } catch (_) { setReplyErr("Network error — please try again"); }
    setReplyUploadingAtt(false);
  };

  const submitReply = async (ticketId) => {
    if (!replyText.trim()) return;
    setReplySending(true); setReplyErr("");
    try {
      const r = await apiFetch(`${API}/support/tickets/reply`, {
        method: "POST",
        body: JSON.stringify({ ticket_id: ticketId, body: replyText.trim(), attachment_key: replyAttKey }),
      });
      const d = await r.json();
      if (!r.ok) { setReplyErr(d.detail || "Failed to send reply"); setReplySending(false); return; }
      setReplyText(""); setReplyAttKey(""); setReplyAttName("");
      await loadTickets();
    } catch (_) { setReplyErr("Network error — please try again"); }
    setReplySending(false);
  };


  const handleAttachmentSelect = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setAttErr("File must be under 10MB"); return; }
    setUploadingAtt(true); setAttErr("");
    try {
      const r = await apiFetch(`${API}/support/tickets/upload-url`, {
        method: "POST",
        body: JSON.stringify({ filename: file.name }),
      });
      const d = await r.json();
      if (!r.ok) { setAttErr(d.detail || "Could not prepare upload"); setUploadingAtt(false); return; }
      const putRes = await fetch(d.upload_url, { method: "PUT", body: file, headers: { "Content-Type": file.type || "application/octet-stream" } });
      if (!putRes.ok) { setAttErr("Upload failed — please try again"); setUploadingAtt(false); return; }
      setAttachmentKey(d.s3_key);
      setAttachmentName(file.name);
    } catch (_) { setAttErr("Network error — please try again"); }
    setUploadingAtt(false);
  };

  const loadTickets = async () => {
    setTLoading(true);
    try {
      const r = await apiFetch(`${API}/support/tickets`);
      if (r.ok) setTickets(await r.json());
    } catch(_) {}
    setTLoading(false);
  };

  // Auto-refresh while actually viewing the tickets list — without this, a status
  // change or reply from admin would sit invisible on an already-open tab until
  // the person manually navigated away and back, which looked exactly like the
  // close button silently not working even though the backend was correct.
  useEffect(() => {
    if (tab !== "tickets") return;
    const id = setInterval(loadTickets, 15000);
    return () => clearInterval(id);
  }, [tab]);

  const submit = async () => {
    if (!subject.trim() || !body.trim()) { setErr("Subject and message are required"); return; }
    setBusy(true); setErr("");
    try {
      const r = await apiFetch(`${API}/support/tickets`, {
        method: "POST",
        body: JSON.stringify({ category: cat, subject: subject.trim(), body: body.trim(), attachment_key: attachmentKey }),
      });
      const d = await r.json();
      if (!r.ok) { setErr(d.detail || "Failed to submit"); setBusy(false); return; }
      setOk("✅ Ticket submitted! We'll get back to you within 2 business days.");
      setSubject(""); setBody(""); setCat("account"); setAttachmentKey(""); setAttachmentName("");
      setTimeout(() => { setOk(""); setTab("tickets"); loadTickets(); }, 1800);
    } catch(_) { setErr("Network error — please try again"); }
    setBusy(false);
  };

  const statusColor = { open:"#f59e0b", in_progress:"#3b82f6", resolved:"#16a34a", closed:"#334155" };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,12,40,0.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3000,backdropFilter:"blur(4px)"}}>
      <div style={{background:"#fff",borderRadius:18,padding:"1.75rem",maxWidth:460,width:"92%",maxHeight:"85vh",overflow:"auto",boxShadow:"0 24px 60px rgba(15,12,40,0.3)"}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.1rem"}}>
          <div>
            <div style={{fontWeight:800,fontSize:"1rem",color:"#1a1730"}}>🎧 Help & Support</div>
            <div style={{fontSize:"0.7rem",color:"#8b88b0",marginTop:2}}>Datagate support team · usually replies in 1–2 days</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:"1.2rem",cursor:"pointer",color:"#8b88b0",lineHeight:1}}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",borderBottom:"2px solid #ebe9f5",marginBottom:"1.1rem"}}>
          {[["new","✍️ New Ticket"],["tickets","📋 My Tickets"]].map(([k,l])=>(
            <button key={k} onClick={()=>{setTab(k);if(k==="tickets")loadTickets();}}
              style={{padding:"0.45rem 0.9rem",background:"none",border:"none",borderBottom:`2.5px solid ${tab===k?"#0d6e6e":"transparent"}`,marginBottom:-2,cursor:"pointer",fontFamily:"inherit",fontSize:"0.75rem",fontWeight:700,color:tab===k?"#0d6e6e":"#94a3b8"}}>
              {l}
            </button>
          ))}
        </div>

        {tab === "new" ? (
          <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
            {/* Category */}
            <div>
              <div style={{fontSize:"0.65rem",fontWeight:700,color:"#8b88b0",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.35rem"}}>Category</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
                {CATS.map(c=>(
                  <button key={c} onClick={()=>setCat(c)}
                    style={{padding:"0.3rem 0.75rem",borderRadius:999,border:`1.5px solid ${cat===c?"#0d6e6e":"#ddd8f5"}`,background:cat===c?"#0d6e6e":"#f8f7ff",color:cat===c?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.72rem",fontWeight:600,fontFamily:"inherit",transition:"all 0.12s",textTransform:"capitalize"}}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div>
              <div style={{fontSize:"0.65rem",fontWeight:700,color:"#8b88b0",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.35rem"}}>Subject <span style={{color:"#ef4444"}}>*</span></div>
              <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Brief summary of your issue"
                style={{width:"100%",padding:"0.6rem 0.875rem",background:"#f8f7ff",border:"1.5px solid #ddd8f5",borderRadius:9,fontFamily:"inherit",fontSize:"0.84rem",color:"#1a1730",outline:"none"}}/>
            </div>

            {/* Body */}
            <div>
              <div style={{fontSize:"0.65rem",fontWeight:700,color:"#8b88b0",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.35rem"}}>Message <span style={{color:"#ef4444"}}>*</span></div>
              <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Describe your issue in detail…" rows={5}
                style={{width:"100%",padding:"0.6rem 0.875rem",background:"#f8f7ff",border:"1.5px solid #ddd8f5",borderRadius:9,fontFamily:"inherit",fontSize:"0.84rem",color:"#1a1730",outline:"none",resize:"vertical"}}/>
            </div>

            <div>
              <div style={{fontSize:"0.65rem",fontWeight:700,color:"#8b88b0",textTransform:"uppercase",letterSpacing:0.5,marginBottom:"0.35rem"}}>Attachment (optional)</div>
              {!attachmentKey ? (
                <label style={{display:"flex",alignItems:"center",gap:"0.5rem",padding:"0.6rem 0.875rem",background:"#f8f7ff",border:"1.5px dashed #ddd8f5",borderRadius:9,cursor:uploadingAtt?"not-allowed":"pointer",fontSize:"0.78rem",color:"#6b6894",fontWeight:600}}>
                  📎 {uploadingAtt ? "Uploading…" : "Attach a screenshot or document (max 10MB)"}
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" disabled={uploadingAtt} style={{display:"none"}} onChange={e=>handleAttachmentSelect(e.target.files?.[0])}/>
                </label>
              ) : (
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.55rem 0.875rem",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:9,fontSize:"0.78rem",color:"#16a34a",fontWeight:600}}>
                  <span>📎 {attachmentName || "Attached"}</span>
                  <button type="button" onClick={()=>{setAttachmentKey("");setAttachmentName("");}} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:"0.78rem",fontWeight:700}}>Remove</button>
                </div>
              )}
              {attErr && <div style={{fontSize:"0.7rem",color:"#ef4444",fontWeight:600,marginTop:"0.3rem"}}>{attErr}</div>}
            </div>

            {err && <div style={{fontSize:"0.72rem",color:"#ef4444",fontWeight:600}}>{err}</div>}
            {ok  && <div style={{fontSize:"0.72rem",color:"#16a34a",fontWeight:600,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,padding:"0.5rem 0.75rem"}}>{ok}</div>}

            <button onClick={submit} disabled={busy || uploadingAtt}
              style={{padding:"0.7rem",background:"#0d6e6e",color:"#fff",border:"none",borderRadius:10,fontFamily:"inherit",fontSize:"0.875rem",fontWeight:700,cursor:(busy||uploadingAtt)?"not-allowed":"pointer",opacity:(busy||uploadingAtt)?0.6:1,transition:"all 0.15s"}}>
              {busy?"Submitting…":"Submit Ticket"}
            </button>
          </div>
        ) : (
          <div>
            {tLoading && <div style={{textAlign:"center",padding:"2rem",fontSize:"0.8rem",color:"#94a3b8"}}>Loading…</div>}
            {!tLoading && tickets.length === 0 && (
              <div style={{textAlign:"center",padding:"2.5rem 1rem"}}>
                <div style={{fontSize:32,opacity:0.2,marginBottom:"0.5rem"}}>🎫</div>
                <div style={{fontSize:"0.8rem",color:"#94a3b8"}}>No tickets yet</div>
              </div>
            )}
            {tickets.map(t=>{
              const isOpen = expandedTicket === t.ticket_id;
              return (
              <div key={t.ticket_id} style={{border:"1px solid #ebe9f5",borderRadius:10,padding:"0.85rem 1rem",marginBottom:"0.6rem",cursor:"pointer"}}
                onClick={()=>setExpandedTicket(isOpen?"":t.ticket_id)}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.35rem"}}>
                  <div style={{fontWeight:700,fontSize:"0.84rem",color:"#1a1730",flex:1,paddingRight:"0.5rem"}}>{t.subject}</div>
                  <span style={{fontSize:"0.65rem",fontWeight:700,color:statusColor[t.status]||"#94a3b8",background:`${statusColor[t.status]||"#94a3b8"}15`,padding:"2px 8px",borderRadius:999,whiteSpace:"nowrap",textTransform:"capitalize"}}>{t.status?.replace("_"," ")}</span>
                </div>
                <div style={{display:"flex",gap:"0.5rem",fontSize:"0.65rem",color:"#94a3b8"}}>
                  <span style={{background:"#f0ece6",padding:"1px 7px",borderRadius:999,textTransform:"capitalize"}}>{t.category}</span>
                  <span>{new Date(t.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
                </div>
                {t.replies?.length > 0 && (
                  <div style={{marginTop:"0.5rem",fontSize:"0.72rem",color:"#0d6e6e",fontWeight:600}}>💬 {t.replies.length} repl{t.replies.length===1?"y":"ies"} — {isOpen?"tap to collapse":"tap to view"}</div>
                )}
                {!t.replies?.length && <div style={{marginTop:"0.5rem",fontSize:"0.7rem",color:"#94a3b8"}}>{isOpen?"tap to collapse":"tap to view your message"}</div>}
                {isOpen && (
                  <div style={{marginTop:"0.7rem",paddingTop:"0.7rem",borderTop:"1px solid #f0eef8"}}>
                    <div style={{background:"#f8f7ff",borderRadius:8,padding:"0.6rem 0.75rem",marginBottom:"0.5rem"}}>
                      <div style={{fontSize:"0.65rem",fontWeight:700,color:"#6b6894",marginBottom:"0.25rem"}}>You wrote:</div>
                      <div style={{fontSize:"0.8rem",color:"#1a1730",whiteSpace:"pre-wrap"}}>{t.body}</div>
                      {t.attachment_url && <a href={t.attachment_url} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",marginTop:"0.4rem",fontSize:"0.72rem",color:"#0d6e6e",fontWeight:700,textDecoration:"none"}}>📎 View attachment</a>}
                    </div>
                    {(t.replies||[]).map((r,i)=>(
                      <div key={i} style={r.by==="admin"?{background:"#f0fdf4",borderRadius:8,padding:"0.6rem 0.75rem",marginBottom:"0.5rem"}:{background:"#f8f7ff",borderRadius:8,padding:"0.6rem 0.75rem",marginBottom:"0.5rem"}}>
                        <div style={{fontSize:"0.65rem",fontWeight:700,color:r.by==="admin"?"#16a34a":"#6b6894",marginBottom:"0.25rem"}}>{r.by==="admin"?"Datagate Support":"You"} — {new Date(r.at).toLocaleString("en-IN",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
                        <div style={{fontSize:"0.8rem",color:"#1a1730",whiteSpace:"pre-wrap"}}>{r.body}</div>
                        {r.attachment_url && <a href={r.attachment_url} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",marginTop:"0.4rem",fontSize:"0.72rem",color:r.by==="admin"?"#16a34a":"#0d6e6e",fontWeight:700,textDecoration:"none"}}>📎 View attachment</a>}
                      </div>
                    ))}
                    {t.status!=="closed" ? (
                      <div style={{marginTop:"0.6rem",paddingTop:"0.6rem",borderTop:"1px solid #f0eef8"}} onClick={e=>e.stopPropagation()}>
                        <textarea value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="Type a reply…" rows={3}
                          style={{width:"100%",padding:"0.5rem 0.7rem",background:"#faf9ff",border:"1.5px solid #ddd8f5",borderRadius:8,fontFamily:"inherit",fontSize:"0.78rem",color:"#1a1730",outline:"none",resize:"vertical"}}/>
                        <div style={{marginTop:"0.4rem",display:"flex",alignItems:"center",gap:"0.5rem",flexWrap:"wrap"}}>
                          {!replyAttKey ? (
                            <label style={{display:"inline-flex",alignItems:"center",gap:"0.35rem",padding:"0.35rem 0.6rem",background:"#f8f7ff",border:"1.5px dashed #ddd8f5",borderRadius:7,cursor:replyUploadingAtt?"not-allowed":"pointer",fontSize:"0.68rem",color:"#6b6894",fontWeight:600}}>
                              📎 {replyUploadingAtt ? "Uploading…" : "Attach"}
                              <input type="file" accept=".pdf,.jpg,.jpeg,.png" disabled={replyUploadingAtt} style={{display:"none"}} onChange={e=>handleReplyAttachmentSelect(e.target.files?.[0])}/>
                            </label>
                          ) : (
                            <div style={{display:"inline-flex",alignItems:"center",gap:"0.4rem",padding:"0.3rem 0.6rem",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:7,fontSize:"0.68rem",color:"#16a34a",fontWeight:600}}>
                              📎 {replyAttName}
                              <button type="button" onClick={()=>{setReplyAttKey("");setReplyAttName("");}} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:"0.68rem",fontWeight:700}}>✕</button>
                            </div>
                          )}
                          <button onClick={()=>submitReply(t.ticket_id)} disabled={replySending || replyUploadingAtt || !replyText.trim()}
                            style={{marginLeft:"auto",padding:"0.4rem 0.9rem",background:"#0d6e6e",color:"#fff",border:"none",borderRadius:7,fontFamily:"inherit",fontSize:"0.72rem",fontWeight:700,cursor:(replySending||replyUploadingAtt||!replyText.trim())?"not-allowed":"pointer",opacity:(replySending||replyUploadingAtt||!replyText.trim())?0.5:1}}>
                            {replySending?"Sending…":"Send Reply"}
                          </button>
                        </div>
                        {replyErr && <div style={{fontSize:"0.68rem",color:"#ef4444",fontWeight:600,marginTop:"0.3rem"}}>{replyErr}</div>}
                      </div>
                    ) : (
                      <div style={{marginTop:"0.5rem",fontSize:"0.7rem",color:"#94a3b8",fontStyle:"italic"}}>This ticket is closed. Raise a new ticket if you need further help.</div>
                    )}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BgvDashboard() {
  const router = useRouter();
  const { user, apiFetch, logout, ready } = useAuth();
  const handleSignoutAll = async () => {
    try { await apiFetch(`${API}/auth/logout-all`, { method: "POST" }); } catch (_) {}
    logout();
    router.replace("/bgv/login");
  };

  const [tab, setTab]             = useState("cases");
  const [holdMsg,     setHoldMsg]    = useState("");
  const [holdSending, setHoldSending]= useState(false);
  const [holdResult,  setHoldResult] = useState("");
  const [cases, setCases]         = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [caseFilter, setCaseFilter] = useState(null); // null = all, else a bgv_status value
  const [selectedEmployer, setSelectedEmployer] = useState(null); // requestor_email, for the employer-wise report drill-down
  const [caseDetail, setCaseDetail] = useState(null);
  const [caseDocs, setCaseDocs] = useState({});
  const docLink = (group, subKey) => {
    const doc = caseDocs?.[group]?.[subKey];
    if (!doc?.url) return null;
    return <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{marginLeft:6,fontSize:"0.68rem",color:"#0d6e6e",fontWeight:700,textDecoration:"none",whiteSpace:"nowrap"}}>📎 View</a>;
  };
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Messaging
  const [inbox, setInbox]         = useState([]);
  const [inboxSearch, setInboxSearch] = useState("");
  const [activeThread, setActiveThread] = useState(null);
  const [threadMsgs, setThreadMsgs] = useState([]);
  const [threadSegments, setThreadSegments] = useState({});
  const msgListRef = useRef(null);
  useEffect(() => {
    if (msgListRef.current) msgListRef.current.scrollTop = msgListRef.current.scrollHeight;
  }, [threadMsgs]);
  const [msgBody, setMsgBody]     = useState("");
  const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const setMention = (token, otherTokens) => {
    setMsgBody(b => {
      let cleaned = b;
      [token, ...otherTokens].forEach(t => { if (t) cleaned = cleaned.replace(new RegExp(`@${escRe(t)}\\s*`, "gi"), ""); });
      return `@${token} ${cleaned}`;
    });
  };
  // @employeeName → candidate, employer CC'd. @employerName → employer only, private.
  // Previously an untagged message silently defaulted to "employee" — now returns null
  // when neither name is tagged, and sendMsg blocks the send instead of guessing.
  const detectRecipientBgv = (text) => {
    const t = inbox.find(x=>x.consent_id===activeThread);
    const employeeName = t?.employee_name || t?.candidate_name || "";
    const employerName = t?.employer_name || "";
    const body = text||"";
    if (employerName && body.includes(`@${employerName}`)) return "employer";
    if (employeeName && body.includes(`@${employeeName}`)) return "employee";
    return null;
  };
  const recipientLabelBgv = (rt) => rt==="employer" ? "→ Employer only (private)" : "→ Candidate (Employer will also see this)";
  const [msgSubject, setMsgSubject] = useState("");
  const [msgAttach, setMsgAttach] = useState(null);
  const [msgAttaching, setMsgAttaching] = useState(false);
  const [msgAttachUrls, setMsgAttachUrls] = useState({});
  const [showNewMsg, setShowNewMsg] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showGear,    setShowGear]    = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail,       setNewEmail]       = useState("");
  const [emailOtp,       setEmailOtp]       = useState("");
  const [emailOtpSent,   setEmailOtpSent]   = useState(false);
  const [emailChangeMsg, setEmailChangeMsg] = useState("");
  const [emailChangeErr, setEmailChangeErr] = useState("");
  const [emailChangeLod, setEmailChangeLod] = useState(false);
  const [emailChangeSubmitted, setEmailChangeSubmitted] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [pwCurrent,   setPwCurrent]   = useState("");
  const [pwNew,       setPwNew]       = useState("");
  const [pwConfirm,   setPwConfirm]   = useState("");
  const [pwErr,       setPwErr]       = useState("");
  const [pwOk,        setPwOk]        = useState("");
  const [pwBusy,      setPwBusy]      = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgErr, setMsgErr] = useState("");

  // Check update
  const [savingCheck, setSavingCheck] = useState({});
  const [localChecks, setLocalChecks] = useState([]);
  const uploadInputRef = useRef({});

  // Report submission
  const [reportFile, setReportFile]     = useState(null);
  const [reportSummary, setReportSummary] = useState("");
  const [reportVerdict, setReportVerdict] = useState("clear");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportDone, setReportDone]     = useState(false);
  const [saveStatus, setSaveStatus]     = useState("");

  // Role guard
  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/bgv/login"); return; }
    if (user.role !== "bgv") { router.replace("/bgv/login"); return; }
  }, [ready, user, router]);

  // Load cases
  useEffect(() => {
    if (!ready || !user) return;
    const load = async () => {
      try {
        const res = await apiFetch(`${API}/bgv/cases`);
        if (res.ok) setCases(await res.json());
      } catch(_) {}
      setLoadingCases(false);
    };
    load();
  }, [ready, user, apiFetch]);

  // Poll unread message count regardless of active tab
  useEffect(() => {
    if (!ready || !user) return;
    const loadUnread = async () => {
      try {
        const res = await apiFetch(`${API}/messages/unread-count`);
        if (res.ok) { const d = await res.json(); setUnreadCount(d.unread || 0); }
      } catch(_) {}
    };
    loadUnread();
    const id = setInterval(loadUnread, 30000);
    return () => clearInterval(id);
  }, [ready, user, apiFetch]);

  // Load inbox
  useEffect(() => {
    if (!ready || !user || tab !== "inbox") return;
    const load = async () => {
      try {
        const res = await apiFetch(`${API}/messages/inbox`);
        if (res.ok) setInbox(await res.json());
      } catch(_) {}
    };
    load();
  }, [ready, user, apiFetch, tab]);

  const loadCaseDetail = useCallback(async (consentId) => {
    setLoadingDetail(true); setReportDone(false); setSaveStatus("");
    try {
      const res = await apiFetch(`${API}/bgv/case/${consentId}`);
      if (res.ok) {
        const d = await res.json();
        setCaseDetail(d);
        setLocalChecks(_copy(d.bgv_checks || []));
        if (d.bgv_overall_status) setReportVerdict(d.bgv_overall_status);
        if (d.bgv_summary) setReportSummary(d.bgv_summary);
        if (d.bgv_report_key) setReportDone(true);
        // Fetch every document once, up front — this is what lets every field
        // show its own attachment link inline, right where it's relevant,
        // instead of one generic "view all" button someone has to remember
        // to click separately for every section.
        if (d.employee_id) {
          try {
            const docRes = await apiFetch(`${API}/documents/${d.employee_id}`);
            if (docRes.ok) setCaseDocs((await docRes.json()).documents || {});
          } catch(_) {}
        }
      }
    } catch(_) {}
    setLoadingDetail(false);
  }, [apiFetch]);

  const selectCase = (id) => {
    setSelectedId(id);
    loadCaseDetail(id);
  };

  const _copy = (arr) => JSON.parse(JSON.stringify(arr));

  const updateCheckLocal = (idx, field, val) => {
    setLocalChecks(prev => {
      const next = _copy(prev);
      next[idx][field] = val;
      return next;
    });
  };

  const saveCheck = async (check) => {
    if (!selectedId) return;
    setSavingCheck(prev => ({...prev, [check.type]: true}));
    try {
      const res = await apiFetch(`${API}/bgv/checks/update`, {
        method: "POST",
        body: JSON.stringify({
          consent_id: selectedId,
          check_type: check.type,
          status: check.status,
          notes: check.notes || "",
          evidence_key: check.evidence_key || "",
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setSaveStatus(`✓ ${check.label || check.type} saved`);
        // Refresh cases list to update progress
        const cRes = await apiFetch(`${API}/bgv/cases`);
        if (cRes.ok) setCases(await cRes.json());
        setTimeout(() => setSaveStatus(""), 2500);
      } else {
        setSaveStatus("Error saving check");
        setTimeout(() => setSaveStatus(""), 2500);
      }
    } catch(_) { setSaveStatus("Error"); setTimeout(() => setSaveStatus(""), 2500); }
    setSavingCheck(prev => ({...prev, [check.type]: false}));
  };

  const handleEvidenceUpload = async (checkIdx, file) => {
    if (!file || !selectedId || !caseDetail?.employee_id) return;
    const check = localChecks[checkIdx];
    setSavingCheck(prev => ({...prev, [check.type]: true}));
    try {
      const presignRes = await apiFetch(
        `${API}/bgv/upload/presigned?consent_id=${selectedId}&check_type=${check.type}&filename=${encodeURIComponent(file.name)}`
      );
      if (!presignRes.ok) { setSaveStatus("Upload failed"); setSavingCheck(prev => ({...prev, [check.type]: false})); return; }
      const { upload_url, s3_key } = await presignRes.json();
      const uploadRes = await fetch(upload_url, { method:"PUT", body:file, headers:{"Content-Type":file.type||"application/octet-stream"} });
      if (!uploadRes.ok) { setSaveStatus("Upload failed"); setSavingCheck(prev => ({...prev, [check.type]: false})); return; }
      // Update check with evidence key
      const next = _copy(localChecks);
      next[checkIdx].evidence_key = s3_key;
      if (next[checkIdx].status === "pending") next[checkIdx].status = "in_progress";
      setLocalChecks(next);
      await saveCheck(next[checkIdx]);
    } catch(_) { setSaveStatus("Upload error"); setTimeout(() => setSaveStatus(""), 2500); }
    setSavingCheck(prev => ({...prev, [check.type]: false}));
  };

  const submitReport = async () => {
    if (!selectedId) return;
    setSubmittingReport(true); setSaveStatus("Uploading report…");
    try {
      let report_key = caseDetail?.bgv_report_key || "";
      if (reportFile) {
        const presignRes = await apiFetch(
          `${API}/bgv/upload/presigned?consent_id=${selectedId}&check_type=bgv_report&filename=${encodeURIComponent(reportFile.name)}`
        );
        if (!presignRes.ok) { setSaveStatus("Report upload failed"); setSubmittingReport(false); return; }
        const { upload_url, s3_key } = await presignRes.json();
        const uploadRes = await fetch(upload_url, { method:"PUT", body:reportFile, headers:{"Content-Type":reportFile.type||"application/pdf"} });
        if (!uploadRes.ok) { setSaveStatus("Report upload failed"); setSubmittingReport(false); return; }
        report_key = s3_key;
      }
      if (!report_key) { setSaveStatus("Please upload a report PDF"); setSubmittingReport(false); return; }
      const res = await apiFetch(`${API}/bgv/report/submit`, {
        method: "POST",
        body: JSON.stringify({ consent_id: selectedId, report_key, summary: reportSummary, overall_status: reportVerdict }),
      });
      if (res.ok) {
        setReportDone(true); setSaveStatus("✓ Report submitted — employer notified");
        const cRes = await apiFetch(`${API}/bgv/cases`); if (cRes.ok) setCases(await cRes.json());
        setTimeout(() => setSaveStatus(""), 4000);
      } else {
        const e = await res.json(); setSaveStatus(e.detail || "Submission failed");
        setTimeout(() => setSaveStatus(""), 3000);
      }
    } catch(_) { setSaveStatus("Error"); setTimeout(() => setSaveStatus(""), 2500); }
    setSubmittingReport(false);
  };

  const handleChangePassword = async () => {
    setPwErr(""); setPwOk("");
    if (!pwCurrent || !pwNew || !pwConfirm) { setPwErr("All fields are required"); return; }
    if (pwNew !== pwConfirm) { setPwErr("New passwords do not match"); return; }
    if (pwNew.length < 8) { setPwErr("New password must be at least 8 characters"); return; }
    setPwBusy(true);
    try {
      const r = await apiFetch(`${API}/auth/change-password`, {
        method: "POST",
        body: JSON.stringify({ current_password: pwCurrent, new_password: pwNew }),
      });
      const d = await r.json();
      if (!r.ok) { setPwErr(d.detail || "Failed to change password"); return; }
      setPwOk("Password changed! You will be signed out shortly.");
      setPwCurrent(""); setPwNew(""); setPwConfirm("");
      setTimeout(() => { setShowPwModal(false); logout(); }, 2500);
    } catch(_) { setPwErr("Network error. Please try again."); }
    finally { setPwBusy(false); }
  };

  const requestEmailChange = async () => {
    if (!newEmail || !newEmail.includes("@")) { setEmailChangeErr("Enter a valid email"); return; }
    setEmailChangeLod(true); setEmailChangeErr(""); setEmailChangeMsg("");
    try {
      const res = await apiFetch(`${API}/auth/request-email-change`, {
        method: "POST",
        body: JSON.stringify({ new_email: newEmail }),
      });
      const d = await res.json();
      if (!res.ok) { setEmailChangeErr(d.detail || "Failed"); }
      else { setEmailOtpSent(true); setEmailChangeMsg(d.message); }
    } catch (_) { setEmailChangeErr("Network error"); }
    setEmailChangeLod(false);
  };

  const verifyEmailChange = async () => {
    if (!emailOtp || emailOtp.length !== 6) { setEmailChangeErr("Enter the 6-digit OTP"); return; }
    setEmailChangeLod(true); setEmailChangeErr("");
    try {
      const res = await apiFetch(`${API}/auth/verify-email-change`, {
        method: "POST",
        body: JSON.stringify({ otp: emailOtp, new_email: newEmail }),
      });
      const d = await res.json();
      if (!res.ok) { setEmailChangeErr(d.detail || "Failed"); }
      else if (d.pending_admin_approval) {
        // BGV email changes never apply immediately — same trust boundary as BGV
        // registration itself needing admin approval before an account can be used.
        setEmailChangeMsg(d.message);
        setEmailChangeSubmitted(true);
      } else {
        setEmailChangeMsg("Email updated. Logging you out now...");
        setTimeout(() => logout(), 2500);
      }
    } catch (_) { setEmailChangeErr("Network error"); }
    setEmailChangeLod(false);
  };

  const sendHoldRequest = async (consentId) => {
    if (!consentId || !holdMsg.trim()) return;
    setHoldSending(true);
    try {
      const res = await apiFetch(`${API}/bgv/request-info`, {
        method: "POST",
        body: JSON.stringify({ consent_id: consentId, message: holdMsg.trim() }),
      });
      if (res.ok) {
        setHoldMsg("");
        setHoldResult("✓ Case put on hold — employee notified (employer CC'd)");
        const cRes = await apiFetch(`${API}/bgv/cases`);
        if (cRes.ok) setCases(await cRes.json());
      } else {
        const d = await res.json().catch(()=>({}));
        setHoldResult(d.detail || "Could not put case on hold");
      }
    } catch(_) { setHoldResult("Network error"); }
    setHoldSending(false);
    setTimeout(() => setHoldResult(""), 4000);
  };

  const loadThread = async (consentId) => {
    setActiveThread(consentId);
    setShowNewMsg(false);
    try {
      const res = await apiFetch(`${API}/messages/thread/${consentId}`);
      if (res.ok) {
        const d = await res.json();
        const msgs = d.messages || [];
        setThreadMsgs(msgs);
        setThreadSegments(d.consent_segments || {});
        const keys = [...new Set(msgs.filter(m=>m.attachment_s3_key).map(m=>m.attachment_s3_key))];
        keys.forEach(async (key) => {
          if (msgAttachUrls[key]) return;
          try {
            const ur = await apiFetch(`${API}/messages/attachment-url?consent_id=${encodeURIComponent(consentId)}&s3_key=${encodeURIComponent(key)}`, { method: "POST" });
            if (ur.ok) { const ud = await ur.json(); setMsgAttachUrls(prev => ({ ...prev, [key]: ud.url })); }
          } catch(_) {}
        });
      }
    } catch(_) {}
  };

  // Auto-refresh the open thread — without this, a message from the other party
  // never appears until something re-triggers loadThread, forcing people to rely
  // on a full browser refresh just to see new replies.
  const [refreshingThread, setRefreshingThread] = useState(false);
  const silentRefreshThread = async (consentId) => {
    try {
      const r = await apiFetch(`${API}/messages/thread/${consentId}`);
      if (r.ok) {
        const d = await r.json();
        setThreadMsgs(d.messages || []);
        setThreadSegments(d.consent_segments || {});
      }
    } catch(_) {}
  };
  const manualRefreshThread = async (consentId) => {
    setRefreshingThread(true);
    await silentRefreshThread(consentId);
    setRefreshingThread(false);
  };
  useEffect(() => {
    if (!activeThread || tab !== "inbox") return;
    const id = setInterval(() => silentRefreshThread(activeThread), 15000);
    return () => clearInterval(id);
  }, [activeThread, tab]);

  const uploadMsgAttachment = async (file) => {
    if (!file || !activeThread) return;
    setMsgAttaching(true);
    try {
      const pr = await apiFetch(`${API}/messages/attachment-upload-url`, {
        method: "POST",
        body: JSON.stringify({ consent_id: activeThread, filename: file.name, content_type: file.type })
      });
      if (!pr.ok) { setMsgAttaching(false); return; }
      const { upload_url, s3_key, view_url } = await pr.json();
      await fetch(upload_url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      setMsgAttach({ name: file.name, s3_key, url: view_url });
    } catch(_) {}
    setMsgAttaching(false);
  };

  const sendMsg = async () => {
    if (!msgBody.trim() || !activeThread) return;
    const recipient = detectRecipientBgv(msgBody);
    if (!recipient) {
      const t = inbox.find(x=>x.consent_id===activeThread);
      const empName = t?.employee_name || t?.candidate_name || "the candidate";
      const erName  = t?.employer_name || "the employer";
      setMsgErr(`Tag @${empName} or @${erName} so we know who this message is for.`);
      return;
    }
    setMsgErr("");
    setSendingMsg(true);
    try {
      const res = await apiFetch(`${API}/messages/send`, {
        method: "POST",
        body: JSON.stringify({ consent_id: activeThread, body: msgBody, subject: msgSubject.trim(), recipient_type: recipient, attachment_s3_key: msgAttach?.s3_key || "" }),
      });
      if (res.ok) {
        setMsgBody(""); setMsgSubject(""); setMsgAttach(null);
        await loadThread(activeThread);
        const iRes = await apiFetch(`${API}/messages/inbox`); if (iRes.ok) setInbox(await iRes.json());
      }
    } catch(_) {}
    setSendingMsg(false);
  };

  if (!ready || !user) return null;

  const stats = {
    total:      cases.length,
    in_prog:    cases.filter(c => c.bgv_status === "in_progress").length,
    completed:  cases.filter(c => c.bgv_status === "completed").length,
    // BUG FIX (2026-09-09): checked for "assigned", a status value the backend never
    // actually sets — every freshly-assigned case (bgv_status === "groomed", set
    // explicitly in /bgv/assign) was invisible in this count, always showing 0 even
    // when a case genuinely was sitting untouched. Same root cause as the badge fix
    // above. on_hold added too — it was missing from every bucket here entirely,
    // meaning an on_hold case was counted in Total but literally unreachable via any
    // of these filter cards, with the filtered-list click doing nothing either.
    pending:    cases.filter(c => c.bgv_status === "groomed").length,
    on_hold:    cases.filter(c => c.bgv_status === "on_hold").length,
  };

  const selectedCase = cases.find(c => c.consent_id === selectedId);

  return (
    <>
      <style>{G}</style>
      <div className="pg">
        <div className="topbar">
          <div style={{display:"flex",alignItems:"baseline",gap:"0.4rem"}}>
            <span style={{fontSize:"1.15rem"}}>🛡️</span>
            <span className="logo-text">Datagate</span>
            <span className="logo-badge">BGV Portal</span>
          </div>
          <div className="topbar-right">
            <button onClick={()=>setTab("inbox")} style={{position:"relative",width:32,height:32,borderRadius:7,border:tab==="inbox"?"1px solid #4f46e5":"1px solid rgba(255,255,255,0.14)",background:tab==="inbox"?"#4f46e5":"rgba(255,255,255,0.06)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.9rem",transition:"background 0.15s, border-color 0.15s"}} title="Messages">
              ✉️
              {unreadCount>0 && <span style={{position:"absolute",top:-4,right:-4,background:"#ef4444",color:"#fff",fontSize:"0.6rem",fontWeight:700,borderRadius:999,minWidth:15,height:15,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px"}}>{unreadCount>9?"9+":unreadCount}</span>}
            </button>
            <span className="user-name">🏢 {user.name || user.email}</span>
            <div style={{position:"relative"}}>
              <button onClick={()=>setShowGear(g=>!g)} style={{padding:"5px 10px",border:showGear?"1.5px solid #4f46e5":"1.5px solid rgba(255,255,255,0.14)",borderRadius:6,background:showGear?"#4f46e5":"rgba(255,255,255,0.06)",fontSize:12,fontWeight:600,color:"#fff",cursor:"pointer",fontFamily:"inherit",transition:"background 0.15s, border-color 0.15s"}}>⚙️ Settings</button>
              {showGear && (
                <>
                  <div style={{position:"fixed",inset:0,zIndex:199}} onClick={()=>setShowGear(false)}/>
                  <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,boxShadow:"0 8px 24px rgba(15,23,42,0.14)",minWidth:190,zIndex:200,overflow:"hidden"}}>
                    <button onClick={()=>{setShowGear(false);setShowPwModal(true);}} style={{display:"block",width:"100%",textAlign:"left",padding:"0.6rem 0.9rem",background:"none",border:"none",fontSize:"0.78rem",fontWeight:600,color:"#0f172a",cursor:"pointer",fontFamily:"inherit"}}>🔑 Change password</button>
                    <button onClick={()=>{setShowGear(false);setShowEmailModal(true);setEmailOtpSent(false);setEmailOtp("");setNewEmail("");setEmailChangeMsg("");setEmailChangeErr("");setEmailChangeSubmitted(false);}} style={{display:"block",width:"100%",textAlign:"left",padding:"0.6rem 0.9rem",background:"none",border:"none",fontSize:"0.78rem",fontWeight:600,color:"#0f172a",cursor:"pointer",fontFamily:"inherit",borderTop:"1px solid #f1f5f9"}}>✉️ Change email</button>
                    <button onClick={()=>{setShowGear(false);setShowSupport(true);}} style={{display:"block",width:"100%",textAlign:"left",padding:"0.6rem 0.9rem",background:"none",border:"none",fontSize:"0.78rem",fontWeight:600,color:"#0f172a",cursor:"pointer",fontFamily:"inherit",borderTop:"1px solid #f1f5f9"}}>🎧 Help & Support</button>
                  </div>
                </>
              )}
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"stretch",gap:4}}>
              <button className="signout-btn" onClick={()=>{logout();router.replace("/bgv/login");}}>Sign out</button>
              <button onClick={handleSignoutAll} style={{background:"none",border:"none",color:"#94a3b8",fontSize:"0.68rem",fontWeight:600,textDecoration:"underline",cursor:"pointer",fontFamily:"inherit",padding:0}}>Sign out all devices</button>
            </div>
          </div>
        </div>

        {showPwModal && (
          <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,backdropFilter:"blur(4px)"}}>
            <div style={{background:"#fff",borderRadius:16,maxWidth:440,width:"92%",boxShadow:"0 32px 80px rgba(0,0,0,0.22)",overflow:"hidden",border:"1px solid #e2e8f0"}}>
              <div style={{background:"#4f46e5",padding:"1.3rem 1.75rem"}}>
                <div style={{fontSize:"1.05rem",fontWeight:800,color:"#fff"}}>Change Password</div>
                <div style={{fontSize:"0.78rem",color:"rgba(255,255,255,0.75)",marginTop:2}}>Keep your account secure with a strong password</div>
              </div>
              <div style={{padding:"1.6rem 1.75rem"}}>
                {[["Current password","password",pwCurrent,setPwCurrent],["New password","password",pwNew,setPwNew],["Confirm new password","password",pwConfirm,setPwConfirm]].map(([label,type,val,setter])=>(
                  <div key={label} style={{marginBottom:"1.1rem"}}>
                    <div style={{fontSize:"0.72rem",fontWeight:700,color:"#64748b",marginBottom:"0.4rem",textTransform:"uppercase",letterSpacing:"0.5px"}}>{label}</div>
                    <PasswordInput value={val} onChange={e=>setter(e.target.value)} maxLength={label==="Current password"?undefined:12} showCounter={label!=="Current password"} placeholder={label==="Current password"?"":"Enter new password"} inputStyle={{width:"100%",padding:"0.75rem 0.9rem",border:"1.5px solid #e2e8f0",borderRadius:9,fontFamily:"inherit",fontSize:"0.92rem",background:"#f8fafc"}}/>
                    {label!=="Current password" && <div style={{fontSize:"0.72rem",color:"#94a3b8",marginTop:"0.35rem"}}>8–12 characters, with a letter, number &amp; symbol</div>}
                  </div>
                ))}
                {pwErr && <div style={{fontSize:"0.8rem",color:"#ef4444",marginBottom:"0.7rem",fontWeight:600,background:"#fef2f2",padding:"0.6rem 0.8rem",borderRadius:8}}>{pwErr}</div>}
                {pwOk  && <div style={{fontSize:"0.8rem",color:"#16a34a",marginBottom:"0.7rem",fontWeight:600,background:"#f0fdf4",padding:"0.6rem 0.8rem",borderRadius:8}}>{pwOk}</div>}
                <div style={{display:"flex",gap:"0.7rem",marginTop:"0.6rem"}}>
                  <button onClick={()=>{setShowPwModal(false);setPwErr("");setPwOk("");setPwCurrent("");setPwNew("");setPwConfirm("");}} style={{flex:1,padding:"0.75rem",borderRadius:9,border:"1.5px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",fontWeight:700,color:"#475569",fontFamily:"inherit",fontSize:"0.88rem"}}>Cancel</button>
                  <button onClick={handleChangePassword} disabled={pwBusy} style={{flex:1,padding:"0.75rem",borderRadius:9,border:"none",background:"#4f46e5",color:"#fff",cursor:pwBusy?"not-allowed":"pointer",fontWeight:700,fontFamily:"inherit",fontSize:"0.88rem",opacity:pwBusy?0.6:1}}>{pwBusy?"Saving…":"Change Password"}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Change Email Modal — BGV specifically: after OTP, the request goes to
            admin for approval, same trust boundary as BGV registration itself. Nothing
            changes on the account until admin approves. ── */}
        {showEmailModal && (
          <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,backdropFilter:"blur(4px)"}}>
            <div style={{background:"#fff",borderRadius:16,maxWidth:440,width:"92%",boxShadow:"0 32px 80px rgba(0,0,0,0.22)",overflow:"hidden",border:"1px solid #e2e8f0"}}>
              <div style={{background:"#4f46e5",padding:"1.3rem 1.75rem"}}>
                <div style={{fontSize:"1.05rem",fontWeight:800,color:"#fff"}}>Change Email</div>
                <div style={{fontSize:"0.78rem",color:"rgba(255,255,255,0.75)",marginTop:2}}>{emailChangeSubmitted?"Awaiting admin approval":"We'll verify it's really you first"}</div>
              </div>
              <div style={{padding:"1.6rem 1.75rem"}}>
                {emailChangeSubmitted ? (
                  <>
                    <div style={{fontSize:38,textAlign:"center",marginBottom:10}}>⏳</div>
                    <p style={{fontSize:"0.85rem",color:"#334155",textAlign:"center",lineHeight:1.6,marginBottom:"1.2rem"}}>{emailChangeMsg}</p>
                    <p style={{fontSize:"0.75rem",color:"#94a3b8",textAlign:"center"}}>Your account continues to use your current email until this is reviewed.</p>
                  </>
                ) : !emailOtpSent ? (<>
                  <p style={{fontSize:"0.78rem",color:"#3730a3",background:"#eef2ff",border:"1px solid #c7d2fe",borderRadius:8,padding:"0.6rem 0.8rem",marginBottom:"1rem",lineHeight:1.5}}>ℹ️ As a BGV vendor, email changes need admin approval before they take effect — same as your original registration.</p>
                  <div style={{fontSize:"0.72rem",fontWeight:700,color:"#64748b",marginBottom:"0.4rem",textTransform:"uppercase",letterSpacing:"0.5px"}}>New Email Address</div>
                  <input type="email" value={newEmail} onChange={e=>{setNewEmail(e.target.value);setEmailChangeErr("");}} placeholder="Enter new email address" style={{width:"100%",padding:"0.75rem 0.9rem",border:"1.5px solid #e2e8f0",borderRadius:9,fontFamily:"inherit",fontSize:"0.92rem",background:"#f8fafc",boxSizing:"border-box",marginBottom:"1rem"}}/>
                </>) : (<>
                  <p style={{fontSize:"0.82rem",color:"#334155",marginBottom:"1rem"}}>{emailChangeMsg}</p>
                  <div style={{fontSize:"0.72rem",fontWeight:700,color:"#64748b",marginBottom:"0.4rem",textTransform:"uppercase",letterSpacing:"0.5px"}}>6-Digit OTP</div>
                  <input value={emailOtp} maxLength={6} inputMode="numeric" onChange={e=>{setEmailOtp(e.target.value.replace(/\D/g,"").slice(0,6));setEmailChangeErr("");}} placeholder="Enter OTP" style={{width:"100%",padding:"0.75rem 0.9rem",border:"1.5px solid #e2e8f0",borderRadius:9,fontFamily:"inherit",fontSize:"1.1rem",letterSpacing:"5px",textAlign:"center",background:"#f8fafc",boxSizing:"border-box",marginBottom:"1rem"}}/>
                </>)}
                {emailChangeErr && <div style={{fontSize:"0.8rem",color:"#ef4444",marginBottom:"0.7rem",fontWeight:600,background:"#fef2f2",padding:"0.6rem 0.8rem",borderRadius:8}}>{emailChangeErr}</div>}
                <div style={{display:"flex",gap:"0.7rem",marginTop:"0.6rem"}}>
                  {emailChangeSubmitted ? (
                    <button onClick={()=>{setShowEmailModal(false);setEmailChangeSubmitted(false);setEmailOtpSent(false);setEmailOtp("");setNewEmail("");setEmailChangeMsg("");}} style={{flex:1,padding:"0.75rem",borderRadius:9,border:"none",background:"#4f46e5",color:"#fff",cursor:"pointer",fontWeight:700,fontFamily:"inherit",fontSize:"0.88rem"}}>Got it</button>
                  ) : (<>
                    <button onClick={()=>{setShowEmailModal(false);setEmailOtpSent(false);setEmailOtp("");setNewEmail("");setEmailChangeMsg("");setEmailChangeErr("");}} style={{flex:1,padding:"0.75rem",borderRadius:9,border:"1.5px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",fontWeight:700,color:"#475569",fontFamily:"inherit",fontSize:"0.88rem"}}>Cancel</button>
                    <button onClick={emailOtpSent?verifyEmailChange:requestEmailChange} disabled={emailChangeLod} style={{flex:1,padding:"0.75rem",borderRadius:9,border:"none",background:"#4f46e5",color:"#fff",cursor:emailChangeLod?"not-allowed":"pointer",fontWeight:700,fontFamily:"inherit",fontSize:"0.88rem",opacity:emailChangeLod?0.6:1}}>{emailChangeLod?(emailOtpSent?"Verifying…":"Sending…"):(emailOtpSent?"Submit for Approval":"Send OTP")}</button>
                  </>)}
                </div>
              </div>
            </div>
          </div>
        )}
        {showSupport && <SupportModal apiFetch={apiFetch} onClose={()=>setShowSupport(false)} />}

        <div className="wrap">
          {/* Tab Nav */}
          <div className="tabs">
            {[["cases","📋 My Cases"],["inbox","💬 Inbox"],["reports","📄 Reports"]].map(([t,l])=>(
              <button key={t} className={`tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>{l}</button>
            ))}
          </div>

          {/* ── CASES TAB ── */}
          {tab === "cases" && (
            <>
              {/* Stats */}
              <div className="stat-row">
                {[
                  {num:stats.total,     label:"Total Cases",   filterVal:null},
                  {num:stats.in_prog,   label:"In Progress",   filterVal:"in_progress"},
                  {num:stats.completed, label:"Completed",     filterVal:"completed"},
                  {num:stats.pending,   label:"Pending Start", filterVal:"groomed"},
                  {num:stats.on_hold,   label:"On Hold",       filterVal:"on_hold"},
                ].map((s,i)=>(
                  <div key={i} className="stat-card" onClick={()=>setCaseFilter(s.filterVal)}
                    style={{cursor:"pointer",border:caseFilter===s.filterVal?"2px solid #4f46e5":"2px solid transparent",transition:"border-color 0.15s"}}>
                    <div className="stat-num">{s.num}</div>
                    <div className="stat-lbl">{s.label}</div>
                  </div>
                ))}
              </div>
              {caseFilter && (
                <div style={{fontSize:"0.75rem",color:"#4f46e5",fontWeight:600,margin:"0.5rem 0 -0.5rem",display:"flex",alignItems:"center",gap:"0.5rem"}}>
                  Showing: {caseFilter==="in_progress"?"In Progress":caseFilter==="completed"?"Completed":caseFilter==="on_hold"?"On Hold":"Pending Start"}
                  <button onClick={()=>setCaseFilter(null)} style={{background:"none",border:"none",color:"#4f46e5",textDecoration:"underline",cursor:"pointer",fontSize:"0.72rem",fontWeight:600,padding:0,fontFamily:"inherit"}}>Clear</button>
                </div>
              )}

              {/* Cases Table */}
              <div className="cases-table">
                <div className="tbl-head">
                  <span className="tbl-th">Candidate</span>
                  <span className="tbl-th">Employer</span>
                  <span className="tbl-th">Assigned</span>
                  <span className="tbl-th">Status</span>
                  <span className="tbl-th">Progress</span>
                  <span className="tbl-th">Action</span>
                </div>
                {loadingCases && <div className="empty-state">Loading cases…</div>}
                {!loadingCases && cases.length === 0 && <div className="empty-state">No cases assigned yet.</div>}
                {!loadingCases && cases.length > 0 && cases.filter(c=>!caseFilter || c.bgv_status===caseFilter).length === 0 && <div className="empty-state">No cases match this filter.</div>}
                {cases.filter(c=>!caseFilter || c.bgv_status===caseFilter).map(c => {
                  const bs = BGV_STATUS_BADGE[c.bgv_status] || BGV_STATUS_BADGE.groomed;
                  const pct = c.checks_total > 0 ? Math.round((c.checks_done / c.checks_total) * 100) : 0;
                  return (
                    <div key={c.consent_id} className={`tbl-row${selectedId===c.consent_id?" selected":""}`} onClick={()=>selectCase(c.consent_id)}>
                      <div>
                        <div className="td-primary">
                          {c.candidate_name}
                          {c.consent_status !== "APPROVED" && (
                            <span style={{marginLeft:6,padding:"1px 7px",borderRadius:999,background:"#fee2e2",color:"#991b1b",fontSize:"0.62rem",fontWeight:700}}>CONSENT REVOKED</span>
                          )}
                        </div>
                        <div className="td-secondary">{c.employee_email}</div>
                      </div>
                      <div>
                        <div className="td-secondary">{c.requestor_name || c.requestor_email}</div>
                      </div>
                      <div className="td-secondary">{isoDate(c.bgv_assigned_at)}</div>
                      <div>
                        <span className="badge" style={{color:bs.color,background:bs.bg}}>{bs.label}</span>
                      </div>
                      <div>
                        <div className="td-secondary" style={{fontSize:"0.72rem"}}>{c.checks_done}/{c.checks_total} checks</div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{width:`${pct}%`,background:pct===100?"#16a34a":"#4f46e5"}}/>
                        </div>
                      </div>
                      <div>
                        <button style={{padding:"0.28rem 0.75rem",background:"#eef2ff",color:"#4f46e5",border:"1.5px solid #c7d2fe",borderRadius:6,fontSize:"0.72rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}
                          onClick={e=>{e.stopPropagation();selectCase(c.consent_id);}}>
                          Open →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Case Detail Panel */}
              {selectedId && (
                <div className="case-detail">
                  {loadingDetail ? (
                    <div className="empty-state">Loading case…</div>
                  ) : caseDetail ? (
                    <>
                      <div className="case-detail-header">
                        <div>
                          <div className="case-title">
                            {(caseDetail.profile?.firstName||"") + " " + (caseDetail.profile?.lastName||"")} — BGV Case
                          </div>
                          <div className="case-subtitle">
                            {caseDetail.employee_email} &nbsp;·&nbsp; Assigned by {caseDetail.requestor_name || caseDetail.requestor_email} &nbsp;·&nbsp; {isoDate(caseDetail.bgv_assigned_at)}
                          </div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
                          {saveStatus && <span style={{fontSize:"0.78rem",color:saveStatus.startsWith("✓")?"#4ade80":"#fca5a5",fontWeight:600}}>{saveStatus}</span>}
                          {caseDetail.consent_status !== "APPROVED" && (
                            <span className="badge" style={{color:"#991b1b",background:"#fee2e2"}}>CONSENT REVOKED — read-only history</span>
                          )}
                          {(BGV_STATUS_BADGE[caseDetail.bgv_status]||BGV_STATUS_BADGE.groomed) && (
                            <span className="badge" style={{color:(BGV_STATUS_BADGE[caseDetail.bgv_status]||BGV_STATUS_BADGE.groomed).color,background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.25)",color:"#fff"}}>
                              {(BGV_STATUS_BADGE[caseDetail.bgv_status]||BGV_STATUS_BADGE.groomed).label}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="case-body">
                        {/* Candidate Profile — rebuilt into full-width, clearly sectioned
                            cards (matching the employer dashboard's visual language) instead
                            of a single cramped column of flat key-value rows. Every field's
                            attachment link sits inline right next to it — no separate
                            documents page, exactly as specified. Data itself comes from the
                            backend's _bgv_safe_profile() allowlist, so nothing rendered here
                            can ever include a field that wasn't explicitly approved. */}
                        {(() => {
                          const prof = caseDetail.profile || {};
                          const edu  = prof.education || {};
                          const Sec = ({icon,title,children}) => (
                            <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:"1.1rem 1.3rem",marginBottom:"1.1rem"}}>
                              <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.9rem"}}>
                                <span style={{fontSize:"1.1rem"}}>{icon}</span>
                                <span style={{fontWeight:800,fontSize:"0.9rem",color:"#0f172a"}}>{title}</span>
                              </div>
                              {children}
                            </div>
                          );
                          const Grid = ({children}) => <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:"0.9rem 1.3rem"}}>{children}</div>;
                          const F = ({label,value,docGroup,docKey}) => value ? (
                            <div>
                              <div style={{fontSize:"0.68rem",fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:"0.2rem"}}>{label}</div>
                              <div style={{fontSize:"0.86rem",color:"#1e293b",fontWeight:600}}>{value}{docGroup && docLink(docGroup,docKey)}</div>
                            </div>
                          ) : null;
                          // Class X/Intermediate/Diploma/UG/PG can each have several documents
                          // (main certificate, equivalency cert, and for UG/PG also provisional
                          // marksheet + convocation cert) under slightly different subKeys —
                          // rather than guess and risk missing one, this opens every document
                          // whose subKey starts with this level's prefix, guaranteed complete.
                          const ViewDocsBtn = ({prefix}) => (
                            <button onClick={async()=>{
                              try {
                                const r = await apiFetch(`${API}/documents/${caseDetail.employee_id}`);
                                if (r.ok) {
                                  const docs = await r.json();
                                  const eduDocs = docs.documents?.education || {};
                                  const p = prefix.toLowerCase();
                                  const matches = Object.entries(eduDocs).filter(([k])=>{
                                    const kl = k.toLowerCase();
                                    return kl===p || kl.startsWith(p+"_") || kl.startsWith(p+".");
                                  });
                                  if (matches.length === 0) { setSaveStatus("No documents uploaded for this section"); return; }
                                  matches.forEach(([_,d])=>d?.url && window.open(d.url,"_blank"));
                                }
                              } catch(_) {}
                            }} style={{marginTop:"0.7rem",padding:"0.35rem 0.85rem",background:"#f0fdfa",color:"#0d6e6e",border:"1px solid #a8d5ce",borderRadius:7,fontSize:"0.75rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                              📎 View Documents
                            </button>
                          );
                          const eduLevel = (key,label,icon) => {
                            const e = edu[key];
                            if (!e || (!e.school && !e.college && !e.institution)) return null;
                            return (
                              <Sec key={key} icon={icon} title={label}>
                                <Grid>
                                  <F label="Institution" value={e.school || e.college || e.institution} />
                                  <F label="Board / University" value={e.board || e.university} />
                                  <F label="Hall Ticket / Roll No." value={e.hallTicket || e.rollNo} />
                                  <F label="Course / Branch" value={e.course || e.branch} />
                                  <F label="From — To" value={(e.from||e.yearOfPassing) ? `${e.from||""} ${e.to?"— "+e.to:""}`.trim() : null} />
                                  <F label="Year of Passing" value={e.yearOfPassing} />
                                  <F label="Result" value={e.resultValue ? `${e.resultType||""} ${e.resultValue}`.trim() : null} />
                                  <F label="Medium of Study" value={e.medium} />
                                  <F label="Institution Address" value={e.address} />
                                  <F label="Location" value={e.location || (e.completedIn ? `Completed ${e.completedIn}` : null)} />
                                </Grid>
                                <ViewDocsBtn prefix={key === "undergraduate" ? "ug_" : key === "postgraduate" ? "pg_" : key} />
                              </Sec>
                            );
                          };
                          return (<>
                            <Sec icon="🪪" title="Personal Identity">
                              <Grid>
                                <F label="Full Name" value={`${prof.firstName||""} ${prof.middleName||""} ${prof.lastName||""}`.replace(/\s+/g," ").trim()} />
                                <F label="Date of Birth" value={prof.dob} />
                                <F label="Gender" value={prof.gender} />
                                <F label="Marital Status" value={prof.maritalStatus} />
                                <F label="Father's Name" value={prof.fatherName} />
                                <F label="Mother's Name" value={prof.motherName} />
                                <F label="PAN" value={prof.pan} docGroup="personal" docKey="pan" />
                                <F label="Aadhaar" value={prof.aadhaar} docGroup="personal" docKey="aadhaar" />
                                {prof.hasPassport === "Yes" && <F label="Passport" value={prof.passport} docGroup="personal" docKey="passport" />}
                              </Grid>
                            </Sec>

                            <Sec icon="📍" title="Address">
                              <div style={{fontSize:"0.72rem",fontWeight:700,color:"#0d6e6e",marginBottom:"0.5rem"}}>CURRENT ADDRESS</div>
                              <Grid>
                                <F label="Address" value={[prof.currentAddress?.door,prof.currentAddress?.village,prof.currentAddress?.locality,prof.currentAddress?.district,prof.currentAddress?.state,prof.currentAddress?.pincode].filter(Boolean).join(", ")} docGroup="personal" docKey="currentAddressProof" />
                                <F label="Proof Type" value={prof.currentAddressProofType} />
                              </Grid>
                              <div style={{fontSize:"0.72rem",fontWeight:700,color:"#0d6e6e",margin:"0.9rem 0 0.5rem"}}>PERMANENT / NATIVE ADDRESS {prof.sameAsCurrent && <span style={{color:"#94a3b8",fontWeight:500}}>(same as current)</span>}</div>
                              <Grid>
                                <F label="Address" value={[prof.permanentAddress?.door,prof.permanentAddress?.village,prof.permanentAddress?.locality,prof.permanentAddress?.district,prof.permanentAddress?.state,prof.permanentAddress?.pincode].filter(Boolean).join(", ")} docGroup="personal" docKey={prof.sameAsCurrent ? "currentAddressProof" : "permanentAddressProof"} />
                                <F label="Proof Type" value={prof.permanentAddressProofType || (prof.sameAsCurrent ? prof.currentAddressProofType : null)} />
                              </Grid>
                            </Sec>

                            {eduLevel("classX","Class X — SSC / Matriculation","🏫")}
                            {eduLevel("intermediate","Intermediate / Class XII","🏫")}
                            {eduLevel("diploma","Diploma","🎓")}
                            {eduLevel("undergraduate","Undergraduate","🎓")}
                            {eduLevel("postgraduate","Postgraduate","🎓")}

                            {Array.isArray(edu.professionalQualifications) && edu.professionalQualifications.filter(q=>q?.name||q?.course).map((q,i)=>(
                              <Sec key={`pq-${i}`} icon="📜" title={`Professional Qualification ${i+1}`}>
                                <Grid>
                                  <F label="Qualification" value={q.name || q.course} />
                                  <F label="Institution / Body" value={q.institution || q.college} />
                                  <F label="Year of Passing" value={q.yearOfPassing} />
                                  <F label="Result" value={q.resultValue} />
                                </Grid>
                                {docLink("education",`profqual_${i}`) && <div style={{marginTop:"0.7rem"}}>{docLink("education",`profqual_${i}`)}</div>}
                              </Sec>
                            ))}

                            {Array.isArray(edu.articleships) && edu.articleships.filter(a=>a?.firm||a?.organization).map((a,i)=>(
                              <Sec key={`art-${i}`} icon="📝" title={`Articleship / Practical Training ${i+1}`}>
                                <Grid>
                                  <F label="Firm / Organisation" value={a.firm || a.organization} />
                                  <F label="From — To" value={(a.from||a.to) ? `${a.from||""} — ${a.to||""}` : null} />
                                  <F label="Role / Nature" value={a.role || a.nature} />
                                </Grid>
                                {docLink("education",`articleship_${i}`) && <div style={{marginTop:"0.7rem"}}>{docLink("education",`articleship_${i}`)}</div>}
                              </Sec>
                            ))}

                            {edu.hasEduGap === "Yes" && (
                              <Sec icon="⏱" title="Education Gap / Break Before First Job">
                                <Grid>
                                  <F label="From — To" value={(edu.eduGapFrom||edu.eduGapTo) ? `${edu.eduGapFrom||""} — ${edu.eduGapTo||""}` : null} />
                                  <F label="Reason" value={edu.eduGapReason} />
                                </Grid>
                              </Sec>
                            )}

                            {(caseDetail.employment_history||[]).map((emp,i) => {
                              const gapAfterThis = (caseDetail.employment_history||[])[i+1]?.gap;
                              return (
                                <Sec key={`emp-${i}`} icon="💼" title={emp.companyName ? `${emp.companyName}${emp.designation?" — "+emp.designation:""}` : `Employment ${i+1}`}>
                                  <Grid>
                                    <F label="Company" value={emp.companyName} />
                                    <F label="Office Address" value={emp.officeAddress} />
                                    <F label="Employee ID" value={emp.employeeId} />
                                    <F label="Official Work Email" value={emp.officialWorkEmail} />
                                    <F label="Designation" value={emp.designation} />
                                    <F label="Department" value={emp.department} />
                                    <F label="Employment Type" value={emp.employmentType} />
                                    <F label="Duties & Responsibilities" value={emp.dutiesResponsibilities} />
                                    <F label="Date of Joining" value={emp.dateOfJoining} />
                                    <F label="Date of Leaving" value={emp.dateOfLeaving} />
                                    <F label="Reason for Leaving" value={emp.reasonForLeaving} />
                                  </Grid>

                                  {emp.employmentType === "Contract" && (emp.contractVendor?.company || emp.contractVendor?.email) && (<>
                                    <div style={{fontSize:"0.72rem",fontWeight:700,color:"#0d6e6e",margin:"0.9rem 0 0.5rem"}}>VENDOR / THIRD-PARTY DETAILS</div>
                                    <Grid>
                                      <F label="Vendor Company" value={emp.contractVendor.company} />
                                      <F label="Vendor Email" value={emp.contractVendor.email} />
                                      <F label="Vendor Mobile" value={emp.contractVendor.mobile} />
                                    </Grid>
                                  </>)}

                                  {(emp.reference?.name || emp.reference?.email) && (<>
                                    <div style={{fontSize:"0.72rem",fontWeight:700,color:"#0d6e6e",margin:"0.9rem 0 0.5rem"}}>REFERENCE DETAILS</div>
                                    <Grid>
                                      <F label="Reference Role" value={emp.reference.role} />
                                      <F label="Reference Name" value={emp.reference.name} />
                                      <F label="Reference Official Email" value={emp.reference.email} />
                                      <F label="Reference Mobile" value={emp.reference.mobile} />
                                    </Grid>
                                  </>)}

                                  <div style={{fontSize:"0.72rem",fontWeight:700,color:"#0d6e6e",margin:"0.9rem 0 0.5rem"}}>ATTACHMENTS</div>
                                  <div style={{display:"flex",flexWrap:"wrap",gap:"0.6rem 1.3rem"}}>
                                    {docLink(`employment/${emp.company_id}`,"offerLetter") && <span>Offer Letter {docLink(`employment/${emp.company_id}`,"offerLetter")}</span>}
                                    {docLink(`employment/${emp.company_id}`,"payslips") && <span>Payslips {docLink(`employment/${emp.company_id}`,"payslips")}</span>}
                                    {docLink(`employment/${emp.company_id}`,"resignation") && <span>Resignation Acceptance {docLink(`employment/${emp.company_id}`,"resignation")}</span>}
                                    {docLink(`employment/${emp.company_id}`,"experience") && <span>Experience / Relieving Letter {docLink(`employment/${emp.company_id}`,"experience")}</span>}
                                    {docLink(`employment/${emp.company_id}`,"idCard") && <span>Company ID Card {docLink(`employment/${emp.company_id}`,"idCard")}</span>}
                                  </div>

                                  {gapAfterThis?.hasGap === "Yes" && (
                                    <div style={{marginTop:"0.9rem",padding:"0.6rem 0.8rem",background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8}}>
                                      <div style={{fontSize:"0.7rem",fontWeight:700,color:"#92400e",marginBottom:"0.15rem"}}>⚠ Gap before next job</div>
                                      <div style={{fontSize:"0.8rem",color:"#78350f"}}>{gapAfterThis.reason}</div>
                                    </div>
                                  )}
                                </Sec>
                              );
                            })}

                            {prof.hasUan === "Yes" && (
                              <Sec icon="🏦" title="UAN / EPFO Details">
                                <Grid>
                                  <F label="UAN Number" value={prof.uanNumber} docGroup="uan" docKey="uanCard" />
                                  <F label="Name as per UAN" value={prof.nameAsPerUan} />
                                  <F label="Mobile Linked to UAN" value={prof.mobileLinkedToUan} />
                                  <F label="UAN Active" value={prof.uanActive} />
                                </Grid>
                                {docLink("uan","serviceHistory") && <div style={{marginTop:"0.7rem"}}>Service History Record Snapshot {docLink("uan","serviceHistory")}</div>}
                                {(prof.pfRecords||[]).filter(p=>p?.companyName && (p.hasPf==="No"||p.pfMemberId||p.dojEpfo||p.doeEpfo)).map((p,i)=>(
                                  <div key={`pf-${i}`} style={{marginTop:"0.9rem",paddingTop:"0.9rem",borderTop:"1px solid #f1f5f9"}}>
                                    <div style={{fontSize:"0.72rem",fontWeight:700,color:"#0d6e6e",marginBottom:"0.5rem"}}>{p.companyName}</div>
                                    <Grid>
                                      <F label="PF Maintained by Employer" value={p.hasPf} />
                                      <F label="PF Type" value={p.pfType} />
                                      <F label="EPFO Member ID" value={p.pfMemberId} />
                                      <F label="Date of Joining (EPFO)" value={p.dojEpfo} />
                                      <F label="Date of Exit (EPFO)" value={p.doeEpfo} />
                                      <F label="Was PF Transferred?" value={p.pfTransferred} />
                                    </Grid>
                                  </div>
                                ))}
                              </Sec>
                            )}
                          </>);
                        })()}

                        {/* Checks Panel */}
                        <div className="checks-panel">
                          <div className="panel-title">BGV Checks Tracker</div>
                          {localChecks.map((ch, idx) => {
                            const st = CHECK_STATUS[ch.status] || CHECK_STATUS.pending;
                            return (
                              <div key={ch.type} className="check-row">
                                <div>
                                  <div className="check-label">{ch.label}</div>
                                  <div className="check-type-tag">{ch.type}</div>
                                  {ch.completed_at && <div style={{fontSize:"0.65rem",color:"#16a34a",marginTop:"0.1rem"}}>✓ {isoDate(ch.completed_at)}</div>}
                                </div>
                                <div>
                                  <select
                                    className="check-select"
                                    value={ch.status}
                                    style={{borderColor:st.color,color:st.color}}
                                    onChange={e=>updateCheckLocal(idx,"status",e.target.value)}
                                    onBlur={()=>saveCheck(localChecks[idx])}
                                  >
                                    {Object.entries(CHECK_STATUS).map(([v,{label}])=>(
                                      <option key={v} value={v}>{label}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <textarea
                                    className="notes-input"
                                    placeholder="Notes / findings…"
                                    value={ch.notes||""}
                                    onChange={e=>updateCheckLocal(idx,"notes",e.target.value)}
                                    onBlur={()=>saveCheck(localChecks[idx])}
                                    rows={2}
                                  />
                                </div>
                                <div style={{display:"flex",flexDirection:"column",gap:"0.35rem"}}>
                                  {ch.evidence_key ? (
                                    <button className="view-btn" onClick={async()=>{
                                      try {
                                        const r = await apiFetch(`${API}/documents/${caseDetail.employee_id}`);
                                        if (r.ok) {
                                          const docs = await r.json();
                                          const bgvDocs = docs.documents?.bgv || {};
                                          const key = Object.keys(bgvDocs).find(k => bgvDocs[k]?.s3_key === ch.evidence_key);
                                          if (key && bgvDocs[key]?.url) window.open(bgvDocs[key].url,"_blank");
                                        }
                                      } catch(_) {}
                                    }}>View</button>
                                  ) : null}
                                  <input ref={el=>uploadInputRef.current[ch.type]=el} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{display:"none"}} onChange={e=>{if(e.target.files[0])handleEvidenceUpload(idx,e.target.files[0]);e.target.value="";}}/>
                                  <button className="upload-btn" onClick={()=>uploadInputRef.current[ch.type]?.click()} disabled={savingCheck[ch.type]}>
                                    {savingCheck[ch.type]?"…":(ch.evidence_key?"Re-upload":"Upload")}
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                          {/* Request info from employee / put case on hold */}
                          <div style={{marginTop:"1rem",marginLeft:"auto",maxWidth:420,background:"#fef2f2",border:"1.5px solid #fecaca",borderRadius:10,padding:"0.85rem"}}>
                            <div style={{fontWeight:700,fontSize:"0.8rem",color:"#dc2626",marginBottom:"0.35rem"}}>Request info from employee (puts case on hold)</div>
                            <textarea value={holdMsg} onChange={e=>setHoldMsg(e.target.value)} placeholder="What documents or info are needed?" rows={2}
                              style={{width:"100%",padding:"0.4rem 0.6rem",border:"1.5px solid #fecaca",borderRadius:7,fontFamily:"inherit",fontSize:"0.77rem",resize:"vertical",boxSizing:"border-box",outline:"none"}}/>
                            <div style={{display:"flex",gap:"0.5rem",alignItems:"center",marginTop:"0.35rem"}}>
                              <button onClick={()=>sendHoldRequest(caseDetail&&caseDetail.consent_id)} disabled={holdSending||!holdMsg.trim()}
                                style={{padding:"0.38rem 0.8rem",background:"#dc2626",color:"#fff",border:"none",borderRadius:7,fontSize:"0.75rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit",opacity:(holdSending||!holdMsg.trim())?0.6:1}}>
                                {holdSending?"Sending...":"Put on hold & notify"}
                              </button>
                              {holdResult&&<span style={{fontSize:"0.72rem",color:holdResult.includes("hold")?"#16a34a":"#dc2626",fontWeight:600}}>{holdResult}</span>}
                            </div>
                          </div>

                          {/* Final Report Section */}
                          <div className="report-section">
                            <div className="report-title">Submit Final BGV Report</div>
                            {reportDone && (
                              <div style={{padding:"0.65rem 0.9rem",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,marginBottom:"0.75rem",fontSize:"0.78rem",color:"#15803d",fontWeight:600}}>
                                ✓ Report submitted. Employer has been notified. You can re-submit if needed.
                              </div>
                            )}
                            <div className="report-grid">
                              <div className="fi">
                                <span className="fl">Overall Verdict</span>
                                <select className="in" value={reportVerdict} onChange={e=>setReportVerdict(e.target.value)}>
                                  {Object.entries(OVERALL_STATUS).map(([v,{label}])=>(
                                    <option key={v} value={v}>{label}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="fi">
                                <span className="fl">Report PDF <span style={{color:"#dc2626"}}>*</span></span>
                                <input type="file" accept=".pdf" style={{fontSize:"0.78rem",color:"#64748b"}} onChange={e=>setReportFile(e.target.files[0]||null)}/>
                              </div>
                            </div>
                            <div className="fi" style={{marginBottom:"0.75rem"}}>
                              <span className="fl">Summary / Remarks</span>
                              <textarea className="in" value={reportSummary} onChange={e=>setReportSummary(e.target.value)} placeholder="Brief summary of BGV findings…" rows={3} style={{resize:"vertical"}}/>
                            </div>
                            <button className="submit-btn" onClick={submitReport} disabled={submittingReport}>
                              {submittingReport ? "Submitting…" : reportDone ? "Re-submit Report" : "Submit Report to Employer →"}
                            </button>
                            {saveStatus && <div style={{marginTop:"0.5rem",fontSize:"0.78rem",fontWeight:600,color:saveStatus.startsWith("✓")?"#16a34a":"#dc2626"}}>{saveStatus}</div>}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="empty-state">Could not load case.</div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── INBOX TAB ── */}
          {tab === "inbox" && (
            <div style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:"1rem",background:"#fff",borderRadius:14,overflow:"hidden",boxShadow:"0 2px 8px rgba(30,26,62,0.08)",minHeight:480}}>
              {/* Thread list */}
              <div style={{borderRight:"1px solid #f1f5f9"}}>
                <div style={{padding:"0.9rem 1.25rem",borderBottom:"1px solid #f1f5f9",fontWeight:700,fontSize:"0.84rem",color:"#0f172a",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  Threads
                  <button onClick={()=>setShowNewMsg(v=>!v)} style={{padding:"0.25rem 0.6rem",borderRadius:6,border:`1.5px solid ${showNewMsg?"#4f46e5":"#e2e8f0"}`,background:showNewMsg?"#4f46e5":"#f8fafc",color:showNewMsg?"#fff":"#475569",fontSize:"0.66rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>✎ New</button>
                </div>
                <div style={{padding:"0.4rem 0 0.5rem"}}>
                  <input
                    type="text"
                    placeholder="Search messages…"
                    value={inboxSearch}
                    onChange={e => setInboxSearch(e.target.value)}
                    style={{width:"100%",padding:"0.45rem 0.8rem",border:"1.5px solid #e2e8f0",borderRadius:7,fontSize:"0.8rem",fontFamily:"inherit",outline:"none",boxSizing:"border-box",background:"#fafafa"}}
                  />
                </div>
                {showNewMsg ? (
                  cases.length === 0 ? <div className="empty-state">No assigned cases yet.</div> :
                  cases.map(c => (
                    <div key={c.consent_id} className="inbox-thread" onClick={()=>{loadThread(c.consent_id);setShowNewMsg(false);}}>
                      <div style={{fontWeight:700,fontSize:"0.84rem",color:"#0f172a"}}>{c.candidate_name}</div>
                      <div style={{fontSize:"0.72rem",color:"#64748b",margin:"0.15rem 0"}}>Employer: {c.requestor_name||c.requestor_email}</div>
                      {inbox.some(t=>t.consent_id===c.consent_id) && <div style={{fontSize:"0.65rem",color:"#4f46e5",fontWeight:600}}>Existing thread</div>}
                    </div>
                  ))
                ) : (
                  <>
                    {inbox.length === 0 && <div className="empty-state">No messages yet — tap "✎ New" to message a case.</div>}
                    {(inboxSearch
                      ? inbox.filter(t =>
                          (t.subject||"").toLowerCase().includes(inboxSearch.toLowerCase()) ||
                          (t.last_message||t.body||t.preview||"").toLowerCase().includes(inboxSearch.toLowerCase()) ||
                          (t.employer_name||t.employer_email||"").toLowerCase().includes(inboxSearch.toLowerCase()))
                      : inbox).map(t=>(
                      <div key={t.consent_id} className={`inbox-thread${activeThread===t.consent_id?" active":""}`} onClick={()=>loadThread(t.consent_id)}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"0.5rem"}}>
                          <div style={{fontWeight:700,fontSize:"0.84rem",color:"#0f172a"}}>{t.candidate_name}</div>
                          {t.unread_count>0 && <div className="unread-dot"/>}
                        </div>
                        <div style={{fontSize:"0.72rem",color:"#64748b",margin:"0.15rem 0"}}>{t.other_party_email}</div>
                        <div style={{fontSize:"0.75rem",color:"#94a3b8",fontStyle:"italic",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.latest_message}</div>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Thread viewer */}
              <div style={{display:"flex",flexDirection:"column"}}>
                {!activeThread ? (
                  <div className="empty-state">Select a thread to view messages.</div>
                ) : (
                  <>
                    <div style={{padding:"0.75rem 1.25rem",borderBottom:"1px solid #f1f5f9",fontSize:"0.84rem",fontWeight:700,color:"#0f172a",background:"#fafafa"}}>
                      Conversation
                      <span style={{fontSize:"0.7rem",fontWeight:500,color:"#64748b",marginLeft:"0.5rem"}}>Messages visible to you based on your role</span>
                    </div>
                    <div className="msg-thread" ref={msgListRef}>
                      {threadMsgs.length===0 && <div style={{color:"#94a3b8",fontSize:"0.84rem",textAlign:"center",padding:"2rem"}}>No messages yet.</div>}
                      {threadMsgs.map((m,i)=>{
                        const isMine = m.sender_role === "bgv";
                        const isNewSegment = m.consent_id && m.consent_id!==threadMsgs[i-1]?.consent_id;
                        const seg = isNewSegment ? (threadSegments[m.consent_id]||{}) : null;
                        return (
                          <div key={m.message_id}>
                          {isNewSegment && (
                            <div style={{display:"flex",alignItems:"center",gap:"0.6rem",margin:"0.9rem 0 0.6rem"}}>
                              <div style={{flex:1,height:1,background:"#e2e8f0"}}/>
                              <div style={{fontSize:"0.66rem",color:"#94a3b8",fontWeight:600,whiteSpace:"nowrap",textAlign:"center"}}>
                                {seg.requested_at ? new Date(seg.requested_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : ""}
                                {seg.bgv_vendor_name ? ` — BGV: ${seg.bgv_vendor_name}` : ""}
                              </div>
                              <div style={{flex:1,height:1,background:"#e2e8f0"}}/>
                            </div>
                          )}
                          <div style={{display:"flex",flexDirection:"column",alignItems:isMine?"flex-end":"flex-start"}}>
                            <div className={`msg-bubble${isMine?" mine":" theirs"}`}>
                              <div style={{fontSize:"0.68rem",fontWeight:700,marginBottom:"0.25rem",opacity:0.7}}>
                                {m.sender_name} ({m.sender_role})
                              </div>
                              {m.subject && <div style={{fontSize:"0.68rem",fontWeight:800,marginBottom:"0.3rem",opacity:0.85,textTransform:"uppercase",letterSpacing:"0.3px"}}>Sub: {m.subject}</div>}
                              {m.body}
                              {m.attachment_s3_key && (
                                <div style={{marginTop: (m.body||m.subject) ? "0.5rem" : 0,background:"#fff",border:"1px solid #e2e8f0",borderRadius:9,overflow:"hidden"}}>
                                  {/^\.(png|jpe?g|gif|webp)$/i.test(m.attachment_s3_key.slice(m.attachment_s3_key.lastIndexOf("."))) && msgAttachUrls[m.attachment_s3_key] ? (
                                    <a href={msgAttachUrls[m.attachment_s3_key]} target="_blank" rel="noopener noreferrer" style={{display:"block"}}>
                                      <img src={msgAttachUrls[m.attachment_s3_key]} alt="attachment" style={{width:"100%",maxHeight:180,objectFit:"cover",display:"block"}}/>
                                    </a>
                                  ) : (
                                    <a href={msgAttachUrls[m.attachment_s3_key]||"#"} target="_blank" rel="noopener noreferrer"
                                       style={{display:"flex",alignItems:"center",gap:"0.5rem",padding:"0.55rem 0.7rem",fontSize:"0.72rem",fontWeight:600,textDecoration:"none",color:"#1e293b"}}>
                                      <span style={{width:26,height:26,borderRadius:6,background:"#f8fafc",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.85rem",flexShrink:0}}>📄</span>
                                      <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.attachment_s3_key.split("/").pop()}</span>
                                    </a>
                                  )}
                                </div>
                              )}
                              <div className="msg-meta">{new Date(m.sent_at).toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
                            </div>
                          </div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{padding:"0.5rem 1.25rem 0",display:"flex",gap:"0.4rem",flexWrap:"wrap"}}>
                      {(() => {
                        const t = inbox.find(x=>x.consent_id===activeThread);
                        const employeeName = t?.employee_name || t?.candidate_name || "Candidate";
                        const employerName = t?.employer_name || "Employer";
                        const btnStyle = {padding:"0.3rem 0.6rem",borderRadius:999,border:`1.5px solid ${detectRecipientBgv(msgBody)==="employee"?"#4f46e5":"#e2e8f0"}`,background:detectRecipientBgv(msgBody)==="employee"?"#eef2ff":"#f8fafc",color:"#4f46e5",fontSize:"0.68rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"};
                        const btnStyle2 = {padding:"0.3rem 0.6rem",borderRadius:999,border:`1.5px solid ${detectRecipientBgv(msgBody)==="employer"?"#4f46e5":"#e2e8f0"}`,background:detectRecipientBgv(msgBody)==="employer"?"#eef2ff":"#f8fafc",color:"#4f46e5",fontSize:"0.68rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"};
                        return (<>
                          <button type="button" onClick={()=>setMention(employeeName,[employerName])} style={btnStyle}>@{employeeName}</button>
                          <button type="button" onClick={()=>setMention(employerName,[employeeName])} style={btnStyle2}>@{employerName}</button>
                          <button onClick={()=>manualRefreshThread(activeThread)} disabled={refreshingThread} title="Refresh" style={{background:"none",border:"none",cursor:refreshingThread?"not-allowed":"pointer",fontSize:refreshingThread?"0.66rem":"0.85rem",color:"#64748b",opacity:refreshingThread?0.6:1,padding:"0.2rem 0.4rem",fontWeight:600}}>{refreshingThread?"Refreshing…":"↻"}</button>
                          <span style={{marginLeft:"auto",fontSize:"0.66rem",fontWeight:700,color:"#94a3b8",alignSelf:"center"}}>{recipientLabelBgv(detectRecipientBgv(msgBody))}</span>
                        </>);
                      })()}
                    </div>
                    <div style={{padding:"0.4rem 1.25rem 0"}}>
                      <input placeholder="Subject (optional)" value={msgSubject} onChange={e=>setMsgSubject(e.target.value)}
                        style={{width:"100%",padding:"0.45rem 0.75rem",background:"#f8fafc",border:"1.5px solid #e2e8f0",borderRadius:7,fontFamily:"inherit",fontSize:"0.75rem",color:"#0f172a",outline:"none"}}/>
                    </div>
                    <div style={{padding:"0.4rem 1.25rem 0"}}>
                      <textarea className="msg-textarea" value={msgBody} onChange={e=>{setMsgBody(e.target.value);if(msgErr)setMsgErr("");}} placeholder="Type a message… tag @[candidate name] or @[employer name] to send" onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg();}}} style={{width:"100%"}}/>
                      {msgErr && <p style={{fontSize:"0.72rem",color:"#ef4444",fontWeight:600,marginTop:"0.3rem"}}>⚠️ {msgErr}</p>}
                    </div>
                    <div style={{padding:"0.4rem 1.25rem 0"}}>
                      {msgAttach ? (
                        <div style={{display:"flex",alignItems:"center",gap:"0.4rem",padding:"0.3rem 0.6rem",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:6,fontSize:"0.72rem"}}>
                          <span style={{color:"#16a34a",fontWeight:600}}>📎 {msgAttach.name}</span>
                          <button onClick={()=>setMsgAttach(null)} style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:"#dc2626",fontSize:"0.72rem",fontWeight:700}}>✕</button>
                        </div>
                      ) : (
                        <label style={{display:"inline-flex",alignItems:"center",gap:"0.3rem",cursor:"pointer",fontSize:"0.72rem",color:"#475569",padding:"0.3rem 0.65rem",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6}}>
                          {msgAttaching ? "Uploading…" : "📎 Attach file"}
                          <input type="file" style={{display:"none"}} onChange={e=>e.target.files[0]&&uploadMsgAttachment(e.target.files[0])} disabled={msgAttaching}/>
                        </label>
                      )}
                    </div>
                    <div style={{padding:"0.5rem 1.25rem 0.75rem",display:"flex",justifyContent:"flex-end"}}>
                      <button className="msg-send-btn" onClick={sendMsg} disabled={sendingMsg||!msgBody.trim()}>
                        {sendingMsg?"Sending…":"Send"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── STATS TAB ── */}
          {tab === "stats" && (() => {
            const total = cases.length;
            const groomed = cases.filter(c=>!c.bgv_status||c.bgv_status==="groomed").length;
            const inProg  = cases.filter(c=>c.bgv_status==="in_progress").length;
            const onHold  = cases.filter(c=>c.bgv_status==="on_hold").length;
            const done    = cases.filter(c=>c.bgv_status==="completed");
            const avgDays = done.length>0 ? Math.round(done.reduce((s,c)=>s+((c.bgv_updated_at||0)-(c.bgv_assigned_at||0))/86400000,0)/done.length) : null;
            const SC=(label,val,color,sub)=>(
              <div style={{background:"#fff",borderRadius:10,padding:"0.9rem",border:`2px solid ${color}25`,textAlign:"center"}}>
                <div style={{fontSize:"0.65rem",fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:1}}>{label}</div>
                <div style={{fontSize:"1.7rem",fontWeight:900,color,margin:"0.15rem 0"}}>{val}</div>
                <div style={{fontSize:"0.65rem",color:"#94a3b8"}}>{sub}</div>
              </div>
            );
            return (
              <div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:"0.6rem",marginBottom:"1rem"}}>
                  {SC("Total",total,"#4f46e5","all")}
                  {SC("Assigned",groomed,"#0d6e6e","not started")}
                  {SC("In Progress",inProg,"#d97706","active")}
                  {SC("On Hold",onHold,"#dc2626","needs info")}
                  {SC("Completed",done.length,"#16a34a","done")}
                  {SC("Avg Days",avgDays!==null?avgDays:"—","#6366f1","turnaround")}
                </div>
                {onHold>0&&(
                  <div style={{background:"#fef2f2",border:"1.5px solid #fecaca",borderRadius:10,padding:"0.75rem 1rem",marginBottom:"0.75rem"}}>
                    <div style={{fontWeight:700,fontSize:"0.78rem",color:"#dc2626",marginBottom:"0.3rem"}}>Cases on hold</div>
                    {cases.filter(c=>c.bgv_status==="on_hold").map(c=>(
                      <div key={c.consent_id} onClick={()=>{setSelectedId(c.consent_id);setTab("cases");}} style={{fontSize:"0.78rem",color:"#0f172a",padding:"0.15rem 0",cursor:"pointer"}}>
                        {c.candidate_name} — {c.requestor_name}
                      </div>
                    ))}
                  </div>
                )}
                <div style={{background:"#fff",borderRadius:10,padding:"0.9rem"}}>
                  <div style={{fontWeight:700,fontSize:"0.8rem",color:"#0f172a",marginBottom:"0.4rem"}}>Result breakdown</div>
                  {done.length===0&&<div style={{color:"#94a3b8",fontSize:"0.76rem"}}>No completed cases yet.</div>}
                  {["green","amber","red"].map(flag=>{
                    const cnt=done.filter(c=>c.bgv_result_flag===flag).length;
                    const rf=RESULT_FLAG[flag];
                    return cnt>0?(
                      <div key={flag} style={{display:"flex",justifyContent:"space-between",padding:"0.35rem 0",borderBottom:"1px solid #f1f5f9"}}>
                        <span style={{fontSize:"0.78rem",color:rf.color,fontWeight:700}}>{rf.label}</span>
                        <span style={{fontSize:"0.78rem",fontWeight:900,color:rf.color}}>{cnt}</span>
                      </div>
                    ):null;
                  })}
                </div>
              </div>
            );
          })()}

          {/* ── REPORTS TAB ── */}
          {tab === "reports" && (() => {
            const byEmployer = {};
            cases.forEach(c => {
              const key = c.requestor_email || "unknown";
              if (!byEmployer[key]) byEmployer[key] = { name: c.requestor_name || c.requestor_email, email: c.requestor_email, cases: [] };
              byEmployer[key].cases.push(c);
            });
            const employerStats = Object.values(byEmployer).map(e => ({
              ...e,
              total: e.cases.length,
              completed: e.cases.filter(c => c.bgv_status === "completed").length,
              pending: e.cases.filter(c => c.bgv_status !== "completed").length,
              failed: e.cases.filter(c => c.bgv_result_flag === "red").length,
            })).sort((a,b) => b.total - a.total);
            const activeEmployer = selectedEmployer ? employerStats.find(e => e.email === selectedEmployer) : null;
            return (
            <div style={{background:"#fff",borderRadius:14,padding:"1.25rem",boxShadow:"0 2px 8px rgba(30,26,62,0.08)",marginBottom:"1rem"}}>
              <div style={{fontWeight:700,fontSize:"0.9rem",color:"#0f172a",marginBottom:"1rem"}}>Employer-wise Case Statistics</div>
              {employerStats.length===0 && <div className="empty-state">No cases assigned yet.</div>}
              {!activeEmployer && employerStats.map(e => (
                <div key={e.email} onClick={()=>setSelectedEmployer(e.email)}
                  style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.85rem 1rem",border:"1px solid #f1f5f9",borderRadius:10,marginBottom:"0.65rem",cursor:"pointer",transition:"border-color 0.15s"}}
                  onMouseEnter={ev=>ev.currentTarget.style.borderColor="#4f46e5"} onMouseLeave={ev=>ev.currentTarget.style.borderColor="#f1f5f9"}>
                  <div>
                    <div style={{fontWeight:700,fontSize:"0.875rem",color:"#0f172a"}}>{e.name}</div>
                    <div style={{fontSize:"0.72rem",color:"#64748b",marginTop:"0.15rem"}}>{e.email}</div>
                  </div>
                  <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap",justifyContent:"flex-end"}}>
                    <span style={{fontWeight:700,fontSize:"0.72rem",color:"#0f172a",background:"#f8fafc",padding:"0.2rem 0.6rem",borderRadius:999}}>{e.total} total</span>
                    <span style={{fontWeight:700,fontSize:"0.72rem",color:"#16a34a",background:"#f0fdf4",padding:"0.2rem 0.6rem",borderRadius:999}}>{e.completed} completed</span>
                    <span style={{fontWeight:700,fontSize:"0.72rem",color:"#d97706",background:"#fffbeb",padding:"0.2rem 0.6rem",borderRadius:999}}>{e.pending} pending</span>
                    {e.failed>0 && <span style={{fontWeight:700,fontSize:"0.72rem",color:"#dc2626",background:"#fef2f2",padding:"0.2rem 0.6rem",borderRadius:999}}>{e.failed} failed</span>}
                  </div>
                </div>
              ))}
              {activeEmployer && (
                <div>
                  <button onClick={()=>setSelectedEmployer(null)} style={{background:"none",border:"none",color:"#4f46e5",fontWeight:600,fontSize:"0.78rem",cursor:"pointer",padding:0,marginBottom:"0.85rem",fontFamily:"inherit"}}>← Back to all employers</button>
                  <div style={{fontWeight:700,fontSize:"0.85rem",color:"#0f172a",marginBottom:"0.25rem"}}>{activeEmployer.name}</div>
                  <div style={{fontSize:"0.72rem",color:"#64748b",marginBottom:"0.85rem"}}>{activeEmployer.total} total · {activeEmployer.completed} completed · {activeEmployer.pending} pending{activeEmployer.failed>0?` · ${activeEmployer.failed} failed`:""}</div>
                  {activeEmployer.cases.map(c => {
                    const bs = BGV_STATUS_BADGE[c.bgv_status] || BGV_STATUS_BADGE.groomed;
                    const ov = OVERALL_STATUS[c.bgv_overall_status];
                    return (
                      <div key={c.consent_id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.7rem 0.9rem",border:"1px solid #f1f5f9",borderRadius:9,marginBottom:"0.5rem"}}>
                        <div style={{fontWeight:600,fontSize:"0.82rem",color:"#0f172a"}}>{c.candidate_name}</div>
                        <div style={{display:"flex",gap:"0.4rem",flexWrap:"wrap",justifyContent:"flex-end"}}>
                          <span style={{fontWeight:700,fontSize:"0.68rem",color:bs.color,background:bs.bg,padding:"0.15rem 0.55rem",borderRadius:999}}>{bs.label}</span>
                          {ov && <span style={{fontWeight:700,fontSize:"0.68rem",color:ov.color,background:`${ov.color}15`,padding:"0.15rem 0.55rem",borderRadius:999}}>{ov.label}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            );
          })()}
          {tab === "reports" && (
            <div style={{background:"#fff",borderRadius:14,padding:"1.25rem",boxShadow:"0 2px 8px rgba(30,26,62,0.08)"}}>
              <div style={{fontWeight:700,fontSize:"0.9rem",color:"#0f172a",marginBottom:"1rem"}}>Submitted Reports</div>
              {cases.filter(c=>c.bgv_report_key).length===0 && <div className="empty-state">No reports submitted yet.</div>}
              {cases.filter(c=>c.bgv_report_key).map(c=>{
                const ov = OVERALL_STATUS[c.bgv_overall_status];
                return (
                  <div key={c.consent_id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.85rem 1rem",border:"1px solid #f1f5f9",borderRadius:10,marginBottom:"0.65rem"}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:"0.875rem",color:"#0f172a"}}>{c.candidate_name}</div>
                      <div style={{fontSize:"0.75rem",color:"#64748b",marginTop:"0.15rem"}}>{c.requestor_name} · Submitted {isoDate(c.bgv_updated_at)}</div>
                    </div>
                    <div style={{display:"flex",gap:"0.4rem",flexWrap:"wrap",justifyContent:"flex-end"}}>
                      {RESULT_FLAG[c.bgv_result_flag]&&<span style={{fontWeight:800,fontSize:"0.72rem",color:RESULT_FLAG[c.bgv_result_flag].color,background:RESULT_FLAG[c.bgv_result_flag].bg,padding:"0.2rem 0.6rem",borderRadius:999}}>{RESULT_FLAG[c.bgv_result_flag].label}</span>}
                      {ov && <span style={{fontWeight:800,fontSize:"0.72rem",color:ov.color,background:`${ov.color}15`,padding:"0.2rem 0.6rem",borderRadius:999}}>{ov.label}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
