import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { certificateAPI } from "../services/api";
import logo from "../assets/dost-logo.png";

function CertificatesPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => { loadCertificates(); }, []);

  const loadCertificates = async () => {
    try {
      const res = await certificateAPI.getAll();
      setCertificates(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <header style={styles.navbar}>
        <div style={styles.logoSection}>
          <img src={logo} alt="DOST Logo" style={styles.logo} />
          <div><h2 style={styles.title}>DOST Academy</h2><p style={styles.subtitle}>Certificates</p></div>
        </div>
        <div style={styles.navSection}>
          <div style={styles.navLinks}>
            <button style={styles.navButton} onClick={() => navigate("/user-home")}>Home</button>
            <button style={styles.navButton} onClick={() => navigate("/dashboard")}>Dashboard</button>
            <button style={styles.navButton} onClick={() => navigate("/courses")}>Courses</button>
            <button style={styles.navButton} onClick={() => navigate("/assignments")}>Assignments</button>
            <button style={styles.activeButton}>Certificates</button>
            <div style={styles.profileWrapper}>
              <button style={styles.profileButton} onClick={() => setShowProfileMenu(!showProfileMenu)}>My Profile ▾</button>
              {showProfileMenu && (
                <div style={styles.dropdown}>
                  <p style={styles.dropdownItem} onClick={() => navigate("/dashboard")}>Dashboard</p>
                  <p style={styles.dropdownItem} onClick={() => navigate("/courses")}>Courses</p>
                  <p style={styles.dropdownItem} onClick={() => navigate("/edit-profile")}>Edit Profile</p>
                  <p style={styles.logoutItem} onClick={() => { logout(); navigate("/"); }}>Logout</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main style={styles.main}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'15px', marginBottom:'25px'}}>
          <div>
            <h1 style={styles.heading}>My Certificates</h1>
            <p style={{margin:0, color:'#64748B'}}>Official certificates generated automatically upon passing assessments or completing courses.</p>
          </div>
        </div>

        {loading ? <p>Loading certificates...</p> : certificates.length === 0 ? (
          <div style={{backgroundColor:'#ffffff', padding:'40px', borderRadius:'16px', textAlign:'center', boxShadow:'0 4px 15px rgba(0,0,0,0.05)'}}>
            <p style={{fontSize:'48px', margin:'0 0 10px'}}>🎓</p>
            <h3 style={{color:'#0B1F5E', margin:'0 0 8px'}}>No Certificates Yet</h3>
            <p style={{color:'#64748B', maxWidth:'500px', margin:'0 auto 20px'}}>Certificates are automatically generated and awarded when a mentor grades your assessments with a passing score (≥ 50%) or when course progress reaches 100%.</p>
            <button style={{backgroundColor:'#2563EB', color:'#ffffff', border:'none', padding:'10px 22px', borderRadius:'20px', cursor:'pointer', fontWeight:'700'}} onClick={() => navigate("/courses")}>
              Browse Courses
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {certificates.map((cert, i) => (
              <div key={i} style={styles.card}>
                <div style={styles.certHeader}>🎓</div>
                <h3 style={styles.cardTitle}>{cert.course?.title || 'Course'}</h3>
                <p style={styles.cardMeta}><strong>Certificate No:</strong> {cert.certificate_number}</p>
                <p style={styles.cardMeta}><strong>Issued:</strong> {cert.issued_date}</p>
                <div style={{margin:'15px 0 10px'}}>
                  <span style={styles.badge}>✓ Verified Completed</span>
                </div>
                <button
                  style={styles.viewButton}
                  onClick={() => setSelectedCert(cert)}
                >
                  📜 View & Print Certificate
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Printable Certificate Modal */}
        {selectedCert && (
          <div style={styles.modalOverlay} onClick={() => setSelectedCert(null)}>
            <div style={styles.certModal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.certFrame}>
                <div style={styles.certTop}>
                  <img src={logo} alt="DOST Seal" style={{width:'70px', height:'70px', objectFit:'contain'}} />
                  <div>
                    <h4 style={{margin:0, color:'#0B1F5E', letterSpacing:'1.5px', textTransform:'uppercase', fontSize:'13px'}}>Republic of the Philippines</h4>
                    <h3 style={{margin:'2px 0', color:'#0B1F5E', fontSize:'16px', fontWeight:'800'}}>DEPARTMENT OF SCIENCE AND TECHNOLOGY</h3>
                    <p style={{margin:0, color:'#475569', fontSize:'12px'}}>DOST Academy Continuing Professional Development</p>
                  </div>
                </div>

                <div style={styles.certDivider}></div>

                <h2 style={{color:'#0B1F5E', fontSize:'24px', letterSpacing:'2px', margin:'15px 0 10px', textTransform:'uppercase'}}>
                  Certificate of Completion
                </h2>
                <p style={{color:'#64748B', fontSize:'13px', margin:'0 0 15px'}}>This officially certifies that</p>
                
                <h1 style={{color:'#1D4ED8', fontSize:'28px', margin:'0 0 12px', borderBottom:'2px solid #DBEAFE', display:'inline-block', paddingBottom:'6px'}}>
                  {user?.name || selectedCert.user?.name || "Distinguished Learner"}
                </h1>

                <p style={{color:'#475569', fontSize:'14px', maxWidth:'600px', margin:'0 auto 20px', lineHeight:'1.6'}}>
                  has successfully fulfilled all required lectures, instructional milestones, assessments, and practical competencies for the professional course:
                </p>

                <h3 style={{color:'#0B1F5E', fontSize:'20px', margin:'0 0 20px', fontWeight:'700'}}>
                  "{selectedCert.course?.title || "Specialized Training Course"}"
                </h3>

                <div style={styles.certDetailsRow}>
                  <div>
                    <p style={{margin:0, fontSize:'11px', color:'#94A3B8', textTransform:'uppercase'}}>Certificate ID</p>
                    <p style={{margin:'2px 0 0', fontSize:'13px', fontWeight:'700', color:'#0F172A'}}>{selectedCert.certificate_number}</p>
                  </div>
                  <div>
                    <p style={{margin:0, fontSize:'11px', color:'#94A3B8', textTransform:'uppercase'}}>Issue Date</p>
                    <p style={{margin:'2px 0 0', fontSize:'13px', fontWeight:'700', color:'#0F172A'}}>{selectedCert.issued_date}</p>
                  </div>
                  <div>
                    <p style={{margin:0, fontSize:'11px', color:'#94A3B8', textTransform:'uppercase'}}>Status</p>
                    <p style={{margin:'2px 0 0', fontSize:'13px', fontWeight:'700', color:'#16A34A'}}>Authenticated</p>
                  </div>
                </div>
              </div>

              <div style={styles.modalActions}>
                <button
                  style={styles.printButton}
                  onClick={() => window.print()}
                >
                  🖨️ Print / Save as PDF
                </button>
                <button
                  style={styles.closeModalButton}
                  onClick={() => setSelectedCert(null)}
                >
                  Close
                </button>
              </div>
            </div>
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
  main: { padding: "30px", maxWidth: "1200px", margin: "0 auto" }, heading: { color: "#0B1F5E", fontSize: "32px", margin: "0 0 4px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" },
  card: { backgroundColor: "#ffffff", padding: "24px", borderRadius: "18px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", textAlign: "center", border: "1px solid #E2E8F0" },
  certHeader: { fontSize: "48px", marginBottom: "12px" },
  cardTitle: { color: "#0B1F5E", margin: "0 0 8px", fontSize: "18px" }, cardMeta: { color: "#64748B", fontSize: "13px", marginBottom: "4px" },
  badge: { display: "inline-block", padding: "6px 16px", borderRadius: "20px", backgroundColor: "#D1FAE5", color: "#065F46", fontWeight: "700", fontSize: "12px" },
  viewButton: { width: "100%", marginTop: "12px", backgroundColor: "#EEF2FF", color: "#1D4ED8", border: "1px solid #BFDBFE", padding: "9px 16px", borderRadius: "12px", cursor: "pointer", fontWeight: "700", fontSize: "13px" },
  
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.75)", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", zIndex: 1000 },
  certModal: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "30px", maxWidth: "780px", width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 40px rgba(0,0,0,0.25)" },
  certFrame: { border: "4px double #1E3A8A", padding: "35px 25px", borderRadius: "12px", textAlign: "center", backgroundColor: "#FAFAFA", position: "relative" },
  certTop: { display: "flex", alignItems: "center", justifyContent: "center", gap: "15px", flexWrap: "wrap", textAlign: "left" },
  certDivider: { height: "2px", backgroundColor: "#CBD5E1", margin: "18px auto", width: "80%" },
  certDetailsRow: { display: "flex", justifyContent: "space-around", marginTop: "30px", paddingTop: "20px", borderTop: "1px dashed #CBD5E1" },
  modalActions: { display: "flex", justifyContent: "center", gap: "12px", marginTop: "20px" },
  printButton: { backgroundColor: "#1D4ED8", color: "#ffffff", border: "none", padding: "10px 24px", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "14px" },
  closeModalButton: { backgroundColor: "#E2E8F0", color: "#334155", border: "none", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontWeight: "600", fontSize: "14px" },
};

export default CertificatesPage;
