import React, { useState, useEffect, useCallback, useMemo } from "react";
import AdminHeader from "../components/layout/AdminHeader";
import { certificateAPI, courseAPI, adminAPI } from "../services/api";
import dostLogo from "../assets/dost-logo.png";

/**
 * ManageCertificatesPage - Full Admin Credential Management & Issuance Studio.
 * Allows issuing official DOST certificates, revoking credentials, instant verification, and high-fidelity printing.
 */
function ManageCertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [courses, setCourses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal States
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [activeCert, setActiveCert] = useState(null);

  // Verification Tool State
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyInput, setVerifyInput] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // Issue Form State
  const [issueForm, setIssueForm] = useState({
    user_id: "",
    course_id: "",
    issued_date: new Date().toISOString().split("T")[0],
  });

  const loadData = useCallback(async () => {
    try {
      const [cRes, crsRes, uRes] = await Promise.all([
        certificateAPI.getAll(),
        courseAPI.getAll(),
        adminAPI.users().catch(() => ({ data: [] })),
      ]);
      setCertificates(Array.isArray(cRes.data) ? cRes.data : []);
      setCourses(Array.isArray(crsRes.data) ? crsRes.data : []);

      const allUsers = Array.isArray(uRes.data) ? uRes.data : [];
      setEmployees(allUsers.filter((u) => u.role === "employee" || u.role === "mentor"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenIssue = () => {
    setIssueForm({
      user_id: employees.length > 0 ? employees[0].id : "",
      course_id: courses.length > 0 ? courses[0].id : "",
      issued_date: new Date().toISOString().split("T")[0],
    });
    setShowIssueModal(true);
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!issueForm.user_id || !issueForm.course_id) {
      alert("Please select both a recipient employee and a course.");
      return;
    }
    try {
      await certificateAPI.generate(issueForm);
      setShowIssueModal(false);
      loadData();
      alert("Certificate generated and awarded successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to generate certificate.");
    }
  };

  const handleRevoke = async (id, certNo) => {
    if (!window.confirm(`Are you sure you want to revoke official credential "${certNo}"? This action cannot be undone.`)) return;
    try {
      await certificateAPI.delete(id);
      loadData();
      alert("Certificate revoked successfully.");
    } catch (err) {
      alert("Failed to revoke certificate.");
    }
  };

  const handleOpenView = (cert) => {
    setActiveCert(cert);
    setShowViewModal(true);
  };

  const handleRunVerify = async (e) => {
    e.preventDefault();
    if (!verifyInput.trim()) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await certificateAPI.verify(verifyInput.trim());
      setVerifyResult(res.data);
    } catch (err) {
      setVerifyResult({
        valid: false,
        message: err.response?.data?.message || "Certificate record not found in official registry.",
      });
    } finally {
      setVerifying(false);
    }
  };

  const filteredCerts = useMemo(() => {
    return certificates.filter((c) => {
      if (!search) return true;
      const q = search.toLowerCase();
      const matchRecipient = c.user && c.user.name && c.user.name.toLowerCase().includes(q);
      const matchCourse = c.course && c.course.title && c.course.title.toLowerCase().includes(q);
      const matchCertNo = c.certificate_number && c.certificate_number.toLowerCase().includes(q);
      return matchRecipient || matchCourse || matchCertNo;
    });
  }, [certificates, search]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC" }}>
      <AdminHeader activePortal="functional" />

      <main className="lms-page-container">
        {/* Page Header */}
        <div style={styles.headerRow}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "28px" }}>🎓</span>
              <h1 style={styles.heading}>Institutional Certificate Registry</h1>
            </div>
            <p style={styles.subtext}>
              Issue official DOST training certificates, verify authenticity barcodes, and inspect completed staff competencies.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              style={styles.verifyBtn}
              onClick={() => {
                setVerifyInput("");
                setVerifyResult(null);
                setShowVerifyModal(true);
              }}
            >
              🔍 Verify Credential
            </button>
            <button style={styles.createBtn} onClick={handleOpenIssue}>
              ＋ Issue Certificate
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div style={styles.filterToolbar}>
          <input
            style={styles.search}
            placeholder="🔍 Search recipient name, course title, or certificate serial #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#64748B" }}>
            Total Issued: {certificates.length} Credentials
          </div>
        </div>

        {/* Certificates Table */}
        {loading ? (
          <p style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>Loading certificate records...</p>
        ) : filteredCerts.length === 0 ? (
          <div style={styles.emptyCard}>
            <span style={{ fontSize: "42px" }}>📜</span>
            <h3 style={{ margin: "12px 0 6px", color: "#0B1F5E" }}>No Certificates Found</h3>
            <p style={{ color: "#64748B", maxWidth: "480px", margin: "0 auto 16px" }}>
              {search ? "No certificates match your query." : "No certificates have been issued yet. Click '+ Issue Certificate' to grant official credentials to qualified personnel."}
            </p>
            <button style={styles.createBtn} onClick={handleOpenIssue}>＋ Issue Certificate</button>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Recipient Personnel</th>
                  <th style={styles.th}>Agency Department</th>
                  <th style={styles.th}>Certified Course / Syllabus</th>
                  <th style={styles.th}>Certificate Number</th>
                  <th style={styles.th}>Date Issued</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCerts.map((c, idx) => {
                  const recipientName = c.user?.name || "Personnel Record";
                  const department = c.user?.department || "DOST Agency";
                  const courseTitle = c.course?.title || "Specialized Curriculum";
                  const branchTitle = c.course?.curriculum?.title || "DOST Academy";

                  return (
                    <tr key={c.id} style={idx % 2 === 0 ? { backgroundColor: "#FFFFFF" } : { backgroundColor: "#F8FAFC" }}>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 600, color: "#0F172A" }}>{recipientName}</div>
                        <div style={{ fontSize: "11px", color: "#64748B" }}>{c.user?.email}</div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.deptBadge}>{department}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 500, color: "#0B1F5E" }}>{courseTitle}</div>
                        <div style={{ fontSize: "11px", color: "#64748B" }}>Branch: {branchTitle}</div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.certCode}>{c.certificate_number}</span>
                      </td>
                      <td style={styles.td}>{c.issued_date}</td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          <button
                            style={styles.actionBtnPrint}
                            onClick={() => handleOpenView(c)}
                            title="Preview and print official certificate"
                          >
                            👁️ View / Print
                          </button>
                          <button
                            style={styles.actionBtnDelete}
                            onClick={() => handleRevoke(c.id, c.certificate_number)}
                            title="Revoke certificate"
                          >
                            Revoke
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

      {/* ISSUE CERTIFICATE MODAL */}
      {showIssueModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, color: "#0B1F5E" }}>＋ Issue Official Certificate</h2>
              <button style={styles.modalClose} onClick={() => setShowIssueModal(false)}>✕</button>
            </div>
            <form onSubmit={handleIssueSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={styles.label}>Recipient Personnel *</label>
                <select
                  style={styles.input}
                  value={issueForm.user_id}
                  onChange={(e) => setIssueForm({ ...issueForm, user_id: e.target.value })}
                  required
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} — {emp.email} ({emp.department || emp.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label}>Certified Course *</label>
                <select
                  style={styles.input}
                  value={issueForm.course_id}
                  onChange={(e) => setIssueForm({ ...issueForm, course_id: e.target.value })}
                  required
                >
                  {courses.map((crs) => (
                    <option key={crs.id} value={crs.id}>
                      {crs.title} ({crs.department || "General"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label}>Official Issue Date *</label>
                <input
                  type="date"
                  style={styles.input}
                  value={issueForm.issued_date}
                  onChange={(e) => setIssueForm({ ...issueForm, issued_date: e.target.value })}
                  required
                />
              </div>

              <div style={styles.modalFooter}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowIssueModal(false)}>Cancel</button>
                <button type="submit" style={styles.submitBtn}>Generate Certificate</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW & PRINT HIGH-FIDELITY CERTIFICATE MODAL */}
      {showViewModal && activeCert && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: "880px", padding: "30px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontWeight: 700, color: "#0B1F5E" }}>Official DOST Credential Preview</span>
              <div style={{ display: "flex", gap: "10px" }}>
                <button style={styles.printBtn} onClick={() => window.print()}>🖨️ Print / Save PDF</button>
                <button style={styles.modalClose} onClick={() => setShowViewModal(false)}>✕</button>
              </div>
            </div>

            {/* Official DOST Certificate Frame */}
            <div style={styles.certFrame}>
              <div style={styles.certInnerBorder}>
                <div style={{ textAlign: "center" }}>
                  <img src={dostLogo} alt="DOST Logo" style={{ width: "70px", height: "70px", objectFit: "contain" }} />
                  <div style={{ fontSize: "12px", letterSpacing: "2px", fontWeight: "700", color: "#64748B", marginTop: "6px" }}>
                    REPUBLIC OF THE PHILIPPINES
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "#0B1F5E", margin: "2px 0 14px" }}>
                    DEPARTMENT OF SCIENCE AND TECHNOLOGY
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: "800", color: "#2563EB", letterSpacing: "1px", textTransform: "uppercase" }}>
                    Certificate of Competency
                  </div>
                  <p style={{ fontSize: "13px", color: "#64748B", margin: "8px 0 16px" }}>
                    This credential certifies that
                  </p>
                  <div style={{ fontSize: "28px", fontWeight: "800", color: "#0B1F5E", borderBottom: "2px solid #2563EB", display: "inline-block", paddingBottom: "4px" }}>
                    {activeCert.user?.name || "Trainee Name"}
                  </div>
                  <p style={{ fontSize: "13px", color: "#64748B", margin: "14px 0 6px" }}>
                    has successfully satisfied all rigorous training standards and practical requirements for
                  </p>
                  <div style={{ fontSize: "20px", fontWeight: "700", color: "#0F172A", margin: "6px 0 12px" }}>
                    {activeCert.course?.title || "Certified Course"}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748B" }}>
                    Branch: {activeCert.course?.curriculum?.title || "DOST Academy"}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "32px", padding: "0 20px" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "#0F172A", borderTop: "1px solid #CBD5E1", paddingTop: "6px", width: "180px" }}>
                        {activeCert.course?.mentor?.name || "Faculty Mentor"}
                      </div>
                      <span style={{ fontSize: "11px", color: "#64748B" }}>Authorized Lead Faculty</span>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "12px", fontWeight: "700", color: "#2563EB", backgroundColor: "#EFF6FF", padding: "6px 12px", borderRadius: "8px" }}>
                        {activeCert.certificate_number}
                      </div>
                      <span style={{ fontSize: "10px", color: "#64748B", marginTop: "4px", display: "block" }}>
                        Issued: {activeCert.issued_date}
                      </span>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "#0F172A", borderTop: "1px solid #CBD5E1", paddingTop: "6px", width: "180px" }}>
                        DOST Directorate
                      </div>
                      <span style={{ fontSize: "11px", color: "#64748B" }}>Official Registry Stamp</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VERIFY CREDENTIAL TOOL MODAL */}
      {showVerifyModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, color: "#0B1F5E" }}>🔍 Official Credential Verification</h2>
              <button style={styles.modalClose} onClick={() => setShowVerifyModal(false)}>✕</button>
            </div>
            <form onSubmit={handleRunVerify} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label style={styles.label}>Enter Certificate Serial Number</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  style={{ ...styles.input, flex: 1 }}
                  placeholder="e.g. DOST-CERT-ASTI-8801"
                  value={verifyInput}
                  onChange={(e) => setVerifyInput(e.target.value)}
                  required
                />
                <button type="submit" style={styles.submitBtn} disabled={verifying}>
                  {verifying ? "Checking..." : "Verify"}
                </button>
              </div>
            </form>

            {verifyResult && (
              <div style={{ marginTop: "18px", padding: "16px", borderRadius: "12px", backgroundColor: verifyResult.valid ? "#ECFDF5" : "#FEF2F2", border: `1px solid ${verifyResult.valid ? "#A7F3D0" : "#FECACA"}` }}>
                {verifyResult.valid ? (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#065F46", fontWeight: "700", fontSize: "16px" }}>
                      <span>✅</span> Verified Authentic Credential
                    </div>
                    <div style={{ marginTop: "10px", fontSize: "13px", color: "#065F46", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div><strong>Recipient:</strong> {verifyResult.recipient}</div>
                      <div><strong>Serial #:</strong> {verifyResult.certificate_number}</div>
                      <div><strong>Course:</strong> {verifyResult.course}</div>
                      <div><strong>Agency Branch:</strong> {verifyResult.branch}</div>
                      <div><strong>Faculty Mentor:</strong> {verifyResult.mentor}</div>
                      <div><strong>Issued Date:</strong> {verifyResult.issued_date}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: "#991B1B", fontWeight: "600" }}>
                    ❌ {verifyResult.message || "Invalid certificate serial number."}
                  </div>
                )}
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
  },
  verifyBtn: {
    backgroundColor: "#FFFFFF",
    color: "#0B1F5E",
    border: "1px solid #CBD5E1",
    padding: "10px 18px",
    borderRadius: "12px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
  },
  printBtn: {
    backgroundColor: "#0B1F5E",
    color: "#FFFFFF",
    border: "none",
    padding: "8px 16px",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "13px",
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
  certCode: {
    fontFamily: "monospace",
    fontWeight: "700",
    color: "#0F172A",
    backgroundColor: "#F1F5F9",
    padding: "3px 6px",
    borderRadius: "6px",
  },
  actionBtnPrint: {
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
    maxWidth: "540px",
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
  certFrame: {
    border: "8px solid #0B1F5E",
    padding: "10px",
    borderRadius: "16px",
    backgroundColor: "#FFFFFF",
  },
  certInnerBorder: {
    border: "2px dashed #D4AF37",
    padding: "36px 24px",
    borderRadius: "8px",
    backgroundColor: "#FDFDFD",
  },
};

export default ManageCertificatesPage;
