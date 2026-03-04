// pages/employee/personal.js  — Page 1 of 4
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import ProgressBar from "../../components/ProgressBar";
import { useAuth } from "../../utils/AuthContext";
import { parseError } from "../../utils/apiError";

const API = process.env.NEXT_PUBLIC_API_URL_PROD;

function SignoutModal({ onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "2rem", maxWidth: 360, width: "90%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize: 36, marginBottom: "0.75rem" }}>👋</div>
        <h3 style={{ margin: "0 0 0.5rem", color: "#0f172a" }}>Sign out?</h3>
        <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Your progress is saved. You can continue anytime.</p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={onCancel}  style={{ flex: 1, padding: "0.75rem", borderRadius: 8, border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontWeight: 600 }}>Stay</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "0.75rem", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

function ConsentTab({ apiFetch, canRespond, profileStatus }) {
  const [consents, setConsents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [acting,   setActing]   = useState(null);

  const normalizeStatus = (s) => {
    const v = String(s || "pending").toLowerCase();
    if (["approved","approve","accepted","granted","allow"].includes(v)) return "approved";
    if (["declined","decline","rejected","denied","reject"].includes(v))  return "declined";
    return "pending";
  };
  const normalizeConsent = (c) => ({
    ...c,
    consent_id:      c?.consent_id || c?.id || c?.consentId || c?._id,
    status:          normalizeStatus(c?.status),
    employer_name:   c?.employer_name  || c?.employerName  || c?.company_name || c?.companyName || "",
    employer_email:  c?.employer_email || c?.employerEmail || c?.email || "",
    request_message: c?.message || c?.comment || c?.request_message || c?.note || "",
  });

  const load = useCallback(async () => {
    try {
      const res = await apiFetch(`${API}/consent/my`);
      if (res.ok) {
        const data = await res.json();
        setConsents(Array.isArray(data) ? data.map(normalizeConsent) : []);
      }
    } catch (_) {}
    setLoading(false);
  }, [apiFetch]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const id = setInterval(load, 15000); return () => clearInterval(id); }, [load]);

  const getConsentId = (c) => c.consent_id || c.id || c.consentId || c._id;
  const statusColor  = { pending: "#f59e0b", approved: "#16a34a", declined: "#ef4444" };

  const respond = async (consentId, decision) => {
    if (!canRespond) return;
    setActing(consentId);
    try {
      const res = await apiFetch(`${API}/consent/respond`, {
        method: "POST",
        body:   JSON.stringify({ consent_id: consentId, status: decision === "approve" ? "APPROVED" : "DECLINED", responded_at: Date.now() }),
      });
      if (res.ok) await load();
    } catch (_) {}
    setActing(null);
  };

  if (loading) return <p style={{ color: "#94a3b8", padding: "1rem 0" }}>Loading consents…</p>;
  if (!consents.length) return (
    <div style={{ textAlign: "center", padding: "2rem 0", color: "#94a3b8" }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
      <p style={{ margin: 0 }}>No consent requests yet</p>
      <p style={{ fontSize: "0.8rem", margin: "4px 0 0" }}>Employers will appear here when they request your data</p>
    </div>
  );

  const pending  = consents.filter(c => c.status === "pending");
  const approved = consents.filter(c => c.status === "approved");
  const declined = consents.filter(c => c.status === "declined");

  const ConsentCard = ({ c }) => (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "1rem", marginBottom: "0.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.95rem" }}>{c.employer_name || c.employer_email}</div>
          {c.request_message && <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 2, fontStyle: "italic" }}>"{c.request_message}"</div>}
          {(c.approved_at || c.responded_at || c.updated_at) && <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 4 }}>Responded: {new Date(c.approved_at || c.responded_at || c.updated_at).toLocaleString("en-IN")}</div>}
        </div>
        <span style={{ padding: "0.2rem 0.7rem", borderRadius: 999, fontSize: "0.75rem", fontWeight: 700, color: "#fff", background: statusColor[c.status] || "#94a3b8", whiteSpace: "nowrap" }}>
          {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
        </span>
      </div>
      {c.status === "pending" && (
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
          <button disabled={!canRespond || acting === getConsentId(c)} onClick={() => respond(getConsentId(c), "approve")} style={{ flex: 1, padding: "0.5rem", background: "#16a34a", color: "#fff", border: "none", borderRadius: 7, fontWeight: 600, cursor: "pointer" }}>{acting === getConsentId(c) ? "…" : "Approve"}</button>
          <button disabled={!canRespond || acting === getConsentId(c)} onClick={() => respond(getConsentId(c), "decline")} style={{ flex: 1, padding: "0.5rem", background: "#fff", color: "#ef4444", border: "1px solid #ef4444", borderRadius: 7, fontWeight: 600, cursor: "pointer" }}>{acting === getConsentId(c) ? "…" : "Decline"}</button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      {!canRespond && (
        <div style={{ marginBottom: "0.75rem", padding: "0.75rem", borderRadius: 8, background: "#fff7ed", color: "#9a3412", fontSize: "0.82rem", border: "1px solid #fed7aa" }}>
          Complete and submit all 4 profile pages to approve/decline consent requests. Current profile status: <strong>{profileStatus || "draft"}</strong>.
        </div>
      )}
      {pending.length  > 0 && <><div style={sectionLabelStyle}>Pending ({pending.length})</div>{pending.map(c  => <ConsentCard key={getConsentId(c)} c={c} />)}</>}
      {approved.length > 0 && <><div style={sectionLabelStyle}>Approved</div>{approved.map(c => <ConsentCard key={getConsentId(c)} c={c} />)}</>}
      {declined.length > 0 && <><div style={sectionLabelStyle}>Declined</div>{declined.map(c => <ConsentCard key={getConsentId(c)} c={c} />)}</>}
    </div>
  );
}

const sectionLabelStyle = { fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, margin: "1rem 0 0.5rem" };

export default function PersonalDetails() {
  const router = useRouter();
  const { user, apiFetch, logout, ready } = useAuth();

  const [activeTab,     setActiveTab]     = useState("profile");
  const [showSignout,   setShowSignout]   = useState(false);
  const [profileStatus, setProfileStatus] = useState("draft");
  const [employeeId,    setEmployeeId]    = useState("");
  const [saveStatus,    setSaveStatus]    = useState("");
  const [loading,       setLoading]       = useState(true);
  const [photoPreview,  setPhotoPreview]  = useState(null);

  const [firstName,    setFirstName]    = useState("");
  const [middleName,   setMiddleName]   = useState("");
  const [lastName,     setLastName]     = useState("");
  const [fatherFirst,  setFatherFirst]  = useState("");
  const [fatherMiddle, setFatherMiddle] = useState("");
  const [fatherLast,   setFatherLast]   = useState("");
  const [dob,          setDob]          = useState("");
  const [gender,       setGender]       = useState("");
  const [nationality,  setNationality]  = useState("");
  const [mobile,       setMobile]       = useState("");
  const [email,        setEmail]        = useState("");
  const [aadhar,       setAadhar]       = useState("");
  const [pan,          setPan]          = useState("");
  const [passport,     setPassport]     = useState("");
  const [curFrom,      setCurFrom]      = useState("");
  const [curTo,        setCurTo]        = useState("");
  const [curDoor,      setCurDoor]      = useState("");
  const [curVillage,   setCurVillage]   = useState("");
  const [curDistrict,  setCurDistrict]  = useState("");
  const [curPin,       setCurPin]       = useState("");
  const [permFrom,     setPermFrom]     = useState("");
  const [permDoor,     setPermDoor]     = useState("");
  const [permVillage,  setPermVillage]  = useState("");
  const [permDistrict, setPermDistrict] = useState("");
  const [permPin,      setPermPin]      = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/employee/login"); return; }
  }, [ready, user, router]);

  // Fetch from API on mount — works on any device, any browser
  useEffect(() => {
    if (!ready || !user) return;
    if (user?.email) setEmail(user.email);
    if (user?.phone) setMobile(user.phone);

    const fetchDraft = async () => {
      try {
        const res = await apiFetch(`${API}/employee/draft`);
        if (res.ok) {
          const d = await res.json();
          if (d.employee_id) setEmployeeId(d.employee_id);
          if (d.status)      setProfileStatus(String(d.status).toLowerCase());
          if (d.firstName)           setFirstName(d.firstName);
          if (d.middleName)          setMiddleName(d.middleName);
          if (d.lastName)            setLastName(d.lastName);
          if (d.fatherFirst)         setFatherFirst(d.fatherFirst);
          if (d.fatherMiddle)        setFatherMiddle(d.fatherMiddle);
          if (d.fatherLast)          setFatherLast(d.fatherLast);
          if (d.dob)                 setDob(d.dob);
          if (d.gender)              setGender(d.gender);
          if (d.nationality)         setNationality(d.nationality);
          if (d.mobile)              setMobile(d.mobile);
          if (d.email)               setEmail(d.email);
          if (d.aadhaar || d.aadhar) setAadhar(d.aadhaar || d.aadhar);
          if (d.pan)                 setPan(d.pan);
          if (d.passport)            setPassport(d.passport);
          const cur  = d.currentAddress   || {};
          const perm = d.permanentAddress || {};
          if (cur.from)     setCurFrom(cur.from);
          if (cur.to)       setCurTo(cur.to);
          if (cur.door)     setCurDoor(cur.door);
          if (cur.village)  setCurVillage(cur.village);
          if (cur.district) setCurDistrict(cur.district);
          if (cur.pin)      setCurPin(cur.pin);
          if (perm.from)     setPermFrom(perm.from);
          if (perm.door)     setPermDoor(perm.door);
          if (perm.village)  setPermVillage(perm.village);
          if (perm.district) setPermDistrict(perm.district);
          if (perm.pin)      setPermPin(perm.pin);
        }
        // 404 = new user, no draft yet — that's fine, show empty form
      } catch (_) {}
      setLoading(false);
    };
    fetchDraft();
  }, [ready, user, apiFetch]);

  const saveDraft = async () => {
    const empId = employeeId || `emp-${Date.now()}`;
    if (!employeeId) setEmployeeId(empId);

    const res = await apiFetch(`${API}/employee`, {
      method: "POST",
      body:   JSON.stringify({
        employee_id:  empId,
        status:       profileStatus === "submitted" ? "submitted" : "draft",
        firstName,    lastName,    middleName,
        fatherName:   `${fatherFirst} ${fatherMiddle} ${fatherLast}`.trim(),
        fatherFirst,  fatherMiddle, fatherLast,
        dob,          gender,       nationality,
        mobile,       email,
        aadhaar:      aadhar,
        pan,          passport,
        currentAddress:   { from: curFrom, to: curTo, door: curDoor, village: curVillage, district: curDistrict, pin: curPin },
        permanentAddress: { from: permFrom, door: permDoor, village: permVillage, district: permDistrict, pin: permPin },
      }),
    });
    if (!res.ok) throw new Error(parseError(await res.json().catch(() => ({}))));
    const rd = await res.json().catch(() => ({}));
    if (rd.employee_id) setEmployeeId(rd.employee_id);
  };

  const handleSave = async () => {
    setSaveStatus("Saving...");
    try {
      await saveDraft();
      setSaveStatus("Saved ✓");
      router.push("/employee/education");
    } catch (err) {
      setSaveStatus(`Error: ${err.message || "Could not save"}`);
    }
  };

  const handleSignout = async () => {
    setSaveStatus("Saving before sign out...");
    try { await saveDraft(); } catch (_) {}
    logout();
  };

  if (!ready || !user) return null;
  if (loading) return <div style={{ ...styles.page, display:"flex", alignItems:"center", justifyContent:"center" }}><p style={{ color:"#64748b" }}>Loading your profile…</p></div>;

  return (
    <div style={styles.page}>
      {showSignout && <SignoutModal onConfirm={handleSignout} onCancel={() => setShowSignout(false)} />}
      <div style={styles.card}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
          <span style={{ fontSize:"0.85rem", color:"#475569" }}>👤 {user.name || user.email}</span>
          <button onClick={() => setShowSignout(true)} style={styles.signoutBtn}>Sign out</button>
        </div>
        <div style={styles.tabRow}>
          <button style={{ ...styles.tab, ...(activeTab === "profile"  ? styles.tabActive : {}) }} onClick={() => setActiveTab("profile")}>My Profile</button>
          <button style={{ ...styles.tab, ...(activeTab === "consents" ? styles.tabActive : {}) }} onClick={() => setActiveTab("consents")}>Consent Requests</button>
        </div>

        {activeTab === "consents" ? (
          <ConsentTab apiFetch={apiFetch} canRespond={profileStatus === "submitted"} profileStatus={profileStatus} />
        ) : (
          <>
            <ProgressBar currentStep={1} totalSteps={4} />
            <h1 style={styles.title}>Personal Details</h1>

            <Section title="Profile Photo">
              <div style={{ textAlign:"center" }}>
                {photoPreview ? <img src={photoPreview} style={styles.photo} alt="profile" /> : <div style={styles.photoPlaceholder}>Upload Photo</div>}
                <input type="file" accept="image/*" onChange={(e) => setPhotoPreview(URL.createObjectURL(e.target.files[0]))} />
              </div>
            </Section>

            <Section title="Name">
              <Row><Input label="First Name" value={firstName} onChange={setFirstName} /><Input label="Middle Name" value={middleName} onChange={setMiddleName} /><Input label="Last Name" value={lastName} onChange={setLastName} /></Row>
            </Section>

            <Section title="Father Name">
              <Row><Input label="First Name" value={fatherFirst} onChange={setFatherFirst} /><Input label="Middle Name" value={fatherMiddle} onChange={setFatherMiddle} /><Input label="Last Name" value={fatherLast} onChange={setFatherLast} /></Row>
            </Section>

            <Section title="Personal Information">
              <Row>
                <Input type="date" label="Date of Birth" value={dob} onChange={setDob} />
                <SelectField label="Gender" value={gender} onChange={setGender} options={["Male","Female","Other"]} />
                <Input label="Nationality" value={nationality} onChange={setNationality} />
              </Row>
              <Row>
                <div style={{ flex:1 }}><label style={styles.label}>Email (from signup)</label><input value={email} disabled style={{ ...styles.input, background:"#f1f5f9", color:"#64748b" }} /></div>
                <div style={{ flex:1 }}><label style={styles.label}>Mobile Number (India)</label><div style={{ display:"flex", gap:"0.5rem" }}><input value="+91" disabled style={{ ...styles.input, maxWidth:"80px", background:"#e5e7eb" }} /><input value={mobile} disabled style={{ ...styles.input, background:"#f1f5f9", color:"#64748b" }} /></div></div>
                <Input label="Passport Number" value={passport} onChange={setPassport} />
              </Row>
            </Section>

            <Section title="Identity Documents">
              <Row>
                <div style={{ flex:1 }}>
                  <Input label="Aadhaar Number" value={aadhar} onChange={(v) => { const d = v.replace(/\D/g,""); if (d.length <= 12) setAadhar(d); }} />
                  {aadhar && aadhar.length !== 12 && <p style={styles.error}>Must be 12 digits</p>}
                  <div style={{ marginTop:"0.5rem" }}><label style={styles.label}>Upload Aadhaar (coming soon)</label><input type="file" accept=".pdf,.jpg,.jpeg,.png" disabled style={{ opacity:0.5 }} /></div>
                </div>
                <div style={{ flex:1 }}>
                  <Input label="PAN Number" value={pan} onChange={(v) => { let val = v.toUpperCase(); if (val.length<=5) val=val.replace(/[^A-Z]/g,""); else if(val.length<=9) val=val.slice(0,5)+val.slice(5).replace(/[^0-9]/g,""); else if(val.length<=10) val=val.slice(0,5)+val.slice(5,9).replace(/[^0-9]/g,"")+val.slice(9).replace(/[^A-Z]/g,""); setPan(val); }} />
                  {pan && pan.length !== 10 && <p style={styles.error}>Format: AAAAA9999A</p>}
                  <div style={{ marginTop:"0.5rem" }}><label style={styles.label}>Upload PAN (coming soon)</label><input type="file" accept=".pdf,.jpg,.jpeg,.png" disabled style={{ opacity:0.5 }} /></div>
                </div>
              </Row>
            </Section>

            <Section title="Current Address">
              <Row><Input type="date" label="Residing From" value={curFrom} onChange={setCurFrom} /><Input type="date" label="Residing To" value={curTo} onChange={setCurTo} /></Row>
              <Input label="Door & Street"    value={curDoor}     onChange={setCurDoor} />
              <Input label="Village / Mandal" value={curVillage}  onChange={setCurVillage} />
              <Input label="District / State" value={curDistrict} onChange={setCurDistrict} />
              <Input label="Pincode"          value={curPin}      onChange={(v) => setCurPin(v.replace(/\D/g,""))} />
            </Section>

            <Section title="Permanent Address">
              <Input type="date" label="Residing From" value={permFrom}     onChange={setPermFrom} />
              <Input label="Door & Street"              value={permDoor}     onChange={setPermDoor} />
              <Input label="Village / Mandal"           value={permVillage}  onChange={setPermVillage} />
              <Input label="District / State"           value={permDistrict} onChange={setPermDistrict} />
              <Input label="Pincode"                    value={permPin}      onChange={(v) => setPermPin(v.replace(/\D/g,""))} />
            </Section>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ color: saveStatus.startsWith("Error") ? "#dc2626" : "#64748b", fontSize:"0.85rem" }}>{saveStatus}</span>
              <button onClick={handleSave} style={{ ...styles.button, background:"#2563eb" }}>Save & Proceed →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const Section     = ({ title, children }) => (<div style={{ marginBottom:"2rem" }}><h2 style={styles.sectionTitle}>{title}</h2>{children}</div>);
const Row         = ({ children }) => <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap" }}>{children}</div>;
const Input       = ({ label, value, onChange, type="text" }) => (<div style={{ flex:1, minWidth:"200px" }}><label style={styles.label}>{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={styles.input} /></div>);
const SelectField = ({ label, value, onChange, options }) => (<div style={{ flex:1 }}><label style={styles.label}>{label}</label><select value={value} onChange={(e) => onChange(e.target.value)} style={styles.input}><option value="">Select</option>{options.map((o) => <option key={o}>{o}</option>)}</select></div>);

const styles = {
  page:             { background:"#f1f5f9", padding:"2rem", minHeight:"100vh", fontFamily:"Inter, system-ui, sans-serif" },
  card:             { maxWidth:"980px", margin:"auto", background:"#fff", padding:"2rem", borderRadius:"14px", boxShadow:"0 12px 30px rgba(0,0,0,0.08)" },
  title:            { marginBottom:"2rem" },
  sectionTitle:     { marginBottom:"1rem", color:"#0f172a" },
  label:            { fontSize:"0.85rem", color:"#475569" },
  input:            { width:"100%", padding:"0.65rem", borderRadius:"8px", border:"1px solid #cbd5e1" },
  button:           { padding:"0.9rem 2.5rem", borderRadius:"10px", border:"none", color:"#fff", fontSize:"1rem", cursor:"pointer" },
  photo:            { width:"140px", height:"140px", borderRadius:"50%", objectFit:"cover", marginBottom:"0.5rem" },
  photoPlaceholder: { width:"140px", height:"140px", borderRadius:"50%", background:"#e5e7eb", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"0.5rem" },
  error:            { color:"#dc2626", fontSize:"0.8rem", marginTop:"0.25rem" },
  signoutBtn:       { padding:"0.4rem 1rem", border:"1px solid #e2e8f0", borderRadius:7, background:"#fff", color:"#64748b", fontSize:"0.85rem", cursor:"pointer", fontWeight:600 },
  tabRow:           { display:"flex", borderBottom:"2px solid #e2e8f0", marginBottom:"1.5rem", gap:4 },
  tab:              { padding:"0.6rem 1.25rem", border:"none", background:"none", fontSize:"0.95rem", color:"#64748b", cursor:"pointer", borderBottom:"2px solid transparent", marginBottom:-2, fontWeight:500 },
  tabActive:        { color:"#2563eb", borderBottomColor:"#2563eb", fontWeight:700 },
};
