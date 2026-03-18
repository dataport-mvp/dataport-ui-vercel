// pages/employer/dashboard.js
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;
const DATA_TABS = ["Overview", "Education", "Employment", "UAN & PF", "Documents"];

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
async function urlToBase64(url) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch { return null; }
}

async function printProfile(profile, empHistory, documents, employerName) {
  const d   = profile || {};
  const cur  = d.currentAddress   || {};
  const perm = d.permanentAddress || {};
  const edu  = d.education        || {};

  // Build ordered document list with base64 images
  // Sequence: personal → education → employment → uan
  const DOC_ORDER = [
    // Personal
    { key: "photo",        label: "Profile Photo",             group: "personal" },
    { key: "aadhaar",      label: "Aadhaar Card",              group: "personal" },
    { key: "pan",          label: "PAN Card",                  group: "personal" },
    { key: "passport",     label: "Passport",                  group: "personal" },
    // Education
    { key: "classX",       label: "Class X Certificate",       group: "education" },
    { key: "intermediate", label: "Intermediate Certificate",  group: "education" },
    { key: "diploma",      label: "Diploma Certificate",       group: "education" },
    { key: "ug_provisional",label:"UG Provisional Marksheet",  group: "education" },
    { key: "ug_convocation",label:"UG Convocation Certificate",group: "education" },
    { key: "pg_provisional",label:"PG Provisional Marksheet",  group: "education" },
    { key: "pg_convocation",label:"PG Convocation Certificate",group: "education" },
    // Professional
    { key: /^profqual_/,   label: "Professional Qualification",group: "education" },
    { key: /^articleship_/,label: "Articleship / Training Letter",group:"education"},
    { key: /^cert_/,       label: "Certification Certificate", group: "education" },
    // Employment
    { key: "cv",           label: "Resume / CV",               group: "general" },
    { key: "offerLetter",  label: "Offer Letter",              group: "employment" },
    { key: "payslips",     label: "Payslips",                  group: "employment" },
    { key: "experience",   label: "Experience / Relieving Letter", group: "employment" },
    { key: "resignation",  label: "Resignation Acceptance",    group: "employment" },
    { key: "idCard",       label: "Company ID Card",           group: "employment" },
    // UAN
    { key: "uanCard",      label: "UAN Card / Passbook",       group: "uan" },
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
  // Add any not matched
  for (const item of allDocs) {
    if (!sortedDocs.find(x => x.subKey === item.subKey && x.group === item.group)) {
      sortedDocs.push({ ...item, label: item.subKey });
    }
  }

  // Fetch images as base64 (only images, PDFs shown as link)
  const docsWithData = await Promise.all(sortedDocs.map(async (item) => {
    const url = item.doc.url;
    const filename = item.doc.filename || "";
    const isImage = /\.(jpg|jpeg|png)$/i.test(filename);
    const isPdf   = /\.pdf$/i.test(filename);
    let b64 = null;
    if (isImage && url) b64 = await urlToBase64(url);
    return { ...item, b64, isImage, isPdf, url };
  }));

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
      row("Course / Degree",      s.course),
      row("Branch / Specialization", s.branch || s.specialization),
      row("Year of Passing",      s.yearOfPassing),
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
    row("Date of Birth",    d.dob),
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
    d.hasPassport === "Yes" ? row("Issue Date",         d.passportIssue) : "",
    d.hasPassport === "Yes" ? row("Expiry Date",        d.passportExpiry): "",
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
    row("Residing From",   cur.from),
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
    row("Account Number",      d.accountFull ? "•".repeat(Math.max(0,d.accountFull.length-4))+d.accountFull.slice(-4) : (d.accountLast4 ? `••••••••${d.accountLast4}` : "")),
  ].join(""))}

  <!-- ══ SECTION 2: EDUCATION ══ -->
  <div style="font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;margin-top:20px">Page 2 — Education</div>

  ${eduSection("Class X — SSC / Matriculation",      edu.classX,        "#334155")}
  ${eduSection("Intermediate — HSC / 12th",           edu.intermediate,  "#334155")}
  ${(edu.hasDip==="Yes"||edu.diploma?.institute) && edu.diploma && Object.values(edu.diploma).some(Boolean) ? eduSection("Diploma / Technical / Vocational", edu.diploma, "#334155") : ""}
  ${eduSection("Undergraduate / Degree",              edu.undergraduate, "#334155")}
  ${edu.postgraduate?.college ? eduSection("Postgraduate / Masters", edu.postgraduate, "#334155") : ""}

  ${Array.isArray(edu.professionalQualifications) && edu.professionalQualifications.length > 0 ? section("Professional Qualifications", edu.professionalQualifications.map((q,i) => [
    row(`Qualification ${i+1} — Type`,  q.type),
    row(`Qualification ${i+1} — Level`, q.level),
    row(`Qualification ${i+1} — Year`,  q.year),
  ].join("")).join(""), "#334155") : ""}

  ${Array.isArray(edu.articleships) && edu.articleships.length > 0 ? section("Articleship / Practical Training", edu.articleships.map((a,i) => [
    row(`Training ${i+1} — Type`,      a.type),
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
      row("Date of Joining",       e.startDate),
      i === 0 ? row("Currently Working", e.currentlyWorking === "Yes" ? "Yes — Still Employed" : "No") : row("Date of Leaving", e.endDate),
      i === 0 && e.currentlyWorking === "No" ? row("Date of Leaving", e.endDate) : "",
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
    ].join(""), i === 0 ? "#1e3a5f" : "#334155"
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
          row("PF Member ID",     pf.pfMemberId),
          row("Date of Joining",  pf.dojEpfo),
          row("Date of Exit",     pf.doeEpfo),
          row("PF Transferred",   pf.pfTransferred),
        ].join(""),
    "#334155"
  )).join("") : ""}

  <!-- ══ SECTION 5: DOCUMENTS ══ -->
  ${docsWithData.length > 0 ? `
  <div style="font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin-bottom:14px;margin-top:20px">Documents — In Sequence Order</div>

  ${docsWithData.map((item, idx) => `
    <div style="margin-bottom:28px;page-break-inside:avoid">
      <div style="background:#334155;color:#fff;padding:5px 12px;font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:1px;border-radius:4px 4px 0 0">
        ${String(idx+1).padStart(2,"0")}. ${item.label}${item.group.startsWith("employment") ? ` — ${item.group.split("/")[1] || ""}` : ""}
      </div>
      <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 4px 4px;padding:12px;background:#fafafa">
        <div style="font-size:10px;color:#94a3b8;margin-bottom:8px;font-family:monospace">${item.doc.filename || item.subKey}</div>
        ${item.b64
          ? `<img src="${item.b64}" style="max-width:100%;max-height:500px;object-fit:contain;border-radius:4px;border:1px solid #e2e8f0;display:block" />`
          : item.isPdf
            ? `<div style="padding:14px;background:#eff6ff;border-radius:4px;border:1px solid #bfdbfe;text-align:center">
                <div style="font-size:13px;margin-bottom:6px">📄 PDF Document</div>
                <a href="${item.url}" style="color:#2563eb;font-size:11px;font-weight:600">Open PDF ↗</a>
                <div style="font-size:10px;color:#94a3b8;margin-top:4px">Links expire in 1 hour</div>
               </div>`
            : `<a href="${item.url}" style="color:#2563eb;font-size:11px">View Document ↗</a>`
        }
      </div>
    </div>`).join("")}
  ` : ""}

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
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f5f6fa; font-family: 'Outfit', sans-serif; color: #18181b; }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 99px; }

  .page { display: flex; min-height: 100vh; }

  /* ── Sidebar ── */
  .sidebar {
    width: 268px; min-width: 268px;
    background: #fafafa;
    border-right: 1px solid #ebebeb;
    display: flex; flex-direction: column;
    height: 100vh; position: sticky; top: 0; overflow-y: auto;
  }

  .side-top {
    padding: 1.25rem 1.35rem 1.1rem;
    border-bottom: 1px solid #f0f0f0;
    display: flex; align-items: center; justify-content: space-between;
  }
  .brand-wrap { display: flex; align-items: center; gap: 0.6rem; }
  .brand-icon { width: 28px; height: 28px; border-radius: 8px; background: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; }
  .brand-name { font-size: 0.95rem; font-weight: 700; color: #18181b; letter-spacing: -0.2px; }
  .brand-sub  { font-size: 0.58rem; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 1px; }
  .so-btn { width: 28px; height: 28px; border-radius: 6px; border: 1px solid #e4e4e7; background: transparent; color: #a1a1aa; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
  .so-btn:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }

  .user-block { padding: 0.85rem 1.35rem; border-bottom: 1px solid #f0f0f0; }
  .user-name-txt { font-size: 0.8rem; font-weight: 600; color: #18181b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .emp-tag { display: inline-block; margin-top: 3px; font-size: 0.58rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: #2563eb; background: #eff6ff; padding: 1px 7px; border-radius: 4px; border: 1px solid #bfdbfe; }

  .req-panel { padding: 1rem 1.35rem 1.1rem; border-bottom: 1px solid #f0f0f0; }
  .panel-label { font-size: 0.58rem; font-weight: 700; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.6rem; }
  .req-in {
    width: 100%; padding: 0.5rem 0.7rem;
    background: #fff; border: 1px solid #e4e4e7; border-radius: 7px;
    font-family: inherit; font-size: 0.75rem; color: #18181b; outline: none;
    transition: border-color 0.15s; margin-bottom: 0.4rem;
  }
  .req-in::placeholder { color: #d4d4d8; }
  .req-in:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.08); }
  .req-ta { resize: vertical; min-height: 52px; line-height: 1.45; }
  .req-msg { font-size: 0.68rem; margin: 0 0 0.35rem; }
  .req-msg.e { color: #ef4444; } .req-msg.s { color: #16a34a; }
  .send-btn { width: 100%; padding: 0.52rem; background: #2563eb; color: #fff; border: none; border-radius: 7px; font-family: inherit; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: background 0.15s; letter-spacing: 0.1px; }
  .send-btn:hover:not(:disabled) { background: #1d4ed8; }
  .send-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .filter-tabs { display: flex; border-bottom: 1px solid #f0f0f0; padding: 0 0.5rem; }
  .ft-btn { flex: 1; padding: 0.6rem 0; background: none; border: none; border-bottom: 2px solid transparent; font-size: 0.63rem; font-weight: 600; color: #a1a1aa; cursor: pointer; transition: all 0.12s; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: -1px; display: flex; align-items: center; justify-content: center; gap: 4px; font-family: inherit; }
  .ft-btn:hover { color: #71717a; }
  .ft-btn.on { color: #2563eb; border-bottom-color: #2563eb; }
  .ft-cnt { padding: 1px 5px; border-radius: 4px; font-size: 0.58rem; font-weight: 700; background: #f4f4f5; color: #71717a; }
  .ft-btn.on .ft-cnt { background: #2563eb; color: #fff; }

  .search-wrap { padding: 0.7rem 1.35rem 0.3rem; }
  .search-in { width: 100%; padding: 0.42rem 0.65rem; background: #fff; border: 1px solid #e4e4e7; border-radius: 6px; font-family: inherit; font-size: 0.71rem; color: #18181b; outline: none; transition: border-color 0.12s; }
  .search-in::placeholder { color: #d4d4d8; }
  .search-in:focus { border-color: #2563eb; }

  .c-list { flex: 1; overflow-y: auto; padding: 0.3rem 0.85rem 2rem; }
  .c-empty { font-size: 0.7rem; color: #d4d4d8; padding: 1rem 0.4rem; }

  .c-item { display: flex; align-items: flex-start; gap: 0.55rem; padding: 0.65rem 0.7rem; border-radius: 8px; cursor: pointer; margin-bottom: 2px; transition: background 0.1s; }
  .c-item:hover { background: #f4f4f5; }
  .c-item.sel { background: #eff6ff; border: 1px solid #dbeafe; }
  .c-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
  .c-mail { font-size: 0.71rem; color: #3f3f46; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .c-nm { font-size: 0.64rem; color: #a1a1aa; margin-top: 1px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .c-dt { font-size: 0.61rem; color: #d4d4d8; margin-top: 2px; }

  /* ── Main ── */
  .main { flex: 1; overflow-y: auto; min-width: 0; background: #f5f6fa; }

  .top-bar { background: #fff; border-bottom: 1px solid #ebebeb; padding: 0.9rem 1.75rem; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; }
  .top-title { font-size: 0.78rem; font-weight: 500; color: #71717a; }
  .top-title strong { color: #18181b; font-size: 0.9rem; font-weight: 700; }

  .print-btn { padding: 0.44rem 1rem; background: #2563eb; color: #fff; border: none; border-radius: 7px; font-family: inherit; font-size: 0.73rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; transition: background 0.15s; }
  .print-btn:hover:not(:disabled) { background: #1d4ed8; }
  .print-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .empty-view { display: flex; flex-direction: column; align-items: center; justify-content: center; height: calc(100vh - 57px); gap: 0.5rem; }
  .empty-ico { font-size: 36px; opacity: 0.12; }
  .empty-h { font-size: 0.9rem; font-weight: 600; color: #a1a1aa; }
  .empty-s { font-size: 0.75rem; color: #d4d4d8; }

  /* ── Profile area ── */
  .pane { padding: 1.5rem 1.75rem; }

  .hero-card {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    border-radius: 12px; padding: 1.25rem 1.5rem; margin-bottom: 1.1rem;
    display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.75rem;
  }
  .hero-name { font-size: 1.25rem; font-weight: 700; color: #fafafa; letter-spacing: -0.3px; }
  .hero-email { font-size: 0.72rem; color: #94a3b8; margin-top: 3px; font-family: 'JetBrains Mono', monospace; }
  .hero-badges { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.7rem; }
  .hb { padding: 0.18rem 0.6rem; border-radius: 4px; font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  .hb-approved { background: rgba(34,197,94,0.18); color: #4ade80; }
  .hb-pending  { background: rgba(234,179,8,0.18);  color: #fbbf24; }
  .hb-declined { background: rgba(239,68,68,0.18);  color: #f87171; }
  .hb-info     { background: rgba(255,255,255,0.12); color: #cbd5e1; }

  .msg-bubble { max-width: 260px; padding: 0.65rem 0.9rem; background: rgba(255,255,255,0.06); border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); }
  .msg-lbl { font-size: 0.55rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
  .msg-txt { font-size: 0.72rem; color: #cbd5e1; line-height: 1.5; }

  .note-bar { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 0.6rem 0.9rem; font-size: 0.7rem; color: #92400e; margin-bottom: 1.1rem; line-height: 1.55; }
  .status-card { background: #fff; border: 1px solid #ebebeb; border-radius: 9px; padding: 1.1rem 1.25rem; font-size: 0.82rem; color: #71717a; }
  .status-card.dec { background: #fef2f2; border-color: #fecaca; color: #dc2626; }

  /* ── Tabs ── */
  .tab-nav { display: flex; background: #fff; border-bottom: 1.5px solid #ebebeb; border-radius: 9px 9px 0 0; overflow: hidden; }
  .tab-btn { flex: 1; padding: 0.7rem 0.4rem; background: none; border: none; border-bottom: 2.5px solid transparent; font-family: inherit; font-size: 0.72rem; font-weight: 500; color: #a1a1aa; cursor: pointer; margin-bottom: -1.5px; transition: all 0.12s; white-space: nowrap; }
  .tab-btn:hover { color: #52525b; background: #fafafa; }
  .tab-btn.on { color: #2563eb; border-bottom-color: #2563eb; font-weight: 700; background: #fff; }

  .tab-pane { background: #fff; border: 1px solid #ebebeb; border-top: none; border-radius: 0 0 9px 9px; padding: 1.25rem 1.4rem; margin-bottom: 1.1rem; }

  /* ── KV ── */
  .kv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(158px, 1fr)); gap: 0.75rem; }
  .kv { display: flex; flex-direction: column; gap: 3px; }
  .kv-k { font-size: 0.6rem; font-weight: 600; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px; }
  .kv-v { font-size: 0.83rem; color: #18181b; font-weight: 500; word-break: break-word; }
  .kv-v.mono { font-family: 'JetBrains Mono', monospace; font-size: 0.74rem; }
  .kv-v.nd { color: #d4d4d8; font-style: italic; font-weight: 400; font-size: 0.76rem; }

  .sec { margin-bottom: 1.2rem; }
  .sec:last-child { margin-bottom: 0; }
  .sec-title { font-size: 0.6rem; font-weight: 700; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 0.5rem; margin-bottom: 0.75rem; border-bottom: 1px solid #f4f4f5; }

  .nd-box { font-size: 0.76rem; color: #a1a1aa; padding: 0.7rem; background: #fafafa; border-radius: 6px; }

  .emp-card { border: 1px solid #ebebeb; border-radius: 8px; padding: 1rem 1.1rem; margin-bottom: 0.7rem; position: relative; overflow: hidden; background: #fff; }
  .emp-card::before { content:''; position:absolute; top:0; left:0; bottom:0; width:3px; background:#2563eb; border-radius:3px 0 0 3px; }
  .emp-title { font-size: 0.65rem; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 0.65rem; padding-left: 4px; display: flex; align-items: center; gap: 0.4rem; }
  .curr-pill { background: #dcfce7; color: #15803d; padding: 1px 7px; border-radius: 4px; font-size: 0.58rem; font-weight: 700; }

  .edu-card { border: 1px solid #ebebeb; border-radius: 8px; padding: 1rem 1.1rem; margin-bottom: 0.7rem; background: #fff; }
  .edu-title { font-size: 0.65rem; font-weight: 700; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 0.65rem; }

  .sub-div { border-top: 1px solid #f4f4f5; margin-top: 0.7rem; padding-top: 0.7rem; }
  .sub-lbl { font-size: 0.58rem; font-weight: 700; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.45rem; }

  .gap-note { margin-top: 0.6rem; padding: 0.5rem 0.7rem; background: #fffbeb; border-radius: 6px; border: 1px solid #fde68a; font-size: 0.7rem; color: #92400e; }

  /* ── Documents ── */
  .doc-grp-title { font-size: 0.6rem; font-weight: 700; color: #71717a; text-transform: uppercase; letter-spacing: 0.8px; margin: 0.9rem 0 0.45rem; }
  .doc-row { display: flex; align-items: center; justify-content: space-between; padding: 0.55rem 0.85rem; background: #fafafa; border: 1px solid #ebebeb; border-radius: 6px; margin-bottom: 0.35rem; }
  .doc-name { font-size: 0.76rem; font-weight: 600; color: #18181b; }
  .doc-meta { font-size: 0.62rem; color: #a1a1aa; margin-top: 1px; font-family: 'JetBrains Mono', monospace; }
  .doc-view { padding: 0.3rem 0.75rem; background: #1e293b; color: #fff; border-radius: 5px; font-size: 0.68rem; font-weight: 600; text-decoration: none; white-space: nowrap; transition: background 0.15s; }
  .doc-view:hover { background: #334155; }

  @media(max-width:768px) {
    .sidebar { width:100%; height:auto; position:relative; }
    .page { flex-direction:column; }
    .pane { padding:1rem; }
  }
`;

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
          <div style={{width:16,height:16,borderRadius:3,border:`2px solid ${checked?"#1e293b":"#cbd5e1"}`,background:checked?"#1e293b":"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,transition:"all 0.12s"}}>
            {checked && <span style={{color:"#fff",fontSize:"0.55rem",fontWeight:800}}>✓</span>}
          </div>
          <span style={{fontSize:"0.75rem",color:"#374151",lineHeight:1.5}}>I have read and agree to the Data Access & Sharing Agreement on behalf of my organisation.</span>
        </label>
        <button
          onClick={async () => { if (!checked || busy) return; setBusy(true); await onAccept(); setBusy(false); }}
          disabled={!checked || busy}
          style={{padding:"0.65rem",background:checked?"#1e293b":"#e2e8f0",color:checked?"#fff":"#94a3b8",border:"none",borderRadius:7,fontFamily:"inherit",fontSize:"0.84rem",fontWeight:700,cursor:checked&&!busy?"pointer":"not-allowed",transition:"all 0.15s"}}>
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
          <KV k="Date of Birth"       v={data.dob} />
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
            <KV k="Issue Date"    v={data.passportIssue} />
            <KV k="Expiry Date"   v={data.passportExpiry} />
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
          <KV k="Residing From"  v={cur.from} />
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
            <KV k="Account No."    v={data.accountFull?"•".repeat(Math.max(0,data.accountFull.length-4))+data.accountFull.slice(-4):(data.accountLast4?`••••••••${data.accountLast4}`:"")} mono />
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
          {s.course&&<KV k="Course / Degree"       v={s.course} />}
          {(s.branch||s.specialization)&&<KV k="Branch / Specialization" v={s.branch||s.specialization} />}
          <KV k="Year of Passing"       v={s.yearOfPassing} />
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
                <KV k="Type"   v={q.type} />
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
                <KV k="Type"       v={a.type} />
                <KV k="Firm"       v={a.firm} />
                <KV k="City"       v={a.city} />
                <KV k="Principal"  v={a.principalName} />
                <KV k="Reg. No."   v={a.regNo} mono />
                <KV k="From"       v={a.from} />
                <KV k="To"         v={a.to||(a.isOngoing==="Ongoing"?"Ongoing":"")} />
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
            <KV k="Date of Joining" v={e.startDate} />
            {i===0
              ?<KV k="Currently Working" v={e.currentlyWorking==="Yes"?"Yes — Still Employed":"No"} />
              :<KV k="Date of Leaving"   v={e.endDate} />}
            {i===0&&e.currentlyWorking==="No"&&<KV k="Date of Leaving" v={e.endDate} />}
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
              <div style={{fontSize:"0.62rem",fontWeight:700,color:"#7c3aed",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"0.4rem"}}>{pf.companyName||`Employer ${i+1}`}</div>
              {pf.hasPf==="No"
                ?<div style={{fontSize:"0.72rem",color:"#0369a1"}}>ℹ PF not maintained by this employer</div>
                :<div className="kv-grid">
                  <KV k="PF Member ID"    v={pf.pfMemberId} mono />
                  <KV k="Date of Joining" v={pf.dojEpfo} />
                  <KV k="Date of Exit"    v={pf.doeEpfo} />
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
  const [loadingProf,    setLoadingProf]    = useState(false);
  const [loading,        setLoading]        = useState(true);
  const [printing,       setPrinting]       = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/employer/login"); return; }
    if (user.role !== "employer") { router.replace("/employer/login"); return; }
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

  useEffect(() => { if (ready && user) loadConsents(); }, [ready, user, loadConsents]);
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

  const loadDocs = useCallback(async (empId) => {
    if (!empId) return;
    setDocsLoading(true);
    try { const r = await apiFetch(`${API}/documents/${empId}`); if (r.ok) setDocuments((await r.json()).documents||{}); } catch (_) {}
    setDocsLoading(false);
  }, [apiFetch]);

  const selectConsent = useCallback(async (consent) => {
    setSelected(consent); setProfileData(null); setDocuments(null); setActiveTab("Overview");
    if (consent.status !== "approved") return;
    setLoadingProf(true);
    try {
      const r = await apiFetch(`${API}/consent/${gcid(consent)}`);
      if (r.ok) {
        const raw = await r.json();
        const profile = normalizeProfile(raw?.profile_snapshot||raw?.employee||{});
        setProfileData({ ...raw, profile_snapshot: profile, employment_snapshot: raw?.employment_snapshot||raw?.employmentHistory||[] });
        const eid = profile?.employee_id||raw?.employee_id||consent?.employee_id;
        if (eid) loadDocs(eid);
      }
    } catch (_) {}
    setLoadingProf(false);
  }, [apiFetch, loadDocs]);

  const sendRequest = async () => {
    setReqErr(""); setReqOk("");
    if (!reqEmail.trim()) { setReqErr("Email is required"); return; }
    setReqBusy(true);
    try {
      const r = await apiFetch(`${API}/consent/request`, { method:"POST", body:JSON.stringify({ employee_email:reqEmail.trim().toLowerCase(), message:reqMsg.trim()||undefined }) });
      const data = await r.json();
      if (!r.ok) { setReqErr(parseError(data)); return; }
      setReqOk("Request sent!"); setReqEmail(""); setReqMsg(""); loadConsents();
    } catch { setReqErr("Network error"); }
    finally { setReqBusy(false); }
  };

  const handlePrint = async () => {
    if (!profileData || printing) return;
    setPrinting(true);
    try {
      await printProfile(profileData.profile_snapshot, profileData.employment_snapshot||[], documents, user?.name||user?.email);
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

  const snap    = profileData?.profile_snapshot;
  const empName = snap ? [snap.firstName, snap.lastName].filter(Boolean).join(" ")||selected?.employee_email : selected?.employee_email;

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
          <div className="side-top">
            <div className="brand-wrap">
              <div className="brand-icon">🔒</div>
              <div><div className="brand-name">Datagate</div><div className="brand-sub">Employer Portal</div></div>
            </div>
            <button className="so-btn" onClick={() => setShowSignout(true)} title="Sign out">⏻</button>
          </div>

          <div className="user-block">
            <div className="user-name-txt">{user.name || user.email}</div>
            <span className="emp-tag">Employer</span>
          </div>

          <div className="req-panel">
            <div className="panel-label">Request Employee Data</div>
            <input className="req-in" type="email" placeholder="Employee email address" value={reqEmail} onChange={e => setReqEmail(e.target.value)} onKeyDown={e => e.key==="Enter" && !reqMsg && sendRequest()} />
            <textarea className="req-in req-ta" placeholder="Message to employee (optional)" value={reqMsg} onChange={e => setReqMsg(e.target.value)} />
            {reqErr && <p className="req-msg e">{reqErr}</p>}
            {reqOk  && <p className="req-msg s">{reqOk}</p>}
            <button className="send-btn" onClick={sendRequest} disabled={reqBusy}>{reqBusy ? "Sending…" : "Send Request"}</button>
          </div>

          <div className="filter-tabs">
            {[["pending","Pending"],["approved","Approved"],["declined","Declined"]].map(([key,label]) => (
              <button key={key} className={`ft-btn${cTab===key?" on":""}`} onClick={() => setCTab(key)}>
                {label}
                {counts[key] > 0 && <span className="ft-cnt">{counts[key]}</span>}
              </button>
            ))}
          </div>

          <div className="search-wrap">
            <input className="search-in" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="c-list">
            {loading ? <div className="c-empty">Loading…</div>
            : list.length === 0 ? <div className="c-empty">{search ? "No matches" : `No ${cTab} requests`}</div>
            : list.map(c => {
              const dot = c.status==="approved" ? "#16a34a" : c.status==="pending" ? "#f59e0b" : "#ef4444";
              const ts  = c.status==="approved" ? (c.responded_at||c.approved_at) : (c.requested_at||c.created_at);
              return (
                <div key={gcid(c)} className={`c-item${gcid(selected)===gcid(c)?" sel":""}`} onClick={() => selectConsent(c)}>
                  <div className="c-dot" style={{ background: dot }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div className="c-mail">{c.employee_email}</div>
                    {c.employee_name && c.employee_name !== c.employee_email && <div className="c-nm">{c.employee_name}</div>}
                    <div className="c-dt">{toISTDate(ts)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="main">
          {!selected ? (
            <div className="empty-view">
              <div className="empty-ico">👥</div>
              <div className="empty-h">Select a request</div>
              <div className="empty-s">Approved consents show the full verified profile here</div>
            </div>
          ) : (
            <>
              <div className="top-bar">
                <div className="top-title"><strong>{empName}</strong> — {selected.employee_email}</div>
                {selected.status==="approved" && profileData && (
                  <button className="print-btn" onClick={handlePrint} disabled={printing}>
                    {printing ? "⏳ Preparing…" : "🖨 Print / Export PDF"}
                  </button>
                )}
              </div>

              <div className="pane">
                <div className="hero-card">
                  <div>
                    <div className="hero-name">{empName}</div>
                    <div className="hero-email">{selected.employee_email}</div>
                    <div className="hero-badges">
                      <span className={`hb hb-${selected.status}`}>{selected.status.charAt(0).toUpperCase()+selected.status.slice(1)}</span>
                      {selected.requested_at && <span className="hb hb-info">Requested: {toISTDate(selected.requested_at)}</span>}
                      {(selected.responded_at||selected.approved_at) && <span className="hb hb-info">Responded: {toISTDate(selected.responded_at||selected.approved_at)}</span>}
                      {profileData?.snapshot_at && <span className="hb hb-info">Snapshot: {toISTDate(profileData.snapshot_at)}</span>}
                    </div>
                  </div>
                  {selected.request_message && (
                    <div className="msg-bubble">
                      <div className="msg-lbl">Your message</div>
                      <div className="msg-txt">{selected.request_message}</div>
                    </div>
                  )}
                </div>

                {selected.status==="pending"  && <div className="status-card">⏳ Waiting for employee to approve your request.</div>}
                {selected.status==="declined" && <div className="status-card dec">❌ Employee declined this request.</div>}

                {selected.status==="approved" && (
                  loadingProf ? <div className="status-card">Loading profile…</div>
                  : !profileData ? <div className="status-card">Could not load profile data.</div>
                  : <>
                    <div className="note-bar">⚠️ <strong>Self-reported data.</strong> All information was filled and submitted by the employee. Documents are uploaded by the candidate and not independently verified by Datagate unless a verified check has been explicitly completed.</div>
                    <div className="tab-nav">
                      {DATA_TABS.map(t => <button key={t} className={`tab-btn${activeTab===t?" on":""}`} onClick={() => setActiveTab(t)}>{t}</button>)}
                    </div>
                    <div className="tab-pane">
                      {activeTab==="Overview"   && <OverviewTab   data={profileData.profile_snapshot} />}
                      {activeTab==="Education"  && <EducationTab  data={profileData.profile_snapshot?.education} />}
                      {activeTab==="Employment" && <EmploymentTab data={profileData.employment_snapshot} resumeKey={profileData.profile_snapshot?.resumeKey} docUrls={docUrls} />}
                      {activeTab==="UAN & PF"   && <UanTab        data={profileData.profile_snapshot} />}
                      {activeTab==="Documents"  && <DocumentsTab  documents={documents} loading={docsLoading} />}
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
