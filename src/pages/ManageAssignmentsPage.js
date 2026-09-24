import React, { useState, useEffect, useCallback, useMemo } from "react";
import AdminHeader from "../components/layout/AdminHeader";
import { assignmentAPI, courseAPI } from "../services/api";

/**
 * ManageAssignmentsPage - Full Admin Assessment & Quiz CRUD Management.
 * Grants administrative control over quizzes, milestone assessments, due dates, and grading criteria.
 */
function ManageAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [search, setSearch] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  const [form, setForm] = useState({
    course_id: "",
    title: "",
    assessment_type: "quiz",
    max_score: 100,
    due_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    description: "",
  });

  const loadData = useCallback(async () => {
    try {
      const [aRes, cRes] = await Promise.all([
        assignmentAPI.getAll(),
        courseAPI.getAll(),
      ]);
      setAssignments(Array.isArray(aRes.data) ? aRes.data : []);
      setCourses(Array.isArray(cRes.data) ? cRes.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setForm({
      course_id: courses.length > 0 ? courses[0].id : "",
      title: "",
      assessment_type: "quiz",
      max_score: 100,
      due_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      description: "",
    });
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!form.course_id || !form.title) {
      alert("Please provide both a course selection and an assessment title.");
      return;
    }
    try {
      await assignmentAPI.create(form);
      setShowCreateModal(false);
      loadData();
      alert("Assessment created successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create assessment.");
    }
  };

  const handleOpenEdit = (a) => {
    setEditingAssignment(a);
    setForm({
      course_id: a.course_id,
      title: a.title,
      assessment_type: a.assessment_type || "quiz",
      max_score: a.max_score || 100,
      due_date: a.due_date,
      description: a.description || "",
      status: a.status || "pending",
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await assignmentAPI.update(editingAssignment.id, form);
      setShowEditModal(false);
      loadData();
      alert("Assessment updated successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update assessment.");
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete assessment "${title}"?`)) return;
    try {
      await assignmentAPI.delete(id);
      loadData();
      alert("Assessment deleted successfully.");
    } catch (err) {
      alert("Failed to delete assessment.");
    }
  };

  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      if (selectedCourse && String(a.course_id) !== String(selectedCourse)) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchTitle = a.title && a.title.toLowerCase().includes(q);
        const matchCourse = a.course && a.course.title && a.course.title.toLowerCase().includes(q);
        return matchTitle || matchCourse;
      }
      return true;
    });
  }, [assignments, selectedCourse, search]);

  const typeColor = (type) => {
    switch (type) {
      case "quiz": return { bg: "#EFF6FF", color: "#1D4ED8" };
      case "practical": return { bg: "#ECFDF5", color: "#065F46" };
      case "project": return { bg: "#FDF4FF", color: "#86198F" };
      default: return { bg: "#FFFBEB", color: "#B45309" };
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC" }}>
      <AdminHeader activePortal="functional" />

      <main className="lms-page-container">
        {/* Page Header */}
        <div style={styles.headerRow}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "28px" }}>📝</span>
              <h1 style={styles.heading}>Assessments & Quizzes Governance</h1>
            </div>
            <p style={styles.subtext}>
              Structure milestone quizzes, practical examinations, passing thresholds, and submission deadlines.
            </p>
          </div>
          <button style={styles.createBtn} onClick={handleOpenCreate}>
            ＋ Create New Assessment
          </button>
        </div>

        {/* Toolbar */}
        <div style={styles.filterToolbar}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", flex: 1 }}>
            <select
              style={styles.select}
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">📚 All Certified Courses</option>
              {courses.map((crs) => (
                <option key={crs.id} value={crs.id}>{crs.title}</option>
              ))}
            </select>
            <input
              style={styles.search}
              placeholder="🔍 Search assessment title or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#64748B" }}>
            Showing {filteredAssignments.length} of {assignments.length} assessments
          </div>
        </div>

        {/* Assignments Table */}
        {loading ? (
          <p style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>Loading assessment directory...</p>
        ) : filteredAssignments.length === 0 ? (
          <div style={styles.emptyCard}>
            <span style={{ fontSize: "42px" }}>📋</span>
            <h3 style={{ margin: "12px 0 6px", color: "#0B1F5E" }}>No Assessments Configured</h3>
            <p style={{ color: "#64748B", maxWidth: "480px", margin: "0 auto 16px" }}>
              {selectedCourse || search ? "No assessments match the specified filters." : "No quizzes or assessments have been configured yet. Click '+ Create New Assessment' to add evaluations."}
            </p>
            <button style={styles.createBtn} onClick={handleOpenCreate}>＋ Create New Assessment</button>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Assessment Title</th>
                  <th style={styles.th}>Certified Course</th>
                  <th style={styles.th}>Evaluation Type</th>
                  <th style={styles.th}>Max Score</th>
                  <th style={styles.th}>Due Date</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((a, idx) => {
                  const badge = typeColor(a.assessment_type);
                  return (
                    <tr key={a.id} style={idx % 2 === 0 ? { backgroundColor: "#FFFFFF" } : { backgroundColor: "#F8FAFC" }}>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 600, color: "#0F172A" }}>{a.title}</div>
                        <div style={{ fontSize: "12px", color: "#64748B", maxWidth: "350px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {a.description || "Milestone comprehension check"}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 500, color: "#0B1F5E" }}>{a.course?.title || "-"}</div>
                        <div style={{ fontSize: "11px", color: "#64748B" }}>Faculty: {a.course?.mentor?.name || a.mentor?.name || "Faculty Lead"}</div>
                      </td>
                      <td style={styles.td}>
                        <span style={{ ...styles.typeBadge, backgroundColor: badge.bg, color: badge.text }}>
                          {a.assessment_type ? a.assessment_type.toUpperCase() : "QUIZ"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontWeight: 700, color: "#0F172A" }}>{a.max_score || 100} pts</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontSize: "12px", color: "#475569" }}>📅 {a.due_date}</span>
                      </td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          <button
                            style={styles.actionBtnEdit}
                            onClick={() => handleOpenEdit(a)}
                            title="Edit assessment"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            style={styles.actionBtnDelete}
                            onClick={() => handleDelete(a.id, a.title)}
                            title="Delete assessment"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, color: "#0B1F5E" }}>＋ Create New Assessment</h2>
              <button style={styles.modalClose} onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={styles.label}>Associated Course *</label>
                <select
                  style={styles.input}
                  value={form.course_id}
                  onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                  required
                >
                  {courses.map((crs) => (
                    <option key={crs.id} value={crs.id}>{crs.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label}>Assessment Title *</label>
                <input
                  style={styles.input}
                  placeholder="e.g. Knowledge Check Quiz 1: ML Foundations"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={styles.label}>Type</label>
                  <select
                    style={styles.input}
                    value={form.assessment_type}
                    onChange={(e) => setForm({ ...form, assessment_type: e.target.value })}
                  >
                    <option value="quiz">Quiz</option>
                    <option value="assignment">Assignment</option>
                    <option value="practical">Practical Lab</option>
                    <option value="project">Capstone Project</option>
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Max Score</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={form.max_score}
                    onChange={(e) => setForm({ ...form, max_score: Number(e.target.value) })}
                    min="1"
                    max="100"
                  />
                </div>
                <div>
                  <label style={styles.label}>Due Date *</label>
                  <input
                    type="date"
                    style={styles.input}
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={styles.label}>Instructions & Scoring Rubric</label>
                <textarea
                  style={{ ...styles.input, height: "80px" }}
                  placeholder="Provide guidance on required submissions, thresholds, and grading criteria."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div style={styles.modalFooter}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" style={styles.submitBtn}>Create Assessment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && editingAssignment && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, color: "#0B1F5E" }}>✏️ Edit Assessment: {editingAssignment.title}</h2>
              <button style={styles.modalClose} onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={styles.label}>Assessment Title</label>
                <input
                  style={styles.input}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={styles.label}>Type</label>
                  <select
                    style={styles.input}
                    value={form.assessment_type}
                    onChange={(e) => setForm({ ...form, assessment_type: e.target.value })}
                  >
                    <option value="quiz">Quiz</option>
                    <option value="assignment">Assignment</option>
                    <option value="practical">Practical Lab</option>
                    <option value="project">Capstone Project</option>
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Max Score</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={form.max_score}
                    onChange={(e) => setForm({ ...form, max_score: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label style={styles.label}>Due Date</label>
                  <input
                    type="date"
                    style={styles.input}
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={styles.label}>Instructions</label>
                <textarea
                  style={{ ...styles.input, height: "80px" }}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
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
    width: "300px",
    backgroundColor: "#F8FAFC",
  },
  tableContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    border: "1px solid #E2E8F0",
    overflow: "hidden",
    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
  },
  th: {
    backgroundColor: "#F8FAFC",
    color: "#475569",
    padding: "14px 18px",
    textAlign: "left",
    fontWeight: "600",
    borderBottom: "1px solid #E2E8F0",
  },
  td: {
    padding: "14px 18px",
    borderBottom: "1px solid #F1F5F9",
    color: "#334155",
  },
  typeBadge: {
    fontSize: "11px",
    fontWeight: "700",
    padding: "3px 8px",
    borderRadius: "8px",
    letterSpacing: "0.03em",
  },
  actionBtnEdit: {
    border: "1px solid #CBD5E1",
    background: "#FFFFFF",
    color: "#0B1F5E",
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
    maxWidth: "580px",
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
};

export default ManageAssignmentsPage;
