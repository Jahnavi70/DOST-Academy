import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { mentorAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/dost-logo.png";

function MentorDashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("courses"); // courses, enrollments, wizard, grading
  const [assignedCurriculum, setAssignedCurriculum] = useState(null);
  const [stats, setStats] = useState({
    courses: 0,
    assignments: 0,
    contents: 0,
    learners: 0,
    pending_enrollments: 0,
    pending_grades: 0,
    average_score: 0,
  });
  const [courses, setCourses] = useState([]);
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [gradeForms, setGradeForms] = useState({});

  // Wizard States (Google Form Style Multi-Step)
  const [wizardStep, setWizardStep] = useState(1);
  const [submittingCourse, setSubmittingCourse] = useState(false);
  const [wizardCourse, setWizardCourse] = useState({
    title: "",
    domain: "",
    description: "",
    duration: "4 weeks",
    level: "Beginner",
    image: "",
  });

  const [wizardLessons, setWizardLessons] = useState([
    {
      title: "Module 1: Orientation and Foundations",
      topic: "Introduction and Core Objectives",
      content_type: "lesson",
      content_url: "",
      description: "Overview of key concepts, goals, and workplace standards.",
      duration_minutes: 30,
    },
  ]);

  const [wizardAssessments, setWizardAssessments] = useState([
    {
      title: "Knowledge Check Quiz 1",
      assessment_type: "quiz",
      description: "Short quiz evaluating comprehension of introductory principles.",
      max_score: 100,
      due_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    },
  ]);

  // Edit Course Modal
  const [editingCourse, setEditingCourse] = useState(null);
  const [editCourseForm, setEditCourseForm] = useState({
    title: "",
    domain: "",
    description: "",
    duration: "",
    level: "Beginner",
    image: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dashRes, enrollRes] = await Promise.all([
        mentorAPI.dashboard(),
        mentorAPI.enrollments(),
      ]);
      setAssignedCurriculum(dashRes.data.assigned_curriculum || null);
      setStats(dashRes.data.stats || {});
      setCourses(dashRes.data.courses || []);
      setSubmissions(dashRes.data.submissions || []);
      setPendingEnrollments(Array.isArray(enrollRes.data) ? enrollRes.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Google Form-Style Wizard Helpers
  const addLessonItem = () => {
    const nextNum = wizardLessons.length + 1;
    setWizardLessons((prev) => [
      ...prev,
      {
        title: `Module ${nextNum}: Section Topic`,
        topic: `Chapter ${nextNum}`,
        content_type: "video",
        content_url: "",
        description: "",
        duration_minutes: 30,
      },
    ]);
  };

  const removeLessonItem = (index) => {
    if (wizardLessons.length <= 1) return;
    setWizardLessons((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLessonItem = (index, field, value) => {
    setWizardLessons((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addAssessmentItem = () => {
    const nextNum = wizardAssessments.length + 1;
    setWizardAssessments((prev) => [
      ...prev,
      {
        title: `Assessment ${nextNum}`,
        assessment_type: "quiz",
        description: "",
        max_score: 100,
        due_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      },
    ]);
  };

  const removeAssessmentItem = (index) => {
    setWizardAssessments((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAssessmentItem = (index, field, value) => {
    setWizardAssessments((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleFinishWizard = async () => {
    if (!assignedCurriculum) {
      alert("You cannot publish a course because you have not been assigned to a branch/curriculum yet. Please ask an Admin to assign your branch.");
      return;
    }
    if (!wizardCourse.title || !wizardCourse.description) {
      alert("Please enter the course title and description in Step 1.");
      setWizardStep(1);
      return;
    }

    setSubmittingCourse(true);
    try {
      const payload = {
        ...wizardCourse,
        domain: wizardCourse.domain || assignedCurriculum.category || "General",
        curriculum_id: assignedCurriculum.id,
        lessons: wizardLessons,
        assessments: wizardAssessments,
      };

      await mentorAPI.createCourse(payload);
      alert("Course, structured lessons, and assessments created successfully!");
      // Reset wizard
      setWizardCourse({
        title: "",
        domain: "",
        description: "",
        duration: "4 weeks",
        level: "Beginner",
        image: "",
      });
      setWizardStep(1);
      setActiveSection("courses");
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || "Failed to create course");
    } finally {
      setSubmittingCourse(false);
    }
  };

  // Course Actions
  const handleDeleteCourse = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete course "${title}"? All lessons, quizzes, and enrollments will be deleted.`)) return;
    try {
      await mentorAPI.deleteCourse(id);
      loadData();
    } catch (err) {
      alert("Failed to delete course");
    }
  };

  const handleOpenEditCourse = (course) => {
    setEditingCourse(course);
    setEditCourseForm({
      title: course.title,
      domain: course.domain || "",
      description: course.description,
      duration: course.duration,
      level: course.level,
      image: course.image || "",
    });
  };

  const handleSaveEditCourse = async (e) => {
    e.preventDefault();
    try {
      await mentorAPI.updateCourse(editingCourse.id, editCourseForm);
      setEditingCourse(null);
      loadData();
      alert("Course details updated.");
    } catch (err) {
      alert("Failed to update course.");
    }
  };

  // Enrollment Approvals
  const handleApproveEnrollment = async (id) => {
    try {
      await mentorAPI.approveEnrollment(id);
      loadData();
    } catch (err) {
      alert("Failed to approve enrollment.");
    }
  };

  const handleRejectEnrollment = async (id) => {
    if (!window.confirm("Decline this learner's enrollment request?")) return;
    try {
      await mentorAPI.rejectEnrollment(id);
      loadData();
    } catch (err) {
      alert("Failed to reject enrollment.");
    }
  };

  // Grading
  const handleGrade = async (submissionId) => {
    const gf = gradeForms[submissionId] || {};
    if (gf.result === undefined || gf.result === "") {
      alert("Please provide a numeric grade.");
      return;
    }
    try {
      await mentorAPI.grade(submissionId, {
        result: Number(gf.result),
        feedback: gf.feedback || "",
      });
      loadData();
      alert("Grade submitted successfully.");
    } catch (err) {
      alert("Failed to submit grade.");
    }
  };

  const pendingEnrollmentsList = useMemo(() => {
    return pendingEnrollments.filter((e) => e.status === "pending");
  }, [pendingEnrollments]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <img src={logo} alt="DOST" style={{ height: "48px", marginBottom: "16px" }} />
          <p style={{ color: "#64748B", fontSize: "15px", fontWeight: "500" }}>Loading mentor workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.navbar}>
        <div style={styles.logoSection}>
          <img src={logo} alt="DOST Logo" style={styles.logo} />
          <div>
            <h2 style={styles.title}>DOST Academy</h2>
            <p style={styles.subtitle}>Teacher & Mentor Workspace</p>
          </div>
        </div>
        <div style={styles.navLinks}>
          <button style={styles.activeButton}>Mentor Workspace</button>
          <button style={styles.navButton} onClick={() => navigate("/courses")}>Course Catalog</button>
          <div style={styles.profileWrapper}>
            <button style={styles.profileButton} onClick={() => setShowMenu(!showMenu)}>
              {user?.name || "Mentor"} ▾
            </button>
            {showMenu && (
              <div style={styles.dropdown}>
                <p style={styles.dropdownItem} onClick={() => navigate("/edit-profile")}>Edit Profile</p>
                <p style={styles.logoutItem} onClick={() => { logout(); navigate("/"); }}>Logout</p>
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {/* Mentor Branch Assignment Banner */}
        <section style={styles.branchBanner}>
          <div style={{ flex: 1 }}>
            <span style={styles.branchTag}>ASSIGNED BRANCH / CURRICULUM</span>
            {assignedCurriculum ? (
              <>
                <h1 style={styles.branchTitle}>🏛️ {assignedCurriculum.title}</h1>
                <p style={styles.branchDesc}>{assignedCurriculum.description}</p>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748B" }}>
                  Category: <strong>{assignedCurriculum.category}</strong> • Level: <strong>{assignedCurriculum.level || "Intermediate"}</strong>
                </p>
              </>
            ) : (
              <>
                <h1 style={{ ...styles.branchTitle, color: "#DC2626" }}>⚠️ No Branch Assigned Yet</h1>
                <p style={styles.branchDesc}>
                  Your account must be assigned to a curriculum branch (e.g. IT Department, Mechanical Engineering) by the Administrator before you can publish courses.
                </p>
              </>
            )}
          </div>
          <div style={styles.mentorBadge}>
            <strong>{user?.name}</strong>
            <span style={{ fontSize: "12px", color: "#64748B" }}>{user?.email}</span>
            <span style={styles.rolePill}>Certified Mentor</span>
          </div>
        </section>

        {/* Stats Grid */}
        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <h3>Courses</h3>
            <p style={styles.statValue}>{stats.courses || 0}</p>
          </div>
          <div style={styles.statCardAlert} onClick={() => setActiveSection("enrollments")}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>Enrollment Requests</h3>
              {stats.pending_enrollments > 0 && <span style={styles.pulsingBadge}>{stats.pending_enrollments} NEW</span>}
            </div>
            <p style={{ ...styles.statValue, color: stats.pending_enrollments > 0 ? "#D97706" : "#2563EB" }}>
              {stats.pending_enrollments || 0}
            </p>
            <span style={{ fontSize: "11px", color: "#64748B" }}>Awaiting your approval</span>
          </div>
          <div style={styles.statCard}>
            <h3>Active Learners</h3>
            <p style={styles.statValue}>{stats.learners || 0}</p>
          </div>
          <div style={styles.statCard}>
            <h3>Published Content</h3>
            <p style={styles.statValue}>{stats.contents || 0}</p>
          </div>
          <div style={styles.statCard}>
            <h3>Pending Grades</h3>
            <p style={styles.statValue}>{stats.pending_grades || 0}</p>
          </div>
        </section>

        {/* Section Navigation Tabs */}
        <div style={styles.tabBar}>
          <button
            style={activeSection === "courses" ? styles.tabBtnActive : styles.tabBtn}
            onClick={() => setActiveSection("courses")}
          >
            📚 My Courses ({courses.length})
          </button>
          <button
            style={activeSection === "wizard" ? styles.tabBtnActive : styles.tabBtn}
            onClick={() => {
              if (!assignedCurriculum) {
                alert("Please have an Admin assign your curriculum branch before creating courses.");
                return;
              }
              setActiveSection("wizard");
            }}
          >
            ✨ Create Course (Structured Form)
          </button>
          <button
            style={activeSection === "enrollments" ? styles.tabBtnActiveAlert : styles.tabBtn}
            onClick={() => setActiveSection("enrollments")}
          >
            📋 Enrollment Requests ({pendingEnrollmentsList.length})
          </button>
          <button
            style={activeSection === "grading" ? styles.tabBtnActive : styles.tabBtn}
            onClick={() => setActiveSection("grading")}
          >
            📝 Submissions & Grading ({submissions.length})
          </button>
        </div>

        {/* ========================================================== */}
        {/* TAB 1: GOOGLE FORM STYLE STRUCTURED COURSE BUILDER */}
        {/* ========================================================== */}
        {activeSection === "wizard" && (
          <section style={styles.wizardContainer}>
            <div style={styles.wizardHeader}>
              <div>
                <span style={styles.wizardKicker}>STRUCTURED STEP-BY-STEP BUILDER</span>
                <h2 style={styles.wizardTitle}>Course Creation in: {assignedCurriculum?.title}</h2>
                <p style={styles.wizardSubtitle}>
                  Design a complete learning curriculum item like a Google Form. Fill out course information, structure chapters and video content, and attach quizzes.
                </p>
              </div>
              <div style={styles.stepIndicator}>
                <span style={wizardStep >= 1 ? styles.stepActive : styles.stepInactive}>1. Info & Banner</span>
                <span style={styles.stepArrow}>➔</span>
                <span style={wizardStep >= 2 ? styles.stepActive : styles.stepInactive}>2. Lessons & Chapters</span>
                <span style={styles.stepArrow}>➔</span>
                <span style={wizardStep >= 3 ? styles.stepActive : styles.stepInactive}>3. Quizzes & Work</span>
                <span style={styles.stepArrow}>➔</span>
                <span style={wizardStep >= 4 ? styles.stepActive : styles.stepInactive}>4. Review</span>
              </div>
            </div>

            {/* STEP 1: Basic Info & Banner */}
            {wizardStep === 1 && (
              <div style={styles.wizardCard}>
                <h3 style={styles.stepTitle}>Step 1: Course Overview & Banner Media</h3>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Course Title *</label>
                  <input
                    style={styles.input}
                    placeholder="e.g. Advanced Cybersecurity Defense Protocols"
                    value={wizardCourse.title}
                    onChange={(e) => setWizardCourse({ ...wizardCourse, title: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Subject Domain / Specialization</label>
                    <input
                      style={styles.input}
                      placeholder="e.g. Threat Analysis, Power Grids"
                      value={wizardCourse.domain}
                      onChange={(e) => setWizardCourse({ ...wizardCourse, domain: e.target.value })}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Assigned Branch</label>
                    <input
                      style={{ ...styles.input, backgroundColor: "#F1F5F9", color: "#64748B" }}
                      value={assignedCurriculum?.title || "No branch assigned"}
                      disabled
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Estimated Duration</label>
                    <input
                      style={styles.input}
                      placeholder="e.g. 4 weeks, 6 weeks"
                      value={wizardCourse.duration}
                      onChange={(e) => setWizardCourse({ ...wizardCourse, duration: e.target.value })}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Difficulty Level</label>
                    <select
                      style={styles.input}
                      value={wizardCourse.level}
                      onChange={(e) => setWizardCourse({ ...wizardCourse, level: e.target.value })}
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Course Banner Image URL</label>
                  <input
                    style={styles.input}
                    placeholder="/course-default.svg or local/hosted banner image URL"
                    value={wizardCourse.image}
                    onChange={(e) => setWizardCourse({ ...wizardCourse, image: e.target.value })}
                  />
                  {wizardCourse.image && (
                    <div style={{ marginTop: "8px" }}>
                      <span style={{ fontSize: "12px", color: "#64748B" }}>Banner Preview:</span>
                      <img src={wizardCourse.image} alt="Banner Preview" style={styles.bannerPreview} />
                    </div>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Course Description & Learning Objectives *</label>
                  <textarea
                    style={styles.textarea}
                    placeholder="Detailed outline of what learners will gain, key requirements, and syllabus..."
                    value={wizardCourse.description}
                    onChange={(e) => setWizardCourse({ ...wizardCourse, description: e.target.value })}
                    required
                  />
                </div>

                <div style={styles.wizardActions}>
                  <button style={styles.primaryBtn} onClick={() => {
                    if (!wizardCourse.title || !wizardCourse.description) {
                      alert("Please fill in course title and description.");
                      return;
                    }
                    setWizardStep(2);
                  }}>
                    Next: Add Lessons & Chapters ➔
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Lessons, Topics & Video Content */}
            {wizardStep === 2 && (
              <div style={styles.wizardCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <h3 style={styles.stepTitle}>Step 2: Structured Lessons, Chapters & Videos</h3>
                    <p style={{ margin: "2px 0 0", color: "#64748B", fontSize: "13px" }}>
                      Add sections and chapters. Provide lecture text, video links, and study requirements for each lesson.
                    </p>
                  </div>
                  <button style={styles.addSectionBtn} onClick={addLessonItem}>
                    + Add Another Lesson / Chapter
                  </button>
                </div>

                {wizardLessons.map((lesson, idx) => (
                  <div key={idx} style={styles.lessonBlock}>
                    <div style={styles.lessonBlockHeader}>
                      <span style={styles.blockNumber}>Lesson {idx + 1}</span>
                      {wizardLessons.length > 1 && (
                        <button style={styles.removeBtn} onClick={() => removeLessonItem(idx)}>
                          ✕ Remove
                        </button>
                      )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "12px" }}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Lesson / Module Title *</label>
                        <input
                          style={styles.input}
                          placeholder="e.g. Module 1: Foundational Principles"
                          value={lesson.title}
                          onChange={(e) => updateLessonItem(idx, "title", e.target.value)}
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Chapter / Topic Focus</label>
                        <input
                          style={styles.input}
                          placeholder="e.g. Architecture and Controls"
                          value={lesson.topic || ""}
                          onChange={(e) => updateLessonItem(idx, "topic", e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 140px", gap: "12px" }}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Content Format</label>
                        <select
                          style={styles.input}
                          value={lesson.content_type}
                          onChange={(e) => updateLessonItem(idx, "content_type", e.target.value)}
                        >
                          <option value="lesson">Structured Lesson Text</option>
                          <option value="video">Video Lecture (URL)</option>
                          <option value="document">Documentation / Handout</option>
                          <option value="link">External Resource Link</option>
                          <option value="practical">Hands-On Practical Lab</option>
                        </select>
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>Video / Resource URL</label>
                        <input
                          style={styles.input}
                          placeholder="https://youtube.com/watch?v=... or direct MP4/PDF link"
                          value={lesson.content_url || ""}
                          onChange={(e) => updateLessonItem(idx, "content_url", e.target.value)}
                        />
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>Duration (Mins)</label>
                        <input
                          style={styles.input}
                          type="number"
                          min="5"
                          max="300"
                          value={lesson.duration_minutes}
                          onChange={(e) => updateLessonItem(idx, "duration_minutes", e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Lesson Content / Study Notes</label>
                      <textarea
                        style={{ ...styles.textarea, minHeight: "70px" }}
                        placeholder="Key takeaways, instructions, textbook references, and guidelines for this lesson..."
                        value={lesson.description}
                        onChange={(e) => updateLessonItem(idx, "description", e.target.value)}
                      />
                    </div>
                  </div>
                ))}

                <button style={styles.addSectionBtnWide} onClick={addLessonItem}>
                  + Add Next Module / Lesson
                </button>

                <div style={styles.wizardActions}>
                  <button style={styles.secondaryBtn} onClick={() => setWizardStep(1)}>
                    ◀ Back to Overview
                  </button>
                  <button style={styles.primaryBtn} onClick={() => setWizardStep(3)}>
                    Next: Add Quizzes & Assessments ➔
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Quizzes and Assignments */}
            {wizardStep === 3 && (
              <div style={styles.wizardCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <h3 style={styles.stepTitle}>Step 3: Quizzes, Assignments & Practical Tasks</h3>
                    <p style={{ margin: "2px 0 0", color: "#64748B", fontSize: "13px" }}>
                      Attach assessments to evaluate learner proficiency in this course.
                    </p>
                  </div>
                  <button style={styles.addSectionBtn} onClick={addAssessmentItem}>
                    + Add Quiz / Assignment
                  </button>
                </div>

                {wizardAssessments.map((item, idx) => (
                  <div key={idx} style={styles.lessonBlock}>
                    <div style={styles.lessonBlockHeader}>
                      <span style={styles.blockNumber}>Assessment {idx + 1}</span>
                      <button style={styles.removeBtn} onClick={() => removeAssessmentItem(idx)}>
                        ✕ Remove
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "12px" }}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Assessment Title *</label>
                        <input
                          style={styles.input}
                          placeholder="e.g. Midterm Quiz on System Controls"
                          value={item.title}
                          onChange={(e) => updateAssessmentItem(idx, "title", e.target.value)}
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Type</label>
                        <select
                          style={styles.input}
                          value={item.assessment_type}
                          onChange={(e) => updateAssessmentItem(idx, "assessment_type", e.target.value)}
                        >
                          <option value="quiz">Quiz</option>
                          <option value="assignment">Assignment / Report</option>
                          <option value="practical">Practical Lab</option>
                          <option value="project">Capstone Project</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Max Score</label>
                        <input
                          style={styles.input}
                          type="number"
                          min="1"
                          max="100"
                          value={item.max_score}
                          onChange={(e) => updateAssessmentItem(idx, "max_score", e.target.value)}
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Due Date</label>
                        <input
                          style={styles.input}
                          type="date"
                          value={item.due_date}
                          onChange={(e) => updateAssessmentItem(idx, "due_date", e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Questions, Instructions, or Rubric</label>
                      <textarea
                        style={{ ...styles.textarea, minHeight: "70px" }}
                        placeholder="Enter quiz questions or assignment prompt..."
                        value={item.description}
                        onChange={(e) => updateAssessmentItem(idx, "description", e.target.value)}
                      />
                    </div>
                  </div>
                ))}

                <button style={styles.addSectionBtnWide} onClick={addAssessmentItem}>
                  + Add Assessment
                </button>

                <div style={styles.wizardActions}>
                  <button style={styles.secondaryBtn} onClick={() => setWizardStep(2)}>
                    ◀ Back to Lessons
                  </button>
                  <button style={styles.primaryBtn} onClick={() => setWizardStep(4)}>
                    Next: Review & Publish ➔
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Review and Publish */}
            {wizardStep === 4 && (
              <div style={styles.wizardCard}>
                <h3 style={styles.stepTitle}>Step 4: Final Curriculum Review</h3>
                <p style={{ color: "#64748B", fontSize: "14px", marginBottom: "16px" }}>
                  Please review the complete course blueprint before publishing to your assigned branch.
                </p>

                <div style={styles.summaryCard}>
                  {wizardCourse.image && (
                    <img src={wizardCourse.image} alt="Course Banner" style={styles.summaryBanner} />
                  )}
                  <h2 style={{ color: "#0B1F5E", margin: "10px 0 6px" }}>{wizardCourse.title}</h2>
                  <p style={{ color: "#2563EB", fontWeight: "700", margin: "0 0 10px" }}>
                    Branch: {assignedCurriculum?.title} • Domain: {wizardCourse.domain || "General"} • Level: {wizardCourse.level} • Duration: {wizardCourse.duration}
                  </p>
                  <p style={{ color: "#475569", lineHeight: "1.5" }}>{wizardCourse.description}</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
                  <div style={styles.summarySection}>
                    <h4 style={{ color: "#0B1F5E", margin: "0 0 10px" }}>
                      📖 Structured Lessons ({wizardLessons.length}):
                    </h4>
                    {wizardLessons.map((l, i) => (
                      <div key={i} style={styles.summaryItem}>
                        <strong>{i + 1}. {l.title}</strong>
                        <p style={{ margin: "2px 0 0", color: "#64748B", fontSize: "12px" }}>
                          Type: {l.content_type} • {l.duration_minutes} mins
                          {l.content_url && ` • Link: ${l.content_url.slice(0, 35)}...`}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div style={styles.summarySection}>
                    <h4 style={{ color: "#0B1F5E", margin: "0 0 10px" }}>
                      📝 Quizzes & Assessments ({wizardAssessments.length}):
                    </h4>
                    {wizardAssessments.map((a, i) => (
                      <div key={i} style={styles.summaryItem}>
                        <strong>{i + 1}. {a.title} ({a.assessment_type.toUpperCase()})</strong>
                        <p style={{ margin: "2px 0 0", color: "#64748B", fontSize: "12px" }}>
                          Max Score: {a.max_score} • Due: {a.due_date}
                        </p>
                      </div>
                    ))}
                    {wizardAssessments.length === 0 && (
                      <p style={{ color: "#94A3B8", fontSize: "13px" }}>No assessments added.</p>
                    )}
                  </div>
                </div>

                <div style={styles.wizardActions}>
                  <button style={styles.secondaryBtn} onClick={() => setWizardStep(3)}>
                    ◀ Back to Edit
                  </button>
                  <button
                    style={styles.publishBtn}
                    onClick={handleFinishWizard}
                    disabled={submittingCourse}
                  >
                    {submittingCourse ? "Publishing Course..." : "🚀 Publish Course into Branch"}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ========================================================== */}
        {/* TAB 2: MY COURSES LIST (FULL CRUD) */}
        {/* ========================================================== */}
        {activeSection === "courses" && (
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ color: "#0B1F5E", margin: 0 }}>Courses in Your Branch</h2>
              <button
                style={styles.primaryBtn}
                onClick={() => {
                  if (!assignedCurriculum) {
                    alert("Please have an Admin assign your branch first.");
                    return;
                  }
                  setActiveSection("wizard");
                }}
              >
                + Create New Course
              </button>
            </div>

            {courses.length === 0 ? (
              <div style={styles.emptyCard}>
                <span style={{ fontSize: "40px" }}>📚</span>
                <h3>No Courses Created Yet</h3>
                <p style={{ color: "#64748B", maxWidth: "500px" }}>
                  You have not published any courses in your branch yet. Use the structured course creation form to build your first course.
                </p>
                <button style={styles.primaryBtn} onClick={() => setActiveSection("wizard")}>
                  ✨ Launch Course Creation Form
                </button>
              </div>
            ) : (
              <div style={styles.coursesGrid}>
                {courses.map((c) => (
                  <div key={c.id} style={styles.courseCard}>
                    {c.image ? (
                      <img src={c.image} alt={c.title} style={styles.courseThumb} />
                    ) : (
                      <div style={styles.placeholderThumb}>📘 {c.domain || "Course"}</div>
                    )}
                    <div style={{ padding: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={styles.badge}>{c.level}</span>
                        <span style={{ fontSize: "12px", color: "#64748B" }}>{c.duration}</span>
                      </div>
                      <h3 style={styles.courseTitle}>{c.title}</h3>
                      <p style={styles.courseDesc}>{c.description?.slice(0, 100)}...</p>

                      <div style={styles.courseStatsRow}>
                        <span>📖 {c.contents?.length || 0} Lessons</span>
                        <span>📝 {c.assignments?.length || 0} Assessments</span>
                      </div>

                      <div style={styles.courseCardBtns}>
                        <button
                          style={styles.cardViewBtn}
                          onClick={() => navigate(`/course-details/${c.id}`)}
                        >
                          View
                        </button>
                        <button
                          style={styles.cardEditBtn}
                          onClick={() => handleOpenEditCourse(c)}
                        >
                          Edit
                        </button>
                        <button
                          style={styles.cardDelBtn}
                          onClick={() => handleDeleteCourse(c.id, c.title)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ========================================================== */}
        {/* TAB 3: ENROLLMENT REQUESTS APPROVAL QUEUE */}
        {/* ========================================================== */}
        {activeSection === "enrollments" && (
          <section style={styles.panel}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h2 style={{ color: "#0B1F5E", margin: "0 0 4px" }}>Course Enrollment Approval Queue</h2>
                <p style={{ margin: 0, color: "#64748B", fontSize: "13px" }}>
                  Students must be approved by you before they can access lessons, watch videos, and take quizzes.
                </p>
              </div>
            </div>

            {pendingEnrollmentsList.length === 0 ? (
              <div style={styles.empty}>
                <span style={{ fontSize: "36px" }}>✅</span>
                <h3>No Pending Enrollment Requests</h3>
                <p style={{ color: "#64748B" }}>All learner registrations for your courses have been reviewed.</p>
              </div>
            ) : (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Learner Name</th>
                      <th style={styles.th}>Learner Email</th>
                      <th style={styles.th}>Requested Course</th>
                      <th style={styles.th}>Request Date</th>
                      <th style={styles.th}>Approval Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingEnrollmentsList.map((req, i) => (
                      <tr key={req.id} style={i % 2 === 0 ? { backgroundColor: "#F8FAFC" } : {}}>
                        <td style={styles.td}>
                          <strong>{req.user?.name}</strong>
                          <p style={{ margin: "2px 0 0", color: "#64748B", fontSize: "11px" }}>
                            {req.user?.department || "General Department"}
                          </p>
                        </td>
                        <td style={styles.td}>{req.user?.email}</td>
                        <td style={styles.td}>
                          <strong>{req.course?.title || "Branch Enrollment"}</strong>
                        </td>
                        <td style={styles.td}>
                          {new Date(req.created_at).toLocaleDateString()}
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              style={styles.approveBtn}
                              onClick={() => handleApproveEnrollment(req.id)}
                            >
                              ✓ Approve Access
                            </button>
                            <button
                              style={styles.rejectBtn}
                              onClick={() => handleRejectEnrollment(req.id)}
                            >
                              ✕ Decline
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ========================================================== */}
        {/* TAB 4: SUBMISSIONS & GRADING */}
        {/* ========================================================== */}
        {activeSection === "grading" && (
          <section style={styles.panel}>
            <h2 style={{ color: "#0B1F5E", marginTop: 0, marginBottom: "16px" }}>Learner Submissions & Grading</h2>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Learner</th>
                    <th style={styles.th}>Assessment</th>
                    <th style={styles.th}>Course</th>
                    <th style={styles.th}>Submission Response</th>
                    <th style={styles.th}>Score (0-100)</th>
                    <th style={styles.th}>Feedback</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub, i) => (
                    <tr key={sub.id} style={i % 2 === 0 ? { backgroundColor: "#F8FAFC" } : {}}>
                      <td style={styles.td}>{sub.user?.name}</td>
                      <td style={styles.td}>{sub.assignment?.title}</td>
                      <td style={styles.td}>{sub.assignment?.course?.title}</td>
                      <td style={styles.td}>{sub.content || "Uploaded attachment / response"}</td>
                      <td style={styles.td}>
                        <input
                          style={styles.scoreInput}
                          type="number"
                          min="0"
                          max="100"
                          defaultValue={sub.result || ""}
                          onChange={(e) =>
                            setGradeForms((prev) => ({
                              ...prev,
                              [sub.id]: { ...(prev[sub.id] || {}), result: e.target.value },
                            }))
                          }
                        />
                      </td>
                      <td style={styles.td}>
                        <input
                          style={styles.feedbackInput}
                          placeholder={sub.feedback || "Enter feedback..."}
                          onChange={(e) =>
                            setGradeForms((prev) => ({
                              ...prev,
                              [sub.id]: { ...(prev[sub.id] || {}), feedback: e.target.value },
                            }))
                          }
                        />
                      </td>
                      <td style={styles.td}>
                        <button style={styles.gradeBtn} onClick={() => handleGrade(sub.id)}>
                          {sub.status === "graded" ? "Update Grade" : "Grade"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {submissions.length === 0 && (
              <p style={{ color: "#64748B", textAlign: "center", padding: "30px" }}>No submissions yet.</p>
            )}
          </section>
        )}

        {/* Modal: Edit Course */}
        {editingCourse && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h2 style={styles.modalTitle}>Edit Course: {editingCourse.title}</h2>
              <form onSubmit={handleSaveEditCourse} style={styles.form}>
                <label style={styles.label}>Course Title</label>
                <input
                  style={styles.input}
                  value={editCourseForm.title}
                  onChange={(e) => setEditCourseForm({ ...editCourseForm, title: e.target.value })}
                  required
                />

                <label style={styles.label}>Domain / Specialization</label>
                <input
                  style={styles.input}
                  value={editCourseForm.domain}
                  onChange={(e) => setEditCourseForm({ ...editCourseForm, domain: e.target.value })}
                />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={styles.label}>Duration</label>
                    <input
                      style={styles.input}
                      value={editCourseForm.duration}
                      onChange={(e) => setEditCourseForm({ ...editCourseForm, duration: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Level</label>
                    <select
                      style={styles.input}
                      value={editCourseForm.level}
                      onChange={(e) => setEditCourseForm({ ...editCourseForm, level: e.target.value })}
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                </div>

                <label style={styles.label}>Banner Image URL</label>
                <input
                  style={styles.input}
                  value={editCourseForm.image}
                  onChange={(e) => setEditCourseForm({ ...editCourseForm, image: e.target.value })}
                />

                <label style={styles.label}>Description</label>
                <textarea
                  style={styles.textarea}
                  value={editCourseForm.description}
                  onChange={(e) => setEditCourseForm({ ...editCourseForm, description: e.target.value })}
                  required
                />

                <div style={styles.modalButtons}>
                  <button type="button" style={styles.cancelBtn} onClick={() => setEditingCourse(null)}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.primaryBtn}>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
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
  navLinks: { display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" },
  navButton: { backgroundColor: "#EEF2FF", color: "#0B1F5E", border: "none", padding: "8px 14px", borderRadius: "16px", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
  activeButton: { backgroundColor: "#2563EB", color: "#ffffff", border: "none", padding: "8px 14px", borderRadius: "16px", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
  profileWrapper: { position: "relative" },
  profileButton: { backgroundColor: "#0B1F5E", color: "#ffffff", border: "none", padding: "8px 14px", borderRadius: "16px", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
  dropdown: { position: "absolute", right: 0, top: "42px", width: "170px", backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 8px 25px rgba(0,0,0,0.15)", padding: "8px", zIndex: 999 },
  dropdownItem: { margin: 0, padding: "8px 12px", cursor: "pointer", color: "#0B1F5E", borderRadius: "6px", fontSize: "13px" },
  logoutItem: { margin: 0, padding: "8px 12px", cursor: "pointer", color: "#DC2626", fontWeight: "700", borderRadius: "6px", fontSize: "13px" },
  main: { padding: "30px", maxWidth: "1200px", margin: "0 auto" },
  branchBanner: { backgroundColor: "#ffffff", borderRadius: "18px", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", border: "1px solid #E2E8F0", marginBottom: "24px", flexWrap: "wrap" },
  branchTag: { fontSize: "11px", fontWeight: "700", color: "#2563EB", letterSpacing: "0.5px" },
  branchTitle: { color: "#0B1F5E", fontSize: "24px", margin: "6px 0 4px" },
  branchDesc: { color: "#64748B", margin: 0, fontSize: "14px", maxWidth: "700px" },
  mentorBadge: { backgroundColor: "#F8FAFC", padding: "14px 18px", borderRadius: "12px", border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", gap: "4px", minWidth: "190px" },
  rolePill: { backgroundColor: "#DCFCE7", color: "#166534", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", width: "fit-content", marginTop: "4px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" },
  statCard: { backgroundColor: "#ffffff", padding: "18px", borderRadius: "14px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", border: "1px solid #E2E8F0" },
  statCardAlert: { backgroundColor: "#FFFBEB", padding: "18px", borderRadius: "14px", border: "1px solid #FCD34D", cursor: "pointer" },
  statValue: { fontSize: "28px", fontWeight: "700", color: "#2563EB", margin: "6px 0 0" },
  pulsingBadge: { backgroundColor: "#EF4444", color: "#fff", padding: "2px 6px", borderRadius: "6px", fontSize: "10px", fontWeight: "800" },
  tabBar: { display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" },
  tabBtn: { padding: "10px 18px", borderRadius: "10px", border: "1px solid #CBD5E1", backgroundColor: "#ffffff", color: "#475569", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
  tabBtnActive: { padding: "10px 18px", borderRadius: "10px", border: "none", backgroundColor: "#2563EB", color: "#ffffff", cursor: "pointer", fontWeight: "700", fontSize: "13px" },
  tabBtnActiveAlert: { padding: "10px 18px", borderRadius: "10px", border: "none", backgroundColor: "#D97706", color: "#ffffff", cursor: "pointer", fontWeight: "700", fontSize: "13px" },
  // Wizard Styles
  wizardContainer: { backgroundColor: "#ffffff", borderRadius: "18px", padding: "28px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #E2E8F0", marginBottom: "24px" },
  wizardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", borderBottom: "1px solid #F1F5F9", paddingBottom: "18px", flexWrap: "wrap", gap: "15px" },
  wizardKicker: { fontSize: "11px", fontWeight: "700", color: "#2563EB", letterSpacing: "0.5px" },
  wizardTitle: { color: "#0B1F5E", fontSize: "22px", margin: "4px 0" },
  wizardSubtitle: { color: "#64748B", margin: 0, fontSize: "13px", maxWidth: "600px" },
  stepIndicator: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" },
  stepActive: { backgroundColor: "#2563EB", color: "#ffffff", padding: "6px 12px", borderRadius: "8px", fontWeight: "700", fontSize: "12px" },
  stepInactive: { backgroundColor: "#F1F5F9", color: "#64748B", padding: "6px 12px", borderRadius: "8px", fontWeight: "600", fontSize: "12px" },
  stepArrow: { color: "#CBD5E1", fontSize: "12px" },
  wizardCard: { display: "flex", flexDirection: "column", gap: "14px" },
  stepTitle: { color: "#0B1F5E", fontSize: "18px", margin: "0 0 10px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#334155" },
  input: { padding: "10px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", boxSizing: "border-box" },
  textarea: { padding: "10px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", minHeight: "80px", boxSizing: "border-box", resize: "vertical" },
  bannerPreview: { width: "100%", maxHeight: "160px", objectFit: "cover", borderRadius: "10px", border: "1px solid #E2E8F0" },
  wizardActions: { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px", paddingTop: "14px", borderTop: "1px solid #F1F5F9" },
  primaryBtn: { backgroundColor: "#2563EB", color: "#ffffff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "13px" },
  secondaryBtn: { backgroundColor: "#F1F5F9", color: "#475569", border: "none", padding: "10px 18px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
  publishBtn: { backgroundColor: "#15803D", color: "#ffffff", border: "none", padding: "12px 24px", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "14px" },
  // Lesson Builder Blocks (Google Form style)
  lessonBlock: { backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px", marginBottom: "14px", display: "flex", flexDirection: "column", gap: "10px" },
  lessonBlockHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  blockNumber: { backgroundColor: "#EEF2FF", color: "#2563EB", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" },
  removeBtn: { backgroundColor: "transparent", color: "#DC2626", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  addSectionBtn: { backgroundColor: "#EEF2FF", color: "#2563EB", border: "1px dashed #93C5FD", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "12px" },
  addSectionBtnWide: { width: "100%", backgroundColor: "#F8FAFC", color: "#2563EB", border: "2px dashed #CBD5E1", padding: "12px", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "13px", marginTop: "10px" },
  // Summary
  summaryCard: { backgroundColor: "#F8FAFC", borderRadius: "14px", padding: "18px", border: "1px solid #E2E8F0" },
  summaryBanner: { width: "100%", maxHeight: "180px", objectFit: "cover", borderRadius: "10px" },
  summarySection: { backgroundColor: "#F8FAFC", padding: "16px", borderRadius: "12px", border: "1px solid #E2E8F0" },
  summaryItem: { backgroundColor: "#ffffff", padding: "10px 12px", borderRadius: "8px", marginBottom: "8px", border: "1px solid #F1F5F9" },
  // Courses Grid
  coursesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "18px" },
  courseCard: { backgroundColor: "#ffffff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", border: "1px solid #E2E8F0", display: "flex", flexDirection: "column" },
  courseThumb: { width: "100%", height: "150px", objectFit: "cover" },
  placeholderThumb: { width: "100%", height: "150px", backgroundColor: "#EEF2FF", display: "flex", justifyContent: "center", alignItems: "center", color: "#2563EB", fontWeight: "700", fontSize: "18px" },
  badge: { backgroundColor: "#EEF2FF", color: "#2563EB", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" },
  courseTitle: { color: "#0B1F5E", margin: "4px 0 6px", fontSize: "17px" },
  courseDesc: { color: "#64748B", fontSize: "13px", lineHeight: "1.4", margin: "0 0 12px" },
  courseStatsRow: { display: "flex", justifyContent: "space-between", color: "#475569", fontSize: "12px", borderTop: "1px solid #F1F5F9", paddingTop: "10px", marginBottom: "12px" },
  courseCardBtns: { display: "flex", gap: "6px" },
  cardViewBtn: { flex: 1, backgroundColor: "#EEF2FF", color: "#2563EB", border: "none", padding: "8px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px" },
  cardEditBtn: { backgroundColor: "#F1F5F9", color: "#334155", border: "1px solid #CBD5E1", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px" },
  cardDelBtn: { backgroundColor: "#FEF2F2", color: "#DC2626", border: "none", padding: "8px 10px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px" },
  // Table
  panel: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", border: "1px solid #E2E8F0" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "850px" },
  th: { backgroundColor: "#0B1F5E", color: "#ffffff", padding: "12px 16px", textAlign: "left", fontWeight: "600", fontSize: "13px" },
  td: { padding: "12px 16px", borderBottom: "1px solid #F1F5F9", color: "#334155", fontSize: "13px" },
  approveBtn: { backgroundColor: "#DCFCE7", color: "#15803D", border: "1px solid #86EFAC", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "700", fontSize: "12px" },
  rejectBtn: { backgroundColor: "#FEE2E2", color: "#B91C1C", border: "1px solid #FCA5A5", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "700", fontSize: "12px" },
  gradeBtn: { backgroundColor: "#DCFCE7", color: "#166534", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "700", fontSize: "12px" },
  scoreInput: { width: "65px", padding: "6px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px" },
  feedbackInput: { width: "180px", padding: "6px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px" },
  emptyCard: { backgroundColor: "#ffffff", borderRadius: "18px", padding: "40px", textAlign: "center", border: "2px dashed #CBD5E1", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" },
  empty: { padding: "40px", textAlign: "center", color: "#64748B" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal: { backgroundColor: "#ffffff", width: "100%", maxWidth: "520px", borderRadius: "18px", padding: "26px", maxHeight: "90vh", overflowY: "auto" },
  modalTitle: { margin: "0 0 16px", color: "#0B1F5E", fontSize: "20px" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  modalButtons: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" },
  cancelBtn: { padding: "9px 16px", backgroundColor: "#F1F5F9", color: "#475569", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
};

export default MentorDashboardPage;
