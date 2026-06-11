/**
 * QueueEase V2 — Doctor Availability Model
 * Tracks when doctors are available at their clinics.
 */

const mongoose = require('mongoose');

const AVAILABILITY_OVERRIDE_SCHEMA = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  reason: {
    type: String,
    trim: true, // e.g., "On leave", "Conference", "Emergency"
  },
  customHours: {
    start: { type: String }, // HH:mm
    end: { type: String },
  },
}, { _id: false });

const DOCTOR_AVAILABILITY_SCHEMA = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true,
  },
  
  // Weekly schedule
  weeklySchedule: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true,
    },
    isAvailable: { type: Boolean, default: true },
    timeSlots: [{
      start: { type: String, required: true }, // HH:mm
      end: { type: String, required: true },
      maxAppointments: { type: Number, default: 20 },
    }],
  }],
  
  // Date-specific overrides (holidays, leaves, etc.)
  overrides: [AVAILABILITY_OVERRIDE_SCHEMA],
  
  // Current status
  currentStatus: {
    type: String,
    enum: ['available', 'in-consultation', 'on-break', 'unavailable', 'off-duty'],
    default: 'available',
  },
  
  // Average consultation duration (learned over time)
  avgConsultationMinutes: {
    type: Number,
    default: 15,
  },
  
  // Is currently accepting patients?
  isAcceptingPatients: {
    type: Boolean,
    default: true,
  },
  
}, {
  timestamps: true,
});

DOCTOR_AVAILABILITY_SCHEMA.index({ doctorId: 1 });
DOCTOR_AVAILABILITY_SCHEMA.index({ clinicId: 1 });

module.exports = mongoose.model('DoctorAvailability', DOCTOR_AVAILABILITY_SCHEMA);
