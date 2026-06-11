/**
 * QueueEase V2 — Notification Model
 * Stores in-app notifications and tracks push notification delivery.
 */

const mongoose = require('mongoose');

const NOTIFICATION_SCHEMA = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  
  // Notification type
  type: {
    type: String,
    enum: [
      'queue-update',
      'appointment-reminder',
      'turn-approaching',
      'your-turn',
      'appointment-confirmed',
      'appointment-cancelled',
      'emergency-alert',
      'system',
    ],
    required: true,
  },
  
  title: {
    type: String,
    required: true,
    trim: true,
  },
  body: {
    type: String,
    required: true,
    trim: true,
  },
  
  // Related entities
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
  },
  queueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Queue',
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  
  // Data payload
  data: {
    type: mongoose.Schema.Types.Mixed,
  },
  
  // Read status
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
  
  // Push delivery
  pushSent: {
    type: Boolean,
    default: false,
  },
  pushSentAt: {
    type: Date,
  },
  
}, {
  timestamps: true,
});

NOTIFICATION_SCHEMA.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NOTIFICATION_SCHEMA);
