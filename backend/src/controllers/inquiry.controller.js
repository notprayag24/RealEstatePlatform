// src/controllers/inquiry.controller.js - Inquiry Controllers
const Inquiry = require('../models/Inquiry.model');
const Property = require('../models/Property.model');

// @desc    Send inquiry
// @route   POST /api/inquiries
// @access  Private
exports.sendInquiry = async (req, res) => {
  try {
    const { propertyId, name, email, phone, message } = req.body;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Determine receiver (agent or seller)
    const receiverId = property.agentId || property.sellerId;

    const inquiry = await Inquiry.create({
      propertyId,
      senderId: req.user.id,
      receiverId,
      name,
      email,
      phone,
      message,
    });

    res.status(201).json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    console.error('Send inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending inquiry',
      error: error.message,
    });
  }
};

// @desc    Get inquiries for logged-in user
// @route   GET /api/inquiries
// @access  Private
exports.getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ receiverId: req.user.id })
      .populate('propertyId', 'title price location images')
      .populate('senderId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries,
    });
  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inquiries',
      error: error.message,
    });
  }
};

// @desc    Get inquiry by ID
// @route   GET /api/inquiries/:id
// @access  Private
exports.getInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate('propertyId', 'title price location images')
      .populate('senderId', 'firstName lastName email profile.phone')
      .populate('receiverId', 'firstName lastName email');

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }

    // Check if user is authorized
    if (inquiry.receiverId._id.toString() !== req.user.id && inquiry.senderId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this inquiry',
      });
    }

    // Mark as read if receiver
    if (inquiry.receiverId._id.toString() === req.user.id && !inquiry.isRead) {
      inquiry.isRead = true;
      inquiry.readAt = Date.now();
      await inquiry.save();
    }

    res.status(200).json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    console.error('Get inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inquiry',
      error: error.message,
    });
  }
};

// @desc    Update inquiry status
// @route   PUT /api/inquiries/:id
// @access  Private
exports.updateInquiry = async (req, res) => {
  try {
    const { status } = req.body;
    
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }

    // Only receiver can update
    if (inquiry.receiverId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this inquiry',
      });
    }

    inquiry.status = status || inquiry.status;
    if (status === 'replied') {
      inquiry.repliedAt = Date.now();
    }
    await inquiry.save();

    res.status(200).json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    console.error('Update inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating inquiry',
      error: error.message,
    });
  }
};