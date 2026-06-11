/**
 * QueueEase V2 — Analytics Model
 * Stores daily analytics snapshots for reporting.
 */

const mongoose = require('mongoose');

const ANALYTICS_SCHEMA = new mongoose.Schema({
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true,
    index: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  
  // Queue metrics
  totalPatients: { type: Number, default: 0 },
  walkIns: { type: Number, default: 0 },
  appointments: { type: Number, default: 0 },
  emergencies: { type: Number, default: 0 },
  completed: { type: Number, default: 0 },
  cancelled: { type: Number, default: 0 },
  noShows: { type: Number, default: 0 },
  
  // Wait times
  averageWaitMinutes: { type: Number, default: 0 },
  maxWaitMinutes: { type: Number, default: 0 },
  medianWaitMinutes: { type: Number, default: 0 },
  
  // Consultation times
  averageConsultationMinutes: { type: Number, default: 0 },
  maxConsultationMinutes: { type: Number, default: 0 },
  
  // Peak hours
  peakHour: { type: String }, // HH:mm
  peakHourPatients: { type: Number, default: 0 },
  
  // Hourly breakdown
  hourlyBreakdown: [{
    hour: { type: Number }, // 0-23
    patients: { type: Number, default: 0 },
    avgWait: { type: Number, default: 0 },
  }],
  
  // Patient satisfaction (if collected)
  averageRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  
}, {
  timestamps: true,
});

ANALYTICS_SCHEMA.index({ clinicId: 1, date: -1 });
ANALYTICS_SCHEMA.index({ doctorId: 1, date: -1 });

module.exports = mongoose.model('Analytics', ANALYTICS_SCHEMA);
