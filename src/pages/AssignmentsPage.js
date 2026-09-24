import React, { useState, useEffect } from "react";
import { assignmentAPI, submissionAPI } from "../services/api";
import LearnerHeader from "../components/layout/LearnerHeader";

function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [answers, setAnswers] = useState({});
  const [files, setFiles] = useState({});
  const [submitting, setSubmitting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAssignments(); }, []);

  const loadAssignments = async () => {
    try {
      const res = await assignmentAPI.getAll();
      setAssignments(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSubmit = async (assignmentId) => {
    const content = (answers[assignmentId] || "").trim();
    const file = files[assignmentId] || null;
    const isQuiz = (assignments.find(a => a.id === assignmentId)?.assessment_type || "") === "quiz";

    if (!content && !file) {
      alert(isQuiz ? "Please write your quiz answers before submitting." : "Please write an answer or attach a file before submitting.");
      return;
    }
    if (!file && content.length < 10) {
      alert("Please write a meaningful answer (at least 10 characters) before submitting.");
      return;
    }

    setSubmitting(assignmentId);
    try {
      const formData = new FormData();
      formData.append("assignment_id", assignmentId);
      if (content) formData.append("content", content);
      if (file) formData.append("file", file);
      await submissionAPI.create(formData);
      setAnswers(prev => ({ ...prev, [assignmentId]: "" }));
      setFiles(prev => ({ ...prev, [assignmentId]: null }));
      await loadAssignments();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit assignment");
    }
    setSubmitting(null);
  };

  const statusColor = (status) => {
    switch(status) {
      case 'submitted': return { bg: '#D1FAE5', color: '#065F46' };
      case 'in_progress': return { bg: '#DBEAFE', color: '#1D4ED8' };
      case 'pending': return { bg: '#FEF3C7', color: '#92400E' };
      case 'graded': return { bg: '#E0E7FF', color: '#3730A3' };
      default: return { bg: '#F1F5F9', color: '#475569' };
    }
  };

  const fileUrl = (path) => path ? `http://127.0.0.1:8000/storage/${path}` : null;

  return (
    <div style={styles.page}>
      <LearnerHeader activeTab="assignments" />
      <main className="lms-page-container" style={styles.main}>
        <h1 style={styles.heading}>My Assignments</h1>
        {loading ? <p>Loading...</p> : assignments.length === 0 ? <p style={{color:'#64748B'}}>No assignments yet. Enroll in a course to see assignments.</p> : (
          <div style={styles.grid}>
            {assignments.map((a, i) => (
              <div key={i} style={styles.card}>
                <div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'flex-start'}}>
                  <h3 style={styles.cardTitle}>{a.title}</h3>
                  <span style={styles.typeBadge}>{a.assessment_type || 'assignment'}</span>
                </div>
                <p style={styles.cardText}>{a.description || 'No description'}</p>
                <p style={styles.cardMeta}>Course: {a.course?.title || 'N/A'}</p>
                <p style={styles.cardMeta}>Due: {a.due_date} | Max: {a.max_score || 100} pts</p>
                {a.user_submission ? (
                  <div style={styles.submissionBox}>
                    <p style={styles.cardMeta}>Submitted: {a.user_submission.content || 'File submission'}</p>
                    {a.user_submission.file_path && (
                      <a style={styles.fileLink} href={fileUrl(a.user_submission.file_path)} target="_blank" rel="noreferrer">View attached file</a>
                    )}
                    {a.user_submission.status === 'graded' && (
                      <p style={styles.gradeText}>Grade: {a.user_submission.result}% {a.user_submission.feedback ? `| ${a.user_submission.feedback}` : ''}</p>
                    )}
                  </div>
                ) : (
                  <>
                    <textarea
                      style={styles.textarea}
                      placeholder={a.assessment_type === 'quiz' ? 'Type your quiz answers here' : 'Write your answer, report summary, quiz response, or project notes here'}
                      value={answers[a.id] || ''}
                      onChange={(e) => setAnswers({...answers, [a.id]: e.target.value})}
                    />
                    <label style={styles.fileLabel}>
                      Attach file (optional)
                      <input
                        type="file"
                        onChange={(e) => setFiles({...files, [a.id]: e.target.files?.[0] || null})}
                        style={{display:'block',marginTop:8}}
                      />
                    </label>
                    {files[a.id] && <p style={styles.cardMeta}>Selected: {files[a.id].name}</p>}
                  </>
                )}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12}}>
                  <span style={{...styles.badge, backgroundColor: statusColor(a.user_submission?.status || a.status).bg, color: statusColor(a.user_submission?.status || a.status).color}}>{a.user_submission?.status || a.status}</span>
                  {!a.user_submission && (
                    <button style={styles.submitBtn} onClick={() => handleSubmit(a.id)} disabled={submitting === a.id}>
                      {submitting === a.id ? 'Submitting...' : 'Submit'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#F1F5F9", fontFamily: "Arial" },
  main: { maxWidth: "1600px", margin: "0 auto", padding: "clamp(16px, 2.5vw, 36px)", boxSizing: "border-box" }, heading: { color: "#0B1F5E", fontSize: "32px", marginBottom: "25px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" },
  card: { backgroundColor: "#ffffff", padding: "24px", borderRadius: "18px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" },
  cardTitle: { color: "#0B1F5E", margin: "0 0 8px", fontSize: "18px" }, cardText: { color: "#475569", fontSize: "14px", lineHeight: "1.5", marginBottom: "8px" }, cardMeta: { color: "#64748B", fontSize: "13px", marginBottom: "4px" },
  typeBadge: { backgroundColor: "#E0F2FE", color: "#075985", borderRadius: "20px", padding: "4px 10px", fontSize: "12px", fontWeight: "700", textTransform: "capitalize" },
  textarea: { width: "100%", minHeight: "100px", padding: "10px", borderRadius: "10px", border: "1px solid #CBD5E1", boxSizing: "border-box", resize: "vertical", marginTop: "10px" },
  fileLabel: { display: "block", marginTop: "10px", color: "#64748B", fontSize: "13px", fontWeight: "600" },
  fileLink: { color: "#2563EB", fontWeight: 700, fontSize: "13px", display: "inline-block", marginTop: "6px" },
  submissionBox: { backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "12px", marginTop: "10px" },
  gradeText: { color: "#065F46", fontWeight: "700", margin: "8px 0 0", fontSize: "14px" },
  badge: { padding: "6px 14px", borderRadius: "20px", fontWeight: "700", fontSize: "13px", textTransform: "capitalize" },
  submitBtn: { backgroundColor: "#2563EB", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
};

export default AssignmentsPage;
