// src/api/services/auth.service.js
import apiClient from '../client';

const authService = {
  // Register a new user
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  // Login user
login: async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  // Return the full response data
  return response.data;
},

  // Logout user
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  // Get current user profile
getProfile: async () => {
  try {
    const response = await apiClient.get('/users/profile');
    return response.data;
  } catch (error) {
    console.error('Get profile error:', error);
    // Return error response instead of throwing
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get profile'
    };
  }
},
  // Update profile
  updateProfile: async (data) => {
    const response = await apiClient.put('/users/profile', data);
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await apiClient.get(`/auth/verify-email/${token}`);
    return response.data;
  },
};

export default authService;