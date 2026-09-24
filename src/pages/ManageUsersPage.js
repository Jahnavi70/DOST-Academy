import React, { useState, useEffect, useMemo } from "react";
import AdminHeader from "../components/layout/AdminHeader";
import { useAuth } from "../context/AuthContext";
import { adminAPI, curriculumAPI } from "../services/api";

function ManageUsersPage() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // all, pending, mentors, employees
  const [search, setSearch] = useState("");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "mentor",
    department: "",
    curriculum_id: "",
    bio: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "employee",
    status: "approved",
    department: "",
    curriculum_id: "",
    password: "",
    bio: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, curRes] = await Promise.all([
        adminAPI.users(),
        curriculumAPI.getAll(),
      ]);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setCurriculums(Array.isArray(curRes.data) ? curRes.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = useMemo(() => {
    return users.filter((u) => u.status === "pending").length;
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Tab filter
      if (activeTab === "pending" && u.status !== "pending") return false;
      if (activeTab === "mentors" && u.role !== "mentor") return false;
      if (activeTab === "employees" && u.role !== "employee") return false;

      // Search filter
      if (search) {
        const q = search.toLowerCase();
        const matchName = u.name && u.name.toLowerCase().includes(q);
        const matchEmail = u.email && u.email.toLowerCase().includes(q);
        const matchDept = u.department && u.department.toLowerCase().includes(q);
        const matchBranch = u.curriculum && u.curriculum.title.toLowerCase().includes(q);
        return matchName || matchEmail || matchDept || matchBranch;
      }
      return true;
    });
  }, [users, activeTab, search]);

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveUser(id);
      loadData();
    } catch (err) {
      alert("Failed to approve user");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this user's registration?")) return;
    try {
      await adminAPI.rejectUser(id);
      loadData();
    } catch (err) {
      alert("Failed to reject user");
    }
  };

  const handleDelete = async (id) => {
    if (Number(id) === Number(currentAdmin?.id)) {
      alert("You cannot delete your own admin account.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    try {
      await adminAPI.deleteUser(id);
      loadData();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const handleOpenAdd = (defaultRole = "mentor") => {
    setAddForm({
      name: "",
      email: "",
      password: "",
      role: defaultRole,
      department: "",
      curriculum_id: curriculums.length > 0 ? curriculums[0].id : "",
      bio: "",
    });
    setShowAddModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.createUser({
        ...addForm,
        curriculum_id: addForm.role === "mentor" ? addForm.curriculum_id || null : null,
      });
      setShowAddModal(false);
      loadData();
      alert("User account successfully created and pre-approved!");
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status || "approved",
      department: user.department || "",
      curriculum_id: user.curriculum_id || "",
      password: "",
      bio: user.bio || "",
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...editForm };
      if (!payload.password) delete payload.password;
      if (payload.role !== "mentor") payload.curriculum_id = null;
      await adminAPI.updateUser(editingUser.id, payload);
      setShowEditModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const statusBadge = (s) => {
    if (s === "approved") return { bg: "#DCFCE7", color: "#15803D", label: "Approved" };
    if (s === "pending") return { bg: "#FEF3C7", color: "#B45309", label: "Pending Approval" };
    return { bg: "#FEE2E2", color: "#B91C1C", label: "Rejected" };
  };

  const roleBadge = (r) => {
    if (r === "admin") return { bg: "#DBEAFE", color: "#1E40AF", label: "Super Admin" };
    if (r === "admin_functional") return { bg: "#EEF2FF", color: "#2563EB", label: "Admin (HR / Functional)" };
    if (r === "admin_technical") return { bg: "#0F172A", color: "#38BDF8", label: "Admin (IT / Technical)" };
    if (r === "mentor") return { bg: "#FEF9C3", color: "#854D0E", label: "Mentor" };
    return { bg: "#F1F5F9", color: "#475569", label: "Employee" };
  };

  return (
    <div style={styles.page}>
      <AdminHeader activePortal="technical" />

      <main className="lms-page-container" style={styles.main}>
        <div style={styles.topRow}>
          <div>
            <h1 style={styles.heading}>User & Mentor Control Center</h1>
            <p style={styles.subtext}>
              Review learner registration requests, approve new accounts, add mentors/teachers, and assign mentors to their respective branches.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button style={styles.addMentorBtn} onClick={() => handleOpenAdd("mentor")}>
              🧑‍🏫 + Add Teacher / Mentor
            </button>
            <button style={styles.addUserBtn} onClick={() => handleOpenAdd("employee")}>
              👤 + Add Learner
            </button>
          </div>
        </div>

        {/* Tab Controls and Search */}
        <div style={styles.toolbar}>
          <div style={styles.tabGroup}>
            <button
              style={activeTab === "all" ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab("all")}
            >
              All Users ({users.length})
            </button>
            <button
              style={activeTab === "pending" ? styles.tabActiveAlert : styles.tab}
              onClick={() => setActiveTab("pending")}
            >
              Pending Approvals ({pendingCount})
              {pendingCount > 0 && <span style={styles.pendingDot} />}
            </button>
            <button
              style={activeTab === "mentors" ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab("mentors")}
            >
              Mentors & Teachers ({users.filter((u) => u.role === "mentor").length})
            </button>
            <button
              style={activeTab === "employees" ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab("employees")}
            >
              Learners ({users.filter((u) => u.role === "employee").length})
            </button>
          </div>
          <input
            style={styles.search}
            placeholder="🔍 Search name, email, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p>Loading users...</p>
        ) : filteredUsers.length === 0 ? (
          <div style={styles.empty}>
            <p>No users found for this filter.</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>User Info</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Assigned Branch / Dept</th>
                  <th style={styles.th}>Account Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, i) => {
                  const sb = statusBadge(u.status || "approved");
                  const rb = roleBadge(u.role);
                  return (
                    <tr key={u.id} style={i % 2 === 0 ? { backgroundColor: "#F8FAFC" } : {}}>
                      <td style={styles.td}>
                        <strong>{u.name}</strong>
                        <p style={{ margin: "2px 0 0", color: "#64748B", fontSize: "12px" }}>{u.email}</p>
                      </td>
                      <td style={styles.td}>
                        <span style={{ ...styles.pill, backgroundColor: rb.bg, color: rb.color }}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {u.role === "mentor" ? (
                          u.curriculum ? (
                            <span style={styles.branchPill}>🏛️ {u.curriculum.title}</span>
                          ) : (
                            <span style={{ color: "#DC2626", fontSize: "12px", fontWeight: "600" }}>
                              ⚠️ Unassigned Branch
                            </span>
                          )
                        ) : (
                          u.department || "-"
                        )}
                      </td>
                      <td style={styles.td}>
                        <span style={{ ...styles.pill, backgroundColor: sb.bg, color: sb.color }}>
                          {sb.label}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                          {u.status === "pending" && (
                            <>
                              <button style={styles.approveBtn} onClick={() => handleApprove(u.id)}>
                                Approve
                              </button>
                              <button style={styles.rejectBtn} onClick={() => handleReject(u.id)}>
                                Reject
                              </button>
                            </>
                          )}
                          <button style={styles.editBtn} onClick={() => handleOpenEdit(u)}>
                            Edit
                          </button>
                          <button style={styles.deleteBtn} onClick={() => handleDelete(u.id)}>
                            Delete
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

        {/* Modal: Add User / Mentor */}
        {showAddModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h2 style={styles.modalTitle}>
                {addForm.role === "mentor" ? "Add New Teacher / Mentor" : "Add New User Account"}
              </h2>
              <form onSubmit={handleCreateSubmit} style={styles.form}>
                <label style={styles.label}>Account Role *</label>
                <select
                  style={styles.input}
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                >
                  <option value="mentor">Teacher / Mentor</option>
                  <option value="employee">Learner / Employee</option>
                  <option value="admin_functional">Admin - Functional (HR / Supervisor)</option>
                  <option value="admin_technical">Admin - Technical (IT Operations)</option>
                  <option value="admin">Super Administrator</option>
                </select>

                <label style={styles.label}>Full Name *</label>
                <input
                  style={styles.input}
                  placeholder="e.g. Dr. Jane Smith"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  required
                />

                <label style={styles.label}>Email Address *</label>
                <input
                  style={styles.input}
                  type="email"
                  placeholder="e.g. janesmith@dost.gov.ph"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  required
                />

                <label style={styles.label}>Initial Password *</label>
                <input
                  style={styles.input}
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  minLength={6}
                  required
                />

                {addForm.role === "mentor" && (
                  <div>
                    <label style={styles.label}>Assigned Branch / Curriculum {curriculums.length > 0 ? '*' : '(Optional)'}</label>
                    <select
                      style={styles.input}
                      value={addForm.curriculum_id}
                      onChange={(e) => setAddForm({ ...addForm, curriculum_id: e.target.value })}
                      required={curriculums.length > 0}
                    >
                      <option value="">{curriculums.length > 0 ? "Select Branch / Curriculum" : "None / Unassigned"}</option>
                      {curriculums.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title} ({c.category})
                        </option>
                      ))}
                    </select>
                    {curriculums.length === 0 && (
                      <p style={{ color: "#DC2626", fontSize: "12px", margin: "-6px 0 10px" }}>
                        ⚠️ No branches exist yet. Please create a branch in "Branches" first.
                      </p>
                    )}
                  </div>
                )}

                <label style={styles.label}>Department / Division</label>
                <input
                  style={styles.input}
                  placeholder="e.g. IT Operations, Applied Physics"
                  value={addForm.department}
                  onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                />

                <div style={styles.modalButtons}>
                  <button type="button" style={styles.cancelBtn} onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.saveBtn} disabled={saving}>
                    {saving ? "Creating..." : "Create & Pre-Approve"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit User */}
        {showEditModal && editingUser && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h2 style={styles.modalTitle}>Edit Account: {editingUser.name}</h2>
              <form onSubmit={handleEditSubmit} style={styles.form}>
                <label style={styles.label}>Full Name</label>
                <input
                  style={styles.input}
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />

                <label style={styles.label}>Email Address</label>
                <input
                  style={styles.input}
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={styles.label}>Role</label>
                    <select
                      style={styles.input}
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    >
                      <option value="employee">Learner / Employee</option>
                      <option value="mentor">Teacher / Mentor</option>
                      <option value="admin_functional">Admin - Functional (HR / Supervisor)</option>
                      <option value="admin_technical">Admin - Technical (IT Operations)</option>
                      <option value="admin">Super Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label style={styles.label}>Approval Status</label>
                    <select
                      style={styles.input}
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    >
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {editForm.role === "mentor" && (
                  <div>
                    <label style={styles.label}>Assigned Branch / Curriculum</label>
                    <select
                      style={styles.input}
                      value={editForm.curriculum_id || ""}
                      onChange={(e) => setEditForm({ ...editForm, curriculum_id: e.target.value })}
                    >
                      <option value="">Unassigned</option>
                      {curriculums.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <label style={styles.label}>Department</label>
                <input
                  style={styles.input}
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                />

                <label style={styles.label}>Reset Password (leave blank to keep current)</label>
                <input
                  style={styles.input}
                  type="password"
                  placeholder="New password (optional)"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                />

                <div style={styles.modalButtons}>
                  <button type="button" style={styles.cancelBtn} onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.saveBtn} disabled={saving}>
                    {saving ? "Saving..." : "Update Account"}
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
  main: { padding: "clamp(20px, 3vw, 48px)", maxWidth: "100%", margin: "0", width: "100%", boxSizing: "border-box" },
  topRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", marginBottom: "24px", flexWrap: "wrap" },
  heading: { color: "#0B1F5E", fontSize: "28px", margin: "0 0 6px" },
  subtext: { color: "#64748B", margin: 0, maxWidth: "750px", fontSize: "14px", lineHeight: "1.5" },
  addMentorBtn: { backgroundColor: "#2563EB", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "13px" },
  addUserBtn: { backgroundColor: "#0B1F5E", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "13px" },
  toolbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "15px" },
  tabGroup: { display: "flex", gap: "6px", backgroundColor: "#EDE9FE", padding: "4px", borderRadius: "12px", flexWrap: "wrap" },
  tab: { padding: "8px 14px", border: "none", backgroundColor: "transparent", color: "#5B21B6", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
  tabActive: { padding: "8px 14px", border: "none", backgroundColor: "#7C3AED", color: "#ffffff", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "13px" },
  tabActiveAlert: { padding: "8px 14px", border: "none", backgroundColor: "#D97706", color: "#ffffff", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "13px" },
  pendingDot: { display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#EF4444", marginLeft: "6px" },
  search: { padding: "9px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", width: "260px", fontSize: "13px" },
  tableContainer: { backgroundColor: "#ffffff", borderRadius: "16px", overflowX: "auto", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", border: "1px solid #E2E8F0" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "850px" },
  th: { backgroundColor: "#0B1F5E", color: "#ffffff", padding: "13px 16px", textAlign: "left", fontWeight: "600", fontSize: "13px" },
  td: { padding: "13px 16px", borderBottom: "1px solid #F1F5F9", color: "#334155", fontSize: "13px" },
  pill: { padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700", display: "inline-block" },
  branchPill: { backgroundColor: "#EFF6FF", color: "#1D4ED8", padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "600" },
  approveBtn: { backgroundColor: "#DCFCE7", color: "#15803D", border: "1px solid #86EFAC", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "700", fontSize: "12px" },
  rejectBtn: { backgroundColor: "#FEE2E2", color: "#B91C1C", border: "1px solid #FCA5A5", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "700", fontSize: "12px" },
  editBtn: { backgroundColor: "#F1F5F9", color: "#334155", border: "1px solid #CBD5E1", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px" },
  deleteBtn: { backgroundColor: "#FEF2F2", color: "#DC2626", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px" },
  empty: { backgroundColor: "#ffffff", padding: "40px", textAlign: "center", color: "#64748B", borderRadius: "16px" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal: { backgroundColor: "#ffffff", width: "100%", maxWidth: "520px", borderRadius: "18px", padding: "26px", maxHeight: "90vh", overflowY: "auto" },
  modalTitle: { margin: "0 0 16px", color: "#0B1F5E", fontSize: "20px" },
  form: { display: "flex", flexDirection: "column" },
  label: { fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" },
  input: { padding: "10px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "14px", marginBottom: "14px", boxSizing: "border-box" },
  modalButtons: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" },
  cancelBtn: { padding: "10px 16px", backgroundColor: "#F1F5F9", color: "#475569", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  saveBtn: { padding: "10px 20px", backgroundColor: "#2563EB", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" },
};

export default ManageUsersPage;
