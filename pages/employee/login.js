// pages/employee/login.js
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../utils/AuthContext";

export default function EmployeeLogin() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { login, signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        if (!fullName.trim()) {
          throw new Error("Full name is required");
        }
        if (!mobile.match(/^\d{10}$/)) {
          throw new Error("Mobile number must be 10 digits");
        }
        
        await signup(email, password, fullName, mobile, "employee");
      } else {
        await login(email, password);
      }
      
      router.push("/employee/personal");
      
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>
          {isSignup ? "Create Employee Account" : "Employee Login"}
        </h1>

        {error && <div style={styles.error}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              disabled={loading}
              minLength={6}
            />
          </div>

          {isSignup && (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={styles.input}
                  disabled={loading}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Mobile Number</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    value="+91"
                    disabled
                    style={{ ...styles.input, maxWidth: '60px', background: '#e5e7eb' }}
                  />
                  <input
                    type="tel"
                    placeholder="9876543210"
                    required
                    value={mobile}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '');
                      if (digits.length <= 10) setMobile(digits);
                    }}
                    style={styles.input}
                    disabled={loading}
                  />
                </div>
                {mobile && mobile.length !== 10 && (
                  <p style={styles.hint}>Must be exactly 10 digits</p>
                )}
              </div>
            </>
          )}

          <button 
            type="submit" 
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isSignup ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <p style={styles.toggleText}>
          {isSignup ? "Already have an account?" : "First time here?"}{" "}
          <span
            style={styles.toggleLink}
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
            }}
          >
            {isSignup ? "Sign In" : "Create Account"}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem'
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    padding: '3rem',
    maxWidth: '450px',
    width: '100%'
  },
  title: {
    marginBottom: '2rem',
    textAlign: 'center',
    color: '#1f2937'
  },
  error: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    fontSize: '0.9rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151'
  },
  input: {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
    width: '100%'
  },
  hint: {
    fontSize: '0.75rem',
    color: '#dc2626',
    marginTop: '0.25rem'
  },
  button: {
    padding: '0.875rem',
    borderRadius: '8px',
    border: 'none',
    background: '#667eea',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    marginTop: '0.5rem'
  },
  toggleText: {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: '#6b7280'
  },
  toggleLink: {
    color: '#667eea',
    cursor: 'pointer',
    fontWeight: '600'
  }
};
