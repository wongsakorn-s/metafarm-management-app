import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE_URL = `${BASE_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const hiveService = {
  getAll: () => api.get('/hives'),
  getById: (id: string) => api.get(`/hives/${id}`),
  create: (data: any) => api.post('/hives', data),
  update: (id: string, data: any) => api.put(`/hives/${id}`, data),
  delete: (id: string) => api.delete(`/hives/${id}`),
};

export const harvestService = {
  getAll: () => api.get('/harvests'),
  getByHive: (hiveId: number) => api.get(`/harvests/hive/${hiveId}`),
  create: (hiveId: number, data: any) => api.post(`/harvests/?hive_id_int=${hiveId}`, data),
};

export const inspectionService = {
  getByHive: (hiveId: number) => api.get(`/inspections/hive/${hiveId}`),
  create: (formData: FormData) => api.post('/inspections/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
};

export const weatherService = {
  getCurrent: () => api.get('/weather/current'),
  getHistory: (limit: number = 10) => api.get(`/weather/history?limit=${limit}`),
};

export default api;