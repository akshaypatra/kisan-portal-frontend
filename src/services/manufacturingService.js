import api from './api';

const manufacturingService = {
  // Facilities
  getFacilities: () => api.get('/api/manufacturing/facilities'),

  createFacility: (data) => api.post('/api/manufacturing/facilities', data),

  // Procurement Board - Available seeds in storage within radius
  getProcurementBoard: (facilityId) =>
    api.get(`/api/manufacturing/facilities/${facilityId}/procurement-board`),

  // Incoming Goods - In transit to factory
  getIncomingGoods: (facilityId) =>
    api.get(`/api/manufacturing/facilities/${facilityId}/incoming-goods`),

  // Factory Inventory
  getInventory: (facilityId) =>
    api.get(`/api/manufacturing/facilities/${facilityId}/inventory`),

  // Production Logs
  createProductionLog: (facilityId, data) =>
    api.post(`/api/manufacturing/facilities/${facilityId}/production`, data),

  getProductionStats: (facilityId, period = 'weekly') =>
    api.get(`/api/manufacturing/facilities/${facilityId}/production/stats`, { params: { period } }),

  // Procurement Orders
  createProcurementOrder: (facilityId, data) =>
    api.post(`/api/manufacturing/facilities/${facilityId}/procurement`, data),

  // Intake - Receive goods at factory
  receiveIntake: (bookingId) =>
    api.post('/api/manufacturing/intake/receive', null, { params: { booking_id: bookingId } }),
};

export default manufacturingService;
