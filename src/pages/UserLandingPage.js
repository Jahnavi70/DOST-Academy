import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { curriculumAPI, recommendationAPI, enrollmentAPI } from "../services/api";
import logo from "../assets/dost-logo.png";
import slide1 from "../assets/hero-slide1.jpg";
import slide2 from "../assets/hero-slide2.jpg";
import slide3 from "../assets/hero-slide3.jpg";
import curriculumDefault from "../assets/curriculum-default.jpg";
import courseDefault from "../assets/course-default.jpg";

const landingImages = [slide1, slide2, slide3];

function UserLandingPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [curriculums, setCurriculums] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [enrolledCount, setEnrolledCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCurrentImage((prev) => prev === landingImages.length - 1 ? 0 : prev + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [curRes, recRes, enrollRes] = await Promise.all([
        curriculumAPI.getAll({ sort: 'recent' }),
        recommendationAPI.get(),
        enrollmentAPI.userEnrollments(),
      ]);
      setCurriculums(curRes.data.slice(0, 8));
      setRecommendations(recRes.data.slice(0, 4));
      setEnrolledCount(enrollRes.data.length);
    } catch (err) { console.error(err); }
  };

  return (
    <div style={styles.page}>
      <header style={styles.navbar}>
        <div style={styles.logoSection}>
          <img src={logo} alt="DOST Logo" style={styles.logo} />
          <div><h2 style={styles.title}>DOST Academy</h2><p style={styles.subtitle}>Learning Management System</p></div>
        </div>
        <nav style={styles.navLinks}>
          <button style={styles.homeButton} onClick={() => navigate("/user-home")}>Home</button>
          <button style={styles.navButton} onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button style={styles.navButton} onClick={() => navigate("/courses")}>Courses</button>
          <button style={styles.navButton} onClick={() => navigate("/assignments")}>Assignments</button>
          <button style={styles.navButton} onClick={() => navigate("/certificates")}>Certificates</button>
          <div style={styles.profileWrapper}>
            <button style={styles.profileButton} onClick={() => setShowProfileMenu(!showProfileMenu)}>My Profile ▾</button>
            {showProfileMenu && (
              <div style={styles.dropdown}>
                <p style={styles.dropdownItem} onClick={() => navigate("/dashboard")}>Dashboard</p>
                <p style={styles.dropdownItem} onClick={() => navigate("/courses")}>Courses</p>
                <p style={styles.dropdownItem} onClick={() => navigate("/assignments")}>Assignments</p>
                <p style={styles.dropdownItem} onClick={() => navigate("/edit-profile")}>Edit Profile</p>
                <p style={styles.dropdownItem} onClick={() => navigate("/certificates")}>Certificates</p>
                <p style={styles.logoutItem} onClick={() => { logout(); navigate("/"); }}>Logout</p>
              </div>
            )}
          </div>
        </nav>
      </header>

      <section style={styles.heroSection}>
        <div style={styles.carouselContainer}>
          <img src={landingImages[currentImage]} alt="DOST Academy" style={styles.carouselImage} />
          <div style={styles.dotsContainer}>
            {landingImages.map((_, index) => (
              <span key={index} style={{...styles.dot, backgroundColor: currentImage === index ? "#2563EB" : "#CBD5E1"}} />
            ))}
          </div>
        </div>
        <div style={styles.aboutSection}>
          <p style={styles.smallLabel}>About Us</p>
          <h2 style={styles.aboutTitle}>Learn, track, and grow through one centralized platform</h2>
          <p style={styles.aboutText}>DOST Academy supports employee learning through courses, assessments, certifications, and progress tracking.</p>
          <div style={styles.highlightBox}>
            <p>✔ Easy access to learning materials</p>
            <p>✔ Progress and certificate tracking</p>
            <p>✔ {enrolledCount} curriculum{enrolledCount !== 1 ? 's' : ''} available</p>
          </div>
          <button style={styles.primaryButton} onClick={() => navigate("/courses")}>Explore Courses</button>
        </div>
      </section>

      <section style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Available Curriculums</h2>
      </section>
      <section style={styles.cardsSection}>
        {curriculums.map((curriculum, index) => (
          <div key={index} style={styles.card} onClick={() => navigate("/courses")}>
            <img src={curriculum.image || curriculumDefault} alt={curriculum.title} style={styles.cardImage} />
            <h3 style={styles.cardTitle}>{curriculum.title}</h3>
            <p style={styles.cardText}>{curriculum.description}</p>
            <p style={styles.cardMeta}>{curriculum.category} | {curriculum.level} | {(curriculum.courses || []).filter(course => course.status === 'published').length} courses</p>
          </div>
        ))}
      </section>

      {recommendations.length > 0 && (
        <>
          <section style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Recommended For You</h2>
          </section>
          <section style={styles.cardsSection}>
            {recommendations.map((rec, index) => (
              <div key={index} style={styles.card} onClick={() => navigate("/courses")}>
                <img src={rec.image || courseDefault} alt={rec.title} style={styles.cardImage} />
                <h3 style={styles.cardTitle}>{rec.title}</h3>
                <p style={styles.cardText}>{rec.description}</p>
                <p style={styles.cardMeta}>{rec.category} | {rec.level}</p>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #EEF2FF, #F8FAFC)", fontFamily: "Arial", overflowX: "hidden" },
  navbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 30px", backgroundColor: "#ffffff", borderBottom: "1px solid #E2E8F0", position: "sticky", top: 0, zIndex: 100, flexWrap: "wrap", gap: "12px" },
  logoSection: { display: "flex", alignItems: "center", gap: "12px" }, logo: { width: "55px" }, title: { margin: 0, color: "#0B1F5E" }, subtitle: { margin: 0, color: "#64748B", fontSize: "13px" },
  navLinks: { display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" },
  homeButton: { backgroundColor: "#2563EB", color: "#ffffff", border: "none", padding: "9px 18px", borderRadius: "20px", cursor: "pointer", fontWeight: "600" },
  navButton: { backgroundColor: "#EEF2FF", color: "#0B1F5E", border: "none", padding: "9px 14px", borderRadius: "20px", cursor: "pointer", fontWeight: "600" },
  profileWrapper: { position: "relative" }, profileButton: { backgroundColor: "#0B1F5E", color: "#ffffff", border: "none", padding: "9px 14px", borderRadius: "20px", cursor: "pointer", fontWeight: "600" },
  dropdown: { position: "absolute", right: 0, top: "45px", width: "190px", backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 8px 25px rgba(0,0,0,0.15)", padding: "10px", zIndex: 999 },
  dropdownItem: { margin: 0, padding: "10px", cursor: "pointer", color: "#0B1F5E", borderRadius: "8px" }, logoutItem: { margin: 0, padding: "10px", cursor: "pointer", color: "#DC2626", fontWeight: "700", borderRadius: "8px" },
  heroSection: { padding: "40px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "40px", alignItems: "center" },
  carouselContainer: { position: "relative", borderRadius: "20px", overflow: "hidden" }, carouselImage: { width: "100%", height: "400px", objectFit: "cover" },
  dotsContainer: { position: "absolute", bottom: "15px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px" },
  dot: { width: "12px", height: "12px", borderRadius: "50%", cursor: "pointer" },
  smallLabel: { color: "#2563EB", fontWeight: "700", fontSize: "14px" }, aboutTitle: { color: "#0B1F5E", fontSize: "32px", margin: "10px 0" }, aboutText: { color: "#64748B", lineHeight: "1.6" },
  highlightBox: { backgroundColor: "#F0FDF4", padding: "15px 20px", borderRadius: "12px", margin: "20px 0", color: "#166534" },
  primaryButton: { backgroundColor: "#2563EB", color: "#ffffff", border: "none", padding: "14px 28px", borderRadius: "12px", cursor: "pointer", fontWeight: "700", fontSize: "16px" },
  sectionHeader: { padding: "10px 40px 0" }, sectionTitle: { color: "#0B1F5E", fontSize: "28px" },
  cardsSection: { padding: "20px 40px 40px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", boxSizing: "border-box" },
  card: { backgroundColor: "#ffffff", padding: "18px", borderRadius: "18px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", cursor: "pointer", transition: "transform 0.3s", minWidth: 0, boxSizing: "border-box" },
  cardImage: { width: "100%", height: "150px", objectFit: "cover", borderRadius: "14px", marginBottom: "12px" },
  cardTitle: { color: "#0B1F5E", marginBottom: "8px", wordBreak: "break-word" }, cardText: { color: "#475569", fontSize: "14px", lineHeight: "1.5", marginBottom: "8px" }, cardMeta: { color: "#94A3B8", fontSize: "13px" },
};

export default UserLandingPage;
