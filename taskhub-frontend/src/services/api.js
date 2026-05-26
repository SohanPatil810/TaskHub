import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Create an axios instance that automatically attaches the JWT
const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const orgApi = {
  getMyOrgs: () => api.get('/organizations/my'),
  getById: (id) => api.get(`/organizations/${id}`),
  create: (data) => api.post('/organizations', data),
  getMembers: (id) => api.get(`/organizations/${id}/members`),
  addMember: (id, email) => api.post(`/organizations/${id}/members`, { email }),
  removeMember: (id, memberId) => api.delete(`/organizations/${id}/members/${memberId}`),
};

export const projectApi = {
  getByOrg: (orgId) => api.get(`/organizations/${orgId}/projects`),
  getById: (orgId, projectId) => api.get(`/organizations/${orgId}/projects/${projectId}`),
  create: (orgId, data) => api.post(`/organizations/${orgId}/projects`, data),
  update: (orgId, projectId, data) => api.put(`/organizations/${orgId}/projects/${projectId}`, data),
  delete: (orgId, projectId) => api.delete(`/organizations/${orgId}/projects/${projectId}`),
};

export const taskApi = {
  getByProject: (orgId, projectId) => api.get(`/organizations/${orgId}/projects/${projectId}/tasks`),
  getById: (orgId, projectId, taskId) => api.get(`/organizations/${orgId}/projects/${projectId}/tasks/${taskId}`),
  create: (orgId, projectId, data) => api.post(`/organizations/${orgId}/projects/${projectId}/tasks`, data),
  update: (orgId, projectId, taskId, data) => api.put(`/organizations/${orgId}/projects/${projectId}/tasks/${taskId}`, data),
  delete: (orgId, projectId, taskId) => api.delete(`/organizations/${orgId}/projects/${projectId}/tasks/${taskId}`),
};

export const commentApi = {
  getByTask: (orgId, projectId, taskId) => api.get(`/organizations/${orgId}/projects/${projectId}/tasks/${taskId}/comments`),
  create: (orgId, projectId, taskId, content) => api.post(`/organizations/${orgId}/projects/${projectId}/tasks/${taskId}/comments`, { content }),
  delete: (orgId, projectId, taskId, commentId) => api.delete(`/organizations/${orgId}/projects/${projectId}/tasks/${taskId}/comments/${commentId}`),
};

export const invitationApi = {
  invite: (orgId, email, role) => api.post(`/organizations/${orgId}/invitations`, { email, role }),
  getPending: (orgId) => api.get(`/organizations/${orgId}/invitations/pending`),
  resend: (orgId, invitationId) => api.post(`/organizations/${orgId}/invitations/${invitationId}/resend`),
  cancel: (orgId, invitationId) => api.delete(`/organizations/${orgId}/invitations/${invitationId}`),
  validateToken: (token) => api.get(`/invitations/validate?token=${token}`),
  accept: (token) => api.post(`/invitations/accept?token=${token}`),
};

export default api;
