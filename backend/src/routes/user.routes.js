// src/routes/user.routes.js - User management routes
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const User = require('../models/User.model');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = req.user;
    user.password = undefined;
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
    });
  }
});

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const Property = require('../models/Property.model');
    const Favorite = require('../models/Favorite.model');
    
    const propertiesCount = await Property.countDocuments({ 
      sellerId: req.user.id 
    });
    
    const favoritesCount = await Favorite.countDocuments({ 
      userId: req.user.id 
    });
    
    res.status(200).json({
      success: true,
      data: {
        properties: propertiesCount,
        favorites: favoritesCount,
        appointments: 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user stats',
      error: error.message
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { firstName, lastName, phone, bio, address, preferences } = req.body;
    
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData['profile.phone'] = phone;
    if (bio) updateData['profile.bio'] = bio;
    if (address) {
      if (address.street) updateData['profile.address.street'] = address.street;
      if (address.city) updateData['profile.address.city'] = address.city;
      if (address.state) updateData['profile.address.state'] = address.state;
      if (address.country) updateData['profile.address.country'] = address.country;
      if (address.zipCode) updateData['profile.address.zipCode'] = address.zipCode;
    }
    if (preferences) {
      if (preferences.notifications) {
        if (preferences.notifications.email !== undefined) {
          updateData['profile.preferences.notifications.email'] = preferences.notifications.email;
        }
        if (preferences.notifications.sms !== undefined) {
          updateData['profile.preferences.notifications.sms'] = preferences.notifications.sms;
        }
        if (preferences.notifications.push !== undefined) {
          updateData['profile.preferences.notifications.push'] = preferences.notifications.push;
        }
      }
      if (preferences.language) updateData['profile.preferences.language'] = preferences.language;
      if (preferences.currency) updateData['profile.preferences.currency'] = preferences.currency;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
});

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id).select('+password');
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message,
    });
  }
});

// Admin routes
router.get('/', protect, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get all users - Admin only',
  });
});

router.get('/:id', protect, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Get user ${req.params.id} - Admin only`,
  });
});

router.put('/:id', protect, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Update user ${req.params.id} - Admin only`,
  });
});

router.delete('/:id', protect, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Delete user ${req.params.id} - Admin only`,
  });
});

module.exports = router;