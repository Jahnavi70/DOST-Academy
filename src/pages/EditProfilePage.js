import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { authAPI, progressAPI } from "../services/api";
import AppHeader from "../components/layout/AppHeader";

function EditProfilePage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: '', department: '', bio: '' });
  const [enrollments, setEnrollments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) setFormData({ name: user.name || '', department: user.department || '', bio: user.bio || '' });
    loadEnrollments();
  }, [user]);

  const loadEnrollments = async () => {
    try {
      const res = await progressAPI.getAll();
      setEnrollments(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    setSaving(true); setMessage('');
    try {
      await authAPI.updateProfile(formData);
      setMessage('Profile updated successfully!');
    } catch (err) { setMessage('Failed to update profile.'); }
    setSaving(false);
  };

  return (
    <div style={styles.page}>
      <AppHeader />
      <main className="lms-page-container" style={styles.container}>
        <section style={styles.profileCard}>
          <h1 style={styles.heading}>Edit Profile</h1>
          <p style={styles.text}>Manage your basic details and learning information.</p>
          {message && <p style={{color: message.includes('success') ? '#16A34A' : '#DC2626', marginBottom: 12}}>{message}</p>}
          <div style={styles.formGrid}>
            <div><label style={styles.label}>Full Name</label><input style={styles.input} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
            <div><label style={styles.label}>Email</label><input style={styles.input} value={user?.email || ''} readOnly /></div>
            <div><label style={styles.label}>Department</label><input style={styles.input} value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} /></div>
            <div><label style={styles.label}>Role</label><input style={styles.input} value={user?.role || ''} readOnly /></div>
            <div style={{gridColumn:'1/-1'}}><label style={styles.label}>Bio</label><textarea style={{...styles.input, height:80}} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} /></div>
          </div>
          <button style={styles.saveButton} onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
        </section>
        <section style={styles.courseCard}>
          <h2 style={styles.sectionTitle}>My Course Progress</h2>
          {enrollments.length === 0 ? <p style={{color:'#64748B'}}>No course progress yet.</p> : enrollments.map((p, i) => (
            <div key={i} style={styles.progressItem}>
              <div><h3 style={styles.itemTitle}>{p.course?.title || 'Course'}</h3><p style={styles.itemSub}>{p.status}</p></div>
              <div style={styles.progressWrapper}>
                <div style={styles.progressBar}><div style={{...styles.progressFill, width: `${p.progress}%`}} /></div>
                <strong style={styles.progressText}>{p.progress}%</strong>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#F1F5F9", fontFamily: "Arial" },
  container: { width: "100%", maxWidth: "100%", margin: "0", padding: "clamp(20px, 3vw, 48px)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px", boxSizing: "border-box" },
  profileCard: { backgroundColor: "#ffffff", padding: "32px", borderRadius: "24px", boxShadow: "0 6px 22px rgba(0,0,0,0.05)" },
  courseCard: { backgroundColor: "#ffffff", padding: "32px", borderRadius: "24px", boxShadow: "0 6px 22px rgba(0,0,0,0.05)" },
  heading: { color: "#0B1F5E", fontSize: "28px", marginBottom: "8px" }, text: { color: "#64748B", marginBottom: "20px" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  label: { display: "block", color: "#475569", fontWeight: "600", marginBottom: "6px", fontSize: "14px" },
  input: { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "14px", boxSizing: "border-box" },
  saveButton: { marginTop: "20px", backgroundColor: "#2563EB", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "10px", cursor: "pointer", fontWeight: "600" },
  sectionTitle: { color: "#0B1F5E", fontSize: "22px", marginBottom: "20px" },
  progressItem: { backgroundColor: "#F8FAFC", borderRadius: "14px", padding: "16px", marginBottom: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", gap: "12px" },
  itemTitle: { color: "#0B1F5E", margin: 0, fontSize: "16px" }, itemSub: { color: "#64748B", margin: "4px 0 0", fontSize: "13px" },
  progressWrapper: { display: "flex", alignItems: "center", gap: "10px" }, progressBar: { flex: 1, height: "8px", backgroundColor: "#E5E7EB", borderRadius: "10px", overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#F59E0B", borderRadius: "10px" }, progressText: { color: "#0B1F5E", fontSize: "14px" },
};

export default EditProfilePage;
