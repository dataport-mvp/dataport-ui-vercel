// pages/employee/personal.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";
import ProgressBar from "../../components/ProgressBar";

export default function PersonalDetails() {
  const router = useRouter();
  const { user, apiCall, isAuthenticated, loading: authLoading } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/employee/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Generate employee_id from user email
  const [employeeId] = useState(() => {
    if (typeof window !== 'undefined' && user?.email) {
      return `emp-${Date.now()}`;
    }
    return '';
  });

  const [formData, setFormData] = useState({
    employee_id: employeeId,
    firstName: "",
    lastName: "",
    fatherName: "",
    mobile: "",
    email: user?.email || "",
    aadhaar: "",
    pan: "",
    education: [],
    pfRecords: [],
    uanNumber: "",
    nameAsPerUan: "",
    mobileLinked: "Yes",
    isActive: "Yes"
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setError("");
    setSaving(true);

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName) {
        throw new Error("First name and last name are required");
      }
      if (!formData.mobile.match(/^\d{10}$/)) {
        throw new Error("Mobile number must be 10 digits");
      }
      if (formData.aadhaar && formData.aadhaar.length !== 12) {
        throw new Error("Aadhaar must be 12 digits");
      }
      if (formData.pan && formData.pan.length !== 10) {
        throw new Error("PAN must be in format: AAAAA9999A");
      }

      // Call API with proper structure
      const payload = {
        employee_id: formData.employee_id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        fatherName: formData.fatherName || null,
        mobile: formData.mobile,
        email: formData.email,
        aadhaar: formData.aadhaar || null,
        pan: formData.pan || null,
        education: formData.education,
        pfRecords: formData.pfRecords,
        uanNumber: formData.uanNumber || null,
        nameAsPerUan: formData.nameAsPerUan || null,
        mobileLinked: formData.mobileLinked,
        isActive: formData.isActive
      };

      await apiCall('/employee', 'POST', payload);

      alert("Profile saved successfully!");
      router.push("/employee/education");

    } catch (err) {
      console.error("Error saving:", err);
      setError(err.message || "Failed to save personal details");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <ProgressBar currentStep={1} totalSteps={4} />
        
        <h1 style={styles.title}>Personal Details</h1>

        {error && <div style={styles.error}>⚠️ {error}</div>}

        <Section title="Basic Information">
          <Row>
            <Input 
              label="First Name *" 
              value={formData.firstName} 
              onChange={(v) => handleChange('firstName', v)}
            />
            <Input 
              label="Last Name *" 
              value={formData.lastName} 
              onChange={(v) => handleChange('lastName', v)}
            />
          </Row>
          <Input 
            label="Father's Name" 
            value={formData.fatherName} 
            onChange={(v) => handleChange('fatherName', v)}
          />
        </Section>

        <Section title="Contact Information">
          <Input 
            label="Email" 
            value={formData.email} 
            onChange={(v) => handleChange('email', v)}
            disabled
          />
          
          <div>
            <label style={styles.label}>Mobile Number (India) *</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                value="+91"
                disabled
                style={{ ...styles.input, maxWidth: '80px', background: '#e5e7eb' }}
              />
              <input
                value={formData.mobile}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '');
                  if (digits.length <= 10) handleChange('mobile', digits);
                }}
                style={styles.input}
                placeholder="9876543210"
              />
            </div>
            {formData.mobile && formData.mobile.length !== 10 && (
              <p style={styles.hint}>Mobile must be 10 digits</p>
            )}
          </div>
        </Section>

        <Section title="Identity Documents (Optional)">
          <Row>
            <div style={{ flex: 1 }}>
              <Input
                label="Aadhaar Number"
                value={formData.aadhaar}
                onChange={(v) => {
                  const digits = v.replace(/\D/g, '');
                  if (digits.length <= 12) handleChange('aadhaar', digits);
                }}
                placeholder="123456789012"
              />
              {formData.aadhaar && formData.aadhaar.length !== 12 && (
                <p style={styles.hint}>Aadhaar must be 12 digits</p>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <Input
                label="PAN Number"
                value={formData.pan}
                onChange={(v) => {
                  let value = v.toUpperCase();
                  if (value.length <= 5) {
                    value = value.replace(/[^A-Z]/g, '');
                  } else if (value.length <= 9) {
                    value = value.slice(0, 5).replace(/[^A-Z]/g, '') + 
                            value.slice(5).replace(/[^0-9]/g, '');
                  } else if (value.length <= 10) {
                    value = value.slice(0, 5).replace(/[^A-Z]/g, '') +
                            value.slice(5, 9).replace(/[^0-9]/g, '') +
                            value.slice(9).replace(/[^A-Z]/g, '');
                  }
                  handleChange('pan', value);
                }}
                placeholder="ABCDE1234F"
              />
              {formData.pan && formData.pan.length !== 10 && (
                <p style={styles.hint}>PAN format: AAAAA9999A</p>
              )}
            </div>
          </Row>
        </Section>

        <div style={{ marginTop: '2rem' }}>
          <button
            onClick={handleSave}
            style={{
              ...styles.button,
              opacity: saving ? 0.6 : 1,
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save & Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
}

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '2rem' }}>
    <h2 style={styles.sectionTitle}>{title}</h2>
    {children}
  </div>
);

const Row = ({ children }) => (
  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>{children}</div>
);

const Input = ({ label, value, onChange, type = 'text', disabled = false, placeholder = '' }) => (
  <div style={{ flex: 1, minWidth: '200px' }}>
    <label style={styles.label}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={styles.input}
      disabled={disabled}
      placeholder={placeholder}
    />
  </div>
);

const styles = {
  page: {
    background: '#f1f5f9',
    padding: '2rem',
    minHeight: '100vh',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  card: {
    maxWidth: '980px',
    margin: 'auto',
    background: '#fff',
    padding: '2rem',
    borderRadius: '14px',
    boxShadow: '0 12px 30px rgba(0,0,0,0.08)'
  },
  title: {
    marginBottom: '2rem',
    color: '#0f172a'
  },
  error: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem'
  },
  sectionTitle: {
    marginBottom: '1rem',
    color: '#0f172a',
    fontSize: '1.1rem'
  },
  label: {
    fontSize: '0.85rem',
    color: '#475569',
    display: 'block',
    marginBottom: '0.5rem'
  },
  input: {
    width: '100%',
    padding: '0.65rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '1rem'
  },
  hint: {
    color: '#dc2626',
    fontSize: '0.8rem',
    marginTop: '0.25rem'
  },
  button: {
    padding: '0.9rem 2.5rem',
    borderRadius: '10px',
    border: 'none',
    background: '#2563eb',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600'
  }
};
