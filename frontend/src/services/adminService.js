import api from './api';

export const adminService = {
  // Authentication
  login: async (credentials) => {
    const response = await api.post('/api/admin/login', credentials);
    return response.data;
  },

  // Submissions
  getSubmissions: async (params = {}) => {
    const response = await api.get('/api/admin/submissions', { params });
    return response.data;
  },

  getSubmissionById: async (id) => {
    const response = await api.get(`/api/admin/submissions/${id}`);
    return response.data;
  },

  approveSubmission: async (id) => {
    const response = await api.post(`/api/admin/submissions/${id}/approve`);
    return response.data;
  },

  rejectSubmission: async (id, reason) => {
    const response = await api.post(`/api/admin/submissions/${id}/reject`, { reason });
    return response.data;
  },
};