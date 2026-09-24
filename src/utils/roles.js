export const ROLE_HOME = {
  admin: "/admin-dashboard",
  admin_functional: "/executive-dashboard",
  admin_technical: "/it-dashboard",
  mentor: "/mentor-dashboard",
  employee: "/user-home",
};

export const EMPLOYEE_ROUTES = ["/user-home", "/dashboard", "/assignments", "/certificates"];
export const MENTOR_ROUTES = ["/mentor-dashboard"];

export const FUNCTIONAL_ADMIN_ROUTES = [
  "/admin-dashboard",
  "/executive-dashboard",
  "/manage-curriculums",
  "/manage-courses",
  "/manage-assignments",
  "/manage-certificates",
  "/progress-reports",
];

export const TECHNICAL_ADMIN_ROUTES = [
  "/it-dashboard",
  "/manage-users",
];

export const ADMIN_ROUTES = [
  "/admin-dashboard",
  "/executive-dashboard",
  "/it-dashboard",
  "/manage-users",
  "/manage-curriculums",
  "/manage-courses",
  "/manage-assignments",
  "/manage-certificates",
  "/progress-reports",
];

export const SHARED_ROUTES = ["/courses", "/course-details", "/edit-profile"];

export function roleHome(role) {
  return ROLE_HOME[role] || "/";
}

export function canAccess(role, path) {
  if (!role) return false;
  const base = path.split("?")[0].split("#")[0];
  const isPrefixed = (p) => base === p || base.startsWith(`${p}/`);

  if (role === "admin") {
    return ADMIN_ROUTES.some(isPrefixed) || SHARED_ROUTES.some(isPrefixed);
  }
  if (role === "admin_functional") {
    return FUNCTIONAL_ADMIN_ROUTES.some(isPrefixed) || SHARED_ROUTES.some(isPrefixed);
  }
  if (role === "admin_technical") {
    return TECHNICAL_ADMIN_ROUTES.some(isPrefixed) || SHARED_ROUTES.some(isPrefixed);
  }
  if (role === "mentor") {
    return MENTOR_ROUTES.some(isPrefixed) || SHARED_ROUTES.some(isPrefixed);
  }
  return EMPLOYEE_ROUTES.some(isPrefixed) || SHARED_ROUTES.some(isPrefixed);
}

export function employeeNavItems() {
  return [
    { label: "Home", path: "/user-home" },
    { label: "Dashboard", path: "/dashboard" },
    { label: "Courses", path: "/courses" },
    { label: "Assignments", path: "/assignments" },
    { label: "Certificates", path: "/certificates" },
    { label: "Edit Profile", path: "/edit-profile" },
  ];
}

export function mentorNavItems() {
  return [
    { label: "Mentor Dashboard", path: "/mentor-dashboard" },
    { label: "Course Catalog", path: "/courses" },
    { label: "Edit Profile", path: "/edit-profile" },
  ];
}

export function adminNavItems() {
  return [
    { label: "Dashboard", path: "/admin-dashboard" },
    { label: "Executive Analytics", path: "/executive-dashboard" },
    { label: "IT Diagnostics", path: "/it-dashboard" },
    { label: "Users", path: "/manage-users" },
    { label: "Branches", path: "/manage-curriculums" },
    { label: "Courses", path: "/manage-courses" },
    { label: "Assignments", path: "/manage-assignments" },
    { label: "Certificates", path: "/manage-certificates" },
    { label: "Progress", path: "/progress-reports" },
  ];
}

export function functionalAdminNavItems() {
  return [
    { label: "Executive Analytics", path: "/executive-dashboard" },
    { label: "Branches", path: "/manage-curriculums" },
    { label: "Courses", path: "/manage-courses" },
    { label: "Assessments", path: "/manage-assignments" },
    { label: "Certificates", path: "/manage-certificates" },
    { label: "Progress", path: "/progress-reports" },
  ];
}

export function technicalAdminNavItems() {
  return [
    { label: "IT Diagnostics", path: "/it-dashboard" },
    { label: "Users & Roles", path: "/manage-users" },
  ];
}

export function navItemsFor(role) {
  if (role === "admin_functional") return functionalAdminNavItems();
  if (role === "admin_technical") return technicalAdminNavItems();
  if (role === "admin") return adminNavItems();
  if (role === "mentor") return mentorNavItems();
  return employeeNavItems();
}
