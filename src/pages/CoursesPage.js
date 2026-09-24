import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/layout/AppHeader";
import { curriculumAPI, enrollmentAPI } from "../services/api";
import courseDefault from "../assets/course-default.jpg";

function CoursesPage() {
  const navigate = useNavigate();
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
      (enrollRes.data || []).forEach((e) => {
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
      setEnrollmentMap((prev) => ({ ...prev, [Number(courseId)]: "pending" }));
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
      <div style={styles.card} className="lms-card-interactive">
        <img
          src={course.image || courseDefault}
          alt={course.title}
          style={styles.courseImage}
        />
        <div style={{ padding: "18px", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={styles.levelBadge}>{course.level || "Beginner"}</span>
              <span style={{ fontSize: "12px", color: "#64748B" }}>⏱️ {course.duration || "4 weeks"}</span>
            </div>
            <h3 style={styles.courseTitle}>{course.title}</h3>
            <p style={styles.description}>{course.description}</p>
          </div>

          <div>
            <div style={styles.courseMeta}>
              👨‍🏫 Mentor: <strong>{course.mentor?.name || "DOST Faculty"}</strong>
            </div>

            <div style={styles.cardActions}>
              <button
                style={styles.button}
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                View Syllabus
              </button>

              {isApproved ? (
                <button
                  style={styles.enrolledBtn}
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  ✓ Enrolled
                </button>
              ) : isPending ? (
                <button style={styles.pendingBtn} disabled>
                  ⏳ Pending Approval
                </button>
              ) : (
                <button
                  style={styles.enrollBtnSmall}
                  disabled={enrolling === course.id}
                  onClick={() => handleEnroll(course.id)}
                >
                  {enrolling === course.id ? "Enrolling..." : "Enroll Now"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC" }}>
      <AppHeader />

      <main className="lms-page-container">
        {/* Page Title & Search Toolbar */}
        <div style={{ marginBottom: "26px" }}>
          <h1 style={styles.pageTitle}>DOST Agency Curriculums & Course Catalog</h1>
          <p style={styles.pageSubtitle}>
            Explore national science & technology training programs, enroll in agency specializations, and earn certified competencies.
          </p>

          <div style={styles.filterToolbar}>
            <div style={styles.searchContainer}>
              <span style={{ fontSize: "14px", color: "#64748B" }}>🔍</span>
              <input
                type="text"
                placeholder="Search branches, course titles, or technologies..."
                style={styles.searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <select style={styles.filterSelect} value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="">All Difficulty Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <select style={styles.filterSelect} value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="name">Sort by Name</option>
                <option value="recent">Newest First</option>
              </select>
              <button style={styles.resetButton} onClick={resetFilters}>Reset</button>
            </div>
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>Loading course catalog...</p>
        ) : curriculums.length === 0 ? (
          <div style={styles.emptyCard}>
            <span style={{ fontSize: "40px" }}>🏛️</span>
            <h3 style={{ margin: "10px 0 4px", color: "#0B1F5E" }}>No Branch Curriculums Found</h3>
            <p style={{ color: "#64748B" }}>
              No curriculums or courses match the search query. Try resetting your search filters.
            </p>
          </div>
        ) : (
          curriculums.map((curriculum, index) => {
            const pubCourses = (curriculum.courses || []).filter((c) => c.status === "published");
            return (
              <section key={index} style={styles.courseSection}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <span style={styles.branchCategory}>{curriculum.category || "DOST Branch"}</span>
                    <h2 style={styles.sectionTitle}>{curriculum.title}</h2>
                    <p style={{ color: "#64748B", margin: "4px 0 0", fontSize: "14px" }}>{curriculum.description}</p>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#64748B" }}>
                    {pubCourses.length} {pubCourses.length === 1 ? "Course" : "Courses"} Available
                  </span>
                </div>

                <div className="lms-auto-grid">
                  {pubCourses.map((c) => (
                    <CourseCard key={c.id} course={c} />
                  ))}
                  {pubCourses.length === 0 && (
                    <div style={styles.noCourses}>
                      <p style={{ margin: 0 }}>Courses in this branch are currently in preparation by faculty mentors.</p>
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
  pageTitle: {
    margin: "0 0 6px",
    fontSize: "26px",
    fontWeight: "700",
    color: "#0B1F5E",
    letterSpacing: "-0.02em",
  },
  pageSubtitle: {
    margin: "0 0 20px",
    fontSize: "14px",
    color: "#64748B",
  },
  filterToolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: "14px 18px",
    borderRadius: "16px",
    border: "1px solid #E2E8F0",
    gap: "14px",
    flexWrap: "wrap",
    boxShadow: "0 2px 6px rgba(15, 23, 42, 0.03)",
  },
  searchContainer: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: "10px",
    padding: "0 12px",
    border: "1px solid #CBD5E1",
    flex: 1,
    minWidth: "260px",
  },
  searchInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    padding: "10px 8px",
    fontSize: "13px",
    width: "100%",
  },
  filterSelect: {
    padding: "9px 12px",
    borderRadius: "10px",
    border: "1px solid #CBD5E1",
    fontSize: "13px",
    backgroundColor: "#FFFFFF",
    color: "#334155",
  },
  resetButton: {
    padding: "9px 16px",
    border: "none",
    backgroundColor: "#EFF6FF",
    color: "#2563EB",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },
  courseSection: {
    marginBottom: "40px",
  },
  branchCategory: {
    backgroundColor: "#EFF6FF",
    color: "#2563EB",
    padding: "3px 10px",
    borderRadius: "10px",
    fontSize: "11px",
    fontWeight: "700",
    display: "inline-block",
    marginBottom: "4px",
  },
  sectionTitle: {
    color: "#0B1F5E",
    margin: 0,
    fontSize: "20px",
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid #E2E8F0",
    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
    display: "flex",
    flexDirection: "column",
  },
  courseImage: {
    width: "100%",
    height: "170px",
    objectFit: "cover",
  },
  levelBadge: {
    backgroundColor: "#EFF6FF",
    color: "#2563EB",
    padding: "3px 8px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "700",
  },
  courseTitle: {
    color: "#0B1F5E",
    margin: "6px 0 6px",
    fontSize: "16px",
    fontWeight: "700",
    lineHeight: "1.3",
  },
  description: {
    color: "#64748B",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: "0 0 12px",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  courseMeta: {
    fontSize: "12px",
    color: "#475569",
    margin: "0 0 14px",
  },
  cardActions: {
    display: "flex",
    gap: "8px",
    borderTop: "1px solid #F1F5F9",
    paddingTop: "12px",
  },
  button: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    color: "#334155",
    border: "1px solid #CBD5E1",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "12px",
  },
  enrolledBtn: {
    backgroundColor: "#DCFCE7",
    color: "#15803D",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "12px",
  },
  pendingBtn: {
    backgroundColor: "#FEF3C7",
    color: "#B45309",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
  },
  enrollBtnSmall: {
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "12px",
  },
  noCourses: {
    gridColumn: "1 / -1",
    padding: "32px",
    backgroundColor: "#FFFFFF",
    borderRadius: "14px",
    textAlign: "center",
    color: "#64748B",
    border: "1px dashed #CBD5E1",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    padding: "50px",
    textAlign: "center",
    borderRadius: "18px",
    border: "2px dashed #CBD5E1",
  },
};

export default CoursesPage;
