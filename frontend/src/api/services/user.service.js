// src/api/services/user.service.js
import apiClient from '../client';

const userService = {
  // Get all users (admin only)
  getUsers: async (page = 1, limit = 10) => {
    const response = await apiClient.get('/admin/users', { params: { page, limit } });
    return response.data;
  },

  // Get user by ID
  getUserById: async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // Update user (admin only)
  updateUser: async (id, userData) => {
    const response = await apiClient.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  // Delete user (admin only)
  deleteUser: async (id) => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  },
};

export default userService;