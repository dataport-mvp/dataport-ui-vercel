// pages/employer/dashboard.js
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;
const DATA_TABS = ["Overview", "Education", "Employment", "UAN & PF", "Documents", "BGV Status"];

// ── Normalizers ───────────────────────────────────────────────────────
const normalizeEducation = (ed = {}) => {
  const isNewFormat = !!(ed.xSchool || ed.xBoard || ed.xiiSchool || ed.degCollege || ed.pgCollege);
  const base = isNewFormat ? {
    classX:        { school: ed.xSchool, board: ed.xBoard, yearOfPassing: ed.xYear, resultValue: ed.xPercent },
    intermediate:  { school: ed.xiiSchool, board: ed.xiiBoard, yearOfPassing: ed.xiiYear, resultValue: ed.xiiPercent },
    undergraduate: { college: ed.degCollege, course: ed.degName, branch: ed.degBranch, yearOfPassing: ed.degYear, resultValue: ed.degPercent },
    postgraduate:  { college: ed.pgCollege, course: ed.pgName, branch: ed.pgBranch, yearOfPassing: ed.pgYear, resultValue: ed.pgPercent },
  } : {
    classX:        ed?.classX        || ed?.class_x   || {},
    intermediate:  ed?.intermediate  || ed?.classXII  || ed?.class_xii || {},
    undergraduate: ed?.undergraduate || ed?.ug        || {},
    postgraduate:  ed?.postgraduate  || ed?.pg        || {},
  };
  return {
    ...base,
    diploma:                    ed?.diploma                    || {},
    certifications:             Array.isArray(ed?.certifications)             ? ed.certifications             : [],
    professionalQualifications: Array.isArray(ed?.professionalQualifications) ? ed.professionalQualifications : [],
    articleships:               Array.isArray(ed?.articleships)               ? ed.articleships               : [],
    hasEduGap:      ed?.hasEduGap      || "",
    eduGapReason:   ed?.eduGapReason   || "",
    hasDip:         ed?.hasDip         || "",
    hasCerts:       ed?.hasCerts       || "",
    hasProfQual:    ed?.hasProfQual    || "",
    hasArticleship: ed?.hasArticleship || "",
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

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function isoToDisplay(iso) {
  if (!iso || !iso.includes("-")) return iso || "";
  const [y, mo, d] = iso.split("-");
  const idx = parseInt(mo, 10) - 1;
  const mName = MONTH_NAMES[idx] || mo;
  return `${parseInt(d, 10)} ${mName} ${y}`;
}

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

// ── PDF with embedded images ──────────────────────────────────────────
async function printProfile(profile, empHistory, documents, employerName) {
  const d   = profile || {};
  const cur  = d.currentAddress   || {};
  const perm = d.permanentAddress || {};
  const edu  = d.education        || {};

  // Build ordered document list with base64 images
  // Sequence: personal → education → employment → uan
  const DOC_ORDER = [
    // ── Personal (Page 1) ──────────────────────────────────────────
    { key: "photo",          label: "Profile Photo",                  group: "personal" },
    { key: "aadhaar",        label: "Aadhaar Card",                   group: "personal" },
    { key: "pan",            label: "PAN Card",                       group: "personal" },
    { key: "passport",       label: "Passport",                       group: "personal" },
    // ── Education (Page 2) — same order as form ───────────────────
    { key: "classX",         label: "Class X Certificate",            group: "education" },
    { key: "intermediate",   label: "Intermediate Certificate",       group: "education" },
    { key: "diploma",        label: "Diploma Certificate",            group: "education" },
    { key: "ug_provisional", label: "UG Provisional Marksheet",       group: "education" },
    { key: "ug_convocation", label: "UG Convocation Certificate",     group: "education" },
    { key: "pg_provisional", label: "PG Provisional Marksheet",       group: "education" },
    { key: "pg_convocation", label: "PG Convocation Certificate",     group: "education" },
    { key: /^profqual_/,     label: "Professional Qualification",     group: "education" },
    { key: /^articleship_/,  label: "Articleship / Training Letter",  group: "education" },
    // NOTE: cert_ (Professional Certifications) intentionally excluded from PDF
    // ── Employment (Page 3) — CV first, then per-employer docs ────
    { key: "cv",             label: "Resume / CV",                    group: "general" },
    { key: "offerLetter",    label: "Offer Letter",                   group: "employment" },
    { key: "payslips",       label: "Payslips (Last 3 Months)",       group: "employment" },
    { key: "resignation",    label: "Resignation Acceptance",         group: "employment" },
    { key: "experience",     label: "Experience / Relieving Letter",  group: "employment" },
    { key: "idCard",         label: "Company ID Card",                group: "employment" },
    // ── UAN (Page 4) ──────────────────────────────────────────────
    { key: "uanCard",        label: "UAN Card / Passbook",            group: "uan" },
    { key: "serviceHistory", label: "Service History Snapshot",       group: "uan" },
  ];

  // Flatten all documents
  const allDocs = [];
  if (documents) {
    for (const [group, docs] of Object.entries(documents)) {
      for (const [subKey, doc] of Object.entries(docs)) {
        allDocs.push({ subKey, doc, group });
      }
    }
  }

  // Sort by DOC_ORDER
  const sortedDocs = [];
  for (const orderEntry of DOC_ORDER) {
    const matches = allDocs.filter(({ subKey, group }) => {
      const keyMatch = typeof orderEntry.key === "string"
        ? subKey === orderEntry.key
        : orderEntry.key.test(subKey);
      return keyMatch;
    });
    for (const m of matches) {
      const idx = sortedDocs.findIndex(x => x.subKey === m.subKey && x.group === m.group);
      if (idx === -1) sortedDocs.push({ ...m, label: orderEntry.label });
    }
  }
  // Add any not matched — but never include cert_ (Professional Certifications excluded from PDF)
  for (const item of allDocs) {
    if (!sortedDocs.find(x => x.subKey === item.subKey && x.group === item.group)) {
      if (/^cert_/.test(item.subKey)) continue; // Professional Certifications excluded
      sortedDocs.push({ ...item, label: item.subKey });
    }
  }

  // Build doc list with type info — use URLs directly (avoids S3 CORS issues with fetch)
  const docsWithData = sortedDocs.map((item) => {
    const url = item.doc.url || item.doc.signedUrl || item.doc.signed_url || item.doc.downloadUrl || item.doc.download_url || item.doc.presignedUrl || item.doc.presigned_url || item.doc.link || item.doc.href || "";
    const filename = item.doc.filename || "";
    const isImage = /\.(jpg|jpeg|png)$/i.test(filename);
    const isPdf   = /\.pdf$/i.test(filename);
    return { ...item, isImage, isPdf, url };
  });

  const row = (label, value) => value && value !== "—" ? `
    <tr>
      <td style="padding:5px 12px 5px 0;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;width:36%;border-bottom:1px solid #f1f5f9;vertical-align:top">${label}</td>
      <td style="padding:5px 0 5px 0;color:#0f172a;font-size:12px;border-bottom:1px solid #f1f5f9">${value}</td>
    </tr>` : "";

  const section = (title, rows, color = "#1e293b") => rows.trim() ? `
    <div style="margin-bottom:22px;page-break-inside:avoid">
      <div style="background:${color};color:#fff;padding:5px 12px;font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;border-radius:4px 4px 0 0;margin-bottom:0">${title}</div>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 4px 4px">${rows}</table>
    </div>` : "";

  const eduSection = (title, s, color) => {
    if (!s || !Object.values(s).some(Boolean)) return "";
    return section(title, [
      row("Institution",          s.school || s.college || s.institute),
      row("Board / University",   s.board || s.university),
      row("Stream",               s.stream),
      row("Course / Degree",      s.course),
      row("Branch / Specialization", s.branch || s.specialization),
      row("Year of Passing",      s.yearOfPassing),
      row("From",                 isoToDisplay(s.from)),
      row("To",                   isoToDisplay(s.to)),
      row("Hall Ticket / Roll No.", s.hallTicket),
      row("Result",               s.resultValue ? `${s.resultType || ""} ${s.resultValue}`.trim() : ""),
      row("Mode",                 s.mode),
      row("Medium",               s.medium),
      row("Backlogs",             s.backlogs),
      row("Address",              s.address),
    ].join(""), color);
  };

  const win = window.open("", "_blank");
  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>BGV Report — ${[d.firstName, d.lastName].filter(Boolean).join(" ") || "Employee"}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #0f172a; font-size: 12px; line-height: 1.5; }
    @page { margin: 20mm 15mm; }
    @media print {
      .no-print { display: none !important; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body style="padding:32px;max-width:900px;margin:0 auto">

  <!-- Report Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;padding-bottom:14px;border-bottom:2.5px solid #1e293b">
    <div>
      <div style="font-size:20px;font-weight:800;color:#1e293b;letter-spacing:-0.5px">Datagate</div>
      <div style="font-size:9px;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;margin-top:2px">Background Verification Report</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:10px;color:#64748b">Generated: ${new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})}</div>
      <div style="font-size:10px;color:#64748b;margin-top:1px">Requested by: <strong>${employerName || "—"}</strong></div>
      <div style="margin-top:6px;display:inline-block;background:#dcfce7;color:#15803d;padding:3px 10px;border-radius:999px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">✓ Employee Consented</div>
    </div>
  </div>

  <!-- Name Banner -->
  <div style="background:#1e293b;color:#fff;padding:14px 18px;border-radius:8px;margin-bottom:22px">
    <div style="font-size:17px;font-weight:700">${[d.firstName, d.middleName, d.lastName].filter(Boolean).join(" ") || "—"}</div>
    <div style="font-size:10px;color:#94a3b8;margin-top:3px">${d.email || ""} ${d.mobile ? "· +91 " + d.mobile : ""}</div>
  </div>

  <!-- ══ SECTION 1: PERSONAL ══ -->
  <div style="font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;margin-top:4px">Page 1 — Personal Details</div>

  ${section("Personal Information", [
    row("Date of Birth",    isoToDisplay(d.dob)),
    row("Gender",           d.gender),
    row("Nationality",      d.nationality),
    row("Blood Group",      d.bloodGroup),
    row("Marital Status",   d.maritalStatus),
  ].join(""))}

  ${section("Father's & Mother's Name", [
    row("Father's Name", d.fatherName || [d.fatherFirst, d.fatherMiddle, d.fatherLast].filter(Boolean).join(" ")),
    row("Mother's Name", d.motherName || [d.motherFirst, d.motherMiddle, d.motherLast].filter(Boolean).join(" ")),
  ].join(""))}

  ${section("Identity Documents", [
    row("Aadhaar Number",     maskAadhaar(d.aadhaar || d.aadhar)),
    row("Name as per Aadhaar", d.nameAsPerAadhaar),
    row("PAN Number",         d.pan),
    row("Name as per PAN",    d.nameAsPerPan),
    row("Has Passport",       d.hasPassport),
    d.hasPassport === "Yes" ? row("Passport Number",   d.passport)      : "",
    d.hasPassport === "Yes" ? row("Issue Date",         isoToDisplay(d.passportIssue)) : "",
    d.hasPassport === "Yes" ? row("Expiry Date",        isoToDisplay(d.passportExpiry)): "",
  ].join(""))}

  ${section("Emergency Contact", [
    row("Name",         d.emergName),
    row("Relationship", d.emergRel),
    row("Phone",        d.emergPhone),
  ].join(""))}

  ${section("Current Address", [
    row("Door / Street",   cur.door),
    row("Village / Area",  cur.village),
    row("Tehsil / Taluk",  cur.locality),
    row("District",        cur.district),
    row("State",           cur.state),
    row("Pincode",         cur.pin),
    row("Residing From",   isoToDisplay(cur.from)),
  ].join(""))}

  ${(perm.door || perm.state) ? section("Permanent / Native Address", [
    row("Door / Street",   perm.door),
    row("Village / Area",  perm.village),
    row("Tehsil / Taluk",  perm.locality),
    row("District",        perm.district),
    row("State",           perm.state),
    row("Pincode",         perm.pin),
  ].join("")) : ""}

  ${section("Bank Account Details", [
    row("Bank Name",           d.bankName === "Other" && d.bankOther ? `Other — ${d.bankOther}` : d.bankName),
    row("Account Holder Name", d.bankAccountName),
    row("IFSC Code",           d.ifsc),
    row("Branch",              d.branch),
    row("Account Type",        d.accountType),
    row("Account Number",      d.accountFull || (d.accountLast4 ? `••••••••${d.accountLast4}` : "")),
  ].join(""))}

  <!-- ══ SECTION 2: EDUCATION ══ -->
  <div style="font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;margin-top:20px">Page 2 — Education</div>

  ${eduSection("Class X — SSC / Matriculation",      edu.classX,        "#334155")}
  ${eduSection("Intermediate — HSC / 12th",           edu.intermediate,  "#334155")}
  ${(edu.hasDip==="Yes"||edu.diploma?.institute) && edu.diploma && Object.values(edu.diploma).some(Boolean) ? eduSection("Diploma / Technical / Vocational", edu.diploma, "#334155") : ""}
  ${eduSection("Undergraduate / Degree",              edu.undergraduate, "#334155")}
  ${edu.postgraduate?.college ? eduSection("Postgraduate / Masters", edu.postgraduate, "#334155") : ""}

  ${Array.isArray(edu.professionalQualifications) && edu.professionalQualifications.length > 0 ? section("Professional Qualifications", edu.professionalQualifications.map((q,i) => [
    row(`Qualification ${i+1} — Type`,  q.type==="Other"?(q.otherType||"Other"):q.type),
    row(`Qualification ${i+1} — Level`, q.level),
    row(`Qualification ${i+1} — Year`,  q.year),
  ].join("")).join(""), "#334155") : ""}

  ${Array.isArray(edu.articleships) && edu.articleships.length > 0 ? section("Articleship / Practical Training", edu.articleships.map((a,i) => [
    row(`Training ${i+1} — Type`,      a.type==="Other Practical Training"?(a.otherType||a.type):a.type),
    row(`Training ${i+1} — Firm`,      a.firm),
    row(`Training ${i+1} — City`,      a.city),
    row(`Training ${i+1} — Principal`, a.principalName),
    row(`Training ${i+1} — Reg. No.`,  a.regNo),
    row(`Training ${i+1} — From`,      a.from),
    row(`Training ${i+1} — To`,        a.to || (a.isOngoing === "Ongoing" ? "Ongoing" : "")),
  ].join("")).join(""), "#334155") : ""}

  ${Array.isArray(edu.certifications) && edu.certifications.length > 0 ? section("Certifications", edu.certifications.map((c,i) => row(`Certification ${i+1}`, c.name)).join(""), "#334155") : ""}

  ${edu.hasEduGap === "Yes" ? section("Education Gap Before First Job", [
    row("Had Gap",  edu.hasEduGap),
    row("Reason",   edu.eduGapReason),
  ].join(""), "#334155") : ""}

  <!-- ══ SECTION 3: EMPLOYMENT ══ -->
  <div style="font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;margin-top:20px">Page 3 — Employment History</div>

  ${empHistory.length === 0 ? `<div style="padding:10px;color:#94a3b8;font-size:11px">No employment history provided.</div>` : empHistory.map((e,i) => section(
    i === 0 ? "Current / Most Recent Employer" : `Previous Employer ${i}`,
    [
      row("Company Name",          e.companyName),
      row("Designation",           e.designation),
      row("Department",            e.department),
      row("Employment Type",       e.employmentType),
      row("Employee ID",           e.employeeId),
      row("Work Email",            e.workEmail),
      row("Office Address",        e.officeAddress),
      row("Date of Joining",       isoToDisplay(e.startDate)),
      i === 0 ? row("Currently Working", e.currentlyWorking === "Yes" ? "Yes — Still Employed" : "No") : row("Date of Leaving", isoToDisplay(e.endDate)),
      i === 0 && e.currentlyWorking === "No" ? row("Date of Leaving", isoToDisplay(e.endDate)) : "",
      row("Reason for Leaving",    e.reasonForRelieving),
      row("Duties",                e.duties),
      e.employmentType === "Contract" ? row("Vendor Company", e.contractVendor?.company) : "",
      e.employmentType === "Contract" ? row("Vendor Email",   e.contractVendor?.email)   : "",
      e.employmentType === "Contract" ? row("Vendor Mobile",  e.contractVendor?.mobile)  : "",
      row("Reference Name",        e.reference?.name),
      row("Reference Role",        e.reference?.role),
      row("Reference Email",       e.reference?.email),
      row("Reference Mobile",      e.reference?.mobile),
      e.gap?.hasGap === "Yes" ? row("Employment Gap", e.gap?.reason) : "",
    ].join(""), i === 0 ? "#18151f" : "#334155"
  )).join("")}

  <!-- ══ SECTION 4: UAN / EPFO ══ -->
  <div style="font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;margin-top:20px">Page 4 — UAN / EPFO</div>

  ${section("UAN Details", [
    row("Has UAN",           d.hasUan === "yes" || d.hasUan === true ? "Yes" : "No"),
    row("UAN Number",        d.uanNumber),
    row("Name as per UAN",   d.nameAsPerUan),
    row("Mobile Linked",     d.mobileLinked),
    row("UAN Active",        d.isActive),
  ].join(""), "#334155")}

  ${Array.isArray(d.pfRecords) && d.pfRecords.length > 0 ? d.pfRecords.filter(pf => pf.companyName).map((pf,i) => section(
    `PF Record — ${pf.companyName}`,
    pf.hasPf === "No"
      ? row("PF Status", "PF not maintained by this employer")
      : [
          row("PF Type",          pf.pfType === "Trust" ? "Company's Own PF Trust (Exempted)" : pf.pfType === "EPFO" ? "EPFO (Government)" : ""),
          row("PF Member ID",     pf.pfMemberId),
          row("Date of Joining",  pf.dojEpfo),
          row("Date of Exit",     pf.doeEpfo),
          row("PF Transferred",   pf.pfTransferred),
        ].join(""),
    "#334155"
  )).join("") : ""}

  <!-- ══ SECTION 5: DOCUMENTS ══ -->
  <div style="font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin-bottom:14px;margin-top:20px">Documents — In Sequence Order</div>

  ${docsWithData.length > 0 ? `
  ${docsWithData.map((item, idx) => `
    <div style="margin-bottom:28px;page-break-inside:avoid">
      <div style="background:#334155;color:#fff;padding:5px 12px;font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:1px;border-radius:4px 4px 0 0">
        ${String(idx+1).padStart(2,"0")}. ${item.label}${item.group.startsWith("employment") ? ` — ${item.group.split("/")[1] || ""}` : ""}
      </div>
      <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 4px 4px;padding:12px;background:#fafafa">
        <div style="font-size:10px;color:#94a3b8;margin-bottom:8px;font-family:monospace">${item.doc.filename || item.subKey}</div>
        ${!item.url
          ? `<div style="padding:10px;background:#fef2f2;border-radius:4px;font-size:11px;color:#dc2626">⚠ No URL found for this document. Available fields: ${Object.keys(item.doc||{}).join(", ")||"(none)"}</div>`
          : item.isImage
          ? `<img src="${item.url}" referrerpolicy="no-referrer" style="max-width:100%;max-height:500px;object-fit:contain;border-radius:4px;border:1px solid #e2e8f0;display:block" onerror="this.outerHTML='&lt;div style=&quot;padding:10px;background:#fffbeb;border-radius:4px;font-size:11px;color:#92400e&quot;&gt;⚠ Preview could not be loaded — &lt;a href=&quot;${item.url}&quot; target=&quot;_blank&quot; style=&quot;color:#2563eb;font-weight:600&quot;&gt;Open image ↗&lt;/a&gt;&lt;/div&gt;'" />`
          : item.isPdf
            ? `<div style="padding:14px;background:#eff6ff;border-radius:4px;border:1px solid #bfdbfe;text-align:center">
                <div style="font-size:13px;margin-bottom:6px">📄 PDF Document</div>
                <a href="${item.url}" target="_blank" style="color:#2563eb;font-size:11px;font-weight:600">Open PDF ↗</a>
                <div style="font-size:10px;color:#94a3b8;margin-top:4px">Links expire in 1 hour</div>
               </div>`
            : `<a href="${item.url}" target="_blank" style="color:#2563eb;font-size:11px">View Document ↗</a>`
        }
      </div>
    </div>`).join("")}
  ` : `<div style="padding:14px;background:#fffbeb;border:1px solid #fde68a;border-radius:6px;font-size:11px;color:#92400e">No documents on file for this candidate. If documents were uploaded, try refreshing the candidate's profile and printing again — document links expire after 1 hour.</div>`}

  <!-- Footer -->
  <div style="border-top:1px solid #e2e8f0;padding-top:10px;margin-top:24px;display:flex;justify-content:space-between">
    <div style="font-size:9px;color:#94a3b8">Generated by Datagate · datagate.co.in</div>
    <div style="font-size:9px;color:#94a3b8">Self-reported data. Not independently verified by Datagate.</div>
  </div>

  <!-- Print Button -->
  <div class="no-print" style="position:fixed;bottom:20px;right:20px;display:flex;gap:10px;z-index:999">
    <button onclick="window.print()" style="padding:10px 22px;background:#1e293b;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,0.2)">🖨 Print / Save PDF</button>
    <button onclick="window.close()" style="padding:10px 18px;background:#f1f5f9;color:#475569;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer">Close</button>
  </div>
</body>
</html>`);
  win.document.close();
}

// ── Styles ────────────────────────────────────────────────────────────
const G = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f0ece6; font-family: 'DM Sans', sans-serif; color: #111; }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(13,110,110,0.3); border-radius: 99px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(13,110,110,0.55); }

  .page { display: flex; min-height: 100vh; }

  /* ── Sidebar ── */
  .sidebar {
    width: 300px; min-width: 300px;
    background: #111;
    border-right: none;
    display: flex; flex-direction: column;
    height: 100vh; position: sticky; top: 0; overflow-y: auto;
  }

  /* ── Request drawer ── */
  .drawer-overlay { position:fixed; inset:0; background:rgba(17,13,10,0.5); z-index:100; backdrop-filter:blur(2px); }
  .drawer { position:fixed; top:0; right:0; width:400px; max-width:95vw; height:100vh; background:#fff;
    box-shadow:-8px 0 48px rgba(17,13,10,0.18); z-index:101; display:flex; flex-direction:column;
    transform:translateX(100%); transition:transform 0.22s cubic-bezier(0.4,0,0.2,1); }
  .drawer.open { transform:translateX(0); }
  .drawer-head { padding:1.1rem 1.3rem; border-bottom:1px solid #c8c2b8; display:flex; align-items:center; justify-content:space-between; background:#f5f2ee; }
  .drawer-title { font-size:0.9rem; font-weight:700; color:#111; }
  .drawer-close { width:28px; height:28px; border-radius:6px; border:1px solid #c8c2b8; background:transparent;
    color:#7a6e64; font-size:1rem; cursor:pointer; display:flex; align-items:center; justify-content:center; }
  .drawer-close:hover { border-color:#ef4444; color:#ef4444; background:#fef2f2; }
  .drawer-body { flex:1; overflow-y:auto; padding:1.1rem 1.3rem; background:#f5f2ee; }
  .new-req-btn { width:calc(100% - 2rem); margin:0.75rem 1rem 0; padding:0.65rem;
    background:#0d6e6e; color:#fff; border:none; border-radius:9px;
    font-family:inherit; font-size:0.76rem; font-weight:700; cursor:pointer;
    box-shadow:0 4px 16px rgba(13,110,110,0.35); transition:all 0.15s; letter-spacing:0.1px; }
  .new-req-btn:hover { background:#0a5656; transform:translateY(-1px); }

  .side-top {
    padding: 1.1rem 1.3rem 1rem;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex; align-items: center; justify-content: space-between;
  }
  .brand-wrap { display: flex; align-items: center; gap: 0.65rem; }
  .brand-icon { width: 30px; height: 30px; border-radius: 9px; background: #0d6e6e; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; box-shadow: 0 2px 8px rgba(13,110,110,0.4); }
  .brand-name { font-size: 1rem; font-weight: 800; color: #fff; letter-spacing: -0.3px; }
  .brand-sub  { font-size: 0.57rem; color: rgba(255,255,255,0.38); text-transform: uppercase; letter-spacing: 0.9px; margin-top: 1px; }
  .so-btn { width: 28px; height: 28px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: rgba(255,255,255,0.4); font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
  .so-btn:hover { border-color: #fca5a5; color: #fca5a5; background: rgba(239,68,68,0.1); }

  .user-block { padding: 0.75rem 1.3rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .user-name-txt { font-size: 0.82rem; font-weight: 700; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .emp-tag { display: inline-block; margin-top: 3px; font-size: 0.58rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #5eead4; background: rgba(13,110,110,0.22); padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(13,110,110,0.38); }

  .req-panel { padding: 1rem 1.3rem; border-bottom: 1px solid #c8c2b8; background: #fff; }
  .panel-label { font-size: 0.59rem; font-weight: 700; color: #7a6e64; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.6rem; }
  .req-in {
    width: 100%; padding: 0.55rem 0.8rem;
    background: #fff; border: 1.5px solid #c8c2b8; border-radius: 9px;
    font-family: inherit; font-size: 0.78rem; color: #111; outline: none;
    transition: all 0.15s; margin-bottom: 0.4rem;
  }
  .req-in::placeholder { color: #a09890; }
  .req-in:focus { border-color: #0d6e6e; background: #fff; box-shadow: 0 0 0 3px rgba(13,110,110,0.1); }
  .req-ta { resize: vertical; min-height: 54px; line-height: 1.5; }
  .req-msg { font-size: 0.68rem; margin: 0 0 0.35rem; }
  .req-msg.e { color: #ef4444; } .req-msg.s { color: #0d6e6e; }
  .send-btn { width: 100%; padding: 0.55rem; background: #0d6e6e; color: #fff; border: none; border-radius: 8px; font-family: inherit; font-size: 0.76rem; font-weight: 700; cursor: pointer; transition: all 0.15s; letter-spacing: 0.1px; box-shadow: 0 2px 8px rgba(13,110,110,0.25); }
  .send-btn:hover:not(:disabled) { background: #0a5656; }
  .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .filter-tabs { display: flex; border-bottom: 1px solid rgba(255,255,255,0.06); padding: 0 0.5rem; }
  .ft-btn { flex: 1; padding: 0.6rem 0; background: none; border: none; border-bottom: 2.5px solid transparent; font-size: 0.63rem; font-weight: 600; color: rgba(255,255,255,0.38); cursor: pointer; transition: all 0.12s; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: -1px; display: flex; align-items: center; justify-content: center; gap: 4px; font-family: inherit; }
  .ft-btn:hover { color: rgba(255,255,255,0.7); }
  .ft-btn.on { color: #5eead4; border-bottom-color: #0d6e6e; }
  .ft-cnt { padding: 1px 6px; border-radius: 4px; font-size: 0.58rem; font-weight: 700; background: rgba(13,110,110,0.2); color: #5eead4; }
  .ft-btn.on .ft-cnt { background: #0d6e6e; color: #fff; }

  .search-wrap { padding: 0.65rem 1.3rem 0.3rem; }
  .search-in { width: 100%; padding: 0.42rem 0.7rem; background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.08); border-radius: 7px; font-family: inherit; font-size: 0.71rem; color: #fff; outline: none; transition: all 0.12s; }
  .search-in::placeholder { color: rgba(255,255,255,0.25); }
  .search-in:focus { border-color: #0d6e6e; background: rgba(255,255,255,0.09); box-shadow: 0 0 0 2px rgba(13,110,110,0.2); }

  .c-list { flex: 1; overflow-y: auto; padding: 0.3rem 0.9rem 2rem; }
  .c-empty { font-size: 0.72rem; color: rgba(255,255,255,0.25); padding: 1rem 0.4rem; }

  .c-item { display: flex; align-items: flex-start; gap: 0.55rem; padding: 0.65rem 0.75rem; border-radius: 9px; cursor: pointer; margin-bottom: 3px; transition: all 0.1s; }
  .c-item:hover { background: rgba(255,255,255,0.06); }
  .c-item.sel { background: rgba(13,110,110,0.18); border: 1.5px solid rgba(13,110,110,0.38); }
  .c-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
  .c-mail { font-size: 0.72rem; color: #fff; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .c-nm { font-size: 0.64rem; color: rgba(255,255,255,0.42); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .c-dt { font-size: 0.61rem; color: rgba(255,255,255,0.25); margin-top: 2px; }

  /* ── Main ── */
  .main { flex: 1; overflow-y: auto; min-width: 0; background: #f0ece6; }

  .top-bar { background: #f5f2ee; border-bottom: 1px solid #c8c2b8; padding: 0.9rem 1.75rem; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; box-shadow: 0 1px 6px rgba(17,13,10,0.06); }
  .top-title { font-size: 0.78rem; font-weight: 500; color: #7a6e64; }
  .top-title strong { color: #111; font-size: 0.9rem; font-weight: 700; }

  .print-btn { padding: 0.44rem 1rem; background: #0d6e6e; color: #fff; border: none; border-radius: 7px; font-family: inherit; font-size: 0.73rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; transition: background 0.15s; box-shadow: 0 2px 8px rgba(13,110,110,0.25); }
  .print-btn:hover:not(:disabled) { background: #0a5656; }
  .print-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .empty-view { display: flex; flex-direction: column; align-items: center; justify-content: center; height: calc(100vh - 57px); gap: 0.5rem; }
  .empty-ico { font-size: 36px; opacity: 0.12; }
  .empty-h { font-size: 0.9rem; font-weight: 600; color: #a09890; }
  .empty-s { font-size: 0.75rem; color: #c8c2b8; }

  /* ── Profile area ── */
  .pane { padding: 1.75rem 2rem; }

  .hero-card {
    background: #111;
    border-radius: 14px; padding: 1.4rem 1.6rem; margin-bottom: 1.25rem;
    display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.75rem;
    box-shadow: 0 8px 32px rgba(17,13,10,0.18);
  }
  .hero-name { font-size: 1.25rem; font-weight: 700; color: #fafaf8; letter-spacing: -0.3px; }
  .hero-email { font-size: 0.72rem; color: rgba(255,255,255,0.38); margin-top: 3px; font-family: 'JetBrains Mono', monospace; }
  .hero-badges { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.7rem; }
  .hb { padding: 0.18rem 0.6rem; border-radius: 4px; font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  .hb-approved { background: rgba(13,110,110,0.25); color: #5eead4; }
  .hb-pending  { background: rgba(234,179,8,0.2);  color: #fbbf24; }
  .hb-declined { background: rgba(239,68,68,0.2);  color: #f87171; }
  .hb-info     { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); }

  .msg-bubble { max-width: 260px; padding: 0.65rem 0.9rem; background: rgba(255,255,255,0.05); border-radius: 8px; border: 1px solid rgba(255,255,255,0.07); }
  .msg-lbl { font-size: 0.55rem; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
  .msg-txt { font-size: 0.72rem; color: rgba(255,255,255,0.55); line-height: 1.5; }

  .note-bar { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 0.6rem 0.9rem; font-size: 0.7rem; color: #92400e; margin-bottom: 1.1rem; line-height: 1.55; }
  .status-card { background: #fff; border: 1px solid #c8c2b8; border-radius: 10px; padding: 1.1rem 1.25rem; font-size: 0.82rem; color: #7a6e64; box-shadow: 0 1px 6px rgba(17,13,10,0.05); }
  .status-card.dec { background: #fef2f2; border-color: #fecaca; color: #dc2626; }

  /* ── Tabs ── */
  .tab-nav { display: flex; background: #fff; border-bottom: 1.5px solid #c8c2b8; border-radius: 9px 9px 0 0; overflow: hidden; }
  .tab-btn { flex: 1; padding: 0.7rem 0.4rem; background: none; border: none; border-bottom: 2.5px solid transparent; font-family: inherit; font-size: 0.72rem; font-weight: 500; color: #a09890; cursor: pointer; margin-bottom: -1.5px; transition: all 0.12s; white-space: nowrap; }
  .tab-btn:hover { color: #111; background: #faf8f5; }
  .tab-btn.on { color: #0a5656; border-bottom-color: #0d6e6e; font-weight: 700; background: #fff; }

  .tab-pane { background: #fff; border: 1px solid #c8c2b8; border-top: none; border-radius: 0 0 9px 9px; padding: 1.25rem 1.4rem; margin-bottom: 1.1rem; box-shadow: 0 2px 12px rgba(17,13,10,0.05); }

  /* ── KV ── */
  .kv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(158px, 1fr)); gap: 0.75rem; }
  .kv { display: flex; flex-direction: column; gap: 3px; }
  .kv-k { font-size: 0.6rem; font-weight: 600; color: #7a6e64; text-transform: uppercase; letter-spacing: 0.5px; }
  .kv-v { font-size: 0.83rem; color: #111; font-weight: 500; word-break: break-word; }
  .kv-v.mono { font-family: 'JetBrains Mono', monospace; font-size: 0.74rem; }
  .kv-v.nd { color: #c8c2b8; font-style: italic; font-weight: 400; font-size: 0.76rem; }

  .sec { margin-bottom: 1.2rem; }
  .sec:last-child { margin-bottom: 0; }
  .sec-title { font-size: 0.6rem; font-weight: 700; color: #5a5248; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 0.5rem; margin-bottom: 0.75rem; border-bottom: 1px solid #e8e2da; }

  .nd-box { font-size: 0.76rem; color: #a09890; padding: 0.7rem; background: #f5f2ee; border-radius: 6px; border: 1px solid #c8c2b8; }

  .emp-card { border: 1px solid #c8c2b8; border-radius: 8px; padding: 1rem 1.1rem; margin-bottom: 0.7rem; position: relative; overflow: hidden; background: #faf8f5; box-shadow: 0 1px 4px rgba(17,13,10,0.05); }
  .emp-card::before { content:''; position:absolute; top:0; left:0; bottom:0; width:3px; background:#0d6e6e; border-radius:3px 0 0 3px; }
  .emp-title { font-size: 0.65rem; font-weight: 700; color: #0d6e6e; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 0.65rem; padding-left: 4px; display: flex; align-items: center; gap: 0.4rem; }
  .curr-pill { background: #e0f0ee; color: #0a5656; padding: 1px 7px; border-radius: 4px; font-size: 0.58rem; font-weight: 700; border: 1px solid #a8d5ce; }

  .edu-card { border: 1px solid #c8c2b8; border-radius: 8px; padding: 1rem 1.1rem; margin-bottom: 0.7rem; background: #faf8f5; box-shadow: 0 1px 4px rgba(17,13,10,0.05); }
  .edu-title { font-size: 0.65rem; font-weight: 700; color: #0d6e6e; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 0.65rem; }

  .sub-div { border-top: 1px solid #e8e2da; margin-top: 0.7rem; padding-top: 0.7rem; }
  .sub-lbl { font-size: 0.58rem; font-weight: 700; color: #a09890; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.45rem; }

  .gap-note { margin-top: 0.6rem; padding: 0.5rem 0.7rem; background: #fffbeb; border-radius: 6px; border: 1px solid #fde68a; font-size: 0.7rem; color: #92400e; }

  /* ── Documents ── */
  .doc-grp-title { font-size: 0.6rem; font-weight: 700; color: #7a6e64; text-transform: uppercase; letter-spacing: 0.8px; margin: 0.9rem 0 0.45rem; }
  .doc-row { display: flex; align-items: center; justify-content: space-between; padding: 0.55rem 0.85rem; background: #f5f2ee; border: 1px solid #c8c2b8; border-radius: 6px; margin-bottom: 0.35rem; }
  .doc-name { font-size: 0.76rem; font-weight: 600; color: #111; }
  .doc-meta { font-size: 0.62rem; color: #a09890; margin-top: 1px; font-family: 'JetBrains Mono', monospace; }
  .doc-view { padding: 0.3rem 0.75rem; background: #0d6e6e; color: #fff; border-radius: 5px; font-size: 0.68rem; font-weight: 600; text-decoration: none; white-space: nowrap; transition: background 0.15s; }
  .doc-view:hover { background: #0a5656; }

  @media(max-width:768px) {
    .sidebar { width:100%; height:auto; position:relative; }
    .page { flex-direction:column; }
    .pane { padding:1rem; }
  }

  /* ── Bulk invite ── */
  .bulk-tab-row { display:flex; border-bottom:1px solid #c8c2b8; margin-bottom:0.6rem; }

  /* ── Excel drop zone ── */
  .xls-drop { border:2px dashed #a8d5ce; border-radius:10px; padding:1rem; text-align:center;
    background:#f0ece6; cursor:pointer; transition:all 0.15s; margin-bottom:0.6rem; }
  .xls-drop:hover, .xls-drop.drag { border-color:#0d6e6e; background:#e0f0ee; }
  .xls-drop-icon { font-size:1.4rem; margin-bottom:0.3rem; }
  .xls-drop-txt { font-size:0.72rem; color:#0d6e6e; font-weight:600; }
  .xls-drop-sub { font-size:0.63rem; color:#a09890; margin-top:2px; }
  .xls-parsed { font-size:0.68rem; color:#0a5656; background:#e0f0ee; border-radius:6px;
    padding:0.4rem 0.65rem; margin-bottom:0.5rem; font-weight:600; border:1px solid #a8d5ce; }
  .bulk-tab { flex:1; padding:0.38rem 0; background:none; border:none; border-bottom:2px solid transparent;
    font-size:0.65rem; font-weight:700; color:#7a6e64; cursor:pointer; font-family:inherit;
    text-transform:uppercase; letter-spacing:0.5px; margin-bottom:-1px; transition:all 0.12s; }
  .bulk-tab.on { color:#0d6e6e; border-bottom-color:#0d6e6e; }

  /* ── Inbox / Messaging ── */
  .inbox-overlay { position:fixed; inset:0; background:rgba(17,13,10,0.5); z-index:200; backdrop-filter:blur(3px); }
  .inbox-panel { position:fixed; top:0; right:0; width:680px; max-width:98vw; height:100vh;
    background:#fff; box-shadow:-8px 0 48px rgba(17,13,10,0.18); z-index:201;
    display:flex; flex-direction:column; }
  .inbox-head { padding:1rem 1.4rem; border-bottom:1px solid #c8c2b8; display:flex; align-items:center;
    justify-content:space-between; background:#f5f2ee; flex-shrink:0; }
  .inbox-title { font-size:0.9rem; font-weight:700; color:#111; }
  .inbox-close { width:28px; height:28px; border-radius:6px; border:1px solid #c8c2b8;
    background:transparent; color:#7a6e64; font-size:1rem; cursor:pointer;
    display:flex; align-items:center; justify-content:center; }
  .inbox-close:hover { border-color:#ef4444; color:#ef4444; background:#fef2f2; }
  .inbox-body { display:flex; flex:1; overflow:hidden; }
  .inbox-list { width:240px; min-width:240px; border-right:1px solid #c8c2b8; overflow-y:auto;
    background:#f5f2ee; }
  .inbox-thread { flex:1; display:flex; flex-direction:column; overflow:hidden; }
  .thread-item { padding:0.75rem 1rem; cursor:pointer; border-bottom:1px solid #c8c2b8; transition:background 0.1s; }
  .thread-item:hover { background:#e0f0ee; }
  .thread-item.active { background:#e0f0ee; border-left:3px solid #0d6e6e; }
  .thread-email { font-size:0.72rem; font-weight:700; color:#111; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .thread-preview { font-size:0.65rem; color:#a09890; margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .thread-meta { display:flex; justify-content:space-between; align-items:center; margin-top:3px; }
  .thread-time { font-size:0.58rem; color:#c8c2b8; }
  .unread-badge { background:#0d6e6e; color:#fff; font-size:0.55rem; font-weight:800; padding:1px 6px; border-radius:999px; }
  .msg-list { flex:1; overflow-y:auto; padding:1rem 1.25rem; display:flex; flex-direction:column; gap:0.65rem; }
  .msg-bubble-wrap { display:flex; flex-direction:column; }
  .msg-bubble-wrap.mine { align-items:flex-end; }
  .msg-bubble-wrap.theirs { align-items:flex-start; }
  .msg-bubble { max-width:75%; padding:0.65rem 0.9rem; border-radius:12px; font-size:0.82rem; line-height:1.55; word-break:break-word; }
  .msg-bubble.mine { background:#0d6e6e; color:#fff; border-radius:12px 12px 3px 12px; }
  .msg-bubble.theirs { background:#f5f2ee; color:#111; border-radius:12px 12px 12px 3px; border:1px solid #c8c2b8; }
  .msg-sender { font-size:0.6rem; color:#a09890; margin-bottom:3px; font-weight:600; }
  .msg-time { font-size:0.58rem; margin-top:3px; }
  .msg-time.mine { color:rgba(255,255,255,0.6); text-align:right; }
  .msg-time.theirs { color:#c8c2b8; }
  .msg-compose { padding:0.85rem 1.25rem; border-top:1px solid #c8c2b8; background:#fff; flex-shrink:0; }
  .msg-input { width:100%; padding:0.6rem 0.875rem; background:#f5f2ee; border:1.5px solid #c8c2b8;
    border-radius:9px; font-family:inherit; font-size:0.82rem; color:#111; outline:none;
    resize:none; min-height:70px; max-height:140px; transition:border-color 0.15s; }
  .msg-input:focus { border-color:#0d6e6e; background:#fff; box-shadow:0 0 0 3px rgba(13,110,110,0.1); }
  .msg-send-btn { padding:0.55rem 1.25rem; background:#0d6e6e; color:#fff; border:none;
    border-radius:8px; font-family:inherit; font-size:0.78rem; font-weight:700; cursor:pointer;
    transition:all 0.15s; box-shadow:0 2px 8px rgba(13,110,110,0.25); }
  .msg-send-btn:hover:not(:disabled) { background:#0a5656; }
  .msg-send-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .inbox-btn { position:relative; width:32px; height:32px; border-radius:8px;
    border:1px solid rgba(255,255,255,0.1); background:transparent; color:rgba(255,255,255,0.5);
    font-size:0.9rem; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s; }
  .inbox-btn:hover { border-color:rgba(13,110,110,0.6); color:#5eead4; background:rgba(13,110,110,0.15); }
  .inbox-badge { position:absolute; top:-4px; right:-4px; background:#ef4444; color:#fff;
    border-radius:999px; font-size:0.55rem; font-weight:800; min-width:15px; height:15px;
    display:flex; align-items:center; justify-content:center; padding:0 3px; border:2px solid #111; }

  /* ── Completeness bar ── */
  .comp-bar-wrap { margin:0.5rem 0 0.75rem; }
  .comp-bar-label { display:flex; justify-content:space-between; font-size:0.62rem; color:rgba(255,255,255,0.38); font-weight:600; margin-bottom:0.3rem; }
  .comp-bar-bg { height:5px; background:rgba(255,255,255,0.07); border-radius:999px; overflow:hidden; }
  .comp-bar-fill { height:100%; border-radius:999px; transition:width 0.4s; }

  /* ── Candidate status badge ── */
  .cand-status { font-size:0.58rem; font-weight:700; padding:1px 6px; border-radius:4px; white-space:nowrap; }
  .cand-status.submitted  { background:rgba(13,110,110,0.25); color:#5eead4; }
  .cand-status.draft      { background:rgba(234,179,8,0.2);  color:#fde68a; }
  .cand-status.no-profile { background:rgba(239,68,68,0.25); color:#fca5a5; }
  .cand-status.pending    { background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.45); }
`;;



// ── Modals ────────────────────────────────────────────────────────────
function TermsModal({ onAccept }) {
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,backdropFilter:"blur(4px)"}}>
      <div style={{background:"#fff",borderRadius:12,padding:"1.75rem",maxWidth:480,width:"90%",boxShadow:"0 32px 80px rgba(0,0,0,0.25)",maxHeight:"90vh",display:"flex",flexDirection:"column",gap:"1rem"}}>
        <div>
          <div style={{fontSize:"0.95rem",fontWeight:700,color:"#0f172a",marginBottom:"0.15rem"}}>Data Access & Sharing Agreement</div>
          <div style={{fontSize:"0.72rem",color:"#64748b"}}>Read and accept before accessing employee profiles</div>
        </div>
        <div style={{overflowY:"auto",maxHeight:260,fontSize:"0.75rem",color:"#374151",lineHeight:1.65,padding:"0.85rem",background:"#f8fafc",borderRadius:7,border:"1px solid #e2e8f0"}}>
          <p><strong>1. Purpose</strong><br/>You access employee data solely for background verification or onboarding with explicit employee consent.</p>
          <p style={{marginTop:"0.5rem"}}><strong>2. Usage Restrictions</strong><br/>Data must not be used beyond the stated purpose or shared with third parties without fresh consent.</p>
          <p style={{marginTop:"0.5rem"}}><strong>3. Storage Obligations</strong><br/>If stored in your systems, you become a Data Processor under India's DPDP Act 2023 and are responsible for secure storage and deletion on request.</p>
          <p style={{marginTop:"0.5rem"}}><strong>4. Self-Reported Data</strong><br/>All data is self-reported by the employee. Datagate does not independently verify it unless a verified check has been completed.</p>
          <p style={{marginTop:"0.5rem"}}><strong>5. Consent Withdrawal</strong><br/>Employees may withdraw consent anytime. You must then cease use and delete all copies.</p>
          <p style={{marginTop:"0.5rem"}}><strong>6. Compliance</strong><br/>You confirm compliance with applicable data protection laws including DPDP Act 2023.</p>
        </div>
        <label style={{display:"flex",alignItems:"flex-start",gap:"0.6rem",cursor:"pointer"}} onClick={() => setChecked(p => !p)}>
          <div style={{width:16,height:16,borderRadius:3,border:`2px solid ${checked?"#0d6e6e":"#c8c2b8"}`,background:checked?"#1e293b":"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,transition:"all 0.12s"}}>
            {checked && <span style={{color:"#fff",fontSize:"0.55rem",fontWeight:800}}>✓</span>}
          </div>
          <span style={{fontSize:"0.75rem",color:"#374151",lineHeight:1.5}}>I have read and agree to the Data Access & Sharing Agreement on behalf of my organisation.</span>
        </label>
        <button
          onClick={async () => { if (!checked || busy) return; setBusy(true); await onAccept(); setBusy(false); }}
          disabled={!checked || busy}
          style={{padding:"0.65rem",background:checked?"#0d6e6e":"#e8e2da",color:checked?"#fff":"#a09890",border:"none",borderRadius:7,fontFamily:"inherit",fontSize:"0.84rem",fontWeight:700,cursor:checked&&!busy?"pointer":"not-allowed",transition:"all 0.15s"}}>
          {busy ? "Saving…" : "Accept & Continue"}
        </button>
      </div>
    </div>
  );
}

function SignoutModal({ onConfirm, onCancel }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(3px)"}}>
      <div style={{background:"#fff",borderRadius:10,padding:"1.5rem",maxWidth:300,width:"90%",textAlign:"center",boxShadow:"0 16px 48px rgba(0,0,0,0.14)"}}>
        <div style={{fontSize:28,marginBottom:"0.55rem"}}>👋</div>
        <h3 style={{margin:"0 0 0.3rem",color:"#0f172a",fontWeight:700,fontSize:"0.95rem"}}>Sign out?</h3>
        <p style={{color:"#64748b",fontSize:"0.8rem",marginBottom:"1.1rem",lineHeight:1.5}}>You can sign back in anytime.</p>
        <div style={{display:"flex",gap:"0.6rem"}}>
          <button onClick={onCancel}  style={{flex:1,padding:"0.6rem",borderRadius:6,border:"1px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",fontWeight:600,color:"#475569",fontSize:"0.8rem",fontFamily:"inherit"}}>Stay</button>
          <button onClick={onConfirm} style={{flex:1,padding:"0.6rem",borderRadius:6,border:"none",background:"#ef4444",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:"0.8rem",fontFamily:"inherit"}}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

// ── Field helpers ─────────────────────────────────────────────────────
function KV({ k, v, mono }) {
  return (
    <div className="kv">
      <span className="kv-k">{k}</span>
      <span className={`kv-v${!v||v==="—"?" nd":""}${mono?" mono":""}`}>{v||"—"}</span>
    </div>
  );
}
function Sec({ title, children }) {
  return (
    <div className="sec">
      {title && <div className="sec-title">{title}</div>}
      {children}
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────
function OverviewTab({ data }) {
  if (!data) return <div className="nd-box">No profile data</div>;
  const cur  = data.currentAddress   || {};
  const perm = data.permanentAddress || {};
  return (
    <div>
      <Sec title="Identity">
        <div className="kv-grid">
          <KV k="Full Name"           v={[data.firstName,data.middleName,data.lastName].filter(Boolean).join(" ")} />
          <KV k="Date of Birth"       v={isoToDisplay(data.dob)} />
          <KV k="Gender"              v={data.gender} />
          <KV k="Nationality"         v={data.nationality} />
          <KV k="Blood Group"         v={data.bloodGroup} />
          <KV k="Marital Status"      v={data.maritalStatus} />
          <KV k="Email"               v={data.email} mono />
          <KV k="Mobile"              v={data.mobile ? `+91 ${data.mobile}` : ""} mono />
          <KV k="Aadhaar"             v={maskAadhaar(data.aadhaar||data.aadhar)} mono />
          <KV k="Name as per Aadhaar" v={data.nameAsPerAadhaar} />
          <KV k="PAN"                 v={data.pan} mono />
          <KV k="Name as per PAN"     v={data.nameAsPerPan} />
          {(data.hasPassport==="Yes"||data.passport)&&<>
            <KV k="Has Passport"  v={data.hasPassport} />
            <KV k="Passport No."  v={data.passport} mono />
            <KV k="Issue Date"    v={isoToDisplay(data.passportIssue)} />
            <KV k="Expiry Date"   v={isoToDisplay(data.passportExpiry)} />
          </>}
        </div>
      </Sec>
      {(data.fatherFirst||data.fatherName)&&(
        <Sec title="Family">
          <div className="kv-grid">
            <KV k="Father's Name" v={data.fatherName||[data.fatherFirst,data.fatherMiddle,data.fatherLast].filter(Boolean).join(" ")} />
            <KV k="Mother's Name" v={data.motherName||[data.motherFirst,data.motherMiddle,data.motherLast].filter(Boolean).join(" ")} />
          </div>
        </Sec>
      )}
      {(data.emergName||data.emergPhone)&&(
        <Sec title="Emergency Contact">
          <div className="kv-grid">
            <KV k="Name"         v={data.emergName} />
            <KV k="Relationship" v={data.emergRel} />
            <KV k="Phone"        v={data.emergPhone} mono />
          </div>
        </Sec>
      )}
      <Sec title="Current Address">
        <div className="kv-grid">
          <KV k="Door / Street"  v={cur.door} />
          <KV k="Village / Area" v={cur.village} />
          <KV k="Tehsil / Taluk" v={cur.locality} />
          <KV k="District"       v={cur.district} />
          <KV k="State"          v={cur.state} />
          <KV k="Pincode"        v={cur.pin} mono />
          <KV k="Residing From"  v={isoToDisplay(cur.from)} />
        </div>
      </Sec>
      {(perm.door||perm.state)&&(
        <Sec title="Permanent / Native Address">
          <div className="kv-grid">
            <KV k="Door / Street"  v={perm.door} />
            <KV k="Village / Area" v={perm.village} />
            <KV k="Tehsil / Taluk" v={perm.locality} />
            <KV k="District"       v={perm.district} />
            <KV k="State"          v={perm.state} />
            <KV k="Pincode"        v={perm.pin} mono />
          </div>
        </Sec>
      )}
      {data.bankName&&(
        <Sec title="Bank Account">
          <div className="kv-grid">
            <KV k="Bank"           v={data.bankName==="Other"&&data.bankOther?`Other — ${data.bankOther}`:data.bankName} />
            <KV k="Account Holder" v={data.bankAccountName} />
            <KV k="IFSC"           v={data.ifsc} mono />
            <KV k="Branch"         v={data.branch} />
            <KV k="Account Type"   v={data.accountType} />
            <KV k="Account No."    v={data.accountFull || (data.accountLast4 ? `••••••••${data.accountLast4}` : "")} mono />
          </div>
        </Sec>
      )}
    </div>
  );
}

// ── Education Tab ─────────────────────────────────────────────────────
function EducationTab({ data }) {
  if (!data) return <div className="nd-box">No education records</div>;
  const EduCard = ({ title, s }) => {
    if (!s||!Object.values(s).some(Boolean)) return null;
    return (
      <div className="edu-card">
        <div className="edu-title">{title}</div>
        <div className="kv-grid">
          <KV k="Institution"           v={s.school||s.college||s.institute} />
          <KV k="Board / University"    v={s.board||s.university} />
          {s.stream&&<KV k="Stream"     v={s.stream} />}
          {s.course&&<KV k="Course / Degree"       v={s.course} />}
          {(s.branch||s.specialization)&&<KV k="Branch / Specialization" v={s.branch||s.specialization} />}
          <KV k="Year of Passing"       v={s.yearOfPassing} />
          {s.from&&<KV k="From"         v={isoToDisplay(s.from)} />}
          {s.to&&<KV k="To"             v={isoToDisplay(s.to)} />}
          {s.hallTicket&&<KV k="Hall Ticket / Roll No." v={s.hallTicket} mono />}
          <KV k="Result"                v={s.resultValue?`${s.resultType||""} ${s.resultValue}`.trim():""} />
          {s.mode&&<KV k="Mode"         v={s.mode} />}
          {s.medium&&<KV k="Medium"     v={s.medium} />}
          {s.backlogs&&<KV k="Backlogs" v={s.backlogs} />}
          {s.address&&<KV k="Address"   v={s.address} />}
        </div>
      </div>
    );
  };
  return (
    <div>
      <EduCard title="Class X — SSC / Matriculation"  s={data.classX} />
      <EduCard title="Intermediate — HSC / 12th"       s={data.intermediate} />
      {(data.hasDip==="Yes"||data.diploma?.institute)&&data.diploma&&Object.values(data.diploma).some(Boolean)&&<EduCard title="Diploma / Technical / Vocational" s={data.diploma} />}
      <EduCard title="Undergraduate / Degree"          s={data.undergraduate} />
      {data.postgraduate?.college&&<EduCard title="Postgraduate / Masters" s={data.postgraduate} />}

      {(data.hasProfQual==="Yes"||true)&&Array.isArray(data.professionalQualifications)&&data.professionalQualifications.filter(q=>q.type).length>0&&(
        <Sec title="Professional Qualifications">
          {data.professionalQualifications.map((q,i)=>(
            <div key={i} style={{padding:"0.6rem 0.75rem",background:"#f8fafc",borderRadius:6,border:"1px solid #e8ecf2",marginBottom:"0.35rem"}}>
              <div className="kv-grid">
                <KV k="Type"   v={q.type==="Other"?(q.otherType||"Other"):q.type} />
                <KV k="Level"  v={q.level} />
                <KV k="Year"   v={q.year} />
              </div>
            </div>
          ))}
        </Sec>
      )}

      {(data.hasArticleship==="Yes"||true)&&Array.isArray(data.articleships)&&data.articleships.filter(a=>a.firm||a.type).length>0&&(
        <Sec title="Articleship / Practical Training">
          {data.articleships.map((a,i)=>(
            <div key={i} style={{padding:"0.6rem 0.75rem",background:"#fff7ed",borderRadius:6,border:"1px solid #fed7aa",marginBottom:"0.35rem"}}>
              <div className="kv-grid">
                <KV k="Type"       v={a.type==="Other Practical Training"?(a.otherType||a.type):a.type} />
                <KV k="Firm"       v={a.firm} />
                <KV k="City"       v={a.city} />
                <KV k="Principal"  v={a.principalName} />
                <KV k="Reg. No."   v={a.regNo} mono />
                <KV k="From"       v={isoToDisplay(a.from)} />
                <KV k="To"         v={a.to?(isoToDisplay(a.to)):(a.isOngoing==="Ongoing"?"Ongoing":"")} />
              </div>
            </div>
          ))}
        </Sec>
      )}

      {(data.hasCerts==="Yes"||true)&&Array.isArray(data.certifications)&&data.certifications.filter(c=>c.name).length>0&&(
        <Sec title="Certifications">
          <div className="kv-grid">
            {data.certifications.map((c,i)=><KV key={i} k={`Cert ${i+1}`} v={c.name} />)}
          </div>
        </Sec>
      )}

      {data.hasEduGap==="Yes"&&(
        <Sec title="Education Gap Before First Job">
          <div className="kv-grid">
            <KV k="Had Gap" v={data.hasEduGap} />
            <KV k="Reason"  v={data.eduGapReason} />
          </div>
        </Sec>
      )}
    </div>
  );
}

// ── Employment Tab ────────────────────────────────────────────────────
function EmploymentTab({ data, resumeKey, docUrls }) {
  const list = Array.isArray(data) ? data : (data?.employments||[]);
  if (!list.length) return <div className="nd-box">No employment records</div>;
  return (
    <div>
      {resumeKey&&docUrls?.[resumeKey]&&(
        <div style={{marginBottom:"0.85rem"}}>
          <a href={docUrls[resumeKey]} target="_blank" rel="noopener noreferrer" className="doc-view" style={{display:"inline-flex",alignItems:"center",gap:"0.35rem"}}>📄 View Resume / CV ↗</a>
        </div>
      )}
      {list.map((e,i)=>(
        <div key={e.company_id||i} className="emp-card">
          <div className="emp-title">
            {i===0?"Current / Most Recent Employer":`Previous Employer ${i}`}
            {i===0&&e.currentlyWorking==="Yes"&&<span className="curr-pill">Still Employed</span>}
          </div>
          <div className="kv-grid">
            <KV k="Company"         v={e.companyName} />
            <KV k="Designation"     v={e.designation} />
            <KV k="Department"      v={e.department} />
            <KV k="Employment Type" v={e.employmentType} />
            <KV k="Employee ID"     v={e.employeeId} mono />
            <KV k="Work Email"      v={e.workEmail} mono />
            <KV k="Office Address"  v={e.officeAddress} />
            <KV k="Date of Joining" v={isoToDisplay(e.startDate)} />
            {i===0
              ?<KV k="Currently Working" v={e.currentlyWorking==="Yes"?"Yes — Still Employed":"No"} />
              :<KV k="Date of Leaving"   v={isoToDisplay(e.endDate)} />}
            {i===0&&e.currentlyWorking==="No"&&<KV k="Date of Leaving" v={isoToDisplay(e.endDate)} />}
            {e.reasonForRelieving&&<KV k="Reason for Leaving" v={e.reasonForRelieving} />}
            {e.duties&&<KV k="Duties" v={e.duties} />}
            {e.employmentType==="Contract"&&e.contractVendor?.company&&<>
              <KV k="Vendor Company" v={e.contractVendor.company} />
              <KV k="Vendor Email"   v={e.contractVendor.email} mono />
              <KV k="Vendor Mobile"  v={e.contractVendor.mobile} mono />
            </>}
          </div>
          {e.reference?.name&&(
            <div className="sub-div">
              <div className="sub-lbl">Reference</div>
              <div className="kv-grid">
                <KV k="Name"   v={e.reference.name} />
                <KV k="Role"   v={e.reference.role} />
                <KV k="Email"  v={e.reference.email} mono />
                <KV k="Mobile" v={e.reference.mobile} mono />
              </div>
            </div>
          )}
          {e.gap?.hasGap==="Yes"&&e.gap?.reason&&(
            <div className="gap-note">⏱ Employment gap: {e.gap.reason}</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── UAN Tab ───────────────────────────────────────────────────────────
function UanTab({ data }) {
  if (!data) return <div className="nd-box">No UAN data</div>;
  const hasUan = data.hasUan==="yes"||data.hasUan===true;
  return (
    <div>
      <Sec title="UAN Details">
        <div className="kv-grid">
          <KV k="Has UAN" v={hasUan?"Yes":"No"} />
          {hasUan&&<>
            <KV k="UAN Number"      v={data.uanNumber} mono />
            <KV k="Name as per UAN" v={data.nameAsPerUan} />
            <KV k="Mobile Linked"   v={data.mobileLinked} mono />
            <KV k="UAN Active"      v={data.isActive} />
          </>}
        </div>
      </Sec>
      {Array.isArray(data.pfRecords)&&data.pfRecords.length>0&&(
        <Sec title="PF Records per Employer">
          {data.pfRecords.map((pf,i)=>(
            <div key={i} style={{padding:"0.6rem 0.8rem",background:"#f8fafc",border:"1px solid #e8ecf2",borderRadius:6,marginBottom:"0.4rem"}}>
              <div style={{fontSize:"0.62rem",fontWeight:700,color:"#0d6e6e",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"0.4rem"}}>{pf.companyName||`Employer ${i+1}`}</div>
              {pf.hasPf==="No"
                ?<div style={{fontSize:"0.72rem",color:"#0369a1"}}>ℹ PF not maintained by this employer</div>
                :<div className="kv-grid">
                  <KV k="PF Type"          v={pf.pfType === "Trust" ? "Company's Own PF Trust (Exempted)" : pf.pfType === "EPFO" ? "EPFO (Government)" : ""} />
                  <KV k="PF Member ID"    v={pf.pfMemberId} mono />
                  <KV k="Date of Joining" v={isoToDisplay(pf.dojEpfo)} />
                  <KV k="Date of Exit"    v={isoToDisplay(pf.doeEpfo)} />
                  <KV k="PF Transferred"  v={pf.pfTransferred} />
                </div>}
            </div>
          ))}
        </Sec>
      )}
    </div>
  );
}

// ── Documents Tab ─────────────────────────────────────────────────────
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
const SEC_TITLES_DOC = { personal:"Identity Documents", education:"Education Certificates", uan:"UAN / EPFO Documents", general:"Resume" };

function BgvTab({ consentData, apiFetch, API: apiUrl }) {
  const CHECK_STATUS_COLORS = {
    pending:        { color:"#94a3b8", bg:"#f1f5f9", label:"Pending" },
    in_progress:    { color:"#3b82f6", bg:"#eff6ff", label:"In Progress" },
    verified:       { color:"#16a34a", bg:"#f0fdf4", label:"Verified ✓" },
    failed:         { color:"#ef4444", bg:"#fef2f2", label:"Discrepancy ✗" },
    on_hold:        { color:"#f59e0b", bg:"#fffbeb", label:"On Hold" },
    not_applicable: { color:"#64748b", bg:"#f8fafc", label:"N/A" },
  };
  const OVERALL = { clear:"#16a34a", discrepancy:"#f59e0b", failed:"#ef4444", refer:"#3b82f6" };

  const [bgvCase, setBgvCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [assignMsg, setAssignMsg] = useState("");
  const [reportUrl, setReportUrl] = useState("");

  useEffect(() => {
    if (!consentData?.consent_id) return;
    const load = async () => {
      try {
        const [cRes, vRes] = await Promise.all([
          apiFetch(`${apiUrl}/bgv/case/${consentData.consent_id}`),
          apiFetch(`${apiUrl}/bgv/vendors`),
        ]);
        if (cRes.ok) setBgvCase(await cRes.json());
        if (vRes.ok) setVendors(await vRes.json());
      } catch(_) {}
      setLoading(false);
    };
    load();
  }, [consentData?.consent_id, apiFetch, apiUrl]);

  const assignVendor = async () => {
    if (!selectedVendor || !consentData?.consent_id) return;
    setAssigning(true); setAssignMsg("");
    try {
      const res = await apiFetch(`${apiUrl}/bgv/assign`, {
        method: "POST",
        body: JSON.stringify({ consent_id: consentData.consent_id, bgv_vendor_email: selectedVendor }),
      });
      const d = await res.json();
      if (res.ok) {
        setAssignMsg(`✓ Assigned to ${selectedVendor} — ${d.checks_created} checks created`);
        const cRes = await apiFetch(`${apiUrl}/bgv/case/${consentData.consent_id}`);
        if (cRes.ok) setBgvCase(await cRes.json());
      } else {
        setAssignMsg(`✗ ${d.detail || "Assignment failed"}`);
      }
    } catch(_) { setAssignMsg("✗ Error"); }
    setAssigning(false);
    setTimeout(() => setAssignMsg(""), 4000);
  };

  const viewReport = async (reportKey) => {
    if (!consentData?.employee_id || reportUrl) { if(reportUrl) window.open(reportUrl,"_blank"); return; }
    try {
      const res = await apiFetch(`${apiUrl}/documents/${consentData.employee_id}`);
      if (res.ok) {
        const docs = await res.json();
        const bgvDocs = docs.documents?.bgv || {};
        const found = Object.values(bgvDocs).find(d => d.s3_key === reportKey);
        if (found?.url) { setReportUrl(found.url); window.open(found.url, "_blank"); }
      }
    } catch(_) {}
  };

  if (loading) return <div className="nd-box">Loading BGV status…</div>;

  return (
    <div>
      {/* Assign vendor section */}
      {(!bgvCase?.bgv_vendor_email) && (
        <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:10,padding:"1rem",marginBottom:"1rem"}}>
          <div style={{fontWeight:700,fontSize:"0.84rem",color:"#0f172a",marginBottom:"0.6rem"}}>Assign BGV Vendor</div>
          <div style={{display:"flex",gap:"0.65rem",alignItems:"center",flexWrap:"wrap"}}>
            <select value={selectedVendor} onChange={e=>setSelectedVendor(e.target.value)} style={{padding:"0.5rem 0.75rem",border:"1.5px solid #e2e8f0",borderRadius:8,fontFamily:"inherit",fontSize:"0.84rem",flex:1,minWidth:200}}>
              <option value="">Select BGV Vendor…</option>
              {vendors.map(v=><option key={v.email} value={v.email}>{v.company_name||v.name} ({v.email})</option>)}
            </select>
            <button onClick={assignVendor} disabled={!selectedVendor||assigning} style={{padding:"0.5rem 1.1rem",background:"#4f46e5",color:"#fff",border:"none",borderRadius:8,fontFamily:"inherit",fontSize:"0.82rem",fontWeight:700,cursor:"pointer",opacity:(!selectedVendor||assigning)?0.6:1}}>
              {assigning?"Assigning…":"Assign →"}
            </button>
          </div>
          {vendors.length===0 && <p style={{fontSize:"0.72rem",color:"#94a3b8",marginTop:"0.5rem"}}>No approved BGV vendors available. Contact admin to onboard a vendor.</p>}
          {assignMsg && <p style={{fontSize:"0.78rem",marginTop:"0.5rem",color:assignMsg.startsWith("✓")?"#16a34a":"#ef4444",fontWeight:600}}>{assignMsg}</p>}
        </div>
      )}

      {bgvCase?.bgv_vendor_email && (
        <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"0.75rem 1rem",marginBottom:"1rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <span style={{fontSize:"0.72rem",fontWeight:700,color:"#15803d",textTransform:"uppercase",letterSpacing:"0.5px"}}>Assigned to BGV Vendor</span>
            <div style={{fontWeight:700,fontSize:"0.875rem",color:"#0f172a",marginTop:"0.1rem"}}>{bgvCase.bgv_vendor_email}</div>
          </div>
          {bgvCase.bgv_status && <span style={{padding:"0.25rem 0.75rem",borderRadius:999,background:"#dcfce7",color:"#15803d",fontSize:"0.72rem",fontWeight:700}}>{bgvCase.bgv_status.replace("_"," ").toUpperCase()}</span>}
        </div>
      )}

      {/* Final Report */}
      {bgvCase?.bgv_report_key && (
        <div style={{background:"#f0fdf4",border:"1.5px solid #bbf7d0",borderRadius:10,padding:"1rem",marginBottom:"1rem"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"0.5rem"}}>
            <div>
              <div style={{fontWeight:800,fontSize:"0.875rem",color:"#0f172a"}}>✅ Final BGV Report Submitted</div>
              {bgvCase.bgv_overall_status && (
                <span style={{display:"inline-block",marginTop:"0.35rem",padding:"0.2rem 0.6rem",borderRadius:999,background:`${OVERALL[bgvCase.bgv_overall_status]||"#64748b"}20`,color:OVERALL[bgvCase.bgv_overall_status]||"#64748b",fontSize:"0.72rem",fontWeight:800,textTransform:"uppercase"}}>
                  {bgvCase.bgv_overall_status.toUpperCase()}
                </span>
              )}
              {bgvCase.bgv_summary && <div style={{fontSize:"0.78rem",color:"#475569",marginTop:"0.4rem",lineHeight:1.5}}>{bgvCase.bgv_summary}</div>}
            </div>
            <button onClick={()=>viewReport(bgvCase.bgv_report_key)} style={{padding:"0.4rem 0.9rem",background:"#0d6e6e",color:"#fff",border:"none",borderRadius:7,fontSize:"0.78rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              View Report ↗
            </button>
          </div>
        </div>
      )}

      {/* Check Tracker */}
      {bgvCase?.bgv_checks?.length > 0 && (
        <div>
          <div style={{fontWeight:700,fontSize:"0.84rem",color:"#0f172a",marginBottom:"0.65rem"}}>Check Status</div>
          {bgvCase.bgv_checks.map((ch,i) => {
            const st = CHECK_STATUS_COLORS[ch.status] || CHECK_STATUS_COLORS.pending;
            return (
              <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1.2fr 1fr",gap:"0.5rem",padding:"0.65rem 0",borderBottom:"1px solid #f1f5f9",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:"0.82rem",fontWeight:600,color:"#0f172a"}}>{ch.label}</div>
                  {ch.notes && <div style={{fontSize:"0.72rem",color:"#64748b",marginTop:"0.15rem",lineHeight:1.4}}>{ch.notes}</div>}
                </div>
                <span style={{display:"inline-block",padding:"0.2rem 0.6rem",borderRadius:999,background:st.bg,color:st.color,fontSize:"0.7rem",fontWeight:700}}>{st.label}</span>
                <div style={{fontSize:"0.68rem",color:"#94a3b8"}}>{ch.completed_at ? new Date(ch.completed_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}) : "—"}</div>
              </div>
            );
          })}
        </div>
      )}

      {!bgvCase?.bgv_checks?.length && bgvCase?.bgv_vendor_email && (
        <div className="nd-box">BGV vendor has not started checks yet.</div>
      )}
    </div>
  );
}

function DocumentsTab({ documents, loading }) {
  if (loading) return <div className="nd-box">Loading documents…</div>;
  if (!documents||Object.keys(documents).length===0) return <div className="nd-box">No documents uploaded yet</div>;
  const grouped = {};
  for (const [group, docs] of Object.entries(documents)) {
    const sec = group.startsWith("employment/") ? "employment" : group;
    if (!grouped[sec]) grouped[sec] = [];
    grouped[sec].push({ group, docs });
  }
  return (
    <div>
      {Object.entries(grouped).map(([sec, entries]) => (
        <div key={sec}>
          <div className="doc-grp-title">{SEC_TITLES_DOC[sec]||"Employment Documents"}</div>
          {entries.map(({group, docs}) => (
            <div key={group}>
              {group.startsWith("employment/")&&(
                <div style={{fontSize:"0.6rem",color:"#94a3b8",fontFamily:"'JetBrains Mono',monospace",margin:"0.2rem 0 0.3rem",textTransform:"uppercase",letterSpacing:"0.5px"}}>Company: {group.split("/")[1]}</div>
              )}
              {Object.entries(docs).map(([subKey, doc]) => (
                <div key={subKey} className="doc-row">
                  <div>
                    <div className="doc-name">{DOC_LABELS[subKey]||subKey}</div>
                    <div className="doc-meta">{doc.filename}{doc.uploaded_at?` · ${toIST(doc.uploaded_at)}`:""}</div>
                  </div>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="doc-view">↓ View</a>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
      <div style={{fontSize:"0.62rem",color:"#94a3b8",marginTop:"0.85rem",paddingTop:"0.7rem",borderTop:"1px solid #f1f5f9"}}>⏱ Links expire in 1 hour. Refresh page to get new links.</div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────
export default function EmployerDashboard() {
  const { user, apiFetch, logout, ready } = useAuth();
  const router = useRouter();

  const [showSignout,    setShowSignout]    = useState(false);
  const [termsAccepted,  setTermsAccepted]  = useState(false);
  const [termsLoading,   setTermsLoading]   = useState(true);
  const [consents,       setConsents]       = useState([]);
  const [selected,       setSelected]       = useState(null);
  const [profileData,    setProfileData]    = useState(null);
  const [documents,      setDocuments]      = useState(null);
  const [empId,          setEmpId]          = useState(null);
  const [docsLoading,    setDocsLoading]    = useState(false);
  const [activeTab,      setActiveTab]      = useState("Overview");
  const [cTab,           setCTab]           = useState("pending");
  const [spPending,      setSpPending]      = useState("");
  const [spApproved,     setSpApproved]     = useState("");
  const [spDeclined,     setSpDeclined]     = useState("");
  const [reqEmail,       setReqEmail]       = useState("");
  const [reqMsg,         setReqMsg]         = useState("");
  const [reqBusy,        setReqBusy]        = useState(false);
  const [reqErr,         setReqErr]         = useState("");
  const [reqOk,          setReqOk]          = useState("");
  const [showDrawer,     setShowDrawer]     = useState(false);
  const [reqTab,         setReqTab]         = useState("single"); // "single" | "bulk"
  const [bulkEmails,     setBulkEmails]     = useState("");
  const [bulkResults,    setBulkResults]    = useState([]);
  const [bulkBusy,       setBulkBusy]       = useState(false);
  const [bulkValidating, setBulkValidating] = useState(false);
  const [bulkValidated,  setBulkValidated]  = useState(null);   // null=not yet | array=validated
  const [msgRecipient,   setMsgRecipient]   = useState("Employee"); // "Employee" | "BGV Team" | "Both"
  const [xlsDragging,    setXlsDragging]    = useState(false);
  const [xlsParsed,      setXlsParsed]      = useState(""); // "12 emails found from Sheet1"
  const [candStatus,     setCandStatus]     = useState({}); // email → {status,completeness,name}
  const [remindBusy,     setRemindBusy]     = useState(false);
  const [bulkRemindBusy, setBulkRemindBusy] = useState(false);
  const [bulkRemindMsg,  setBulkRemindMsg]  = useState("");
  const [showPwModal,    setShowPwModal]    = useState(false);
  const [pwCurrent,      setPwCurrent]      = useState("");
  const [pwNew,          setPwNew]          = useState("");
  const [pwConfirm,      setPwConfirm]      = useState("");
  const [pwErr,          setPwErr]          = useState("");
  const [pwOk,           setPwOk]           = useState("");
  const [pwBusy,         setPwBusy]         = useState(false);
  const [remindMsg,      setRemindMsg]      = useState("");
  const [loadingProf,    setLoadingProf]    = useState(false);
  const [loading,        setLoading]        = useState(true);
  const [printing,       setPrinting]       = useState(false);
  const [showInbox,      setShowInbox]      = useState(false);
  const [mainTab,       setMainTab]        = useState("Overview");
  const [inboxThreads,   setInboxThreads]   = useState([]);
  const [inboxLoading,   setInboxLoading]   = useState(false);
  const [activeThread,   setActiveThread]   = useState(null); // consent_id
  const [threadMsgs,     setThreadMsgs]     = useState([]);
  const [threadLoading,  setThreadLoading]  = useState(false);
  const [msgBody,        setMsgBody]        = useState("");
  const [msgSubject,     setMsgSubject]     = useState("");
  const [msgSending,     setMsgSending]     = useState(false);
  const [msgErr,         setMsgErr]         = useState("");
  const [unreadCount,    setUnreadCount]    = useState(0);

  useEffect(() => {
    if (!ready) return;
    if (user === null) { router.replace("/employer/login"); return; }
    if (user && user.role !== "employer") { router.replace("/employer/login"); return; }
  }, [ready, user, router]);

  // Terms — sessionStorage fast path + DB check
  useEffect(() => {
    if (!ready || !user) return;
    if (typeof window !== "undefined" && sessionStorage.getItem(`dg_terms_${user.email}`) === "1") {
      setTermsAccepted(true); setTermsLoading(false); return;
    }
    const check = async () => {
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
    check();
  }, [ready, user, apiFetch]);

  const normalizeStatus = s => {
    const v = String(s||"pending").toLowerCase();
    if (["approved","approve","accepted","granted","allow"].includes(v)) return "approved";
    if (["declined","decline","rejected","denied","reject"].includes(v)) return "declined";
    return "pending";
  };
  const nc = c => ({
    ...c,
    consent_id:      c?.consent_id||c?.id||c?.consentId||c?._id,
    status:          normalizeStatus(c?.status),
    request_message: c?.request_message||c?.message||c?.comment||c?.note||"",
    employee_email:  c?.employee_email||c?.employeeEmail||c?.email||c?.user_email||"",
    employee_name:   c?.employee_name||c?.employeeName||c?.name||c?.user_name||"",
  });
  const gcid = c => c?.consent_id||c?.id||c?.consentId||c?._id;

  const loadConsents = useCallback(async () => {
    try { const r = await apiFetch(`${API}/consent/my`); if (r.ok) setConsents((await r.json()).map(nc)); } catch (_) {}
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => { if (ready && user) { loadConsents(); loadUnreadCount(); } }, [ready, user, loadConsents]);
  useEffect(() => {
    if (!ready || !user) return;
    const id = setInterval(() => { loadUnreadCount(); }, 30000);
    return () => clearInterval(id);
  }, [ready, user]);
  useEffect(() => {
    if (!ready || !user) return;
    const id = setInterval(loadConsents, 15000);
    return () => clearInterval(id);
  }, [ready, user, loadConsents]);

  const pending  = useMemo(() => consents.filter(c => c.status === "pending"),  [consents]);
  const approved = useMemo(() => consents.filter(c => c.status === "approved"), [consents]);
  const declined = useMemo(() => consents.filter(c => c.status === "declined"), [consents]);

  const filt = (list, q) => {
    if (!q.trim()) return list;
    const lq = q.toLowerCase();
    return list.filter(c => (c.employee_email||"").toLowerCase().includes(lq)||(c.employee_name||"").toLowerCase().includes(lq));
  };
  const fp = useMemo(() => filt(pending,  spPending),  [pending,  spPending]);
  const fa = useMemo(() => filt(approved, spApproved), [approved, spApproved]);
  const fd = useMemo(() => filt(declined, spDeclined), [declined, spDeclined]);

  const loadDocs = useCallback(async (eid) => {
    if (!eid) return null;
    setDocsLoading(true);
    let docs = null;
    try {
      const r = await apiFetch(`${API}/documents/${eid}`);
      if (r.ok) { docs = (await r.json()).documents || {}; setDocuments(docs); }
    } catch (_) {}
    setDocsLoading(false);
    return docs;
  }, [apiFetch]);

  const selectConsent = useCallback(async (consent) => {
    setSelected(consent); setProfileData(null); setDocuments(null); setEmpId(null); setActiveTab("Overview");
    // Fetch candidate profile status for badge (works for all statuses)
    if (consent.employee_email) fetchCandStatus(consent.employee_email);
    if (consent.status !== "approved") return;
    setLoadingProf(true);
    try {
      const r = await apiFetch(`${API}/consent/${gcid(consent)}`);
      if (r.ok) {
        const raw = await r.json();
        const profile = normalizeProfile(raw?.profile_snapshot||raw?.employee||{});
        setProfileData({ ...raw, profile_snapshot: profile, employment_snapshot: raw?.employment_snapshot||raw?.employmentHistory||[] });
        const eid = profile?.employee_id || profile?.employeeId || profile?.user_id || profile?.userId
          || raw?.employee_id || raw?.employeeId || raw?.user_id || raw?.userId
          || consent?.employee_id || consent?.employeeId || consent?.user_id;
        if (eid) { setEmpId(eid); loadDocs(eid); }
      }
    } catch (_) {}
    setLoadingProf(false);
  }, [apiFetch, loadDocs]);

  // Load SheetJS once on demand, parse xlsx/csv, extract all emails
  const parseExcelFile = async (file) => {
    setXlsParsed("");
    const ext = file.name.split(".").pop().toLowerCase();

    // CSV — no library needed
    if (ext === "csv") {
      const text = await file.text();
      const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
      const found = [...new Set(text.match(emailRegex)||[])].map(e=>e.toLowerCase());
      if (found.length) {
        setBulkEmails(found.join("\n"));
        setXlsParsed(`${found.length} email${found.length>1?"s":""} found from CSV`);
      } else {
        setXlsParsed("No emails found in CSV");
      }
      return;
    }

    // Excel — load SheetJS dynamically
    if (!window.XLSX) {
      await new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
        s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    const buf  = await file.arrayBuffer();
    const wb   = window.XLSX.read(buf, { type: "array" });
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    const found = new Set();
    let sheetName = "";

    for (const name of wb.SheetNames) {
      const ws   = wb.Sheets[name];
      const rows = window.XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
      for (const row of rows) {
        for (const cell of row) {
          const val = String(cell||"").trim().toLowerCase();
          if (emailRegex.test(val)) { found.add(val); sheetName = name; }
        }
      }
    }

    if (found.size) {
      setBulkEmails([...found].join("\n"));
      setXlsParsed(`${found.size} email${found.size>1?"s":""} found from "${sheetName||wb.SheetNames[0]}"`);
    } else {
      setXlsParsed("No emails found in the file. Make sure email addresses are in a column.");
    }
  };

  const handleXlsDrop = async (e) => {
    e.preventDefault(); setXlsDragging(false);
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (!file) return;
    await parseExcelFile(file);
  };

  // Fetch profile status for a single candidate (for sidebar badge)
  const fetchCandStatus = async (email) => {
    if (!email || candStatus[email]) return;
    try {
      const r = await apiFetch(`${API}/employee/profile-status?email=${encodeURIComponent(email)}`);
      if (r.ok) {
        const d = await r.json();
        setCandStatus(prev => ({...prev, [email]: d}));
      }
    } catch(_) {}
  };

  // Bulk invite — sends consent requests to multiple emails at once
  const sendBulkRequest = async (emailsOverride) => {
    const emails = emailsOverride || bulkEmails.split(/[\n,;]+/).map(e => e.trim().toLowerCase()).filter(Boolean);
    if (!emails.length) return;
    setBulkBusy(true);
    setBulkResults([]);
    const results = [];
    for (const email of emails) {
      try {
        const r = await apiFetch(`${API}/consent/request`, {
          method: "POST",
          body: JSON.stringify({ employee_email: email, message: reqMsg.trim() || undefined }),
        });
        const d = await r.json();
        results.push({ email, ok: r.ok, msg: r.ok ? "Sent ✓" : (d.detail || `Error ${r.status}`) });
      } catch(_) {
        results.push({ email, ok: false, msg: "Network error" });
      }
    }
    setBulkResults(results);
    setBulkBusy(false);
    if (results.some(r => r.ok)) loadConsents();
  };

  // Validate bulk emails against registered employees before sending
  const validateBulkEmails = async () => {
    const emails = bulkEmails.split(/[\n,;]+/).map(e => e.trim().toLowerCase()).filter(Boolean);
    if (!emails.length) return;
    setBulkValidating(true);
    setBulkValidated(null);
    const results = await Promise.all(emails.map(async email => {
      try {
        const r = await apiFetch(`${API}/employee/profile-status?email=${encodeURIComponent(email)}`);
        if (r.ok) {
          const d = await r.json();
          return { email, registered: !!d.exists, name: d.name || "", status: d.status || "" };
        }
        return { email, registered: false, name: "", status: "" };
      } catch { return { email, registered: false, name: "", status: "" }; }
    }));
    setBulkValidated(results);
    setBulkValidating(false);
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

  const sendReminder = async (consentId) => {
    setRemindBusy(true); setRemindMsg("");
    try {
      const r = await apiFetch(`${API}/consent/remind`, {
        method: "POST",
        body: JSON.stringify({ consent_id: consentId }),
      });
      const d = await r.json();
      if (r.ok) {
        setRemindMsg(d.message || "Reminder sent");
        // Update selected.reminder_count locally so button reflects new count instantly
        setSelected(prev => prev ? { ...prev, reminder_count: d.reminder_count ?? ((prev.reminder_count||0)+1) } : prev);
        loadConsents(); // also refresh full list
      } else {
        setRemindMsg(d.detail || "Failed to send reminder");
      }
      setTimeout(() => setRemindMsg(""), 4000);
    } catch(_) { setRemindMsg("Network error"); }
    setRemindBusy(false);
  };

  const sendBulkReminder = async () => {
    setBulkRemindBusy(true); setBulkRemindMsg("");
    try {
      const r = await apiFetch(`${API}/consent/remind/bulk`, {
        method: "POST",
        body: JSON.stringify({ consent_ids: [] }), // empty = all pending
      });
      const d = await r.json();
      setBulkRemindMsg(r.ok
        ? (d.sent === 0 ? "No pending candidates to remind" : `✓ Reminders sent to ${d.sent} candidate${d.sent>1?"s":""}`)
        : (d.detail || "Failed to send reminders")
      );
      if (r.ok && d.sent > 0) loadConsents();
    } catch(_) { setBulkRemindMsg("Network error — check your connection"); }
    finally { setBulkRemindBusy(false); setTimeout(() => setBulkRemindMsg(""), 5000); }
  };

  // ── Inbox functions ──────────────────────────────────────────────
  const loadInbox = async () => {
    setInboxLoading(true);
    try {
      const r = await apiFetch(`${API}/messages/inbox`);
      if (r.ok) setInboxThreads(await r.json());
    } catch(_) {}
    setInboxLoading(false);
  };

  const loadThread = async (consentId) => {
    setActiveThread(consentId); setThreadMsgs([]); setThreadLoading(true); setMsgErr("");
    try {
      const r = await apiFetch(`${API}/messages/thread/${consentId}`);
      if (r.ok) { const d = await r.json(); setThreadMsgs(d.messages || []); }
    } catch(_) {}
    setThreadLoading(false);
    // Refresh unread after reading
    apiFetch(`${API}/messages/unread-count`).then(r=>r.ok?r.json():null).then(d=>{ if(d) setUnreadCount(d.unread||0); }).catch(()=>{});
  };

  const sendMessage = async () => {
    if (!msgBody.trim()) { setMsgErr("Message cannot be empty"); return; }
    if (!activeThread)   { setMsgErr("No thread selected"); return; }
    setMsgSending(true); setMsgErr("");
    try {
      const r = await apiFetch(`${API}/messages/send`, {
        method: "POST",
        body: JSON.stringify({ consent_id: activeThread, body: msgBody.trim(), subject: msgSubject.trim(), recipient_type: msgRecipient }),
      });
      if (r.ok) {
        setMsgBody(""); setMsgSubject("");
        await loadThread(activeThread); // refresh thread
        loadInbox(); // refresh inbox list
      } else {
        const d = await r.json();
        setMsgErr(d.detail || "Failed to send");
      }
    } catch(_) { setMsgErr("Network error"); }
    setMsgSending(false);
  };

  const loadUnreadCount = async () => {
    try {
      const r = await apiFetch(`${API}/messages/unread-count`);
      if (r.ok) { const d = await r.json(); setUnreadCount(d.unread || 0); }
    } catch(_) {}
  };

  const sendRequest = async () => {
    setReqErr(""); setReqOk("");
    if (!reqEmail.trim()) { setReqErr("Email is required"); return; }
    setReqBusy(true);
    try {
      const r = await apiFetch(`${API}/consent/request`, { method:"POST", body:JSON.stringify({ employee_email:reqEmail.trim().toLowerCase(), message:reqMsg.trim()||undefined }) });
      const data = await r.json();
      if (!r.ok) { setReqErr(parseError(data)); return; }
      setReqOk("Request sent!"); setReqEmail(""); setReqMsg(""); loadConsents(); setTimeout(()=>{ setShowDrawer(false); setReqOk(""); }, 1200);
    } catch { setReqErr("Network error"); }
    finally { setReqBusy(false); }
  };

  const handlePrint = async () => {
    if (!profileData || printing) return;
    setPrinting(true);
    try {
      // Refresh document URLs first — S3 presigned links expire after 1hr,
      // so stale URLs would silently fail to load as images in the PDF.
      const freshDocs = empId ? await loadDocs(empId) : documents;
      await printProfile(profileData.profile_snapshot, profileData.employment_snapshot||[], freshDocs||documents, user?.name||user?.email);
    } catch (_) {}
    setPrinting(false);
  };

  if (!ready || !user) return null;
  if (termsLoading) return (
    <div style={{minHeight:"100vh",background:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p style={{color:"#94a3b8",fontFamily:"'Inter',sans-serif",fontWeight:500,fontSize:"0.875rem"}}>Loading dashboard…</p>
    </div>
  );
  if (!termsAccepted) return <TermsModal onAccept={async () => {
    try { await apiFetch(`${API}/auth/accept-terms`, { method:"POST" }); } catch (_) {}
    if (typeof window !== "undefined") sessionStorage.setItem(`dg_terms_${user.email}`, "1");
    setTermsAccepted(true);
  }} />;

  const counts = { pending:pending.length, approved:approved.length, declined:declined.length };
  const list   = cTab==="pending" ? fp : cTab==="approved" ? fa : fd;
  const search = cTab==="pending" ? spPending : cTab==="approved" ? spApproved : spDeclined;
  const setSearch = cTab==="pending" ? setSpPending : cTab==="approved" ? setSpApproved : setSpDeclined;

return (
    <>
      <style>{G}</style>

      {showSignout && <SignoutModal onConfirm={logout} onCancel={() => setShowSignout(false)} />}

      {/* ── Change Password Modal ── */}
      {showPwModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(17,13,10,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,backdropFilter:"blur(4px)"}}>
          <div style={{background:"#fff",borderRadius:14,padding:"1.75rem",maxWidth:380,width:"90%",boxShadow:"0 32px 80px rgba(0,0,0,0.2)",border:"1px solid #c8c2b8"}}>
            <div style={{fontSize:"0.95rem",fontWeight:700,color:"#111",marginBottom:"1rem"}}>Change Password</div>
            {[["Current password","password",pwCurrent,setPwCurrent],["New password","password",pwNew,setPwNew],["Confirm new password","password",pwConfirm,setPwConfirm]].map(([label,type,val,setter])=>(
              <div key={label} style={{marginBottom:"0.65rem"}}>
                <div style={{fontSize:"0.65rem",fontWeight:600,color:"#7a6e64",marginBottom:"0.3rem",textTransform:"uppercase",letterSpacing:"0.4px"}}>{label}</div>
                <input type={type} value={val} onChange={e=>setter(e.target.value)} style={{width:"100%",padding:"0.6rem 0.8rem",border:"1.5px solid #c8c2b8",borderRadius:8,fontFamily:"inherit",fontSize:"0.84rem",outline:"none",background:"#f5f2ee"}}/>
              </div>
            ))}
            {pwErr && <div style={{fontSize:"0.72rem",color:"#ef4444",marginBottom:"0.6rem",fontWeight:600}}>{pwErr}</div>}
            {pwOk  && <div style={{fontSize:"0.72rem",color:"#16a34a",marginBottom:"0.6rem",fontWeight:600}}>{pwOk}</div>}
            <div style={{display:"flex",gap:"0.6rem",marginTop:"0.5rem"}}>
              <button onClick={()=>{setShowPwModal(false);setPwErr("");setPwOk("");setPwCurrent("");setPwNew("");setPwConfirm("");}} style={{flex:1,padding:"0.6rem",borderRadius:7,border:"1px solid #c8c2b8",background:"#f5f2ee",cursor:"pointer",fontWeight:600,color:"#7a6e64",fontFamily:"inherit",fontSize:"0.82rem"}}>Cancel</button>
              <button onClick={handleChangePassword} disabled={pwBusy} style={{flex:1,padding:"0.6rem",borderRadius:7,border:"none",background:"#0d6e6e",color:"#fff",cursor:pwBusy?"not-allowed":"pointer",fontWeight:700,fontFamily:"inherit",fontSize:"0.82rem",opacity:pwBusy?0.6:1}}>{pwBusy?"Saving…":"Change Password"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Inbox Panel ── */}
      {showInbox && (
        <>
          <div className="inbox-overlay" onClick={()=>setShowInbox(false)}/>
          <div className="inbox-panel">
            <div className="inbox-head">
              <div className="inbox-title">✉️ Messages</div>
              <button className="inbox-close" onClick={()=>setShowInbox(false)}>✕</button>
            </div>
            <div className="inbox-body">
              <div className="inbox-list">
                {inboxLoading && <div style={{padding:"1rem",fontSize:"0.72rem",color:"#a09890"}}>Loading…</div>}
                {!inboxLoading && inboxThreads.length===0 && <div style={{padding:"2rem 1rem",textAlign:"center"}}><div style={{fontSize:"1.5rem",opacity:.2,marginBottom:"0.5rem"}}>✉️</div><div style={{fontSize:"0.72rem",color:"#a09890"}}>No messages yet</div></div>}
                {inboxThreads.map(t=>(
                  <div key={t.thread_id} className={`thread-item${activeThread===t.thread_id?" active":""}`} onClick={()=>loadThread(t.thread_id)}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}}>
                      <div className="thread-email" style={{flex:1}}>{t.other_party_email}</div>
                      {t.recipient_type&&t.recipient_type!=="Employee"&&(
                        <span style={{fontSize:"0.55rem",fontWeight:700,padding:"1px 6px",borderRadius:4,background:t.recipient_type==="Both"?"rgba(124,58,237,0.15)":"rgba(217,119,6,0.15)",color:t.recipient_type==="Both"?"#7c3aed":"#d97706",textTransform:"uppercase",letterSpacing:.4,flexShrink:0}}>{t.recipient_type}</span>
                      )}
                    </div>
                    {t.other_party_name&&<div style={{fontSize:"0.62rem",color:"#7a6e64",marginTop:1}}>{t.other_party_name}</div>}
                    <div className="thread-preview">{t.latest_message||"No messages"}</div>
                    <div className="thread-meta">
                      <span className="thread-time">{t.latest_at?toISTDate(t.latest_at):""}</span>
                      {t.unread_count>0&&<span className="unread-badge">{t.unread_count}</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="inbox-thread">
                {!activeThread?(
                  <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:"0.5rem",padding:"2rem"}}>
                    <div style={{fontSize:"2rem",opacity:.15}}>✉️</div>
                    <div style={{fontSize:"0.8rem",color:"#a09890",fontWeight:500}}>Select a conversation</div>
                  </div>
                ):(
                  <>
                    <div style={{padding:"0.75rem 1.25rem",borderBottom:"1px solid #c8c2b8",background:"#f5f2ee",flexShrink:0}}>
                      <div style={{fontSize:"0.78rem",fontWeight:700,color:"#111"}}>{inboxThreads.find(t=>t.thread_id===activeThread)?.other_party_email||activeThread}</div>
                      <div style={{fontSize:"0.62rem",color:"#a09890",marginTop:1}}>{threadMsgs.length} message{threadMsgs.length!==1?"s":""}</div>
                    </div>
                    <div className="msg-list">
                      {threadLoading&&<div style={{textAlign:"center",fontSize:"0.72rem",color:"#a09890",padding:"1rem"}}>Loading…</div>}
                      {!threadLoading&&threadMsgs.length===0&&<div style={{textAlign:"center",fontSize:"0.72rem",color:"#a09890",padding:"2rem"}}>No messages yet.</div>}
                      {threadMsgs.map((m,i)=>{
                        const mine=m.sender_email===user?.email;
                        // For incoming messages, show sender name and — if the message came via/about
                        // the BGV side — the BGV company/org name beneath the bubble.
                        const orgLabel = m.sender_org || m.bgv_company || (m.recipient_type==="BGV Team"||m.recipient_type==="Both" ? "BGV Team" : "");
                        return(
                          <div key={m.message_id||i} className={`msg-bubble-wrap ${mine?"mine":"theirs"}`}>
                            {!mine&&<div className="msg-sender">{m.sender_name||m.sender_email}</div>}
                            <div className={`msg-bubble ${mine?"mine":"theirs"}`}>{m.body}</div>
                            <div className={`msg-time ${mine?"mine":"theirs"}`}>{toISTDate(m.sent_at)}{mine&&m.read_by_recipient&&<span style={{marginLeft:4}}>✓✓</span>}{mine&&!m.read_by_recipient&&<span style={{marginLeft:4}}>✓</span>}</div>
                            {!mine&&orgLabel&&<div style={{fontSize:"0.58rem",color:"#a09890",marginTop:2,fontStyle:"italic"}}>{orgLabel}</div>}
                          </div>
                        );
                      })}
                    </div>
                    <div className="msg-compose">
                      {/* Recipient selector — complete isolation: Employee / BGV Team / Both */}
                      <div style={{display:"flex",gap:"0.4rem",marginBottom:"0.5rem"}}>
                        {["Employee","BGV Team","Both"].map(r=>(
                          <button key={r} onClick={()=>setMsgRecipient(r)}
                            style={{flex:1,padding:"0.35rem 0.5rem",borderRadius:7,border:`1.5px solid ${msgRecipient===r?"#0d6e6e":"#c8c2b8"}`,background:msgRecipient===r?"#0d6e6e":"#f5f2ee",color:msgRecipient===r?"#fff":"#7a6e64",fontSize:"0.66rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
                            {r}
                          </button>
                        ))}
                      </div>
                      <div style={{fontSize:"0.6rem",color:"#a09890",marginBottom:"0.45rem"}}>
                        {msgRecipient==="Employee"&&"Sends to the candidate only — isolated from BGV team."}
                        {msgRecipient==="BGV Team"&&"Sends to the BGV team only — isolated from candidate."}
                        {msgRecipient==="Both"&&"Sends to both — visible in each party's own inbox."}
                      </div>
                      <input placeholder="Subject (optional)" value={msgSubject} onChange={e=>setMsgSubject(e.target.value)} style={{width:"100%",padding:"0.45rem 0.75rem",background:"#f5f2ee",border:"1.5px solid #c8c2b8",borderRadius:7,fontFamily:"inherit",fontSize:"0.75rem",color:"#111",outline:"none",marginBottom:"0.4rem"}}/>
                      <textarea className="msg-input" placeholder="Type a message…" value={msgBody} onChange={e=>setMsgBody(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&e.ctrlKey){e.preventDefault();sendMessage();}}}/>
                      {msgErr&&<div style={{fontSize:"0.68rem",color:"#ef4444",marginBottom:"0.3rem",fontWeight:600}}>{msgErr}</div>}
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"0.4rem"}}>
                        <span style={{fontSize:"0.62rem",color:"#a09890"}}>Ctrl+Enter to send</span>
                        <button className="msg-send-btn" onClick={sendMessage} disabled={msgSending||!msgBody.trim()}>{msgSending?"Sending…":"Send ↗"}</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Request Drawer ── */}
      {showDrawer&&<div className="drawer-overlay" onClick={()=>setShowDrawer(false)}/>}
      <div className={`drawer${showDrawer?" open":""}`}>
        <div className="drawer-head">
          <span className="drawer-title">{reqTab==="single"?"Request Employee Data":"Bulk Request — Employee Data"}</span>
          <button className="drawer-close" onClick={()=>setShowDrawer(false)}>✕</button>
        </div>
        <div className="drawer-body">
          {reqTab==="single"&&(<>
            <div style={{fontSize:"0.65rem",fontWeight:700,color:"#7a6e64",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"0.3rem"}}>Candidate Email *</div>
            <input className="req-in" type="email" placeholder="candidate@company.com" value={reqEmail} onChange={e=>setReqEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!reqMsg&&sendRequest()} style={{width:"100%",marginBottom:"0.65rem"}}/>
            <div style={{fontSize:"0.65rem",fontWeight:700,color:"#7a6e64",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"0.3rem"}}>Message (Optional)</div>
            <textarea className="req-in req-ta" placeholder="Add context for the candidate…" value={reqMsg} onChange={e=>setReqMsg(e.target.value)} style={{width:"100%"}}/>
            {reqErr&&<p className="req-msg e">{reqErr}</p>}
            {reqOk&&<p className="req-msg s">{reqOk}</p>}
            <button className="send-btn" style={{marginTop:"0.75rem"}} onClick={sendRequest} disabled={reqBusy}>{reqBusy?"Sending…":"Send consent request →"}</button>
          </>)}

          {reqTab==="bulk"&&(<>
            <div className={`xls-drop${xlsDragging?" drag":""}`} onDragOver={e=>{e.preventDefault();setXlsDragging(true);}} onDragLeave={()=>setXlsDragging(false)} onDrop={handleXlsDrop} onClick={()=>document.getElementById("xls-file-input").click()}>
              <div className="xls-drop-icon">📊</div>
              <div className="xls-drop-txt">Drop Excel / CSV here</div>
              <div className="xls-drop-sub">or click to browse · .xlsx .xls .csv</div>
              <input id="xls-file-input" type="file" accept=".xlsx,.xls,.csv" style={{display:"none"}} onChange={handleXlsDrop}/>
            </div>
            {xlsParsed&&<div className="xls-parsed">✓ {xlsParsed}</div>}

            <textarea className="req-in req-ta" placeholder={"Enter emails — one per line\nrajan@company.com\npriya@company.com"} style={{minHeight:72,width:"100%"}} value={bulkEmails}
              onChange={e=>{setBulkEmails(e.target.value);setXlsParsed("");setBulkValidated(null);setBulkResults([]);}}/>

            {!bulkValidated&&(
              <button onClick={validateBulkEmails} disabled={bulkValidating||!bulkEmails.trim()}
                style={{width:"100%",padding:"0.5rem",background:"#f5f2ee",color:"#0d6e6e",border:"1.5px solid #a8d5ce",borderRadius:8,fontFamily:"inherit",fontSize:"0.76rem",fontWeight:700,cursor:bulkValidating||!bulkEmails.trim()?"not-allowed":"pointer",marginTop:"0.4rem",marginBottom:"0.5rem"}}>
                {bulkValidating?"Checking emails…":"🔍 Validate emails"}
              </button>
            )}

            {bulkValidated&&(()=>{
              const reg = bulkValidated.filter(r=>r.registered);
              const unreg = bulkValidated.filter(r=>!r.registered);
              return(<>
                <div style={{background:"#f5f2ee",borderRadius:8,padding:"0.65rem",marginTop:"0.4rem",marginBottom:"0.5rem",maxHeight:160,overflowY:"auto"}}>
                  <div style={{fontSize:"0.6rem",fontWeight:700,color:"#7a6e64",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"0.4rem"}}>
                    {reg.length} registered · {unreg.length} not found
                  </div>
                  {bulkValidated.map((r,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:"0.5rem",padding:"3px 0",borderBottom:"1px solid #e8e2da"}}>
                      <span style={{fontSize:"0.75rem",flexShrink:0}}>{r.registered?"✅":"❌"}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:"0.7rem",color:r.registered?"#111":"#a09890",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.email}</div>
                        {r.registered&&r.name&&<div style={{fontSize:"0.6rem",color:"#0d6e6e"}}>{r.name}</div>}
                        {!r.registered&&<div style={{fontSize:"0.6rem",color:"#dc2626"}}>Hey, this email is not registered on Datagate</div>}
                      </div>
                    </div>
                  ))}
                </div>
                {unreg.length>0&&<div style={{fontSize:"0.68rem",color:"#a09890",marginBottom:"0.4rem",lineHeight:1.5}}>⚠️ {unreg.length} unregistered email{unreg.length>1?"s":""} will be skipped. Only registered employees can receive consent requests.</div>}
                <button onClick={()=>{setBulkValidated(null);setBulkResults([]);}} style={{fontSize:"0.65rem",color:"#a09890",background:"none",border:"none",cursor:"pointer",marginBottom:"0.4rem",padding:0}}>← Edit emails</button>
              </>);
            })()}

            <textarea className="req-in req-ta" placeholder="Message to all candidates (optional)" style={{width:"100%"}} value={reqMsg} onChange={e=>setReqMsg(e.target.value)}/>

            <button className="send-btn" style={{marginTop:"0.5rem"}}
              onClick={()=>{
                if(bulkValidated){
                  const regEmails = bulkValidated.filter(r=>r.registered).map(r=>r.email);
                  if(!regEmails.length) return;
                  setBulkEmails(regEmails.join("\n"));
                  sendBulkRequest(regEmails);
                } else {
                  sendBulkRequest();
                }
              }}
              disabled={bulkBusy||!bulkEmails.trim()||(bulkValidated&&bulkValidated.filter(r=>r.registered).length===0)}>
              {bulkBusy?"Sending…":bulkValidated
                ?`Send to ${bulkValidated.filter(r=>r.registered).length} registered candidate(s) →`
                :`Send to ${bulkEmails.split(/[\n,;]+/).filter(e=>e.trim()).length} candidate(s) →`}
            </button>

            {bulkResults.length>0&&(
              <div style={{marginTop:"0.75rem",background:"#f5f2ee",borderRadius:8,padding:"0.65rem"}}>
                {bulkResults.map((r,i)=>(<div key={i} style={{fontSize:"0.7rem",padding:"3px 0",color:r.ok?"#16a34a":"#ef4444",display:"flex",justifyContent:"space-between",gap:"0.5rem"}}><span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{r.email}</span><span style={{fontWeight:700,flexShrink:0}}>{r.msg}</span></div>))}
              </div>
            )}
          </>)}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MAIN LAYOUT
      ══════════════════════════════════════════════════════════════ */}
      <div style={{minHeight:"100vh",background:"#f0ece6",display:"flex",flexDirection:"column"}}>

        {/* ── TOP NAVBAR ── */}
        <div style={{background:"#fff",borderBottom:"1px solid #c8c2b8",padding:"0 1.5rem",height:52,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:40,boxShadow:"0 1px 6px rgba(17,13,10,0.06)"}}>
          {/* Left: brand + nav tabs */}
          <div style={{display:"flex",alignItems:"center",gap:"1.5rem"}}>
            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <div style={{width:28,height:28,background:"#0d6e6e",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="13" height="15" viewBox="0 0 24 28" fill="none"><rect x="5" y="15" width="4" height="9" rx="1.5" fill="white"/><rect x="15" y="15" width="4" height="9" rx="1.5" fill="white"/><path d="M7 15Q12 8 17 15" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:800,color:"#111",letterSpacing:"-.3px",lineHeight:1}}>Datagate</div>
                <div style={{fontSize:9,color:"#a09890",letterSpacing:"1px",textTransform:"uppercase"}}>Employer Dashboard</div>
              </div>
            </div>
            {/* Nav tabs */}
            {["Overview","Candidates"].map(tab=>(
              <button key={tab} onClick={()=>setMainTab(tab)}
                style={{padding:"0 4px",height:52,background:"none",border:"none",borderBottom:`2.5px solid ${mainTab===tab?"#0d6e6e":"transparent"}`,fontSize:"0.8rem",fontWeight:mainTab===tab?700:500,color:mainTab===tab?"#0d6e6e":"#7a6e64",cursor:"pointer",fontFamily:"inherit",transition:"all .12s",marginBottom:-1}}>
                {tab}
                {tab==="Candidates"&&consents.length>0&&<span style={{marginLeft:5,background:"#0d6e6e",color:"#fff",fontSize:"0.58rem",fontWeight:800,padding:"1px 5px",borderRadius:999}}>{consents.length}</span>}
              </button>
            ))}
          </div>
          {/* Right: inbox + user + signout */}
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <button onClick={()=>{setShowInbox(true);loadInbox();}} style={{position:"relative",width:32,height:32,borderRadius:7,border:"1px solid #c8c2b8",background:"#f5f2ee",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.9rem"}}>
              ✉️{unreadCount>0&&<span style={{position:"absolute",top:-4,right:-4,background:"#dc2626",color:"#fff",borderRadius:999,fontSize:"0.55rem",fontWeight:800,minWidth:15,height:15,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px",border:"2px solid #fff"}}>{unreadCount}</span>}
            </button>
            <div style={{padding:"4px 10px",border:"1px solid #c8c2b8",borderRadius:6,background:"#f5f2ee",display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:"#0d6e6e",color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{(user.name||user.email||"E").slice(0,2).toUpperCase()}</div>
              <span style={{fontSize:12,fontWeight:600,color:"#111"}}>{user.name||user.email}</span>
              <span style={{fontSize:9,fontWeight:700,background:"#e0f0ee",color:"#0a5656",padding:"1px 6px",borderRadius:4,textTransform:"uppercase",letterSpacing:.5}}>Employer</span>
            </div>
            <button onClick={()=>setShowPwModal(true)} style={{padding:"5px 10px",border:"1px solid #c8c2b8",borderRadius:6,background:"#f5f2ee",fontSize:11,fontWeight:600,color:"#7a6e64",cursor:"pointer",fontFamily:"inherit"}}>Change password</button>
            <button onClick={()=>setShowSignout(true)} style={{padding:"5px 10px",border:"1.5px solid #fca5a5",borderRadius:6,background:"#fef2f2",fontSize:11,fontWeight:700,color:"#dc2626",cursor:"pointer",fontFamily:"inherit"}}>Sign out</button>
            <button onClick={()=>setShowDrawer(true)} style={{padding:"6px 14px",background:"#0d6e6e",color:"#fff",border:"none",borderRadius:7,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 2px 8px rgba(13,110,110,.3)"}}>+ Request Data Access</button>
          </div>
        </div>

        {/* ══ OVERVIEW TAB ══ */}
        {mainTab==="Overview" && (
          <div style={{padding:"1.25rem 1.75rem",flex:1}}>

            {/* 5 stat cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"0.5px",background:"#c8c2b8",border:"1px solid #c8c2b8",borderRadius:10,overflow:"hidden",marginBottom:"1.25rem"}}>
              {[
                {label:"Total Requests",   val:consents.length,         sub:"Lifetime BGV sent",      col:"#111"},
                {label:"Approved",         val:approved.length,         sub:"Profiles shared",        col:"#0d6e6e"},
                {label:"Pending",          val:pending.length,          sub:"Awaiting employee",      col:"#d97706"},
                {label:"Declined",         val:declined.length,         sub:"By candidates",          col:"#dc2626"},
              ].map(s=>(
                <div key={s.label} style={{background:"#fff",padding:"12px 16px",position:"relative"}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:2.5,background:s.col}}/>
                  <div style={{fontSize:9,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:"#a09890",marginBottom:4}}>{s.label}</div>
                  <div style={{fontSize:22,fontWeight:800,color:s.col,letterSpacing:-1,lineHeight:1}}>{loading?"…":s.val}</div>
                  <div style={{fontSize:10,color:"#a09890",marginTop:2}}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:"1.25rem"}}>
              {/* Left col */}
              <div style={{display:"flex",flexDirection:"column",gap:"1.25rem"}}>

                {/* Recent Candidates */}
                <div style={{background:"#fff",border:"1px solid #c8c2b8",borderRadius:10,overflow:"hidden"}}>
                  <div style={{padding:"10px 16px",borderBottom:"1px solid #e8e2da",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{fontSize:10,fontWeight:700,letterSpacing:".8px",textTransform:"uppercase",color:"#7a6e64"}}>Recent Candidates</div>
                    <button onClick={()=>setMainTab("Candidates")} style={{fontSize:11,color:"#0d6e6e",fontWeight:600,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>View all →</button>
                  </div>
                  <div style={{padding:"4px 0"}}>
                    {loading&&<div style={{padding:"1rem",fontSize:"0.75rem",color:"#a09890"}}>Loading…</div>}
                    {!loading&&consents.length===0&&<div style={{padding:"1.5rem",textAlign:"center",fontSize:"0.75rem",color:"#a09890"}}>No candidates yet. Send your first data access request.</div>}
                    {[...consents].sort((a,b)=>(b.requested_at||b.created_at||0)-(a.requested_at||a.created_at||0)).slice(0,6).map(c=>{
                      const col=c.status==="approved"?"#0d6e6e":c.status==="pending"?"#d97706":"#dc2626";
                      const bg=c.status==="approved"?"#e0f0ee":c.status==="pending"?"#fef9c3":"#fef2f2";
                      const initials=(c.employee_name||c.employee_email||"?").slice(0,2).toUpperCase();
                      const colors=["#0d6e6e","#2563eb","#7c3aed","#d97706","#dc2626","#16a34a"];
                      const avatarCol=colors[(c.employee_email||"").charCodeAt(0)%colors.length];
                      return(
                        <div key={gcid(c)} onClick={()=>{ selectConsent(c); setMainTab("Candidates"); }} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 16px",cursor:"pointer",borderBottom:"1px solid #f5f2ee",transition:"background .1s"}}
                          onMouseEnter={e=>e.currentTarget.style.background="#faf8f5"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <div style={{width:32,height:32,borderRadius:8,background:avatarCol,color:"#fff",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{initials}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:12,fontWeight:700,color:"#111",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.employee_name||c.employee_email}</div>
                            <div style={{fontSize:10,color:"#a09890",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.employee_email}</div>
                          </div>
                          <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:8,background:bg,color:col,textTransform:"uppercase",letterSpacing:.5,border:`0.5px solid ${col}33`}}>{c.status}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom row: BGV Status + Activity Feed */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
                  {/* Onboarding Status — isolated from BGV workflow */}
                  <div style={{background:"#fff",border:"1px solid #c8c2b8",borderRadius:10,padding:"12px 14px"}}>
                    <div style={{fontSize:9,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:"#7a6e64",marginBottom:4}}>Onboarding Status</div>
                    <div style={{fontSize:9,color:"#a09890",marginBottom:10,lineHeight:1.5}}>BGV completion is tracked separately by your BGV team</div>
                    {[
                      ["Data Shared",approved.length,"#0d6e6e","Employee approved · data accessible"],
                      ["Awaiting Consent",pending.length,"#d97706","Request sent · employee yet to respond"],
                      ["Declined",declined.length,"#dc2626","Employee declined the request"],
                    ].map(([label,val,col,sub])=>(
                      <div key={label} style={{marginBottom:9}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                          <div>
                            <span style={{fontSize:11,color:"#1c2b2b",fontWeight:600}}>{label}</span>
                            <div style={{fontSize:9,color:"#a09890",marginTop:1}}>{sub}</div>
                          </div>
                          <span style={{fontWeight:800,color:col,fontSize:14,minWidth:20,textAlign:"right"}}>{val}</span>
                        </div>
                        <div style={{height:3,background:"#f0ece6",borderRadius:2,overflow:"hidden"}}>
                          <div style={{height:"100%",width:consents.length>0?`${Math.round((val/consents.length)*100)}%`:"0%",background:col,borderRadius:2,transition:"width .4s"}}/>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Activity Feed */}
                  <div style={{background:"#fff",border:"1px solid #c8c2b8",borderRadius:10,padding:"12px 14px"}}>
                    <div style={{fontSize:9,fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",color:"#7a6e64",marginBottom:10}}>Activity Feed</div>
                    {consents.length===0&&<div style={{fontSize:11,color:"#a09890"}}>No activity yet</div>}
                    {[...consents].sort((a,b)=>(b.responded_at||b.requested_at||0)-(a.responded_at||a.requested_at||0)).slice(0,4).map(c=>{
                      const col=c.status==="approved"?"#0d6e6e":c.status==="pending"?"#d97706":"#dc2626";
                      const txt=c.status==="approved"?`${c.employee_email} approved request`:c.status==="declined"?`${c.employee_email} declined`:`Data access request sent to ${c.employee_email}`;
                      return(
                        <div key={gcid(c)} style={{display:"flex",gap:7,marginBottom:7,alignItems:"flex-start"}}>
                          <div style={{width:6,height:6,borderRadius:"50%",background:col,flexShrink:0,marginTop:4}}/>
                          <div style={{fontSize:10,color:"#5a5248",lineHeight:1.45,flex:1}}>{txt}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right col: Quick Actions */}
              <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
                <div style={{background:"#fff",border:"1px solid #c8c2b8",borderRadius:10,overflow:"hidden"}}>
                  <div style={{padding:"10px 16px",borderBottom:"1px solid #e8e2da"}}>
                    <div style={{fontSize:10,fontWeight:700,letterSpacing:".8px",textTransform:"uppercase",color:"#7a6e64"}}>Quick Actions</div>
                  </div>
                  <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
                    <button onClick={()=>{setReqTab("bulk");setShowDrawer(true);}} style={{width:"100%",padding:"10px 14px",background:"#f5f2ee",color:"#0d6e6e",border:"1.5px solid #a8d5ce",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",textAlign:"left",display:"flex",alignItems:"center",gap:8}}>
                      <span>📊</span> Bulk Request (Excel / CSV)
                    </button>
                  </div>
                </div>

                {/* Pending actions — candidates waiting */}
                {pending.length > 0 && (
                  <div style={{background:"#fef9c3",border:"1px solid #fde68a",borderRadius:10,padding:"12px 14px"}}>
                    <div style={{fontSize:10,fontWeight:700,letterSpacing:".8px",textTransform:"uppercase",color:"#854d0e",marginBottom:8}}>Awaiting Response</div>
                    {pending.slice(0,3).map(c=>(
                      <div key={gcid(c)} onClick={()=>{selectConsent(c);setMainTab("Candidates");}} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",cursor:"pointer",borderBottom:"1px solid #fde68a"}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:"#d97706",flexShrink:0}}/>
                        <div style={{flex:1,fontSize:11,color:"#111",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.employee_email}</div>
                        <span style={{fontSize:9,color:"#854d0e",fontWeight:600,whiteSpace:"nowrap"}}>{toISTDate(c.requested_at||c.created_at)}</span>
                      </div>
                    ))}
                    {pending.length > 3 && <div style={{fontSize:10,color:"#854d0e",marginTop:6,fontWeight:600}}>+{pending.length-3} more pending</div>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ CANDIDATES TAB ══ */}
        {mainTab==="Candidates" && (
          <div style={{display:"flex",flex:1,overflow:"hidden"}}>
            {/* Sidebar */}
            <div style={{width:280,minWidth:280,background:"#111",display:"flex",flexDirection:"column",height:"calc(100vh - 52px)",position:"sticky",top:52,overflow:"hidden"}}>
              <div style={{padding:"0.65rem 1.3rem 0.3rem"}}>
                <div className="filter-tabs">
                  {[["pending","Pending"],["approved","Approved"],["declined","Declined"]].map(([key,label])=>(
                    <button key={key} className={`ft-btn${cTab===key?" on":""}`} onClick={()=>setCTab(key)}>
                      {label}{counts[key]>0&&<span className="ft-cnt">{counts[key]}</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{padding:"0.4rem 1.3rem 0.3rem"}}>
                <input className="search-in" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/>
              </div>
              {cTab==="pending"&&pending.length>0&&(
                <div style={{padding:"0.3rem 1.3rem 0.5rem",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
                  <button onClick={sendBulkReminder} disabled={bulkRemindBusy} style={{width:"100%",padding:"0.42rem 0.75rem",background:"rgba(13,110,110,0.18)",border:"1.5px solid rgba(13,110,110,0.4)",borderRadius:7,color:"#5eead4",fontSize:"0.65rem",fontWeight:700,cursor:bulkRemindBusy?"not-allowed":"pointer",fontFamily:"inherit"}}>
                    {bulkRemindBusy?"Sending…":`📧 Remind all (${pending.length})`}
                  </button>
                  {bulkRemindMsg&&<div style={{fontSize:"0.62rem",marginTop:"0.3rem",color:bulkRemindMsg.startsWith("✓")?"#86efac":"#fca5a5",fontWeight:600}}>{bulkRemindMsg}</div>}
                </div>
              )}
              <div className="c-list" style={{flex:1,overflowY:"auto"}}>
                {loading?<div className="c-empty">Loading…</div>
                :list.length===0?<div className="c-empty">{search?"No matches":`No ${cTab} requests`}</div>
                :list.map(c=>{
                  const dot=c.status==="approved"?"#16a34a":c.status==="pending"?"#f59e0b":"#ef4444";
                  const ts=c.status==="approved"?(c.responded_at||c.approved_at):(c.requested_at||c.created_at);
                  return(
                    <div key={gcid(c)} className={`c-item${gcid(selected)===gcid(c)?" sel":""}`} onClick={()=>selectConsent(c)}>
                      <div className="c-dot" style={{background:dot}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"0.3rem"}}>
                          <div className="c-mail" style={{flex:1}}>{c.employee_email}</div>
                          {candStatus[c.employee_email]&&(
                            <span className={`cand-status ${candStatus[c.employee_email].status==="submitted"?"submitted":candStatus[c.employee_email].status==="draft"?"draft":"no-profile"}`}>
                              {candStatus[c.employee_email].status==="submitted"?"✓ Done":candStatus[c.employee_email].status==="draft"?"In progress":"Not started"}
                            </span>
                          )}
                        </div>
                        {c.employee_name&&c.employee_name!==c.employee_email&&<div className="c-nm">{c.employee_name}</div>}
                        <div className="c-dt">{toISTDate(ts)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main profile panel */}
            <main className="main" style={{flex:1,overflowY:"auto",background:"#f0ece6"}}>
              {!selected?(
                <div className="empty-view">
                  <div className="empty-ico">👥</div>
                  <div className="empty-h">Select a candidate</div>
                  <div className="empty-s">Approved consents show the full verified profile here</div>
                </div>
              ):(
                <>
                  <div className="top-bar">
                    <div className="top-title"><strong>{profileData?.profile_snapshot ? ([profileData.profile_snapshot.firstName, profileData.profile_snapshot.lastName].filter(Boolean).join(" ") || selected?.employee_email) : (selected?.employee_email||"")}</strong> — {selected.employee_email}</div>
                    {selected.status==="approved"&&profileData&&(
                      <button className="print-btn" onClick={handlePrint} disabled={printing}>{printing?"⏳ Preparing…":"🖨 Print / Export PDF"}</button>
                    )}
                  </div>
                  <div className="pane">
                    <div className="hero-card">
                      <div>
                        <div className="hero-name">{profileData?.profile_snapshot ? ([profileData.profile_snapshot.firstName, profileData.profile_snapshot.lastName].filter(Boolean).join(" ") || selected?.employee_email) : (selected?.employee_email||"")}</div>
                        <div className="hero-email">{selected.employee_email}</div>
                        <div className="hero-badges">
                          <span className={`hb hb-${selected.status}`}>{selected.status.charAt(0).toUpperCase()+selected.status.slice(1)}</span>
                          {selected.requested_at&&<span className="hb hb-info">Requested: {toIST(selected.requested_at)}</span>}
                          {(selected.responded_at||selected.approved_at)&&<span className="hb hb-info">Responded: {toIST(selected.responded_at||selected.approved_at)}</span>}
                          {profileData?.snapshot_at&&<span className="hb hb-info">📅 Data as of: {toIST(profileData.snapshot_at)}</span>}
                        </div>
                        {candStatus[selected.employee_email]&&(()=>{
                          const cs=candStatus[selected.employee_email];const pct=cs.completeness||0;const col=pct>=80?"#16a34a":pct>=50?"#f59e0b":"#ef4444";
                          return(<div className="comp-bar-wrap" style={{minWidth:200}}><div className="comp-bar-label"><span>Profile completeness</span><span style={{color:col,fontWeight:700}}>{pct}%</span></div><div className="comp-bar-bg"><div className="comp-bar-fill" style={{width:`${pct}%`,background:col}}/></div></div>);
                        })()}
                      </div>
                      {selected.request_message&&(<div className="msg-bubble"><div className="msg-lbl">Your message</div><div className="msg-txt">{selected.request_message}</div></div>)}
                    </div>

                    {selected.status==="pending"&&(()=>{const rc=selected.reminder_count||0;return(
                      <div style={{marginBottom:"0.75rem",display:"flex",alignItems:"center",gap:"0.75rem",flexWrap:"wrap"}}>
                        {rc<3?(<button onClick={()=>sendReminder(gcid(selected))} disabled={remindBusy} style={{padding:"0.45rem 1rem",background:"#fff",border:"1.5px solid #0d6e6e",borderRadius:7,color:"#0d6e6e",fontSize:"0.72rem",fontWeight:700,cursor:remindBusy?"not-allowed":"pointer",fontFamily:"inherit"}}>{remindBusy?"Sending…":`📧 Send Reminder (${rc}/3 sent)`}</button>):(<span style={{fontSize:"0.7rem",color:"#f59e0b",fontWeight:600}}>📧 Max reminders sent (3/3)</span>)}
                        {remindMsg&&<span style={{fontSize:"0.68rem",color:"#16a34a",fontWeight:600}}>{remindMsg}</span>}
                      </div>
                    );})()}

                    {selected.status==="pending"&&<div className="status-card">⏳ Waiting for employee to approve your request.</div>}
                    {selected.status==="declined"&&<div className="status-card dec">❌ Employee declined this request.</div>}

                    {selected.status==="approved"&&(
                      loadingProf?<div className="status-card">Loading profile…</div>
                      :!profileData?<div className="status-card">Could not load profile data.</div>
                      :<>
                        <div style={{marginBottom:"0.75rem",display:"flex",gap:"0.6rem",alignItems:"center",flexWrap:"wrap"}}>
                          <button onClick={()=>{setActiveThread(gcid(selected));loadThread(gcid(selected));setShowInbox(true);}} style={{padding:"0.42rem 1rem",background:"#fff",border:"1.5px solid #0d6e6e",borderRadius:7,color:"#0d6e6e",fontSize:"0.72rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:"0.4rem"}}>✉️ Message candidate</button>
                          <button onClick={()=>{setActiveThread(gcid(selected));loadThread(gcid(selected));setShowInbox(true);if(typeof setMsgRecipient!=="undefined")setMsgRecipient("bgv");}} style={{padding:"0.42rem 1rem",background:"#fff",border:"1.5px solid #4f46e5",borderRadius:7,color:"#4f46e5",fontSize:"0.72rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:"0.4rem"}}>🔍 Message BGV vendor</button>
                        </div>
                        <div className="note-bar">⚠️ <strong>Self-reported data.</strong> All information was filled and submitted by the employee. Not independently verified by Datagate unless a verified check has been explicitly completed.</div>
                        <div className="tab-nav">{DATA_TABS.map(t=><button key={t} className={`tab-btn${activeTab===t?" on":""}`} onClick={()=>setActiveTab(t)}>{t}</button>)}</div>
                        <div className="tab-pane">
                          {activeTab==="Overview"&&<OverviewTab data={profileData.profile_snapshot}/>}
                          {activeTab==="Education"&&<EducationTab data={profileData.profile_snapshot?.education}/>}
                          {activeTab==="Employment"&&<EmploymentTab data={profileData.employment_snapshot} resumeKey={profileData.profile_snapshot?.resumeKey} docUrls={Object.values(documents||{}).reduce((acc,grp)=>({...acc,...Object.fromEntries(Object.entries(grp).map(([k,v])=>[k,v.url]))}),{})}/>}
                          {activeTab==="UAN & PF"&&<UanTab data={profileData.profile_snapshot}/>}
                          {activeTab==="Documents"&&<DocumentsTab documents={documents} loading={docsLoading}/>}
                          {activeTab==="BGV Status"&&<BgvTab consentData={profileData} apiFetch={apiFetch} API={API}/>}
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </main>
          </div>
        )}



      </div>
    </>
  );
}
