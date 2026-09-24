import React from "react";
import { useAuth } from "../../context/AuthContext";
import AdminHeader from "./AdminHeader";
import MentorHeader from "./MentorHeader";
import LearnerHeader from "./LearnerHeader";

/**
 * Universal Adaptive Header for shared pages.
 * Resolves the authenticated user's role and renders the corresponding responsive header.
 */
export default function AppHeader({ activePortal = "functional", assignedBranch = null }) {
  const { user } = useAuth();
  const role = user?.role || "employee";

  if (role === "admin" || role === "admin_functional" || role === "admin_technical") {
    return <AdminHeader activePortal={activePortal} />;
  }

  if (role === "mentor") {
    return <MentorHeader assignedBranch={assignedBranch} />;
  }

  return <LearnerHeader />;
}
