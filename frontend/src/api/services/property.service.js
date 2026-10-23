// src/api/services/property.service.js
import apiClient from '../client';

const propertyService = {
  // Get all properties with filters
  getProperties: async (filters = {}, page = 1, limit = 10) => {
    const params = { ...filters, page, limit };
    const response = await apiClient.get('/properties', { params });
    return response.data;
  },

  // Get a single property by ID
  getPropertyById: async (id) => {
    const response = await apiClient.get(`/properties/${id}`);
    return response.data;
  },

  // Create a new property
  createProperty: async (propertyData) => {
    const response = await apiClient.post('/properties', propertyData);
    return response.data;
  },

  // Update a property
  updateProperty: async (id, propertyData) => {
    const response = await apiClient.put(`/properties/${id}`, propertyData);
    return response.data;
  },

  // Delete a property
  deleteProperty: async (id) => {
    const response = await apiClient.delete(`/properties/${id}`);
    return response.data;
  },

  // Get featured properties
  getFeatured: async () => {
    const response = await apiClient.get('/properties/featured');
    return response.data;
  },

  // Search properties
  searchProperties: async (query) => {
    const response = await apiClient.get('/properties/search', { params: { q: query } });
    return response.data;
  },

  // Save property to favorites
  saveFavorite: async (propertyId) => {
    const response = await apiClient.post(`/properties/${propertyId}/favorite`);
    return response.data;
  },

  // Remove property from favorites
  removeFavorite: async (propertyId) => {
    const response = await apiClient.delete(`/properties/${propertyId}/favorite`);
    return response.data;
  },

  // Get user's saved properties
  getFavorites: async () => {
    const response = await apiClient.get('/properties/favorites');
    return response.data;
  },

  // Track property view
  trackView: async (propertyId) => {
    const response = await apiClient.post(`/properties/${propertyId}/view`);
    return response.data;
  },
};

export default propertyService;