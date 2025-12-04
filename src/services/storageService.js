import api from './api';

const storageService = {
  listFacilities: () => api.get('/api/storage/facilities'),
  createFacility: (payload) => api.post('/api/storage/facilities', payload),
  intakeLookup: (payload) => api.post('/api/transport/storage/intake/lookup', payload),
  intakeReceive: (payload) => api.post('/api/transport/storage/intake/receive', payload),
};

export default storageService;

