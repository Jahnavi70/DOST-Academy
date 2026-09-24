import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminAPI } from "../services/api";
import logo from "../assets/dost-logo.png";

function ProgressReportsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadReports(); }, []);

  const loadReports = async () => {
    try { const res = await adminAPI.allProgress(); setReports(res.data); }
    catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <header style={styles.navbar}>
        <div style={styles.logoSection}>
          <img src={logo} alt="DOST Logo" style={styles.logo} />
          <div><h2 style={styles.title}>DOST Academy</h2><p style={styles.subtitle}>Progress Reports</p></div>
        </div>
        <div style={styles.navSection}>
          <div style={styles.navLinks}>
            <button style={styles.navButton} onClick={() => navigate("/admin-dashboard")}>Dashboard</button>
            <button style={styles.navButton} onClick={() => navigate("/manage-users")}>Users</button>
            <button style={styles.navButton} onClick={() => navigate("/manage-courses")}>Courses</button>
            <button style={styles.navButton} onClick={() => navigate("/manage-assignments")}>Assignments</button>
            <button style={styles.navButton} onClick={() => navigate("/manage-certificates")}>Certificates</button>
            <button style={styles.activeButton}>Reports</button>
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
        <h1 style={styles.heading}>Employee Progress Reports</h1>
        {loading ? <p>Loading...</p> : reports.length === 0 ? <p style={{color:'#64748B'}}>No progress data available.</p> : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>Employee</th><th style={styles.th}>Department</th><th style={styles.th}>Curriculum</th><th style={styles.th}>Course</th><th style={styles.th}>Avg Progress</th><th style={styles.th}>Enrollment</th><th style={styles.th}>Certificate</th></tr></thead>
              <tbody>
                {reports.map((r, i) => (
                  <tr key={i} style={i % 2 === 0 ? {backgroundColor:'#F8FAFC'} : {}}>
                    <td style={styles.td}>{r.user?.name}</td><td style={styles.td}>{r.user?.department || '-'}</td><td style={styles.td}>{r.curriculum?.title}</td>
                    <td style={styles.td}>{r.course?.title || 'All curriculum courses'}</td>
                    <td style={styles.td}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{flex:1,height:8,backgroundColor:'#E5E7EB',borderRadius:10,overflow:'hidden'}}><div style={{height:'100%',width:`${r.average_progress}%`,backgroundColor:'#2563EB',borderRadius:10}} /></div>
                        <strong>{r.average_progress}%</strong>
                      </div>
                    </td>
                    <td style={styles.td}><span style={{...styles.badge, backgroundColor: r.enrollment_status === 'completed' ? '#D1FAE5' : r.enrollment_status === 'in_progress' ? '#DBEAFE' : '#FEF3C7', color: r.enrollment_status === 'completed' ? '#065F46' : r.enrollment_status === 'in_progress' ? '#1D4ED8' : '#92400E'}}>{r.enrollment_status}</span></td>
                    <td style={styles.td}><span style={{...styles.badge, backgroundColor: r.certificate_status === 'Issued' ? '#D1FAE5' : '#F1F5F9', color: r.certificate_status === 'Issued' ? '#065F46' : '#475569'}}>{r.certificate_status}</span></td>
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
  badge: { padding: "4px 12px", borderRadius: "12px", fontWeight: "600", fontSize: "13px" },
};

export default ProgressReportsPage;
