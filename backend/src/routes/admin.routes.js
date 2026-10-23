// src/routes/admin.routes.js - Admin Routes
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const User = require('../models/User.model');
const Property = require('../models/Property.model');

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private (Admin)
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    });
  }
});

// @desc    Get all properties (Admin only)
// @route   GET /api/admin/properties
// @access  Private (Admin)
router.get('/properties', protect, authorize('admin'), async (req, res) => {
  try {
    const properties = await Property.find()
      .populate('sellerId', 'firstName lastName email')
      .populate('agentId', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: properties,
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching properties',
      error: error.message,
    });
  }
});

// @desc    Update user (Admin only)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
router.put('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { role, isActive, firstName, lastName, email } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message,
    });
  }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    await user.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message,
    });
  }
});

// @desc    Moderate property (Admin only)
// @route   PUT /api/admin/properties/:id
// @access  Private (Admin)
router.put('/properties/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, featured } = req.body;
    
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }
    
    if (status) property.status = status;
    if (featured !== undefined) property.featured = featured;
    
    await property.save();
    
    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating property',
      error: error.message,
    });
  }
});

// @desc    Delete property (Admin only)
// @route   DELETE /api/admin/properties/:id
// @access  Private (Admin)
router.delete('/properties/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }
    
    await property.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting property',
      error: error.message,
    });
  }
});

module.exports = router;