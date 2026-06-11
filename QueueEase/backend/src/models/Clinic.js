/**
 * QueueEase V2 — Clinic Model
 * Represents a private doctor clinic or small dispensary.
 */

const mongoose = require('mongoose');

const WORKING_HOURS_SCHEMA = new mongoose.Schema({
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true,
  },
  isOpen: { type: Boolean, default: true },
  openTime: { type: String, default: '08:00' },   // HH:mm
  closeTime: { type: String, default: '17:00' },   // HH:mm
  breakStart: { type: String, default: '12:00' },
  breakEnd: { type: String, default: '13:00' },
}, { _id: false });

const CLINIC_SCHEMA = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Clinic name is required'],
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  
  // Location
  address: {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    province: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  
  // Contact
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  website: { type: String, trim: true },
  
  // Doctor who owns/runs the clinic
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Staff
  receptionistIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  
  // Specialty
  specialty: {
    type: String,
    trim: true,
  },
  
  // Working Hours
  workingHours: [WORKING_HOURS_SCHEMA],
  
  // Queue Configuration
  queueConfig: {
    maxPatientsPerSlot: { type: Number, default: 5 },
    slotDurationMinutes: { type: Number, default: 15 },
    allowWalkIns: { type: Boolean, default: true },
    allowEmergencyQueue: { type: Boolean, default: true },
    estimatedWaitTimePerPatient: { type: Number, default: 10 }, // minutes
  },
  
  // Services offered
  services: [{
    name: { type: String, required: true, trim: true },
    duration: { type: Number, default: 15 }, // minutes
    fee: { type: Number, default: 0 },
    currency: { type: String, default: 'LKR' },
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  
  // Rating
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
}, {
  timestamps: true,
});

CLINIC_SCHEMA.index({ 'address.city': 1 });
CLINIC_SCHEMA.index({ 'address.district': 1 });
CLINIC_SCHEMA.index({ doctorId: 1 });
CLINIC_SCHEMA.index({ specialty: 1 });

module.exports = mongoose.model('Clinic', CLINIC_SCHEMA);
