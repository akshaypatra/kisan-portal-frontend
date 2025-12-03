import axios from 'axios';
import CONFIG from '../config';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response && error.response.status === 401) {
      // Clear storage and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const seedAPI = {
  listBreeds: () => api.get('/api/seed/breeds'),
  createBreed: (payload) => api.post('/api/seed/breeds', payload),
  listBatches: () => api.get('/api/seed/batches'),
  createBatch: (payload) => api.post('/api/seed/batches', payload),
};

export const plotsAPI = {
  uploadPhoto: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/plots/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getPublicDetails: (plotId) => api.get(`/api/plots/public/${plotId}`),
};

export default api;
