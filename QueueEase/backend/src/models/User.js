/**
 * QueueEase V2 — User Model
 * Supports three roles: patient, doctor, receptionist
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ADDRESS_SCHEMA = new mongoose.Schema({
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  district: { type: String, trim: true },
  postalCode: { type: String, trim: true },
}, { _id: false });

const USER_SCHEMA = new mongoose.Schema({
  // Firebase UID (from Firebase Auth)
  firebaseUid: {
    type: String,
    sparse: true,
    index: true,
  },
  
  // Basic Info
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\+?[\d\s-]{7,15}$/, 'Please provide a valid phone number'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false, // Don't include in queries by default
  },
  
  // Role: patient | doctor | receptionist
  role: {
    type: String,
    enum: ['patient', 'doctor', 'receptionist'],
    required: [true, 'Role is required'],
    default: 'patient',
  },
  
  // Profile Photo
  avatar: {
    type: String,
    default: null,
  },
  
  // Date of Birth
  dateOfBirth: {
    type: Date,
  },
  
  // Gender
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
  },
  
  // Address
  address: ADDRESS_SCHEMA,
  
  // National ID (Sri Lankan NIC)
  nic: {
    type: String,
    trim: true,
    sparse: true,
    unique: true,
  },
  
  // --- Doctor-specific fields ---
  specialization: {
    type: String,
    trim: true,
  },
  medicalLicenseNo: {
    type: String,
    trim: true,
    sparse: true,
    unique: true,
  },
  clinicIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
  }],
  
  // --- Patient-specific fields ---
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    notes: String,
  }],
  allergies: [String],
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'],
    default: 'unknown',
  },
  emergencyContact: {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    relationship: { type: String, trim: true },
  },
  
  // --- Receptionist-specific fields ---
  employedClinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
  },
  employeeId: {
    type: String,
    trim: true,
    sparse: true,
    unique: true,
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  
  // FCM Token for push notifications
  fcmToken: {
    type: String,
    default: null,
  },
  
  // Timestamps
  lastLogin: {
    type: Date,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
USER_SCHEMA.index({ role: 1 });
USER_SCHEMA.index({ clinicIds: 1 });
USER_SCHEMA.index({ email: 1, role: 1 });

// Hash password before saving
USER_SCHEMA.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
USER_SCHEMA.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
USER_SCHEMA.virtual('initials').get(function () {
  return this.name
    ? this.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';
});

module.exports = mongoose.model('User', USER_SCHEMA);
