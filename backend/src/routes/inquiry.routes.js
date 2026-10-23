// src/routes/inquiry.routes.js - Inquiry Routes
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  sendInquiry,
  getInquiries,
  getInquiry,
  updateInquiry,
} = require('../controllers/inquiry.controller');

router.post('/', protect, sendInquiry);
router.get('/', protect, getInquiries);
router.get('/:id', protect, getInquiry);
router.put('/:id', protect, updateInquiry);

module.exports = router;