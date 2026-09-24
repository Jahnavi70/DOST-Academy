import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { canAccess, roleHome } from "./utils/roles";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import UserLandingPage from "./pages/UserLandingPage";
import DashboardPage from "./pages/DashboardPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailsPage from "./pages/CourseDetailsPage";
import AssignmentsPage from "./pages/AssignmentsPage";
import CertificatesPage from "./pages/CertificatesPage";
import EditProfilePage from "./pages/EditProfilePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ManageUsersPage from "./pages/ManageUsersPage";
import ManageCurriculumsPage from "./pages/ManageCurriculumsPage";
import ManageCoursesPage from "./pages/ManageCoursesPage";
import ManageAssignmentsPage from "./pages/ManageAssignmentsPage";
import ManageCertificatesPage from "./pages/ManageCertificatesPage";
import ProgressReportsPage from "./pages/ProgressReportsPage";
import MentorDashboardPage from "./pages/MentorDashboardPage";
import ExecutiveDashboardPage from "./pages/ExecutiveDashboardPage";
import TechAdminDashboardPage from "./pages/TechAdminDashboardPage";

function Loading() {
  return <div style={{ textAlign: "center", padding: 100 }}>Loading...</div>;
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (!canAccess(user.role, pathname)) return <Navigate to={roleHome(user.role)} replace />;
  return children;
}

function RoleRoute({ allow, children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  return allow.includes(user.role) ? children : <Navigate to={roleHome(user.role)} replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Navigate to="/login?tab=signup" replace />} />
          <Route path="/user-home" element={<RoleRoute allow={["employee"]}><UserLandingPage /></RoleRoute>} />
          <Route path="/dashboard" element={<RoleRoute allow={["employee"]}><DashboardPage /></RoleRoute>} />
          <Route path="/courses" element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />
          <Route path="/course-details" element={<ProtectedRoute><CourseDetailsPage /></ProtectedRoute>} />
          <Route path="/course-details/:id" element={<ProtectedRoute><CourseDetailsPage /></ProtectedRoute>} />
          <Route path="/assignments" element={<RoleRoute allow={["employee"]}><AssignmentsPage /></RoleRoute>} />
          <Route path="/certificates" element={<RoleRoute allow={["employee"]}><CertificatesPage /></RoleRoute>} />
          <Route path="/edit-profile" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
          
          {/* Functional Admin & Super Admin */}
          <Route path="/admin-dashboard" element={<RoleRoute allow={["admin", "admin_functional"]}><AdminDashboardPage /></RoleRoute>} />
          <Route path="/executive-dashboard" element={<RoleRoute allow={["admin", "admin_functional"]}><ExecutiveDashboardPage /></RoleRoute>} />
          <Route path="/manage-curriculums" element={<RoleRoute allow={["admin", "admin_functional"]}><ManageCurriculumsPage /></RoleRoute>} />
          <Route path="/manage-courses" element={<RoleRoute allow={["admin", "admin_functional"]}><ManageCoursesPage /></RoleRoute>} />
          <Route path="/manage-assignments" element={<RoleRoute allow={["admin", "admin_functional"]}><ManageAssignmentsPage /></RoleRoute>} />
          <Route path="/manage-certificates" element={<RoleRoute allow={["admin", "admin_functional"]}><ManageCertificatesPage /></RoleRoute>} />
          <Route path="/progress-reports" element={<RoleRoute allow={["admin", "admin_functional"]}><ProgressReportsPage /></RoleRoute>} />

          {/* Technical IT Admin & Super Admin */}
          <Route path="/it-dashboard" element={<RoleRoute allow={["admin", "admin_technical"]}><TechAdminDashboardPage /></RoleRoute>} />
          <Route path="/manage-users" element={<RoleRoute allow={["admin", "admin_technical"]}><ManageUsersPage /></RoleRoute>} />

          {/* Mentor */}
          <Route path="/mentor-dashboard" element={<RoleRoute allow={["mentor"]}><MentorDashboardPage /></RoleRoute>} />
          <Route path="*" element={<ProtectedRoute><Navigate to="/" replace /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
