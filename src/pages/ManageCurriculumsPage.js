import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { curriculumAPI } from "../services/api";
import logo from "../assets/dost-logo.png";

function ManageCurriculumsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [curriculums, setCurriculums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    level: "Beginner",
    image: "",
    status: "published",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await curriculumAPI.getAll();
      setCurriculums(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      title: "",
      category: "",
      description: "",
      level: "Beginner",
      image: "",
      status: "published",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditingId(c.id);
    setForm({
      title: c.title,
      category: c.category,
      description: c.description,
      level: c.level || "Beginner",
      image: c.image || "",
      status: c.status || "published",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await curriculumAPI.update(editingId, form);
      } else {
        await curriculumAPI.create(form);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || "Failed to save curriculum/branch");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete branch/curriculum "${title}"? This will affect associated mentors and courses.`)) return;
    try {
      await curriculumAPI.delete(id);
      loadData();
    } catch (err) {
      alert("Failed to delete branch/curriculum");
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.navbar}>
        <div style={styles.logoSection}>
          <img src={logo} alt="DOST Logo" style={styles.logo} />
          <div>
            <h2 style={styles.title}>DOST Academy</h2>
            <p style={styles.subtitle}>Branch & Curriculum Management</p>
          </div>
        </div>
        <div style={styles.navSection}>
          <div style={styles.navLinks}>
            <button style={styles.navButton} onClick={() => navigate("/admin-dashboard")}>Dashboard</button>
            <button style={styles.navButton} onClick={() => navigate("/manage-users")}>Users & Mentors</button>
            <button style={styles.activeButton}>Curriculums / Branches</button>
            <button style={styles.navButton} onClick={() => navigate("/manage-courses")}>Courses (Monitor)</button>
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
            <h1 style={styles.heading}>Branches & Curriculums</h1>
            <p style={styles.subtext}>
              Create departments or branches (e.g. IT Department, Mechanical Engineering). Mentors are assigned to these curriculums and can create courses exclusively within their assigned branch.
            </p>
          </div>
          <button style={styles.addBtn} onClick={handleOpenCreate}>+ Add Branch / Curriculum</button>
        </div>

        {loading ? (
          <p>Loading curriculums...</p>
        ) : curriculums.length === 0 ? (
          <div style={styles.emptyCard}>
            <span style={{ fontSize: "40px" }}>🏛️</span>
            <h3>No Branches or Curriculums Created Yet</h3>
            <p style={{ color: "#64748B", maxWidth: "500px" }}>
              Start by adding your first department or branch curriculum. Once created, you can assign mentors to it from the Users & Mentors section.
            </p>
            <button style={styles.addBtn} onClick={handleOpenCreate}>+ Create First Branch</button>
          </div>
        ) : (
          <div style={styles.grid}>
            {curriculums.map((c) => (
              <div key={c.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.catBadge}>{c.category}</span>
                  <span style={c.status === "published" ? styles.statusPub : styles.statusDraft}>
                    {c.status || "published"}
                  </span>
                </div>
                <h3 style={styles.cardTitle}>{c.title}</h3>
                <p style={styles.cardDesc}>{c.description}</p>
                <div style={styles.metaRow}>
                  <span>Level: <strong>{c.level || "Beginner"}</strong></span>
                  <span>Courses: <strong>{c.courses ? c.courses.length : 0}</strong></span>
                </div>

                <div style={styles.mentorSection}>
                  <strong style={{ fontSize: "12px", color: "#64748B" }}>ASSIGNED MENTORS:</strong>
                  {c.mentors && c.mentors.length > 0 ? (
                    <div style={styles.mentorPills}>
                      {c.mentors.map((m) => (
                        <span key={m.id} style={styles.mentorPill}>🧑‍🏫 {m.name}</span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#94A3B8" }}>
                      No mentors assigned yet. Go to Users to assign a mentor.
                    </p>
                  )}
                </div>

                <div style={styles.cardActions}>
                  <button style={styles.editBtn} onClick={() => handleOpenEdit(c)}>Edit</button>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(c.id, c.title)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h2 style={styles.modalTitle}>
                {editingId ? "Edit Branch / Curriculum" : "Add New Branch / Curriculum"}
              </h2>
              <form onSubmit={handleSubmit} style={styles.form}>
                <label style={styles.label}>Curriculum / Department Title *</label>
                <input
                  style={styles.input}
                  placeholder="e.g. Information Technology Department"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />

                <label style={styles.label}>Branch / Category *</label>
                <input
                  style={styles.input}
                  placeholder="e.g. IT, Mechanical Engineering, Civil Engineering"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                />

                <label style={styles.label}>Description *</label>
                <textarea
                  style={styles.textarea}
                  placeholder="Detailed description of the curriculum, objectives, and branch scope..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={styles.label}>Target Level</label>
                    <select
                      style={styles.input}
                      value={form.level}
                      onChange={(e) => setForm({ ...form, level: e.target.value })}
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label style={styles.label}>Status</label>
                    <select
                      style={styles.input}
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <label style={styles.label}>Banner Image URL (Optional)</label>
                <input
                  style={styles.input}
                  placeholder="/curriculum-default.svg or image URL"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                />

                <div style={styles.modalButtons}>
                  <button type="button" style={styles.cancelBtn} onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.saveBtn} disabled={submitting}>
                    {submitting ? "Saving..." : editingId ? "Save Changes" : "Create Branch"}
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
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", marginBottom: "28px" },
  heading: { color: "#0B1F5E", fontSize: "28px", margin: "0 0 6px" },
  subtext: { color: "#64748B", margin: 0, maxWidth: "750px", fontSize: "14px", lineHeight: "1.5" },
  addBtn: { backgroundColor: "#22C55E", color: "#fff", border: "none", padding: "11px 20px", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "14px", whiteSpace: "nowrap" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" },
  card: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", justifyContent: "space-between" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  catBadge: { backgroundColor: "#EEF2FF", color: "#2563EB", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "700" },
  statusPub: { backgroundColor: "#DCFCE7", color: "#166534", padding: "3px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" },
  statusDraft: { backgroundColor: "#FEF3C7", color: "#92400E", padding: "3px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" },
  cardTitle: { color: "#0B1F5E", margin: "0 0 8px", fontSize: "18px" },
  cardDesc: { color: "#64748B", fontSize: "13px", lineHeight: "1.5", margin: "0 0 14px", minHeight: "40px" },
  metaRow: { display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#475569", borderTop: "1px solid #F1F5F9", paddingTop: "10px", marginBottom: "12px" },
  mentorSection: { backgroundColor: "#F8FAFC", borderRadius: "10px", padding: "10px", marginBottom: "16px" },
  mentorPills: { display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" },
  mentorPill: { backgroundColor: "#FEF3C7", color: "#92400E", padding: "3px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" },
  cardActions: { display: "flex", gap: "10px" },
  editBtn: { flex: 1, backgroundColor: "#EEF2FF", color: "#2563EB", border: "none", padding: "9px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
  deleteBtn: { backgroundColor: "#FEE2E2", color: "#DC2626", border: "none", padding: "9px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
  emptyCard: { backgroundColor: "#ffffff", borderRadius: "18px", padding: "50px 30px", textAlign: "center", border: "2px dashed #CBD5E1", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal: { backgroundColor: "#ffffff", width: "100%", maxWidth: "500px", borderRadius: "18px", padding: "26px", maxHeight: "90vh", overflowY: "auto" },
  modalTitle: { margin: "0 0 16px", color: "#0B1F5E", fontSize: "20px" },
  form: { display: "flex", flexDirection: "column" },
  label: { fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" },
  input: { padding: "10px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "14px", marginBottom: "14px", boxSizing: "border-box" },
  textarea: { padding: "10px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "14px", minHeight: "85px", marginBottom: "14px", boxSizing: "border-box", resize: "vertical" },
  modalButtons: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" },
  cancelBtn: { padding: "10px 16px", backgroundColor: "#F1F5F9", color: "#475569", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  saveBtn: { padding: "10px 20px", backgroundColor: "#2563EB", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" },
};

export default ManageCurriculumsPage;
