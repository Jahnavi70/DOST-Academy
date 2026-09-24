import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/dost-logo.png";

function AdminDashboardPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [stats, setStats] = useState({
    total_employees: 0,
    total_mentors: 0,
    pending_approvals: 0,
    total_curriculums: 0,
    total_courses: 0,
    total_enrollments: 0,
    completed_enrollments: 0,
    average_completion: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const res = await adminAPI.dashboard();
      setStats(res.data);
      setRecentUsers(res.data.recent_users || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.navbar}>
        <div style={styles.logoSection}>
          <img src={logo} alt="DOST Logo" style={styles.logo} />
          <div>
            <h2 style={styles.title}>DOST Academy</h2>
            <p style={styles.subtitle}>Administrative Operations</p>
          </div>
        </div>
        <div style={styles.navSection}>
          <div style={styles.navLinks}>
            <button style={styles.activeButton}>Dashboard</button>
            <button style={styles.navButton} onClick={() => navigate("/executive-dashboard")}>Executive Analytics</button>
            <button style={styles.navButton} onClick={() => navigate("/it-dashboard")}>IT Diagnostics</button>
            <button style={styles.navButton} onClick={() => navigate("/manage-users")}>Users & Mentors</button>
            <button style={styles.navButton} onClick={() => navigate("/manage-curriculums")}>Branches</button>
            <button style={styles.navButton} onClick={() => navigate("/manage-courses")}>Courses (Monitor)</button>
            <button style={styles.navButton} onClick={() => navigate("/progress-reports")}>Reports</button>
            <div style={styles.profileWrapper}>
              <button style={styles.profileButton} onClick={() => setShowAdminMenu(!showAdminMenu)}>Admin ▾</button>
              {showAdminMenu && (
                <div style={styles.dropdown}>
                  <p style={styles.dropdownItem} onClick={() => navigate("/admin-dashboard")}>Dashboard</p>
                  <p style={styles.dropdownItem} onClick={() => navigate("/executive-dashboard")}>Executive Analytics</p>
                  <p style={styles.dropdownItem} onClick={() => navigate("/it-dashboard")}>IT Diagnostics</p>
                  <p style={styles.dropdownItem} onClick={() => navigate("/manage-users")}>Users & Mentors</p>
                  <p style={styles.dropdownItem} onClick={() => navigate("/manage-curriculums")}>Branches</p>
                  <p style={styles.dropdownItem} onClick={() => navigate("/manage-courses")}>Courses Monitor</p>
                  <p style={styles.logoutItem} onClick={() => { logout(); navigate("/"); }}>Logout</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.heroCard}>
          <div>
            <p style={styles.label}>ADMINISTRATION & GOVERNANCE</p>
            <h1 style={styles.heading}>LMS Administrative Operations</h1>
            <p style={styles.text}>
              Review and approve user registrations, assign teachers/mentors to branches, configure curriculum departments, and oversee institutional learning performance.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button style={styles.primaryButton} onClick={() => navigate("/executive-dashboard")}>
              📊 Executive Visual Analytics
            </button>
            <button style={styles.secondaryButton} onClick={() => navigate("/it-dashboard")}>
              ⚙️ IT Control Center
            </button>
            <button style={styles.secondaryButton} onClick={() => navigate("/manage-users")}>
              Manage Users & Approvals
            </button>
          </div>
        </section>

        {/* Stats Grid */}
        <section style={styles.statsGrid}>
          <div
            style={stats.pending_approvals > 0 ? styles.statCardAlert : styles.statCard}
            onClick={() => navigate("/manage-users")}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={styles.statIcon}>⏳</span>
              {stats.pending_approvals > 0 && <span style={styles.alertPill}>Action Needed</span>}
            </div>
            <h3 style={styles.statTitle}>Pending User Approvals</h3>
            <p style={{ ...styles.statValue, color: stats.pending_approvals > 0 ? "#D97706" : "#2563EB" }}>
              {stats.pending_approvals}
            </p>
            <span style={{ fontSize: "11px", color: "#64748B" }}>Registrations awaiting review</span>
          </div>

          <div style={styles.statCard} onClick={() => navigate("/manage-users")}>
            <span style={styles.statIcon}>🧑‍🏫</span>
            <h3 style={styles.statTitle}>Mentors & Teachers</h3>
            <p style={styles.statValue}>{stats.total_mentors}</p>
            <span style={{ fontSize: "11px", color: "#64748B" }}>Subject matter experts</span>
          </div>

          <div style={styles.statCard} onClick={() => navigate("/manage-users")}>
            <span style={styles.statIcon}>👥</span>
            <h3 style={styles.statTitle}>Active Learners</h3>
            <p style={styles.statValue}>{stats.total_employees}</p>
            <span style={{ fontSize: "11px", color: "#64748B" }}>Approved employee profiles</span>
          </div>

          <div style={styles.statCard} onClick={() => navigate("/manage-curriculums")}>
            <span style={styles.statIcon}>🏛️</span>
            <h3 style={styles.statTitle}>Branches & Depts</h3>
            <p style={styles.statValue}>{stats.total_curriculums}</p>
            <span style={{ fontSize: "11px", color: "#64748B" }}>Configured curriculums</span>
          </div>

          <div style={styles.statCard} onClick={() => navigate("/manage-courses")}>
            <span style={styles.statIcon}>📘</span>
            <h3 style={styles.statTitle}>Mentor Courses</h3>
            <p style={styles.statValue}>{stats.total_courses}</p>
            <span style={{ fontSize: "11px", color: "#64748B" }}>Published by mentors</span>
          </div>

          <div style={styles.statCard} onClick={() => navigate("/progress-reports")}>
            <span style={styles.statIcon}>🎓</span>
            <h3 style={styles.statTitle}>Avg Completion</h3>
            <p style={styles.statValue}>{stats.average_completion}%</p>
            <span style={{ fontSize: "11px", color: "#64748B" }}>{stats.completed_enrollments} completions</span>
          </div>
        </section>

        {/* Dashboard Grid */}
        <section style={styles.dashboardGrid}>
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Quick Controls</h2>
            </div>
            <div style={styles.quickGrid}>
              <div style={styles.quickCard} onClick={() => navigate("/manage-users")}>
                <span style={styles.quickIcon}>👥</span>
                <h3 style={styles.quickTitle}>User Approvals & Mentors</h3>
                <p style={styles.quickText}>Review pending user registrations, approve accounts, and add teachers.</p>
              </div>

              <div style={styles.quickCard} onClick={() => navigate("/manage-curriculums")}>
                <span style={styles.quickIcon}>🏛️</span>
                <h3 style={styles.quickTitle}>Curriculum Branches</h3>
                <p style={styles.quickText}>Create department curriculums and assign mentors to their branches.</p>
              </div>

              <div style={styles.quickCard} onClick={() => navigate("/manage-courses")}>
                <span style={styles.quickIcon}>📘</span>
                <h3 style={styles.quickTitle}>Course Oversight</h3>
                <p style={styles.quickText}>Monitor courses created by mentors and inspect enrollments.</p>
              </div>

              <div style={styles.quickCard} onClick={() => navigate("/progress-reports")}>
                <span style={styles.quickIcon}>📊</span>
                <h3 style={styles.quickTitle}>Progress Reports</h3>
                <p style={styles.quickText}>Track agency-wide training metrics and completion milestones.</p>
              </div>
            </div>
          </div>

          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Recent User Registrations</h2>
            </div>
            {recentUsers.map((u, index) => (
              <div key={index} style={styles.activityItem}>
                <span style={u.status === "approved" ? styles.greenDot : styles.amberDot}></span>
                <div style={{ flex: 1 }}>
                  <h3 style={styles.itemTitle}>{u.name} ({u.role})</h3>
                  <p style={styles.itemSub}>{u.email} • Status: <strong>{u.status}</strong></p>
                </div>
              </div>
            ))}
            {recentUsers.length === 0 && <p style={{ color: "#64748B" }}>No recent registrations.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#F8FAFC", fontFamily: "Arial, sans-serif" },
  navbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 28px", backgroundColor: "#ffffff", borderBottom: "1px solid #E2E8F0", flexWrap: "wrap", gap: "15px", position: "sticky", top: 0, zIndex: 100 },
  logoSection: { display: "flex", alignItems: "center", gap: "12px" },
  logo: { width: "50px" },
  title: { margin: 0, color: "#0B1F5E", fontSize: "20px" },
  subtitle: { margin: 0, color: "#64748B", fontSize: "13px" },
  navSection: { display: "flex", alignItems: "center", gap: "15px" },
  navLinks: { display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" },
  navButton: { backgroundColor: "#EEF2FF", color: "#0B1F5E", border: "none", padding: "8px 14px", borderRadius: "16px", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
  activeButton: { backgroundColor: "#2563EB", color: "#ffffff", border: "none", padding: "8px 14px", borderRadius: "16px", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
  profileWrapper: { position: "relative" },
  profileButton: { backgroundColor: "#0B1F5E", color: "#ffffff", border: "none", padding: "8px 14px", borderRadius: "16px", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
  dropdown: { position: "absolute", right: 0, top: "42px", width: "180px", backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 8px 25px rgba(0,0,0,0.15)", padding: "8px", zIndex: 999 },
  dropdownItem: { margin: 0, padding: "8px 12px", cursor: "pointer", color: "#0B1F5E", borderRadius: "6px", fontSize: "13px" },
  logoutItem: { margin: 0, padding: "8px 12px", cursor: "pointer", color: "#DC2626", fontWeight: "700", borderRadius: "6px", fontSize: "13px" },
  main: { padding: "30px", maxWidth: "1200px", margin: "0 auto" },
  heroCard: { backgroundColor: "#ffffff", borderRadius: "20px", padding: "28px", marginBottom: "26px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", border: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", flexWrap: "wrap" },
  label: { color: "#2563EB", fontWeight: "700", margin: 0, fontSize: "12px" },
  heading: { color: "#0B1F5E", fontSize: "28px", margin: "6px 0" },
  text: { color: "#64748B", fontSize: "14px", lineHeight: "1.5", margin: 0, maxWidth: "680px" },
  primaryButton: { backgroundColor: "#2563EB", color: "#ffffff", border: "none", padding: "12px 18px", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "13px" },
  secondaryButton: { backgroundColor: "#0B1F5E", color: "#ffffff", border: "none", padding: "12px 18px", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "13px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "16px", marginBottom: "26px" },
  statCard: { backgroundColor: "#ffffff", padding: "18px", borderRadius: "14px", border: "1px solid #E2E8F0", cursor: "pointer", display: "flex", flexDirection: "column" },
  statCardAlert: { backgroundColor: "#FFFBEB", padding: "18px", borderRadius: "14px", border: "1px solid #FCD34D", cursor: "pointer", display: "flex", flexDirection: "column" },
  alertPill: { backgroundColor: "#EF4444", color: "#ffffff", padding: "2px 6px", borderRadius: "6px", fontSize: "10px", fontWeight: "800" },
  statIcon: { fontSize: "22px" },
  statTitle: { color: "#0B1F5E", margin: "6px 0 2px", fontSize: "13px" },
  statValue: { color: "#2563EB", fontSize: "26px", fontWeight: "700", margin: "0 0 2px" },
  dashboardGrid: { display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px", marginBottom: "24px" },
  panel: { backgroundColor: "#ffffff", padding: "24px", borderRadius: "18px", border: "1px solid #E2E8F0" },
  panelHeader: { marginBottom: "16px" },
  panelTitle: { color: "#0B1F5E", fontSize: "20px", margin: 0 },
  quickGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" },
  quickCard: { backgroundColor: "#F8FAFC", padding: "16px", borderRadius: "12px", cursor: "pointer", border: "1px solid #E2E8F0" },
  quickIcon: { fontSize: "24px" },
  quickTitle: { color: "#0B1F5E", margin: "6px 0 4px", fontSize: "14px" },
  quickText: { color: "#64748B", fontSize: "12px", lineHeight: "1.4", margin: 0 },
  activityItem: { backgroundColor: "#F8FAFC", borderRadius: "10px", padding: "12px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "12px", border: "1px solid #F1F5F9" },
  greenDot: { width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#22C55E" },
  amberDot: { width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#F59E0B" },
  itemTitle: { color: "#0B1F5E", margin: 0, fontSize: "14px" },
  itemSub: { color: "#64748B", margin: "2px 0 0", fontSize: "12px" },
};

export default AdminDashboardPage;
