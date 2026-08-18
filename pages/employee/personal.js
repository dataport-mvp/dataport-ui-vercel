import React, { useState, useEffect, useCallback, useRef } from "react";
// pages/employee/personal.js  — Page 1 of 5
// Fixes:
// 1. DateField — no calendar, DD/MM/YYYY input, shows "📅 15 March 2023" below
// 2. Bank account — digit counter below entry + confirm fields
// 3. page1_edited cascade flag → page 5 re-asks acks when page 1 was edited

import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";
import FileUpload from "../../components/FileUpload";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

const ACCENTS = { 1:"#0d6e6e", 2:"#d97706", 3:"#7c3aed", 4:"#0891b2", 5:"#16a34a" };
const STEP_DONE_BG = "#0a4a4a";
const STEP_DONE_CK = "#5eead4";
const STEP_CONN    = "#0d6e6e";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function isoToDisplay(iso) {
  if (!iso || !iso.includes("-")) return iso || "";
  const [y, mo, d] = iso.split("-");
  const idx = parseInt(mo, 10) - 1;
  const mName = MONTH_NAMES[idx] || mo;
  return `${parseInt(d,10)} ${mName} ${y}`;
}

// ── Self-export PDF helpers (mirrors employer dashboard's report builder,
//    adapted so an employee can download their own profile) ──────────────
const normalizeEducationSelf = (ed = {}) => {
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
    eduGapFrom:     ed?.eduGapFrom     || "",
    eduGapTo:       ed?.eduGapTo       || "",
    hasDip:         ed?.hasDip         || "",
    hasCerts:       ed?.hasCerts       || "",
    hasProfQual:    ed?.hasProfQual    || "",
    hasArticleship: ed?.hasArticleship || "",
  };
};

const normalizeProfileSelf = (snap = {}) => {
  const u = snap?.uanMaster || snap?.uan_master || {};
  return {
    ...snap,
    education:    normalizeEducationSelf(snap?.education || {}),
    uanNumber:    snap?.uanNumber    || snap?.uan_number    || u?.uanNumber    || u?.uan_number,
    nameAsPerUan: snap?.nameAsPerUan || snap?.name_as_per_uan || u?.nameAsPerUan || u?.name_as_per_uan,
    mobileLinked: snap?.mobileLinked || snap?.mobile_linked  || u?.mobileLinked || u?.mobile_linked,
    isActive:     snap?.isActive     || snap?.is_active      || u?.isActive     || u?.is_active,
    pfRecords:    Array.isArray(snap?.pfRecords) ? snap.pfRecords : Array.isArray(snap?.pf_records) ? snap.pf_records : [],
  };
};

// familyDetails mixes two DOB formats: ISO (yyyy-mm-dd) when copied straight from Personal
// Details ("My Parents"), and dd-mm-yyyy from NomineeDobField everywhere else (spouse,
// children, in-laws). Detect which one we've got and format either correctly.
function anyDobToDisplaySelf(val) {
  if (!val) return "";
  const parts = val.split("-");
  if (parts.length !== 3) return val;
  return parts[0].length === 4 ? isoToDisplay(val) : ddmmyyyyToDisplaySelf(val);
}
function ddmmyyyyToDisplaySelf(val) {
  if (!val || val.length !== 10) return val || "";
  const [dd, mm, yyyy] = val.split("-");
  const idx = parseInt(mm, 10) - 1;
  const mName = MONTH_NAMES[idx];
  if (!mName) return val;
  return `${parseInt(dd, 10)} ${mName} ${yyyy}`;
}

async function buildMyProfilePdf(profile, empHistory, documents, employeeSelfName) {
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
    { key: "ug_equivalency", label: "UG Equivalency Certificate (Foreign Degree)", group: "education" },
    { key: "pg_provisional", label: "PG Provisional Marksheet",       group: "education" },
    { key: "pg_convocation", label: "PG Convocation Certificate",     group: "education" },
    { key: "pg_equivalency", label: "PG Equivalency Certificate (Foreign Degree)", group: "education" },
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
    { key: "signature",      label: "Digital Signature (latest)",     group: "uan" },
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
      row("Country",              s.country === "Outside India" ? (s.countryName || "Outside India") : ""),
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
      row("Equivalency Certificate", s.country === "Outside India" ? (s.equivalencyKey ? "Uploaded" : "Not yet uploaded") : ""),
      row("Address",              s.address),
    ].join(""), color);
  };

  // Return HTML string instead of opening new tab
  const htmlString = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>My Profile — ${[d.firstName, d.lastName].filter(Boolean).join(" ") || "Employee"}</title>
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
      <div style="font-size:9px;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;margin-top:2px">Your Profile — Self-Downloaded Copy</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:10px;color:#64748b">Generated: ${new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})}</div>
      <div style="font-size:10px;color:#64748b;margin-top:1px">Downloaded by: <strong>${employeeSelfName || "—"}</strong> (self-export)</div>
      <div style="margin-top:6px;display:inline-block;background:#dcfce7;color:#15803d;padding:3px 10px;border-radius:999px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">📄 Your Own Copy — Not an Employer-Shared Report</div>
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
    row("Gender",           d.gender==="Other"&&d.genderOther?`Other — ${d.genderOther}`:d.gender),
    row("Religion",         d.religion),
    row("Category",         d.category),
    row("Nationality",      d.nationality),
    row("Blood Group",      d.bloodGroup),
    row("Marital Status",   d.maritalStatus),
  ].join(""))}

  ${section("Family", [
    row("Father's Name", d.fatherName || [d.fatherFirst, d.fatherMiddle, d.fatherLast].filter(Boolean).join(" ")),
    row("Father's Date of Birth", isoToDisplay(d.fatherDob)),
    row("Mother's Name", d.motherName || [d.motherFirst, d.motherMiddle, d.motherLast].filter(Boolean).join(" ")),
    row("Mother's Date of Birth", isoToDisplay(d.motherDob)),
    d.maritalStatus === "Married" ? row("Spouse Name", d.spouseName) : "",
    d.maritalStatus === "Married" ? row("Spouse Date of Birth", isoToDisplay(d.spouseDob)) : "",
  ].join(""))}

  ${section("Identity Documents", [
    row("Aadhaar Number",     d.aadhaar || d.aadhar),
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
    row(`Qualification ${i+1} — Year`,  q.year || (q.level === "Pursuing" ? "Pursuing" : "")),
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
    row("From",     isoToDisplay(edu.eduGapFrom)),
    row("To",       isoToDisplay(edu.eduGapTo)),
    row("Reason",   edu.eduGapReason),
  ].join(""), "#334155") : ""}

  <!-- ══ SECTION 3: EMPLOYMENT ══ -->
  <div style="font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;margin-top:20px">Page 3 — Employment History</div>

  ${empHistory.length === 0 ? `<div style="padding:10px;color:#94a3b8;font-size:11px">No employment history provided.</div>` : [...empHistory].sort((a,b)=>(Number(a.sort_order??999))-(Number(b.sort_order??999))).map((e,i,arr) => section(
    i === arr.length-1 ? "Current / Most Recent Employer" : `Previous Employer ${i+1}`,
    [
      row("Company Name",          e.companyName),
      row("Designation",           e.designation),
      row("Department",            e.department),
      row("Employment Type",       e.employmentType),
      row("Employee ID",           e.employeeId),
      row("Work Email",            e.workEmail),
      row("Office Address",        e.officeAddress),
      row("Date of Joining",       isoToDisplay(e.startDate)),
      i === arr.length-1 ? row("Currently Working", e.currentlyWorking === "Yes" ? "Yes — Still Employed" : "No") : row("Date of Leaving", isoToDisplay(e.endDate)),
      i === arr.length-1 && e.currentlyWorking === "No" ? row("Date of Leaving", isoToDisplay(e.endDate)) : "",
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
      e.gap?.hasGap === "Yes" ? row("Employment Gap From", isoToDisplay(e.gap?.from)) : "",
      e.gap?.hasGap === "Yes" ? row("Employment Gap To",   isoToDisplay(e.gap?.to))   : "",
    ].join(""), i === arr.length-1 ? "#18151f" : "#334155"
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

  ${d.familyDetails && (d.familyDetails.spouseName || d.familyDetails.spouseDob || d.familyDetails.hasChildren === "Yes" || (d.familyDetails.parentsCoverage && d.familyDetails.parentsCoverage !== "Not Applicable")) ? section("Family Details — Health Insurance", [
    row("Spouse Name",             d.familyDetails.spouseName),
    row("Spouse Date of Birth",    anyDobToDisplaySelf(d.familyDetails.spouseDob)),
    ...(Array.isArray(d.familyDetails.children) ? d.familyDetails.children.flatMap((c,i) => [
      row(`Child ${i+1} Name`,   c.name),
      row(`Child ${i+1} DOB`,    anyDobToDisplaySelf(c.dob)),
      row(`Child ${i+1} Gender`, c.gender),
    ]) : []),
    d.familyDetails.parentsCoverage && d.familyDetails.parentsCoverage !== "Not Applicable" ? row("Parents Covered", d.familyDetails.parentsCoverage) : "",
    row(d.familyDetails.parentsCoverage === "My Parents" ? "Father's Name" : "Father-in-law's Name", d.familyDetails.excludeFather ? "Excluded — passed away" : d.familyDetails.fatherName),
    row(d.familyDetails.parentsCoverage === "My Parents" ? "Father's DOB"  : "Father-in-law's DOB",  d.familyDetails.excludeFather ? "" : anyDobToDisplaySelf(d.familyDetails.fatherDob)),
    row(d.familyDetails.parentsCoverage === "My Parents" ? "Mother's Name" : "Mother-in-law's Name", d.familyDetails.excludeMother ? "Excluded — passed away" : d.familyDetails.motherName),
    row(d.familyDetails.parentsCoverage === "My Parents" ? "Mother's DOB"  : "Mother-in-law's DOB",  d.familyDetails.excludeMother ? "" : anyDobToDisplaySelf(d.familyDetails.motherDob)),
  ].join(""), "#334155") : ""}

  ${section("EPFO Declarations & Digital Signature", [
    row("PF Nomination Declaration (Form 2 — Part A)",      d.epfoDeclarations?.pfNomAck ? "✓ Agreed" : "Not agreed"),
    row("Pension Nomination Declaration (Form 2 — Part B)", d.epfoDeclarations?.pensionNomAck ? "✓ Agreed" : "Not agreed"),
    row("General EPFO Declaration",                          d.epfoDeclarations?.epfoDecl ? "✓ Agreed" : "Not agreed"),
    row("Digital Signature", d.epfoSignature?.s3Key ? `✓ Signed${d.epfoSignature?.timestamp ? " on " + new Date(d.epfoSignature.timestamp).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}) : ""}` : "⚠ Not yet signed"),
  ].join(""), "#334155")}

  <!-- ══ SECTION 5: DOCUMENTS ══ -->
  <div style="font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin-bottom:14px;margin-top:20px">Documents — In Sequence Order</div>

  ${docsWithData.length > 0 ? (() => {
    // Group docs by employer — sort by employment history order
    const sortedEmp = [...(empHistory||[])].sort((a,b)=>(Number(a.sort_order??999))-(Number(b.sort_order??999)));
    const groups = {};
    const nonEmpDocs = [];
    docsWithData.forEach(item => {
      if (item.group.startsWith("employment/")) {
        const cid = item.group.split("/")[1];
        if (!groups[cid]) groups[cid] = [];
        groups[cid].push(item);
      } else {
        nonEmpDocs.push(item);
      }
    });
    const docBlock = (item, label) => `
    <div style="margin-bottom:16px;page-break-inside:avoid">
      <div style="background:#475569;color:#fff;padding:4px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;border-radius:4px 4px 0 0">${label}</div>
      <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 4px 4px;padding:10px;background:#fafafa">
        <div style="font-size:9px;color:#94a3b8;margin-bottom:6px;font-family:monospace">${item.doc.filename || item.subKey}</div>
        ${!item.url ? `<div style="padding:8px;background:#fef2f2;border-radius:4px;font-size:10px;color:#dc2626">⚠ No URL found.</div>`
          : item.isImage ? `<img src="${item.url}" referrerpolicy="no-referrer" style="max-width:100%;max-height:400px;object-fit:contain;border-radius:4px;border:1px solid #e2e8f0;display:block" />`
          : item.isPdf ? `<div style="padding:12px;background:#eff6ff;border-radius:4px;border:1px solid #bfdbfe;text-align:center"><div style="font-size:12px;margin-bottom:4px">📄 PDF Document</div><a href="${item.url}" target="_blank" style="color:#2563eb;font-size:10px;font-weight:600">Open PDF ↗</a><div style="font-size:9px;color:#94a3b8;margin-top:3px">Links expire in 1 hour</div></div>`
          : `<a href="${item.url}" target="_blank" style="color:#2563eb;font-size:10px">View Document ↗</a>`}
      </div>
    </div>`;
    // Non-employment docs first (resume, identity etc)
    let html = nonEmpDocs.map(item => docBlock(item, item.label)).join("");
    // Then per-employer grouped docs in employment history order
    sortedEmp.forEach((emp, ei) => {
      const empDocs = groups[emp.company_id] || [];
      if (empDocs.length === 0) return;
      const empLabel = ei === sortedEmp.length - 1 ? "Current Employer" : `Previous Employer ${ei + 1}`;
      html += `<div style="margin-top:20px;margin-bottom:8px;padding:6px 12px;background:#1e293b;color:#fff;border-radius:6px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;page-break-before:auto">${empLabel} — ${emp.companyName || emp.company_id}</div>`;
      html += empDocs.map(item => docBlock(item, item.label)).join("");
    });
    return html;
  })() : `<div style="padding:14px;background:#fffbeb;border:1px solid #fde68a;border-radius:6px;font-size:11px;color:#92400e">No documents on file for this candidate.</div>`}

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
</html>`;
  return htmlString;
}

function MyPrintPreviewModal({ html, onClose }) {
  if (!html) return null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:999,display:"flex",flexDirection:"column",background:"#1a1a1a"}}>
      <div className="no-print" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.6rem 1.2rem",background:"#111",borderBottom:"1px solid #2a2a2a",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
          <span style={{color:"#fff",fontWeight:700,fontSize:"0.9rem",fontFamily:"inherit"}}>📄 Your Profile — Preview</span>
          <span style={{color:"#94a3b8",fontSize:"0.72rem"}}>Review before printing or saving as PDF</span>
        </div>
        <div style={{display:"flex",gap:"0.6rem"}}>
          <button
            onClick={() => {
              const iframe = document.getElementById("dg-my-print-frame");
              if (iframe) { iframe.contentWindow.focus(); iframe.contentWindow.print(); }
            }}
            style={{padding:"0.45rem 1.1rem",background:"#0d6e6e",color:"#fff",border:"none",borderRadius:7,fontFamily:"inherit",fontSize:"0.78rem",fontWeight:700,cursor:"pointer"}}>
            🖨 Print / Save as PDF
          </button>
          <button
            onClick={onClose}
            style={{padding:"0.45rem 0.9rem",background:"#2a2a2a",color:"#94a3b8",border:"1px solid #3a3a3a",borderRadius:7,fontFamily:"inherit",fontSize:"0.78rem",fontWeight:600,cursor:"pointer"}}>
            ✕ Close
          </button>
        </div>
      </div>
      <iframe
        id="dg-my-print-frame"
        srcDoc={html}
        style={{flex:1,border:"none",background:"#fff"}}
        title="My Profile Preview"
      />
    </div>
  );
}


const GENDER_OPTIONS = [
  "Male","Female","Non-binary","Genderqueer","Genderfluid","Agender","Bigender",
  "Two-Spirit","Transgender Male","Transgender Female","Intersex","Prefer not to say","Other",
];

const BANK_LIST = [
  "State Bank of India (SBI)","HDFC Bank","ICICI Bank","Axis Bank","Kotak Mahindra Bank",
  "Punjab National Bank (PNB)","Bank of Baroda","Canara Bank","Union Bank of India",
  "Bank of India","Indian Bank","Central Bank of India","Indian Overseas Bank","UCO Bank",
  "Bank of Maharashtra","Punjab & Sind Bank","Yes Bank","IDFC First Bank","IndusInd Bank",
  "Federal Bank","South Indian Bank","Karnataka Bank","Karur Vysya Bank","City Union Bank",
  "Dhanlaxmi Bank","Nainital Bank","RBL Bank","DCB Bank","Bandhan Bank",
  "AU Small Finance Bank","Ujjivan Small Finance Bank","Jana Small Finance Bank",
  "Equitas Small Finance Bank","ESAF Small Finance Bank","Suryoday Small Finance Bank","Other",
];

const G = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f0ece6; font-family: 'DM Sans', sans-serif; }
  .pg { min-height: 100vh; background: #f0ece6; padding-bottom: 3rem; }
  .wrap { max-width: 860px; margin: auto; padding: 0 1.25rem; }

  .topbar { background: #111; border-bottom: 1px solid #2a2535; padding: 0.85rem 1.75rem;
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 1.75rem; position: sticky; top: 0; z-index: 50;
    box-shadow: 0 4px 20px rgba(15,12,40,0.4); }
  .logo-text { font-size: 1.3rem; font-weight: 800; color: #0d6e6e; letter-spacing: -0.5px; }
  .topbar-right { display: flex; align-items: center; gap: 0.75rem; }
  .user-name { font-size: 0.84rem; color: #8b92a8; font-weight: 500; }
  .signout-btn { padding: 0.38rem 1rem; border: 1.5px solid #2a2535; border-radius: 8px;
    background: transparent; color: #8b92a8; font-size: 0.82rem; cursor: pointer;
    font-weight: 600; font-family: inherit; transition: all 0.2s; }
  .signout-btn:hover { border-color: #fca5a5; color: #ef4444; background: rgba(239,68,68,0.08); }

  .bell-btn { position: relative; width: 36px; height: 36px; border-radius: 9px;
    border: 1.5px solid #2a2535; background: transparent; cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: 1rem;
    transition: all 0.2s; }
  .bell-btn:hover { border-color: #0d6e6e; background: rgba(167,139,250,0.1); }
  .bell-badge { position: absolute; top: -5px; right: -5px; background: #ef4444; color: #fff;
    border-radius: 999px; font-size: 0.6rem; font-weight: 800; min-width: 16px; height: 16px;
    display: flex; align-items: center; justify-content: center; padding: 0 3px; border: 2px solid #18151f; }

  /* Settings gear */
  .gear-wrap { position: relative; }
  .gear-btn { width: 36px; height: 36px; border-radius: 9px; border: 1.5px solid #2a2535;
    background: transparent; cursor: pointer; display: flex; align-items: center;
    justify-content: center; font-size: 1rem; transition: all 0.2s; color: #8b92a8; }
  .gear-btn:hover { border-color: #0d6e6e; background: rgba(167,139,250,0.1); color: #0d6e6e; }
  .gear-btn.open { border-color: #0d6e6e; background: rgba(167,139,250,0.15); color: #0d6e6e; }
  .gear-dropdown { position: absolute; top: calc(100% + 8px); right: 0; background: #111;
    border: 1px solid #2a2535; border-radius: 10px; padding: 0.35rem;
    min-width: 180px; z-index: 200; box-shadow: 0 8px 32px rgba(15,12,40,0.5);
    animation: fadeDown 0.12s ease; }
  @keyframes fadeDown { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
  .gear-item { display: flex; align-items: center; gap: 0.6rem; width: 100%; padding: 0.55rem 0.75rem;
    border: none; background: none; cursor: pointer; border-radius: 7px; font-family: inherit;
    font-size: 0.78rem; font-weight: 600; color: #8b92a8; text-align: left; transition: all 0.12s; }
  .gear-item:hover { background: rgba(167,139,250,0.12); color: #0d6e6e; }
  .gear-item.danger:hover { background: rgba(239,68,68,0.1); color: #ef4444; }
  .gear-divider { height: 1px; background: #2a2535; margin: 0.25rem 0; }

  .tab-row { display: flex; border-bottom: 2px solid #e8e5f0; margin-bottom: 1.75rem; }
  .tab-btn { padding: 0.6rem 1.4rem; border: none; background: none; font-family: inherit;
    font-size: 0.875rem; color: #94a3b8; cursor: pointer; border-bottom: 2.5px solid transparent;
    margin-bottom: -2px; font-weight: 600; transition: all 0.2s; }
  .tab-btn.active { color: #0d6e6e; border-bottom-color: #0d6e6e; }
  .tab-btn:hover:not(.active) { color: #475569; }

  .sc { background: #ffffff; border-radius: 16px; padding: 1.5rem 1.6rem;
    margin-bottom: 1.1rem; box-shadow: 0 6px 28px rgba(30,26,62,0.22), 0 2px 8px rgba(30,26,62,0.12);
    border: 1px solid rgba(255,255,255,0.85); position: relative; overflow: hidden; }
  .sc::before { content: ''; position: absolute; top: 0; left: 0; bottom: 0;
    width: 4px; border-radius: 16px 0 0 16px; }
  .sc.ind::before { background: #0d6e6e; }
  .sc.cyn::before { background: #0891b2; }
  .sc.amb::before { background: #d97706; }
  .sc.ros::before { background: #e11d48; }
  .sc.vio::before { background: #7c3aed; }
  .sc.grn::before { background: #16a34a; }
  .sc.teal::before { background: #0d9488; }

  .sh { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.15rem; }
  .si { width: 32px; height: 32px; border-radius: 8px; display: flex;
    align-items: center; justify-content: center; font-size: 0.95rem; flex-shrink: 0; }
  .si.ind { background: #eef2ff; } .si.cyn { background: #ecfeff; }
  .si.amb { background: #fffbeb; } .si.ros { background: #fff1f2; }
  .si.vio { background: #f5f3ff; } .si.grn { background: #f0fdf4; }
  .si.teal { background: #f0fdfa; }
  .st { font-size: 0.93rem; font-weight: 700; color: #1e293b; }

  .fr { display: flex; gap: 0.9rem; flex-wrap: wrap; margin-bottom: 0.85rem; }
  .fr:last-child { margin-bottom: 0; }
  .fi { display: flex; flex-direction: column; gap: 0.28rem; flex: 1; min-width: 138px; }
  .fl { font-size: 0.7rem; font-weight: 700; color: #8b88b0; letter-spacing: 0.55px; text-transform: uppercase; }
  .in { padding: 0.65rem 0.875rem; background: #f0ece6; border: 1.5px solid #d8d4e3;
    border-radius: 9px; font-family: inherit; font-size: 0.875rem; color: #1e293b;
    outline: none; width: 100%; transition: all 0.18s; }
  .in:focus { border-color: #0d6e6e; background: #fff; box-shadow: 0 0 0 3px rgba(13,110,110,0.13); }
  .in:disabled { background: #ece9f5; color: #a0aec0; cursor: not-allowed; }
  .in.err { border-color: #ef4444 !important; background: #fff8f8 !important; box-shadow: 0 0 0 3px rgba(239,68,68,0.10) !important; }
  .err-msg { font-size: 0.68rem; color: #ef4444; font-weight: 600; margin-top: 0.2rem; display: block; }
  .fe { font-size: 0.7rem; color: #ef4444; margin-top: 2px; font-weight: 500; }

  .date-input { padding: 0.65rem 0.875rem; background: #f0ece6; border: 1.5px solid #d8d4e3;
    border-radius: 9px; font-family: inherit; font-size: 0.875rem; color: #1e293b;
    outline: none; width: 100%; cursor: pointer; transition: all 0.18s; }
  .date-input:focus { border-color: #0d6e6e; background: #fff; box-shadow: 0 0 0 3px rgba(13,110,110,0.13); }
  .date-input::placeholder { color: #d8d4e3; }
  .date-input.err { border-color: #ef4444 !important; background: #fff8f8 !important; }
  .date-display { margin-top: 0.22rem; font-size: 0.72rem; color: #0d6e6e; font-weight: 600; letter-spacing: 0.2px; }

  .photo-wrap { width: 90px; height: 90px; border-radius: 50%; background: #eef2ff;
    border: 2.5px solid #c7d2fe; display: flex; align-items: center;
    justify-content: center; overflow: hidden; flex-shrink: 0; }
  .photo-wrap img { width: 100%; height: 100%; object-fit: cover; }

  .sbar { display: flex; justify-content: space-between; align-items: center;
    margin-top: 1.5rem; padding: 1rem 1.5rem; background: #111;
    border-radius: 12px; box-shadow: 0 6px 28px rgba(30,26,62,0.22); border: 1px solid rgba(255,255,255,0.85); }
  .ss { font-size: 0.84rem; color: #8b92a8; font-weight: 500; }
  .ss.ok { color: #16a34a; } .ss.err { color: #ef4444; }
  .pbtn { padding: 0.72rem 1.9rem; background: #0d6e6e; color: #fff; border: none;
    border-radius: 10px; font-family: inherit; font-size: 0.875rem; font-weight: 700;
    cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(13,110,110,0.28); }
  .pbtn:hover { background: #0f8a8a; transform: translateY(-1px); }
  .sbtn { padding: 0.72rem 1.5rem; background: transparent; color: #8b92a8; border: 1.5px solid #2a2535;
    border-radius: 10px; font-family: inherit; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .sbtn:hover { background: #f0ece6; }

  .bank-note { font-size: 0.72rem; color: #0d9488; background: #f0fdfa; border: 1px solid #99f6e4;
    border-radius: 8px; padding: 0.5rem 0.75rem; margin-bottom: 0.85rem; font-weight: 500; line-height: 1.5; }

  /* Digit counter for bank account */
  .digit-counter { font-size: 0.68rem; margin-top: 0.22rem; font-weight: 600; }
  .digit-counter.ok { color: #16a34a; }
  .digit-counter.typing { color: #8b88b0; }
  .digit-counter.match { color: #16a34a; }
  .digit-counter.mismatch { color: #ef4444; }

  .cmsg { padding: 0.6rem 0.875rem; background: #f0ece6; border: 1.5px solid #d8d4e3;
    border-radius: 9px; font-family: inherit; font-size: 0.84rem; color: #1e293b;
    outline: none; width: 100%; resize: vertical; min-height: 72px; transition: all 0.18s; }
  .cmsg:focus { border-color: #0d6e6e; background: #fff; box-shadow: 0 0 0 3px rgba(13,110,110,0.13); }

  @media (max-width: 640px) {
    .fr { flex-direction: column; } .fi { min-width: 100%; }
    .topbar { flex-direction: column; gap: 0.6rem; align-items: flex-start; position: relative; }
  }
`;

// ── DateField: no calendar, DD/MM/YYYY, shows month name below ──
function DateField({ l, v, s, r = true }) {
  const [raw, setRaw] = useState(() => {
    if (v && v.includes("-")) { const [y, mo, d] = v.split("-"); return `${d}/${mo}/${y}`; }
    return v || "";
  });
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) {
      if (v && v.includes("-")) { const [y, mo, d] = v.split("-"); setRaw(`${d}/${mo}/${y}`); }
      else setRaw(v || "");
    }
  }, [v, focused]);
  const handleChange = (e) => {
    let val = e.target.value.replace(/[^0-9/]/g, "");
    if (val.length === 2 && raw.length === 1) val = val + "/";
    if (val.length === 5 && raw.length === 4) val = val + "/";
    if (val.length > 10) return;
    // Validate day and month as user types
    const parts = val.split("/");
    if (parts[0] && parts[0].length === 2) {
      const day = parseInt(parts[0], 10);
      if (day < 1 || day > 31) return;
    }
    if (parts[1] && parts[1].length === 2) {
      const month = parseInt(parts[1], 10);
      if (month < 1 || month > 12) return;
    }
    setRaw(val);
    if (val.length === 10) {
      const [d, mo, y] = val.split("/");
      if (d && mo && y && y.length === 4) s(`${y}-${mo}-${d}`);
    } else { s(""); }
  };
  const getDisplayValue = () => {
    if (focused) return raw;
    if (v && v.includes("-")) {
      const [y, mo, d] = v.split("-");
      const idx = parseInt(mo, 10) - 1;
      const mName = MONTH_NAMES[idx];
      if (mName) return `${parseInt(d, 10)} ${mName} ${y}`;
    }
    return raw;
  };
  return (
    <div className="fi">
      <span className="fl">{l}{r && <span style={{color:"#ef4444",marginLeft:2}}>*</span>}</span>
      <input
        className="date-input"
        value={getDisplayValue()}
        placeholder="DD/MM/YYYY"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={handleChange}
        maxLength={20}
        inputMode="numeric"
        autoComplete="off"
      />
    </div>
  );
}

function ConsentBell({ apiFetch, router }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch(`${API}/consent/my`);
        if (res.ok) {
          const data = await res.json();
          setCount(data.filter(c => String(c.status || "pending").toLowerCase() === "pending").length);
        }
      } catch (_) {}
    };
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [apiFetch]);
  return (
    <button className="bell-btn" onClick={() => router.push("/employee/personal?tab=consents")} title="Consent Requests">
      🔔
      {count > 0 && <span className="bell-badge">{count}</span>}
    </button>
  );
}

function SignoutModal({ onConfirm, onCancel, onSignOutAll }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,12,40,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(3px)"}}>
      <div style={{background:"#fff",borderRadius:18,padding:"2rem",maxWidth:340,width:"90%",textAlign:"center",boxShadow:"0 24px 60px rgba(15,12,40,0.3)"}}>
        <div style={{fontSize:34,marginBottom:"0.75rem"}}>👋</div>
        <h3 style={{margin:"0 0 0.4rem",color:"#1a1730",fontWeight:800,fontSize:"1.05rem"}}>Sign out?</h3>
        <p style={{color:"#6b6894",fontSize:"0.875rem",marginBottom:"1.5rem",lineHeight:1.55}}>Your progress is saved. You can continue anytime.</p>
        <div style={{display:"flex",gap:"0.75rem"}}>
          <button onClick={onCancel} style={{flex:1,padding:"0.7rem",borderRadius:9,border:"1.5px solid #dddaf0",background:"inherit",cursor:"pointer",fontWeight:600,color:"#6b6894",fontFamily:"inherit",fontSize:"0.875rem"}}>Stay</button>
          <button onClick={onConfirm} style={{flex:1,padding:"0.7rem",borderRadius:9,border:"none",background:"#ef4444",color:"#fff",cursor:"pointer",fontWeight:700,fontFamily:"inherit",fontSize:"0.875rem"}}>Sign out</button>
        </div>
        <button onClick={onSignOutAll} style={{marginTop:"0.9rem",background:"none",border:"none",color:"#6b6894",fontSize:"0.78rem",fontWeight:600,textDecoration:"underline",cursor:"pointer",fontFamily:"inherit"}}>Sign out from all devices</button>
      </div>
    </div>
  );
}

function StepNav({ current, onNavigate }) {
  const steps = [
    { n:1, label:"Personal",   icon:"👤", path:"/employee/personal"  },
    { n:2, label:"Education",  icon:"🎓", path:"/employee/education" },
    { n:3, label:"Employment", icon:"💼", path:"/employee/previous"  },
    { n:4, label:"UAN",        icon:"🏦", path:"/employee/uan"       },
    { n:5, label:"Review",     icon:"📋", path:"/employee/review"    },
  ];
  return (
    <div style={{background:"#fff",borderRadius:14,padding:"1.1rem 0.5rem",marginBottom:"1.6rem",display:"flex",alignItems:"center",justifyContent:"center",overflowX:"auto",boxShadow:"0 6px 28px rgba(30,26,62,0.22), 0 2px 8px rgba(30,26,62,0.12)"}}>
      {steps.map((s, i) => {
        const isDone = current > s.n, isActive = current === s.n;
        const col = ACCENTS[s.n];
        return (
          <div key={s.n} style={{display:"flex",alignItems:"center"}}>
            <button onClick={() => onNavigate(s.path)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.3rem",background:"none",border:"none",cursor:"pointer",padding:"0.2rem 0.75rem"}}>
              <div style={{width:40,height:40,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",transition:"all 0.25s",
                background:isActive?col:isDone?STEP_DONE_BG:"#f2f1f9",
                border:isActive?`2px solid ${col}`:isDone?`2px solid ${STEP_CONN}`:"2px solid #e4e2ed",
                boxShadow:isActive?`0 4px 12px ${col}55`:"none"}}>
                {isDone
                  ? <span style={{color:STEP_DONE_CK,fontWeight:800,fontSize:"0.9rem"}}>✓</span>
                  : <span style={{fontSize:"1rem",filter:isActive?"brightness(0) invert(1)":"none"}}>{s.icon}</span>}
              </div>
              <span style={{fontSize:"0.67rem",fontWeight:700,letterSpacing:"0.6px",textTransform:"uppercase",whiteSpace:"nowrap",
                color:isActive?col:isDone?STEP_DONE_CK:"#8b88b0"}}>{s.label}</span>
            </button>
            {i < steps.length - 1 && (
              <div style={{width:38,height:2,background:current>s.n?STEP_CONN:"#ccc9e4",margin:"0 -0.25rem",marginBottom:"1.4rem",borderRadius:2,flexShrink:0}}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ConsentTab({ apiFetch, profileStatus }) {
  const router = useRouter();
  const [consents,setConsents]=useState([]);
  const [fieldChanges,setFieldChanges]=useState([]);
  const [expandedActivity,setExpandedActivity]=useState(()=>new Set());
  const [loading,setLoading]=useState(true);
  const [acting,setActing]=useState(null);
  const [actionError,setActionError]=useState({});
  const [replyMsg,setReplyMsg]=useState({});
  const textareaFocused=useRef(false);
  const load=useCallback(async()=>{
    // Skip background poll while user is typing — prevents textarea remount mid-input
    if(textareaFocused.current)return;
    try{const res=await apiFetch(`${API}/consent/my`);if(res.ok)setConsents(await res.json());}catch(_){}
    try{const res2=await apiFetch(`${API}/employee/activity-log`);if(res2.ok)setFieldChanges(await res2.json());}catch(_){}
    setLoading(false);
  },[apiFetch]);
  useEffect(()=>{load();},[load]);
  useEffect(()=>{const id=setInterval(load,15000);return()=>clearInterval(id);},[load]);
  const respond=async(consentId,decision)=>{
    setActing(consentId);setActionError(p=>({...p,[consentId]:""}));
    try{
      const res=await apiFetch(`${API}/consent/respond`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({consent_id:consentId,status:decision==="approved"?"APPROVED":"DECLINED",responded_at:Date.now(),reply_message:replyMsg[consentId]||""})});
      if(res.ok){await load();}else{const errData=await res.json().catch(()=>({}));setActionError(p=>({...p,[consentId]:errData.detail||errData.message||`Error ${res.status}`}));}
    }catch(e){setActionError(p=>({...p,[consentId]:"Network error — please retry"}));}
    setActing(null);
  };
  const withdraw=async(consentId)=>{
    setActing(consentId);setActionError(p=>({...p,[consentId]:""}));
    try{
      const res=await apiFetch(`${API}/consent/withdraw`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({consent_id:consentId})});
      if(res.ok){await load();}else{const errData=await res.json().catch(()=>({}));setActionError(p=>({...p,[consentId]:errData.detail||errData.message||`Error ${res.status}`}));}
    }catch(e){setActionError(p=>({...p,[consentId]:"Network error — please retry"}));}
    setActing(null);
  };
  const norm=(c)=>({...c,status:String(c.status||"pending").toLowerCase()});

  // ── ALL hooks must be before any early return (React rules) ──────
  const [cInnerTab, setCInnerTab] = useState("pending");
  const [cPage,     setCPage]     = useState(1);
  const PER_PAGE = 5;
  const switchInnerTab = (tab) => { setCInnerTab(tab); setCPage(1); };

  const tabMap = {
    pending:  { list: [], label: "Pending",   color: "#f59e0b", bg: "#fffbeb", icon: "⏳" },
    approved: { list: [], label: "Approved",  color: "#16a34a", bg: "#f0fdf4", icon: "✅" },
    declined: { list: [], label: "Declined",  color: "#ef4444", bg: "#fff5f5", icon: "❌" },
    revoked:  { list: [], label: "Withdrawn", color: "#94a3b8", bg: "#f8fafc", icon: "↩" },
    activity: { list: [], label: "Activity",  color: "#0d6e6e", bg: "#eef2ff", icon: "📋" },
  };

  if(loading)return <p style={{color:"#8b88b0",padding:"1rem 0",fontSize:"0.875rem"}}>Loading consents…</p>;
  if(!consents.length)return(<div style={{textAlign:"center",padding:"3rem",background:"#fff",borderRadius:14,boxShadow:"0 6px 28px rgba(30,26,62,0.22)"}}>
    <div style={{fontSize:38,marginBottom:10}}>📋</div>
    <p style={{color:"#1a1730",margin:0,fontWeight:700}}>No consent requests yet</p>
    <p style={{fontSize:"0.82rem",color:"#8b88b0",marginTop:6}}>Employers will appear here when they request your data</p>
  </div>);
  const all=consents.map(norm);
  const pending=all.filter(c=>c.status==="pending");const approved=all.filter(c=>c.status==="approved");
  const declined=all.filter(c=>c.status==="declined");const revoked=all.filter(c=>c.status==="revoked");
  const sColor={pending:"#f59e0b",approved:"#16a34a",declined:"#ef4444",revoked:"#94a3b8"};
  const sBg={pending:"#fffbeb",approved:"#f0fdf4",declined:"#fff5f5",revoked:"#f8fafc"};
  const profileNotSubmitted=profileStatus!=="submitted";

  // Now populate tabMap lists with real data
  tabMap.pending.list  = pending;
  tabMap.approved.list = approved;
  tabMap.declined.list = declined;
  tabMap.revoked.list  = revoked;

  const renderCC=(c)=>(<div style={{border:"1px solid #ebe9f5",borderRadius:12,padding:"1.1rem 1.25rem",marginBottom:"0.65rem",background:"#fff",boxShadow:"0 1px 5px rgba(13,110,110,0.05)"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
      <div style={{flex:1}}>
        <div style={{fontWeight:700,color:"#1a1730",fontSize:"0.93rem"}}>{c.requestor_name||c.employer_name||c.requestor_email||c.employer_email}</div>
        {c.message&&<div style={{marginTop:"0.5rem",padding:"0.5rem 0.75rem",background:"#f5f3ff",border:"1px solid #ddd6fe",borderRadius:8}}>
          <div style={{fontSize:"0.67rem",fontWeight:700,color:"#0d6e6e",textTransform:"uppercase",letterSpacing:0.5,marginBottom:3}}>Message</div>
          <div style={{fontSize:"0.84rem",color:"#6b6894",lineHeight:1.5}}>{c.message}</div>
        </div>}
      </div>
      <span style={{padding:"0.18rem 0.7rem",borderRadius:999,fontSize:"0.7rem",fontWeight:700,color:sColor[c.status]||"#64748b",background:sBg[c.status]||"#f8fafc",whiteSpace:"nowrap",marginLeft:"0.75rem",border:`1px solid ${(sColor[c.status]||"#94a3b8")}33`}}>{c.status.charAt(0).toUpperCase()+c.status.slice(1)}</span>
    </div>
    {actionError[c.consent_id]&&(
      <p style={{fontSize:"0.75rem",color:"#ef4444",marginTop:"0.5rem",fontWeight:600}}>
        ⚠️ {actionError[c.consent_id]}
        {actionError[c.consent_id].includes("Review page")&&(
          <button onClick={()=>router.push("/employee/review")} style={{marginLeft:"0.5rem",padding:"0.2rem 0.6rem",background:"#0d6e6e",color:"#fff",border:"none",borderRadius:6,fontSize:"0.7rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Go to Review →</button>
        )}
      </p>
    )}
    {c.status==="pending"&&(<div style={{marginTop:"0.8rem"}}>
      {profileNotSubmitted&&<div style={{fontSize:"0.75rem",color:"#92400e",background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8,padding:"0.5rem 0.75rem",marginBottom:"0.6rem"}}>⚠️ Complete and submit your profile before approving consent requests.</div>}
      <textarea className="cmsg" placeholder="Optional message to employer…" value={replyMsg[c.consent_id]||""} onFocus={()=>{textareaFocused.current=true;}} onBlur={()=>{textareaFocused.current=false;}} onChange={e=>{const val=e.target.value;setReplyMsg(p=>({...p,[c.consent_id]:val}));}} style={{marginBottom:"0.5rem"}}/>
      <div style={{display:"flex",gap:"0.5rem"}}>
        <button disabled={acting===c.consent_id||profileNotSubmitted} onClick={()=>respond(c.consent_id,"approved")} style={{flex:1,padding:"0.5rem",background:profileNotSubmitted?"#e5e7eb":"#16a34a",color:profileNotSubmitted?"#8b92a8":"#fff",border:"none",borderRadius:8,fontWeight:700,cursor:(acting===c.consent_id||profileNotSubmitted)?"not-allowed":"pointer",fontSize:"0.875rem",fontFamily:"inherit",opacity:acting===c.consent_id?0.7:1}}>{acting===c.consent_id?"…":"Approve"}</button>
        <button disabled={acting===c.consent_id} onClick={()=>respond(c.consent_id,"declined")} style={{flex:1,padding:"0.5rem",background:"#fff5f5",color:"#ef4444",border:"1.5px solid #fecaca",borderRadius:8,fontWeight:700,cursor:acting===c.consent_id?"not-allowed":"pointer",fontSize:"0.875rem",fontFamily:"inherit",opacity:acting===c.consent_id?0.7:1}}>{acting===c.consent_id?"…":"Decline"}</button>
      </div>
    </div>)}
    {c.status==="approved"&&(<div style={{marginTop:"0.8rem"}}>
      <button disabled={acting===c.consent_id} onClick={()=>withdraw(c.consent_id)} style={{padding:"0.45rem 1rem",background:"#fff5f5",color:"#ef4444",border:"1.5px solid #fecaca",borderRadius:8,fontWeight:600,cursor:acting===c.consent_id?"not-allowed":"pointer",fontSize:"0.8rem",fontFamily:"inherit",opacity:acting===c.consent_id?0.7:1}}>{acting===c.consent_id?"…":"Withdraw consent"}</button>
      <span style={{fontSize:"0.7rem",color:"#94a3b8",marginLeft:"0.6rem"}}>Employer will immediately lose access</span>
    </div>)}
    {c.bgv_status&&(<div style={{marginTop:"0.75rem",padding:"0.6rem 0.9rem",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:9}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"0.4rem"}}>
        <span style={{fontSize:"0.7rem",fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.5px"}}>BGV Status</span>
        <span style={{padding:"0.18rem 0.65rem",borderRadius:999,fontSize:"0.7rem",fontWeight:700,
          color:c.bgv_status==="completed"?"#16a34a":c.bgv_status==="on_hold"?"#dc2626":c.bgv_status==="in_progress"?"#d97706":"#6366f1",
          background:c.bgv_status==="completed"?"#f0fdf4":c.bgv_status==="on_hold"?"#fef2f2":c.bgv_status==="in_progress"?"#fffbeb":"#eef2ff",
        }}>
          {c.bgv_status==="groomed"?"Assigned":c.bgv_status==="in_progress"?"In Progress":c.bgv_status==="on_hold"?"⚠️ On Hold — Action needed":c.bgv_status==="completed"?"Completed":c.bgv_status}
        </span>
      </div>
      {c.bgv_result_flag&&(<div style={{marginTop:"0.4rem",display:"flex",alignItems:"center",gap:"0.4rem"}}>
        <span style={{fontSize:"0.7rem",fontWeight:700,color:"#64748b"}}>Result:</span>
        <span style={{padding:"0.15rem 0.6rem",borderRadius:999,fontSize:"0.7rem",fontWeight:800,
          color:c.bgv_result_flag==="green"?"#16a34a":c.bgv_result_flag==="red"?"#dc2626":"#d97706",
          background:c.bgv_result_flag==="green"?"#f0fdf4":c.bgv_result_flag==="red"?"#fef2f2":"#fffbeb",
        }}>
          {c.bgv_result_flag==="green"?"✓ Clear":c.bgv_result_flag==="red"?"✗ Discrepancy found":"⚠ Minor issues"}
        </span>
      </div>)}
      {c.bgv_status==="on_hold"&&(<div style={{marginTop:"0.4rem",fontSize:"0.72rem",color:"#dc2626",fontWeight:600}}>
        Your BGV is on hold. Check your inbox — the BGV team has requested additional information.
      </div>)}
    </div>)}
  </div>);
  const toIST=(ts)=>{
    if(!ts) return {date:"—", time:""};
    try{
      const d = new Date(typeof ts==="number"&&ts<1e12?ts*1000:ts);
      const date = d.toLocaleDateString("en-IN",{timeZone:"Asia/Kolkata",day:"2-digit",month:"short",year:"numeric"});
      const time = d.toLocaleTimeString("en-IN",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",hour12:true});
      return {date, time};
    }catch{return {date:"—", time:""};}
  };

  // ── tabMap lists already populated above ──────────────────────────

  const auditEvents = [
    ...fieldChanges.map((e,idx)=>({
      kind: "field_change",
      employer: e.field_label || e.field_name,
      action: "Changed",
      time: e.changed_at,
      color: "#6366f1",
      consent_id: null,
      old_value: e.old_value,
      new_value: e.new_value,
      _key: `fc-${e.changed_at}-${idx}`,
    })),
  ].sort((a,b)=>(b.time||0)-(a.time||0));

  const activeList   = cInnerTab === "activity" ? auditEvents : (tabMap[cInnerTab]?.list || []);
  const totalPages   = Math.max(1, Math.ceil(activeList.length / PER_PAGE));
  const pagedList    = activeList.slice((cPage - 1) * PER_PAGE, cPage * PER_PAGE);

  // Summary strip counts
  const summaryCounts = { pending: pending.length, approved: approved.length, declined: declined.length, revoked: revoked.length };

  return (
    <div>
      {/* ── Summary strip ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"0.55rem",marginBottom:"1rem"}}>
        {[["pending","⏳","Pending","#f59e0b","#fffbeb"],["approved","✅","Approved","#16a34a","#f0fdf4"],["declined","❌","Declined","#ef4444","#fff5f5"],["revoked","↩","Withdrawn","#94a3b8","#f8fafc"]].map(([key,icon,label,col,bg])=>(
          <button key={key} onClick={()=>switchInnerTab(key)}
            style={{padding:"0.65rem 0.5rem",background:cInnerTab===key?bg:"#fff",border:`1.5px solid ${cInnerTab===key?col:"#ebe9f5"}`,borderRadius:10,cursor:"pointer",textAlign:"center",transition:"all 0.15s",fontFamily:"inherit",boxShadow:cInnerTab===key?`0 2px 8px ${col}22`:"none"}}>
            <div style={{fontSize:"1.1rem",marginBottom:2}}>{icon}</div>
            <div style={{fontSize:"1.1rem",fontWeight:800,color:cInnerTab===key?col:"#1a1730"}}>{summaryCounts[key]}</div>
            <div style={{fontSize:"0.6rem",fontWeight:700,color:cInnerTab===key?col:"#8b88b0",textTransform:"uppercase",letterSpacing:0.5}}>{label}</div>
          </button>
        ))}
      </div>

      {/* ── Inner tab bar ── */}
      <div style={{display:"flex",borderBottom:"2px solid #ebe9f5",marginBottom:"1rem",gap:"0",overflowX:"auto"}}>
        {Object.entries(tabMap).map(([key,{label,color,icon}])=>{
          const count = key==="activity" ? auditEvents.length : (tabMap[key]?.list?.length||0);
          const isOn  = cInnerTab===key;
          return (
            <button key={key} onClick={()=>switchInnerTab(key)}
              style={{padding:"0.5rem 0.9rem",background:"none",border:"none",borderBottom:`2.5px solid ${isOn?color:"transparent"}`,marginBottom:-2,cursor:"pointer",fontFamily:"inherit",fontSize:"0.72rem",fontWeight:700,color:isOn?color:"#94a3b8",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:"0.3rem",transition:"all 0.12s"}}>
              {icon} {label}
              {count>0&&<span style={{background:isOn?color:"#e4e2ed",color:isOn?"#fff":"#6b6894",fontSize:"0.6rem",fontWeight:800,padding:"1px 6px",borderRadius:999,marginLeft:2}}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* ── Content area ── */}
      {cInnerTab !== "activity" ? (
        pagedList.length === 0 ? (
          <div style={{textAlign:"center",padding:"2.5rem 1rem",background:"#fff",borderRadius:12,border:"1px solid #ebe9f5"}}>
            <div style={{fontSize:32,marginBottom:8,opacity:0.35}}>{tabMap[cInnerTab]?.icon}</div>
            <div style={{fontSize:"0.84rem",color:"#8b88b0",fontWeight:500}}>No {tabMap[cInnerTab]?.label.toLowerCase()} requests</div>
          </div>
        ) : (
          pagedList.map(c => <div key={c.consent_id}>{renderCC(c)}</div>)
        )
      ) : (
        /* Activity log tab */
        pagedList.length === 0 ? (
          <div style={{textAlign:"center",padding:"2.5rem 1rem",background:"#fff",borderRadius:12,border:"1px solid #ebe9f5"}}>
            <div style={{fontSize:"0.84rem",color:"#8b88b0",fontWeight:500}}>No activity yet</div>
          </div>
        ) : (
          <div style={{background:"#fff",border:"1px solid #ebe9f5",borderRadius:12,padding:"0.75rem 1rem"}}>
            {pagedList.map((ev,i)=>{
              const rowKey = ev._key || `${ev.kind}-${ev.consent_id||""}-${ev.time}-${i}`;
              const isFieldChange = ev.kind==="field_change";
              const isExpanded = expandedActivity.has(rowKey);
              return (
              <div key={rowKey} style={{padding:"0.55rem 0",borderBottom:i<pagedList.length-1?"1px solid #f5f3ff":"none"}}>
                <div
                  style={{display:"flex",alignItems:"flex-start",gap:"0.65rem",cursor:isFieldChange?"pointer":"default"}}
                  onClick={()=>{
                    if(!isFieldChange)return;
                    setExpandedActivity(prev=>{const n=new Set(prev);n.has(rowKey)?n.delete(rowKey):n.add(rowKey);return n;});
                  }}
                >
                  <div style={{width:8,height:8,borderRadius:"50%",background:ev.color,flexShrink:0,marginTop:6}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:"0.78rem",color:"#1a1730",fontWeight:600,display:"flex",alignItems:"center",gap:"0.4rem"}}>
                      {isFieldChange?"✏️ ":""}{ev.employer}
                      {isFieldChange&&<span style={{fontSize:"0.65rem",color:"#c4bfdb",marginLeft:"auto"}}>{isExpanded?"▲":"▼"}</span>}
                    </div>
                    <div style={{fontSize:"0.71rem",color:"#8b88b0",marginTop:1}}>{ev.action}</div>
                    <div style={{fontSize:"0.71rem",color:"#8b88b0",marginTop:1}}>{toIST(ev.time).date}</div>
                    <div style={{fontSize:"0.71rem",color:"#8b88b0"}}>{toIST(ev.time).time}</div>
                  </div>
                </div>
                {isFieldChange&&isExpanded&&(
                  <div style={{marginTop:"0.5rem",marginLeft:"1.15rem",padding:"0.55rem 0.7rem",background:"#f8f7ff",borderRadius:8,fontSize:"0.72rem"}}>
                    <div style={{color:"#94a3b8",marginBottom:"0.2rem"}}>Previous value</div>
                    <div style={{color:"#1a1730",fontWeight:600,marginBottom:"0.5rem"}}>{ev.old_value||"—"}</div>
                    <div style={{color:"#94a3b8",marginBottom:"0.2rem"}}>New value</div>
                    <div style={{color:"#16a34a",fontWeight:600}}>{ev.new_value||"—"}</div>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"0.4rem",marginTop:"1rem"}}>
          <button onClick={()=>setCPage(p=>Math.max(1,p-1))} disabled={cPage===1}
            style={{padding:"0.35rem 0.75rem",borderRadius:7,border:"1.5px solid #e4e2ed",background:"#fff",cursor:cPage===1?"not-allowed":"pointer",fontSize:"0.75rem",fontWeight:600,color:cPage===1?"#c4bfdb":"#0d6e6e",fontFamily:"inherit"}}>← Prev</button>
          {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
            <button key={p} onClick={()=>setCPage(p)}
              style={{width:30,height:30,borderRadius:7,border:`1.5px solid ${cPage===p?"#0d6e6e":"#e4e2ed"}`,background:cPage===p?"#0d6e6e":"#fff",cursor:"pointer",fontSize:"0.75rem",fontWeight:700,color:cPage===p?"#fff":"#6b6894",fontFamily:"inherit"}}>
              {p}
            </button>
          ))}
          <button onClick={()=>setCPage(p=>Math.min(totalPages,p+1))} disabled={cPage===totalPages}
            style={{padding:"0.35rem 0.75rem",borderRadius:7,border:"1.5px solid #e4e2ed",background:"#fff",cursor:cPage===totalPages?"not-allowed":"pointer",fontSize:"0.75rem",fontWeight:600,color:cPage===totalPages?"#c4bfdb":"#0d6e6e",fontFamily:"inherit"}}>Next →</button>
        </div>
      )}
    </div>
  );
}

function F({ l, v, s, t = "text", r = true }) {
  return (
    <div className="fi">
      <span className="fl">{l}{r && <span style={{color:"#ef4444",marginLeft:2}}>*</span>}</span>
      <input className="in" type={t} value={v || ""} onChange={e => s(e.target.value)} />
    </div>
  );
}
function FS({ l, v, s, o, r = true }) {
  return (
    <div className="fi">
      <span className="fl">{l}{r && <span style={{color:"#ef4444",marginLeft:2}}>*</span>}</span>
      <select className="in" value={v} onChange={e => s(e.target.value)} style={{background:"inherit",color:v?"#1a1730":"#8b88b0",appearance:"auto"}}>
        <option value="">Select</option>
        {o.map(x => <option key={x} value={x}>{x}</option>)}
      </select>
    </div>
  );
}


function DeleteAccountModal({ onConfirm, onCancel, loading }) {
  const [typed, setTyped] = useState("");
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,12,40,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,backdropFilter:"blur(4px)"}}>
      <div style={{background:"#fff",borderRadius:18,padding:"2rem",maxWidth:400,width:"90%",boxShadow:"0 24px 60px rgba(15,12,40,0.3)"}}>
        <div style={{fontSize:34,marginBottom:"0.75rem",textAlign:"center"}}>⚠️</div>
        <h3 style={{margin:"0 0 0.5rem",color:"#1a1730",fontWeight:800,fontSize:"1.05rem",textAlign:"center"}}>Delete your account?</h3>
        <p style={{color:"#6b6894",fontSize:"0.84rem",marginBottom:"1rem",lineHeight:1.6,textAlign:"center"}}>This permanently deletes your profile, all documents, and consent history. <strong>This cannot be undone.</strong></p>
        <p style={{fontSize:"0.78rem",color:"#6b6894",marginBottom:"0.4rem",fontWeight:600}}>Type <strong>DELETE</strong> to confirm:</p>
        <input
          style={{width:"100%",padding:"0.65rem 0.875rem",background:"#fff8f8",border:"1.5px solid #fecaca",borderRadius:9,fontFamily:"inherit",fontSize:"0.875rem",color:"#1a1730",outline:"none",marginBottom:"1rem",letterSpacing:"0.05em"}}
          value={typed} onChange={e=>setTyped(e.target.value.toUpperCase())} placeholder="Type DELETE here"
        />
        <div style={{display:"flex",gap:"0.75rem"}}>
          <button onClick={onCancel} style={{flex:1,padding:"0.7rem",borderRadius:9,border:"1.5px solid #dddaf0",background:"#f7f6fd",cursor:"pointer",fontWeight:600,color:"#6b6894",fontFamily:"inherit",fontSize:"0.875rem"}}>Cancel</button>
          <button onClick={onConfirm} disabled={typed!=="DELETE"||loading} style={{flex:1,padding:"0.7rem",borderRadius:9,border:"none",background:typed==="DELETE"?"#ef4444":"#fecaca",color:"#fff",cursor:typed==="DELETE"&&!loading?"pointer":"not-allowed",fontWeight:700,fontFamily:"inherit",fontSize:"0.875rem",transition:"background 0.15s"}}>{loading?"Deleting…":"Delete forever"}</button>
        </div>
      </div>
    </div>
  );
}


function SupportModal({ apiFetch, onClose }) {
  const CATS = ["account","consent","document","bgv","billing","other"];
  const [tab,     setTab]     = React.useState("new");   // "new" | "tickets"
  const [cat,     setCat]     = React.useState("account");
  const [subject, setSubject] = React.useState("");
  const [body,    setBody]    = React.useState("");
  const [busy,    setBusy]    = React.useState(false);
  const [ok,      setOk]      = React.useState("");
  const [err,     setErr]     = React.useState("");
  const [tickets, setTickets] = React.useState([]);
  const [expandedTicket, setExpandedTicket] = React.useState("");
  const [tLoading,setTLoading]= React.useState(false);
  const [attachmentKey, setAttachmentKey] = React.useState("");
  const [attachmentName, setAttachmentName] = React.useState("");
  const [uploadingAtt, setUploadingAtt] = React.useState(false);
  const [attErr, setAttErr] = React.useState("");

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
                      <div key={i} style={{background:"#f0fdf4",borderRadius:8,padding:"0.6rem 0.75rem",marginBottom:"0.5rem"}}>
                        <div style={{fontSize:"0.65rem",fontWeight:700,color:"#16a34a",marginBottom:"0.25rem"}}>Datagate Support — {new Date(r.at).toLocaleString("en-IN",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
                        <div style={{fontSize:"0.8rem",color:"#1a1730",whiteSpace:"pre-wrap"}}>{r.body}</div>
                        {r.attachment_url && <a href={r.attachment_url} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",marginTop:"0.4rem",fontSize:"0.72rem",color:"#16a34a",fontWeight:700,textDecoration:"none"}}>📎 View attachment</a>}
                      </div>
                    ))}
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

export default function PersonalDetails() {
  const router = useRouter();
  const { user, apiFetch, logout, ready } = useAuth();
  const [activeTab,setActiveTab]         = useState("profile");
  const [showSignout,setShowSignout]     = useState(false);
  const [showSupport,setShowSupport]     = useState(false);
  const [showGear,   setShowGear]        = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [myPrintHtml, setMyPrintHtml] = useState(null);
  const [showDeleteModal,setShowDeleteModal] = useState(false);
  const [deleteLoading,setDeleteLoading]     = useState(false);
  const [showPwChange,  setShowPwChange]    = useState(false);
  const [pwCurrent,     setPwCurrent]       = useState("");
  const [pwNew,         setPwNew]           = useState("");
  const [pwConfirm,     setPwConfirm]       = useState("");
  const [pwErr,         setPwErr]           = useState("");
  const [pwOk,          setPwOk]            = useState("");
  const [pwBusy,        setPwBusy]          = useState(false);
  const [freshnessWarn, setFreshnessWarn]   = useState(false);
  const [inboxThreads,  setInboxThreads]   = useState([]);
  const [activeThread,  setActiveThread]   = useState(null);
  const [threadMsgs,    setThreadMsgs]     = useState([]);
  const [threadSegments, setThreadSegments] = useState({});
  const msgListRef      = useRef(null);
  useEffect(() => {
    if (msgListRef.current) msgListRef.current.scrollTop = msgListRef.current.scrollHeight;
  }, [threadMsgs]);
  const [threadLoading, setThreadLoading]  = useState(false);
  const [msgBody,       setMsgBody]        = useState("");
  const [msgSending,    setMsgSending]     = useState(false);
  const [msgErr,        setMsgErr]         = useState("");
  const [msgAttach,     setMsgAttach]      = useState(null);
  const [msgAttaching,  setMsgAttaching]   = useState(false);
  const [msgAttachUrls, setMsgAttachUrls]  = useState({});
  const [inboxLoading,  setInboxLoading]   = useState(false);
  const [inboxSearch,   setInboxSearch]    = useState("");
  const [inboxUnread,   setInboxUnread]    = useState(0);
  const [completeness,  setCompleteness]    = useState(null); // 0-100 or null=loading
  const [saveStatus,setSaveStatus]       = useState("");
  const [midSaveStatus,setMidSaveStatus] = useState("");
  const [loading,setLoading]             = useState(true);
  const [employeeId,setEmployeeId]       = useState("");
  const [draftReady,setDraftReady]       = useState(false);
  const employeeIdRef                    = useRef("");
  const [profileStatus,setProfileStatus] = useState("");
  const [photoPreview,setPhotoPreview]   = useState(null);
  const [errors,setErrors]               = useState({});
  const isDirtyRef = useRef(false);
  // page1_edited: set when user makes any change; saves to DB so page 5 re-asks acks
  const wasEditedRef = useRef(false);
  const fixErr = (key) => setErrors(p => ({ ...p, [key]: false }));

  useEffect(() => {
    if (router.query.tab === "consents") setActiveTab("consents");
    if (router.query.tab === "inbox")    setActiveTab("inbox");
  }, [router.query.tab]);

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
      if (r.ok) {
        const d = await r.json();
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
    setThreadLoading(false);
    apiFetch(`${API}/messages/unread-count`).then(r=>r.ok?r.json():null).then(d=>{ if(d) setInboxUnread(d.unread||0); }).catch(()=>{});
  };

  const uploadMsgAttachment = async (file) => {
    if (!file || !activeThread) return;
    setMsgAttaching(true);
    try {
      const pr = await apiFetch(`${API}/messages/attachment-upload-url`, {
        method: "POST",
        body: JSON.stringify({ consent_id: activeThread, filename: file.name, content_type: file.type })
      });
      if (!pr.ok) { setMsgErr("Attachment upload failed"); setMsgAttaching(false); return; }
      const { upload_url, s3_key, view_url } = await pr.json();
      await fetch(upload_url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      setMsgAttach({ name: file.name, s3_key, url: view_url });
    } catch(_) { setMsgErr("Attachment upload failed"); }
    setMsgAttaching(false);
  };

  const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const setMention = (token, otherTokens) => {
    setMsgBody(b => {
      let cleaned = b;
      [token, ...otherTokens].forEach(t => { if (t) cleaned = cleaned.replace(new RegExp(`@${escRe(t)}\\s*`, "gi"), ""); });
      return `@${token} ${cleaned}`;
    });
  };

  // @bgv → sends to BGV vendor, employer auto-CC'd. Otherwise → employer only, private.
  // No @here for employee: there's no third party to reach — @bgv already includes the employer via CC.
  const detectRecipient = (text) => {
    const t = (text||"").toLowerCase();
    if (/@bgv\b/.test(t)) return "bgv";
    return "employer";
  };
  const recipientLabel = (rt) => rt==="bgv" ? "→ BGV Vendor (Employer will also see this)" : "→ Employer only (private)";

  const sendReply = async () => {
    if (!msgBody.trim() || !activeThread) return;
    setMsgSending(true); setMsgErr("");
    try {
      const r = await apiFetch(`${API}/messages/send`, {
        method: "POST",
        body: JSON.stringify({ consent_id: activeThread, body: msgBody.trim(), recipient_type: detectRecipient(msgBody), attachment_s3_key: msgAttach?.s3_key || "" }),
      });
      if (r.ok) { setMsgBody(""); setMsgAttach(null); await loadThread(activeThread); loadInbox(); }
      else { const d = await r.json(); setMsgErr(d.detail || "Failed to send"); }
    } catch(_) { setMsgErr("Network error"); }
    setMsgSending(false);
  };

  useEffect(() => {
    if (!ready || !user) return;
    apiFetch(`${API}/messages/unread-count`).then(r=>r.ok?r.json():null).then(d=>{ if(d) setInboxUnread(d.unread||0); }).catch(()=>{});
  }, [ready, user, apiFetch]);

  // ── Personal fields ──
  const [firstName,setFirstName]         = useState("");
  const [middleName,setMiddleName]       = useState("");
  const [lastName,setLastName]           = useState("");
  const [fatherFirst,setFatherFirst]     = useState("");
  const [fatherMiddle,setFatherMiddle]   = useState("");
  const [fatherLast,setFatherLast]       = useState("");
  const [fatherDob,setFatherDob]         = useState("");
  const [motherFirst,setMotherFirst]     = useState("");
  const [motherMiddle,setMotherMiddle]   = useState("");
  const [motherLast,setMotherLast]       = useState("");
  const [motherDob,setMotherDob]         = useState("");
  const [dob,setDob]                     = useState("");
  const [gender,setGender]               = useState("");
  const [genderOther,setGenderOther]     = useState("");
  const [religion,setReligion]           = useState("");
  const [category,setCategory]           = useState("");
  const [nationality,setNationality]     = useState("");
  const [mobile,setMobile]               = useState("");
  const [email,setEmail]                 = useState("");
  const [aadhar,setAadhar]               = useState("");
  const [aadhaarEditing,setAadhaarEditing] = useState(false);
  const [nameAsPerAadhaar,setNameAsPerAadhaar] = useState("");
  const [pan,setPan]                     = useState("");
  const [panDuplicate,setPanDuplicate]   = useState(false);
  // Email change state
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail,        setNewEmail]        = useState("");
  const [emailOtp,        setEmailOtp]        = useState("");
  const [emailOtpSent,    setEmailOtpSent]    = useState(false);
  const [emailChangeMsg,  setEmailChangeMsg]  = useState("");
  const [emailChangeErr,  setEmailChangeErr]  = useState("");
  const [emailChangeLod,  setEmailChangeLod]  = useState(false);
  const [nameAsPerPan,setNameAsPerPan]   = useState("");
  const [hasPassport,setHasPassport]     = useState("");
  const [passport,setPassport]           = useState("");
  const [passportIssue,setPassportIssue] = useState("");
  const [passportExpiry,setPassportExpiry] = useState("");
  const [passportKey,setPassportKey]     = useState("");
  const [bloodGroup,setBloodGroup]       = useState("");
  const [maritalStatus,setMaritalStatus] = useState("");
  const [spouseName,setSpouseName] = useState("");
  const [spouseDob,setSpouseDob] = useState("");
  const [emergName,setEmergName]         = useState("");
  const [emergRel,setEmergRel]           = useState("");
  const [emergPhone,setEmergPhone]       = useState("");
  const [curFrom,setCurFrom]             = useState("");
  const [curDoor,setCurDoor]             = useState("");
  const [curVillage,setCurVillage]       = useState("");
  const [curLocality,setCurLocality]     = useState("");
  const [curDistrict,setCurDistrict]     = useState("");
  const [curState,setCurState]           = useState("");
  const [curPin,setCurPin]               = useState("");
  const [permFrom,setPermFrom]           = useState("");
  const [permDoor,setPermDoor]           = useState("");
  const [sameAsCurrent,setSameAsCurrent] = useState(false);
  const [permVillage,setPermVillage]     = useState("");
  const [permLocality,setPermLocality]   = useState("");
  const [permDistrict,setPermDistrict]   = useState("");
  const [permState,setPermState]         = useState("");
  const [permPin,setPermPin]             = useState("");
  const [aadhaarKey,setAadhaarKey]       = useState("");
  const [panKey,setPanKey]               = useState("");
  const [bankProofKey,setBankProofKey]   = useState("");
  const [photoKey,setPhotoKey]           = useState("");
  const [activeUploads, setActiveUploads] = useState(0);
  const handleUploadState = useCallback((active) => setActiveUploads(c => Math.max(0, c + (active ? 1 : -1))), []);

  // ── Bank details ──
  const [bankName,setBankName]           = useState("");
  const [bankOther,setBankOther]         = useState("");
  const [bankAccountName,setBankAccountName] = useState("");
  const [ifsc,setIfsc]                   = useState("");
  const [branch,setBranch]               = useState("");
  const [accountNo,setAccountNo]         = useState("");       // raw digits being typed
  const [accountNoConfirm,setAccountNoConfirm] = useState(""); // confirm raw digits
  const [accountType,setAccountType]     = useState("");
  const [accountFull,setAccountFull]     = useState("");       // saved full number
  const [accountLast4,setAccountLast4]   = useState("");

  // dirty setter — marks page as edited for cascade
  const dirty = (setter) => (val) => {
    setter(val);
    isDirtyRef.current = true;
    wasEditedRef.current = true;
  };

  useEffect(() => {
    if (!ready) return;
    if (user === null) { router.replace("/employee/login"); return; }
    if (user && user.role !== "employee") { router.replace("/employee/login"); return; }
  }, [ready, user, router]);

  useEffect(() => {
    if (!ready || !user) return;
    if (user?.email) setEmail(user.email);
    if (user?.phone) setMobile(user.phone);
    const init = async () => {
      if (!user || user.role !== "employee") return;
      try {
        const res = await apiFetch(`${API}/employee/draft`);
        if (res.ok) {
          const d = await res.json();
          if (d.employee_id) { setEmployeeId(d.employee_id); employeeIdRef.current = d.employee_id; setProfileStatus(d.status || "draft"); setDraftReady(true); }
          // Fetch own completeness score
          if (user?.email) {
            apiFetch(`${API}/employee/profile-status?email=${encodeURIComponent(user.email)}`)
              .then(r => r.ok ? r.json() : null)
              .then(sc => { if (sc) setCompleteness(sc.completeness ?? 0); })
              .catch(() => {});
          }
          // Item 10 — Freshness: warn if profile not updated in 6 months
          const lastUpdate = d.updated_at || d.last_saved_at || d.created_at;
          if (lastUpdate) {
            const SIX_MONTHS = 6 * 30 * 24 * 60 * 60 * 1000;
            const ts = typeof lastUpdate === "number" && lastUpdate < 1e12 ? lastUpdate * 1000 : lastUpdate;
            if (Date.now() - ts > SIX_MONTHS) setFreshnessWarn(true);
          }
          if (d.firstName && d.firstName !== "draft")    setFirstName(d.firstName);
          if (d.middleName)   setMiddleName(d.middleName);
          if (d.lastName && d.lastName !== "draft")      setLastName(d.lastName);
          if (d.fatherFirst)  setFatherFirst(d.fatherFirst);
          if (d.fatherMiddle) setFatherMiddle(d.fatherMiddle);
          if (d.fatherLast)   setFatherLast(d.fatherLast);
          if (d.fatherDob)    setFatherDob(d.fatherDob);
          if (d.motherFirst)  setMotherFirst(d.motherFirst);
          if (d.motherMiddle) setMotherMiddle(d.motherMiddle);
          if (d.motherLast)   setMotherLast(d.motherLast);
          if (d.motherDob)    setMotherDob(d.motherDob);
          if (d.spouseName)   setSpouseName(d.spouseName);
          if (d.spouseDob)    setSpouseDob(d.spouseDob);
          if (d.dob)          setDob(d.dob);
          if (d.gender)       setGender(d.gender);
          if (d.genderOther)  setGenderOther(d.genderOther);
          if (d.religion)     setReligion(d.religion);
          if (d.category)     setCategory(d.category);
          if (d.nationality)  setNationality(d.nationality);
          if (d.mobile)       setMobile(d.mobile);
          if (d.email)        setEmail(d.email);
          if (d.aadhaar || d.aadhar) setAadhar(d.aadhaar || d.aadhar);
          if (d.nameAsPerAadhaar) setNameAsPerAadhaar(d.nameAsPerAadhaar);
          if (d.pan)          setPan(d.pan);
          if (d.nameAsPerPan) setNameAsPerPan(d.nameAsPerPan);
          if (d.hasPassport)     setHasPassport(d.hasPassport);
          if (d.passport)       setPassport(d.passport);
          if (d.passportIssue)  setPassportIssue(d.passportIssue);
          if (d.passportExpiry) setPassportExpiry(d.passportExpiry);
          if (d.passportKey)   setPassportKey(d.passportKey);
          if (d.bloodGroup)   setBloodGroup(d.bloodGroup);
          if (d.maritalStatus) setMaritalStatus(d.maritalStatus);
          if (d.emergName)    setEmergName(d.emergName);
          if (d.emergRel)     setEmergRel(d.emergRel);
          if (d.emergPhone)   setEmergPhone(d.emergPhone);
          if (d.aadhaarKey)   setAadhaarKey(d.aadhaarKey);
          if (d.panKey)       setPanKey(d.panKey);
          if (d.bankProofKey) setBankProofKey(d.bankProofKey);
          if (d.photoKey)     setPhotoKey(d.photoKey);
          if (d.bankName)        setBankName(d.bankName);
          if (d.bankOther)       setBankOther(d.bankOther);
          if (d.bankAccountName) setBankAccountName(d.bankAccountName);
          if (d.ifsc)            setIfsc(d.ifsc);
          if (d.branch)          setBranch(d.branch);
          if (d.accountFull)     setAccountFull(d.accountFull);
          if (d.accountLast4)    setAccountLast4(d.accountFull ? d.accountFull.slice(-4) : (d.accountLast4||""));
          if (d.accountType)     setAccountType(d.accountType);
          const cur  = d.currentAddress   || {};
          const perm = d.permanentAddress || {};
          if (cur.from)     setCurFrom(cur.from);
          if (cur.door)     setCurDoor(cur.door);
          if (cur.village)  setCurVillage(cur.village);
          if (cur.locality) setCurLocality(cur.locality);
          if (cur.district) setCurDistrict(cur.district);
          if (cur.state)    setCurState(cur.state);
          if (cur.pin)      setCurPin(cur.pin);
          if (perm.from)     setPermFrom(perm.from);
          if (perm.door)     setPermDoor(perm.door);
          if (d.sameAsCurrent) setSameAsCurrent(true);
          if (perm.village)  setPermVillage(perm.village);
          if (perm.locality) setPermLocality(perm.locality);
          if (perm.district) setPermDistrict(perm.district);
          if (perm.state)    setPermState(perm.state);
          if (perm.pin)      setPermPin(perm.pin);
        } else {
          const empId = `emp-${Date.now()}`;
          const createRes = await apiFetch(`${API}/employee`, {
            method: "POST",
            body: JSON.stringify({
              employee_id: empId, status: "draft",
              email: user?.email || "", mobile: user?.phone || "0000000000",
              firstName: "", lastName: "",
            }),
          });
          const rd = await createRes.json().catch(() => ({}));
          const confirmedId = rd.employee_id || empId;
          setEmployeeId(confirmedId);
          employeeIdRef.current = confirmedId;
          setDraftReady(true);
        }
      } catch (_) {}
      setLoading(false);
    };
    init();
  }, [ready, user, apiFetch]);

  // Load photo preview
  useEffect(() => {
    if (!employeeId || !photoKey || photoPreview) return;
    const loadPreview = async () => {
      try {
        const res = await apiFetch(`${API}/documents/${employeeId}`);
        if (res.ok) { const data = await res.json(); const url = data?.documents?.personal?.photo?.url; if (url) setPhotoPreview(url); }
      } catch (_) {}
    };
    loadPreview();
  }, [employeeId, photoKey]);

  const buildPayload = (empId) => ({
    employee_id: empId, status: "draft",
    firstName, middleName, lastName,
    fatherFirst, fatherMiddle, fatherLast, fatherDob,
    motherFirst, motherMiddle, motherLast, motherDob,
    spouseName: maritalStatus==="Married" ? spouseName : "",
    spouseDob:  maritalStatus==="Married" ? spouseDob  : "",
    fatherName: `${fatherFirst} ${fatherMiddle} ${fatherLast}`.trim(),
    motherName: `${motherFirst} ${motherMiddle} ${motherLast}`.trim(),
    dob, gender, genderOther: gender==="Other"?genderOther:"", religion, category, nationality, mobile, email,
    aadhaar: aadhar.length <= 4 ? aadhar : aadhar.slice(-4),
    nameAsPerAadhaar,
    pan, nameAsPerPan,
    hasPassport, passport, passportIssue, passportExpiry, passportKey, bloodGroup, maritalStatus,
    emergName, emergRel, emergPhone,
    aadhaarKey, panKey, photoKey, bankProofKey,
    sameAsCurrent,
    bankName: bankName === "Other" ? (bankOther || bankName) : bankName,
    bankOther,
    bankAccountName, ifsc, branch, accountType,
    accountFull: accountNo || accountFull || "",
    accountLast4: accountNo.length >= 4 ? accountNo.slice(-4) : (accountLast4 || ""),
    currentAddress:   { from:curFrom, door:curDoor, village:curVillage, locality:curLocality, district:curDistrict, state:curState, pin:curPin },
    permanentAddress: {
      from:     sameAsCurrent ? curFrom     : permFrom,
      door:     sameAsCurrent ? curDoor     : permDoor,
      village:  sameAsCurrent ? curVillage  : permVillage,
      locality: sameAsCurrent ? curLocality : permLocality,
      district: sameAsCurrent ? curDistrict : permDistrict,
      state:    sameAsCurrent ? curState    : permState,
      pin:      sameAsCurrent ? curPin      : permPin,
    },
  });

  const checkPanDuplicate = async (panVal) => {
    if (!panVal || panVal.length !== 10) { setPanDuplicate(false); return; }
    try {
      const res = await apiFetch(`${API}/employee/check-duplicate?pan=${panVal.toUpperCase()}`);
      if (res.ok) {
        const d = await res.json();
        setPanDuplicate(d.conflicts?.includes("pan") || false);
      }
    } catch (_) {}
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
      else {
        setEmailChangeMsg("Email updated. Logging you out now...");
        setTimeout(() => logout(), 2500);
      }
    } catch (_) { setEmailChangeErr("Network error"); }
    setEmailChangeLod(false);
  };

  const saveDraft = async () => {
    const empId = employeeId || `emp-${Date.now()}`;
    if (!employeeId) setEmployeeId(empId);

    // Fetch fresh copy so we don't overwrite other page data
    const freshRes = await apiFetch(`${API}/employee/draft`);
    const fresh = freshRes.ok ? await freshRes.json() : {};

    const payload = {
      ...fresh,
      ...buildPayload(empId),
      // ── Cascade flag: page 1 edited → page 5 must re-ask acks ──
      page1_edited: wasEditedRef.current ? true : (fresh.page1_edited || false),
      ...(wasEditedRef.current ? { acknowledgements_review: {} } : {}),
    };

    payload.last_saved_at = Date.now();
    const res = await apiFetch(`${API}/employee`, { method:"POST", body:JSON.stringify(payload) });
    if (!res.ok) throw new Error(parseError(await res.json().catch(() => ({}))));
    const rd = await res.json().catch(() => ({}));
    if (rd.employee_id) setEmployeeId(rd.employee_id);
    if (accountNo.length >= 4) { setAccountFull(accountNo); setAccountLast4(accountNo.slice(-4)); setAccountNo(""); setAccountNoConfirm(""); }
  };

  const downloadMyProfile = async () => {
    setDownloadingPdf(true);
    try {
      const draftRes = await apiFetch(`${API}/employee/draft`);
      if (!draftRes.ok) { setDownloadingPdf(false); return; }
      const draft = await draftRes.json();
      if (!draft.employee_id) { setDownloadingPdf(false); return; }

      const [histRes, docsRes] = await Promise.all([
        apiFetch(`${API}/employee/employment-history/${draft.employee_id}`).catch(()=>null),
        apiFetch(`${API}/documents/${draft.employee_id}`).catch(()=>null),
      ]);
      const histData = histRes && histRes.ok ? await histRes.json() : {};
      const docsData = docsRes && docsRes.ok ? await docsRes.json() : {};

      const normalized = normalizeProfileSelf(draft);
      const employments = Array.isArray(histData.employments) ? histData.employments : [];
      const selfName = [draft.firstName, draft.lastName].filter(Boolean).join(" ") || user?.name || user?.email;

      const html = await buildMyProfilePdf(normalized, employments, docsData.documents || {}, selfName);
      setMyPrintHtml(html);
    } catch (_) {}
    setDownloadingPdf(false);
  };

  const handleChangePassword = async () => {
    setPwErr(""); setPwOk("");
    if (!pwCurrent || !pwNew || !pwConfirm) { setPwErr("All fields required"); return; }
    if (pwNew !== pwConfirm) { setPwErr("Passwords do not match"); return; }
    if (pwNew.length < 8) { setPwErr("Must be at least 8 characters"); return; }
    setPwBusy(true);
    try {
      const r = await apiFetch(`${API}/auth/change-password`, {
        method: "POST",
        body: JSON.stringify({ current_password: pwCurrent, new_password: pwNew }),
      });
      const d = await r.json();
      if (!r.ok) { setPwErr(d.detail || "Failed"); return; }
      setPwOk("Password changed! Signing you out…");
      setTimeout(() => { setShowPwChange(false); logout(); }, 2000);
    } catch(_) { setPwErr("Network error"); }
    finally { setPwBusy(false); }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const res = await apiFetch(`${API}/employee/account`, { method: "DELETE" });
      if (res.ok) {
        logout();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.detail || "Could not delete account. Please try again.");
        setDeleteLoading(false);
        setShowDeleteModal(false);
      }
    } catch (_) {
      alert("Network error. Please try again.");
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleSave = async () => {
    const e = {};
    if (!firstName)    e.firstName = true;
    if (!lastName)     e.lastName = true;
    if (!dob)          e.dob = true;
    if (!gender)       e.gender = true;
    if (!nationality)  e.nationality = true;
    if (!mobile)       e.mobile = true;
    if (!aadhar)                                         e.aadhar = true;
    if (aadhar && aadhar.length !== 12 && aadhar.length !== 4) e.aadhar = true;
    if (!nameAsPerAadhaar)  e.nameAsPerAadhaar = true;
    if (!pan)           e.pan = true;
    if (!nameAsPerPan)  e.nameAsPerPan = true;
    if (!hasPassport)   e.hasPassport = true;
    if (!bloodGroup)    e.bloodGroup = true;
    if (!maritalStatus) e.maritalStatus = true;
    if (!curDoor)       e.curDoor = true;
    if (!curDistrict)   e.curDistrict = true;
    if (!curState)      e.curState = true;
    if (!curPin)        e.curPin = true;
    if (!sameAsCurrent) {
      if (!permDoor)     e.permDoor = true;
      if (!permDistrict) e.permDistrict = true;
      if (!permState)    e.permState = true;
      if (!permPin)      e.permPin = true;
    }
    if (!aadhaarKey)    e.aadhaarKey = true;
    if (!panKey)        e.panKey = true;
    if (!photoKey)      e.photoKey = true;
    if (!bankName)         e.bankName = true;
    if (bankName==="Other" && !bankOther) e.bankOther = true;
    if (!bankAccountName)  e.bankAccountName = true;
    if (!ifsc)             e.ifsc = true;
    if (!branch)           e.branch = true;
    if (!accountType)      e.accountType = true;
    if (!accountLast4 && !accountNo) e.accountNo = true;
    if (!bankProofKey)     e.bankProofKey = true;
    if (accountNo && accountNo !== accountNoConfirm) e.accountNoConfirm = true;
    if (Object.keys(e).length > 0) {
      setErrors(e);
      setSaveStatus("Please fill all required fields ↑");
      setTimeout(() => { const el = document.querySelector(".in.err"); if (el) el.scrollIntoView({ behavior:"smooth", block:"center" }); }, 60);
      return;
    }
    setErrors({});
    setSaveStatus("Saving...");
    try { await saveDraft(); isDirtyRef.current = false; setSaveStatus("Saved ✓"); router.push("/employee/education"); }
    catch (err) { setSaveStatus(`Error: ${err.message || "Could not save"}`); }
  };

  const handleMidSave = async () => {
    setMidSaveStatus("Saving…");
    try { await saveDraft(); isDirtyRef.current = false; setMidSaveStatus("Saved ✓"); setTimeout(() => setMidSaveStatus(""), 2000); }
    catch (_) { setMidSaveStatus("Error saving"); setTimeout(() => setMidSaveStatus(""), 2500); }
  };

  const handleSaveSignout = async () => {
    try {
      await saveDraft();
      isDirtyRef.current = false;
      logout();
    } catch (e) {
      alert("Your changes could not be saved. Please check your connection and try again before signing out — signing out now would lose them.");
    }
  };
  const handleNavigate = async (path) => {
    const wasDirty = isDirtyRef.current;
    if (wasDirty) { try { await saveDraft(); isDirtyRef.current = false; } catch (_) {} }
    const dest = (path === "/employee/review" && wasDirty) ? "/employee/review?edited=1" : path;
    router.push(dest);
  };
  const handleSignout  = async () => { if (isDirtyRef.current) { try { await saveDraft(); } catch (_) {} } logout(); };
  const handleSignoutAll = async () => {
    if (isDirtyRef.current) { try { await saveDraft(); } catch (_) {} }
    try { await apiFetch(`${API}/auth/logout-all`, { method: "POST" }); } catch (_) {}
    logout();
  };

  const aadhaarDisplay = aadhaarEditing
    ? aadhar
    : (aadhar.length >= 4 ? `XXXX XXXX ${aadhar.slice(-4)}` : aadhar);

  if (!ready || !user) return null;
  if (loading) return (<div style={{minHeight:"100vh",background:"#f5f4f0",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"#8b88b0",fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>Loading your profile…</p></div>);

  return (
    <>
      <style>{G}</style>
      <div className="pg">
        {showSignout && <SignoutModal onConfirm={handleSignout} onCancel={() => setShowSignout(false)} onSignOutAll={handleSignoutAll} />}
        {myPrintHtml && <MyPrintPreviewModal html={myPrintHtml} onClose={() => setMyPrintHtml(null)} />}
        {showSupport && <SupportModal apiFetch={apiFetch} onClose={()=>setShowSupport(false)} />}
        {showDeleteModal && <DeleteAccountModal onConfirm={handleDeleteAccount} onCancel={()=>{setShowDeleteModal(false);}} loading={deleteLoading}/>}

        {/* ── Change Password Modal ── */}
        {showPwChange && (
          <div style={{position:"fixed",inset:0,background:"rgba(15,12,40,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,backdropFilter:"blur(4px)"}}>
            <div style={{background:"#fff",borderRadius:14,padding:"1.75rem",maxWidth:360,width:"90%",boxShadow:"0 32px 80px rgba(0,0,0,0.2)"}}>
              <div style={{fontSize:"0.95rem",fontWeight:700,color:"#0f172a",marginBottom:"1rem"}}>Change Password</div>
              {[["Current password",pwCurrent,setPwCurrent],["New password",pwNew,setPwNew],["Confirm new password",pwConfirm,setPwConfirm]].map(([label,val,setter])=>(
                <div key={label} style={{marginBottom:"0.65rem"}}>
                  <div style={{fontSize:"0.65rem",fontWeight:600,color:"#6b7280",marginBottom:"0.3rem",textTransform:"uppercase",letterSpacing:"0.4px"}}>{label}</div>
                  <input type="password" value={val} onChange={e=>setter(e.target.value)}
                    style={{width:"100%",padding:"0.6rem 0.8rem",border:"1.5px solid #e0dcf5",borderRadius:8,fontFamily:"inherit",fontSize:"0.84rem",outline:"none",background:"#f8f7ff"}}/>
                </div>
              ))}
              {pwErr && <div style={{fontSize:"0.72rem",color:"#ef4444",marginBottom:"0.6rem",fontWeight:600}}>{pwErr}</div>}
              {pwOk  && <div style={{fontSize:"0.72rem",color:"#16a34a",marginBottom:"0.6rem",fontWeight:600}}>{pwOk}</div>}
              <div style={{display:"flex",gap:"0.6rem",marginTop:"0.5rem"}}>
                <button onClick={()=>{setShowPwChange(false);setPwErr("");setPwOk("");setPwCurrent("");setPwNew("");setPwConfirm("");}}
                  style={{flex:1,padding:"0.6rem",borderRadius:7,border:"1px solid #e5e0f5",background:"#f7f6fd",cursor:"pointer",fontWeight:600,color:"#6b7280",fontFamily:"inherit",fontSize:"0.82rem"}}>Cancel</button>
                <button onClick={handleChangePassword} disabled={pwBusy}
                  style={{flex:1,padding:"0.6rem",borderRadius:7,border:"none",background:"#0d6e6e",color:"#fff",cursor:pwBusy?"not-allowed":"pointer",fontWeight:700,fontFamily:"inherit",fontSize:"0.82rem",opacity:pwBusy?0.6:1}}>
                  {pwBusy?"Saving…":"Change Password"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="topbar">
          <span className="logo-text">Datagate</span>
          <div className="topbar-right">
            <span className="user-name">👤 {user.name || user.email}</span>
            <ConsentBell apiFetch={apiFetch} router={router} />
            {/* ── Settings gear ── */}
            <div className="gear-wrap">
              <button className={`gear-btn${showGear?" open":""}`}
                onClick={()=>setShowGear(g=>!g)}
                title="Settings">⚙️</button>
              {showGear && (
                <>
                  <div style={{position:"fixed",inset:0,zIndex:199}} onClick={()=>setShowGear(false)}/>
                  <div className="gear-dropdown">
                    <button className="gear-item" onClick={()=>{setShowGear(false);setShowPwChange(true);}}>
                      🔑 Change password
                    </button>
                    <button className="gear-item" onClick={()=>{setShowGear(false);downloadMyProfile();}} disabled={downloadingPdf}>
                      {downloadingPdf ? "⏳ Preparing…" : "📄 Download My Profile (PDF)"}
                    </button>
                    <button className="gear-item" onClick={()=>{setShowGear(false);setShowSupport(true);}}>
                      🎧 Help & Support
                    </button>
                    <div className="gear-divider"/>
                    <button className="gear-item danger" onClick={()=>{setShowGear(false);setShowDeleteModal(true);}}>
                      🗑️ Delete account
                    </button>
                  </div>
                </>
              )}
            </div>
            <button className="signout-btn" onClick={()=>setShowSignout(true)} style={{borderColor:"#ef4444",color:"#ef4444"}}>Sign out</button>
          </div>
        </div>

        <div className="wrap">
          <div className="tab-row">
            <button className={`tab-btn${activeTab==="profile"?" active":""}`} onClick={() => setActiveTab("profile")}>My Profile</button>
            <button className={`tab-btn${activeTab==="consents"?" active":""}`} onClick={() => setActiveTab("consents")}>Consent Requests</button>
            <button className={`tab-btn${activeTab==="inbox"?" active":""}`} onClick={() => { setActiveTab("inbox"); loadInbox(); }}>
              Inbox {inboxUnread>0 && <span style={{background:"#ef4444",color:"#fff",borderRadius:999,fontSize:"0.6rem",fontWeight:800,padding:"1px 6px",marginLeft:4}}>{inboxUnread}</span>}
            </button>
          </div>

          {activeTab === "inbox" ? (
            <div>
              <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:"0.75rem",minHeight:400}}>
                {/* Thread list */}
                <div style={{background:"#fff",borderRadius:12,border:"1px solid #ebe9f5",overflow:"hidden"}}>
                  <div style={{padding:"0.65rem 0.9rem",borderBottom:"1px solid #ebe9f5",fontSize:"0.65rem",fontWeight:700,color:"#8b88b0",textTransform:"uppercase",letterSpacing:0.8}}>Conversations</div>
                  <div style={{padding:"0.5rem 0.7rem",borderBottom:"1px solid #ebe9f5"}}>
                    <input
                      type="text"
                      placeholder="🔍 Search…"
                      value={inboxSearch}
                      onChange={e=>setInboxSearch(e.target.value)}
                      style={{width:"100%",padding:"0.4rem 0.6rem",background:"#f8f7ff",border:"1.5px solid #ede9f8",borderRadius:7,fontFamily:"inherit",fontSize:"0.7rem",color:"#1a1730",outline:"none",boxSizing:"border-box"}}
                    />
                  </div>
                  {inboxLoading && <div style={{padding:"1rem",fontSize:"0.72rem",color:"#94a3b8"}}>Loading…</div>}
                  {!inboxLoading && inboxThreads.length===0 && (
                    <div style={{padding:"2rem 1rem",textAlign:"center"}}>
                      <div style={{fontSize:"1.5rem",opacity:0.2,marginBottom:"0.5rem"}}>✉️</div>
                      <div style={{fontSize:"0.72rem",color:"#94a3b8"}}>No conversations yet</div>
                      <div style={{fontSize:"0.62rem",color:"#c4bfdb",marginTop:"0.3rem"}}>Once you approve an employer's request, they'll appear here</div>
                    </div>
                  )}
                  {!inboxLoading && inboxThreads.length>0 && (inboxSearch ? inboxThreads.filter(t=>
                    (t.other_party_name||"").toLowerCase().includes(inboxSearch.toLowerCase()) ||
                    (t.other_party_email||"").toLowerCase().includes(inboxSearch.toLowerCase()) ||
                    (t.latest_message||"").toLowerCase().includes(inboxSearch.toLowerCase())
                  ) : inboxThreads).length===0 && (
                    <div style={{padding:"1.5rem 1rem",textAlign:"center",fontSize:"0.7rem",color:"#94a3b8"}}>No matches</div>
                  )}
                  {(inboxSearch ? inboxThreads.filter(t=>
                    (t.other_party_name||"").toLowerCase().includes(inboxSearch.toLowerCase()) ||
                    (t.other_party_email||"").toLowerCase().includes(inboxSearch.toLowerCase()) ||
                    (t.latest_message||"").toLowerCase().includes(inboxSearch.toLowerCase())
                  ) : inboxThreads).map(t=>(
                    <div key={t.thread_id} onClick={()=>loadThread(t.thread_id)}
                      style={{padding:"0.65rem 0.9rem",cursor:"pointer",borderBottom:"1px solid #f5f3ff",background:activeThread===t.thread_id?"#eef2ff":"#fff",borderLeft:activeThread===t.thread_id?"3px solid #0d6e6e":"3px solid transparent",transition:"all 0.1s"}}>
                      <div style={{fontSize:"0.71rem",fontWeight:700,color:"#1a1730",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.other_party_name||t.other_party_email}</div>
                      <div style={{fontSize:"0.62rem",color:t.has_messages?"#94a3b8":"#8b88b0",fontStyle:t.has_messages?"normal":"italic",marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.latest_message||"No messages yet — tap to start"}</div>
                      <div style={{display:"flex",justifyContent:"space-between",marginTop:2}}>
                        <span style={{fontSize:"0.58rem",color:"#c4bfdb"}}>{t.latest_at?new Date(t.latest_at).toLocaleDateString("en-IN"):""}</span>
                        {t.unread_count>0&&<span style={{background:"#0d6e6e",color:"#fff",fontSize:"0.55rem",fontWeight:800,padding:"1px 6px",borderRadius:999}}>{t.unread_count}</span>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message thread */}
                <div style={{background:"#fff",borderRadius:12,border:"1px solid #ebe9f5",display:"flex",flexDirection:"column",overflow:"hidden"}}>
                  {!activeThread ? (
                    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:"0.5rem",padding:"3rem"}}>
                      <div style={{fontSize:"2.5rem",opacity:0.15}}>✉️</div>
                      <div style={{fontSize:"0.84rem",color:"#94a3b8",fontWeight:500}}>Select a conversation</div>
                    </div>
                  ) : (
                    <>
                      <div style={{padding:"0.75rem 1.1rem",borderBottom:"1px solid #ebe9f5",background:"#faf9ff",fontSize:"0.75rem",fontWeight:700,color:"#1a1730"}}>
                        {inboxThreads.find(t=>t.thread_id===activeThread)?.other_party_name||inboxThreads.find(t=>t.thread_id===activeThread)?.other_party_email}
                        <span style={{fontSize:"0.62rem",color:"#94a3b8",fontWeight:400,marginLeft:8}}>{threadMsgs.length} message{threadMsgs.length!==1?"s":""}</span>
                      </div>
                      {/* Messages */}
                      <div ref={msgListRef} style={{flex:1,overflow:"auto",padding:"0.9rem",display:"flex",flexDirection:"column",gap:"0.6rem",minHeight:200,maxHeight:320}}>
                        {threadLoading&&<div style={{textAlign:"center",fontSize:"0.72rem",color:"#94a3b8"}}>Loading…</div>}
                        {!threadLoading&&threadMsgs.length===0&&<div style={{textAlign:"center",fontSize:"0.72rem",color:"#94a3b8",padding:"2rem"}}>No messages yet. Send a reply below.</div>}
                        {threadMsgs.map((m,i)=>{
                          const mine = m.sender_role==="employee";
                          const isNewSegment = m.consent_id && m.consent_id!==threadMsgs[i-1]?.consent_id;
                          const seg = isNewSegment ? (threadSegments[m.consent_id]||{}) : null;
                          return (
                            <React.Fragment key={m.message_id||i}>
                            {isNewSegment && (
                              <div style={{display:"flex",alignItems:"center",gap:"0.6rem",margin:"0.9rem 0 0.6rem"}}>
                                <div style={{flex:1,height:1,background:"#ede9f8"}}/>
                                <div style={{fontSize:"0.66rem",color:"#8b88b0",fontWeight:600,whiteSpace:"nowrap",textAlign:"center"}}>
                                  {seg.requested_at ? new Date(seg.requested_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : ""}
                                  {seg.bgv_vendor_name ? ` — BGV: ${seg.bgv_vendor_name}` : ""}
                                </div>
                                <div style={{flex:1,height:1,background:"#ede9f8"}}/>
                              </div>
                            )}
                            <div style={{display:"flex",flexDirection:"column",alignItems:mine?"flex-end":"flex-start"}}>
                              {!mine&&<div style={{fontSize:"0.6rem",color:"#94a3b8",marginBottom:2,fontWeight:600}}>{m.sender_name||m.sender_email}</div>}
                              <div style={{maxWidth:"78%",padding:"0.6rem 0.85rem",borderRadius:mine?"12px 12px 3px 12px":"12px 12px 12px 3px",background:mine?"#0d6e6e":"#f5f3ff",color:mine?"#fff":"#1a1730",fontSize:"0.82rem",lineHeight:1.55,border:mine?"none":"1px solid #ede9f8"}}>
                                {m.subject&&<div style={{fontSize:"0.68rem",fontWeight:800,marginBottom:"0.3rem",opacity:0.85,textTransform:"uppercase",letterSpacing:"0.3px"}}>Sub: {m.subject}</div>}
                                {m.body}
                                {m.attachment_s3_key && (
                                  <div style={{marginTop:(m.body||m.subject)?"0.5rem":0,background:"#fff",border:"1px solid #ede9f8",borderRadius:9,overflow:"hidden"}}>
                                    {/^\.(png|jpe?g|gif|webp)$/i.test(m.attachment_s3_key.slice(m.attachment_s3_key.lastIndexOf("."))) && msgAttachUrls[m.attachment_s3_key] ? (
                                      <a href={msgAttachUrls[m.attachment_s3_key]} target="_blank" rel="noopener noreferrer" style={{display:"block"}}>
                                        <img src={msgAttachUrls[m.attachment_s3_key]} alt="attachment" style={{width:"100%",maxHeight:180,objectFit:"cover",display:"block"}}/>
                                      </a>
                                    ) : (
                                      <a href={msgAttachUrls[m.attachment_s3_key]||"#"} target="_blank" rel="noopener noreferrer"
                                         style={{display:"flex",alignItems:"center",gap:"0.5rem",padding:"0.5rem 0.65rem",fontSize:"0.72rem",fontWeight:600,textDecoration:"none",color:"#1a1730"}}>
                                        <span style={{width:24,height:24,borderRadius:6,background:"#f5f3ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.8rem",flexShrink:0}}>📄</span>
                                        <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.attachment_s3_key.split("/").pop()}</span>
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div style={{fontSize:"0.58rem",color:"#c4bfdb",marginTop:2}}>
                                {new Date(m.sent_at).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}
                                {mine&&<span style={{marginLeft:4}}>{m.read_by_recipient?"✓✓":"✓"}</span>}
                              </div>
                            </div>
                            </React.Fragment>
                          );
                        })}
                      </div>
                      {/* Reply */}
                      <div style={{padding:"0.75rem 1rem",borderTop:"1px solid #ebe9f5",background:"#fff"}}>
                        <div style={{display:"flex",gap:"0.4rem",marginBottom:"0.4rem",flexWrap:"wrap"}}>
                          {(() => {
                            const t = inboxThreads.find(x=>x.thread_id===activeThread);
                            const employerName = t?.employer_name || "Employer";
                            const hasBgv = !!(t?.bgv_email);
                            const bgvName = t?.bgv_name || "BGV";
                            const btnStyle = {padding:"0.25rem 0.6rem",borderRadius:999,border:"1.5px solid #ddd8f5",background:"#f8f7ff",color:"#6366f1",fontSize:"0.66rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit"};
                            return (<>
                              <button type="button" onClick={()=>setMention(employerName,["bgv"])} style={btnStyle}>@{employerName}</button>
                              {hasBgv && <button type="button" onClick={()=>setMention("bgv",[employerName])} style={btnStyle}>@{bgvName}</button>}
                            </>);
                          })()}
                          <span style={{marginLeft:"auto",fontSize:"0.66rem",fontWeight:700,color:"#8b88b0",alignSelf:"center"}}>{recipientLabel(detectRecipient(msgBody))}</span>
                        </div>
                        <textarea
                          value={msgBody} onChange={e=>setMsgBody(e.target.value)}
                          onKeyDown={e=>{if(e.key==="Enter"&&e.ctrlKey){e.preventDefault();sendReply();}}}
                          placeholder="Type your reply… @bgv to loop in the BGV vendor, @here for everyone. (Ctrl+Enter to send)"
                          style={{width:"100%",padding:"0.55rem 0.75rem",background:"#f8f7ff",border:"1.5px solid #ddd8f5",borderRadius:9,fontFamily:"inherit",fontSize:"0.82rem",color:"#1a1730",outline:"none",resize:"none",minHeight:60,marginBottom:"0.4rem",transition:"border-color 0.15s"}}
                        />
                        {msgAttach ? (
                          <div style={{display:"flex",alignItems:"center",gap:"0.4rem",padding:"0.3rem 0.6rem",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:6,fontSize:"0.72rem",marginBottom:"0.4rem"}}>
                            <span style={{color:"#16a34a",fontWeight:600}}>📎 {msgAttach.name}</span>
                            <button onClick={()=>setMsgAttach(null)} style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:"#ef4444",fontSize:"0.72rem",fontWeight:700}}>✕</button>
                          </div>
                        ) : (
                          <label style={{display:"inline-flex",alignItems:"center",gap:"0.3rem",cursor:"pointer",fontSize:"0.72rem",color:"#6b6894",padding:"0.3rem 0.65rem",background:"#f8f7ff",border:"1px solid #ddd8f5",borderRadius:6,marginBottom:"0.4rem"}}>
                            {msgAttaching ? "Uploading…" : "📎 Attach file"}
                            <input type="file" style={{display:"none"}} onChange={e=>e.target.files[0]&&uploadMsgAttachment(e.target.files[0])} disabled={msgAttaching}/>
                          </label>
                        )}
                        {msgErr&&<div style={{fontSize:"0.68rem",color:"#ef4444",marginBottom:"0.3rem",fontWeight:600}}>{msgErr}</div>}
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <span style={{fontSize:"0.62rem",color:"#94a3b8"}}>Ctrl+Enter to send</span>
                          <button onClick={sendReply} disabled={msgSending||!msgBody.trim()}
                            style={{padding:"0.5rem 1.1rem",background:"#0d6e6e",color:"#fff",border:"none",borderRadius:8,fontFamily:"inherit",fontSize:"0.78rem",fontWeight:700,cursor:msgSending||!msgBody.trim()?"not-allowed":"pointer",opacity:msgSending||!msgBody.trim()?0.5:1,transition:"all 0.15s"}}>
                            {msgSending?"Sending…":"Reply ↗"}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === "consents" ? <ConsentTab apiFetch={apiFetch} profileStatus={profileStatus} /> : (
            <>
              <StepNav current={1} onNavigate={handleNavigate} />

              {/* ── Profile Completeness Bar ── */}
              {completeness !== null && (
                <div style={{background:"#fff",borderRadius:12,padding:"0.85rem 1.25rem",marginBottom:"1.1rem",boxShadow:"0 4px 16px rgba(30,26,62,0.1)",border:"1px solid rgba(255,255,255,0.85)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.5rem"}}>
                    <div style={{fontSize:"0.75rem",fontWeight:700,color:"#1e293b"}}>
                      Profile Completeness
                      {profileStatus === "submitted" && <span style={{marginLeft:"0.5rem",background:"#dcfce7",color:"#15803d",fontSize:"0.6rem",fontWeight:700,padding:"2px 8px",borderRadius:4,textTransform:"uppercase",letterSpacing:0.5}}>Submitted ✓</span>}
                    </div>
                    <div style={{fontSize:"0.88rem",fontWeight:800,color:completeness>=80?"#16a34a":completeness>=50?"#d97706":"#ef4444"}}>
                      {completeness}%
                    </div>
                  </div>
                  <div style={{height:8,background:"#f1f5f9",borderRadius:999,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${completeness}%`,borderRadius:999,transition:"width 0.6s ease",
                      background:completeness>=80?"linear-gradient(90deg,#16a34a,#4ade80)":completeness>=50?"linear-gradient(90deg,#d97706,#fbbf24)":"linear-gradient(90deg,#ef4444,#f87171)"}}>
                    </div>
                  </div>
                  {completeness < 100 && (
                    <div style={{fontSize:"0.65rem",color:"#94a3b8",marginTop:"0.4rem",lineHeight:1.5}}>
                      {completeness < 30 && "📝 Get started — fill in your name, date of birth and identity documents"}
                      {completeness >= 30 && completeness < 60 && "📎 Upload your Aadhaar, PAN and add your address to increase your score"}
                      {completeness >= 60 && completeness < 80 && "🏦 Almost there — add bank details and education to reach 80%"}
                      {completeness >= 80 && completeness < 100 && "✨ Looking great — submit your profile so employers can access your data"}
                    </div>
                  )}
                  {completeness === 100 && (
                    <div style={{fontSize:"0.65rem",color:"#16a34a",marginTop:"0.4rem",fontWeight:600}}>
                      ✅ Profile complete and submitted — employers with approved consent can view your data
                    </div>
                  )}
                </div>
              )}

              {/* Profile Photo */}
              <div className="sc ind">
                <div className="sh"><div className="si ind">📸</div><span className="st">Profile Photo <span style={{color:"#ef4444",fontSize:"0.8rem"}}>*</span></span></div>
                <div style={{display:"flex",alignItems:"center",gap:"1.25rem",flexWrap:"wrap"}}>
                  <div className="photo-wrap">
                    {photoPreview ? <img src={photoPreview} alt="profile"/> : <span style={{color:"#8b88b0",fontSize:"0.7rem",fontWeight:600,textAlign:"center",padding:"0 0.5rem"}}>No photo</span>}
                  </div>
                  <div style={{flex:1}}>
                    <FileUpload onUploadStateChange={handleUploadState} label="Upload Profile Photo" category="personal" subKey="photo" employeeId={employeeIdRef.current || employeeId} disabled={!draftReady} apiFetch={apiFetch} value={photoKey} onChange={(k, url) => { const key=typeof k==="string"?k:(k?.key||k?.s3_key||""); setPhotoKey(key); if (url) setPhotoPreview(url); else if (!key) setPhotoPreview(null); dirty(() => {})(""); }} accept="image/*"/>
                    <p style={{fontSize:"0.7rem",color:"#8b88b0",marginTop:4}}>JPG or PNG · max 5MB</p>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div className="sc cyn">
                <div className="sh"><div className="si cyn">✏️</div><span className="st">Full Name</span></div>
                <div className="fr">
                  <F l="First Name"  v={firstName}  s={dirty(setFirstName)} />
                  <F l="Middle Name" v={middleName} s={dirty(setMiddleName)} r={false} />
                  <F l="Last Name"   v={lastName}   s={dirty(setLastName)} />
                </div>
                {(firstName || lastName) && (
                  <div style={{marginTop:"0.5rem",padding:"0.5rem 0.875rem",background:"#e0f0ee",border:"1px solid #a8d5ce",borderRadius:8,fontSize:"0.82rem",fontWeight:700,color:"#0a5656",letterSpacing:"0.2px"}}>
                    👤 {[firstName, middleName, lastName].filter(Boolean).join(" ")}
                  </div>
                )}
              </div>

              {/* Father's Name */}
              <div className="sc vio">
                <div className="sh"><div className="si vio">👨</div><span className="st">Father's Name</span></div>
                <div className="fr">
                  <F l="First Name"  v={fatherFirst}  s={dirty(setFatherFirst)} />
                  <F l="Middle Name" v={fatherMiddle} s={dirty(setFatherMiddle)} r={false} />
                  <F l="Last Name"   v={fatherLast}   s={dirty(setFatherLast)} />
                </div>
                <div className="fr">
                  <DateField l="Father's Date of Birth" v={fatherDob} s={dirty(setFatherDob)} />
                </div>
                {(fatherFirst || fatherLast) && (
                  <div style={{marginTop:"0.5rem",padding:"0.5rem 0.875rem",background:"#f5f3ff",border:"1px solid #ddd6fe",borderRadius:8,fontSize:"0.82rem",fontWeight:700,color:"#6d28d9",letterSpacing:"0.2px"}}>
                    👨 {[fatherFirst, fatherMiddle, fatherLast].filter(Boolean).join(" ")}
                  </div>
                )}
              </div>

              {/* Mother's Name */}
              <div className="sc ros">
                <div className="sh"><div className="si ros">👩</div><span className="st">Mother's Name</span></div>
                <div className="fr">
                  <F l="First Name"  v={motherFirst}  s={dirty(setMotherFirst)} />
                  <F l="Middle Name" v={motherMiddle} s={dirty(setMotherMiddle)} r={false} />
                  <F l="Last Name"   v={motherLast}   s={dirty(setMotherLast)} />
                </div>
                <div className="fr">
                  <DateField l="Mother's Date of Birth" v={motherDob} s={dirty(setMotherDob)} />
                </div>
                {(motherFirst || motherLast) && (
                  <div style={{marginTop:"0.5rem",padding:"0.5rem 0.875rem",background:"#fff1f2",border:"1px solid #fecdd3",borderRadius:8,fontSize:"0.82rem",fontWeight:700,color:"#be123c",letterSpacing:"0.2px"}}>
                    👩 {[motherFirst, motherMiddle, motherLast].filter(Boolean).join(" ")}
                  </div>
                )}
              </div>

              {/* Personal Info */}
              <div className="sc amb">
                <div className="sh"><div className="si amb">🪪</div><span className="st">Personal Information</span></div>
                <div className="fr">
                  {/* DOB — no calendar */}
                  <DateField l="Date of Birth" v={dob} s={dirty(setDob)} />
                  <FS l="Gender" v={gender} s={v=>{dirty(setGender)(v);if(v!=="Other")dirty(setGenderOther)("");}} o={GENDER_OPTIONS} />
                  {gender==="Other" && <F l="Please specify" v={genderOther} s={dirty(setGenderOther)} />}
                  <F l="Nationality" v={nationality} s={dirty(setNationality)} />
                </div>
                <div className="fr">
                  <F l="Religion" v={religion} s={dirty(setReligion)} />
                  <F l="Category" v={category} s={dirty(setCategory)} />
                </div>
                <div className="fr">
                  <div className="fi">
                    <span className="fl">Email <span style={{color:"#ef4444"}}>*</span></span>
                    <input className="in" value={email} disabled />
                    <button
                      type="button"
                      onClick={()=>{setShowEmailChange(v=>!v);setEmailOtpSent(false);setEmailOtp("");setNewEmail("");setEmailChangeMsg("");setEmailChangeErr("");}}
                      style={{marginTop:"0.3rem",background:"none",border:"none",color:"#0d6e6e",fontSize:"0.7rem",fontWeight:700,cursor:"pointer",padding:0,fontFamily:"inherit",textDecoration:"underline"}}>
                      {showEmailChange?"Cancel":"Change email"}
                    </button>
                    {showEmailChange && (
                      <div style={{marginTop:"0.5rem",background:"#f0f9f4",border:"1.5px solid #a8d5c2",borderRadius:9,padding:"0.75rem"}}>
                        <div style={{fontSize:"0.72rem",fontWeight:700,color:"#0d6e6e",marginBottom:"0.4rem"}}>Change Email Address</div>
                        {!emailOtpSent ? (<>
                          <p style={{fontSize:"0.72rem",color:"#d97706",background:"#fffbeb",border:"1px solid #fde68a",borderRadius:6,padding:"0.4rem 0.6rem",margin:"0 0 0.5rem",lineHeight:1.5}}>
                            {"⚠️ Make sure you have saved your profile before changing your email. Unsaved changes will be lost."}
                          </p>
                          <input
                            className="in"
                            type="email"
                            placeholder="Enter new email address"
                            value={newEmail}
                            onChange={e=>{setNewEmail(e.target.value);setEmailChangeErr("");}}
                            style={{marginBottom:"0.4rem"}}
                          />
                          <button type="button" onClick={requestEmailChange} disabled={emailChangeLod}
                            style={{width:"100%",padding:"0.45rem",background:"#0d6e6e",color:"#fff",border:"none",borderRadius:7,fontSize:"0.78rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit",opacity:emailChangeLod?0.6:1}}>
                            {emailChangeLod?"Sending OTP…":"Send OTP to current email"}
                          </button>
                        </>) : (<>
                          <p style={{fontSize:"0.72rem",color:"#0d6e6e",margin:"0 0 0.4rem"}}>{emailChangeMsg}</p>
                          <input
                            className="in"
                            placeholder="Enter 6-digit OTP"
                            value={emailOtp}
                            maxLength={6}
                            onChange={e=>{setEmailOtp(e.target.value.replace(/\D/g,"").slice(0,6));setEmailChangeErr("");}}
                            style={{marginBottom:"0.4rem",letterSpacing:"4px",fontSize:"1rem",textAlign:"center"}}
                            inputMode="numeric"
                          />
                          <button type="button" onClick={verifyEmailChange} disabled={emailChangeLod}
                            style={{width:"100%",padding:"0.45rem",background:"#0d6e6e",color:"#fff",border:"none",borderRadius:7,fontSize:"0.78rem",fontWeight:700,cursor:"pointer",fontFamily:"inherit",opacity:emailChangeLod?0.6:1}}>
                            {emailChangeLod?"Verifying…":"Confirm email change"}
                          </button>
                        </>)}
                        {emailChangeErr && <p style={{fontSize:"0.72rem",color:"#b91c1c",margin:"0.35rem 0 0"}}>{emailChangeErr}</p>}
                      </div>
                    )}
                  </div>
                  <div className="fi">
                    <span className="fl">Mobile <span style={{color:"#ef4444"}}>*</span></span>
                    <div style={{display:"flex",gap:"0.4rem"}}>
                      <input className="in" value="+91" disabled style={{maxWidth:52,textAlign:"center"}} />
                      <input className="in" value={mobile} disabled style={{flex:1}} />
                    </div>
                  </div>
                </div>
                {/* Passport */}
                <div className="fr">
                  <div className="fi">
                    <span className="fl">Do you have a Passport? <span style={{color:"#ef4444"}}>*</span></span>
                    <div style={{display:"flex",gap:"0.55rem",marginTop:"0.15rem"}}>
                      {["Yes","No"].map(v=>(
                        <button key={v} type="button" onClick={()=>{dirty(setHasPassport)(v);if(v==="No"){setPassport("");setPassportIssue("");setPassportExpiry("");}}} style={{flex:1,padding:"0.62rem 0",borderRadius:9,border:hasPassport===v?"2px solid #0d6e6e":"1.5px solid #d8d4e3",background:hasPassport===v?"#0d6e6e":"#f5f4f0",color:hasPassport===v?"#fff":"#6b6894",cursor:"pointer",fontSize:"0.82rem",fontWeight:700,fontFamily:"inherit",transition:"all 0.18s"}}>{v}</button>
                      ))}
                    </div>
                  </div>
                  <div className="fi"/><div className="fi"/>
                </div>
                {hasPassport==="Yes"&&(
                  <>
                  <div className="fr">
                    <div className="fi">
                      <span className="fl">Passport Number <span style={{color:"#ef4444"}}>*</span></span>
                      <input className="in" value={passport} placeholder="e.g. A1234567" maxLength={8} onChange={e=>dirty(setPassport)(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,""))}/>
                    </div>
                    {/* Passport dates — no calendar */}
                    <DateField l="Issue Date" v={passportIssue} s={dirty(setPassportIssue)} />
                    <DateField l="Expiry Date" v={passportExpiry} s={dirty(setPassportExpiry)} />
                  </div>
                  <div style={{marginTop:"0.15rem"}}>
                    <span className="fl" style={{display:"block",marginBottom:"0.28rem"}}>Upload Passport <span style={{color:"#ef4444"}}>*</span></span>
                    <FileUpload onUploadStateChange={handleUploadState} label="Upload Passport" category="personal" subKey="passport" employeeId={employeeIdRef.current || employeeId} disabled={!draftReady} apiFetch={apiFetch} value={passportKey} onChange={(k)=>{const key=typeof k==="string"?k:(k?.key||k?.s3_key||"");setPassportKey(key);dirty(() => {})("");fixErr&&fixErr("passportKey");}}/>
                  </div>
                  </>
                )}
                <div className="fr">
                  <FS l="Blood Group"    v={bloodGroup}    s={dirty(setBloodGroup)}    o={["A+","A-","B+","B-","AB+","AB-","O+","O-"]} />
                  <FS l="Marital Status" v={maritalStatus} s={(v)=>{dirty(setMaritalStatus)(v);if(v!=="Married"){setSpouseName("");setSpouseDob("");}}} o={["Single","Married","Divorced","Widowed","Separated"]} />
                  <div className="fi" />
                </div>
              </div>

              {/* Spouse Details — appears when Married */}
              {maritalStatus==="Married" && (
                <div className="sc amb">
                  <div className="sh"><div className="si amb">💍</div><span className="st">Spouse Details</span></div>
                  <p style={{fontSize:"0.72rem",color:"#6b6894",marginBottom:"0.6rem"}}>Optional — only used for company health insurance dependent coverage.</p>
                  <div className="fr">
                    <F l="Spouse Name" v={spouseName} s={dirty(setSpouseName)} />
                    <DateField l="Spouse Date of Birth" v={spouseDob} s={dirty(setSpouseDob)} r={false} />
                    <div className="fi" />
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              <div className="sc ros">
                <div className="sh"><div className="si ros">🚨</div><span className="st">Emergency Contact</span></div>
                <div className="fr">
                  <F l="Contact Name"  v={emergName}  s={dirty(setEmergName)} />
                  <F l="Relationship"  v={emergRel}   s={dirty(setEmergRel)} />
                  <F l="Phone Number"  v={emergPhone} s={(v) => dirty(setEmergPhone)(v.replace(/\D/g,"").slice(0,10))} />
                </div>
              </div>

              {/* Identity Documents */}
              <div className="sc grn">
                <div className="sh"><div className="si grn">📄</div><span className="st">Identity Documents</span></div>
                <div className="fr">
                  {/* Aadhaar */}
                  <div className="fi">
                    <span className="fl">Aadhaar Number <span style={{color:"#ef4444"}}>*</span></span>
                    <input
                      className={`in${errors.aadhar?" err":""}`}
                      value={aadhaarDisplay}
                      placeholder="Enter 12-digit Aadhaar"
                      onFocus={() => setAadhaarEditing(true)}
                      onBlur={() => setAadhaarEditing(false)}
                      onChange={(e) => { const raw = e.target.value.replace(/[^0-9]/g, ""); if (raw.length <= 12) dirty(setAadhar)(raw); }}
                    />
                    {aadhar && aadhar.length !== 12 && aadhar.length !== 4 && <span className="fe">Must be exactly 12 digits ({aadhar.length}/12)</span>}
                    <div style={{marginTop:"0.75rem"}}>
                      <span className="fl" style={{display:"block",marginBottom:"0.28rem"}}>Name as per Aadhaar <span style={{color:"#ef4444"}}>*</span></span>
                      <input className={`in${errors.nameAsPerAadhaar?" err":""}`} value={nameAsPerAadhaar} placeholder="Exactly as printed on Aadhaar card" onChange={e=>{dirty(setNameAsPerAadhaar)(e.target.value);fixErr("nameAsPerAadhaar");}}/>
                      {errors.nameAsPerAadhaar && <span className="err-msg">Required</span>}
                    </div>
                    <div style={{marginTop:"0.75rem"}}>
                      <FileUpload onUploadStateChange={handleUploadState} label="Upload Aadhaar Card *" category="personal" subKey="aadhaar" employeeId={employeeIdRef.current || employeeId} disabled={!draftReady} apiFetch={apiFetch} value={aadhaarKey} onChange={(k) => { const key=typeof k==="string"?k:(k?.key||k?.s3_key||""); setAadhaarKey(key); dirty(() => {})(""); }} />
                    </div>
                  </div>
                  {/* PAN */}
                  <div className="fi">
                    <div className="fi">
                      <span className="fl">PAN Number <span style={{color:"#ef4444"}}>*</span></span>
                      <input
                        className={`in${panDuplicate?" err":""}`}
                        value={pan||""}
                        maxLength={10}
                        onChange={e=>{let val=e.target.value.toUpperCase().slice(0,10);if(val.length<=5)val=val.replace(/[^A-Z]/g,"");else if(val.length<=9)val=val.slice(0,5)+val.slice(5).replace(/[^0-9]/g,"");else val=val.slice(0,5)+val.slice(5,9)+val.slice(9).replace(/[^A-Z]/g,"");dirty(setPan)(val);setPanDuplicate(false);}}
                        onBlur={()=>checkPanDuplicate(pan)}
                      />
                    </div>
                    {pan && pan.length !== 10 && !panDuplicate && <span className="fe">Format: AAAAA9999A</span>}
                    {panDuplicate && (
                      <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:7,padding:"0.5rem 0.75rem",fontSize:"0.75rem",color:"#b91c1c",lineHeight:1.6,marginTop:"0.35rem"}}>
                        ⚠️ A Datagate profile already exists with this PAN number. Each person can have only one profile. <br/>
                        Sign in to your existing account or contact <a href="mailto:support@datagate.co.in" style={{color:"#b91c1c",fontWeight:700}}>support@datagate.co.in</a>.
                      </div>
                    )}
                    <div style={{marginTop:"0.75rem"}}>
                      <span className="fl" style={{display:"block",marginBottom:"0.28rem"}}>Name as per PAN <span style={{color:"#ef4444"}}>*</span></span>
                      <input className={`in${errors.nameAsPerPan?" err":""}`} value={nameAsPerPan} placeholder="Exactly as printed on PAN card" onChange={e=>{dirty(setNameAsPerPan)(e.target.value);fixErr("nameAsPerPan");}}/>
                      {errors.nameAsPerPan && <span className="err-msg">Required</span>}
                    </div>
                    <div style={{marginTop:"0.75rem"}}>
                      <FileUpload onUploadStateChange={handleUploadState} label="Upload PAN Card *" category="personal" subKey="pan" employeeId={employeeIdRef.current || employeeId} disabled={!draftReady} apiFetch={apiFetch} value={panKey} onChange={(k) => { const key=typeof k==="string"?k:(k?.key||k?.s3_key||""); setPanKey(key); dirty(() => {})(""); }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Bank Details ── */}
              <div className="sc teal">
                <div className="sh">
                  <div className="si teal">🏦</div>
                  <span className="st">Bank Account Details</span>
                </div>
                <div className="bank-note">
                  🏦 Please verify your bank details carefully — this will be used for salary processing.
                </div>
                <div className="fr">
                  <div className="fi">
                    <span className="fl">Bank Name <span style={{color:"#ef4444"}}>*</span></span>
                    <select className={`in${errors.bankName?" err":""}`} value={bankName} onChange={e=>{dirty(setBankName)(e.target.value);if(e.target.value!=="Other")setBankOther("");fixErr("bankName");}} style={{background:bankName?"#fff":"#f2f1f9",color:bankName?"#1a1730":"#8b88b0",appearance:"auto"}}>
                      <option value="">Select your bank</option>
                      {BANK_LIST.map(b=><option key={b} value={b}>{b}</option>)}
                    </select>
                    {bankName==="Other"&&(
                      <>
                        <input className={`in${errors.bankOther?" err":""}`} style={{marginTop:"0.4rem"}} value={bankOther} placeholder="Enter your bank name" onChange={e=>{dirty(setBankOther)(e.target.value);fixErr("bankOther");}}/>
                        {errors.bankOther && <span className="err-msg">Please enter your bank name</span>}
                      </>
                    )}
                    {errors.bankName && <span className="err-msg">Required</span>}
                  </div>
                  <div className="fi">
                    <span className="fl">Name as per Bank Account <span style={{color:"#ef4444"}}>*</span></span>
                    <input className={`in${errors.bankAccountName?" err":""}`} value={bankAccountName} placeholder="Full name as per bank records" onChange={e=>{dirty(setBankAccountName)(e.target.value);fixErr("bankAccountName");}}/>
                    {errors.bankAccountName && <span className="err-msg">Required</span>}
                  </div>
                </div>
                <div className="fr">
                  <div className="fi">
                    <span className="fl">IFSC Code <span style={{color:"#ef4444"}}>*</span></span>
                    <input className={`in${errors.ifsc?" err":""}`} value={ifsc} placeholder="e.g. SBIN0001234" maxLength={11} onChange={e=>{dirty(setIfsc)(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,""));fixErr("ifsc");}}/>
                    {errors.ifsc && <span className="err-msg">Required</span>}
                    {ifsc && ifsc.length !== 11 && <span className="fe">IFSC must be 11 characters</span>}
                  </div>
                  <div className="fi">
                    <span className="fl">Branch Name <span style={{color:"#ef4444"}}>*</span></span>
                    <input className={`in${errors.branch?" err":""}`} value={branch} placeholder="e.g. Hyderabad Main Branch" onChange={e=>{dirty(setBranch)(e.target.value);fixErr("branch");}}/>
                    {errors.branch && <span className="err-msg">Required</span>}
                  </div>
                  <div className="fi">
                    <span className="fl">Account Type <span style={{color:"#ef4444"}}>*</span></span>
                    <select className={`in${errors.accountType?" err":""}`} value={accountType} onChange={e=>{dirty(setAccountType)(e.target.value);fixErr("accountType");}} style={{background:accountType?"#fff":"#f2f1f9",color:accountType?"#1a1730":"#8b88b0",appearance:"auto"}}>
                      <option value="">Select</option>
                      <option value="Savings">Savings</option>
                      <option value="Current">Current</option>
                      <option value="Salary">Salary</option>
                      <option value="NRE">NRE</option>
                      <option value="NRO">NRO</option>
                    </select>
                    {errors.accountType && <span className="err-msg">Required</span>}
                  </div>
                </div>

                {/* ── Account Number with digit counter ── */}
                <div className="fr">
                  <div className="fi">
                    <span className="fl">Account Number <span style={{color:"#ef4444"}}>*</span></span>
                    {accountLast4 && !accountNo ? (
                      <div>
                        <input className="in" value={accountFull ? "•".repeat(accountFull.length-4)+" "+accountFull.slice(-4) : `•••• ${accountLast4}`} disabled style={{letterSpacing:"0.08em",fontFamily:"monospace"}}/>
                        <div className="digit-counter ok">✓ Account number saved</div>
                        <button type="button" onClick={()=>{setAccountFull("");setAccountLast4("");dirty(() => {})("");}} style={{marginTop:"0.3rem",fontSize:"0.68rem",color:"#0d6e6e",background:"none",border:"none",cursor:"pointer",fontWeight:600,padding:0}}>Update account number</button>
                      </div>
                    ) : (
                      <>
                        <input
                          className={`in${errors.accountNo?" err":""}`}
                          value={accountNo.length > 4 ? "•".repeat(accountNo.length - 4) + accountNo.slice(-4) : accountNo}
                          placeholder="Enter full account number"
                          inputMode="numeric"
                          onChange={e=>{
                            // value shown has bullets for masked chars — extract only real new digits
                            // bullets represent already-stored digits; new chars after bullets are new input
                            const raw = e.target.value;
                            const bulletCount = (raw.match(/•/g)||[]).length;
                            const newChars = raw.replace(/•/g,"").replace(/[^0-9]/g,"");
                            const result = accountNo.slice(0, bulletCount) + newChars;
                            dirty(setAccountNo)(result);
                            fixErr("accountNo");
                            if(accountNoConfirm) fixErr("accountNoConfirm");
                          }}
                        />
                        {/* Digit counter */}
                        {accountNo.length > 0 && (
                          <div className={`digit-counter ${accountNo.length >= 9 ? "ok" : "typing"}`}>
                            {accountNo.length} digit{accountNo.length !== 1 ? "s" : ""} entered
                            {accountNo.length >= 9 ? " ✓" : ` — most accounts are 9–18 digits`}
                          </div>
                        )}
                        {errors.accountNo && <span className="err-msg">Account number is required</span>}
                      </>
                    )}
                  </div>

                  <div className="fi">
                    <span className="fl">Re-enter Account Number <span style={{color:"#ef4444"}}>*</span></span>
                    {accountLast4 && !accountNo ? (
                      <div>
                        <input className="in" value={accountFull ? "•".repeat(accountFull.length-4)+" "+accountFull.slice(-4) : `•••• ${accountLast4}`} disabled style={{letterSpacing:"0.08em",fontFamily:"monospace"}}/>
                        <div className="digit-counter ok">✓ Confirmed</div>
                      </div>
                    ) : (
                      <>
                        <input
                          className={`in${errors.accountNoConfirm?" err":""}`}
                          value={accountNoConfirm.length > 4 ? "•".repeat(accountNoConfirm.length - 4) + accountNoConfirm.slice(-4) : accountNoConfirm}
                          placeholder="Re-enter to confirm"
                          inputMode="numeric"
                          onPaste={e=>e.preventDefault()}
                          onChange={e=>{
                            const raw2 = e.target.value;
                            const bulletCount2 = (raw2.match(/•/g)||[]).length;
                            const newChars2 = raw2.replace(/•/g,"").replace(/[^0-9]/g,"");
                            const result2 = accountNoConfirm.slice(0, bulletCount2) + newChars2;
                            // Cap confirm to same length as primary — no extra digits allowed
                            if (accountNo && result2.length > accountNo.length) return;
                            setAccountNoConfirm(result2);
                            dirty(() => {})("");
                            fixErr("accountNoConfirm");
                          }}
                        />
                        {/* Confirm digit counter + match status */}
                        {accountNoConfirm.length > 0 && (
                          <div className={`digit-counter ${
                            accountNo && accountNoConfirm && accountNo === accountNoConfirm
                              ? "match"
                              : accountNo && accountNoConfirm && accountNo !== accountNoConfirm && accountNoConfirm.length === accountNo.length
                              ? "mismatch"
                              : "typing"
                          }`}>
                            {accountNoConfirm.length} digit{accountNoConfirm.length !== 1 ? "s" : ""} entered
                            {accountNo && accountNoConfirm && accountNo === accountNoConfirm && " — ✓ Numbers match"}
                            {accountNo && accountNoConfirm && accountNo !== accountNoConfirm && accountNoConfirm.length === accountNo.length && " — ✗ Numbers don't match"}
                          </div>
                        )}
                        {errors.accountNoConfirm && <span className="err-msg">Account numbers do not match</span>}
                        {accountNoConfirm && accountNo && accountNo === accountNoConfirm && !errors.accountNoConfirm && (
                          <span style={{fontSize:"0.68rem",color:"#16a34a",marginTop:3,display:"block",fontWeight:600}}>✓ Account numbers match</span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* ── Bank proof — verified document for salary processing ── */}
                <div className="fr" style={{marginTop:"0.6rem"}}>
                  <div className="fi" style={{flex:"1 1 100%"}}>
                    <span className="fl">Upload Proof for Salary Processing — Passbook / Statement</span>
                    <FileUpload onUploadStateChange={handleUploadState} label="Upload Proof for Salary Processing *" category="personal" subKey="bankProof" employeeId={employeeIdRef.current || employeeId} disabled={!draftReady} apiFetch={apiFetch} value={bankProofKey} onChange={(k) => { const key=typeof k==="string"?k:(k?.key||k?.s3_key||""); setBankProofKey(key); dirty(() => {})(""); fixErr("bankProofKey"); }} />
                  </div>
                </div>
              </div>

              {/* Current Address */}
              <div className="sc ind">
                <div className="sh"><div className="si ind">🏠</div><span className="st">Current Address</span></div>
                <div className="fr">
                  {/* Residing from date — no calendar */}
                  <DateField l="Residing From" v={curFrom} s={dirty(setCurFrom)} r={false} />
                  <div className="fi" />
                </div>
                <div className="fr"><F l="Door No. & Street" v={curDoor} s={dirty(setCurDoor)} /></div>
                <div className="fr">
                  <F l="Village / Area"          v={curVillage}  s={dirty(setCurVillage)}  r={false} />
                  <F l="Tehsil / Taluk / Mandal" v={curLocality} s={dirty(setCurLocality)} r={false} />
                </div>
                <div className="fr">
                  <F l="District" v={curDistrict} s={dirty(setCurDistrict)} />
                  <F l="State"    v={curState}    s={dirty(setCurState)} />
                  <F l="Pincode"  v={curPin}      s={(v) => dirty(setCurPin)(v.replace(/\D/g,"").slice(0,6))} />
                </div>
              </div>

              {/* Permanent Address */}
              <div className="sc cyn">
                <div className="sh"><div className="si cyn">📍</div><span className="st">Permanent / Native Address</span></div>
                <div style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"1rem",padding:"0.65rem 0.875rem",background:"#f0f9ff",border:`1.5px solid ${sameAsCurrent?"#0891b2":"#bae6fd"}`,borderRadius:9,cursor:"pointer",transition:"all 0.15s"}}
                  onClick={() => { const v = !sameAsCurrent; setSameAsCurrent(v); dirty(() => {})(""); }}>
                  <div style={{width:18,height:18,borderRadius:5,border:`2px solid ${sameAsCurrent?"#0891b2":"#d8d4e3"}`,background:sameAsCurrent?"#0891b2":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>
                    {sameAsCurrent && <span style={{color:"#fff",fontWeight:800,fontSize:"0.7rem"}}>✓</span>}
                  </div>
                  <span style={{fontSize:"0.84rem",fontWeight:600,color:"#0c4a6e"}}>Same as current address</span>
                </div>
                {!sameAsCurrent && (<>
                  <div className="fr">
                    <DateField l="Residing From" v={permFrom} s={dirty(setPermFrom)} r={false} />
                    <div className="fi" />
                  </div>
                  <div className="fr"><F l="Door No. & Street" v={permDoor} s={dirty(setPermDoor)} /></div>
                  <div className="fr">
                    <F l="Village / Area"          v={permVillage}  s={dirty(setPermVillage)} r={false} />
                    <F l="Tehsil / Taluk / Mandal" v={permLocality} s={dirty(setPermLocality)} r={false} />
                  </div>
                  <div className="fr">
                    <F l="District" v={permDistrict} s={dirty(setPermDistrict)} />
                    <F l="State"    v={permState}    s={dirty(setPermState)} />
                    <F l="Pincode"  v={permPin}      s={(v) => dirty(setPermPin)(v.replace(/\D/g,"").slice(0,6))} />
                  </div>
                </>)}
                {sameAsCurrent && (
                  <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:9,padding:"0.75rem 1rem",fontSize:"0.8rem",color:"#15803d",fontWeight:500}}>
                    ✓ Same as current address — {[curDoor,curVillage,curDistrict,curState,curPin].filter(Boolean).join(", ") || "fill your current address above first"}
                  </div>
                )}
              </div>

              {/* Item 10 — Freshness warning banner */}
              {freshnessWarn && (
                <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8,padding:"0.65rem 1rem",marginBottom:"0.75rem",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"0.75rem"}}>
                  <div style={{fontSize:"0.75rem",color:"#92400e",lineHeight:1.5}}>
                    <strong>⚠️ Your profile data is over 6 months old.</strong> Please review and update any details that may have changed (address, bank account, etc.). Note: employers you've already approved will keep seeing the data as it was at the time you approved them — updating your profile here does not change what they see. If you'd like an existing employer to see your current data, you'll need to provide them a fresh consent.
                  </div>
                  <button onClick={()=>setFreshnessWarn(false)} style={{background:"none",border:"none",color:"#92400e",cursor:"pointer",fontSize:"1rem",flexShrink:0}}>✕</button>
                </div>
              )}

              <div className="sbar">
                <span className={`ss${saveStatus==="Saved ✓"?" ok":saveStatus.startsWith("Error")?" err":""}`}>{saveStatus}</span>
                <div style={{display:"flex",gap:"0.65rem",alignItems:"center"}}>
                  <button className="sbtn" onClick={handleMidSave} style={{fontSize:"0.8rem"}}>{midSaveStatus || "Save draft"}</button>
                  <button className="pbtn" onClick={handleSave} disabled={activeUploads>0} title={activeUploads>0?"Please wait for the upload to finish before saving":""}>{activeUploads>0?"Uploading…":"Save & Continue →"}</button>
                </div>
              </div>

            </>
          )}
        </div>
      </div>
    </>
  );
}
