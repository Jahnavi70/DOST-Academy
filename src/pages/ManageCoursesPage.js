import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { courseAPI, curriculumAPI } from "../services/api";
import logo from "../assets/dost-logo.png";

function ManageCoursesPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [courses, setCourses] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurriculum, setSelectedCurriculum] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [courseRes, curRes] = await Promise.all([
        courseAPI.getAll(),
        curriculumAPI.getAll(),
      ]);
      setCourses(Array.isArray(courseRes.data) ? courseRes.data : []);
      setCurriculums(Array.isArray(curRes.data) ? curRes.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await courseAPI.approve(id);
      loadData();
    } catch (err) {
      alert("Failed to approve course");
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to remove course "${title}"?`)) return;
    try {
      await courseAPI.delete(id);
      loadData();
    } catch (err) {
      alert("Failed to delete course");
    }
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (selectedCurriculum && String(c.curriculum_id) !== String(selectedCurriculum)) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const matchTitle = c.title && c.title.toLowerCase().includes(q);
        const matchMentor = c.mentor && c.mentor.name.toLowerCase().includes(q);
        const matchDomain = c.domain && c.domain.toLowerCase().includes(q);
        return matchTitle || matchMentor || matchDomain;
      }
      return true;
    });
  }, [courses, selectedCurriculum, search]);

  const statusColor = (s) =>
    s === "published"
      ? { bg: "#D1FAE5", color: "#065F46" }
      : s === "approved"
      ? { bg: "#DBEAFE", color: "#1D4ED8" }
      : { bg: "#FEF3C7", color: "#92400E" };

  return (
    <div style={styles.page}>
      <header style={styles.navbar}>
        <div style={styles.logoSection}>
          <img src={logo} alt="DOST Logo" style={styles.logo} />
          <div>
            <h2 style={styles.title}>DOST Academy</h2>
            <p style={styles.subtitle}>Course Oversight & Monitoring</p>
          </div>
        </div>
        <div style={styles.navSection}>
          <div style={styles.navLinks}>
            <button style={styles.navButton} onClick={() => navigate("/admin-dashboard")}>Dashboard</button>
            <button style={styles.navButton} onClick={() => navigate("/manage-users")}>Users & Mentors</button>
            <button style={styles.navButton} onClick={() => navigate("/manage-curriculums")}>Branches</button>
            <button style={styles.activeButton}>Courses (Monitor)</button>
            <button style={styles.navButton} onClick={() => navigate("/progress-reports")}>Reports</button>
            <div style={styles.profileWrapper}>
              <button style={styles.profileButton} onClick={() => setShowAdminMenu(!showAdminMenu)}>Admin ▾</button>
              {showAdminMenu && (
                <div style={styles.dropdown}>
                  <p style={styles.dropdownItem} onClick={() => navigate("/admin-dashboard")}>Dashboard</p>
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
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.heading}>Course Oversight & Monitoring</h1>
            <p style={styles.subtext}>
              Courses are created and managed by Mentors within their assigned branches. As Administrator, you monitor course publications, mentor ownership, curriculum alignment, and active learners.
            </p>
          </div>
          <button style={styles.branchesBtn} onClick={() => navigate("/manage-curriculums")}>
            🏛️ Manage Branches
          </button>
        </div>

        <div style={styles.infoBanner}>
          <span>💡</span>
          <div>
            <strong>Course Creation Governance:</strong> Mentors add and structure courses for their assigned branch through their Mentor Dashboard (uploading banner, lessons, topics, chapters, videos, and quizzes).
          </div>
        </div>

        <div style={styles.filterRow}>
          <select
            style={styles.select}
            value={selectedCurriculum}
            onChange={(e) => setSelectedCurriculum(e.target.value)}
          >
            <option value="">All Branches / Curriculums</option>
            {curriculums.map((cur) => (
              <option key={cur.id} value={cur.id}>{cur.title}</option>
            ))}
          </select>
          <input
            style={styles.search}
            placeholder="🔍 Search course title or mentor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p>Loading course records...</p>
        ) : filteredCourses.length === 0 ? (
          <div style={styles.empty}>
            <span style={{ fontSize: "36px" }}>📚</span>
            <h3>No Courses Created Yet</h3>
            <p style={{ color: "#64748B", maxWidth: "480px" }}>
              Mentors create courses within their assigned branch. Once a mentor logs in to their dashboard and creates a course, it will appear here for oversight.
            </p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Course Title & Domain</th>
                  <th style={styles.th}>Branch / Curriculum</th>
                  <th style={styles.th}>Created By Mentor</th>
                  <th style={styles.th}>Level & Duration</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((c, i) => (
                  <tr key={c.id} style={i % 2 === 0 ? { backgroundColor: "#F8FAFC" } : {}}>
                    <td style={styles.td}>
                      <strong>{c.title}</strong>
                      <p style={styles.smallMeta}>{c.domain || "General"} | {c.description?.slice(0, 70)}...</p>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.branchPill}>
                        {c.curriculum?.title || "Branch Pending"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <strong>{c.mentor?.name || "Unassigned"}</strong>
                      <p style={{ margin: "2px 0 0", color: "#64748B", fontSize: "11px" }}>{c.mentor?.email}</p>
                    </td>
                    <td style={styles.td}>
                      {c.level} ({c.duration})
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, ...statusColor(c.status) }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          style={styles.viewBtn}
                          onClick={() => navigate(`/course-details/${c.id}`)}
                        >
                          View
                        </button>
                        {c.status !== "published" && (
                          <button
                            style={styles.approveBtn}
                            onClick={() => handleApprove(c.id)}
                          >
                            Publish
                          </button>
                        )}
                        <button
                          style={styles.deleteBtn}
                          onClick={() => handleDelete(c.id, c.title)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
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
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", marginBottom: "20px", flexWrap: "wrap" },
  heading: { color: "#0B1F5E", fontSize: "28px", margin: "0 0 6px" },
  subtext: { color: "#64748B", margin: 0, maxWidth: "750px", fontSize: "14px", lineHeight: "1.5" },
  branchesBtn: { backgroundColor: "#0B1F5E", color: "#ffffff", border: "none", padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "13px" },
  infoBanner: { backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "12px", padding: "12px 16px", display: "flex", gap: "10px", alignItems: "center", marginBottom: "20px", color: "#1E40AF", fontSize: "13px" },
  filterRow: { display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" },
  select: { padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" },
  search: { padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", minWidth: "260px" },
  tableContainer: { backgroundColor: "#ffffff", borderRadius: "16px", overflowX: "auto", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", border: "1px solid #E2E8F0" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "850px" },
  th: { backgroundColor: "#0B1F5E", color: "#ffffff", padding: "13px 16px", textAlign: "left", fontWeight: "600", fontSize: "13px" },
  td: { padding: "13px 16px", borderBottom: "1px solid #F1F5F9", color: "#334155", fontSize: "13px" },
  smallMeta: { color: "#64748B", fontSize: "12px", margin: "4px 0 0" },
  branchPill: { backgroundColor: "#EFF6FF", color: "#1D4ED8", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" },
  badge: { padding: "4px 10px", borderRadius: "12px", fontWeight: "700", fontSize: "11px", textTransform: "capitalize" },
  viewBtn: { backgroundColor: "#F1F5F9", color: "#334155", border: "1px solid #CBD5E1", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px" },
  approveBtn: { backgroundColor: "#DCFCE7", color: "#15803D", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "700", fontSize: "12px" },
  deleteBtn: { backgroundColor: "#FEF2F2", color: "#DC2626", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px" },
  empty: { backgroundColor: "#ffffff", padding: "50px", textAlign: "center", borderRadius: "18px", border: "2px dashed #CBD5E1", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" },
};

export default ManageCoursesPage;
