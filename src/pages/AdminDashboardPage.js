import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../components/layout/AdminHeader";
import { adminAPI } from "../services/api";

/**
 * AdminDashboardPage - Executive DOST Administration & Governance Portal.
 * Fluid widescreen layout utilizing 100% display real estate with rich DOST institutional theming.
 */
function AdminDashboardPage() {
  const navigate = useNavigate();
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

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await adminAPI.dashboard();
      setStats(res.data);
      setRecentUsers(res.data.recent_users || []);
    } catch (err) {
      console.error(err);
    }
  };

  const agencies = [
    { code: "ASTI", name: "Advanced Science and Technology Institute", icon: "🚀", color: "#2563EB" },
    { code: "PAGASA", name: "Atmospheric, Geophysical & Astronomical Services", icon: "🌦️", color: "#0284C7" },
    { code: "PHIVOLCS", name: "Institute of Volcanology and Seismology", icon: "🌋", color: "#DC2626" },
    { code: "ITDI", name: "Industrial Technology Development Institute", icon: "🔬", color: "#7C3AED" },
    { code: "FNRI", name: "Food and Nutrition Research Institute", icon: "🥗", color: "#16A34A" },
    { code: "MIRDC", name: "Metals Industry Research and Development Center", icon: "⚙️", color: "#D97706" },
  ];

  return (
    <div style={styles.page}>
      <AdminHeader activePortal="functional" />

      <main className="lms-page-container" style={styles.main}>
        {/* DOST Executive Hero Banner */}
        <section style={styles.heroBanner}>
          <div style={styles.heroContent}>
            <div style={styles.heroBadge}>
              <span style={{ fontSize: "13px" }}>🏛️</span>
              <span>DEPARTMENT OF SCIENCE AND TECHNOLOGY &bull; EXECUTIVE GOVERNANCE</span>
            </div>
            <h1 style={styles.heroTitle}>LMS Administrative Operations & Governance</h1>
            <p style={styles.heroSubtitle}>
              Review user registrations, coordinate faculty across all 6 research agencies, configure department curricula, and oversee institutional learning performance.
            </p>
          </div>

          <div style={styles.heroActions}>
            <button style={styles.heroBtnPrimary} onClick={() => navigate("/executive-dashboard")}>
              <span>📊</span>
              <span>Executive Analytics</span>
            </button>
            <button style={styles.heroBtnGlass} onClick={() => navigate("/it-dashboard")}>
              <span>⚙️</span>
              <span>IT Control Center</span>
            </button>
            <button style={styles.heroBtnGlass} onClick={() => navigate("/manage-users")}>
              <span>👥</span>
              <span>Manage Users</span>
            </button>
          </div>
        </section>

        {/* High-Contrast KPI Stat Cards Grid */}
        <section style={styles.statsGrid}>
          {/* 1. Pending Approvals */}
          <div
            style={{
              ...styles.statCard,
              borderTop: "4px solid #F59E0B",
              backgroundColor: stats.pending_approvals > 0 ? "#FFFBEB" : "#FFFFFF",
            }}
            onClick={() => navigate("/manage-users")}
          >
            <div style={styles.statTopRow}>
              <div style={{ ...styles.statIconBadge, backgroundColor: "#FEF3C7", color: "#D97706" }}>
                ⏳
              </div>
              {stats.pending_approvals > 0 ? (
                <span style={styles.alertPill}>Action Needed</span>
              ) : (
                <span style={styles.okPill}>All Clear</span>
              )}
            </div>
            <span style={styles.statLabel}>Pending User Approvals</span>
            <div style={{ ...styles.statValue, color: stats.pending_approvals > 0 ? "#D97706" : "#0B1F5E" }}>
              {stats.pending_approvals}
            </div>
            <span style={styles.statSub}>Registrations awaiting review</span>
          </div>

          {/* 2. Mentors & Faculty */}
          <div
            style={{ ...styles.statCard, borderTop: "4px solid #2563EB" }}
            onClick={() => navigate("/manage-users")}
          >
            <div style={styles.statTopRow}>
              <div style={{ ...styles.statIconBadge, backgroundColor: "#EFF6FF", color: "#2563EB" }}>
                🧑‍🏫
              </div>
              <span style={styles.tagPill}>Faculty</span>
            </div>
            <span style={styles.statLabel}>Mentors & Teachers</span>
            <div style={{ ...styles.statValue, color: "#2563EB" }}>
              {stats.total_mentors}
            </div>
            <span style={styles.statSub}>Subject matter experts</span>
          </div>

          {/* 3. Active Learners */}
          <div
            style={{ ...styles.statCard, borderTop: "4px solid #10B981" }}
            onClick={() => navigate("/manage-users")}
          >
            <div style={styles.statTopRow}>
              <div style={{ ...styles.statIconBadge, backgroundColor: "#ECFDF5", color: "#059669" }}>
                👥
              </div>
              <span style={styles.tagPill}>Trainees</span>
            </div>
            <span style={styles.statLabel}>Active Learners</span>
            <div style={{ ...styles.statValue, color: "#059669" }}>
              {stats.total_employees}
            </div>
            <span style={styles.statSub}>Approved employee profiles</span>
          </div>

          {/* 4. Curriculum Branches */}
          <div
            style={{ ...styles.statCard, borderTop: "4px solid #8B5CF6" }}
            onClick={() => navigate("/manage-curriculums")}
          >
            <div style={styles.statTopRow}>
              <div style={{ ...styles.statIconBadge, backgroundColor: "#F5F3FF", color: "#7C3AED" }}>
                🏛️
              </div>
              <span style={styles.tagPill}>Agencies</span>
            </div>
            <span style={styles.statLabel}>Branches & Depts</span>
            <div style={{ ...styles.statValue, color: "#7C3AED" }}>
              {stats.total_curriculums}
            </div>
            <span style={styles.statSub}>Configured agency curricula</span>
          </div>

          {/* 5. Mentor Courses */}
          <div
            style={{ ...styles.statCard, borderTop: "4px solid #0284C7" }}
            onClick={() => navigate("/manage-courses")}
          >
            <div style={styles.statTopRow}>
              <div style={{ ...styles.statIconBadge, backgroundColor: "#F0F9FF", color: "#0284C7" }}>
                📘
              </div>
              <span style={styles.tagPill}>Catalog</span>
            </div>
            <span style={styles.statLabel}>Course Catalog</span>
            <div style={{ ...styles.statValue, color: "#0284C7" }}>
              {stats.total_courses}
            </div>
            <span style={styles.statSub}>Published syllabus modules</span>
          </div>

          {/* 6. Avg Completion */}
          <div
            style={{ ...styles.statCard, borderTop: "4px solid #0D9488" }}
            onClick={() => navigate("/progress-reports")}
          >
            <div style={styles.statTopRow}>
              <div style={{ ...styles.statIconBadge, backgroundColor: "#F0FDFA", color: "#0D9488" }}>
                🎓
              </div>
              <span style={styles.tagPill}>Telemetry</span>
            </div>
            <span style={styles.statLabel}>Avg Completion</span>
            <div style={{ ...styles.statValue, color: "#0D9488" }}>
              {stats.average_completion}%
            </div>
            <span style={styles.statSub}>{stats.completed_enrollments} completions recorded</span>
          </div>
        </section>

        {/* Dashboard 2-Column Grid */}
        <section style={styles.dashboardGrid}>
          {/* Left Column: 6 Quick Controls */}
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={styles.panelTitle}>Administrative Studios & Controls</h2>
                <p style={styles.panelSubtitle}>
                  Direct in-browser CRUD and operational controls across the DOST Academy platform.
                </p>
              </div>
            </div>

            <div style={styles.quickGrid}>
              {/* 1. Users */}
              <div style={styles.quickCard} onClick={() => navigate("/manage-users")}>
                <div style={{ ...styles.quickIconCircle, backgroundColor: "#EFF6FF", color: "#2563EB" }}>
                  👥
                </div>
                <h3 style={styles.quickTitle}>User Approvals & Faculty</h3>
                <p style={styles.quickText}>
                  Review registrations, approve accounts, assign roles, and configure faculty permissions.
                </p>
                <div style={styles.quickLink}>Open Users &rarr;</div>
              </div>

              {/* 2. Curriculums */}
              <div style={styles.quickCard} onClick={() => navigate("/manage-curriculums")}>
                <div style={{ ...styles.quickIconCircle, backgroundColor: "#F5F3FF", color: "#7C3AED" }}>
                  🏛️
                </div>
                <h3 style={styles.quickTitle}>Curriculum Branches</h3>
                <p style={styles.quickText}>
                  Create department curriculums, organize domains, and assign mentors to their agencies.
                </p>
                <div style={styles.quickLink}>Manage Branches &rarr;</div>
              </div>

              {/* 3. Courses */}
              <div style={styles.quickCard} onClick={() => navigate("/manage-courses")}>
                <div style={{ ...styles.quickIconCircle, backgroundColor: "#F0F9FF", color: "#0284C7" }}>
                  📘
                </div>
                <h3 style={styles.quickTitle}>Course Studio & Modules</h3>
                <p style={styles.quickText}>
                  Create institutional courses, structure syllabus lessons, and manage course publishing.
                </p>
                <div style={styles.quickLink}>Course Studio &rarr;</div>
              </div>

              {/* 4. Assessments */}
              <div style={styles.quickCard} onClick={() => navigate("/manage-assignments")}>
                <div style={{ ...styles.quickIconCircle, backgroundColor: "#FFFBEB", color: "#D97706" }}>
                  📝
                </div>
                <h3 style={styles.quickTitle}>Assessments & Quizzes</h3>
                <p style={styles.quickText}>
                  Configure quizzes, practical labs, assignments, set due dates, and monitor grading.
                </p>
                <div style={styles.quickLink}>Assessments &rarr;</div>
              </div>

              {/* 5. Certificates */}
              <div style={styles.quickCard} onClick={() => navigate("/manage-certificates")}>
                <div style={{ ...styles.quickIconCircle, backgroundColor: "#ECFDF5", color: "#059669" }}>
                  🎓
                </div>
                <h3 style={styles.quickTitle}>Institutional Certificates</h3>
                <p style={styles.quickText}>
                  Issue certificates, verify credential barcodes, and manage public authentication records.
                </p>
                <div style={styles.quickLink}>Certificate Registry &rarr;</div>
              </div>

              {/* 6. Progress Reports */}
              <div style={styles.quickCard} onClick={() => navigate("/progress-reports")}>
                <div style={{ ...styles.quickIconCircle, backgroundColor: "#F0FDFA", color: "#0D9488" }}>
                  📊
                </div>
                <h3 style={styles.quickTitle}>Progress Reports & Velocity</h3>
                <p style={styles.quickText}>
                  Track agency-wide training metrics, completion milestones, and export progress telemetry.
                </p>
                <div style={styles.quickLink}>Progress Reports &rarr;</div>
              </div>
            </div>
          </div>

          {/* Right Column: Recent User Registrations */}
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={styles.panelTitle}>Recent User Registrations</h2>
                <p style={styles.panelSubtitle}>Latest personnel registrations awaiting review or active in system.</p>
              </div>
              <button style={styles.viewAllBtn} onClick={() => navigate("/manage-users")}>
                View All
              </button>
            </div>

            <div style={styles.activityList}>
              {recentUsers.map((u, index) => {
                const initial = (u.name || "U").charAt(0).toUpperCase();
                const isApproved = u.status === "approved";
                return (
                  <div key={index} style={styles.activityItem}>
                    <div style={styles.avatarCircle}>{initial}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={styles.itemName}>{u.name}</span>
                        <span style={styles.itemRoleBadge}>{u.role}</span>
                      </div>
                      <div style={styles.itemEmail}>{u.email}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={isApproved ? styles.statusBadgeApproved : styles.statusBadgePending}>
                        {isApproved ? "Approved" : "Pending"}
                      </span>
                    </div>
                  </div>
                );
              })}

              {recentUsers.length === 0 && (
                <div style={styles.emptyActivity}>
                  <span style={{ fontSize: "32px" }}>📋</span>
                  <p style={{ margin: "8px 0 0", color: "#64748B", fontSize: "14px" }}>
                    No pending or recent user registrations.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* DOST Institutional Agency Ecosystem Banner */}
        <section style={styles.agenciesBanner}>
          <div style={styles.agenciesHeader}>
            <div>
              <span style={styles.agenciesTag}>RESEARCH & DEVELOPMENT NETWORK</span>
              <h3 style={styles.agenciesTitle}>DOST Integrated Agency Branches</h3>
            </div>
            <span style={{ fontSize: "13px", color: "#64748B", fontWeight: "600" }}>
              6 Specialized Research Institutes
            </span>
          </div>

          <div style={styles.agenciesGrid}>
            {agencies.map((agency) => (
              <div key={agency.code} style={styles.agencyCard} onClick={() => navigate("/manage-curriculums")}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "24px" }}>{agency.icon}</span>
                  <div>
                    <strong style={{ color: "#0B1F5E", fontSize: "15px" }}>DOST-{agency.code}</strong>
                  </div>
                </div>
                <p style={styles.agencyNameText}>{agency.name}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#F8FAFC",
  },
  main: {
    width: "100%",
    maxWidth: "100%",
    margin: "0",
    padding: "clamp(20px, 3vw, 48px)",
    boxSizing: "border-box",
  },
  heroBanner: {
    background: "linear-gradient(135deg, #0B1F5E 0%, #17337B 40%, #1E3A8A 70%, #2563EB 100%)",
    borderRadius: "22px",
    padding: "36px 42px",
    marginBottom: "28px",
    boxShadow: "0 14px 34px -5px rgba(11, 31, 94, 0.28), 0 4px 12px -2px rgba(11, 31, 94, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "24px",
    flexWrap: "wrap",
    color: "#FFFFFF",
  },
  heroContent: {
    flex: "1 1 600px",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "rgba(56, 189, 248, 0.18)",
    color: "#38BDF8",
    border: "1px solid rgba(56, 189, 248, 0.35)",
    padding: "5px 14px",
    borderRadius: "20px",
    fontWeight: "700",
    fontSize: "11px",
    letterSpacing: "0.08em",
    marginBottom: "12px",
  },
  heroTitle: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: "-0.02em",
    margin: "0 0 10px",
    lineHeight: "1.2",
  },
  heroSubtitle: {
    color: "#E0E7FF",
    fontSize: "15px",
    lineHeight: "1.6",
    maxWidth: "760px",
    margin: 0,
  },
  heroActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  heroBtnPrimary: {
    backgroundColor: "#38BDF8",
    color: "#0B1F5E",
    border: "none",
    padding: "12px 22px",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 14px rgba(56, 189, 248, 0.35)",
    transition: "transform 0.15s ease",
  },
  heroBtnGlass: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    color: "#FFFFFF",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    padding: "12px 20px",
    borderRadius: "12px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    backdropFilter: "blur(10px)",
    transition: "background 0.15s ease",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "20px",
    marginBottom: "32px",
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "18px",
    padding: "22px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 4px 16px -2px rgba(11, 31, 94, 0.05)",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
    display: "flex",
    flexDirection: "column",
  },
  statTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  statIconBadge: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  alertPill: {
    backgroundColor: "#EF4444",
    color: "#FFFFFF",
    padding: "3px 8px",
    borderRadius: "10px",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "0.03em",
  },
  okPill: {
    backgroundColor: "#ECFDF5",
    color: "#059669",
    padding: "3px 8px",
    borderRadius: "10px",
    fontSize: "10px",
    fontWeight: "700",
  },
  tagPill: {
    backgroundColor: "#F1F5F9",
    color: "#64748B",
    padding: "3px 8px",
    borderRadius: "10px",
    fontSize: "10px",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statLabel: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "4px",
  },
  statValue: {
    fontSize: "36px",
    fontWeight: "800",
    letterSpacing: "-0.03em",
    lineHeight: "1.1",
    margin: "4px 0 6px",
  },
  statSub: {
    fontSize: "12px",
    color: "#94A3B8",
    fontWeight: "500",
  },
  dashboardGrid: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr",
    gap: "28px",
    marginBottom: "32px",
  },
  panel: {
    backgroundColor: "#FFFFFF",
    padding: "28px",
    borderRadius: "20px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 4px 18px -2px rgba(11, 31, 94, 0.04)",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
  },
  panelTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#0B1F5E",
    margin: "0 0 4px",
  },
  panelSubtitle: {
    fontSize: "13px",
    color: "#64748B",
    margin: 0,
  },
  viewAllBtn: {
    backgroundColor: "#EFF6FF",
    color: "#2563EB",
    border: "none",
    padding: "6px 14px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },
  quickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },
  quickCard: {
    backgroundColor: "#F8FAFC",
    padding: "20px",
    borderRadius: "16px",
    cursor: "pointer",
    border: "1px solid #E2E8F0",
    transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  quickIconCircle: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    marginBottom: "12px",
  },
  quickTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#0B1F5E",
    margin: "0 0 6px",
  },
  quickText: {
    fontSize: "12.5px",
    color: "#64748B",
    lineHeight: "1.5",
    margin: "0 0 14px",
  },
  quickLink: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#2563EB",
  },
  activityList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  activityItem: {
    backgroundColor: "#F8FAFC",
    borderRadius: "14px",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    border: "1px solid #F1F5F9",
    transition: "background 0.15s ease",
  },
  avatarCircle: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    backgroundColor: "#0B1F5E",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "700",
  },
  itemName: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0F172A",
  },
  itemRoleBadge: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#2563EB",
    backgroundColor: "#EFF6FF",
    padding: "2px 8px",
    borderRadius: "8px",
    textTransform: "capitalize",
  },
  itemEmail: {
    fontSize: "12px",
    color: "#64748B",
    marginTop: "2px",
  },
  statusBadgeApproved: {
    backgroundColor: "#ECFDF5",
    color: "#059669",
    padding: "4px 10px",
    borderRadius: "10px",
    fontSize: "11px",
    fontWeight: "700",
  },
  statusBadgePending: {
    backgroundColor: "#FFFBEB",
    color: "#D97706",
    padding: "4px 10px",
    borderRadius: "10px",
    fontSize: "11px",
    fontWeight: "700",
  },
  emptyActivity: {
    textAlign: "center",
    padding: "40px 20px",
  },
  agenciesBanner: {
    backgroundColor: "#FFFFFF",
    borderRadius: "20px",
    padding: "28px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 4px 18px -2px rgba(11, 31, 94, 0.04)",
  },
  agenciesHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "12px",
  },
  agenciesTag: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#2563EB",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "4px",
  },
  agenciesTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#0B1F5E",
    margin: 0,
  },
  agenciesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },
  agencyCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: "14px",
    padding: "16px",
    border: "1px solid #E2E8F0",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  agencyNameText: {
    fontSize: "12px",
    color: "#64748B",
    lineHeight: "1.4",
    margin: 0,
  },
};

export default AdminDashboardPage;
