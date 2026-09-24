/**
 * DOST Academy LMS - Apple HIG & Enterprise Design System Tokens
 * Standardizes typography, fluid layout containers, elevation, and DOST brand palette.
 */

export const colors = {
  navy: "#0B1F5E",
  navyDark: "#07143D",
  blue: "#2563EB",
  blueLight: "#3B82F6",
  blueSoft: "#EFF6FF",
  cyan: "#0284C7",
  emerald: "#10B981",
  emeraldSoft: "#ECFDF5",
  amber: "#F59E0B",
  amberSoft: "#FFFBEB",
  rose: "#EF4444",
  roseSoft: "#FEF2F2",
  slate900: "#0F172A",
  slate800: "#1E293B",
  slate700: "#334155",
  slate600: "#475569",
  slate500: "#64748B",
  slate400: "#94A3B8",
  slate300: "#CBD5E1",
  slate200: "#E2E8F0",
  slate100: "#F1F5F9",
  slate50: "#F8FAFC",
  white: "#FFFFFF",
};

export const typography = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  codeFont: '"SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
};

export const layout = {
  // Fluid widescreen container utilizing display real estate with optimal reading margins
  container: {
    width: "100%",
    maxWidth: "1600px",
    margin: "0 auto",
    padding: "clamp(24px, 3.5vw, 48px)",
    boxSizing: "border-box",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
    transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
    boxSizing: "border-box",
  },
  glassHeader: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
    position: "sticky",
    top: 0,
    zIndex: 90,
  },
};

export const shadows = {
  sm: "0 1px 3px rgba(0, 0, 0, 0.05)",
  md: "0 4px 12px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 25px -3px rgba(15, 23, 42, 0.08)",
  xl: "0 20px 35px -4px rgba(15, 23, 42, 0.12)",
};
