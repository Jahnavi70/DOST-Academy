import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import dostLogo from "../../assets/dost-logo.png";

/**
 * Unified Responsive MentorHeader adhering to Apple HIG & DOST brand identity.
 */
export default function MentorHeader({ assignedBranch = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Faculty Dashboard", path: "/mentor-dashboard" },
    { label: "Course Catalog", path: "/courses" },
  ];

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        {/* Brand */}
        <div style={styles.brand} onClick={() => navigate("/mentor-dashboard")}>
          <img src={dostLogo} alt="DOST Logo" style={styles.logo} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={styles.brandName}>DOST Academy</span>
              <span style={styles.branchTag}>👨‍🏫 Faculty Mentor</span>
            </div>
            <span style={styles.subBrand}>
              {assignedBranch || user?.department || "Department of Science and Technology"}
            </span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav style={styles.desktopNav}>
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                style={isActive ? styles.navActive : styles.navLink}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div style={styles.rightControls}>
          <div style={styles.userMenuWrapper}>
            <button
              style={styles.userBtn}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div style={styles.avatarDot}>
                {user?.name ? user.name.charAt(0).toUpperCase() : "M"}
              </div>
              <div style={styles.userTextWrapper}>
                <span style={styles.userName}>{user?.name || "Mentor"}</span>
                <span style={styles.userDept}>{user?.department || "Faculty"}</span>
              </div>
              <span style={{ fontSize: "11px", color: "#64748B" }}>▾</span>
            </button>

            {showProfileMenu && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownUser}>
                  <strong>{user?.name}</strong>
                  <div style={{ color: "#64748B", fontSize: "12px", marginTop: "2px" }}>{user?.email}</div>
                  <div style={{ marginTop: "4px", fontSize: "11px", color: "#10B981", fontWeight: "600" }}>
                    Certified Mentor
                  </div>
                </div>
                <hr style={{ margin: "8px 0", borderColor: "#F1F5F9" }} />
                <button style={styles.dropdownItem} onClick={() => { setShowProfileMenu(false); navigate("/mentor-dashboard"); }}>
                  📚 Faculty Studio
                </button>
                <button style={styles.dropdownItem} onClick={() => { setShowProfileMenu(false); navigate("/courses"); }}>
                  👁️ Course Catalog
                </button>
                <button style={styles.dropdownItem} onClick={() => { setShowProfileMenu(false); navigate("/edit-profile"); }}>
                  👤 Edit Profile
                </button>
                <hr style={{ margin: "8px 0", borderColor: "#F1F5F9" }} />
                <button style={styles.logoutBtn} onClick={() => { logout(); navigate("/"); }}>
                  🚪 Logout
                </button>
              </div>
            )}
          </div>

          <button
            style={styles.hamburgerBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div style={styles.mobileDrawer}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  style={isActive ? styles.mobileNavActive : styles.mobileNavLink}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                >
                  {item.label}
                </button>
              );
            })}
            <button
              style={styles.mobileNavLink}
              onClick={() => { navigate("/edit-profile"); setMobileMenuOpen(false); }}
            >
              👤 Edit Profile
            </button>
            <button
              style={{ ...styles.mobileNavLink, color: "#DC2626" }}
              onClick={() => { logout(); navigate("/"); }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderBottom: "1px solid rgba(226, 232, 240, 0.9)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 2px 12px rgba(15, 23, 42, 0.04)",
  },
  container: {
    width: "100%",
    maxWidth: "1600px",
    margin: "0 auto",
    padding: "14px clamp(24px, 3.5vw, 48px)",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    userSelect: "none",
  },
  logo: {
    width: "44px",
    height: "44px",
    objectFit: "contain",
  },
  brandName: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0B1F5E",
    letterSpacing: "-0.02em",
  },
  subBrand: {
    fontSize: "11px",
    color: "#64748B",
    fontWeight: "500",
  },
  branchTag: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#059669",
    backgroundColor: "#ECFDF5",
    padding: "2px 8px",
    borderRadius: "10px",
  },
  desktopNav: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  navLink: {
    border: "none",
    background: "transparent",
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#64748B",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  navActive: {
    border: "none",
    backgroundColor: "#10B981",
    color: "#FFFFFF",
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)",
  },
  rightControls: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  userMenuWrapper: {
    position: "relative",
  },
  userBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "6px 12px",
    borderRadius: "12px",
    border: "1px solid #E2E8F0",
    backgroundColor: "#FFFFFF",
    cursor: "pointer",
  },
  avatarDot: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "#10B981",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "700",
  },
  userTextWrapper: {
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
  },
  userName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#0F172A",
    lineHeight: "1.2",
  },
  userDept: {
    fontSize: "10px",
    color: "#64748B",
    fontWeight: "500",
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "44px",
    width: "220px",
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    boxShadow: "0 12px 36px rgba(15, 23, 42, 0.12)",
    border: "1px solid #E2E8F0",
    padding: "8px",
    zIndex: 200,
  },
  dropdownUser: {
    padding: "10px 12px",
    backgroundColor: "#F8FAFC",
    borderRadius: "10px",
  },
  dropdownItem: {
    width: "100%",
    padding: "10px 12px",
    border: "none",
    background: "transparent",
    textAlign: "left",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#334155",
    cursor: "pointer",
  },
  logoutBtn: {
    width: "100%",
    padding: "10px 12px",
    border: "none",
    background: "transparent",
    textAlign: "left",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#DC2626",
    cursor: "pointer",
  },
  hamburgerBtn: {
    display: "none",
    border: "1px solid #E2E8F0",
    backgroundColor: "#FFFFFF",
    borderRadius: "10px",
    padding: "8px 12px",
    fontSize: "16px",
    cursor: "pointer",
  },
  mobileDrawer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderBottom: "2px solid #E2E8F0",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    padding: "16px clamp(16px, 2.5vw, 36px)",
    zIndex: 150,
  },
  mobileNavLink: {
    width: "100%",
    padding: "10px 14px",
    border: "none",
    background: "#F8FAFC",
    textAlign: "left",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#334155",
    cursor: "pointer",
  },
  mobileNavActive: {
    width: "100%",
    padding: "10px 14px",
    border: "none",
    background: "#10B981",
    textAlign: "left",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#FFFFFF",
    cursor: "pointer",
  },
};
