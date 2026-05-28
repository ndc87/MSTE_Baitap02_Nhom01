const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

/**
 * Admin Routes - All require authentication and admin role
 * Role check is performed in middleware and controller
 */

// Get admin profile
router.get('/profile', protect, adminController.getProfile);

// Update admin settings
router.put('/settings', protect, adminController.updateSettings);

// Get dashboard stats
router.get('/dashboard-stats', protect, adminController.getDashboardStats);

module.exports = router;
