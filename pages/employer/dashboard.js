// pages/employer/dashboard.js
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;
const DATA_TABS = ["Overview", "Education", "Employment", "UAN & PF", "Documents"];

// ── Normalizers ───────────────────────────────────────────────────────
const normalizeEducation = (ed = {}) => {
  const isNewFormat = !!(ed.xSchool || ed.xBoard || ed.xiiSchool || ed.degCollege || ed.pgCollege);
  if (isNewFormat) {
    return {
      classX:        { school: ed.xSchool, board: ed.xBoard, yearOfPassing: ed.xYear, resultValue: ed.xPercent },
      intermediate:  { school: ed.xiiSchool, board: ed.xiiBoard, yearOfPassing: ed.xiiYear, resultValue: ed.xiiPercent },
      undergraduate: { college: ed.degCollege, course: ed.degName, branch: ed.degBranch, yearOfPassing: ed.degYear, resultValue: ed.degPercent },
      postgraduate:  { college: ed.pgCollege, course: ed.pgName, branch: ed.pgBranch, yearOfPassing: ed.pgYear, resultValue: ed.pgPercent },
    };
  }
  return {
    classX:        ed?.classX        || ed?.class_x   || {},
    intermediate:  ed?.intermediate  || ed?.classXII  || ed?.class_xii || {},
    undergraduate: ed?.undergraduate || ed?.ug        || {},
    postgraduate:  ed?.postgraduate  || ed?.pg        || {},
  };
};

const normalizeProfile = (snap = {}) => {
  const u = snap?.uanMaster || snap?.uan_master || {};
  return {
    ...snap,
    education:    normalizeEducation(snap?.education || {}),
    uanNumber:    snap?.uanNumber    || snap?.uan_number    || u?.uanNumber    || u?.uan_number,
    nameAsPerUan: snap?.nameAsPerUan || snap?.name_as_per_uan || u?.nameAsPerUan || u?.name_as_per_uan,
    mobileLinked: snap?.mobileLinked || snap?.mobile_linked  || u?.mobileLinked || u?.mobile_linked,
    isActive:     snap?.isActive     || snap?.is_active      || u?.isActive     || u?.is_active,
    pfRecords:    Array.isArray(snap?.pfRecords) ? snap.pfRecords : Array.isArray(snap?.pf_records) ? snap.pf_records : [],
  };
};

function toIST(ts) {
  if (!ts) return "—";
  try {
    const d = new Date(typeof ts === "number" && ts < 1e12 ? ts * 1000 : ts);
    return d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return "—"; }
}

function toISTDate(ts) {
  if (!ts) return "—";
  try {
    const d = new Date(typeof ts === "number" && ts < 1e12 ? ts * 1000 : ts);
    return d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric" });
  } catch { return "—"; }
}

function maskAadhaar(a) {
  if (!a) return "—";
  const d = String(a).replace(/\D/g, "");
  if (d.length < 4) return "XXXX XXXX XXXX";
  return `XXXX XXXX ${d.slice(-4)}`;
}

// ── PDF Print ─────────────────────────────────────────────────────────
function printProfile(profile, empHistory, documents, employerName) {
  const d = profile || {};
  const cur  = d.currentAddress   || {};
  const perm = d.permanentAddress || {};
  const edu  = d.education        || {};

  const docLinks = [];
  if (documents) {
    const DOC_LABELS = {
      aadhaar:"Aadhaar Card", pan:"PAN Card", photo:"Profile Photo", passport:"Passport",
      classX:"Class X Certificate", intermediate:"Intermediate Certificate",
      ug_provisional:"UG Provisional Marksheet", ug_convocation:"UG Convocation Certificate",
      pg_provisional:"PG Provisional Marksheet", pg_convocation:"PG Convocation Certificate",
      diploma:"Diploma Certificate", uanCard:"UAN Card / Passbook",
      payslips:"Payslips", offerLetter:"Offer Letter",
      resignation:"Resignation Acceptance", experience:"Experience / Relieving Letter",
      idCard:"Company ID Card", cv:"Resume / CV",
    };
    for (const [group, docs] of Object.entries(documents)) {
      for (const [subKey, doc] of Object.entries(docs)) {
        docLinks.push({ label: DOC_LABELS[subKey] || subKey, url: doc.url, group });
      }
    }
  }

  const row = (label, value) => value && value !== "—" ? `
    <tr>
      <td style="padding:5px 10px;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;width:38%;border-bottom:1px solid #f1f5f9">${label}</td>
      <td style="padding:5px 10px;color:#0f172a;font-size:12px;border-bottom:1px solid #f1f5f9">${value}</td>
    </tr>` : "";

  const section = (title, rows) => rows.trim() ? `
    <div style="margin-bottom:20px">
      <div style="background:#1e293b;color:#fff;padding:6px 12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;border-radius:4px;margin-bottom:8px">${title}</div>
      <table style="width:100%;border-collapse:collapse">${rows}</table>
    </div>` : "";

  const eduSection = (title, s) => {
    if (!s || !Object.values(s).some(Boolean)) return "";
    return section(title, [
      row("Institution", s.school || s.college),
      row("Board / University", s.board || s.university),
      row("Course / Degree", s.course),
      row("Branch / Specialization", s.branch || s.specialization),
      row("Year of Passing", s.yearOfPassing),
      row("Result", s.resultValue ? `${s.resultType || ""} ${s.resultValue}`.trim() : ""),
      row("Mode", s.mode),
      row("Medium", s.medium),
      row("Backlogs", s.backlogs),
    ].join(""));
  };

  const win = window.open("", "_blank");
  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Datagate — ${[d.firstName, d.lastName].filter(Boolean).join(" ")} — BGV Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #0f172a; font-size: 12px; }
    @media print {
      .no-print { display: none !important; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      a { color: #2563eb !important; }
    }
  </style>
</head>
<body style="padding:32px;max-width:860px;margin:0 auto">

  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #1e293b">
    <div>
      <div style="font-size:22px;font-weight:800;color:#1e293b;letter-spacing:-0.5px">Datagate</div>
      <div style="font-size:10px;color:#64748b;letter-spacing:1.5px;text-transform:uppercase;margin-top:2px">Background Verification Report</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:11px;color:#64748b">Generated: ${new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})}</div>
      <div style="font-size:11px;color:#64748b;margin-top:2px">Requested by: ${employerName || "—"}</div>
      <div style="margin-top:6px;display:inline-block;background:#dcfce7;color:#15803d;padding:3px 10px;border-radius:999px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Employee Consented</div>
    </div>
  </div>

  <!-- Name banner -->
  <div style="background:#1e293b;color:#fff;padding:14px 20px;border-radius:8px;margin-bottom:20px;display:flex;align-items:center;gap:16px">
    <div>
      <div style="font-size:18px;font-weight:700">${[d.firstName, d.middleName, d.lastName].filter(Boolean).join(" ") || "—"}</div>
      <div style="font-size:11px;color:#94a3b8;margin-top:3px">${d.email || ""} ${d.mobile ? "· +91 " + d.mobile : ""}</div>
    </div>
  </div>

  <!-- Page 1: Personal -->
  ${section("Personal Information", [
    row("Date of Birth", d.dob),
    row("Gender", d.gender),
    row("Nationality", d.nationality),
    row("Blood Group", d.bloodGroup),
    row("Marital Status", d.maritalStatus),
    row("Father's Name", d.fatherName || [d.fatherFirst, d.fatherMiddle, d.fatherLast].filter(Boolean).join(" ")),
    row("Mother's Name", d.motherName || [d.motherFirst, d.motherMiddle, d.motherLast].filter(Boolean).join(" ")),
  ].join(""))}

  ${section("Identity Documents", [
    row("Aadhaar Number", maskAadhaar(d.aadhaar || d.aadhar)),
    row("Name as per Aadhaar", d.nameAsPerAadhaar),
    row("PAN Number", d.pan),
    row("Name as per PAN", d.nameAsPerPan),
    row("Has Passport", d.hasPassport),
    d.hasPassport === "Yes" ? row("Passport Number", d.passport) : "",
    d.hasPassport === "Yes" ? row("Passport Issue Date", d.passportIssue) : "",
    d.hasPassport === "Yes" ? row("Passport Expiry Date", d.passportExpiry) : "",
  ].join(""))}

  ${section("Emergency Contact", [
    row("Name", d.emergName),
    row("Relationship", d.emergRel),
    row("Phone", d.emergPhone),
  ].join(""))}

  ${section("Current Address", [
    row("Door / Street", cur.door),
    row("Village / Area", cur.village),
    row("Tehsil / Taluk", cur.locality),
    row("District", cur.district),
    row("State", cur.state),
    row("Pincode", cur.pin),
    row("Residing From", cur.from),
  ].join(""))}

  ${(perm.door || perm.state) ? section("Permanent / Native Address", [
    row("Door / Street", perm.door),
    row("Village / Area", perm.village),
    row("District", perm.district),
    row("State", perm.state),
    row("Pincode", perm.pin),
  ].join("")) : ""}

  ${section("Bank Account Details", [
    row("Bank Name", d.bankName === "Other" && d.bankOther ? `Other — ${d.bankOther}` : d.bankName),
    row("Account Holder Name", d.bankAccountName),
    row("IFSC Code", d.ifsc),
    row("Branch", d.branch),
    row("Account Type", d.accountType),
    row("Account Number", d.accountFull ? "•".repeat(Math.max(0, d.accountFull.length - 4)) + d.accountFull.slice(-4) : (d.accountLast4 ? `••••••••${d.accountLast4}` : "")),
  ].join(""))}

  <!-- Page 2: Education -->
  ${eduSection("Education — Class X (SSC / Matriculation)", edu.classX)}
  ${eduSection("Education — Intermediate / HSC / 12th", edu.intermediate)}
  ${edu.diploma?.institute ? eduSection("Education — Diploma", edu.diploma) : ""}
  ${eduSection("Education — Undergraduate / Degree", edu.undergraduate)}
  ${edu.postgraduate?.college ? eduSection("Education — Postgraduate / Masters", edu.postgraduate) : ""}

  ${Array.isArray(edu.certifications) && edu.certifications.length > 0 ? section("Professional Certifications", edu.certifications.map((c,i) => row(`Certification ${i+1}`, c.name)).join("")) : ""}

  ${Array.isArray(edu.professionalQualifications) && edu.professionalQualifications.length > 0 ? section("Professional Qualifications", edu.professionalQualifications.map((q,i) => [row(`Qualification ${i+1} Type`, q.type), row(`Qualification ${i+1} Level`, q.level), row(`Qualification ${i+1} Year`, q.year)].join("")).join("")) : ""}

  ${Array.isArray(edu.articleships) && edu.articleships.length > 0 ? section("Articleship / Practical Training", edu.articleships.map((a,i) => [row(`Training ${i+1} Type`, a.type), row(`Training ${i+1} Firm`, a.firm), row(`Training ${i+1} From`, a.from), row(`Training ${i+1} To`, a.to || (a.isOngoing === "Ongoing" ? "Ongoing" : ""))].join("")).join("")) : ""}

  ${edu.hasEduGap === "Yes" ? section("Education Gap", [row("Gap Before First Job", edu.hasEduGap), row("Reason", edu.eduGapReason)].join("")) : ""}

  <!-- Page 3: Employment -->
  ${empHistory.length > 0 ? empHistory.map((e, i) => section(
    i === 0 ? "Employment — Current / Most Recent Employer" : `Employment — Previous Employer ${i}`,
    [
      row("Company Name", e.companyName),
      row("Designation", e.designation),
      row("Department", e.department),
      row("Employment Type", e.employmentType),
      row("Employee ID", e.employeeId),
      row("Work Email", e.workEmail),
      row("Office Address", e.officeAddress),
      row("Date of Joining", e.startDate),
      i === 0 ? row("Currently Working", e.currentlyWorking === "Yes" ? "Yes — Still Employed" : "No") : row("Date of Leaving", e.endDate),
      row("Reason for Leaving", e.reasonForRelieving),
      row("Duties & Responsibilities", e.duties),
      e.employmentType === "Contract" ? row("Vendor Company", e.contractVendor?.company) : "",
      row("Reference Name", e.reference?.name),
      row("Reference Role", e.reference?.role),
      row("Reference Email", e.reference?.email),
      row("Reference Mobile", e.reference?.mobile),
      e.gap?.hasGap === "Yes" ? row("Employment Gap Reason", e.gap?.reason) : "",
    ].join("")
  )).join("") : ""}

  <!-- Page 4: UAN -->
  ${section("UAN / EPFO Details", [
    row("Has UAN", d.hasUan === "yes" || d.hasUan === true ? "Yes" : "No"),
    row("UAN Number", d.uanNumber),
    row("Name as per UAN", d.nameAsPerUan),
    row("Mobile Linked to UAN", d.mobileLinked),
    row("UAN Active", d.isActive),
  ].join(""))}

  ${Array.isArray(d.pfRecords) && d.pfRecords.length > 0 ? d.pfRecords.filter(pf => pf.companyName).map((pf, i) => section(
    `PF Record — ${pf.companyName || `Employer ${i+1}`}`,
    pf.hasPf === "No"
      ? row("PF Status", "PF not maintained by this employer")
      : [
          row("PF Member ID", pf.pfMemberId),
          row("Date of Joining (EPFO)", pf.dojEpfo),
          row("Date of Exit (EPFO)", pf.doeEpfo),
          row("PF Transferred", pf.pfTransferred),
        ].join("")
  )).join("") : ""}

  <!-- Documents -->
  ${docLinks.length > 0 ? `
  <div style="margin-bottom:20px">
    <div style="background:#1e293b;color:#fff;padding:6px 12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;border-radius:4px;margin-bottom:8px">Uploaded Documents</div>
    <table style="width:100%;border-collapse:collapse">
      ${docLinks.map(dl => `
      <tr>
        <td style="padding:5px 10px;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;width:38%;border-bottom:1px solid #f1f5f9">${dl.label}</td>
        <td style="padding:5px 10px;font-size:12px;border-bottom:1px solid #f1f5f9"><a href="${dl.url}" style="color:#2563eb">View Document ↗</a></td>
      </tr>`).join("")}
    </table>
    <p style="font-size:10px;color:#94a3b8;margin-top:8px">⚠ Document links expire in 1 hour. Re-generate from Datagate dashboard if links are expired.</p>
  </div>` : ""}

  <!-- Footer -->
  <div style="border-top:1px solid #e2e8f0;padding-top:12px;margin-top:24px;display:flex;justify-content:space-between">
    <div style="font-size:10px;color:#94a3b8">Generated by Datagate · datagate.co.in</div>
    <div style="font-size:10px;color:#94a3b8">All data is self-reported by the employee. Datagate does not independently verify accuracy.</div>
  </div>

  <div class="no-print" style="position:fixed;bottom:24px;right:24px;display:flex;gap:12px">
    <button onclick="window.print()" style="padding:10px 24px;background:#1e293b;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer">🖨 Print / Save PDF</button>
    <button onclick="window.close()" style="padding:10px 24px;background:#f1f5f9;color:#475569;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer">Close</button>
  </div>
</body>
</html>`);
  win.document.close();
}

// ── Styles ────────────────────────────────────────────────────────────
const G = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f4f6fb; font-family: 'IBM Plex Sans', sans-serif; color: #0f172a; }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }

  .page { display: flex; min-height: 100vh; }

  /* ── Sidebar ── */
  .sidebar {
    width: 280px; min-width: 280px; background: #0d1117;
    display: flex; flex-direction: column;
    height: 100vh; position: sticky; top: 0; overflow-y: auto;
  }

  .side-header {
    padding: 1.25rem 1.1rem 1rem;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex; align-items: center; justify-content: space-between;
  }
  .brand-wrap { display: flex; align-items: center; gap: 0.6rem; }
  .brand-mark {
    width: 28px; height: 28px; border-radius: 7px;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; flex-shrink: 0;
  }
  .brand-name { font-size: 1rem; font-weight: 700; color: #f8fafc; letter-spacing: -0.2px; }
  .brand-role { font-size: 0.6rem; color: #475569; text-transform: uppercase; letter-spacing: 1px; margin-top: 1px; }
  .signout-btn {
    width: 28px; height: 28px; border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.08); background: transparent;
    color: #475569; font-size: 0.85rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center; transition: all 0.15s;
  }
  .signout-btn:hover { border-color: #ef4444; color: #ef4444; }

  .user-strip {
    padding: 0.75rem 1.1rem;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.02);
  }
  .user-email { font-size: 0.75rem; color: #94a3b8; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .user-tag { display: inline-block; margin-top: 3px; font-size: 0.6rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: #2563eb; background: rgba(37,99,235,0.12); padding: 1px 6px; border-radius: 4px; }

  .req-box { padding: 0.9rem 1.1rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .req-label { font-size: 0.6rem; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem; }
  .req-input {
    width: 100%; padding: 0.5rem 0.7rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 6px; font-family: inherit; font-size: 0.78rem;
    color: #e2e8f0; outline: none; transition: border-color 0.15s; margin-bottom: 0.4rem;
  }
  .req-input::placeholder { color: #334155; }
  .req-input:focus { border-color: #2563eb; background: rgba(37,99,235,0.06); }
  .req-textarea { resize: vertical; min-height: 48px; line-height: 1.45; }
  .req-msg { font-size: 0.7rem; margin: 0 0 0.35rem; }
  .req-msg.err { color: #f87171; } .req-msg.ok { color: #4ade80; }
  .req-btn {
    width: 100%; padding: 0.52rem; background: #2563eb; color: #fff;
    border: none; border-radius: 6px; font-family: inherit;
    font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: background 0.15s;
  }
  .req-btn:hover:not(:disabled) { background: #1d4ed8; }
  .req-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .filter-row { display: flex; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .filter-btn {
    flex: 1; padding: 0.55rem 0; background: none; border: none;
    border-bottom: 2px solid transparent; font-size: 0.65rem; font-weight: 600;
    color: #334155; cursor: pointer; transition: color 0.15s;
    text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: -1px;
    display: flex; align-items: center; justify-content: center; gap: 4px;
  }
  .filter-btn:hover { color: #64748b; }
  .filter-btn.active { color: #e2e8f0; border-bottom-color: #2563eb; }
  .filter-count {
    padding: 0 5px; border-radius: 3px; font-size: 0.6rem; font-weight: 700;
    background: rgba(255,255,255,0.06); color: #475569;
  }
  .filter-btn.active .filter-count { background: #2563eb; color: #fff; }

  .search-row { padding: 0.6rem 0.9rem 0.25rem; }
  .search-in {
    width: 100%; padding: 0.4rem 0.65rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 5px; font-family: inherit;
    font-size: 0.72rem; color: #94a3b8; outline: none;
  }
  .search-in::placeholder { color: #1e293b; }
  .search-in:focus { border-color: #2563eb; }

  .consent-list { flex: 1; overflow-y: auto; padding: 0.25rem 0.5rem 2rem; }
  .list-empty { font-size: 0.72rem; color: #1e293b; padding: 1rem 0.6rem; }

  .c-row {
    display: flex; align-items: flex-start; gap: 0.55rem;
    padding: 0.6rem 0.65rem; border-radius: 7px; cursor: pointer;
    margin-bottom: 1px; transition: background 0.1s;
  }
  .c-row:hover { background: rgba(255,255,255,0.03); }
  .c-row.active { background: rgba(37,99,235,0.1); }
  .c-pip { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
  .c-em { font-size: 0.73rem; color: #cbd5e1; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .c-note { font-size: 0.65rem; color: #334155; font-style: italic; margin-top: 1px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .c-time { font-size: 0.62rem; color: #1e3a5f; margin-top: 1px; }

  /* ── Main ── */
  .main { flex: 1; overflow-y: auto; min-width: 0; background: #f4f6fb; }

  .main-header {
    background: #fff; border-bottom: 1px solid #e8ecf3;
    padding: 1rem 1.75rem; display: flex; align-items: center;
    justify-content: space-between; position: sticky; top: 0; z-index: 10;
  }
  .main-title { font-size: 0.8rem; font-weight: 600; color: #64748b; }
  .main-title strong { color: #0f172a; font-size: 0.93rem; }

  .empty-pane {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; height: calc(100vh - 56px); gap: 0.6rem;
  }
  .empty-glyph { font-size: 36px; opacity: 0.2; }
  .empty-h { font-size: 0.93rem; font-weight: 600; color: #94a3b8; }
  .empty-s { font-size: 0.78rem; color: #cbd5e1; }

  /* ── Profile pane ── */
  .profile-pane { padding: 1.5rem 1.75rem; }

  .p-hero {
    background: #0d1117; border-radius: 12px;
    padding: 1.25rem 1.5rem; margin-bottom: 1.1rem;
    display: flex; justify-content: space-between; align-items: flex-start;
    flex-wrap: wrap; gap: 1rem;
  }
  .p-name-big { font-size: 1.3rem; font-weight: 700; color: #f8fafc; letter-spacing: -0.3px; }
  .p-email-line { font-size: 0.78rem; color: #64748b; margin-top: 3px; font-family: 'IBM Plex Mono', monospace; }
  .p-badges { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.75rem; }
  .badge {
    padding: 0.18rem 0.65rem; border-radius: 4px;
    font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
  }
  .badge-approved { background: rgba(34,197,94,0.15); color: #4ade80; }
  .badge-pending  { background: rgba(234,179,8,0.15);  color: #fbbf24; }
  .badge-declined { background: rgba(239,68,68,0.15);  color: #f87171; }
  .badge-snap     { background: rgba(99,102,241,0.15); color: #a5b4fc; }

  .p-actions { display: flex; gap: 0.5rem; }
  .act-btn {
    padding: 0.45rem 1rem; border-radius: 7px; font-family: inherit;
    font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.15s;
    border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.06); color: #94a3b8;
  }
  .act-btn:hover { border-color: rgba(255,255,255,0.2); color: #e2e8f0; }
  .act-btn.primary { background: #2563eb; border-color: #2563eb; color: #fff; }
  .act-btn.primary:hover { background: #1d4ed8; }

  .self-rep-note {
    background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px;
    padding: 0.6rem 0.9rem; font-size: 0.72rem; color: #92400e;
    margin-bottom: 1.1rem; line-height: 1.5;
  }

  .status-box {
    background: #fff; border: 1px solid #e8ecf3; border-radius: 10px;
    padding: 1.1rem 1.25rem; font-size: 0.84rem; color: #64748b;
  }
  .status-box.declined { background: #fef2f2; border-color: #fecaca; color: #dc2626; }

  /* ── Data tabs ── */
  .dtab-row {
    display: flex; gap: 0; background: #fff;
    border-bottom: 1.5px solid #e8ecf3;
    border-radius: 10px 10px 0 0; overflow: hidden; margin-bottom: 0;
  }
  .dtab {
    flex: 1; padding: 0.7rem 0.5rem; background: none; border: none;
    border-bottom: 2.5px solid transparent; font-family: inherit;
    font-size: 0.75rem; font-weight: 500; color: #94a3b8; cursor: pointer;
    margin-bottom: -1.5px; transition: all 0.15s; white-space: nowrap;
  }
  .dtab:hover { color: #475569; background: #f8fafc; }
  .dtab.active { color: #2563eb; border-bottom-color: #2563eb; font-weight: 700; background: #fff; }

  /* ── Content cards ── */
  .tab-body {
    background: #fff; border-radius: 0 0 10px 10px;
    border: 1px solid #e8ecf3; border-top: none;
    padding: 1.25rem 1.4rem; margin-bottom: 1.1rem;
  }

  .sec-block { margin-bottom: 1.25rem; }
  .sec-block:last-child { margin-bottom: 0; }
  .sec-head {
    font-size: 0.62rem; font-weight: 700; color: #94a3b8;
    text-transform: uppercase; letter-spacing: 1px;
    padding-bottom: 0.5rem; margin-bottom: 0.75rem;
    border-bottom: 1px solid #f1f5f9;
  }
  .kv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.7rem; }
  .kv { display: flex; flex-direction: column; gap: 2px; }
  .kv-k { font-size: 0.62rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
  .kv-v { font-size: 0.84rem; color: #0f172a; font-weight: 500; word-break: break-word; }
  .kv-v.mono { font-family: 'IBM Plex Mono', monospace; font-size: 0.78rem; }
  .kv-v.empty { color: #cbd5e1; font-style: italic; font-weight: 400; font-size: 0.78rem; }
  .no-data { font-size: 0.78rem; color: #94a3b8; padding: 0.75rem; background: #f8fafc; border-radius: 6px; }

  .emp-block {
    border: 1px solid #e8ecf3; border-radius: 8px;
    padding: 1rem 1.1rem; margin-bottom: 0.75rem;
    position: relative; overflow: hidden;
  }
  .emp-block::before { content: ''; position: absolute; top: 0; left: 0; bottom: 0; width: 3px; background: #2563eb; }
  .emp-block-title { font-size: 0.72rem; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 0.65rem; padding-left: 4px; }

  .edu-block {
    border: 1px solid #e8ecf3; border-radius: 8px;
    padding: 1rem 1.1rem; margin-bottom: 0.75rem;
  }
  .edu-block-title { font-size: 0.72rem; font-weight: 700; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 0.65rem; }

  /* ── Documents tab ── */
  .doc-group-title { font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; margin: 1rem 0 0.4rem; }
  .doc-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.55rem 0.85rem; background: #f8fafc; border: 1px solid #e8ecf3;
    border-radius: 6px; margin-bottom: 0.35rem;
  }
  .doc-name { font-size: 0.8rem; font-weight: 600; color: #0f172a; }
  .doc-meta { font-size: 0.65rem; color: #94a3b8; margin-top: 1px; font-family: 'IBM Plex Mono', monospace; }
  .doc-view {
    padding: 0.32rem 0.8rem; background: #0f172a; color: #fff;
    border-radius: 5px; font-size: 0.72rem; font-weight: 600;
    text-decoration: none; white-space: nowrap; transition: background 0.15s;
  }
  .doc-view:hover { background: #1e293b; }

  @media(max-width:768px){
    .sidebar { width: 100%; height: auto; position: relative; }
    .page { flex-direction: column; }
    .main { padding: 0; }
    .profile-pane { padding: 1rem; }
  }
`;

// ── Terms Modal ───────────────────────────────────────────────────────
function TermsModal({ onAccept }) {
  const [checked, setChecked] = useState(false);
  const [accepting, setAccepting] = useState(false);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(10,15,30,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,backdropFilter:"blur(4px)"}}>
      <div style={{background:"#fff",borderRadius:14,padding:"2rem",maxWidth:500,width:"90%",boxShadow:"0 32px 80px rgba(0,0,0,0.3)",maxHeight:"90vh",display:"flex",flexDirection:"column",gap:"1.1rem"}}>
        <div>
          <div style={{fontSize:"1rem",fontWeight:700,color:"#0f172a",marginBottom:"0.2rem"}}>Data Access & Sharing Agreement</div>
          <div style={{fontSize:"0.75rem",color:"#64748b"}}>Please read and accept before accessing employee profiles</div>
        </div>
        <div style={{overflowY:"auto",maxHeight:280,fontSize:"0.78rem",color:"#374151",lineHeight:1.7,padding:"0.875rem",background:"#f8fafc",borderRadius:8,border:"1px solid #e2e8f0"}}>
          <p><strong>1. Purpose of Data Access</strong><br/>You are accessing employee profile data solely for background verification and/or onboarding of the employee who has given explicit consent.</p>
          <p style={{marginTop:"0.6rem"}}><strong>2. Data Usage Restrictions</strong><br/>You agree not to use this data for any purpose beyond what was stated at the time of consent. You will not share, sell, or transfer this data to any third party without fresh employee consent.</p>
          <p style={{marginTop:"0.6rem"}}><strong>3. Data Storage Obligations</strong><br/>If you store data received from Datagate in your own systems, you become a Data Processor under India's DPDP Act 2023 and are solely responsible for its secure storage and deletion upon request.</p>
          <p style={{marginTop:"0.6rem"}}><strong>4. Self-Reported Data</strong><br/>All profile information is self-reported by the employee. Datagate does not independently verify accuracy unless a verified check has been explicitly completed.</p>
          <p style={{marginTop:"0.6rem"}}><strong>5. Consent Withdrawal</strong><br/>The employee may withdraw consent at any time. Upon withdrawal, you must cease using the data and delete any copies in your systems.</p>
          <p style={{marginTop:"0.6rem"}}><strong>6. Compliance</strong><br/>You confirm your organisation complies with applicable data protection laws including the DPDP Act 2023.</p>
        </div>
        <div style={{display:"flex",alignItems:"flex-start",gap:"0.7rem",cursor:"pointer"}} onClick={() => setChecked(p => !p)}>
          <div style={{width:17,height:17,borderRadius:4,border:`2px solid ${checked?"#2563eb":"#cbd5e1"}`,background:checked?"#2563eb":"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,transition:"all 0.15s"}}>
            {checked && <span style={{color:"#fff",fontSize:"0.6rem",fontWeight:800}}>✓</span>}
          </div>
          <span style={{fontSize:"0.78rem",color:"#374151",lineHeight:1.55}}>I have read and agree to the Data Access & Sharing Agreement on behalf of my organisation.</span>
        </div>
        <button
          onClick={async () => { if (!checked || accepting) return; setAccepting(true); await onAccept(); setAccepting(false); }}
          disabled={!checked || accepting}
          style={{padding:"0.72rem",background:checked?"#0f172a":"#e2e8f0",color:checked?"#fff":"#94a3b8",border:"none",borderRadius:8,fontFamily:"inherit",fontSize:"0.875rem",fontWeight:700,cursor:checked?"pointer":"not-allowed",transition:"all 0.2s"}}>
          {accepting ? "Saving…" : "Accept & Continue to Dashboard"}
        </button>
      </div>
    </div>
  );
}

// ── Sign out Modal ────────────────────────────────────────────────────
function SignoutModal({ onConfirm, onCancel }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(10,15,30,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(3px)"}}>
      <div style={{background:"#fff",borderRadius:12,padding:"1.75rem",maxWidth:320,width:"90%",textAlign:"center",boxShadow:"0 24px 60px rgba(0,0,0,0.18)"}}>
        <div style={{fontSize:32,marginBottom:"0.65rem"}}>👋</div>
        <h3 style={{margin:"0 0 0.35rem",color:"#0f172a",fontWeight:700,fontSize:"1rem"}}>Sign out?</h3>
        <p style={{color:"#64748b",fontSize:"0.84rem",marginBottom:"1.25rem",lineHeight:1.5}}>You can sign back in anytime.</p>
        <div style={{display:"flex",gap:"0.65rem"}}>
          <button onClick={onCancel}  style={{flex:1,padding:"0.65rem",borderRadius:7,border:"1.5px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",fontWeight:600,color:"#475569",fontSize:"0.84rem",fontFamily:"inherit"}}>Stay</button>
          <button onClick={onConfirm} style={{flex:1,padding:"0.65rem",borderRadius:7,border:"none",background:"#ef4444",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:"0.84rem",fontFamily:"inherit"}}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

// ── KV helper ─────────────────────────────────────────────────────────
function KV({ k, v, mono }) {
  return (
    <div className="kv">
      <span className="kv-k">{k}</span>
      <span className={`kv-v${!v || v === "—" ? " empty" : ""}${mono ? " mono" : ""}`}>{v || "—"}</span>
    </div>
  );
}

function SecBlock({ title, children }) {
  return (
    <div className="sec-block">
      {title && <div className="sec-head">{title}</div>}
      {children}
    </div>
  );
}

// ── Tab: Overview (Personal + Bank) ───────────────────────────────────
function OverviewTab({ data }) {
  if (!data) return <div className="no-data">No profile data</div>;
  const cur  = data.currentAddress   || {};
  const perm = data.permanentAddress || {};
  return (
    <div>
      <SecBlock title="Identity">
        <div className="kv-grid">
          <KV k="Full Name"      v={[data.firstName, data.middleName, data.lastName].filter(Boolean).join(" ")} />
          <KV k="Date of Birth"  v={data.dob} />
          <KV k="Gender"         v={data.gender} />
          <KV k="Nationality"    v={data.nationality} />
          <KV k="Blood Group"    v={data.bloodGroup} />
          <KV k="Marital Status" v={data.maritalStatus} />
          <KV k="Email"          v={data.email} mono />
          <KV k="Mobile"         v={data.mobile ? `+91 ${data.mobile}` : ""} mono />
          <KV k="Aadhaar"        v={maskAadhaar(data.aadhaar || data.aadhar)} mono />
          <KV k="Name as per Aadhaar" v={data.nameAsPerAadhaar} />
          <KV k="PAN"            v={data.pan} mono />
          <KV k="Name as per PAN" v={data.nameAsPerPan} />
          {(data.hasPassport === "Yes" || data.passport) && <>
            <KV k="Passport No."   v={data.passport} mono />
            <KV k="Issue Date"     v={data.passportIssue} />
            <KV k="Expiry Date"    v={data.passportExpiry} />
          </>}
        </div>
      </SecBlock>

      {(data.fatherFirst || data.fatherName) && (
        <SecBlock title="Family">
          <div className="kv-grid">
            <KV k="Father's Name" v={data.fatherName || [data.fatherFirst, data.fatherMiddle, data.fatherLast].filter(Boolean).join(" ")} />
            <KV k="Mother's Name" v={data.motherName || [data.motherFirst, data.motherMiddle, data.motherLast].filter(Boolean).join(" ")} />
          </div>
        </SecBlock>
      )}

      {(data.emergName || data.emergPhone) && (
        <SecBlock title="Emergency Contact">
          <div className="kv-grid">
            <KV k="Name"         v={data.emergName} />
            <KV k="Relationship" v={data.emergRel} />
            <KV k="Phone"        v={data.emergPhone} mono />
          </div>
        </SecBlock>
      )}

      <SecBlock title="Current Address">
        <div className="kv-grid">
          <KV k="Door / Street"  v={cur.door} />
          <KV k="Village / Area" v={cur.village} />
          <KV k="Tehsil / Taluk" v={cur.locality} />
          <KV k="District"       v={cur.district} />
          <KV k="State"          v={cur.state} />
          <KV k="Pincode"        v={cur.pin} mono />
          <KV k="Residing From"  v={cur.from} />
        </div>
      </SecBlock>

      {(perm.door || perm.state) && (
        <SecBlock title="Permanent / Native Address">
          <div className="kv-grid">
            <KV k="Door / Street"  v={perm.door} />
            <KV k="Village / Area" v={perm.village} />
            <KV k="District"       v={perm.district} />
            <KV k="State"          v={perm.state} />
            <KV k="Pincode"        v={perm.pin} mono />
          </div>
        </SecBlock>
      )}

      {data.bankName && (
        <SecBlock title="Bank Account">
          <div className="kv-grid">
            <KV k="Bank"           v={data.bankName === "Other" && data.bankOther ? `Other — ${data.bankOther}` : data.bankName} />
            <KV k="Account Holder" v={data.bankAccountName} />
            <KV k="IFSC"           v={data.ifsc} mono />
            <KV k="Branch"         v={data.branch} />
            <KV k="Account Type"   v={data.accountType} />
            <KV k="Account No."    v={data.accountFull ? "•".repeat(Math.max(0,data.accountFull.length-4))+data.accountFull.slice(-4) : (data.accountLast4 ? `••••••••${data.accountLast4}` : "")} mono />
          </div>
        </SecBlock>
      )}
    </div>
  );
}

// ── Tab: Education ────────────────────────────────────────────────────
function EducationTab({ data }) {
  if (!data) return <div className="no-data">No education records</div>;
  const EduBlock = ({ title, s }) => {
    if (!s || !Object.values(s).some(Boolean)) return null;
    return (
      <div className="edu-block">
        <div className="edu-block-title">{title}</div>
        <div className="kv-grid">
          <KV k="Institution"        v={s.school || s.college || s.institute} />
          <KV k="Board / University" v={s.board || s.university} />
          {s.course && <KV k="Course / Degree" v={s.course} />}
          {(s.branch || s.specialization) && <KV k="Branch / Specialization" v={s.branch || s.specialization} />}
          <KV k="Year of Passing"    v={s.yearOfPassing} />
          <KV k="Result"             v={s.resultValue ? `${s.resultType || ""} ${s.resultValue}`.trim() : ""} />
          {s.mode && <KV k="Mode" v={s.mode} />}
          {s.medium && <KV k="Medium" v={s.medium} />}
          {s.backlogs && <KV k="Backlogs" v={s.backlogs} />}
        </div>
      </div>
    );
  };
  return (
    <div>
      <EduBlock title="Class X — SSC / Matriculation" s={data.classX} />
      <EduBlock title="Intermediate — HSC / 12th" s={data.intermediate} />
      {data.diploma?.institute && <EduBlock title="Diploma" s={data.diploma} />}
      <EduBlock title="Undergraduate / Degree" s={data.undergraduate} />
      {data.postgraduate?.college && <EduBlock title="Postgraduate / Masters" s={data.postgraduate} />}

      {Array.isArray(data.professionalQualifications) && data.professionalQualifications.length > 0 && (
        <SecBlock title="Professional Qualifications">
          {data.professionalQualifications.map((q,i) => (
            <div key={i} style={{padding:"0.6rem 0.75rem",background:"#f8fafc",borderRadius:6,border:"1px solid #e8ecf3",marginBottom:"0.4rem"}}>
              <div className="kv-grid">
                <KV k="Qualification" v={q.type} />
                <KV k="Level / Stage" v={q.level} />
                <KV k="Year" v={q.year} />
              </div>
            </div>
          ))}
        </SecBlock>
      )}

      {Array.isArray(data.articleships) && data.articleships.length > 0 && (
        <SecBlock title="Articleship / Practical Training">
          {data.articleships.map((a,i) => (
            <div key={i} style={{padding:"0.6rem 0.75rem",background:"#fff7ed",borderRadius:6,border:"1px solid #fed7aa",marginBottom:"0.4rem"}}>
              <div className="kv-grid">
                <KV k="Type"  v={a.type} />
                <KV k="Firm"  v={a.firm} />
                <KV k="City"  v={a.city} />
                <KV k="From"  v={a.from} />
                <KV k="To"    v={a.to || (a.isOngoing === "Ongoing" ? "Ongoing" : "")} />
              </div>
            </div>
          ))}
        </SecBlock>
      )}

      {Array.isArray(data.certifications) && data.certifications.length > 0 && (
        <SecBlock title="Certifications">
          <div className="kv-grid">
            {data.certifications.map((c,i) => <KV key={i} k={`Cert ${i+1}`} v={c.name} />)}
          </div>
        </SecBlock>
      )}

      {data.hasEduGap === "Yes" && (
        <SecBlock title="Education Gap">
          <div className="kv-grid">
            <KV k="Gap Before First Job" v={data.hasEduGap} />
            <KV k="Reason" v={data.eduGapReason} />
          </div>
        </SecBlock>
      )}
    </div>
  );
}

// ── Tab: Employment ───────────────────────────────────────────────────
function EmploymentTab({ data, resumeKey, docUrls }) {
  const list = Array.isArray(data) ? data : (data?.employments || []);
  if (!list.length) return <div className="no-data">No employment records</div>;
  return (
    <div>
      {resumeKey && docUrls?.[resumeKey] && (
        <div style={{marginBottom:"0.9rem"}}>
          <a href={docUrls[resumeKey]} target="_blank" rel="noopener noreferrer" className="doc-view" style={{display:"inline-flex",alignItems:"center",gap:"0.4rem"}}>📄 View Resume / CV ↗</a>
        </div>
      )}
      {list.map((e, i) => (
        <div key={e.company_id || i} className="emp-block">
          <div className="emp-block-title">
            {i === 0 ? "Current / Most Recent Employer" : `Previous Employer ${i}`}
            {i === 0 && e.currentlyWorking === "Yes" && <span style={{marginLeft:"0.5rem",background:"rgba(34,197,94,0.12)",color:"#4ade80",padding:"1px 7px",borderRadius:3,fontSize:"0.6rem"}}>Still Employed</span>}
          </div>
          <div className="kv-grid">
            <KV k="Company"          v={e.companyName} />
            <KV k="Designation"      v={e.designation} />
            <KV k="Department"       v={e.department} />
            <KV k="Employment Type"  v={e.employmentType} />
            <KV k="Employee ID"      v={e.employeeId} mono />
            <KV k="Work Email"       v={e.workEmail} mono />
            <KV k="Date of Joining"  v={e.startDate} />
            {i === 0
              ? <KV k="Currently Working" v={e.currentlyWorking === "Yes" ? "Yes — Still Employed" : "No"} />
              : <KV k="Date of Leaving"   v={e.endDate} />}
            {i === 0 && e.currentlyWorking === "No" && <KV k="Date of Leaving" v={e.endDate} />}
            {e.reasonForRelieving && <KV k="Reason for Leaving" v={e.reasonForRelieving} />}
            {e.officeAddress && <KV k="Office Address" v={e.officeAddress} />}
            {e.duties && <KV k="Duties" v={e.duties} />}
            {e.employmentType === "Contract" && e.contractVendor?.company && <KV k="Vendor" v={e.contractVendor.company} />}
          </div>
          {e.reference?.name && (
            <div style={{marginTop:"0.75rem",paddingTop:"0.75rem",borderTop:"1px solid #f1f5f9"}}>
              <div style={{fontSize:"0.62rem",fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"0.5rem"}}>Reference</div>
              <div className="kv-grid">
                <KV k="Name"   v={e.reference.name} />
                <KV k="Role"   v={e.reference.role} />
                <KV k="Email"  v={e.reference.email} mono />
                <KV k="Mobile" v={e.reference.mobile} mono />
              </div>
            </div>
          )}
          {e.gap?.hasGap === "Yes" && e.gap?.reason && (
            <div style={{marginTop:"0.65rem",padding:"0.5rem 0.75rem",background:"#fffbeb",borderRadius:6,border:"1px solid #fde68a",fontSize:"0.75rem",color:"#92400e"}}>
              ⏱ Employment gap: {e.gap.reason}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Tab: UAN & PF ─────────────────────────────────────────────────────
function UanTab({ data }) {
  if (!data) return <div className="no-data">No UAN data</div>;
  const hasUan = data.hasUan === "yes" || data.hasUan === true;
  return (
    <div>
      <SecBlock title="UAN Details">
        <div className="kv-grid">
          <KV k="Has UAN"         v={hasUan ? "Yes" : "No"} />
          {hasUan && <>
            <KV k="UAN Number"      v={data.uanNumber} mono />
            <KV k="Name as per UAN" v={data.nameAsPerUan} />
            <KV k="Mobile Linked"   v={data.mobileLinked} mono />
            <KV k="UAN Active"      v={data.isActive} />
          </>}
        </div>
      </SecBlock>

      {Array.isArray(data.pfRecords) && data.pfRecords.length > 0 && (
        <SecBlock title="PF Records per Employer">
          {data.pfRecords.map((pf,i) => (
            <div key={i} style={{padding:"0.65rem 0.85rem",background:"#f8fafc",border:"1px solid #e8ecf3",borderRadius:7,marginBottom:"0.5rem"}}>
              <div style={{fontSize:"0.65rem",fontWeight:700,color:"#7c3aed",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"0.45rem"}}>{pf.companyName || `Employer ${i+1}`}</div>
              {pf.hasPf === "No"
                ? <div style={{fontSize:"0.75rem",color:"#0369a1"}}>ℹ PF not maintained by this employer</div>
                : <div className="kv-grid">
                    <KV k="PF Member ID"    v={pf.pfMemberId} mono />
                    <KV k="Date of Joining" v={pf.dojEpfo} />
                    <KV k="Date of Exit"    v={pf.doeEpfo} />
                    <KV k="PF Transferred"  v={pf.pfTransferred} />
                  </div>}
            </div>
          ))}
        </SecBlock>
      )}
    </div>
  );
}

// ── Tab: Documents ────────────────────────────────────────────────────
const DOC_LABELS = {
  aadhaar:"Aadhaar Card", pan:"PAN Card", photo:"Profile Photo", passport:"Passport",
  classX:"Class X Certificate", intermediate:"Intermediate Certificate",
  ug_provisional:"UG Provisional Marksheet", ug_convocation:"UG Convocation",
  pg_provisional:"PG Provisional Marksheet", pg_convocation:"PG Convocation",
  diploma:"Diploma Certificate", uanCard:"UAN Card / Passbook",
  payslips:"Payslips (Last 3 Months)", offerLetter:"Offer Letter",
  resignation:"Resignation Acceptance", experience:"Experience / Relieving Letter",
  idCard:"Company ID Card", cv:"Resume / CV",
};
const SEC_TITLES = { personal:"Identity Documents", education:"Education Certificates", uan:"UAN / EPFO Documents", general:"General" };

function DocumentsTab({ documents, loading }) {
  if (loading) return <div className="no-data">Loading documents…</div>;
  if (!documents || Object.keys(documents).length === 0) return <div className="no-data">No documents uploaded yet</div>;

  const grouped = {};
  for (const [group, docs] of Object.entries(documents)) {
    const section = group.startsWith("employment/") ? "employment" : group;
    if (!grouped[section]) grouped[section] = [];
    grouped[section].push({ group, docs });
  }

  return (
    <div>
      {Object.entries(grouped).map(([section, entries]) => (
        <div key={section}>
          <div className="doc-group-title">{SEC_TITLES[section] || "Employment Documents"}</div>
          {entries.map(({ group, docs }) => (
            <div key={group}>
              {group.startsWith("employment/") && (
                <div style={{fontSize:"0.62rem",color:"#94a3b8",fontFamily:"'IBM Plex Mono',monospace",margin:"0.25rem 0 0.35rem",textTransform:"uppercase",letterSpacing:"0.5px"}}>Company: {group.split("/")[1]}</div>
              )}
              {Object.entries(docs).map(([subKey, doc]) => (
                <div key={subKey} className="doc-row">
                  <div>
                    <div className="doc-name">{DOC_LABELS[subKey] || subKey}</div>
                    <div className="doc-meta">{doc.filename}{doc.uploaded_at ? ` · ${toIST(doc.uploaded_at)}` : ""}</div>
                  </div>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="doc-view">↓ View</a>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
      <div style={{fontSize:"0.65rem",color:"#94a3b8",marginTop:"0.9rem",paddingTop:"0.75rem",borderTop:"1px solid #e8ecf3"}}>
        ⏱ Document links expire in 1 hour. Refresh the page to get fresh links.
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────
export default function EmployerDashboard() {
  const { user, apiFetch, logout, ready } = useAuth();
  const router = useRouter();

  const [showSignout,     setShowSignout]     = useState(false);
  const [termsAccepted,   setTermsAccepted]   = useState(false);
  const [termsLoading,    setTermsLoading]    = useState(true);
  const [consents,        setConsents]        = useState([]);
  const [selected,        setSelected]        = useState(null);
  const [profileData,     setProfileData]     = useState(null);
  const [documents,       setDocuments]       = useState(null);
  const [docsLoading,     setDocsLoading]     = useState(false);
  const [activeTab,       setActiveTab]       = useState("Overview");
  const [consentTab,      setConsentTab]      = useState("pending");
  const [searchPending,   setSearchPending]   = useState("");
  const [searchCompleted, setSearchCompleted] = useState("");
  const [searchRejected,  setSearchRejected]  = useState("");
  const [requestEmail,    setRequestEmail]    = useState("");
  const [requestMsg,      setRequestMsg]      = useState("");
  const [requesting,      setRequesting]      = useState(false);
  const [requestError,    setRequestError]    = useState("");
  const [requestSuccess,  setRequestSuccess]  = useState("");
  const [loadingProfile,  setLoadingProfile]  = useState(false);
  const [loading,         setLoading]         = useState(true);

  // ── Role guard ───────────────────────────────────────────────────
  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/employer/login"); return; }
    if (user.role !== "employer") { router.replace("/employer/login"); return; }
  }, [ready, user, router]);

  // ── Terms check — backend with sessionStorage fallback ───────────
  useEffect(() => {
    if (!ready || !user) return;
    // Fast path: already accepted this session
    if (typeof window !== "undefined" && sessionStorage.getItem(`dg_terms_${user.email}`) === "1") {
      setTermsAccepted(true);
      setTermsLoading(false);
      return;
    }
    const checkTerms = async () => {
      try {
        const res = await apiFetch(`${API}/auth/me`);
        if (res.ok) {
          const data = await res.json();
          if (data.terms_accepted) {
            setTermsAccepted(true);
            if (typeof window !== "undefined") sessionStorage.setItem(`dg_terms_${user.email}`, "1");
          }
        }
      } catch (_) {}
      setTermsLoading(false);
    };
    checkTerms();
  }, [ready, user, apiFetch]);

  const normalizeStatus = (s) => {
    const v = String(s || "pending").toLowerCase();
    if (["approved","approve","accepted","granted","allow"].includes(v)) return "approved";
    if (["declined","decline","rejected","denied","reject"].includes(v)) return "declined";
    return "pending";
  };

  const normalizeConsent = (c) => ({
    ...c,
    consent_id:      c?.consent_id || c?.id || c?.consentId || c?._id,
    status:          normalizeStatus(c?.status),
    request_message: c?.request_message || c?.message || c?.comment || c?.note || "",
    employee_email:  c?.employee_email || c?.employeeEmail || c?.email || c?.user_email || "",
    employee_name:   c?.employee_name  || c?.employeeName  || c?.name || c?.user_name   || "",
  });

  const getConsentId = (c) => c?.consent_id || c?.id || c?.consentId || c?._id;

  const loadConsents = useCallback(async () => {
    try {
      const res = await apiFetch(`${API}/consent/my`);
      if (res.ok) setConsents((await res.json()).map(normalizeConsent));
    } catch (_) {}
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => { if (ready && user) loadConsents(); }, [ready, user, loadConsents]);
  useEffect(() => {
    if (!ready || !user) return;
    const id = setInterval(loadConsents, 15000);
    return () => clearInterval(id);
  }, [ready, user, loadConsents]);

  const pending   = useMemo(() => consents.filter(c => c.status === "pending"),  [consents]);
  const completed = useMemo(() => consents.filter(c => c.status === "approved"), [consents]);
  const rejected  = useMemo(() => consents.filter(c => c.status === "declined"), [consents]);

  const filter = (list, q) => {
    if (!q.trim()) return list;
    const lq = q.toLowerCase();
    return list.filter(c => (c.employee_email||"").toLowerCase().includes(lq) || (c.employee_name||"").toLowerCase().includes(lq));
  };

  const filteredPending   = useMemo(() => filter(pending,   searchPending),   [pending,   searchPending]);
  const filteredCompleted = useMemo(() => filter(completed, searchCompleted), [completed, searchCompleted]);
  const filteredRejected  = useMemo(() => filter(rejected,  searchRejected),  [rejected,  searchRejected]);

  const loadDocuments = useCallback(async (empId) => {
    if (!empId) return;
    setDocsLoading(true);
    try {
      const res = await apiFetch(`${API}/documents/${empId}`);
      if (res.ok) setDocuments((await res.json()).documents || {});
    } catch (_) {}
    setDocsLoading(false);
  }, [apiFetch]);

  const selectConsent = useCallback(async (consent) => {
    setSelected(consent);
    setProfileData(null);
    setDocuments(null);
    setActiveTab("Overview");
    if (consent.status !== "approved") return;
    setLoadingProfile(true);
    try {
      const res = await apiFetch(`${API}/consent/${getConsentId(consent)}`);
      if (res.ok) {
        const raw = await res.json();
        const profile = normalizeProfile(raw?.profile_snapshot || raw?.employee || {});
        setProfileData({
          ...raw,
          profile_snapshot:    profile,
          employment_snapshot: raw?.employment_snapshot || raw?.employmentHistory || [],
        });
        const empId = profile?.employee_id || raw?.employee_id || consent?.employee_id;
        if (empId) loadDocuments(empId);
      }
    } catch (_) {}
    setLoadingProfile(false);
  }, [apiFetch, loadDocuments]);

  const sendRequest = async () => {
    setRequestError(""); setRequestSuccess("");
    if (!requestEmail.trim()) { setRequestError("Email is required"); return; }
    setRequesting(true);
    try {
      const res = await apiFetch(`${API}/consent/request`, {
        method: "POST",
        body: JSON.stringify({ employee_email: requestEmail.trim().toLowerCase(), message: requestMsg.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setRequestError(parseError(data)); return; }
      setRequestSuccess("Request sent!"); setRequestEmail(""); setRequestMsg("");
      loadConsents();
    } catch { setRequestError("Network error"); }
    finally { setRequesting(false); }
  };

  const handlePrint = () => {
    if (!profileData) return;
    const empHistory = profileData.employment_snapshot || [];
    printProfile(profileData.profile_snapshot, empHistory, documents, user?.name || user?.email);
  };

  if (!ready || !user) return null;

  if (termsLoading) return (
    <div style={{minHeight:"100vh",background:"#f4f6fb",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p style={{color:"#94a3b8",fontFamily:"'IBM Plex Sans',sans-serif",fontWeight:500}}>Loading dashboard…</p>
    </div>
  );

  if (!termsAccepted) return <TermsModal onAccept={async () => {
    try { await apiFetch(`${API}/auth/accept-terms`, { method: "POST" }); } catch (_) {}
    if (typeof window !== "undefined") sessionStorage.setItem(`dg_terms_${user.email}`, "1");
    setTermsAccepted(true);
  }} />;

  const tabCounts = { pending: pending.length, completed: completed.length, rejected: rejected.length };
  const currentList   = consentTab === "pending" ? filteredPending : consentTab === "completed" ? filteredCompleted : filteredRejected;
  const currentSearch = consentTab === "pending" ? searchPending : consentTab === "completed" ? searchCompleted : searchRejected;
  const setCurrentSearch = consentTab === "pending" ? setSearchPending : consentTab === "completed" ? setSearchCompleted : setSearchRejected;

  const snap = profileData?.profile_snapshot;
  const empName = snap ? [snap.firstName, snap.lastName].filter(Boolean).join(" ") || selected?.employee_email : selected?.employee_email;

  // Build flat docUrls for employment tab resume link
  const docUrls = {};
  if (documents) {
    for (const [, docs] of Object.entries(documents)) {
      for (const [, doc] of Object.entries(docs)) {
        if (doc.s3_key) docUrls[doc.s3_key] = doc.url;
      }
    }
  }

  return (
    <>
      <style>{G}</style>
      <div className="page">
        {showSignout && <SignoutModal onConfirm={logout} onCancel={() => setShowSignout(false)} />}

        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="side-header">
            <div className="brand-wrap">
              <div className="brand-mark">🔒</div>
              <div>
                <div className="brand-name">Datagate</div>
                <div className="brand-role">Employer Portal</div>
              </div>
            </div>
            <button className="signout-btn" onClick={() => setShowSignout(true)} title="Sign out">⏻</button>
          </div>

          <div className="user-strip">
            <div className="user-email">{user.name || user.email}</div>
            <span className="user-tag">Employer</span>
          </div>

          {/* Request box */}
          <div className="req-box">
            <div className="req-label">Request Employee Data</div>
            <input className="req-input" type="email" placeholder="Employee email address" value={requestEmail} onChange={e => setRequestEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && !requestMsg && sendRequest()} />
            <textarea className="req-input req-textarea" placeholder="Message to employee (optional)" value={requestMsg} onChange={e => setRequestMsg(e.target.value)} />
            {requestError   && <p className="req-msg err">{requestError}</p>}
            {requestSuccess && <p className="req-msg ok">{requestSuccess}</p>}
            <button className="req-btn" onClick={sendRequest} disabled={requesting}>{requesting ? "Sending…" : "Send Request"}</button>
          </div>

          {/* Consent tabs */}
          <div className="filter-row">
            {[["pending","Pending"],["completed","Approved"],["rejected","Declined"]].map(([key, label]) => (
              <button key={key} className={`filter-btn${consentTab === key ? " active" : ""}`} onClick={() => setConsentTab(key)}>
                {label}
                {tabCounts[key] > 0 && <span className="filter-count">{tabCounts[key]}</span>}
              </button>
            ))}
          </div>

          <div className="search-row">
            <input className="search-in" placeholder="Search…" value={currentSearch} onChange={e => setCurrentSearch(e.target.value)} />
          </div>

          <div className="consent-list">
            {loading ? <div className="list-empty">Loading…</div>
            : currentList.length === 0 ? <div className="list-empty">{currentSearch ? "No matches" : `No ${consentTab} requests`}</div>
            : currentList.map(c => {
              const dotColor = c.status === "approved" ? "#22c55e" : c.status === "pending" ? "#f59e0b" : "#ef4444";
              const ts = c.status === "approved" ? (c.responded_at || c.approved_at) : (c.requested_at || c.created_at);
              return (
                <div key={getConsentId(c)} className={`c-row${getConsentId(selected) === getConsentId(c) ? " active" : ""}`} onClick={() => selectConsent(c)}>
                  <div className="c-pip" style={{ background: dotColor }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="c-em">{c.employee_email}</div>
                    {c.employee_name && c.employee_name !== c.employee_email && <div className="c-note">{c.employee_name}</div>}
                    <div className="c-time">{toISTDate(ts)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="main">
          {!selected ? (
            <div className="empty-pane">
              <div className="empty-glyph">👥</div>
              <div className="empty-h">Select a request</div>
              <div className="empty-s">Approved consents show full verified profile here</div>
            </div>
          ) : (
            <>
              <div className="main-header">
                <div className="main-title"><strong>{empName}</strong> — {selected.employee_email}</div>
                {selected.status === "approved" && profileData && (
                  <button className="act-btn primary" onClick={handlePrint}>🖨 Print / Export PDF</button>
                )}
              </div>

              <div className="profile-pane">
                {/* Hero */}
                <div className="p-hero">
                  <div>
                    <div className="p-name-big">{empName}</div>
                    <div className="p-email-line">{selected.employee_email}</div>
                    <div className="p-badges">
                      <span className={`badge badge-${selected.status}`}>
                        {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
                      </span>
                      {selected.requested_at && <span className="badge badge-snap">Requested: {toISTDate(selected.requested_at)}</span>}
                      {(selected.responded_at || selected.approved_at) && <span className="badge badge-snap">Responded: {toISTDate(selected.responded_at || selected.approved_at)}</span>}
                      {profileData?.snapshot_at && <span className="badge badge-snap">Snapshot: {toISTDate(profileData.snapshot_at)}</span>}
                    </div>
                  </div>
                  {selected.request_message && (
                    <div style={{maxWidth:280,padding:"0.65rem 0.9rem",background:"rgba(37,99,235,0.12)",borderRadius:8,border:"1px solid rgba(37,99,235,0.2)"}}>
                      <div style={{fontSize:"0.58rem",fontWeight:700,color:"#60a5fa",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Your message</div>
                      <div style={{fontSize:"0.78rem",color:"#93c5fd",lineHeight:1.5}}>{selected.request_message}</div>
                    </div>
                  )}
                </div>

                {selected.status === "pending"  && <div className="status-box">⏳ Waiting for employee to approve your request.</div>}
                {selected.status === "declined" && <div className="status-box declined">❌ Employee declined this request.</div>}

                {selected.status === "approved" && (
                  loadingProfile ? <div className="status-box">Loading profile data…</div>
                  : !profileData ? <div className="status-box">Could not load profile data.</div>
                  : <>
                    <div className="self-rep-note">
                      ⚠️ <strong>Self-reported data.</strong> All information was filled and submitted by the employee. Documents are uploaded by the candidate and not independently verified by Datagate unless a verified check has been explicitly completed.
                    </div>

                    {/* Data tabs */}
                    <div className="dtab-row">
                      {DATA_TABS.map(t => (
                        <button key={t} className={`dtab${activeTab === t ? " active" : ""}`} onClick={() => setActiveTab(t)}>{t}</button>
                      ))}
                    </div>
                    <div className="tab-body">
                      {activeTab === "Overview"    && <OverviewTab    data={profileData.profile_snapshot} />}
                      {activeTab === "Education"   && <EducationTab   data={profileData.profile_snapshot?.education} />}
                      {activeTab === "Employment"  && <EmploymentTab  data={profileData.employment_snapshot} resumeKey={profileData.profile_snapshot?.resumeKey} docUrls={docUrls} />}
                      {activeTab === "UAN & PF"    && <UanTab         data={profileData.profile_snapshot} />}
                      {activeTab === "Documents"   && <DocumentsTab   documents={documents} loading={docsLoading} />}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
