import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interaction API
export const interactionApi = {
  getAll: (hcpId = null) => {
    const params = hcpId ? { hcp_id: hcpId } : {};
    return api.get('/interactions', { params });
  },
  getById: (id) => api.get(`/interactions/${id}`),
  create: (data) => api.post('/interactions', data),
  update: (id, data) => api.put(`/interactions/${id}`, data),
  delete: (id) => api.delete(`/interactions/${id}`),
  // AI form assistants
  summarize: (payload) => api.post('/interactions/ai/summarize', payload),
  suggestFollowUps: (payload) => api.post('/interactions/ai/suggest-follow-ups', payload),
};

// HCP API
export const hcpApi = {
  getAll: (search = '') => {
    const params = search ? { search } : {};
    return api.get('/hcps', { params });
  },
  getById: (id) => api.get(`/hcps/${id}`),
  create: (data) => api.post('/hcps', data),
  update: (id, data) => api.put(`/hcps/${id}`, data),
  delete: (id) => api.delete(`/hcps/${id}`),
};

export default api;
