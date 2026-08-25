import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { roleHome } from "../utils/roles";
import logo from "../assets/dost-logo.png";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "signup" || tab === "register") {
      setActiveTab("signup");
    } else if (tab === "login") {
      setActiveTab("login");
    }
  }, [location.search]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    try {
      const data = await login(email, password);
      navigate(roleHome(data.user.role));
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || "Login failed. Please check your credentials.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);
    const name = e.target.name.value.trim();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    const department = e.target.department ? e.target.department.value.trim() : "";
    try {
      const res = await register({ name, email, password, department });
      setSuccessMessage(res?.message || "Registration submitted! Your account is currently pending administrator approval before you can log in.");
      setActiveTab("login");
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || "Registration failed. Please try again.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={{ textAlign: "left", marginBottom: "8px" }}>
          <button 
            type="button"
            onClick={() => navigate("/")} 
            style={{ background: "none", border: "none", color: "#2563EB", cursor: "pointer", fontSize: "13px", fontWeight: "600", padding: "4px 0" }}
          >
            ← Back to Home
          </button>
        </div>
        <img src={logo} alt="DOST Logo" style={styles.logo} />
        <h2 style={styles.title}>DOST Academy System</h2>
        <p style={styles.subtitle}>Centralized Learning Management System</p>

        {successMessage && (
          <div style={styles.successBox}>
            <span style={{ fontSize: "20px" }}>✅</span>
            <div>
              <strong>Registration Received</strong>
              <p style={{ margin: "4px 0 0", fontSize: "13px" }}>{successMessage}</p>
            </div>
          </div>
        )}

        {error && (
          <div style={styles.errorBox}>
            <span style={{ fontSize: "18px" }}>⚠️</span>
            <span style={{ fontSize: "13px", lineHeight: "1.4" }}>{error}</span>
          </div>
        )}

        <div style={styles.tabRow}>
          <button
            style={activeTab === "login" ? styles.activeTab : styles.tab}
            onClick={() => { setActiveTab("login"); setError(""); }}
          >
            Login
          </button>
          <button
            style={activeTab === "signup" ? styles.activeTab : styles.tab}
            onClick={() => { setActiveTab("signup"); setError(""); setSuccessMessage(""); }}
          >
            Register
          </button>
        </div>

        {activeTab === "login" ? (
          <form onSubmit={handleLogin} style={styles.form}>
            <input name="email" type="email" placeholder="Official Email (e.g. user@dost.gov.ph)" style={styles.input} required />
            <input name="password" type="password" placeholder="Password" style={styles.input} required />
            <div style={styles.options}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <input type="checkbox" /> Remember me
              </label>
              <button
                type="button"
                style={styles.forgot}
                onClick={() => setError("Password resets are managed by the administrator. Please reach out to your system admin.")}
              >
                Need Help?
              </button>
            </div>
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Authenticating..." : "Login to LMS"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} style={styles.form}>
            <div style={styles.infoNotice}>
              ℹ️ New learner accounts require Administrator review & approval prior to first login.
            </div>
            <input name="name" type="text" placeholder="Full Name" style={styles.input} required />
            <input name="email" type="email" placeholder="Official Email Address" style={styles.input} required />
            <input name="department" type="text" placeholder="Branch / Department / Division" style={styles.input} />
            <input name="password" type="password" placeholder="Create Password (min. 6 characters)" style={styles.input} minLength={6} required />
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Submitting Registration..." : "Submit for Approval"}
            </button>
          </form>
        )}

        <div style={styles.footerNote}>
          Department of Science and Technology • Republic of the Philippines
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(135deg, #EEF2FF, #F8FAFC)", fontFamily: "Arial, sans-serif" },
  container: { width: "100%", maxWidth: "440px", textAlign: "center", backgroundColor: "#fff", padding: "36px 32px", borderRadius: "18px", boxShadow: "0 10px 30px rgba(11, 31, 94, 0.08)" },
  logo: { width: "85px", marginBottom: "12px" },
  title: { margin: "8px 0 4px", color: "#0B1F5E", fontSize: "24px", fontWeight: "700" },
  subtitle: { marginBottom: "20px", color: "#64748B", fontSize: "14px" },
  successBox: { display: "flex", alignItems: "flex-start", gap: "10px", backgroundColor: "#ECFDF5", color: "#065F46", padding: "12px 14px", borderRadius: "10px", textAlign: "left", marginBottom: "16px", border: "1px solid #A7F3D0" },
  errorBox: { display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#FEF2F2", color: "#B91C1C", padding: "12px 14px", borderRadius: "10px", textAlign: "left", marginBottom: "16px", border: "1px solid #FECACA" },
  infoNotice: { backgroundColor: "#EFF6FF", color: "#1D4ED8", padding: "10px 12px", borderRadius: "8px", fontSize: "12px", textAlign: "left", marginBottom: "12px", lineHeight: "1.4" },
  tabRow: { display: "flex", marginBottom: "20px", background: "#F1F5F9", borderRadius: "10px", padding: "4px" },
  tab: { flex: 1, padding: "10px", border: "none", background: "transparent", cursor: "pointer", fontWeight: "600", color: "#64748B", borderRadius: "8px" },
  activeTab: { flex: 1, padding: "10px", border: "none", background: "#2563EB", color: "#fff", borderRadius: "8px", cursor: "pointer", fontWeight: "700" },
  form: { display: "flex", flexDirection: "column" },
  input: { padding: "12px 14px", marginBottom: "12px", borderRadius: "9px", border: "1px solid #CBD5E1", fontSize: "14px", outline: "none", boxSizing: "border-box" },
  options: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", fontSize: "13px", color: "#64748B" },
  forgot: { border: "none", background: "none", color: "#2563EB", cursor: "pointer", fontSize: "13px", fontWeight: "600" },
  button: { padding: "13px", backgroundColor: "#0B1F5E", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer", fontSize: "15px" },
  footerNote: { marginTop: "24px", color: "#94A3B8", fontSize: "11px", letterSpacing: "0.2px" },
};

export default LoginPage;
