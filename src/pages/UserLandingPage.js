import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { curriculumAPI, recommendationAPI, enrollmentAPI } from "../services/api";
import LearnerHeader from "../components/layout/LearnerHeader";
import slide1 from "../assets/hero-slide1.jpg";
import slide2 from "../assets/hero-slide2.jpg";
import slide3 from "../assets/hero-slide3.jpg";
import curriculumDefault from "../assets/curriculum-default.jpg";
import courseDefault from "../assets/course-default.jpg";

const landingImages = [slide1, slide2, slide3];

function UserLandingPage() {
  const navigate = useNavigate();
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
      <LearnerHeader activeTab="home" />

      <main className="lms-page-container" style={styles.main}>
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
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #EEF2FF, #F8FAFC)", fontFamily: "Arial", overflowX: "hidden" },
  main: { maxWidth: "1600px", margin: "0 auto", padding: "clamp(16px, 2.5vw, 36px)", boxSizing: "border-box" },
  heroSection: { padding: "20px 0 40px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "36px", alignItems: "center" },
  carouselContainer: { position: "relative", borderRadius: "20px", overflow: "hidden", boxShadow: "0 8px 30px rgba(11, 31, 94, 0.1)" },
  carouselImage: { width: "100%", height: "380px", objectFit: "cover" },
  dotsContainer: { position: "absolute", bottom: "15px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px" },
  dot: { width: "12px", height: "12px", borderRadius: "50%", cursor: "pointer" },
  aboutSection: { display: "flex", flexDirection: "column", gap: "10px" },
  smallLabel: { color: "#2563EB", fontWeight: "700", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 },
  aboutTitle: { color: "#0B1F5E", fontSize: "32px", margin: "4px 0 10px", lineHeight: "1.25" },
  aboutText: { color: "#64748B", lineHeight: "1.6", margin: 0 },
  highlightBox: { backgroundColor: "#F0FDF4", padding: "16px 20px", borderRadius: "12px", margin: "16px 0", color: "#166534", border: "1px solid #BBF7D0", display: "flex", flexDirection: "column", gap: "6px" },
  primaryButton: { backgroundColor: "#2563EB", color: "#ffffff", border: "none", padding: "14px 28px", borderRadius: "12px", cursor: "pointer", fontWeight: "700", fontSize: "16px", width: "fit-content", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)" },
  sectionHeader: { padding: "24px 0 12px" },
  sectionTitle: { color: "#0B1F5E", fontSize: "26px", margin: 0, fontWeight: "800" },
  cardsSection: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px", boxSizing: "border-box", paddingBottom: "36px" },
  card: { backgroundColor: "#ffffff", padding: "18px", borderRadius: "18px", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", border: "1px solid #E2E8F0", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s", minWidth: 0, boxSizing: "border-box" },
  cardImage: { width: "100%", height: "160px", objectFit: "cover", borderRadius: "14px", marginBottom: "12px" },
  cardTitle: { color: "#0B1F5E", marginBottom: "8px", wordBreak: "break-word", fontSize: "17px", fontWeight: "700" },
  cardText: { color: "#475569", fontSize: "13.5px", lineHeight: "1.5", marginBottom: "12px" },
  cardMeta: { color: "#94A3B8", fontSize: "12px", fontWeight: "600" },
};

export default UserLandingPage;
