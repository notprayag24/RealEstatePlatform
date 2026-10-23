// src/routes/property.routes.js - Property Routes
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  getFeaturedProperties,
  toggleFavorite,
  getFavorites,
  getFavoriteStatus,
} = require('../controllers/property.controller');

// =============================================
// PUBLIC ROUTES
// =============================================
router.get('/', getProperties);
router.get('/featured', getFeaturedProperties);

// =============================================
// PROTECTED ROUTES (Specific routes first)
// =============================================
router.get('/favorites', protect, getFavorites);
router.post('/', protect, createProperty);
router.put('/:id', protect, updateProperty);
router.delete('/:id', protect, deleteProperty);
router.post('/:id/favorite', protect, toggleFavorite);
router.get('/:id/favorite-status', protect, getFavoriteStatus);

// =============================================
// DYNAMIC ROUTE (MUST COME LAST)
// =============================================
router.get('/:id', getProperty);

module.exports = router;