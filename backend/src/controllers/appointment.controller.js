// src/controllers/appointment.controller.js - Appointment Controllers
const Appointment = require('../models/Appointment.model');
const Property = require('../models/Property.model');

// @desc    Request an appointment
// @route   POST /api/appointments
// @access  Private
exports.requestAppointment = async (req, res) => {
  try {
    const { propertyId, date, time, message, buyerName, buyerEmail, buyerPhone } = req.body;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Determine seller and agent
    const sellerId = property.sellerId;
    const agentId = property.agentId || null;

    const appointment = await Appointment.create({
      propertyId,
      buyerId: req.user.id,
      sellerId,
      agentId,
      date,
      time,
      message,
      buyerName,
      buyerEmail,
      buyerPhone,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('Request appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error requesting appointment',
      error: error.message,
    });
  }
};

// @desc    Get appointments for logged-in user
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
  try {
    const query = {
      $or: [
        { buyerId: req.user.id },
        { sellerId: req.user.id },
        { agentId: req.user.id },
      ],
    };

    const appointments = await Appointment.find(query)
      .populate('propertyId', 'title price location images')
      .populate('buyerId', 'firstName lastName email profile.phone')
      .populate('sellerId', 'firstName lastName email')
      .populate('agentId', 'firstName lastName email')
      .sort({ date: 1, time: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message,
    });
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('propertyId', 'title price location images')
      .populate('buyerId', 'firstName lastName email profile.phone')
      .populate('sellerId', 'firstName lastName email')
      .populate('agentId', 'firstName lastName email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check authorization
    const isAuthorized = 
      appointment.buyerId._id.toString() === req.user.id ||
      appointment.sellerId._id.toString() === req.user.id ||
      (appointment.agentId && appointment.agentId._id.toString() === req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment',
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment',
      error: error.message,
    });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check authorization (only seller or agent can update status)
    const isAuthorized = 
      appointment.sellerId.toString() === req.user.id ||
      (appointment.agentId && appointment.agentId.toString() === req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment',
      });
    }

    appointment.status = status || appointment.status;
    
    if (notes) {
      appointment.notes = notes;
    }

    if (status === 'confirmed') {
      appointment.confirmedAt = Date.now();
    } else if (status === 'completed') {
      appointment.completedAt = Date.now();
    } else if (status === 'cancelled' || status === 'rejected') {
      appointment.cancelledAt = Date.now();
    }

    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating appointment',
      error: error.message,
    });
  }
};

// @desc    Cancel appointment (buyer)
// @route   DELETE /api/appointments/:id
// @access  Private
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check authorization (only buyer can cancel)
    if (appointment.buyerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment',
      });
    }

    appointment.status = 'cancelled';
    appointment.cancelledAt = Date.now();
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment,
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling appointment',
      error: error.message,
    });
  }
};