import api from './api';

const storageService = {
  listFacilities: () => api.get('/api/storage/facilities'),
  createFacility: (payload) => api.post('/api/storage/facilities', payload),
};

export default storageService;

