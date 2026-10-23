// src/routes/appointment.routes.js - Appointment Routes
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  requestAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  cancelAppointment,
} = require('../controllers/appointment.controller');

router.post('/', protect, requestAppointment);
router.get('/', protect, getAppointments);
router.get('/:id', protect, getAppointment);
router.put('/:id', protect, updateAppointment);
router.delete('/:id', protect, cancelAppointment);

module.exports = router;