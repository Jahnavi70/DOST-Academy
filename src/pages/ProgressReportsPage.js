import React, { useState, useEffect } from "react";
import AdminHeader from "../components/layout/AdminHeader";
import { adminAPI } from "../services/api";

function ProgressReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const res = await adminAPI.allProgress();
      setReports(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const matchUser = r.user?.name && r.user.name.toLowerCase().includes(q);
    const matchDept = r.user?.department && r.user.department.toLowerCase().includes(q);
    const matchCourse = r.course?.title && r.course.title.toLowerCase().includes(q);
    const matchCurriculum = r.curriculum?.title && r.curriculum.title.toLowerCase().includes(q);
    return matchUser || matchDept || matchCourse || matchCurriculum;
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC" }}>
      <AdminHeader activePortal="functional" />

      <main className="lms-page-container">
        <div style={styles.headerRow}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "28px" }}>📊</span>
              <h1 style={styles.heading}>Employee Progress & Completion Reports</h1>
            </div>
            <p style={styles.subtext}>
              Granular auditing of learner engagement, milestone completions, syllabus velocities, and earned credentials across all DOST agency institutes.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div style={styles.filterToolbar}>
          <input
            style={styles.search}
            placeholder="🔍 Search employee name, department, branch, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#64748B" }}>
            Total Audit Records: {filteredReports.length}
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>Loading progress telemetry...</p>
        ) : filteredReports.length === 0 ? (
          <div style={styles.emptyCard}>
            <span style={{ fontSize: "40px" }}>📈</span>
            <h3 style={{ margin: "10px 0 4px", color: "#0B1F5E" }}>No Progress Records Found</h3>
            <p style={{ color: "#64748B", maxWidth: "450px", margin: "0 auto" }}>
              {search ? "No records match the search term." : "Once employees begin completing course modules and assessments, their milestones will be logged here."}
            </p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Employee / Trainee</th>
                  <th style={styles.th}>Agency Department</th>
                  <th style={styles.th}>Curriculum Branch</th>
                  <th style={styles.th}>Course Enrolled</th>
                  <th style={styles.th}>Syllabus Progress</th>
                  <th style={styles.th}>Enrollment Status</th>
                  <th style={styles.th}>Credential</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((r, i) => (
                  <tr key={i} style={i % 2 === 0 ? { backgroundColor: "#FFFFFF" } : { backgroundColor: "#F8FAFC" }}>
                    <td style={styles.td}>
                      <strong style={{ color: "#0F172A" }}>{r.user?.name || "Trainee"}</strong>
                      <div style={{ fontSize: "11px", color: "#64748B" }}>{r.user?.email}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.deptBadge}>{r.user?.department || "DOST Agency"}</span>
                    </td>
                    <td style={styles.td}>{r.curriculum?.title || "DOST Branch"}</td>
                    <td style={styles.td}>{r.course?.title || "All curriculum courses"}</td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={styles.progressBarBg}>
                          <div
                            style={{
                              ...styles.progressBarFill,
                              width: `${r.progress ?? 0}%`,
                              backgroundColor: (r.progress ?? 0) >= 100 ? "#10B981" : "#2563EB",
                            }}
                          />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: "12px", color: (r.progress ?? 0) >= 100 ? "#059669" : "#2563EB" }}>
                          {r.progress ?? 0}%
                        </span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          backgroundColor: r.status === "completed" ? "#DCFCE7" : r.status === "in_progress" ? "#DBEAFE" : "#FEF3C7",
                          color: r.status === "completed" ? "#166534" : r.status === "in_progress" ? "#1E40AF" : "#92400E",
                        }}
                      >
                        {r.status || "enrolled"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {r.has_certificate ? (
                        <span style={styles.certPill}>🎓 {r.certificate_number || "Issued"}</span>
                      ) : (
                        <span style={{ color: "#94A3B8", fontSize: "12px" }}>—</span>
                      )}
                    </td>
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
  search: {
    padding: "8px 14px",
    borderRadius: "10px",
    border: "1px solid #CBD5E1",
    fontSize: "13px",
    width: "380px",
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
  deptBadge: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#2563EB",
    backgroundColor: "#EFF6FF",
    padding: "3px 8px",
    borderRadius: "8px",
  },
  progressBarBg: {
    width: "90px",
    height: "8px",
    borderRadius: "4px",
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: "4px",
    transition: "width 0.3s ease",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "12px",
    textTransform: "capitalize",
  },
  certPill: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#059669",
    backgroundColor: "#ECFDF5",
    padding: "3px 8px",
    borderRadius: "8px",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    border: "1px solid #E2E8F0",
    padding: "48px 24px",
    textAlign: "center",
  },
};

export default ProgressReportsPage;
