import api from './api';

const transportService = {
  listVehicles: (scope = 'mine') => api.get('/api/transport/vehicles', { params: { scope } }),
  createVehicle: (payload) => api.post('/api/transport/vehicles', payload),
  createBooking: (payload) => api.post('/api/transport/bookings', payload),
  listBookings: () => api.get('/api/transport/bookings'),
  acceptBooking: (bookingId, vehicleId) =>
    api.post(`/api/transport/bookings/${bookingId}/accept`, null, { params: vehicleId ? { vehicle_id: vehicleId } : {} }),
};

export default transportService;
