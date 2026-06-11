/**
 * QueueEase V2 — Validation Middleware
 * Reusable validation chains using express-validator.
 */

const { body, param, query } = require('express-validator');

// Auth validations
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['patient', 'doctor', 'receptionist']).withMessage('Invalid role'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// Queue validations
const joinQueueValidation = [
  body('clinicId').isMongoId().withMessage('Invalid clinic ID'),
  body('appointmentType').isIn(['walk-in', 'appointment', 'follow-up', 'emergency']).optional(),
  body('priority').isIn(['normal', 'urgent', 'emergency']).optional(),
  body('emergencyReason').if(body('priority').equals('emergency')).notEmpty().withMessage('Emergency reason is required'),
];

// Appointment validations
const createAppointmentValidation = [
  body('clinicId').isMongoId().withMessage('Invalid clinic ID'),
  body('doctorId').isMongoId().withMessage('Invalid doctor ID'),
  body('date').isISO8601().withMessage('Invalid date'),
  body('timeSlot.start').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid start time'),
  body('timeSlot.end').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid end time'),
  body('type').isIn(['consultation', 'follow-up', 'check-up', 'procedure', 'emergency']).optional(),
  body('reason').trim().isLength({ max: 500 }).optional(),
];

// Clinic validations
const createClinicValidation = [
  body('name').trim().notEmpty().withMessage('Clinic name is required'),
  body('address.street').trim().notEmpty(),
  body('address.city').trim().notEmpty(),
  body('address.district').trim().notEmpty(),
  body('phone').trim().notEmpty(),
];

// Doctor availability validations
const setAvailabilityValidation = [
  body('weeklySchedule').isArray().withMessage('Weekly schedule must be an array'),
  body('weeklySchedule.*.day').isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  body('weeklySchedule.*.isAvailable').isBoolean().optional(),
  body('weeklySchedule.*.timeSlots').isArray().optional(),
];

module.exports = {
  registerValidation,
  loginValidation,
  joinQueueValidation,
  createAppointmentValidation,
  createClinicValidation,
  setAvailabilityValidation,
};
