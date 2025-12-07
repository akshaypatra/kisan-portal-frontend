import api from './api';

const driverService = {
  login: (contact_number, password) =>
    api.post('/api/transport/driver/login', { contact_number, password }),
  schedule: (contact_number, password) =>
    api.get('/api/transport/driver/schedule', { params: { contact_number, password } }),
  startBooking: (bookingId, contact_number, password) =>
    api.post(`/api/transport/driver/bookings/${bookingId}/start`, null, {
      params: { contact_number, password },
    }),
  completeTrip: (bookingId, contact_number, password, lat, lng) =>
    api.post(
      `/api/transport/driver/bookings/${bookingId}/complete`,
      { lat, lng },
      { params: { contact_number, password } }
    ),
};

export default driverService;
