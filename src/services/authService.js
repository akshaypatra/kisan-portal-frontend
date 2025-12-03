import api from './api';

const authService = {
  // Login with mobile and password
  login: async (mobile, password) => {
    const { data } = await api.post('/api/auth/login', {
      mobile,
      password,
    });

    if (data?.token && data?.user) {
      return data;
    }

    throw new Error(data?.detail || data?.message || 'Login failed');
  },

  // Register new user
  register: async (userData) => {
    const { data } = await api.post('/api/auth/register', userData);

    if (data?.token && data?.user) {
      return data;
    }

    throw new Error(data?.detail || data?.message || 'Registration failed');
  },

  // Get current user info
  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  // Logout - clear local storage
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  },

  // Get stored user from localStorage
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },
};

export default authService;
