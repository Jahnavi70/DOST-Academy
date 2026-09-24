import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { certificateAPI } from "../services/api";
import logo from "../assets/dost-logo.png";

function ManageCertificatesPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCertificates(); }, []);

  const loadCertificates = async () => {
    try { const res = await certificateAPI.getAll(); setCertificates(res.data); }
    catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <header style={styles.navbar}>
        <div style={styles.logoSection}>
          <img src={logo} alt="DOST Logo" style={styles.logo} />
          <div><h2 style={styles.title}>DOST Academy</h2><p style={styles.subtitle}>Manage Certificates</p></div>
        </div>
        <div style={styles.navSection}>
          <div style={styles.navLinks}>
            <button style={styles.navButton} onClick={() => navigate("/admin-dashboard")}>Dashboard</button>
            <button style={styles.navButton} onClick={() => navigate("/manage-users")}>Users</button>
            <button style={styles.navButton} onClick={() => navigate("/manage-courses")}>Courses</button>
            <button style={styles.navButton} onClick={() => navigate("/manage-assignments")}>Assignments</button>
            <button style={styles.activeButton}>Certificates</button>
            <button style={styles.navButton} onClick={() => navigate("/progress-reports")}>Reports</button>
            <div style={styles.profileWrapper}>
              <button style={styles.profileButton} onClick={() => setShowAdminMenu(!showAdminMenu)}>Admin ▾</button>
              {showAdminMenu && (
                <div style={styles.dropdown}>
                  <p style={styles.dropdownItem} onClick={() => navigate("/admin-dashboard")}>Dashboard</p>
                  <p style={styles.logoutItem} onClick={() => { logout(); navigate("/"); }}>Logout</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main style={styles.main}>
        <h1 style={styles.heading}>Manage Certificates</h1>
        {loading ? <p>Loading...</p> : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>Employee</th><th style={styles.th}>Course</th><th style={styles.th}>Certificate No</th><th style={styles.th}>Issued Date</th></tr></thead>
              <tbody>
                {certificates.map((c, i) => (
                  <tr key={i} style={i % 2 === 0 ? {backgroundColor:'#F8FAFC'} : {}}>
                    <td style={styles.td}>{c.user?.name || '-'}</td><td style={styles.td}>{c.course?.title || '-'}</td><td style={styles.td}>{c.certificate_number}</td><td style={styles.td}>{c.issued_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#F1F5F9", fontFamily: "Arial" },
  navbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 30px", backgroundColor: "#ffffff", borderBottom: "1px solid #E2E8F0", flexWrap: "wrap", gap: "15px", position: "sticky", top: 0, zIndex: 100 },
  logoSection: { display: "flex", alignItems: "center", gap: "12px" }, logo: { width: "55px" }, title: { margin: 0, color: "#0B1F5E" }, subtitle: { margin: 0, color: "#64748B", fontSize: "13px" },
  navSection: { display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }, navLinks: { display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" },
  navButton: { backgroundColor: "#EEF2FF", color: "#0B1F5E", border: "none", padding: "9px 14px", borderRadius: "20px", cursor: "pointer", fontWeight: "600" },
  activeButton: { backgroundColor: "#2563EB", color: "#ffffff", border: "none", padding: "9px 14px", borderRadius: "20px", cursor: "pointer", fontWeight: "600" },
  profileWrapper: { position: "relative" }, profileButton: { backgroundColor: "#0B1F5E", color: "#ffffff", border: "none", padding: "9px 14px", borderRadius: "20px", cursor: "pointer", fontWeight: "600" },
  dropdown: { position: "absolute", right: 0, top: "45px", width: "190px", backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 8px 25px rgba(0,0,0,0.15)", padding: "10px", zIndex: 999 },
  dropdownItem: { margin: 0, padding: "10px", cursor: "pointer", color: "#0B1F5E", borderRadius: "8px" }, logoutItem: { margin: 0, padding: "10px", cursor: "pointer", color: "#DC2626", fontWeight: "700", borderRadius: "8px" },
  main: { padding: "30px" }, heading: { color: "#0B1F5E", fontSize: "32px", marginBottom: "25px" },
  tableContainer: { backgroundColor: "#ffffff", borderRadius: "18px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { backgroundColor: "#0B1F5E", color: "#ffffff", padding: "14px 18px", textAlign: "left", fontWeight: "600" },
  td: { padding: "14px 18px", borderBottom: "1px solid #E2E8F0", color: "#475569" },
};

export default ManageCertificatesPage;
