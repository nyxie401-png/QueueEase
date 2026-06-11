/**
 * QueueEase V2 — Clinic Routes
 */

const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinicController');
const { protect, authorize } = require('../middleware/auth');
const { createClinicValidation } = require('../middleware/validators');

router.get('/', clinicController.getClinics);
router.get('/my', protect, authorize('doctor'), clinicController.getMyClinics);
router.get('/:id', clinicController.getClinic);
router.post('/', protect, authorize('doctor'), createClinicValidation, clinicController.createClinic);
router.put('/:id', protect, authorize('doctor'), clinicController.updateClinic);
router.post('/:id/receptionist', protect, authorize('doctor'), clinicController.addReceptionist);

module.exports = router;
