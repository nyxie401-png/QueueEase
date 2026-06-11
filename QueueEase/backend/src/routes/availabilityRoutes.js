/**
 * QueueEase V2 — Availability Routes
 */

const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');
const { protect, authorize } = require('../middleware/auth');
const { setAvailabilityValidation } = require('../middleware/validators');

router.get('/:doctorId', availabilityController.getAvailability);
router.get('/:doctorId/check', availabilityController.checkAvailability);
router.put('/:doctorId/schedule', protect, authorize('doctor'), setAvailabilityValidation, availabilityController.setWeeklySchedule);
router.post('/:doctorId/override', protect, authorize('doctor'), availabilityController.addOverride);
router.put('/:doctorId/status', protect, authorize('doctor'), availabilityController.updateStatus);

module.exports = router;
