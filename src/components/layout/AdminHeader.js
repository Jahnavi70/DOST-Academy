import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { functionalAdminNavItems, technicalAdminNavItems, adminNavItems } from "../../utils/roles";
import dostLogo from "../../assets/dost-logo.png";

/**
 * Unified Responsive AdminHeader for DOST Academy LMS.
 * Adheres to Apple Human Interface Guidelines and modern Enterprise SaaS standards.
 * Supports fluid widescreen displays, 1-click workspace switching, and mobile drawer.
 */
export default function AdminHeader({ activePortal = "functional" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isSuperAdmin = user?.role === "admin";
  const isTechnicalMode = activePortal === "technical" || location.pathname.startsWith("/it-dashboard");

  // Determine navigation items
  let navLinks = [];
  if (isSuperAdmin) {
    navLinks = adminNavItems();
  } else if (isTechnicalMode) {
    navLinks = technicalAdminNavItems();
  } else {
    navLinks = functionalAdminNavItems();
  }

  const handleSwitchMode = (mode) => {
    if (mode === "technical") {
      navigate("/it-dashboard");
    } else {
      navigate("/executive-dashboard");
    }
  };

  const getRoleBadge = () => {
    if (user?.role === "admin") return { label: "Super Admin", bg: "#0B1F5E", text: "#FFFFFF" };
    if (user?.role === "admin_functional") return { label: "Functional (HR)", bg: "#EEF2FF", text: "#2563EB" };
    if (user?.role === "admin_technical") return { label: "Technical (IT)", bg: "#0F172A", text: "#38BDF8" };
    return { label: "Staff", bg: "#E2E8F0", text: "#475569" };
  };

  const badge = getRoleBadge();

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        {/* Top Row: Brand, Workspace Switcher, Profile, Hamburger */}
        <div style={styles.topRow}>
          {/* Brand */}
          <div
            style={styles.brand}
            onClick={() => navigate(isTechnicalMode ? "/it-dashboard" : "/executive-dashboard")}
          >
            <img src={dostLogo} alt="DOST Logo" style={styles.logo} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span style={styles.brandName}>DOST Academy</span>
                <span style={{ ...styles.portalBadge, backgroundColor: badge.bg, color: badge.text }}>
                  {badge.label}
                </span>
              </div>
              <span style={styles.subBrand}>Department of Science and Technology</span>
            </div>
          </div>

          {/* Center Actions: Super-Admin 1-Click Workspace Switcher */}
          <div style={styles.centerActions}>
            {isSuperAdmin && (
              <div style={styles.switcher}>
                <button
                  style={!isTechnicalMode ? styles.switchBtnActive : styles.switchBtn}
                  onClick={() => handleSwitchMode("functional")}
                  title="Switch to Executive Governance & Course Management"
                >
                  🏛️ Functional HR
                </button>
                <button
                  style={isTechnicalMode ? styles.switchBtnActiveTech : styles.switchBtn}
                  onClick={() => handleSwitchMode("technical")}
                  title="Switch to IT Telemetry, User Roles & System Diagnostics"
                >
                  ⚙️ Technical IT
                </button>
              </div>
            )}
            <button
              style={styles.learnerCatalogBtn}
              onClick={() => navigate("/courses")}
              title="Preview Course Catalog as Trainee / Employee"
            >
              👁️ Course Catalog
            </button>
          </div>

          {/* Right Controls: User Profile & Mobile Toggle */}
          <div style={styles.rightControls}>
            <div style={styles.userMenuWrapper}>
              <button
                style={styles.userBtn}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div style={styles.avatarDot}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div style={styles.userTextWrapper}>
                  <span style={styles.userName}>{user?.name || "Administrator"}</span>
                  <span style={styles.userRole}>{badge.label}</span>
                </div>
                <span style={{ fontSize: "11px", color: "#64748B" }}>▾</span>
              </button>

              {showProfileMenu && (
                <div style={styles.dropdown}>
                  <div style={styles.dropdownUser}>
                    <strong>{user?.name}</strong>
                    <div style={{ color: "#64748B", fontSize: "12px", marginTop: "2px" }}>{user?.email}</div>
                    <div style={{ marginTop: "6px" }}>
                      <span style={{ ...styles.portalBadge, backgroundColor: badge.bg, color: badge.text }}>
                        {badge.label}
                      </span>
                    </div>
                  </div>
                  <hr style={{ margin: "8px 0", borderColor: "#F1F5F9" }} />
                  <button style={styles.dropdownItem} onClick={() => { setShowProfileMenu(false); navigate("/admin-dashboard"); }}>
                    📊 Master Admin Dashboard
                  </button>
                  <button style={styles.dropdownItem} onClick={() => { setShowProfileMenu(false); navigate("/executive-dashboard"); }}>
                    🏛️ Executive Analytics
                  </button>
                  <button style={styles.dropdownItem} onClick={() => { setShowProfileMenu(false); navigate("/it-dashboard"); }}>
                    ⚙️ IT Diagnostics
                  </button>
                  <button style={styles.dropdownItem} onClick={() => { setShowProfileMenu(false); navigate("/courses"); }}>
                    👁️ Trainee Course Catalog
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

            {/* Mobile Hamburger Button */}
            <button
              style={styles.hamburgerBtn}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Horizontal Scroll / Auto-Fit) */}
        <nav style={styles.navRow}>
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

        {/* Mobile Slide-Out Drawer */}
        {mobileMenuOpen && (
          <div style={styles.mobileDrawer}>
            <div style={styles.mobileHeader}>
              <span style={{ fontWeight: 700, color: "#0B1F5E" }}>Admin Navigation</span>
              <button style={styles.closeBtn} onClick={() => setMobileMenuOpen(false)}>✕</button>
            </div>
            {isSuperAdmin && (
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                <button
                  style={{ ...styles.switchBtn, flex: 1, padding: "8px" }}
                  onClick={() => { handleSwitchMode("functional"); setMobileMenuOpen(false); }}
                >
                  🏛️ Functional
                </button>
                <button
                  style={{ ...styles.switchBtn, flex: 1, padding: "8px" }}
                  onClick={() => { handleSwitchMode("technical"); setMobileMenuOpen(false); }}
                >
                  ⚙️ Technical IT
                </button>
              </div>
            )}
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
                onClick={() => { navigate("/courses"); setMobileMenuOpen(false); }}
              >
                👁️ View Trainee Catalog
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
      </div>
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
    padding: "12px clamp(24px, 3.5vw, 48px) 0 clamp(24px, 3.5vw, 48px)",
    boxSizing: "border-box",
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    paddingBottom: "10px",
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
    display: "block",
  },
  portalBadge: {
    fontSize: "11px",
    fontWeight: "700",
    padding: "3px 8px",
    borderRadius: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
  centerActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  switcher: {
    display: "flex",
    backgroundColor: "#F1F5F9",
    padding: "3px",
    borderRadius: "12px",
    border: "1px solid #E2E8F0",
  },
  switchBtn: {
    border: "none",
    background: "transparent",
    padding: "6px 14px",
    borderRadius: "9px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  switchBtnActive: {
    border: "none",
    backgroundColor: "#0B1F5E",
    color: "#FFFFFF",
    padding: "6px 14px",
    borderRadius: "9px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(11, 31, 94, 0.2)",
  },
  switchBtnActiveTech: {
    border: "none",
    backgroundColor: "#0284C7",
    color: "#FFFFFF",
    padding: "6px 14px",
    borderRadius: "9px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(2, 132, 199, 0.2)",
  },
  learnerCatalogBtn: {
    border: "1px solid #CBD5E1",
    backgroundColor: "#FFFFFF",
    color: "#0B1F5E",
    padding: "6px 14px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    transition: "background 0.15s",
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
    transition: "all 0.15s ease",
  },
  avatarDot: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "#0B1F5E",
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
  userRole: {
    fontSize: "10px",
    color: "#64748B",
    fontWeight: "500",
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "44px",
    width: "240px",
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
    transition: "background 0.15s",
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
  navRow: {
    display: "flex",
    gap: "6px",
    overflowX: "auto",
    paddingBottom: "8px",
    scrollbarWidth: "none",
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
    whiteSpace: "nowrap",
    transition: "all 0.15s ease",
  },
  navActive: {
    border: "none",
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
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
  mobileHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  closeBtn: {
    border: "none",
    background: "transparent",
    fontSize: "18px",
    cursor: "pointer",
    color: "#64748B",
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
    background: "#2563EB",
    textAlign: "left",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#FFFFFF",
    cursor: "pointer",
  },
};
