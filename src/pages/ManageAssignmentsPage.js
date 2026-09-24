import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { assignmentAPI, courseAPI } from "../services/api";
import logo from "../assets/dost-logo.png";

function ManageAssignmentsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ course_id: '', title: '', description: '', due_date: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [aRes, cRes] = await Promise.all([assignmentAPI.getAll(), courseAPI.getAll()]);
      setAssignments(aRes.data);
      setCourses(cRes.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleCreate = async () => {
    try { await assignmentAPI.create(form); setShowForm(false); setForm({ course_id: '', title: '', description: '', due_date: '' }); loadData(); }
    catch (err) { alert("Failed to create assignment"); }
  };

  return (
    <div style={styles.page}>
      <header style={styles.navbar}>
        <div style={styles.logoSection}>
          <img src={logo} alt="DOST Logo" style={styles.logo} />
          <div><h2 style={styles.title}>DOST Academy</h2><p style={styles.subtitle}>Manage Assignments</p></div>
        </div>
        <div style={styles.navSection}>
          <div style={styles.navLinks}>
            <button style={styles.navButton} onClick={() => navigate("/admin-dashboard")}>Dashboard</button>
            <button style={styles.navButton} onClick={() => navigate("/manage-users")}>Users</button>
            <button style={styles.navButton} onClick={() => navigate("/manage-courses")}>Courses</button>
            <button style={styles.activeButton}>Assignments</button>
            <button style={styles.navButton} onClick={() => navigate("/manage-certificates")}>Certificates</button>
            <button style={styles.navButton} onClick={() => navigate("/progress-reports")}>Reports</button>
            <div style={styles.profileWrapper}>
              <button style={styles.profileButton} onClick={() => setShowAdminMenu(!showAdminMenu)}>Admin ▾</button>
              {showAdminMenu && (
                <div style={styles.dropdown}>
                  <p style={styles.dropdownItem} onClick={() => navigate("/admin-dashboard")}>Dashboard</p>
                  <p style={styles.logoutItem} onClick={() => { logout(); navigate("/"); }}>Logout</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main style={styles.main}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:25}}>
          <h1 style={styles.heading}>Manage Assignments</h1>
          <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add Assignment'}</button>
        </div>
        {showForm && (
          <div style={styles.formCard}>
            <h3 style={{color:'#0B1F5E',marginBottom:16}}>Create New Assignment</h3>
            <select style={styles.input} value={form.course_id} onChange={(e) => setForm({...form, course_id: e.target.value})}>
              <option value="">Select Course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <input style={styles.input} placeholder="Assignment Title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
            <textarea style={{...styles.input,height:80}} placeholder="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
            <input style={styles.input} type="date" value={form.due_date} onChange={(e) => setForm({...form, due_date: e.target.value})} />
            <button style={styles.saveBtn} onClick={handleCreate}>Create Assignment</button>
          </div>
        )}
        {loading ? <p>Loading...</p> : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>Title</th><th style={styles.th}>Course</th><th style={styles.th}>Due Date</th><th style={styles.th}>Status</th></tr></thead>
              <tbody>
                {assignments.map((a, i) => (
                  <tr key={i} style={i % 2 === 0 ? {backgroundColor:'#F8FAFC'} : {}}>
                    <td style={styles.td}>{a.title}</td><td style={styles.td}>{a.course?.title || '-'}</td><td style={styles.td}>{a.due_date}</td>
                    <td style={styles.td}><span style={{...styles.badge, backgroundColor: a.status === 'submitted' ? '#D1FAE5' : '#FEF3C7', color: a.status === 'submitted' ? '#065F46' : '#92400E'}}>{a.status}</span></td>
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
  page: { minHeight: "100vh", background: "#F1F5F9", fontFamily: "Arial" },
  navbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 30px", backgroundColor: "#ffffff", borderBottom: "1px solid #E2E8F0", flexWrap: "wrap", gap: "15px", position: "sticky", top: 0, zIndex: 100 },
  logoSection: { display: "flex", alignItems: "center", gap: "12px" }, logo: { width: "55px" }, title: { margin: 0, color: "#0B1F5E" }, subtitle: { margin: 0, color: "#64748B", fontSize: "13px" },
  navSection: { display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }, navLinks: { display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" },
  navButton: { backgroundColor: "#EEF2FF", color: "#0B1F5E", border: "none", padding: "9px 14px", borderRadius: "20px", cursor: "pointer", fontWeight: "600" },
  activeButton: { backgroundColor: "#2563EB", color: "#ffffff", border: "none", padding: "9px 14px", borderRadius: "20px", cursor: "pointer", fontWeight: "600" },
  profileWrapper: { position: "relative" }, profileButton: { backgroundColor: "#0B1F5E", color: "#ffffff", border: "none", padding: "9px 14px", borderRadius: "20px", cursor: "pointer", fontWeight: "600" },
  dropdown: { position: "absolute", right: 0, top: "45px", width: "190px", backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 8px 25px rgba(0,0,0,0.15)", padding: "10px", zIndex: 999 },
  dropdownItem: { margin: 0, padding: "10px", cursor: "pointer", color: "#0B1F5E", borderRadius: "8px" }, logoutItem: { margin: 0, padding: "10px", cursor: "pointer", color: "#DC2626", fontWeight: "700", borderRadius: "8px" },
  main: { padding: "30px" }, heading: { color: "#0B1F5E", fontSize: "32px", margin: 0 },
  addBtn: { backgroundColor: "#22C55E", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontWeight: "600" },
  formCard: { backgroundColor: "#ffffff", padding: "24px", borderRadius: "18px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", marginBottom: "25px" },
  input: { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "14px", marginBottom: "12px", boxSizing: "border-box" },
  saveBtn: { backgroundColor: "#2563EB", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  tableContainer: { backgroundColor: "#ffffff", borderRadius: "18px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { backgroundColor: "#0B1F5E", color: "#ffffff", padding: "14px 18px", textAlign: "left", fontWeight: "600" },
  td: { padding: "14px 18px", borderBottom: "1px solid #E2E8F0", color: "#475569" },
  badge: { padding: "4px 12px", borderRadius: "12px", fontWeight: "600", fontSize: "13px" },
};

export default ManageAssignmentsPage;
