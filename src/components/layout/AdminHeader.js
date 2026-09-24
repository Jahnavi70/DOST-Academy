import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { functionalAdminNavItems, technicalAdminNavItems } from "../../utils/roles";
import dostLogo from "../../assets/dost-logo.png";

/**
 * Unified Header for DOST Academy LMS Administration.
 * Features 1-click mode switching for Super-Admins between Functional (HR) and Technical (IT) workspaces.
 */
export default function AdminHeader({ activePortal = "functional" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isSuperAdmin = user?.role === "admin";
  const isTechnicalMode = activePortal === "technical" || location.pathname.startsWith("/it-dashboard");

  // Determine navigation items
  let navLinks = [];
  if (isTechnicalMode) {
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
    if (user?.role === "admin") return { label: "Super Administrator", bg: "#0B1F5E", text: "#FFFFFF" };
    if (user?.role === "admin_functional") return { label: "Admin - Functional (HR)", bg: "#EEF2FF", text: "#2563EB" };
    if (user?.role === "admin_technical") return { label: "Admin - Technical (IT)", bg: "#0F172A", text: "#38BDF8" };
    return { label: "Staff", bg: "#E2E8F0", text: "#475569" };
  };

  const badge = getRoleBadge();

  return (
    <header style={{
      ...styles.header,
      borderBottom: isTechnicalMode ? "2px solid #0284C7" : "1px solid #E2E8F0"
    }}>
      <div style={styles.topBar}>
        {/* Brand */}
        <div style={styles.brand} onClick={() => navigate(isTechnicalMode ? "/it-dashboard" : "/executive-dashboard")}>
          <img src={dostLogo} alt="DOST Logo" style={styles.logo} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={styles.brandName}>DOST Academy</span>
              <span style={{ ...styles.portalBadge, backgroundColor: badge.bg, color: badge.text }}>
                {isTechnicalMode ? "⚙️ IT Operations" : "🏛️ Executive Governance"}
              </span>
            </div>
            <span style={styles.subBrand}>Department of Science and Technology</span>
          </div>
        </div>

        {/* Super-Admin Workspace Switcher */}
        {isSuperAdmin && (
          <div style={styles.switcher}>
            <button
              style={!isTechnicalMode ? styles.switchBtnActive : styles.switchBtnInactive}
              onClick={() => handleSwitchMode("functional")}
            >
              🏢 Functional Admin
            </button>
            <button
              style={isTechnicalMode ? styles.switchBtnActiveTech : styles.switchBtnInactive}
              onClick={() => handleSwitchMode("technical")}
            >
              ⚙️ Technical IT
            </button>
          </div>
        )}

        {/* User Profile */}
        <div style={styles.userMenuWrapper}>
          <button
            style={styles.userBtn}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <span style={styles.avatarDot} />
            <span style={styles.userName}>{user?.name || "Administrator"}</span>
            <span style={{ fontSize: "11px" }}>▾</span>
          </button>

          {showProfileMenu && (
            <div style={styles.dropdown}>
              <div style={styles.dropdownUser}>
                <strong>{user?.name}</strong>
                <small style={{ color: "#64748B" }}>{user?.email}</small>
                <div style={{ marginTop: "6px" }}>
                  <span style={{ ...styles.portalBadge, backgroundColor: badge.bg, color: badge.text }}>
                    {badge.label}
                  </span>
                </div>
              </div>
              <hr style={{ margin: "8px 0", borderColor: "#F1F5F9" }} />
              <button style={styles.dropdownItem} onClick={() => navigate("/edit-profile")}>
                👤 Edit Profile
              </button>
              {isSuperAdmin && (
                <button
                  style={styles.dropdownItem}
                  onClick={() => handleSwitchMode(isTechnicalMode ? "functional" : "technical")}
                >
                  🔄 Switch to {isTechnicalMode ? "Functional HR" : "IT Technical"}
                </button>
              )}
              <hr style={{ margin: "8px 0", borderColor: "#F1F5F9" }} />
              <button style={styles.logoutBtn} onClick={() => { logout(); navigate("/"); }}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav style={styles.navRow}>
        {navLinks.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              style={isActive ? (isTechnicalMode ? styles.navActiveTech : styles.navActive) : styles.navLink}
              onClick={() => navigate(item.path)}
            >
              <span style={{ marginRight: "6px" }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: "#FFFFFF",
    padding: "12px 28px 0 28px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
    position: "sticky",
    top: 0,
    zIndex: 90,
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: "12px",
    flexWrap: "wrap",
    gap: "14px",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
  },
  logo: {
    width: "42px",
    height: "auto",
  },
  brandName: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#0B1F5E",
  },
  subBrand: {
    fontSize: "11px",
    color: "#64748B",
    display: "block",
  },
  portalBadge: {
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "700",
  },
  switcher: {
    display: "flex",
    backgroundColor: "#F1F5F9",
    borderRadius: "24px",
    padding: "3px",
    border: "1px solid #E2E8F0",
  },
  switchBtnActive: {
    backgroundColor: "#0B1F5E",
    color: "#FFFFFF",
    border: "none",
    padding: "6px 14px",
    borderRadius: "20px",
    fontWeight: "700",
    fontSize: "12px",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(11, 31, 94, 0.2)",
  },
  switchBtnActiveTech: {
    backgroundColor: "#0F172A",
    color: "#38BDF8",
    border: "none",
    padding: "6px 14px",
    borderRadius: "20px",
    fontWeight: "700",
    fontSize: "12px",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(15, 23, 42, 0.3)",
  },
  switchBtnInactive: {
    backgroundColor: "transparent",
    color: "#64748B",
    border: "none",
    padding: "6px 14px",
    borderRadius: "20px",
    fontWeight: "600",
    fontSize: "12px",
    cursor: "pointer",
  },
  userMenuWrapper: {
    position: "relative",
  },
  userBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#F8FAFC",
    border: "1px solid #E2E8F0",
    padding: "7px 14px",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
    color: "#0B1F5E",
  },
  avatarDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#10B981",
  },
  userName: {
    maxWidth: "140px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "42px",
    width: "230px",
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
    border: "1px solid #E2E8F0",
    padding: "10px",
    zIndex: 100,
  },
  dropdownUser: {
    padding: "6px 8px",
    display: "flex",
    flexDirection: "column",
  },
  dropdownItem: {
    width: "100%",
    textAlign: "left",
    background: "none",
    border: "none",
    padding: "8px 10px",
    color: "#0B1F5E",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12.5px",
  },
  logoutBtn: {
    width: "100%",
    textAlign: "left",
    background: "none",
    border: "none",
    padding: "8px 10px",
    color: "#DC2626",
    fontWeight: "700",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12.5px",
  },
  navRow: {
    display: "flex",
    gap: "6px",
    overflowX: "auto",
    paddingBottom: "10px",
  },
  navLink: {
    backgroundColor: "transparent",
    color: "#64748B",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },
  navActive: {
    backgroundColor: "#EEF2FF",
    color: "#2563EB",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },
  navActiveTech: {
    backgroundColor: "#0F172A",
    color: "#38BDF8",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },
};
