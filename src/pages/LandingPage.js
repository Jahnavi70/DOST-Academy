import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { curriculumAPI } from "../services/api";
import { roleHome } from "../utils/roles";
import logo from "../assets/dost-logo.png";
import heroSlide1 from "../assets/hero-slide1.jpg";
import heroSlide2 from "../assets/hero-slide2.jpg";
import heroSlide3 from "../assets/hero-slide3.jpg";
import curriculumDefault from "../assets/curriculum-default.jpg";
import branchIt from "../assets/branch-it.jpg";
import branchMaterials from "../assets/branch-materials.jpg";
import branchBiotech from "../assets/branch-biotech.jpg";
import branchDisaster from "../assets/branch-disaster.jpg";
import branchEnergy from "../assets/branch-energy.jpg";
import branchManufacturing from "../assets/branch-manufacturing.jpg";

const defaultBranches = [
  {
    id: 1,
    title: "Information & Communications Technology",
    category: "Information Technology",
    image: branchIt,
    description: "Cloud infrastructure, cybersecurity protocols, government interoperability, and enterprise systems.",
    level: "All Levels",
    duration: "4 - 8 weeks",
    courses_count: 6,
  },
  {
    id: 2,
    title: "Advanced Materials & Nanotechnology",
    category: "Physical Sciences",
    image: branchMaterials,
    description: "Industrial nanomaterials, advanced polymer chemistry, materials characterization, and metallurgical engineering.",
    level: "Intermediate",
    duration: "6 weeks",
    courses_count: 4,
  },
  {
    id: 3,
    title: "Agri-Aqua Biotechnology & Food Tech",
    category: "Biotechnology",
    image: branchBiotech,
    description: "Molecular crop genetics, biosafety frameworks, aquaculture diagnostics, and post-harvest food technologies.",
    level: "Advanced",
    duration: "8 weeks",
    courses_count: 5,
  },
  {
    id: 4,
    title: "Disaster Risk Reduction & Climate Resilience",
    category: "Environmental Science",
    image: branchDisaster,
    description: "Multi-hazard spatial mapping, early warning telemetry, climate adaptation engineering, and emergency systems.",
    level: "Beginner to Intermediate",
    duration: "5 weeks",
    courses_count: 7,
  },
  {
    id: 5,
    title: "Renewable Energy & Green Engineering",
    category: "Energy Engineering",
    image: branchEnergy,
    description: "Solar photovoltaic design, microgrid automation, biofuels, and green hydrogen energy storage technologies.",
    level: "Intermediate",
    duration: "6 weeks",
    courses_count: 4,
  },
  {
    id: 6,
    title: "Advanced Manufacturing & Robotics",
    category: "Industrial Technology",
    image: branchManufacturing,
    description: "Additive manufacturing (3D printing), industrial robotics, CNC precision tooling, and Industry 4.0 automation.",
    level: "Intermediate to Advanced",
    duration: "7 weeks",
    courses_count: 5,
  },
];

const heroSlides = [heroSlide1, heroSlide2, heroSlide3];

function LandingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeSlide, setActiveSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [curriculums, setCurriculums] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadCurriculums();
  }, []);

  const loadCurriculums = async () => {
    try {
      const res = await curriculumAPI.getAll();
      if (Array.isArray(res.data) && res.data.length > 0) {
        // Merge image fallbacks if curriculum has no image uploaded
        const merged = res.data.map((c, i) => ({
          ...c,
          image: c.image || defaultBranches[i % defaultBranches.length].image || curriculumDefault,
        }));
        setCurriculums(merged);
      } else {
        setCurriculums(defaultBranches);
      }
    } catch (err) {
      setCurriculums(defaultBranches);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (user) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate(`/login?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleBranchClick = (branch) => {
    if (user) {
      navigate(`/courses?curriculum=${branch.id}`);
    } else {
      navigate(`/login?tab=signup`);
    }
  };

  const filteredBranches = curriculums.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.description && b.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.category && b.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === "all" ||
      (b.category && b.category.toLowerCase() === selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={styles.page}>
      {/* Top Notification Banner */}
      <div style={styles.topNotice}>
        <span>Department of Science and Technology • Official National LMS Portal • Republic of the Philippines</span>
      </div>

      {/* Main Navbar (Udemy Style) */}
      <header style={styles.navbar}>
        <div style={styles.navContainer}>
          <div style={styles.brand} onClick={() => navigate("/")}>
            <img src={logo} alt="DOST Logo" style={styles.logo} />
            <div>
              <div style={styles.brandTitle}>DOST Academy</div>
              <div style={styles.brandSubtitle}>Department of Science and Technology</div>
            </div>
          </div>

          {/* Search Bar in Navbar */}
          <form onSubmit={handleSearchSubmit} style={styles.searchBar}>
            <span style={{ fontSize: "14px", color: "#64748B", marginRight: "8px" }}>Search</span>
            <input
              type="text"
              placeholder="Search science, engineering, or technology courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </form>

          {/* Navigation Links */}
          <nav style={styles.navLinks}>
            <a href="#branches" style={styles.navLink}>Curriculums</a>
            <a href="#how-it-works" style={styles.navLink}>How It Works</a>
            <a href="#features" style={styles.navLink}>Features</a>

            {user ? (
              <div style={styles.userControls}>
                <button
                  style={styles.dashboardBtn}
                  onClick={() => navigate(roleHome(user.role))}
                >
                  Go to Workspace ({user.role})
                </button>
                <button
                  style={styles.logoutBtn}
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  Log out
                </button>
              </div>
            ) : (
              <div style={styles.authButtons}>
                <button
                  style={styles.loginBtn}
                  onClick={() => navigate("/login?tab=login")}
                >
                  Log In
                </button>
                <button
                  style={styles.signupBtn}
                  onClick={() => navigate("/login?tab=signup")}
                >
                  Sign Up
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section (Udemy-Standard with Real Photography) */}
      <section style={styles.heroSection}>
        <div style={styles.heroContainer}>
          {/* Left Column: Hero Content */}
          <div style={styles.heroContent}>
            <div style={styles.heroBadge}>
              <span style={styles.badgePulse}></span>
              <span>SCIENTIFIC & TECHNICAL CAPABILITY BUILDING</span>
            </div>

            <h1 style={styles.heroTitle}>
              Skills for Tomorrow&apos;s Discoveries. <br />
              <span style={styles.heroTitleAccent}>Governed by Science.</span>
            </h1>

            <p style={styles.heroDesc}>
              The specialized e-learning and capability portal for the Department of Science and Technology.
              Explore branch-specific curriculums, learn from accredited department mentors, and master
              advanced technologies with verified institutional certification.
            </p>

            {/* Quick Hero Actions */}
            <div style={styles.heroActions}>
              {user ? (
                <button
                  style={styles.heroPrimaryBtn}
                  onClick={() => navigate(roleHome(user.role))}
                >
                  Enter Your Workspace →
                </button>
              ) : (
                <>
                  <button
                    style={styles.heroPrimaryBtn}
                    onClick={() => navigate("/login?tab=signup")}
                  >
                    Register as Learner →
                  </button>
                  <button
                    style={styles.heroSecondaryBtn}
                    onClick={() => navigate("/login?tab=login")}
                  >
                    Sign In to Portal
                  </button>
                </>
              )}
              <a href="#branches" style={styles.heroExploreLink}>
                Browse Branches ▾
              </a>
            </div>

            {/* Trust Badges Bar */}
            <div style={styles.heroTrustBar}>
              <div style={styles.trustItem}>
                <div>
                  <strong style={styles.trustTitle}>DOST Accredited</strong>
                  <p style={styles.trustDesc}>Official National Platform</p>
                </div>
              </div>
              <div style={styles.trustItem}>
                <div>
                  <strong style={styles.trustTitle}>Branch Mentors</strong>
                  <p style={styles.trustDesc}>Certified Specialists</p>
                </div>
              </div>
              <div style={styles.trustItem}>
                <div>
                  <strong style={styles.trustTitle}>Approval Security</strong>
                  <p style={styles.trustDesc}>Admin & Mentor Verified</p>
                </div>
              </div>
              <div style={styles.trustItem}>
                <div>
                  <strong style={styles.trustTitle}>Verified Certificates</strong>
                  <p style={styles.trustDesc}>Digitally Authenticated</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Card (Real Photography Showcase) */}
          <div style={styles.heroVisual}>
            <div style={styles.visualCard}>
              <div style={styles.visualImageWrapper}>
                <img
                  src={heroSlides[activeSlide]}
                  alt="DOST Scientific Specialization"
                  style={styles.visualImage}
                />
                <div style={styles.visualOverlay}>
                  <div style={styles.visualTag}>FEATURED SPECIALIZATION</div>
                  <h3 style={styles.visualHeading}>
                    {activeSlide === 0
                      ? "Cloud Architecture & Cyber Defense"
                      : activeSlide === 1
                      ? "Advanced Nanomaterials Synthesis"
                      : "Agri-Aqua Molecular Genetics"}
                  </h3>
                  <p style={styles.visualSubtext}>
                    Department-curated syllabus with step-by-step modular assessments.
                  </p>
                </div>
              </div>

              {/* Floating Stat Badge 1 */}
              <div style={styles.floatingBadgeTop}>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "13px", color: "#0B1F5E" }}>100% Verified</div>
                  <div style={{ fontSize: "11px", color: "#64748B" }}>DOST Standards</div>
                </div>
              </div>

              {/* Floating Stat Badge 2 */}
              <div style={styles.floatingBadgeBottom}>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "13px", color: "#0B1F5E" }}>Interactive Lessons</div>
                  <div style={{ fontSize: "11px", color: "#64748B" }}>Videos & Quizzes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Agency Badges Strip */}
      <section style={styles.agencyStrip}>
        <div style={styles.agencyInner}>
          <span style={styles.agencyLabel}>POWERED BY RESEARCH AGENCIES & INSTITUTES:</span>
          <div style={styles.agencyList}>
            <span>ASTI</span>
            <span>•</span>
            <span>SEI</span>
            <span>•</span>
            <span>PCIEERD</span>
            <span>•</span>
            <span>PCHRD</span>
            <span>•</span>
            <span>PCAARRD</span>
            <span>•</span>
            <span>NRCP</span>
            <span>•</span>
            <span>ITDI</span>
          </div>
        </div>
      </section>

      {/* Curriculum Branches Section (Udemy Category Style with Real Photographs) */}
      <section id="branches" style={styles.branchesSection}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <div>
              <span style={styles.sectionPretitle}>CURRICULUM SPECIALIZATIONS</span>
              <h2 style={styles.sectionTitle}>Explore DOST Branches & Curriculums</h2>
              <p style={styles.sectionSubtitle}>
                Courses are organized into distinct technical branches. Mentors specialize within their assigned curriculum to maintain top pedagogical standards.
              </p>
            </div>
            <div style={styles.branchCountBadge}>
              {curriculums.length} Technical Branches
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={styles.pillContainer}>
            {["all", "Information Technology", "Physical Sciences", "Biotechnology", "Environmental Science", "Energy Engineering", "Industrial Technology"].map((cat) => (
              <button
                key={cat}
                style={selectedCategory === cat ? styles.activePill : styles.pill}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "all" ? "All Specializations" : cat}
              </button>
            ))}
          </div>

          {/* Branch Cards Grid (Real Photographic Cards) */}
          <div style={styles.branchGrid}>
            {filteredBranches.map((branch) => (
              <div
                key={branch.id}
                style={styles.branchCard}
                onClick={() => handleBranchClick(branch)}
              >
                <div style={styles.branchCardImageWrapper}>
                  <img
                    src={branch.image || curriculumDefault}
                    alt={branch.title}
                    style={styles.branchCardImage}
                  />
                  <span style={styles.branchCategoryTagOverlay}>
                    {branch.category || "DOST Branch"}
                  </span>
                </div>

                <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <h3 style={styles.branchTitle}>{branch.title}</h3>
                  <p style={styles.branchDescription}>
                    {branch.description || "Comprehensive department curriculum covering essential methodologies and hands-on laboratory frameworks."}
                  </p>

                  <div style={styles.branchMeta}>
                    <span>Duration: {branch.duration || "4-6 weeks"}</span>
                    <span>Level: {branch.level || "Intermediate"}</span>
                  </div>

                  <div style={styles.branchCardFooter}>
                    <span style={styles.enrollHint}>
                      {user ? "View Branch Courses →" : "Request Enrollment →"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section (The 3-Step System Architecture) */}
      <section id="how-it-works" style={styles.howSection}>
        <div style={styles.sectionContainer}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span style={styles.sectionPretitle}>GOVERNANCE & WORKFLOW</span>
            <h2 style={styles.sectionTitle}>How DOST Academy Works</h2>
            <p style={{ ...styles.sectionSubtitle, margin: "8px auto 0", maxWidth: "600px" }}>
              A secure, multi-tier training ecosystem built for accountability, precision, and verified scientific development.
            </p>
          </div>

          <div style={styles.stepsGrid}>
            {/* Step 1 */}
            <div style={styles.stepCard}>
              <div style={styles.stepNumberBadge}>STAGE 01</div>
              <h3 style={styles.stepTitle}>Register Account</h3>
              <p style={styles.stepText}>
                Learners register online with their designated agency department or academic institution. Accounts enter a secure pending verification state.
              </p>
            </div>

            {/* Step 2 */}
            <div style={styles.stepCard}>
              <div style={styles.stepNumberBadge}>STAGE 02</div>
              <h3 style={styles.stepTitle}>Administrator Verification</h3>
              <p style={styles.stepText}>
                The DOST System Administrator verifies credentials and approves learner access. The Admin also provisions mentors and assigns them to specific branches.
              </p>
            </div>

            {/* Step 3 */}
            <div style={styles.stepCard}>
              <div style={styles.stepNumberBadge}>STAGE 03</div>
              <h3 style={styles.stepTitle}>Branch Mentor Course Creation</h3>
              <p style={styles.stepText}>
                Assigned mentors build structured courses using the step-by-step course wizard—featuring banners, modular video lessons, and interactive quizzes.
              </p>
            </div>

            {/* Step 4 */}
            <div style={styles.stepCard}>
              <div style={styles.stepNumberBadge}>STAGE 04</div>
              <h3 style={styles.stepTitle}>Mentor Approval & Certification</h3>
              <p style={styles.stepText}>
                Learners request course enrollment. Once approved by the course mentor, lessons unlock and learners earn verified DOST completion certificates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" style={styles.featuresSection}>
        <div style={styles.sectionContainer}>
          <div style={{ textAlign: "center", marginBottom: "44px" }}>
            <span style={styles.sectionPretitle}>LEARNING EXCELLENCE</span>
            <h2 style={styles.sectionTitle}>Designed for Modern Technical Training</h2>
          </div>

          <div style={styles.featuresGrid}>
            <div style={styles.featureItem}>
              <div style={styles.featureBadge}>CURRICULUM</div>
              <h4>Modular Video & Text Lessons</h4>
              <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#64748B", lineHeight: "1.5" }}>Stream lectures, study interactive syllabus notes, and complete structured modules chapter by chapter.</p>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.featureBadge}>EVALUATION</div>
              <h4>Structured Assessments</h4>
              <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#64748B", lineHeight: "1.5" }}>Quizzes, hands-on submissions, and comprehensive evaluations scored directly by your assigned mentor.</p>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.featureBadge}>METRICS</div>
              <h4>Real-Time Progress Tracking</h4>
              <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#64748B", lineHeight: "1.5" }}>Automated module tracking, completion metrics, and institutional oversight for supervisors and leadership.</p>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.featureBadge}>CREDENTIALS</div>
              <h4>Accredited DOST Certificates</h4>
              <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#64748B", lineHeight: "1.5" }}>Downloadable digital certificates of completion with verified identifiers for career advancement.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Instructor / Mentor Invitation Banner */}
      <section style={styles.mentorBanner}>
        <div style={styles.mentorBannerInner}>
          <div style={{ flex: 1 }}>
            <span style={styles.mentorBannerTag}>TEACH AT DOST ACADEMY</span>
            <h2 style={styles.mentorBannerTitle}>Are You a Certified DOST Specialist or Researcher?</h2>
            <p style={styles.mentorBannerText}>
              System administrators assign mentors to specialized branches. Mentors curate authoritative, high-impact courses, review student work, and mentor the next generation of Filipino scientists and engineers.
            </p>
          </div>
          <div>
            <button
              style={styles.mentorActionBtn}
              onClick={() => navigate("/login?tab=login")}
            >
              Sign In to Mentor Workspace →
            </button>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section style={styles.bottomCtaSection}>
        <div style={styles.bottomCtaContainer}>
          <h2 style={styles.bottomCtaTitle}>Ready to Accelerate Your Scientific & Technical Mastery?</h2>
          <p style={styles.bottomCtaText}>
            Join personnel across the Department of Science and Technology. Register your account today or sign in to continue your courses.
          </p>
          <div style={styles.bottomCtaButtons}>
            <button
              style={styles.heroPrimaryBtn}
              onClick={() => navigate("/login?tab=signup")}
            >
              Register as Learner
            </button>
            <button
              style={styles.heroSecondaryBtn}
              onClick={() => navigate("/login?tab=login")}
            >
              Sign In to Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContainer}>
          <div style={styles.footerColMain}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <img src={logo} alt="DOST Logo" style={{ height: "36px" }} />
              <span style={{ fontSize: "18px", fontWeight: "700", color: "#FFFFFF" }}>DOST Academy</span>
            </div>
            <p style={styles.footerText}>
              Department of Science and Technology (DOST)<br />
              DOST Complex, Gen. Santos Ave., Bicutan, Taguig City, Metro Manila, Philippines.
            </p>
            <p style={{ ...styles.footerText, marginTop: "8px" }}>
              Official E-Learning and Capability Development Platform.
            </p>
          </div>

          <div style={styles.footerCol}>
            <h4 style={styles.footerHeading}>Platform</h4>
            <a href="#branches" style={styles.footerLink}>Curriculum Branches</a>
            <a href="#how-it-works" style={styles.footerLink}>How It Works</a>
            <a href="#features" style={styles.footerLink}>Features</a>
            <span style={styles.footerLink} onClick={() => navigate("/login")}>Course Catalog</span>
          </div>

          <div style={styles.footerCol}>
            <h4 style={styles.footerHeading}>Access</h4>
            <span style={styles.footerLink} onClick={() => navigate("/login?tab=login")}>Learner Login</span>
            <span style={styles.footerLink} onClick={() => navigate("/login?tab=signup")}>Register Account</span>
            <span style={styles.footerLink} onClick={() => navigate("/login?tab=login")}>Mentor Workspace</span>
            <span style={styles.footerLink} onClick={() => navigate("/login?tab=login")}>Admin Portal</span>
          </div>

          <div style={styles.footerCol}>
            <h4 style={styles.footerHeading}>Support & Standards</h4>
            <span style={styles.footerLink}>Approval Guidelines</span>
            <span style={styles.footerLink}>Security & Data Privacy</span>
            <span style={styles.footerLink}>Agency Liaison</span>
            <span style={styles.footerLink}>Contact Helpdesk</span>
          </div>
        </div>

        <div style={styles.footerBottom}>
          <p>© {new Date().getFullYear()} Department of Science and Technology. All Rights Reserved. Republic of the Philippines.</p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#F8FAFC",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: "#0F172A",
  },
  topNotice: {
    backgroundColor: "#0B1F5E",
    color: "#93C5FD",
    fontSize: "12px",
    fontWeight: "500",
    textAlign: "center",
    padding: "7px 16px",
    letterSpacing: "0.3px",
  },
  navbar: {
    backgroundColor: "#FFFFFF",
    borderBottom: "1px solid #E2E8F0",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
  },
  navContainer: {
    width: "100%",
    maxWidth: "100%",
    margin: "0",
    padding: "14px clamp(20px, 3vw, 48px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    boxSizing: "border-box",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
  },
  logo: {
    height: "44px",
    width: "auto",
  },
  brandTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#0B1F5E",
    letterSpacing: "-0.4px",
  },
  brandSubtitle: {
    fontSize: "11px",
    color: "#64748B",
    fontWeight: "500",
  },
  searchBar: {
    flex: 1,
    maxWidth: "460px",
    display: "flex",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: "999px",
    padding: "8px 16px",
    border: "1px solid #CBD5E1",
  },
  searchInput: {
    flex: 1,
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "13px",
    color: "#0F172A",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  navLink: {
    color: "#334155",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
    transition: "color 0.2s",
  },
  authButtons: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  loginBtn: {
    padding: "9px 18px",
    backgroundColor: "transparent",
    border: "1px solid #0B1F5E",
    color: "#0B1F5E",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
  },
  signupBtn: {
    padding: "9px 18px",
    backgroundColor: "#0B1F5E",
    border: "none",
    color: "#FFFFFF",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(11, 31, 94, 0.2)",
  },
  userControls: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  dashboardBtn: {
    padding: "9px 16px",
    backgroundColor: "#2563EB",
    border: "none",
    color: "#FFFFFF",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
  },
  logoutBtn: {
    padding: "9px 14px",
    backgroundColor: "#F1F5F9",
    border: "1px solid #CBD5E1",
    color: "#475569",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
  },
  heroSection: {
    background: "linear-gradient(135deg, #071536 0%, #0B1F5E 50%, #1E3A8A 100%)",
    color: "#FFFFFF",
    padding: "64px 24px 72px",
    position: "relative",
    overflow: "hidden",
  },
  heroContainer: {
    width: "100%",
    maxWidth: "100%",
    margin: "0",
    padding: "0 clamp(20px, 3vw, 48px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "48px",
    flexWrap: "wrap",
    boxSizing: "border-box",
  },
  heroContent: {
    flex: "1 1 540px",
    maxWidth: "640px",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    padding: "6px 14px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.8px",
    color: "#93C5FD",
    marginBottom: "20px",
  },
  badgePulse: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#60A5FA",
  },
  heroTitle: {
    fontSize: "44px",
    lineHeight: "1.15",
    fontWeight: "800",
    letterSpacing: "-1px",
    margin: "0 0 18px",
  },
  heroTitleAccent: {
    color: "#38BDF8",
  },
  heroDesc: {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#CBD5E1",
    margin: "0 0 32px",
  },
  heroActions: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap",
    marginBottom: "40px",
  },
  heroPrimaryBtn: {
    padding: "14px 28px",
    backgroundColor: "#38BDF8",
    color: "#071536",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(56, 189, 248, 0.35)",
  },
  heroSecondaryBtn: {
    padding: "14px 24px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    color: "#FFFFFF",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
  },
  heroExploreLink: {
    color: "#93C5FD",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    padding: "8px 12px",
  },
  heroTrustBar: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "16px",
    borderTop: "1px solid rgba(255, 255, 255, 0.15)",
    paddingTop: "24px",
  },
  trustItem: {
    display: "flex",
    alignItems: "center",
  },
  trustTitle: {
    display: "block",
    fontSize: "13px",
    fontWeight: "700",
    color: "#FFFFFF",
  },
  trustDesc: {
    margin: "2px 0 0",
    fontSize: "11px",
    color: "#94A3B8",
  },
  heroVisual: {
    flex: "1 1 440px",
    maxWidth: "520px",
    position: "relative",
  },
  visualCard: {
    position: "relative",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 24px 48px rgba(0, 0, 0, 0.35)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    backgroundColor: "#0B1F5E",
  },
  visualImageWrapper: {
    position: "relative",
    height: "380px",
    overflow: "hidden",
  },
  visualImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  visualOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "24px",
    background: "linear-gradient(to top, rgba(7, 21, 54, 0.95), transparent)",
  },
  visualTag: {
    display: "inline-block",
    backgroundColor: "#F59E0B",
    color: "#78350F",
    fontSize: "10px",
    fontWeight: "800",
    padding: "4px 8px",
    borderRadius: "4px",
    marginBottom: "8px",
    letterSpacing: "0.5px",
  },
  visualHeading: {
    margin: "0 0 6px",
    fontSize: "20px",
    fontWeight: "700",
    color: "#FFFFFF",
  },
  visualSubtext: {
    margin: 0,
    fontSize: "13px",
    color: "#94A3B8",
  },
  floatingBadgeTop: {
    position: "absolute",
    top: "20px",
    left: "20px",
    backgroundColor: "#FFFFFF",
    borderRadius: "10px",
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },
  floatingBadgeBottom: {
    position: "absolute",
    top: "20px",
    right: "20px",
    backgroundColor: "#FFFFFF",
    borderRadius: "10px",
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },
  agencyStrip: {
    backgroundColor: "#F1F5F9",
    borderBottom: "1px solid #E2E8F0",
    padding: "16px 24px",
  },
  agencyInner: {
    maxWidth: "1240px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  agencyLabel: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: "0.6px",
  },
  agencyList: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    fontSize: "13px",
    fontWeight: "700",
    color: "#0B1F5E",
    flexWrap: "wrap",
  },
  branchesSection: {
    padding: "64px clamp(20px, 3vw, 48px)",
    width: "100%",
    maxWidth: "100%",
    margin: "0",
    boxSizing: "border-box",
  },
  sectionContainer: {
    width: "100%",
    maxWidth: "100%",
    margin: "0",
    boxSizing: "border-box",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: "28px",
    flexWrap: "wrap",
    gap: "16px",
  },
  sectionPretitle: {
    display: "block",
    fontSize: "12px",
    fontWeight: "800",
    color: "#2563EB",
    letterSpacing: "1px",
    marginBottom: "6px",
  },
  sectionTitle: {
    fontSize: "30px",
    fontWeight: "800",
    color: "#0F172A",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  sectionSubtitle: {
    fontSize: "15px",
    color: "#64748B",
    margin: "8px 0 0",
    maxWidth: "680px",
    lineHeight: "1.5",
  },
  branchCountBadge: {
    backgroundColor: "#EFF6FF",
    color: "#1D4ED8",
    fontSize: "13px",
    fontWeight: "700",
    padding: "8px 16px",
    borderRadius: "999px",
    border: "1px solid #BFDBFE",
  },
  pillContainer: {
    display: "flex",
    gap: "10px",
    overflowX: "auto",
    paddingBottom: "16px",
    marginBottom: "24px",
  },
  pill: {
    padding: "8px 16px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #CBD5E1",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  activePill: {
    padding: "8px 16px",
    backgroundColor: "#0B1F5E",
    border: "1px solid #0B1F5E",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
    color: "#FFFFFF",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  branchGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "24px",
  },
  branchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.03)",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  branchCardImageWrapper: {
    position: "relative",
    height: "170px",
    overflow: "hidden",
    backgroundColor: "#0B1F5E",
  },
  branchCardImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  branchCategoryTagOverlay: {
    position: "absolute",
    bottom: "12px",
    left: "14px",
    fontSize: "11px",
    fontWeight: "700",
    color: "#FFFFFF",
    backgroundColor: "rgba(11, 31, 94, 0.85)",
    backdropFilter: "blur(4px)",
    padding: "4px 10px",
    borderRadius: "6px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  branchTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0F172A",
    margin: "0 0 10px",
  },
  branchDescription: {
    fontSize: "13px",
    color: "#64748B",
    lineHeight: "1.5",
    margin: "0 0 18px",
    flex: 1,
  },
  branchMeta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#64748B",
    borderTop: "1px solid #F1F5F9",
    paddingTop: "14px",
    marginBottom: "12px",
  },
  branchCardFooter: {
    textAlign: "right",
  },
  enrollHint: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#2563EB",
  },
  howSection: {
    backgroundColor: "#FFFFFF",
    padding: "72px 24px",
    borderTop: "1px solid #E2E8F0",
    borderBottom: "1px solid #E2E8F0",
  },
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "24px",
  },
  stepCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: "16px",
    padding: "28px 24px",
    border: "1px solid #E2E8F0",
    position: "relative",
  },
  stepNumberBadge: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: "800",
    color: "#2563EB",
    backgroundColor: "#DBEAFE",
    padding: "4px 8px",
    borderRadius: "6px",
    marginBottom: "14px",
    letterSpacing: "0.5px",
  },
  stepTitle: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#0F172A",
    margin: "0 0 8px",
  },
  stepText: {
    fontSize: "13px",
    color: "#64748B",
    lineHeight: "1.5",
    margin: 0,
  },
  featuresSection: {
    padding: "72px clamp(20px, 3vw, 48px)",
    width: "100%",
    maxWidth: "100%",
    margin: "0",
    boxSizing: "border-box",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "24px",
  },
  featureItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid #E2E8F0",
    textAlign: "left",
  },
  featureBadge: {
    display: "inline-block",
    fontSize: "10px",
    fontWeight: "800",
    color: "#0B1F5E",
    backgroundColor: "#F1F5F9",
    padding: "4px 8px",
    borderRadius: "4px",
    marginBottom: "12px",
    letterSpacing: "0.5px",
  },
  mentorBanner: {
    maxWidth: "1240px",
    margin: "0 auto 64px",
    padding: "0 24px",
  },
  mentorBannerInner: {
    background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
    color: "#FFFFFF",
    borderRadius: "20px",
    padding: "44px 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "32px",
    flexWrap: "wrap",
    boxShadow: "0 12px 32px rgba(15, 23, 42, 0.15)",
  },
  mentorBannerTag: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#38BDF8",
    letterSpacing: "1px",
  },
  mentorBannerTitle: {
    fontSize: "26px",
    fontWeight: "800",
    margin: "8px 0 12px",
  },
  mentorBannerText: {
    fontSize: "14px",
    color: "#CBD5E1",
    lineHeight: "1.6",
    margin: 0,
    maxWidth: "600px",
  },
  mentorActionBtn: {
    padding: "14px 24px",
    backgroundColor: "#38BDF8",
    color: "#071536",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "800",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  bottomCtaSection: {
    backgroundColor: "#0B1F5E",
    color: "#FFFFFF",
    padding: "64px 24px",
    textAlign: "center",
  },
  bottomCtaContainer: {
    maxWidth: "760px",
    margin: "0 auto",
  },
  bottomCtaTitle: {
    fontSize: "32px",
    fontWeight: "800",
    margin: "0 0 16px",
    letterSpacing: "-0.5px",
  },
  bottomCtaText: {
    fontSize: "16px",
    color: "#93C5FD",
    margin: "0 0 32px",
    lineHeight: "1.6",
  },
  bottomCtaButtons: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
  footer: {
    backgroundColor: "#071536",
    color: "#94A3B8",
    padding: "60px 24px 30px",
  },
  footerContainer: {
    maxWidth: "1240px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr",
    gap: "40px",
    marginBottom: "40px",
  },
  footerColMain: {
    maxWidth: "380px",
  },
  footerCol: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  footerHeading: {
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: "700",
    margin: "0 0 8px",
  },
  footerLink: {
    color: "#94A3B8",
    textDecoration: "none",
    fontSize: "13px",
    cursor: "pointer",
    transition: "color 0.2s",
  },
  footerText: {
    fontSize: "12px",
    lineHeight: "1.6",
    margin: 0,
  },
  footerBottom: {
    maxWidth: "1240px",
    margin: "0 auto",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    paddingTop: "24px",
    textAlign: "center",
    fontSize: "12px",
  },
};

export default LandingPage;
