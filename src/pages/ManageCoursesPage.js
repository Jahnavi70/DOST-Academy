import React, { useState, useEffect, useMemo, useCallback } from "react";
import AdminHeader from "../components/layout/AdminHeader";
import { courseAPI, curriculumAPI, adminAPI, courseContentAPI } from "../services/api";

/**
 * ManageCoursesPage - Full Admin Course & Lesson CRUD Management.
 * Provides complete in-browser administrative control over courses, branches, mentors, and syllabus modules.
 */
function ManageCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurriculum, setSelectedCurriculum] = useState("");
  const [search, setSearch] = useState("");

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // Lessons Manager Modal
  const [showLessonsModal, setShowLessonsModal] = useState(false);
  const [selectedCourseForLessons, setSelectedCourseForLessons] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [showAddLessonForm, setShowAddLessonForm] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    title: "",
    content_type: "lesson",
    content_url: "",
    duration_minutes: 30,
    description: "",
  });

  // Course Form State (for both Create & Edit)
  const [courseForm, setCourseForm] = useState({
    title: "",
    curriculum_id: "",
    mentor_id: "",
    domain: "",
    duration: "4 weeks",
    level: "Beginner",
    image: "",
    description: "",
    status: "published",
  });

  const loadData = useCallback(async () => {
    try {
      const [cRes, curRes, uRes] = await Promise.all([
        courseAPI.getAll(),
        curriculumAPI.getAll(),
        adminAPI.users().catch(() => ({ data: [] })),
      ]);
      setCourses(Array.isArray(cRes.data) ? cRes.data : []);
      setCurriculums(Array.isArray(curRes.data) ? curRes.data : []);

      const allUsers = Array.isArray(uRes.data) ? uRes.data : [];
      setMentors(allUsers.filter((u) => u.role === "mentor" || u.role === "admin" || u.role === "admin_functional"));
    } catch (err) {
      console.error("Failed to load course management data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Create Modal
  const handleOpenCreate = () => {
    const defaultCurr = curriculums.length > 0 ? curriculums[0].id : "";
    setCourseForm({
      title: "",
      curriculum_id: defaultCurr,
      mentor_id: "",
      domain: curriculums[0]?.category || "AI & Emerging Technologies",
      duration: "4 weeks",
      level: "Beginner",
      image: "",
      description: "",
      status: "published",
    });
    setShowCreateModal(true);
  };

  // Submit Create Course
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!courseForm.title || !courseForm.curriculum_id) {
      alert("Please provide a course title and select an agency branch.");
      return;
    }
    try {
      await courseAPI.create(courseForm);
      setShowCreateModal(false);
      loadData();
      alert("Course created successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create course.");
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (c) => {
    setEditingCourse(c);
    setCourseForm({
      title: c.title,
      curriculum_id: c.curriculum_id || "",
      mentor_id: c.mentor_id || "",
      domain: c.domain || "",
      duration: c.duration || "4 weeks",
      level: c.level || "Beginner",
      image: c.image || "",
      description: c.description || "",
      status: c.status || "published",
    });
    setShowEditModal(true);
  };

  // Submit Edit Course
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await courseAPI.update(editingCourse.id, courseForm);
      setShowEditModal(false);
      loadData();
      alert("Course updated successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update course.");
    }
  };

  // Toggle Status (Publish / Draft)
  const handleToggleStatus = async (id) => {
    try {
      await courseAPI.toggleStatus(id);
      loadData();
    } catch (err) {
      alert("Failed to toggle status.");
    }
  };

  // Delete Course
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete course "${title}"? All associated lessons, quizzes, and enrollments will be removed.`)) return;
    try {
      await courseAPI.delete(id);
      loadData();
    } catch (err) {
      alert("Failed to delete course.");
    }
  };

  // Manage Lessons
  const handleOpenLessons = async (c) => {
    setSelectedCourseForLessons(c);
    setShowLessonsModal(true);
    setLessonsLoading(true);
    setShowAddLessonForm(false);
    try {
      const res = await courseContentAPI.getByCourse(c.id);
      setLessons(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setLessons([]);
    } finally {
      setLessonsLoading(false);
    }
  };

  const handleAddLessonSubmit = async (e) => {
    e.preventDefault();
    if (!lessonForm.title) {
      alert("Please enter a lesson title.");
      return;
    }
    try {
      await courseContentAPI.create(selectedCourseForLessons.id, lessonForm);
      setLessonForm({
        title: "",
        content_type: "lesson",
        content_url: "",
        duration_minutes: 30,
        description: "",
      });
      setShowAddLessonForm(false);
      // Reload lessons
      const res = await courseContentAPI.getByCourse(selectedCourseForLessons.id);
      setLessons(res.data);
    } catch (err) {
      alert("Failed to add lesson.");
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm("Remove this lesson module?")) return;
    try {
      await courseContentAPI.delete(lessonId);
      const res = await courseContentAPI.getByCourse(selectedCourseForLessons.id);
      setLessons(res.data);
    } catch (err) {
      alert("Failed to delete lesson.");
    }
  };

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (selectedCurriculum && String(c.curriculum_id) !== String(selectedCurriculum)) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const matchTitle = c.title && c.title.toLowerCase().includes(q);
        const matchMentor = c.mentor && c.mentor.name && c.mentor.name.toLowerCase().includes(q);
        const matchDomain = c.domain && c.domain.toLowerCase().includes(q);
        return matchTitle || matchMentor || matchDomain;
      }
      return true;
    });
  }, [courses, selectedCurriculum, search]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC" }}>
      <AdminHeader activePortal="functional" />

      <main className="lms-page-container">
        {/* Page Header */}
        <div style={styles.headerRow}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "28px" }}>📚</span>
              <h1 style={styles.heading}>Course Management Studio</h1>
            </div>
            <p style={styles.subtext}>
              Full administrative authority to create, edit, structure modules, and publish courses across all DOST agency branches.
            </p>
          </div>
          <button style={styles.createBtn} onClick={handleOpenCreate}>
            ＋ Create New Course
          </button>
        </div>

        {/* Filter & Search Toolbar */}
        <div style={styles.filterToolbar}>
          <div style={{ display: "flex", gap: "12px", flex: 1, flexWrap: "wrap" }}>
            <select
              style={styles.select}
              value={selectedCurriculum}
              onChange={(e) => setSelectedCurriculum(e.target.value)}
            >
              <option value="">🏛️ All DOST Agency Branches</option>
              {curriculums.map((cur) => (
                <option key={cur.id} value={cur.id}>{cur.title}</option>
              ))}
            </select>
            <input
              style={styles.search}
              placeholder="🔍 Search course title, mentor, or domain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#64748B" }}>
            Showing {filteredCourses.length} of {courses.length} courses
          </div>
        </div>

        {/* Courses Cards / Table */}
        {loading ? (
          <p style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>Loading course directory...</p>
        ) : filteredCourses.length === 0 ? (
          <div style={styles.emptyCard}>
            <span style={{ fontSize: "42px" }}>📖</span>
            <h3 style={{ margin: "12px 0 6px", color: "#0B1F5E" }}>No Courses Found</h3>
            <p style={{ color: "#64748B", maxWidth: "480px", margin: "0 auto 16px" }}>
              {search || selectedCurriculum ? "No courses match the specified filters." : "No courses have been created yet. Click '+ Create New Course' to establish your first syllabus."}
            </p>
            <button style={styles.createBtn} onClick={handleOpenCreate}>＋ Create New Course</button>
          </div>
        ) : (
          <div className="lms-auto-grid">
            {filteredCourses.map((course) => {
              const isPublished = course.status === "published";
              const curriculumName = course.curriculum ? course.curriculum.title : (course.department || "General Branch");
              const mentorName = course.mentor ? course.mentor.name : "Unassigned / Admin";

              return (
                <div key={course.id} style={styles.courseCard} className="lms-card-interactive">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <span style={styles.branchTag}>{curriculumName}</span>
                    <span style={isPublished ? styles.badgePublished : styles.badgeDraft}>
                      {isPublished ? "● Published" : "○ Draft"}
                    </span>
                  </div>

                  <h3 style={styles.courseTitle}>{course.title}</h3>
                  <p style={styles.courseDesc}>{course.description}</p>

                  <div style={styles.metaRow}>
                    <span>⏱️ {course.duration || "4 weeks"}</span>
                    <span>📈 {course.level || "Beginner"}</span>
                    <span>👨‍🏫 {mentorName}</span>
                  </div>

                  <hr style={{ border: "none", borderTop: "1px solid #F1F5F9", margin: "14px 0" }} />

                  {/* Actions */}
                  <div style={styles.actionsRow}>
                    <button
                      style={styles.actionBtnOutline}
                      onClick={() => handleOpenLessons(course)}
                      title="Manage syllabus lessons, modules, and video links"
                    >
                      📑 Lessons ({course.contents ? course.contents.length : 0})
                    </button>
                    <button
                      style={styles.actionBtnOutline}
                      onClick={() => handleOpenEdit(course)}
                      title="Edit course metadata"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      style={isPublished ? styles.actionBtnDraft : styles.actionBtnPublish}
                      onClick={() => handleToggleStatus(course.id)}
                      title={isPublished ? "Unpublish course" : "Publish course"}
                    >
                      {isPublished ? "Draft" : "Publish"}
                    </button>
                    <button
                      style={styles.actionBtnDelete}
                      onClick={() => handleDelete(course.id, course.title)}
                      title="Delete course"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* CREATE COURSE MODAL */}
      {showCreateModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, color: "#0B1F5E" }}>＋ Create New Course</h2>
              <button style={styles.modalClose} onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={styles.label}>Course Title *</label>
                <input
                  style={styles.input}
                  placeholder="e.g. Applied Machine Learning & AI in Public Services"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={styles.label}>Agency Branch / Curriculum *</label>
                  <select
                    style={styles.input}
                    value={courseForm.curriculum_id}
                    onChange={(e) => {
                      const curr = curriculums.find((c) => String(c.id) === String(e.target.value));
                      setCourseForm({
                        ...courseForm,
                        curriculum_id: e.target.value,
                        domain: curr ? curr.category : courseForm.domain,
                      });
                    }}
                    required
                  >
                    {curriculums.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Assigned Faculty Mentor</label>
                  <select
                    style={styles.input}
                    value={courseForm.mentor_id}
                    onChange={(e) => setCourseForm({ ...courseForm, mentor_id: e.target.value })}
                  >
                    <option value="">Admin / Open Oversight</option>
                    {mentors.map((m) => (
                      <option key={m.id} value={m.id}>{m.name} ({m.department || m.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={styles.label}>Domain / Category</label>
                  <input
                    style={styles.input}
                    placeholder="e.g. AI & Emerging Technologies"
                    value={courseForm.domain}
                    onChange={(e) => setCourseForm({ ...courseForm, domain: e.target.value })}
                  />
                </div>
                <div>
                  <label style={styles.label}>Estimated Duration</label>
                  <input
                    style={styles.input}
                    placeholder="e.g. 4 weeks or 20 hours"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                  />
                </div>
                <div>
                  <label style={styles.label}>Difficulty Level</label>
                  <select
                    style={styles.input}
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={styles.label}>Course Description *</label>
                <textarea
                  style={{ ...styles.input, height: "90px" }}
                  placeholder="Comprehensive description of the course syllabus, target competencies, and deliverables."
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  required
                />
              </div>

              <div style={styles.modalFooter}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" style={styles.submitBtn}>Create Course</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COURSE MODAL */}
      {showEditModal && editingCourse && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, color: "#0B1F5E" }}>✏️ Edit Course: {editingCourse.title}</h2>
              <button style={styles.modalClose} onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={styles.label}>Course Title</label>
                <input
                  style={styles.input}
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={styles.label}>Agency Branch / Curriculum</label>
                  <select
                    style={styles.input}
                    value={courseForm.curriculum_id}
                    onChange={(e) => setCourseForm({ ...courseForm, curriculum_id: e.target.value })}
                  >
                    {curriculums.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Assigned Mentor</label>
                  <select
                    style={styles.input}
                    value={courseForm.mentor_id}
                    onChange={(e) => setCourseForm({ ...courseForm, mentor_id: e.target.value })}
                  >
                    <option value="">Admin / Open Oversight</option>
                    {mentors.map((m) => (
                      <option key={m.id} value={m.id}>{m.name} ({m.department || m.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={styles.label}>Domain / Category</label>
                  <input
                    style={styles.input}
                    value={courseForm.domain}
                    onChange={(e) => setCourseForm({ ...courseForm, domain: e.target.value })}
                  />
                </div>
                <div>
                  <label style={styles.label}>Duration</label>
                  <input
                    style={styles.input}
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                  />
                </div>
                <div>
                  <label style={styles.label}>Level</label>
                  <select
                    style={styles.input}
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={styles.label}>Course Description</label>
                <textarea
                  style={{ ...styles.input, height: "90px" }}
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  required
                />
              </div>

              <div style={styles.modalFooter}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" style={styles.submitBtn}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE LESSONS MODAL */}
      {showLessonsModal && selectedCourseForLessons && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: "750px" }}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={{ margin: 0, color: "#0B1F5E" }}>📑 Syllabus Modules: {selectedCourseForLessons.title}</h2>
                <span style={{ fontSize: "12px", color: "#64748B" }}>Add, inspect, and remove lessons, lecture videos, and reading materials</span>
              </div>
              <button style={styles.modalClose} onClick={() => setShowLessonsModal(false)}>✕</button>
            </div>

            <div style={{ margin: "16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600, color: "#334155" }}>
                {lessons.length} {lessons.length === 1 ? "Lesson" : "Lessons"} Configured
              </span>
              <button
                style={styles.createBtnSmall}
                onClick={() => setShowAddLessonForm(!showAddLessonForm)}
              >
                {showAddLessonForm ? "Cancel Add" : "＋ Add Lesson Module"}
              </button>
            </div>

            {/* Add Lesson Form */}
            {showAddLessonForm && (
              <form onSubmit={handleAddLessonSubmit} style={styles.subFormCard}>
                <h4 style={{ margin: "0 0 10px", color: "#0B1F5E" }}>New Lesson Module</h4>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px", marginBottom: "10px" }}>
                  <input
                    style={styles.input}
                    placeholder="Lesson Title (e.g. Module 1: Core Frameworks)"
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    required
                  />
                  <select
                    style={styles.input}
                    value={lessonForm.content_type}
                    onChange={(e) => setLessonForm({ ...lessonForm, content_type: e.target.value })}
                  >
                    <option value="lesson">Lecture / Text</option>
                    <option value="video">Video Lecture</option>
                    <option value="document">Documentation</option>
                    <option value="practical">Hands-on Lab</option>
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "10px", marginBottom: "10px" }}>
                  <input
                    style={styles.input}
                    placeholder="Content URL (YouTube stream, mp4, or slide deck link)"
                    value={lessonForm.content_url}
                    onChange={(e) => setLessonForm({ ...lessonForm, content_url: e.target.value })}
                  />
                  <input
                    style={styles.input}
                    type="number"
                    placeholder="Duration (mins)"
                    value={lessonForm.duration_minutes}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: Number(e.target.value) })}
                  />
                </div>
                <textarea
                  style={{ ...styles.input, height: "60px", marginBottom: "10px" }}
                  placeholder="Summary of module objectives and learning outcomes..."
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                />
                <button type="submit" style={styles.submitBtn}>Save Lesson Module</button>
              </form>
            )}

            {/* Lessons List */}
            {lessonsLoading ? (
              <p style={{ textAlign: "center", padding: "20px", color: "#64748B" }}>Loading syllabus modules...</p>
            ) : lessons.length === 0 ? (
              <p style={{ textAlign: "center", padding: "24px", color: "#64748B", background: "#F8FAFC", borderRadius: "12px" }}>
                No lessons added yet. Click &quot;＋ Add Lesson Module&quot; to configure your course syllabus.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "350px", overflowY: "auto" }}>
                {lessons.map((l, i) => (
                  <div key={l.id} style={styles.lessonItem}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={styles.orderBadge}>#{i + 1}</span>
                      <div>
                        <strong style={{ color: "#0F172A", fontSize: "14px" }}>{l.title}</strong>
                        <div style={{ color: "#64748B", fontSize: "12px" }}>
                          ⏱️ {l.duration_minutes || 30} mins • Type: {l.content_type} {l.content_url ? "• 🔗 Linked" : ""}
                        </div>
                      </div>
                    </div>
                    <button
                      style={styles.deleteMiniBtn}
                      onClick={() => handleDeleteLesson(l.id)}
                      title="Remove lesson"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  heading: {
    margin: 0,
    fontSize: "26px",
    fontWeight: "700",
    color: "#0B1F5E",
    letterSpacing: "-0.02em",
  },
  subtext: {
    margin: "6px 0 0",
    fontSize: "14px",
    color: "#64748B",
    maxWidth: "800px",
  },
  createBtn: {
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    border: "none",
    padding: "10px 20px",
    borderRadius: "12px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
    transition: "transform 0.15s, background 0.15s",
  },
  createBtnSmall: {
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    border: "none",
    padding: "6px 14px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "12px",
    cursor: "pointer",
  },
  filterToolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: "14px 18px",
    borderRadius: "16px",
    border: "1px solid #E2E8F0",
    marginBottom: "24px",
    gap: "16px",
    flexWrap: "wrap",
    boxShadow: "0 2px 6px rgba(15, 23, 42, 0.03)",
  },
  select: {
    padding: "8px 12px",
    borderRadius: "10px",
    border: "1px solid #CBD5E1",
    fontSize: "13px",
    fontWeight: "500",
    color: "#334155",
    backgroundColor: "#F8FAFC",
  },
  search: {
    padding: "8px 14px",
    borderRadius: "10px",
    border: "1px solid #CBD5E1",
    fontSize: "13px",
    width: "280px",
    backgroundColor: "#F8FAFC",
  },
  courseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    border: "1px solid #E2E8F0",
    padding: "20px",
    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  branchTag: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#0B1F5E",
    backgroundColor: "#EFF6FF",
    padding: "4px 10px",
    borderRadius: "12px",
  },
  badgePublished: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#059669",
    backgroundColor: "#ECFDF5",
    padding: "3px 8px",
    borderRadius: "10px",
  },
  badgeDraft: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#D97706",
    backgroundColor: "#FFFBEB",
    padding: "3px 8px",
    borderRadius: "10px",
  },
  courseTitle: {
    margin: "10px 0 6px",
    fontSize: "17px",
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: "1.3",
  },
  courseDesc: {
    margin: "0 0 14px",
    fontSize: "13px",
    color: "#64748B",
    lineHeight: "1.5",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  metaRow: {
    display: "flex",
    gap: "12px",
    fontSize: "12px",
    color: "#475569",
    fontWeight: "500",
    flexWrap: "wrap",
  },
  actionsRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  actionBtnOutline: {
    border: "1px solid #CBD5E1",
    background: "#FFFFFF",
    color: "#334155",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  actionBtnPublish: {
    border: "none",
    background: "#10B981",
    color: "#FFFFFF",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  actionBtnDraft: {
    border: "none",
    background: "#F59E0B",
    color: "#FFFFFF",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  actionBtnDelete: {
    border: "1px solid #FECACA",
    background: "#FEF2F2",
    color: "#DC2626",
    padding: "6px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    cursor: "pointer",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    border: "1px solid #E2E8F0",
    padding: "48px 24px",
    textAlign: "center",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "16px",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "600px",
    padding: "26px",
    boxShadow: "0 20px 45px rgba(0, 0, 0, 0.2)",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },
  modalClose: {
    border: "none",
    background: "transparent",
    fontSize: "20px",
    cursor: "pointer",
    color: "#64748B",
  },
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    color: "#334155",
    marginBottom: "4px",
  },
  input: {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "10px",
    border: "1px solid #CBD5E1",
    fontSize: "13px",
    boxSizing: "border-box",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "12px",
  },
  cancelBtn: {
    padding: "9px 16px",
    border: "1px solid #CBD5E1",
    background: "#FFFFFF",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "13px",
    color: "#475569",
    cursor: "pointer",
  },
  submitBtn: {
    padding: "9px 18px",
    border: "none",
    background: "#2563EB",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "13px",
    color: "#FFFFFF",
    cursor: "pointer",
  },
  subFormCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: "12px",
    border: "1px solid #E2E8F0",
    padding: "16px",
    marginBottom: "14px",
  },
  lessonItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
    backgroundColor: "#FFFFFF",
    borderRadius: "10px",
    border: "1px solid #E2E8F0",
  },
  orderBadge: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#2563EB",
    backgroundColor: "#EFF6FF",
    padding: "4px 8px",
    borderRadius: "8px",
  },
  deleteMiniBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default ManageCoursesPage;
