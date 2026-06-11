/**
 * QueueEase V2 — Appointment Routes
 */

const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');
const { createAppointmentValidation } = require('../middleware/validators');

router.post('/', protect, authorize('patient'), createAppointmentValidation, appointmentController.createAppointment);
router.get('/my', protect, appointmentController.getMyAppointments);
router.get('/clinic/:clinicId', protect, authorize('doctor', 'receptionist'), appointmentController.getClinicAppointments);
router.get('/:id', protect, appointmentController.getAppointment);
router.post('/:id/check-in', protect, appointmentController.checkIn);
router.post('/:id/cancel', protect, appointmentController.cancelAppointment);

module.exports = router;
