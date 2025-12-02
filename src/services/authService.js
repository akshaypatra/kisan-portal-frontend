import api from './api';

const authService = {
  // Login with mobile and password
  login: async (mobile, password) => {
    const response = await api.post('/api/auth/login', {
      mobile,
      password,
    });
    // Backend returns: { token, user }
    if (response.data.token && response.data.user) {
      return {
        token: response.data.token,
        user: response.data.user,
      };
    }
    throw new Error('Login failed: Invalid response from server');
  },

  // Register new user
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    // Backend returns: { token, user }
    if (response.data.token && response.data.user) {
      return {
        token: response.data.token,
        user: response.data.user,
      };
    }
    throw new Error('Registration failed: Invalid response from server');
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
