import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { courseAPI, courseContentAPI, enrollmentAPI, progressAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { roleHome } from "../utils/roles";
import AppHeader from "../components/layout/AppHeader";
import courseDefault from "../assets/course-default.jpg";

function CourseDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [progressItems, setProgressItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const courseRes = await courseAPI.getOne(id);
      setCourse(courseRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Unable to load course details.");
      setLoading(false);
      return;
    }
    try {
      const [enrollRes, progressRes] = await Promise.all([
        enrollmentAPI.userEnrollments().catch(() => ({ data: [] })),
        progressAPI.getAll().catch(() => ({ data: [] })),
      ]);
      setEnrollments(enrollRes.data || []);
      setProgressItems(progressRes.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const currentEnrollment = useMemo(() => {
    if (!course) return null;
    return enrollments.find(item => Number(item.course_id) === Number(course.id)) || null;
  }, [course, enrollments]);

  const enrollmentStatus = useMemo(() => {
    if (currentEnrollment) return currentEnrollment.status;
    return course?.enrollment_status || null;
  }, [currentEnrollment, course]);

  const isEnrolled = useMemo(() => {
    if (course?.is_enrolled) return true;
    return enrollmentStatus === "enrolled" || enrollmentStatus === "in_progress" || enrollmentStatus === "completed";
  }, [course, enrollmentStatus]);

  const isPending = enrollmentStatus === "pending";

  const progress = useMemo(() => {
    const item = progressItems.find(row => Number(row.course_id) === Number(id));
    return item || { progress: 0, status: "not_started" };
  }, [progressItems, id]);

  const isMentorOwner = user?.role === "mentor" && Number(course?.mentor_id) === Number(user?.id);
  const isStaff = user?.role === "admin" || isMentorOwner;
  const outcomes = course ? buildOutcomes(course) : [];
  const requirements = [
    "Active DOST Academy profile.",
    "Enrollment approval by the course mentor.",
    "Completion of structured lessons, video walkthroughs, and mentor-evaluated quizzes.",
  ];

  const handleEnroll = async () => {
    if (!course) return;
    setSaving(true);
    try {
      await enrollmentAPI.enroll({ course_id: course.id });
      await loadData();
      alert("Enrollment requested! Your request has been sent to the course mentor for approval.");
    } catch (err) {
      alert(err.response?.data?.error || "Enrollment request failed.");
    } finally {
      setSaving(false);
    }
  };

  const completeContent = async (contentId) => {
    setSaving(true);
    try {
      await courseContentAPI.complete(contentId);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || "Unable to complete this content.");
    } finally {
      setSaving(false);
    }
  };

  if (!id) {
    return (
      <Shell>
        <div style={styles.emptyCard}>
          <h1 style={styles.heading}>Select a Course</h1>
          <p style={styles.text}>Open a course from the catalog to view its mentor, assignments, requirements, and learning path.</p>
          <button style={styles.primaryButton} onClick={() => navigate("/courses")}>Browse Courses</button>
        </div>
      </Shell>
    );
  }

  if (loading) {
    return <Shell><p style={styles.loading}>Loading course details...</p></Shell>;
  }

  if (!course) {
    return <Shell><p style={styles.loading}>Course not found.</p></Shell>;
  }

  return (
    <Shell>
      <nav style={styles.breadcrumb}>
        <button style={styles.crumbButton} onClick={() => navigate(roleHome(user?.role))}>Home</button>
        <span>/</span>
        <button style={styles.crumbButton} onClick={() => navigate("/courses")}>Courses</button>
        <span>/</span>
        <strong>{course.title}</strong>
      </nav>

      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <span style={styles.badge}>{course.curriculum?.title || "DOST Branch Curriculum"}</span>
          <h1 style={styles.heroTitle}>{course.title}</h1>
          <p style={styles.heroText}>{course.description}</p>
          <div style={styles.metaGrid}>
            <Meta label="Domain" value={course.domain || course.department || "General"} />
            <Meta label="Level" value={course.level} />
            <Meta label="Duration" value={course.duration} />
            <Meta label="Learners" value={course.learner_count || 0} />
          </div>
        </div>
        <aside style={styles.actionPanel}>
          <img src={course.image || courseDefault} alt={course.title} style={styles.coverImage} />
          <div style={styles.mentorBox}>
            <p style={styles.kicker}>Assigned Course Mentor</p>
            <h3 style={styles.mentorName}>🧑‍🏫 {course.mentor?.name || "Mentor pending assignment"}</h3>
            <p style={styles.smallText}>{course.mentor?.department || course.department || "Relevant Department"}</p>
          </div>

          {isEnrolled && (
            <div style={styles.progressBlock}>
              <div style={styles.progressHeader}><span>Your Learning Progress</span><strong>{progress.progress || 0}%</strong></div>
              <div style={styles.progressBar}><div style={{...styles.progressFill, width: `${progress.progress || 0}%`}} /></div>
            </div>
          )}

          {/* Pending Approval Notice */}
          {isPending && user?.role === "employee" && (
            <div style={styles.pendingCard}>
              <span style={{ fontSize: "20px" }}>⏳</span>
              <div>
                <strong style={{ color: "#B45309" }}>Enrollment Pending Approval</strong>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#92400E", lineHeight: "1.4" }}>
                  Your enrollment request was submitted to mentor <strong>{course.mentor?.name || "assigned mentor"}</strong>. Learning modules and quizzes will unlock as soon as your enrollment is approved.
                </p>
              </div>
            </div>
          )}

          {/* Not enrolled: Request Enrollment */}
          {!isEnrolled && !isPending && user?.role === "employee" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button style={styles.primaryButton} onClick={handleEnroll} disabled={saving}>
                {saving ? "Submitting..." : "📝 Request Course Enrollment"}
              </button>
              <p style={{ margin: 0, fontSize: "11px", color: "#64748B", textAlign: "center" }}>
                Requires course mentor approval
              </p>
            </div>
          )}

          {/* Enrolled: Start Learning */}
          {isEnrolled && user?.role === "employee" && (
            <>
              <button style={styles.primaryButton} onClick={() => document.getElementById("course-content")?.scrollIntoView({ behavior: "smooth" })} disabled={saving}>
                ✓ Start Learning
              </button>
              <button style={styles.secondaryButton} onClick={() => navigate("/assignments")}>
                View Graded Quizzes
              </button>
            </>
          )}

          {/* Staff controls */}
          {isStaff && (
            <button
              style={styles.primaryButton}
              onClick={() => navigate(user.role === "admin" ? "/manage-courses" : "/mentor-dashboard")}
            >
              {user.role === "admin" ? "Manage in Admin Panel" : "Manage Course in Mentor Workspace"}
            </button>
          )}
        </aside>
      </section>

      <section style={styles.contentGrid}>
        <div>
          <InfoPanel title="Course Overview">
            <p style={styles.text}>{course.description}</p>
            <p style={styles.text}>
              This course is part of the <strong>{course.curriculum?.title}</strong> branch, curated and mentored by <strong>{course.mentor?.name}</strong>.
            </p>
          </InfoPanel>

          <InfoPanel title="Learning Objectives">
            <ul style={styles.cleanList}>{outcomes.map(item => <CheckItem key={item} text={item} />)}</ul>
          </InfoPanel>

          <InfoPanel title="Enrollment Requirements">
            <ul style={styles.cleanList}>{requirements.map(item => <CheckItem key={item} text={item} />)}</ul>
          </InfoPanel>

          <InfoPanel title="Structured Lessons & Video Lectures">
            <div id="course-content" style={styles.contentList}>
              {(course.contents || []).length === 0 && (
                <p style={styles.text}>No course content published yet by the mentor.</p>
              )}
              {(course.contents || []).map((content, index) => (
                <div key={content.id} style={styles.contentItem}>
                  <div style={styles.contentIndex}>{index + 1}</div>
                  <div style={styles.contentBody}>
                    <div style={styles.contentHeader}>
                      <div>
                        <h3 style={styles.contentTitle}>{content.title}</h3>
                        <p style={styles.smallText}>{content.content_type.toUpperCase()} • {content.duration_minutes || 30} minutes</p>
                      </div>
                      {isEnrolled || isStaff ? (
                        <span style={content.is_completed ? styles.completePill : styles.pendingPill}>
                          {content.is_completed ? "Completed" : "Pending"}
                        </span>
                      ) : (
                        <span style={styles.lockPill}>🔒 Locked</span>
                      )}
                    </div>
                    <p style={styles.text}>{content.description || "Learning material for this course section."}</p>

                    <div style={styles.contentActions}>
                      {(isEnrolled || isStaff) ? (
                        <>
                          {content.content_url && (
                            <a style={styles.linkButton} href={content.content_url} target="_blank" rel="noreferrer">
                              ▶ Open Video / Lecture Link
                            </a>
                          )}
                          {content.file_path && (
                            <a style={styles.linkButton} href={`http://127.0.0.1:8000/storage/${content.file_path}`} target="_blank" rel="noreferrer">
                              📄 Open Resource File
                            </a>
                          )}
                          {user?.role === "employee" && !content.is_completed && (
                            <button style={styles.primaryButton} onClick={() => completeContent(content.id)} disabled={saving}>
                              Mark Complete
                            </button>
                          )}
                        </>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#64748B", fontStyle: "italic" }}>
                          🔒 Content access unlocks upon mentor enrollment approval.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </InfoPanel>
        </div>

        <aside style={styles.sideColumn}>
          <InfoPanel title="Assessments & Quizzes">
            {(course.assignments || []).length === 0 && (
              <p style={styles.smallText}>No quizzes or assignments posted for this course yet.</p>
            )}
            {(course.assignments || []).map(item => (
              <div key={item.id} style={styles.assessmentCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={styles.assessmentTitle}>{item.title}</h4>
                  <span style={styles.statusPill}>{item.assessment_type}</span>
                </div>
                <p style={styles.smallText}>Max Score: {item.max_score} • Due: {item.due_date}</p>
                {item.description && <p style={styles.smallText}>{item.description}</p>}
                {(isEnrolled || isStaff) ? (
                  user?.role === "employee" && (
                    <button style={styles.secondaryButton} onClick={() => navigate("/assignments")}>
                      Open Assessment
                    </button>
                  )
                ) : (
                  <span style={{ fontSize: "12px", color: "#B45309" }}>🔒 Locked until enrolled</span>
                )}
              </div>
            ))}
          </InfoPanel>
        </aside>
      </section>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div style={styles.page}>
      <AppHeader />
      <main className="lms-page-container" style={styles.main}>{children}</main>
    </div>
  );
}

function Meta({ label, value }) {
  return <div style={styles.metaItem}><span style={styles.kicker}>{label}</span><strong>{value}</strong></div>;
}

function InfoPanel({ title, children }) {
  return <div style={styles.panel}><h2 style={styles.panelTitle}>{title}</h2>{children}</div>;
}

function CheckItem({ text }) {
  return <li style={styles.checkItem}><span style={styles.check}>✓</span><span>{text}</span></li>;
}

function buildOutcomes(course) {
  const domain = course.domain || course.department || course.title;
  return [
    `Apply ${domain} principles to DOST departmental scenarios.`,
    "Complete mentor-curated video lectures, practical exercises, and quizzes.",
    "Earn competency verified by your assigned branch mentor.",
  ];
}

const styles = {
  page: { minHeight: "100vh", background: "#F8FAFC", fontFamily: "Arial, sans-serif" },
  main: { padding: "clamp(20px, 3vw, 48px)", width: "100%", maxWidth: "100%", margin: "0", boxSizing: "border-box" },
  breadcrumb: { display: "flex", gap: "8px", alignItems: "center", color: "#64748B", marginBottom: "20px", flexWrap: "wrap", fontSize: "13px" },
  crumbButton: { border: "none", background: "transparent", color: "#2563EB", cursor: "pointer", padding: 0, fontWeight: "700" },
  hero: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px", marginBottom: "24px" },
  heroContent: { backgroundColor: "#ffffff", borderRadius: "18px", padding: "28px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", border: "1px solid #E2E8F0" },
  badge: { display: "inline-block", backgroundColor: "#EEF2FF", color: "#2563EB", borderRadius: "8px", padding: "4px 10px", fontWeight: "700", fontSize: "12px" },
  heroTitle: { color: "#0B1F5E", fontSize: "32px", margin: "14px 0 10px" },
  heroText: { color: "#475569", lineHeight: 1.6, fontSize: "15px" },
  metaGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "12px", marginTop: "20px" },
  metaItem: { backgroundColor: "#F8FAFC", borderRadius: "10px", padding: "12px", display: "grid", gap: "4px", color: "#0B1F5E" },
  actionPanel: { backgroundColor: "#ffffff", borderRadius: "18px", padding: "18px", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", height: "fit-content", display: "grid", gap: "14px", border: "1px solid #E2E8F0" },
  coverImage: { width: "100%", height: "180px", objectFit: "cover", borderRadius: "12px" },
  mentorBox: { backgroundColor: "#F8FAFC", borderRadius: "10px", padding: "12px" },
  kicker: { margin: 0, color: "#2563EB", fontWeight: "700", fontSize: "11px" },
  mentorName: { margin: "4px 0", color: "#0B1F5E", fontSize: "16px" },
  smallText: { color: "#64748B", fontSize: "12px", lineHeight: 1.5, margin: 0 },
  progressBlock: { display: "grid", gap: "6px" },
  progressHeader: { display: "flex", justifyContent: "space-between", color: "#0B1F5E", fontSize: "13px" },
  progressBar: { height: "8px", backgroundColor: "#E2E8F0", borderRadius: "10px", overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#22C55E", borderRadius: "10px" },
  pendingCard: { backgroundColor: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: "10px", padding: "12px", display: "flex", gap: "10px", alignItems: "flex-start" },
  primaryButton: { backgroundColor: "#2563EB", color: "#ffffff", border: "none", padding: "11px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "13px" },
  secondaryButton: { backgroundColor: "#EEF2FF", color: "#0B1F5E", border: "none", padding: "11px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "13px" },
  contentGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" },
  sideColumn: { display: "grid", gap: "18px", alignContent: "start" },
  panel: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "22px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", border: "1px solid #E2E8F0", marginBottom: "18px" },
  panelTitle: { color: "#0B1F5E", margin: "0 0 14px", fontSize: "20px" },
  text: { color: "#475569", lineHeight: 1.6, fontSize: "14px" },
  cleanList: { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "8px" },
  checkItem: { display: "flex", gap: "10px", color: "#475569", lineHeight: 1.5, fontSize: "13px" },
  check: { color: "#16A34A", fontWeight: "900", fontSize: "13px" },
  contentList: { display: "grid", gap: "12px" },
  contentItem: { display: "grid", gridTemplateColumns: "36px 1fr", gap: "12px", backgroundColor: "#F8FAFC", borderRadius: "12px", padding: "14px", border: "1px solid #F1F5F9" },
  contentIndex: { width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#2563EB", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "13px" },
  contentBody: { display: "grid", gap: "6px" },
  contentHeader: { display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" },
  contentTitle: { color: "#0B1F5E", margin: 0, fontSize: "16px" },
  contentActions: { display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", marginTop: "4px" },
  linkButton: { backgroundColor: "#E0F2FE", color: "#075985", textDecoration: "none", padding: "8px 12px", borderRadius: "8px", fontWeight: "700", fontSize: "12px" },
  completePill: { backgroundColor: "#D1FAE5", color: "#065F46", borderRadius: "12px", padding: "4px 8px", fontSize: "11px", fontWeight: "800" },
  pendingPill: { backgroundColor: "#FEF3C7", color: "#92400E", borderRadius: "12px", padding: "4px 8px", fontSize: "11px", fontWeight: "800" },
  lockPill: { backgroundColor: "#F1F5F9", color: "#64748B", borderRadius: "12px", padding: "4px 8px", fontSize: "11px", fontWeight: "700" },
  assessmentCard: { backgroundColor: "#F8FAFC", borderRadius: "10px", padding: "12px", marginBottom: "10px", display: "grid", gap: "6px", border: "1px solid #E2E8F0" },
  assessmentTitle: { color: "#0B1F5E", margin: 0, fontSize: "15px" },
  statusPill: { backgroundColor: "#EEF2FF", color: "#2563EB", borderRadius: "6px", padding: "2px 6px", fontSize: "11px", fontWeight: "700", textTransform: "capitalize" },
  emptyCard: { backgroundColor: "#ffffff", padding: "40px", borderRadius: "18px", border: "1px solid #E2E8F0", maxWidth: "700px" },
  heading: { color: "#0B1F5E", fontSize: "28px", marginTop: 0 },
  loading: { textAlign: "center", padding: "50px", color: "#64748B" },
};

export default CourseDetailsPage;
