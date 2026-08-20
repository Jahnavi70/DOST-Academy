import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { curriculumAPI, enrollmentAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { navItemsFor, roleHome } from "../utils/roles";
import logo from "../assets/dost-logo.png";
import courseDefault from "../assets/course-default.jpg";

function CoursesPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = user?.role || "employee";
  const navItems = navItemsFor(role).filter(item => item.path !== "/edit-profile");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [curriculums, setCurriculums] = useState([]);
  const [enrollmentMap, setEnrollmentMap] = useState({}); // { [courseId]: 'pending' | 'enrolled' | 'rejected' }
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [sort, setSort] = useState("name");
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);

  const requestSeq = useRef(0);

  const loadData = useCallback(async () => {
    const seq = ++requestSeq.current;
    setLoading(true);
    try {
      const [curRes, enrollRes] = await Promise.all([
        curriculumAPI.getAll({ search, category, level, sort }),
        enrollmentAPI.userEnrollments().catch(() => ({ data: [] })),
      ]);
      if (seq !== requestSeq.current) return;
      setCurriculums(Array.isArray(curRes.data) ? curRes.data : []);

      const map = {};
      (enrollRes.data || []).forEach(e => {
        if (e.course_id) {
          map[Number(e.course_id)] = e.status;
        }
      });
      setEnrollmentMap(map);
    } catch (err) {
      if (seq === requestSeq.current) {
        console.error(err);
        setCurriculums([]);
      }
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, [search, category, level, sort]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEnroll = async (courseId) => {
    setEnrolling(courseId);
    try {
      await enrollmentAPI.enroll({ course_id: courseId });
      setEnrollmentMap(prev => ({ ...prev, [Number(courseId)]: 'pending' }));
      alert("Enrollment requested! Your request has been sent to the course mentor for approval.");
    } catch (err) {
      alert(err.response?.data?.error || "Enrollment request failed.");
    } finally {
      setEnrolling(null);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setLevel("");
    setSort("name");
  };

  const CourseCard = ({ course }) => {
    const status = enrollmentMap[Number(course.id)];
    const isApproved = status === "enrolled" || status === "in_progress" || status === "completed";
    const isPending = status === "pending";

    return (
      <div
        style={styles.card}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-6px)";
          e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.05)";
        }}
      >
        <img
          src={course.image || courseDefault}
          alt={course.title}
          style={styles.courseImage}
        />
        <div style={{ padding: "18px", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={styles.levelBadge}>{course.level}</span>
              <span style={{ fontSize: "12px", color: "#64748B" }}>{course.duration}</span>
            </div>
            <h3 style={styles.courseTitle}>{course.title}</h3>
            <p style={styles.description}>{course.description?.slice(0, 95)}...</p>
            <p style={styles.courseMeta}>
              Mentor: <strong>{course.mentor?.name || "Assigned Mentor"}</strong>
            </p>
          </div>

          <div style={styles.cardActions}>
            <button style={styles.button} onClick={() => navigate(`/course-details/${course.id}`)}>
              Course Overview
            </button>
            {isApproved && (
              <button
                style={styles.enrolledBtn}
                onClick={() => navigate(`/course-details/${course.id}`)}
              >
                ✓ Start Learning
              </button>
            )}
            {isPending && (
              <button
                style={styles.pendingBtn}
                onClick={() => navigate(`/course-details/${course.id}`)}
              >
                ⏳ Pending Mentor Approval
              </button>
            )}
            {!status && role === "employee" && (
              <button
                style={styles.enrollBtnSmall}
                onClick={() => handleEnroll(course.id)}
                disabled={enrolling === course.id}
              >
                {enrolling === course.id ? "Requesting..." : "Request Enrollment"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.page}>
      <header style={styles.navbar}>
        <div style={styles.logoSection}>
          <img src={logo} alt="DOST Logo" style={styles.logo} />
          <div>
            <h2 style={styles.title}>DOST Academy</h2>
            <p style={styles.subtitle}>Branch Curriculums & Course Catalog</p>
          </div>
        </div>
        <div style={styles.navSection}>
          <div style={styles.searchToolbar}>
            <div style={styles.searchContainer}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Search branches or topics..."
                style={styles.searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select style={styles.filterSelect} value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="">All levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <select style={styles.filterSelect} value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="name">Sort by name</option>
              <option value="recent">Newest first</option>
            </select>
            <button style={styles.resetButton} onClick={resetFilters}>Reset</button>
          </div>
          <div style={styles.navLinks}>
            {navItems.map(item => (
              <button
                key={item.path}
                style={item.path === "/courses" ? styles.activeButton : styles.navButton}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </button>
            ))}
            <div style={styles.profileWrapper}>
              <button style={styles.profileButton} onClick={() => setShowProfileMenu(!showProfileMenu)}>
                {user?.name || "Profile"} ▾
              </button>
              {showProfileMenu && (
                <div style={styles.dropdown}>
                  <p style={styles.dropdownItem} onClick={() => navigate(roleHome(role))}>Dashboard</p>
                  <p style={styles.dropdownItem} onClick={() => navigate("/courses")}>Courses</p>
                  <p style={styles.dropdownItem} onClick={() => navigate("/edit-profile")}>Edit Profile</p>
                  <p style={styles.logoutItem} onClick={() => { logout(); navigate("/"); }}>Logout</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto" }}>
        {loading ? (
          <p style={{ textAlign: "center", padding: 40, color: "#64748B" }}>Loading courses catalog...</p>
        ) : curriculums.length === 0 ? (
          <div style={styles.emptyCard}>
            <span style={{ fontSize: "40px" }}>🏛️</span>
            <h3>No Branch Curriculums Available Yet</h3>
            <p style={{ color: "#64748B" }}>
              Administrators create curriculum branches, and Mentors add courses into their branches. Check back shortly.
            </p>
          </div>
        ) : (
          curriculums.map((curriculum, index) => {
            const pubCourses = (curriculum.courses || []).filter(c => c.status === "published");
            return (
              <section key={index} style={styles.courseSection}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <span style={styles.branchCategory}>{curriculum.category}</span>
                    <h2 style={styles.sectionTitle}>{curriculum.title}</h2>
                    <p style={{ color: "#64748B", margin: "4px 0 0", fontSize: "14px" }}>{curriculum.description}</p>
                  </div>
                  <span style={{ color: "#64748B", fontWeight: 600, fontSize: 13, backgroundColor: "#F1F5F9", padding: "6px 12px", borderRadius: "10px" }}>
                    {pubCourses.length} Courses in this Branch
                  </span>
                </div>

                <div style={styles.grid}>
                  {pubCourses.map((course, courseIndex) => (
                    <CourseCard key={courseIndex} course={course} />
                  ))}
                  {pubCourses.length === 0 && (
                    <div style={styles.noCourses}>
                      <p>Mentors have not published any courses in this branch yet.</p>
                    </div>
                  )}
                </div>
              </section>
            );
          })
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
  navSection: { display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" },
  searchToolbar: { display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" },
  searchContainer: { display: "flex", alignItems: "center", backgroundColor: "#F1F5F9", borderRadius: "8px", padding: "0 10px", border: "1px solid #CBD5E1" },
  searchIcon: { fontSize: "13px", color: "#64748B", marginRight: "6px" },
  searchInput: { border: "none", background: "transparent", outline: "none", padding: "8px 0", fontSize: "13px", width: "160px" },
  filterSelect: { padding: "8px 10px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "12px", backgroundColor: "#fff" },
  resetButton: { padding: "8px 12px", border: "none", backgroundColor: "#EEF2FF", color: "#2563EB", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "12px" },
  navLinks: { display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" },
  navButton: { backgroundColor: "#EEF2FF", color: "#0B1F5E", border: "none", padding: "8px 14px", borderRadius: "16px", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
  activeButton: { backgroundColor: "#2563EB", color: "#ffffff", border: "none", padding: "8px 14px", borderRadius: "16px", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
  profileWrapper: { position: "relative" },
  profileButton: { backgroundColor: "#0B1F5E", color: "#ffffff", border: "none", padding: "8px 14px", borderRadius: "16px", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
  dropdown: { position: "absolute", right: 0, top: "42px", width: "170px", backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 8px 25px rgba(0,0,0,0.15)", padding: "8px", zIndex: 999 },
  dropdownItem: { margin: 0, padding: "8px 12px", cursor: "pointer", color: "#0B1F5E", borderRadius: "6px", fontSize: "13px" },
  logoutItem: { margin: 0, padding: "8px 12px", cursor: "pointer", color: "#DC2626", fontWeight: "700", borderRadius: "6px", fontSize: "13px" },
  courseSection: { marginBottom: "36px" },
  branchCategory: { backgroundColor: "#EEF2FF", color: "#2563EB", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", display: "inline-block", marginBottom: "4px" },
  sectionTitle: { color: "#0B1F5E", margin: 0, fontSize: "22px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" },
  card: { backgroundColor: "#ffffff", borderRadius: "16px", overflow: "hidden", border: "1px solid #E2E8F0", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", transition: "transform 0.2s, box-shadow 0.2s" },
  courseImage: { width: "100%", height: "160px", objectFit: "cover" },
  levelBadge: { backgroundColor: "#EEF2FF", color: "#2563EB", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" },
  courseTitle: { color: "#0B1F5E", margin: "6px 0 6px", fontSize: "17px", fontWeight: "700" },
  description: { color: "#64748B", fontSize: "13px", lineHeight: "1.4", margin: "0 0 10px" },
  courseMeta: { fontSize: "12px", color: "#475569", margin: "0 0 14px" },
  cardActions: { display: "flex", gap: "8px", flexWrap: "wrap", borderTop: "1px solid #F1F5F9", paddingTop: "12px" },
  button: { flex: 1, backgroundColor: "#F1F5F9", color: "#334155", border: "1px solid #CBD5E1", padding: "8px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "12px" },
  enrolledBtn: { backgroundColor: "#DCFCE7", color: "#15803D", border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "12px" },
  pendingBtn: { backgroundColor: "#FEF3C7", color: "#B45309", border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "12px" },
  enrollBtnSmall: { backgroundColor: "#2563EB", color: "#ffffff", border: "none", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "12px" },
  noCourses: { gridColumn: "1 / -1", padding: "30px", backgroundColor: "#ffffff", borderRadius: "12px", textAlign: "center", color: "#64748B", border: "1px dashed #CBD5E1" },
  emptyCard: { backgroundColor: "#ffffff", padding: "50px", textAlign: "center", borderRadius: "18px", border: "2px dashed #CBD5E1", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" },
};

export default CoursesPage;
