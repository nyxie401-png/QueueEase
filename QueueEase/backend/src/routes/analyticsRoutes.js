/**
 * QueueEase V2 — Analytics Routes
 */

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('doctor', 'receptionist'), analyticsController.getDashboardStats);
router.get('/range', protect, authorize('doctor', 'receptionist'), analyticsController.getAnalyticsRange);
router.get('/hourly', protect, authorize('doctor', 'receptionist'), analyticsController.getHourlyDistribution);

module.exports = router;
