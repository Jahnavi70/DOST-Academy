import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = (error.config && error.config.url) || "";
    const isAuthAttempt = url.includes("/auth/login") || url.includes("/auth/register");
    if (error.response?.status === 401 && !isAuthAttempt) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!["/", "/login", "/signup"].includes(window.location.pathname)) {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  logout: () => api.post('/auth/logout'),
};

export const curriculumAPI = {
  getAll: (params) => api.get('/curriculums', { params }),
  getOne: (id) => api.get(`/curriculums/${id}`),
  create: (data) => api.post('/curriculums', data),
  update: (id, data) => api.put(`/curriculums/${id}`, data),
  delete: (id) => api.delete(`/curriculums/${id}`),
};

export const courseAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getOne: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  approve: (id) => api.put(`/courses/${id}/approve`),
  toggleStatus: (id) => api.put(`/courses/${id}/toggle-status`),
};

export const courseContentAPI = {
  getByCourse: (courseId) => api.get(`/courses/${courseId}/contents`),
  create: (courseId, data) => api.post(`/courses/${courseId}/contents`, data),
  update: (id, data) => api.put(`/course-contents/${id}`, data),
  delete: (id) => api.delete(`/course-contents/${id}`),
  complete: (id) => api.post(`/course-contents/${id}/complete`),
};

export const enrollmentAPI = {
  enroll: (data) => api.post('/enroll', data),
  getAll: () => api.get('/enrollments'),
  userEnrollments: () => api.get('/enrollments/user'),
  updateStatus: (id, data) => api.put(`/enrollments/${id}/status`, data),
};

export const progressAPI = {
  getAll: () => api.get('/progress'),
  update: (courseId, data) => api.put(`/progress/${courseId}`, data),
  dashboard: () => api.get('/progress/dashboard'),
};

export const skillAPI = {
  getAll: () => api.get('/skills'),
  userSkills: () => api.get('/skills/user'),
  updateProgress: (skillId, data) => api.put(`/skills/${skillId}/progress`, data),
};

export const recommendationAPI = {
  get: () => api.get('/recommendations'),
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  unreadCount: () => api.get('/notifications/unread'),
};

export const assignmentAPI = {
  getAll: (params) => api.get('/assignments', { params }),
  getOne: (id) => api.get(`/assignments/${id}`),
  create: (data) => api.post('/assignments', data),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  delete: (id) => api.delete(`/assignments/${id}`),
  submit: (id) => api.put(`/assignments/${id}/submit`),
};

export const certificateAPI = {
  getAll: () => api.get('/certificates'),
  getOne: (id) => api.get(`/certificates/${id}`),
  generate: (data) => api.post('/certificates', data),
  delete: (id) => api.delete(`/certificates/${id}`),
  verify: (certNo) => api.get(`/certificates/verify/${certNo}`),
};

export const submissionAPI = {
  getAll: () => api.get('/submissions'),
  userSubmissions: () => api.get('/submissions/user'),
  create: (data) => {
    if (data instanceof FormData) {
      return api.post('/submissions', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return api.post('/submissions', data);
  },
  adminIndex: () => api.get('/admin/submissions'),
  grade: (id, data) => api.put(`/submissions/${id}/grade`, data),
};

export const mentorAPI = {
  dashboard: () => api.get('/mentor/dashboard'),
  courses: () => api.get('/mentor/courses'),
  createCourse: (data) => api.post('/mentor/courses', data),
  updateCourse: (id, data) => api.put(`/mentor/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/mentor/courses/${id}`),
  createContent: (data) => api.post('/mentor/course-contents', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteContent: (id) => api.delete(`/mentor/course-contents/${id}`),
  createAssignment: (data) => api.post('/mentor/assignments', data),
  deleteAssignment: (id) => api.delete(`/mentor/assignments/${id}`),
  enrollments: () => api.get('/mentor/enrollments'),
  approveEnrollment: (id) => api.put(`/mentor/enrollments/${id}/approve`),
  rejectEnrollment: (id) => api.put(`/mentor/enrollments/${id}/reject`),
  submissions: () => api.get('/mentor/submissions'),
  grade: (id, data) => api.put(`/mentor/submissions/${id}/grade`, data),
};

export const adminAPI = {
  dashboard: () => api.get('/admin/dashboard'),
  users: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  approveUser: (id) => api.put(`/admin/users/${id}/approve`),
  rejectUser: (id) => api.put(`/admin/users/${id}/reject`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  allProgress: () => api.get('/admin/progress'),
  getRoles: () => api.get('/admin/roles'),
};

export const executiveAnalyticsAPI = {
  getAnalytics: (params) => api.get('/analytics/executive', { params }),
};

export const systemHealthAPI = {
  getHealth: () => api.get('/admin/system-health'),
  flushCache: () => api.post('/admin/cache-flush'),
};

export default api;

