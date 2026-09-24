import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { progressAPI, enrollmentAPI, skillAPI, recommendationAPI, notificationAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import LearnerHeader from "../components/layout/LearnerHeader";

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({ enrolled_count: 0, completed_count: 0, certificate_count: 0, average_progress: 0 });
  const [enrollments, setEnrollments] = useState([]);
  const [skills, setSkills] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, enrollRes, skillRes, recRes, notifRes] = await Promise.all([
        progressAPI.dashboard(),
        enrollmentAPI.userEnrollments(),
        skillAPI.userSkills(),
        recommendationAPI.get(),
        notificationAPI.getAll(),
      ]);
      setStats(statsRes.data);
      setEnrollments(enrollRes.data);
      setSkills(skillRes.data);
      setRecommendations(recRes.data);
      setNotifications(notifRes.data);
    } catch (err) { console.error(err); }
  };

  return (
    <div style={styles.page}>
      <LearnerHeader activeTab="dashboard" />
      <main className="lms-page-container" style={styles.main}>
        <section style={styles.welcomeCard}>
          <div>
            <h1 style={styles.heading}>Welcome Back {user?.name || 'Employee'}</h1>
            <p style={styles.text}>Track your courses, assignments, certificates, and learning progress in one place.</p>
          </div>
          <button style={styles.continueButton} onClick={() => navigate("/courses")}>Continue Learning</button>
        </section>
        <section style={styles.statsGrid}>
          <div style={styles.statCard}><span style={styles.statIcon}>📘</span><h3>Enrolled</h3><p style={styles.statValue}>{stats.enrolled_count}</p></div>
          <div style={styles.statCard}><span style={styles.statIcon}>📝</span><h3>In Progress</h3><p style={styles.statValue}>{stats.enrolled_count - stats.completed_count}</p></div>
          <div style={styles.statCard}><span style={styles.statIcon}>🎓</span><h3>Certificates</h3><p style={styles.statValue}>{stats.certificate_count}</p></div>
          <div style={styles.statCard}><span style={styles.statIcon}>✅</span><h3>Completed</h3><p style={styles.statValue}>{stats.completed_count}</p></div>
        </section>
        <section style={styles.dashboardGrid}>
          <div style={styles.panel}>
            <div style={styles.panelHeader}><h2 style={styles.panelTitle}>My Courses</h2><button style={styles.linkButton} onClick={() => navigate("/courses")}>View all</button></div>
            {enrollments.filter(e => e.course_id).map((enrollment, index) => (
              <div key={index} style={styles.courseItem}>
                <div>
                  <h3 style={styles.itemTitle}>{enrollment.course?.title || enrollment.curriculum?.title || 'Course'}</h3>
                  <p style={styles.itemSub}>{enrollment.curriculum?.title || ''} {enrollment.status}</p>
                </div>
                <button style={styles.continueButton} onClick={() => navigate(`/course-details/${enrollment.course_id}`)}>Open</button>
              </div>
            ))}
            {enrollments.filter(e => e.course_id).length === 0 && <p style={{color:'#64748B'}}>No course enrollments yet. Browse courses to get started.</p>}
          </div>
          <div style={styles.panel}>
            <div style={styles.panelHeader}><h2 style={styles.panelTitle}>My Skills</h2></div>
            {skills.map((skill, index) => (
              <div key={index} style={styles.courseItem}>
                <div><h3 style={styles.itemTitle}>{skill.name}</h3><p style={styles.itemSub}>{skill.category}</p></div>
                <div style={styles.progressWrapper}>
                  <div style={styles.progressBar}><div style={{...styles.progressFill, width: `${skill.pivot?.progress || 0}%`}} /></div>
                  <strong style={styles.progressText}>{skill.pivot?.progress || 0}%</strong>
                </div>
              </div>
            ))}
            {skills.length === 0 && <p style={{color:'#64748B'}}>No skill data yet.</p>}
          </div>
          <div style={styles.panel}>
            <div style={styles.panelHeader}><h2 style={styles.panelTitle}>Recommended For You</h2></div>
            {recommendations.slice(0,3).map((rec, index) => (
              <div key={index} style={styles.activityItem}>
                <span style={styles.greenDot}></span>
                <div><h3 style={styles.itemTitle}>{rec.title}</h3><p style={styles.itemSub}>{rec.category} | {rec.level}</p></div>
              </div>
            ))}
            {recommendations.length === 0 && <p style={{color:'#64748B'}}>No recommendations available.</p>}
          </div>
          <div style={styles.panel}>
            <div style={styles.panelHeader}><h2 style={styles.panelTitle}>Notifications</h2></div>
            {notifications.slice(0,4).map((notif, index) => (
              <div key={index} style={styles.activityItem}>
                <span style={{...styles.greenDot, backgroundColor: notif.is_read ? '#CBD5E1' : '#22C55E'}}></span>
                <div><h3 style={styles.itemTitle}>{notif.title}</h3><p style={styles.itemSub}>{notif.message}</p></div>
              </div>
            ))}
            {notifications.length === 0 && <p style={{color:'#64748B'}}>No notifications.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#F1F5F9", fontFamily: "Arial", overflowX: "hidden" },
  main: { width: "100%", maxWidth: "100%", margin: "0", padding: "clamp(20px, 3vw, 48px)", boxSizing: "border-box" }, welcomeCard: { backgroundColor: "#ffffff", borderRadius: "24px", padding: "30px", marginBottom: "30px", boxShadow: "0 6px 20px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", flexWrap: "wrap", minWidth: 0, boxSizing: "border-box" },
  heading: { color: "#0B1F5E", fontSize: "36px", margin: "10px 0", wordBreak: "break-word" }, text: { color: "#64748B", fontSize: "16px" },
  continueButton: { backgroundColor: "#2563EB", color: "#ffffff", border: "none", padding: "13px 22px", borderRadius: "12px", cursor: "pointer", fontWeight: "700" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "20px", marginBottom: "30px" },
  statCard: { backgroundColor: "#ffffff", padding: "22px", borderRadius: "20px", textAlign: "center", boxShadow: "0 5px 18px rgba(0,0,0,0.05)", minWidth: 0, boxSizing: "border-box" }, statIcon: { fontSize: "28px" },
  statValue: { color: "#2563EB", fontSize: "30px", fontWeight: "700", margin: 0 },
  dashboardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "30px" },
  panel: { backgroundColor: "#ffffff", padding: "32px", borderRadius: "24px", boxShadow: "0 6px 22px rgba(0,0,0,0.05)", minWidth: 0, boxSizing: "border-box" },
  panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px", flexWrap: "wrap", gap: "10px" }, panelTitle: { color: "#0B1F5E", fontSize: "28px", margin: 0 },
  linkButton: { background: "none", border: "none", color: "#2563EB", fontWeight: "700", fontSize: "16px", cursor: "pointer" },
  courseItem: { backgroundColor: "#F8FAFC", borderRadius: "18px", padding: "20px", marginBottom: "16px", display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", alignItems: "center", gap: "18px", minWidth: 0, boxSizing: "border-box" },
  itemTitle: { color: "#0B1F5E", margin: 0, fontSize: "18px", wordBreak: "break-word" }, itemSub: { color: "#64748B", margin: "8px 0 0", wordBreak: "break-word" },
  progressWrapper: { display: "flex", alignItems: "center", gap: "15px", minWidth: 0 }, progressBar: { flex: 1, height: "10px", backgroundColor: "#E5E7EB", borderRadius: "20px", overflow: "hidden", minWidth: 0 },
  progressFill: { height: "100%", backgroundColor: "#F59E0B", borderRadius: "20px" }, progressText: { color: "#0B1F5E" },
  activityItem: { backgroundColor: "#F8FAFC", borderRadius: "18px", padding: "20px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "18px", minWidth: 0, boxSizing: "border-box" },
  greenDot: { width: "14px", height: "14px", borderRadius: "50%", backgroundColor: "#22C55E", flexShrink: 0 },
  badge: { padding: "8px 14px", borderRadius: "20px", fontWeight: "700" },
};

export default DashboardPage;
